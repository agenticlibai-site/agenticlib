import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const rows = await sql`
    SELECT feature_id,
      ROUND(AVG(score)::numeric,1) AS avg_score,
      ROUND(STDDEV(score)::numeric,1) AS stddev,
      COUNT(*) FILTER (WHERE score >= 90) AS at_ceiling,
      COUNT(*) FILTER (WHERE score <= 35) AS at_floor,
      COUNT(DISTINCT brand_name) AS brands,
      COUNT(*) AS total,
      STRING_AGG(DISTINCT score::text, ', ' ORDER BY score::text) AS distinct_scores
    FROM feature_scores
    WHERE feature_id IN (
      'audit_log_change_tracking','budget_pacing_allocation','webhook_support','sso_enterprise_auth',
      'tech_integrations','rai_data_privacy','roi_attribution',
      'leadgen_outreach_sequencing','leadgen_qualification','content_brand_voice'
    )
    GROUP BY feature_id
    ORDER BY stddev ASC NULLS FIRST, avg_score DESC
  `;
  console.log("feature_id | avg | stddev | at_ceil | at_floor | brands | total | distinct_scores");
  console.log("-----------|-----|--------|---------|----------|--------|-------|----------------");
  for (const r of rows) {
    console.log(`${r.feature_id} | ${r.avg_score} | ${r.stddev ?? "NULL"} | ${r.at_ceiling} | ${r.at_floor} | ${r.brands} | ${r.total} | ${r.distinct_scores}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
