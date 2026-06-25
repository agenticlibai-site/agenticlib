"use client";
import Link from "next/link";
import { useRef } from "react";
import { Target, Lightbulb, ArrowLeftRight, Database, Rocket, BarChart2 } from "lucide-react";

const FEATURES = [
  {
    num: "01", color: "#7C3AED",
    shadow: "0 14px 34px rgba(124,58,237,.08)",
    hoverShadow: "0 14px 34px rgba(124,58,237,.08), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#F3EEFE,#EDE6FD)",
    Icon: Target,
    title: "Requirements-first matching",
    body: "Most directories show you a list. AgenticLib starts by understanding what you actually need: your team size, workflow, and goals. It then matches you to the right agent. No browsing, no guesswork.",
  },
  {
    num: "02", color: "#5E6CE8",
    shadow: "0 14px 34px rgba(94,108,232,.09)",
    hoverShadow: "0 14px 34px rgba(94,108,232,.09), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#EEF0FE,#E5E9FD)",
    Icon: Lightbulb,
    title: "Dynamic, explainable matching",
    body: "Every recommendation explains itself. See which agents were considered, why your top pick ranked highest, and what trade-offs exist — so you make the decision with full context, not blind trust.",
  },
  {
    num: "03", color: "#C2186A",
    shadow: "0 14px 34px rgba(194,24,106,.08)",
    hoverShadow: "0 14px 34px rgba(194,24,106,.08), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#FCEAF3,#F8DFEC)",
    Icon: Rocket,
    title: "Business domain oriented",
    body: "AgenticLib is organised by industry — real estate, finance, marketing, customer support, and more. Every recommendation is built around the specific context and needs of your business domain.",
  },
  {
    num: "04", color: "#E0506A",
    shadow: "0 16px 38px rgba(240,97,122,.12)",
    hoverShadow: "0 16px 38px rgba(240,97,122,.12), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#FFF1F4,#FCE4EC)",
    Icon: Database,
    title: "Data-driven architecture",
    body: "AgenticLib surfaces structured, decision-relevant intelligence rather than generic AI summaries. Every agent profile is built around the dimensions that actually matter for your use case.",
  },
  {
    num: "05", color: "#7C3AED",
    shadow: "0 14px 34px rgba(124,58,237,.08)",
    hoverShadow: "0 14px 34px rgba(124,58,237,.08), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#F3EEFE,#EDE6FD)",
    Icon: ArrowLeftRight,
    title: "Compare agents seamlessly",
    body: "Get a side-by-side breakdown of any two agents across capabilities, pricing, use cases, and visual performance metrics — all in one view.",
  },
  {
    num: "06", color: "#5E6CE8",
    shadow: "0 14px 34px rgba(94,108,232,.09)",
    hoverShadow: "0 14px 34px rgba(94,108,232,.09), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#EEF0FE,#E5E9FD)",
    Icon: BarChart2,
    title: "Comparison Analytics",
    body: "See how AI agents are recommended, described, and rated across Claude, GPT-5, and Gemini in real queries. AgenticLib tracks LLM visibility and sentiment so you deploy with confidence, not guesswork.",
  },
];

export default function RecommendationsPage() {
  const videoPlayedRef = useRef(false);

  const handleVideoPlay = () => {
    if (videoPlayedRef.current) return;
    videoPlayedRef.current = true;
    fetch("/api/notify-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "AI Agent Recommendations Page" }),
    }).catch(() => {});
  };

  return (
    <main style={{ minHeight: "100vh", fontFamily: "var(--font-schibsted), var(--font-geist-sans), sans-serif" }}>

      {/* Nav */}
      <nav style={{ padding: "20px 32px", display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: 8, padding: "8px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.10)", fontSize: 14, fontWeight: 600, color: "#160F2E" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Home
        </Link>
      </nav>

      {/* Hero card — Signature gradient (Purple → Coral) */}
      <div style={{ position: "relative", margin: "0 32px 32px" }}>
        <div style={{ borderRadius: 32, overflow: "hidden", boxShadow: "0 8px 40px rgba(124,58,237,0.22)" }}>
          <div style={{ position: "relative" }}>
            {/* Gradient background */}
            <div style={{ position: "absolute", inset: 0, background: [
              "radial-gradient(circle at 2% 0%,   rgba(124,58,237,.70) 0%, transparent 48%)",
              "radial-gradient(circle at 96% 8%,  rgba(199,60,142,.65) 0%, transparent 50%)",
              "radial-gradient(circle at 90% 95%, rgba(240,97,122,.50) 0%, transparent 50%)",
              "radial-gradient(circle at 4%  95%, rgba(199,60,142,.40) 0%, transparent 50%)",
              "linear-gradient(135deg, #7C3AED 0%, #C73C8E 55%, #F0617A 100%)",
            ].join(", ") }} />
            {/* Frosted glass veil */}
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(70px) saturate(140%)", WebkitBackdropFilter: "blur(70px) saturate(140%)", background: "rgba(255,255,255,.10)" }} />
            {/* Content */}
            <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "60px 48px 56px" }}>
              <p style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, letterSpacing: ".22em", color: "rgba(255,255,255,0.65)", margin: "0 0 20px", textTransform: "uppercase" }}>Sage by AgenticLib</p>
              <h1 style={{ fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#fff", margin: "0 0 18px" }}>
                AI Agent Recommendations
              </h1>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.82)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.5 }}>
                Watch how Sage AI turns a few simple questions into tailored AI agent recommendations.
              </p>
              <a href="/recommend" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.40)", borderRadius: 9999, padding: "13px 28px", fontSize: 15, fontWeight: 600, color: "#fff", textDecoration: "none", letterSpacing: "-0.01em" }}>
                Try Sage ›
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Video */}
      <div style={{ maxWidth: 900, margin: "0 auto 56px", padding: "0 32px" }}>
        <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 8px rgba(0,0,0,0.04), 0 20px 60px rgba(124,58,237,0.10)" }}>
          <video
            src="/AgenticLib demo video.mp4"
            controls
            poster="/recommendations-cover.png"
            style={{ width: "100%", display: "block" }}
            onPlay={handleVideoPlay}
          />
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto 40px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, letterSpacing: ".22em", color: "#C2186A", margin: "0 0 14px" }}>WHAT MAKES SAGE UNIQUE</p>
          <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1.06, margin: 0, color: "#0E1320" }}>Built to match you from the start</h2>
        </div>

        <div className="caps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {FEATURES.map(({ num, color, shadow, hoverShadow, iconBg, Icon, title, body }) => (
            <div
              key={title}
              style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: shadow, transition: "box-shadow 0.3s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = hoverShadow; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = shadow; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                  <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color }}>{num}</span>
                  <span style={{ height: 1, flex: 1, background: `linear-gradient(90deg,${color}55,transparent)`, display: "block" }} />
                </div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#0E1320" }}>{title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A4256", margin: 0 }}>{body}</p>
              </div>
              <div style={{ flex: "none", width: 110, height: 110, borderRadius: 18, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                <Icon size={40} strokeWidth={1.5} style={{ color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
