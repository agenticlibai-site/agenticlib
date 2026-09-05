import {
  initHsaiDB, getHsaiSentimentResponsesForWeek, upsertHsaiSentimentScore,
} from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

// Runs Sunday 04:30 UTC (30 4 * * 0) — after a full Mon–Sat collection week.
// Aggregates past 7 days of hsai_sentiment_responses into hsai_sentiment_scores.

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

  try {
    await initHsaiDB();

    const responses = await getHsaiSentimentResponsesForWeek(weekStart, weekEnd);

    if (responses.length === 0) {
      return Response.json({
        mode: "hsai_sentiment_aggregate", week_start: weekStart, week_end: weekEnd,
        aggregated: 0, note: "no hsai_sentiment_responses for this week — collection may not have run yet",
      });
    }

    // Group by brand × bucket_tag
    const grouped = new Map<string, typeof responses>();
    for (const row of responses) {
      const key = `${row.brand_name}::${row.bucket_tag}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(row);
    }

    let aggregated = 0;
    for (const [key, rows] of grouped) {
      const [brandName, bucketTag] = key.split("::");
      if (!brandName || !bucketTag) continue;

      let pos = 0, neu = 0, neg = 0;
      const descriptorFreq = new Map<string, number>();

      for (const row of rows) {
        const s = row.sentiment?.toLowerCase() ?? "";
        if (s === "positive")            pos++;
        else if (s === "negative")       neg++;
        else if (s === "neutral" || s === "mixed") neu++;

        for (const d of (row.descriptors ?? [])) {
          if (d) descriptorFreq.set(d, (descriptorFreq.get(d) ?? 0) + 1);
        }
      }

      // Top 5 descriptors by frequency
      const topDescriptors = [...descriptorFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([d]) => d);

      await upsertHsaiSentimentScore({
        brand_name: brandName,
        bucket_tag: bucketTag,
        week_start: weekStart,
        positive_count: pos,
        neutral_count:  neu,
        negative_count: neg,
        total_count:    rows.length,
        top_descriptors: topDescriptors,
      });
      aggregated++;
    }

    console.log(`[hsai-sentiment-aggregate] done — week_start=${weekStart}, aggregated=${aggregated}, ts=${runTimestamp}`);

    return Response.json({
      mode: "hsai_sentiment_aggregate", week_start: weekStart, week_end: weekEnd,
      responses_read: responses.length, aggregated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] hsai-sentiment-aggregate crashed:", message);
    await sendEmail({
      subject: `[AgenticLib] CRASH — HSAI Sentiment Aggregate (${weekStart ?? "unknown"})`,
      html: `<h2>HSAI Sentiment Aggregate — Crash</h2><p>Timestamp: ${runTimestamp} | Error: ${message}</p>`,
    }).catch(() => {});
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
