import type { Metadata } from "next";
import Script from "next/script";
import { domains } from "@/data/agents";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  robots: { index: false },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "FeatureStream — Product and Marketing Intelligence by Domain",
  description:
    "Explore AI agent product and marketing intelligence organised by business domain on FeatureStream.",
  url: `${SITE_URL}/explore`,
  numberOfItems: domains.length,
  itemListElement: domains.map((d, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `Best AI Agents for ${d.name}`,
    url: `${SITE_URL}/domain/${d.slug}`,
    description: `Discover and compare the best AI agents for ${d.name} on FeatureStream.`,
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
