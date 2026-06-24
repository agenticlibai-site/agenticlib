import { sql } from "@vercel/postgres";
import { initBrandVisibilityDB } from "@/lib/brand-visibility/db";
import { computeDailySummary, computeWeeklySummary, computeLLMVisibility } from "@/lib/brand-visibility/aggregation";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Re-runs daily + weekly aggregation for every date present in raw_responses,
// applying the current brand_denylist (including any newly inserted entries).
// Safe to call multiple times — all aggregation functions use ON CONFLICT DO UPDATE.
//
// Usage:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://agenticlib.com/api/brand-visibility/audit/reaggregate
//
// Optionally pass ?dry_run to insert denylist entries and check dates without re-aggregating.

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initBrandVisibilityDB();

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.has("dry_run");

  // Insert new denylist entries (idempotent — ON CONFLICT DO NOTHING).
  const newEntries = [
    "Klaviyo", "ConvertKit", "GetResponse", "Sendinblue", "Drip",
    "Hootsuite", "Buffer", "Sprout Social", "Brandwatch",
    "AdRoll", "Marin Software", "Kissmetrics", "Meta Ads Manager", "Terminus",
    "Apollo", "Hunter.io", "Clay",
    "Optimizely",
  ];
  await sql`
    INSERT INTO brand_denylist (brand_name)
    SELECT t.name FROM UNNEST(${newEntries}::text[]) AS t(name)
    ON CONFLICT (brand_name) DO NOTHING
  `;

  // Verify what's now in the denylist.
  const denylistResult = await sql`SELECT brand_name FROM brand_denylist ORDER BY brand_name`;
  const fullDenylist = denylistResult.rows.map((r) => r.brand_name as string);

  // Get all distinct dates that have raw collection data.
  const datesResult = await sql`
    SELECT DISTINCT date::text FROM raw_responses ORDER BY date ASC
  `;
  const dates = datesResult.rows.map((r) => r.date as string);

  if (!dates.length) {
    return Response.json({ status: "no_data", denylist: fullDenylist });
  }

  const windowStart = dates[0];
  const windowEnd   = dates[dates.length - 1];

  if (dryRun) {
    return Response.json({
      dry_run: true,
      dates,
      window_start: windowStart,
      window_end: windowEnd,
      denylist_count: fullDenylist.length,
      denylist: fullDenylist,
    });
  }

  // Re-run daily aggregation for every date (computeDailySummary deletes stale
  // denylisted rows and re-upserts the corrected counts).
  for (const date of dates) {
    await computeDailySummary(date);
  }

  // Re-run weekly + LLM visibility over the full window.
  await computeWeeklySummary(windowStart, windowEnd);
  await computeLLMVisibility(windowStart, windowEnd);

  // Return the corrected top 15 — summed across models, matching the chart logic.
  const top15Result = await sql`
    SELECT
      brand,
      SUM(mention_count)::int                                          AS total_mentions,
      ROUND(AVG(avg_position)::numeric, 1)::float                     AS avg_position,
      string_agg(DISTINCT model, ', ' ORDER BY model)                  AS models,
      CASE WHEN MIN(confidence) = 'low' THEN 'low' ELSE 'normal' END  AS confidence
    FROM weekly_summary
    WHERE window_start = ${windowStart}::date
      AND window_end   = ${windowEnd}::date
    GROUP BY brand
    ORDER BY total_mentions DESC
    LIMIT 15
  `;

  return Response.json({
    status: "ok",
    reaggregated_dates: dates,
    window_start: windowStart,
    window_end: windowEnd,
    denylist_count: fullDenylist.length,
    top_15: top15Result.rows,
  });
}
