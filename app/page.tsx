"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Share2, Mail, X as XIcon, ArrowUp, MessageCircle } from "lucide-react";
import IntelligenceModules from "@/components/IntelligenceModules";
import SiteFooter from "./components/SiteFooter";

const DOMAINS = [
  { label: "Marketing", href: "/solutions/marketing" },
  { label: "Skincare", href: "/solutions/skincare" },
  { label: "Sales", href: "/product/sales-visibility" },
  { label: "Construction", href: "/solutions/construction" },
];

function DomainSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = DOMAINS.filter(d => d.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div style={{ marginTop: 32, maxWidth: 300, position: "relative", zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.90)", borderRadius: open ? "12px 12px 0 0" : 12, border: "1.5px solid rgba(240,97,122,0.30)", borderBottom: open ? "1px solid rgba(240,97,122,0.12)" : "1.5px solid rgba(240,97,122,0.30)", padding: "11px 16px", boxShadow: open ? "0 2px 10px rgba(90,26,50,.08)" : "0 2px 10px rgba(90,26,50,.10)", transition: "border-radius 0.1s" }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
          <circle cx="6.5" cy="6.5" r="4.5" stroke="#000000" strokeWidth="1.6"/>
          <path d="M10 10l3 3" stroke="#000000" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder="See how your agent ranks..." style={{ border: "none", outline: "none", background: "transparent", fontSize: 13.5, fontWeight: 500, color: "#000000", width: "100%", fontFamily: "inherit" }} />
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.4, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <path d="M2 4l4 4 4-4" stroke="#000000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", borderRadius: "0 0 12px 12px", border: "1.5px solid rgba(240,97,122,0.30)", borderTop: "none", boxShadow: "0 8px 24px rgba(90,26,50,.14)", overflow: "hidden" }}>
          {filtered.map(d => (
            <Link key={d.href} href={d.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", textDecoration: "none", color: "#000000", fontSize: 13.5, fontWeight: 600 }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(240,97,122,0.06)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
              {d.label}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 3l3 3-3 3" stroke="#F0617A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


function ReportModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/report-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 20, padding: "40px 36px", maxWidth: 420, width: "90%", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", fontSize: 22, color: "rgba(0,0,0,0.35)", cursor: "pointer", lineHeight: 1 }}>×</button>

        {status === "done" ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0F0B1E", margin: "0 0 10px" }}>Request received</h3>
            <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 1.6, margin: 0 }}>We&apos;ll be in touch at <strong>{email}</strong> with your free report.</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#0F0B1E", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Get Your Free Report</h3>
            <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 1.55, margin: "0 0 24px" }}>
              Enter your email and we&apos;ll get in touch with you for next steps.
            </p>
            <form onSubmit={submit}>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box" as const,
                  padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500,
                  border: "1.5px solid rgba(124,58,237,0.3)", outline: "none",
                  marginBottom: 14, fontFamily: "inherit", color: "#000",
                }}
              />
              {status === "error" && (
                <p style={{ fontSize: 13, color: "#dc2626", margin: "0 0 12px" }}>Something went wrong — please try again.</p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: "linear-gradient(95deg, #7C3AED, #C2186A)", color: "#fff",
                  fontSize: 15, fontWeight: 700, opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? "Sending…" : "Request Report"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function DomainRequestModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail]   = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/domain-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, domain }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 20, padding: "40px 36px", maxWidth: 420, width: "90%", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", fontSize: 22, color: "rgba(0,0,0,0.35)", cursor: "pointer", lineHeight: 1 }}>×</button>

        {status === "done" ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0F0B1E", margin: "0 0 10px" }}>Request received</h3>
            <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 1.6, margin: 0 }}>We&apos;ll be in touch at <strong>{email}</strong> shortly.</p>
          </div>
        ) : (
          <>
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase" as const, color: "#7C3AED",
              background: "rgba(124,58,237,0.09)", borderRadius: 999, padding: "3px 10px", marginBottom: 16,
            }}>
              Request a Domain
            </span>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#0F0B1E", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Request your business domain
            </h3>
            <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 1.55, margin: "0 0 24px" }}>
              Tell us your domain and we&apos;ll build a customised intelligence report for it.
            </p>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                required
                autoFocus
                placeholder="Your domain (e.g. Legal AI, HR Automation)"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box" as const,
                  padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500,
                  border: "1.5px solid rgba(124,58,237,0.28)",
                  outline: "none", fontFamily: "inherit", color: "#000",
                }}
              />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box" as const,
                  padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500,
                  border: "1.5px solid rgba(124,58,237,0.28)",
                  outline: "none", marginBottom: 2, fontFamily: "inherit", color: "#000",
                }}
              />
              {status === "error" && (
                <p style={{ fontSize: 13, color: "#dc2626", margin: "0 0 4px" }}>Something went wrong — please try again.</p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: "linear-gradient(95deg, #7C3AED, #C2186A)", color: "#fff",
                  fontSize: 15, fontWeight: 700, opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? "Sending…" : "Request domain report"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<Set<number>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productExpanded, setProductExpanded] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const videoPlayedRef = useRef(false);

  const handleVideoPlay = () => {
    if (videoPlayedRef.current) return;
    videoPlayedRef.current = true;
    fetch("/api/notify-play", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "Homepage" }) }).catch(() => {});
  };
  const pathname = usePathname();

  return (
    <div className="page-bg relative text-black font-sans">
      {reportModalOpen && <ReportModal onClose={() => setReportModalOpen(false)} />}
      {domainModalOpen && <DomainRequestModal onClose={() => setDomainModalOpen(false)} />}

      {/* ── Sage AI Demo video modal ── */}
      {demoOpen && (
        <div
          onClick={() => { setDemoOpen(false); demoVideoRef.current?.pause(); }}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", backdropFilter: "blur(8px)" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: "relative", width: "100%", maxWidth: 960, borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.55)" }}
          >
            <video
              ref={demoVideoRef}
              src="/Sage AI Demo.mov"
              controls
              playsInline
              style={{ display: "block", width: "100%", borderRadius: 16 }}
            />
            <button
              onClick={() => { setDemoOpen(false); demoVideoRef.current?.pause(); }}
              style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* Logo marquee — desktop: normal centered row */
        .logo-marquee { width: 100%; }
        .logo-track { display: flex; align-items: center; justify-content: center; gap: 48px; flex-wrap: wrap; }
        .logo-dupe { display: none !important; }

        @media (max-width: 640px) {
          .logo-marquee { overflow: hidden; }
          .logo-track { flex-wrap: nowrap; justify-content: flex-start; gap: 40px; animation: marquee-scroll 10s linear infinite; width: max-content; }
          .logo-track > * { flex-shrink: 0 !important; }
          .logo-dupe { display: flex !important; align-items: center; }
        }

        @media (max-width: 900px) {
          .hero-content { padding: 90px 24px 0 !important; max-width: 100% !important; flex-direction: column !important; align-items: center !important; }
          .hero-content > div:first-child { width: 100% !important; }
          .hero-snap-wrap { margin-top: 36px !important; border-radius: 10px !important; width: 100% !important; }
        }
        @media (max-width: 640px) {
          /* Hero */
          .hero-card-wrapper { margin: 0 0 16px !important; }
          .hero-content { padding: 72px 20px 0 !important; flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .hero-tagline-text { font-size: 15px !important; }
          .hero-subhead { margin-top: 14px !important; font-size: 15px !important; max-width: 100% !important; }

          /* Product snap — show on mobile, tight margins */
          .hero-snap-wrap { margin-top: 28px !important; border-radius: 8px !important; width: 100% !important; }

          /* Trusted By spacing */
          .trusted-by-section { padding: 40px 16px 44px !important; }

          /* Trusted By spacing only — marquee handled globally above */

          /* Sage AI header */
          .sage-header { padding: 0 20px !important; }
          .sage-desc { font-size: 15px !important; }

          /* Sage AI section margin */
          .sage-ai-section { margin-top: 32px !important; }

          /* Testimonial */
          .testimonial-quote { font-size: 15px !important; line-height: 1.5 !important; }

          /* How It Works */
          .how-it-works { padding: 40px 20px 48px !important; }


          /* Contact */
          #contact { padding-top: 28px !important; padding-bottom: 44px !important; }

          /* Why AgenticLib card */
          .why-agenticlib-card { margin: 0 10px !important; border-radius: 16px !important; padding: 0 !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .hero-snap-wrap { margin-top: 32px !important; }
        }
        .dewwie-logo {
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 30px;
          color: rgba(0,0,0,0.28);
          letter-spacing: 0.01em;
          line-height: 1;
          cursor: default;
          transition: color 0.2s ease;
        }
        .dewwie-logo:hover { color: #0c00b0; }
        .ralfi-logo-link { opacity: 0.45; transition: opacity 0.2s; text-decoration: none; outline: none; display: flex; align-items: center; }
        .ralfi-logo-link:hover { opacity: 1; }
        .ralfi-logo-img { height: 52px; width: auto; object-fit: contain; filter: grayscale(1); transition: filter 0.2s; }
        .ralfi-logo-link:hover .ralfi-logo-img { filter: none; }
      `}</style>

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full" style={{ background: "rgba(147,197,253,0.10)", filter: "blur(100px)" }} />
        <div className="absolute -top-32 -right-48 w-[560px] h-[560px] rounded-full" style={{ background: "rgba(167,139,250,0.10)", filter: "blur(100px)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full" style={{ background: "rgba(249,168,212,0.07)", filter: "blur(90px)" }} />
      </div>


      <main className="relative z-0">

        {/* ── HERO ───────────────────────────────────────────── */}
        <div className="hero-card-wrapper" style={{ position: "relative", margin: "-68px 0 24px" }}>
        <div style={{ borderRadius: 0, position: "relative" }}>
        <section
          className="relative"
          style={{ fontFamily: "var(--font-schibsted), var(--font-geist-sans), sans-serif" }}
        >
          {/* Hero gradient */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "calc(100% + 750px)", zIndex: 0, pointerEvents: "none" }}>
            <div style={{
              position: "absolute", inset: 0,
              background: [
                "linear-gradient(180deg, rgba(112,38,230,0.32) 0%, rgba(170,42,168,0.25) 13%, rgba(215,58,128,0.21) 26%, rgba(233,80,112,0.17) 40%, rgba(242,108,98,0.12) 54%, rgba(250,152,122,0.08) 68%, rgba(255,196,170,0.05) 81%, rgba(255,228,210,0.02) 92%, rgba(255,255,255,0) 100%)",
                "radial-gradient(circle at 3% 0%,   rgba(100,32,215,0.18) 0%, transparent 38%)",
                "radial-gradient(circle at 97% 2%,  rgba(78,88,218,0.14) 0%, transparent 38%)",
              ].join(", "),
            }} />
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(60px) saturate(112%)", WebkitBackdropFilter: "blur(60px) saturate(112%)", background: "rgba(255,255,255,0.34)" }} />
          </div>

          {/* Side-by-side hero */}
          <div
            className="hero-content relative"
            style={{
              zIndex: 2, position: "relative",
              maxWidth: 1400, margin: "0 auto",
              padding: "120px 48px 0 120px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 40,
            }}
          >
            {/* LEFT — text + CTA */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <h1
                className="text-[32px] sm:text-[38px] md:text-[44px] lg:text-[52px]"
                style={{ color: "#000000", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.08, margin: 0, maxWidth: 780, textWrap: "balance" }}
              >
                Context-Aware Product Management for{" "}
                <span style={{ backgroundImage: "linear-gradient(95deg, #6B4FBB 15%, #E8447A 85%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  AI Agent Builders
                </span>
              </h1>
              <p className="hero-subhead" style={{ color: "#000000", lineHeight: 1.5, marginTop: 24, fontWeight: 600, fontSize: 17, textAlign: "center", maxWidth: 680 }}>
                Turn customer requests, agent behaviour analytics and competitor signals by domain and use case into a dynamic product roadmap. Built for product managers within AI Agent companies.
              </p>
              <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => document.getElementById("sage-ai")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(95deg, #7C3AED, #C2186A)", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 9999, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(124,58,237,0.35)", transition: "box-shadow 0.2s ease, transform 0.15s ease" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 8px 32px rgba(124,58,237,0.50)"; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 4px 20px rgba(124,58,237,0.35)"; el.style.transform = "translateY(0)"; }}
                >
                  Get started <span aria-hidden style={{ fontSize: 17 }}>›</span>
                </button>
                <button
                  onClick={() => {
                    setDemoOpen(true);
                    fetch("/api/demo-view", { method: "POST" }).catch(() => {});
                    setTimeout(() => {
                      const video = demoVideoRef.current;
                      if (!video) return;
                      video.currentTime = 0;
                      video.play();
                    }, 50);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#EDE9FD", color: "#6D28D9", fontWeight: 700, fontSize: 15, padding: "14px 28px", borderRadius: 9999, border: "1.5px solid #7C3AED", cursor: "pointer", transition: "background 0.15s, box-shadow 0.15s", boxShadow: "0 2px 10px rgba(124,58,237,0.10)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "#E0D9FA"; el.style.boxShadow = "0 4px 16px rgba(124,58,237,0.18)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "#EDE9FD"; el.style.boxShadow = "0 2px 10px rgba(124,58,237,0.10)"; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#6D28D9"><path d="M8 5v14l11-7z"/></svg>
                  Watch demo
                </button>
              </div>
            </div>

          </div>
        </section>
        </div>
        </div>

      </main>

      {/* ── Trusted By ────────────────────────────────────────────────────── */}
      <section className="trusted-by-section" style={{ padding: "72px 24px 56px", position: "relative", zIndex: 1, background: "transparent" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.12)" }} />
            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#000", whiteSpace: "nowrap" }}>
              Trusted by teams shipping AI agents
            </span>
            <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.12)" }} />
          </div>
          <div className="logo-marquee">
            <div className="logo-track">
              {/* — original set — */}
              <a href="https://www.dewwie.com/" target="_blank" rel="noopener noreferrer" className="dewwie-logo" style={{ textDecoration: "none" }}>dewwie</a>
              <a href="https://lamigo.ai/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", outline: "none", borderBottom: "none", display: "flex", alignItems: "center", opacity: 0.45, filter: "grayscale(1)" }} onMouseEnter={e => { const el = e.currentTarget; el.style.opacity = "1"; el.style.filter = "grayscale(1) brightness(0)"; }} onMouseLeave={e => { const el = e.currentTarget; el.style.opacity = "0.45"; el.style.filter = "grayscale(1)"; }}>
                <img src="/lamigo logo .png" alt="Lamigo" style={{ height: 40, width: "auto", objectFit: "contain" }} />
              </a>
              <a href="https://dexifyai.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", outline: "none", display: "flex", alignItems: "center", opacity: 0.45, filter: "grayscale(1)" }} onMouseEnter={e => { const el = e.currentTarget; el.style.opacity = "1"; el.style.filter = "none"; }} onMouseLeave={e => { const el = e.currentTarget; el.style.opacity = "0.45"; el.style.filter = "grayscale(1)"; }}>
                <img src="/dexify-logo.png" alt="Dexify" style={{ height: 40, width: "auto", objectFit: "contain" }} />
              </a>
              <a href="https://ralfi.io/" target="_blank" rel="noopener noreferrer" className="ralfi-logo-link">
                <img src="/Ralfi ai.png" alt="Ralfi AI" className="ralfi-logo-img" />
              </a>
              <a href="https://www.super.degree/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", outline: "none", display: "flex", alignItems: "center", opacity: 0.45, filter: "grayscale(1)", transition: "opacity 0.2s, filter 0.2s" }} onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity = "1"; el.style.filter = "none"; }} onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity = "0.45"; el.style.filter = "grayscale(1)"; }}>
                <img src="/superdegree-logo.png" alt="Superdegree" style={{ height: 28, width: "auto", objectFit: "contain" }} />
              </a>
              {/* — duplicate set for seamless loop (mobile only) — */}
              <a href="https://www.dewwie.com/" target="_blank" rel="noopener noreferrer" className="dewwie-logo logo-dupe" style={{ textDecoration: "none" }}>dewwie</a>
              <a href="https://lamigo.ai/" target="_blank" rel="noopener noreferrer" className="logo-dupe" style={{ opacity: 0.45, filter: "grayscale(1)" }}>
                <img src="/lamigo logo .png" alt="Lamigo" style={{ height: 40, width: "auto", objectFit: "contain" }} />
              </a>
              <a href="https://dexifyai.com/" target="_blank" rel="noopener noreferrer" className="logo-dupe" style={{ opacity: 0.45, filter: "grayscale(1)" }}>
                <img src="/dexify-logo.png" alt="Dexify" style={{ height: 40, width: "auto", objectFit: "contain" }} />
              </a>
              <a href="https://ralfi.io/" target="_blank" rel="noopener noreferrer" className="ralfi-logo-link logo-dupe">
                <img src="/Ralfi ai.png" alt="Ralfi AI" className="ralfi-logo-img" />
              </a>
              <a href="https://www.super.degree/" target="_blank" rel="noopener noreferrer" className="logo-dupe" style={{ opacity: 0.45, filter: "grayscale(1)" }}>
                <img src="/superdegree-logo.png" alt="Superdegree" style={{ height: 28, width: "auto", objectFit: "contain" }} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why AgenticLib ────────────────────────────────────────────────────── */}
      <section className="why-agenticlib-card" style={{ position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#EEE8FD 0%,#E8E5FD 55%,#F0E9FD 100%)", padding: "12px 24px 16px", fontFamily: "var(--font-schibsted), system-ui, sans-serif", margin: "0 32px", borderRadius: 24 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 0% 0%,rgba(124,58,237,.30) 0%,transparent 46%),radial-gradient(circle at 100% 6%,rgba(94,108,232,.24) 0%,transparent 48%),radial-gradient(circle at 92% 100%,rgba(167,139,250,.22) 0%,transparent 50%),radial-gradient(circle at 12% 100%,rgba(220,209,255,.30) 0%,transparent 52%),radial-gradient(circle at 52% 50%,rgba(255,255,255,.48) 0%,transparent 58%)", pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(64px) saturate(140%)", WebkitBackdropFilter: "blur(64px) saturate(140%)", background: "rgba(255,255,255,.18)", pointerEvents: "none" }}></div>
          <div className="why-grid" style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
            <div>
              <span style={{ display: "inline-block", border: "1px solid rgba(124,58,237,.30)", background: "rgba(255,255,255,.45)", color: "#000000", fontSize: 13.5, fontWeight: 600, letterSpacing: ".01em", padding: "7px 15px", borderRadius: 9 }}>Why AgenticLib</span>
              <h2 style={{ fontSize: "clamp(24px,2.6vw,36px)", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-.025em", color: "#000000", margin: "26px 0 0", maxWidth: "26ch" }}>
                {"An entirely context-aware "}
                <span style={{ backgroundImage: "linear-gradient(135deg,#7C3AED 0%,#A21CAF 45%,#C2186A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>product harness for agentic workflows</span>
                {" by vertical."}
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.62, color: "#000000", margin: "22px 0 0", maxWidth: "52ch" }}>AgenticLib traces your agent brand from business domain to product feature, benchmarks your visibility against competition and turns your feature gaps into a roadmap - so you show up where your buyers are actually asking.</p>
            </div>
            <div className="why-visual" style={{ position: "relative", height: 480, display: "flex", alignItems: "center", gap: 0, width: "100%", minWidth: 0 }}>
              <div style={{ position: "absolute", width: "82%", height: "60%", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(124,58,237,.25),transparent 70%)", filter: "blur(16px)" }}></div>
              <div style={{ flex: "none", position: "relative", zIndex: 3, width: 138, borderRadius: 22, padding: "20px 14px", background: "linear-gradient(150deg,#7C3AED 0%,#9B5DE5 52%,#5E6CE8 100%)", boxShadow: "0 18px 42px rgba(124,58,237,.40)", textAlign: "center" }}>
                <span style={{ display: "inline-flex", width: 48, height: 48, borderRadius: 13, background: "#fff", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 14px rgba(124,58,237,.22)", overflow: "hidden" }}>
                  <img src="/logo.png" alt="AgenticLib" style={{ width: 34, height: 34, objectFit: "contain" }} />
                </span>
                <div style={{ marginTop: 13, color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-.01em" }}>AgenticLib</div>
              </div>
              <svg viewBox="0 0 200 400" preserveAspectRatio="none" style={{ flex: 1, minWidth: 0, alignSelf: "stretch", height: "100%", overflow: "hidden", zIndex: 2 }}>
                <defs>
                  <linearGradient id="aab-cgLine" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="200" y2="200">
                    <stop offset="0" stopColor="#7C3AED" /><stop offset="1" stopColor="#5E6CE8" />
                  </linearGradient>
                </defs>
                <path d="M0,200 C95,200 100,38 200,38" fill="none" stroke="url(#aab-cgLine)" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,200 C95,200 100,146 200,146" fill="none" stroke="url(#aab-cgLine)" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,200 C95,200 100,254 200,254" fill="none" stroke="url(#aab-cgLine)" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,200 C95,200 100,362 200,362" fill="none" stroke="url(#aab-cgLine)" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div style={{ flex: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 460, width: 200, zIndex: 3 }}>
                {/* Buyer Intent Intelligence */}
                <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(124,58,237,.12)" }}>
                  <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(124,58,237,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="hp-ic1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#5E6CE8"/></linearGradient></defs><circle cx="12" cy="12" r="9.5" stroke="url(#hp-ic1)" strokeWidth="1.8" fill="none"/><circle cx="12" cy="12" r="5.5" stroke="url(#hp-ic1)" strokeWidth="1.8" fill="none"/><circle cx="12" cy="12" r="2" fill="url(#hp-ic1)"/></svg>
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#000000", letterSpacing: "-.01em" }}>Buyer Intent Intelligence</div>
                </div>
                {/* Competitor Intelligence */}
                <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(124,58,237,.12)" }}>
                  <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(124,58,237,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="hp-ic2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#5E6CE8"/></linearGradient></defs><rect x="3" y="11" width="4.4" height="9" rx="1.6" fill="url(#hp-ic2)"/><rect x="9.8" y="5" width="4.4" height="15" rx="1.6" fill="url(#hp-ic2)"/><rect x="16.6" y="8.5" width="4.4" height="11.5" rx="1.6" fill="url(#hp-ic2)"/></svg>
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#000000", letterSpacing: "-.01em" }}>Competitor Intelligence</div>
                </div>
                {/* Product Feature Intelligence */}
                <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(124,58,237,.12)" }}>
                  <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(124,58,237,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="url(#hp-ic3)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><defs><linearGradient id="hp-ic3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#5E6CE8"/></linearGradient></defs><path d="M12 2.5 L20.5 7 V17 L12 21.5 L3.5 17 V7 Z"/><path d="M3.5 7 L12 11.7 L20.5 7"/><path d="M12 11.7 V21.5"/></svg>
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#000000", letterSpacing: "-.01em" }}>Product Feature Intelligence</div>
                </div>
                {/* Use Case Intelligence */}
                <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(124,58,237,.12)" }}>
                  <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(124,58,237,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="url(#hp-ic4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="hp-ic4" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#9B5DE5"/></linearGradient></defs><path d="M12 2a7 7 0 0 1 5.5 11.3c-.8 1-1.5 2-1.5 2.7v.5a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-.5c0-.7-.7-1.7-1.5-2.7A7 7 0 0 1 12 2z"/><path d="M9.5 20.5h5"/><path d="M10.5 22.5h3"/></svg>
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#000000", letterSpacing: "-.01em" }}>Use Case Intelligence</div>
                </div>
              </div>
            </div>
          </div>
      </section>

      <section className="trusted-by-section" style={{ padding: "0 24px 56px", position: "relative", zIndex: 1, background: "transparent" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          {/* Supported by */}
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.12)" }} />
              <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#000", whiteSpace: "nowrap" }}>
                Supported by
              </span>
              <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.12)" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 56 }}>
              <a href="https://www.blackbird.vc/giants" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 10, opacity: 0.55, filter: "grayscale(1)" }} onMouseEnter={e => { const el = e.currentTarget; el.style.opacity = "1"; el.style.filter = "none"; }} onMouseLeave={e => { const el = e.currentTarget; el.style.opacity = "0.55"; el.style.filter = "grayscale(1)"; }}>
                <img src="/blackbird logo.jpg" alt="Blackbird VC" style={{ height: 44, width: "auto", objectFit: "contain", borderRadius: 8 }} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#000" }}>Blackbird VC Giants</span>
              </a>
              <a href="https://www.sydney.edu.au/business/study/student-experience/sydney-genesis.html" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", opacity: 0.45, filter: "grayscale(1)" }} onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity = "1"; el.style.filter = "none"; }} onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity = "0.45"; el.style.filter = "grayscale(1)"; }}>
                <img src="/genesis-transparent.png" alt="University of Sydney Genesis" style={{ height: 90, width: "auto", objectFit: "contain" }} />
              </a>
            </div>
          </div>

          {/* Testimonial label */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "40px 0 0" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.12)" }} />
            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#000", whiteSpace: "nowrap" }}>
              Testimonial
            </span>
            <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.12)" }} />
          </div>

          {/* Testimonial */}
          <div style={{
            maxWidth: 560,
            margin: "20px auto 0",
            textAlign: "center",
            background: "#fff",
            border: "2px dotted #7C3AED",
            borderRadius: 20,
            padding: "28px 32px",
          }}>
            <p style={{
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.6,
              color: "#0F0B1E",
              letterSpacing: "-0.01em",
              margin: "0 0 18px",
            }}>
              <span className="testimonial-quote">&ldquo;Helped us map dewwie&apos;s features against the category to identify opportunities for differentiation, and making more informed product decisions.&rdquo;</span>
            </p>
            <div style={{ width: 36, height: 3, background: "#5B5BD6", borderRadius: 2, margin: "0 auto 14px" }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#888" }}>
              Founder, Dewwie
            </span>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="how-it-works" style={{ padding: "72px 24px 80px", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>

          {/* Hook quote */}
          <div style={{ marginBottom: 60 }}>
            <p style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#5B21B6", marginBottom: 20 }}>The problem</p>
            <p style={{ fontSize: "clamp(20px, 2.6vw, 30px)", fontWeight: 700, fontStyle: "italic" as const, lineHeight: 1.45, color: "#0F0B1E", maxWidth: "52ch", letterSpacing: "-0.02em" }}>
              Most AI agent builders only learn who they&rsquo;re losing to and what product feature to build next{" "}
              <span style={{ backgroundImage: "linear-gradient(95deg,#7C3AED,#C2186A)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>when a customer says so out loud.</span>
            </p>
          </div>

          {/* Bridge heading */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#5B21B6", margin: 0 }}>
              AgenticLib keeps you ahead.
            </p>
          </div>

          {/* 3 steps */}
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {([
              {
                n: "01", accent: "#7C3AED",
                title: "We track what's shipping.",
                desc: "We scan your competitors: what's launched, what's changed in the market, what's new in your category, so you're not finding out from a lost deal.",
                icon: (
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <circle cx="15" cy="15" r="3.5" fill="#7C3AED"/>
                    <circle cx="15" cy="15" r="7" stroke="#7C3AED" strokeWidth="1.4" strokeOpacity="0.35" fill="none" strokeDasharray="2.5 2.5"/>
                    <circle cx="15" cy="15" r="11.5" stroke="#7C3AED" strokeWidth="1.4" strokeOpacity="0.15" fill="none" strokeDasharray="2.5 3"/>
                    <path d="M15 15 L23 8.5" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round" opacity="0.8"/>
                    <circle cx="23" cy="8.5" r="1.8" fill="#C2186A"/>
                  </svg>
                ),
                bg: "linear-gradient(135deg,#F3EEFE 0%,#EDE6FD 100%)",
              },
              {
                n: "02", accent: "#5E6CE8",
                title: "We show you the gap, with proof.",
                desc: "Not a vague score. The actual evidence. What Claude and ChatGPT say about you versus them, and exactly which feature is costing you.",
                icon: (
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <rect x="2" y="18" width="7" height="10" rx="2" fill="#5E6CE8" fillOpacity="0.25"/>
                    <rect x="11.5" y="10" width="7" height="18" rx="2" fill="#5E6CE8"/>
                    <rect x="21" y="14" width="7" height="14" rx="2" fill="#5E6CE8" fillOpacity="0.45"/>
                    <path d="M2 9 L11.5 5 L21 7.5 L28 4" stroke="#C2186A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2.5 2"/>
                    <circle cx="21" cy="7.5" r="2" fill="#C2186A"/>
                  </svg>
                ),
                bg: "linear-gradient(135deg,#EEF0FE 0%,#E5E9FD 100%)",
              },
              {
                n: "03", accent: "#C2186A",
                title: "We tell you what to build next.",
                desc: "A prioritised 3-month roadmap of what to build, plus a clear path to becoming LLM-visible in the use cases you want to own, so you compete where your buyers are already asking.",
                icon: (
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <rect x="2" y="5" width="16" height="5" rx="2.5" fill="#C2186A"/>
                    <rect x="2" y="13" width="20" height="5" rx="2.5" fill="#C2186A" fillOpacity="0.45"/>
                    <rect x="2" y="21" width="11" height="5" rx="2.5" fill="#C2186A" fillOpacity="0.2"/>
                    <circle cx="25" cy="7.5" r="4" fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="1.5"/>
                    <path d="M22.8 7.5 L24.5 9.2 L27.2 6" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                bg: "linear-gradient(135deg,#FCEAF3 0%,#F8DFEC 100%)",
              },
            ] as { n: string; accent: string; title: string; desc: string; icon: React.ReactNode; bg: string }[]).map(({ n, accent, title, desc, icon, bg }) => (
              <div key={n} style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(124,58,237,0.09)", borderRadius: 18, padding: "28px 24px", display: "flex", flexDirection: "column" as const, gap: 14, transition: "box-shadow 0.25s ease, border-color 0.25s ease" }} onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 32px 6px rgba(240,97,122,0.28), 0 8px 24px rgba(240,97,122,0.15)"; e.currentTarget.style.borderColor = "rgba(240,97,122,0.35)"; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.09)"; }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: accent }}>{n}</span>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#000000", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.25 }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#000000", margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Intelligence Modules ──────────────────────────────────────────── */}
      <div id="sage-ai" className="sage-ai-section" style={{ marginTop: 48 }}>
        <div className="sage-header" style={{ paddingBottom: 12, fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
          <p style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#5B21B6", margin: "0 0 14px" }}>The solution</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 16px", paddingBottom: "0.1em", background: "linear-gradient(90deg, #7C3AED, #C73C8E, #F0617A)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sage AI Platform</h2>
          <p className="sage-desc" style={{ fontSize: 20, fontWeight: 700, color: "#000000", lineHeight: 1.5, margin: 0, maxWidth: 820 }}>One Platform. Product feature, Use case, Competitive landscape overviews for AI Agent Builders. All angles covered.</p>
        </div>
        <IntelligenceModules />
      </div>

      {/* ── Customised Reports ────────────────────────────────────────────────── */}

      {/* ── Capabilities Grid (removed) ── */}
      <section style={{ display: "none" }}>
        <div>
          <div style={{ maxWidth: 720, margin: "0 auto 40px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, letterSpacing: ".22em", color: "#C2186A", margin: "0 0 14px" }}>WHAT YOU GET</p>
            <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1.06, margin: 0, color: "#000000" }}>Our analytics lead you to successful outcomes</h2>
          </div>
          <div className="caps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>
            <div className="caps-card" style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 14px 34px rgba(124,58,237,.08)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(124,58,237,.08), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(124,58,237,.08)"; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}><span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#7C3AED" }}>01</span><span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(124,58,237,.34),transparent)", display: "block" }}></span></div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#000000" }}>Product Feature Analytics</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#000000", margin: 0 }}>Know exactly which features get you cited. Scored across security, integrations, pricing, and capability — mapped to the use case that matters for your buyers.</p>
              </div>
              <div className="feature-card-icon" style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#F3EEFE,#EDE6FD)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                <svg width="118" height="84" viewBox="0 0 118 84" fill="none"><defs><linearGradient id="hp-capChk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#A86BF0"/></linearGradient></defs><rect x="4" y="6" width="20" height="20" rx="6" fill="url(#hp-capChk)"/><path d="M9 16 L13 20 L19 12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/><rect x="34" y="12" width="80" height="8" rx="4" fill="#D8C8F6"/><rect x="4" y="32" width="20" height="20" rx="6" fill="#E2D5FA"/><path d="M9 42 L13 46 L19 38" stroke="#A86BF0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/><rect x="34" y="38" width="62" height="8" rx="4" fill="#E4DAF8"/><rect x="4" y="58" width="20" height="20" rx="6" fill="url(#hp-capChk)"/><path d="M9 68 L13 72 L19 64" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/><rect x="34" y="64" width="72" height="8" rx="4" fill="#D8C8F6"/></svg>
              </div>
            </div>
            <div className="caps-card" style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 14px 34px rgba(94,108,232,.09)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(94,108,232,.09), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(94,108,232,.09)"; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}><span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#5E6CE8" }}>02</span><span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(94,108,232,.34),transparent)", display: "block" }}></span></div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#000000" }}>Brand &amp; Use Case Benchmarking</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#000000", margin: 0 }}>See where rivals outrank you — and why. Share of voice by use case, who owns each buying moment, and what it takes to close the gap.</p>
              </div>
              <div className="feature-card-icon" style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#EEF0FE,#E5E9FD)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "18px 16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                <svg width="120" height="84" viewBox="0 0 120 84" fill="none"><defs><linearGradient id="hp-capGroup" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#5E6CE8"/><stop offset="1" stopColor="#8E63D6"/></linearGradient></defs><rect x="8" y="50" width="13" height="30" rx="3.5" fill="#C7CEF4"/><rect x="24" y="30" width="13" height="50" rx="3.5" fill="url(#hp-capGroup)"/><rect x="50" y="58" width="13" height="22" rx="3.5" fill="#C7CEF4"/><rect x="66" y="18" width="13" height="62" rx="3.5" fill="url(#hp-capGroup)"/><rect x="92" y="44" width="13" height="36" rx="3.5" fill="#C7CEF4"/><rect x="108" y="34" width="11" height="46" rx="3.5" fill="url(#hp-capGroup)"/></svg>
              </div>
            </div>
            <div className="caps-card" style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 14px 34px rgba(194,24,106,.08)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(194,24,106,.08), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 14px 34px rgba(194,24,106,.08)"; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}><span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#C2186A" }}>03</span><span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(194,24,106,.34),transparent)", display: "block" }}></span></div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#000000" }}>Sentiment &amp; Brand Coverage</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#000000", margin: 0 }}>Hear what LLMs actually say about you. The words, tone, and tags used when a buyer asks Claude or GPT to recommend an agent like yours.</p>
              </div>
              <div className="feature-card-icon" style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#FCEAF3,#F8DFEC)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                <svg width="110" height="90" viewBox="0 0 110 90" fill="none" stroke="url(#hp-capNode)" strokeWidth="2.4"><defs><linearGradient id="hp-capNode" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#C2186A"/><stop offset="1" stopColor="#E0506A"/></linearGradient></defs><line x1="30" y1="28" x2="58" y2="20"/><line x1="30" y1="28" x2="40" y2="58"/><line x1="58" y1="20" x2="80" y2="44"/><line x1="40" y1="58" x2="80" y2="44"/><line x1="40" y1="58" x2="66" y2="72"/><circle cx="30" cy="28" r="6" fill="url(#hp-capNode)" stroke="none"/><circle cx="58" cy="20" r="6" fill="#fff"/><circle cx="80" cy="44" r="6" fill="url(#hp-capNode)" stroke="none"/><circle cx="40" cy="58" r="6" fill="#fff"/><circle cx="66" cy="72" r="6" fill="url(#hp-capNode)" stroke="none"/></svg>
              </div>
            </div>
            <div className="caps-card" style={{ display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 16px 38px rgba(219,39,119,.10)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 16px 38px rgba(219,39,119,.10), 0 0 40px 8px rgba(219,39,119,0.22)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 16px 38px rgba(219,39,119,.10)"; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}><span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#DB2777" }}>04</span><span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(219,39,119,.4),transparent)", display: "block" }}></span></div>
                <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#000000" }}>LLM Visibility Playbook</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#000000", margin: 0 }}>Your playbook for getting cited by Claude and GPT. Grounded in what&apos;s actually indexed today through citations supported by Parallel.ai.</p>
              </div>
              <div className="feature-card-icon" style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#FCE7F3,#FDF2F8)", border: "1px solid #F9A8D4", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)" }}>
                <svg width="100" height="84" viewBox="0 0 100 84" fill="none"><defs><linearGradient id="hp-cap5" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#DB2777"/><stop offset="1" stopColor="#F472B6"/></linearGradient></defs><rect x="8" y="60" width="22" height="14" rx="3" fill="rgba(219,39,119,0.12)"/><rect x="8" y="60" width="22" height="3" rx="1.5" fill="url(#hp-cap5)"/><rect x="34" y="40" width="22" height="34" rx="3" fill="rgba(219,39,119,0.10)"/><rect x="34" y="40" width="22" height="3" rx="1.5" fill="url(#hp-cap5)"/><rect x="60" y="20" width="22" height="54" rx="3" fill="rgba(219,39,119,0.08)"/><rect x="60" y="20" width="22" height="3" rx="1.5" fill="url(#hp-cap5)"/><circle cx="19" cy="57" r="7" fill="url(#hp-cap5)"/><path d="M15.5 57 L18 59.5 L22.5 54.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="45" cy="37" r="7" fill="url(#hp-cap5)"/><path d="M41.5 37 L44 39.5 L48.5 34.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="71" cy="17" r="7" fill="url(#hp-cap5)"/><path d="M67.5 17 L70 19.5 L74.5 14.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center" }}>
              <div className="feature-card-last caps-card" style={{ width: "calc(50% - 10px)", display: "flex", gap: 22, alignItems: "center", background: "#fff", border: "1px solid #EFE3EA", borderRadius: 22, padding: "26px 26px 26px 28px", boxShadow: "0 16px 38px rgba(240,97,122,.12)", transition: "box-shadow 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 16px 38px rgba(240,97,122,.12), 0 0 40px 8px rgba(240,97,122,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 16px 38px rgba(240,97,122,.12)"; }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}><span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 12, fontWeight: 700, color: "#E0506A" }}>05</span><span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(224,80,106,.4),transparent)", display: "block" }}></span></div>
                  <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.12, margin: "0 0 9px", color: "#000000" }}>Competitive Intelligence</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#000000", margin: 0 }}>Continuously monitor hundreds of competitor websites, detect changes over time, and automatically alert users when a competitor ships a product feature.</p>
                </div>
                <div className="feature-card-icon" style={{ flex: "none", width: 150, height: 120, borderRadius: 16, background: "linear-gradient(160deg,#FFF1F4,#FCE4EC)", border: "1px solid #F6D8E2", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)" }}>
                  <span style={{ position: "absolute", top: 11, right: 11, fontFamily: "var(--font-space-mono), monospace", fontSize: 11, fontWeight: 700, color: "#fff", background: "linear-gradient(100deg,#F0617A,#FF9E73)", padding: "3px 9px", borderRadius: 999, boxShadow: "0 4px 10px rgba(240,97,122,.35)" }}>+47%</span>
                  <svg width="120" height="86" viewBox="0 0 120 86" fill="none"><defs><linearGradient id="hp-capLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F0617A"/><stop offset="1" stopColor="#FF9E73"/></linearGradient><linearGradient id="hp-capFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(240,97,122,.28)"/><stop offset="1" stopColor="rgba(240,97,122,0)"/></linearGradient></defs><path d="M10,74 L34,58 L58,46 L82,30 L110,12 L110,80 L10,80 Z" fill="url(#hp-capFill)"/><path d="M10,74 L34,58 L58,46 L82,30 L110,12" fill="none" stroke="url(#hp-capLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="34" cy="58" r="4" fill="#fff" stroke="url(#hp-capLine)" strokeWidth="2.4"/><circle cx="58" cy="46" r="4" fill="#fff" stroke="url(#hp-capLine)" strokeWidth="2.4"/><circle cx="82" cy="30" r="4" fill="#fff" stroke="url(#hp-capLine)" strokeWidth="2.4"/><circle cx="110" cy="12" r="4.5" fill="url(#hp-capLine)"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px 88px", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#5B21B6", marginBottom: 12 }}>Got Questions?</p>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, color: "#0F0B1E", margin: "0 0 40px" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {([
              {
                q: "What is AgenticLib?",
                a: "AgenticLib is a product management platform for AI agent builders that combines market insights, buyer intent and competitor signals to advise on product feature roadmap decisions.",
              },
              {
                q: "What problem does AgenticLib solve?",
                a: "Most AI agent builders are making product feature decisions without real visibility into what competitors are shipping, which use cases they're winning or losing in, or what buyers are actually comparing before they make contact. Piecing that together manually from lost-deal notes, Slack screenshots, and customer calls is slow, manual, and almost no one actually does it consistently. AgenticLib solves this through product and marketing intelligence.",
              },
              {
                q: "What is Sage AI?",
                a: "Sage AI is AgenticLib's platform for AI agent builders. Pick your business domain and instantly see the top competitor brands, filterable by use case, with in-depth product feature scores across security, technical capability, and pricing, each backed by evidence from Claude and GPT. Sage AI currently gives builders insight into their competitive landscape and market insights. Live competitor shipment feeds, benchmarking analysis, and buyer-intent signals are coming next.",
              },
              {
                q: "Is my business domain covered?",
                a: "We currently cover three types of domains. Vertical domains are industry-specific - think skincare, insurance, or legal. Horizontal domains are cross-industry functions like sales, marketing, or HR. Tech domains are capability-specific categories like AI video creation or voice AI. If your domain isn't listed yet, you can request it - we'll build a customised report for your domain.",
                hasRequest: true,
              },
              {
                q: "What do the customised reports cover?",
                a: "Every report covers product feature scores across security, integrations, pricing, and capability, brand and use case benchmarking to show you who owns each buying moment and why, sentiment analysis of how LLMs actually describe brands, and an LLM visibility playbook with citations and data collected from Parallel AI with actionable steps on exactly how to get LLM visible. On top of that, each report calls out the top 3 product features you should build next: specific, evidence-backed recommendations to close the gap on competitors and win the use cases your buyers care about.",
              },
              {
                q: "Where is AgenticLib headed?",
                a: "We're building toward fully automating the manual process of piecing together messy customer, market, and competitor signals, through integrations with the tools builders already use, like Granola for meeting notes and CRMs like Attio or HubSpot where lost-deal context actually lives. The idea is to connect a builder's own product context directly with our taxonomy of product features, so AgenticLib can continuously advise on what to build next and which use case clusters to expand into. We're also working on doing the content fix ourselves, so builders don't just get told what to publish, we actually do it for them to get them LLM-visible in the areas where their buyers are already asking.",
              },
            ] as { q: string; a: string; hasRequest?: boolean }[]).map(({ q, a, hasRequest }, i) => (
              <div key={i} style={{ borderTop: i === 0 ? "1px solid rgba(124,58,237,0.15)" : undefined, borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
                <button
                  onClick={() => setFaqOpen(prev => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; })}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 16, padding: "22px 0", background: "none", border: "none", cursor: "pointer",
                    textAlign: "left" as const, fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 17, fontWeight: 700, color: "#0F0B1E", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{q}</span>
                  <svg
                    width="20" height="20" viewBox="0 0 20 20" fill="none"
                    style={{ flexShrink: 0, transform: faqOpen.has(i) ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease", color: "#7C3AED" }}
                  >
                    <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div style={{
                  overflow: "hidden",
                  maxHeight: faqOpen.has(i) ? 800 : 0,
                  opacity: faqOpen.has(i) ? 1 : 0,
                  transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
                }}>
                  <p style={{ fontSize: 15.5, lineHeight: 1.75, color: "#000", margin: "0 0 16px" }}>{a}</p>
                  {hasRequest && (
                    <div style={{ marginBottom: 24 }}>
                      <button
                        onClick={() => setDomainModalOpen(true)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 8,
                          background: "linear-gradient(95deg, #7C3AED, #C2186A)", color: "#fff",
                          fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 9999,
                          border: "none", cursor: "pointer",
                          boxShadow: "none",
                          transition: "opacity 0.2s ease, transform 0.15s ease",
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = "0.88"; el.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = "1"; el.style.transform = "translateY(0)"; }}
                      >
                        Request a domain report <span aria-hidden style={{ fontSize: 16 }}>›</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />

</div>
  );
}


