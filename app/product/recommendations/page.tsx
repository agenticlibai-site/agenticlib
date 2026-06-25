"use client";
import Link from "next/link";
import { useRef } from "react";
import { Target, Lightbulb, Database, Rocket, BarChart2 } from "lucide-react";

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
    num: "05", color: "#5E6CE8",
    shadow: "0 14px 34px rgba(94,108,232,.09)",
    hoverShadow: "0 14px 34px rgba(94,108,232,.09), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#EEF0FE,#E5E9FD)",
    Icon: BarChart2,
    title: "Comparison Analytics",
    body: "See how AI agents are recommended, described, and rated across Claude, GPT-5, and Gemini in real queries. AgenticLib tracks LLM visibility and sentiment so you deploy with confidence.",
  },
];

function SageIllustration() {
  return (
    <svg viewBox="0 0 480 348" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="sIllBG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EDE6FD" />
          <stop offset="1" stopColor="#F5F0FF" />
        </linearGradient>
        <linearGradient id="sCard1BG" x1="0" y1="0" x2="0.25" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#F3EEFE" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="sBar1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#E8447A" />
        </linearGradient>
        <linearGradient id="sBar2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5E6CE8" />
          <stop offset="1" stopColor="#8E63D6" />
        </linearGradient>
        <linearGradient id="sBar3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C4BAF2" />
          <stop offset="1" stopColor="#DAD4F8" />
        </linearGradient>
      </defs>

      {/* Panel background */}
      <rect width="480" height="348" rx="20" fill="url(#sIllBG)" />

      {/* Query input bar */}
      <rect x="16" y="14" width="448" height="46" rx="11" fill="white" stroke="#DDD4F8" strokeWidth="1.5" />
      <circle cx="37" cy="37" r="8" stroke="#9784E8" strokeWidth="1.5" />
      <line x1="43" y1="43" x2="48" y2="48" stroke="#9784E8" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="54" y="31" width="180" height="12" rx="6" fill="#E4DAFC" />
      <rect x="370" y="25" width="78" height="24" rx="12" fill="#EDE6FD" />
      <text x="409" y="41" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7C3AED">3 matches</text>

      {/* Category chips */}
      <rect x="16" y="74" width="90" height="26" rx="13" fill="#EDE6FD" />
      <text x="61" y="91" textAnchor="middle" fontSize="12" fontWeight="600" fill="#7C3AED">Marketing</text>
      <rect x="114" y="74" width="68" height="26" rx="13" fill="#EEF0FE" />
      <text x="148" y="91" textAnchor="middle" fontSize="12" fontWeight="600" fill="#5E6CE8">Finance</text>
      <rect x="190" y="74" width="100" height="26" rx="13" fill="white" stroke="#E2E8F0" strokeWidth="1" />
      <text x="240" y="91" textAnchor="middle" fontSize="12" fill="#94A3B8">Automation</text>

      {/* ── Card 1: Top match ── */}
      <rect x="16" y="116" width="448" height="82" rx="14" fill="url(#sCard1BG)" stroke="#7C3AED" strokeWidth="1.5" />
      {/* accent pill */}
      <rect x="16" y="130" width="4" height="54" rx="2" fill="#7C3AED" />
      {/* top match badge */}
      <rect x="348" y="124" width="100" height="22" rx="11" fill="#EDE6FD" />
      <text x="398" y="139" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7C3AED">★ Top Match</text>
      {/* agent details */}
      <text x="34" y="144" fontSize="14" fontWeight="700" fill="#0E1320">Jasper Workflow AI</text>
      <text x="34" y="161" fontSize="12" fill="#8891AA">Marketing automation · 12 integrations</text>
      {/* match bar */}
      <rect x="34" y="170" width="210" height="8" rx="4" fill="#EDE6FD" />
      <rect x="34" y="170" width="189" height="8" rx="4" fill="url(#sBar1)" />
      <text x="252" y="179" fontSize="12" fontWeight="700" fill="#7C3AED">90%</text>

      {/* ── Card 2 ── */}
      <rect x="16" y="212" width="448" height="64" rx="14" fill="white" stroke="#EFE3EA" strokeWidth="1" />
      <rect x="16" y="226" width="4" height="36" rx="2" fill="#B4A8F0" />
      <text x="34" y="235" fontSize="14" fontWeight="600" fill="#0E1320">Cortex AI Agent</text>
      <text x="34" y="251" fontSize="12" fill="#8891AA">Finance · API-first · No-code workflows</text>
      <rect x="34" y="258" width="210" height="7" rx="3.5" fill="#EEF0FE" />
      <rect x="34" y="258" width="157" height="7" rx="3.5" fill="url(#sBar2)" />
      <text x="252" y="266" fontSize="12" fontWeight="600" fill="#5E6CE8">75%</text>

      {/* ── Card 3 ── */}
      <rect x="16" y="290" width="448" height="44" rx="14" fill="white" stroke="#EFE3EA" strokeWidth="1" />
      <rect x="16" y="302" width="4" height="20" rx="2" fill="#D0C8F4" />
      <text x="34" y="310" fontSize="14" fontWeight="600" fill="#0E1320">BuildAI Pro</text>
      <rect x="34" y="317" width="210" height="7" rx="3.5" fill="#EEF0FE" />
      <rect x="34" y="317" width="130" height="7" rx="3.5" fill="url(#sBar3)" />
      <text x="252" y="325" fontSize="12" fontWeight="600" fill="#B0AACE">62%</text>
    </svg>
  );
}

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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Home
        </Link>
      </nav>

      {/* ── Hero — two-column split ── */}
      <div style={{ margin: "0 32px 40px" }}>
        <div style={{
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(124,58,237,0.10)",
          background: [
            "radial-gradient(circle at 95% 8%,  rgba(199,60,142,0.10) 0%, transparent 45%)",
            "radial-gradient(circle at 5%  90%, rgba(124,58,237,0.09) 0%, transparent 45%)",
            "linear-gradient(135deg, #EDE8FF 0%, #F6F3FF 45%, #FFF4FB 100%)",
          ].join(", "),
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 48, alignItems: "center", padding: "60px 56px 60px 64px" }}>

            {/* Left: copy */}
            <div>
              <span style={{ display: "inline-block", border: "1px solid rgba(124,58,237,0.25)", background: "rgba(255,255,255,0.60)", color: "#6B35CC", fontSize: 13, fontWeight: 600, letterSpacing: "0.01em", padding: "6px 14px", borderRadius: 8, marginBottom: 24 }}>
                Sage by AgenticLib
              </span>

              <h1 style={{ fontSize: "clamp(34px, 3.8vw, 56px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, color: "#0E1320", margin: "0 0 20px" }}>
                Find the right{" "}
                <span style={{ display: "inline-block", background: "linear-gradient(95deg, #7C3AED 15%, #E8447A 85%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", paddingBottom: "0.1em" }}>
                  AI agent
                </span>
                {" "}— faster
              </h1>

              <p style={{ fontSize: 17, color: "#4A5068", lineHeight: 1.65, margin: "0 0 36px", maxWidth: 420 }}>
                Sage turns a few questions about your workflow into matched, explainable agent recommendations. No browsing, no guesswork.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/recommend" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#7C3AED", borderRadius: 9999, padding: "14px 28px", fontSize: 15, fontWeight: 600, color: "#fff", textDecoration: "none", letterSpacing: "-0.01em", boxShadow: "0 4px 18px rgba(124,58,237,0.30)" }}>
                  Try Sage ›
                </a>
                <a href="#sage-demo" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(124,58,237,0.28)", borderRadius: 9999, padding: "14px 28px", fontSize: 15, fontWeight: 600, color: "#6B35CC", textDecoration: "none", letterSpacing: "-0.01em" }}>
                  Watch Demo
                </a>
              </div>
            </div>

            {/* Right: illustration */}
            <div>
              <SageIllustration />
            </div>

          </div>
        </div>
      </div>

      {/* Video */}
      <div id="sage-demo" style={{ maxWidth: 900, margin: "0 auto 56px", padding: "0 32px" }}>
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
