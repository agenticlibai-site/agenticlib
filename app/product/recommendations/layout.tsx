import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sage: AI Agent Recommendations",
  description: "Sage by FeatureStream turns a few questions about your workflow into matched, explainable AI agent recommendations.",
  alternates: { canonical: "/product/recommendations" },
  openGraph: { type: "website", siteName: "FeatureStream", title: "Sage: AI Agent Recommendations | FeatureStream", url: "/product/recommendations", images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
};

export default function RecommendationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
