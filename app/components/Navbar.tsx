"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SOLUTIONS } from "@/app/solutions/_shared/solutions";

// Simple line icons for the Solutions dropdown, keyed by solution slug
const iconProps = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const SOLUTION_ICONS: Record<string, React.ReactNode> = {
  // shield
  "insurance-ai": <svg {...iconProps}><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" /></svg>,
  // bar chart
  "finance-ai": <svg {...iconProps}><path d="M4 20h16" /><path d="M7 16v-5" /><path d="M12 16V7" /><path d="M17 16v-8" /></svg>,
  // trending line
  "sales-ai": <svg {...iconProps}><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>,
  // scales
  "legal-ai": <svg {...iconProps}><path d="M12 4v16" /><path d="M8 20h8" /><path d="M5 7h14" /><path d="M5 7l-3 6a3 3 0 006 0z" /><path d="M19 7l-3 6a3 3 0 006 0z" /></svg>,
  // wrench
  // tooth
  "dental-ai": <svg {...iconProps}><path d="M7 3c-2.5 0-4 2-4 4.5 0 2 1 3.5 1.5 5.5.5 2.5 1 8 3 8 1.5 0 1.5-5 4.5-5s3 5 4.5 5c2 0 2.5-5.5 3-8 .5-2 1.5-3.5 1.5-5.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z" /></svg>,
  // play
  "video-ai": <svg {...iconProps}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.5v5l4.5-2.5z" /></svg>,
  "trades-ai": <svg {...iconProps}><path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" /></svg>,
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close the Solutions dropdown on outside click or Escape
  useEffect(() => {
    if (!solutionsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!solutionsRef.current?.contains(e.target as Node)) setSolutionsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSolutionsOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [solutionsOpen]);

  return (
    <>
      <style>{`
        /* ── Desktop: floating pill ── */
        @media (min-width: 768px) {
          .nb-outer {
            background: transparent !important;
            border-bottom: none !important;
            padding: 0 24px !important;
            position: fixed !important;
            top: 14px !important;
            left: 0 !important;
            right: 0 !important;
            display: flex !important;
            justify-content: center !important;
            pointer-events: none;
          }
          .nb-pill {
            pointer-events: auto;
            width: fit-content !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            height: 64px !important;
            padding: 0 8px 0 28px !important;
            background: rgba(250, 249, 249, 0.97) !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(0,0,0,0.04) !important;
            border-radius: 999px !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04) !important;
            position: relative !important;
          }
          .nb-tagline  { display: none !important; }
          .nb-nav      {
            margin-left: 28px !important;
            gap: 6px !important;
          }
          .nb-link     { font-size: 15.5px !important; font-weight: 400 !important; color: #2b2b2b !important; padding: 8px 16px !important; border-radius: 999px !important; white-space: nowrap !important; }
          .nb-link:hover { background: rgba(0,0,0,0.05) !important; }
          .nb-cta      { margin-left: 22px !important; }
          .nb-cta .btn-accent { border-radius: 999px !important; padding: 13px 26px !important; font-size: 15.5px !important; font-weight: 500 !important; }
        }

        /* ── Solutions dropdown ── */
        .nb-sol { position: relative; }
        .nb-sol-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; font: inherit; color: inherit; }
        .nb-sol-btn:hover { background: rgba(0,0,0,0.05); }
        .nb-sol-panel { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); padding-top: 12px; z-index: 1000; }
        .nb-sol-menu { width: 300px; background: #fff; border: 1px solid rgba(0,0,0,0.07); border-radius: 20px; padding: 8px; box-shadow: 0 24px 48px -12px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.04); animation: nb-sol-in 0.14s ease-out; }
        .nb-sol-list { padding: 4px 2px 6px; }
        .nb-sol-icon { width: 36px; height: 36px; flex-shrink: 0; border-radius: 10px; background: #FFF1EC; color: #E8604A; display: flex; align-items: center; justify-content: center; transition: background 0.15s, color 0.15s; }
        .nb-sol-item:hover .nb-sol-icon, .nb-sol-item:focus-visible .nb-sol-icon { background: #FF8A73; color: #000; }
        .nb-sol-left { display: flex; align-items: center; gap: 14px; }
        @keyframes nb-sol-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .nb-sol-menu { animation: none; } }
        .nb-sol-label { display: block; padding: 10px 12px 8px; font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #8A867F; }
        .nb-sol-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 8px 8px; border-radius: 12px; text-decoration: none; color: #1a1a1a; transition: background 0.15s; }
        .nb-sol-item:hover, .nb-sol-item:focus-visible { background: #FBF8F3; outline: none; }
        .nb-sol-name { font-size: 15px; font-weight: 500; }
        .nb-sol-arrow { color: #E8604A; opacity: 0; transform: translateX(-4px); transition: opacity 0.15s, transform 0.15s; }
        .nb-sol-item:hover .nb-sol-arrow, .nb-sol-item:focus-visible .nb-sol-arrow { opacity: 1; transform: none; }

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
            <div className="flex flex-col leading-none">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src="/logo.png" alt="FeatureStream logo" className="h-6 w-auto" />
                <span style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif", fontSize: 25, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1 }}>FeatureStream</span>
              </div>
            </div>
          </Link>

          {/* NAV */}
          <nav className="nb-nav hidden md:flex items-center ml-10">

            {/* Product: scrolls to the Feature Selection card on the homepage */}
            <Link
              href="/#product"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  document.getElementById("product")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="nb-link transition"
              style={{ textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
            >
              Product
            </Link>

            {/* Solutions dropdown */}
            <div
              ref={solutionsRef}
              className="nb-sol"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button
                type="button"
                className="nb-link nb-sol-btn transition"
                aria-haspopup="true"
                aria-expanded={solutionsOpen}
                onClick={() => setSolutionsOpen((o) => !o)}
              >
                Solutions
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ transform: solutionsOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                  <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {solutionsOpen && (
                <div className="nb-sol-panel">
                  <div className="nb-sol-menu" role="menu">
                    <div className="nb-sol-list">
                      <span className="nb-sol-label" aria-hidden="true">By industry</span>
                      {SOLUTIONS.map((s) => (
                        <Link key={s.slug} href={`/solutions/${s.slug}`} role="menuitem" className="nb-sol-item" onClick={() => setSolutionsOpen(false)}>
                          <span className="nb-sol-left">
                            <span className="nb-sol-icon" aria-hidden="true">{SOLUTION_ICONS[s.slug]}</span>
                            <span className="nb-sol-name">{s.navLabel}</span>
                          </span>
                          <svg className="nb-sol-arrow" width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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

          {/* CTA — desktop only */}
          <div className="nb-cta hidden md:block">
            <Link href="/#contact" className="btn-accent" style={{ padding: "11px 18px", fontSize: 14.5 }}>
              Get started
            </Link>
          </div>

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
          <div className="md:hidden mt-2 rounded-2xl overflow-hidden" style={{ margin: "8px 12px 12px", background: "white", border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
            <Link href="/#product" onClick={() => setMobileOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
              style={{ textDecoration: "none", borderBottom: "1px solid #f3f4f6" }}>
              Product
            </Link>
            <div className="px-5 pt-3.5 pb-1 text-sm font-medium text-black">Solutions</div>
            {SOLUTIONS.map((s) => (
              <Link key={s.slug} href={`/solutions/${s.slug}`} onClick={() => setMobileOpen(false)}
                className="block pl-9 pr-5 py-2.5 text-sm text-black hover:bg-gray-50 transition-colors"
                style={{ textDecoration: "none", color: "#55524C" }}>
                {s.navLabel}
              </Link>
            ))}
            <div style={{ borderBottom: "1px solid #f3f4f6", marginTop: 6 }} />
            <Link href="/company" onClick={() => setMobileOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
              style={{ textDecoration: "none", borderBottom: "1px solid #f3f4f6" }}>
              Company
            </Link>

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
