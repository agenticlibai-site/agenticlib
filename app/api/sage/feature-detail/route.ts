import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brandName = searchParams.get("brand")      ?? "";
  const featureId = searchParams.get("feature_id") ?? "";
  const domain    = searchParams.get("domain")     ?? "marketing";

  if (!brandName || !featureId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }
  if (!["sales", "marketing"].includes(domain)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  try {
    let modelRows, historyRows;

    if (domain === "sales") {
      const m = await sql`
        SELECT
          model,
          ROUND(AVG(
            CASE has_capability
              WHEN 'yes'     THEN 100
              WHEN 'partial' THEN 50
              WHEN 'no'      THEN 0
              ELSE NULL
            END
          ))::int AS model_score
        FROM sales_feature_responses
        WHERE brand_name  = ${brandName}
          AND feature_id  = ${featureId}
          AND parse_error = false
          AND has_capability IS NOT NULL
          AND has_capability != 'not_documented'
        GROUP BY model
        ORDER BY model
      `;
      modelRows = m.rows;

      const h = await sql`
        SELECT
          DATE_TRUNC('week', run_date)::date::text AS week,
          ROUND(AVG(
            CASE has_capability
              WHEN 'yes'     THEN 100
              WHEN 'partial' THEN 50
              WHEN 'no'      THEN 0
              ELSE NULL
            END
          ))::int AS score
        FROM sales_feature_responses
        WHERE brand_name  = ${brandName}
          AND feature_id  = ${featureId}
          AND parse_error = false
          AND has_capability IS NOT NULL
          AND has_capability != 'not_documented'
        GROUP BY DATE_TRUNC('week', run_date)
        ORDER BY DATE_TRUNC('week', run_date)
        LIMIT 8
      `;
      historyRows = h.rows;
    } else {
      const m = await sql`
        SELECT
          model,
          ROUND(AVG(
            CASE has_capability
              WHEN 'yes'     THEN 100
              WHEN 'partial' THEN 50
              WHEN 'no'      THEN 0
              ELSE NULL
            END
          ))::int AS model_score
        FROM feature_responses
        WHERE brand_name  = ${brandName}
          AND feature_id  = ${featureId}
          AND parse_error = false
          AND has_capability IS NOT NULL
          AND has_capability != 'not_documented'
        GROUP BY model
        ORDER BY model
      `;
      modelRows = m.rows;

      const h = await sql`
        SELECT
          DATE_TRUNC('week', run_date)::date::text AS week,
          ROUND(AVG(
            CASE has_capability
              WHEN 'yes'     THEN 100
              WHEN 'partial' THEN 50
              WHEN 'no'      THEN 0
              ELSE NULL
            END
          ))::int AS score
        FROM feature_responses
        WHERE brand_name  = ${brandName}
          AND feature_id  = ${featureId}
          AND parse_error = false
          AND has_capability IS NOT NULL
          AND has_capability != 'not_documented'
        GROUP BY DATE_TRUNC('week', run_date)
        ORDER BY DATE_TRUNC('week', run_date)
        LIMIT 8
      `;
      historyRows = h.rows;
    }

    return NextResponse.json({
      modelScores: modelRows   as { model: string; model_score: number | null }[],
      history:     historyRows as { week: string; score: number | null }[],
    });
  } catch (err) {
    console.error("feature-detail error:", err);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}
