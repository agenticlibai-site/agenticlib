import {
  initEsaiDB,
  getEsaiSentimentResponsesForWeek,
  getPrevEsaiSentimentScores,
  upsertEsaiSentimentScore,
  upsertEsaiSentimentDrift,
} from "@/lib/brand-visibility/db";
import { aggregateResponses, computeDrift } from "@/lib/brand-visibility/sentiment";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

// Runs Sunday 04:00 UTC (0 4 * * 0) — after a full Mon–Sat collection week.
// 1. Aggregates past 7 days of esai_sentiment_responses into esai_sentiment_scores.
// 2. Compares to previous week and writes drift flags to esai_sentiment_drift.

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
    await initEsaiDB();

    const responses = await getEsaiSentimentResponsesForWeek(weekStart, weekEnd);

    if (responses.length === 0) {
      return Response.json({
        mode: "esai_sentiment_aggregate", week_start: weekStart, week_end: weekEnd,
        aggregated: 0, note: "no esai_sentiment_responses for this week — collection may not have run yet",
      });
    }

    const aggregated = aggregateResponses(responses.map((r) => ({ ...r, parse_error: false })), weekStart);
    for (const row of aggregated) await upsertEsaiSentimentScore(row);

    const previousScores = await getPrevEsaiSentimentScores(prevWeekStart);
    const driftResults   = computeDrift(aggregated, previousScores);
    for (const row of driftResults) await upsertEsaiSentimentDrift(row);

    const driftFlags = driftResults.filter((r) => r.drift_flag);
    if (driftFlags.length > 0) {
      const driftTable = driftFlags.map((r) =>
        `<tr><td style="padding:4px 12px 4px 0">${r.brand_name}</td><td style="padding:4px 12px 4px 0">${r.bucket_tag}</td><td>${r.drift_reason}</td></tr>`
      ).join("");
      await sendEmail({
        subject: `[AgenticLib] ALERT — ESAI sentiment drift detected (${weekStart})`,
        html: `<h2>ESAI Sentiment Pipeline — Drift Flags</h2>
          <p>Week: ${weekStart} → ${weekEnd} | Timestamp: ${runTimestamp}</p>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><th style="padding:4px 12px 4px 0;text-align:left">Brand</th><th style="padding:4px 12px 4px 0;text-align:left">Cluster</th><th style="text-align:left">Reason</th></tr>
            ${driftTable}
          </table>`,
      }).catch(() => {});
    }

    return Response.json({
      mode: "esai_sentiment_aggregate", week_start: weekStart, week_end: weekEnd,
      responses_read: responses.length, aggregated: aggregated.length,
      drift_evaluated: driftResults.length, drift_flags: driftFlags.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] esai-sentiment-aggregate crashed:", message);
    await sendEmail({
      subject: `[AgenticLib] CRASH — ESAI Sentiment Aggregate (${weekStart ?? "unknown"})`,
      html: `<h2>ESAI Sentiment Aggregate — Crash</h2><p>Timestamp: ${runTimestamp} | Error: ${message}</p>`,
    }).catch(() => {});
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
