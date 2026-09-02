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
    <main className="min-h-screen page-gap-fix" style={{ background: "#F7F8FC" }}>

      {/* Header */}
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
            Superdegree Report: AI Video Creation Visibility
          </h1>
          <p className="text-base" style={{ color: "#000000", lineHeight: 1.6, maxWidth: 560 }}>
            How AI models recommend and describe AI video creation platforms across Claude Haiku and GPT-4o-mini, updated daily.
          </p>

          {/* Collection health strip */}
          <div style={{
            marginTop: 14,
            display: "inline-flex",
            flexWrap: "wrap" as const,
            gap: "6px 18px",
            fontSize: 13,
            color: "#000",
            background: "rgba(124,58,237,0.05)",
            border: "1px solid rgba(124,58,237,0.15)",
            borderRadius: 8,
            padding: "8px 14px",
          }}>
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
            <span style={{ color: "rgba(0,0,0,0.4)" }}>Updated {now} AEST</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="max-w-7xl mx-auto px-6 pb-0">
        <SdaiVisibilityCharts
          dailySummary={dailySummary}
          weeklySummary={weeklySummary}
          llmVisibility={llmVisibility}
          sovData={sovData}
          clusterPositions={clusterPositions}
          featureScores={featureScores}
          sentimentData={sentimentData}
        />
      </div>

      {/* Glossary + Disclaimer */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <div style={{ marginTop: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <span style={{
              fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const,
              color: "#7C3AED", background: "rgba(124,58,237,0.08)", borderRadius: 999, padding: "6px 16px",
            }}>Glossary</span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {[
              { term: "Brand Coverage Over Time", def: "Shows how often each brand is mentioned by AI models across multiple days. This helps identify whether a brand's AI visibility is stable, increasing, or decreasing over time." },
              { term: "Brand Mentions", def: "The total number of times a brand is referenced by AI models across the prompts included in this report. Higher mentions generally indicate greater visibility within AI-generated recommendations." },
              { term: "Avg Brand Position", def: "The average rank at which a brand appears within an AI model's response. Position 1 means the brand was named first. Lower numbers indicate the brand is consistently surfaced earlier and more prominently." },
              { term: "Visibility by LLM / Model", def: "Compares how frequently each AI model (Claude Haiku and GPT-4o-mini) mentions each brand. This highlights differences in brand awareness and recommendation behaviour across models." },
              { term: "Share of Voice by Cluster", def: "Measures the percentage of brand mentions within a specific video creation cluster. Rather than showing overall popularity, it shows which brands dominate each individual category." },
              { term: "Feature Score", def: "A 0–100 score reflecting how well an AI model can confirm and describe a specific product capability for a given brand. High (90): clearly confirmed. Medium (70): confirmed but less detailed. Low (35): mixed signals. Weak (10): not confirmed." },
              { term: "Sentiment", def: "How AI models characterise a brand when describing it, classified as Positive, Neutral, or Negative based on the language used across model responses." },
            ].map(({ term, def }, i, arr) => (
              <div key={term} style={{ display: "flex", gap: 32, padding: "18px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                <div style={{ width: 220, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#000", lineHeight: 1.4, display: "inline-block" }}>{term}</span>
                </div>
                <p style={{ fontSize: 13, color: "#000", lineHeight: 1.75, margin: 0 }}>{def}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 48, borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 10 }}>Disclaimer &amp; Terms of Use</p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            This report was created by AgenticLib. All feature scores, rankings, and assessments are based on publicly available information at the time of research and represent AgenticLib&apos;s independent evaluation.
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            Competitive intelligence data is derived from automated queries to Claude Haiku and GPT-4o-mini APIs. This data reflects model output at specific points in time and may not represent the current or future state of any brand&apos;s market position.
          </p>
          <p style={{ fontSize: 11, color: "#000", marginTop: 14 }}>
            © {new Date().getFullYear()} AgenticLib. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
