#!/usr/bin/env npx tsx
/**
 * Full sweep of all rows written by the July 6-12 restore script (scored_at ~ 04:46:xx).
 * For each, compute what July 22 data would score. If July 22 is higher (Claude was
 * conservative in July 6-12, GPT was confident on July 22), fix it.
 * Leaves every other row untouched.
 */

import { neon } from "@neondatabase/serverless";
import { computeScore, type FeatureRunRow } from "../lib/brand-visibility/sales-features";

const sql = neon(process.env.DATABASE_URL!);

const RESTORE_SCORED_AT_PREFIX = "2026-07-23 04:46"; // all rows from the restore script
const JULY22_SCORED_AT = "2026-07-22 10:05:48";      // stamp used for targeted fixes

async function main() {
  console.log("=== Full sweep: July 6-12 restore rows vs July 22 re-score ===\n");

  // Step 1: All rows written by the restore script
  const restoreRows = await sql`
    SELECT brand_name, feature_id, feature_tag, score, score_band, scored_at
    FROM sales_feature_scores
    WHERE scored_at::text LIKE ${RESTORE_SCORED_AT_PREFIX + "%"}
    ORDER BY brand_name, feature_id
  `;
  console.log(`Rows from July 6-12 restore: ${restoreRows.length}\n`);

  // Step 2: Fetch ALL July 22 responses for these brand+feature combos in one query
  const brandFeaturePairs = restoreRows.map(r => `${r.brand_name}::${r.feature_id}`);
  const brands = [...new Set(restoreRows.map(r => r.brand_name as string))];
  const features = [...new Set(restoreRows.map(r => r.feature_id as string))];

  const july22Responses = await sql`
    SELECT brand_name, feature_id, feature_tag, model,
           has_capability, evidence, confidence, parse_error,
           COALESCE(grounded, FALSE) AS grounded
    FROM sales_feature_responses
    WHERE run_date = '2026-07-22'
      AND brand_name = ANY(${brands})
      AND feature_id = ANY(${features})
    ORDER BY brand_name, feature_id, model, grounded ASC, run_number
  `;
  console.log(`July 22 responses fetched: ${july22Responses.length}\n`);

  // Group July 22 responses by brand+feature
  const july22Groups = new Map<string, FeatureRunRow[]>();
  for (const r of july22Responses) {
    const key = `${r.brand_name}::${r.feature_id}`;
    if (brandFeaturePairs.includes(key)) {
      if (!july22Groups.has(key)) july22Groups.set(key, []);
      july22Groups.get(key)!.push(r as FeatureRunRow);
    }
  }

  // Step 3: Compare scores
  const toFix: Array<{ brand_name: string; feature_id: string; feature_tag: string; currentScore: number | null; currentBand: string; july22Score: number | null; july22Band: string }> = [];
  const noChange: string[] = [];
  const noJuly22Data: string[] = [];

  for (const row of restoreRows) {
    const key = `${row.brand_name}::${row.feature_id}`;
    const july22Rows = july22Groups.get(key);

    if (!july22Rows || july22Rows.length === 0) {
      noJuly22Data.push(`  ${row.brand_name} / ${row.feature_id}: no July 22 data`);
      continue;
    }

    const july22Result = computeScore(july22Rows);
    const currentScore = row.score as number | null;
    const july22Score = july22Result.score;

    if (july22Score !== null && (currentScore === null || july22Score > currentScore)) {
      toFix.push({
        brand_name: row.brand_name as string,
        feature_id: row.feature_id as string,
        feature_tag: (july22Rows[0].feature_tag ?? row.feature_tag) as string,
        currentScore,
        currentBand: row.score_band as string,
        july22Score,
        july22Band: july22Result.score_band,
      });
    } else {
      noChange.push(`  ${row.brand_name} / ${row.feature_id}: current=${currentScore ?? "null"} (${row.score_band}), July22=${july22Score ?? "null"} — no change needed`);
    }
  }

  console.log(`Rows to fix (July 22 score > current): ${toFix.length}`);
  console.log(`Rows already correct (July 6-12 dual-model was better or equal): ${noChange.length}`);
  console.log(`Rows with no July 22 data: ${noJuly22Data.length}\n`);

  if (toFix.length > 0) {
    console.log("AFFECTED ROWS (will be re-scored from July 22):");
    for (const f of toFix) {
      console.log(`  ${f.brand_name} / ${f.feature_id}: ${f.currentScore ?? "null"} (${f.currentBand}) → ${f.july22Score} (${f.july22Band})`);
    }
    console.log();
  }

  if (noChange.length > 0) {
    console.log("UNCHANGED ROWS (July 6-12 dual-model correctly scored these):");
    noChange.forEach(l => console.log(l));
    console.log();
  }

  if (noJuly22Data.length > 0) {
    console.log("NO JULY 22 DATA:");
    noJuly22Data.forEach(l => console.log(l));
    console.log();
  }

  if (toFix.length === 0) {
    console.log("Nothing to fix — all restore-script rows are correctly scored.");
    return;
  }

  // Step 4: Apply fixes
  console.log(`\nApplying ${toFix.length} fixes from July 22 data...`);
  let fixed = 0;
  for (const f of toFix) {
    const key = `${f.brand_name}::${f.feature_id}`;
    const july22Rows = july22Groups.get(key)!;
    const result = computeScore(july22Rows);

    await sql`
      INSERT INTO sales_feature_scores
        (brand_name, feature_id, feature_tag, score, score_band,
         runs_agreeing, runs_total, flagged_for_review, flag_reason, notes,
         grounded_source, scored_at)
      VALUES
        (${f.brand_name}, ${f.feature_id}, ${f.feature_tag}, ${result.score},
         ${result.score_band}, ${result.runs_agreeing}, ${result.runs_total},
         ${result.flagged_for_review}, ${result.flag_reason}, ${result.notes},
         ${result.grounded_source ?? false}, ${JULY22_SCORED_AT})
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
    fixed++;
  }
  console.log(`Fixed ${fixed} rows.\n`);

  // Step 5: Verify — show final scored_at distribution
  const finalDist = await sql`
    SELECT
      CASE
        WHEN scored_at::text LIKE '2026-07-22%' THEN 'July-22-sourced (fixed from July22 data)'
        WHEN scored_at::text LIKE '2026-07-23 04:46%' THEN 'July-6-12-restore (dual-model correct)'
        ELSE scored_at::text
      END AS category,
      COUNT(*) AS rows
    FROM sales_feature_scores
    GROUP BY 1
    ORDER BY rows DESC
  `;
  console.log("Final scored_at distribution:");
  for (const r of finalDist) {
    console.log(`  ${r.category}: ${r.rows} rows`);
  }

  // Step 6: Spot-check the 3 known affected rows
  console.log("\nSpot-check (Clari + 6sense pipeline/deal_risk):");
  const check = await sql`
    SELECT brand_name, feature_id, score, score_band, scored_at
    FROM sales_feature_scores
    WHERE brand_name IN ('Clari','6sense')
      AND feature_id IN ('deal_risk_detection','pipeline_forecasting')
    ORDER BY brand_name, feature_id
  `;
  for (const r of check) {
    console.log(`  ${r.brand_name} / ${r.feature_id}: ${r.score} (${r.score_band})  scored_at=${r.scored_at}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
