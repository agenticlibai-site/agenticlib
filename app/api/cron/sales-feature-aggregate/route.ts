import {
  initSalesVisibilityDB,
  getSalesFeatureResponsesForScoring,
  upsertSalesFeatureScore,
} from "@/lib/brand-visibility/db";
import { computeScore } from "@/lib/brand-visibility/sales-features";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Runs 30 minutes after sales-feature-collection?model=gpt-4o-mini (9:30 AM UTC).
// Reads today's sales_feature_responses, computes consensus scores, upserts into sales_feature_scores.

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now   = new Date();
  const today = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  try {
    await initSalesVisibilityDB();
    const responses = await getSalesFeatureResponsesForScoring(today);

    if (responses.length === 0) {
      return Response.json({
        mode:    "sales_feature_scoring",
        date:    today,
        scored:  0,
        flagged: 0,
        note:    "no sales_feature_responses found for today — collection may not have run yet",
      });
    }

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
        await upsertSalesFeatureScore({
          brand_name, feature_id, feature_tag,
          ...result,
          grounded_source: result.grounded_source,
        });
        scored++;
        if (result.flagged_for_review) flagged++;
      } catch (err) {
        console.error(`[sales-feature-scoring] score error for ${brand_name}/${feature_id}:`, err);
        errors++;
      }
    }

    const flagRate = scored > 0 ? Math.round((flagged / scored) * 100) : 0;

    if (flagRate > 30 || errors > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Sales Feature Scoring elevated flags (${today})`,
        html: `
          <h2>Sales Feature Scoring Pipeline — Aggregate Results</h2>
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
      }).catch((e) => console.error("[alert] sales feature scoring email failed:", e));
    }

    return Response.json({
      mode:          "sales_feature_scoring",
      date:          today,
      groups:        groups.size,
      scored,
      flagged,
      errors,
      flag_rate_pct: flagRate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] sales-feature-aggregate crashed:", message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Sales Feature Aggregate (${today})`,
      html: `
        <h2>Sales Feature Scoring Pipeline — Unhandled Crash</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
      `,
    }).catch(() => {});

    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
