#!/usr/bin/env npx tsx
/**
 * Restore sales_feature_scores to values computed from the July 6–12 response window.
 *
 * Background: A scoring cron ran on July 22 using only July 22's responses (GPT-4o-mini only;
 * Claude Haiku stopped collecting after July 13). The single-model path in computeScore
 * is more conservative, so scores that were 90 (strong, dual-model) dropped to 60 (present,
 * GPT-only with hedging downgrade). This script re-scores from the full July 6–12 pool.
 *
 * Usage: npx tsx scripts/restore-scores-july6-12.ts
 */

import { neon } from "@neondatabase/serverless";
import { computeScore, type FeatureRunRow } from "../lib/brand-visibility/sales-features";

const sql = neon(process.env.DATABASE_URL!);

const FROM_DATE = "2026-07-06";
const TO_DATE   = "2026-07-12";

async function main() {
  console.log(`\nRestoring sales_feature_scores from responses in ${FROM_DATE} → ${TO_DATE}\n`);

  // Fetch all responses in the window
  const rows = await sql`
    SELECT brand_name, feature_id, feature_tag, model,
           has_capability, evidence, confidence, parse_error,
           COALESCE(grounded, FALSE) AS grounded
    FROM sales_feature_responses
    WHERE run_date BETWEEN ${FROM_DATE}::date AND ${TO_DATE}::date
    ORDER BY brand_name, feature_id, model, grounded ASC, run_number
  `;

  if (rows.length === 0) {
    console.error("No responses found in window — aborting.");
    process.exit(1);
  }
  console.log(`Found ${rows.length} responses across the window.`);

  // Group by brand+feature
  const groups = new Map<string, FeatureRunRow[]>();
  for (const r of rows) {
    const key = `${r.brand_name}::${r.feature_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r as FeatureRunRow);
  }
  console.log(`Grouped into ${groups.size} brand+feature combinations.\n`);

  let scored = 0, flagged = 0, errors = 0;
  const changes: string[] = [];

  // First, snapshot current scores for comparison
  const currentRows = await sql`
    SELECT brand_name, feature_id, score, score_band, scored_at
    FROM sales_feature_scores
  `;
  const currentMap = new Map(
    currentRows.map((r) => [`${r.brand_name}::${r.feature_id}`, r])
  );

  for (const [key, runRows] of groups) {
    const [brand_name, feature_id] = key.split("::");
    const feature_tag = runRows[0].feature_tag;

    try {
      const result = computeScore(runRows);

      const prev = currentMap.get(key);
      if (prev && prev.score !== result.score) {
        changes.push(
          `  ${brand_name} / ${feature_id}: ${prev.score ?? "null"} (${prev.score_band ?? "?"}) → ${result.score ?? "null"} (${result.score_band})`
        );
      }

      await sql`
        INSERT INTO sales_feature_scores
          (brand_name, feature_id, feature_tag, score, score_band,
           runs_agreeing, runs_total, flagged_for_review, flag_reason, notes,
           grounded_source, scored_at)
        VALUES
          (${brand_name}, ${feature_id}, ${feature_tag}, ${result.score},
           ${result.score_band}, ${result.runs_agreeing}, ${result.runs_total},
           ${result.flagged_for_review}, ${result.flag_reason}, ${result.notes},
           ${result.grounded_source ?? false}, NOW())
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
          scored_at          = NOW()
      `;

      scored++;
      if (result.flagged_for_review) flagged++;
    } catch (err) {
      console.error(`  ERROR scoring ${brand_name}/${feature_id}:`, err);
      errors++;
    }
  }

  console.log(`Results:`);
  console.log(`  Scored:  ${scored}`);
  console.log(`  Flagged: ${flagged}`);
  console.log(`  Errors:  ${errors}`);

  if (changes.length > 0) {
    console.log(`\nScores that changed (${changes.length}):`);
    changes.forEach((c) => console.log(c));
  } else {
    console.log(`\nNo score changes — all values already matched the July 6-12 window.`);
  }

  // Verify Clari pipeline_forecasting specifically
  const verify = await sql`
    SELECT score, score_band, scored_at
    FROM sales_feature_scores
    WHERE brand_name = 'Clari' AND feature_id = 'pipeline_forecasting'
  `;
  console.log(`\nVerification — Clari / pipeline_forecasting:`);
  console.log(`  score: ${verify[0]?.score}  band: ${verify[0]?.score_band}  scored_at: ${verify[0]?.scored_at}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
