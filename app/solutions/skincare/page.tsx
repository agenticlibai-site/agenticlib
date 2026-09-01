import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skincare & Beauty AI Agents – AgenticLib",
  description: "AgenticLib helps skincare and beauty AI agents compete. Track LLM visibility, benchmark personalisation depth and ingredient intelligence against competitors, and understand consumer trust signals before buyers shortlist.",
  keywords: [
    "skincare AI agents", "beauty AI tools comparison", "AI skincare personalisation",
    "LLM visibility beauty AI", "compare skincare AI platforms", "AI agent benchmarking skincare",
  ],
  alternates: { canonical: "https://agenticlib.com/solutions/skincare" },
  openGraph: {
    type: "website",
    siteName: "AgenticLib",
    title: "Skincare & Beauty AI Agents – AgenticLib",
    description: "Track your skincare AI agent's visibility in LLM search, benchmark personalisation depth against competitors, and surface where consumers are finding alternatives.",
    url: "https://agenticlib.com/solutions/skincare",
    images: [{ url: "/recommendations-cover.png", width: 1200, height: 630, alt: "AgenticLib – Skincare AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skincare & Beauty AI Agents – AgenticLib",
    description: "Track your skincare AI agent's visibility in LLM search, benchmark personalisation depth against competitors, and surface where consumers are finding alternatives.",
    images: ["/recommendations-cover.png"],
  },
};

const ACCENT = "#C2186A";

const USE_CASES = [
  { title: "Skin Analysis & Personalisation", tag: "Photo analysis, questionnaire scoring, routine personalisation" },
  { title: "Ingredient Matching & Safety", tag: "Ingredient decoding, allergen flagging, formulation checks" },
  { title: "Skincare Routine Recommendations", tag: "Morning & evening builds, skin type logic, product pairings" },
  { title: "Product Discovery & Education", tag: "SKU matching, skin concern mapping, ingredient education" },
  { title: "Consultation & Dermatologist-Guided AI", tag: "Clinical backing, professional escalation, trust signals" },
];

const FEATURES = [
  { name: "Skin type detection", desc: "Photo, selfie, or questionnaire-based skin analysis" },
  { name: "Ingredient database depth", desc: "INCI coverage, actives mapping, safety classifications" },
  { name: "Allergen & sensitivity flagging", desc: "Cross-reactivity detection, fragrance & irritant alerts" },
  { name: "Personalised routine builder", desc: "AM/PM logic, layering order, climate & season adaptation" },
  { name: "Product recommendation engine", desc: "SKU-level matching across brand catalogues" },
  { name: "Clinical & dermatologist backing", desc: "Evidence-based claims, expert validation signals" },
  { name: "Compliance & labeling checks", desc: "Clean beauty, EU/US regulations, cruelty-free standards" },
  { name: "Skin progress tracking", desc: "Before/after capture, routine adherence, outcome logging" },
];

export default function SkincarePage() {
  return (
    <main
      className="min-h-screen page-gap-fix"
      style={{ background: "linear-gradient(170deg, #FFF0F8 0%, #FDFAFF 28%, #FFF8FC 52%, #F8F3FF 76%, #FFF0F8 100%)" }}
    >
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "110px 48px 80px" }}>
        <div style={{ position: "absolute", top: -80, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(194,24,106,0.11) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(194,24,106,0.08)", color: "#C2186A", border: "1px solid rgba(194,24,106,0.18)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C2186A", display: "inline-block" }} />
            AI Agents · Skincare &amp; Beauty
          </div>
          <h1 className="font-bold" style={{ fontSize: "clamp(36px, 5.5vw, 56px)", letterSpacing: "-0.03em", lineHeight: 1.08, color: "#0A0A0A", marginBottom: 24 }}>
            Comparison intelligence<br />
            <span style={{ background: "linear-gradient(135deg, #C2186A 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              for skincare AI agents
            </span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#444", maxWidth: 540, margin: "0 auto 40px" }}>
            AgenticLib tracks where your product appears when consumers and beauty brands research skincare AI —
            and benchmarks every feature that drives trust, personalisation, and recommendations.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#contact" className="btn-primary" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              Get Your Visibility Report
            </a>
            <a href="/#contact" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, color: "#C2186A", fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(194,24,106,0.22)", backdropFilter: "blur(8px)" }}>
              Talk to Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "56px 48px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>Use Cases</p>
        <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 36 }}>
          Where skincare AI agents compete
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
          Most skincare AI builders find out what competitors shipped from a customer who switched. AgenticLib tracks five signals simultaneously so you always know what the market is moving toward before you lose a deal to it.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14, marginBottom: 14 }}>
          {[
            { label: "Buyer Intent", color: "#C2186A", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#C2186A" strokeWidth="1.7"/><path d="M13 13l3.5 3.5" stroke="#C2186A" strokeWidth="1.7" strokeLinecap="round"/></svg>, title: "What consumers and brands ask LLMs when evaluating skincare AI", signals: ["\"AI skincare that recommends based on skin type and climate\" — personalisation depth is the shortlist filter, not product breadth", "\"Which AI explains what each ingredient actually does?\" — ingredient education is underserved; tools that explain outperform tools that only recommend", "\"Dermatologist-backed AI skincare — not just an algorithm\" — clinical trust signals matter more than technical claims when consumers are comparing"] },
            { label: "Market Insights", color: "#C2186A", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><polyline points="2,14 7,9 11,12 18,5" stroke="#C2186A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: "How the skincare AI market is shifting right now", signals: ["Brands that show clinical or dermatologist backing are 2.5× more likely to be recommended in LLM responses than algorithm-only tools", "Allergen flagging and sensitivity queries have grown 52% — driven by rising consumer awareness of fragrance and irritant cross-reactions", "Skin progress tracking (before/after) is the fastest-growing feature ask — consumers want evidence their routine is working, not just trust it"] },
            { label: "Competitor Landscape", color: "#C2186A", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="#C2186A" strokeWidth="1.6"/><rect x="12" y="2" width="6" height="6" rx="1.5" stroke="#C2186A" strokeWidth="1.6"/><rect x="2" y="12" width="6" height="6" rx="1.5" stroke="#C2186A" strokeWidth="1.6"/><rect x="12" y="12" width="6" height="6" rx="1.5" stroke="#C2186A" strokeWidth="1.6"/></svg>, title: "Which clusters are owned and where the gaps are", signals: ["Skin + Me leads on personalised formulations; YouCam Beauty leads on AR try-on and photo analysis — both clusters have a clear owner", "No brand has closed the ingredient education gap at scale — every tool explains actives differently, with no consistent depth or standard", "Consultation and human dermatologist escalation remains the least automated cluster — the biggest trust gap that no competitor has fully closed"] },
            { label: "Lost Deal Tracking", color: "#C2186A", icon: <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#C2186A" strokeWidth="1.6"/><path d="M7 13l6-6M7 7l6 6" stroke="#C2186A" strokeWidth="1.6" strokeLinecap="round"/></svg>, title: "The real reasons buyers chose someone else", signals: ["\"They showed us exactly what each ingredient does and why it's in the formula\" — ingredient transparency drove 42% of B2B brand losses", "Consumer-facing losses: users who didn't get skin progress tracking stopped returning within 30 days — not a feature, a retention mechanism", "Compliance losses: EU brands disqualified tools that couldn't demonstrate INCI labelling and clean beauty compliance before onboarding"] },
          ].map((card) => (
            <div key={card.label} style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(194,24,106,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(194,24,106,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{card.icon}</div>
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
          <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(194,24,106,0.11)", borderRadius: 16, padding: "28px 28px 26px", backdropFilter: "blur(12px)", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(194,24,106,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M3 5.5C3 4.4 3.9 3.5 5 3.5h10c1.1 0 2 .9 2 2V12c0 1.1-.9 2-2 2H7l-4 3V5.5z" stroke="#C2186A" strokeWidth="1.6" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Customer Requests</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12, lineHeight: 1.4 }}>When three unrelated customers describe the same gap in the same words — that&apos;s the feature</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              {[
                { req: "Climate-adaptive routine logic", detail: "The same routine shouldn't apply in Sydney summer and London winter — no competitor owns this yet and the request comes up constantly" },
                { req: "Allergen cross-reactivity detection", detail: "Single-ingredient flagging misses fragrance + nickel + latex interactions — customers with sensitive skin want the combination caught, not just individual irritants" },
                { req: "Before/after progress tracking", detail: "Consumers want to see their routine working over time — this is the difference between a one-time recommendation and a product people return to" },
              ].map((r, i) => (
                <div key={i} style={{ background: "rgba(194,24,106,0.04)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>{r.req}</div>
                  <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{r.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(194,24,106,0.06) 0%, rgba(124,58,237,0.04) 100%)", border: "1.5px solid rgba(194,24,106,0.15)", borderRadius: 18, padding: "36px 36px 38px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 17l4-8 5 3 5-9" stroke="#C2186A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="3" r="2" fill="#C2186A" opacity="0.7"/></svg>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>Product Feature Roadmap</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.3 }}>What to build next — and which use case cluster to expand to</h3>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, marginBottom: 26, maxWidth: 560 }}>When buyer intent, lost deals, and customer requests all point to the same gap, that&apos;s the feature. AgenticLib surfaces the agreement across all five signals so your roadmap is driven by evidence, not whoever managed the last customer call.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { priority: "01", title: "Ingredient education depth", reason: "Most under-served signal in the category, highest B2B loss frequency (42%), and rising consumer search intent. Every competitor recommends — almost none explain why at ingredient level." },
              { priority: "02", title: "Expand into Consultation & Dermatologist-Guided cluster", reason: "Clinical backing is the trust moat no competitor has fully closed. Brands that signal dermatologist involvement are 2.5× more likely to be recommended. This cluster is the biggest trust gap open to own." },
              { priority: "03", title: "Climate-adaptive routine logic", reason: "Customer request frequency crossed the threshold. No competitor owns this yet. The gap is specific, reproducible across unrelated accounts, and directly tied to the retention problem." },
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
          border: "1px solid rgba(194,24,106,0.12)",
          borderRadius: 20,
          padding: "44px 44px 48px",
          boxShadow: "0 4px 32px rgba(194,24,106,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>Product Intelligence</p>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#0A0A0A", lineHeight: 1.2, marginBottom: 12 }}>
            What a skincare AI agent needs to win
          </h2>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.65, maxWidth: 560, marginBottom: 36 }}>
            AgenticLib tracks these features across every skincare AI agent in the market —
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
        .uc-row:hover { background: rgba(194,24,106,0.03); border-radius: 10px; }
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
