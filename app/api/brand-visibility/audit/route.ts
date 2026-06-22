import { sql } from "@vercel/postgres";
import { initBrandVisibilityDB } from "@/lib/brand-visibility/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/brand-visibility/audit
 *
 * Returns two audit views needed after each day's cron run:
 *
 * 1. review_queue — entries created today (or a custom date via ?date=YYYY-MM-DD).
 *    Catches new unknown brands and normalization bugs before end of week.
 *    Columns: raw_name, suggested_canonical, levenshtein_dist, occurrence_count, first_seen, reviewed
 *
 * 2. alias_map — full brand_aliases table joined to canonical_brands, sorted by
 *    canonical_id then raw_name. Use this to spot-check for incorrect fuzzy merges —
 *    two different brands that landed on the same canonical because they happened to
 *    be within Levenshtein ≤2 of each other.
 *    Columns: canonical_id, canonical_display_name, canonical_normalized_name, raw_alias, alias_created_at
 *
 * Auth: same CRON_SECRET bearer token used by the cron jobs.
 */
export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initBrandVisibilityDB();

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const [reviewQueueResult, aliasMapResult] = await Promise.all([
    // ── Audit 1: review queue for today (or ?date=) ──────────────────────────
    // Ordered by occurrence_count DESC so the noisiest unknown brands surface first.
    sql`
      SELECT
        raw_name,
        suggested_canonical,
        levenshtein_dist,
        occurrence_count,
        first_seen::text   AS first_seen,
        reviewed
      FROM brand_review_queue
      WHERE first_seen = ${dateParam}::date
      ORDER BY occurrence_count DESC, raw_name ASC
    `,

    // ── Audit 2: full alias map, sorted by canonical ──────────────────────────
    // Groups all raw aliases under their canonical so you can read down each
    // canonical's group and spot whether two distinct brands got merged.
    sql`
      SELECT
        cb.id              AS canonical_id,
        cb.display_name    AS canonical_display_name,
        cb.normalized_name AS canonical_normalized_name,
        ba.raw_name        AS raw_alias,
        ba.created_at::text AS alias_created_at
      FROM brand_aliases ba
      JOIN canonical_brands cb ON cb.id = ba.canonical_id
      ORDER BY cb.id ASC, ba.raw_name ASC
    `,
  ]);

  return Response.json({
    as_of: dateParam,
    review_queue: reviewQueueResult.rows,
    review_queue_count: reviewQueueResult.rows.length,
    alias_map: aliasMapResult.rows,
    alias_map_canonical_count: new Set(aliasMapResult.rows.map((r) => r.canonical_id)).size,
    alias_map_total_aliases: aliasMapResult.rows.length,
  });
}
