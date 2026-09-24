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

          /* Why FeatureStream card */
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
                The Product Management OS for{" "}
                <span style={{ backgroundImage: "linear-gradient(95deg, #6B4FBB 15%, #E8447A 85%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  AI Agent Builders
                </span>
              </h1>
              <p className="hero-subhead" style={{ color: "#000000", lineHeight: 1.5, marginTop: 24, fontWeight: 600, fontSize: 17, textAlign: "center", maxWidth: 680 }}>
                FeatureStream's contextual intelligence layer turns customer requests, agent behaviour analytics and competitor signals by domain and use case into a dynamic product roadmap.<br /><br /><span style={{ backgroundImage: "linear-gradient(135deg,#7C3AED 0%,#A21CAF 55%,#C2186A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Built for product managers, product owners and product creators within AI Agent companies.</span>
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
            </div>
          </div>
        </div>
      </section>

      {/* ── Why FeatureStream ────────────────────────────────────────────────────── */}
      <section className="why-agenticlib-card" style={{ position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#EEE8FD 0%,#E8E5FD 55%,#F0E9FD 100%)", padding: "12px 24px 16px", fontFamily: "var(--font-schibsted), system-ui, sans-serif", margin: "0 32px", borderRadius: 24 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 0% 0%,rgba(124,58,237,.30) 0%,transparent 46%),radial-gradient(circle at 100% 6%,rgba(94,108,232,.24) 0%,transparent 48%),radial-gradient(circle at 92% 100%,rgba(167,139,250,.22) 0%,transparent 50%),radial-gradient(circle at 12% 100%,rgba(220,209,255,.30) 0%,transparent 52%),radial-gradient(circle at 52% 50%,rgba(255,255,255,.48) 0%,transparent 58%)", pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(64px) saturate(140%)", WebkitBackdropFilter: "blur(64px) saturate(140%)", background: "rgba(255,255,255,.18)", pointerEvents: "none" }}></div>
          <div className="why-grid" style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
            <div>
              <span style={{ display: "inline-block", border: "1px solid rgba(124,58,237,.30)", background: "rgba(255,255,255,.45)", color: "#000000", fontSize: 13.5, fontWeight: 600, letterSpacing: ".01em", padding: "7px 15px", borderRadius: 9 }}>Why FeatureStream</span>
              <h2 style={{ fontSize: "clamp(24px,2.6vw,36px)", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-.025em", color: "#000000", margin: "26px 0 0", maxWidth: "26ch" }}>
                {"Context-aware "}
                <span style={{ backgroundImage: "linear-gradient(135deg,#7C3AED 0%,#A21CAF 45%,#C2186A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>product management</span>
                {" for teams building AI agents."}
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.62, color: "#000000", margin: "22px 0 0", maxWidth: "52ch" }}>FeatureStream combines customers requests, lost deal notes, support tickets, agent behaviour, user analytics as well as competitor signals to advise on product feature opportunities ranked by impact as well as use case cluster expansions by vertical.</p>
              <p style={{ fontSize: 20, fontWeight: 700, margin: "20px 0 0", backgroundImage: "linear-gradient(135deg,#7C3AED 0%,#A21CAF 55%,#C2186A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Built to streamline the process involved in creating an agentic product.</p>
            </div>
            <div className="why-visual" style={{ position: "relative", height: 480, display: "flex", alignItems: "center", gap: 0, width: "100%", minWidth: 0 }}>
              <div style={{ position: "absolute", width: "82%", height: "60%", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(124,58,237,.25),transparent 70%)", filter: "blur(16px)" }}></div>
              <div style={{ flex: "none", position: "relative", zIndex: 3, width: 138, borderRadius: 22, padding: "20px 14px", background: "linear-gradient(150deg,#7C3AED 0%,#9B5DE5 52%,#5E6CE8 100%)", boxShadow: "0 18px 42px rgba(124,58,237,.40)", textAlign: "center" }}>
                <span style={{ display: "inline-flex", width: 48, height: 48, borderRadius: 13, background: "#fff", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 14px rgba(124,58,237,.22)", overflow: "hidden" }}>
                  <img src="/logo.png" alt="FeatureStream" style={{ width: 34, height: 34, objectFit: "contain" }} />
                </span>
                <div style={{ marginTop: 13, color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-.01em" }}>FeatureStream</div>
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
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#000000", letterSpacing: "-.01em" }}>Product Catalogue</div>
                </div>
                {/* Competitor Intelligence */}
                <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(124,58,237,.12)" }}>
                  <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(124,58,237,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="hp-ic2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#5E6CE8"/></linearGradient></defs><rect x="3" y="11" width="4.4" height="9" rx="1.6" fill="url(#hp-ic2)"/><rect x="9.8" y="5" width="4.4" height="15" rx="1.6" fill="url(#hp-ic2)"/><rect x="16.6" y="8.5" width="4.4" height="11.5" rx="1.6" fill="url(#hp-ic2)"/></svg>
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#000000", letterSpacing: "-.01em" }}>Reasoning insights</div>
                </div>
                {/* Product Feature Intelligence */}
                <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(124,58,237,.12)" }}>
                  <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(124,58,237,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="url(#hp-ic3)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><defs><linearGradient id="hp-ic3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#5E6CE8"/></linearGradient></defs><path d="M12 2.5 L20.5 7 V17 L12 21.5 L3.5 17 V7 Z"/><path d="M3.5 7 L12 11.7 L20.5 7"/><path d="M12 11.7 V21.5"/></svg>
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#000000", letterSpacing: "-.01em" }}>Knowledge compounding</div>
                </div>
                {/* Use Case Intelligence */}
                <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(124,58,237,.12)" }}>
                  <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(124,58,237,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="url(#hp-ic4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="hp-ic4" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#9B5DE5"/></linearGradient></defs><path d="M12 2a7 7 0 0 1 5.5 11.3c-.8 1-1.5 2-1.5 2.7v.5a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-.5c0-.7-.7-1.7-1.5-2.7A7 7 0 0 1 12 2z"/><path d="M9.5 20.5h5"/><path d="M10.5 22.5h3"/></svg>
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#000000", letterSpacing: "-.01em" }}>Integration with observability platforms</div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* ── How the product roadmap is created ───────────────────────────── */}
      <section style={{ padding: "88px 24px 96px", background: "#fff", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center" as const, marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(26px,3vw,42px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#000", margin: 0 }}>
              The Process.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>

            {/* Card 1 — Integrations */}
            <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ background: "rgba(124,58,237,0.05)", padding: "28px 20px 24px", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 200 130" style={{ width: "100%" }}>
                  <defs><linearGradient id="c1lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#5E6CE8"/></linearGradient></defs>
                  {/* 4 source tiles on left */}
                  {([["#7C3AED","M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"],
                     ["#5E6CE8","M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"],
                     ["#059669","M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"],
                     ["#A21CAF","M18 20V10M12 20V4M6 20v-6"],
                  ] as [string,string][]).map(([color, path], i) => {
                    const y = 8 + i * 30;
                    return (
                      <g key={color+i}>
                        <rect x="10" y={y} width="36" height="24" rx="7" fill={`${color}12`} stroke={`${color}30`} strokeWidth="1"/>
                        {/* Icon via transform instead of nested svg to avoid overflow */}
                        <g transform={`translate(20,${y+4}) scale(0.667)`} fill="none" stroke={color} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d={path}/>
                        </g>
                        {/* Connector line */}
                        <line x1="46" y1={y+12} x2="106" y2="65" stroke={`${color}50`} strokeWidth="1.2" strokeDasharray="4 3"/>
                      </g>
                    );
                  })}
                  {/* Central FS circle */}
                  <circle cx="124" cy="65" r="24" fill="url(#c1lg)" opacity="0.12"/>
                  <circle cx="124" cy="65" r="18" fill="url(#c1lg)"/>
                  <text x="124" y="70" textAnchor="middle" fontSize="9" fill="white" fontWeight="700" fontFamily="system-ui,sans-serif">FS</text>
                  {/* Output arrow */}
                  <line x1="142" y1="65" x2="168" y2="65" stroke="rgba(124,58,237,0.4)" strokeWidth="1.5"/>
                  <polygon points="168,61 176,65 168,69" fill="rgba(124,58,237,0.5)"/>
                  <rect x="178" y="55" width="18" height="20" rx="5" fill="rgba(124,58,237,0.10)" stroke="rgba(124,58,237,0.30)" strokeWidth="1"/>
                  <text x="187" y="68" textAnchor="middle" fontSize="7" fill="#5B21B6" fontFamily="system-ui" fontWeight="700">DB</text>
                </svg>
              </div>
              <div style={{ padding: "20px 22px 26px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#000", letterSpacing: "0.04em" }}>01</span>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#000", margin: "8px 0 12px", lineHeight: 1.25 }}>Integrations with all the tools in your environment.</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {[
                    ["Observability platforms", "to understand agent behaviour"],
                    ["CRM & Note-taking tools", "to understand lost deal notes"],
                    ["Customer support/ticketing platforms", "to understand customer feedback and requests"],
                    ["Usage Analytics platforms", "to understand how a user interacts with your agent"],
                  ].map(([bold, rest]) => (
                    <li key={bold} style={{ fontSize: 13, lineHeight: 1.5, color: "#000", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "#000", fontWeight: 700, marginTop: 2, flexShrink: 0 }}>·</span>
                      <span><span style={{ fontWeight: 700, color: "#000" }}>{bold}</span>{" - "}{rest}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card 2 — Note storage */}
            <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ background: "rgba(94,108,232,0.05)", padding: "28px 20px 24px", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 200 130" style={{ width: "100%" }}>
                  {/* Your context — left column */}
                  {[16, 46, 76, 106].map((y, i) => (
                    <g key={y}>
                      <rect x="8" y={y} width="72" height="22" rx="6" fill="rgba(124,58,237,0.10)" stroke="rgba(124,58,237,0.25)" strokeWidth="1"/>
                      <rect x="16" y={y+7} width={[44,38,50,36][i]} height="8" rx="4" fill="rgba(124,58,237,0.35)"/>
                    </g>
                  ))}
                  {/* Dashed match lines */}
                  {[27, 57, 87, 117].map((y, i) => (
                    <line key={y} x1="80" y1={y} x2="120" y2={y} stroke="rgba(124,58,237,0.30)" strokeWidth="1.2" strokeDasharray="4 3"/>
                  ))}
                  {/* Match dots at center */}
                  {[27, 57, 87].map(y => (
                    <circle key={y} cx="100" cy={y} r="3" fill="#7C3AED" opacity="0.7"/>
                  ))}
                  {/* Competitor signals — right column */}
                  {[16, 46, 76, 106].map((y, i) => (
                    <g key={y+200}>
                      <rect x="120" y={y} width="72" height="22" rx="6" fill="rgba(194,24,106,0.08)" stroke="rgba(194,24,106,0.22)" strokeWidth="1"/>
                      <rect x="128" y={y+7} width={[40,52,34,48][i]} height="8" rx="4" fill="rgba(194,24,106,0.30)"/>
                    </g>
                  ))}
                </svg>
              </div>
              <div style={{ padding: "20px 22px 26px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#000", letterSpacing: "0.04em" }}>02</span>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#000", margin: "8px 0 10px", lineHeight: 1.25 }}>Matched against market signals.</div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: "#000" }}>Your private context is matched against our feature taxonomy, then compared to competitor signals within the same use case and business domain, showing exactly which competitors have shipped what, where it counts.</div>
              </div>
            </div>

            {/* Card 3 — Support tickets */}
            <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ background: "rgba(124,58,237,0.05)", padding: "28px 20px 24px", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 200 130" style={{ width: "100%" }}>
                  {/* 4 roadmap item rows */}
                  {([
                    ["#7C3AED", 8],
                    ["#5E6CE8", 38],
                    ["#F97316", 68],
                    ["#06B6D4", 98],
                  ] as [string, number][]).map(([color, y]) => (
                    <g key={y}>
                      {/* Card background */}
                      <rect x="8" y={y} width="184" height="24" rx="7" fill="#fff" stroke="rgba(0,0,0,0.07)" strokeWidth="1"/>
                      {/* Left color accent */}
                      <rect x="8" y={y} width="6" height="24" rx="3" fill={color}/>
                      {/* Priority dot */}
                      <circle cx="26" cy={y+12} r="4" fill={`${color}25`} stroke={color} strokeWidth="1"/>
                      {/* Content bars */}
                      <rect x="38" y={y+8} width="80" height="8" rx="4" fill="rgba(0,0,0,0.09)"/>
                      {/* Impact badge */}
                      <rect x="148" y={y+6} width="36" height="12" rx="4" fill={`${color}15`} stroke={`${color}35`} strokeWidth="0.8"/>
                    </g>
                  ))}
                </svg>
              </div>
              <div style={{ padding: "20px 22px 26px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#000", letterSpacing: "0.04em" }}>03</span>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#000", margin: "8px 0 10px", lineHeight: 1.25 }}>Product Roadmap Elements.</div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: "#000" }}>FeatureStream surfaces four kinds of opportunities as required: new product features, use case expansions, agentic fixes, and UI fixes - all in the same roadmap.</div>
              </div>
            </div>

            {/* Card 4 — Usage analytics */}
            <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ background: "rgba(124,58,237,0.05)", padding: "28px 20px 24px", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 200 145" style={{ width: "100%" }}>
                  {/* 3 ranked items with approve/reject */}
                  {([
                    ["#1", 8,  "#7C3AED"],
                    ["#2", 40, "#5E6CE8"],
                    ["#3", 72, "#A21CAF"],
                  ] as [string, number, string][]).map(([rank, y, color]) => (
                    <g key={rank}>
                      <rect x="8" y={y} width="184" height="26" rx="7" fill="#fff" stroke="rgba(0,0,0,0.07)" strokeWidth="1"/>
                      {/* Rank */}
                      <rect x="14" y={y+6} width="18" height="14" rx="4" fill={`${color}15`}/>
                      <text x="23" y={y+16} textAnchor="middle" fontSize="7.5" fill={color} fontFamily="system-ui" fontWeight="700">{rank}</text>
                      {/* Content bar */}
                      <rect x="40" y={y+9} width="84" height="8" rx="4" fill="rgba(0,0,0,0.08)"/>
                      {/* Approve button */}
                      <rect x="140" y={y+6} width="22" height="14" rx="5" fill="rgba(5,150,105,0.12)" stroke="rgba(5,150,105,0.35)" strokeWidth="1"/>
                      <path d={`M${145} ${y+13} l4 4 6-7`} fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      {/* Reject button */}
                      <rect x="168" y={y+6} width="22" height="14" rx="5" fill="rgba(239,68,68,0.10)" stroke="rgba(239,68,68,0.30)" strokeWidth="1"/>
                      <path d={`M${173} ${y+10} l6 6 M${179} ${y+10} l-6 6`} fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                  ))}
                  {/* Output arrow */}
                  <line x1="100" y1="104" x2="100" y2="116" stroke="rgba(124,58,237,0.35)" strokeWidth="1.5"/>
                  <polygon points="96,116 100,123 104,116" fill="rgba(124,58,237,0.4)"/>
                  {/* Output pills */}
                  <rect x="18" y="120" width="70" height="18" rx="6" fill="rgba(5,150,105,0.10)" stroke="rgba(5,150,105,0.30)" strokeWidth="1"/>
                  <text x="53" y="132" textAnchor="middle" fontSize="7.5" fill="#059669" fontFamily="system-ui" fontWeight="700">Jira</text>
                  <rect x="112" y="120" width="70" height="18" rx="6" fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.25)" strokeWidth="1"/>
                  <text x="147" y="132" textAnchor="middle" fontSize="7.5" fill="#5B21B6" fontFamily="system-ui" fontWeight="700">Catalogue</text>
                </svg>
              </div>
              <div style={{ padding: "20px 22px 26px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#000", letterSpacing: "0.04em" }}>04</span>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#000", margin: "8px 0 10px", lineHeight: 1.25 }}>The Product Owner stays in control.</div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: "#000" }}>Every item in the roadmap is ranked by impact. Nothing ships without the approval of the product owner - reject what doesn't fit, approve what does, and it flows straight to Jira and the FeatureStream product catalogue.</div>
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

        </div>
      </section>

      {/* ── Product Catalogue ──────────────────────────────────────────── */}
      <section style={{ padding: "88px 24px 96px", fontFamily: "var(--font-schibsted), system-ui, sans-serif", background: "#fff" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Left — copy */}
          <div>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#5B21B6", background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 9999, padding: "5px 14px", marginBottom: 28 }}>Product Catalogue</span>
            <h2 style={{ fontSize: "clamp(26px,2.8vw,42px)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.03em", color: "#0F0B1E", margin: "0 0 22px", maxWidth: "22ch" }}>
              Keep track of every product detail{" "}
              <span style={{ backgroundImage: "linear-gradient(135deg,#7C3AED 0%,#A21CAF 45%,#C2186A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>with the Product Catalogue.</span>
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.65, color: "rgba(15,11,30,0.60)", margin: "0 0 24px", maxWidth: "46ch" }}>
              The product owner gets a full view of every feature: customer requests, use cases, revenue and time impact metrics, Planned, In Development and Shipped status updates, and prompt and version changelogs.
            </p>
            <p style={{ fontSize: 16.5, lineHeight: 1.65, color: "rgba(15,11,30,0.60)", margin: "0 0 36px", maxWidth: "46ch" }}>
              From the same record, generate PRDs, UI wireframes, implementation specs, agentic fix specs, release notes and post-launch evaluation specs without switching tools or copying context.
            </p>
            {/* Status chips */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10 }}>
              {[
                ["Planned", "#7C3AED", "rgba(124,58,237,0.08)"],
                ["In Development", "#5E6CE8", "rgba(94,108,232,0.08)"],
                ["Shipped", "#059669", "rgba(5,150,105,0.08)"],
              ].map(([label, color, bg]) => (
                <span key={label} style={{ fontSize: 13, fontWeight: 600, color, background: bg, border: `1px solid ${color}33`, borderRadius: 9999, padding: "5px 14px" }}>{label}</span>
              ))}
            </div>
          </div>

          {/* Right — circular visual, fixed 480×480 for precise orbital positioning */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 480, height: 480, borderRadius: 28, background: "linear-gradient(145deg,#EEE8FD 0%,#DDD6FD 45%,#C4B5FD 100%)", flexShrink: 0 }}>

              {/* Concentric rings */}
              <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1.2px solid rgba(124,58,237,0.22)", top: 90, left: 90 }} />
              <div style={{ position: "absolute", width: 390, height: 390, borderRadius: "50%", border: "1px solid rgba(124,58,237,0.10)", top: 45, left: 45 }} />

              {/* Centre node — logo */}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 4, width: 80, height: 80, borderRadius: 22, background: "linear-gradient(150deg,#7C3AED 0%,#9B5DE5 55%,#5E6CE8 100%)", boxShadow: "0 16px 40px rgba(124,58,237,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/logo.png" alt="FeatureStream" style={{ width: 36, height: 36, objectFit: "contain" }} />
              </div>

              {/* Orbiting icon tiles — positions computed on circle r=160 centred at (240,240) */}
              {([
                // [label, path, cx, cy, stroke-color]
                // 7 items, 360/7≈51.43° apart, starting at 270° (top)
                ["Customer requests",  "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",                      240, 80,  "#7C3AED"],
                ["Revenue metrics",    "M18 20V10M12 20V4M6 20v-6",  365, 140, "#F97316"],
                ["PRDs & specs",       "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8", 396, 276, "#3B82F6"],
                ["Post-launch evals",  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",                                  309, 384, "#10B981"],
                ["Prompt changelogs",  "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",                                           171, 384, "#A21CAF"],
                ["Use case clusters",  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",                         84,  276, "#EAB308"],
                ["Status tracking",    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2", 115, 140, "#06B6D4"],
              ] as [string, string, number, number, string][]).map(([label, pathD, cx, cy, color]) => (
                <div key={label} title={label} style={{ position: "absolute", left: cx - 26, top: cy - 26, zIndex: 3, background: "#fff", borderRadius: 16, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(0,0,0,0.11)", border: "1.5px solid rgba(255,255,255,0.95)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={pathD} />
                  </svg>
                </div>
              ))}

            </div>
          </div>

        </div>
      </section>

      {/* ── Product Specs ──────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px 88px", background: "#F0EDFB", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(22px,2.6vw,34px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.2, color: "#0F0B1E", margin: "0 0 52px", maxWidth: "36ch" }}>
            FeatureStream creates product specifications tailored to each iteration and build cycle.
          </h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 36 }}>
            {([
              {
                label: "PRDs (with written specs and flowcharts)",
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
              },
              {
                label: "UI design reviews and wireframing",
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>,
              },
              {
                label: "Agentic Fixes spec",
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>,
              },
            ] as { label: string; icon: React.ReactNode }[]).map(({ label, icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(124,58,237,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {icon}
                </div>
                <span style={{ fontSize: "clamp(18px,2vw,24px)", fontWeight: 700, color: "#0F0B1E", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Post-launch evaluation ─────────────────────────────────────────── */}
      <section style={{ padding: "88px 24px 96px", background: "#fff", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,3.2vw,48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#0F0B1E", margin: "0 0 24px", maxWidth: "20ch" }}>
            Post-launch evaluation.
          </h2>
          <p style={{ fontSize: "clamp(16px,1.8vw,20px)", lineHeight: 1.65, color: "#000", margin: "0 0 52px", maxWidth: "58ch" }}>
            FeatureStream measures post-launch impact directly tying the implementation of new product features and product error fixes to revenue, customer satisfaction and product usage analytics.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(124,58,237,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span style={{ fontSize: "clamp(18px,2vw,24px)", fontWeight: 700, color: "#0F0B1E", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Post-launch evaluation spec</span>
          </div>
        </div>
      </section>

      {/* ── How It Works (removed) ── */}
      <section className="how-it-works" style={{ display: "none" }}>
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
              FeatureStream keeps you ahead.
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
                q: "What is the Product Catalogue?",
                a: "The Product Catalogue is the core of FeatureStream — one permanent record per feature or use case, tracking its full lifecycle: idea, evidence, PRD, in development, shipped, fixed, and evaluated. Every entry links back to the original evidence that justified it, carries a predicted revenue or time impact tag, and once shipped, a realised-outcome tag. The roadmap is simply a filtered view of the catalogue — not a separate database.",
              },
              {
                q: "What signals does FeatureStream pull in?",
                a: "FeatureStream connects customer requests, lost-deal notes, support tickets, competitor signals by use case cluster, Jira (for status sync), local architecture and KAG context, and observability platforms — starting with Langfuse, which surfaces agent traces, latency, token cost, completion rate, eval scores, and hallucination signals.",
              },
              {
                q: "What does FeatureStream actually generate?",
                a: "Every output comes from the same catalogue record: a PRD with agentic workflow flowchart, an agentic fix spec (pointed at one diagnosed issue — e.g. '40% drop-off at step 3, likely cause: prompt ambiguity, suggested fix: X'), implementation specs with diagrams, UI/design wireframes, release notes framed around agent behaviour outcomes, a post-launch evaluation spec that feeds back as a new realised-outcome tag, and a prompt/version changelog pairing every change with before-and-after metrics.",
              },
              {
                q: "How does the PM Copilot work?",
                a: "The copilot is a conversational layer on top of the catalogue for brainstorming and refining an opportunity before committing it to the roadmap. It draws on three sources: your Product Catalogue via local RAG (tagged with realised outcomes), your architecture and KAG context, and public competitor and market signals weighted by evidence count. It produces sharper revenue and impact estimates — not generic priority scores. Predictive forecasting is a future roadmap item, not a current capability.",
              },
              {
                q: "How is FeatureStream different from Productboard or Amplitude?",
                a: "Those tools do parts of this well. Productboard handles roadmap discovery; Amplitude Agent Analytics handles diagnostics. FeatureStream connects the full loop — diagnosis, evidence, decision, build, ship, re-evaluate — on a single catalogue record, built specifically for AI agent builders who need product and agent behaviour managed in the same place. The differentiation is the assembled loop, not any single feature.",
              },
              {
                q: "Is my business domain covered?",
                a: "We currently cover vertical domains (skincare, insurance, legal, construction), horizontal functions (sales, marketing), and tech capability domains. If your domain isn't listed, request it below.",
                hasRequest: true,
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


