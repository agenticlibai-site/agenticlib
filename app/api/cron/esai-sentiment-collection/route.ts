import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  ESAI_SENTIMENT_CLUSTERS, ESAI_SENTIMENT_SYSTEM_PROMPT, buildEsaiSentimentPrompt,
} from "@/lib/brand-visibility/esai-sentiment";
import { initEsaiDB, getEsaiTopBrandsForFeatureScoring, insertEsaiSentimentResponse } from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 300;

// ?model=claude-haiku-4-5  →  09:10 UTC daily
// ?model=gpt-4o-mini       →  09:40 UTC daily
// Weekly aggregation: esai-sentiment-aggregate, Sunday 04:00 UTC.

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BATCH_CONCURRENCY = 10;
const BATCH_DELAY_MS    = 500;
const RETRY_DELAYS_MS   = [1000, 2000, 4000];

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try { return await fn(); } catch (err) {
      const status = (err as { status?: number })?.status;
      if ((status === 429 || (status != null && status >= 500)) && attempt < RETRY_DELAYS_MS.length) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
        lastErr = err; continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function callClaude(promptText: string): Promise<string> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001", max_tokens: 512,
    system: ESAI_SENTIMENT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

async function callGPT(promptText: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini", max_tokens: 512,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ESAI_SENTIMENT_SYSTEM_PROMPT },
      { role: "user",   content: promptText },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

function parseSentimentResponse(raw: string): {
  sentiment: string | null; confidence: string | null;
  descriptors: string[] | null; limitations: string[] | null;
  parsed: object | null; parseError: boolean;
} {
  function extract(obj: Record<string, unknown>) {
    return {
      sentiment:   typeof obj.sentiment  === "string" ? obj.sentiment  : null,
      confidence:  typeof obj.confidence === "string" ? obj.confidence : null,
      descriptors: Array.isArray(obj.descriptors) ? (obj.descriptors as unknown[]).filter((t): t is string => typeof t === "string") : null,
      limitations: Array.isArray(obj.limitations) ? (obj.limitations as unknown[]).filter((t): t is string => typeof t === "string") : null,
      parsed: obj, parseError: false,
    };
  }
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try { return extract(JSON.parse(cleaned) as Record<string, unknown>); } catch { /* fall */ }
  const first = cleaned.indexOf("{"), last = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try { return extract(JSON.parse(cleaned.slice(first, last + 1)) as Record<string, unknown>); } catch { /* fall */ }
  }
  return { sentiment: null, confidence: null, descriptors: null, limitations: null, parsed: null, parseError: true };
}

async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], concurrency: number, delayMs: number): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    results.push(...await Promise.all(tasks.slice(i, i + concurrency).map((t) => t())));
    if (i + concurrency < tasks.length) await new Promise((r) => setTimeout(r, delayMs));
  }
  return results;
}

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now   = new Date();
  const { searchParams } = new URL(request.url);
  const dateParam  = searchParams.get("date");
  const modelParam = searchParams.get("model");
  const today = (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam))
    ? dateParam : now.toISOString().split("T")[0];

  if (!modelParam || !["claude-haiku-4-5", "gpt-4o-mini"].includes(modelParam)) {
    return Response.json({ error: "?model= required: claude-haiku-4-5 or gpt-4o-mini" }, { status: 400 });
  }
  const model = modelParam as "claude-haiku-4-5" | "gpt-4o-mini";

  try {
    await initEsaiDB();
    const brands = await getEsaiTopBrandsForFeatureScoring();

    if (brands.length === 0) {
      return Response.json({ mode: "esai_sentiment_collection", date: today, note: "no brands in LOCKED_ESAI_BRANDS yet" });
    }

    const tasks: (() => Promise<{ success: boolean }>)[] = [];
    for (const brandName of brands) {
      for (const cluster of ESAI_SENTIMENT_CLUSTERS) {
        const b = brandName; const c = cluster;
        tasks.push(async () => {
          try {
            const promptText = buildEsaiSentimentPrompt(b, c.bucket_tag);
            const rawText    = model === "claude-haiku-4-5"
              ? await withRetry(() => callClaude(promptText), `${b}/${c.bucket_tag}`)
              : await withRetry(() => callGPT(promptText),    `${b}/${c.bucket_tag}`);
            const { sentiment, confidence, descriptors, limitations, parsed, parseError } = parseSentimentResponse(rawText);
            await insertEsaiSentimentResponse({
              brand_name: b, prompt_id: c.prompt_id, bucket_tag: c.bucket_tag,
              model, run_date: today, sentiment, confidence, descriptors, limitations,
              raw_json: parseError ? { raw: rawText.slice(0, 2000) } : parsed,
              parse_error: parseError,
            });
            return { success: true };
          } catch (err) {
            console.error(`[esai-sentiment-collection] error: ${brandName}/${cluster.bucket_tag}:`, err);
            return { success: false };
          }
        });
      }
    }

    const expected = tasks.length;
    console.log(`[esai-sentiment-collection] start — model=${model}, date=${today}, brands=${brands.length}, tasks=${expected}`);
    const results   = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed    = expected - succeeded;
    console.log(`[esai-sentiment-collection] done — succeeded=${succeeded}/${expected}, failed=${failed}`);

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — ESAI Sentiment Collection failed (${model}, ${today})`,
        html: `<h2>ESAI Sentiment — Failures</h2><p>Model: ${model} | Date: ${today} | Succeeded: ${succeeded}/${expected} | Failed: ${failed}</p>`,
      }).catch(() => {});
    }

    return Response.json({ mode: "esai_sentiment_collection", model, date: today, brands: brands.length, expected, succeeded, failed });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] esai-sentiment-collection crashed (${model}):`, message);
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
