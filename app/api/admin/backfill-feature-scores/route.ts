import { sql } from "@vercel/postgres";
import { initRalfiDB, upsertRalfiFeatureScore } from "@/lib/brand-visibility/db";
import { computeRalfiScore } from "@/lib/brand-visibility/ralfi-features";

export const dynamic     = "force-dynamic";
export const maxDuration = 120;

const TOKEN = "ralfi-feat-2026";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== TOKEN) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await initRalfiDB();

  const { rows } = await sql`
    SELECT brand_name, feature_id, feature_tag, model,
           has_capability, evidence, confidence, parse_error,
           COALESCE(grounded, FALSE) AS grounded
    FROM ralfi_feature_responses
    WHERE parse_error = false
    ORDER BY brand_name, feature_id, model, grounded ASC, run_number
  `;

  type Row = { brand_name: string; feature_id: string; feature_tag: string; model: string; has_capability: string | null; evidence: string | null; confidence: string | null; parse_error: boolean; grounded: boolean };
  const groups = new Map<string, Row[]>();
  for (const r of rows as Row[]) {
    const key = `${r.brand_name}::${r.feature_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  let scored = 0;
  for (const [key, groupRows] of groups) {
    const [brand_name, feature_id] = key.split("::");
    try {
      const result = computeRalfiScore(groupRows);
      await upsertRalfiFeatureScore({ brand_name, feature_id, feature_tag: groupRows[0].feature_tag, ...result });
      scored++;
    } catch { /* skip */ }
  }

  const { rows: summary } = await sql`
    SELECT COUNT(*)::int AS with_scores FROM ralfi_feature_scores WHERE score IS NOT NULL
  `;
  const { rows: breakdown } = await sql`
    SELECT feature_id, brand_name, score, score_band
    FROM ralfi_feature_scores WHERE score IS NOT NULL
    ORDER BY feature_id, score DESC
  `;

  return Response.json({ status: "done", scored, scores_with_values: summary[0].with_scores, breakdown });
}
