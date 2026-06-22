import { sql } from "@vercel/postgres";
import { initBrandVisibilityDB } from "@/lib/brand-visibility/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/brand-visibility/audit/daily-check?date=YYYY-MM-DD
 *
 * End-to-end verification after a cron run. Defaults to today's date.
 * Returns five sections:
 *
 * 1. coverage          — rows collected per model vs. the 220 expected (22 × 5 × 2)
 * 2. missing_cells     — any (prompt_id, model) combinations with fewer than 5 runs
 * 3. model_snapshots   — distinct model_snapshot strings seen, so you can confirm the
 *                        exact API version used (e.g. "claude-haiku-4-5-20241022")
 * 4. collection_errors — every error row for the date, with raw_response for debugging
 * 5. daily_summary     — top 30 brands by mention_count, with avg_position and confidence
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initBrandVisibilityDB();

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const [
    coverageResult,
    missingResult,
    snapshotResult,
    errorsResult,
    summaryResult,
  ] = await Promise.all([

    // 1. Row count per model (expect 110 each = 22 prompts × 5 runs)
    sql`
      SELECT
        model,
        COUNT(*)::int                                          AS rows_stored,
        COUNT(DISTINCT prompt_id)::int                         AS distinct_prompts,
        COUNT(DISTINCT run_number)::int                        AS distinct_runs,
        110                                                    AS expected_rows,
        22                                                     AS expected_prompts
      FROM raw_responses
      WHERE date = ${date}::date
      GROUP BY model
      ORDER BY model
    `,

    // 2. Missing or incomplete (prompt_id, model) cells — should return 0 rows if healthy
    sql`
      WITH expected AS (
        SELECT g.prompt_id, m.model
        FROM generate_series(1, 22) AS g(prompt_id)
        CROSS JOIN (VALUES ('claude-haiku-4-5'), ('gpt-4o-mini')) AS m(model)
      ),
      actual AS (
        SELECT prompt_id, model, COUNT(*)::int AS run_count
        FROM raw_responses
        WHERE date = ${date}::date
        GROUP BY prompt_id, model
      )
      SELECT
        e.prompt_id,
        e.model,
        COALESCE(a.run_count, 0) AS runs_stored,
        5                        AS runs_expected
      FROM expected e
      LEFT JOIN actual a ON a.prompt_id = e.prompt_id AND a.model = e.model
      WHERE COALESCE(a.run_count, 0) < 5
      ORDER BY e.prompt_id, e.model
    `,

    // 3. Distinct model_snapshot strings (exact API version used per model)
    sql`
      SELECT model, model_snapshot, COUNT(*)::int AS call_count
      FROM raw_responses
      WHERE date = ${date}::date
      GROUP BY model, model_snapshot
      ORDER BY model, model_snapshot
    `,

    // 4. Active (non-archived) collection errors only.
    // Errors from superseded failed runs are archived automatically when a retry
    // succeeds and are excluded here so error_count reflects the current run only.
    sql`
      SELECT
        prompt_id,
        model,
        run_number,
        error_message,
        LEFT(raw_response, 300) AS raw_response_preview,
        created_at::text        AS created_at
      FROM collection_errors
      WHERE date = ${date}::date
        AND archived = FALSE
      ORDER BY prompt_id, model, run_number
    `,

    // 5. Daily summary — top 30 by mention count
    sql`
      SELECT brand, model, mention_count, ROUND(avg_position::numeric, 2) AS avg_position, confidence
      FROM daily_summary
      WHERE date = ${date}::date
      ORDER BY mention_count DESC, brand ASC
      LIMIT 30
    `,
  ]);

  const totalRows = coverageResult.rows.reduce(
    (s: number, r: { rows_stored: number }) => s + r.rows_stored,
    0,
  );

  return Response.json({
    date,
    health: {
      total_rows_stored: totalRows,
      expected_total: 220,
      complete: totalRows === 220 && missingResult.rows.length === 0,
      missing_cells: missingResult.rows.length,
      // active errors only — errors from superseded failed runs are archived and not counted
      error_count: errorsResult.rows.length,
      summary_brands: summaryResult.rows.length,
    },
    coverage: coverageResult.rows,
    missing_cells: missingResult.rows,
    model_snapshots: snapshotResult.rows,
    collection_errors: errorsResult.rows,
    daily_summary_top30: summaryResult.rows,
  });
}
