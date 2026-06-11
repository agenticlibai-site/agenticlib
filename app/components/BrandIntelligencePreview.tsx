"use client";
import { useState } from "react";

// ── Data ─────────────────────────────────────────────────────────────────────

const HEATMAP: { agent: string; claude: number; gpt: number; gemini: number }[] = [
  { agent: "Jasper AI",  claude: 78, gpt: 71, gemini: 64 },
  { agent: "Copy.ai",    claude: 61, gpt: 58, gemini: 53 },
  { agent: "Writer",     claude: 49, gpt: 44, gemini: 41 },
  { agent: "Surfer SEO", claude: 35, gpt: 31, gemini: 28 },
  { agent: "Lately AI",  claude: 22, gpt: 19, gemini: 17 },
];

const AGENT_CARDS = [
  {
    name: "Jasper AI",
    color: "#5B5BD6",
    consensus: 91,
    tags: ["Brand voice", "Social content", "Ad copy"],
    confidence: 88,
  },
  {
    name: "Copy.ai",
    color: "#F4436C",
    consensus: 74,
    tags: ["Blog writing", "Email sequences"],
    confidence: 72,
  },
  {
    name: "Writer",
    color: "#22C55E",
    consensus: 68,
    tags: ["Enterprise content", "Brand guidelines"],
    confidence: 65,
  },
];

const LLM_CHIPS = [
  { name: "Claude",  color: "#5B5BD6", avg: 78 },
  { name: "GPT-4o",  color: "#22C55E", avg: 71 },
  { name: "Gemini",  color: "#3B82F6", avg: 64 },
];

const DOMAINS = ["Marketing", "Customer Support", "Video Creation"];

const LLM_KEYS: { key: "claude" | "gpt" | "gemini"; label: string }[] = [
  { key: "claude", label: "Claude" },
  { key: "gpt",    label: "GPT-4o" },
  { key: "gemini", label: "Gemini" },
];

// ── Cell colour helper ────────────────────────────────────────────────────────

function cellStyle(pct: number): React.CSSProperties {
  if (pct >= 70) return { background: "#5B5BD6", color: "#fff" };
  if (pct >= 50) return { background: "#8484E4", color: "#fff" };
  if (pct >= 30) return { background: "#C2C1F0", color: "#3a3a8e" };
  return { background: "#EBEBFF", color: "#8080b8", border: "1px solid #ddddf5" };
}

// ── Component ─────────────────────────────────────────────────────────────────

type HoveredCell = { agent: string; llm: string; pct: number } | null;

export default function BrandIntelligencePreview() {
  const [domain, setDomain]         = useState("Marketing");
  const [hovered, setHovered]       = useState<HoveredCell>(null);

  return (
    <section style={{ background: "#F8F8FF", paddingTop: "80px", paddingBottom: "80px" }}>
      <div className="max-w-5xl mx-auto px-6">

        {/* Section heading */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-zinc-900 mb-2 leading-snug">
            See how AI agents rank across LLMs - in real queries, not ads.
          </h2>
          <p className="text-zinc-500 text-lg">
            AgenticLib tracks visibility, sentiment, and position of AI agent brands across Claude, GPT, and Gemini.
          </p>
        </div>

        {/* Dashboard card — no overflow-hidden so tooltips can escape if needed */}
        <div
          className="rounded-2xl border border-gray-200"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)", background: "white" }}
        >

          {/* ── Top bar ── */}
          <div
            className="flex items-center justify-between gap-4 px-5 py-3 flex-wrap rounded-t-2xl"
            style={{ background: "#0f0f1a" }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200"
                  style={{
                    background: domain === d ? "#5B5BD6" : "rgba(255,255,255,0.08)",
                    color: domain === d ? "#fff" : "rgba(255,255,255,0.60)",
                    border: domain === d ? "none" : "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                background: "rgba(91,91,214,0.18)",
                color: "#a5b4fc",
                border: "1px solid rgba(91,91,214,0.28)",
              }}
            >
              Live Intelligence Demo
            </span>
          </div>

          {/* ── Body ── */}
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

            {/* Left panel: heatmap */}
            <div className="flex-1 p-6">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                LLM Visibility Heatmap
              </p>
              <p className="text-xs text-gray-400 mb-5">
                How often each agent appears in real LLM queries
              </p>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="text-left font-semibold text-gray-400 pb-3 w-28" />
                    {LLM_KEYS.map(({ label }) => (
                      <th key={label} className="font-semibold text-gray-500 pb-3 px-1.5 text-center w-20">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HEATMAP.map((row) => (
                    <tr key={row.agent} className="border-t border-gray-50">
                      <td className="py-1.5 pr-3 font-semibold text-gray-700 whitespace-nowrap text-xs">
                        {row.agent}
                      </td>
                      {LLM_KEYS.map(({ key, label }) => {
                        const pct = row[key];
                        return (
                          <td key={key} className="py-1.5 px-1.5">
                            <div
                              className="h-10 w-full rounded-xl flex items-center justify-center font-bold text-sm cursor-default select-none transition-transform duration-150 hover:scale-105 hover:shadow-md"
                              style={cellStyle(pct)}
                              onMouseEnter={() => setHovered({ agent: row.agent, llm: label, pct })}
                              onMouseLeave={() => setHovered(null)}
                            >
                              {pct}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Hover info strip */}
              <div className="mt-4 h-8 flex items-center px-1">
                {hovered ? (
                  <p className="text-xs text-gray-700 leading-snug">
                    <span className="font-semibold">{hovered.agent}</span> mentioned in{" "}
                    <span className="font-bold" style={{ color: "#5B5BD6" }}>{hovered.pct}%</span> of{" "}
                    <span className="font-semibold">{hovered.llm}</span> queries about{" "}
                    {domain.toLowerCase()} agents
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">Hover a cell to see query context</p>
                )}
              </div>

              {/* Colour scale legend */}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                  Visibility:
                </span>
                {[
                  { label: "70%+",    pct: 75 },
                  { label: "50–69%",  pct: 58 },
                  { label: "30–49%",  pct: 38 },
                  { label: "< 30%",   pct: 20 },
                ].map(({ label, pct }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-md" style={cellStyle(pct)} />
                    <span className="text-[10px] text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel: agent intelligence cards */}
            <div className="lg:w-[280px] p-6 flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  Agent Intelligence
                </p>
                <p className="text-xs text-gray-400 mb-1">Cross-LLM performance snapshot</p>
              </div>

              {AGENT_CARDS.map((agent) => (
                <div
                  key={agent.name}
                  className="rounded-xl p-4"
                  style={{ background: "#f7f7ff", border: "1px solid #e8e8ff" }}
                >
                  {/* Name + consensus score */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{ background: agent.color }}
                      />
                      <span className="text-sm font-bold text-gray-900">{agent.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold leading-none" style={{ color: agent.color }}>
                        {agent.consensus}
                        <span className="text-[11px] text-gray-400 font-normal ml-0.5">/100</span>
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mt-0.5">
                        Consensus
                      </div>
                    </div>
                  </div>

                  {/* Use case tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#eeeeff", color: "#5B5BD6" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Deployment confidence */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                        Deployment Confidence
                      </span>
                      <span className="text-[11px] font-bold text-gray-600">{agent.confidence}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${agent.confidence}%`,
                          background: "linear-gradient(90deg, #5B5BD6, #F4436C)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom strip ── */}
          <div
            className="border-t border-gray-100 px-6 py-4 flex flex-wrap items-center gap-3 rounded-b-2xl"
            style={{ background: "#fafafa" }}
          >
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Avg Visibility by LLM
            </span>
            <span className="text-gray-200">|</span>
            {LLM_CHIPS.map(({ name, color, avg }) => (
              <div
                key={name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white"
                style={{ border: "1px solid #e8e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-gray-700">{name}</span>
                <span className="font-bold" style={{ color }}>{avg}%</span>
              </div>
            ))}
            <span className="ml-auto text-[10px] text-gray-300 italic">
              Demo data - live version coming soon
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
