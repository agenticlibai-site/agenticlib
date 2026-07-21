import {
  getSalesDailySummary,
  getSalesWeeklySummary,
  getSalesLLMVisibility,
  getSalesSOVData,
  getSalesClusterBrandPositions,
  getSalesFeatureScores,
  getSalesSentimentData,
} from "@/lib/brand-visibility/db";
import SalesVisibilityCharts from "./SalesVisibilityCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sales AI Agent Visibility – AgenticLib",
  description:
    "How AI models recommend and describe sales AI agent brands across Claude and GPT-4o-mini, updated daily.",
};

export default async function SalesVisibilityPage() {
  const [dailySummary, weeklySummary, llmVisibility, sovData, clusterPositions, featureScores, sentimentData] = await Promise.all([
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

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(37,99,235,0.10)", color: "#2563EB" }}
          >
            Brand Intelligence · Sales
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "#000000", letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Lamigo Report: Sales AI Agent Visibility
          </h1>
          <p className="text-base" style={{ color: "#000000", lineHeight: 1.6, maxWidth: 560 }}>
            How AI models recommend and describe sales AI agent brands across Claude and GPT-4o-mini, updated daily.
          </p>
          <div style={{
            marginTop: 14,
            display: "inline-flex",
            flexWrap: "wrap" as const,
            gap: "6px 18px",
            fontSize: 13,
            color: "#000",
            background: "rgba(37,99,235,0.05)",
            border: "1px solid rgba(37,99,235,0.15)",
            borderRadius: 8,
            padding: "8px 14px",
          }}>
            <span><strong>Salesloft acquired Clari</strong>, merged Dec 2025, tracked separately as Salesloft (Clari)</span>
            <span style={{ color: "rgba(0,0,0,0.25)" }}>·</span>
            <span><strong>ZoomInfo acquired Chorus</strong> in 2021, tracked separately as ZoomInfo (Chorus)</span>
          </div>
        </div>

        <SalesVisibilityCharts
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
              color: "#2563EB", background: "rgba(37,99,235,0.08)", borderRadius: 999, padding: "6px 16px",
            }}>
              Glossary
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {[
              {
                term: "Brand Coverage Over Time",
                def: "Shows how often each brand is mentioned by AI models across multiple days. This helps identify whether a brand's AI visibility is stable, increasing, or decreasing over time.",
              },
              {
                term: "Brand Mentions",
                def: "The total number of times a brand is referenced by AI models across the prompts included in this report. Higher mentions generally indicate greater visibility within AI-generated recommendations.",
              },
              {
                term: "Avg Brand Position",
                def: "The average rank at which a brand appears within an AI model's response. Position 1 means the brand was named first. Lower numbers indicate the brand is consistently surfaced earlier and more prominently. A brand can have many mentions but a weak position if it is typically listed near the bottom.",
              },
              {
                term: "Visibility by LLM / Model",
                def: "Compares how frequently each AI model (Claude Haiku and GPT-4o-mini) mentions each brand. This highlights differences in brand awareness and recommendation behaviour across models.",
              },
              {
                term: "Share of Voice by Use Case",
                def: "Measures the percentage of brand mentions within a specific sales use case (such as call intelligence, CRM automation, or deal risk detection). Rather than showing overall popularity, it shows which brands dominate each individual category.",
              },
              {
                term: "Feature Score",
                def: "A 0–100 score reflecting how well an AI model can confirm and describe a specific product capability for a given brand. Scores require agreement between both models; when they disagree, the more conservative rating is used. Strong (90): capability clearly confirmed with specific evidence. Present (70): confirmed but less detailed. Partial (35): partially confirmed or mixed signals. Weak (10): capability not confirmed.",
              },
              {
                term: "Sentiment",
                def: "How AI models characterise a brand when describing it, classified as Positive, Neutral, or Negative based on the language used across model responses. The percentage shown reflects the share of positive responses out of all responses for that brand.",
              },
            ].map(({ term, def }, i, arr) => (
              <div key={term} style={{
                display: "flex",
                gap: 32,
                padding: "18px 0",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
              }}>
                <div style={{ width: 220, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: "#000", lineHeight: 1.4,
                    display: "inline-block",
                  }}>{term}</span>
                </div>
                <p style={{ fontSize: 13, color: "#000", lineHeight: 1.75, margin: 0 }}>{def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer & Terms of Use */}
        <div style={{
          marginTop: 48,
          borderTop: "1px solid rgba(0,0,0,0.08)",
          paddingTop: 28,
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 10 }}>
            Disclaimer &amp; Terms of Use
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            All feature scores, rankings, and assessments are based on publicly available information at the time of research and represent AgenticLib&apos;s independent evaluation. They are not official ratings, endorsements, or certifications of the brands, products, or technologies assessed.
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            Brand names, product names, and trademarks referenced in this report are the property of their respective owners. Their inclusion does not imply affiliation with, sponsorship by, or endorsement from any referenced brand or company.
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            Competitive intelligence data (including brand mention counts, share-of-voice figures, and AI model visibility scores) is derived from automated queries to publicly accessible large language model APIs (Claude Haiku and GPT-4o-mini). This data reflects model output at specific points in time and may not represent the current or future state of any brand&apos;s market position. Scores and rankings may change as AI models are updated and new data is collected.
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            Feature information may become outdated as brands update their products and services. AgenticLib makes no warranty, express or implied, as to the accuracy, completeness, or timeliness of the information in this report.
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            This report is intended for the private use of its recipient. Redistribution, publication, or commercial use of its contents without the prior written consent of AgenticLib is not permitted.
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7 }}>
            Nothing in this report should be construed as a claim that any competitor&apos;s product is defective, unsafe, or unfit for its intended purpose. All comparative analysis is made in good faith on the basis of publicly available information.
          </p>
          <p style={{ fontSize: 11, color: "#000", marginTop: 14 }}>
            © {new Date().getFullYear()} AgenticLib. All rights reserved.
          </p>
        </div>

      </div>
    </main>
  );
}
