import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company – AgenticLib",
  description:
    "AgenticLib is the intelligence layer between AI agent builders and the LLM responses that describe them.",
};

export default function CompanyPage() {
  return (
    <>
      <style>{`
        /* ── Page ── */
        .co-page {
          min-height: 100vh;
          background: #F6F2FB;
          background-image:
            radial-gradient(ellipse 80% 40% at 50% 0%, rgba(124,58,237,0.13) 0%, transparent 70%);
        }

        /* ── Article wrapper ── */
        .co-article {
          max-width: 820px;
          margin: 0 auto;
          padding: 0 64px 112px;
        }

        /* ── Opening / hero eyebrow ── */
        .co-eyebrow {
          padding-top: 80px;
          padding-bottom: 56px;
        }
        .co-label {
          font-family: var(--font-space-mono), monospace;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9D174D;
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 0 0 28px;
        }
        .co-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(157,23,77,0.40) 0%, transparent 100%);
        }
        .co-headline {
          font-family: var(--font-eb-garamond), Georgia, serif;
          font-size: 33px;
          font-style: italic;
          font-weight: 400;
          line-height: 1.52;
          color: #1A0929;
          max-width: 700px;
          margin: 0 0 36px;
          text-wrap: balance;
        }
        .co-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-schibsted), var(--font-geist-sans), sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #7C3AED;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: gap 0.18s ease;
        }
        .co-cta:hover { gap: 11px; }
        .co-cta-arrow {
          font-size: 17px;
          line-height: 1;
          transition: transform 0.18s ease;
        }
        .co-cta:hover .co-cta-arrow { transform: translateX(2px); }

        /* ── Divider ── */
        .co-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            rgba(124,58,237,0.22) 0%,
            rgba(157,23,77,0.18) 45%,
            transparent 100%
          );
          margin: 0 0 56px;
        }

        /* ── Body copy ── */
        .co-body {
          font-family: var(--font-schibsted), var(--font-geist-sans), sans-serif;
          font-size: 17.5px;
          line-height: 1.88;
          color: #2A1840;
          display: flex;
          flex-direction: column;
          gap: 22px;
          margin-bottom: 0;
        }
        .co-body p { margin: 0; }

        /* ── Highlight paragraph ── */
        .co-highlight {
          background: rgba(124,58,237,0.055);
          border-left: 2.5px solid rgba(124,58,237,0.45);
          border-radius: 0 10px 10px 0;
          padding: 18px 22px;
          font-size: 17px;
          line-height: 1.78;
          color: #1A0929;
          margin: 4px 0;
        }

        /* ── Founder card ── */
        .co-founder {
          margin-top: 68px;
          border-radius: 20px;
          background: #FFFFFF;
          border: 1px solid rgba(124,58,237,0.12);
          padding: 30px 34px;
          display: flex;
          align-items: center;
          gap: 22px;
          box-shadow:
            0 2px 16px rgba(109,40,217,0.07),
            0 0 0 1px rgba(124,58,237,0.04);
        }
        .co-avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED 0%, #C2186A 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-schibsted), sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: -0.03em;
          box-shadow: 0 3px 12px rgba(124,58,237,0.30);
        }
        .co-founder-name {
          font-family: var(--font-schibsted), sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #111;
          margin: 0 0 5px;
          line-height: 1.2;
        }
        .co-founder-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 7px;
        }
        .co-founder-role {
          font-family: var(--font-space-mono), monospace;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.20em;
          text-transform: uppercase;
          color: #9D174D;
        }
        .co-founder-email {
          font-family: var(--font-schibsted), sans-serif;
          font-size: 13.5px;
          color: #6B7280;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s;
        }
        .co-founder-email:hover { color: #7C3AED; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .co-article  { padding: 0 20px 72px; }
          .co-eyebrow  { padding-top: 48px; padding-bottom: 36px; }
          .co-headline { font-size: 24px; }
          .co-body     { font-size: 16px; }
          .co-founder  { flex-direction: row; gap: 14px; padding: 22px 18px; }
          .co-avatar   { width: 48px; height: 48px; font-size: 16px; }
          .co-founder-name { font-size: 17px; }
        }
      `}</style>

      <main className="co-page">
        <article className="co-article">

          {/* ── Opening ── */}
          <div className="co-eyebrow">
            <p className="co-label">Company</p>
            <p className="co-headline">
              AgenticLib helps AI agent builders gain an edge on product feature growth,
              competitive landscape, and LLM visibility — giving them the intelligence to see
              exactly where they stand and what to fix next.
            </p>
            <a href="/sage" className="co-cta">
              Try the platform
              <span className="co-cta-arrow">→</span>
            </a>
          </div>

          <div className="co-divider" />

          {/* ── Platform ── */}
          <p className="co-label">Platform</p>

          <div className="co-body">
            <p>
              The AgenticLib platform is a full intelligence dashboard built specifically for AI
              agent builders. Builders start by selecting a business domain — construction, finance,
              healthcare, legal, and more — then drill into the specific use case that matters to
              them. From there, they choose the product features they want to evaluate, and the
              platform surfaces the top brands operating in that exact space with every filter applied.
            </p>
            <p>
              What they get back is not a raw list. It is a structured comparison: visibility scores
              across Claude, GPT, and other major LLMs; feature-by-feature breakdowns showing how
              each brand performs against the buyer questions that define that use case; sentiment
              signals showing not just whether a brand gets mentioned but how confidently and
              positively; and competitive rankings that make it immediately clear where any given
              product leads, where it trails, and against whom.
            </p>
            <p>
              The dashboard serves two purposes simultaneously. A builder can use it to benchmark
              their own product, identify the specific features or positioning gaps holding their
              score down, and find a clear path to closing them. And they can use it to understand
              the competitive landscape in full: who is winning in their domain, how they are
              winning, and what it would take to overtake them. Both views are live from the same
              set of filters.
            </p>
            <p className="co-highlight">
              This is what comparison intelligence means in practice: a working platform that turns
              real LLM data into a decision-making layer for every stage of product growth.
            </p>
          </div>

          {/* ── Founder ── */}
          <div className="co-founder">
            <div className="co-avatar">SM</div>
            <div>
              <p className="co-founder-name">Srinidhi Murali</p>
              <div className="co-founder-meta">
                <span className="co-founder-role">Founder</span>
                <a
                  href="https://www.linkedin.com/in/srinidhi-murali06/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  style={{ display: "flex", alignItems: "center", color: "#0a66c2" }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
              <a
                href="mailto:srinidhi.murali@agenticlib.com"
                className="co-founder-email"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 7 10-7" />
                </svg>
                srinidhi.murali@agenticlib.com
              </a>
            </div>
          </div>

        </article>
      </main>
    </>
  );
}
