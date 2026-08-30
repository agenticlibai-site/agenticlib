"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productExpanded, setProductExpanded] = useState(false);
  const [resourcesExpanded, setResourcesExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <style>{`
        /* ── Desktop: floating pill ── */
        @media (min-width: 768px) {
          .nb-outer {
            background: transparent !important;
            border-bottom: none !important;
            padding: 12px 24px !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            display: flex !important;
            justify-content: center !important;
          }
          .nb-pill {
            width: fit-content !important;
            max-width: calc(100vw - 48px) !important;
            margin: 0 !important;
            padding: 7px 20px !important;
            background: rgba(255,255,255,0.62) !important;
            border-radius: 100px !important;
            border: 1px solid rgba(255,255,255,0.55) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8) !important;
            backdrop-filter: blur(24px) saturate(1.6) !important;
            -webkit-backdrop-filter: blur(24px) saturate(1.6) !important;
            position: relative !important;
          }
          .nb-tagline  { display: none !important; }
          .nb-nav      {
            margin-left: 20px !important;
            gap: 0px !important;
          }
          .nb-link     { font-size: 15px !important; font-weight: 400 !important; color: #1a1a1a !important; padding: 6px 18px !important; border-radius: 100px !important; white-space: nowrap !important; }
          .nb-link:hover { background: rgba(0,0,0,0.05) !important; }
        }

        /* ── Mobile: original full-width style ── */
        @media (max-width: 767px) {
          .nb-outer {
            background: white !important;
            border-bottom: 1px solid #f0f0f0 !important;
            padding: 0 !important;
            position: relative !important;
          }
          .nb-pill {
            max-width: 100% !important;
            padding: 12px 16px !important;
            background: transparent !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
        }
      `}</style>

      <header className="nb-outer relative bg-white z-[999]" style={{ borderBottom: "1px solid #f0f0f0" }}>
        <div className="nb-pill max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center">

          {/* LOGO */}
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }} className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="AgenticLib logo" className="h-6 w-auto" />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-semibold tracking-tight">AgenticLib</span>
              <span className="logo-tagline nb-tagline" style={{ fontSize: 10.5, fontWeight: 500, color: "#000000", letterSpacing: "0.01em", marginTop: 1 }}>Comparison Intelligence Platform</span>
            </div>
          </Link>

          {/* NAV */}
          <nav className="nb-nav hidden md:flex items-center ml-10">

            {/* Platform */}
            <Link
              href="/sage"
              className="nb-link transition"
              style={{ textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
            >
              Platform
            </Link>

            {/* Solutions mega dropdown */}
            <div className="relative group">
              <button
                className="nb-link transition flex items-center gap-1"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
              >
                Solutions
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginTop: 1 }}>
                  <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="absolute left-0 top-full pt-2 hidden group-hover:block" style={{ zIndex: 9999, width: 500 }}>
                <div className="rounded-2xl" style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.13), 0 4px 12px rgba(0,0,0,0.06)" }}>
                  <div className="flex" style={{ padding: "28px 8px 24px" }}>

                    <div className="flex-1 px-6">
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#000000", textTransform: "uppercase", marginBottom: 12 }}>For AI Agent Builders</p>
                      <div style={{ height: 1, background: "#f0f0f4", marginBottom: 16 }} />
                      {[
                        { label: "Marketing", desc: "Visibility & sentiment tracking for marketing AI agents.", href: "/solutions/marketing",
                          iconBg: "linear-gradient(135deg,#e11d48,#f43f5e)",
                          icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M2.5 10.5L10 3.5l7.5 7" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.5 8.5V16.5h4v-3.5h3v3.5h4V8.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                        { label: "Skincare", desc: "Visibility & sentiment tracking for skincare AI agents.", href: "/solutions/skincare",
                          iconBg: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                          icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2.5C10 2.5 4 8.5 4 13a6 6 0 0012 0c0-4.5-6-10.5-6-10.5z" stroke="white" strokeWidth="1.7" strokeLinejoin="round" fill="rgba(255,255,255,0.18)"/><circle cx="10" cy="13.5" r="1.5" fill="white" opacity="0.8"/></svg> },
                        { label: "Sales", desc: "Visibility & sentiment tracking for sales AI agents.", href: "/solutions/sales",
                          iconBg: "linear-gradient(135deg,#2563eb,#60a5fa)",
                          icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><polyline points="2.5,15.5 7.5,9 12,12.5 17.5,4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14,4.5 17.5,4.5 17.5,8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                        { label: "Legal", desc: "Visibility & sentiment tracking for legal AI agents.", href: "/solutions/legal",
                          iconBg: "linear-gradient(135deg,#059669,#10b981)",
                          icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2v16M7 17.5h6" stroke="white" strokeWidth="1.7" strokeLinecap="round"/><path d="M4 7.5c0 0 1.5-3 3-3s3 3 3 3-1.5 2-3 2-3-2-3-2z" stroke="white" strokeWidth="1.4" fill="rgba(255,255,255,0.18)" strokeLinejoin="round"/><path d="M10 7.5c0 0 1.5-3 3-3s3 3 3 3-1.5 2-3 2-3-2-3-2z" stroke="white" strokeWidth="1.4" fill="rgba(255,255,255,0.18)" strokeLinejoin="round"/></svg> },
                        { label: "Insurance Broker (Finance)", desc: "Visibility & sentiment tracking for insurance broker AI agents.", href: "/product/ralfi-visibility/login",
                          iconBg: "linear-gradient(135deg,#0d9488,#14b8a6)",
                          icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L3.5 5.5V10c0 4.5 3 7.5 6.5 8.5 3.5-1 6.5-4 6.5-8.5V5.5L10 2z" stroke="white" strokeWidth="1.6" fill="rgba(255,255,255,0.18)" strokeLinejoin="round"/><polyline points="7,10 9.5,12.5 13.5,7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                      ].map((item) => (
                        <a key={item.href} href={item.href} className="flex items-start gap-4 py-4 rounded-xl px-3" style={{ textDecoration: "none" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.04)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.iconBg }}>{item.icon}</div>
                          <div className="flex flex-col">
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#000000", lineHeight: 1.4 }}>{item.label}</span>
                            <span style={{ fontSize: 12.5, color: "#000000", marginTop: 3, lineHeight: 1.5 }}>{item.desc}</span>
                          </div>
                        </a>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Resources dropdown */}
            <div className="relative group">
              <button
                className="nb-link transition flex items-center gap-1"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
              >
                Resources
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginTop: 1 }}>
                  <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="absolute left-0 top-full pt-2 hidden group-hover:block" style={{ zIndex: 9999, minWidth: 340 }}>
                <div className="rounded-2xl p-2" style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 16px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}>
                  <Link href="/blog" className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors" style={{ textDecoration: "none" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#f8f8ff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="2.5" rx="1.25" fill="white"/><rect x="3" y="8.5" width="10" height="2.5" rx="1.25" fill="white" fillOpacity=".8"/><rect x="3" y="13" width="7" height="2.5" rx="1.25" fill="white" fillOpacity=".6"/></svg>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#000000", lineHeight: 1.3 }}>Blog</span>
                      <span style={{ fontSize: 11.5, color: "#000000", marginTop: 2 }}>Insights, guides and updates</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "#d1d5db" }}><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Company */}
            <Link
              href="/company"
              className="nb-link transition"
              style={{ textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
            >
              Company
            </Link>

            {/* Pricing */}
            <Link
              href="/#pricing"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="nb-link transition"
              style={{ textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
            >
              Pricing
            </Link>

            {/* Contact Us */}
            <Link
              href="/#contact"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="nb-link transition"
              style={{ textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
            >
              Contact Us
            </Link>

          </nav>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden ml-auto flex flex-col justify-center items-center gap-1.5 p-2 rounded-lg"
            style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="#000000" strokeWidth="1.8" strokeLinecap="round"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="1.8" rx="0.9" fill="#000000"/><rect x="3" y="9.1" width="14" height="1.8" rx="0.9" fill="#000000"/><rect x="3" y="13.2" width="14" height="1.8" rx="0.9" fill="#000000"/></svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-2 rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
            <button
              onClick={() => setProductExpanded((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
            >
              <span>Solutions</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: productExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <path d="M3 5l4 4 4-4" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {productExpanded && (
              <div style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#000000", textTransform: "uppercase", padding: "10px 20px 6px", margin: 0 }}>For AI Agent Builders</p>
                {[
                  { label: "Marketing", href: "/solutions/marketing" },
                  { label: "Skincare", href: "/solutions/skincare" },
                  { label: "Sales", href: "/solutions/sales" },
                  { label: "Legal", href: "/solutions/legal" },
                  { label: "Insurance Broker (Finance)", href: "/product/ralfi-visibility/login" },
                ].map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className="block pl-8 pr-5 py-3 text-sm text-black hover:text-black hover:bg-gray-100 transition-colors"
                    style={{ textDecoration: "none", borderBottom: "1px solid #f0f0f0" }}>
                    {item.label}
                  </a>
                ))}
              </div>
            )}
            <button
              onClick={() => setResourcesExpanded((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
            >
              <span>Resources</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: resourcesExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <path d="M3 5l4 4 4-4" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {resourcesExpanded && (
              <div style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                {[
                  { label: "Blog", href: "/blog" },
                ].map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className="block pl-8 pr-5 py-3 text-sm text-black hover:text-black hover:bg-gray-100 transition-colors"
                    style={{ textDecoration: "none", borderBottom: "1px solid #f0f0f0" }}>
                    {item.label}
                  </a>
                ))}
              </div>
            )}
            <Link href="/sage" onClick={() => setMobileOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
              style={{ textDecoration: "none", borderBottom: "1px solid #f3f4f6" }}>
              Platform
            </Link>
            <Link href="/company" onClick={() => setMobileOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
              style={{ textDecoration: "none", borderBottom: "1px solid #f3f4f6" }}>
              Company
            </Link>
            <a href="/#pricing" onClick={() => setMobileOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
              style={{ textDecoration: "none", borderBottom: "1px solid #f3f4f6" }}>
              Pricing
            </a>
            <a href="/#contact" onClick={() => setMobileOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
              style={{ textDecoration: "none", borderBottom: "1px solid #f3f4f6" }}>
              Contact Us
            </a>
          </div>
        )}
      </header>
    </>
  );
}
