import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skincare & Beauty AI Agents – AgenticLib",
  description: "AgenticLib helps skincare and beauty AI agents compete. Track LLM visibility, benchmark personalisation depth and ingredient intelligence against competitors, and understand consumer trust signals before buyers shortlist.",
  keywords: [
    "skincare AI agents", "beauty AI tools comparison", "AI skincare personalisation",
    "LLM visibility beauty AI", "compare skincare AI platforms", "AI agent benchmarking skincare",
  ],
  alternates: { canonical: "https://agenticlib.com/solutions/skincare" },
  openGraph: {
    type: "website",
    siteName: "AgenticLib",
    title: "Skincare & Beauty AI Agents – AgenticLib",
    description: "Track your skincare AI agent's visibility in LLM search, benchmark personalisation depth against competitors, and surface where consumers are finding alternatives.",
    url: "https://agenticlib.com/solutions/skincare",
    images: [{ url: "/recommendations-cover.png", width: 1200, height: 630, alt: "AgenticLib – Skincare AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skincare & Beauty AI Agents – AgenticLib",
    description: "Track your skincare AI agent's visibility in LLM search, benchmark personalisation depth against competitors, and surface where consumers are finding alternatives.",
    images: ["/recommendations-cover.png"],
  },
};

const ACCENT = "#C2186A";

const USE_CASES = [
  { title: "Skin Analysis & Personalisation", tag: "Photo analysis, questionnaire scoring, routine personalisation" },
  { title: "Ingredient Matching & Safety", tag: "Ingredient decoding, allergen flagging, formulation checks" },
  { title: "Skincare Routine Recommendations", tag: "Morning & evening builds, skin type logic, product pairings" },
  { title: "Product Discovery & Education", tag: "SKU matching, skin concern mapping, ingredient education" },
  { title: "Consultation & Dermatologist-Guided AI", tag: "Clinical backing, professional escalation, trust signals" },
];

const FEATURES = [
  { name: "Skin type detection", desc: "Photo, selfie, or questionnaire-based skin analysis" },
  { name: "Ingredient database depth", desc: "INCI coverage, actives mapping, safety classifications" },
  { name: "Allergen & sensitivity flagging", desc: "Cross-reactivity detection, fragrance & irritant alerts" },
  { name: "Personalised routine builder", desc: "AM/PM logic, layering order, climate & season adaptation" },
  { name: "Product recommendation engine", desc: "SKU-level matching across brand catalogues" },
  { name: "Clinical & dermatologist backing", desc: "Evidence-based claims, expert validation signals" },
  { name: "Compliance & labeling checks", desc: "Clean beauty, EU/US regulations, cruelty-free standards" },
  { name: "Skin progress tracking", desc: "Before/after capture, routine adherence, outcome logging" },
];

export default function SkincarePage() {
  return (
    <main
      className="min-h-screen page-gap-fix"
      style={{ background: "linear-gradient(170deg, #FFF0F8 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #FFF0F8 100%)" }}
    >
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "110px 48px 80px" }}>
        <div style={{ position: "absolute", top: -80, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(194,24,106,0.11) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(194,24,106,0.08)", color: "#C2186A", border: "1px solid rgba(194,24,106,0.18)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C2186A", display: "inline-block" }} />
            AI Agents · Skincare &amp; Beauty
          </div>
          <h1 className="font-bold" style={{ fontSize: "clamp(36px, 5.5vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "#0A0A0A", marginBottom: 24 }}>
            Comparison intelligence<br />
            <span style={{ background: "linear-gradient(135deg, #C2186A 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              for skincare AI agents
            </span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 540, margin: "0 auto 40px" }}>
            AgenticLib tracks where your product appears when consumers and beauty brands research skincare AI —
            and benchmarks every feature that drives trust, personalisation, and recommendations.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#contact" className="btn-primary" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              Get Your Visibility Report
            </a>
            <a href="/#contact" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#C2186A", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(194,24,106,0.22)", backdropFilter: "blur(8px)" }}>
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "56px 48px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>Use Cases</p>
        <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 36 }}>
          Where skincare AI agents compete
        </h2>
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          {USE_CASES.map((uc, i) => (
            <div key={i} className="uc-row" style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 0", borderBottom: "1px solid rgba(0,0,0,0.07)", cursor: "default" }}>
              <div style={{ width: 3, height: 36, borderRadius: 2, background: ACCENT, flexShrink: 0, opacity: 0.5 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0A0A0A", marginBottom: 3 }}>{uc.title}</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.5 }}>{uc.tag}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product Feature Intelligence ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "72px 48px 96px" }}>
        <div style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(194,24,106,0.12)",
          borderRadius: 20,
          padding: "44px 44px 48px",
          boxShadow: "0 4px 32px rgba(194,24,106,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>Product Intelligence</p>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 12 }}>
            What a skincare AI agent needs to win
          </h2>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.65, maxWidth: 560, marginBottom: 36 }}>
            AgenticLib tracks these features across every skincare AI agent in the market —
            benchmarking where your product leads, where it lags, and what your roadmap needs to prioritise.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f.name} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, flexShrink: 0, marginTop: 6 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .uc-row:hover { background: rgba(194,24,106,0.03); border-radius: 10px; }
        .uc-row:hover > div:first-child { opacity: 1 !important; }
        .uc-row:hover > svg { opacity: 0.6 !important; }
        @media (max-width: 640px) {
          main > section { padding-left: 20px !important; padding-right: 20px !important; }
          main > section:first-child { padding-top: 72px !important; }
        }
      `}</style>
    </main>
  );
}
