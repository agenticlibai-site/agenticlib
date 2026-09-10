import {
  getHsaiTopBrands,
  getHsaiByCluster,
  getHsaiByModel,
  getHsaiTrendByCluster,
  getHsaiFeatureScores,
  getHsaiSentimentData,
  getHsaiBuyerIntent,
} from "@/lib/brand-visibility/db";
import HsaiVisibilityCharts from "./HsaiVisibilityCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ranger AI Report – AgenticLib",
  description:
    "Which hospitality AI agent platforms appear when LLMs are asked about guest communication, concierge automation, and lodge operations. 12 tracked brands, 11 use case clusters, 3 runs per prompt, collected daily.",
};

export default async function HsaiVisibilityPage() {
  const [topBrands, byCluster, byModel, clusterTrend, featureScores, sentimentData, buyerIntent] = await Promise.all([
    getHsaiTopBrands(25),
    getHsaiByCluster(),
    getHsaiByModel(),
    getHsaiTrendByCluster(),
    getHsaiFeatureScores(),
    getHsaiSentimentData(),
    getHsaiBuyerIntent(),
  ]);

  return (
    <main className="page-gap-fix min-h-screen" style={{ background: "#F7F8FC" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(4,120,87,0.10)", color: "#047857" }}
          >
            Brand Intelligence · Hospitality AI Agents
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "#000000", letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Ranger AI Report
          </h1>
          <p className="text-base" style={{ color: "#000000", lineHeight: 1.6, maxWidth: 600 }}>
            Which AI agent platforms appear when Claude Haiku and GPT-4o-mini are asked about
            guest communication automation, AI concierge tools, lodge operations, and hospitality
            AI for boutique hotels and safari properties. 12 tracked brands, 11 use case clusters, 3 runs each.
          </p>
        </div>

        <HsaiVisibilityCharts
          topBrands={topBrands}
          byCluster={byCluster}
          byModel={byModel}
          clusterTrend={clusterTrend}
          featureScores={featureScores}
          sentimentData={sentimentData}
          buyerIntent={buyerIntent}
        />

        {/* Glossary */}
        <div style={{ marginTop: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <span style={{
              fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const,
              color: "#047857", background: "rgba(4,120,87,0.08)", borderRadius: 999, padding: "6px 16px",
            }}>
              Glossary
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {[
              {
                term: "Brand Mentions",
                def: "The total number of times a brand is named by AI models across all prompts in this report. Higher mentions indicate greater LLM visibility in the hospitality AI agent category.",
              },
              {
                term: "Use Case Split",
                def: "Mention counts broken down by prompt cluster — Booking & Reservations, Guest Inquiry, Multilingual Support, In-stay & Upsell, and others. Shows which brands dominate each specific buyer moment.",
              },
              {
                term: "Visibility by LLM",
                def: "How frequently each AI model (Claude Haiku and GPT-4o-mini) mentions each brand. Differences between models highlight where brand perception diverges across the two main LLMs used in this report.",
              },
              {
                term: "Coverage Over Time",
                def: "Day-by-day mention trend for the tracked brands. Useful for detecting whether a brand's LLM visibility is stable, growing, or declining after publishing new content or getting press coverage.",
              },
              {
                term: "Product Feature Scores",
                def: "A 0–100 score per feature for each of the 12 tracked brands. Scored by consensus across 3 model runs × 2 LLMs. Strong (≥70), Partial (40–69), Weak (1–39), Absent (0).",
              },
              {
                term: "Sentiment Analysis",
                def: "The balance of positive, neutral, and negative descriptors applied by AI models when asked about each brand. Blue-highlighted descriptor tags appear uniquely for that brand; grey tags are shared across brands.",
              },
              {
                term: "Buyer Intent Visibility",
                def: "How often a brand surfaces in decision-stage prompts that simulate a hospitality operator actively choosing which AI agent to invest in — the highest-value moment in the research funnel.",
              },
            ].map(({ term, def }, i, arr) => (
              <div key={term} style={{
                display: "flex",
                gap: 32,
                padding: "18px 0",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
              }}>
                <div style={{ width: 220, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#000", lineHeight: 1.4, display: "inline-block" }}>
                    {term}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#000", lineHeight: 1.75, margin: 0 }}>{def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 48, borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 10 }}>
            Disclaimer &amp; Terms of Use
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            This report was created by AgenticLib. All rankings and assessments are based on automated queries to publicly accessible large language model APIs (Claude Haiku and GPT-4o-mini) and represent AgenticLib&apos;s independent evaluation. They are not official ratings, endorsements, or certifications.
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7, marginBottom: 10 }}>
            Brand names and trademarks referenced are the property of their respective owners. Scores and rankings reflect LLM knowledge as of the collection period and may differ from current product capabilities.
          </p>
          <p style={{ fontSize: 12, color: "#000", lineHeight: 1.7 }}>
            This report is intended for the private use of its recipient. Redistribution or commercial use without prior written consent of AgenticLib is not permitted.
          </p>
          <p style={{ fontSize: 11, color: "#000", marginTop: 14 }}>
            © {new Date().getFullYear()} AgenticLib. All rights reserved.
          </p>
        </div>

      </div>
    </main>
  );
}
