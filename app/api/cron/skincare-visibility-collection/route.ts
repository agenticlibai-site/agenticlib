import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { SKINCARE_PROMPTS, SKINCARE_SYSTEM_PROMPT } from "@/lib/skincare-visibility/prompts";
import {
  initSkincareDB,
  insertSkincareRawResponse,
  insertSkincareCollectionError,
  archiveSkincareErrors,
  getSkincareDailyRunStats,
} from "@/lib/skincare-visibility/db";
import { runSkincareAggregations } from "@/lib/skincare-visibility/aggregation";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ── Split-job design (mirrors marketing pipeline) ─────────────────────────────
//
//   ?model=claude-haiku-4-5  →  39 calls (~15s), no aggregation
//   ?model=gpt-4o-mini       →  39 calls (~15s), no aggregation
//   ?aggregate               →  aggregation only, runs after both collection jobs
//
// Cron schedule: 05:00, 05:10, 05:30 UTC — clear of the 02:00–04:00 marketing window.
// Disable these three cron entries in vercel.json after 5 days of collection.
// ─────────────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RUNS_PER_PROMPT = 3;
const BATCH_CONCURRENCY = 10;
const BATCH_DELAY_MS = 150;

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 600): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { return await fn(); } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw new Error("unreachable");
}

const EXPECTED_PER_MODEL = SKINCARE_PROMPTS.length * RUNS_PER_PROMPT; // 39

interface ModelResult { text: string; modelSnapshot: string; }

async function callClaude(promptText: string): Promise<ModelResult> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: SKINCARE_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  return { text: block?.type === "text" ? block.text : "", modelSnapshot: res.model };
}

async function callGPT(promptText: string): Promise<ModelResult> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 512,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SKINCARE_SYSTEM_PROMPT },
      { role: "user", content: promptText },
    ],
  });
  return { text: res.choices[0]?.message?.content ?? "", modelSnapshot: res.model };
}

function parseBrands(raw: string): string[] {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed.brands)) throw new Error("Missing brands array");
  return parsed.brands.filter((b: unknown) => typeof b === "string" && b.length > 0);
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

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const { searchParams } = new URL(request.url);
  const modelParam = searchParams.get("model");
  const aggregateOnly = searchParams.has("aggregate");

  const jobLabel = aggregateOnly ? "aggregation" : `collection (${modelParam ?? "all"})`;

  try {
    await initSkincareDB();

    // Window start = 4 days ago so the LLM visibility chart covers the full 5-day run
    const windowStartDate = new Date(now);
    windowStartDate.setDate(windowStartDate.getDate() - 4);
    const windowStart = windowStartDate.toISOString().split("T")[0];

    // ── Aggregate-only mode ──────────────────────────────────────────────────
    if (aggregateOnly) {
      await runSkincareAggregations(today, windowStart);
      const stats = await getSkincareDailyRunStats(today);

      const EXPECTED_TOTAL = EXPECTED_PER_MODEL * 2; // 78
      const healthy = stats.success === EXPECTED_TOTAL && stats.activeErrors === 0;

      if (!healthy) {
        await sendEmail({
          subject: `[AgenticLib] ALERT — Skincare Visibility Aggregation failed (${today})`,
          html: `
            <h2>Skincare Visibility Pipeline — Aggregation Health Check Failed</h2>
            <table style="border-collapse:collapse;font-family:monospace">
              <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
              <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
              <tr><td style="padding:4px 12px 4px 0"><strong>Rows stored</strong></td><td>${stats.success} / ${EXPECTED_TOTAL}</td></tr>
              <tr><td style="padding:4px 12px 4px 0"><strong>Active errors</strong></td><td>${stats.activeErrors}</td></tr>
              <tr><td style="padding:4px 12px 4px 0"><strong>Complete</strong></td><td>${stats.success === EXPECTED_TOTAL ? "true" : "false"}</td></tr>
            </table>
          `,
        }).catch((e) => console.error("[alert] skincare aggregation failure email failed:", e));
      }

      return Response.json({
        mode: "aggregate_only",
        date: today,
        db_success_rows: stats.success,
        active_errors: stats.activeErrors,
        healthy,
        window_start: windowStart,
        window_end: today,
      });
    }

    // ── Collection mode ──────────────────────────────────────────────────────
    const modelsToRun: ("claude-haiku-4-5" | "gpt-4o-mini")[] =
      modelParam === "claude-haiku-4-5" ? ["claude-haiku-4-5"]
      : modelParam === "gpt-4o-mini"    ? ["gpt-4o-mini"]
      : ["claude-haiku-4-5", "gpt-4o-mini"];

    const expected = SKINCARE_PROMPTS.length * RUNS_PER_PROMPT * modelsToRun.length;

    for (const m of modelsToRun) {
      await archiveSkincareErrors(today, m);
    }

    const tasks: (() => Promise<{ success: boolean }>)[] = [];

    for (const prompt of SKINCARE_PROMPTS) {
      for (const model of modelsToRun) {
        for (let run = 1; run <= RUNS_PER_PROMPT; run++) {
          const p = prompt;
          const m = model;
          const r = run;

          tasks.push(async () => {
            try {
              const result = m === "claude-haiku-4-5"
                ? await withRetry(() => callClaude(p.text))
                : await withRetry(() => callGPT(p.text));

              const brands = parseBrands(result.text);

              await insertSkincareRawResponse({
                date: today,
                promptId: p.id,
                promptText: p.text,
                bucketTag: p.tag,
                model: m,
                modelSnapshot: result.modelSnapshot,
                runNumber: r,
                brands,
              });

              return { success: true };
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              await insertSkincareCollectionError({
                date: today,
                promptId: p.id,
                model: m,
                runNumber: r,
                rawResponse: errorMessage.slice(0, 2000),
                errorMessage,
              }).catch(() => {});
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
        subject: `[AgenticLib] ALERT — Skincare Visibility Collection failed (${modelParam ?? "all"}, ${today})`,
        html: `
          <h2>Skincare Visibility Pipeline — Collection Failures</h2>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>${modelParam ?? "all"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Succeeded</strong></td><td>${succeeded} / ${expected}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Failed</strong></td><td>${failed}</td></tr>
          </table>
        `,
      }).catch((e) => console.error("[alert] skincare collection failure email failed:", e));
    }

    return Response.json({
      mode: "collection",
      model: modelParam ?? "all",
      date: today,
      expected,
      succeeded,
      failed,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] skincare-visibility ${jobLabel} crashed:`, message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Skincare Visibility ${jobLabel} (${today})`,
      html: `
        <h2>Skincare Visibility Pipeline — Unhandled Crash</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Job</strong></td><td>${jobLabel}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
        <p>Check Vercel function logs for the full stack trace.</p>
      `,
    }).catch((e) => console.error("[alert] skincare crash email failed:", e));

    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
