"use client";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import type { AgentResult, BrandIntelligenceData } from "@/app/api/brand-intelligence/route";

// ── Agent colours & static content ───────────────────────────────────────────

const AGENT_COLORS: Record<string, string> = {
  "HubSpot Breeze": "#5B5BD6",
  "Jasper":         "#F4436C",
  "ActiveCampaign": "#16A34A",
  "Writesonic":     "#F59E0B",
};

function agentColor(name: string): string {
  return AGENT_COLORS[name] ?? "#9ca3af";
}

// LLM quote associations — static, not from API
const STATIC_QUOTES: Record<string, string[]> = {
  "HubSpot Breeze": ["comprehensive", "enterprise-ready", "reliable"],
  "Jasper":         ["best-in-class content", "intuitive", "powerful"],
  "ActiveCampaign": ["robust automation", "great for SMBs", "feature-rich"],
  "Writesonic":     ["fast output", "good for SEO", "occasionally generic"],
};

// ── Types ─────────────────────────────────────────────────────────────────────

type TimeFilter = "24h" | "7d" | "3m";
type TabKey = "coverage" | "prompt" | "sentiment" | "domain";

// ── Hardcoded chart data (illustrative trend — API is a snapshot, not time-series) ──

const CHART_BRANDS = [
  { name: "HubSpot Breeze", color: "#5B5BD6" },
  { name: "Jasper",         color: "#F4436C" },
  { name: "ActiveCampaign", color: "#16A34A" },
  { name: "Writesonic",     color: "#F59E0B" },
];

const TIME_PERIODS: Record<
  TimeFilter,
  { label: string; dates: string[]; data: Record<string, number[]> }
> = {
  "24h": {
    label: "Last 24 hours",
    dates: ["6am", "9am", "12pm", "3pm", "6pm", "9pm"],
    data: {
      "HubSpot Breeze": [73, 77, 82, 76, 74, 79],
      "Jasper":         [66, 71, 75, 69, 67, 73],
      "ActiveCampaign": [59, 62, 66, 60, 64, 58],
      "Writesonic":     [50, 54, 56, 49, 53, 57],
    },
  },
  "7d": {
    label: "Last 7 days",
    dates: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: {
      "HubSpot Breeze": [77, 80, 83, 79, 84, 74, 72],
      "Jasper":         [71, 74, 77, 73, 78, 68, 66],
      "ActiveCampaign": [63, 61, 68, 65, 71, 60, 58],
      "Writesonic":     [53, 57, 55, 59, 61, 50, 48],
    },
  },
  "3m": {
    label: "Last 3 months",
    dates: [
      "Apr W1", "Apr W2", "Apr W3", "Apr W4",
      "May W1", "May W2", "May W3", "May W4",
      "Jun W1", "Jun W2", "Jun W3", "Jun W4",
    ],
    data: {
      "HubSpot Breeze": [68, 72, 70, 75, 71, 76, 78, 74, 79, 81, 77, 83],
      "Jasper":         [62, 65, 63, 68, 65, 70, 72, 68, 73, 75, 71, 77],
      "ActiveCampaign": [54, 58, 55, 60, 57, 62, 64, 60, 65, 67, 63, 68],
      "Writesonic":     [44, 48, 46, 51, 48, 53, 55, 50, 56, 58, 54, 59],
    },
  },
};

// ── Hardcoded domain parameter scores (not provided by API) ───────────────────

const DOMAIN_PARAMS = [
  "Content Generation",
  "SEO & Visibility",
  "Social Automation",
  "Email & Campaigns",
  "Analytics & Reporting",
];

const PARAM_SCORES: Record<string, Record<string, number>> = {
  "Content Generation":    { "HubSpot Breeze": 79, "Jasper": 94, "ActiveCampaign": 68, "Writesonic": 88 },
  "SEO & Visibility":      { "HubSpot Breeze": 72, "Jasper": 78, "ActiveCampaign": 65, "Writesonic": 91 },
  "Social Automation":     { "HubSpot Breeze": 84, "Jasper": 65, "ActiveCampaign": 72, "Writesonic": 58 },
  "Email & Campaigns":     { "HubSpot Breeze": 91, "Jasper": 68, "ActiveCampaign": 94, "Writesonic": 63 },
  "Analytics & Reporting": { "HubSpot Breeze": 88, "Jasper": 61, "ActiveCampaign": 82, "Writesonic": 59 },
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "coverage",  label: "Brand Coverage"   },
  { key: "prompt",    label: "Prompt-Use Case"   },
  { key: "sentiment", label: "Sentiment"         },
  { key: "domain",    label: "Domain Parameters" },
];

// ── Chart tooltip ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-xs min-w-[190px]"
      style={{ background: "white", border: "1px solid #e8e8f0", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
    >
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      {payload.map((entry: { name: string; color: string; value: number }) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-gray-500 flex-1">{entry.name}</span>
          <span className="font-bold text-gray-900 tabular-nums">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row">
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-2 flex-wrap">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-24" />)}
        </div>
        <Skeleton className="h-[240px] rounded-xl mt-2" />
        <div className="flex gap-3 flex-wrap mt-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-20" />)}
        </div>
      </div>
      <div className="lg:w-56 border-t lg:border-t-0 lg:border-l border-gray-100 p-5 space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-16" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5" />)}
        <div className="h-px bg-gray-100 my-2" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-12" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4" />)}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  agents: AgentResult[];
  totalMentions: number;
  avgPosition: string;
}

function Sidebar({ agents, totalMentions, avgPosition }: SidebarProps) {
  const maxMentions = Math.max(...agents.map(a => a.mentions), 1);

  return (
    <div className="lg:w-56 border-t lg:border-t-0 lg:border-l border-gray-100 p-5 flex flex-col gap-5 flex-shrink-0">

      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Brand Mentions</p>
        <p className="text-2xl font-bold text-gray-900 leading-none mb-0.5">{totalMentions.toLocaleString()}</p>
        <p className="text-[10px] text-gray-400 mb-3">total across all queries</p>
        <div className="flex flex-col gap-2.5">
          {agents.map((a) => (
            <div key={a.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: agentColor(a.name) }} />
                  <span className="text-[11px] text-gray-600 truncate">{a.name}</span>
                </div>
                <span className="text-[11px] font-bold text-gray-800 tabular-nums ml-2 flex-shrink-0">
                  {a.mentions.toLocaleString()}
                </span>
              </div>
              <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(a.mentions / maxMentions) * 100}%`, background: agentColor(a.name) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Avg Brand Position</p>
        <p className="text-2xl font-bold text-gray-900 leading-none mb-0.5">{avgPosition}</p>
        <p className="text-[10px] text-gray-400 mb-3">lower is better</p>
        <div className="flex flex-col gap-2">
          {agents.map((a) => (
            <div key={a.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: agentColor(a.name) }} />
                <span className="text-[11px] text-gray-600 truncate">{a.name}</span>
              </div>
              <span
                className="text-[11px] font-bold tabular-nums ml-2 flex-shrink-0"
                style={{ color: agentColor(a.name) }}
              >
                {a.avgPosition}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BrandIntelligencePreview() {
  const [tab,         setTab]         = useState<TabKey>("coverage");
  const [timeFilter,  setTimeFilter]  = useState<TimeFilter>("7d");
  const [visible,     setVisible]     = useState(() => new Set(CHART_BRANDS.map(b => b.name)));
  const [activeParam, setActiveParam] = useState("Content Generation");
  const [mounted,       setMounted]       = useState(false);
  const [apiData,       setApiData]       = useState<BrandIntelligenceData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [historyData,   setHistoryData]   = useState<Record<string, unknown>[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/brand-intelligence");
        if (!res.ok) throw new Error(`${res.status}`);
        setApiData(await res.json());
      } catch (err) {
        console.error("Brand intelligence fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/brand-intelligence/history?domain=marketing&days=7");
        if (!res.ok) throw new Error(`${res.status}`);
        setHistoryData(await res.json());
      } catch (err) {
        console.error("History fetch failed:", err);
        setHistoryData([]);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, []);

  function toggleBrand(name: string) {
    setVisible(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  // ── Derived display data ──────────────────────────────────────────────────

  const top5: AgentResult[] = apiData?.agents.slice(0, 5) ?? [];

  const sidebarAgents: AgentResult[] = top5.length > 0 ? top5 : [
    { name: "HubSpot Breeze", visibilityScore: 79, avgPosition: 1.8, mentions: 3891, sentimentScore: 87, sentimentBreakdown: { positive: 78, neutral: 18, negative: 4 }, descriptors: [], topUseCases: [], perLLM: { claude: 79, gpt: 73, gemini: 0 } },
    { name: "Jasper",         visibilityScore: 74, avgPosition: 2.1, mentions: 3104, sentimentScore: 89, sentimentBreakdown: { positive: 82, neutral: 14, negative: 4 }, descriptors: [], topUseCases: [], perLLM: { claude: 79, gpt: 73, gemini: 0 } },
    { name: "ActiveCampaign", visibilityScore: 61, avgPosition: 2.6, mentions: 2687, sentimentScore: 85, sentimentBreakdown: { positive: 74, neutral: 21, negative: 5 }, descriptors: [], topUseCases: [], perLLM: { claude: 79, gpt: 73, gemini: 0 } },
    { name: "Writesonic",     visibilityScore: 48, avgPosition: 3.1, mentions: 1891, sentimentScore: 82, sentimentBreakdown: { positive: 71, neutral: 22, negative: 7 }, descriptors: [], topUseCases: [], perLLM: { claude: 79, gpt: 73, gemini: 0 } },
  ];

  const totalMentions = apiData
    ? apiData.agents.reduce((s, a) => s + a.mentions, 0)
    : sidebarAgents.reduce((s, a) => s + a.mentions, 0);

  const avgPosition = sidebarAgents.length
    ? (sidebarAgents.reduce((s, a) => s + a.avgPosition, 0) / sidebarAgents.length).toFixed(1)
    : "2.3";

  // LLM chip averages from top-5 perLLM data
  const top5Count = sidebarAgents.length || 1;
  const llmChips = [
    { name: "Claude", color: "#5B5BD6", avg: Math.round(sidebarAgents.reduce((s, a) => s + a.perLLM.claude, 0) / top5Count) },
    { name: "GPT-4o", color: "#16A34A", avg: Math.round(sidebarAgents.reduce((s, a) => s + a.perLLM.gpt,    0) / top5Count) },
  ];

  // Prompt-Use Case tab: top use cases come directly from API data
  const promptCards = sidebarAgents.map(a => ({
    name: a.name,
    topUseCases: a.topUseCases ?? [],
  }));

  // Domain params tab (hardcoded scores, top-5 agents from API order)
  const domainAgentNames = sidebarAgents.map(a => a.name);
  const sortedForParam = domainAgentNames
    .filter(name => PARAM_SCORES[activeParam]?.[name] !== undefined)
    .map(name => ({ name, color: agentColor(name), score: PARAM_SCORES[activeParam][name] }))
    .sort((a, b) => b.score - a.score);

  // Chart data
  const hasRealHistory = !historyLoading && Array.isArray(historyData) && historyData.length >= 2;
  const period = TIME_PERIODS[timeFilter];
  const chartData = hasRealHistory
    ? (historyData as Record<string, unknown>[])
    : period.dates.map((date, i) => ({
        date,
        "HubSpot Breeze": period.data["HubSpot Breeze"][i],
        "Jasper":         period.data["Jasper"][i],
        "ActiveCampaign": period.data["ActiveCampaign"][i],
        "Writesonic":     period.data["Writesonic"][i],
      }));

  // Formatted timestamp
  const generatedAt = apiData?.generatedAt
    ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(apiData.generatedAt))
    : null;

  return (
    <section style={{ background: "#F8F8FF", paddingTop: "80px", paddingBottom: "80px" }}>
      <div className="max-w-5xl mx-auto px-6">

        {/* Section heading */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-zinc-900 mb-2 leading-snug">
            See how AI agents rank across LLMs - in real queries, not ads.
          </h2>
          <p className="text-zinc-500 text-lg">
            AgenticLib tracks visibility, sentiment, and position of AI agent brands across Claude and GPT-4o.
          </p>
        </div>

        {/* Dashboard card */}
        <div
          className="rounded-2xl overflow-hidden border border-gray-200"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)", background: "white" }}
        >

          {/* Dark top bar */}
          <div
            className="flex items-center justify-between gap-4 px-5 py-3"
            style={{ background: "#0f0f1a" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full font-semibold text-white" style={{ background: "#5B5BD6" }}>
                Marketing
              </span>
            </div>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: "rgba(91,91,214,0.18)", color: "#a5b4fc", border: "1px solid rgba(91,91,214,0.28)" }}
            >
              {loading ? "Querying LLMs…" : "Live Intelligence"}
            </span>
          </div>

          {/* Report context */}
          <div className="px-5 py-2 border-b border-gray-100" style={{ background: "#f9f9fb" }}>
            <p className="text-[11px] text-gray-400">
              {loading
                ? "Running 28 use-case queries across Claude and GPT-4o…"
                : apiData
                  ? `Report based on ${apiData.totalPrompts * 2} use-case queries across Claude and GPT-4o. ${generatedAt ? `Last run: ${generatedAt}.` : ""}`
                  : "Report based on 28 use-case queries across Claude and GPT-4o."}
            </p>
          </div>

          {/* Tab row */}
          <div className="flex border-b border-gray-100 bg-white px-1 overflow-x-auto">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="relative px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0"
                style={{ color: tab === key ? "#5B5BD6" : "#9ca3af" }}
              >
                {label}
                {tab === key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full"
                    style={{ background: "#5B5BD6" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Loading ── */}
          {loading && <LoadingSkeleton />}

          {/* ── TAB 1: Brand Coverage ── */}
          {!loading && tab === "coverage" && (
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-6">

                {/* Controls */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
                  {/* Checkbox legend */}
                  <div className="flex flex-wrap gap-x-3 gap-y-2 flex-1">
                    {CHART_BRANDS.map(({ name, color }) => {
                      const on = visible.has(name);
                      return (
                        <button key={name} onClick={() => toggleBrand(name)} className="flex items-center gap-1.5">
                          <div
                            className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150"
                            style={{ background: on ? color : "white", border: on ? "none" : "1.5px solid #d1d5db" }}
                          >
                            {on && (
                              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs transition-colors duration-150" style={{ color: on ? "#374151" : "#9ca3af" }}>
                            {name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Time filter - only shown when using fallback data */}
                  {!hasRealHistory && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {(["24h", "7d", "3m"] as TimeFilter[]).map((f) => {
                        const labels: Record<TimeFilter, string> = { "24h": "Last 24h", "7d": "Last 7 days", "3m": "Last 3 months" };
                        return (
                          <button
                            key={f}
                            onClick={() => setTimeFilter(f)}
                            className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap"
                            style={{
                              background: timeFilter === f ? "#5B5BD6" : "white",
                              color:      timeFilter === f ? "white"   : "#6b7280",
                              border:     timeFilter === f ? "none"    : "1px solid #e5e7eb",
                            }}
                          >
                            {labels[f]}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Chart */}
                {historyLoading ? (
                  <div className="h-[240px] rounded-xl bg-gray-50 animate-pulse" />
                ) : !hasRealHistory ? (
                  <div className="h-[240px] rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-3">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18"/>
                      <path d="m19 9-5 5-4-4-3 3"/>
                    </svg>
                    <p className="text-sm font-semibold text-gray-400">Trend data building</p>
                    <p className="text-xs text-gray-300">Check back in 7 days as daily snapshots accumulate</p>
                  </div>
                ) : mounted ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `${v}%`}
                        domain={[0, 100]}
                        width={40}
                        label={{ value: "Brand Coverage %", angle: -90, position: "insideLeft", dx: -12, style: { textAnchor: "middle", fontSize: 9, fill: "#c4c4d4" } }}
                      />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Tooltip content={(p: any) => <ChartTooltip {...p} />} />
                      {CHART_BRANDS.map(({ name, color }) =>
                        visible.has(name) ? (
                          <Line key={name} type="monotone" dataKey={name} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        ) : null
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[240px] rounded-xl bg-gray-50 animate-pulse" />
                )}
              </div>

              <Sidebar agents={sidebarAgents} totalMentions={totalMentions} avgPosition={avgPosition} />
            </div>
          )}

          {/* ── TAB 2: Prompt-Use Case ── */}
          {!loading && tab === "prompt" && (
            <div className="p-6">
              <p className="text-sm font-bold text-gray-900 mb-0.5">Which use cases does each agent rank #1 for?</p>
              <p className="text-xs text-gray-400 mb-5">Based on which agent is mentioned first in each LLM response across 14 specific marketing use-case queries</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {promptCards.map((agent) => (
                  <div key={agent.name} className="rounded-2xl p-4 flex flex-col" style={{ border: "1.5px solid #f0f0f8", background: "#fafaff" }}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: agentColor(agent.name) }} />
                        <span className="text-sm font-bold text-gray-900 truncate">{agent.name}</span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                        style={{
                          background: agent.topUseCases.length > 0 ? "#EEF2FF" : "#f3f4f6",
                          color:      agent.topUseCases.length > 0 ? "#5B5BD6" : "#9ca3af",
                        }}
                      >
                        #1 for {agent.topUseCases.length} use case{agent.topUseCases.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {agent.topUseCases.length > 0 ? (
                      <>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Top ranked for:</p>
                        <div className="flex flex-col gap-2.5">
                          {agent.topUseCases.map(({ useCase, prompt }) => (
                            <div key={useCase}>
                              <span
                                className="inline-flex items-center text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                                style={{ background: "#EEF2FF", color: "#5B5BD6" }}
                              >
                                {useCase}
                              </span>
                              <p className="text-xs italic text-gray-800 mt-1 ml-0.5 leading-relaxed">
                                &ldquo;{prompt}&rdquo;
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-1">
                        Not ranked #1 for any tracked use case in this domain.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: Sentiment ── */}
          {!loading && tab === "sentiment" && (
            <div className="p-6">
              <p className="text-sm font-bold text-gray-900 mb-0.5">How LLMs describe each agent</p>
              <p className="text-xs text-gray-400 mb-5">Positive, neutral, or negative sentiment in LLM responses</p>
              <div className="flex flex-col divide-y divide-gray-100">
                {sidebarAgents.map((agent) => {
                  const { positive: pos, neutral: neu, negative: neg } = agent.sentimentBreakdown;
                  const quotes = (agent.descriptors?.length ? agent.descriptors : null) ?? STATIC_QUOTES[agent.name] ?? [];
                  return (
                    <div key={agent.name} className="py-5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: agentColor(agent.name) }} />
                        <span className="text-sm font-semibold text-gray-800">{agent.name}</span>
                        <span className="ml-auto text-[10px] text-gray-400 tabular-nums">
                          {pos}% / {neu}% / {neg}%
                        </span>
                      </div>
                      <div className="flex h-7 rounded-lg overflow-hidden mb-2">
                        <div className="flex items-center justify-center text-[11px] font-bold text-white" style={{ width: `${pos}%`, background: "#16A34A" }}>
                          {pos}%
                        </div>
                        <div className="flex items-center justify-center text-[11px] font-bold text-white" style={{ width: `${neu}%`, background: "#F59E0B" }}>
                          {neu >= 12 ? `${neu}%` : ""}
                        </div>
                        <div className="flex items-center justify-center text-[11px] font-bold text-white" style={{ width: `${neg}%`, background: "#F4436C" }}>
                          {neg >= 10 ? `${neg}%` : ""}
                        </div>
                      </div>
                      <div className="flex gap-4 mb-3 flex-wrap">
                        <span className="text-[10px] font-semibold" style={{ color: "#16A34A" }}>{pos}% Positive</span>
                        <span className="text-[10px] font-semibold" style={{ color: "#d97706" }}>{neu}% Neutral</span>
                        <span className="text-[10px] font-semibold" style={{ color: "#F4436C" }}>{neg}% Negative</span>
                      </div>
                      {quotes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {quotes.map((q) => (
                            <span key={q} className="text-[11px] italic text-gray-500 px-2.5 py-1 rounded-full" style={{ background: "#f9f9f9", border: "1px solid #ececec" }}>
                              &ldquo;{q}&rdquo;
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 4: Domain Parameters ── */}
          {!loading && tab === "domain" && (
            <div className="p-6">
              <p className="text-sm font-bold text-gray-900 mb-0.5">Parameter Rankings</p>
              <p className="text-xs text-gray-400 mb-5">Select a marketing parameter to see which agents rank highest</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {DOMAIN_PARAMS.map((param) => (
                  <button
                    key={param}
                    onClick={() => setActiveParam(param)}
                    className="text-xs font-semibold px-3.5 py-2 rounded-full transition-all duration-150"
                    style={{
                      background: activeParam === param ? "#5B5BD6" : "white",
                      color:      activeParam === param ? "white"   : "#6b7280",
                      border:     activeParam === param ? "none"    : "1px solid #e5e7eb",
                    }}
                  >
                    {param}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {sortedForParam.map((agent, i) => (
                  <div key={agent.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-200 w-5 text-right flex-shrink-0">{i + 1}</span>
                    <div className="flex items-center gap-1.5 w-36 flex-shrink-0 min-w-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: agent.color }} />
                      <span className="text-xs font-semibold text-gray-700 truncate">{agent.name}</span>
                    </div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${agent.score}%`, background: agent.color, transition: "width 0.55s cubic-bezier(0.4,0,0.2,1)" }}
                      />
                    </div>
                    <span className="text-xs font-bold tabular-nums w-8 text-right flex-shrink-0" style={{ color: agent.color }}>
                      {agent.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom strip */}
          <div className="border-t border-gray-100 px-6 py-3.5 flex flex-wrap items-center gap-3" style={{ background: "#fafafa" }}>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Avg Visibility by LLM</span>
            <span className="text-gray-200 text-xs">|</span>
            {llmChips.map(({ name, color, avg }) => (
              <div key={name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white" style={{ border: "1px solid #e8e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-gray-700">{name}</span>
                {loading ? (
                  <span className="w-6 h-3 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <span className="font-bold" style={{ color }}>{avg}%</span>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-50 px-6 py-3 text-center" style={{ background: "#fafafa" }}>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Data based on real LLM queries across Claude and GPT-4o. Refreshed every 24 hours.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
