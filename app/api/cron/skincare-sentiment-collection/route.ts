// How AI models describe confirmed top-10 skincare agents — not verified user sentiment.
//
// IMPORTANT: Do NOT add to vercel.json until:
//   1. Discovery data (skincare_daily_summary) has run for ≥3 days
//   2. Top 10 brands are confirmed and inserted into skincare_sentiment_brands
//   3. Schema and run plan have been reviewed (see CONFIRMATION BLOCK below)
//
// ── CONFIRMATION BLOCK ────────────────────────────────────────────────────────
// Schema: skincare_sentiment_responses (date, brand, model, run_number, sentiment, tags)
//         skincare_sentiment_summary (window_start, window_end, brand, positive_pct,
//           neutral_pct, negative_pct, top_tags [{tag, frequency, shared}], total_responses)
//
// Exact system prompt:
//   "You will be asked to describe a specific AI skincare agent. Respond ONLY with valid
//    JSON in this exact format: {"sentiment": "positive" | "neutral" | "negative",
//    "tags": ["tag1", "tag2", "tag3", "tag4"]}. Tags should be short (1-3 words) and
//    should describe what is genuinely distinctive or notable about THIS agent specifically
//    — its actual features, focus area, strengths, or weaknesses. Do not invent a unique
//    angle if the agent is genuinely similar to others; in that case use accurate general
//    descriptors instead. No other text."
//
// Exact user prompt per brand:
//   "Describe the AI skincare agent '{brand_name}' — what it does well, any concerns,
//    and how it's generally perceived."
//
// Run plan: 10 brands × 3 runs × 2 models × 3 days = 180 calls total.
//   Day 1–3: collect. After day 3 disable the sentiment cron entries in vercel.json.
//   Expected rows per model per day: 10 brands × 3 runs = 30.
//   Expected total per day: 60. EXPECTED_TOTAL = 60.
//
// Cron entries to add when ready (90-min buffer after discovery window ends at 05:30):
//   { "path": "/api/cron/skincare-sentiment-collection?model=claude-haiku-4-5", "schedule": "0 7 * * *" }
//   { "path": "/api/cron/skincare-sentiment-collection?model=gpt-4o-mini",      "schedule": "10 7 * * *" }
//   { "path": "/api/cron/skincare-sentiment-collection?aggregate",               "schedule": "30 7 * * *" }
// ─────────────────────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { sql } from "@vercel/postgres";
import { initSkincareDB } from "@/lib/skincare-visibility/db";
import { computeSkincareSentimentSummary } from "@/lib/skincare-visibility/sentiment-aggregation";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RUNS_PER_BRAND = 3;
const BATCH_CONCURRENCY = 5; // lower than discovery — each call is ~2× longer
const BATCH_DELAY_MS = 200;

// Exact prompt wording — do not change once collection has started.
const SENTIMENT_SYSTEM_PROMPT =
  'You will be asked to describe a specific AI skincare agent. Respond ONLY with valid JSON in this exact format: {"sentiment": "positive" | "neutral" | "negative", "tags": ["tag1", "tag2", "tag3", "tag4"]}. ' +
  "Tags should be short (1-3 words) and should describe what is genuinely distinctive or notable about THIS agent specifically — its actual features, focus area, strengths, or weaknesses. " +
  "Do not invent a unique angle if the agent is genuinely similar to others; in that case use accurate general descriptors instead. No other text.";

function buildUserPrompt(brandName: string): string {
  return `Describe the AI skincare agent '${brandName}' — what it does well, any concerns, and how it's generally perceived.`;
}

interface SentimentResult { sentiment: "positive" | "neutral" | "negative"; tags: string[]; }

function parseSentimentResponse(raw: string): SentimentResult {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!["positive", "neutral", "negative"].includes(parsed.sentiment)) {
    throw new Error(`Invalid sentiment value: ${parsed.sentiment}`);
  }
  if (!Array.isArray(parsed.tags)) throw new Error("Missing tags array");
  const tags = parsed.tags
    .filter((t: unknown) => typeof t === "string" && t.trim().length > 0)
    .map((t: string) => t.trim())
    .slice(0, 4);
  return { sentiment: parsed.sentiment, tags };
}

interface ModelResult { text: string; }

async function callClaude(brandName: string): Promise<ModelResult> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 256,
    system: [{ type: "text", text: SENTIMENT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildUserPrompt(brandName) }],
  });
  const block = res.content.find((b) => b.type === "text");
  return { text: block?.type === "text" ? block.text : "" };
}

async function callGPT(brandName: string): Promise<ModelResult> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 256,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SENTIMENT_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(brandName) },
    ],
  });
  return { text: res.choices[0]?.message?.content ?? "" };
}

async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], concurrency: number, delayMs: number): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    results.push(...(await Promise.all(batch.map((t) => t()))));
    if (i + concurrency < tasks.length) await new Promise((r) => setTimeout(r, delayMs));
  }
  return results;
}

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initSkincareDB();

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const { searchParams } = new URL(request.url);
  const modelParam = searchParams.get("model");
  const aggregateOnly = searchParams.has("aggregate");

  const jobLabel = aggregateOnly ? "sentiment-aggregation" : `sentiment-collection (${modelParam ?? "all"})`;

  try {
    // Load confirmed brand list — abort cleanly if not yet populated.
    const brandRows = await sql`SELECT brand_name FROM skincare_sentiment_brands ORDER BY brand_name`;
    const brands = brandRows.rows.map((r) => r.brand_name as string);
    if (!brands.length) {
      return Response.json({
        mode: jobLabel,
        skipped: true,
        reason: "skincare_sentiment_brands is empty — insert confirmed top-10 brands first",
      });
    }

    // Window start = 2 days ago (covers 3-day sentiment collection run)
    const windowStartDate = new Date(now);
    windowStartDate.setDate(windowStartDate.getDate() - 2);
    const windowStart = windowStartDate.toISOString().split("T")[0];

    // ── Aggregate-only mode ──────────────────────────────────────────────────
    if (aggregateOnly) {
      await computeSkincareSentimentSummary(windowStart, today);

      const statsResult = await sql`
        SELECT COUNT(*) AS total FROM skincare_sentiment_responses
        WHERE date BETWEEN ${windowStart}::date AND ${today}::date
      `;
      const totalRows = parseInt(statsResult.rows[0]?.total ?? "0", 10);
      const EXPECTED_WINDOW_TOTAL = brands.length * RUNS_PER_BRAND * 2 * 3; // 10 × 3 × 2 × 3 = 180

      const healthy = totalRows === EXPECTED_WINDOW_TOTAL;
      if (!healthy) {
        await sendEmail({
          subject: `[AgenticLib] ALERT — Skincare Sentiment Aggregation (${today})`,
          html: `
            <h2>Skincare Sentiment — Aggregation Health Check</h2>
            <table style="border-collapse:collapse;font-family:monospace">
              <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
              <tr><td style="padding:4px 12px 4px 0"><strong>Rows in window</strong></td><td>${totalRows} / ${EXPECTED_WINDOW_TOTAL}</td></tr>
            </table>
          `,
        }).catch((e) => console.error("[alert] sentiment aggregation email failed:", e));
      }

      return Response.json({ mode: "sentiment-aggregate", date: today, window_start: windowStart, total_rows: totalRows, healthy });
    }

    // ── Collection mode ──────────────────────────────────────────────────────
    const modelsToRun: ("claude-haiku-4-5" | "gpt-4o-mini")[] =
      modelParam === "claude-haiku-4-5" ? ["claude-haiku-4-5"]
      : modelParam === "gpt-4o-mini"    ? ["gpt-4o-mini"]
      : ["claude-haiku-4-5", "gpt-4o-mini"];

    const expected = brands.length * RUNS_PER_BRAND * modelsToRun.length;
    const tasks: (() => Promise<{ success: boolean }>)[] = [];

    for (const brand of brands) {
      for (const model of modelsToRun) {
        for (let run = 1; run <= RUNS_PER_BRAND; run++) {
          const b = brand;
          const m = model;
          const r = run;

          tasks.push(async () => {
            try {
              const rawResult = m === "claude-haiku-4-5" ? await callClaude(b) : await callGPT(b);
              const { sentiment, tags } = parseSentimentResponse(rawResult.text);

              await sql`
                INSERT INTO skincare_sentiment_responses (date, brand, model, run_number, sentiment, tags)
                VALUES (${today}::date, ${b}, ${m}, ${r}, ${sentiment}, ${JSON.stringify(tags)}::jsonb)
                ON CONFLICT (date, brand, model, run_number) DO UPDATE SET
                  sentiment  = EXCLUDED.sentiment,
                  tags       = EXCLUDED.tags,
                  created_at = NOW()
              `;
              return { success: true };
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              await sql`
                INSERT INTO skincare_sentiment_errors (date, brand, model, run_number, raw_response, error_message)
                VALUES (${today}::date, ${b}, ${m}, ${r}, ${errorMessage.slice(0, 2000)}, ${errorMessage})
              `.catch(() => {});
              return { success: false };
            }
          });
        }
      }
    }

    const results = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed = expected - succeeded;

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Skincare Sentiment Collection failed (${modelParam ?? "all"}, ${today})`,
        html: `
          <h2>Skincare Sentiment — Collection Failures</h2>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>${modelParam ?? "all"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Succeeded</strong></td><td>${succeeded} / ${expected}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Failed</strong></td><td>${failed}</td></tr>
          </table>
        `,
      }).catch((e) => console.error("[alert] sentiment collection email failed:", e));
    }

    return Response.json({ mode: "sentiment-collection", model: modelParam ?? "all", date: today, expected, succeeded, failed });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] skincare-sentiment ${jobLabel} crashed:`, message);
    await sendEmail({
      subject: `[AgenticLib] CRASH — Skincare Sentiment ${jobLabel} (${today})`,
      html: `<h2>Crash</h2><p><strong>Job:</strong> ${jobLabel}</p><p><strong>Error:</strong> ${message}</p><p><strong>Timestamp:</strong> ${runTimestamp}</p>`,
    }).catch((e) => console.error("[alert] sentiment crash email failed:", e));
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
