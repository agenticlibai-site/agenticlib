"use client";
import Link from "next/link";
import { useRef } from "react";
import { Search, ArrowLeftRight, BarChart2, FileText } from "lucide-react";

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
    Icon: ArrowLeftRight,
    title: "Side-by-side comparison",
    body: "Pick any two agents and get an instant, structured breakdown across every dimension that matters: features, performance, pricing, and sentiment — no spreadsheet required.",
  },
  {
    num: "03", color: "#C2186A",
    shadow: "0 14px 34px rgba(194,24,106,.08)",
    hoverShadow: "0 14px 34px rgba(194,24,106,.08), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#FCEAF3,#F8DFEC)",
    Icon: BarChart2,
    title: "LLM visibility benchmarks",
    body: "See how agents rank across Claude, GPT-5, and Gemini in real recommendation queries. Know where you lead, where you lag, and exactly which rivals your buyers hear about instead.",
  },
  {
    num: "04", color: "#E0506A",
    shadow: "0 16px 38px rgba(240,97,122,.12)",
    hoverShadow: "0 16px 38px rgba(240,97,122,.12), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#FFF1F4,#FCE4EC)",
    Icon: FileText,
    title: "Decision-ready reports",
    body: "Export your comparison as a shareable report your team can act on — feature gap analysis, positioning notes, and a prioritised improvement roadmap in one document.",
  },
];

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
      <nav style={{ padding: "20px 32px", display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: 8, padding: "8px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.10)", fontSize: 14, fontWeight: 600, color: "#160F2E" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="#5E6CE8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Home
        </Link>
      </nav>

      {/* Hero card — Analyst gradient (Blue → Violet) */}
      <div style={{ position: "relative", margin: "0 32px 32px" }}>
        <div style={{ borderRadius: 32, overflow: "hidden", boxShadow: "0 8px 40px rgba(94,108,232,0.22)" }}>
          <div style={{ position: "relative" }}>
            {/* Gradient background */}
            <div style={{ position: "absolute", inset: 0, background: [
              "radial-gradient(circle at 2% 0%,   rgba(94,108,232,.75) 0%, transparent 48%)",
              "radial-gradient(circle at 96% 8%,  rgba(142,99,214,.65) 0%, transparent 50%)",
              "radial-gradient(circle at 88% 95%, rgba(194,77,158,.50) 0%, transparent 50%)",
              "radial-gradient(circle at 5%  95%, rgba(94,108,232,.40) 0%, transparent 50%)",
              "linear-gradient(135deg, #5E6CE8 0%, #8E63D6 55%, #C24D9E 100%)",
            ].join(", ") }} />
            {/* Frosted glass veil */}
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(70px) saturate(140%)", WebkitBackdropFilter: "blur(70px) saturate(140%)", background: "rgba(255,255,255,.10)" }} />
            {/* Content */}
            <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "60px 48px 56px" }}>
              <p style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, letterSpacing: ".22em", color: "rgba(255,255,255,0.65)", margin: "0 0 20px", textTransform: "uppercase" }}>Vera by AgenticLib</p>
              <h1 style={{ fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#fff", margin: "0 0 18px" }}>
                Research &amp; Compare
              </h1>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.82)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.5 }}>
                Compare, research, and decide — all in one place. Built for teams that need signal, not noise.
              </p>
              <a href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.40)", borderRadius: 9999, padding: "13px 28px", fontSize: 15, fontWeight: 600, color: "#fff", textDecoration: "none", letterSpacing: "-0.01em" }}>
                Explore Agents ›
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Video */}
      <div style={{ maxWidth: 900, margin: "0 auto 56px", padding: "0 32px" }}>
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
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto 40px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, letterSpacing: ".22em", color: "#5E6CE8", margin: "0 0 14px" }}>WHAT VERA GIVES YOU</p>
          <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1.06, margin: 0, color: "#0E1320" }}>Compare smarter, decide faster</h2>
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
