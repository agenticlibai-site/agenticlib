export const metadata = {
  title: "Sales Solutions – AgenticLib",
  description: "AgenticLib helps sales AI agents compete — track LLM visibility, benchmark capabilities against top competitors, and understand how revenue teams discover and evaluate AI tools.",
};

const USE_CASES = [
  {
    title: "Lead Qualification & Scoring",
    body: "AI agents that score inbound leads, prioritise outreach queues, and surface buying intent signals have become essential for modern sales teams. AgenticLib tracks how your qualification agent is discovered and evaluated when revenue leaders ask LLMs which AI tool helps their team focus on the right prospects.",
  },
  {
    title: "Outbound Sequencing & Personalisation",
    body: "Sales AI agents that build, personalise, and optimise outbound sequences are at the core of pipeline generation. AgenticLib benchmarks your sequencing capabilities — personalisation depth, multi-channel support, reply detection — against competitors like Outreach and Apollo, and shows how LLMs position you in buyer shortlists.",
  },
  {
    title: "Call Intelligence & Coaching",
    body: "AI agents that transcribe calls, surface objections, and coach reps in real time are reshaping how teams improve. AgenticLib measures how your call intelligence product is surfaced when sales leaders search for AI coaching tools, and benchmarks your feature set against Gong, Chorus, and emerging challengers.",
  },
  {
    title: "Pipeline Forecasting & Deal Intelligence",
    body: "Revenue operations teams rely on AI to forecast accurately, flag at-risk deals, and surface the right data at board level. AgenticLib tracks how your forecasting agent is perceived and recommended in LLM-driven searches, and shows which capabilities buyers are comparing when they evaluate pipeline AI.",
  },
  {
    title: "CRM Enrichment & Data Hygiene",
    body: "Sales AI agents that auto-enrich contacts, clean CRM data, and surface account intelligence remove hours of manual work from reps. AgenticLib benchmarks your data enrichment accuracy and integration depth against competitors, and monitors how LLMs characterise your reliability in buyer evaluations.",
  },
];

export default function SalesPage() {
  return (
    <main
      className="min-h-screen page-gap-fix"
      style={{ background: "linear-gradient(170deg, #F0F4FF 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #F0F4FF 100%)" }}
    >
      {/* ── Hero ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "100px 48px 64px", textAlign: "center" }}>
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
          style={{ background: "rgba(37,99,235,0.10)", color: "#2563EB" }}
        >
          AI Agents · Sales
        </div>

        <h1
          className="font-bold mb-5"
          style={{ fontSize: "clamp(34px, 5vw, 52px)", letterSpacing: "-0.025em", lineHeight: 1.1, color: "#0A0A0A" }}
        >
          Be the Sales AI<br />
          <span style={{ background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Revenue Teams Recommend
          </span>
        </h1>

        <p style={{ fontSize: 17, lineHeight: 1.65, color: "#3D3D3D", maxWidth: 580, margin: "0 auto 36px" }}>
          Revenue leaders now ask LLMs which sales tool to adopt before they take a demo.
          AgenticLib shows where your agent stands in those searches — and how to win them.
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
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563EB", marginBottom: 10 }}>Use Cases</p>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.25 }}>
            Where AgenticLib helps sales AI agents compete
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
                border: "1px solid rgba(37,99,235,0.12)",
                borderLeft: "3px solid #2563EB",
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
            background: "linear-gradient(135deg, rgba(37,99,235,0.07) 0%, rgba(124,58,237,0.05) 100%)",
            border: "1.5px solid rgba(37,99,235,0.15)",
            borderRadius: 20,
            padding: "44px 48px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: 10 }}>
            Ready to win more revenue team evaluations?
          </h2>
          <p style={{ fontSize: 15, color: "#4B4B4B", maxWidth: 460, margin: "0 auto 28px" }}>
            Get your sales AI agent&apos;s first visibility report in 48 hours.
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
