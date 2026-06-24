import { sql } from "@vercel/postgres";
import { initSkincareDB } from "@/lib/skincare-visibility/db";

export const dynamic = "force-dynamic";

// Read-only audit endpoint — returns raw table contents so you can inspect
// collection results without a frontend page.
//
// Usage:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://agenticlib.com/api/skincare-visibility/audit
//   curl -H "Authorization: Bearer $CRON_SECRET" "https://agenticlib.com/api/skincare-visibility/audit?date=2026-06-25"
//
// Returns:
//   raw_responses     — one row per (prompt, model, run) collected on the date
//   daily_summary     — aggregated brand mentions for the date
//   llm_visibility    — per-model visibility % for all available windows
//   collection_stats  — success/error counts for the date

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initSkincareDB();

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const [rawResult, summaryResult, visibilityResult, errorResult] = await Promise.all([
    sql`
      SELECT
        date::text,
        prompt_id,
        bucket_tag,
        model,
        run_number,
        brands,
        model_snapshot,
        created_at::text
      FROM skincare_raw_responses
      WHERE date = ${date}::date
      ORDER BY model, prompt_id, run_number
    `,
    sql`
      SELECT
        date::text,
        brand,
        model,
        mention_count,
        confidence
      FROM skincare_daily_summary
      WHERE date = ${date}::date
      ORDER BY model, mention_count DESC, brand
    `,
    sql`
      SELECT
        window_start::text,
        window_end::text,
        model,
        visibility_pct,
        total_responses,
        tracked_responses
      FROM skincare_llm_visibility
      ORDER BY window_end DESC, model
    `,
    sql`
      SELECT
        model,
        COUNT(*) FILTER (WHERE NOT archived) AS active_errors,
        COUNT(*) FILTER (WHERE archived) AS archived_errors,
        array_agg(error_message ORDER BY created_at DESC) FILTER (WHERE NOT archived) AS recent_errors
      FROM skincare_collection_errors
      WHERE date = ${date}::date
      GROUP BY model
    `,
  ]);

  const successCount = rawResult.rows.length;
  const byModel = rawResult.rows.reduce(
    (acc: Record<string, number>, r) => {
      const m = r.model as string;
      acc[m] = (acc[m] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return Response.json({
    date,
    collection_stats: {
      total_raw_responses: successCount,
      expected: 78,
      complete: successCount === 78,
      by_model: byModel,
      errors: errorResult.rows,
    },
    raw_responses: rawResult.rows,
    daily_summary: summaryResult.rows,
    llm_visibility: visibilityResult.rows,
  });
}
