import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales AI Agents – AgenticLib",
  description: "AgenticLib helps sales AI agents compete. Track your LLM visibility among revenue teams, benchmark capabilities against tools like Outreach, Apollo and Gong, and understand how buyers evaluate sales AI before shortlisting.",
  keywords: [
    "sales AI agents", "AI sales tools comparison", "LLM visibility sales AI",
    "compare sales AI platforms", "AI agent benchmarking sales", "sales AI competitive intelligence",
  ],
  alternates: { canonical: "https://agenticlib.com/solutions/sales" },
  openGraph: {
    type: "website",
    siteName: "AgenticLib",
    title: "Sales AI Agents – AgenticLib",
    description: "Track your sales AI agent's visibility in LLM search, benchmark capabilities against competitors, and surface where revenue teams are finding alternatives.",
    url: "https://agenticlib.com/solutions/sales",
    images: [{ url: "/recommendations-cover.png", width: 1200, height: 630, alt: "AgenticLib – Sales AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sales AI Agents – AgenticLib",
    description: "Track your sales AI agent's visibility in LLM search, benchmark capabilities against competitors, and surface where revenue teams are finding alternatives.",
    images: ["/recommendations-cover.png"],
  },
};

const ACCENT = "#2563EB";

const USE_CASES = [
  { title: "Lead Qualification & Scoring", tag: "ICP matching, intent signals, inbound prioritisation" },
  { title: "Outbound Sequencing & Personalisation", tag: "Multi-step sequences, personalisation depth, reply detection" },
  { title: "Call Intelligence & Coaching", tag: "Transcription, objection surfacing, real-time rep coaching" },
  { title: "Pipeline Forecasting & Deal Intelligence", tag: "Risk scoring, forecast accuracy, deal health signals" },
  { title: "CRM Enrichment & Data Hygiene", tag: "Contact enrichment, deduplication, account intelligence sync" },
];

const FEATURES = [
  { name: "Lead scoring & ICP fit", desc: "Firmographic, technographic, and behavioural signals" },
  { name: "Sequence generation & personalisation", desc: "Dynamic variables, multi-channel templates, tone tuning" },
  { name: "Multi-channel outreach", desc: "Email, LinkedIn, phone, and SMS in a single workflow" },
  { name: "Reply detection & follow-up logic", desc: "Auto-categorise responses, trigger next steps" },
  { name: "Call transcription & analysis", desc: "Speaker diarisation, keyword flagging, summary generation" },
  { name: "Deal risk & health scoring", desc: "Engagement signals, stage velocity, close probability" },
  { name: "CRM sync depth", desc: "Salesforce, HubSpot, Pipedrive — bi-directional data fidelity" },
  { name: "Forecast accuracy engine", desc: "Historical calibration, pipeline weighting, board-ready output" },
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
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(37,99,235,0.08)", color: "#2563EB", border: "1px solid rgba(37,99,235,0.18)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB", display: "inline-block" }} />
            AI Agents · Sales
          </div>
          <h1 className="font-bold" style={{ fontSize: "clamp(36px, 5.5vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "#0A0A0A", marginBottom: 24 }}>
            Comparison intelligence<br />
            <span style={{ background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              for sales AI agents
            </span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 540, margin: "0 auto 40px" }}>
            AgenticLib tracks where your product appears when revenue leaders evaluate sales AI —
            and benchmarks every capability your buyers weigh before they shortlist.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#contact" className="btn-primary" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              Get Your Visibility Report
            </a>
            <a href="/#contact" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#2563EB", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(37,99,235,0.22)", backdropFilter: "blur(8px)" }}>
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "56px 48px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>Use Cases</p>
        <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 36 }}>
          Where sales AI agents compete
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
        <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 14 }}>
          Where your roadmap actually comes from
        </h2>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, maxWidth: 620, marginBottom: 40 }}>
          Most sales AI builders hear about competitor launches from reps in the field, piece together lost deals from memory, and run roadmap calls where whoever managed the last customer call sets the agenda. AgenticLib reads five signals simultaneously — and surfaces what they agree on.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14, marginBottom: 14 }}>
          {[
            { label: "Buyer Intent", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#2563EB" strokeWidth="1.7"/><path d="M13 13l3.5 3.5" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round"/></svg>, title: "What revenue teams ask LLMs before they book a demo", signals: ["\"Best AI for cold email outreach and LinkedIn\" — multi-channel is the first filter, not the differentiator", "\"AI sales tool that works with Salesforce\" — CRM integration is applied as a hard filter before evaluation even starts", "\"Gong alternative that also does outreach\" — buyers want consolidation, not another point tool in the stack"] },
            { label: "Market Insights", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><polyline points="2,14 7,9 11,12 18,5" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: "How the sales AI market is shifting right now", signals: ["Multi-channel outreach (email + LinkedIn + phone) is the fastest-growing evaluation criteria — single-channel tools are being filtered out", "Call intelligence has shifted from nice-to-have to a shortlist requirement in enterprise sales deals above $50k", "Pipeline forecasting queries have grown 44% — CFOs are requiring revenue teams to justify AI investment with forecast accuracy data"] },
            { label: "Competitor Landscape", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="#2563EB" strokeWidth="1.6"/><rect x="12" y="2" width="6" height="6" rx="1.5" stroke="#2563EB" strokeWidth="1.6"/><rect x="2" y="12" width="6" height="6" rx="1.5" stroke="#2563EB" strokeWidth="1.6"/><rect x="12" y="12" width="6" height="6" rx="1.5" stroke="#2563EB" strokeWidth="1.6"/></svg>, title: "Which clusters are owned and where the gaps are", signals: ["Apollo dominates lead sourcing and email volume; Outreach leads enterprise sequence depth — both clusters have a clear owner", "Gong owns call intelligence; no single player leads on combined call + sequence + CRM — the consolidation gap is real", "Pipeline forecasting has the weakest competitive density of any cluster — the fewest dominant players, the most open to own"] },
            { label: "Lost Deal Tracking", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#2563EB" strokeWidth="1.6"/><path d="M7 13l6-6M7 7l6 6" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round"/></svg>, title: "The real reasons buyers chose someone else", signals: ["\"We went with them because it pushed activity into Salesforce automatically\" — bi-directional CRM sync drove 35% of losses", "Multi-channel losses: shortlisted for email, lost the moment the buyer needed LinkedIn + phone in the same workflow", "CFO-involved deals almost always require board-ready forecasting output — pipeline health isn't enough"] },
          ].map((card) => (
            <div key={card.label} style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(37,99,235,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(37,99,235,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{card.icon}</div>
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
          {/* Customer Requests */}
          <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(37,99,235,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(37,99,235,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M3 5.5C3 4.4 3.9 3.5 5 3.5h10c1.1 0 2 .9 2 2V12c0 1.1-.9 2-2 2H7l-4 3V5.5z" stroke="#2563EB" strokeWidth="1.6" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Customer Requests</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12, lineHeight: 1.4 }}>When three unrelated customers describe the same gap in the same words — that&apos;s the feature</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              {[
                { req: "Reply detection & auto-next-step", detail: "Manual triage after a reply is killing reps' time — they want the AI to categorise and trigger the follow-up, not remind them to do it" },
                { req: "Email + LinkedIn + SMS in one sequence", detail: "Switching between tools for each channel is the biggest daily friction — reps want one workflow, not three" },
                { req: "Forecast confidence scores reps can defend", detail: "Reps need to justify pipeline numbers to management — a deal stage percentage isn't enough, they need signals they can explain" },
              ].map((r, i) => (
                <div key={i} style={{ background: "rgba(37,99,235,0.04)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>{r.req}</div>
                  <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{r.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Roadmap output */}
        <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(124,58,237,0.05) 100%)", border: "1.5px solid rgba(37,99,235,0.15)", borderRadius: 18, padding: "36px 36px 38px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 17l4-8 5 3 5-9" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="3" r="2" fill="#2563EB" opacity="0.7"/></svg>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>Product Feature Roadmap</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.3 }}>What to build next — and which use case cluster to expand to</h3>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, marginBottom: 26, maxWidth: 560 }}>When buyer intent, lost deals, and customer requests all point to the same gap, that&apos;s the feature. AgenticLib shows you the agreement across all five signals so you stop building what the loudest customer asked for and start building what the market is ready to pay for.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { priority: "01", title: "Multi-channel outreach in a single workflow", reason: "Lost-deal pattern + buyer intent + customer requests all converge here. Reps don't want a tool for each channel — they want one sequence that covers email, LinkedIn and phone." },
              { priority: "02", title: "Bi-directional Salesforce & HubSpot sync", reason: "35% of closed-lost cites CRM sync as the deciding factor. Buyers apply this as a hard filter — not a differentiator to evaluate." },
              { priority: "03", title: "Expand into Pipeline Forecasting cluster", reason: "Weakest competitive density of any cluster + 44% query growth + CFO buying pressure. This is the most open cluster in sales AI right now." },
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
          border: "1px solid rgba(37,99,235,0.12)",
          borderRadius: 20,
          padding: "44px 44px 48px",
          boxShadow: "0 4px 32px rgba(37,99,235,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>Product Intelligence</p>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 12 }}>
            What a sales AI agent needs to win
          </h2>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.65, maxWidth: 560, marginBottom: 36 }}>
            AgenticLib tracks these features across every sales AI agent in the market —
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
        .uc-row:hover { background: rgba(37,99,235,0.03); border-radius: 10px; }
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
