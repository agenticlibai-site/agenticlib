import {
  initRalfiDB,
  getRalfiFeatureResponsesForScoring,
  upsertRalfiFeatureScore,
} from "@/lib/brand-visibility/db";
import { computeRalfiScore } from "@/lib/brand-visibility/ralfi-features";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

// Runs 30 min after ralfi-feature-collection?model=gpt-4o-mini.
// Reads today's ralfi_feature_responses, computes consensus scores,
// upserts into ralfi_feature_scores.

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
    const responses = await getRalfiFeatureResponsesForScoring(today);

    if (responses.length === 0) {
      return Response.json({
        mode:    "ralfi_feature_scoring",
        date:    today,
        scored:  0,
        flagged: 0,
        note:    "no ralfi_feature_responses found for today — collection may not have run yet",
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
        const result = computeRalfiScore(rows);
        await upsertRalfiFeatureScore({ brand_name, feature_id, feature_tag, ...result });
        scored++;
        if (result.flagged_for_review) flagged++;
      } catch (err) {
        console.error(`[ralfi-feature-aggregate] score error for ${brand_name}/${feature_id}:`, err);
        errors++;
      }
    }

    const flagRate = scored > 0 ? Math.round((flagged / scored) * 100) : 0;

    if (flagRate > 30 || errors > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Ralfi Feature Scoring elevated flags (${today})`,
        html: `<h2>Ralfi Feature Pipeline — Aggregate Results</h2>
          <p>Timestamp: ${runTimestamp} | Date: ${today}</p>
          <p>Scored: ${scored} | Flagged: ${flagged} (${flagRate}%) | Errors: ${errors}</p>
          ${flagRate > 30 ? "<p>Flag rate >30% — check prompt clarity or LLM consistency.</p>" : ""}
          ${errors > 0 ? `<p>${errors} brand+feature pairs failed to score — check Vercel logs.</p>` : ""}`,
      }).catch((e) => console.error("[alert] ralfi feature scoring email failed:", e));
    }

    return Response.json({
      mode: "ralfi_feature_scoring", date: today,
      groups: groups.size, scored, flagged, errors, flag_rate_pct: flagRate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] ralfi-feature-aggregate crashed:", message);
    await sendEmail({
      subject: `[AgenticLib] CRASH — Ralfi Feature Aggregate (${today ?? "unknown"})`,
      html: `<h2>Ralfi Feature Pipeline — Unhandled Crash</h2>
        <p>Timestamp: ${runTimestamp} | Error: ${message}</p>`,
    }).catch(() => {});
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
