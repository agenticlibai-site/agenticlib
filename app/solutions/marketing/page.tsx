export const metadata = {
  title: "Marketing Solutions – AgenticLib",
  description: "AgenticLib helps marketing AI agents compete — track visibility, benchmark features, and surface where buyers are finding your competitors across LLMs.",
};

const ACCENT = "#7C3AED";
const ACCENT2 = "#C2186A";

const USE_CASES = [
  {
    title: "Content Marketing & SEO",
    body: "Marketing teams use AI agents to plan, write, and optimise content at scale. AgenticLib tracks how these agents are discovered and ranked by LLMs when buyers search for AI-powered content tools — so you know where you stand against competitors before a deal slips away.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="2" width="13" height="17" rx="2" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M7 7h6M7 11h6M7 15h4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="17" cy="17" r="3" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M19.5 19.5l2 2" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Paid Advertising & Campaign Optimisation",
    body: "Ad teams rely on AI to manage bidding, creative testing, and audience targeting. AgenticLib benchmarks your agent's campaign automation features against competitors and shows whether LLMs surface you when buyers ask about AI for paid media.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 17l4-6 4 3 4-7 4 4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 20h16" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Outbound & Email Outreach",
    body: "AI agents now write, personalise, and sequence outbound emails at scale. AgenticLib tracks how your outreach agent is perceived across LLM-driven buyer searches — and benchmarks your personalisation, deliverability, and multi-channel capabilities against the tools your prospects compare you to.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="5" width="18" height="13" rx="2" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M2 8l9 6 9-6" stroke={ACCENT} strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Brand Intelligence & Competitive Monitoring",
    body: "Marketing leaders use AI to monitor brand sentiment, track competitor moves, and surface market signals. AgenticLib shows how LLMs characterise your brand intelligence agent in competitive queries — and flags when competitors are gaining ground in AI recall before it shows up in your pipeline.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke={ACCENT} strokeWidth="1.5"/>
        <circle cx="11" cy="11" r="4" stroke={ACCENT} strokeWidth="1.5"/>
        <circle cx="11" cy="11" r="1.5" fill={ACCENT}/>
      </svg>
    ),
  },
  {
    title: "Social Media Management",
    body: "Social AI agents handle scheduling, community engagement, and content creation across channels. AgenticLib benchmarks your social agent's feature set and tracks its LLM visibility — which capabilities are driving recommendations versus costing you comparisons.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="18" cy="5" r="2.5" stroke={ACCENT} strokeWidth="1.5"/>
        <circle cx="4" cy="11" r="2.5" stroke={ACCENT} strokeWidth="1.5"/>
        <circle cx="18" cy="17" r="2.5" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M6.5 10L15.5 6M6.5 12L15.5 16" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function MarketingPage() {
  return (
    <main
      className="min-h-screen page-gap-fix"
      style={{ background: "linear-gradient(170deg, #FEF0F5 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #FEF0F5 100%)" }}
    >
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "110px 48px 80px" }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -80, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(194,24,106,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.18)" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C3AED", display: "inline-block" }} />
            AI Agents · Marketing
          </div>

          <h1
            className="font-bold"
            style={{ fontSize: "clamp(38px, 5.5vw, 58px)", letterSpacing: "-0.03em", lineHeight: 1.06, color: "#0A0A0A", marginBottom: 24 }}
          >
            Be the marketing AI<br />
            <span style={{ background: "linear-gradient(135deg, #7C3AED 0%, #C2186A 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              your buyers find first
            </span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 560, margin: "0 auto 40px" }}>
            When marketers ask ChatGPT or Perplexity which AI to use, are you the answer?
            AgenticLib shows exactly where your agent ranks — and what it takes to lead.
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
              style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#7C3AED", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(124,58,237,0.25)", backdropFilter: "blur(8px)" }}
            >
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 48px" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)" }} />
      </div>

      {/* ── Use Cases ── */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "72px 48px 96px" }}>
        <div style={{ marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 12 }}>Use Cases</p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 700, letterSpacing: "-0.022em", color: "#0A0A0A", lineHeight: 1.2, maxWidth: 540 }}>
            Where AgenticLib helps marketing AI agents compete
          </h2>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.65, marginTop: 14, maxWidth: 520 }}>
            Five of the most critical marketing AI use cases — and the competitive intelligence layer AgenticLib adds to each.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }} className="uc-grid">
          {USE_CASES.map((uc) => (
            <div key={uc.title} className="uc-card" style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(124,58,237,0.12)",
              borderTop: "3px solid #7C3AED",
              borderRadius: 16,
              padding: "28px 26px 30px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11,
                background: "rgba(124,58,237,0.10)",
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
          background: "linear-gradient(135deg, rgba(124,58,237,0.09) 0%, rgba(194,24,106,0.07) 100%)",
          border: "1.5px solid rgba(124,58,237,0.18)",
          borderRadius: 22,
          padding: "56px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 14 }}>Get Started</p>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.022em", lineHeight: 1.2, marginBottom: 12 }}>
            Ready to lead the conversation?
          </h2>
          <p style={{ fontSize: 16, color: "#555", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Get your marketing AI agent&apos;s first visibility report in 48 hours — no setup required.
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
        .uc-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 36px rgba(124,58,237,0.12), 0 4px 10px rgba(0,0,0,0.06) !important; }
        @media (max-width: 640px) {
          main > section { padding-left: 20px !important; padding-right: 20px !important; }
          main > section:first-child { padding-top: 72px !important; }
          .uc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
