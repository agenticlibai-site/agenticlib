import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { PROMPTS, COLLECTION_SYSTEM_PROMPT } from "@/lib/brand-visibility/prompts";
import {
  initBrandVisibilityDB,
  insertRawResponse,
  insertCollectionError,
  archiveErrorsForRun,
  getDailyRunStats,
} from "@/lib/brand-visibility/db";
import { runAllAggregations } from "@/lib/brand-visibility/aggregation";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ── Split-job design ───────────────────────────────────────────────────────────
// 220 calls from syd1 to US APIs (~2-3s each) exceeds the Hobby plan's 60s limit
// when run as one job. We split into three cron jobs instead:
//
//   ?model=claude-haiku-4-5  →  110 calls (~35s), no aggregation
//   ?model=gpt-4o-mini       →  110 calls (~35s), no aggregation
//   ?aggregate               →  aggregation only, runs after both collection jobs
//
// The vercel.json schedules them 10 min apart so collection always completes first.
// ──────────────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RUNS_PER_PROMPT = 5;
const BATCH_CONCURRENCY = 10; // higher concurrency since each job is one model only
const BATCH_DELAY_MS = 150;

// ── Model call helpers ─────────────────────────────────────────────────────────

interface ModelResult {
  text: string;
  modelSnapshot: string;
}

async function callClaude(promptText: string): Promise<ModelResult> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: COLLECTION_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  return {
    text: block?.type === "text" ? block.text : "",
    modelSnapshot: res.model,
  };
}

async function callGPT(promptText: string): Promise<ModelResult> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 512,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: COLLECTION_SYSTEM_PROMPT },
      { role: "user", content: promptText },
    ],
  });
  return {
    text: res.choices[0]?.message?.content ?? "",
    modelSnapshot: res.model,
  };
}

function parseBrands(raw: string): string[] {
  // Strip markdown code fences — Claude ignores the system prompt instruction
  // and wraps output in ```json ... ``` despite being told not to.
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
  // Auth check is outside try/catch — we don't alert on unauthorized access.
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Compute metadata before the try block so the crash handler has access to them
  // even if an early step (e.g. initBrandVisibilityDB) throws.
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const { searchParams } = new URL(request.url);
  const modelParam = searchParams.get("model");
  const aggregateOnly = searchParams.has("aggregate");
  const testAlert = searchParams.has("test_alert");

  const jobLabel = aggregateOnly ? "aggregation"
    : testAlert ? "test_alert"
    : `collection (${modelParam ?? "all"})`;

  try {
  await initBrandVisibilityDB();

  const windowStartDate = new Date(now);
  windowStartDate.setDate(windowStartDate.getDate() - 6);
  const windowStart = windowStartDate.toISOString().split("T")[0];

  // ── Test-alert mode ────────────────────────────────────────────────────────
  // ?test_alert — sends a fake failure email to verify delivery end-to-end,
  // without touching any real data. Safe to call at any time.
  if (testAlert) {
    await sendEmail({
      subject: `[AgenticLib] TEST ALERT — Brand Visibility Pipeline (${today})`,
      html: `
        <p>This is a <strong>test alert</strong> triggered manually via <code>?test_alert</code>.</p>
        <p>If you received this, email alerting is working correctly for the brand-visibility pipeline.</p>
        <p>Timestamp: ${runTimestamp}</p>
      `,
    }).catch((e) => console.error("[alert] test email failed:", e));
    return Response.json({ mode: "test_alert", email_sent: true, timestamp: runTimestamp });
  }

  // ── Aggregate-only mode (third cron, 3:25 AM UTC) ─────────────────────────
  if (aggregateOnly) {
    await runAllAggregations(today, windowStart);
    const stats = await getDailyRunStats(today);

    const EXPECTED_TOTAL = 220;
    const healthy = stats.success === EXPECTED_TOTAL && stats.activeErrors === 0;

    if (!healthy) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Brand Visibility Aggregation failed (${today})`,
        html: `
          <h2>Brand Visibility Pipeline — Aggregation Health Check Failed</h2>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Rows stored</strong></td><td>${stats.success} / ${EXPECTED_TOTAL}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Active errors</strong></td><td>${stats.activeErrors}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>complete</strong></td><td>${stats.success === EXPECTED_TOTAL ? "true" : "false"}</td></tr>
          </table>
          <p>Check <code>/api/brand-visibility/audit/daily-check</code> for details.</p>
        `,
      }).catch((e) => console.error("[alert] aggregation failure email failed:", e));
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

  // ── Collection mode ────────────────────────────────────────────────────────
  // When ?model= is set, only that model is queried (110 calls, ~35s).
  // When called without ?model= (e.g. local testing), both models run (220 calls).
  const modelsToRun: ("claude-haiku-4-5" | "gpt-4o-mini")[] =
    modelParam === "claude-haiku-4-5" ? ["claude-haiku-4-5"]
    : modelParam === "gpt-4o-mini"    ? ["gpt-4o-mini"]
    : ["claude-haiku-4-5", "gpt-4o-mini"];

  const expected = PROMPTS.length * RUNS_PER_PROMPT * modelsToRun.length;

  // Archive any errors from previous attempts for these models before retrying.
  // This scopes error_count to the current run only.
  for (const m of modelsToRun) {
    await archiveErrorsForRun(today, m);
  }

  const tasks: (() => Promise<{ success: boolean }>)[] = [];

  for (const prompt of PROMPTS) {
    for (const model of modelsToRun) {
      for (let run = 1; run <= RUNS_PER_PROMPT; run++) {
        const p = prompt;
        const m = model;
        const r = run;

        tasks.push(async () => {
          try {
            const result = m === "claude-haiku-4-5"
              ? await callClaude(p.text)
              : await callGPT(p.text);

            const brands = parseBrands(result.text);

            await insertRawResponse({
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
            await insertCollectionError({
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
      subject: `[AgenticLib] ALERT — Brand Visibility Collection failed (${modelParam ?? "all"}, ${today})`,
      html: `
        <h2>Brand Visibility Pipeline — Collection Failures</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>${modelParam ?? "all"}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Succeeded</strong></td><td>${succeeded} / ${expected}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Failed</strong></td><td>${failed}</td></tr>
        </table>
        <p>Check <code>/api/brand-visibility/audit/daily-check</code> for error details.</p>
      `,
    }).catch((e) => console.error("[alert] collection failure email failed:", e));
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
    // Top-level crash handler: fires if the job throws before reaching its own
    // alert logic (e.g. initBrandVisibilityDB failure, network error, unhandled exception).
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] brand-visibility ${jobLabel} crashed:`, message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Brand Visibility ${jobLabel} (${today})`,
      html: `
        <h2>Brand Visibility Pipeline — Unhandled Crash</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Job</strong></td><td>${jobLabel}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
        <p>The job crashed before completing its health check. Check Vercel function logs for the full stack trace.</p>
        <p>Audit: <code>/api/brand-visibility/audit/daily-check</code></p>
      `,
    }).catch((e) => console.error("[alert] crash email failed:", e));

    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
