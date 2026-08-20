export const metadata = {
  title: "Legal Solutions – AgenticLib",
  description: "AgenticLib helps legal AI agents compete — track LLM visibility among law firms and GCs, benchmark document intelligence, and surface how buyers evaluate legal AI before shortlisting.",
};

const USE_CASES = [
  {
    title: "Contract Review & Redlining",
    body: "Legal AI agents that review contracts, flag risk clauses, and redline documents are among the highest-value tools in a law firm's stack. AgenticLib tracks how your contract review agent is surfaced when GCs and partners search for legal AI, and benchmarks your accuracy, speed, and clause-type coverage against Harvey, Ironclad, and others.",
  },
  {
    title: "Due Diligence & M&A Support",
    body: "AI agents that accelerate document review in M&A and fundraising workflows are reshaping how deals get done. AgenticLib measures how your due diligence agent is perceived across LLM-driven searches by in-house and external counsel, and shows which capabilities — document throughput, issue spotting, jurisdiction depth — buyers are comparing when they evaluate your product.",
  },
  {
    title: "Compliance Monitoring & Regulatory Intelligence",
    body: "Legal and compliance teams use AI agents to monitor regulatory changes, flag exposure, and maintain audit trails. AgenticLib tracks how your compliance agent is recommended when legal buyers ask LLMs for help staying ahead of regulation — and benchmarks your jurisdiction coverage and alert accuracy against competitors.",
  },
  {
    title: "Litigation Research & Case Strategy",
    body: "AI agents that surface precedents, analyse case law, and support litigation strategy are becoming standard in litigation practices. AgenticLib monitors how your litigation research agent is characterised by LLMs in attorney evaluations, and shows whether your case analysis depth and citation accuracy are positioning you ahead of or behind the alternatives they find.",
  },
  {
    title: "Legal Billing & Matter Management",
    body: "AI agents that automate time capture, generate invoices, and manage matter workflows reduce write-offs and administrative burden. AgenticLib benchmarks your billing intelligence and matter management features against competitors, and tracks how LLMs describe your ROI and efficiency gains when buyers are building a business case for legal AI adoption.",
  },
];

export default function LegalPage() {
  return (
    <main
      className="min-h-screen page-gap-fix"
      style={{ background: "linear-gradient(170deg, #F0FAF5 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #F0FAF5 100%)" }}
    >
      {/* ── Hero ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "100px 48px 64px", textAlign: "center" }}>
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
          style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}
        >
          AI Agents · Legal
        </div>

        <h1
          className="font-bold mb-5"
          style={{ fontSize: "clamp(34px, 5vw, 52px)", letterSpacing: "-0.025em", lineHeight: 1.1, color: "#0A0A0A" }}
        >
          Be the Legal AI<br />
          <span style={{ background: "linear-gradient(135deg, #059669 0%, #2563EB 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            General Counsel Already Trusts
          </span>
        </h1>

        <p style={{ fontSize: 17, lineHeight: 1.65, color: "#3D3D3D", maxWidth: 580, margin: "0 auto 36px" }}>
          Law firms and in-house legal teams now ask AI before shortlisting legal tech.
          AgenticLib shows where your agent appears in those searches — and what it takes to become the trusted answer.
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
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#059669", marginBottom: 10 }}>Use Cases</p>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.25 }}>
            Where AgenticLib helps legal AI agents compete
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
                border: "1px solid rgba(5,150,105,0.12)",
                borderLeft: "3px solid #059669",
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
            background: "linear-gradient(135deg, rgba(5,150,105,0.07) 0%, rgba(37,99,235,0.05) 100%)",
            border: "1.5px solid rgba(5,150,105,0.15)",
            borderRadius: 20,
            padding: "44px 48px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: 10 }}>
            Ready to win legal tech evaluations?
          </h2>
          <p style={{ fontSize: 15, color: "#4B4B4B", maxWidth: 460, margin: "0 auto 28px" }}>
            Get your legal AI agent&apos;s first visibility report in 48 hours.
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
