"use client";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer id="contact" className="site-footer" style={{ background: "transparent", padding: "80px 160px 28px" }}>
      {/* Rounded card */}
      <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(224,213,255,0.70) 45%, rgba(253,220,240,0.75) 100%)", backdropFilter: "blur(48px) saturate(200%)", WebkitBackdropFilter: "blur(48px) saturate(200%)", borderRadius: 24, padding: "40px 44px 28px", border: "none", boxShadow: "0 32px 80px rgba(108,76,241,0.28), 0 8px 24px rgba(236,72,153,0.18), 0 2px 6px rgba(108,76,241,0.10)" }}>

        {/* Columns */}
        <div className="footer-cols" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr 1fr", gap: 32, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <img src="/logo.png" alt="AgenticLib" style={{ height: 32, width: "auto", objectFit: "contain" }} />
              <span style={{ fontSize: 18, fontWeight: 700, color: "#0F0B1E", letterSpacing: "-0.01em" }}>AgenticLib</span>
            </div>
            <p style={{ fontSize: 14, color: "#000", lineHeight: 1.6, margin: 0, maxWidth: 200 }}>
              Helping all AI Agent builders succeed.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 14, marginTop: 0 }}>Platform</p>
            {[
              { label: "Sage AI", href: "/#sage" },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{ display: "block", fontSize: 15, color: "#000", textDecoration: "none", marginBottom: 9 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6C4CF1"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#000"; }}>
                {label}
              </a>
            ))}
          </div>

          {/* Pricing */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 14, marginTop: 0 }}>Pricing</p>
            <a href="/#pricing" style={{ display: "block", fontSize: 15, color: "#000", textDecoration: "none", marginBottom: 9 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6C4CF1"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#000"; }}>
              Pricing
            </a>
          </div>

          {/* Company */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 14, marginTop: 0 }}>Company</p>
            {[
              { label: "Mission", href: "/company" },
              { label: "Blog",    href: "/blog" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ display: "block", fontSize: 15, color: "#000", textDecoration: "none", marginBottom: 9 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6C4CF1"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#000"; }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 14, marginTop: 0 }}>Legal</p>
            {[
              { label: "Privacy Policy",    href: "/privacy" },
              { label: "Terms & Conditions", href: "/terms" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ display: "block", fontSize: 15, color: "#000", textDecoration: "none", marginBottom: 9 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6C4CF1"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#000"; }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 14, marginTop: 0 }}>Connect</p>
            {[
              { label: "LinkedIn",     href: "https://www.linkedin.com/company/108024233/" },
              { label: "X / Twitter",  href: "https://x.com/AgenticLibAI/status/1960527278087266557" },
              { label: "Email",        href: "mailto:srinidhi.murali@agenticlib.com" },
              { label: "Product Hunt", href: "https://www.producthunt.com/p/self-promotion/agenticlib-simplifying-your-ai-agent-discovery-journey" },
              { label: "Reddit",       href: "https://www.reddit.com/r/SideProject/comments/1m6bfy1/agenticlib_simplifying_your_ai_agent_discovery/" },
            ].map(({ label, href }) => (
              <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer"
                style={{ display: "block", fontSize: 15, color: "#000", textDecoration: "none", marginBottom: 9 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6C4CF1"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#000"; }}>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, color: "#000" }}>&copy; 2026 AgenticLib. All rights reserved.</span>
          <span style={{ fontSize: 14, color: "#000000", fontStyle: "italic" }}>Follow along as we build</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .site-footer { padding: 40px 24px 24px !important; }
        }
        @media (max-width: 768px) {
          .site-footer { padding: 32px 16px 20px !important; }
          .site-footer > div > .footer-cols { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
          .site-footer > div { padding: 32px 24px 24px !important; }
        }
        @media (max-width: 480px) {
          .site-footer { padding: 24px 12px 16px !important; }
          .site-footer > div { padding: 24px 20px 20px !important; border-radius: 16px !important; }
          .site-footer > div > .footer-cols { grid-template-columns: 1fr 1fr !important; gap: 20px 16px !important; margin-bottom: 24px !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 6px !important; }
          .footer-bottom span { font-size: 13px !important; }
        }
      `}</style>
    </footer>
  );
}
