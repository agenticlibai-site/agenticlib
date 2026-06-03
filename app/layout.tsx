import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://agenticlib.com"),
  title: {
    default: "AgenticLib — AI Agent Library & Personalised Recommendations",
    template: "%s | AgenticLib",
  },
  description:
    "AgenticLib is the leading AI agent library. Browse 250+ agents across 90+ business domains, get personalised AI agent recommendations, and find the best AI agent for marketing, customer support, real estate, finance, and more.",
  keywords: [
    "AI agent library",
    "agents library",
    "agentic library",
    "AI agent recommendation",
    "personalised AI agent",
    "find the right AI agent",
    "best AI agent for marketing",
    "best AI agent for customer support",
    "best AI agent for real estate",
    "best AI agent for finance",
    "AI agent comparison",
    "AI agent discovery platform",
  ],
  authors: [{ name: "AgenticLib" }],
  creator: "AgenticLib",
  openGraph: {
    type: "website",
    siteName: "AgenticLib",
    title: "AgenticLib — AI Agent Library & Personalised Recommendations",
    description:
      "Browse 250+ AI agents across 90+ business domains. Get personalised recommendations tailored to your goals, team, and workflow.",
    url: "https://agenticlib.com",
    images: [
      {
        url: "/recommendations-cover.png",
        width: 1200,
        height: 630,
        alt: "AgenticLib — AI Agent Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgenticLib — AI Agent Library & Personalised Recommendations",
    description:
      "Browse 250+ AI agents across 90+ business domains. Get personalised recommendations tailored to your goals, team, and workflow.",
    images: ["/recommendations-cover.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://agenticlib.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        {/* Page content */}
        {children}

        {/* Plausible */}
        <Script
          defer
          data-domain="agenticlib.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />

        {/* Vercel Analytics */}
        <Analytics />

      </body>
    </html>
  );
}
