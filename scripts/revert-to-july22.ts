#!/usr/bin/env npx tsx
// Re-scores from July 22 data to revert the bulk July 6-12 restore that damaged scores
// for features that only exist post-July-13.
import { neon } from "@neondatabase/serverless";
import { computeScore, type FeatureRunRow } from "../lib/brand-visibility/sales-features";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const rows = await sql`
    SELECT brand_name, feature_id, feature_tag, model,
           has_capability, evidence, confidence, parse_error,
           COALESCE(grounded, FALSE) AS grounded
    FROM sales_feature_responses
    WHERE run_date = '2026-07-22'
    ORDER BY brand_name, feature_id, model, grounded ASC, run_number
  `;
  console.log(`July 22 responses: ${rows.length}`);

  const groups = new Map<string, FeatureRunRow[]>();
  for (const r of rows) {
    const key = `${r.brand_name}::${r.feature_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r as FeatureRunRow);
  }
  console.log(`Groups: ${groups.size}`);

  let scored = 0;
  for (const [key, runRows] of groups) {
    const [brand_name, feature_id] = key.split("::");
    const feature_tag = runRows[0].feature_tag;
    const result = computeScore(runRows);
    await sql`
      INSERT INTO sales_feature_scores
        (brand_name, feature_id, feature_tag, score, score_band,
         runs_agreeing, runs_total, flagged_for_review, flag_reason, notes,
         grounded_source, scored_at)
      VALUES
        (${brand_name}, ${feature_id}, ${feature_tag}, ${result.score},
         ${result.score_band}, ${result.runs_agreeing}, ${result.runs_total},
         ${result.flagged_for_review}, ${result.flag_reason}, ${result.notes},
         ${result.grounded_source ?? false}, '2026-07-22 10:05:48')
      ON CONFLICT (brand_name, feature_id) DO UPDATE SET
        feature_tag        = EXCLUDED.feature_tag,
        score              = EXCLUDED.score,
        score_band         = EXCLUDED.score_band,
        runs_agreeing      = EXCLUDED.runs_agreeing,
        runs_total         = EXCLUDED.runs_total,
        flagged_for_review = EXCLUDED.flagged_for_review,
        flag_reason        = EXCLUDED.flag_reason,
        notes              = EXCLUDED.notes,
        grounded_source    = EXCLUDED.grounded_source,
        scored_at          = EXCLUDED.scored_at
    `;
    scored++;
  }
  console.log(`Restored ${scored} scores to July 22 state.`);
}
main().catch((err) => { console.error(err); process.exit(1); });
