import {
  initRalfiDB,
  getRalfiSentimentResponsesForWeek,
  getPrevRalfiSentimentScores,
  upsertRalfiSentimentScore,
  upsertRalfiSentimentDrift,
} from "@/lib/brand-visibility/db";
import { aggregateResponses, computeDrift } from "@/lib/brand-visibility/sentiment";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

// Runs Sunday 3:00 AM UTC (0 3 * * 0) — after a full Mon–Sat collection week.
// 1. Aggregates the past 7 days of ralfi_sentiment_responses into ralfi_sentiment_scores.
// 2. Compares to previous week and writes drift flags to ralfi_sentiment_drift.

function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
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

  const now       = new Date();
  const weekStart = getWeekStartDate(now);
  const weekEnd   = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const prevDate = new Date(weekStart);
  prevDate.setUTCDate(prevDate.getUTCDate() - 7);
  const prevWeekStart = prevDate.toISOString().split("T")[0];

  try {
    await initRalfiDB();

    const responses = await getRalfiSentimentResponsesForWeek(weekStart, weekEnd);

    if (responses.length === 0) {
      return Response.json({
        mode:       "ralfi_sentiment_aggregate",
        week_start: weekStart,
        week_end:   weekEnd,
        aggregated: 0,
        note:       "no ralfi_sentiment_responses found for this week — collection may not have run yet",
      });
    }

    const aggregated = aggregateResponses(responses, weekStart);
    for (const row of aggregated) await upsertRalfiSentimentScore(row);

    const previousScores = await getPrevRalfiSentimentScores(prevWeekStart);
    const driftResults   = computeDrift(aggregated, previousScores);
    for (const row of driftResults) await upsertRalfiSentimentDrift(row);

    const driftFlags = driftResults.filter((r) => r.drift_flag);

    if (driftFlags.length > 0) {
      const driftTable = driftFlags
        .map((r) =>
          `<tr><td style="padding:4px 12px 4px 0">${r.brand_name}</td>` +
          `<td style="padding:4px 12px 4px 0">${r.bucket_tag}</td>` +
          `<td>${r.drift_reason}</td></tr>`,
        )
        .join("");

      await sendEmail({
        subject: `[AgenticLib] ALERT — Ralfi sentiment drift detected (${weekStart})`,
        html: `<h2>Ralfi Sentiment Pipeline — Drift Flags</h2>
          <p>Week: ${weekStart} → ${weekEnd} | Timestamp: ${runTimestamp}</p>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr>
              <th style="padding:4px 12px 4px 0;text-align:left">Brand</th>
              <th style="padding:4px 12px 4px 0;text-align:left">Cluster</th>
              <th style="text-align:left">Reason</th>
            </tr>
            ${driftTable}
          </table>`,
      }).catch((e) => console.error("[alert] ralfi sentiment drift email failed:", e));
    }

    return Response.json({
      mode:            "ralfi_sentiment_aggregate",
      week_start:      weekStart,
      week_end:        weekEnd,
      responses_read:  responses.length,
      aggregated:      aggregated.length,
      drift_evaluated: driftResults.length,
      drift_flags:     driftFlags.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] ralfi-sentiment-aggregate crashed:", message);
    await sendEmail({
      subject: `[AgenticLib] CRASH — Ralfi Sentiment Aggregate (week ${weekStart})`,
      html: `<h2>Ralfi Sentiment Pipeline — Unhandled Crash</h2>
        <p>Week start: ${weekStart} | Timestamp: ${runTimestamp} | Error: ${message}</p>`,
    }).catch(() => {});
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
