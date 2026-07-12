import Link from "next/link";
import { getLockedDailySummary, getLockedBrandPositions, getLockedSOVByClusters, getROIDonutSOV, getWeeklySummary, getLLMVisibility, getPerceptionGaps, getFeatureScores, getMarketingSentimentData, initBrandVisibilityDB } from "@/lib/brand-visibility/db";
import BrandVisibilityCharts from "./BrandVisibilityCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Brand Visibility",
  description: "Track how AI marketing agent brands appear across Claude and GPT-4o mini responses over time.",
};

async function getData() {
  try {
    await initBrandVisibilityDB();
    const [dailySummary, weeklySummary, llmVisibility, brandPositions, sovData, roiData, perceptionGaps, featureScores, sentimentData] = await Promise.all([
      getLockedDailySummary(9),
      getWeeklySummary(),
      getLLMVisibility(),
      getLockedBrandPositions(),
      getLockedSOVByClusters(),
      getROIDonutSOV(),
      getPerceptionGaps(),
      getFeatureScores(),
      getMarketingSentimentData(),
    ]);
    return { dailySummary, weeklySummary, llmVisibility, brandPositions, sovData, roiData, perceptionGaps, featureScores, sentimentData };
  } catch {
    return { dailySummary: [], weeklySummary: [], llmVisibility: [], brandPositions: [], sovData: [], roiData: [], perceptionGaps: [], featureScores: [], sentimentData: { rows: [], meta: { dual_model_dates: 0, earliest_date: null, latest_date: null } } };
  }
}

export default async function BrandVisibilityPage() {
  const { dailySummary, weeklySummary, llmVisibility, brandPositions, sovData, roiData, perceptionGaps, featureScores, sentimentData } = await getData();

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(170deg, #FEF0F5 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #FEF0F5 100%)", backgroundAttachment: "fixed" }}
    >
      {/* Background grain */}
      <svg className="pointer-events-none fixed inset-0 w-full h-full z-0" style={{ opacity: 0.10 }} aria-hidden="true">
        <filter id="grain-bv">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-bv)" />
      </svg>

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div style={{ position: "absolute", top: "-80px", right: "-120px", width: "600px", height: "600px", borderRadius: "50%", background: "rgba(124,58,237,0.07)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(94,108,232,0.07)", filter: "blur(70px)" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ textDecoration: "none", background: "white", borderRadius: 8, padding: "8px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", color: "#7C3AED" }}
        >
          ← AgenticLib
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        {/* Header */}
        <div className="mb-10">
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(124,58,237,0.10)", color: "#7C3AED" }}
          >
            Brand Intelligence
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "#000000", letterSpacing: "-0.02em" }}>
            Brand Visibility
          </h1>
          <p className="text-base max-w-xl" style={{ color: "#000000", lineHeight: 1.6 }}>
            How AI marketing agent brands appear in Claude and GPT-4o mini responses across 22 prompts,
            5 runs each, collected daily.
          </p>
        </div>

        {/* Charts */}
        <BrandVisibilityCharts
          dailySummary={dailySummary}
          weeklySummary={weeklySummary}
          llmVisibility={llmVisibility}
          brandPositions={brandPositions}
          sovData={sovData}
          roiData={roiData}
          perceptionGaps={perceptionGaps}
          featureScores={featureScores}
          sentimentData={sentimentData}
        />
      </div>
    </main>
  );
}
