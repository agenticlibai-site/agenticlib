import {
  initSdaiDB, getSdaiFeatureResponsesForScoring, upsertSdaiFeatureScore,
} from "@/lib/brand-visibility/db";
import { computeSdaiScore } from "@/lib/brand-visibility/sdai-features";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 60;

// Runs 30 min after GPT feature collection (10:15 → 10:45 UTC).
// Reads today's sdai_feature_responses, computes consensus scores,
// upserts into sdai_feature_scores.

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
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  try {
    await initSdaiDB();
    const responses = await getSdaiFeatureResponsesForScoring(today);

    if (responses.length === 0) {
      return Response.json({ mode: "sdai_feature_scoring", date: today, note: "no sdai_feature_responses for today — collection may not have run yet" });
    }

    // Group by brand × feature
    const grouped = new Map<string, typeof responses>();
    for (const row of responses) {
      const key = `${row.brand_name}::${row.feature_id}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(row);
    }

    let scored = 0, flagged = 0;
    for (const [key, runs] of grouped) {
      const [brandName, featureId] = key.split("::");
      if (!brandName || !featureId) continue;
      const featureTag = runs[0]?.feature_tag ?? "sdai-unknown";
      const { score, score_band, runs_agreeing, runs_total, flag_for_review, flag_reason } = computeSdaiScore(runs);
      await upsertSdaiFeatureScore({
        brand_name: brandName, feature_id: featureId, feature_tag: featureTag,
        score, score_band: score_band ?? "absent",
        runs_agreeing: runs_agreeing ?? null, runs_total,
        flagged_for_review: flag_for_review, flag_reason,
        notes: null, grounded_source: runs.some((r) => r.grounded),
      });
      scored++;
      if (flag_for_review) flagged++;
    }

    console.log(`[sdai-feature-aggregate] done — date=${today}, scored=${scored}, flagged=${flagged}, ts=${runTimestamp}`);

    if (flagged > scored * 0.5 && scored > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — SDAI Feature Scoring elevated flags (${today})`,
        html: `<h2>SDAI Feature Scoring</h2><p>Timestamp: ${runTimestamp} | Date: ${today} | Scored: ${scored} | Flagged: ${flagged}</p>`,
      }).catch(() => {});
    }

    return Response.json({ mode: "sdai_feature_scoring", date: today, pairs_scored: scored, flagged });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] sdai-feature-aggregate crashed:`, message);
    await sendEmail({
      subject: `[AgenticLib] CRASH — SDAI Feature Aggregate (${today ?? "unknown"})`,
      html: `<h2>SDAI Feature Aggregate — Crash</h2><p>Timestamp: ${runTimestamp} | Error: ${message}</p>`,
    }).catch(() => {});
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
