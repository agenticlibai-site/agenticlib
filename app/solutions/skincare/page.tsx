export const metadata = {
  title: "Skincare & Beauty Solutions – AgenticLib",
  description: "AgenticLib helps skincare and beauty AI agents compete — track LLM visibility, benchmark personalisation depth, and understand consumer trust signals against competitors.",
};

const ACCENT = "#C2186A";

const USE_CASES = [
  {
    title: "Skin Analysis & Personalisation",
    body: "AI agents that analyse skin photos, questionnaires, or purchase history to deliver personalised routines are central to modern beauty apps. AgenticLib benchmarks your personalisation depth against competitors and tracks how LLMs describe and recommend your agent when consumers search for personalised skincare AI.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="4" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M4 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 5l1.5-1.5M19 9h2M17 13l1.5 1.5" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Ingredient Matching & Safety",
    body: "Consumers increasingly rely on AI to decode ingredient lists, flag allergens, and check formulation safety. AgenticLib measures how your ingredient intelligence compares to competitors and monitors whether LLMs position your agent as accurate, safe, and trustworthy — before buyers find someone else.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M9 3h4v5l3 5v5H6v-5l3-5V3z" stroke={ACCENT} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6 15h10" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 3h4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Skincare Routine Recommendations",
    body: "The core use case for beauty AI: building morning and evening routines tailored to a user's skin type, concerns, and goals. AgenticLib tracks how visible your recommendation engine is across LLM-driven searches and shows which competitor agents are being recommended in your place — and why.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="16" rx="2" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M7 8h8M7 12h8M7 16h5" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="5.5" cy="8" r="1" fill={ACCENT}/>
        <circle cx="5.5" cy="12" r="1" fill={ACCENT}/>
        <circle cx="5.5" cy="16" r="1" fill={ACCENT}/>
      </svg>
    ),
  },
  {
    title: "Product Discovery & Education",
    body: "AI agents that help consumers find the right product across thousands of SKUs are reshaping beauty retail. AgenticLib shows how your product discovery agent is surfaced by LLMs when buyers search, and benchmarks your catalogue coverage, search intelligence, and skin match accuracy against the field.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="10" cy="10" r="6.5" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M15 15l4 4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 10h4M10 8v4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Consultation & Dermatologist-Guided AI",
    body: "High-trust skincare AI agents simulate professional consultations — connecting skin concerns to clinically-backed routines and ingredients. AgenticLib tracks how AI assistants characterise your clinical credibility and benchmarks it against agents positioning in the expert consultation space.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 5a2 2 0 012-2h10a2 2 0 012 2v9a2 2 0 01-2 2H8l-4 3V5z" stroke={ACCENT} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 9h6M8 13h4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
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
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(194,24,106,0.08)", color: "#C2186A", border: "1px solid rgba(194,24,106,0.18)" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C2186A", display: "inline-block" }} />
            AI Agents · Skincare &amp; Beauty
          </div>

          <h1
            className="font-bold"
            style={{ fontSize: "clamp(38px, 5.5vw, 58px)", letterSpacing: "-0.03em", lineHeight: 1.06, color: "#0A0A0A", marginBottom: 24 }}
          >
            Be the skincare AI<br />
            <span style={{ background: "linear-gradient(135deg, #C2186A 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              consumers already trust
            </span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 560, margin: "0 auto 40px" }}>
            Beauty consumers ask AI before they ask a friend. AgenticLib shows where
            your skincare agent ranks in those conversations — and how to become the answer they find.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/#contact"
              className="btn-primary"
              style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
            >
              Get Your Visibility Report
            </a>
            <a
              href="/#contact"
              style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#C2186A", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(194,24,106,0.25)", backdropFilter: "blur(8px)" }}
            >
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 48px" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(194,24,106,0.15), transparent)" }} />
      </div>

      {/* ── Use Cases ── */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "72px 48px 96px" }}>
        <div style={{ marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C2186A", marginBottom: 12 }}>Use Cases</p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 700, letterSpacing: "-0.022em", color: "#0A0A0A", lineHeight: 1.2, maxWidth: 540 }}>
            Where AgenticLib helps skincare AI agents compete
          </h2>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.65, marginTop: 14, maxWidth: 520 }}>
            Five of the most critical skincare AI use cases — and the competitive intelligence layer AgenticLib adds to each.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }} className="uc-grid">
          {USE_CASES.map((uc) => (
            <div key={uc.title} className="uc-card" style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(194,24,106,0.12)",
              borderTop: "3px solid #C2186A",
              borderRadius: 16,
              padding: "28px 26px 30px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11,
                background: "rgba(194,24,106,0.10)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18,
              }}>
                {uc.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A", marginBottom: 10, letterSpacing: "-0.01em" }}>{uc.title}</h3>
              <p style={{ fontSize: 14, color: "#4A4A4A", lineHeight: 1.72 }}>{uc.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ maxWidth: 960, margin: "0 auto 88px", padding: "0 48px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(194,24,106,0.08) 0%, rgba(124,58,237,0.06) 100%)",
          border: "1.5px solid rgba(194,24,106,0.18)",
          borderRadius: 22,
          padding: "56px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(194,24,106,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C2186A", marginBottom: 14 }}>Get Started</p>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.022em", lineHeight: 1.2, marginBottom: 12 }}>
            Ready to become the beauty AI they reach for?
          </h2>
          <p style={{ fontSize: 16, color: "#555", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Get your skincare AI agent&apos;s first visibility report in 48 hours — no setup required.
          </p>
          <a
            href="/#contact"
            className="btn-primary"
            style={{ display: "inline-block", padding: "14px 36px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
          >
            Get Started Free
          </a>
        </div>
      </section>

      <style>{`
        .uc-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 36px rgba(194,24,106,0.11), 0 4px 10px rgba(0,0,0,0.06) !important; }
        @media (max-width: 640px) {
          main > section { padding-left: 20px !important; padding-right: 20px !important; }
          main > section:first-child { padding-top: 72px !important; }
          .uc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
