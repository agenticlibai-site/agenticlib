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
 *  - raw_responses for today must have 220 rows (both models, all prompts/runs)
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

  try {
    await initBrandVisibilityDB();

    const [rowsResult, summaryResult] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM raw_responses WHERE date = ${targetDate}::date`,
      sql`SELECT COUNT(*)::int AS count FROM daily_summary WHERE date = ${targetDate}::date`,
    ]);

    const rawRows = rowsResult.rows[0].count as number;
    const summaryRows = summaryResult.rows[0].count as number;
    const complete = rawRows === 220 && summaryRows > 0;

    if (complete) {
      return Response.json({
        watchdog: "ok",
        date: targetDate,
        raw_rows: rawRows,
        summary_rows: summaryRows,
        checked_at: checkTime,
      });
    }

    // Pipeline incomplete — the job may have been killed or never started.
    await sendEmail({
      subject: `[AgenticLib] WATCHDOG — No successful brand-visibility run for ${targetDate}`,
      html: `
        <h2>Brand Visibility Pipeline — Watchdog Alert</h2>
        <p>
          The dead-man's-switch check at <strong>${checkTime}</strong> found no complete
          pipeline run for <strong>${targetDate}</strong>.
        </p>
        <p>
          This alert fires when the scheduled jobs (3:00–3:25 AM UTC) were killed by a
          platform timeout, never started, or otherwise did not complete before this
          watchdog ran at 4:00 AM UTC.
        </p>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Date checked</strong></td><td>${targetDate}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Check time</strong></td><td>${checkTime}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>raw_responses rows</strong></td><td>${rawRows} / 220</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>daily_summary rows</strong></td><td>${summaryRows} (expected > 0)</td></tr>
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
