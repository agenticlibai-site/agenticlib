import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";

/**
 * GET /api/brand-visibility/audit/perception-gaps
 *
 * Shows the full brand_sov table (all locked brands, all clusters) with
 * sov_pct, mention_count, cluster_rank — before the < 3% / > 10 / rank <= 5
 * filters are applied, so we can verify the conditions are working correctly.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Step 1 — raw_responses bucket_tag distribution for Persado
    const persadoRaw = await sql`
      SELECT rr.bucket_tag, COUNT(*)::int AS row_count
      FROM raw_responses rr
      WHERE EXISTS (
        SELECT 1 FROM response_canonical_brands rcb
        WHERE rcb.response_id = rr.id AND rcb.canonical_brand = 'Persado'
      )
      GROUP BY rr.bucket_tag
      ORDER BY row_count DESC
    `;

    // Step 2 — locked_marketing_agents for Persado and Phrasee
    const lockedCheck = await sql`
      SELECT brand_name, dominant_tag
      FROM locked_marketing_agents
      WHERE brand_name IN ('Persado', 'Phrasee')
      ORDER BY brand_name
    `;

    const full = await sql`
      WITH locked_appearances AS (
        SELECT rcb.canonical_brand AS brand_name,
               rr.bucket_tag       AS cluster_tag,
               COUNT(*)            AS cnt
        FROM response_canonical_brands rcb
        JOIN raw_responses rr            ON rr.id = rcb.response_id
        JOIN locked_marketing_agents lma ON lma.brand_name = rcb.canonical_brand
        WHERE rr.date >= NOW() - INTERVAL '7 days'
        GROUP BY rcb.canonical_brand, rr.bucket_tag
      ),
      cluster_totals AS (
        SELECT cluster_tag, SUM(cnt) AS total FROM locked_appearances GROUP BY cluster_tag
      ),
      total_mentions AS (
        SELECT brand, SUM(mention_count)::int AS mention_count
        FROM daily_summary
        WHERE date >= NOW() - INTERVAL '7 days'
        GROUP BY brand
      ),
      brand_sov AS (
        SELECT lma.brand_name,
               lma.display_name,
               lma.dominant_tag                                   AS cluster_tag,
               COALESCE(la.cnt, 0)::int                          AS cluster_appearances,
               CASE WHEN ct.total > 0
                 THEN ROUND(COALESCE(la.cnt, 0) * 100.0 / ct.total, 1)
                 ELSE 0
               END                                                AS sov_pct,
               RANK() OVER (
                 PARTITION BY lma.dominant_tag
                 ORDER BY COALESCE(la.cnt, 0) DESC
               )                                                  AS cluster_rank,
               COALESCE(tm.mention_count, 0)                     AS mention_count
        FROM locked_marketing_agents lma
        LEFT JOIN locked_appearances la ON la.brand_name  = lma.brand_name
                                        AND la.cluster_tag = lma.dominant_tag
        LEFT JOIN cluster_totals     ct ON ct.cluster_tag  = lma.dominant_tag
        LEFT JOIN total_mentions     tm ON tm.brand         = lma.brand_name
      )
      SELECT brand_name, display_name, cluster_tag,
             sov_pct::float, cluster_appearances, mention_count, cluster_rank::int,
             -- show which conditions pass
             (sov_pct < 3.0)        AS cond_sov,
             (mention_count > 10)   AS cond_mentions,
             (cluster_rank <= 5)    AS cond_rank,
             (sov_pct < 3.0 AND mention_count > 10 AND cluster_rank <= 5) AS would_flag
      FROM brand_sov
      ORDER BY cluster_tag, cluster_rank
    `;

    const flagged = full.rows.filter((r) => r.would_flag);

    return Response.json({
      // Step 1 — raw_responses bucket_tag distribution for Persado
      persado_raw_responses: persadoRaw.rows,
      // Step 2 — locked_marketing_agents for Persado and Phrasee
      locked_agents_check: lockedCheck.rows,
      // Full brand SOV table
      all_brands: full.rows,
      flagged_gaps: flagged,
      flagged_count: flagged.length,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
