import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company – AgenticLib",
  description: "AgenticLib is the intelligence layer between AI agent builders and the LLM responses that describe them.",
};

export default function CompanyPage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "80px 32px" }}>
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
