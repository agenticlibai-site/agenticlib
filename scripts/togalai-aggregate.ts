// scripts/togalai-aggregate.ts
// Replicates esai-feature-aggregate logic locally for Togal.AI.
// Finds the most recent run_date in esai_feature_responses for Togal.AI,
// computes consensus scores, and upserts into esai_feature_scores.
// Run with: npx tsx scripts/togalai-aggregate.ts

import { neon } from "@neondatabase/serverless";
import { computeEsaiScore } from "../lib/brand-visibility/esai-features";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

const BRAND = "Togal.AI";

async function main() {
  // Find the most recent run_date for Togal.AI
  // neon() template literals return rows[] directly (not { rows: [...] })
  const dateRows = await sql`
    SELECT MAX(run_date)::text AS max_date
    FROM esai_feature_responses
    WHERE brand_name = ${BRAND}
  ` as { max_date: string | null }[];
  const runDate: string | null = dateRows[0]?.max_date ?? null;

  if (!runDate) {
    console.error(`No esai_feature_responses found for ${BRAND}`);
    process.exit(1);
  }
  console.log(`Using run_date = ${runDate} for ${BRAND}`);

  // Fetch all responses for that date
  const responses = await sql`
    SELECT brand_name, feature_id, feature_tag, has_capability, confidence, evidence, parse_error, grounded
    FROM esai_feature_responses
    WHERE run_date = ${runDate}::date
      AND brand_name = ${BRAND}
    ORDER BY feature_id
  ` as {
    brand_name: string; feature_id: string; feature_tag: string;
    has_capability: string | null; confidence: string | null;
    evidence: string | null; parse_error: boolean; grounded: boolean;
  }[];

  if (responses.length === 0) {
    console.error(`No responses found for ${BRAND} on ${runDate}`);
    process.exit(1);
  }
  console.log(`Found ${responses.length} response rows for ${BRAND} on ${runDate}`);

  // Group by feature_id
  const grouped = new Map<string, typeof responses>();
  for (const row of responses) {
    if (!grouped.has(row.feature_id)) grouped.set(row.feature_id, []);
    grouped.get(row.feature_id)!.push(row);
  }
  console.log(`${grouped.size} distinct features to score\n`);

  let scored = 0, flagged = 0;
  for (const [featureId, runs] of grouped) {
    const featureTag = runs[0]?.feature_tag ?? "esai-unknown";
    const { score, score_band, runs_agreeing, runs_total, flag_for_review, flag_reason } = computeEsaiScore(runs);

    await sql`
      INSERT INTO esai_feature_scores
        (brand_name, feature_id, feature_tag, score, score_band,
         runs_agreeing, runs_total, flagged_for_review, flag_reason, notes, grounded_source)
      VALUES
        (${BRAND}, ${featureId}, ${featureTag},
         ${score}, ${score_band ?? "absent"},
         ${runs_agreeing ?? null}, ${runs_total},
         ${flag_for_review}, ${flag_reason ?? null}, ${null},
         ${runs.some(r => r.grounded)})
      ON CONFLICT (brand_name, feature_id) DO UPDATE SET
        score             = EXCLUDED.score,
        score_band        = EXCLUDED.score_band,
        runs_agreeing     = EXCLUDED.runs_agreeing,
        runs_total        = EXCLUDED.runs_total,
        flagged_for_review = EXCLUDED.flagged_for_review,
        flag_reason       = EXCLUDED.flag_reason,
        grounded_source   = EXCLUDED.grounded_source,
        scored_at         = NOW()
    `;

    const bandLabel = score_band ?? "absent";
    const flag = flag_for_review ? " ⚑" : "";
    console.log(`  ${featureId.padEnd(36)} score=${String(score ?? "null").padStart(3)}  band=${bandLabel.padEnd(8)}  runs=${runs_agreeing}/${runs_total}${flag}`);
    scored++;
    if (flag_for_review) flagged++;
  }

  console.log(`\nDone — scored ${scored} features, ${flagged} flagged for review.`);
}

main().catch(err => { console.error(err); process.exit(1); });
