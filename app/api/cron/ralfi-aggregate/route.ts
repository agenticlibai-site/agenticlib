import { sql } from "@vercel/postgres";
import { initRalfiDB } from "@/lib/brand-visibility/db";
import { RALFI_PROMPTS } from "@/lib/brand-visibility/ralfi-prompts";
import { LOCKED_RALFI_BRANDS } from "@/lib/brand-visibility/ralfi-features";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

// Runs ~35 minutes after the last collection job.
// Reads today's ralfi_raw_responses, counts brand appearances per cluster,
// upserts into ralfi_daily_summary.

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now          = new Date();
  const today        = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  try {
    await initRalfiDB();

    const countResult = await sql`
      SELECT COUNT(*)::int AS cnt FROM ralfi_raw_responses WHERE date = ${today}::date
    `;
    const rawCount = (countResult.rows[0]?.cnt ?? 0) as number;

    if (rawCount === 0) {
      return Response.json({
        mode: "ralfi_aggregate",
        date: today,
        note: "no ralfi_raw_responses found for today — collection may not have run yet",
        brands_written: 0,
      });
    }

    // Count brand appearances per (brand, model, cluster_tag), filtered by denylist.
    const upsertResult = await sql`
      INSERT INTO ralfi_daily_summary (date, brand, model, cluster_tag, mention_count, avg_position)
      SELECT
        ${today}::date,
        TRIM(t.brand_name),
        r.model,
        r.cluster_tag,
        COUNT(*)::int            AS mention_count,
        AVG(t.ordinality)::float AS avg_position
      FROM ralfi_raw_responses r,
           jsonb_array_elements_text(r.brands) WITH ORDINALITY AS t(brand_name, ordinality)
      WHERE r.date = ${today}::date
        AND LENGTH(TRIM(t.brand_name)) > 0
        AND LOWER(TRIM(t.brand_name)) NOT IN (SELECT LOWER(brand_name) FROM ralfi_denylist)
      GROUP BY TRIM(t.brand_name), r.model, r.cluster_tag
      ON CONFLICT (date, brand, model, cluster_tag) DO UPDATE SET
        mention_count = EXCLUDED.mention_count,
        avg_position  = EXCLUDED.avg_position
      RETURNING brand
    `;

    const brandsWritten = upsertResult.rows.length;

    // ── Canonicalize brand names ──────────────────────────────────────────────
    for (const canonical of LOCKED_RALFI_BRANDS) {
      const lower = canonical.toLowerCase();

      // Step 1: Merge case variants into canonical where both rows exist.
      await sql`
        UPDATE ralfi_daily_summary main
        SET
          mention_count = main.mention_count + v.mention_count,
          avg_position  = CASE
            WHEN (main.mention_count + v.mention_count) > 0
            THEN (COALESCE(main.avg_position, 1) * main.mention_count
                  + COALESCE(v.avg_position, 1) * v.mention_count)
                 / (main.mention_count + v.mention_count)
            ELSE main.avg_position
          END
        FROM ralfi_daily_summary v
        WHERE main.date          = ${today}::date
          AND main.brand         = ${canonical}
          AND v.date             = ${today}::date
          AND LOWER(v.brand)     = ${lower}
          AND v.brand           != ${canonical}
          AND main.model         = v.model
          AND main.cluster_tag   = v.cluster_tag
      `;

      // Step 2: Rename variant → canonical where no canonical row existed.
      await sql`
        UPDATE ralfi_daily_summary
        SET brand = ${canonical}
        WHERE date          = ${today}::date
          AND LOWER(brand)  = ${lower}
          AND brand        != ${canonical}
          AND NOT EXISTS (
            SELECT 1 FROM ralfi_daily_summary d2
            WHERE d2.date        = ${today}::date
              AND d2.brand       = ${canonical}
              AND d2.model       = ralfi_daily_summary.model
              AND d2.cluster_tag = ralfi_daily_summary.cluster_tag
          )
      `;

      // Step 3: Delete remaining variant rows (already merged in step 1).
      await sql`
        DELETE FROM ralfi_daily_summary
        WHERE date         = ${today}::date
          AND LOWER(brand) = ${lower}
          AND brand       != ${canonical}
      `;
    }

    const RUNS_PER_PROMPT    = 3;
    const EXPECTED_RAW       = RALFI_PROMPTS.length * RUNS_PER_PROMPT * 2;
    const EXPECTED_PER_MODEL = RALFI_PROMPTS.length * RUNS_PER_PROMPT;
    const healthy = rawCount >= EXPECTED_RAW;

    if (!healthy) {
      const perModelResult = await sql`
        SELECT model, COUNT(*)::int AS rows_stored
        FROM ralfi_raw_responses
        WHERE date = ${today}::date
        GROUP BY model
      `;
      const perModelMap: Record<string, number> = Object.fromEntries(
        perModelResult.rows.map((r) => [r.model as string, r.rows_stored as number])
      );
      const modelRows = (["claude-haiku-4-5", "gpt-4o-mini"] as const).map((m) => {
        const stored = perModelMap[m] ?? 0;
        return `<tr><td style="padding:4px 12px 4px 0"><strong>${m}</strong></td><td>${stored} / ${EXPECTED_PER_MODEL} ${stored >= EXPECTED_PER_MODEL ? "✓" : "✗"}</td></tr>`;
      }).join("");

      await sendEmail({
        subject: `[AgenticLib] ALERT — Ralfi Aggregate incomplete (${today})`,
        html: `
          <h2>Ralfi Pipeline — Aggregation Health Check</h2>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Raw rows</strong></td><td>${rawCount} / ${EXPECTED_RAW} expected</td></tr>
            ${modelRows}
            <tr><td style="padding:4px 12px 4px 0"><strong>Brands written</strong></td><td>${brandsWritten}</td></tr>
          </table>
          <p>Collection may not have completed for one or both models. Check Vercel function logs.</p>
        `,
      }).catch((e) => console.error("[alert] ralfi aggregate email failed:", e));
    }

    return Response.json({
      mode:           "ralfi_aggregate",
      date:           today,
      raw_rows:       rawCount,
      expected_raw:   EXPECTED_RAW,
      healthy,
      brands_written: brandsWritten,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] ralfi-aggregate crashed:", message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Ralfi Aggregate (${today})`,
      html: `
        <h2>Ralfi Pipeline — Unhandled Crash</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
      `,
    }).catch(() => {});

    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
