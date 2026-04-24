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
  title: "AgenticLib — Find the Best AI Agent for Your Use Case",
  description:
    "Discover, compare, and deploy the best AI agents for marketing, sales, education, and productivity. AgenticLib is the definitive AI agent discovery platform.",
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
