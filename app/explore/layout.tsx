import type { Metadata } from "next";
import Script from "next/script";
import { domains } from "@/data/agents";

export const metadata: Metadata = {
  title: "AI Agent Library — Browse 250+ Agents Across 90+ Business Domains",
  description:
    "Explore the AgenticLib AI agent library. Find the best AI agents for customer support, marketing, real estate, finance, education, and 90+ other business domains. Compare agents side by side.",
  keywords: [
    "AI agent library",
    "agents library",
    "agentic library",
    "AI agents by industry",
    "browse AI agents",
    "AI agent database",
    "best AI agent for customer support",
    "best AI agent for marketing",
    "best AI agent for real estate",
  ],
  openGraph: {
    title: "AI Agent Library — Browse 250+ Agents Across 90+ Business Domains",
    description:
      "Explore 250+ AI agents across 90+ business domains. Find, compare, and decide on the best AI agent for your industry.",
    url: "https://agenticlib.com/explore",
  },
  alternates: {
    canonical: "https://agenticlib.com/explore",
  },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "AI Agent Library — Business Domain Categories",
  description:
    "Browse AI agents organised by business domain on AgenticLib — the leading AI agent discovery platform.",
  url: "https://agenticlib.com/explore",
  numberOfItems: domains.length,
  itemListElement: domains.map((d, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `Best AI Agents for ${d.name}`,
    url: `https://agenticlib.com/domain/${d.slug}`,
    description: `Discover and compare the best AI agents for ${d.name} on AgenticLib.`,
  })),
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="explore-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
