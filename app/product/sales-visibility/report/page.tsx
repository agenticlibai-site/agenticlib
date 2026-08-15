import {
  getSalesDailySummary,
  getSalesWeeklySummary,
  getSalesLLMVisibility,
  getSalesSOVData,
  getSalesClusterBrandPositions,
  getSalesFeatureScores,
  getSalesSentimentData,
} from "@/lib/brand-visibility/db";
import SalesVisibilityCharts from "../SalesVisibilityCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lamigo Report – Sales AI Agent Visibility",
  description: "Internal Lamigo sales AI agent visibility report.",
  robots: { index: false, follow: false },
};

export default async function SalesReportPage() {
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
    <main className="min-h-screen page-gap-fix" style={{ background: "#F7F8FC" }}>
      <SalesVisibilityCharts
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
