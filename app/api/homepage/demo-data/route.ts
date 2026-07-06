import { sql } from "@vercel/postgres";

export const revalidate = 86400;

const DEMO_BRANDS_JSON = JSON.stringify([
  "Drift", "Copy.ai", "Conversica", "Writesonic", "Albert",
]);

function sovQuery(bucketTag: string) {
  return sql`
    WITH ranked AS (
      SELECT
        rcb.canonical_brand                                                    AS brand,
        COUNT(*)::int                                                          AS appearances,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1)::float             AS sov_pct,
        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC)                             AS rn
      FROM response_canonical_brands rcb
      JOIN raw_responses            rr  ON rr.id  = rcb.response_id
      JOIN locked_marketing_agents  lma ON lma.brand_name = rcb.canonical_brand
      WHERE rr.bucket_tag = ${bucketTag}
        AND rr.date >= CURRENT_DATE - INTERVAL '7 days'
        AND rr.date < CURRENT_DATE
      GROUP BY rcb.canonical_brand
    )
    SELECT
      CASE WHEN rn <= 4 THEN brand ELSE 'Other' END AS brand,
      SUM(appearances)::int                          AS appearances,
      ROUND(SUM(sov_pct)::numeric, 1)::float         AS sov_pct
    FROM ranked
    GROUP BY CASE WHEN rn <= 4 THEN brand ELSE 'Other' END
    ORDER BY SUM(appearances) DESC
  `;
}

export async function GET() {
  try {
    const [
      trendResult,
      totalsResult,
      positionsResult,
      allTotalsCurrentResult,
      allTotalsPriorResult,
      adsSOVResult,
      contentSOVResult,
      leadgenSOVResult,
      lifecycleSOVResult,
    ] = await Promise.all([

      // 7-day daily trend (5 demo brands — for the line chart)
      sql`
        SELECT brand, date::text AS date, SUM(mention_count)::int AS mentions
        FROM daily_summary
        WHERE brand = ANY(ARRAY(SELECT jsonb_array_elements_text(${DEMO_BRANDS_JSON}::jsonb)))
          AND date >= CURRENT_DATE - INTERVAL '7 days'
          AND date < CURRENT_DATE
        GROUP BY brand, date
        ORDER BY date, brand
      `,

      // Total mentions last 7 days (5 demo brands — for the right-side stat card)
      sql`
        SELECT brand, SUM(mention_count)::int AS total_mentions
        FROM daily_summary
        WHERE brand = ANY(ARRAY(SELECT jsonb_array_elements_text(${DEMO_BRANDS_JSON}::jsonb)))
          AND date >= CURRENT_DATE - INTERVAL '7 days'
          AND date < CURRENT_DATE
        GROUP BY brand
        ORDER BY total_mentions DESC
      `,

      // Avg position last 7 days (5 demo brands — for the right-side stat card)
      sql`
        SELECT rcb.canonical_brand AS brand,
               ROUND(AVG(rcb.position)::numeric, 2)::float AS avg_position
        FROM response_canonical_brands rcb
        JOIN raw_responses rr ON rr.id = rcb.response_id
        WHERE rcb.canonical_brand = ANY(ARRAY(SELECT jsonb_array_elements_text(${DEMO_BRANDS_JSON}::jsonb)))
          AND rr.date >= CURRENT_DATE - INTERVAL '7 days'
          AND rr.date < CURRENT_DATE
        GROUP BY rcb.canonical_brand
        ORDER BY avg_position ASC
      `,

      // ALL locked brands — current week total mentions (for "TOTAL BRAND MENTIONS" stat card)
      sql`
        SELECT COALESCE(SUM(ds.mention_count), 0)::int AS total_mentions
        FROM daily_summary ds
        JOIN locked_marketing_agents lma ON lma.brand_name = ds.brand
        WHERE ds.date >= CURRENT_DATE - INTERVAL '7 days'
          AND ds.date < CURRENT_DATE
      `,

      // ALL locked brands — prior week total mentions (for % change)
      sql`
        SELECT COALESCE(SUM(ds.mention_count), 0)::int AS prior_mentions
        FROM daily_summary ds
        JOIN locked_marketing_agents lma ON lma.brand_name = ds.brand
        WHERE ds.date >= CURRENT_DATE - INTERVAL '14 days'
          AND ds.date  < CURRENT_DATE - INTERVAL '7 days'
      `,

      // Use Case SOV — 4 clusters
      sovQuery("ads"),
      sovQuery("content"),
      sovQuery("lead-gen"),
      sovQuery("lifecycle"),
    ]);

    const totalMentions = (allTotalsCurrentResult.rows[0] as { total_mentions: number })?.total_mentions ?? 0;
    const priorMentions = (allTotalsPriorResult.rows[0] as { prior_mentions: number })?.prior_mentions ?? 0;

    return Response.json({
      trend:         trendResult.rows,
      totals:        totalsResult.rows,
      positions:     positionsResult.rows,
      totalMentions,
      priorMentions,
      sovAds:        adsSOVResult.rows,
      sovContent:    contentSOVResult.rows,
      sovLeadgen:    leadgenSOVResult.rows,
      sovLifecycle:  lifecycleSOVResult.rows,
    });
  } catch (err) {
    return Response.json(
      { error: "Failed to load demo data", detail: String(err) },
      { status: 500 },
    );
  }
}
