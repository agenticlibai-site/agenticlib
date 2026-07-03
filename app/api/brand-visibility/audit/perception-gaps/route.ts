import { sql } from "@vercel/postgres";
import { getPerceptionGaps } from "@/lib/brand-visibility/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/brand-visibility/audit/perception-gaps
 *
 * Debug endpoint: runs getPerceptionGaps() and shows raw diagnostics.
 * Auth: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Raw counts to understand what data is available
    const [rcbCount, rrCount, lmaCount, fsCount, tagDist] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM response_canonical_brands`,
      sql`SELECT COUNT(*)::int AS count, COUNT(DISTINCT bucket_tag)::int AS distinct_tags FROM raw_responses WHERE date >= NOW() - INTERVAL '7 days'`,
      sql`SELECT brand_name, dominant_tag FROM locked_marketing_agents ORDER BY dominant_tag, rank`,
      sql`SELECT COUNT(*)::int AS count FROM feature_scores`,
      sql`
        SELECT rr.bucket_tag, COUNT(*)::int AS responses
        FROM raw_responses rr
        WHERE rr.date >= NOW() - INTERVAL '7 days'
        GROUP BY rr.bucket_tag
        ORDER BY rr.bucket_tag
      `,
    ]);

    // All locked brands with their SOV in their own cluster (0 if no appearances)
    const sovRaw = await sql`
      WITH appearances AS (
        SELECT rcb.canonical_brand AS brand_name,
               rr.bucket_tag       AS cluster_tag,
               COUNT(*)            AS cnt
        FROM response_canonical_brands rcb
        JOIN raw_responses rr ON rr.id = rcb.response_id
        WHERE rr.date >= NOW() - INTERVAL '7 days'
        GROUP BY rcb.canonical_brand, rr.bucket_tag
      ),
      cluster_totals AS (
        SELECT cluster_tag, SUM(cnt) AS total FROM appearances GROUP BY cluster_tag
      ),
      brand_sov AS (
        SELECT lma.brand_name, lma.dominant_tag AS cluster_tag,
               COALESCE(a.cnt, 0)::int AS appearances,
               CASE WHEN ct.total > 0
                 THEN ROUND(COALESCE(a.cnt, 0) * 100.0 / ct.total, 1) ELSE 0
               END AS sov_pct
        FROM locked_marketing_agents lma
        LEFT JOIN appearances    a  ON a.brand_name  = lma.brand_name AND a.cluster_tag = lma.dominant_tag
        LEFT JOIN cluster_totals ct ON ct.cluster_tag = lma.dominant_tag
      )
      SELECT * FROM brand_sov ORDER BY cluster_tag, sov_pct ASC
    `;

    // The actual gap function result
    const gaps = await getPerceptionGaps();

    return Response.json({
      diagnostics: {
        response_canonical_brands_total: rcbCount.rows[0].count,
        raw_responses_last7d: rrCount.rows[0].count,
        raw_responses_distinct_tags: rrCount.rows[0].distinct_tags,
        feature_scores_count: fsCount.rows[0].count,
        locked_agents: lmaCount.rows,
        bucket_tag_distribution: tagDist.rows,
      },
      sov_by_brand_in_own_cluster: sovRaw.rows,
      perception_gaps_returned: gaps,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
