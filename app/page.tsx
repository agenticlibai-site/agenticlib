"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { domains } from "@/data/agents";
import { useRouter, usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { Target, Lightbulb, ArrowLeftRight, Database, Rocket, Users, Share2, Mail, X as XIcon, ArrowUp, MessageCircle } from "lucide-react";


export default function Home() {
  const [query, setQuery] = useState("");
  const videoPlayedRef = useRef(false);

  const handleVideoPlay = () => {
    if (videoPlayedRef.current) return;
    videoPlayedRef.current = true;
    fetch("/api/notify-play", { method: "POST" }).catch(() => {});
  };
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = () => {
    const q = query.toLowerCase().trim();

    const match = domains.find((d) =>
      d.name.toLowerCase().includes(q) ||
      d.slug.toLowerCase().includes(q)
    );

    trackEvent("library_searched", {
      query: q,
      matched_domain: match?.slug ?? null,
    });

    if (match) {
      router.push(`/domain/${match.slug}`);
    } else {
      router.push("/explore");
    }
  };

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

          {/* NAV — centred in remaining space */}
          <div className="flex-1 flex justify-center">
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
        </div>
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


        {/* LIBRARY */}
        <section id="library" className="pb-8" style={{ marginTop: "4px" }}>
          <div className="max-w-[960px] mx-auto px-6">
            <div
              className="px-6 py-5"
              style={{
                background: "linear-gradient(135deg, #fafbff 0%, #f5f7ff 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: "1.5rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <h2 className="text-xl font-semibold text-center mb-4 text-zinc-800">
                Explore AI Agent Library
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 items-center">

                <input
                  type="text"
                  placeholder="Search business domains..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="w-full sm:flex-[2] px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />

                <div className="relative w-full sm:flex-[2]">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        trackEvent("domain_selected_from_dropdown", {
                          domain_slug: e.target.value,
                        });
                        router.push(`/domain/${e.target.value}`);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-zinc-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    defaultValue=""
                  >
                    <option value="">Select Business Domain</option>
                    {domains.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">
                    ▼
                  </div>
                </div>

                <Link
                  href="/explore"
                  onClick={() => trackEvent("library_explore_clicked", {})}
                  className="w-full sm:flex-1 px-6 py-2.5 rounded-xl text-white font-medium transition hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap text-center"
                  style={{
                    background: "linear-gradient(135deg, #6c4cf1 0%, #4f7cf5 100%)",
                    boxShadow: "0 4px 14px rgba(108,76,241,0.25)",
                  }}
                >
                  Explore →
                </Link>

              </div>
            </div>
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
                  Icon: Users,
                  title: "Built for non-technical teams",
                  body: "You don't need to understand APIs or integrations. If you know what problem you're trying to solve, AgenticLib finds the agent that solves it.",
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
        <div className="max-w-6xl mx-auto px-8 py-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition">Privacy Policy</Link>
          <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition">Terms &amp; Conditions</Link>
        </div>
      </footer>

</div>
  );
}