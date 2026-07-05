import {
  getSalesDailySummary,
  getSalesWeeklySummary,
  getSalesLLMVisibility,
  getSalesSOVData,
} from "@/lib/brand-visibility/db";
import SalesVisibilityCharts from "./SalesVisibilityCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sales AI Agent Visibility – AgenticLib",
  description:
    "How AI models recommend and describe sales AI agent brands across Claude and GPT-4o-mini — updated daily.",
};

export default async function SalesVisibilityPage() {
  const [dailySummary, weeklySummary, llmVisibility, sovData] = await Promise.all([
    getSalesDailySummary(7),
    getSalesWeeklySummary(),
    getSalesLLMVisibility(),
    getSalesSOVData(),
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
        />

        {/* Data source note */}
        <p style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginTop: 32, textAlign: "center" }}>
          Based on {23} daily prompts across Claude Haiku and GPT-4o-mini · Sales AI agent category · collecting since July 2026
        </p>

      </div>
    </main>
  );
}
