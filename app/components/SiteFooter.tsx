"use client";
import Link from "next/link";

function NavLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const props = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const Tag = href.startsWith("/") ? Link : "a";
  return (
    <Tag
      href={href}
      {...props}
      style={{ display: "block", fontSize: 15, color: "#000", textDecoration: "none", marginBottom: 10, transition: "color 0.15s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#55524C"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#000"; }}
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
        padding: "40px 48px 0",
      }}
    >
      {/* Rounded card — light lavender, extends flush to bottom */}
      <div style={{
        background: "#F6F5F2",
        borderRadius: "24px 24px 0 0",
        padding: "48px 64px 0",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>

          {/* ── CTA ───────────────────────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
              fontSize: "clamp(48px, 8vw, 112px)",
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              margin: 0,
              paddingBottom: "0.12em",
              color: "#000",
            }}>
              FeatureStream
            </h2>
          </div>

          {/* ── Columns ───────────────────────────────────────────────────── */}
          <div className="footer-cols" style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 1fr 1fr 1fr",
            gap: 40,
            paddingBottom: 32,
          }}>

            {/* Brand */}
            <div className="footer-brand">
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <img src="/logo.png" alt="FeatureStream" style={{ height: 28, width: "auto", objectFit: "contain" }} />
                <span style={{ fontSize: 17, fontWeight: 800, color: "#000", letterSpacing: "-0.02em" }}>FeatureStream</span>
              </div>
              <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 20px", maxWidth: 220 }}>
                Helping AI agent builders succeed.
              </p>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                {[
                  { href: "https://www.linkedin.com/company/108024233/", icon: "in" },
                  { href: "https://x.com/FeatureStreamAI/status/1960527278087266557", icon: "𝕏" },
                ].map(({ href, icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "#000",
                      textDecoration: "none", transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent-hover)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)"; }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0F0B1E", marginBottom: 16, marginTop: 0 }}>Product</p>
              <NavLink href="/#pricing">Pricing</NavLink>
            </div>

            {/* Company */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0F0B1E", marginBottom: 16, marginTop: 0 }}>Company</p>
              <NavLink href="/company">Mission</NavLink>
              <NavLink href="/privacy">Privacy policy</NavLink>
              <NavLink href="/terms">Terms &amp; conditions</NavLink>
            </div>

            {/* Connect */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0F0B1E", marginBottom: 16, marginTop: 0 }}>Connect</p>
              <NavLink href="mailto:srinidhi.murali@featstream.com">Email us</NavLink>
              <NavLink href="https://www.linkedin.com/company/108024233/" external>LinkedIn</NavLink>
              <NavLink href="https://x.com/FeatureStreamAI/status/1960527278087266557" external>X / Twitter</NavLink>
            </div>
          </div>

          {/* ── Bottom bar ────────────────────────────────────────────────── */}
          <div className="footer-bottom" style={{
            borderTop: "1px solid rgba(0,0,0,0.10)",
            padding: "20px 0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 13, color: "#000" }}>© 2026 FeatureStream. All rights reserved.</span>
              <span style={{ fontSize: 12, color: "#000" }}>Sydney, Australia</span>
            </div>
            <span style={{ fontSize: 13, color: "#000", fontStyle: "italic" }}>Follow along as we build</span>
          </div>
        </div>
      </div>

      <style>{`
        /* Tablet */
        @media (max-width: 860px) {
          footer[id="contact"] { padding: 40px 20px 0 !important; }
          footer[id="contact"] > div { padding: 48px 32px 0 !important; }
          .footer-cols {
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 28px 20px !important;
          }
          .footer-brand { grid-column: 1 / -1 !important; }
        }
        /* Phone */
        @media (max-width: 560px) {
          footer[id="contact"] {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          footer[id="contact"] > div {
            padding: 32px 20px 0 !important;
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          footer[id="contact"] > div > div > div:first-child h2 {
            font-size: 32px !important;
          }
          .footer-cols {
            grid-template-columns: 1fr !important;
            gap: 28px 0 !important;
            padding-bottom: 24px !important;
          }
          .footer-brand {
            grid-column: 1 / -1 !important;
            margin-bottom: 0 !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
            padding: 16px 0 28px !important;
          }
        }
      `}</style>
    </footer>
  );
}
