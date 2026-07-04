"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Share2, Mail, X as XIcon, ArrowUp, MessageCircle } from "lucide-react";
import HomepageDemoSection from "@/app/components/HomepageDemoSection";

const BANNER2_SUB = "Get agent recommendations matched to your specific workflows, backed by comparison analytics.";
const BANNER2_WORDS = ["Individuals", "Businesses"] as const;

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productExpanded, setProductExpanded] = useState(false);
  const videoPlayedRef = useRef(false);
  const [stateIdx, setStateIdx] = useState(0); // 0 = AI Agent Builders, 1 = Individuals/Businesses
  const [wordIdx, setWordIdx] = useState(0);   // cycles within banner 2 only

  useEffect(() => {
    const duration = stateIdx === 0 ? 6000 : 4000;
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
    <div className="page-bg relative text-black font-sans">
      <style>{`
        @media (max-width: 640px) {
          .hero-card-wrapper { margin: 8px 12px 16px !important; }
          .hero-content { padding: 36px 18px 32px !important; min-height: 360px !important; }
          .hero-tagline-text { font-size: 16px !important; }
          .hero-subhead { margin-top: 20px !important; font-size: 14px !important; }
        }
      `}</style>

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full" style={{ background: "rgba(147,197,253,0.10)", filter: "blur(100px)" }} />
        <div className="absolute -top-32 -right-48 w-[560px] h-[560px] rounded-full" style={{ background: "rgba(167,139,250,0.10)", filter: "blur(100px)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full" style={{ background: "rgba(249,168,212,0.07)", filter: "blur(90px)" }} />
      </div>


      <main className="relative z-0">

        {/* ── HERO ───────────────────────────────────────────── */}
        <div className="hero-card-wrapper" style={{ position: "relative", margin: "16px 32px 24px" }}>
        <div style={{ borderRadius: "32px", overflow: "hidden", boxShadow: "0 8px 40px rgba(124,58,237,0.12)" }}>
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
              background: [
                "radial-gradient(circle at 2% 0%,    rgba(94,108,232,.65)  0%, transparent 48%)",
                "radial-gradient(circle at 100% 4%,  rgba(124,58,237,.55)  0%, transparent 50%)",
                "radial-gradient(circle at 98% 100%, rgba(168,178,240,.60)  0%, transparent 50%)",
                "radial-gradient(circle at 0% 100%,  rgba(180,190,239,.55)  0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%,  rgba(200,192,248,.20)  0%, transparent 60%)",
              ].join(", "),
            }} />
            <div className="absolute inset-0" style={{
              opacity: stateIdx > 0 ? 1 : 0,
              transition: "opacity 0.55s ease",
              backdropFilter: "blur(80px) saturate(150%)",
              WebkitBackdropFilter: "blur(80px) saturate(150%)",
              background: "rgba(255,255,255,.33)",
            }} />
          </div>

          {/* Content */}
          <div className="hero-content relative max-w-5xl mx-auto px-8 pt-20 pb-16" style={{ zIndex: 2, minHeight: "480px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

            {/* Headline */}
            <h1
              className="text-[28px] sm:text-[36px] md:text-[54px] lg:text-[64px] mb-5"
              style={{ color: "#000000", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.08 }}
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
                <span className="hero-tagline-text" style={{ fontSize: "22px", fontWeight: 500, color: "#000000" }}>AgenticLib, the hub for </span>
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
              <p className="hero-subhead text-base md:text-lg mx-auto" style={{ color: "#000000", maxWidth: "520px", lineHeight: 1.35, marginTop: "40px" }}>
                {stateIdx === 0
                  ? "Give product, engineering, and marketing teams an edge with hands-on intelligence on where your product features lead and what you can build next."
                  : BANNER2_SUB}
              </p>

              {/* CTA — both banners, styled to match each banner's gradient */}
              <div className="flex items-center justify-center gap-3 mt-10 mb-0">
                {stateIdx === 0 ? (
                  <a
                    href="/ai-agent-builders"
                    className="inline-flex items-center gap-2 font-semibold transition-all"
                    style={{ background: "rgba(124,58,237,0.18)", border: "1.5px solid rgba(124,58,237,0.35)", borderRadius: 9999, padding: "14px 28px", fontSize: "15px", textDecoration: "none", letterSpacing: "-0.01em", color: "#000000", fontWeight: 600 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.28)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.18)"; }}
                  >
                    Get Started <span aria-hidden>›</span>
                  </a>
                ) : null}
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

      </main>

      <HomepageDemoSection />

      <section id="contact" style={{ background: "transparent", paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="text-3xl font-bold mb-3 leading-snug"
            style={{ background: "linear-gradient(90deg, #5B5BD6, #E8633A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
          >
            Stay connected
          </h2>
          <p className="text-black/60 text-base mb-10">Follow along as we build.</p>
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


