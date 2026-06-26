"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productExpanded, setProductExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative bg-white z-[999]" style={{ borderBottom: "1px solid #f0f0f0" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center">

        {/* LOGO */}
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }} className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="AgenticLib logo" className="h-6 w-auto" />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-semibold tracking-tight">AgenticLib</span>
            <span className="logo-tagline" style={{ fontSize: 10.5, fontWeight: 500, color: "#0E1320", letterSpacing: "0.01em", marginTop: 1 }}>Comparison Intelligence Platform</span>
          </div>
        </Link>

        {/* NAV */}
        <nav className="hidden md:flex items-center ml-10" style={{ gap: 36 }}>

          {/* Solutions mega dropdown */}
          <div className="relative group">
            <button
              className="transition px-3 py-1.5 rounded-lg flex items-center gap-1"
              style={{ fontSize: "15.5px", fontWeight: 400, color: "#18181b", background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
            >
              Solutions
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginTop: 1 }}>
                <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="absolute left-0 top-full pt-2 hidden group-hover:block" style={{ zIndex: 9999, minWidth: 880 }}>
              <div className="rounded-2xl" style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 20px 60px rgba(0,0,0,0.13), 0 4px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex" style={{ padding: "28px 8px 24px" }}>

                  {/* Left column */}
                  <div className="flex-1 px-6" style={{ borderRight: "1px solid #f0f0f4" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#18181b", textTransform: "uppercase", marginBottom: 12 }}>For Individuals / Businesses</p>
                    <div style={{ height: 1, background: "#f0f0f4", marginBottom: 16 }} />
                    {[
                      { label: "Sage", desc: "Get matched to the right agent instantly", href: "/product/recommendations",
                        icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.4 5 5.6.8-4 3.9.9 5.5L10 14.5l-4.9 2.7.9-5.5L2 7.8l5.6-.8L10 2z" fill="#5B4FCF"/></svg> },
                      { label: "Vera", desc: "Research and compare agents side by side in detail", href: "/product/research",
                        icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="6" height="12" rx="1.5" fill="#5B4FCF"/><rect x="12" y="3" width="6" height="14" rx="1.5" fill="#5B4FCF" fillOpacity=".5"/><path d="M9 10h2M9 10l-1.5-1.5M9 10l-1.5 1.5M11 10l1.5-1.5M11 10l1.5 1.5" stroke="#5B4FCF" strokeWidth="1.2" strokeLinecap="round"/></svg> },
                    ].map((item) => (
                      <a key={item.href} href={item.href} className="flex items-start gap-4 py-4 rounded-xl px-3" style={{ textDecoration: "none" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.04)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.08)" }}>{item.icon}</div>
                        <div className="flex flex-col">
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#18181b", lineHeight: 1.4 }}>{item.label} AI</span>
                          <span style={{ fontSize: 12.5, color: "#18181b", marginTop: 3, lineHeight: 1.5 }}>{item.desc}</span>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Right column */}
                  <div className="flex-1 px-6">
                    <Link href="/ai-agent-builders" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#18181b", textTransform: "uppercase", textDecoration: "none", marginBottom: 12 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#7C3AED"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#18181b"; }}>
                      For AI Agent Builders
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link>
                    <div style={{ height: 1, background: "#f0f0f4", marginBottom: 16 }} />
                    {[
                      { label: "Marketing", desc: "Track your marketing AI agent's features, visibility, and sentiment against competitors.", href: "/solutions/marketing",
                        icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 17V8l4-4h6l4 4v9H3z" stroke="#5B4FCF" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 17v-5h4v5" stroke="#5B4FCF" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
                      { label: "Skincare", desc: "Track your skincare AI agent's features, visibility, and sentiment against competitors.", href: "/solutions/skincare",
                        icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 3c0 0-5 3.5-5 8a5 5 0 0010 0c0-4.5-5-8-5-8z" stroke="#5B4FCF" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="10" cy="11" r="1.5" fill="#5B4FCF"/></svg> },
                    ].map((item) => (
                      <a key={item.href} href={item.href} className="flex items-start gap-4 py-4 rounded-xl px-3" style={{ textDecoration: "none" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.04)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.08)" }}>{item.icon}</div>
                        <div className="flex flex-col">
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#18181b", lineHeight: 1.4 }}>{item.label}</span>
                          <span style={{ fontSize: 12.5, color: "#18181b", marginTop: 3, lineHeight: 1.5 }}>{item.desc}</span>
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
              className="transition px-3 py-1.5 rounded-lg flex items-center gap-1"
              style={{ fontSize: "15.5px", fontWeight: 400, color: "#18181b", background: "none", border: "none", cursor: "pointer" }}
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
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#18181b", lineHeight: 1.3 }}>Blog</span>
                    <span style={{ fontSize: 11.5, color: "#18181b", marginTop: 2 }}>Insights, guides and updates</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "#d1d5db" }}><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link href="/explore" className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors" style={{ textDecoration: "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#f8f8ff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#16a34a,#4ade80)" }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity=".9"/><rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity=".6"/><rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity=".6"/><rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity=".9"/></svg>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#18181b", lineHeight: 1.3 }}>AI Agent Library</span>
                    <span style={{ fontSize: 11.5, color: "#18181b", marginTop: 2 }}>Browse all agents across every domain</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "#d1d5db" }}><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <Link
            href="/#contact"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="transition px-3 py-1.5 rounded-lg"
            style={{ fontSize: "15.5px", fontWeight: 400, color: "#18181b", textDecoration: "none" }}
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="1.8" rx="0.9" fill="#18181b"/><rect x="3" y="9.1" width="14" height="1.8" rx="0.9" fill="#18181b"/><rect x="3" y="13.2" width="14" height="1.8" rx="0.9" fill="#18181b"/></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          <button
            onClick={() => setProductExpanded((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-zinc-700 hover:bg-gray-50 transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
          >
            <span>Solutions</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: productExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
              <path d="M3 5l4 4 4-4" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {productExpanded && (
            <div style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
              {[
                { label: "Sage AI", href: "/product/recommendations" },
                { label: "Vera AI", href: "/product/research" },
                { label: "Marketing", href: "/solutions/marketing" },
                { label: "Skincare", href: "/solutions/skincare" },
              ].map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className="block pl-8 pr-5 py-3 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-gray-100 transition-colors"
                  style={{ textDecoration: "none", borderBottom: "1px solid #f0f0f0" }}>
                  {item.label}
                </a>
              ))}
            </div>
          )}
          {[
            { label: "Blog", href: "/blog" },
            { label: "AI Agent Library", href: "/explore" },
            { label: "Contact Us", href: "/#contact" },
          ].map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium text-zinc-700 hover:bg-gray-50 transition-colors"
              style={{ textDecoration: "none", borderBottom: "1px solid #f3f4f6" }}>
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
