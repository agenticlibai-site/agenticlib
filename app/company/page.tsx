import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company – AgenticLib",
  description: "AgenticLib is the intelligence layer between AI agent builders and the LLM responses that describe them.",
};

const BODY: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 400,
  lineHeight: 1.75,
  color: "rgba(0,0,0,0.70)",
  margin: 0,
};

const H2: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: "#000",
  letterSpacing: "-0.01em",
  marginBottom: 28,
};

export default function CompanyPage() {
  return (
    <main style={{ minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "72px 32px 64px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6c4cf1", marginBottom: 20 }}>
          About
        </p>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, color: "#000", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 24 }}>
          AI models are shaping buying decisions. Most brands don't know what they're saying.
        </h1>
        <p style={{ ...BODY, color: "rgba(0,0,0,0.55)", maxWidth: 540 }}>
          We're building the intelligence layer between AI agent builders and the LLM responses that describe them. The fastest-growing discovery channel in software shouldn't be the least understood.
        </p>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ height: 1, background: "rgba(0,0,0,0.08)" }} />
      </div>

      {/* Manifesto */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "64px 32px" }}>
        <h2 style={H2}>Manifesto</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { text: "AgenticLib exists because AI agent builders deserve to know how they're being perceived in the layer that matters most.", strong: false },
            { text: "When a buyer researches a sales AI tool, a marketing agent, or a skincare platform, they increasingly start with a question to Claude or GPT. The response they receive — which brands get mentioned, how they're described, which features get credited — shapes their consideration before they visit a single product page. This is happening at scale, right now, and most builders have no visibility into it.", strong: false },
            { text: "The problem is not that AI models are unreliable. The problem is that the gap between what a brand has built and what AI models say about it is invisible — and invisibility in this layer is expensive.", strong: false },
            { text: "We have seen brands with strong products failing to surface in the use cases they were built for. We have seen brands get recommended for capabilities they don't have. We have seen perception drift go undetected for weeks while competitors quietly gained ground. None of this is the fault of the product. It is the fault of a missing intelligence layer.", strong: false },
            { text: "AgenticLib is building that layer.", strong: true },
            { text: "We run daily prompts across Claude and GPT-4o-mini simulating real buyer questions — tracking which brands appear, where they appear, how they're described, and how their documented capabilities score against competitors. We surface the gaps between AI model perception and product reality. We turn that data into comparison intelligence reports that show AI agent builders exactly where they stand in the LLM layer and what to do about it.", strong: false },
            { text: "Our belief is simple: in a world where AI models mediate discovery, visibility in that layer is a product problem, not just a marketing problem.", strong: false },
          ].map(({ text, strong }, i) => (
            <p key={i} style={{ ...BODY, fontWeight: strong ? 600 : 400, color: strong ? "#000" : "rgba(0,0,0,0.70)" }}>{text}</p>
          ))}
        </div>
      </section>

      {/* What we stand for */}
      <section style={{ background: "rgba(108,76,241,0.05)", borderTop: "1px solid rgba(108,76,241,0.10)", borderBottom: "1px solid rgba(108,76,241,0.10)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "64px 32px" }}>
          <h2 style={H2}>What we stand for</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              "Builders deserve to know what AI models say about them before their buyers do.",
              "Perception gaps between documented capability and LLM visibility are real, measurable, and fixable.",
              "Intelligence should be live, not static — updated daily as models evolve and markets shift.",
              "The brands that understand the AI layer earliest will be the ones that own their categories.",
            ].map((item, i) => (
              <p key={i} style={BODY}>{item}</p>
            ))}
          </div>
        </div>
      </section>

      {/* What we're building */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "64px 32px" }}>
        <h2 style={H2}>What we're building</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { text: "AgenticLib is comparison intelligence for AI agent builders.", strong: true },
            { text: "We track brand visibility across LLM responses, score product features against competitors, monitor sentiment and perception drift, and surface where AI models are getting the story wrong. Every report we produce is grounded in real prompt data collected daily — not surveys, not analyst estimates, not gut feel.", strong: false },
            { text: "We are not here to replace how builders go to market. We are here to give them the one thing they've been missing: an accurate, live read of how AI models perceive them in the moments that matter.", strong: false },
            { text: "That is what comparison intelligence means. Not a snapshot. Not a benchmark taken once a quarter. A living signal that updates as the market moves, so builders can move with it.", strong: false },
            { text: "We are here for the founder whose product is stronger than its AI visibility suggests. We are here for the team that suspects their LLM narrative is wrong but has no way to measure it. We are here for the builders who understand that the next category winner won't just be the best product — it will be the best-understood product in the layer where buyers are actually asking.", strong: false },
            { text: "AgenticLib is the intelligence layer for AI agent builders.", strong: true },
          ].map(({ text, strong }, i) => (
            <p key={i} style={{ ...BODY, fontWeight: strong ? 600 : 400, color: strong ? "#000" : "rgba(0,0,0,0.70)" }}>{text}</p>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ height: 1, background: "rgba(0,0,0,0.08)" }} />
      </div>

      {/* Team */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "64px 32px 96px" }}>
        <h2 style={H2}>Team</h2>
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
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6c4cf1", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Founder</p>
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
