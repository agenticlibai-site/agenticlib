import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

// 1. All feature scores referenced in narrative prose
const CHECKS = [
  { brand: "Highspot",     feature: "sales_content_delivery" },
  { brand: "Mindtickle",  feature: "sales_content_delivery" }, // "highest in cluster" claim
  { brand: "6sense",      feature: "deal_risk_detection"    },
  { brand: "6sense",      feature: "pipeline_forecasting"   },
  { brand: "Backstory.ai",feature: "crm_auto_update"        },
];

console.log("=== Feature score cross-check ===");
for (const { brand, feature } of CHECKS) {
  const rows = await sql`
    SELECT score, score_band, flag_reason
    FROM sales_feature_scores
    WHERE brand_name = ${brand} AND feature_id = ${feature}
  `;
  const r = rows[0];
  console.log(`${brand} / ${feature}: score=${r?.score ?? "NULL"} band=${r?.score_band ?? "-"} flag=${r?.flag_reason ?? "-"}`);
}

// 2. Current sentiment percentages for Highspot, 6sense (and all brands
//    to check "highest sentiment of all brands" superlative for Highspot)
console.log("\n=== Sentiment scores (current, from sales_sentiment_scores) ===");
// First peek at columns
const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='sales_sentiment_scores' ORDER BY ordinal_position`;
console.log("  columns:", cols.map(c=>c.column_name).join(", "));

// Get the most recent week_start for sentiment
const weekRows = await sql`SELECT DISTINCT week_start FROM sales_sentiment_scores ORDER BY week_start DESC LIMIT 3`;
console.log("  available week_starts:", weekRows.map(r=>r.week_start).join(", "));

const latestWeek = weekRows[0]?.week_start;
const sent = await sql`
  SELECT brand_name, positive_count, neutral_count, negative_count, total_count, bucket_tag
  FROM sales_sentiment_scores
  WHERE brand_name != 'Drift' AND week_start = ${latestWeek}
  ORDER BY (positive_count::float / NULLIF(total_count,0)) DESC
`;
for (const r of sent) {
  const pct = r.total_count > 0 ? Math.round((r.positive_count / r.total_count) * 100) : null;
  console.log(`  ${r.brand_name} [${r.bucket_tag}]: ${pct}% positive (${r.positive_count}/${r.total_count})`);
}

// 3. Mention totals for Backstory.ai and 6sense (locked window)
console.log("\n=== Daily mention totals (locked window Jul 6-12) ===");
const mentions = await sql`
  SELECT brand_name, SUM(mention_count) as total, COUNT(DISTINCT date) as days
  FROM sales_daily_summary
  WHERE brand_name IN ('Backstory.ai','6sense')
    AND date >= '2026-07-06' AND date <= '2026-07-12'
  GROUP BY brand_name ORDER BY brand_name
`;
for (const r of mentions) {
  console.log(`  ${r.brand_name}: ${r.total} mentions over ${r.days} days`);
}

// 4. SOV check — columns for sales_daily_summary
const dcols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='sales_daily_summary' ORDER BY ordinal_position`;
console.log("\n  sales_daily_summary columns:", dcols.map(c=>c.column_name).join(", "));

// 5. Check if there's a SOV column or a separate table for cluster mentions
// The "9 discovery mentions in the Deal Risk & Pipeline Forecasting cluster" claim
// comes from total_appearances in SOV or from cluster-filtered daily_summary
const clustMentions = await sql`
  SELECT brand_name, bucket_tag, SUM(total_appearances) as total
  FROM sales_daily_summary
  WHERE brand_name = '6sense'
    AND date >= '2026-07-06' AND date <= '2026-07-12'
  GROUP BY brand_name, bucket_tag
  ORDER BY bucket_tag
`;
console.log("\n=== 6sense SOV by cluster (locked window) ===");
for (const r of clustMentions) {
  console.log(`  ${r.brand_name} / ${r.bucket_tag}: ${r.total}`);
}
if (clustMentions.length === 0) {
  // Try without bucket_tag
  const total6 = await sql`
    SELECT SUM(mention_count) as total FROM sales_daily_summary
    WHERE brand_name='6sense' AND date>='2026-07-06' AND date<='2026-07-12'
  `;
  console.log(`  6sense total all clusters: ${total6[0]?.total}`);
}
