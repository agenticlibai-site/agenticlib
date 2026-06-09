"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target, Lightbulb, ArrowLeftRight, Database, Rocket, Users, Share2, Mail, X as XIcon, ArrowUp, MessageCircle, BarChart2 } from "lucide-react";


export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productExpanded, setProductExpanded] = useState(false);
  const videoPlayedRef = useRef(false);

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
      <header className="fixed top-0 inset-x-0 z-[999] px-4 pt-3 pointer-events-auto">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", border: "0.5px solid rgba(255,255,255,0.9)", borderRadius: "14px" }}>

          {/* LOGO */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="AgenticLib logo" className="h-6 w-auto" />
            <span className="text-lg font-semibold tracking-tight">
              AgenticLib
            </span>
          </div>

          {/* NAV — centred in remaining space, hidden on mobile */}
          <div className="flex-1 justify-center hidden md:flex">
<nav className="flex items-center gap-8">

  {/* Product dropdown */}
  <div className="relative group">
    <button
      className="transition px-3 py-1.5 rounded-lg flex items-center gap-1"
      style={{ fontSize: "13.5px", fontWeight: 400, color: "#52525b", background: "none", border: "none", cursor: "pointer" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"; (e.currentTarget as HTMLButtonElement).style.color = "#18181b"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; (e.currentTarget as HTMLButtonElement).style.color = "#52525b"; }}
    >
      Product
      <span className="text-[11px] font-medium leading-none px-2 py-[2px] rounded-full bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">Alpha v1.0</span>
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
          { label: "AI Agent Library", href: "/explore", desc: "Browse all agents across every domain", iconBg: "linear-gradient(135deg,#16a34a,#4ade80)", icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity=".9"/><rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity=".6"/><rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity=".6"/><rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity=".9"/></svg>
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

  {/* Resources dropdown */}
  <div className="relative group">
    <button
      className="transition px-3 py-1.5 rounded-lg flex items-center gap-1"
      style={{ fontSize: "13.5px", fontWeight: 400, color: "#52525b", background: "none", border: "none", cursor: "pointer" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)"; (e.currentTarget as HTMLButtonElement).style.color = "#18181b"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; (e.currentTarget as HTMLButtonElement).style.color = "#52525b"; }}
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
      </div>
    </div>
  </div>

  {/* About */}
  <Link
    href="/#about"
    onClick={(e) => {
      if (pathname === "/") {
        e.preventDefault();
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
      }
    }}
    className="transition px-3 py-1.5 rounded-lg"
    style={{ fontSize: "13.5px", fontWeight: 400, color: "#52525b" }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.05)"; (e.currentTarget as HTMLAnchorElement).style.color = "#18181b"; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; (e.currentTarget as HTMLAnchorElement).style.color = "#52525b"; }}
  >
    About
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
    className="transition px-3 py-1.5 rounded-lg"
    style={{ fontSize: "13.5px", fontWeight: 400, color: "#52525b" }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.05)"; (e.currentTarget as HTMLAnchorElement).style.color = "#18181b"; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; (e.currentTarget as HTMLAnchorElement).style.color = "#52525b"; }}
  >
    Contact Us
  </Link>

</nav>
          </div>
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
                  { label: "AI Agent Library", href: "/explore" },
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
              { label: "Blog", href: "/blog" },
              { label: "About", href: "/#about" },
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

      <main className="pt-16 relative z-0">

        {/* HERO */}
        <section className="relative z-0 max-w-6xl mx-auto px-6 pt-20 pb-8 text-center">

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-8" style={{ lineHeight: 1.15 }}>
            Choosing the right <span className="gradient-text">AI agent</span>, made simple.
          </h1>

          <p className="text-lg text-zinc-700 mx-auto mb-10" style={{ maxWidth: "500px" }}>
            Stop researching. Start using the right one.
          </p>

          <div className="flex justify-center w-full">
            <a
              href="#demo"
              className="text-white font-medium transition hover:opacity-90"
              style={{
                background: "#F0607E",
                padding: "16px 40px",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(240, 96, 126, 0.3)",
              }}
            >
              Watch demo
            </a>
          </div>

        </section>



        {/* DEMO */}
        <section id="demo" className="pb-10 text-center" style={{ marginTop: "12px" }}>

          <h2 className="text-4xl font-semibold mb-3">
            See how it works
          </h2>
          <p className="text-zinc-900 text-base mb-6">
            Watch how AgenticLib turns a few simple questions into tailored AI agent recommendations.
          </p>

          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border">
            <video
              src="/AgenticLib demo video.mp4"
              controls
              poster="/recommendations-cover.png"
              className="w-full"
              onPlay={handleVideoPlay}
            />
          </div>

        </section>

        {/* FEEDBACK CARD */}
        <FeedbackCard />

        {/* DEMO 2 */}
        <section className="pb-10 text-center" style={{ marginTop: "48px" }}>

          <h2 className="text-4xl font-semibold mb-3">
            Where we&apos;re headed
          </h2>
          <p className="text-zinc-900 text-base mb-6">
            Compare, research, and decide — all in one place.
          </p>

          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border">
            <video
              src="/C&R Video.mp4"
              controls
              autoPlay={false}
              poster="/research-cover.png"
              className="w-full"
            />
          </div>

        </section>

        {/* WHAT MAKES US UNIQUE */}
        <section id="about" className="py-16 px-6">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-semibold mb-3 text-zinc-900">
              What makes us unique?
            </h2>
            <p className="text-zinc-900 text-xl font-medium mb-10 whitespace-nowrap">
              Built differently from the start - so finding the right AI agent actually feels easy.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {[
                {
                  Icon: Target,
                  title: "Requirements-first matching",
                  body: "Most directories show you a list. AgenticLib starts by understanding what you actually need: your team size, workflow, and goals. It then matches you to the right agent. No browsing, no guesswork.",
                },
                {
                  Icon: Lightbulb,
                  title: "Dynamic, explainable matching",
                  body: "Every recommendation explains itself. See which agents were considered, why your top pick ranked highest, and what trade-offs exist, so you make the decision with full context, not blind trust.",
                },
                {
                  Icon: Rocket,
                  title: "Business domain oriented",
                  body: "AgenticLib is organised by industry - real estate, finance, marketing, customer support, and more. Every recommendation is built around the specific context and needs of your business domain.",
                },
                {
                  Icon: Database,
                  title: "Data-driven architecture",
                  body: "AgenticLib surfaces structured, decision-relevant intelligence rather than generic AI summaries. Every agent profile is built around the dimensions that actually matter for your use case.",
                },
                {
                  Icon: ArrowLeftRight,
                  title: "Compare agents seamlessly",
                  body: "Get a side-by-side breakdown of any two agents across capabilities, pricing, use cases, and visual performance metrics - all in one view.",
                },
                {
                  Icon: BarChart2,
                  title: "Prompt Analytics",
                  body: "See how AI agents are recommended, described, and rated across Claude Sonnet 4.6, GPT-5.5, and Gemini 3.5 in real queries. AgenticLib tracks LLM visibility and sentiment so you deploy with confidence, not guesswork.",
                },
              ].map(({ Icon, title, body }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 rounded-2xl p-6"
                  style={{
                    background: "#fafbff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <Icon size={32} strokeWidth={1.5} style={{ color: "#6c4cf1" }} />
                  <h3 className="font-semibold text-zinc-900 text-base leading-snug">{title}</h3>
                  <p className="text-zinc-800 text-base leading-relaxed">{body}</p>
                </div>
              ))}

            </div>
          </div>
        </section>

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

          <span
            className="inline-block text-xs font-medium px-4 py-1.5 rounded-full"
            style={{ background: "#EEF0FF", color: "#5B5BD6" }}
          >
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
          </div>
          <a href="https://launchpadly.co/startup/agenticlib" target="_blank" rel="noopener noreferrer">
            <img src="https://launchpadly.co/embed/badges/startup/agenticlib.svg?variant=light" alt="Launchpadly Startup Directory" width="220" height="48" style={{ display: "block", border: 0 }} />
          </a>
        </div>
      </footer>

</div>
  );
}

function FeedbackCard() {
  const [feedback, setFeedback] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!feedback.trim() || !industry.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/demo-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, industry }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-6 pb-2" style={{ marginTop: 32 }}>
      <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {status === "sent" ? (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">🙏</div>
            <p className="font-semibold text-zinc-800 mb-1">Thanks for your feedback!</p>
            <p className="text-sm text-zinc-500">It genuinely helps us build the right thing.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">What did you think of the demo?</h3>
              <p className="text-sm text-zinc-500">We&apos;re building AgenticLib and your feedback shapes what we build next.</p>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full rounded-xl px-4 py-3 text-sm text-zinc-800 resize-none focus:outline-none focus:ring-2"
              style={{ border: "1px solid #e5e7eb", background: "#fafafa" }}
            />
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Your industry or domain"
              required
              className="w-full rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:ring-2"
              style={{ border: "1px solid #e5e7eb", background: "#fafafa" }}
            />
            <button
              type="submit"
              disabled={status === "sending" || !feedback.trim() || !industry.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#5B5BD6" }}
            >
              {status === "sending" ? "Sending..." : "Submit Feedback"}
            </button>
            {status === "error" && <p className="text-xs text-red-500 text-center">Something went wrong — please try again.</p>}
          </form>
        )}
      </div>
    </section>
  );
}