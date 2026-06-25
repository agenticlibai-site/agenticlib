"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Share2, Mail, X as XIcon, ArrowUp, MessageCircle } from "lucide-react";

const BANNER2_SUB = "Get agent recommendations matched to your specific workflows, backed by comparison analytics.";
const BANNER2_WORDS = ["Individuals", "Businesses"] as const;

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productExpanded, setProductExpanded] = useState(false);
  const videoPlayedRef = useRef(false);
  const [stateIdx, setStateIdx] = useState(0); // 0 = AI Agent Builders, 1 = Individuals/Businesses
  const [wordIdx, setWordIdx] = useState(0);   // cycles within banner 2 only

  useEffect(() => {
    const duration = stateIdx === 0 ? 10000 : 7000;
    const t = setTimeout(() => {
      if (stateIdx === 0) {
        setStateIdx(1);
        setWordIdx(0);
      } else if (wordIdx === 0) {
        setWordIdx(1);
      } else {
        setStateIdx(0);
        setWordIdx(0);
      }
    }, duration);
    return () => clearTimeout(t);
  }, [stateIdx, wordIdx]);

  const [typedWord, setTypedWord] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (stateIdx !== 1) { setTypedWord(""); return; }
    const word = BANNER2_WORDS[wordIdx];
    setTypedWord("");
    setIsTyping(true);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTypedWord(word.slice(0, i));
      if (i >= word.length) { clearInterval(iv); setIsTyping(false); }
    }, 32);
    return () => clearInterval(iv);
  }, [stateIdx, wordIdx]);

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

          {/* Left column — Individuals / Businesses */}
          <div className="flex-1 px-6" style={{ borderRight: "1px solid #f0f0f4" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#18181b", textTransform: "uppercase", marginBottom: 12 }}>For Individuals / Businesses</p>
            <div style={{ height: 1, background: "#f0f0f4", marginBottom: 16 }} />
            {[
              { label: "Sage", sub: "AI Agent Recommendations", desc: "Get matched to the right agent instantly", href: "/product/recommendations",
                icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.4 5 5.6.8-4 3.9.9 5.5L10 14.5l-4.9 2.7.9-5.5L2 7.8l5.6-.8L10 2z" fill="#5B4FCF"/></svg> },
              { label: "Vera", sub: "Research & Compare", desc: "Research and compare agents side by side in detail", href: "/product/research",
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

          {/* Right column — AI Agent Builder */}
          <div className="flex-1 px-6">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#18181b", textTransform: "uppercase", marginBottom: 12 }}>For AI Agent Builders</p>
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
            {/* Solutions accordion */}
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
            {[
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
        <div style={{ position: "relative", margin: "16px 32px 24px" }}>
        <div style={{ borderRadius: "32px", overflow: "hidden", border: "1.5px solid rgba(199,204,245,0.5)", boxShadow: "0 8px 40px rgba(124,58,237,0.12)" }}>
        <section
          className="relative text-center"
          style={{
            fontFamily: "var(--font-schibsted), var(--font-geist-sans), sans-serif",
          }}
        >
          {/* Background layers */}
          <div className="absolute inset-0">
            {/* State 0 background: radial colour blobs */}
            <div className="absolute inset-0" style={{
              opacity: stateIdx === 0 ? 1 : 0,
              transition: "opacity 0.55s ease",
              background: [
                "radial-gradient(circle at 2% 0%,    rgba(124,58,237,.65)  0%, transparent 48%)",
                "radial-gradient(circle at 100% 4%,  rgba(94,108,232,.55)  0%, transparent 50%)",
                "radial-gradient(circle at 98% 100%, rgba(240,97,122,.50)  0%, transparent 50%)",
                "radial-gradient(circle at 0% 100%,  rgba(199,60,142,.45)  0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%,  rgba(250,217,236,.35) 0%, transparent 60%)",
              ].join(", "),
            }} />
            <div className="absolute inset-0" style={{
              opacity: stateIdx === 0 ? 1 : 0,
              transition: "opacity 0.55s ease",
              backdropFilter: "blur(80px) saturate(150%)",
              WebkitBackdropFilter: "blur(80px) saturate(150%)",
              background: "rgba(255,255,255,.33)",
            }} />
            {/* State 1 & 2 background */}
            <div className="absolute inset-0" style={{
              opacity: stateIdx > 0 ? 1 : 0,
              transition: "opacity 0.55s ease",
              background: "linear-gradient(90deg, #A8B2F0 0%, #C8C0F8 25%, #ECEAFA 50%, #D8D0F8 75%, #B4BEEF 100%)",
            }} />
          </div>

          {/* Content */}
          <div className="relative max-w-5xl mx-auto px-8 pt-20 pb-16" style={{ zIndex: 2, minHeight: "480px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

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

            {/* Banner content — key on stateIdx so full block fades on banner switch */}
            <style>{`@keyframes heroFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            <div key={stateIdx} style={{ animation: "heroFadeIn 0.55s ease forwards" }}>

              {/* Tagline + pill */}
              <div style={{ margin: "32px 0" }}>
                <span style={{ fontSize: "22px", fontWeight: 500, color: "#160F2E" }}>AgenticLib, the hub for </span>
                {stateIdx === 0 ? (
                  <span style={{ fontSize: "22px", fontWeight: 500, color: "#7C3AED", background: "rgba(124,58,237,0.10)", borderRadius: 4, padding: "2px 8px" }}>
                    AI Agent Builders
                  </span>
                ) : (
                  <span style={{ display: "inline-block", fontSize: "22px", fontWeight: 500, color: "#7C3AED", background: "rgba(124,58,237,0.10)", borderRadius: 4, padding: "2px 8px" }}>
                    {typedWord}
                    <span style={{ opacity: isTyping ? 1 : 0, transition: "opacity 0.4s ease", animation: isTyping ? "blink 0.65s step-end infinite" : undefined, marginLeft: 1 }}>|</span>
                  </span>
                )}
              </div>

              {/* Subhead */}
              <p className="text-base md:text-lg mx-auto" style={{ color: "rgba(22,15,46,0.6)", maxWidth: "520px", lineHeight: 1.35, marginTop: "40px" }}>
                {stateIdx === 0
                  ? "Give product, engineering, and marketing teams an edge with hands-on intelligence on where your product features lead and what you can build next."
                  : BANNER2_SUB}
              </p>

              {/* CTA — both banners, styled to match each banner's gradient */}
              <div className="flex items-center justify-center gap-3 mt-10 mb-0">
                {stateIdx === 0 ? (
                  <a
                    href="/#contact"
                    className="inline-flex items-center gap-2 font-semibold transition-all"
                    style={{ background: "rgba(124,58,237,0.18)", border: "1.5px solid rgba(124,58,237,0.35)", borderRadius: 9999, padding: "14px 28px", fontSize: "15px", textDecoration: "none", letterSpacing: "-0.01em", color: "#160F2E", fontWeight: 600 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.28)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.18)"; }}
                  >
                    Get Started <span aria-hidden>›</span>
                  </a>
                ) : (
                  <a
                    href="/#contact"
                    className="inline-flex items-center gap-2 font-semibold transition-all"
                    style={{ background: "rgba(216,204,255,0.45)", border: "1.5px solid #9585F0", borderRadius: 9999, padding: "14px 28px", fontSize: "15px", textDecoration: "none", letterSpacing: "-0.01em", color: "#1E1569", fontWeight: 600 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(216,204,255,0.65)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(216,204,255,0.45)"; }}
                  >
                    Get Started <span aria-hidden>›</span>
                  </a>
                )}
              </div>

            </div>

            {/* 2-dot state indicator — clickable */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
              {[0, 1].map((i) => (
                <div
                  key={i}
                  onClick={() => { setStateIdx(i); setWordIdx(0); }}
                  style={{
                    height: 8,
                    width: i === stateIdx ? 24 : 8,
                    borderRadius: 999,
                    background: i === stateIdx ? "#C91F65" : "rgba(199,60,142,0.45)",
                    transition: "width 0.35s ease, background 0.35s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

          </div>
        </section>
        </div>
        </div>

        {/* ── WHY AGENTICLIB ─────────────────────────────────── */}
        <section style={{ background: "transparent", padding: "36px 24px 8px", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", overflow: "hidden", borderRadius: 34, background: "linear-gradient(150deg,#FDEAE4 0%,#FBD7CE 55%,#F6C6BC 100%)", boxShadow: "0 30px 70px rgba(90,26,50,.22)", border: "1px solid rgba(255,255,255,.6)" }}>
            {/* palette colour blobs */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 0% 0%,rgba(240,97,122,.36) 0%,transparent 46%),radial-gradient(circle at 100% 6%,rgba(255,138,107,.30) 0%,transparent 48%),radial-gradient(circle at 92% 100%,rgba(194,77,158,.26) 0%,transparent 50%),radial-gradient(circle at 12% 100%,rgba(250,211,230,.34) 0%,transparent 52%),radial-gradient(circle at 52% 50%,rgba(255,255,255,.48) 0%,transparent 58%)" }}></div>
            {/* frosted glass veil */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1, backdropFilter: "blur(64px) saturate(140%)", WebkitBackdropFilter: "blur(64px) saturate(140%)", background: "rgba(255,255,255,.32)" }}></div>

            <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.05fr)", gap: 40, alignItems: "center", padding: "60px 56px" }}>

              {/* LEFT: copy */}
              <div>
                <span style={{ display: "inline-block", border: "1px solid rgba(176,64,72,.30)", background: "rgba(255,255,255,.45)", color: "#5A1A22", fontSize: 13.5, fontWeight: 600, letterSpacing: ".01em", padding: "7px 15px", borderRadius: 9 }}>Why AgenticLib</span>
                <h2 style={{ fontSize: "clamp(28px,3.2vw,42px)", fontWeight: 600, lineHeight: 1.14, letterSpacing: "-.025em", color: "#5A1A22", margin: "26px 0 0", maxWidth: "18ch" }}>
                  {"Insightful comparison intelligence on "}
                  <span style={{ background: "linear-gradient(100deg,#E0506A,#D14B86 70%,#C24D9E)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}>brand and product</span>
                  {" for AI agent builders"}
                </h2>
                <p style={{ fontSize: 17, lineHeight: 1.62, color: "rgba(74,17,25,.82)", margin: "22px 0 0", maxWidth: "52ch" }}>AgenticLib traces your agent brand from use case to product feature, benchmarks your visibility against competition and turns your feature gaps into a roadmap - so you show up where your buyers are actually asking.</p>
                <button
                  onClick={() => { window.location.href = "/explore"; }}
                  style={{ marginTop: 32, cursor: "pointer", border: "none", background: "linear-gradient(100deg,#F0617A,#FF8A6B)", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 15, padding: "14px 26px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 9, boxShadow: "0 12px 28px rgba(90,26,50,.22)" }}
                >
                  Explore AgenticLib <span style={{ fontSize: 13 }}>→</span>
                </button>
              </div>

              {/* RIGHT: visual — brand → feature map */}
              <div style={{ position: "relative", height: 430, display: "flex", alignItems: "center", gap: 0, width: "100%", minWidth: 0 }}>
                {/* soft glow behind */}
                <div style={{ position: "absolute", width: "82%", height: "60%", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(240,97,122,.32),transparent 70%)", filter: "blur(16px)" }}></div>

                {/* central AgenticLib node */}
                <div style={{ flex: "none", position: "relative", zIndex: 3, width: 138, borderRadius: 22, padding: "20px 14px", background: "linear-gradient(150deg,#F0617A 0%,#FF7E72 52%,#FF9E73 100%)", boxShadow: "0 18px 42px rgba(240,97,122,.42)", textAlign: "center" }}>
                  <span style={{ display: "inline-flex", width: 48, height: 48, borderRadius: 13, background: "#fff", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 14px rgba(90,26,50,.20)", overflow: "hidden" }}>
                    <img src="/logo.png" alt="AgenticLib" style={{ width: 34, height: 34, objectFit: "contain" }} />
                  </span>
                  <div style={{ marginTop: 13, color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-.01em" }}>AgenticLib Comparison Intelligence</div>
                </div>

                {/* connectors — gradientUnits=userSpaceOnUse required for the horizontal middle line */}
                <svg viewBox="0 0 200 400" preserveAspectRatio="none" style={{ flex: 1, minWidth: 0, alignSelf: "stretch", height: "100%", overflow: "visible", zIndex: 2 }}>
                  <defs>
                    <linearGradient id="why-cgLine" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="200" y2="200">
                      <stop offset="0" stopColor="#F0617A" />
                      <stop offset="1" stopColor="#FF9E73" />
                    </linearGradient>
                  </defs>
                  <path d="M0,200 C95,200 100,58 200,58" fill="none" stroke="url(#why-cgLine)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0,200 L200,200" fill="none" stroke="url(#why-cgLine)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0,200 C95,200 100,342 200,342" fill="none" stroke="url(#why-cgLine)" strokeWidth="3" strokeLinecap="round" />
                </svg>

                {/* target nodes */}
                <div style={{ flex: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 340, width: 190, zIndex: 3 }}>

                  <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(90,26,50,.14)" }}>
                    <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(240,97,122,.13)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                        <defs>
                          <linearGradient id="why-icCmp" x1="0" y1="1" x2="1" y2="0">
                            <stop offset="0" stopColor="#F0617A" />
                            <stop offset="1" stopColor="#FF9E73" />
                          </linearGradient>
                        </defs>
                        <rect x="3" y="11" width="4.4" height="9" rx="1.6" fill="url(#why-icCmp)" />
                        <rect x="9.8" y="5" width="4.4" height="15" rx="1.6" fill="url(#why-icCmp)" />
                        <rect x="16.6" y="8.5" width="4.4" height="11.5" rx="1.6" fill="url(#why-icCmp)" />
                      </svg>
                    </span>
                    <div><div style={{ fontWeight: 700, fontSize: 14.5, color: "#5A1A22", letterSpacing: "-.01em" }}>Brand Intelligence</div></div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(90,26,50,.14)" }}>
                    <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(240,97,122,.13)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="url(#why-icPrd)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
                        <defs>
                          <linearGradient id="why-icPrd" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#F0617A" />
                            <stop offset="1" stopColor="#FF9E73" />
                          </linearGradient>
                        </defs>
                        <path d="M12 2.5 L20.5 7 V17 L12 21.5 L3.5 17 V7 Z" />
                        <path d="M3.5 7 L12 11.7 L20.5 7" />
                        <path d="M12 11.7 V21.5" />
                      </svg>
                    </span>
                    <div><div style={{ fontWeight: 700, fontSize: 14.5, color: "#5A1A22", letterSpacing: "-.01em" }}>Product Features</div></div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(90,26,50,.14)" }}>
                    <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(240,97,122,.13)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="url(#why-icBmk)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <defs>
                          <linearGradient id="why-icBmk" x1="0" y1="1" x2="1" y2="0">
                            <stop offset="0" stopColor="#F0617A" />
                            <stop offset="1" stopColor="#FF9E73" />
                          </linearGradient>
                        </defs>
                        <path d="M3.5 18.5 A8.5 8.5 0 0 1 20.5 18.5" />
                        <path d="M12 18.5 L16.5 12.5" />
                        <circle cx="12" cy="18.5" r="1.7" fill="url(#why-icBmk)" stroke="none" />
                      </svg>
                    </span>
                    <div><div style={{ fontWeight: 700, fontSize: 14.5, color: "#5A1A22", letterSpacing: "-.01em" }}>Improvements</div></div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── CAPABILITIES GRID ─────────────────────────────────────── */}
        <section style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", background: "linear-gradient(180deg,#FCEEF6 0%,#fff 62%)", padding: "64px 24px 84px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>

            <div style={{ maxWidth: 720, margin: "0 auto 40px", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, letterSpacing: ".22em", color: "#C2186A", margin: "0 0 14px" }}>WHAT YOU GET</p>
              <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1.06, margin: 0, color: "#0E1320" }}>Our analytics lead you to successful outcomes</h2>
            </div>

            <div className="caps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>

              {/* 01 — purple */}
              <div style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 14px 34px rgba(124,58,237,.08)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(124,58,237,.08), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(124,58,237,.08)"; }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                    <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#7C3AED" }}>01</span>
                    <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(124,58,237,.34),transparent)", display: "block" }}></span>
                  </div>
                  <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#0E1320" }}>Product Feature Analytics</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A4256", margin: 0 }}>Feature analytics across security, integrations, task capability, pricing and coverage — mapped to the domain and use case each one actually serves.</p>
                </div>
                <div style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#F3EEFE,#EDE6FD)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                  <svg width="118" height="84" viewBox="0 0 118 84" fill="none">
                    <defs>
                      <linearGradient id="capChk" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#7C3AED" /><stop offset="1" stopColor="#A86BF0" />
                      </linearGradient>
                    </defs>
                    <rect x="4" y="6" width="20" height="20" rx="6" fill="url(#capChk)" />
                    <path d="M9 16 L13 20 L19 12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="34" y="12" width="80" height="8" rx="4" fill="#D8C8F6" />
                    <rect x="4" y="32" width="20" height="20" rx="6" fill="#E2D5FA" />
                    <path d="M9 42 L13 46 L19 38" stroke="#A86BF0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="34" y="38" width="62" height="8" rx="4" fill="#E4DAF8" />
                    <rect x="4" y="58" width="20" height="20" rx="6" fill="url(#capChk)" />
                    <path d="M9 68 L13 72 L19 64" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="34" y="64" width="72" height="8" rx="4" fill="#D8C8F6" />
                  </svg>
                </div>
              </div>

              {/* 02 — indigo-violet */}
              <div style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 14px 34px rgba(94,108,232,.09)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(94,108,232,.09), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(94,108,232,.09)"; }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                    <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#5E6CE8" }}>02</span>
                    <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(94,108,232,.34),transparent)", display: "block" }}></span>
                  </div>
                  <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#0E1320" }}>Brand &amp; Use Case Benchmarking</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A4256", margin: 0 }}>Benchmark your brand against the landscape, by use case — share of voice, where rivals lead, and how your feature cluster stacks up.</p>
                </div>
                <div style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#EEF0FE,#E5E9FD)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "18px 16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                  <svg width="120" height="84" viewBox="0 0 120 84" fill="none">
                    <defs>
                      <linearGradient id="capGroup" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0" stopColor="#5E6CE8" /><stop offset="1" stopColor="#8E63D6" />
                      </linearGradient>
                    </defs>
                    <rect x="8"   y="50" width="13" height="30" rx="3.5" fill="#C7CEF4" />
                    <rect x="24"  y="30" width="13" height="50" rx="3.5" fill="url(#capGroup)" />
                    <rect x="50"  y="58" width="13" height="22" rx="3.5" fill="#C7CEF4" />
                    <rect x="66"  y="18" width="13" height="62" rx="3.5" fill="url(#capGroup)" />
                    <rect x="92"  y="44" width="13" height="36" rx="3.5" fill="#C7CEF4" />
                    <rect x="108" y="34" width="11" height="46" rx="3.5" fill="url(#capGroup)" />
                  </svg>
                </div>
              </div>

              {/* 03 — magenta */}
              <div style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 14px 34px rgba(194,24,106,.08)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(194,24,106,.08), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(194,24,106,.08)"; }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                    <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#C2186A" }}>03</span>
                    <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(194,24,106,.34),transparent)", display: "block" }}></span>
                  </div>
                  <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#0E1320" }}>Sentiment &amp; Brand Coverage</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A4256", margin: 0 }}>Prompt sentiment and brand coverage — tracking the tags and language an LLM uses to describe your agent to a real user.</p>
                </div>
                <div style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#FCEAF3,#F8DFEC)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                  <svg width="110" height="90" viewBox="0 0 110 90" fill="none" stroke="url(#capNode)" strokeWidth="2.4">
                    <defs>
                      <linearGradient id="capNode" x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0" stopColor="#C2186A" /><stop offset="1" stopColor="#E0506A" />
                      </linearGradient>
                    </defs>
                    <line x1="30" y1="28" x2="58" y2="20" />
                    <line x1="30" y1="28" x2="40" y2="58" />
                    <line x1="58" y1="20" x2="80" y2="44" />
                    <line x1="40" y1="58" x2="80" y2="44" />
                    <line x1="40" y1="58" x2="66" y2="72" />
                    <circle cx="30" cy="28" r="6" fill="url(#capNode)" stroke="none" />
                    <circle cx="58" cy="20" r="6" fill="#fff" />
                    <circle cx="80" cy="44" r="6" fill="url(#capNode)" stroke="none" />
                    <circle cx="40" cy="58" r="6" fill="#fff" />
                    <circle cx="66" cy="72" r="6" fill="url(#capNode)" stroke="none" />
                  </svg>
                </div>
              </div>

              {/* 04 — coral */}
              <div style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 16px 38px rgba(240,97,122,.12)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 16px 38px rgba(240,97,122,.12), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 16px 38px rgba(240,97,122,.12)"; }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                    <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#E0506A" }}>04</span>
                    <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(224,80,106,.4),transparent)", display: "block" }}></span>
                  </div>
                  <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#0E1320" }}>Improvements Report</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A4256", margin: 0 }}>An action plan and roadmap — exactly how to improve your features so your agent surfaces where your buyers are actually asking.</p>
                </div>
                <div style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#FFF1F4,#FCE4EC)", border: "1px solid #F6D8E2", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)" }}>
                  <span style={{ position: "absolute", top: 11, right: 11, fontFamily: "var(--font-space-mono), monospace", fontSize: 11, fontWeight: 700, color: "#fff", background: "linear-gradient(100deg,#F0617A,#FF9E73)", padding: "3px 9px", borderRadius: 999, boxShadow: "0 4px 10px rgba(240,97,122,.35)" }}>+47%</span>
                  <svg width="120" height="86" viewBox="0 0 120 86" fill="none">
                    <defs>
                      <linearGradient id="capLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#F0617A" /><stop offset="1" stopColor="#FF9E73" />
                      </linearGradient>
                      <linearGradient id="capFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="rgba(240,97,122,.28)" /><stop offset="1" stopColor="rgba(240,97,122,0)" />
                      </linearGradient>
                    </defs>
                    <path d="M10,74 L34,58 L58,46 L82,30 L110,12 L110,80 L10,80 Z" fill="url(#capFill)" />
                    <path d="M10,74 L34,58 L58,46 L82,30 L110,12" fill="none" stroke="url(#capLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="34" cy="58" r="4" fill="#fff" stroke="url(#capLine)" strokeWidth="2.4" />
                    <circle cx="58" cy="46" r="4" fill="#fff" stroke="url(#capLine)" strokeWidth="2.4" />
                    <circle cx="82" cy="30" r="4" fill="#fff" stroke="url(#capLine)" strokeWidth="2.4" />
                    <circle cx="110" cy="12" r="4.5" fill="url(#capLine)" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </section>




      </main>

      <section id="contact" style={{ background: "transparent", paddingTop: "80px", paddingBottom: "80px" }}>
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


