import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company – AgenticLib",
  description: "AgenticLib is the intelligence layer between AI agent builders and the LLM responses that describe them.",
};

const PURPLE = "#6c4cf1";

export default function CompanyPage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "80px 32px 64px" }}>

        {/* About */}
        <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.5, color: "#000", marginBottom: 48 }}>
          We help AI agent builders gain an edge on their product feature growth, competitive landscape, and LLM visibility
          by giving them the intelligence to see exactly where they stand and what to fix next.
        </p>

        <div style={{ height: 1, background: "rgba(0,0,0,0.08)", marginBottom: 48 }} />

        {/* Vision */}
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          color: PURPLE, marginBottom: 20,
        }}>
          Vision
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 16, lineHeight: 1.75, color: "#000" }}>
          <p>
            AgenticLib exists because being good at what you build should not require guessing whether the systems now
            deciding who gets recommended can even find you.
          </p>
          <p>
            Buyers no longer just compare pricing pages. They ask Claude or GPT what tool to use, and the AI&apos;s answer
            has quietly become the shortlist. Most founders have no idea what that answer says about them, or how it
            compares to their competitors.
          </p>
          <p>
            We believe visibility and capability are two different problems, and treating them as one is why most tools in
            this space fall short.
          </p>
          <p>
            That&apos;s the thing we do differently: we separate LLM visibility from product feature scoring, and organize
            both around the same unit, the use case cluster. Visibility is measured by how often a brand comes up when
            buyers ask the specific questions that matter for that use case. Feature scoring is measured the same way,
            against the specific buyer questions a brand needs to answer well within that use case, not a generic
            capability checklist. A brand doesn&apos;t just want to &ldquo;be visible.&rdquo; It wants to win the exact
            moment a buyer is asking about the exact thing it does best, and know precisely where it falls short of that.
          </p>
          <p>
            From there, we zoom out. Within a business domain, every tracked brand is scored across security, pricing,
            technical capabilities, and the domain-specific features that actually define the category. That gives
            builders a real picture of the competitive landscape, not just their own scorecard in isolation. That&apos;s
            how a builder sees not just &ldquo;are we behind,&rdquo; but exactly where, against exactly whom.
          </p>
          <p>
            We also track sentiment: not just whether AI models mention a brand, but how they describe it, and how
            confidently.
          </p>
          <p>
            And for the brands that have won real AI-search visibility, we show the mechanism. What they actually did and
            how they did it: the content, the positioning, the specific moves, so builders aren&apos;t just told
            they&apos;re behind, they&apos;re shown a real, replicable path forward.
          </p>

          <p style={{ fontWeight: 600 }}>
            Our mission is simple: make it possible for a good product to be found, understood, and correctly compared by
            the systems now doing the finding.
          </p>

          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10, margin: 0 }}>
            <li>Builders deserve to know exactly where they stand, by use case, by feature, by competitor. Not a vague visibility score.</li>
            <li>Buyers deserve recommendations built on what&apos;s true and current, not on what happened to get indexed first.</li>
            <li>The AI agent market deserves infrastructure that rewards real capability over accidental visibility.</li>
          </ul>

          <p>
            In the long run, this is about more than any one report. As more purchasing decisions route through
            AI-mediated search, the builders who understand both their visibility and their real competitive gaps (cluster
            by cluster, feature by feature) will win customers they never had to chase.
          </p>
          <p>
            AgenticLib is the intelligence layer for AI agent builders.
          </p>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "56px 0 48px" }} />

        {/* Founder */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #6c4cf1, #e040a0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 600, color: "#fff",
          }}>
            S
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#000", marginBottom: 4 }}>Srinidhi Murali</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: PURPLE, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Founder</p>
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
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
