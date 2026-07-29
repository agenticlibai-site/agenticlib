import {
  initDexifyDB,
  getDexifyFeatureResponsesForScoring,
  upsertDexifyFeatureScore,
} from "@/lib/brand-visibility/db";
import { computeDexifyScore } from "@/lib/brand-visibility/dexify-features";
import { sendEmail } from "@/lib/email";

export const dynamic    = "force-dynamic";
export const maxDuration = 60;

// Runs at 7:45 UTC — 30 min after dexify-feature-collection?model=gpt-4o-mini (7:15 UTC).
// Reads today's dexify_feature_responses, computes consensus scores,
// upserts into dexify_feature_scores.

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now          = new Date();
  const today        = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  try {
    await initDexifyDB();
    const responses = await getDexifyFeatureResponsesForScoring(today);

    if (responses.length === 0) {
      return Response.json({
        mode:    "dexify_feature_scoring",
        date:    today,
        scored:  0,
        flagged: 0,
        note:    "no dexify_feature_responses found for today — collection may not have run yet",
      });
    }

    const groups = new Map<string, typeof responses>();
    for (const r of responses) {
      const key = `${r.brand_name}::${r.feature_id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }

    let scored = 0, flagged = 0, errors = 0;

    for (const [key, rows] of groups) {
      const [brand_name, feature_id] = key.split("::");
      const feature_tag = rows[0].feature_tag;
      try {
        const result = computeDexifyScore(rows);
        await upsertDexifyFeatureScore({ brand_name, feature_id, feature_tag, ...result });
        scored++;
        if (result.flagged_for_review) flagged++;
      } catch (err) {
        console.error(`[dexify-feature-aggregate] score error for ${brand_name}/${feature_id}:`, err);
        errors++;
      }
    }

    const flagRate = scored > 0 ? Math.round((flagged / scored) * 100) : 0;

    if (flagRate > 30 || errors > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Dexify Feature Scoring elevated flags (${today})`,
        html: `<h2>Dexify Feature Pipeline — Aggregate Results</h2>
          <p>Timestamp: ${runTimestamp} | Date: ${today}</p>
          <p>Scored: ${scored} | Flagged: ${flagged} (${flagRate}%) | Errors: ${errors}</p>
          ${flagRate > 30 ? "<p>Flag rate >30% — check prompt clarity or LLM consistency.</p>" : ""}
          ${errors > 0 ? `<p>${errors} brand+feature pairs failed to score — check Vercel logs.</p>` : ""}`,
      }).catch((e) => console.error("[alert] dexify feature scoring email failed:", e));
    }

    return Response.json({
      mode: "dexify_feature_scoring", date: today,
      groups: groups.size, scored, flagged, errors, flag_rate_pct: flagRate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] dexify-feature-aggregate crashed:", message);
    await sendEmail({
      subject: `[AgenticLib] CRASH — Dexify Feature Aggregate (${today ?? "unknown"})`,
      html: `<h2>Dexify Feature Pipeline — Unhandled Crash</h2>
        <p>Timestamp: ${runTimestamp} | Error: ${message}</p>`,
    }).catch(() => {});
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
