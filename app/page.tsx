import Link from "next/link";
import { domains } from "@/data/agents";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-24">
      <div className="max-w-5xl mx-auto">

        {/* Title */}
        <h1 className="text-5xl font-semibold tracking-tight mb-4">
          Explore AI Agents
        </h1>

        <p className="text-lg text-zinc-500 mb-8">
          Discover AI agents by domain
        </p>

        {/* Search + Dropdown Row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">

          {/* Search (optional UI, not functional yet) */}
          <input
            type="text"
            placeholder="Search agents, tasks, workflows..."
            className="glass-input w-full px-4 py-3 rounded-xl border"
          />

          {/* ✅ FIXED DROPDOWN */}
          <select
            className="glass-input w-full sm:w-56 px-4 py-3 rounded-xl border"
            onChange={(e) => {
              if (e.target.value) {
                window.location.href = `/domains/${e.target.value}`;
              }
            }}
          >
            <option value="">All domains</option>

            {domains.map((domain) => (
              <option key={domain.slug} value={domain.slug}>
                {domain.name}
              </option>
            ))}
          </select>

        </div>

        {/* Domain Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {domains.map((domain) => (
            <Link
              key={domain.slug}
              href={`/domains/${domain.slug}`}
            >
              <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-200 via-white to-blue-300">

                <div className="rounded-2xl bg-white/60 backdrop-blur-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">

                  <div className="flex items-center justify-between">

                    <div>
                      <div className="text-xl font-semibold">
                        {domain.name}
                      </div>

                      <div className="text-sm text-zinc-500 mt-1">
                        Browse AI agents
                      </div>
                    </div>

                    <div className="text-blue-500 transition-transform group-hover:translate-x-1">
                      →
                    </div>

                  </div>

                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}