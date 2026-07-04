"use client";
import Link from "next/link";
import { useRef } from "react";
import { Search, BarChart2, Layers } from "lucide-react";

const FEATURES = [
  {
    num: "01", color: "#5E6CE8",
    shadow: "0 14px 34px rgba(94,108,232,.09)",
    hoverShadow: "0 14px 34px rgba(94,108,232,.09), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#EEF0FE,#E5E9FD)",
    Icon: Search,
    title: "Deep agent research",
    body: "Explore verified profiles for every agent in our catalogue — capabilities, pricing tiers, integrations, and the exact use cases each one was built for, all in a consistent format.",
  },
  {
    num: "02", color: "#7C3AED",
    shadow: "0 14px 34px rgba(124,58,237,.08)",
    hoverShadow: "0 14px 34px rgba(124,58,237,.08), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#F3EEFE,#EDE6FD)",
    Icon: Layers,
    title: "Compare agents seamlessly",
    body: "Get a side-by-side breakdown of any two agents across capabilities, pricing, use cases, and visual performance metrics — all in one view.",
  },
  {
    num: "03", color: "#C2186A",
    shadow: "0 14px 34px rgba(194,24,106,.08)",
    hoverShadow: "0 14px 34px rgba(194,24,106,.08), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#FCEAF3,#F8DFEC)",
    Icon: BarChart2,
    title: "LLM visibility benchmarks",
    body: "See how agents rank across Claude and GPT-5 in real recommendation queries.",
  },
];

function VeraIllustration() {
  // Donut chart math (r=44, stroke=17)
  const C = 276.5; // 2π × 44
  const dA = 215.6; // 78% of C
  const dB = 171.4; // 62% of C
  const off = -69.1; // -C/4, starts at 12 o'clock

  return (
    <svg viewBox="0 0 462 306" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="vera-ava" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5E6CE8"/><stop offset="1" stopColor="#8E63D6"/>
        </linearGradient>
      </defs>

      {/* ── Research panel (behind, left) ── */}
      <rect x="8" y="14" width="222" height="278" rx="14" fill="white" stroke="rgba(94,108,232,0.15)" strokeWidth="1.5"/>

      {/* Tab bar */}
      <rect x="29" y="24" width="58" height="24" rx="7" fill="rgba(94,108,232,0.10)"/>
      <text x="58" y="40" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5E6CE8">Research</text>
      <text x="114" y="40" textAnchor="middle" fontSize="11" fill="rgba(0,0,0,0.32)">Compare</text>
      <line x1="8" y1="56" x2="230" y2="56" stroke="rgba(94,108,232,0.09)" strokeWidth="1"/>

      {/* User msg 1 — right-aligned within visible area */}
      <rect x="98" y="66" width="82" height="22" rx="11" fill="rgba(94,108,232,0.12)"/>
      <rect x="108" y="73" width="58" height="8" rx="4" fill="rgba(94,108,232,0.28)"/>

      {/* AI response 1 */}
      <circle cx="22" cy="109" r="9" fill="url(#vera-ava)"/>
      <rect x="36" y="97" width="144" height="52" rx="10" fill="rgba(0,0,0,0.04)"/>
      <rect x="46" y="107" width="110" height="8" rx="4" fill="rgba(0,0,0,0.09)"/>
      <rect x="46" y="120" width="88" height="8" rx="4" fill="rgba(0,0,0,0.07)"/>
      <rect x="46" y="133" width="66" height="8" rx="4" fill="rgba(0,0,0,0.05)"/>

      {/* User msg 2 — right-aligned within visible area */}
      <rect x="94" y="163" width="86" height="22" rx="11" fill="rgba(94,108,232,0.12)"/>
      <rect x="104" y="170" width="62" height="8" rx="4" fill="rgba(94,108,232,0.25)"/>

      {/* AI response 2 */}
      <circle cx="22" cy="205" r="9" fill="url(#vera-ava)"/>
      <rect x="36" y="193" width="144" height="40" rx="10" fill="rgba(0,0,0,0.04)"/>
      <rect x="46" y="203" width="98" height="8" rx="4" fill="rgba(0,0,0,0.08)"/>
      <rect x="46" y="216" width="76" height="8" rx="4" fill="rgba(0,0,0,0.06)"/>

      {/* Typing indicator */}
      <circle cx="22" cy="250" r="9" fill="url(#vera-ava)"/>
      <rect x="36" y="240" width="58" height="24" rx="12" fill="rgba(0,0,0,0.04)"/>
      <circle cx="53" cy="252" r="3.5" fill="rgba(94,108,232,0.20)"/>
      <circle cx="65" cy="252" r="3.5" fill="rgba(94,108,232,0.38)"/>
      <circle cx="77" cy="252" r="3.5" fill="rgba(94,108,232,0.56)"/>

      {/* Chat input */}
      <rect x="16" y="272" width="182" height="24" rx="12" fill="rgba(0,0,0,0.03)" stroke="rgba(94,108,232,0.14)" strokeWidth="1"/>
      <rect x="26" y="281" width="96" height="7" rx="3.5" fill="rgba(0,0,0,0.07)"/>

      {/* ── Compare panel (in front, right) ── */}
      <rect x="186" y="34" width="268" height="260" rx="14" fill="white" stroke="rgba(124,58,237,0.18)" strokeWidth="1.5"/>

      {/* Tab bar */}
      <text x="214" y="61" fontSize="11" fill="rgba(0,0,0,0.32)">Research</text>
      <rect x="265" y="47" width="72" height="24" rx="7" fill="rgba(124,58,237,0.10)"/>
      <text x="301" y="63" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7C3AED">Compare</text>
      <line x1="186" y1="80" x2="454" y2="80" stroke="rgba(124,58,237,0.08)" strokeWidth="1"/>

      {/* "LLM Visibility Score" pill — centred between panel edges */}
      <rect x="279" y="90" width="122" height="18" rx="9" fill="rgba(124,58,237,0.08)"/>
      <text x="340" y="103" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#7C3AED">LLM Visibility Score</text>

      {/* Donut A — Jasper AI — centred in left half of compare panel */}
      <circle cx="256" cy="174" r="44" stroke="rgba(94,108,232,0.11)" strokeWidth="17" fill="none"/>
      <circle cx="256" cy="174" r="44" stroke="#5E6CE8" strokeWidth="17" fill="none"
        strokeDasharray={`${dA} ${C - dA}`} strokeDashoffset={off} strokeLinecap="round"/>
      <text x="256" y="170" textAnchor="middle" fontSize="16" fontWeight="800" fill="#5E6CE8">78%</text>
      <text x="256" y="185" textAnchor="middle" fontSize="9" fill="rgba(0,0,0,0.42)">Score</text>

      {/* Donut B — Cortex AI — centred in right half of compare panel */}
      <circle cx="386" cy="174" r="44" stroke="rgba(124,58,237,0.11)" strokeWidth="17" fill="none"/>
      <circle cx="386" cy="174" r="44" stroke="#8E63D6" strokeWidth="17" fill="none"
        strokeDasharray={`${dB} ${C - dB}`} strokeDashoffset={off} strokeLinecap="round"/>
      <text x="386" y="170" textAnchor="middle" fontSize="16" fontWeight="800" fill="#8E63D6">62%</text>
      <text x="386" y="185" textAnchor="middle" fontSize="9" fill="rgba(0,0,0,0.42)">Score</text>

      {/* Agent name labels */}
      <text x="256" y="238" textAnchor="middle" fontSize="11" fontWeight="700" fill="#000000">Jasper AI</text>
      <text x="386" y="238" textAnchor="middle" fontSize="11" fontWeight="700" fill="#000000">Cortex AI</text>

      {/* Top match badge — centred under Jasper AI */}
      <rect x="218" y="250" width="76" height="18" rx="9" fill="rgba(94,108,232,0.10)"/>
      <text x="256" y="263" textAnchor="middle" fontSize="9" fontWeight="700" fill="#5E6CE8">★ Top Match</text>
    </svg>
  );
}

export default function ResearchPage() {
  const videoPlayedRef = useRef(false);

  const handleVideoPlay = () => {
    if (videoPlayedRef.current) return;
    videoPlayedRef.current = true;
    fetch("/api/notify-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "Research & Compare Page" }),
    }).catch(() => {});
  };

  return (
    <main style={{ minHeight: "100vh", fontFamily: "var(--font-schibsted), var(--font-geist-sans), sans-serif" }}>

      {/* Nav */}

      {/* Hero card */}
      <div className="product-outer" style={{ maxWidth: 1200, margin: "24px auto 40px" }}>
        <div style={{
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 8px 48px rgba(94,108,232,0.16)",
          background: [
            "radial-gradient(circle at 86% 12%, rgba(94,108,232,0.34) 0%, transparent 52%)",
            "linear-gradient(112deg, #E4E8FF 0%, #EDE6FF 48%, #EAE2FF 100%)",
          ].join(", "),
        }}>
          <div className="hero-split-grid">
            {/* Left: copy */}
            <div>
              <span style={{ display: "inline-block", background: "rgba(255,255,255,0.90)", border: "1px solid rgba(94,108,232,0.18)", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: "#000000", letterSpacing: "0.01em", marginBottom: 14 }}>
                Vera AI
              </span>
              <h1 style={{ fontSize: "clamp(36px, 4.2vw, 54px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 0.96, margin: "0 0 16px", color: "#000000" }}>
                <span style={{ display: "block" }}>Research &amp;</span>
                <span style={{ display: "block" }}>
                  <span style={{ background: "linear-gradient(90deg, #5E6CE8 0%, #9B6ED8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>compare agents</span>
                  <span> -</span>
                </span>
                <span style={{ display: "block" }}>in one view</span>
              </h1>
              <p style={{ fontSize: 15.5, color: "#000000", lineHeight: 1.6, margin: "0 0 24px", maxWidth: 400, fontWeight: 400 }}>
                Ask anything about any agent. Get a curated breakdown - capabilities, pricing, and visibility. Compare side by side with visual metrics and a verdict.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <a href="#vera-demo" style={{ display: "inline-flex", alignItems: "center", borderRadius: 9999, padding: "11px 24px", fontSize: 14.5, fontWeight: 700, color: "#000000", textDecoration: "none", background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(94,108,232,0.18)", letterSpacing: "-0.01em" }}>
                  Watch Demo ›
                </a>
              </div>
            </div>
            {/* Right: illustration */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", maxWidth: 460, width: "100%" }}>
              <VeraIllustration />
            </div>
          </div>
        </div>
      </div>

      {/* Video */}
      <div id="vera-demo" className="product-outer" style={{ maxWidth: 900, margin: "0 auto 56px" }}>
        <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 8px rgba(0,0,0,0.04), 0 20px 60px rgba(94,108,232,0.10)" }}>
          <video
            src="/C&R Video.mp4"
            controls
            poster="/research-cover.png"
            style={{ width: "100%", display: "block" }}
            onPlay={handleVideoPlay}
          />
        </div>
      </div>

      {/* Feature cards */}
      <div className="product-outer" style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: "80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto 40px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, letterSpacing: ".22em", color: "#5E6CE8", margin: "0 0 14px" }}>WHAT MAKES VERA AI UNIQUE</p>
          <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1.06, margin: 0, color: "#000000" }}>Compare smarter, decide faster</h2>
        </div>

        <div className="caps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {FEATURES.map(({ num, color, shadow, hoverShadow, iconBg, Icon, title, body }, i) => (
            <div
              key={title}
              className={i === FEATURES.length - 1 ? "feature-card-last" : undefined}
              style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: shadow, transition: "box-shadow 0.3s ease", ...(i === FEATURES.length - 1 ? { gridColumn: "1 / -1", maxWidth: "calc(50% - 10px)", margin: "0 auto", width: "100%" } : {}) }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = hoverShadow; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = shadow; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                  <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color }}>{num}</span>
                  <span style={{ height: 1, flex: 1, background: `linear-gradient(90deg,${color}55,transparent)`, display: "block" }} />
                </div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#000000" }}>{title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#000000", margin: 0 }}>{body}</p>
              </div>
              <div className="feature-card-icon" style={{ flex: "none", width: 110, height: 110, borderRadius: 18, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                <Icon size={40} strokeWidth={1.5} style={{ color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
