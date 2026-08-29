export const metadata = {
  title: "Insurance Broker Solutions – AgenticLib",
  description:
    "AgenticLib helps insurance broker AI agents compete — track LLM visibility among brokerage teams, benchmark capabilities, and understand how buyers evaluate insurance broker AI before shortlisting.",
};

const ACCENT = "#059669";

const USE_CASES = [
  { title: "Renewal Management & Automation", tag: "Auto follow-up, stage tracking, expiry reminders, insurer chasing" },
  { title: "Document Processing & Extraction", tag: "Policy schedule extraction, unstructured attachment handling, submission data" },
  { title: "Risk Assessment & Submission Prep", tag: "Client risk data collection, gap detection, pre-submission completeness checks" },
  { title: "Claims Advocacy & Status Tracking", tag: "Claim tracking, insurer follow-up, quiet claim alerts, settlement support" },
  { title: "Client Communication & Self-Service", tag: "Broker-voice emails, client portals, routine query handling, automated updates" },
  { title: "Compliance & Audit Trails", tag: "Timestamped contact logging, regulatory export, full renewal action records" },
];

const FEATURES = [
  { name: "Renewal stage tracking", desc: "Days-to-expiry reminders, stage-based triggers, automated insurer follow-up" },
  { name: "Document extraction", desc: "Policy PDFs, schedules of value, unstructured email attachments — no manual entry" },
  { name: "Submission gap detection", desc: "Flag missing fields before a submission is sent to an insurer" },
  { name: "Claims status automation", desc: "Track open claims and follow up with insurers when responses stall" },
  { name: "Broker-voice client emails", desc: "AI learns the broker's writing style — not generic templates" },
  { name: "Compliance logging", desc: "Every client contact, email, and action automatically timestamped" },
  { name: "Private AI infrastructure", desc: "Client data never used to train AI models — fully private processing" },
  { name: "Audit trail export", desc: "Exportable record of every renewal action for regulatory review" },
];

export default function InsuranceBrokerPage() {
  return (
    <main
      className="min-h-screen page-gap-fix"
      style={{ background: "linear-gradient(170deg, #ECFDF5 0%, #F0FDFA 28%, #F9FAFB 55%, #F0FDFA 78%, #ECFDF5 100%)" }}
    >
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "110px 48px 80px" }}>
        <div style={{ position: "absolute", top: -80, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(5,150,105,0.08)", color: "#059669", border: "1px solid rgba(5,150,105,0.18)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
            AI Agents · Insurance Broker · Finance
          </div>
          <h1 className="font-bold" style={{ fontSize: "clamp(36px, 5.5vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "#0A0A0A", marginBottom: 24 }}>
            Comparison intelligence<br />
            <span style={{ background: "linear-gradient(135deg, #059669 0%, #0D9488 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              for insurance broker AI
            </span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 560, margin: "0 auto 40px" }}>
            AgenticLib tracks where your product appears when brokerage leaders evaluate AI agents —
            and benchmarks every capability buyers weigh before they shortlist.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#contact" className="btn-primary" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "#059669" }}>
              Get Your Visibility Report
            </a>
            <a href="/#contact" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#059669", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(5,150,105,0.22)", backdropFilter: "blur(8px)" }}>
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "56px 48px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>Use Cases</p>
        <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 36 }}>
          Where insurance broker AI agents compete
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
          border: "1px solid rgba(5,150,105,0.12)",
          borderRadius: 20,
          padding: "44px 44px 48px",
          boxShadow: "0 4px 32px rgba(5,150,105,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>Product Intelligence</p>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 12 }}>
            What an insurance broker AI agent needs to win
          </h2>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.65, maxWidth: 560, marginBottom: 36 }}>
            AgenticLib tracks these features across every insurance broker AI agent in the market —
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
        .uc-row:hover { background: rgba(5,150,105,0.03); border-radius: 10px; }
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
