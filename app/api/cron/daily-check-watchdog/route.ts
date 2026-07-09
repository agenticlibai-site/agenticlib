import { sql } from "@vercel/postgres";
import { after } from "next/server";
import { initBrandVisibilityDB } from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/cron/daily-check-watchdog
 *
 * Two invocations per day via vercel.json:
 *
 *  5:45 UTC  (no ?check param)       — brand-visibility dead-man's-switch +
 *                                       Claude sentiment self-healing.
 *                                       Checks YESTERDAY's Claude rows because
 *                                       Claude crons (8:00 + 11:00 UTC) haven't
 *                                       run yet; a 0 count means yesterday was skipped.
 *
 *  16:00 UTC (?check=gpt-sentiment)  — GPT sentiment self-healing only.
 *                                       By 16:00 both GPT crons (14:00 + 15:00 UTC)
 *                                       have had time to complete, so checks TODAY.
 *
 * Recovery fires via after() with a 12s abort signal — the sentiment Lambda
 * receives the request and runs its full 300s independently once triggered.
 * Two parallel after() callbacks at 12s each stay well within maxDuration=30.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 * Query params:
 *   ?check=gpt-sentiment  — run the 16:00 GPT-only check
 *   ?date=YYYY-MM-DD      — override targetDate for the 5:45 brand-visibility
 *                           check (use a future date to confirm alert fires)
 */

const CRON_ORIGIN = "https://agenticlib.com";

function cronHeaders(secret: string | undefined) {
  return { Authorization: `Bearer ${secret ?? ""}` };
}

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkTime = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const { searchParams } = new URL(request.url);
  const headers = cronHeaders(process.env.CRON_SECRET);

  // ── 16:00 UTC: GPT sentiment self-healing ─────────────────────────────────
  // By 16:00, today's GPT crons (14:00 and 15:00 UTC) have passed.
  // Check CURRENT_DATE (today) — if GPT rows are 0, the scheduled crons were skipped.
  if (searchParams.get("check") === "gpt-sentiment") {
    const today = new Date().toISOString().split("T")[0];

    try {
      const [mktResult, salesResult] = await Promise.all([
        sql`SELECT COUNT(*)::int AS count FROM sentiment_responses
            WHERE run_date = CURRENT_DATE AND model = 'gpt-4o-mini'`,
        sql`SELECT COUNT(*)::int AS count FROM sales_sentiment_responses
            WHERE run_date = CURRENT_DATE AND model = 'gpt-4o-mini'`,
      ]);

      const mktCount   = mktResult.rows[0].count  as number;
      const salesCount = salesResult.rows[0].count as number;
      const sentimentRecovery: string[] = [];

      if (mktCount === 0) {
        sentimentRecovery.push("marketing");
        after(async () => {
          const ctrl = new AbortController();
          setTimeout(() => ctrl.abort(), 12_000);
          try {
            await fetch(`${CRON_ORIGIN}/api/cron/sentiment-collection?model=gpt-4o-mini`,
              { headers, signal: ctrl.signal });
          } catch { /* abort after 12s — sentiment Lambda continues independently */ }
          console.log("[watchdog] triggered missed marketing GPT sentiment");
        });
      }

      if (salesCount === 0) {
        sentimentRecovery.push("sales");
        after(async () => {
          const ctrl = new AbortController();
          setTimeout(() => ctrl.abort(), 12_000);
          try {
            await fetch(`${CRON_ORIGIN}/api/cron/sales-sentiment-collection?model=gpt-4o-mini`,
              { headers, signal: ctrl.signal });
          } catch { /* abort after 12s — sentiment Lambda continues independently */ }
          console.log("[watchdog] triggered missed sales GPT sentiment");
        });
      }

      if (sentimentRecovery.length > 0) {
        await sendEmail({
          subject: `[AgenticLib] Auto-recovered missed sentiment cron (gpt-4o-mini, ${today})`,
          html: `
            <h2>Sentiment Pipeline — Automatic Recovery</h2>
            <p><em>No action required.</em> The 16:00 UTC watchdog detected that today's
               GPT sentiment collection was skipped and triggered automatic recovery.</p>
            <table style="border-collapse:collapse;font-family:monospace">
              <tr><td style="padding:4px 12px 4px 0"><strong>Detected at</strong></td><td>${checkTime}</td></tr>
              <tr><td style="padding:4px 12px 4px 0"><strong>Run date</strong></td><td>${today}</td></tr>
              <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>gpt-4o-mini</td></tr>
              <tr><td style="padding:4px 12px 4px 0"><strong>Pipelines recovered</strong></td><td>${sentimentRecovery.join(", ")}</td></tr>
              <tr><td style="padding:4px 12px 4px 0"><strong>Marketing rows before recovery</strong></td><td>${mktCount}</td></tr>
              <tr><td style="padding:4px 12px 4px 0"><strong>Sales rows before recovery</strong></td><td>${salesCount}</td></tr>
            </table>
            <p>Recovery collection is now running and should complete within 5 minutes.</p>
          `,
        }).catch((e) => console.error("[watchdog] gpt recovery email failed:", e));
      }

      return Response.json({
        watchdog: "gpt-sentiment-check",
        date: today,
        mkt_gpt_rows: mktCount,
        sales_gpt_rows: salesCount,
        sentiment_recovery: sentimentRecovery,
        checked_at: checkTime,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[watchdog] gpt-sentiment check failed:", message);
      return Response.json({ error: "GPT sentiment check failed", message }, { status: 500 });
    }
  }

  // ── 5:45 UTC: brand-visibility dead-man's-switch + Claude sentiment ────────

  const dateParam = searchParams.get("date");
  const targetDate = dateParam ?? new Date().toISOString().split("T")[0];

  // How long ago a raw_response write must be for the pipeline to count as
  // "in progress" rather than genuinely dead. 90 minutes covers the worst
  // observed Vercel cron delay (56 min) with a meaningful safety margin.
  const IN_PROGRESS_WINDOW_MINUTES = 90;

  try {
    await initBrandVisibilityDB();

    const [rowsResult, summaryResult, lastWriteResult, mktSentimentResult, salesSentimentResult] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM raw_responses WHERE date = ${targetDate}::date`,
      sql`SELECT COUNT(*)::int AS count FROM daily_summary WHERE date = ${targetDate}::date`,
      // Most recent raw_response write for today — null if no rows at all
      sql`SELECT MAX(created_at) AS last_write FROM raw_responses WHERE date = ${targetDate}::date`,
      // Sentiment check uses CURRENT_DATE-1: watchdog runs at 5:45 UTC, before today's sentiment crons (8:00+).
      // Checking yesterday catches skipped Vercel invocations without false-triggering every morning.
      sql`SELECT COUNT(*)::int AS count FROM sentiment_responses WHERE run_date = (CURRENT_DATE - 1)`,
      sql`SELECT COUNT(*)::int AS count FROM sales_sentiment_responses WHERE run_date = (CURRENT_DATE - 1)`,
    ]);

    const rawRows    = rowsResult.rows[0].count    as number;
    const summaryRows = summaryResult.rows[0].count as number;
    // Update PROMPT_COUNT when new prompts are added to prompts.ts
    const EXPECTED_ROWS = 24 * 5 * 2; // prompts × runs × models
    const complete = rawRows >= EXPECTED_ROWS && summaryRows > 0;

    // ── Claude sentiment self-healing ──────────────────────────────────────────
    // If yesterday's Claude collection was skipped by Vercel, trigger today's
    // claude jobs now as recovery. The fetch is intentionally aborted after 12s —
    // the sentiment Lambda runs its full 300s independently once the request arrives.
    const mktCount   = mktSentimentResult.rows[0].count  as number;
    const salesCount = salesSentimentResult.rows[0].count as number;
    const sentimentRecovery: string[] = [];

    if (mktCount === 0) {
      sentimentRecovery.push("marketing");
      after(async () => {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 12_000);
        try {
          await fetch(`${CRON_ORIGIN}/api/cron/sentiment-collection?model=claude-haiku-4-5`,
            { headers, signal: ctrl.signal });
        } catch { /* abort after 12s — sentiment Lambda continues independently */ }
        console.log("[watchdog] triggered missed marketing Claude sentiment");
      });
    }

    if (salesCount === 0) {
      sentimentRecovery.push("sales");
      after(async () => {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 12_000);
        try {
          await fetch(`${CRON_ORIGIN}/api/cron/sales-sentiment-collection?model=claude-haiku-4-5`,
            { headers, signal: ctrl.signal });
        } catch { /* abort after 12s — sentiment Lambda continues independently */ }
        console.log("[watchdog] triggered missed sales Claude sentiment");
      });
    }

    if (sentimentRecovery.length > 0) {
      await sendEmail({
        subject: `[AgenticLib] Auto-recovered missed sentiment cron (claude-haiku-4-5, ${targetDate})`,
        html: `
          <h2>Sentiment Pipeline — Automatic Recovery</h2>
          <p><em>No action required.</em> The 5:45 UTC watchdog detected that yesterday's
             Claude sentiment collection was skipped and triggered automatic recovery.</p>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Detected at</strong></td><td>${checkTime}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Recovery run date</strong></td><td>${targetDate}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>claude-haiku-4-5</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Pipelines recovered</strong></td><td>${sentimentRecovery.join(", ")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Marketing rows (yesterday)</strong></td><td>${mktCount}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Sales rows (yesterday)</strong></td><td>${salesCount}</td></tr>
          </table>
          <p>Recovery collection is now running and should complete within 5 minutes.</p>
        `,
      }).catch((e) => console.error("[watchdog] claude recovery email failed:", e));
    }
    // ──────────────────────────────────────────────────────────────────────────

    if (complete) {
      return Response.json({
        watchdog: "ok",
        date: targetDate,
        raw_rows: rawRows,
        summary_rows: summaryRows,
        sentiment_recovery: sentimentRecovery,
        checked_at: checkTime,
      });
    }

    // Pipeline incomplete — distinguish between a delayed-but-active run and a
    // genuinely dead one. If the most recent raw_response write is within the
    // last 90 minutes, the cron jobs are still running (Vercel platform delay).
    // Only fire the alert if there has been no write activity in that window.
    const lastWrite: Date | null = lastWriteResult.rows[0].last_write
      ? new Date(lastWriteResult.rows[0].last_write as string)
      : null;
    const minutesSinceLastWrite = lastWrite
      ? (Date.now() - lastWrite.getTime()) / 60_000
      : Infinity;
    const inProgress = minutesSinceLastWrite < IN_PROGRESS_WINDOW_MINUTES;

    if (inProgress) {
      return Response.json({
        watchdog: "in_progress",
        date: targetDate,
        raw_rows: rawRows,
        summary_rows: summaryRows,
        last_write_utc: lastWrite?.toISOString(),
        minutes_since_last_write: Math.round(minutesSinceLastWrite),
        complete: false,
        sentiment_recovery: sentimentRecovery,
        checked_at: checkTime,
      });
    }

    // No recent write activity — pipeline is genuinely stalled or never started.
    await sendEmail({
      subject: `[AgenticLib] WATCHDOG — No successful brand-visibility run for ${targetDate}`,
      html: `
        <h2>Brand Visibility Pipeline — Watchdog Alert</h2>
        <p>
          The dead-man's-switch check at <strong>${checkTime}</strong> found no complete
          pipeline run for <strong>${targetDate}</strong>, and no raw_response writes
          in the past ${IN_PROGRESS_WINDOW_MINUTES} minutes — the pipeline appears stalled.
        </p>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Date checked</strong></td><td>${targetDate}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Check time</strong></td><td>${checkTime}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>raw_responses rows</strong></td><td>${rawRows} / ${EXPECTED_ROWS}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>daily_summary rows</strong></td><td>${summaryRows} (expected > 0)</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Last write activity</strong></td><td>${lastWrite ? lastWrite.toISOString() : "none"}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>complete</strong></td><td>false</td></tr>
        </table>
        <p>
          To investigate: <code>/api/brand-visibility/audit/daily-check?date=${targetDate}</code>
        </p>
        <p>
          To manually trigger the pipeline for today:<br/>
          <code>GET /api/cron/brand-visibility-collection?model=claude-haiku-4-5</code><br/>
          <code>GET /api/cron/brand-visibility-collection?model=gpt-4o-mini</code><br/>
          <code>GET /api/cron/brand-visibility-collection?aggregate</code>
        </p>
      `,
    });

    return Response.json({
      watchdog: "alert_sent",
      date: targetDate,
      raw_rows: rawRows,
      summary_rows: summaryRows,
      last_write_utc: lastWrite?.toISOString() ?? null,
      minutes_since_last_write: Math.round(minutesSinceLastWrite),
      complete: false,
      sentiment_recovery: sentimentRecovery,
      checked_at: checkTime,
    });

  } catch (err) {
    // Watchdog itself errored — still attempt an alert so this doesn't fail silently.
    const message = err instanceof Error ? err.message : String(err);
    console.error("[watchdog] check failed:", message);

    await sendEmail({
      subject: `[AgenticLib] WATCHDOG ERROR — Watchdog check itself failed (${targetDate})`,
      html: `
        <h2>Brand Visibility Pipeline — Watchdog Check Failed</h2>
        <p>
          The daily-check watchdog at <strong>${checkTime}</strong> threw an unhandled
          error and could not determine whether the pipeline completed.
        </p>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${targetDate}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
        <p>Check Vercel function logs for the full stack trace.</p>
      `,
    }).catch((e) => console.error("[watchdog] error-alert email also failed:", e));

    return Response.json({ error: "Watchdog check failed", message }, { status: 500 });
  }
}
