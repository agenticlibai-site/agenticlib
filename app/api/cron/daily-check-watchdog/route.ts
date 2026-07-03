import { sql } from "@vercel/postgres";
import { initBrandVisibilityDB } from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/cron/daily-check-watchdog
 *
 * Dead-man's-switch that runs at 4:00 AM UTC — 35 minutes after the last
 * real job (aggregation at 3:25 AM UTC) is expected to finish.
 *
 * Catches the one gap in-process alerting cannot cover: a Vercel
 * FUNCTION_INVOCATION_TIMEOUT that kills the job before any catch block runs.
 *
 * Logic:
 *  - raw_responses for today must have >= EXPECTED_ROWS (prompts × runs × models)
 *  - daily_summary for today must have at least one row (aggregation ran)
 *  - If either condition fails: send a WATCHDOG alert email
 *  - If both pass: exit silently
 *
 * Query params (for testing):
 *  ?date=YYYY-MM-DD  — check a specific date instead of today (use a future
 *                      date to confirm the alert fires without touching real data)
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkTime = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const targetDate = dateParam ?? new Date().toISOString().split("T")[0];

  // How long ago a raw_response write must be for the pipeline to count as
  // "in progress" rather than genuinely dead. 90 minutes covers the worst
  // observed Vercel cron delay (56 min) with a meaningful safety margin.
  const IN_PROGRESS_WINDOW_MINUTES = 90;

  try {
    await initBrandVisibilityDB();

    const [rowsResult, summaryResult, lastWriteResult] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM raw_responses WHERE date = ${targetDate}::date`,
      sql`SELECT COUNT(*)::int AS count FROM daily_summary WHERE date = ${targetDate}::date`,
      // Most recent raw_response write for today — null if no rows at all
      sql`SELECT MAX(created_at) AS last_write FROM raw_responses WHERE date = ${targetDate}::date`,
    ]);

    const rawRows = rowsResult.rows[0].count as number;
    const summaryRows = summaryResult.rows[0].count as number;
    // Update PROMPT_COUNT when new prompts are added to prompts.ts
    const EXPECTED_ROWS = 24 * 5 * 2; // prompts × runs × models
    const complete = rawRows >= EXPECTED_ROWS && summaryRows > 0;

    if (complete) {
      return Response.json({
        watchdog: "ok",
        date: targetDate,
        raw_rows: rawRows,
        summary_rows: summaryRows,
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
