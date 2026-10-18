"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import WhyFeatureStream from "./components/WhyFeatureStream";
import AgenticBento from "./components/AgenticBento";
import IntegrationsShowcase from "./components/IntegrationsShowcase";
import { usePathname } from "next/navigation";
import { Share2, Mail, X as XIcon, ArrowUp, MessageCircle } from "lucide-react";
import IntelligenceModules from "@/components/IntelligenceModules";
import SiteFooter from "./components/SiteFooter";
import WaitlistForm from "./components/WaitlistForm";
import DemoVideoGate from "./components/DemoVideoGate";
import ChooseAnimation from "@/components/product/animations/ChooseAnimation";
import PlanAnimation from "@/components/product/animations/PlanAnimation";
import KnowAnimation from "@/components/product/animations/KnowAnimation";
import AskAnimation from "@/components/product/animations/AskAnimation";

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
                  border: "1px solid rgba(0,0,0,0.2)", outline: "none",
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
                  background: "#FF8A73", color: "#000",
                  fontSize: 15, fontWeight: 600, opacity: status === "loading" ? 0.7 : 1,
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
              textTransform: "uppercase" as const, color: "#000",
              background: "#FF8A73", borderRadius: 999, padding: "3px 10px", marginBottom: 16,
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
                  border: "1px solid rgba(0,0,0,0.2)",
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
                  border: "1px solid rgba(0,0,0,0.2)",
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
                  background: "#FF8A73", color: "#000",
                  fontSize: 15, fontWeight: 600, opacity: status === "loading" ? 0.7 : 1,
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

          /* Supported by spacing */
          .trusted-by-section { padding: 0 16px 40px !important; }
          .trusted-by-section > div > div { margin-top: 0 !important; }
          .trusted-logos-section { padding: 36px 16px 16px !important; }
          .trusted-row { display: grid !important; grid-template-columns: repeat(2, auto); justify-content: center; justify-items: center; gap: 28px 48px !important; }
          .trusted-logo img { height: 32px !important; }
          .trusted-dewwie { font-size: 26px !important; }

          /* Section gaps and CTA gutter */
          .feat-section { padding-bottom: 8px !important; }
          .home-cta-section { padding: 0 24px 48px !important; }

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

        }
        .trusted-row { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 32px 56px; }
        .trusted-logo { display: flex; align-items: center; text-decoration: none; opacity: 0.5; filter: grayscale(1); transition: opacity 0.2s, filter 0.2s; }
        .trusted-logo:hover { opacity: 1; filter: none; }
        .trusted-logo img { height: 40px; width: auto; object-fit: contain; }
        .trusted-dewwie { font-family: Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1; color: #1a0fb0; }
        @media (min-width: 641px) and (max-width: 900px) {
          .hero-snap-wrap { margin-top: 32px !important; }
        }
      `}</style>


      <main className="relative z-0">

        {/* ── HERO ───────────────────────────────────────────── */}
        <div className="hero-card-wrapper" style={{ position: "relative", margin: "-68px 0 24px" }}>
        <div style={{ borderRadius: 0, position: "relative" }}>
        <section
          className="relative"
          style={{ fontFamily: "var(--font-schibsted), var(--font-geist-sans), sans-serif" }}
        >
          {/* Side-by-side hero */}
          <div
            className="hero-content relative"
            style={{
              zIndex: 2, position: "relative",
              maxWidth: 1400, margin: "0 auto",
              padding: "150px 48px 0",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 40,
            }}
          >
            {/* LEFT — text + CTA */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <h1
                className="display text-[44px] sm:text-[56px] md:text-[72px] lg:text-[88px]"
                style={{ lineHeight: 1.0, margin: 0, maxWidth: 1000, textWrap: "balance", textAlign: "center" }}
              >
                The Product Management OS for AI Agent Builders
              </h1>
              <p className="hero-subhead" style={{ color: "#000000", lineHeight: 1.5, marginTop: 28, fontWeight: 400, fontSize: 18, textAlign: "center", maxWidth: 640 }}>
                FeatureStream turns your private business context and market signals into a dynamic product roadmap. Built for product managers, product owners and product creators within AI agent companies.
              </p>
              <style>{`
                .hero-cta-card {
                  margin-top: 36px; padding: 26px 36px 28px; border-radius: 22px; max-width: 640px;
                  background: linear-gradient(180deg, #FFF4EF 0%, #FBF8F3 100%);
                  border: 1px solid rgba(255,138,115,0.28);
                  box-shadow: 0 14px 36px rgba(196,104,80,0.08);
                }
                .hero-cta-q { margin: 0; font-size: 20px; line-height: 1.6; font-weight: 500; color: #000; letter-spacing: -0.01em; }
                .hero-role { display: inline-block; padding: 1px 12px; border-radius: 999px; background: rgba(255,138,115,0.22); font-weight: 600; white-space: nowrap; }
                .hero-cta-sub { margin: 6px 0 0; font-size: 15.5px; line-height: 1.5; color: #55524C; }
                @media (max-width: 640px) {
                  .hero-cta-card { padding: 22px 18px 22px; border-radius: 18px; }
                  .hero-cta-q { font-size: 17.5px; }
                  .hero-cta-sub { font-size: 14.5px; }
                }
              `}</style>
              <div className="hero-cta-card">
                <p className="hero-cta-q">
                  Are you an <span className="hero-role">AI agent builder</span> or <span className="hero-role">product owner</span>?
                </p>
                <p className="hero-cta-sub">Managing, maintaining and shipping agentic products? Join our waitlist.</p>
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                  <WaitlistForm />
                  <Link href="/demo" className="btn-outline">Book a demo</Link>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <DemoVideoGate />
              </div>
            </div>

          </div>
        </section>
        </div>
        </div>

      </main>

      {/* ── Trusted by ─────────────────────────────────────────────────── */}
      <section className="trusted-logos-section" style={{ padding: "48px 24px 24px", position: "relative", zIndex: 1, background: "transparent" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <span className="eyebrow" style={{ color: "#55524C" }}>Trusted by teams shipping AI agents</span>
            </div>
            <div className="trusted-row">
              <a href="https://www.dewwie.com/" target="_blank" rel="noopener noreferrer" className="trusted-logo trusted-dewwie" aria-label="Dewwie">dewwie</a>
              <a href="https://lamigo.ai/" target="_blank" rel="noopener noreferrer" className="trusted-logo">
                <img src="/lamigo logo .png" alt="Lamigo" />
              </a>
              <a href="https://dexifyai.com/" target="_blank" rel="noopener noreferrer" className="trusted-logo">
                <img src="/dexify-logo.png" alt="Dexify" />
              </a>
              <a href="https://ralfi.io/" target="_blank" rel="noopener noreferrer" className="trusted-logo">
                <img src="/Ralfi ai.png" alt="Ralfi AI" style={{ height: 52 }} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why FeatureStream ────────────────────────────────────────────────────── */}
      <WhyFeatureStream />

      {/* ── Supported by ─────────────────────────────────────────────── */}
      <section className="trusted-by-section" style={{ padding: "0 24px 56px", position: "relative", zIndex: 1, background: "transparent" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          {/* Supported by */}
          <div style={{ marginTop: 40 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <span className="eyebrow" style={{ color: "#55524C" }}>Supported by</span>
            </div>
            <div className="backers-row" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 56, flexWrap: "wrap" }}>
              <a href="https://www.blackbird.vc/giants" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 10, opacity: 0.55, filter: "grayscale(1)" }} onMouseEnter={e => { const el = e.currentTarget; el.style.opacity = "1"; el.style.filter = "none"; }} onMouseLeave={e => { const el = e.currentTarget; el.style.opacity = "0.55"; el.style.filter = "grayscale(1)"; }}>
                <img src="/blackbird logo.jpg" alt="Blackbird VC" style={{ height: 44, width: "auto", objectFit: "contain", borderRadius: 8 }} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#000" }}>Blackbird VC Giants</span>
              </a>
              <a href="https://www.sydney.edu.au/business/study/student-experience/sydney-genesis.html" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", opacity: 0.45, filter: "grayscale(1)" }} onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity = "1"; el.style.filter = "none"; }} onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.opacity = "0.45"; el.style.filter = "grayscale(1)"; }}>
                <img className="backer-genesis" src="/genesis-transparent.png" alt="University of Sydney Genesis" style={{ height: 90, maxWidth: "100%", width: "auto", objectFit: "contain" }} />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── Integrations ─────────────────────────────────────────────────── */}
      <IntegrationsShowcase />

      {/* ── Built for agentic products (bento) ─────────────────────────── */}
      <AgenticBento />

      {/* ── Feature Selection preview ───────────────────────────────────────── */}
      <section className="feat-section" style={{ background: "#fff", padding: "0 24px 80px" }}>
        {/* Cream card: heading + ChooseAnimation */}
        <div id="product" className="feat-card" style={{ scrollMarginTop: 96, maxWidth: 1160, margin: "0 auto", borderRadius: 24, background: "#F6F5F2", padding: "64px 64px 0 64px", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 48, alignItems: "center" }}>
          {/* Left — copy */}
          <div style={{ paddingBottom: 64 }}>
            <h2 style={{ margin: "0 0 18px", fontSize: "clamp(32px, 3.4vw, 50px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#000", fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
              Select the right features to build next.
            </h2>
            <p style={{ margin: "0 0 28px", fontSize: 16, lineHeight: 1.7, color: "#000", maxWidth: "36ch", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
              FeatureStream surfaces the most impactful features for your AI agent, refreshed continuously from your live signals. Approve or reject each one, then ship straight to Jira.
            </p>
            {/* Feature rows */}
            {[
              {
                label: "Customer signals ranked by evidence",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
              },
              {
                label: "Competitor gaps surfaced by use case",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>,
              },
              {
                label: "Approved features shipped straight to Jira",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>,
              },
            ].map(({ label, icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <div className="icon-dot" style={{ width: 40, height: 40 }}>
                  {icon}
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0F0B1E", fontFamily: "var(--font-schibsted), system-ui, sans-serif", lineHeight: 1.3 }}>{label}</span>
              </div>
            ))}
          </div>
          {/* Right — animated frame */}
          <div className="feat-frame" style={{ alignSelf: "center", paddingBottom: 64 }}>
            <ChooseAnimation />
          </div>
        </div>

        {/* Roadmap cream card */}
        <div className="feat-card" style={{ maxWidth: 1160, margin: "48px auto 0", borderRadius: 24, background: "#F6F5F2", padding: "64px 64px 0 64px", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 48, alignItems: "center" }}>
          <div style={{ paddingBottom: 64 }}>
            <h2 style={{ margin: "0 0 18px", fontSize: "clamp(32px, 3.4vw, 50px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#000", fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
              Align your team around what to build next.
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "#000", maxWidth: "36ch", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
              Approved features drop straight into your roadmap, sorted into Now, Next and Later based on real customer insights and usage analytics — tying everything back to what you should build, when, and why.
            </p>
          </div>
          <div className="feat-frame" style={{ alignSelf: "center", paddingBottom: 64 }}>
            <PlanAnimation />
          </div>
        </div>

        {/* Know cream card */}
        <div className="feat-card" style={{ maxWidth: 1160, margin: "48px auto 0", borderRadius: 24, background: "#F6F5F2", padding: "64px 64px 0 64px", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 48, alignItems: "center" }}>
          <div style={{ paddingBottom: 64 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "clamp(32px, 3.4vw, 50px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#000", fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
              Know exactly what you&apos;ve built.
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: 17, lineHeight: 1.7, color: "#000", maxWidth: "36ch", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
              Keep track of every product detail with the Product Catalogue.
            </p>
            <div style={{ margin: 0, display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {[
                "Customer requests organised by product features, errors and UI changes.",
                "The reasoning behind each recommended feature and use case.",
                "Features tagged by status: Planned, In Development, Shipped.",
                "Prompt and version changelogs for agentic errors.",
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span className="icon-dot" style={{ width: 8, height: 8, marginTop: 9 }} />
                  <span style={{ fontSize: 15.5, lineHeight: 1.65, color: "#0F0B1E", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="feat-frame" style={{ alignSelf: "center", paddingBottom: 64 }}>
            <KnowAnimation />
          </div>
        </div>

        {/* ── AI Assistant card ──────────────────────────────────────────────── */}
        <div className="feat-card" style={{ maxWidth: 1160, margin: "48px auto 0", borderRadius: 24, background: "#F6F5F2", padding: "64px 64px 0 64px", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 48, alignItems: "center", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
          <div style={{ paddingBottom: 64 }}>
            <h2 className="display" style={{ fontSize: "clamp(32px,3.4vw,50px)", lineHeight: 1.05, margin: "0 0 18px" }}>
              Ask anything about your product.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#000", margin: 0, maxWidth: "36ch" }}>
              Query every part of your product management process in plain language — feature signals, agent behaviour, support patterns, post-launch metrics. Every answer is grounded in your live product data.
            </p>
          </div>
          <div className="feat-frame" style={{ alignSelf: "center", paddingBottom: 64 }}>
            <AskAnimation />
          </div>
        </div>

      </section>

      {/* ── Product Specs ──────────────────────────────────────────────────── */}
      <section className="home-section" style={{ padding: "80px 24px 88px", background: "#fff", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 className="display" style={{ fontSize: "clamp(30px,3.2vw,46px)", lineHeight: 1.08, margin: "0 0 52px", maxWidth: "28ch" }}>
            FeatureStream creates product specifications tailored to each iteration and build cycle.
          </h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 36 }}>
            {([
              {
                label: "PRDs (with written specs and flowcharts)",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
              },
              {
                label: "UI design reviews and wireframing",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>,
              },
              {
                label: "Agentic Fixes spec",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>,
              },
            ] as { label: string; icon: React.ReactNode }[]).map(({ label, icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div className="icon-dot" style={{ width: 56, height: 56 }}>
                  {icon}
                </div>
                <span style={{ fontSize: "clamp(18px,2vw,24px)", fontWeight: 500, color: "#000", letterSpacing: "-0.015em", lineHeight: 1.2 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Painted CTA band ── */}
      <section className="home-cta-section" style={{ padding: "0 24px 88px", background: "#fff", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
        <div
          className="cta-band"
          style={{ background: "linear-gradient(180deg, rgba(196, 104, 80, 0.10), rgba(196, 104, 80, 0.22)), url(/cta-sunset.jpg) center 58% / cover no-repeat", minHeight: "clamp(300px, 36vw, 440px)" }}
        >
          <h2 className="display">Maintain and ship the best agentic products.</h2>
          <WaitlistForm buttonStyle={{ background: "#fff", padding: "16px 28px", fontSize: 16, borderRadius: 10, boxShadow: "0 8px 24px rgba(150,60,40,0.22)" }} />
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


      <SiteFooter />

</div>
  );
}


