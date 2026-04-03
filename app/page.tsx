import Link from "next/link";
export default function Home() {
  return (
    <div className="page-bg relative text-zinc-900 font-sans">

      {/* ── Background blobs ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Top-left blue blob */}
        <div
          className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full"
          style={{ background: "rgba(147,197,253,0.22)", filter: "blur(80px)" }}
        />
        {/* Top-right purple blob */}
        <div
          className="absolute -top-32 -right-48 w-[560px] h-[560px] rounded-full"
          style={{ background: "rgba(167,139,250,0.20)", filter: "blur(80px)" }}
        />
        {/* Bottom pink accent */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full"
          style={{ background: "rgba(249,168,212,0.12)", filter: "blur(72px)" }}
        />
      </div>

      {/* ── Nav ── */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3 relative">
        <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 shadow-sm rounded-xl px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">AgenticLib</span>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-500">
            <a href="#library" className="hover:text-zinc-900 transition-colors">Library</a>
            <a href="#agents" className="hover:text-zinc-900 transition-colors">Featured</a>
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">How it works</a>
          </nav>
          <a
            href="#recommend"
            className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-full hover:bg-zinc-700 transition-colors"
          >
            Get started
          </a>
        </div>
      </header>

      <main className="pt-16 relative z-10">

        {/* ── Hero ── */}
        <section id="recommend" className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 text-center overflow-visible">

          {/* Glow orb behind headline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 w-[720px] h-[320px] rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(96,165,250,0.20) 0%, rgba(139,92,246,0.18) 40%, rgba(236,72,153,0.10) 70%, transparent 85%)",
              filter: "blur(56px)",
            }}
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/30 text-zinc-600 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              250+ agents across 90+ domains
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-zinc-900 mb-5 max-w-3xl mx-auto">
              Get the right{" "}
              <span className="gradient-text">AI agent</span>
              {" "}in seconds
            </h1>

            <p className="text-lg md:text-xl text-zinc-500 max-w-lg mx-auto mb-12 leading-relaxed">
              Tell us your use case → we compare and recommend the best agents
            </p>

            {/* CTA group */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                No more trial and error
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <a
                  href="#library"
                  className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white text-base font-semibold px-9 py-4 rounded-full"
                >
                  Get personalised AI agent recommendations
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 px-6 py-4 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch demo
                </a>
              </div>
            </div>

            <p className="mt-10 text-xs text-zinc-400">
              Trusted by teams at{" "}
              <span className="text-zinc-600 font-medium">Notion</span>,{" "}
              <span className="text-zinc-600 font-medium">Linear</span>, and{" "}
              <span className="text-zinc-600 font-medium">Vercel</span>
            </p>
          </div>
        </section>

        {/* ── Explore Library ── */}
        <section id="library" className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="glass-card p-8 md:p-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
                  Explore AI Agent Library
                </h2>
                <p className="text-zinc-500 text-base">
                  Browse 250+ AI agents across 90+ domains
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search agents, tasks, workflows…"
                    className="glass-input w-full pl-10 pr-4 py-3 text-sm placeholder:text-zinc-400 text-zinc-800"
                  />
                </div>

                {/* Domain dropdown — glass style */}
                <div className="relative">
                  <select className="glass-input appearance-none w-full sm:w-44 pl-4 pr-9 py-3 text-sm text-zinc-700 cursor-pointer">
                    <option value="">All domains</option>
                    {DOMAINS.map((d) => (
                      <option key={d} value={d.toLowerCase()}>{d}</option>
                    ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                  <Link
                    href="/domains"
                    className="inline-flex items-center justify-center gap-1.5 bg-zinc-900 text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap"
                  >
                    Explore library
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                {["Content writing", "Lead generation", "Data analysis", "Customer support", "Code review"].map((tag) => (
                  <button
                    key={tag}
                    className="text-xs text-zinc-500 bg-white/70 hover:bg-white border border-zinc-200/60 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
                <span className="text-xs text-zinc-400 px-3 py-1.5">+ 85 more</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
                See how it works
              </h2>
              <p className="text-zinc-500 text-base max-w-md mx-auto">
                Watch how AgenticLib finds the best AI agent for your exact use case
              </p>
            </div>

            {/* Video placeholder */}
            <div className="relative max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/30 shadow-lg bg-gradient-to-br from-zinc-900 to-zinc-800 aspect-video flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6c4cf1]/20 to-[#e040a0]/10 opacity-70" />
              <div className="absolute inset-0 flex items-center justify-center opacity-15">
                <div className="grid grid-cols-3 gap-3 w-2/3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-white/20" />
                  ))}
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-zinc-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium opacity-80">Watch demo · 2 min</span>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <a
                href="#"
                className="btn-primary inline-flex items-center gap-2 text-white text-sm font-semibold px-7 py-3.5 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch demo
              </a>
            </div>
          </div>
        </section>

        {/* ── Categories ── */}
        <section id="categories" className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
                Browse by category
              </h2>
              <p className="text-zinc-500 text-base max-w-md mx-auto">
                Find agents purpose-built for your domain. Every category is hand-curated.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {CATEGORIES.map(({ label, description, icon, count }) => (
                <a
                  key={label}
                  href="#agents"
                  className="glass-card group p-6 block"
                >
                  <div className="text-2xl mb-4">{icon}</div>
                  <p className="font-semibold text-zinc-900 mb-1">{label}</p>
                  <p className="text-sm text-zinc-500 mb-4 leading-snug">{description}</p>
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-600 transition-colors">
                    {count} agents →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured agents ── */}
        <section id="agents" className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
                  Featured agents
                </h2>
                <p className="text-zinc-500 text-base">
                  Top-rated agents picked by our editorial team.
                </p>
              </div>
              <a href="#library" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors whitespace-nowrap">
                Browse AI agent library →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {AGENTS.map(({ name, category, description, badge, rating, tags }) => (
                <article key={name} className="glass-card flex flex-col p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        {category}
                      </span>
                      <h3 className="text-base font-semibold text-zinc-900 mt-0.5">{name}</h3>
                    </div>
                    {badge && (
                      <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full whitespace-nowrap">
                        {badge}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-zinc-500 leading-relaxed flex-1 mb-5">{description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {tags.map((tag) => (
                      <span key={tag} className="text-xs text-zinc-500 bg-white/70 border border-zinc-200/60 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/40">
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <span className="text-amber-400">★</span>
                      <span className="font-medium text-zinc-700">{rating}</span>
                      <span>/ 5.0</span>
                    </div>
                    <a href="#" className="text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white/70 hover:bg-white border border-zinc-200/60 px-3 py-1.5 rounded-full transition-colors">
                      View agent →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA band ── */}
        <section className="bg-zinc-900 text-white py-20 mx-6 mb-20 rounded-3xl max-w-6xl lg:mx-auto">
          <div className="max-w-2xl mx-auto text-center px-6">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Still not sure which agent to pick?
            </h2>
            <p className="text-zinc-400 text-base mb-4 leading-relaxed">
              Describe your workflow and we'll surface the top matching agents — ranked by
              capability, cost, and community trust.
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-8">
              No more trial and error
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#recommend"
                className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white text-base font-semibold px-9 py-4 rounded-full"
              >
                Get personalised AI agent recommendations
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#library"
                className="w-full sm:w-auto inline-flex items-center justify-center text-sm font-medium text-zinc-300 px-6 py-4 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
              >
                Browse AI agent library
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/30 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <span className="font-semibold text-zinc-600">AgenticLib</span>
          <nav className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-700 transition-colors">GitHub</a>
            <a href="#" className="hover:text-zinc-700 transition-colors">Twitter</a>
          </nav>
          <span>© 2026 AgenticLib. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

const DOMAINS = [
  "Marketing", "Sales", "Education", "Productivity",
  "Customer Support", "Data Analysis", "Engineering", "Legal", "Finance", "HR",
];

const CATEGORIES = [
  { label: "Marketing",   description: "Content creation, SEO, and campaign automation agents.", icon: "📣", count: 124 },
  { label: "Education",   description: "Tutoring, quiz generation, and learning path agents.",    icon: "🎓", count: 87  },
  { label: "Sales",       description: "Lead generation, outreach, and CRM automation agents.",   icon: "💼", count: 103 },
  { label: "Productivity",description: "Task management, summarization, and scheduling agents.",  icon: "⚡", count: 196 },
];

const AGENTS = [
  {
    name: "CopyFlow", category: "Marketing",
    description: "Generates on-brand ad copy, email sequences, and landing page text in seconds. Integrates with HubSpot and Mailchimp.",
    badge: "Top Rated", rating: "4.9", tags: ["Copywriting", "Email", "Ads"],
  },
  {
    name: "TutorMind", category: "Education",
    description: "Personalized AI tutor that adapts lesson difficulty in real-time based on student responses and learning history.",
    badge: "New", rating: "4.7", tags: ["Tutoring", "Adaptive", "K-12"],
  },
  {
    name: "LeadPilot", category: "Sales",
    description: "Researches prospects, drafts cold outreach, and schedules follow-ups autonomously. Works with Salesforce and HubSpot.",
    badge: null, rating: "4.8", tags: ["Lead Gen", "Outreach", "CRM"],
  },
  {
    name: "BriefBot", category: "Productivity",
    description: "Turns long documents, meetings, and threads into crisp executive summaries with action items automatically extracted.",
    badge: "Top Rated", rating: "4.9", tags: ["Summarization", "Meetings", "Docs"],
  },
  {
    name: "SEOSprint", category: "Marketing",
    description: "Runs keyword research, builds content clusters, and optimizes existing pages — all driven by live search data.",
    badge: null, rating: "4.6", tags: ["SEO", "Keywords", "Content"],
  },
  {
    name: "DeskMate", category: "Productivity",
    description: "Connects to your calendar, email, and task manager to prioritize your day and surface what actually needs attention.",
    badge: "New", rating: "4.7", tags: ["Scheduling", "Email", "Tasks"],
  },
];
