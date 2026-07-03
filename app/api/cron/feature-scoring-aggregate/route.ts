import {
  initBrandVisibilityDB,
  getFeatureResponsesForScoring,
  upsertFeatureScore,
} from "@/lib/brand-visibility/db";
import { computeScore } from "@/lib/brand-visibility/features";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Runs 30 minutes after feature-scoring-collection?model=gpt-4o-mini (12:30 PM UTC).
// Reads today's feature_responses, computes consensus scores, upserts into feature_scores.

// ── Day-3 health check query (run manually after 3 days of data) ───────────────
//
// SELECT
//   feature_id,
//   COUNT(DISTINCT brand_name)                                              AS brands_scored,
//   COUNT(DISTINCT CASE WHEN flagged_for_review THEN brand_name END)       AS brands_flagged,
//   COUNT(DISTINCT CASE WHEN score IS NULL THEN brand_name END)            AS brands_undocumented,
//   ROUND(AVG(score) FILTER (WHERE score IS NOT NULL), 1)                  AS avg_score,
//   ROUND(
//     COUNT(DISTINCT CASE WHEN flagged_for_review THEN brand_name END)
//       * 100.0 / NULLIF(COUNT(DISTINCT brand_name), 0), 1
//   )                                                                       AS flag_rate_pct
// FROM feature_scores
// GROUP BY feature_id
// ORDER BY flag_rate_pct DESC NULLS LAST, feature_id;
//
// Red flags: flag_rate_pct > 30 on any feature_id suggests prompt ambiguity or
// inconsistent LLM behaviour — revisit the feature prompt before shipping the UI.
// ──────────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now   = new Date();
  const today = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  try {
    await initBrandVisibilityDB();
    const responses = await getFeatureResponsesForScoring(today);

    if (responses.length === 0) {
      return Response.json({
        mode:    "feature_scoring",
        date:    today,
        scored:  0,
        flagged: 0,
        note:    "no feature_responses found for today — collection may not have run yet",
      });
    }

    // Group by brand_name + feature_id
    const groups = new Map<string, typeof responses>();
    for (const r of responses) {
      const key = `${r.brand_name}::${r.feature_id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }

    let scored  = 0;
    let flagged = 0;
    let errors  = 0;

    for (const [key, rows] of groups) {
      const [brand_name, feature_id] = key.split("::");
      const feature_tag = rows[0].feature_tag;

      try {
        const result = computeScore(rows);
        await upsertFeatureScore({ brand_name, feature_id, feature_tag, ...result });
        scored++;
        if (result.flagged_for_review) flagged++;
      } catch (err) {
        console.error(`[feature-scoring] score error for ${brand_name}/${feature_id}:`, err);
        errors++;
      }
    }

    const flagRate = scored > 0 ? Math.round((flagged / scored) * 100) : 0;

    if (flagRate > 30 || errors > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Feature Scoring elevated flags (${today})`,
        html: `
          <h2>Feature Scoring Pipeline — Aggregate Results</h2>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Scored</strong></td><td>${scored}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Flagged for review</strong></td><td>${flagged} (${flagRate}%)</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Errors</strong></td><td>${errors}</td></tr>
          </table>
          <p>${flagRate > 30 ? "Flag rate >30% — check prompt clarity or LLM consistency." : ""}
          ${errors > 0 ? `${errors} brand+feature pairs failed to score — check Vercel logs.` : ""}</p>
        `,
      }).catch((e) => console.error("[alert] feature scoring email failed:", e));
    }

    return Response.json({
      mode:    "feature_scoring",
      date:    today,
      groups:  groups.size,
      scored,
      flagged,
      errors,
      flag_rate_pct: flagRate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] feature-scoring-aggregate crashed:", message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Feature Scoring Aggregate (${today})`,
      html: `
        <h2>Feature Scoring Pipeline — Unhandled Crash</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
      `,
    }).catch(() => {});

    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
