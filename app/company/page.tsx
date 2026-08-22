import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company – AgenticLib",
  description:
    "AgenticLib is the comparison intelligence platform for AI agent builders. Stop learning what you're losing to from a lost customer and start competing where buyers are actually asking.",
};

export default function CompanyPage() {
  return (
    <>
      <style>{`
        .co-page {
          min-height: 100vh;
          background: #FDF0F5;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          margin-top: -68px;
          padding-top: 68px;
        }
        @media (max-width: 767px) {
          .co-page { margin-top: 0; padding-top: 0; }
        }

        .co-wrap {
          max-width: 1160px;
          margin: 0 auto;
          padding: 96px 48px 120px;
        }

        /* Section */
        .co-section {
          display: grid;
          grid-template-columns: 0.9fr 1.3fr;
          gap: 80px;
          align-items: start;
          padding: 72px 0;
          border-top: 1px solid rgba(0,0,0,0.10);
        }
        .co-section:last-child {
          border-bottom: 1px solid rgba(0,0,0,0.10);
        }

        /* Left column */
        .co-left {}

        .co-eyebrow {
          font-family: var(--font-space-mono), monospace;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #000000;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 28px;
        }
        .co-eyebrow-rule {
          display: inline-block;
          width: 28px;
          height: 1px;
          background: rgba(0,0,0,0.30);
          flex-shrink: 0;
        }

        .co-headline {
          font-size: clamp(38px, 4.8vw, 64px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.035em;
          color: #0F0B1E;
          margin: 0;
          text-wrap: balance;
        }

        .co-gradient {
          background: linear-gradient(95deg, #7C3AED 0%, #C2186A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Right column */
        .co-right {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .co-subhead {
          font-size: clamp(22px, 2.6vw, 32px);
          font-weight: 700;
          line-height: 1.22;
          letter-spacing: -0.025em;
          color: #0F0B1E;
          margin: 0 0 28px;
          text-wrap: balance;
        }

        .co-body {
          font-size: 16px;
          line-height: 1.72;
          color: #000000;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-weight: 450;
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin: 0 0 36px;
        }
        .co-body p { margin: 0; }

        .co-footer {
          border-top: 1px solid rgba(0,0,0,0.10);
          padding-top: 20px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .co-footer-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .co-footer-text {
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 14px;
          font-style: italic;
          line-height: 1.6;
          color: #7C3AED;
          letter-spacing: -0.01em;
        }

        /* Founder banner */
        .co-founder-banner {
          margin-top: 64px;
          border-radius: 20px;
          background: linear-gradient(110deg, #7C3AED 0%, #b0306a 55%, #E05A5A 100%);
          padding: 56px 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          overflow: hidden;
          position: relative;
        }

        .co-founder-left {
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .co-founder-kicker {
          font-family: var(--font-space-mono), monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          margin: 0 0 16px;
        }

        .co-founder-name {
          font-size: clamp(36px, 4.5vw, 58px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.035em;
          color: #ffffff;
          margin: 0 0 16px;
        }

        .co-founder-role {
          font-size: 16px;
          font-weight: 500;
          color: rgba(255,255,255,0.80);
          margin: 0 0 32px;
          line-height: 1.5;
        }

        .co-founder-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .co-founder-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #0F0B1E;
          font-size: 14px;
          font-weight: 700;
          padding: 12px 22px;
          border-radius: 9999px;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .co-founder-btn:hover { opacity: 0.88; }

        .co-founder-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.18);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          padding: 12px 22px;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.35);
          text-decoration: none;
          transition: background 0.15s;
        }
        .co-founder-btn-ghost:hover { background: rgba(255,255,255,0.26); }

        /* Orbital graphic */
        .co-orbs {
          position: absolute;
          right: -30px;
          top: 50%;
          transform: translateY(-50%);
          width: 320px;
          height: 320px;
          pointer-events: none;
          flex-shrink: 0;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .co-wrap { padding: 32px 20px 72px; }
          .co-section {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 36px 0;
            margin-top: 0 !important;
          }
          .co-headline { font-size: clamp(32px, 9vw, 48px); }
          .co-subhead  { font-size: clamp(18px, 5vw, 24px); }
          .co-body     { font-size: 15px; }
          .co-founder-banner { padding: 32px 24px; flex-direction: column; }
          .co-founder-name   { font-size: 32px; }
          .co-orbs { display: none; }
          /* Hero cards */
          .co-mission-card  { padding: 28px 24px 24px !important; }
          .co-mission-title { white-space: normal !important; font-size: clamp(18px, 5.5vw, 26px) !important; }
          .co-mission-h2    { font-size: clamp(30px, 8vw, 44px) !important; }
          /* Win-by grid */
          .co-winby-grid    { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main className="co-page">
        <div className="co-wrap">

          {/* MISSION */}
          <section className="co-section" style={{ borderTop: "none", paddingTop: 0, marginTop: -48 }}>
            <div className="co-right" style={{ gridColumn: "1 / -1" }}>

              {/* Bold statement — fluid gradient hero card, full-width */}
              <div className="co-mission-card" style={{
                position: "relative",
                borderRadius: 18,
                overflow: "hidden",
                marginBottom: 32,
                padding: "48px 44px 44px",
                background: "#EDE7FF",
              }}>
                {/* Fluid blob layer */}
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", left: "-8%", top: "0%",
                    width: "50%", height: "140%",
                    borderRadius: "50%",
                    background: "rgba(124,58,237,0.20)",
                    filter: "blur(56px)",
                    transform: "rotate(-18deg)",
                  }} />
                  <div style={{
                    position: "absolute", right: "-6%", top: "-30%",
                    width: "42%", height: "110%",
                    borderRadius: "50%",
                    background: "rgba(194,24,106,0.32)",
                    filter: "blur(50px)",
                    transform: "rotate(22deg)",
                  }} />
                  <div style={{
                    position: "absolute", left: "30%", top: "15%",
                    width: "38%", height: "75%",
                    borderRadius: "50%",
                    background: "rgba(235,215,255,0.65)",
                    filter: "blur(40px)",
                  }} />
                  <div style={{
                    position: "absolute", left: "55%", bottom: "-20%",
                    width: "32%", height: "80%",
                    borderRadius: "50%",
                    background: "rgba(160,34,142,0.28)",
                    filter: "blur(46px)",
                    transform: "rotate(-12deg)",
                  }} />
                </div>

                {/* Content */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h2 className="co-mission-h2" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontSize: "clamp(38px, 4.8vw, 64px)",
                    fontWeight: 800,
                    lineHeight: 1.05,
                    letterSpacing: "-0.035em",
                    color: "#0F0B1E",
                    margin: "0 0 20px",
                  }}>
                    Mission
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, opacity: 0.70 }}>
                      <circle cx="16" cy="16" r="3" fill="#0F0B1E"/>
                      <ellipse cx="16" cy="16" rx="13" ry="5.5" stroke="#0F0B1E" strokeWidth="1.5"/>
                      <ellipse cx="16" cy="16" rx="13" ry="5.5" stroke="#0F0B1E" strokeWidth="1.5" transform="rotate(60 16 16)"/>
                      <ellipse cx="16" cy="16" rx="13" ry="5.5" stroke="#0F0B1E" strokeWidth="1.5" transform="rotate(120 16 16)"/>
                    </svg>
                  </h2>
                  <p className="co-mission-title" style={{
                    fontSize: "clamp(22px, 2.6vw, 32px)",
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: "#0F0B1E",
                    lineHeight: 1.25,
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}>
                    Give every AI agent builder the intelligence to build what wins.
                  </p>
                </div>
              </div>

              {/* Below-card content */}
              <div>
                <p style={{
                  fontSize: "clamp(17px, 1.6vw, 21px)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#000000",
                  lineHeight: 1.2,
                  margin: "0 0 20px",
                }}>
                  We believe your agent should win conversations by:
                </p>

                {/* Win-by grid */}
                <div className="co-winby-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 220px))",
                  justifyContent: "center",
                  gap: 16,
                  margin: "4px 0 40px",
                }}>
                  {[
                    {
                      accent: "#7C3AED",
                      eyebrow: "Business Domain",
                      label: "By Business Domain",
                      sub: "Know which verticals your agent owns and where competitors are gaining ground.",
                      icon: (
                        <svg width="52" height="52" viewBox="0 0 22 22" fill="none">
                          <rect x="1.5" y="1.5" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                          <rect x="13.5" y="1.5" width="7" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                          <rect x="13.5" y="9" width="7" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                          <rect x="1.5" y="15.5" width="10" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        </svg>
                      ),
                    },
                    {
                      accent: "#3B6FD4",
                      eyebrow: "Use Case",
                      label: "By Use Case",
                      sub: "Track the exact moments buyers compare agents and see who wins the conversation.",
                      icon: (
                        <svg width="52" height="52" viewBox="0 0 22 22" fill="none">
                          <rect x="8" y="1.5" width="6" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                          <path d="M11 6v3.5M11 9.5L5.5 13M11 9.5L16.5 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          <rect x="2" y="13" width="7" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                          <rect x="13" y="13" width="7" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        </svg>
                      ),
                    },
                    {
                      accent: "#C2186A",
                      eyebrow: "Product Feature",
                      label: "By Product Feature",
                      sub: "Pinpoint the specific capabilities costing you positions in LLM responses.",
                      icon: (
                        <svg width="52" height="52" viewBox="0 0 22 22" fill="none">
                          <path d="M11 1.5L20.5 8.5L11 20.5L1.5 8.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                          <path d="M1.5 8.5H20.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          <path d="M6.5 8.5L11 1.5L15.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ),
                    },
                  ].map(({ accent, eyebrow, label, sub, icon }) => (
                    <div key={label} style={{
                      padding: "24px",
                      borderRadius: 16,
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.07)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0,
                    }}>
                      {/* Top row: eyebrow + decorative icon */}
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 18 }}>
                        <span style={{
                          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: "0.10em",
                          textTransform: "uppercase" as const,
                          color: accent,
                        }}>{eyebrow}</span>
                        <div style={{ color: accent, opacity: 0.18, flexShrink: 0 }}>{icon}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="co-body" style={{ margin: "0 0 36px" }}>
                  <p>
                    Most AI agent builders across every business domain aren't short on ambition.
                    What they're short on is awareness: of who's moving in their category, what
                    features a competitor just shipped, whether they're winning or losing the use
                    cases that actually matter. That awareness usually arrives too late, in the
                    form of a customer asking why they shouldn't just go with the other guy.
                  </p>
                  <p>
                    AgenticLib's mission is to close that gap before it opens. A platform that watches the
                    competitor landscape for you, tracks who owns which use case by share of
                    voice, and turns what it finds into a clear product feature roadmap: what to
                    build next, and what to scale, to stay ahead of the market curve. So a
                    builder never has to lose a deal because their own customer had to tell them
                    who they're up against.
                  </p>
                </div>
                <div className="co-footer">
                  <svg className="co-footer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                    <line x1="16" y1="8" x2="2" y2="22"/>
                    <line x1="17.5" y1="15" x2="9" y2="15"/>
                  </svg>
                  <span className="co-footer-text">
                    Built so that every AI agent builder knows where they stand before a customer has to tell them.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* VISION */}
          <section className="co-section" style={{ borderTop: "none" }}>
            <div className="co-right" style={{ gridColumn: "1 / -1" }}>

              {/* Vision hero card — pink-dominant, purple accent */}
              <div className="co-mission-card" style={{
                position: "relative",
                borderRadius: 18,
                overflow: "hidden",
                marginBottom: 32,
                padding: "48px 44px 44px",
                background: "#FFE5F2",
              }}>
                {/* Fluid blob layer */}
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", right: "-10%", top: "-10%",
                    width: "55%", height: "140%",
                    borderRadius: "50%",
                    background: "rgba(194,24,106,0.40)",
                    filter: "blur(56px)",
                    transform: "rotate(18deg)",
                  }} />
                  <div style={{
                    position: "absolute", left: "-8%", top: "5%",
                    width: "44%", height: "110%",
                    borderRadius: "50%",
                    background: "rgba(124,58,237,0.28)",
                    filter: "blur(50px)",
                    transform: "rotate(-20deg)",
                  }} />
                  <div style={{
                    position: "absolute", left: "32%", top: "10%",
                    width: "36%", height: "80%",
                    borderRadius: "50%",
                    background: "rgba(255,210,235,0.70)",
                    filter: "blur(40px)",
                  }} />
                  <div style={{
                    position: "absolute", right: "42%", bottom: "-20%",
                    width: "30%", height: "75%",
                    borderRadius: "50%",
                    background: "rgba(180,30,120,0.25)",
                    filter: "blur(44px)",
                    transform: "rotate(10deg)",
                  }} />
                </div>

                {/* Content */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h2 className="co-mission-h2" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontSize: "clamp(38px, 4.8vw, 64px)",
                    fontWeight: 800,
                    lineHeight: 1.05,
                    letterSpacing: "-0.035em",
                    color: "#0F0B1E",
                    margin: "0 0 20px",
                  }}>
                    Vision
                    <svg width="44" height="44" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, opacity: 0.70 }}>
                      <path d="M16 2 L17.5 14.5 L16 16 L14.5 14.5 Z" fill="#0F0B1E"/>
                      <path d="M30 16 L17.5 17.5 L16 16 L17.5 14.5 Z" fill="#0F0B1E"/>
                      <path d="M16 30 L14.5 17.5 L16 16 L17.5 17.5 Z" fill="#0F0B1E"/>
                      <path d="M2 16 L14.5 14.5 L16 16 L14.5 17.5 Z" fill="#0F0B1E"/>
                      <circle cx="16" cy="16" r="2" fill="#0F0B1E"/>
                      <circle cx="16" cy="16" r="5.5" stroke="#0F0B1E" strokeWidth="1" opacity="0.3"/>
                    </svg>
                  </h2>
                  <p className="co-mission-title" style={{
                    fontSize: "clamp(22px, 2.6vw, 32px)",
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: "#0F0B1E",
                    lineHeight: 1.25,
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}>
                    Helping all AI agent builders succeed.
                  </p>
                </div>
              </div>

              {/* Below-card content */}
              <div>
                <div className="co-body">
                  <p>
                    The odds are stacked against good AI agent builders, and not because their
                    product isn't good enough. It's because the market has gotten too loud to
                    read. Competitors ship in silence, buyers ask AI models instead of searching,
                    and most builders have no idea what those models say about them. The signal
                    that should guide what to build next gets lost, until a lost deal spells it
                    out the hard way.
                  </p>
                  <p>
                    Our vision is a world where every AI agent builder, regardless of team size
                    or runway, has a clear view of where they stand in the conversations that
                    drive their buyers' decisions, and a direct path to improving that position.
                    Using our own taxonomy and data-driven architecture, we read buyer intent at
                    scale and turn it into signal every builder can act on.
                  </p>
                </div>
                <div className="co-footer">
                  <svg className="co-footer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                    <line x1="16" y1="8" x2="2" y2="22"/>
                    <line x1="17.5" y1="15" x2="9" y2="15"/>
                  </svg>
                  <span className="co-footer-text">
                    Product intelligence should not be a privilege of scale. It should be a given.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* FOUNDER BANNER */}
          <div style={{
            margin: "24px auto 0",
            borderRadius: 20,
            background: "linear-gradient(110deg, #7C3AED 0%, #b0306a 55%, #E05A5A 100%)",
            padding: "36px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
            overflow: "hidden",
            position: "relative",
            maxWidth: 680,
          }}>
            <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
              <p style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.80)", margin: "0 0 12px" }}>Founder</p>
              <h2 style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif", fontSize: "clamp(22px, 2.4vw, 32px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em", color: "#ffffff", margin: "0 0 28px" }}>Srinidhi Murali</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                <a
                  href="https://www.linkedin.com/in/srinidhi-murali06/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ffffff", color: "#0F0B1E", fontSize: 14, fontWeight: 700, padding: "12px 22px", borderRadius: 9999, textDecoration: "none" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="mailto:srinidhi.murali@agenticlib.com"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ffffff", color: "#0F0B1E", fontSize: 14, fontWeight: 700, padding: "12px 22px", borderRadius: 9999, textDecoration: "none" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m2 7 10 7 10-7"/>
                  </svg>
                  srinidhi.murali@agenticlib.com
                </a>
              </div>
            </div>

            {/* Orbital rings */}
            <svg style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", width: 260, height: 260, pointerEvents: "none", flexShrink: 0 }} viewBox="0 0 320 320" fill="none">
              <circle cx="160" cy="160" r="120" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <circle cx="160" cy="160" r="80" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <circle cx="160" cy="160" r="56" fill="rgba(255,255,255,0.10)"/>
              <circle cx="160" cy="40" r="7" fill="rgba(255,255,255,0.85)"/>
              <circle cx="272" cy="178" r="6" fill="rgba(200,220,255,0.75)"/>
              <circle cx="96" cy="254" r="5" fill="rgba(255,255,255,0.65)"/>
            </svg>
          </div>

        </div>
      </main>
    </>
  );
}
