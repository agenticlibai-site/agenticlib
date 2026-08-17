import {
  getDexifyTopBrands,
  getDexifyByCluster,
  getDexifyByModel,
  getDexifyTrend,
  getDexifyFeatureScores,
  getDexifySentimentData,
} from "@/lib/brand-visibility/db";
import DexifyVisibilityCharts from "./DexifyVisibilityCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dexify: Tradie AI Agent Visibility – AgenticLib",
  description:
    "Which AI agent brands appear when LLMs are asked about voice quoting, invoicing, and admin agents for tradespeople. Updated daily.",
};

export default async function DexifyVisibilityPage() {
  const [topBrands, byCluster, byModel, trend, featureScores, sentimentData] = await Promise.all([
    getDexifyTopBrands(25),
    getDexifyByCluster(),
    getDexifyByModel(),
    getDexifyTrend(7),
    getDexifyFeatureScores(),
    getDexifySentimentData(),
  ]);

  return (
    <main className="min-h-screen page-gap-fix" style={{ background: "#F7F8FC" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(234,88,12,0.10)", color: "#EA580C" }}
          >
            Brand Intelligence · Tradie AI
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "#000000", letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Dexify: Tradie AI Agent Visibility
          </h1>
          <p className="text-base" style={{ color: "#000000", lineHeight: 1.6, maxWidth: 580 }}>
            Which AI agent brands appear when Claude and GPT-4o-mini are asked about voice
            quoting, post-job invoicing, compliance documentation, and admin agents for
            tradespeople. 25 prompts across 5 use case clusters, 3 runs each, collected daily.
          </p>
        </div>

        {/* Testimonial */}
        <div style={{ marginBottom: 36 }}>
          {/* "Supported by" rule */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.10)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#000", whiteSpace: "nowrap" }}>
              Testimonial
            </span>
            <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.10)" }} />
          </div>
          {/* Quote card */}
          <div style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 14,
            padding: "28px 32px",
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
          }}>
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#EA580C,#F97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: "#fff",
            }}>D</div>
            <div>
              <p style={{ fontSize: 16, color: "#000", lineHeight: 1.7, margin: "0 0 14px", fontStyle: "italic" }}>
                &ldquo;Helped us map Dewwie&apos;s features against the category to identify opportunities for differentiation, and making more informed product decisions.&rdquo;
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#000", margin: 0 }}>
                Founder, Dewwie
              </p>
            </div>
          </div>
        </div>

        <DexifyVisibilityCharts
          topBrands={topBrands}
          byCluster={byCluster}
          byModel={byModel}
          trend={trend}
          featureScores={featureScores}
          sentimentData={sentimentData}
        />

        {/* Glossary */}
        <div style={{ marginTop: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <span style={{
              fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const,
              color: "#EA580C", background: "rgba(234,88,12,0.08)", borderRadius: 999, padding: "6px 16px",
            }}>
              Glossary
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {[
              {
                term: "Brand Mentions",
                def: "The total number of times a brand is named by AI models across all prompts in this report. Higher mentions indicate greater LLM visibility in the tradie AI agent category.",
              },
              {
                term: "Avg Brand Position",
                def: "The average rank at which a brand appears within an AI model's response. Position 1 means named first. Lower numbers indicate the brand is surfaced earlier and more prominently.",
              },
              {
                term: "Use Case Split",
                def: "Mention counts broken down by prompt cluster — General Discovery, Voice-to-Quote, Post-Job Admin, Compliance & Documentation, and Inbound & Client Communication. Shows which brands dominate each specific buyer moment rather than overall popularity.",
              },
              {
                term: "Visibility by LLM",
                def: "How frequently each AI model (Claude Haiku and GPT-4o-mini) mentions each brand. Differences between models highlight where brand perception diverges across the two main LLMs.",
              },
              {
                term: "Coverage Over Time",
                def: "Day-by-day mention trend for the top brands. Useful for detecting whether a brand's LLM visibility is stable, growing, or declining as models are updated.",
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
            Brand names and trademarks referenced are the property of their respective owners. Scores and rankings may change as AI models are updated and new data is collected.
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
