import { sql } from "@vercel/postgres";
import { initBrandVisibilityDB } from "@/lib/brand-visibility/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/brand-visibility/audit/stoplist-check
 *
 * Shows canonical_brands entries whose normalized_name exactly matches any
 * term currently in brand_stoplist. These are brands that were auto-created
 * before the stoplist was updated and are now incorrectly present.
 *
 * Returns canonical_id, display_name, normalized_name, and total_occurrence_count
 * (sum of mention_count across all days in daily_summary) for each match.
 *
 * No data is deleted — read-only. Use the results to decide whether to purge
 * via /api/brand-visibility/audit/fix-alias or leave historical rows in place.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initBrandVisibilityDB();

  // Cross-join canonical_brands with brand_stoplist on exact normalized match.
  // Also pulls the current stoplist so the caller can see what was checked against.
  const [contaminated, stoplistRows] = await Promise.all([
    sql`
      SELECT
        cb.id                                       AS canonical_id,
        cb.display_name,
        cb.normalized_name,
        COALESCE(SUM(ds.mention_count), 0)::int     AS total_occurrence_count,
        COUNT(DISTINCT ds.date)::int                AS days_with_data,
        MIN(ds.date::text)                          AS first_seen_in_summary,
        MAX(ds.date::text)                          AS last_seen_in_summary
      FROM canonical_brands cb
      JOIN brand_stoplist sl ON sl.term = cb.normalized_name
      LEFT JOIN daily_summary ds ON ds.brand = cb.display_name
      GROUP BY cb.id, cb.display_name, cb.normalized_name
      ORDER BY total_occurrence_count DESC, cb.display_name ASC
    `,
    sql`SELECT term FROM brand_stoplist ORDER BY term ASC`,
  ]);

  return Response.json({
    contaminated_canonicals: contaminated.rows,
    contaminated_count: contaminated.rows.length,
    total_affected_mentions: contaminated.rows.reduce(
      (sum: number, r: { total_occurrence_count: number }) => sum + r.total_occurrence_count,
      0,
    ),
    stoplist_term_count: stoplistRows.rows.length,
    note: contaminated.rows.length === 0
      ? "No contaminated canonicals found — either no data collected yet, or all stoplisted terms were already present when collection ran."
      : `${contaminated.rows.length} canonical(s) match stoplisted terms. Review before purging — POST to /api/brand-visibility/audit/purge-canonical to remove one.`,
  });
}
