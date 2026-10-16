import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Schibsted_Grotesk, Space_Mono, EB_Garamond, DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import Navbar from "./components/Navbar";
import ContactWidget from "./components/ContactWidget";
import { SITE_URL, SITE_DOMAIN } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FeatureStream — The Product Management OS for AI Agent Builders",
    template: "%s | FeatureStream",
  },
  description:
    "FeatureStream turns customer, market and usage signals into an evidence-backed product roadmap for teams building AI agents. Join the waitlist or book a demo.",
  keywords: [
    "Product Management for AI Agent Builders",
    "Product Management for AI Agent Companies",
    "Roadmap creation for agentic products",
    "Product roadmap for AI agents",
  ],
  applicationName: "FeatureStream",
  authors: [{ name: "FeatureStream" }],
  creator: "FeatureStream",
  openGraph: {
    type: "website",
    siteName: "FeatureStream",
    title: "FeatureStream — The Product Management OS for AI Agent Builders",
    description:
      "Turn customer, market and usage signals into an evidence-backed product roadmap for your AI agent. Built for AI agent builders and product owners.",
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FeatureStream — The Product Management OS for AI Agent Builders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FeatureStream — The Product Management OS for AI Agent Builders",
    description:
      "Turn customer, market and usage signals into an evidence-backed product roadmap for your AI agent. Built for AI agent builders and product owners.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  // No site-wide canonical: it would be inherited by every page without its own and mark them all
  // as duplicates of the homepage. Pages that need one set `alternates.canonical` themselves.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${schibstedGrotesk.variable} ${spaceMono.variable} ${ebGaramond.variable} ${dmSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        {/* JSON-LD — Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "FeatureStream",
            "url": SITE_URL,
            "logo": `${SITE_URL}/logo.png`,
            "description": "FeatureStream is the product management OS for AI agent builders. It turns private business context, customer requests, usage analytics and market signals into a ranked, evidence-backed product roadmap.",
            "sameAs": [],
            "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "email": "srinidhi.murali@featstream.com" },
          }) }}
        />

        <Navbar />

        {/* Page content */}
        {children}

        {/* Floating "Contact us" chat button */}
        <ContactWidget />

        {/* Plausible */}
        <Script
          defer
          data-domain={SITE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />

        {/* Vercel Analytics */}
        <Analytics />

      </body>
    </html>
  );
}
