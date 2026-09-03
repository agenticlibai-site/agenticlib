"use client";
import Link from "next/link";

const PURPLE = "#6C4CF1";
const PURPLE_DARK = "#5B3DD6";

const linkStyle: React.CSSProperties = {
  display: "block",
  fontSize: 15,
  color: "#444",
  textDecoration: "none",
  marginBottom: 10,
  transition: "color 0.15s",
};

function NavLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const props = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const Tag = href.startsWith("/") ? Link : "a";
  return (
    <Tag
      href={href}
      {...props}
      style={linkStyle}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = PURPLE; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#444"; }}
    >
      {children}
    </Tag>
  );
}

export default function SiteFooter() {
  return (
    <footer
      id="contact"
      style={{
        background: "#F7F5FF",
        padding: "80px 0 0",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 48px" }}>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800,
            color: "#0F0B1E",
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            margin: "0 0 16px",
            textWrap: "balance" as never,
          }}>
            Build AI agent visibility<br />before your competitors do.
          </h2>
          <p style={{
            fontSize: 17,
            color: "#666",
            margin: "0 auto 36px",
            maxWidth: 440,
            lineHeight: 1.55,
          }}>
            Every day your brand isn&apos;t cited by LLMs is a day competitors are.
          </p>
          <a
            href="mailto:srinidhi.murali@agenticlib.com"
            style={{
              display: "inline-block",
              background: "#0F0B1E",
              color: "#fff",
              padding: "15px 34px",
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "-0.01em",
              transition: "background 0.15s, transform 0.1s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = PURPLE;
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#0F0B1E";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Talk to us
          </a>
        </div>

        {/* ── Columns ─────────────────────────────────────────────────────── */}
        <div className="footer-cols" style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 1fr 1fr 1fr",
          gap: 40,
          paddingBottom: 48,
        }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <img src="/logo.png" alt="AgenticLib" style={{ height: 28, width: "auto", objectFit: "contain" }} />
              <span style={{ fontSize: 17, fontWeight: 800, color: "#0F0B1E", letterSpacing: "-0.02em" }}>AgenticLib</span>
            </div>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.65, margin: "0 0 20px", maxWidth: 220 }}>
              Helping AI agent builders succeed — one LLM query at a time.
            </p>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              {[
                { href: "https://www.linkedin.com/company/108024233/", icon: "in" },
                { href: "https://x.com/AgenticLibAI/status/1960527278087266557", icon: "𝕏" },
              ].map(({ href, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "rgba(108,76,241,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: PURPLE,
                    textDecoration: "none", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(108,76,241,0.18)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(108,76,241,0.08)"; }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0F0B1E", marginBottom: 16, marginTop: 0 }}>Product</p>
            <NavLink href="/#sage">Sage AI</NavLink>
            <NavLink href="/#pricing">Pricing</NavLink>
            <NavLink href="/explore">Explore agents</NavLink>
          </div>

          {/* Company */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0F0B1E", marginBottom: 16, marginTop: 0 }}>Company</p>
            <NavLink href="/company">Mission</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/privacy">Privacy policy</NavLink>
            <NavLink href="/terms">Terms &amp; conditions</NavLink>
          </div>

          {/* Connect */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0F0B1E", marginBottom: 16, marginTop: 0 }}>Connect</p>
            <NavLink href="mailto:srinidhi.murali@agenticlib.com">Email us</NavLink>
            <NavLink href="https://www.linkedin.com/company/108024233/" external>LinkedIn</NavLink>
            <NavLink href="https://x.com/AgenticLibAI/status/1960527278087266557" external>X / Twitter</NavLink>
            <NavLink href="https://www.producthunt.com/p/self-promotion/agenticlib-simplifying-your-ai-agent-discovery-journey" external>Product Hunt</NavLink>
            <NavLink href="https://www.reddit.com/r/SideProject/comments/1m6bfy1/agenticlib_simplifying_your_ai_agent_discovery/" external>Reddit</NavLink>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────────── */}
        <div className="footer-bottom" style={{
          borderTop: "1px solid rgba(0,0,0,0.07)",
          padding: "20px 0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 13, color: "#aaa" }}>© 2026 AgenticLib. All rights reserved.</span>
          <span style={{ fontSize: 13, color: "#aaa", fontStyle: "italic" }}>Follow along as we build</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer[id="contact"] { padding: 60px 0 0 !important; }
          footer[id="contact"] > div { padding: 0 32px !important; }
          .footer-cols { grid-template-columns: 1fr 1fr !important; gap: 32px 24px !important; }
        }
        @media (max-width: 560px) {
          footer[id="contact"] { padding: 48px 0 0 !important; }
          footer[id="contact"] > div { padding: 0 20px !important; }
          .footer-cols { grid-template-columns: 1fr 1fr !important; gap: 28px 16px !important; padding-bottom: 36px !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
        }
      `}</style>
    </footer>
  );
}
