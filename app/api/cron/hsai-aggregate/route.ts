import { sql } from "@vercel/postgres";
import { initHsaiDB } from "@/lib/brand-visibility/db";
import { LOCKED_HSAI_BRANDS } from "@/lib/brand-visibility/hsai-features";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

// Runs 30 min after the last collection job (08:15 → 08:45 UTC).
// Reads today's hsai_raw_responses, counts brand appearances per cluster,
// upserts into hsai_daily_summary.

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now   = new Date();
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const today = (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam))
    ? dateParam : now.toISOString().split("T")[0];

  try {
    await initHsaiDB();

    const countResult = await sql`SELECT COUNT(*)::int AS cnt FROM hsai_raw_responses WHERE date = ${today}::date`;
    const rawCount = (countResult.rows[0]?.cnt ?? 0) as number;

    if (rawCount === 0) {
      return Response.json({ mode: "hsai_aggregate", date: today, note: "no hsai_raw_responses for today — collection may not have run", brands_written: 0 });
    }

    const upsertResult = await sql`
      INSERT INTO hsai_daily_summary (date, brand, model, cluster_tag, mention_count, avg_position)
      SELECT
        ${today}::date,
        TRIM(t.brand_name),
        r.model,
        r.cluster_tag,
        COUNT(*)::int            AS mention_count,
        AVG(t.ordinality)::float AS avg_position
      FROM hsai_raw_responses r,
           jsonb_array_elements_text(r.brands) WITH ORDINALITY AS t(brand_name, ordinality)
      WHERE r.date = ${today}::date
        AND LENGTH(TRIM(t.brand_name)) > 0
      GROUP BY TRIM(t.brand_name), r.model, r.cluster_tag
      ON CONFLICT (date, brand, model, cluster_tag) DO UPDATE SET
        mention_count = EXCLUDED.mention_count,
        avg_position  = EXCLUDED.avg_position
      RETURNING brand
    `;

    const brandsWritten = upsertResult.rows.length;

    // Canonicalize case variants to locked brand names
    for (const canonical of LOCKED_HSAI_BRANDS) {
      const lower = canonical.toLowerCase();
      await sql`
        UPDATE hsai_daily_summary main
        SET
          mention_count = main.mention_count + v.mention_count,
          avg_position  = CASE WHEN main.avg_position IS NULL THEN v.avg_position
                               WHEN v.avg_position   IS NULL THEN main.avg_position
                               ELSE (main.avg_position + v.avg_position) / 2 END
        FROM hsai_daily_summary v
        WHERE main.date        = ${today}::date
          AND v.date           = ${today}::date
          AND LOWER(main.brand) = ${lower}
          AND LOWER(v.brand)    = ${lower}
          AND main.brand        != v.brand
          AND main.model        = v.model
          AND main.cluster_tag  = v.cluster_tag
      `;
      await sql`
        DELETE FROM hsai_daily_summary
        WHERE date = ${today}::date
          AND LOWER(brand) = ${lower}
          AND brand != ${canonical}
      `;
    }

    console.log(`[hsai-aggregate] done — date=${today}, brands_written=${brandsWritten}`);
    return Response.json({ mode: "hsai_aggregate", date: today, brands_written: brandsWritten, raw_rows: rawCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] hsai-aggregate crashed:", message);
    await sendEmail({
      subject: `[AgenticLib] CRASH — HSAI Aggregate (${today ?? "unknown"})`,
      html: `<h2>HSAI Aggregate — Crash</h2><p>Error: ${message}</p>`,
    }).catch(() => {});
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
