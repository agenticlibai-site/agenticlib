export const metadata = {
  title: "Skincare & Beauty Solutions – AgenticLib",
  description: "AgenticLib helps skincare and beauty AI agents compete — track LLM visibility, benchmark personalization depth, and understand consumer trust signals against competitors.",
};

const USE_CASES = [
  {
    title: "Skin Analysis & Personalisation",
    body: "AI agents that analyse skin photos, questionnaires, or purchase history to deliver personalised routines are central to modern beauty apps. AgenticLib benchmarks your personalisation depth against competitors and tracks how LLMs describe and recommend your agent when consumers search for personalised skincare AI.",
  },
  {
    title: "Ingredient Matching & Safety",
    body: "Consumers increasingly rely on AI to decode ingredient lists, flag allergens, and check formulation safety. AgenticLib measures how your ingredient intelligence compares to competitors and monitors whether LLMs position your agent as accurate, safe, and trustworthy — before buyers find someone else.",
  },
  {
    title: "Skincare Routine Recommendations",
    body: "The core use case for beauty AI: building morning and evening routines tailored to a user's skin type, concerns, and goals. AgenticLib tracks how visible your recommendation engine is across LLM-driven searches and shows you which competitor agents are being recommended in your place — and why.",
  },
  {
    title: "Product Discovery & Education",
    body: "AI agents that help consumers find the right product across thousands of SKUs are reshaping the beauty retail experience. AgenticLib shows how your product discovery agent is surfaced by LLMs when buyers search, and benchmarks your catalogue coverage, search intelligence, and skin match accuracy against the field.",
  },
  {
    title: "Consultation & Dermatologist-Guided AI",
    body: "High-trust skincare AI agents simulate professional consultations — connecting skin concerns to clinically-backed routines and ingredients. AgenticLib tracks how AI assistants characterise your clinical credibility and benchmark it against other agents positioning in the expert consultation space.",
  },
];

export default function SkincarePage() {
  return (
    <main
      className="min-h-screen page-gap-fix"
      style={{ background: "linear-gradient(170deg, #FFF0F8 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #FFF0F8 100%)" }}
    >
      {/* ── Hero ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "100px 48px 64px", textAlign: "center" }}>
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
          style={{ background: "rgba(194,24,106,0.10)", color: "#C2186A" }}
        >
          AI Agents · Skincare &amp; Beauty
        </div>

        <h1
          className="font-bold mb-5"
          style={{ fontSize: "clamp(34px, 5vw, 52px)", letterSpacing: "-0.025em", lineHeight: 1.1, color: "#0A0A0A" }}
        >
          Be the Skincare AI<br />
          <span style={{ background: "linear-gradient(135deg, #C2186A 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Consumers Already Trust
          </span>
        </h1>

        <p style={{ fontSize: 17, lineHeight: 1.65, color: "#3D3D3D", maxWidth: 580, margin: "0 auto 36px" }}>
          Beauty consumers ask AI before they ask a friend. AgenticLib shows you where your
          skincare agent ranks in those conversations — and what it takes to become the one they trust.
        </p>

        <a
          href="/#contact"
          className="btn-primary"
          style={{ display: "inline-block", padding: "13px 32px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
        >
          Get Your Visibility Report
        </a>
      </section>

      {/* ── Use Cases ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 48px 100px" }}>
        <div style={{ marginBottom: 44 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C2186A", marginBottom: 10 }}>Use Cases</p>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.25 }}>
            Where AgenticLib helps skincare AI agents compete
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          {USE_CASES.map((uc) => (
            <div
              key={uc.title}
              style={{
                background: "rgba(255,255,255,0.60)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(194,24,106,0.12)",
                borderLeft: "3px solid #C2186A",
                borderRadius: 14,
                padding: "22px 24px",
                boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A", marginBottom: 10 }}>{uc.title}</h3>
              <p style={{ fontSize: 14, color: "#4A4A4A", lineHeight: 1.68 }}>{uc.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 860, margin: "0 auto 80px", padding: "0 48px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(194,24,106,0.07) 0%, rgba(124,58,237,0.05) 100%)",
            border: "1.5px solid rgba(194,24,106,0.15)",
            borderRadius: 20,
            padding: "44px 48px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: 10 }}>
            Ready to become the beauty AI they reach for?
          </h2>
          <p style={{ fontSize: 15, color: "#4B4B4B", maxWidth: 460, margin: "0 auto 28px" }}>
            Get your skincare AI agent&apos;s first visibility report in 48 hours.
          </p>
          <a
            href="/#contact"
            className="btn-primary"
            style={{ display: "inline-block", padding: "13px 32px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
          >
            Get Started
          </a>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          main > section { padding-left: 20px !important; padding-right: 20px !important; }
          main > section:first-child { padding-top: 72px !important; }
          div[style*="auto-fit, minmax(360px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
