/**
 * Temporary one-time endpoint — runs feature scoring aggregation for all dates
 * that have feature responses but no computed scores.
 * DELETE THIS FILE after use.
 *
 * GET /api/admin/backfill-feature-scores?token=ralfi-feat-2026
 */

import { sql } from "@vercel/postgres";
import {
  initRalfiDB,
  getRalfiFeatureResponsesForScoring,
  upsertRalfiFeatureScore,
} from "@/lib/brand-visibility/db";
import { computeRalfiScore } from "@/lib/brand-visibility/ralfi-features";

export const dynamic     = "force-dynamic";
export const maxDuration = 300;

const TOKEN = "ralfi-feat-2026";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initRalfiDB();

  // Find all distinct dates that have feature responses
  const dateRows = await sql`
    SELECT DISTINCT run_date::text AS date
    FROM ralfi_feature_responses
    WHERE parse_error = false
    ORDER BY date DESC
  `;
  const dates = dateRows.rows.map((r: { date: string }) => r.date);

  if (dates.length === 0) {
    return Response.json({ status: "nothing_to_do", message: "No feature responses found." });
  }

  const log: string[] = [];
  log.push(`Processing ${dates.length} date(s): ${dates.join(", ")}`);

  let totalScored = 0;

  for (const date of dates) {
    const responses = await getRalfiFeatureResponsesForScoring(date);
    if (responses.length === 0) {
      log.push(`[${date}] No responses found — skipping`);
      continue;
    }

    // Group by brand + feature
    const groups = new Map<string, typeof responses>();
    for (const r of responses) {
      const key = `${r.brand_name}::${r.feature_id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }

    let scored = 0;
    for (const [key, rows] of groups) {
      const [brand_name, feature_id] = key.split("::");
      const feature_tag = rows[0].feature_tag;
      try {
        const result = computeRalfiScore(rows);
        await upsertRalfiFeatureScore({ brand_name, feature_id, feature_tag, ...result });
        scored++;
      } catch (err) {
        log.push(`[${date}] Error scoring ${brand_name}/${feature_id}: ${(err as Error).message?.slice(0, 60)}`);
      }
    }

    log.push(`[${date}] Scored ${scored} brand+feature pairs`);
    totalScored += scored;
  }

  // Summary of what's now in the scores table
  const summary = await sql`
    SELECT feature_id, score_band, COUNT(*)::int AS brands
    FROM ralfi_feature_scores
    WHERE score IS NOT NULL
    GROUP BY feature_id, score_band
    ORDER BY feature_id, score_band
  `;

  const withScores = await sql`
    SELECT COUNT(*)::int AS cnt FROM ralfi_feature_scores WHERE score IS NOT NULL
  `;

  return Response.json({
    status: "done",
    dates_processed: dates,
    total_scored: totalScored,
    scores_with_values: withScores.rows[0].cnt,
    log,
    breakdown: summary.rows,
  });
}
