import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insurance Broker AI Agents – AgenticLib",
  description: "AgenticLib helps insurance broker AI agents compete. Track LLM visibility among brokerages, benchmark renewal automation and compliance capabilities against competitors, and understand how buyers evaluate insurance broker AI before shortlisting.",
  keywords: [
    "insurance broker AI agents", "AI insurance broker tools", "LLM visibility insurance AI",
    "compare insurance broker AI", "insurance brokerage AI competitive intelligence", "AI agent benchmarking insurance",
  ],
  alternates: { canonical: "https://agenticlib.com/solutions/insurance-broker" },
  openGraph: {
    type: "website",
    siteName: "AgenticLib",
    title: "Insurance Broker AI Agents – AgenticLib",
    description: "Track your insurance broker AI agent's LLM visibility, benchmark renewal automation and compliance capabilities against competitors, and surface where brokerages are finding alternatives.",
    url: "https://agenticlib.com/solutions/insurance-broker",
    images: [{ url: "/recommendations-cover.png", width: 1200, height: 630, alt: "AgenticLib – Insurance Broker AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Insurance Broker AI Agents – AgenticLib",
    description: "Track your insurance broker AI agent's LLM visibility, benchmark renewal automation and compliance capabilities against competitors, and surface where brokerages are finding alternatives.",
    images: ["/recommendations-cover.png"],
  },
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

      {/* ── Signal → Roadmap ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "72px 48px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>Intelligence Layer</p>
        <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 14 }}>Where your roadmap actually comes from</h2>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, maxWidth: 620, marginBottom: 40 }}>
          Most insurance broker AI builders find out they lost a deal because of AFSL compliance framing from the principal who never came back. AgenticLib tracks five signals simultaneously so the gap is visible before the deal, not after.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14, marginBottom: 14 }}>
          {[
            { label: "Buyer Intent", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#059669" strokeWidth="1.7"/><path d="M13 13l3.5 3.5" stroke="#059669" strokeWidth="1.7" strokeLinecap="round"/></svg>, title: "What brokerage principals ask LLMs when evaluating AI tools", signals: ["\"AI that automates renewal follow-ups so my brokers don't chase insurers manually\" — renewal automation is the first use case evaluated, and the baseline expectation", "\"Insurance broker AI that handles AFSL compliance logging automatically\" — compliance logging is a hard requirement, not a nice-to-have; tools without it are screened out before demos", "\"AI for brokers that isn't just another generic CRM\" — principals are actively rejecting horizontal tools in favour of insurance-native AI built around their workflows"] },
            { label: "Market Insights", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><polyline points="2,14 7,9 11,12 18,5" stroke="#059669" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: "How the insurance broker AI market is shifting right now", signals: ["Compliance-related queries grew 67% following the Insurance Brokers Code of Practice review — AFSL-specific framing now appears in nearly every evaluation conversation", "Claims advocacy is the most-searched cluster with the least competitive density — brokers want tools that actively chase insurers on claims, and nothing in the market does it well", "No Australian-native insurance broker AI exists at scale — US-built tools don't meet AFSL requirements, and AU brokers know it, creating a structural gap for a local builder"] },
            { label: "Competitor Landscape", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="#059669" strokeWidth="1.6"/><rect x="12" y="2" width="6" height="6" rx="1.5" stroke="#059669" strokeWidth="1.6"/><rect x="2" y="12" width="6" height="6" rx="1.5" stroke="#059669" strokeWidth="1.6"/><rect x="12" y="12" width="6" height="6" rx="1.5" stroke="#059669" strokeWidth="1.6"/></svg>, title: "Which clusters are owned and where the gaps are", signals: ["Renewal automation has the most competitors — Vertafore, Applied Epic, and several AU point solutions all claim the space, but none do active insurer chasing (they do reminders)", "Claims advocacy is entirely open — no tool owns it, and brokers are actively searching for it, making it the highest-value uncontested cluster in the AU market", "AFSL compliance logging has no clear winner — most tools log loosely; none produce export-ready regulatory records that satisfy a principal's PI insurer"] },
            { label: "Lost Deal Tracking", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#059669" strokeWidth="1.6"/><path d="M7 13l6-6M7 7l6 6" stroke="#059669" strokeWidth="1.6" strokeLinecap="round"/></svg>, title: "The real reasons buyers chose someone else", signals: ["\"It doesn't frame around AFSL — we can't take the compliance risk\" — AFSL compliance framing was the reason cited in more than 50% of lost evaluations with AU broker principals", "\"It reminds us to chase the insurer — we needed it to chase the insurer\" — the distinction between passive reminders and active insurer outreach drives more losses than any feature comparison", "Winbeat and INSIGHT integration losses: firms already invested in their broker management system won't replace it — the integration must come to them"] },
          ].map((card) => (
            <div key={card.label} style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(5,150,105,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(5,150,105,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{card.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>{card.label}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12, lineHeight: 1.4 }}>{card.title}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {card.signals.map((s, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.55, paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", background: ACCENT, opacity: 0.5, display: "block" }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(5,150,105,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(5,150,105,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M3 5.5C3 4.4 3.9 3.5 5 3.5h10c1.1 0 2 .9 2 2V12c0 1.1-.9 2-2 2H7l-4 3V5.5z" stroke="#059669" strokeWidth="1.6" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Customer Requests</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12, lineHeight: 1.4 }}>When three unrelated broker principals describe the same gap in the same words — that&apos;s the feature</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              {[
                { req: "Automated insurer chasing on renewals", detail: "Principals want the AI to send the follow-up to the insurer — not remind the broker to do it. The distinction is the difference between automation and a calendar" },
                { req: "AFSL-compliant audit trail export", detail: "Principals need a record their PI insurer will accept — timestamped, complete, and exportable in a format that satisfies a compliance review, not just an internal log" },
                { req: "Client self-serve portal", detail: "Brokers want clients to check renewal status and update their own details without calling the broker — reducing inbound volume during peak renewal season" },
              ].map((r, i) => (
                <div key={i} style={{ background: "rgba(5,150,105,0.04)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>{r.req}</div>
                  <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{r.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(5,150,105,0.06) 0%, rgba(20,184,166,0.04) 100%)", border: "1.5px solid rgba(5,150,105,0.15)", borderRadius: 18, padding: "36px 36px 38px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 17l4-8 5 3 5-9" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="3" r="2" fill="#059669" opacity="0.7"/></svg>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>Product Feature Roadmap</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.3 }}>What to build next — and which use case cluster to expand to</h3>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, marginBottom: 26, maxWidth: 560 }}>When buyer intent, lost deals, and customer requests all point to the same gap, that&apos;s the feature. AgenticLib shows you the agreement across five signals so your roadmap reflects what the market is ready to pay for — not what the last principal mentioned on a call.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { priority: "01", title: "Active insurer chasing — not reminders", reason: "The single biggest lost-deal signal in AU broker AI. Principals want the tool to send the follow-up itself. Every competitor does reminders; no one does active chasing. First mover wins this cluster." },
              { priority: "02", title: "Expand into Claims Advocacy cluster", reason: "Highest buyer interest, zero competitive density, and growing 67% YoY. Brokers want to track open claims and automatically follow up with insurers — no existing tool does it at all." },
              { priority: "03", title: "AFSL-compliant audit trail export", reason: "Required by 50%+ of evaluating principals before they can get sign-off from their PI insurer. A properly formatted, exportable compliance record removes the last gate in enterprise broker deals." },
            ].map((p) => (
              <div key={p.priority} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "rgba(255,255,255,0.6)", borderRadius: 12, padding: "16px 20px" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: ACCENT, opacity: 0.5, flexShrink: 0, width: 24, paddingTop: 1 }}>{p.priority}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.55 }}>{p.reason}</div>
                </div>
              </div>
            ))}
          </div>
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
