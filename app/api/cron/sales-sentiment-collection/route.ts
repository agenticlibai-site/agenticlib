import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  SENTIMENT_CLUSTERS,
  SENTIMENT_SYSTEM_PROMPT,
  getSentimentClustersForBrand,
  buildSentimentPrompt,
} from "@/lib/brand-visibility/sales-sentiment";
import {
  initSalesVisibilityDB,
  loadLockedSalesAgents,
  insertSalesSentimentResponse,
} from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ── Split-job design ───────────────────────────────────────────────────────────
// ~39 brand+cluster tasks per model per day.
//
//   ?model=claude-haiku-4-5  →  11:00 AM UTC
//   ?model=gpt-4o-mini       →   3:00 PM UTC  (4h after Claude)
// ──────────────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BATCH_CONCURRENCY = 10;
const BATCH_DELAY_MS    = 500;
const RETRY_DELAYS_MS   = [1000, 2000, 4000];

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 429 && attempt < RETRY_DELAYS_MS.length) {
        const delay = RETRY_DELAYS_MS[attempt];
        console.warn(`[sales-sentiment-collection] 429 on ${label} — retry ${attempt + 1}/3 in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function callClaude(promptText: string): Promise<string> {
  const res = await anthropic.messages.create({
    model:      "claude-haiku-4-5",
    max_tokens: 512,
    system:     SENTIMENT_SYSTEM_PROMPT,
    messages:   [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

async function callGPT(promptText: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    max_tokens:      512,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SENTIMENT_SYSTEM_PROMPT },
      { role: "user",   content: promptText },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

function parseSentimentResponse(raw: string): {
  sentiment:   string | null;
  confidence:  string | null;
  descriptors: string[] | null;
  parsed:      object | null;
  parseError:  boolean;
} {
  try {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const obj = JSON.parse(cleaned);
    const descriptors = Array.isArray(obj.descriptors)
      ? (obj.descriptors as unknown[]).filter((d): d is string => typeof d === "string")
      : null;
    return {
      sentiment:   typeof obj.sentiment  === "string" ? obj.sentiment  : null,
      confidence:  typeof obj.confidence === "string" ? obj.confidence : null,
      descriptors: descriptors?.length ? descriptors : null,
      parsed:      obj,
      parseError:  false,
    };
  } catch {
    return { sentiment: null, confidence: null, descriptors: null, parsed: null, parseError: true };
  }
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
  delayMs: number,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((t) => t()));
    results.push(...batchResults);
    if (i + concurrency < tasks.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now   = new Date();
  const today = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const { searchParams } = new URL(request.url);
  const modelParam = searchParams.get("model");

  if (!modelParam || !["claude-haiku-4-5", "gpt-4o-mini"].includes(modelParam)) {
    return Response.json({ error: "?model= required: claude-haiku-4-5 or gpt-4o-mini" }, { status: 400 });
  }

  const model = modelParam as "claude-haiku-4-5" | "gpt-4o-mini";

  try {
    await initSalesVisibilityDB();
    const brands = await loadLockedSalesAgents();

    const tasks: (() => Promise<{ success: boolean }>)[] = [];

    for (const brand of brands) {
      const clusters = getSentimentClustersForBrand(brand.brand_name);
      for (const cluster of clusters) {
        const b = brand;
        const c = cluster;

        tasks.push(async () => {
          const callLabel = `${b.brand_name}/${c.bucket_tag}`;
          try {
            const promptText = buildSentimentPrompt(b.brand_name, c.bucket_tag);
            const rawText    = model === "claude-haiku-4-5"
              ? await withRetry(() => callClaude(promptText), callLabel)
              : await withRetry(() => callGPT(promptText),   callLabel);

            const { sentiment, confidence, descriptors, parsed, parseError } =
              parseSentimentResponse(rawText);

            await insertSalesSentimentResponse({
              brand_name:  b.brand_name,
              prompt_id:   c.prompt_id,
              bucket_tag:  c.bucket_tag,
              model,
              run_date:    today,
              sentiment,
              confidence,
              descriptors,
              raw_json:    parseError ? { raw: rawText.slice(0, 2000) } : parsed,
              parse_error: parseError,
            });

            return { success: true };
          } catch (err) {
            console.error(`[sales-sentiment-collection] error: ${callLabel} (${model}):`, err);
            return { success: false };
          }
        });
      }
    }

    const expected  = tasks.length;
    const results   = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed    = expected - succeeded;

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Sales Sentiment Collection failed (${model}, ${today})`,
        html: `
          <h2>Sales Sentiment Pipeline — Collection Failures</h2>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>${model}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Succeeded</strong></td><td>${succeeded} / ${expected}</td></tr>
            <tr><td style="padding:4px 12px 4x 0"><strong>Failed</strong></td><td>${failed}</td></tr>
          </table>
          <p>Check Vercel function logs for per-task errors.</p>
        `,
      }).catch((e) => console.error("[alert] sales sentiment collection email failed:", e));
    }

    return Response.json({
      mode:     "sales_sentiment_collection",
      model,
      date:     today,
      brands:   brands.length,
      clusters: SENTIMENT_CLUSTERS.length,
      expected,
      succeeded,
      failed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] sales-sentiment-collection crashed (${model}):`, message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Sales Sentiment Collection (${model}, ${today})`,
      html: `
        <h2>Sales Sentiment Pipeline — Unhandled Crash</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>${model}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
      `,
    }).catch(() => {});

    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
