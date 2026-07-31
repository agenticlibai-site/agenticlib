import {
  getSalesDailySummary,
  getSalesWeeklySummary,
  getSalesLLMVisibility,
  getSalesSOVData,
  getSalesClusterBrandPositions,
  getSalesFeatureScores,
  getSalesSentimentData,
} from "@/lib/brand-visibility/db";
import BackstoryReportCharts from "./BackstoryReportCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Backstory.ai — Deal Risk & Pipeline Forecasting Visibility Report",
  description:
    "LLM visibility, share of voice, and feature analysis for Backstory.ai in the Deal Risk & Pipeline Forecasting category.",
};

export default async function BackstoryReportPage() {
  const [dailySummary, weeklySummary, llmVisibility, sovData, clusterPositions, featureScores, sentimentData] =
    await Promise.all([
      getSalesDailySummary(15),
      getSalesWeeklySummary(),
      getSalesLLMVisibility(),
      getSalesSOVData(),
      getSalesClusterBrandPositions(),
      getSalesFeatureScores(),
      getSalesSentimentData(),
    ]);

  return (
    <main className="min-h-screen" style={{ background: "#F7F8FC" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div style={{ marginBottom: 28 }}>
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(190,24,93,0.10)", color: "#BE185D" }}
          >
            Brand Intelligence · Deal Risk & Pipeline Forecasting
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "#000000", letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Backstory.ai Visibility Report
          </h1>
          <p className="text-base" style={{ color: "#000000", lineHeight: 1.6, maxWidth: 560 }}>
            How AI models recommend and describe Backstory.ai across Claude and GPT-4o-mini,
            benchmarked against the Deal Risk & Pipeline Forecasting category.
          </p>
          <div style={{
            marginTop: 14,
            display: "inline-flex",
            flexWrap: "wrap" as const,
            gap: "6px 18px",
            fontSize: 13,
            color: "#000",
            background: "rgba(190,24,93,0.05)",
            border: "1px solid rgba(190,24,93,0.15)",
            borderRadius: 8,
            padding: "8px 14px",
          }}>
            <span><strong>Scoring window:</strong> Jul 6–12 2026 · 19 tracked brands · Claude Haiku + GPT-4o mini</span>
            <span style={{ color: "rgba(0,0,0,0.25)" }}>·</span>
            <span><strong>Rebranded</strong> from People.ai, April 2026</span>
          </div>
        </div>

        <BackstoryReportCharts
          dailySummary={dailySummary}
          weeklySummary={weeklySummary}
          llmVisibility={llmVisibility}
          sovData={sovData}
          clusterPositions={clusterPositions}
          featureScores={featureScores}
          sentimentData={sentimentData}
        />

        {/* Glossary */}
        <div style={{ marginTop: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <span style={{
              fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const,
              color: "#BE185D", background: "rgba(190,24,93,0.08)", borderRadius: 999, padding: "6px 16px",
            }}>
              Glossary
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {[
              { term: "Brand Mentions", def: "The total number of times a brand is referenced by AI models across the prompts included in this report." },
              { term: "Avg Brand Position", def: "The average rank at which a brand appears within an AI model's response. Position 1 means named first. Lower numbers indicate stronger, earlier placement." },
              { term: "Share of Voice", def: "The percentage of brand mentions within a specific use case cluster. Shows which brands dominate each category, not just overall popularity." },
              { term: "Feature Score", def: "A 0–100 score reflecting how well an AI model can confirm and describe a specific product capability. Strong (90): clearly confirmed. Partial (35): mixed signals. Weak (10): not confirmed. Undocumented: insufficient public data to score." },
              { term: "Documentation Gap", def: "A capability that likely exists in the product but isn't publicly described in enough detail for LLMs to confirm it. Fix: publish clear, indexed product documentation." },
            ].map(({ term, def }, i, arr) => (
              <div key={term} style={{
                display: "flex", gap: 32, padding: "18px 0",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
              }}>
                <div style={{ width: 220, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#000", lineHeight: 1.4, display: "inline-block" }}>{term}</span>
                </div>
                <p style={{ fontSize: 13, color: "#000", lineHeight: 1.75, margin: 0 }}>{def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 48, borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 10 }}>Disclaimer &amp; Terms of Use</p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            This report was created by AgenticLib. All feature scores, rankings, and assessments are based on publicly available information at the time of research and represent AgenticLib&apos;s independent evaluation. They are not official ratings, endorsements, or certifications.
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            Competitive intelligence data is derived from automated queries to Claude Haiku and GPT-4o-mini APIs. Scores reflect model output at specific points in time and may not represent the current state of any brand&apos;s product. This report is intended for the private use of its recipient.
          </p>
          <p style={{ fontSize: 11, color: "#000", marginTop: 14 }}>
            © {new Date().getFullYear()} AgenticLib. All rights reserved.
          </p>
        </div>

      </div>
    </main>
  );
}
