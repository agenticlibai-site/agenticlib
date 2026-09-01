import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketing AI Agents – AgenticLib",
  description: "AgenticLib helps marketing AI agents compete. Track your LLM visibility, benchmark features against competitors like Jasper, Copy.ai and Typeface, and surface exactly where buyers are finding alternatives.",
  keywords: [
    "marketing AI agents", "AI marketing tools comparison", "AI content generation visibility",
    "LLM search marketing", "AI agent benchmarking marketing", "compare marketing AI tools",
  ],
  alternates: { canonical: "https://agenticlib.com/solutions/marketing" },
  openGraph: {
    type: "website",
    siteName: "AgenticLib",
    title: "Marketing AI Agents – AgenticLib",
    description: "Track your marketing AI agent's visibility in LLM search, benchmark features against competitors, and turn gaps into a roadmap.",
    url: "https://agenticlib.com/solutions/marketing",
    images: [{ url: "/recommendations-cover.png", width: 1200, height: 630, alt: "AgenticLib – Marketing AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketing AI Agents – AgenticLib",
    description: "Track your marketing AI agent's visibility in LLM search, benchmark features against competitors, and turn gaps into a roadmap.",
    images: ["/recommendations-cover.png"],
  },
};

const ACCENT = "#7C3AED";

const USE_CASES = [
  { title: "Content Marketing & SEO", tag: "AI-generated content, keyword research, publishing workflows" },
  { title: "Paid Advertising & Campaign Optimisation", tag: "Creative testing, bid automation, audience targeting" },
  { title: "Outbound & Email Outreach", tag: "Personalised sequences, multi-channel delivery, reply intelligence" },
  { title: "Brand Intelligence & Competitive Monitoring", tag: "Sentiment tracking, share of voice, competitor signals" },
  { title: "Social Media Management", tag: "Scheduling, community engagement, content generation across channels" },
];

const FEATURES = [
  { name: "Content generation quality", desc: "Blog, email, social copy — output depth and accuracy" },
  { name: "SEO & keyword integration", desc: "Real-time optimisation, SERP signals, search coverage" },
  { name: "Campaign analytics", desc: "Attribution, performance dashboards, A/B testing" },
  { name: "Brand voice customisation", desc: "Tone controls, style guides, memory across outputs" },
  { name: "CRM & tool integrations", desc: "HubSpot, Salesforce, Notion, Slack, ad platforms" },
  { name: "Multi-language support", desc: "Localisation, regional adaptation, global reach" },
  { name: "Workflow automation", desc: "Triggers, approval flows, publishing schedules" },
  { name: "Competitor content tracking", desc: "Gap analysis, topic monitoring, positioning alerts" },
];

export default function MarketingPage() {
  return (
    <main
      className="min-h-screen page-gap-fix"
      style={{ background: "linear-gradient(170deg, #FEF0F5 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #FEF0F5 100%)" }}
    >
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "110px 48px 80px" }}>
        <div style={{ position: "absolute", top: -80, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(194,24,106,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.18)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C3AED", display: "inline-block" }} />
            AI Agents · Marketing
          </div>
          <h1 className="font-bold" style={{ fontSize: "clamp(36px, 5.5vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "#0A0A0A", marginBottom: 24 }}>
            Comparison intelligence<br />
            <span style={{ background: "linear-gradient(135deg, #7C3AED 0%, #C2186A 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              for marketing AI agents
            </span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 540, margin: "0 auto 40px" }}>
            AgenticLib tracks where your product appears when marketers research AI tools —
            and benchmarks every feature your buyers use to compare you against the field.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#contact" className="btn-primary" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              Get Your Visibility Report
            </a>
            <a href="/#contact" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#7C3AED", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(124,58,237,0.22)", backdropFilter: "blur(8px)" }}>
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "56px 48px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>Use Cases</p>
        <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 36 }}>
          Where marketing AI agents compete
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
          Most marketing AI builders piece together lost deals from memory, hear about competitor launches from customers, and run roadmap calls where the loudest voice wins. AgenticLib reads five signals simultaneously — and surfaces what they agree on.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14, marginBottom: 14 }}>
          {/* Buyer Intent */}
          <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(124,58,237,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(124,58,237,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#7C3AED" strokeWidth="1.7"/><path d="M13 13l3.5 3.5" stroke="#7C3AED" strokeWidth="1.7" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Buyer Intent</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12, lineHeight: 1.4 }}>What marketers ask LLMs before they talk to you</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["\"What AI writes best for SEO blogs at scale?\" — long-form quality is the shortlist filter", "\"Which marketing AI connects natively with HubSpot?\" — integration is table stakes, not a differentiator", "\"AI tool for LinkedIn content and scheduling\" — social cluster is growing faster than email"].map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.55, paddingLeft: 14, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", background: ACCENT, opacity: 0.5, display: "block" }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {/* Market Insights */}
          <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(124,58,237,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(124,58,237,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><polyline points="2,14 7,9 11,12 18,5" stroke="#7C3AED" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Market Insights</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12, lineHeight: 1.4 }}>How the marketing AI market is shifting right now</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Brands mentioned alongside CRM integrations are 2× more likely to appear in LLM shortlists", "Outbound & email outreach is the most under-served use case — fewest dominant players in any cluster", "Multi-language and localisation queries have grown 38% — driven by global GTM teams"].map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.55, paddingLeft: 14, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", background: ACCENT, opacity: 0.5, display: "block" }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {/* Competitor Landscape */}
          <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(124,58,237,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(124,58,237,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="#7C3AED" strokeWidth="1.6"/><rect x="12" y="2" width="6" height="6" rx="1.5" stroke="#7C3AED" strokeWidth="1.6"/><rect x="2" y="12" width="6" height="6" rx="1.5" stroke="#7C3AED" strokeWidth="1.6"/><rect x="12" y="12" width="6" height="6" rx="1.5" stroke="#7C3AED" strokeWidth="1.6"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Competitor Landscape</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12, lineHeight: 1.4 }}>Which clusters are owned and where the gaps are</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Jasper dominates long-form and SEO clusters; Copy.ai leads outbound sequences — both clusters have a clear owner", "Typeface and Writer are pulling enterprise deals on brand consistency alone — not feature depth", "Social media management has no clear leader — the most open cluster in the category right now"].map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.55, paddingLeft: 14, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", background: ACCENT, opacity: 0.5, display: "block" }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {/* Lost Deal Tracking */}
          <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(124,58,237,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(124,58,237,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#7C3AED" strokeWidth="1.6"/><path d="M7 13l6-6M7 7l6 6" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Lost Deal Tracking</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12, lineHeight: 1.4 }}>The real reasons buyers chose someone else</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["\"We chose them because it connected directly to our HubSpot\" — integration gaps drove 40% of losses", "Teams that evaluated 4+ tools made the final call on workflow automation depth, not content quality", "Budget losses rarely cite price — they cite missing CRM sync and approval workflows"].map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.55, paddingLeft: 14, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 7, width: 5, height: 5, borderRadius: "50%", background: ACCENT, opacity: 0.5, display: "block" }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {/* Customer Requests */}
          <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(124,58,237,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(124,58,237,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M3 5.5C3 4.4 3.9 3.5 5 3.5h10c1.1 0 2 .9 2 2V12c0 1.1-.9 2-2 2H7l-4 3V5.5z" stroke="#7C3AED" strokeWidth="1.6" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Customer Requests</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12, lineHeight: 1.4 }}>When three unrelated customers describe the same gap in the same words — that&apos;s the feature</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              {[
                { req: "Multi-brand voice profiles", detail: "Teams managing 3+ clients need content that stays in-character per brand, not one shared tone" },
                { req: "Competitor content alerts", detail: "Know when a rival publishes in your keyword territory — before your customers tell you" },
                { req: "Approval workflows", detail: "Compliance-sensitive teams won't publish without a human sign-off step — this is blocking adoption" },
              ].map((r, i) => (
                <div key={i} style={{ background: "rgba(124,58,237,0.04)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>{r.req}</div>
                  <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{r.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Roadmap output */}
        <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(194,24,106,0.05) 100%)", border: "1.5px solid rgba(124,58,237,0.15)", borderRadius: 18, padding: "36px 36px 38px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 17l4-8 5 3 5-9" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="3" r="2" fill="#7C3AED" opacity="0.7"/></svg>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>Product Feature Roadmap</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.3 }}>
            What to build next — and which use case cluster to expand to
          </h3>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, marginBottom: 26, maxWidth: 560 }}>
            When buyer intent, lost deals, and customer requests all point to the same gap, that&apos;s the feature. AgenticLib surfaces the agreement across all five signals so roadmap calls stop being a debate about whose customer was louder.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { priority: "01", title: "HubSpot & Salesforce integration depth", reason: "Biggest lost-deal signal (40% of losses) + reinforced by 60% of buyer intent queries. Integration isn't a nice-to-have — it's the shortlist gate." },
              { priority: "02", title: "Expand into Outbound & Email Outreach cluster", reason: "Market gap confirmed: no dominant player, rising search intent, and your customers are already asking for sequences. This cluster is open to own." },
              { priority: "03", title: "Multi-brand voice profiles", reason: "Customer request frequency crossed the threshold — 3+ independent asks in 30 days from unrelated accounts. The ask is always the same: stay in-character across clients." },
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
          border: "1px solid rgba(124,58,237,0.12)",
          borderRadius: 20,
          padding: "44px 44px 48px",
          boxShadow: "0 4px 32px rgba(124,58,237,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>Product Intelligence</p>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 12 }}>
            What a marketing AI agent needs to win
          </h2>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.65, maxWidth: 560, marginBottom: 36 }}>
            AgenticLib tracks these features across every marketing AI agent in the market —
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
        .uc-row:hover { background: rgba(124,58,237,0.03); border-radius: 10px; }
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
