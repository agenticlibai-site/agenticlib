"use client";
import Link from "next/link";
import { useState } from "react";

const DOMAINS = [
  { label: "Marketing", href: "/solutions/marketing" },
  { label: "Skincare", href: "/solutions/skincare" },
];

function DomainSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = DOMAINS.filter(d =>
    d.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ marginTop: 32, maxWidth: 300, position: "relative", zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.90)", borderRadius: open ? "12px 12px 0 0" : 12, border: "1.5px solid rgba(240,97,122,0.30)", borderBottom: open ? "1px solid rgba(240,97,122,0.12)" : "1.5px solid rgba(240,97,122,0.30)", padding: "11px 16px", boxShadow: open ? "0 2px 10px rgba(90,26,50,.08)" : "0 2px 10px rgba(90,26,50,.10)", transition: "border-radius 0.1s" }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
          <circle cx="6.5" cy="6.5" r="4.5" stroke="#5A1A22" strokeWidth="1.6"/>
          <path d="M10 10l3 3" stroke="#5A1A22" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search for your domain..."
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13.5, fontWeight: 500, color: "#5A1A22", width: "100%", fontFamily: "inherit" }}
        />
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.4, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <path d="M2 4l4 4 4-4" stroke="#5A1A22" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", borderRadius: "0 0 12px 12px", border: "1.5px solid rgba(240,97,122,0.30)", borderTop: "none", boxShadow: "0 8px 24px rgba(90,26,50,.14)", overflow: "hidden" }}>
          {filtered.map(d => (
            <Link key={d.href} href={d.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", textDecoration: "none", color: "#5A1A22", fontSize: 13.5, fontWeight: 600 }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(240,97,122,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
              {d.label}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 3l3 3-3 3" stroke="#F0617A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AIAgentBuildersPage() {
  return (
    <main style={{ minHeight: "100vh", fontFamily: "var(--font-schibsted), var(--font-geist-sans), sans-serif", background: "linear-gradient(180deg, #FCEEF6 0%, #FFF5FA 50%, #fff 100%)" }}>

      {/* Nav */}

      {/* WHY AGENTICLIB */}
      <section style={{ background: "transparent", padding: "28px 24px 8px", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", borderRadius: 32, boxShadow: "0 30px 70px rgba(90,26,50,.22)" }}>
          {/* Clipped background — overflow hidden here only, not on outer card */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 32, overflow: "hidden", background: "linear-gradient(150deg,#FDEAE4 0%,#FBD7CE 55%,#F6C6BC 100%)" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 0% 0%,rgba(240,97,122,.36) 0%,transparent 46%),radial-gradient(circle at 100% 6%,rgba(255,138,107,.30) 0%,transparent 48%),radial-gradient(circle at 92% 100%,rgba(194,77,158,.26) 0%,transparent 50%),radial-gradient(circle at 12% 100%,rgba(250,211,230,.34) 0%,transparent 52%),radial-gradient(circle at 52% 50%,rgba(255,255,255,.48) 0%,transparent 58%)" }}></div>
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(64px) saturate(140%)", WebkitBackdropFilter: "blur(64px) saturate(140%)", background: "rgba(255,255,255,.32)" }}></div>
          </div>

          <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.05fr)", gap: 40, alignItems: "center", padding: "60px 56px" }}>
            {/* LEFT: copy */}
            <div>
              <span style={{ display: "inline-block", border: "1px solid rgba(176,64,72,.30)", background: "rgba(255,255,255,.45)", color: "#5A1A22", fontSize: 13.5, fontWeight: 600, letterSpacing: ".01em", padding: "7px 15px", borderRadius: 9 }}>Why AgenticLib</span>
              <h2 style={{ fontSize: "clamp(28px,3.2vw,42px)", fontWeight: 600, lineHeight: 1.14, letterSpacing: "-.025em", color: "#5A1A22", margin: "26px 0 0", maxWidth: "18ch" }}>
                {"Insightful comparison intelligence on "}
                <span style={{ background: "linear-gradient(100deg,#E0506A,#D14B86 70%,#C24D9E)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}>brand and product</span>
                {" for AI agent builders"}
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.62, color: "rgba(74,17,25,.82)", margin: "22px 0 0", maxWidth: "52ch" }}>AgenticLib traces your agent brand from business domain to product feature, benchmarks your visibility against competition and turns your feature gaps into a roadmap - so you show up where your buyers are actually asking.</p>
              <DomainSearch />
            </div>

            {/* RIGHT: visual */}
            <div style={{ position: "relative", height: 430, display: "flex", alignItems: "center", gap: 0, width: "100%", minWidth: 0 }}>
              <div style={{ position: "absolute", width: "82%", height: "60%", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(240,97,122,.32),transparent 70%)", filter: "blur(16px)" }}></div>

              <div style={{ flex: "none", position: "relative", zIndex: 3, width: 138, borderRadius: 22, padding: "20px 14px", background: "linear-gradient(150deg,#F0617A 0%,#FF7E72 52%,#FF9E73 100%)", boxShadow: "0 18px 42px rgba(240,97,122,.42)", textAlign: "center" }}>
                <span style={{ display: "inline-flex", width: 48, height: 48, borderRadius: 13, background: "#fff", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 14px rgba(90,26,50,.20)", overflow: "hidden" }}>
                  <img src="/logo.png" alt="AgenticLib" style={{ width: 34, height: 34, objectFit: "contain" }} />
                </span>
                <div style={{ marginTop: 13, color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-.01em" }}>AgenticLib Comparison Intelligence</div>
              </div>

              <svg viewBox="0 0 200 400" preserveAspectRatio="none" style={{ flex: 1, minWidth: 0, alignSelf: "stretch", height: "100%", overflow: "visible", zIndex: 2 }}>
                <defs>
                  <linearGradient id="aab-cgLine" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="200" y2="200">
                    <stop offset="0" stopColor="#F0617A" /><stop offset="1" stopColor="#FF9E73" />
                  </linearGradient>
                </defs>
                <path d="M0,200 C95,200 100,58 200,58" fill="none" stroke="url(#aab-cgLine)" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,200 L200,200" fill="none" stroke="url(#aab-cgLine)" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,200 C95,200 100,342 200,342" fill="none" stroke="url(#aab-cgLine)" strokeWidth="3" strokeLinecap="round" />
              </svg>

              <div style={{ flex: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 340, width: 190, zIndex: 3 }}>
                {[
                  { label: "Brand Intelligence", icon: <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="aab-ic1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#F0617A"/><stop offset="1" stopColor="#FF9E73"/></linearGradient></defs><rect x="3" y="11" width="4.4" height="9" rx="1.6" fill="url(#aab-ic1)"/><rect x="9.8" y="5" width="4.4" height="15" rx="1.6" fill="url(#aab-ic1)"/><rect x="16.6" y="8.5" width="4.4" height="11.5" rx="1.6" fill="url(#aab-ic1)"/></svg> },
                  { label: "Product Features", icon: <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="url(#aab-ic2)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><defs><linearGradient id="aab-ic2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F0617A"/><stop offset="1" stopColor="#FF9E73"/></linearGradient></defs><path d="M12 2.5 L20.5 7 V17 L12 21.5 L3.5 17 V7 Z"/><path d="M3.5 7 L12 11.7 L20.5 7"/><path d="M12 11.7 V21.5"/></svg> },
                  { label: "Improvements", icon: <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="url(#aab-ic3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="aab-ic3" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#F0617A"/><stop offset="1" stopColor="#FF9E73"/></linearGradient></defs><path d="M3.5 18.5 A8.5 8.5 0 0 1 20.5 18.5"/><path d="M12 18.5 L16.5 12.5"/><circle cx="12" cy="18.5" r="1.7" fill="url(#aab-ic3)" stroke="none"/></svg> },
                ].map(({ label, icon }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(90,26,50,.14)" }}>
                    <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(240,97,122,.13)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "#5A1A22", letterSpacing: "-.01em" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES GRID */}
      <section style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", background: "transparent", padding: "64px 24px 84px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ maxWidth: 720, margin: "0 auto 40px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, letterSpacing: ".22em", color: "#C2186A", margin: "0 0 14px" }}>WHAT YOU GET</p>
            <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1.06, margin: 0, color: "#0E1320" }}>Our analytics lead you to successful outcomes</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>

            {/* 01 */}
            <div style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 14px 34px rgba(124,58,237,.08)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(124,58,237,.08), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(124,58,237,.08)"; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                  <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#7C3AED" }}>01</span>
                  <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(124,58,237,.34),transparent)", display: "block" }}></span>
                </div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#0E1320" }}>Product Feature Analytics</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A4256", margin: 0 }}>Feature analytics across security, integrations, task capability, pricing and coverage — mapped to the domain and use case each one actually serves.</p>
              </div>
              <div style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#F3EEFE,#EDE6FD)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                <svg width="118" height="84" viewBox="0 0 118 84" fill="none">
                  <defs><linearGradient id="aab-capChk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#A86BF0"/></linearGradient></defs>
                  <rect x="4" y="6" width="20" height="20" rx="6" fill="url(#aab-capChk)"/>
                  <path d="M9 16 L13 20 L19 12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="34" y="12" width="80" height="8" rx="4" fill="#D8C8F6"/>
                  <rect x="4" y="32" width="20" height="20" rx="6" fill="#E2D5FA"/>
                  <path d="M9 42 L13 46 L19 38" stroke="#A86BF0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="34" y="38" width="62" height="8" rx="4" fill="#E4DAF8"/>
                  <rect x="4" y="58" width="20" height="20" rx="6" fill="url(#aab-capChk)"/>
                  <path d="M9 68 L13 72 L19 64" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="34" y="64" width="72" height="8" rx="4" fill="#D8C8F6"/>
                </svg>
              </div>
            </div>

            {/* 02 */}
            <div style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 14px 34px rgba(94,108,232,.09)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(94,108,232,.09), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(94,108,232,.09)"; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                  <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#5E6CE8" }}>02</span>
                  <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(94,108,232,.34),transparent)", display: "block" }}></span>
                </div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#0E1320" }}>Brand &amp; Use Case Benchmarking</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A4256", margin: 0 }}>Benchmark your brand against the landscape, by use case — share of voice, where rivals lead, and how your feature cluster stacks up.</p>
              </div>
              <div style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#EEF0FE,#E5E9FD)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "18px 16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                <svg width="120" height="84" viewBox="0 0 120 84" fill="none">
                  <defs><linearGradient id="aab-capGroup" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#5E6CE8"/><stop offset="1" stopColor="#8E63D6"/></linearGradient></defs>
                  <rect x="8"   y="50" width="13" height="30" rx="3.5" fill="#C7CEF4"/>
                  <rect x="24"  y="30" width="13" height="50" rx="3.5" fill="url(#aab-capGroup)"/>
                  <rect x="50"  y="58" width="13" height="22" rx="3.5" fill="#C7CEF4"/>
                  <rect x="66"  y="18" width="13" height="62" rx="3.5" fill="url(#aab-capGroup)"/>
                  <rect x="92"  y="44" width="13" height="36" rx="3.5" fill="#C7CEF4"/>
                  <rect x="108" y="34" width="11" height="46" rx="3.5" fill="url(#aab-capGroup)"/>
                </svg>
              </div>
            </div>

            {/* 03 */}
            <div style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 14px 34px rgba(194,24,106,.08)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(194,24,106,.08), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(194,24,106,.08)"; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                  <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#C2186A" }}>03</span>
                  <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(194,24,106,.34),transparent)", display: "block" }}></span>
                </div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#0E1320" }}>Sentiment &amp; Brand Coverage</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A4256", margin: 0 }}>Prompt sentiment and brand coverage — tracking the tags and language an LLM uses to describe your agent to a real user.</p>
              </div>
              <div style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#FCEAF3,#F8DFEC)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                <svg width="110" height="90" viewBox="0 0 110 90" fill="none" stroke="url(#aab-capNode)" strokeWidth="2.4">
                  <defs><linearGradient id="aab-capNode" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#C2186A"/><stop offset="1" stopColor="#E0506A"/></linearGradient></defs>
                  <line x1="30" y1="28" x2="58" y2="20"/><line x1="30" y1="28" x2="40" y2="58"/>
                  <line x1="58" y1="20" x2="80" y2="44"/><line x1="40" y1="58" x2="80" y2="44"/>
                  <line x1="40" y1="58" x2="66" y2="72"/>
                  <circle cx="30" cy="28" r="6" fill="url(#aab-capNode)" stroke="none"/>
                  <circle cx="58" cy="20" r="6" fill="#fff"/>
                  <circle cx="80" cy="44" r="6" fill="url(#aab-capNode)" stroke="none"/>
                  <circle cx="40" cy="58" r="6" fill="#fff"/>
                  <circle cx="66" cy="72" r="6" fill="url(#aab-capNode)" stroke="none"/>
                </svg>
              </div>
            </div>

            {/* 04 */}
            <div style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 16px 38px rgba(240,97,122,.12)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 16px 38px rgba(240,97,122,.12), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 16px 38px rgba(240,97,122,.12)"; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                  <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#E0506A" }}>04</span>
                  <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(224,80,106,.4),transparent)", display: "block" }}></span>
                </div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#0E1320" }}>Improvements Report</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A4256", margin: 0 }}>An action plan and roadmap — exactly how to improve your features so your agent surfaces where your buyers are actually asking.</p>
              </div>
              <div style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#FFF1F4,#FCE4EC)", border: "1px solid #F6D8E2", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)" }}>
                <span style={{ position: "absolute", top: 11, right: 11, fontFamily: "var(--font-space-mono), monospace", fontSize: 11, fontWeight: 700, color: "#fff", background: "linear-gradient(100deg,#F0617A,#FF9E73)", padding: "3px 9px", borderRadius: 999, boxShadow: "0 4px 10px rgba(240,97,122,.35)" }}>+47%</span>
                <svg width="120" height="86" viewBox="0 0 120 86" fill="none">
                  <defs>
                    <linearGradient id="aab-capLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F0617A"/><stop offset="1" stopColor="#FF9E73"/></linearGradient>
                    <linearGradient id="aab-capFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(240,97,122,.28)"/><stop offset="1" stopColor="rgba(240,97,122,0)"/></linearGradient>
                  </defs>
                  <path d="M10,74 L34,58 L58,46 L82,30 L110,12 L110,80 L10,80 Z" fill="url(#aab-capFill)"/>
                  <path d="M10,74 L34,58 L58,46 L82,30 L110,12" fill="none" stroke="url(#aab-capLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="34" cy="58" r="4" fill="#fff" stroke="url(#aab-capLine)" strokeWidth="2.4"/>
                  <circle cx="58" cy="46" r="4" fill="#fff" stroke="url(#aab-capLine)" strokeWidth="2.4"/>
                  <circle cx="82" cy="30" r="4" fill="#fff" stroke="url(#aab-capLine)" strokeWidth="2.4"/>
                  <circle cx="110" cy="12" r="4.5" fill="url(#aab-capLine)"/>
                </svg>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
