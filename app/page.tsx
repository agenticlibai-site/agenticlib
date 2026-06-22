"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Share2, Mail, X as XIcon, ArrowUp, MessageCircle } from "lucide-react";

const SHARED_SUB = "Get agent recommendations matched to your specific workflows, backed by the comparison analytics.";

const HERO_STATES = [
  {
    pill: "AI Agent Builders",
    sub: "Give product, engineering, and marketing teams an edge with hands-on intelligence on where your product features lead and what you can build next.",
    cta: true,
    duration: 10000,
  },
  { pill: "Individuals",  sub: SHARED_SUB, cta: false, duration: 7000 },
  { pill: "Businesses",   sub: SHARED_SUB, cta: false, duration: 7000 },
] as const;
export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productExpanded, setProductExpanded] = useState(false);
  const videoPlayedRef = useRef(false);
  const [stateIdx, setStateIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(
      () => setStateIdx((i) => (i + 1) % HERO_STATES.length),
      HERO_STATES[stateIdx].duration,
    );
    return () => clearTimeout(t);
  }, [stateIdx]);

  const handleVideoPlay = () => {
    if (videoPlayedRef.current) return;
    videoPlayedRef.current = true;
    fetch("/api/notify-play", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "Homepage" }) }).catch(() => {});
  };
  const pathname = usePathname();

  return (
    <div className="page-bg relative text-zinc-900 font-sans">

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full" style={{ background: "rgba(147,197,253,0.10)", filter: "blur(100px)" }} />
        <div className="absolute -top-32 -right-48 w-[560px] h-[560px] rounded-full" style={{ background: "rgba(167,139,250,0.10)", filter: "blur(100px)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full" style={{ background: "rgba(249,168,212,0.07)", filter: "blur(90px)" }} />
      </div>

      {/* NAVBAR */}
      <header className="relative bg-white z-[999]" style={{ borderBottom: "1px solid #f0f0f0" }}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center">

          {/* LOGO */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="AgenticLib logo" className="h-6 w-auto" />
            <span className="text-lg font-semibold tracking-tight">AgenticLib</span>
          </div>

          {/* NAV — left, close to logo */}
          <nav className="hidden md:flex items-center ml-10" style={{ gap: 36 }}>

  {/* Product dropdown */}
  <div className="relative group">
    <button
      className="transition px-3 py-1.5 rounded-lg flex items-center gap-1"
      style={{ fontSize: "15.5px", fontWeight: 400, color: "#18181b", background: "none", border: "none", cursor: "pointer" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
    >
      Product
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginTop: 1 }}>
        <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
    {/* Dropdown */}
    <div className="absolute left-0 top-full pt-2 hidden group-hover:block" style={{ zIndex: 9999, minWidth: 380 }}>
      <div className="rounded-2xl p-2" style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 16px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}>
        {[
          { label: "Sage – AI Agent Recommendations", href: "/product/recommendations", desc: "Get matched to the right agent instantly", iconBg: "linear-gradient(135deg,#7c3aed,#a78bfa)", icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.4 5 5.6.8-4 3.9.9 5.5L10 14.5l-4.9 2.7.9-5.5L2 7.8l5.6-.8L10 2z" fill="white"/></svg>
          )},
          { label: "Vera – Research & Compare", href: "/product/research", desc: "Compare agents side by side in detail", iconBg: "linear-gradient(135deg,#2563eb,#60a5fa)", icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="6" height="12" rx="1.5" fill="white" fillOpacity=".9"/><rect x="12" y="3" width="6" height="14" rx="1.5" fill="white" fillOpacity=".6"/><path d="M9 10h2M9 10l-1.5-1.5M9 10l-1.5 1.5M11 10l1.5-1.5M11 10l1.5 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
          )},
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors group/item"
            style={{ textDecoration: "none" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#f8f8ff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: item.iconBg }}>
              {item.icon}
            </div>
            <div className="flex flex-col flex-1">
              <span style={{ fontSize: 13, fontWeight: 600, color: "#18181b", lineHeight: 1.3 }}>{item.label}</span>
              <span style={{ fontSize: 11.5, color: "#18181b", marginTop: 2 }}>{item.desc}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "#d1d5db" }}>
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        ))}
      </div>
    </div>
  </div>

  {/* Solutions — plain link, no dropdown */}
  <Link
    href="/#how-it-works"
    className="transition px-3 py-1.5 rounded-lg"
    style={{ fontSize: "15.5px", fontWeight: 400, color: "#18181b" }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.05)"; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
  >
    Solutions
  </Link>

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
        <Link
          href="/blog"
          className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors"
          style={{ textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#f8f8ff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
        >
          <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="2.5" rx="1.25" fill="white"/>
              <rect x="3" y="8.5" width="10" height="2.5" rx="1.25" fill="white" fillOpacity=".8"/>
              <rect x="3" y="13" width="7" height="2.5" rx="1.25" fill="white" fillOpacity=".6"/>
            </svg>
          </div>
          <div className="flex flex-col flex-1">
            <span style={{ fontSize: 13, fontWeight: 600, color: "#18181b", lineHeight: 1.3 }}>Blog</span>
            <span style={{ fontSize: 11.5, color: "#18181b", marginTop: 2 }}>Insights, guides and updates</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "#d1d5db" }}>
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <Link
          href="/explore"
          className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors"
          style={{ textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#f8f8ff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
        >
          <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#16a34a,#4ade80)" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity=".9"/><rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity=".6"/><rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity=".6"/><rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity=".9"/></svg>
          </div>
          <div className="flex flex-col flex-1">
            <span style={{ fontSize: 13, fontWeight: 600, color: "#18181b", lineHeight: 1.3 }}>AI Agent Library</span>
            <span style={{ fontSize: 11.5, color: "#18181b", marginTop: 2 }}>Browse all agents across every domain</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: "#d1d5db" }}>
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
    style={{ fontSize: "15.5px", fontWeight: 400, color: "#18181b" }}
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
            {/* Product accordion */}
            <button
              onClick={() => setProductExpanded((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-zinc-700 hover:bg-gray-50 transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
            >
              <span>Product</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: productExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <path d="M3 5l4 4 4-4" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {productExpanded && (
              <div style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                {[
                  { label: "Sage – AI Agent Recommendations", href: "/product/recommendations" },
                  { label: "Vera – Research & Compare", href: "/product/research" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block pl-8 pr-5 py-3 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-gray-100 transition-colors"
                    style={{ textDecoration: "none", borderBottom: "1px solid #f0f0f0" }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
            {/* Top-level links */}
            {[
              { label: "Solutions", href: "/#how-it-works" },
              { label: "Blog", href: "/blog" },
              { label: "AI Agent Library", href: "/explore" },
              { label: "Contact Us", href: "/#contact" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-5 py-3.5 text-sm font-medium text-zinc-700 hover:bg-gray-50 transition-colors"
                style={{ textDecoration: "none", borderBottom: "1px solid #f3f4f6" }}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main className="relative z-0">

        {/* ── HERO ───────────────────────────────────────────── */}
        <div style={{ margin: "16px 32px 0", borderRadius: "32px 32px 0 0", overflow: "hidden", border: "1.5px solid #ffffff", boxShadow: "0 8px 40px rgba(124,58,237,0.12)" }}>
        <section
          className="relative text-center"
          style={{
            fontFamily: "var(--font-schibsted), var(--font-geist-sans), sans-serif",
          }}
        >
          {/* Layer 1 — palette colour blobs */}
          <div className="absolute inset-0" style={{
            background: [
              "radial-gradient(circle at 2% 0%,    rgba(124,58,237,.65)  0%, transparent 48%)",
              "radial-gradient(circle at 100% 4%,  rgba(94,108,232,.55)  0%, transparent 50%)",
              "radial-gradient(circle at 98% 100%, rgba(240,97,122,.50)  0%, transparent 50%)",
              "radial-gradient(circle at 0% 100%,  rgba(199,60,142,.45)  0%, transparent 50%)",
              "radial-gradient(circle at 50% 50%,  rgba(250,217,236,.35) 0%, transparent 60%)",
            ].join(", "),
          }} />

          {/* Layer 2 — frosted veil blurs the blobs into a soft pastel haze */}
          <div className="absolute inset-0" style={{
            backdropFilter: "blur(80px) saturate(150%)",
            WebkitBackdropFilter: "blur(80px) saturate(150%)",
            background: "rgba(255,255,255,.33)",
          }} />

          {/* Content — sits above both background layers */}
          <div className="relative max-w-5xl mx-auto px-8 pt-20 pb-16" style={{ zIndex: 2 }}>

            {/* Headline */}
            <h1
              className="text-[40px] md:text-[54px] lg:text-[64px] mb-5"
              style={{ color: "#160F2E", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.08 }}
            >
              Comparison intelligence for the{" "}
              <span style={{ display: "inline-block", background: "linear-gradient(95deg, #6B4FBB 15%, #E8447A 85%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", paddingBottom: "0.15em" }}>
                AI agent era
              </span>
            </h1>

            {/* Rotating pill + subhead + CTA — key forces remount and fade-in animation on each state change */}
            <style>{`@keyframes heroFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div key={stateIdx} style={{ animation: "heroFadeIn 0.55s ease forwards" }}>

              {/* Tagline + pill */}
              <div style={{ margin: "32px 0" }}>
                <span style={{ fontSize: "22px", fontWeight: 500, color: "#160F2E" }}>AgenticLib, the hub for </span>
                <span style={{ fontSize: "22px", fontWeight: 500, color: "#7C3AED", background: "rgba(124,58,237,0.10)", borderRadius: 4, padding: "2px 8px" }}>
                  {HERO_STATES[stateIdx].pill}
                </span>
              </div>

              {/* Subhead */}
              <p className="text-base md:text-lg mx-auto" style={{ color: "rgba(22,15,46,0.6)", maxWidth: "520px", lineHeight: 1.35, marginTop: "40px" }}>
                {HERO_STATES[stateIdx].sub}
              </p>

              {/* CTA — only shown for state 1 */}
              {HERO_STATES[stateIdx].cta && (
                <div className="flex items-center justify-center gap-3 mt-10 mb-0">
                  <a
                    href="/#contact"
                    className="inline-flex items-center gap-2 font-semibold transition-all"
                    style={{ background: "rgba(124,58,237,0.18)", border: "1.5px solid rgba(124,58,237,0.35)", borderRadius: 9999, padding: "14px 28px", fontSize: "15px", textDecoration: "none", letterSpacing: "-0.01em", color: "#160F2E", fontWeight: 600 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.28)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.18)"; }}
                  >
                    Get Started <span aria-hidden>›</span>
                  </a>
                </div>
              )}

            </div>

            {/* State indicator dots — auto-rotation only, no click handlers */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
              {HERO_STATES.map((_, i) => (
                <div key={i} style={{
                  height: 8,
                  width: i === stateIdx ? 24 : 8,
                  borderRadius: 999,
                  background: i === stateIdx ? "#E8447A" : "rgba(22,15,46,0.18)",
                  transition: "width 0.35s ease, background 0.35s ease",
                }} />
              ))}
            </div>

          </div>
        </section>
        </div>






      </main>

      <section id="contact" style={{ background: "linear-gradient(160deg, #F0F0FF 0%, #ffffff 60%)", paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="text-3xl font-bold mb-3 leading-snug"
            style={{ background: "linear-gradient(90deg, #5B5BD6, #E8633A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
          >
            Stay connected
          </h2>
          <p className="text-zinc-500 text-base mb-10">Follow along as we build.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { href: "https://www.linkedin.com/company/108024233/", Icon: Share2, label: "LinkedIn" },
              { href: "mailto:agenticlib.ai@gmail.com", Icon: Mail, label: "Email" },
              { href: "https://x.com/AgenticLibAI/status/1960527278087266557", Icon: XIcon, label: "X" },
              { href: "https://www.producthunt.com/p/self-promotion/agenticlib-simplifying-your-ai-agent-discovery-journey", Icon: ArrowUp, label: "Product Hunt" },
              { href: "https://www.reddit.com/r/SideProject/comments/1m6bfy1/agenticlib_simplifying_your_ai_agent_discovery/", Icon: MessageCircle, label: "Reddit" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white"
                style={{ background: "#5B5BD6", transition: "background 0.18s ease, box-shadow 0.18s ease" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#E8633A"; el.style.boxShadow = "0 4px 16px rgba(232,99,58,0.35)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#5B5BD6"; el.style.boxShadow = "none"; }}
              >
                <Icon size={15} strokeWidth={1.75} />
                {label}
              </a>
            ))}
          </div>
          <span className="inline-block text-xs font-medium px-4 py-1.5 rounded-full" style={{ background: "#EEF0FF", color: "#5B5BD6" }}>
            Backed by Blackbird VC Giants Program
          </span>
        </div>
      </section>

      <footer style={{ background: "#0F0B1E" }}>
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <span className="text-sm text-white/60">&copy; 2026 AgenticLib</span>
          <span className="text-sm font-semibold tracking-tight" style={{ color: "rgba(255,255,255,0.75)" }}>AgenticLib</span>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} className="max-w-6xl mx-auto px-8" />
        <div className="max-w-6xl mx-auto px-8 py-4 flex flex-wrap items-center justify-between gap-y-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition">Terms &amp; Conditions</Link>
            <Link href="/disclaimer" className="text-xs text-white/40 hover:text-white/70 transition">Web Disclaimer</Link>
          </div>
          <a href="https://launchpadly.co/startup/agenticlib" target="_blank" rel="noopener noreferrer" data-launchpadly-badge="agenticlib" data-launchpadly-badge-variant="light">
            <img src="https://launchpadly.co/embed/badges/startup/agenticlib.svg?variant=light" alt="Launchpadly Startup Directory" width="220" height="48" style={{ display: "block", border: 0 }} />
          </a>
        </div>
      </footer>

</div>
  );
}


