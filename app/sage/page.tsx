import {
  getLockedSOVByClusters,
  getFeatureScores,
  getMarketingLockedBrandPositions,
  getMarketingCoverageByDay,
  getMarketingSOVAllTime,
  getMarketingSentimentData,
  getSalesLockedBrandPositions,
  getSalesFeatureScores,
  getSalesCoverageByDay,
  getSalesSOVAllTime,
  getSalesSentimentData,
  getDexifyByCluster,
  getDexifyFeatureScores,
  getDexifySentimentData,
} from "@/lib/brand-visibility/db";
import { getSkincareUseCaseBuckets } from "@/lib/skincare-visibility/db";
import { FEATURES as MARKETING_FEATURE_DEFS_FULL } from "@/lib/brand-visibility/features";
import { FEATURES as SALES_FEATURE_DEFS_FULL } from "@/lib/brand-visibility/sales-features";
import { DEXIFY_FEATURES as DEXIFY_FEATURE_DEFS_FULL } from "@/lib/brand-visibility/dexify-features";
import SageCharts from "./SageCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sage — Competitor Intelligence · AgenticLib",
  description: "See the top brands in your domain, compare product feature scores, and find where rivals outrank you.",
};

export default async function SagePage() {
  const [
    marketingSOV,
    marketingFeatures,
    marketingClusters,
    marketingCoverage,
    marketingSOVAll,
    marketingSentimentResult,
    salesClusters,
    salesFeatures,
    salesCoverage,
    salesSOV,
    salesSentimentResult,
    dexifyClusters,
    dexifyFeatures,
    dexifySentimentResult,
    skincareClusters,
  ] = await Promise.all([
    getLockedSOVByClusters(),
    getFeatureScores(),
    getMarketingLockedBrandPositions(),
    getMarketingCoverageByDay(),
    getMarketingSOVAllTime(),
    getMarketingSentimentData().catch(() => ({ rows: [], meta: { dual_model_dates: 0, earliest_date: null, latest_date: null } })),
    getSalesLockedBrandPositions(),
    getSalesFeatureScores(),
    getSalesCoverageByDay(),
    getSalesSOVAllTime(),
    getSalesSentimentData().catch(() => ({ rows: [], meta: { dual_model_dates: 0, earliest_date: null, latest_date: null } })),
    getDexifyByCluster(),
    getDexifyFeatureScores(),
    getDexifySentimentData(),
    getSkincareUseCaseBuckets(),
  ]);

  return (
    <SageCharts
      marketingSOV={marketingSOV}
      marketingFeatures={marketingFeatures}
      marketingFeatureDefs={MARKETING_FEATURE_DEFS_FULL.map(f => ({ feature_id: f.feature_id, feature_tag: f.feature_tag, feature_name: f.feature_name }))}
      marketingClusters={marketingClusters}
      marketingCoverage={marketingCoverage}
      marketingSOVAll={marketingSOVAll}
      marketingSentiment={marketingSentimentResult.rows}
      salesClusters={salesClusters}
      salesFeatures={salesFeatures}
      salesCoverage={salesCoverage}
      salesSOV={salesSOV}
      salesSentiment={salesSentimentResult.rows}
      salesFeatureDefs={SALES_FEATURE_DEFS_FULL.map(f => ({ feature_id: f.feature_id, feature_tag: f.feature_tag, feature_name: f.feature_name }))}
      dexifyClusters={dexifyClusters}
      dexifyFeatures={dexifyFeatures}
      dexifyFeatureDefs={DEXIFY_FEATURE_DEFS_FULL.map(f => ({ feature_id: f.feature_id, feature_tag: f.feature_tag, feature_name: f.feature_name }))}
      dexifySentiment={dexifySentimentResult.rows}
      skincareClusters={skincareClusters}
    />
  );
}
