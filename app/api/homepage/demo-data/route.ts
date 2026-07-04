import { sql } from "@vercel/postgres";

export const revalidate = 86400; // re-run at most once per day

const BRANDS_JSON = JSON.stringify([
  "Drift", "Copy.ai", "Conversica", "Writesonic", "Albert",
]);

export async function GET() {
  try {
    const [trendResult, totalsResult, positionsResult] = await Promise.all([
      // 7-day daily trend per brand
      sql`
        SELECT brand, date::text AS date, SUM(mention_count)::int AS mentions
        FROM daily_summary
        WHERE brand = ANY(ARRAY(SELECT jsonb_array_elements_text(${BRANDS_JSON}::jsonb)))
          AND date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY brand, date
        ORDER BY date, brand
      `,
      // Total mentions over 7 days per brand
      sql`
        SELECT brand, SUM(mention_count)::int AS total_mentions
        FROM daily_summary
        WHERE brand = ANY(ARRAY(SELECT jsonb_array_elements_text(${BRANDS_JSON}::jsonb)))
          AND date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY brand
        ORDER BY total_mentions DESC
      `,
      // Average mention position from raw response data
      sql`
        SELECT rcb.canonical_brand AS brand,
               ROUND(AVG(rcb.position)::numeric, 2)::float AS avg_position
        FROM response_canonical_brands rcb
        JOIN raw_responses rr ON rr.id = rcb.response_id
        WHERE rcb.canonical_brand = ANY(ARRAY(SELECT jsonb_array_elements_text(${BRANDS_JSON}::jsonb)))
          AND rr.date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY rcb.canonical_brand
        ORDER BY avg_position ASC
      `,
    ]);

    return Response.json({
      trend:     trendResult.rows,
      totals:    totalsResult.rows,
      positions: positionsResult.rows,
    });
  } catch (err) {
    return Response.json(
      { error: "Failed to load demo data", detail: String(err) },
      { status: 500 },
    );
  }
}
