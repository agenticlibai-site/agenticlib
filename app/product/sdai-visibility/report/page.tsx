import {
  getSdaiDailySummary,
  getSdaiWeeklySummary,
  getSdaiLLMVisibility,
  getSdaiSOVData,
  getSdaiCollectionHealth,
  getSdaiClusterBrandPositions,
  getSdaiFeatureScores,
  getSdaiSentimentData,
  initSdaiDB,
} from "@/lib/brand-visibility/db";
import SdaiVisibilityCharts from "../SdaiVisibilityCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Superdegree Report: AI Video Creation Visibility – AgenticLib",
  description:
    "Which AI video creation platforms appear when LLMs are asked about recording, editing, voice cloning, captions, translation, and distribution.",
  robots: { index: false, follow: false },
};

export default async function SdaiReportPage() {
  // ── Data fetch ───────────────────────────────────────────────────────────────
  await initSdaiDB();

  const [
    dailySummary,
    weeklySummary,
    llmVisibility,
    sovData,
    health,
    clusterPositions,
    featureScores,
    sentimentData,
  ] = await Promise.all([
    getSdaiDailySummary(7),
    getSdaiWeeklySummary(),
    getSdaiLLMVisibility(),
    getSdaiSOVData(),
    getSdaiCollectionHealth(),
    getSdaiClusterBrandPositions(),
    getSdaiFeatureScores(),
    getSdaiSentimentData(),
  ]);

  const now = new Date().toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Australia/Sydney",
  });

  return (
    <main className="min-h-screen page-gap-fix" style={{ background: "#F5F3FF" }}>

      {/* ── Header ── */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-0">
        <div style={{ marginBottom: 28 }}>
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(124,58,237,0.10)", color: "#7C3AED" }}
          >
            Brand Intelligence · AI Video Creation
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "#000000", letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            AI Video Creation Visibility Report
          </h1>
          <p className="text-base" style={{ color: "#444", lineHeight: 1.6, maxWidth: 580 }}>
            Which AI video creation platforms appear when Claude and GPT-4o-mini are asked about
            screen recording, AI production, voice cloning, captions, translation, distribution,
            branding, and team collaboration.
          </p>

          {/* Collection health strip */}
          <div
            style={{
              marginTop: 16,
              display: "inline-flex",
              flexWrap: "wrap" as const,
              gap: "6px 20px",
              fontSize: 13,
              color: "#333",
              background: "rgba(124,58,237,0.06)",
              border: "1px solid rgba(124,58,237,0.14)",
              borderRadius: 10,
              padding: "10px 16px",
            }}
          >
            <span><strong style={{ color: "#7C3AED" }}>Days collected:</strong> {health.dates_collected}</span>
            <span><strong style={{ color: "#7C3AED" }}>Total rows:</strong> {health.total_rows.toLocaleString()}</span>
            {health.model_breakdown.map((m) => (
              <span key={m.model}>
                <strong style={{ color: "#7C3AED" }}>{m.model}:</strong> {m.row_count.toLocaleString()} rows
              </span>
            ))}
            {health.earliest_date && (
              <span>
                <strong style={{ color: "#7C3AED" }}>Range:</strong>{" "}
                {health.earliest_date} → {health.latest_date}
              </span>
            )}
            <span style={{ color: "#888" }}>Updated {now} AEST</span>
          </div>
        </div>
      </div>

      {/* ── Charts (client component) ── */}
      <SdaiVisibilityCharts
        dailySummary={dailySummary}
        weeklySummary={weeklySummary}
        llmVisibility={llmVisibility}
        sovData={sovData}
        clusterPositions={clusterPositions}
        featureScores={featureScores}
        sentimentData={sentimentData}
      />

    </main>
  );
}
