import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company – AgenticLib",
  description: "AgenticLib is the intelligence layer between AI agent builders and the LLM responses that describe them.",
};

const SERIF   = "var(--font-schibsted), var(--font-geist-sans), sans-serif";
const BG      = "#F5F0FA";
const INK     = "#111111";
const MUTED   = "#111111";
const MAGENTA = "#9D174D";

export default function CompanyPage() {
  return (
    <main style={{ minHeight: "100vh", background: BG }}>
      <article style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "88px 64px 96px",
        fontFamily: SERIF,
        color: INK,
      }}>

        {/* About label + callout */}
        <p style={{
          fontFamily: "var(--font-space-mono), monospace",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: MAGENTA,
          marginBottom: 20,
        }}>
          About
        </p>
        <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.45, marginBottom: 60 }}>
          AgenticLib helps AI Agent builders gain an edge on their product feature growth,
          competitive landscape, and LLM visibility by giving them the intelligence to see
          exactly where they stand and what to fix next.
        </p>


        {/* Platform section */}
        <p style={{
          fontFamily: "var(--font-space-mono), monospace",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: MAGENTA,
          marginTop: 64,
          marginBottom: 32,
        }}>
          Platform
        </p>

        <div style={{ fontSize: 18, lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 22 }}>
          <p>
            The AgenticLib platform is a full intelligence dashboard built specifically for AI
            agent builders. Builders start by selecting a business domain — construction, finance,
            healthcare, legal, and more — then drill into the specific use case that matters to
            them. From there, they choose the product features they want to evaluate, and the
            platform surfaces the top brands operating in that exact space with every filter
            applied.
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
          <p>
            This is what comparison intelligence means in practice: not a static report, but a
            working tool that turns real LLM data into a decision-making layer for every stage of
            product growth.
          </p>
        </div>

        {/* Founder */}
        <div style={{
          marginTop: 60,
          borderRadius: 24,
          background: "linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(236,72,153,0.10) 50%, rgba(99,102,241,0.10) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(168,85,247,0.18)",
          padding: "28px 32px",
          display: "flex", alignItems: "center", gap: 20,
        }}>
<div>
            <p style={{ fontSize: 26, fontWeight: 700, color: INK, marginBottom: 6, fontFamily: SERIF }}>Srinidhi Murali</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <p style={{
                fontFamily: "var(--font-space-mono), monospace",
                fontSize: 16, fontWeight: 700, color: MUTED,
                textTransform: "uppercase", letterSpacing: "0.1em", margin: 0,
              }}>Founder</p>
              <a
                href="https://www.linkedin.com/in/srinidhi-murali06/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{ display: "flex", alignItems: "center", color: "#0a66c2", flexShrink: 0 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&to=srinidhi.murali@agenticlib.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Email"
                style={{ display: "flex", alignItems: "center", color: MUTED, flexShrink: 0 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m2 7 10 7 10-7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

      </article>
    </main>
  );
}
