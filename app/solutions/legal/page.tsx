import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal AI Agents – AgenticLib",
  description: "AgenticLib helps legal AI agents compete. Track LLM visibility among law firms and GCs, benchmark contract review and document intelligence against tools like Harvey, Ironclad and Clio, and surface how buyers evaluate legal AI before shortlisting.",
  keywords: [
    "legal AI agents", "AI legal tools comparison", "LLM visibility legal AI",
    "compare legal AI platforms", "AI agent benchmarking legal", "law firm AI competitive intelligence",
  ],
  alternates: { canonical: "https://agenticlib.com/solutions/legal" },
  openGraph: {
    type: "website",
    siteName: "AgenticLib",
    title: "Legal AI Agents – AgenticLib",
    description: "Track your legal AI agent's visibility among law firms and GCs, benchmark document intelligence against competitors, and surface where buyers are finding alternatives.",
    url: "https://agenticlib.com/solutions/legal",
    images: [{ url: "/recommendations-cover.png", width: 1200, height: 630, alt: "AgenticLib – Legal AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal AI Agents – AgenticLib",
    description: "Track your legal AI agent's visibility among law firms and GCs, benchmark document intelligence against competitors, and surface where buyers are finding alternatives.",
    images: ["/recommendations-cover.png"],
  },
};

const ACCENT = "#059669";

const USE_CASES = [
  { title: "Contract Review & Redlining", tag: "Clause extraction, risk flagging, automated redlines" },
  { title: "Due Diligence & M&A Support", tag: "Document review acceleration, issue spotting, deal timelines" },
  { title: "Compliance Monitoring & Regulatory Intelligence", tag: "Regulatory change alerts, exposure flags, audit trails" },
  { title: "Litigation Research & Case Strategy", tag: "Precedent search, case law analysis, citation accuracy" },
  { title: "Legal Billing & Matter Management", tag: "Time capture, invoice generation, matter workflow routing" },
];

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
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(5,150,105,0.08)", color: "#059669", border: "1px solid rgba(5,150,105,0.18)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
            AI Agents · Legal
          </div>
          <h1 className="font-bold" style={{ fontSize: "clamp(36px, 5.5vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "#0A0A0A", marginBottom: 24 }}>
            Comparison intelligence<br />
            <span style={{ background: "linear-gradient(135deg, #059669 0%, #2563EB 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              for legal AI agents
            </span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 540, margin: "0 auto 40px" }}>
            AgenticLib tracks where your product appears when GCs and law firms evaluate legal AI —
            and benchmarks every feature that earns trust in a high-stakes buying decision.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#contact" className="btn-primary" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
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
          Where legal AI agents compete
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
          Most legal AI builders find out their tool lost a deal because it didn&apos;t handle AU/UK jurisdiction from the GC who didn&apos;t sign. AgenticLib tracks five signals simultaneously so the gap is visible before the deal, not after.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14, marginBottom: 14 }}>
          {[
            { label: "Buyer Intent", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#059669" strokeWidth="1.7"/><path d="M13 13l3.5 3.5" stroke="#059669" strokeWidth="1.7" strokeLinecap="round"/></svg>, title: "What law firms and GCs ask LLMs when evaluating legal AI", signals: ["\"Which AI reviews contracts and flags missing clauses automatically?\" — contract review is the first use case evaluated, and the baseline expectation", "\"Legal AI that handles Australian or UK jurisdiction, not just US law\" — jurisdiction coverage is applied as a hard filter before any demo is booked", "\"Harvey alternative for smaller law firms\" — enterprise-first tools are creating a gap at the mid-market that no one has closed"] },
            { label: "Market Insights", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><polyline points="2,14 7,9 11,12 18,5" stroke="#059669" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: "How the legal AI market is shifting right now", signals: ["Data residency and privilege handling have overtaken accuracy as the most common evaluation criteria in enterprise deals — security is now the first gate", "M&A due diligence queries have grown 58% — teams are looking to scale review without adding headcount, and the category is responding slowly", "Mid-market law firms (5–50 lawyers) are the fastest-growing buyer segment and the most underserved — enterprise-first tools leave a wide open market"] },
            { label: "Competitor Landscape", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="#059669" strokeWidth="1.6"/><rect x="12" y="2" width="6" height="6" rx="1.5" stroke="#059669" strokeWidth="1.6"/><rect x="2" y="12" width="6" height="6" rx="1.5" stroke="#059669" strokeWidth="1.6"/><rect x="12" y="12" width="6" height="6" rx="1.5" stroke="#059669" strokeWidth="1.6"/></svg>, title: "Which clusters are owned and where the gaps are", signals: ["Harvey dominates enterprise contract review; Ironclad leads CLM and workflow; Clio owns practice management — three separate clusters, three clear owners", "No single tool leads on multi-jurisdiction coverage — most tools are US-centric, leaving AU, UK and EU markets structurally underserved", "Litigation research has the weakest competitive density of any cluster — fewest dominant players, growing buyer interest, widest open field"] },
            { label: "Lost Deal Tracking", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#059669" strokeWidth="1.6"/><path d="M7 13l6-6M7 7l6 6" stroke="#059669" strokeWidth="1.6" strokeLinecap="round"/></svg>, title: "The real reasons buyers chose someone else", signals: ["\"Their data stays in the US — we can't use it\" — data residency drove 44% of losses in AU and UK markets, consistently cited before any feature comparison", "\"We need iManage integration, not just Google Drive\" — DMS integration gaps cost mid-market deals where firms won't change their document management for an AI tool", "Privilege handling losses: GCs won't sign off on any tool that can't assert privilege on AI-generated analysis — one gap ends the evaluation"] },
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
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12, lineHeight: 1.4 }}>When three unrelated customers describe the same gap in the same words — that&apos;s the feature</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              {[
                { req: "Jurisdiction-specific clause libraries", detail: "Standard playbooks don't account for AU/UK/EU regulatory differences — firms need clauses that reflect the actual jurisdiction, not a US-centric default" },
                { req: "iManage & NetDocuments integration", detail: "Enterprise firms won't change their DMS for an AI tool — the integration has to come to them, not the other way around" },
                { req: "Regulator-ready audit trail", detail: "Firms need to show outside counsel and regulators exactly what the AI touched — an internal log isn't enough, the output needs to be audit-ready" },
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
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, marginBottom: 26, maxWidth: 560 }}>When buyer intent, lost deals, and customer requests all point to the same gap, that&apos;s the feature. AgenticLib shows you the agreement across five signals so your roadmap reflects what the market is ready to pay for — not what the last GC mentioned on a call.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { priority: "01", title: "Multi-jurisdiction coverage — AU, UK, EU", reason: "Biggest lost-deal signal (44% of losses in non-US markets), open market gap, and the fastest-growing buyer segment (mid-market firms outside the US). US-centric tools have created a structural opening." },
              { priority: "02", title: "iManage & NetDocuments integration", reason: "Cited in 30%+ of mid-market losses. Enterprise firms won't change their DMS — this integration is the shortlist gate, not a nice-to-have feature." },
              { priority: "03", title: "Expand into M&A Due Diligence cluster", reason: "58% query growth, weakest competitive density, and the highest revenue per engagement of any cluster. Teams want to scale review without headcount — the demand is there, the supply is not." },
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
            What a legal AI agent needs to win
          </h2>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.65, maxWidth: 560, marginBottom: 36 }}>
            AgenticLib tracks these features across every legal AI agent in the market —
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
