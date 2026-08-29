/**
 * Temporary one-time endpoint — scores ALL ralfi_feature_responses in one pass.
 * DELETE THIS FILE after use.
 *
 * GET /api/admin/backfill-feature-scores?token=ralfi-feat-2026
 */

import { sql } from "@vercel/postgres";
import { initRalfiDB, upsertRalfiFeatureScore } from "@/lib/brand-visibility/db";
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

  // Pull ALL responses in one query — no per-date looping
  const { rows } = await sql`
    SELECT brand_name, feature_id, feature_tag, model,
           has_capability, evidence, confidence, parse_error,
           COALESCE(grounded, FALSE) AS grounded
    FROM ralfi_feature_responses
    WHERE parse_error = false
    ORDER BY brand_name, feature_id, model, grounded ASC, run_number
  `;

  if (rows.length === 0) {
    return Response.json({ status: "nothing_to_do", message: "No feature responses found." });
  }

  // Group by brand + feature (across all dates — cumulative scoring)
  type Row = { brand_name: string; feature_id: string; feature_tag: string; model: string; has_capability: string | null; evidence: string | null; confidence: string | null; parse_error: boolean; grounded: boolean };
  const groups = new Map<string, Row[]>();
  for (const r of rows as Row[]) {
    const key = `${r.brand_name}::${r.feature_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  let scored = 0;
  const errors: string[] = [];

  for (const [key, groupRows] of groups) {
    const [brand_name, feature_id] = key.split("::");
    const feature_tag = groupRows[0].feature_tag;
    try {
      const result = computeRalfiScore(groupRows);
      await upsertRalfiFeatureScore({ brand_name, feature_id, feature_tag, ...result });
      scored++;
    } catch (err) {
      errors.push(`${brand_name}/${feature_id}: ${(err as Error).message?.slice(0, 80)}`);
    }
  }

  // Summary
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
    total_responses: rows.length,
    brand_feature_pairs: groups.size,
    scored,
    errors,
    scores_with_values: withScores.rows[0].cnt,
    breakdown: summary.rows,
  });
}
