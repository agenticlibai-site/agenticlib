import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal AI Agents – AgenticLib",
  description: "AgenticLib helps legal AI agents compete. Track LLM visibility among law firms and GCs, benchmark contract review and document intelligence against tools like Harvey, Ironclad and Clio, and surface how buyers evaluate legal AI before shortlisting.",
  keywords: ["legal AI agents", "AI legal tools comparison", "LLM visibility legal AI", "compare legal AI platforms", "AI agent benchmarking legal", "law firm AI competitive intelligence"],
  alternates: { canonical: "https://agenticlib.com/solutions/legal" },
  openGraph: { type: "website", siteName: "AgenticLib", title: "Legal AI Agents – AgenticLib", description: "Track your legal AI agent's visibility among law firms and GCs, benchmark document intelligence against competitors, and surface where buyers are finding alternatives.", url: "https://agenticlib.com/solutions/legal", images: [{ url: "/recommendations-cover.png", width: 1200, height: 630, alt: "AgenticLib – Legal AI" }] },
  twitter: { card: "summary_large_image", title: "Legal AI Agents – AgenticLib", description: "Track your legal AI agent's visibility among law firms and GCs, benchmark document intelligence against competitors, and surface where buyers are finding alternatives.", images: ["/recommendations-cover.png"] },
};

const ACCENT = "#059669";
const A = "5,150,105";

const FEATURES = [
  { name: "Contract analysis & clause extraction", desc: "Defined terms, obligations, key dates, risk clauses" },
  { name: "Risk flagging & redlining", desc: "Non-standard terms, missing provisions, fallback suggestions" },
  { name: "Document comparison", desc: "Version diff, change tracking, negotiation history" },
  { name: "Jurisdiction & regulatory database", desc: "Multi-jurisdiction coverage, real-time regulatory updates" },
  { name: "Privilege & confidentiality handling", desc: "Data residency, access controls, privilege assertions" },
  { name: "Platform integrations", desc: "iManage, Clio, NetDocuments, DocuSign, e-signature workflows" },
  { name: "Time tracking & billing automation", desc: "Narrative generation, UTBMS codes, write-off reduction" },
  { name: "Audit trail & compliance reporting", desc: "Activity logs, decision trails, regulator-ready exports" },
];

const SIGNALS = [
  { label: "Buyer Intent", icon: "search" },
  { label: "Market Insights", icon: "chart" },
  { label: "Competitor Landscape", icon: "grid" },
  { label: "Lost Deal Tracking", icon: "x" },
  { label: "Customer Requests", icon: "bubble" },
];

function SignalIcon({ type, color }: { type: string; color: string }) {
  if (type === "search") return <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke={color} strokeWidth="1.7"/><path d="M13 13l3.5 3.5" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>;
  if (type === "chart") return <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><polyline points="2,14 7,9 11,12 18,5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (type === "grid") return <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.6"/><rect x="12" y="2" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.6"/><rect x="2" y="12" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.6"/><rect x="12" y="12" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.6"/></svg>;
  if (type === "x") return <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.6"/><path d="M7 13l6-6M7 7l6 6" stroke={color} strokeWidth="1.6" strokeLinecap="round"/></svg>;
  return <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 5.5C3 4.4 3.9 3.5 5 3.5h10c1.1 0 2 .9 2 2V12c0 1.1-.9 2-2 2H7l-4 3V5.5z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/></svg>;
}

export default function LegalPage() {
  return (
    <main className="min-h-screen page-gap-fix" style={{ background: "linear-gradient(170deg, #ECFDF5 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #ECFDF5 100%)" }}>
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "110px 48px 80px" }}>
        <div style={{ position: "absolute", top: -80, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8" style={{ background: "rgba(5,150,105,0.08)", color: "#059669", border: "1px solid rgba(5,150,105,0.18)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
            AI Agents · Legal
          </div>
          <h1 className="font-bold" style={{ fontSize: "clamp(36px, 5.5vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "#0A0A0A", marginBottom: 24 }}>
            Product and marketing intelligence<br />
            <span style={{ background: "linear-gradient(135deg, #059669 0%, #2563EB 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>for legal AI agents</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 540, margin: "0 auto 40px" }}>AgenticLib tracks where your product appears when GCs and law firms evaluate legal AI — and benchmarks every feature that earns trust in a high-stakes buying decision.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#contact" className="btn-primary" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>Get Your Visibility Report</a>
            <a href="/#contact" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#059669", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(5,150,105,0.22)", backdropFilter: "blur(8px)" }}>Talk to Us</a>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "80px 48px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>How It Works</p>
        <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 12 }}>Five signals. One roadmap.</h2>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.65, maxWidth: 580, marginBottom: 36 }}>Most AI agent builders find out what buyers wanted after losing the deal. AgenticLib collects five intelligence signals and combines them into a prioritised product roadmap — so you build from evidence, not memory.</p>

        {/* Three-panel diagram */}
        <div className="signal-diagram" style={{ display: "grid", gridTemplateColumns: "1fr 56px 1fr", alignItems: "stretch", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 18, overflow: "hidden", marginBottom: 44, backdropFilter: "blur(16px)" }}>
          <div style={{ padding: "28px 26px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", marginBottom: 14 }}>Signals collected</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SIGNALS.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 13px", borderRadius: 9, background: `rgba(${A},0.05)`, border: `1px solid rgba(${A},0.1)` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `rgba(${A},0.1)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SignalIcon type={s.icon} color={ACCENT} /></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(${A},0.03)`, borderLeft: `1px solid rgba(${A},0.08)`, borderRight: `1px solid rgba(${A},0.08)` }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px rgba(${A},0.3)` }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3 3.5-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div style={{ padding: "28px 26px", background: `rgba(${A},0.03)` }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, marginBottom: 14 }}>Product roadmap</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Multi-jurisdiction coverage (AU / UK / EU)", "iManage & NetDocuments integration", "Expand into M&A Due Diligence cluster"].map((title, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 13px", background: "rgba(255,255,255,0.8)", borderRadius: 9, border: "1px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: ACCENT, opacity: 0.45, flexShrink: 0, paddingTop: 1 }}>0{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.4 }}>{title}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#bbb", marginTop: 14, lineHeight: 1.5 }}>Automatically derived where all five signals agree on the same gap.</p>
          </div>
        </div>

        {/* Signal detail cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14, marginBottom: 14 }}>
          {[
            { label: "Buyer Intent", icon: "search", stat: null, subtitle: "What buyers search before they reach you", signals: ["Contract review is the baseline — it's evaluated first, before any other feature is considered", "AU or UK jurisdiction coverage is a hard filter applied before any demo is booked", "Mid-market law firms are actively searching for Harvey alternatives — enterprise-first tools left them behind"] },
            { label: "Market Insights", icon: "chart", stat: "58%", subtitle: "Where the market is moving right now", signals: ["Data residency has overtaken accuracy as the top enterprise evaluation criteria — security is the first gate", "M&A due diligence queries up 58% — teams scaling document review without adding headcount", "Mid-market law firms (5–50 lawyers) are the fastest-growing buyer segment and the most underserved"] },
            { label: "Competitor Landscape", icon: "grid", stat: null, subtitle: "Who owns which cluster — and what's open", signals: ["Harvey leads enterprise contract review; Ironclad leads CLM; Clio leads practice management — three separate owners", "No tool leads multi-jurisdiction coverage — AU, UK, and EU markets are structurally underserved", "Litigation research has the weakest competitive density — fewest players, growing buyer interest"] },
            { label: "Lost Deal Tracking", icon: "x", stat: "44%", subtitle: "Why you've been losing deals", signals: ["Data residency (AU/UK): cited in 44% of non-US losses — the most common hard gate before any feature comparison", "iManage integration absent: mid-market firms won't change their DMS — this is a shortlist filter, not a preference", "Privilege handling absent: GCs won't sign off without it — one gap ends the entire evaluation"] },
          ].map((card) => (
            <div key={card.label} style={{ background: "rgba(255,255,255,0.75)", border: `1px solid rgba(${A},0.12)`, borderRadius: 16, overflow: "hidden", backdropFilter: "blur(12px)" }}>
              <div style={{ background: `rgba(${A},0.06)`, borderBottom: `1px solid rgba(${A},0.09)`, padding: "18px 22px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${A},0.12)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SignalIcon type={card.icon} color={ACCENT} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>{card.label}</span>
                  </div>
                  {card.stat && <span style={{ fontSize: 24, fontWeight: 900, color: ACCENT, opacity: 0.6, lineHeight: 1 }}>{card.stat}</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#666", lineHeight: 1.4 }}>{card.subtitle}</div>
              </div>
              <div style={{ padding: "16px 22px 20px" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                  {card.signals.map((s, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#444", lineHeight: 1.5, paddingLeft: 14, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: 6, width: 5, height: 5, borderRadius: "50%", background: ACCENT, opacity: 0.35, display: "block" }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          <div style={{ background: "rgba(255,255,255,0.75)", border: `1px solid rgba(${A},0.12)`, borderRadius: 16, overflow: "hidden", backdropFilter: "blur(12px)", gridColumn: "1 / -1" }}>
            <div style={{ background: `rgba(${A},0.06)`, borderBottom: `1px solid rgba(${A},0.09)`, padding: "18px 22px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${A},0.12)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SignalIcon type="bubble" color={ACCENT} /></div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Customer Requests</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#666", lineHeight: 1.4 }}>What your customers keep asking for</div>
            </div>
            <div style={{ padding: "18px 22px 22px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {[
                  { req: "Jurisdiction-specific clause libraries", detail: "Standard playbooks don't work across AU/UK/EU — firms need clauses that reflect the actual jurisdiction, not a US-centric default" },
                  { req: "iManage & NetDocuments integration", detail: "Enterprise firms won't change their DMS for an AI tool — the integration must come to them, not the other way around" },
                  { req: "Regulator-ready audit trail", detail: "An internal log isn't enough — firms need output that satisfies a compliance review and holds up to outside counsel scrutiny" },
                ].map((r, i) => (
                  <div key={i} style={{ background: `rgba(${A},0.04)`, borderRadius: 10, padding: "14px 16px", border: `1px solid rgba(${A},0.08)` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>{r.req}</div>
                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{r.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap detail */}
        <div style={{ background: `linear-gradient(135deg, rgba(${A},0.07) 0%, rgba(20,184,166,0.04) 100%)`, border: `1.5px solid rgba(${A},0.15)`, borderRadius: 18, padding: "36px 36px 38px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 17l4-8 5 3 5-9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="3" r="2" fill="#fff" opacity="0.7"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, marginBottom: 2 }}>Product Roadmap</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", lineHeight: 1.2 }}>What to build next</h3>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, marginBottom: 22, maxWidth: 540 }}>When all five signals point to the same gap, that&apos;s the feature. AgenticLib surfaces the agreement so your roadmap is built on market evidence — not whoever spoke loudest in the last planning call.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { priority: "01", title: "Multi-jurisdiction coverage — AU, UK, EU", reason: "44% of non-US losses cite data residency as the deciding factor. US-centric tools created a structural gap that no one has closed." },
              { priority: "02", title: "iManage & NetDocuments integration", reason: "Cited in 30%+ of mid-market losses. Enterprise firms won't change their DMS — this is the shortlist gate, not a nice-to-have." },
              { priority: "03", title: "Expand into M&A Due Diligence cluster", reason: "58% query growth, lowest competitive density, highest revenue per engagement. The demand is there; the supply is not." },
            ].map((p) => (
              <div key={p.priority} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "rgba(255,255,255,0.7)", borderRadius: 12, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.9)" }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: ACCENT, opacity: 0.4, flexShrink: 0, width: 24, paddingTop: 1 }}>{p.priority}</span>
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
        <div style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid rgba(${A},0.12)`, borderRadius: 20, padding: "44px 44px 48px", boxShadow: `0 4px 32px rgba(${A},0.07), 0 1px 4px rgba(0,0,0,0.04)` }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>Product Intelligence</p>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 12 }}>What a legal AI agent needs to win</h2>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.65, maxWidth: 560, marginBottom: 36 }}>AgenticLib tracks these features across every legal AI agent in the market — benchmarking where your product leads, where it lags, and what your roadmap needs to prioritise.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f.name} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, flexShrink: 0, marginTop: 6 }} />
                <div><div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>{f.name}</div><div style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{f.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 680px) {
          .signal-diagram { grid-template-columns: 1fr !important; }
          .signal-diagram > div:nth-child(2) { display: none !important; }
          main > section { padding-left: 20px !important; padding-right: 20px !important; }
          main > section:first-child { padding-top: 72px !important; }
        }
      `}</style>
    </main>
  );
}
