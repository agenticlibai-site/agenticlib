import { neonConfig, neon } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;

const sql = neon(process.env.PGURL!);
const rows = await sql`
  SELECT brand_name, score, score_band, flagged_for_review, LEFT(evidence, 500) AS evidence
  FROM sales_feature_scores
  WHERE feature_id = 'outreach_sequencing'
  ORDER BY score DESC NULLS LAST
`;

console.log(`sales_feature_scores | outreach_sequencing | Total: ${rows.length}\n`);
for (const r of rows) {
  const nd = r.score_band === "not_documented" || r.score === null ? " ⚠ NOT_DOCUMENTED" : "";
  const fl = r.flagged_for_review ? " [FLAGGED]" : "";
  console.log(
    String(r.brand_name).padEnd(18),
    "| score:", String(r.score ?? "null").padEnd(4),
    "| band:", String(r.score_band ?? "null").padEnd(16) + nd + fl
  );
  console.log("  evidence:", r.evidence ?? "(none)");
  console.log();
}
