#!/usr/bin/env npx tsx
/**
 * Targeted fix: re-score ONLY 3 new call features from July 22 responses.
 * These 3 features were damaged by the bulk July 6-12 restore because Claude Haiku
 * was conservative during their first 3 days (July 10-12), producing undocumented/partial.
 * July 22 GPT-4o-mini data is the correct source for these features.
 * All other 191 rows in sales_feature_scores are untouched.
 */

import { neon } from "@neondatabase/serverless";
import { computeScore, type FeatureRunRow } from "../lib/brand-visibility/sales-features";

const sql = neon(process.env.DATABASE_URL!);

const TARGET_FEATURES = [
  "call_coaching_scorecard",
  "call_competitor_objection_detection",
  "call_talk_time_analytics",
];

async function main() {
  console.log("=== Targeted fix: 3 new call features from July 22 data ===\n");
  console.log(`Features: ${TARGET_FEATURES.join(", ")}\n`);

  // Step 1: Snapshot current scores for these 3 features
  const before = await sql`
    SELECT brand_name, feature_id, score, score_band, scored_at
    FROM sales_feature_scores
    WHERE feature_id = ANY(${TARGET_FEATURES})
    ORDER BY feature_id, brand_name
  `;
  console.log("BEFORE (current damaged scores):");
  for (const r of before) {
    console.log(`  ${r.brand_name} / ${r.feature_id}: score=${r.score ?? "null"} (${r.score_band ?? "null"})  scored_at=${r.scored_at}`);
  }
  console.log();

  // Step 2: Snapshot scored_at for all OTHER rows (to verify none change)
  const otherBefore = await sql`
    SELECT brand_name, feature_id, scored_at
    FROM sales_feature_scores
    WHERE feature_id != ALL(${TARGET_FEATURES})
    ORDER BY feature_id, brand_name
  `;
  const otherCount = otherBefore.length;
  console.log(`Other rows in sales_feature_scores (should stay untouched): ${otherCount}\n`);

  // Step 3: Fetch July 22 responses for ONLY the 3 target features
  const rows = await sql`
    SELECT brand_name, feature_id, feature_tag, model,
           has_capability, evidence, confidence, parse_error,
           COALESCE(grounded, FALSE) AS grounded
    FROM sales_feature_responses
    WHERE run_date = '2026-07-22'
      AND feature_id = ANY(${TARGET_FEATURES})
    ORDER BY brand_name, feature_id, model, grounded ASC, run_number
  `;
  console.log(`July 22 responses for target features: ${rows.length}`);

  if (rows.length === 0) {
    console.error("No July 22 responses found — aborting.");
    process.exit(1);
  }

  // Step 4: Group by brand+feature
  const groups = new Map<string, FeatureRunRow[]>();
  for (const r of rows) {
    const key = `${r.brand_name}::${r.feature_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r as FeatureRunRow);
  }
  console.log(`Groups: ${groups.size}\n`);

  // Step 5: Score and upsert — ONLY these brand+feature combos
  const SCORED_AT = "2026-07-22 10:05:48"; // same timestamp as original July 22 run
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
         ${result.grounded_source ?? false}, ${SCORED_AT})
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
  console.log(`Upserted ${scored} rows.\n`);

  // Step 6: Show after scores
  const after = await sql`
    SELECT brand_name, feature_id, score, score_band, scored_at
    FROM sales_feature_scores
    WHERE feature_id = ANY(${TARGET_FEATURES})
    ORDER BY feature_id, brand_name
  `;
  console.log("AFTER (fixed scores):");
  const beforeMap = new Map(before.map(r => [`${r.brand_name}::${r.feature_id}`, r]));
  for (const r of after) {
    const prev = beforeMap.get(`${r.brand_name}::${r.feature_id}`);
    const changed = prev?.score !== r.score ? " ← CHANGED" : "";
    console.log(`  ${r.brand_name} / ${r.feature_id}: score=${r.score ?? "null"} (${r.score_band ?? "null"})${changed}`);
  }
  console.log();

  // Step 7: Verify other 191 rows unchanged
  const otherAfter = await sql`
    SELECT brand_name, feature_id, scored_at
    FROM sales_feature_scores
    WHERE feature_id != ALL(${TARGET_FEATURES})
    ORDER BY feature_id, brand_name
  `;
  let dirty = 0;
  const otherBeforeMap = new Map(otherBefore.map(r => [`${r.brand_name}::${r.feature_id}`, r.scored_at]));
  for (const r of otherAfter) {
    const prevTs = otherBeforeMap.get(`${r.brand_name}::${r.feature_id}`);
    if (String(prevTs) !== String(r.scored_at)) {
      console.error(`  TOUCHED: ${r.brand_name} / ${r.feature_id}  before=${prevTs}  after=${r.scored_at}`);
      dirty++;
    }
  }
  if (dirty === 0) {
    console.log(`✓ All ${otherCount} other rows untouched (scored_at unchanged).`);
  } else {
    console.error(`✗ ${dirty} rows unexpectedly modified!`);
  }

  // Step 8: Verify Clari/pipeline_forecasting
  const clari = await sql`
    SELECT score, score_band, scored_at
    FROM sales_feature_scores
    WHERE brand_name = 'Clari' AND feature_id = 'pipeline_forecasting'
  `;
  const c = clari[0];
  const ok = c?.score === 90 ? "✓" : "✗";
  console.log(`\n${ok} Clari / pipeline_forecasting: score=${c?.score}  band=${c?.score_band}  scored_at=${c?.scored_at}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
