import { sql } from "@vercel/postgres";
import { initBrandVisibilityDB } from "@/lib/brand-visibility/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/brand-visibility/audit/purge-canonical
 *
 * Removes a canonical brand and all associated data when its normalized_name
 * matches a stoplisted term (i.e. it was created before the stoplist was updated).
 *
 * Deletes in this order (respecting FK constraints):
 *  1. response_canonical_brands rows for this brand
 *  2. daily_summary rows for this brand
 *  3. weekly_summary rows for this brand
 *  4. brand_review_queue rows for this brand's raw name
 *  5. brand_aliases rows pointing to this canonical
 *  6. canonical_brands row itself
 *
 * Does NOT re-run aggregation — the brand simply disappears from all summaries.
 * llm_visibility is unaffected (it counts by response, not by brand name).
 *
 * Body (JSON):
 * {
 *   "canonicalId":   12,          // id from canonical_brands (from stoplist-check output)
 *   "displayName":   "Salesforce" // safety guard — rejected if it doesn't match
 * }
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initBrandVisibilityDB();

  let body: { canonicalId?: number; displayName?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { canonicalId, displayName } = body;
  if (!canonicalId || !displayName) {
    return Response.json({ error: "Required fields: canonicalId, displayName" }, { status: 400 });
  }

  // Safety check — verify id + name match before deleting anything
  const canonicalRow = await sql`
    SELECT id, display_name, normalized_name FROM canonical_brands WHERE id = ${canonicalId}
  `;
  if (canonicalRow.rows.length === 0) {
    return Response.json({ error: `canonical_id ${canonicalId} not found.` }, { status: 404 });
  }
  const actual = canonicalRow.rows[0].display_name as string;
  if (actual.toLowerCase() !== displayName.toLowerCase()) {
    return Response.json({
      error: `Safety check failed: id ${canonicalId} has display_name '${actual}', not '${displayName}'.`,
    }, { status: 409 });
  }

  const normalizedName = canonicalRow.rows[0].normalized_name as string;

  // Verify it's actually stoplisted before allowing deletion
  const stoplistCheck = await sql`
    SELECT 1 FROM brand_stoplist WHERE term = ${normalizedName} LIMIT 1
  `;
  if (stoplistCheck.rows.length === 0) {
    return Response.json({
      error: `'${normalizedName}' is not in brand_stoplist. This endpoint is only for stoplisted canonicals. Use /audit/fix-alias for bad fuzzy merges.`,
    }, { status: 400 });
  }

  // Count what will be deleted so the caller knows the impact
  const [rcbCount, dsCount, wsCount] = await Promise.all([
    sql`SELECT COUNT(*) AS n FROM response_canonical_brands WHERE canonical_brand = ${actual}`,
    sql`SELECT COUNT(*) AS n FROM daily_summary WHERE brand = ${actual}`,
    sql`SELECT COUNT(*) AS n FROM weekly_summary WHERE brand = ${actual}`,
  ]);

  // Delete in FK-safe order
  await sql`DELETE FROM response_canonical_brands WHERE canonical_brand = ${actual}`;
  await sql`DELETE FROM daily_summary WHERE brand = ${actual}`;
  await sql`DELETE FROM weekly_summary WHERE brand = ${actual}`;
  await sql`DELETE FROM brand_review_queue WHERE raw_name = ${normalizedName}`;
  await sql`DELETE FROM brand_aliases WHERE canonical_id = ${canonicalId}`;
  await sql`DELETE FROM canonical_brands WHERE id = ${canonicalId}`;

  return Response.json({
    purged: true,
    canonicalId,
    displayName: actual,
    normalizedName,
    deleted: {
      response_canonical_brands: parseInt(String(rcbCount.rows[0].n), 10),
      daily_summary_rows: parseInt(String(dsCount.rows[0].n), 10),
      weekly_summary_rows: parseInt(String(wsCount.rows[0].n), 10),
    },
    note: "llm_visibility not affected — it counts responses, not brand names.",
  });
}
