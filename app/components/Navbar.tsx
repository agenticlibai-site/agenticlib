"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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
