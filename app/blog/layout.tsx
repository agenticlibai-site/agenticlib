import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Blog", template: "%s | FeatureStream" },
  description: "Guides and insights on AI agents, agentic products and product management for AI agent builders, from the FeatureStream team.",
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", siteName: "FeatureStream", title: "FeatureStream Blog", url: "/blog", images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
