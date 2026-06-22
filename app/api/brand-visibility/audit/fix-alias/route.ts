import { sql } from "@vercel/postgres";
import { initBrandVisibilityDB } from "@/lib/brand-visibility/db";
import { computeDailySummary, computeWeeklySummary, computeLLMVisibility } from "@/lib/brand-visibility/aggregation";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/brand-visibility/audit/fix-alias
 *
 * Repairs a bad fuzzy merge: a raw alias that was incorrectly attached to the
 * wrong canonical because the two names happened to be within Levenshtein ≤2.
 *
 * What it does (in order):
 *  1. Removes the bad alias from brand_aliases.
 *  2. Creates (or finds) the correct canonical entry for the raw alias.
 *  3. Inserts the alias pointing to the correct canonical.
 *  4. Finds every date where the raw brand appeared in raw_responses.
 *  5. For each affected date: deletes response_canonical_brands and daily_summary,
 *     then re-runs computeDailySummary so correct counts are stored.
 *  6. Deletes all weekly_summary and llm_visibility entries that overlap the
 *     affected date range, then re-runs them for the 7-day window ending at
 *     the latest affected date.
 *
 * Body (JSON):
 * {
 *   "wrongAlias":          "kaspr",    // raw_name currently in brand_aliases pointing to wrong canonical
 *   "correctDisplayName":  "Kaspr",    // display name for the correct canonical (created if absent)
 *   "wrongCanonicalName":  "Jasper"    // safety guard — request is rejected if the alias doesn't
 *                                      // currently point to this canonical (prevents accidents)
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

  let body: { wrongAlias?: string; correctDisplayName?: string; wrongCanonicalName?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { wrongAlias, correctDisplayName, wrongCanonicalName } = body;
  if (!wrongAlias || !correctDisplayName || !wrongCanonicalName) {
    return Response.json(
      { error: "Required fields: wrongAlias, correctDisplayName, wrongCanonicalName" },
      { status: 400 },
    );
  }

  // ── Step 1: Verify the alias exists and points to the expected wrong canonical ──

  const aliasCheck = await sql`
    SELECT ba.id AS alias_id, ba.canonical_id, cb.display_name AS current_canonical
    FROM brand_aliases ba
    JOIN canonical_brands cb ON cb.id = ba.canonical_id
    WHERE ba.raw_name = ${wrongAlias}
    LIMIT 1
  `;

  if (aliasCheck.rows.length === 0) {
    return Response.json({ error: `Alias '${wrongAlias}' not found in brand_aliases.` }, { status: 404 });
  }

  const currentCanonical = aliasCheck.rows[0].current_canonical as string;
  if (currentCanonical.toLowerCase() !== wrongCanonicalName.toLowerCase()) {
    return Response.json({
      error: `Safety check failed: alias '${wrongAlias}' points to '${currentCanonical}', not '${wrongCanonicalName}'. Update wrongCanonicalName in your request.`,
    }, { status: 409 });
  }

  const wrongCanonicalId = aliasCheck.rows[0].canonical_id as number;

  // ── Step 2: Remove the bad alias ─────────────────────────────────────────────

  await sql`DELETE FROM brand_aliases WHERE raw_name = ${wrongAlias}`;

  // ── Step 3: Create/find the correct canonical and re-point the alias ─────────

  const normalizedCorrect = wrongAlias.toLowerCase().trim();

  const newCanonicalRow = await sql`
    INSERT INTO canonical_brands (display_name, normalized_name)
    VALUES (${correctDisplayName}, ${normalizedCorrect})
    ON CONFLICT (normalized_name) DO UPDATE SET normalized_name = EXCLUDED.normalized_name
    RETURNING id, display_name
  `;
  const correctCanonicalId = newCanonicalRow.rows[0].id as number;
  const correctCanonicalDisplay = newCanonicalRow.rows[0].display_name as string;

  await sql`
    INSERT INTO brand_aliases (raw_name, canonical_id)
    VALUES (${wrongAlias}, ${correctCanonicalId})
    ON CONFLICT (raw_name) DO UPDATE SET canonical_id = EXCLUDED.canonical_id
  `;

  // ── Step 4: Find every date where the raw brand appeared in raw_responses ────

  // Matches against the JSONB array with a case-insensitive exact element check.
  const affectedDatesResult = await sql`
    SELECT DISTINCT date::text AS date
    FROM raw_responses r
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(r.brands) b
      WHERE LOWER(b) = LOWER(${wrongAlias})
    )
    ORDER BY date ASC
  `;

  const affectedDates = affectedDatesResult.rows.map((r) => r.date as string);

  if (affectedDates.length === 0) {
    return Response.json({
      fixed: true,
      wrongAlias,
      wrongCanonicalName,
      correctCanonicalId,
      correctDisplayName: correctCanonicalDisplay,
      affectedDates: [],
      note: "Alias fixed. No raw_responses contained this brand name, so no aggregation re-run was needed.",
    });
  }

  // ── Step 5: Re-aggregate each affected date ───────────────────────────────────

  const reAggregated: string[] = [];

  for (const date of affectedDates) {
    // Clear response_canonical_brands for this date — will be regenerated cleanly
    await sql`
      DELETE FROM response_canonical_brands
      WHERE response_id IN (SELECT id FROM raw_responses WHERE date = ${date}::date)
    `;

    // Clear daily_summary for this date — will be regenerated
    await sql`DELETE FROM daily_summary WHERE date = ${date}::date`;

    await computeDailySummary(date);
    reAggregated.push(date);
  }

  // ── Step 6: Re-run weekly / LLM visibility for the affected window ────────────

  const minDate = affectedDates[0];
  const maxDate = affectedDates[affectedDates.length - 1];

  // Delete weekly and LLM visibility rows that overlap the affected date range
  await sql`
    DELETE FROM weekly_summary
    WHERE window_end >= ${minDate}::date AND window_start <= ${maxDate}::date
  `;
  await sql`
    DELETE FROM llm_visibility
    WHERE window_end >= ${minDate}::date AND window_start <= ${maxDate}::date
  `;

  // Re-run for the 7-day window that contains the latest affected date
  const windowEndDate = new Date(maxDate + "T00:00:00Z");
  const windowStartDate = new Date(windowEndDate);
  windowStartDate.setUTCDate(windowStartDate.getUTCDate() - 6);
  const windowStart = windowStartDate.toISOString().split("T")[0];

  await computeWeeklySummary(windowStart, maxDate);
  await computeLLMVisibility(windowStart, maxDate);

  return Response.json({
    fixed: true,
    wrongAlias,
    wrongCanonicalName,
    wrongCanonicalId,
    correctCanonicalId,
    correctDisplayName: correctCanonicalDisplay,
    affectedDates,
    reAggregatedDates: reAggregated,
    weeklyWindowRerun: { windowStart, windowEnd: maxDate },
  });
}
