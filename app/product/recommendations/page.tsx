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
    body: "AgenticLib starts by understanding what you actually need: your team size, workflow, and goals. It then matches you to the right agent. No browsing, no guesswork.",
  },
  {
    num: "02", color: "#5E6CE8",
    shadow: "0 14px 34px rgba(94,108,232,.09)",
    hoverShadow: "0 14px 34px rgba(94,108,232,.09), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#EEF0FE,#E5E9FD)",
    Icon: Lightbulb,
    title: "Dynamic, explainable matching",
    body: "Every recommendation explains itself. See which agents were considered, why your top pick ranked highest, and what trade-offs exist — so you make the decision with full context.",
  },
  {
    num: "03", color: "#C2186A",
    shadow: "0 14px 34px rgba(194,24,106,.08)",
    hoverShadow: "0 14px 34px rgba(194,24,106,.08), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#FCEAF3,#F8DFEC)",
    Icon: Rocket,
    title: "Business domain oriented",
    body: "Every recommendation is built around the specific context and needs of your business domain.",
  },
  {
    num: "04", color: "#E0506A",
    shadow: "0 16px 38px rgba(240,97,122,.12)",
    hoverShadow: "0 16px 38px rgba(240,97,122,.12), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#FFF1F4,#FCE4EC)",
    Icon: Database,
    title: "Data-driven architecture",
    body: "AgenticLib surfaces structured, decision-relevant intelligence. Every agent profile is built around the dimensions that actually matter for your use case.",
  },
  {
    num: "05", color: "#5E6CE8",
    shadow: "0 14px 34px rgba(94,108,232,.09)",
    hoverShadow: "0 14px 34px rgba(94,108,232,.09), 0 0 40px 8px rgba(240,97,122,0.25)",
    iconBg: "linear-gradient(160deg,#EEF0FE,#E5E9FD)",
    Icon: BarChart2,
    title: "Comparison Analytics",
    body: "See how AI agents are recommended, described, and rated across Claude and GPT-5 in real queries. AgenticLib tracks LLM visibility and sentiment so you deploy with confidence.",
  },
];

function SageIllustration() {
  return (
    <div style={{ background: "white", borderRadius: 24, padding: "22px 22px 22px 22px", boxShadow: "0 20px 60px rgba(124,58,237,0.13), 0 4px 16px rgba(0,0,0,0.06)", fontFamily: "inherit" }}>

      {/* Search bar row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#F5F3FF", borderRadius: 999, padding: "10px 16px" }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="#7C3AED" strokeWidth="1.6"/>
            <path d="M10 10l2.8 2.8" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <div style={{ flex: 1, height: 8, background: "#DDD8F5", borderRadius: 4 }} />
        </div>
        <div style={{ flexShrink: 0, background: "#EDE9FE", borderRadius: 999, padding: "7px 13px" }}>
          <span style={{ color: "#6D28D9", fontWeight: 700, fontSize: 12.5 }}>3 matches</span>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "#EDE9FE", borderRadius: 999, padding: "5px 13px" }}>
          <span style={{ color: "#5B21B6", fontWeight: 700, fontSize: 12.5 }}>Marketing</span>
        </div>
        <div style={{ background: "white", border: "1px solid #FCE7F3", borderRadius: 999, padding: "5px 13px" }}>
          <span style={{ color: "#DB2777", fontWeight: 500, fontSize: 12.5 }}>Finance</span>
        </div>
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 999, padding: "5px 13px" }}>
          <span style={{ color: "#6B7280", fontWeight: 500, fontSize: 12.5 }}>Automation</span>
        </div>
      </div>

      {/* Card 1 — Top Match */}
      <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #7C3AED", padding: "13px 14px", marginBottom: 10, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "linear-gradient(180deg, #7C3AED 0%, #E8447A 100%)", borderRadius: "4px 0 0 4px" }} />
        <div style={{ paddingLeft: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#0E1320" }}>Jasper Workflow AI</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#EDE9FE", borderRadius: 999, padding: "4px 10px", flexShrink: 0 }}>
              <span style={{ color: "#6D28D9", fontSize: 11 }}>★</span>
              <span style={{ color: "#5B21B6", fontWeight: 700, fontSize: 11.5 }}>Top Match</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 9 }}>Marketing automation · 12 integrations</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 7, background: "#EDE9FE", borderRadius: 999 }}>
              <div style={{ width: "90%", height: "100%", background: "linear-gradient(90deg, #7C3AED, #E8447A)", borderRadius: 999 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#5B21B6", minWidth: 34, textAlign: "right" }}>90%</span>
          </div>
        </div>
      </div>

      {/* Card 2 — Cortex AI Agent */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #F3F4F6", padding: "13px 14px", marginBottom: 10, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#DB2777", borderRadius: "4px 0 0 4px" }} />
        <div style={{ paddingLeft: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0E1320", marginBottom: 3 }}>Cortex AI Agent</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 9 }}>Finance · API-first · No-code workflows</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 7, background: "#FCE7F3", borderRadius: 999 }}>
              <div style={{ width: "75%", height: "100%", background: "#DB2777", borderRadius: 999 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#DB2777", minWidth: 34, textAlign: "right" }}>75%</span>
          </div>
        </div>
      </div>

      {/* Card 3 — BuildAI Pro */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #F3F4F6", padding: "13px 14px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#C4BBDF", borderRadius: "4px 0 0 4px" }} />
        <div style={{ paddingLeft: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0E1320", marginBottom: 9 }}>BuildAI Pro</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 7, background: "#F3F4F6", borderRadius: 999 }}>
              <div style={{ width: "62%", height: "100%", background: "#D1D5DB", borderRadius: 999 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#9CA3AF", minWidth: 34, textAlign: "right" }}>62%</span>
          </div>
        </div>
      </div>

    </div>
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

      {/* ── Hero — two-column split ── */}
      <div style={{ maxWidth: 1200, margin: "24px auto 40px", padding: "0 32px" }}>
        <div style={{
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(199,60,142,0.18)",
          background: [
            "radial-gradient(circle at 100% 8%,   #F9AECA 0%, transparent 55%)",
            "radial-gradient(circle at 100% 100%, #EDCFF7 0%, transparent 55%)",
            "radial-gradient(circle at 0% 60%,    #F7BEDD 0%, transparent 58%)",
            "radial-gradient(circle at 20% 0%,    #FEF2F7 0%, transparent 50%)",
            "linear-gradient(135deg, #F9D5E8 0%, #FBF6FE 50%, #F2C4E2 100%)",
          ].join(", "),
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 20, alignItems: "center", padding: "36px 48px 72px 72px", justifyContent: "center" }}>

            {/* Left: copy */}
            <div>
              <span style={{ display: "inline-block", border: "1px solid rgba(124,58,237,0.25)", background: "rgba(255,255,255,0.60)", color: "#6B35CC", fontSize: 13, fontWeight: 600, letterSpacing: "0.01em", padding: "6px 14px", borderRadius: 8, marginBottom: 14 }}>
                Sage by AgenticLib
              </span>

              <h1 style={{ fontSize: "clamp(42px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.0, color: "#0E1320", margin: "0 0 20px" }}>
                <span style={{ display: "block" }}>Find the right</span>
                <span style={{ display: "block" }}>
                  <span style={{ background: "linear-gradient(95deg, #7C3AED 15%, #E8447A 85%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AI agent</span>
                  <span style={{ color: "#0E1320" }}> —</span>
                </span>
                <span style={{ display: "block" }}>faster</span>
              </h1>

              <p style={{ fontSize: 15.5, color: "#0E1320", lineHeight: 1.6, margin: "0 0 28px", maxWidth: 400 }}>
                Sage AI turns a few questions about your workflow into matched, explainable agent recommendations. No browsing, no guesswork.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="#sage-demo" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.80)", border: "1.5px solid rgba(124,58,237,0.22)", borderRadius: 9999, padding: "12px 26px", fontSize: 14.5, fontWeight: 700, color: "#0E1320", textDecoration: "none", letterSpacing: "-0.01em" }}>
                  Watch Demo ›
                </a>
              </div>
            </div>

            {/* Right: illustration */}
            <div style={{ width: "100%" }}>
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
          {FEATURES.map(({ num, color, shadow, hoverShadow, iconBg, Icon, title, body }, i) => (
            <div
              key={title}
              style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: shadow, transition: "box-shadow 0.3s ease", ...(i === FEATURES.length - 1 ? { gridColumn: "1 / -1", maxWidth: "calc(50% - 10px)", margin: "0 auto", width: "100%" } : {}) }}
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
