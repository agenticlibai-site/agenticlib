// scripts/check-togal-scores.ts
// Check Togal.AI feature scores and brand visibility ranking.
// Run: DATABASE_URL=... npx tsx scripts/check-togal-scores.ts

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;

async function main() {
  const sql = neon(DATABASE_URL);

  const scores = await sql`
    SELECT feature_id, feature_tag, score, score_band, flagged_for_review,
           LEFT(evidence, 200) as evidence_snip
    FROM esai_feature_scores
    WHERE brand_name = 'Togal.AI'
    ORDER BY feature_tag, feature_id
  ` as any[];

  console.log("=== TOGAL.AI FEATURE SCORES ===");
  for (const s of scores) {
    console.log(`  [${s.feature_tag}] ${s.feature_id}: score=${s.score} band=${s.score_band}`);
    if (s.evidence_snip) console.log(`    ↳ ${s.evidence_snip}`);
  }
  console.log(`\nTotal features scored: ${scores.length}`);

  const trend = await sql`
    SELECT date::text, cluster_tag, SUM(mention_count)::int as mentions
    FROM esai_daily_summary
    WHERE brand = 'Togal.AI'
    GROUP BY date, cluster_tag
    ORDER BY date, cluster_tag
  ` as any[];
  console.log("\n=== TOGAL.AI DAILY MENTIONS BY CLUSTER ===");
  for (const t of trend) {
    console.log(`  ${t.date} [${t.cluster_tag}]: ${t.mentions}`);
  }

  const rank = await sql`
    SELECT brand, SUM(mention_count)::int as total
    FROM esai_daily_summary
    WHERE cluster_tag = 'esai-overall'
    GROUP BY brand
    ORDER BY total DESC
    LIMIT 25
  ` as any[];
  console.log("\n=== OVERALL BRAND RANKINGS (top 25, esai-overall) ===");
  rank.forEach((r: any, i: number) => console.log(`  ${i+1}. ${r.brand}: ${r.total}`));
}

main().catch(console.error);
