export const metadata = {
  title: "Sales Solutions – AgenticLib",
  description: "AgenticLib helps sales AI agents compete — track LLM visibility among revenue teams, benchmark capabilities, and understand how buyers evaluate sales AI before shortlisting.",
};

const ACCENT = "#2563EB";

const USE_CASES = [
  {
    title: "Lead Qualification & Scoring",
    body: "AI agents that score inbound leads, prioritise outreach queues, and surface buying intent signals have become essential for modern sales teams. AgenticLib tracks how your qualification agent is discovered and evaluated when revenue leaders ask LLMs which AI tool helps their team focus on the right prospects.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 4h14v3l-5 5v6l-4-2v-4L4 7V4z" stroke={ACCENT} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M4 7h14" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Outbound Sequencing & Personalisation",
    body: "Sales AI agents that build, personalise, and optimise outbound sequences are at the core of pipeline generation. AgenticLib benchmarks your sequencing capabilities — personalisation depth, multi-channel support, reply detection — against competitors and shows how LLMs position you in buyer shortlists.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="4" cy="5" r="2" stroke={ACCENT} strokeWidth="1.5"/>
        <circle cx="4" cy="11" r="2" stroke={ACCENT} strokeWidth="1.5"/>
        <circle cx="4" cy="17" r="2" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M6 5h4m0 0l3 3m-3-3l3-3" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 11h5m0 0l3 3m-3-3l3-3" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 17h6m0 0l3 3m-3-3l3-3" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Call Intelligence & Coaching",
    body: "AI agents that transcribe calls, surface objections, and coach reps in real time are reshaping how teams improve. AgenticLib measures how your call intelligence product is surfaced when sales leaders search for AI coaching tools, and benchmarks your feature set against Gong, Chorus, and emerging challengers.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="8" y="2" width="6" height="10" rx="3" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M5 11a6 6 0 0012 0" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 17v3M8 20h6" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Pipeline Forecasting & Deal Intelligence",
    body: "Revenue operations teams rely on AI to forecast accurately, flag at-risk deals, and surface the right data at board level. AgenticLib tracks how your forecasting agent is perceived and recommended in LLM-driven searches, and shows which capabilities buyers compare when evaluating pipeline AI.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 16l4.5-6 4 2.5 3.5-5 4 3.5" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 20h16" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="19" cy="14" r="2" fill={ACCENT} fillOpacity="0.15" stroke={ACCENT} strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "CRM Enrichment & Data Hygiene",
    body: "Sales AI agents that auto-enrich contacts, clean CRM data, and surface account intelligence remove hours of manual work from reps. AgenticLib benchmarks your data enrichment accuracy and integration depth against competitors, and monitors how LLMs characterise your reliability in buyer evaluations.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <ellipse cx="11" cy="6" rx="7" ry="3" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M4 6v4c0 1.657 3.134 3 7 3s7-1.343 7-3V6" stroke={ACCENT} strokeWidth="1.5"/>
        <path d="M4 10v4c0 1.657 3.134 3 7 3s7-1.343 7-3v-4" stroke={ACCENT} strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function SalesPage() {
  return (
    <main
      className="min-h-screen page-gap-fix"
      style={{ background: "linear-gradient(170deg, #EFF6FF 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #EFF6FF 100%)" }}
    >
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "110px 48px 80px" }}>
        <div style={{ position: "absolute", top: -80, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(37,99,235,0.08)", color: "#2563EB", border: "1px solid rgba(37,99,235,0.18)" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB", display: "inline-block" }} />
            AI Agents · Sales
          </div>

          <h1
            className="font-bold"
            style={{ fontSize: "clamp(38px, 5.5vw, 58px)", letterSpacing: "-0.03em", lineHeight: 1.06, color: "#0A0A0A", marginBottom: 24 }}
          >
            Be the sales AI<br />
            <span style={{ background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              revenue teams recommend
            </span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 560, margin: "0 auto 40px" }}>
            Revenue leaders ask LLMs which sales AI to adopt before they take a demo.
            AgenticLib shows where your agent stands in those searches — and how to win them.
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
              style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#2563EB", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(37,99,235,0.25)", backdropFilter: "blur(8px)" }}
            >
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 48px" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.15), transparent)" }} />
      </div>

      {/* ── Use Cases ── */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "72px 48px 96px" }}>
        <div style={{ marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563EB", marginBottom: 12 }}>Use Cases</p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 700, letterSpacing: "-0.022em", color: "#0A0A0A", lineHeight: 1.2, maxWidth: 540 }}>
            Where AgenticLib helps sales AI agents compete
          </h2>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.65, marginTop: 14, maxWidth: 520 }}>
            Five of the most critical sales AI use cases — and the competitive intelligence layer AgenticLib adds to each.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }} className="uc-grid">
          {USE_CASES.map((uc) => (
            <div key={uc.title} className="uc-card" style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(37,99,235,0.12)",
              borderTop: "3px solid #2563EB",
              borderRadius: 16,
              padding: "28px 26px 30px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11,
                background: "rgba(37,99,235,0.10)",
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
          background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.06) 100%)",
          border: "1.5px solid rgba(37,99,235,0.18)",
          borderRadius: 22,
          padding: "56px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563EB", marginBottom: 14 }}>Get Started</p>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.022em", lineHeight: 1.2, marginBottom: 12 }}>
            Ready to win more revenue team evaluations?
          </h2>
          <p style={{ fontSize: 16, color: "#555", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Get your sales AI agent&apos;s first visibility report in 48 hours — no setup required.
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
        .uc-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 36px rgba(37,99,235,0.11), 0 4px 10px rgba(0,0,0,0.06) !important; }
        @media (max-width: 640px) {
          main > section { padding-left: 20px !important; padding-right: 20px !important; }
          main > section:first-child { padding-top: 72px !important; }
          .uc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
