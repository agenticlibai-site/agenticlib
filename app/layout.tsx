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
    default: "AgenticLib — Comparison Intelligence for AI Agent Builders",
    template: "%s | AgenticLib",
  },
  description:
    "Benchmark your AI agent's visibility against competitors and turn feature gaps into a roadmap — so you show up where buyers are actually asking.",
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
    title: "AgenticLib — Comparison Intelligence for AI Agent Builders",
    description:
      "Benchmark your AI agent's visibility against competitors and turn feature gaps into a roadmap — so you show up where buyers are actually asking.",
    url: "https://agenticlib.com",
    images: [
      {
        url: "/recommendations-cover.png",
        width: 1200,
        height: 630,
        alt: "AgenticLib — Comparison Intelligence for AI Agent Builders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgenticLib — Comparison Intelligence for AI Agent Builders",
    description:
      "Benchmark your AI agent's visibility against competitors and turn feature gaps into a roadmap — so you show up where buyers are actually asking.",
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
