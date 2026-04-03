import Link from "next/link";

export default function Home() {
  return (
    <div className="page-bg relative text-zinc-900 font-sans">

      {/* ── Background blobs ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full"
          style={{ background: "rgba(147,197,253,0.22)", filter: "blur(80px)" }}
        />
        <div
          className="absolute -top-32 -right-48 w-[560px] h-[560px] rounded-full"
          style={{ background: "rgba(167,139,250,0.20)", filter: "blur(80px)" }}
        />
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

            <div className="flex flex-col items-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                No more trial and error
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <a
                  href="#library"
                  className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white text-base font-semibold px-9 py-4 rounded-full"
                >
                  Get personalised AI agent recommendations →
                </a>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 px-6 py-4 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-colors"
                >
                  Watch demo
                </a>
              </div>
            </div>

            {/* ✅ FIXED TEXT */}
            <p className="mt-10 text-xs text-zinc-400">
              Used by 60+ users across 35+ countries
            </p>

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
          </nav>
          <span>© 2026 AgenticLib</span>
        </div>
      </footer>
    </div>
  );
}