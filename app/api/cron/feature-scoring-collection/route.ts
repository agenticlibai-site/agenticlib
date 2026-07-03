import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  FEATURES,
  FEATURE_SYSTEM_PROMPT,
  getFeaturesForBrand,
  buildPrompt,
} from "@/lib/brand-visibility/features";
import {
  initBrandVisibilityDB,
  loadLockedBrands,
  insertFeatureResponse,
} from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ── Split-job design ───────────────────────────────────────────────────────────
// 208 brand+feature pairs × 3 runs = 624 API calls per model, ~5 min at concurrency 10.
//
//   ?model=claude-haiku-4-5  →  Job 1, 6:00 AM UTC
//   ?model=gpt-4o-mini       →  Job 2, 12:00 PM UTC  (6h after Job 1)
//
// Scoring runs 30 min after Job 2 via feature-scoring-aggregate.
// ──────────────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RUNS_PER_FEATURE  = 3;
const BATCH_CONCURRENCY = 10;
const BATCH_DELAY_MS    = 500;
const RETRY_DELAYS_MS   = [1000, 2000, 4000]; // exponential backoff for 429s

// ── Retry wrapper ──────────────────────────────────────────────────────────────
// Only retries on HTTP 429 (rate limit). All other errors are re-thrown immediately.
// After exhausting all delays the final error is re-thrown — no row is written.

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 429 && attempt < RETRY_DELAYS_MS.length) {
        const delay = RETRY_DELAYS_MS[attempt];
        console.warn(`[feature-collection] 429 rate limit on ${label} — retry ${attempt + 1}/3 in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// ── Model call helpers ─────────────────────────────────────────────────────────

async function callClaude(promptText: string): Promise<string> {
  const res = await anthropic.messages.create({
    model:      "claude-haiku-4-5",
    max_tokens: 1024,
    system:     FEATURE_SYSTEM_PROMPT,
    messages:   [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

async function callGPT(promptText: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    max_tokens:      1024,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: FEATURE_SYSTEM_PROMPT },
      { role: "user",   content: promptText },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

function parseFeatureResponse(raw: string): {
  has_capability: string | null;
  evidence:       string | null;
  limitations:    string | null;
  confidence:     string | null;
  parsed:         object | null;
  parseError:     boolean;
} {
  function extract(obj: Record<string, unknown>) {
    return {
      has_capability: typeof obj.has_capability === "string" ? obj.has_capability : null,
      evidence:       typeof obj.evidence       === "string" ? obj.evidence       : null,
      limitations:    typeof obj.limitations    === "string" ? obj.limitations    : null,
      confidence:     typeof obj.confidence     === "string" ? obj.confidence     : null,
      parsed:         obj,
      parseError:     false,
    };
  }

  // Pass 1: strip markdown fences and try direct parse
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return extract(JSON.parse(cleaned) as Record<string, unknown>);
  } catch { /* fall through */ }

  // Pass 2: extract first { … last } and try again
  const first = cleaned.indexOf("{");
  const last  = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try {
      return extract(JSON.parse(cleaned.slice(first, last + 1)) as Record<string, unknown>);
    } catch { /* fall through */ }
  }

  return { has_capability: null, evidence: null, limitations: null, confidence: null, parsed: null, parseError: true };
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

// ── Cron handler ───────────────────────────────────────────────────────────────

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
    await initBrandVisibilityDB();
    const brands = await loadLockedBrands();

    const tasks: (() => Promise<{ success: boolean }>)[] = [];

    for (const brand of brands) {
      const features = getFeaturesForBrand(brand.brand_name);
      for (const feature of features) {
        for (let run = 1; run <= RUNS_PER_FEATURE; run++) {
          const b = brand;
          const f = feature;
          const r = run;

          tasks.push(async () => {
            try {
              const promptText = buildPrompt(f, b.brand_name);
              const callLabel  = `${b.brand_name}/${f.feature_id}/run${r}`;
              const rawText    = model === "claude-haiku-4-5"
                ? await withRetry(() => callClaude(promptText), callLabel)
                : await withRetry(() => callGPT(promptText),    callLabel);

              const { has_capability, evidence, limitations, confidence, parsed, parseError } =
                parseFeatureResponse(rawText);

              await insertFeatureResponse({
                brand_name:     b.brand_name,
                feature_id:     f.feature_id,
                feature_tag:    f.feature_tag,
                model,
                run_number:     r,
                run_date:       today,
                has_capability,
                evidence,
                limitations,
                confidence,
                raw_json:       parseError ? { raw: rawText.slice(0, 2000) } : parsed,
                parse_error:    parseError,
              });

              return { success: true };
            } catch (err) {
              console.error(
                `[feature-collection] error: ${brand.brand_name}/${feature.feature_id}/run${run} (${model}):`,
                err,
              );
              return { success: false };
            }
          });
        }
      }
    }

    const expected  = tasks.length;
    const results   = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed    = expected - succeeded;

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Feature Scoring Collection failed (${model}, ${today})`,
        html: `
          <h2>Feature Scoring Pipeline — Collection Failures</h2>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>${model}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Succeeded</strong></td><td>${succeeded} / ${expected}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Failed</strong></td><td>${failed}</td></tr>
          </table>
          <p>Check Vercel function logs for per-task errors.</p>
        `,
      }).catch((e) => console.error("[alert] feature collection email failed:", e));
    }

    return Response.json({
      mode: "feature_collection",
      model,
      date:      today,
      brands:    brands.length,
      features:  FEATURES.length,
      expected,
      succeeded,
      failed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] feature-scoring-collection crashed (${model}):`, message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Feature Scoring Collection (${model}, ${today})`,
      html: `
        <h2>Feature Scoring Pipeline — Unhandled Crash</h2>
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
