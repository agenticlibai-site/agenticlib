"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Share2, Mail, X as XIcon, ArrowUp, MessageCircle } from "lucide-react";
import IntelligenceModules from "@/components/IntelligenceModules";

const DOMAINS = [
  { label: "Marketing", href: "/solutions/marketing" },
  { label: "Skincare", href: "/solutions/skincare" },
  { label: "Sales", href: "/product/sales-visibility" },
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

function PricingModal({ plan, onClose }: { plan: "free" | "premium"; onClose: () => void }) {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/pricing-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const isPremium = plan === "premium";
  const accent = isPremium ? "#C2186A" : "#7C3AED";
  const gradient = isPremium
    ? "linear-gradient(95deg, #7C3AED, #C2186A)"
    : "linear-gradient(95deg, #7C3AED, #9D174D)";

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
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0F0B1E", margin: "0 0 10px" }}>You&apos;re on the list</h3>
            <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 1.6, margin: 0 }}>
              We&apos;ll be in touch at <strong>{email}</strong> shortly.
            </p>
          </div>
        ) : (
          <>
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase" as const, color: accent,
              background: `rgba(${isPremium ? "194,24,106" : "124,58,237"},0.09)`,
              borderRadius: 999, padding: "3px 10px", marginBottom: 16,
            }}>
              {isPremium ? "Premium" : "Free"}
            </span>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#0F0B1E", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              {isPremium ? "Get started with Premium" : "Get started for free"}
            </h3>
            <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 1.55, margin: "0 0 24px" }}>
              {isPremium
                ? "Enter your email and we’ll get in touch."
                : "Enter your email and we’ll get in touch."}
            </p>
            <form onSubmit={submit}>
              <input
                type="email"
                required
                autoFocus
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box" as const,
                  padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500,
                  border: `1.5px solid rgba(${isPremium ? "194,24,106" : "124,58,237"},0.28)`,
                  outline: "none", marginBottom: 14, fontFamily: "inherit", color: "#000",
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
                  background: gradient, color: "#fff",
                  fontSize: 15, fontWeight: 700, opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? "Sending…" : "Get started"}
              </button>
            </form>
          </>
        )}
      </div>
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

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productExpanded, setProductExpanded] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [pricingModal, setPricingModal] = useState<{ open: boolean; plan: "free" | "premium" }>({ open: false, plan: "free" });
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
      {pricingModal.open && <PricingModal plan={pricingModal.plan} onClose={() => setPricingModal(p => ({ ...p, open: false }))} />}
      <style>{`
        @media (max-width: 640px) {
          .hero-card-wrapper { margin: 8px 12px 16px !important; }
          .hero-content { padding: 36px 18px 32px !important; min-height: 360px !important; }
          .hero-tagline-text { font-size: 16px !important; }
          .hero-subhead { margin-top: 20px !important; font-size: 14px !important; }
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
            <div className="absolute inset-0" style={{
              background: [
                "radial-gradient(circle at 2% 0%,    rgba(124,58,237,.65)  0%, transparent 48%)",
                "radial-gradient(circle at 100% 4%,  rgba(94,108,232,.55)  0%, transparent 50%)",
                "radial-gradient(circle at 98% 100%, rgba(240,97,122,.50)  0%, transparent 50%)",
                "radial-gradient(circle at 0% 100%,  rgba(199,60,142,.45)  0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%,  rgba(250,217,236,.35) 0%, transparent 60%)",
              ].join(", "),
            }} />
            <div className="absolute inset-0" style={{
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
              Comparison intelligence for{" "}
              <span style={{ display: "inline-block", background: "linear-gradient(95deg, #6B4FBB 15%, #E8447A 85%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", paddingBottom: "0.15em" }}>
                AI Agent Builders
              </span>
            </h1>

              {/* Subhead */}
              <p className="hero-subhead text-base md:text-lg mx-auto" style={{ color: "#000000", maxWidth: "520px", lineHeight: 1.35, marginTop: "40px", fontWeight: 700 }}>
                Get an edge on your product feature growth, know your competitive landscape and scale in LLM visibility to show up where your buyers are asking.
              </p>

              {/* CTA */}
              <button
                onClick={() => document.getElementById("sage-ai")?.scrollIntoView({ behavior: "smooth" })}
                style={{ marginTop: 36, display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(95deg, #7C3AED, #C2186A)", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 9999, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(124,58,237,0.35)", transition: "box-shadow 0.2s ease, transform 0.15s ease" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 8px 32px rgba(124,58,237,0.50)"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 4px 20px rgba(124,58,237,0.35)"; el.style.transform = "translateY(0)"; }}
              >
                Get started <span aria-hidden style={{ fontSize: 17 }}>›</span>
              </button>

          </div>
        </section>
        </div>
        </div>

      </main>

      {/* ── Trusted By ────────────────────────────────────────────────────── */}
      <section style={{ padding: "44px 24px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.12)" }} />
            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#000", whiteSpace: "nowrap" }}>
              Trusted by
            </span>
            <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.12)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            <a href="https://www.dewwie.com/" target="_blank" rel="noopener noreferrer" className="dewwie-logo" style={{ textDecoration: "none" }}>dewwie</a>
            <a href="https://lamigo.ai/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", outline: "none", borderBottom: "none", display: "flex", alignItems: "center", opacity: 0.45, filter: "grayscale(1)" }} onMouseEnter={e => { const el = e.currentTarget; el.style.opacity = "1"; el.style.filter = "grayscale(1) brightness(0)"; el.style.textDecoration = "none"; }} onMouseLeave={e => { const el = e.currentTarget; el.style.opacity = "0.45"; el.style.filter = "grayscale(1)"; el.style.textDecoration = "none"; }}>
              <img src="/lamigo logo .png" alt="Lamigo" style={{ height: 38, width: "auto", objectFit: "contain" }} />
            </a>
          </div>

          {/* Supported by */}
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.12)" }} />
              <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#000", whiteSpace: "nowrap" }}>
                Supported by
              </span>
              <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.12)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 10 }}>
              <a href="https://www.blackbird.vc/giants" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 10, opacity: 0.55, filter: "grayscale(1)" }} onMouseEnter={e => { const el = e.currentTarget; el.style.opacity = "1"; el.style.filter = "none"; }} onMouseLeave={e => { const el = e.currentTarget; el.style.opacity = "0.55"; el.style.filter = "grayscale(1)"; }}>
                <img src="/blackbird logo.jpg" alt="Blackbird VC" style={{ height: 44, width: "auto", objectFit: "contain", borderRadius: 8 }} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#000" }}>Blackbird VC Giants</span>
              </a>
            </div>
          </div>

          {/* Testimonial */}
          <div style={{ maxWidth: 560, margin: "40px auto 0", textAlign: "center" }}>
            <p style={{
              fontSize: 19,
              fontWeight: 700,
              lineHeight: 1.55,
              color: "#0F0B1E",
              letterSpacing: "-0.01em",
              margin: "0 0 18px",
            }}>
              &ldquo;Helped us map dewwie&apos;s features against the category to identify opportunities for differentiation, and making more informed product decisions.&rdquo;
            </p>
            <div style={{ width: 36, height: 3, background: "#5B5BD6", borderRadius: 2, margin: "0 auto 14px" }} />
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase" as const,
              color: "#888",
            }}>
              Founder, Dewwie
            </span>
          </div>
        </div>
      </section>

      {/* ── Why AgenticLib ────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#EEE8FD 0%,#E8E5FD 55%,#F0E9FD 100%)", padding: "36px 24px", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 0% 0%,rgba(124,58,237,.30) 0%,transparent 46%),radial-gradient(circle at 100% 6%,rgba(94,108,232,.24) 0%,transparent 48%),radial-gradient(circle at 92% 100%,rgba(167,139,250,.22) 0%,transparent 50%),radial-gradient(circle at 12% 100%,rgba(220,209,255,.30) 0%,transparent 52%),radial-gradient(circle at 52% 50%,rgba(255,255,255,.48) 0%,transparent 58%)", pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(64px) saturate(140%)", WebkitBackdropFilter: "blur(64px) saturate(140%)", background: "rgba(255,255,255,.18)", pointerEvents: "none" }}></div>
          <div className="why-grid" style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
            <div>
              <span style={{ display: "inline-block", border: "1px solid rgba(124,58,237,.30)", background: "rgba(255,255,255,.45)", color: "#000000", fontSize: 13.5, fontWeight: 600, letterSpacing: ".01em", padding: "7px 15px", borderRadius: 9 }}>Why AgenticLib</span>
              <h2 style={{ fontSize: "clamp(28px,3.2vw,42px)", fontWeight: 600, lineHeight: 1.14, letterSpacing: "-.025em", color: "#000000", margin: "26px 0 0", maxWidth: "18ch" }}>
                {"Insightful comparison intelligence on "}
                <span style={{ display: "inline", background: "linear-gradient(100deg,#7C3AED,#9B5DE5 60%,#C2186A)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>brand, product and use case</span>
                {" for AI agent builders"}
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.62, color: "#000000", margin: "22px 0 0", maxWidth: "52ch" }}>AgenticLib traces your agent brand from business domain to product feature, benchmarks your visibility against competition and turns your feature gaps into a roadmap - so you show up where your buyers are actually asking.</p>
            </div>
            <div className="why-visual" style={{ position: "relative", height: 360, display: "flex", alignItems: "center", gap: 0, width: "100%", minWidth: 0 }}>
              <div style={{ position: "absolute", width: "82%", height: "60%", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(124,58,237,.25),transparent 70%)", filter: "blur(16px)" }}></div>
              <div style={{ flex: "none", position: "relative", zIndex: 3, width: 138, borderRadius: 22, padding: "20px 14px", background: "linear-gradient(150deg,#7C3AED 0%,#9B5DE5 52%,#5E6CE8 100%)", boxShadow: "0 18px 42px rgba(124,58,237,.40)", textAlign: "center" }}>
                <span style={{ display: "inline-flex", width: 48, height: 48, borderRadius: 13, background: "#fff", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 14px rgba(124,58,237,.22)", overflow: "hidden" }}>
                  <img src="/logo.png" alt="AgenticLib" style={{ width: 34, height: 34, objectFit: "contain" }} />
                </span>
                <div style={{ marginTop: 13, color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-.01em" }}>AgenticLib Comparison Intelligence</div>
              </div>
              <svg viewBox="0 0 200 400" preserveAspectRatio="none" style={{ flex: 1, minWidth: 0, alignSelf: "stretch", height: "100%", overflow: "hidden", zIndex: 2 }}>
                <defs>
                  <linearGradient id="aab-cgLine" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="200" y2="200">
                    <stop offset="0" stopColor="#7C3AED" /><stop offset="1" stopColor="#5E6CE8" />
                  </linearGradient>
                </defs>
                <path d="M0,200 C95,200 100,58 200,58" fill="none" stroke="url(#aab-cgLine)" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,200 L200,200" fill="none" stroke="url(#aab-cgLine)" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,200 C95,200 100,342 200,342" fill="none" stroke="url(#aab-cgLine)" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div style={{ flex: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 340, width: 190, zIndex: 3 }}>
                {[
                  { label: "Brand Intelligence", icon: <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="hp-ic1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#5E6CE8"/></linearGradient></defs><rect x="3" y="11" width="4.4" height="9" rx="1.6" fill="url(#hp-ic1)"/><rect x="9.8" y="5" width="4.4" height="15" rx="1.6" fill="url(#hp-ic1)"/><rect x="16.6" y="8.5" width="4.4" height="11.5" rx="1.6" fill="url(#hp-ic1)"/></svg> },
                  { label: "Product Feature Intelligence", icon: <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="url(#hp-ic2)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><defs><linearGradient id="hp-ic2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#5E6CE8"/></linearGradient></defs><path d="M12 2.5 L20.5 7 V17 L12 21.5 L3.5 17 V7 Z"/><path d="M3.5 7 L12 11.7 L20.5 7"/><path d="M12 11.7 V21.5"/></svg> },
                  { label: "Improvements", icon: <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="url(#hp-ic3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="hp-ic3" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#9B5DE5"/></linearGradient></defs><path d="M3.5 18.5 A8.5 8.5 0 0 1 20.5 18.5"/><path d="M12 18.5 L16.5 12.5"/><circle cx="12" cy="18.5" r="1.7" fill="url(#hp-ic3)" stroke="none"/></svg> },
                ].map(({ label, icon }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(255,255,255,.58)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 16, padding: "13px 16px 13px 13px", boxShadow: "0 10px 26px rgba(124,58,237,.12)" }}>
                    <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: "rgba(124,58,237,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "#000000", letterSpacing: "-.01em" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px 80px", fontFamily: "var(--font-schibsted), system-ui, sans-serif" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>

          {/* Hook quote */}
          <div style={{ marginBottom: 60 }}>
            <p style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#5B21B6", marginBottom: 20 }}>The problem</p>
            <p style={{ fontSize: "clamp(20px, 2.6vw, 30px)", fontWeight: 700, fontStyle: "italic" as const, lineHeight: 1.45, color: "#0F0B1E", maxWidth: "52ch", letterSpacing: "-0.02em" }}>
              Most AI agent builders only learn who they&rsquo;re losing to and what product feature to build next{" "}
              <span style={{ display: "inline", background: "linear-gradient(95deg,#7C3AED,#C2186A)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>when a customer says so out loud.</span>
            </p>
          </div>

          {/* Bridge heading */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 700, color: "#0F0B1E", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2 }}>
              Here&rsquo;s how AgenticLib{" "}
              <span style={{ display: "inline", background: "linear-gradient(95deg,#7C3AED,#C2186A)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>keeps you ahead.</span>
            </p>
          </div>

          {/* 3 steps */}
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {([
              {
                n: "01", accent: "#7C3AED",
                title: "We track what's shipping.",
                desc: "We scan your competitors: what's launched, what's changed, what's new in your category, so you're not finding out from a lost deal.",
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
                desc: "A prioritized 3-month roadmap of what to build, plus a clear path to becoming LLM-visible in the use cases you want to own, so you compete where your buyers are already asking.",
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
              <div key={n} style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(124,58,237,0.09)", borderRadius: 18, padding: "28px 24px", display: "flex", flexDirection: "column" as const, gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: accent }}>{n}</span>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F0B1E", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.25 }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(15,11,30,0.55)", margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Intelligence Modules ──────────────────────────────────────────── */}
      <div id="sage-ai" style={{ marginTop: 20 }}><IntelligenceModules /></div>

      {/* ── Customised Reports ────────────────────────────────────────────────── */}
      <section className="cr-section" style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", padding: "0 24px 0", marginTop: -32 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Divider label */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.35))" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#4C1D95" }}>Also from AgenticLib</span>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(124,58,237,0.35), transparent)" }} />
          </div>

          {/* Main content */}
          <div className="cr-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            {/* Left — copy */}
            <div>
              <h2 style={{ fontSize: "clamp(28px,3vw,42px)", fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.08, margin: "0 0 18px", color: "#0F0B1E" }}>
                Want a customised<br />report instead?
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(15,11,30,0.58)", margin: "0 0 32px", maxWidth: "42ch" }}>
                We build intelligence reports tailored to your agent, your business domain, use case, and your growth goals - delivered as a detailed roadmap you can act on straight away.
              </p>
              <button
                onClick={() => setReportModalOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(95deg, #7C3AED, #C2186A)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 28px", borderRadius: 9999, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(124,58,237,0.30)", transition: "box-shadow 0.2s ease, transform 0.15s ease" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 8px 32px rgba(124,58,237,0.46)"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 4px 20px rgba(124,58,237,0.30)"; el.style.transform = "translateY(0)"; }}
              >
                Get your free report <span aria-hidden style={{ fontSize: 16 }}>›</span>
              </button>
            </div>

            {/* Right — what's inside */}
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {([
                {
                  n: "01", title: "Product Feature Scores",
                  desc: "Know exactly which features get you cited — scored across security, integrations, pricing, and capability, mapped to what matters for your buyers.",
                  bg: "linear-gradient(160deg,#F3EEFE,#EDE6FD)",
                  icon: <svg width="54" height="38" viewBox="0 0 118 84" fill="none"><defs><linearGradient id="cr-chk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7C3AED"/><stop offset="1" stopColor="#A86BF0"/></linearGradient></defs><rect x="4" y="6" width="20" height="20" rx="6" fill="url(#cr-chk)"/><path d="M9 16 L13 20 L19 12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/><rect x="34" y="12" width="80" height="8" rx="4" fill="#D8C8F6"/><rect x="4" y="32" width="20" height="20" rx="6" fill="#E2D5FA"/><path d="M9 42 L13 46 L19 38" stroke="#A86BF0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/><rect x="34" y="38" width="62" height="8" rx="4" fill="#E4DAF8"/><rect x="4" y="58" width="20" height="20" rx="6" fill="url(#cr-chk)"/><path d="M9 68 L13 72 L19 64" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/><rect x="34" y="64" width="72" height="8" rx="4" fill="#D8C8F6"/></svg>,
                },
                {
                  n: "02", title: "Brand & Use Case Benchmarking",
                  desc: "See where rivals outrank you and why — share of voice by use case, who owns each buying moment, and what it takes to close the gap.",
                  bg: "linear-gradient(160deg,#EEF0FE,#E5E9FD)",
                  icon: <svg width="54" height="38" viewBox="0 0 120 84" fill="none"><defs><linearGradient id="cr-bar" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#5E6CE8"/><stop offset="1" stopColor="#8E63D6"/></linearGradient></defs><rect x="8" y="50" width="13" height="30" rx="3.5" fill="#C7CEF4"/><rect x="24" y="30" width="13" height="50" rx="3.5" fill="url(#cr-bar)"/><rect x="50" y="58" width="13" height="22" rx="3.5" fill="#C7CEF4"/><rect x="66" y="18" width="13" height="62" rx="3.5" fill="url(#cr-bar)"/><rect x="92" y="44" width="13" height="36" rx="3.5" fill="#C7CEF4"/><rect x="108" y="34" width="11" height="46" rx="3.5" fill="url(#cr-bar)"/></svg>,
                },
                {
                  n: "03", title: "Sentiment & Brand Coverage",
                  desc: "Hear what LLMs actually say about you — the words, tone, and tags used when a buyer asks Claude or GPT to recommend an agent like yours.",
                  bg: "linear-gradient(160deg,#FCEAF3,#F8DFEC)",
                  icon: <svg width="50" height="40" viewBox="0 0 110 90" fill="none" stroke="url(#cr-node)" strokeWidth="2.4"><defs><linearGradient id="cr-node" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#C2186A"/><stop offset="1" stopColor="#E0506A"/></linearGradient></defs><line x1="30" y1="28" x2="58" y2="20"/><line x1="30" y1="28" x2="40" y2="58"/><line x1="58" y1="20" x2="80" y2="44"/><line x1="40" y1="58" x2="80" y2="44"/><line x1="40" y1="58" x2="66" y2="72"/><circle cx="30" cy="28" r="6" fill="url(#cr-node)" stroke="none"/><circle cx="58" cy="20" r="6" fill="#fff"/><circle cx="80" cy="44" r="6" fill="url(#cr-node)" stroke="none"/><circle cx="40" cy="58" r="6" fill="#fff"/><circle cx="66" cy="72" r="6" fill="url(#cr-node)" stroke="none"/></svg>,
                },
                {
                  n: "04", title: "LLM Visibility Playbook",
                  desc: "Your actionable playbook for getting cited by Claude and GPT — grounded in what's actually indexed today.",
                  bg: "linear-gradient(160deg,#FCE7F3,#FDF2F8)",
                  icon: <svg width="48" height="40" viewBox="0 0 100 84" fill="none"><defs><linearGradient id="cr-play" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#DB2777"/><stop offset="1" stopColor="#F472B6"/></linearGradient></defs><rect x="8" y="60" width="22" height="14" rx="3" fill="rgba(219,39,119,0.12)"/><rect x="8" y="60" width="22" height="3" rx="1.5" fill="url(#cr-play)"/><rect x="34" y="40" width="22" height="34" rx="3" fill="rgba(219,39,119,0.10)"/><rect x="34" y="40" width="22" height="3" rx="1.5" fill="url(#cr-play)"/><rect x="60" y="20" width="22" height="54" rx="3" fill="rgba(219,39,119,0.08)"/><rect x="60" y="20" width="22" height="3" rx="1.5" fill="url(#cr-play)"/><circle cx="19" cy="57" r="7" fill="url(#cr-play)"/><path d="M15.5 57 L18 59.5 L22.5 54.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="45" cy="37" r="7" fill="url(#cr-play)"/><path d="M41.5 37 L44 39.5 L48.5 34.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="71" cy="17" r="7" fill="url(#cr-play)"/><path d="M67.5 17 L70 19.5 L74.5 14.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                },
              ] as { n: string; title: string; desc: string; bg: string; icon: React.ReactNode }[]).map(({ n, title, desc, bg, icon }) => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.08)" }}>
                  <span style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, fontWeight: 700, color: "rgba(124,58,237,0.45)", flexShrink: 0 }}>{n}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F0B1E", marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12.5, color: "#0F0B1E", lineHeight: 1.45 }}>{desc}</div>
                  </div>
                  <div style={{ flexShrink: 0, width: 72, height: 52, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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

      {/* ── Pricing Section ── */}
      <section id="pricing" style={{ background: "transparent", paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-5xl mx-auto px-6">

          <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.06, color: "#000000", margin: "0 0 40px", textAlign: "center" }}>Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 780, margin: "0 auto" }}>

            {/* Free card */}
            <div style={{
              background: "#fff",
              border: "1.5px solid rgba(124,58,237,0.15)",
              borderRadius: 20,
              padding: "32px 32px 36px",
              display: "flex",
              flexDirection: "column" as const,
              boxShadow: "0 4px 24px rgba(124,58,237,0.07)",
            }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{
                  display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase" as const, color: "#7C3AED",
                  background: "rgba(124,58,237,0.08)", borderRadius: 999, padding: "3px 10px", marginBottom: 16,
                }}>Free</span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: "#0F0B1E", letterSpacing: "-0.03em", lineHeight: 1 }}>$0</span>
                <span style={{ fontSize: 14, color: "rgba(15,11,30,0.45)", marginLeft: 6, fontWeight: 500 }}>/month</span>
              </div>
              <p style={{ fontSize: 13.5, color: "rgba(15,11,30,0.55)", lineHeight: 1.55, marginBottom: 24 }}>
                Get your first AI agent visibility snapshot. See where you stand today.
              </p>
              <button
                onClick={() => setPricingModal({ open: true, plan: "free" })}
                style={{
                  display: "block", width: "100%", padding: "13px 0",
                  background: "transparent", border: "1.5px solid rgba(124,58,237,0.35)",
                  borderRadius: 10, color: "#7C3AED", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", letterSpacing: "0.01em",
                  transition: "background 0.18s ease, border-color 0.18s ease",
                  marginBottom: 28,
                }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(124,58,237,0.06)"; el.style.borderColor = "rgba(124,58,237,0.55)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "transparent"; el.style.borderColor = "rgba(124,58,237,0.35)"; }}
              >
                Get started free
              </button>
              <div style={{ borderTop: "1px solid rgba(15,11,30,0.08)", paddingTop: 24 }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "rgba(15,11,30,0.35)", marginBottom: 16 }}>What&rsquo;s included</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" as const, gap: 12 }}>
                  {[
                    "Single-domain visibility snapshot",
                    "Top brand mentions by LLM",
                    "Use case share of voice",
                    "Coverage over time chart",
                    "PDF report export",
                  ].map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: "#0F0B1E", lineHeight: 1.45 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="8" cy="8" r="8" fill="rgba(124,58,237,0.10)"/>
                        <path d="M4.5 8.2l2.3 2.3 4.2-4.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Premium card */}
            <div style={{
              background: "linear-gradient(145deg, #F3EEFE 0%, #FDE8F3 60%, #EEF0FE 100%)",
              border: "1.5px solid rgba(124,58,237,0.25)",
              borderRadius: 20,
              padding: "32px 32px 36px",
              display: "flex",
              flexDirection: "column" as const,
              boxShadow: "0 8px 40px rgba(124,58,237,0.14)",
            }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{
                  display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase" as const, color: "#C2186A",
                  background: "rgba(194,24,106,0.10)", borderRadius: 999, padding: "3px 10px", marginBottom: 16,
                }}>Premium</span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: "#0F0B1E", letterSpacing: "-0.03em", lineHeight: 1 }}>$25</span>
                <span style={{ fontSize: 14, color: "rgba(15,11,30,0.45)", marginLeft: 6, fontWeight: 500 }}>/month</span>
              </div>
              <p style={{ fontSize: 13.5, color: "rgba(15,11,30,0.60)", lineHeight: 1.55, marginBottom: 24 }}>
                Full competitive intelligence, ongoing monitoring, and a roadmap built for your product.
              </p>
              <button
                onClick={() => setPricingModal({ open: true, plan: "premium" })}
                style={{
                  display: "block", width: "100%", padding: "13px 0",
                  background: "linear-gradient(95deg, #7C3AED, #C2186A)",
                  border: "none", borderRadius: 10, color: "#fff",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  letterSpacing: "0.01em",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.30)",
                  transition: "box-shadow 0.18s ease, transform 0.15s ease",
                  marginBottom: 28,
                }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 8px 32px rgba(124,58,237,0.45)"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 4px 20px rgba(124,58,237,0.30)"; el.style.transform = "translateY(0)"; }}
              >
                Get started
              </button>
              <div style={{ borderTop: "1px solid rgba(124,58,237,0.15)", paddingTop: 24 }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "rgba(15,11,30,0.40)", marginBottom: 16 }}>Everything in Free, plus</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" as const, gap: 12 }}>
                  {[
                    "Multi-domain & competitor tracking",
                    "Product feature scores (50+ features)",
                    "Sentiment analysis across LLMs",
                    "LLM visibility playbook & roadmap",
                    "Monthly refresh cadence",
                  ].map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: "#0F0B1E", lineHeight: 1.45 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="8" cy="8" r="8" fill="rgba(194,24,106,0.12)"/>
                        <path d="M4.5 8.2l2.3 2.3 4.2-4.5" stroke="#C2186A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Social links ── */}
      <section id="contact" style={{ background: "transparent", paddingTop: 48, paddingBottom: 64 }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.35)", marginBottom: 14, letterSpacing: "0.05em" }}>Follow along as we build</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "https://www.linkedin.com/company/108024233/", Icon: Share2, label: "LinkedIn" },
              { href: "mailto:srinidhi.murali@agenticlib.com", Icon: Mail, label: "Email" },
              { href: "https://x.com/AgenticLibAI/status/1960527278087266557", Icon: XIcon, label: "X" },
              { href: "https://www.producthunt.com/p/self-promotion/agenticlib-simplifying-your-ai-agent-discovery-journey", Icon: ArrowUp, label: "Product Hunt" },
              { href: "https://www.reddit.com/r/SideProject/comments/1m6bfy1/agenticlib_simplifying_your_ai_agent_discovery/", Icon: MessageCircle, label: "Reddit" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.55)", transition: "background 0.18s ease, color 0.18s ease" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "rgba(0,0,0,0.10)"; el.style.color = "#000"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "rgba(0,0,0,0.05)"; el.style.color = "rgba(0,0,0,0.55)"; }}
              >
                <Icon size={14} strokeWidth={1.75} />
                {label}
              </a>
            ))}
          </div>
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


