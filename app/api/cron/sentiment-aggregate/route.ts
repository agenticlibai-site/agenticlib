import {
  initBrandVisibilityDB,
  getSentimentResponsesForWeek,
  getPreviousWeekSentimentScores,
  upsertSentimentScore,
  upsertSentimentDrift,
} from "@/lib/brand-visibility/db";
import {
  aggregateResponses,
  computeDrift,
} from "@/lib/brand-visibility/sentiment";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Runs Sunday 1:00 AM UTC (0 1 * * 0) — after a full Mon–Sat collection week.
// 1. Aggregates the past 7 days of sentiment_responses into sentiment_scores.
// 2. Compares to previous week and writes drift flags to sentiment_drift.

function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const daysToMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - daysToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now      = new Date();
  const weekStart = getWeekStartDate(now);           // Monday of current week
  const weekEnd   = now.toISOString().split("T")[0]; // Sunday (exclusive upper bound)
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  // Previous week: 7 days before this week_start
  const prevDate = new Date(weekStart);
  prevDate.setUTCDate(prevDate.getUTCDate() - 7);
  const prevWeekStart = prevDate.toISOString().split("T")[0];

  try {
    await initBrandVisibilityDB();

    // ── Aggregation ────────────────────────────────────────────────────────────
    const responses = await getSentimentResponsesForWeek(weekStart, weekEnd);

    if (responses.length === 0) {
      return Response.json({
        mode:       "sentiment_aggregate",
        week_start: weekStart,
        week_end:   weekEnd,
        aggregated: 0,
        drift_flags: 0,
        note: "no sentiment_responses found for this week — collection may not have run yet",
      });
    }

    const aggregated = aggregateResponses(responses, weekStart);
    for (const row of aggregated) await upsertSentimentScore(row);

    // ── Drift detection ────────────────────────────────────────────────────────
    const previousScores = await getPreviousWeekSentimentScores(prevWeekStart);
    const driftResults   = computeDrift(aggregated, previousScores);
    for (const row of driftResults) await upsertSentimentDrift(row);

    const driftFlags = driftResults.filter((r) => r.drift_flag);

    if (driftFlags.length > 0) {
      const driftTable = driftFlags
        .map(
          (r) =>
            `<tr><td style="padding:4px 12px 4px 0">${r.brand_name}</td>` +
            `<td style="padding:4px 12px 4px 0">${r.bucket_tag}</td>` +
            `<td>${r.drift_reason}</td></tr>`,
        )
        .join("");

      await sendEmail({
        subject: `[AgenticLib] ALERT — Sentiment drift detected (${weekStart})`,
        html: `
          <h2>Sentiment Pipeline — Drift Flags</h2>
          <p>Week: ${weekStart} → ${weekEnd}</p>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr>
              <th style="padding:4px 12px 4px 0;text-align:left">Brand</th>
              <th style="padding:4px 12px 4px 0;text-align:left">Cluster</th>
              <th style="text-align:left">Reason</th>
            </tr>
            ${driftTable}
          </table>
          <p>Run timestamp: ${runTimestamp}</p>
        `,
      }).catch((e) => console.error("[alert] sentiment drift email failed:", e));
    }

    return Response.json({
      mode:            "sentiment_aggregate",
      week_start:      weekStart,
      week_end:        weekEnd,
      responses_read:  responses.length,
      aggregated:      aggregated.length,
      drift_evaluated: driftResults.length,
      drift_flags:     driftFlags.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] sentiment-aggregate crashed:", message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Sentiment Aggregate (week ${weekStart})`,
      html: `
        <h2>Sentiment Pipeline — Unhandled Crash</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Week start</strong></td><td>${weekStart}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
      `,
    }).catch(() => {});

    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
