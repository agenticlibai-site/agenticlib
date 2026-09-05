import type { Metadata } from "next";
import Script from "next/script";
import { domains } from "@/data/agents";

export const metadata: Metadata = {
  robots: { index: false },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "AgenticLib — Product and Marketing Intelligence by Domain",
  description:
    "Explore AI agent product and marketing intelligence organised by business domain on AgenticLib.",
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
