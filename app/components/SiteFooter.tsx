"use client";
import Link from "next/link";

const PURPLE = "#6C4CF1";

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
        background: "transparent",
        padding: "72px 0 0",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 48px" }}>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 800,
            color: "#0F0B1E",
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            margin: "0 0 14px",
            textWrap: "balance" as never,
          }}>
            Build AI agent visibility<br />before your competitors do.
          </h2>
          <p style={{
            fontSize: 16,
            color: "#666",
            margin: "0 auto 32px",
            maxWidth: 400,
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
              padding: "14px 32px",
              borderRadius: 999,
              fontSize: 15,
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
          paddingBottom: 40,
        }}>

          {/* Brand */}
          <div className="footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <img src="/logo.png" alt="AgenticLib" style={{ height: 26, width: "auto", objectFit: "contain" }} />
              <span style={{ fontSize: 16, fontWeight: 800, color: "#0F0B1E", letterSpacing: "-0.02em" }}>AgenticLib</span>
            </div>
            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.65, margin: "0 0 18px", maxWidth: 200 }}>
              Helping AI agent builders succeed.
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(108,76,241,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: PURPLE,
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
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0F0B1E", marginBottom: 14, marginTop: 0 }}>Product</p>
            <NavLink href="/#sage">Sage AI</NavLink>
            <NavLink href="/#pricing">Pricing</NavLink>
            <NavLink href="/explore">Explore agents</NavLink>
          </div>

          {/* Company */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0F0B1E", marginBottom: 14, marginTop: 0 }}>Company</p>
            <NavLink href="/company">Mission</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/privacy">Privacy policy</NavLink>
            <NavLink href="/terms">Terms &amp; conditions</NavLink>
          </div>

          {/* Connect */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0F0B1E", marginBottom: 14, marginTop: 0 }}>Connect</p>
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
          padding: "18px 0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: "#bbb" }}>© 2026 AgenticLib. All rights reserved.</span>
          <span style={{ fontSize: 12, color: "#bbb", fontStyle: "italic" }}>Follow along as we build</span>
        </div>
      </div>

      <style>{`
        /* ── Tablet ── */
        @media (max-width: 860px) {
          footer[id="contact"] { padding: 56px 0 0 !important; }
          footer[id="contact"] > div { padding: 0 32px !important; }
          .footer-cols {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px 28px !important;
          }
          .footer-brand { grid-column: 1 / -1; }
        }
        /* ── Phone ── */
        @media (max-width: 560px) {
          footer[id="contact"] { padding: 44px 0 0 !important; }
          footer[id="contact"] > div { padding: 0 20px !important; }
          footer[id="contact"] > div > div:first-child { margin-bottom: 44px !important; }
          footer[id="contact"] > div > div:first-child h2 { font-size: 26px !important; }
          footer[id="contact"] > div > div:first-child p  { font-size: 14px !important; }
          .footer-cols {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px 20px !important;
            padding-bottom: 32px !important;
          }
          .footer-brand { grid-column: 1 / -1; }
          .footer-bottom {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
            padding: 16px 0 20px !important;
          }
        }
      `}</style>
    </footer>
  );
}
