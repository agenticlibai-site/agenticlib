export const metadata = {
  title: "Legal Solutions – AgenticLib",
  description: "AgenticLib helps legal AI agents compete — track LLM visibility among law firms and GCs, benchmark document intelligence, and surface how buyers evaluate legal AI before shortlisting.",
};

const ACCENT = "#059669";

const USE_CASES = [
  {
    title: "Contract Review & Redlining",
    body: "Legal AI agents that review contracts, flag risk clauses, and redline documents are among the highest-value tools in a law firm's stack. AgenticLib tracks how your contract review agent is surfaced when GCs and partners search for legal AI, and benchmarks your accuracy, speed, and clause-type coverage against Harvey, Ironclad, and others.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="2" width="12" height="17" rx="2" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M7 7h6M7 11h6M7 15h3" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 13l2 2 3-3" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Due Diligence & M&A Support",
    body: "AI agents that accelerate document review in M&A and fundraising workflows are reshaping how deals get done. AgenticLib measures how your due diligence agent is perceived across LLM-driven searches by in-house and external counsel — and shows which capabilities buyers compare when they evaluate your product.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="10" cy="10" r="6.5" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M15 15l4 4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 10h4M10 8v4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Compliance Monitoring & Regulatory Intelligence",
    body: "Legal and compliance teams use AI agents to monitor regulatory changes, flag exposure, and maintain audit trails. AgenticLib tracks how your compliance agent is recommended when legal buyers ask LLMs for help staying ahead of regulation — and benchmarks your jurisdiction coverage and alert accuracy.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3L4 6v6c0 4 3 7 7 8 4-1 7-4 7-8V6l-7-3z" stroke={ACCENT} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 11l2 2 4-4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Litigation Research & Case Strategy",
    body: "AI agents that surface precedents, analyse case law, and support litigation strategy are becoming standard in litigation practices. AgenticLib monitors how your litigation research agent is characterised by LLMs in attorney evaluations, and shows whether your case analysis depth and citation accuracy are positioning you ahead of alternatives.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 4v14M5 7l6-3 6 3M5 15l6 3 6-3" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 10l2 1M17 11l2-1" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="5" cy="10.5" r="2.5" stroke={ACCENT} strokeWidth="1.5"/>
        <circle cx="17" cy="10.5" r="2.5" stroke={ACCENT} strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "Legal Billing & Matter Management",
    body: "AI agents that automate time capture, generate invoices, and manage matter workflows reduce write-offs and administrative burden. AgenticLib benchmarks your billing intelligence features against competitors and tracks how LLMs describe your ROI and efficiency gains when buyers are building a business case for legal AI adoption.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M11 7v4l3 2" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function LegalPage() {
  return (
    <main
      className="min-h-screen page-gap-fix"
      style={{ background: "linear-gradient(170deg, #ECFDF5 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #ECFDF5 100%)" }}
    >
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "110px 48px 80px" }}>
        <div style={{ position: "absolute", top: -80, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(5,150,105,0.08)", color: "#059669", border: "1px solid rgba(5,150,105,0.18)" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
            AI Agents · Legal
          </div>

          <h1
            className="font-bold"
            style={{ fontSize: "clamp(38px, 5.5vw, 58px)", letterSpacing: "-0.03em", lineHeight: 1.06, color: "#0A0A0A", marginBottom: 24 }}
          >
            Be the legal AI<br />
            <span style={{ background: "linear-gradient(135deg, #059669 0%, #2563EB 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              general counsel trusts
            </span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 560, margin: "0 auto 40px" }}>
            Law firms and in-house counsel now ask AI before shortlisting legal tech.
            AgenticLib shows where your agent appears in those searches — and what it takes to become the trusted answer.
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
              style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#059669", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(5,150,105,0.25)", backdropFilter: "blur(8px)" }}
            >
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 48px" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(5,150,105,0.15), transparent)" }} />
      </div>

      {/* ── Use Cases ── */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "72px 48px 96px" }}>
        <div style={{ marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#059669", marginBottom: 12 }}>Use Cases</p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 700, letterSpacing: "-0.022em", color: "#0A0A0A", lineHeight: 1.2, maxWidth: 540 }}>
            Where AgenticLib helps legal AI agents compete
          </h2>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.65, marginTop: 14, maxWidth: 520 }}>
            Five of the most critical legal AI use cases — and the competitive intelligence layer AgenticLib adds to each.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }} className="uc-grid">
          {USE_CASES.map((uc) => (
            <div key={uc.title} className="uc-card" style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(5,150,105,0.12)",
              borderTop: "3px solid #059669",
              borderRadius: 16,
              padding: "28px 26px 30px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11,
                background: "rgba(5,150,105,0.10)",
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
          background: "linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(37,99,235,0.05) 100%)",
          border: "1.5px solid rgba(5,150,105,0.18)",
          borderRadius: 22,
          padding: "56px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#059669", marginBottom: 14 }}>Get Started</p>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.022em", lineHeight: 1.2, marginBottom: 12 }}>
            Ready to win legal tech evaluations?
          </h2>
          <p style={{ fontSize: 16, color: "#555", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Get your legal AI agent&apos;s first visibility report in 48 hours — no setup required.
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
        .uc-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 36px rgba(5,150,105,0.11), 0 4px 10px rgba(0,0,0,0.06) !important; }
        @media (max-width: 640px) {
          main > section { padding-left: 20px !important; padding-right: 20px !important; }
          main > section:first-child { padding-top: 72px !important; }
          .uc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
