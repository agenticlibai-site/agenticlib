import { sql } from "@vercel/postgres";
import { initSalesVisibilityDB } from "@/lib/brand-visibility/db";
import { SALES_PROMPTS } from "@/lib/brand-visibility/sales-prompts";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Runs 35 minutes after the last collection job (4:10 → 4:45 UTC).
// Reads today's sales_raw_responses, counts brand appearances, upserts into sales_daily_summary.
// Handles an empty locked_sales_agents gracefully — on first run all brands are counted
// so the top-25 candidates can be identified and locked in.

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now          = new Date();
  const today        = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  try {
    await initSalesVisibilityDB();

    // Count how many raw rows exist for today before proceeding
    const countResult = await sql`
      SELECT COUNT(*)::int AS cnt FROM sales_raw_responses WHERE date = ${today}::date
    `;
    const rawCount = (countResult.rows[0]?.cnt ?? 0) as number;

    if (rawCount === 0) {
      return Response.json({
        mode:  "sales_aggregate",
        date:  today,
        note:  "no sales_raw_responses found for today — collection may not have run yet",
        brands_written: 0,
      });
    }

    // Unnest brands JSONB array, count appearances per (brand, model), upsert into sales_daily_summary.
    // avg_position: 1-based ordinal of the brand's first mention in that response.
    const upsertResult = await sql`
      INSERT INTO sales_daily_summary (date, brand, model, mention_count, avg_position)
      SELECT
        ${today}::date,
        CASE t.brand_name
          WHEN 'SalesLoft' THEN 'Salesloft'
          WHEN 'Chorus.ai' THEN 'Chorus'
          ELSE t.brand_name
        END,
        r.model,
        COUNT(*)::int                   AS mention_count,
        AVG(t.ordinality)::float        AS avg_position
      FROM sales_raw_responses r,
           jsonb_array_elements_text(r.brands) WITH ORDINALITY AS t(brand_name, ordinality)
      WHERE r.date = ${today}::date
        AND LENGTH(TRIM(t.brand_name)) > 0
        AND LOWER(TRIM(t.brand_name)) NOT IN (SELECT LOWER(brand_name) FROM sales_denylist)
      GROUP BY CASE t.brand_name
        WHEN 'SalesLoft' THEN 'Salesloft'
        WHEN 'Chorus.ai' THEN 'Chorus'
        ELSE t.brand_name
      END, r.model
      ON CONFLICT (date, brand, model) DO UPDATE SET
        mention_count = EXCLUDED.mention_count,
        avg_position  = EXCLUDED.avg_position
      RETURNING brand
    `;

    const brandsWritten = upsertResult.rows.length;

    // Health check: both models should have completed collection
    const EXPECTED_RAW = SALES_PROMPTS.length * 5 * 2; // 20 prompts × 5 runs × 2 models
    const healthy = rawCount >= EXPECTED_RAW;

    if (!healthy) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Sales Visibility Aggregate incomplete (${today})`,
        html: `
          <h2>Sales Visibility Pipeline — Aggregation Health Check</h2>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Raw rows</strong></td><td>${rawCount} / ${EXPECTED_RAW} expected</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Brands written</strong></td><td>${brandsWritten}</td></tr>
          </table>
          <p>Collection may not have completed for one or both models. Check Vercel function logs.</p>
        `,
      }).catch((e) => console.error("[alert] sales aggregate email failed:", e));
    }

    return Response.json({
      mode:           "sales_aggregate",
      date:           today,
      raw_rows:       rawCount,
      expected_raw:   EXPECTED_RAW,
      healthy,
      brands_written: brandsWritten,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] sales-visibility-aggregate crashed:", message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Sales Visibility Aggregate (${today})`,
      html: `
        <h2>Sales Visibility Pipeline — Unhandled Crash</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
      `,
    }).catch(() => {});

    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
