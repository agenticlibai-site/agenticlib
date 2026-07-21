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
    "How AI models recommend and describe sales AI agent brands across Claude and GPT-4o-mini — updated daily.",
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
            Sales AI Agent Visibility
          </h1>
          <p className="text-base" style={{ color: "#000000", lineHeight: 1.6, maxWidth: 560 }}>
            How AI models recommend and describe sales AI agent brands across Claude and GPT-4o-mini — updated daily.
          </p>
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

        {/* Data source note */}
        <p style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginTop: 32, textAlign: "center" }}>
          Based on {23} daily prompts across Claude Haiku and GPT-4o-mini · Sales AI agent category · collecting since July 2026
        </p>
        <p style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", marginTop: 10, textAlign: "center", maxWidth: 680, margin: "10px auto 0" }}>
          Scores require agreement between both AI models. When models disagree, we take the more conservative rating — so a lower score sometimes means models disagree, not that documentation is absent. Check the evidence text for the fuller picture.
        </p>

        {/* Disclaimer & Terms of Use */}
        <div style={{
          marginTop: 48,
          borderTop: "1px solid rgba(0,0,0,0.08)",
          paddingTop: 28,
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 10 }}>
            Disclaimer &amp; Terms of Use
          </p>
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", lineHeight: 1.7, marginBottom: 10 }}>
            This report was created by <strong>AgenticLib</strong> (agenticlib.com). All data, scores, rankings, sentiment analysis, and commentary contained herein are generated and owned by AgenticLib. Unauthorised reproduction, distribution, or commercial use of this report or any portion of it without the prior written consent of AgenticLib is strictly prohibited.
          </p>
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", lineHeight: 1.7, marginBottom: 10 }}>
            Brand mentions, feature scores, and sentiment data are derived from automated AI model queries (Claude Haiku and GPT-4o-mini) and reflect how those models respond to standardised prompts at the time of collection. They do not constitute an endorsement of, or negative judgment on, any brand. Scores and rankings may change as AI models are updated and new data is collected.
          </p>
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", lineHeight: 1.7 }}>
            This report is provided for informational purposes only. AgenticLib makes no warranties, express or implied, as to the accuracy, completeness, or fitness for a particular purpose of the information contained herein. AgenticLib shall not be liable for any decisions made in reliance on this report.
          </p>
          <p style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", marginTop: 14 }}>
            © {new Date().getFullYear()} AgenticLib. All rights reserved.
          </p>
        </div>

      </div>
    </main>
  );
}
