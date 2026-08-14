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
          background: #f0eff5;
          font-family: var(--font-schibsted), system-ui, sans-serif;
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
          color: #7C3AED;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .co-footer-text {
          font-family: var(--font-space-mono), monospace;
          font-size: 11px;
          line-height: 1.65;
          color: #000000;
          letter-spacing: 0.02em;
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
          .co-wrap { padding: 48px 24px 80px; }
          .co-section {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 48px 0;
          }
          .co-headline { font-size: clamp(34px, 9vw, 52px); }
          .co-subhead  { font-size: clamp(20px, 5vw, 26px); }
          .co-body     { font-size: 15px; }
          .co-founder-banner { padding: 36px 28px; }
          .co-founder-name   { font-size: 36px; }
          .co-orbs { display: none; }
        }
      `}</style>

      <main className="co-page">
        <div className="co-wrap">

          {/* MISSION */}
          <section className="co-section">
            <div className="co-left">
              <h2 className="co-headline">Mission</h2>

            </div>

            <div className="co-right">
              <p className="co-subhead">
                Most AI agent builders only find out who they are losing to when a customer says so out loud.
              </p>
              <div className="co-body">
                <p>
                  That feedback loop is too slow. By the time it reaches you, the deal is
                  gone, the roadmap is reactive, and a competitor has already shipped the thing
                  that would have kept the customer in the room.
                </p>
                <p>
                  AgenticLib's mission is to close that gap. We track every move your competitors
                  make: what has launched, what has changed, what LLMs now say about them. So
                  you know before a buyer asks. We show you the exact feature costing you
                  positions in Claude and ChatGPT responses, with the quotes that prove it. And
                  we hand you a prioritised three-month roadmap of what to build next, tied
                  directly to the use cases where your buyers are already looking, so you
                  compete on intelligence, not on whatever you happened to hear last.
                </p>
              </div>
              <div className="co-footer">
                <svg className="co-footer-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2h4M2 2v4M2 2l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="co-footer-text">
                  Built so that every AI agent builder knows where they stand before a customer has to tell them.
                </span>
              </div>
            </div>
          </section>

          {/* VISION */}
          <section className="co-section">
            <div className="co-left">
              <h2 className="co-headline">Vision</h2>

            </div>

            <div className="co-right">
              <p className="co-subhead">
                Every builder<br />
                deserves to know<br />
                what to build next.
              </p>
              <div className="co-body">
                <p>
                  Structured, timely, and specific enough to act on. Right now
                  that kind of intelligence about LLM visibility (which features matter, which
                  use cases are growing, which competitors are pulling ahead and why) is only
                  available to the builders with the resources to go looking for it themselves.
                  Everyone else learns from a lost deal.
                </p>
                <p>
                  We believe that should change. Our vision is a world where every AI agent
                  builder, regardless of team size or runway, has a clear view of where they
                  stand in the conversations that drive their buyers' decisions, and a direct
                  path to improving that position. Not because they asked a customer. Because
                  they have Sage.
                </p>
              </div>
              <div className="co-footer">
                <svg className="co-footer-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2h4M2 2v4M2 2l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="co-footer-text">
                  Product intelligence should not be a privilege of scale. It should be a given.
                </span>
              </div>
            </div>
          </section>

          {/* FOUNDER BANNER */}
          <div style={{
            margin: "64px auto 0",
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
              <p style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.80)", margin: "0 0 12px" }}>Founder</p>
              <h2 style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", fontSize: "clamp(22px, 2.4vw, 32px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em", color: "#ffffff", margin: "0 0 28px" }}>Srinidhi Murali</h2>
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
