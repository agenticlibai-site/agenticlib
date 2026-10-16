import type { Metadata } from "next";

export const metadata: Metadata = {
  // Old AgenticLib product page: kept reachable by link but hidden from search.
  robots: { index: false, follow: true },
  title: "Vera: Research & Compare AI Agents",
  description: "Vera by FeatureStream gives you a curated breakdown of any AI agent's capabilities, pricing and visibility, and compares agents side by side.",
  alternates: { canonical: "/product/research" },
  openGraph: { type: "website", siteName: "FeatureStream", title: "Vera: Research & Compare AI Agents | FeatureStream", url: "/product/research", images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
