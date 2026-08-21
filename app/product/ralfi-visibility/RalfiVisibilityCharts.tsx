"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const GREEN  = "#059669";
const TEAL   = "#0D9488";
const NAVY   = "#0F172A";

const LINE_COLORS = [
  "#059669", "#0D9488", "#2563EB", "#7C3AED", "#C2186A",
  "#DC2626", "#D97706", "#EA580C", "#0891B2", "#C026D3",
  "#65A30D", "#0369A1", "#92400E", "#BE185D", "#F43F5E",
  "#84CC16", "#FB923C", "#818CF8", "#34D399", "#FCD34D",
];
function lineColor(i: number) { return LINE_COLORS[i % LINE_COLORS.length]; }

const CLUSTER_LABELS: Record<string, string> = {
  "ralfi-overall":    "Overall",
  "ralfi-renewal":    "Renewal Management",
  "ralfi-documents":  "Document Processing",
  "ralfi-risk":       "Risk & Submission",
  "ralfi-claims":     "Claims Advocacy",
  "ralfi-comms":      "Client Comms",
  "ralfi-compliance": "Compliance & Audit",
};

function clusterLabel(tag: string): string {
  return CLUSTER_LABELS[tag] ?? tag;
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface DailyRow   { date: string; brand: string; model: string; mention_count: number; avg_position: number | null }
interface WeeklyRow  { brand: string; model: string; mention_count: number; avg_position: number | null }
interface LLMVisRow  { model: string; visibility_pct: number; total_responses: number }
interface SOVRow     { cluster_tag: string; brand: string; total_appearances: number; sov_pct: number }

interface Props {
  dailySummary:  DailyRow[];
  weeklySummary: WeeklyRow[];
  llmVisibility: LLMVisRow[];
  sovData:       SOVRow[];
}

// ── Shared sub-components ──────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: "1px solid rgba(5,150,105,0.10)",
      boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      padding: "24px 28px 28px",
      marginBottom: 20,
    }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, letterSpacing: "-0.01em" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8,
      padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: NAVY }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, color: "#333" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0, display: "inline-block" }} />
          <span>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main export ────────────────────────────────────────────────────────────────
export default function RalfiVisibilityCharts({ dailySummary, weeklySummary, llmVisibility, sovData }: Props) {

  const [activeModel, setActiveModel] = useState<"all" | "claude-haiku-4-5" | "gpt-4o-mini">("all");
  const [sovCluster, setSovCluster]   = useState<string>("ralfi-overall");

  // ── Top brands (combined) ──────────────────────────────────────────────────
  const topBrands = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of weeklySummary) {
      if (activeModel !== "all" && r.model !== activeModel) continue;
      map.set(r.brand, (map.get(r.brand) ?? 0) + r.mention_count);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([brand, count], i) => ({ brand, count, color: LINE_COLORS[i % LINE_COLORS.length] }));
  }, [weeklySummary, activeModel]);

  // ── 7-day trend ────────────────────────────────────────────────────────────
  const trendData = useMemo(() => {
    const topN = new Set(topBrands.slice(0, 10).map((b) => b.brand));
    const byDate = new Map<string, Record<string, number>>();
    for (const r of dailySummary) {
      if (!topN.has(r.brand)) continue;
      if (activeModel !== "all" && r.model !== activeModel) continue;
      if (!byDate.has(r.date)) byDate.set(r.date, {});
      byDate.get(r.date)![r.brand] = (byDate.get(r.date)![r.brand] ?? 0) + r.mention_count;
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, brands]) => ({ date: fmtDate(date), ...brands }));
  }, [dailySummary, topBrands, activeModel]);

  const trendBrands = topBrands.slice(0, 10).map((b) => b.brand);

  // ── SOV for selected cluster ──────────────────────────────────────────────
  const sovForCluster = useMemo(() => {
    return sovData
      .filter((r) => r.cluster_tag === sovCluster)
      .sort((a, b) => b.total_appearances - a.total_appearances)
      .slice(0, 15);
  }, [sovData, sovCluster]);

  const allClusters = useMemo(() => {
    const tags = [...new Set(sovData.map((r) => r.cluster_tag))];
    const order = ["ralfi-overall","ralfi-renewal","ralfi-documents","ralfi-risk","ralfi-claims","ralfi-comms","ralfi-compliance"];
    return order.filter((t) => tags.includes(t)).concat(tags.filter((t) => !order.includes(t)));
  }, [sovData]);

  // ── Model toggle ──────────────────────────────────────────────────────────
  const modelBtn = (m: typeof activeModel, label: string) => (
    <button
      key={m}
      onClick={() => setActiveModel(m)}
      style={{
        padding: "5px 14px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        border: "1px solid",
        cursor: "pointer",
        background: activeModel === m ? GREEN : "#fff",
        color: activeModel === m ? "#fff" : "#444",
        borderColor: activeModel === m ? GREEN : "#ddd",
      }}
    >
      {label}
    </button>
  );

  const noData = weeklySummary.length === 0;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (noData) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid rgba(5,150,105,0.12)",
          padding: "48px 32px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            No data yet
          </div>
          <div style={{ fontSize: 14, color: "#666", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
            Collection hasn&apos;t run yet or the aggregate job is still pending.
            Check back after the first <strong>ralfi-aggregate</strong> cron fires
            (~35 min after the first collection job).
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: "#aaa" }}>
            Spot-check: <code style={{ background: "#F1F5F9", padding: "2px 6px", borderRadius: 4 }}>
              SELECT COUNT(*) FROM ralfi_raw_responses;
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">

      {/* ── Model toggle ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" as const }}>
        <span style={{ fontSize: 12, color: "#888", alignSelf: "center", marginRight: 4 }}>Filter by model:</span>
        {modelBtn("all",              "Both models")}
        {modelBtn("claude-haiku-4-5", "Claude Haiku")}
        {modelBtn("gpt-4o-mini",      "GPT-4o-mini")}
      </div>

      {/* ── Top brands bar chart ── */}
      <SectionCard
        title="Top brands by total mentions"
        subtitle={`Last 14 days · ${activeModel === "all" ? "both models combined" : activeModel}`}
      >
        <ResponsiveContainer width="100%" height={Math.max(240, topBrands.length * 28)}>
          <BarChart
            data={topBrands}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 120, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#888" }} />
            <YAxis type="category" dataKey="brand" tick={{ fontSize: 12, fill: "#333" }} width={115} />
            <Tooltip
              cursor={{ fill: "rgba(5,150,105,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as { brand: string; count: number };
                return (
                  <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                    <div style={{ fontWeight: 700, color: NAVY }}>{d.brand}</div>
                    <div style={{ color: GREEN }}>{d.count} mentions</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {topBrands.map((b) => <Cell key={b.brand} fill={b.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* ── Trend line chart ── */}
      {trendData.length > 1 && (
        <SectionCard
          title="Daily mention trend — top 10 brands"
          subtitle="Each day = total appearances across all prompts for that model selection"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} />
              <YAxis tick={{ fontSize: 11, fill: "#888" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {trendBrands.map((brand, i) => (
                <Line
                  key={brand}
                  type="monotone"
                  dataKey={brand}
                  stroke={lineColor(i)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      {/* ── Share of Voice by cluster ── */}
      <SectionCard
        title="Share of voice by cluster"
        subtitle="Brand appearances as % of total within each cluster"
      >
        {/* Cluster tabs */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 20 }}>
          {allClusters.map((tag) => (
            <button
              key={tag}
              onClick={() => setSovCluster(tag)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid",
                cursor: "pointer",
                background: sovCluster === tag ? GREEN : "#fff",
                color: sovCluster === tag ? "#fff" : "#444",
                borderColor: sovCluster === tag ? GREEN : "#ddd",
              }}
            >
              {clusterLabel(tag)}
            </button>
          ))}
        </div>

        {sovForCluster.length === 0 ? (
          <div style={{ fontSize: 13, color: "#888", padding: "12px 0" }}>
            No data for this cluster yet.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" as const }}>
            {/* Bar list */}
            <div style={{ flex: 1, minWidth: 260 }}>
              {sovForCluster.map((r, i) => (
                <div key={r.brand} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                  <div style={{ width: 100, fontSize: 12, fontWeight: 600, color: "#333", textAlign: "right", flexShrink: 0 }}>
                    {r.brand}
                  </div>
                  <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 4, height: 18, overflow: "hidden" }}>
                    <div style={{
                      width: `${r.sov_pct}%`,
                      height: "100%",
                      background: LINE_COLORS[i % LINE_COLORS.length],
                      borderRadius: 4,
                      transition: "width 0.3s",
                    }} />
                  </div>
                  <div style={{ width: 38, fontSize: 12, color: "#555", flexShrink: 0 }}>{r.sov_pct}%</div>
                </div>
              ))}
            </div>

            {/* Donut */}
            <div style={{ flexShrink: 0 }}>
              <PieChart width={200} height={200}>
                <Pie
                  data={sovForCluster.slice(0, 8)}
                  dataKey="total_appearances"
                  nameKey="brand"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {sovForCluster.slice(0, 8).map((r, i) => (
                    <Cell key={r.brand} fill={LINE_COLORS[i % LINE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as SOVRow;
                    return (
                      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: NAVY }}>{d.brand}</div>
                        <div style={{ color: GREEN }}>{d.sov_pct}% · {d.total_appearances} appearances</div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── LLM visibility ── */}
      {llmVisibility.length > 0 && (
        <SectionCard
          title="LLM response rate"
          subtitle="% of prompts where the model returned at least one brand (non-empty response)"
        >
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const }}>
            {llmVisibility.map((r) => (
              <div key={r.model} style={{
                flex: 1,
                minWidth: 200,
                background: "#F8FFFE",
                border: "1px solid rgba(5,150,105,0.14)",
                borderRadius: 10,
                padding: "16px 20px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  {r.model}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: GREEN, lineHeight: 1 }}>
                  {r.visibility_pct}%
                </div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  {r.total_responses.toLocaleString()} total responses
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Raw brand table ── */}
      <SectionCard
        title="All brands — full table"
        subtitle="Sorted by total mentions, last 14 days, both models"
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0" }}>
                {["Rank", "Brand", "Total mentions", "Claude Haiku", "GPT-4o-mini", "Avg position"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "#555", whiteSpace: "nowrap" as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topBrands.map((b, i) => {
                const claudeRow = weeklySummary.find((r) => r.brand === b.brand && r.model === "claude-haiku-4-5");
                const gptRow    = weeklySummary.find((r) => r.brand === b.brand && r.model === "gpt-4o-mini");
                const allRows   = weeklySummary.filter((r) => r.brand === b.brand);
                const avgPos    = allRows.some((r) => r.avg_position != null)
                  ? (allRows.filter((r) => r.avg_position != null).reduce((s, r) => s + (r.avg_position ?? 0), 0) / allRows.filter((r) => r.avg_position != null).length).toFixed(1)
                  : "—";
                return (
                  <tr key={b.brand} style={{ borderBottom: "1px solid #F1F5F9", background: i % 2 === 0 ? "#fff" : "#FAFFFE" }}>
                    <td style={{ padding: "8px 12px", color: "#aaa", fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 700, color: NAVY }}>{b.brand}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 800, color: GREEN }}>{b.count}</td>
                    <td style={{ padding: "8px 12px", color: "#555" }}>{claudeRow?.mention_count ?? 0}</td>
                    <td style={{ padding: "8px 12px", color: "#555" }}>{gptRow?.mention_count ?? 0}</td>
                    <td style={{ padding: "8px 12px", color: "#888" }}>{avgPos}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", padding: "12px 0 32px" }}>
        Ralfi pipeline · {weeklySummary.length} brand/model rows · data auto-updates daily after aggregate cron
      </p>
    </div>
  );
}
