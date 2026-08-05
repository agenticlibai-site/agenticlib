import { sql } from "@vercel/postgres";
import { initDexifyDB } from "@/lib/brand-visibility/db";
import { LOCKED_DEXIFY_BRANDS } from "@/lib/brand-visibility/dexify-features";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

// One-time migration + ongoing idempotent fix.
// Merges any case variants (e.g. "SimPRO") into their canonical locked-brand
// forms (e.g. "simPRO") across ALL historical dates in dexify_daily_summary.
//
// Safe to call multiple times — subsequent runs find nothing to merge.
// Trigger with:
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//        https://agenticlib.com/api/admin/dexify-brand-canonicalize

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDexifyDB();

  const report: { canonical: string; merged: number; renamed: number; deleted: number }[] = [];

  for (const canonical of LOCKED_DEXIFY_BRANDS) {
    const lower = canonical.toLowerCase();

    // Step 1: Merge mention counts from variant rows into canonical rows
    //         (where both exist for the same date/model/cluster_tag).
    const mergeResult = await sql`
      UPDATE dexify_daily_summary main
      SET
        mention_count = main.mention_count + v.mention_count,
        avg_position  = CASE
          WHEN (main.mention_count + v.mention_count) > 0
          THEN (COALESCE(main.avg_position, 1) * main.mention_count
                + COALESCE(v.avg_position, 1) * v.mention_count)
               / (main.mention_count + v.mention_count)
          ELSE main.avg_position
        END
      FROM dexify_daily_summary v
      WHERE main.brand        = ${canonical}
        AND LOWER(v.brand)    = ${lower}
        AND v.brand          != ${canonical}
        AND main.date         = v.date
        AND main.model        = v.model
        AND main.cluster_tag  = v.cluster_tag
    `;
    const merged = mergeResult.rowCount ?? 0;

    // Step 2: Rename variant → canonical where no canonical row existed.
    const renameResult = await sql`
      UPDATE dexify_daily_summary
      SET brand = ${canonical}
      WHERE LOWER(brand)  = ${lower}
        AND brand        != ${canonical}
        AND NOT EXISTS (
          SELECT 1 FROM dexify_daily_summary d2
          WHERE d2.brand       = ${canonical}
            AND d2.date        = dexify_daily_summary.date
            AND d2.model       = dexify_daily_summary.model
            AND d2.cluster_tag = dexify_daily_summary.cluster_tag
        )
    `;
    const renamed = renameResult.rowCount ?? 0;

    // Step 3: Delete remaining variant rows (already merged in step 1).
    const deleteResult = await sql`
      DELETE FROM dexify_daily_summary
      WHERE LOWER(brand) = ${lower}
        AND brand       != ${canonical}
    `;
    const deleted = deleteResult.rowCount ?? 0;

    if (merged > 0 || renamed > 0 || deleted > 0) {
      report.push({ canonical, merged, renamed, deleted });
    }
  }

  return Response.json({
    mode:    "dexify_brand_canonicalize",
    brands:  LOCKED_DEXIFY_BRANDS.length,
    changes: report,
    note:    report.length === 0
      ? "Nothing to canonicalize — all brand names already match locked forms"
      : `Canonicalized ${report.length} brand(s)`,
  });
}
