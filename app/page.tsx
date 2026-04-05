"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { domains } from "@/data/agents";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const q = query.toLowerCase().trim();

    const match = domains.find((d) =>
      d.name.toLowerCase().includes(q) ||
      d.slug.toLowerCase().includes(q)
    );

    if (match) {
      router.push(`/domains/${match.slug}`);
    } else {
      router.push("/domains");
    }
  };

  return (
    <div className="page-bg relative text-zinc-900 font-sans">

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full" style={{ background: "rgba(147,197,253,0.22)", filter: "blur(80px)" }} />
        <div className="absolute -top-32 -right-48 w-[560px] h-[560px] rounded-full" style={{ background: "rgba(167,139,250,0.20)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full" style={{ background: "rgba(249,168,212,0.12)", filter: "blur(72px)" }} />
      </div>

      {/* NAVBAR */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3">
        <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 shadow-sm rounded-xl px-6 h-14 flex items-center justify-between">

          {/* LOGO ✅ */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="AgenticLib logo" className="h-6 w-auto" />
            <span className="text-lg font-semibold tracking-tight">
              AgenticLib
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-500">
            <a href="#library">AI Agent Library</a>
            <a href="#demo">How it works</a>
             <button
    onClick={() => router.push("/blog")}
    className="hover:text-black transition"
  >
    Blog
  </button>
          </nav>

          <button
            onClick={() => router.push("/recommend")}
            className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-full"
          >
            Get started
          </button>
        </div>
      </header>

      <main className="pt-16 relative z-10">

        {/* HERO */}
        <section className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 text-center">

          <div className="inline-flex items-center gap-2 bg-white/60 border text-zinc-600 text-xs px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            250+ agents across 90+ Business Domains
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-5">
            Get the right <span className="gradient-text">AI agent</span> in seconds
          </h1>

          <p className="text-lg text-zinc-500 mb-12">
            Tell us your workflow or use case → we compare and recommend the best agents
          </p>

          <div className="flex flex-col items-center gap-4">
            <p className="text-xs uppercase text-zinc-400">
          
            </p>

            <div className="flex flex-col sm:flex-row gap-3">

              {/* 🔥 THIS BUTTON IS NOW FIXED */}
              <button
                onClick={() => router.push("/recommend")}
                className="btn-primary px-9 py-4 rounded-full text-white"
              >
                Get personalised AI agent recommendations →
              </button>

              <a href="#demo" className="px-6 py-4 rounded-full border bg-white/50">
                Watch demo
              </a>

            </div>
          </div>

        </section>


        {/* LIBRARY */}
        <section id="library" className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="glass-card p-8">

              <h2 className="text-2xl font-semibold text-center mb-4">
                Explore AI Agent Library
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 items-center">

                <input
                  type="text"
                  placeholder="Search business domains..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="glass-input w-full sm:flex-1 px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="relative w-full sm:w-64">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        router.push(`/domains/${e.target.value}`);
                      }
                    }}
                    className="glass-input w-full px-4 py-3 rounded-xl border border-zinc-300 text-zinc-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                  >
                    <option value="">Select Business Domain</option>

                    {domains.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-500">
                    ▼
                  </div>
                </div>

                <button
                  onClick={() => router.push("/domains")}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-black text-white hover:opacity-90 transition"
                >
                  Explore →
                </button>

              </div>
            </div>
          </div>
        </section>


        {/* DEMO */}
        <section id="demo" className="py-20 text-center">

          <h2 className="text-3xl font-semibold mb-3">
            See how it works
          </h2>

          <p className="text-zinc-500 mb-8">
            Watch how AgenticLib finds the best AI agent for your exact use case
          </p>

          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border">
            <iframe
              src="https://www.loom.com/embed/6abf23d5fb63444c907280e915098420"
              frameBorder="0"
              allowFullScreen
              className="w-full h-[400px] md:h-[500px]"
            />
          </div>

        </section>

      </main>

      <section className="mt-20 mb-10 px-6">
  <div className="max-w-4xl mx-auto text-center">

    <h3 className="text-lg font-semibold text-gray-600 mb-6">
      Connect with AgenticLib
    </h3>

    <div className="flex flex-wrap justify-center gap-4">

      <a
        href="https://www.linkedin.com/company/108024233/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/60 hover:bg-white hover:shadow-md transition"
      >
        🔗 <span>LinkedIn</span>
      </a>

      <a
        href="mailto:agenticlib.ai@gmail.com"
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/60 hover:bg-white hover:shadow-md transition"
      >
        ✉️ <span>Email</span>
      </a>

      <a
        href="https://x.com/AgenticLibAI/status/1960527278087266557"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/60 hover:bg-white hover:shadow-md transition"
      >
        𝕏 <span>X</span>
      </a>

      <a
        href="https://www.producthunt.com/p/self-promotion/agenticlib-simplifying-your-ai-agent-discovery-journey"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/60 hover:bg-white hover:shadow-md transition"
      >
        🟠 <span>Product Hunt</span>
      </a>

      <a
        href="https://www.reddit.com/r/SideProject/comments/1m6bfy1/agenticlib_simplifying_your_ai_agent_discovery/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white/60 hover:bg-white hover:shadow-md transition"
      >
        👽 <span>Reddit</span>
      </a>

    </div>
  </div>
</section>

{/* 🔥 SUPPORTED BY BLACKBIRD — RECTANGLE LOGO */}
<section className="px-6 pb-12">

  <div className="max-w-2xl mx-auto">

    <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-pink-300/60 via-orange-200/60 to-purple-300/60 shadow-md">

      <div className="backdrop-blur-2xl bg-gradient-to-br from-pink-100/10 to-orange-100/10 border border-white/5 rounded-2xl px-6 py-4">

        <div className="flex items-center justify-center gap-6">

          <p className="text-zinc-700/80 text-lg font-semibold">
            Selected for Blackbird Giants
          </p>

          {/* 👇 RECTANGULAR LOGO */}
          <img
            src="/blackbird.png"
            alt="Blackbird Giants"
            className="h-14 w-auto object-contain rounded-lg"
          />

        </div>

      </div>

    </div>

  </div>

</section>

<footer className="py-10 text-center text-sm text-zinc-400">
  © 2026 AgenticLib
</footer>

</div>
  );
}