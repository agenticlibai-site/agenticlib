"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import type { SeamlessFeatureReportRow } from "@/lib/brand-visibility/db";

// ── Palette ────────────────────────────────────────────────────────────────────
const NAVY   = "#000000";
const BLUE   = "#2563EB";
const INDIGO = "#6B4FBB";
const SEAMLESS_BLUE = "#0369A1";

const LINE_COLORS = [
  "#2563EB", "#6B4FBB", "#E8447A", "#059669", "#DC2626",
  "#D97706", "#0891B2", "#C026D3", "#EA580C", "#0D9488",
  "#7C3AED", "#65A30D", "#0369A1", "#92400E", "#BE185D",
  "#F43F5E", "#84CC16", "#FB923C", "#818CF8", "#34D399",
];

const BRAND_COLOR_MAP: Record<string, string> = {
  "Chorus": "#2563EB", "Outreach": "#6B4FBB", "Gong": "#E8447A",
  "Salesloft": "#059669", "Clari": "#DC2626", "Conversica": "#D97706",
  "Revenue.io": "#0891B2", "Apollo": "#C026D3", "ZoomInfo": "#EA580C",
  "Lemlist": "#0D9488", "Clay": "#7C3AED", "Reply.io": "#65A30D",
  "Seamless.ai": "#0369A1", "Avoma": "#92400E", "Backstory.ai": "#BE185D",
  "6sense": "#F43F5E", "Mindtickle": "#84CC16", "Highspot": "#FB923C",
  "Tact.ai": "#818CF8",
};
function getBrandColor(brand: string): string {
  return BRAND_COLOR_MAP[brand] ?? LINE_COLORS[0];
}

const SUB_BRAND_LABEL: Record<string, string> = {
  "Clari": "Salesloft (Clari)",
  "Chorus": "ZoomInfo (Chorus)",
};
function displayBrand(brand: string): string {
  return SUB_BRAND_LABEL[brand] ?? brand;
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

const LOCKED_SALES_BRANDS = new Set([
  "Chorus", "Outreach", "Gong", "Salesloft", "Clari",
  "Conversica", "Revenue.io", "Apollo", "ZoomInfo",
  "Lemlist", "Clay", "Reply.io", "Seamless.ai", "Avoma",
  "Backstory.ai", "6sense", "Mindtickle", "Highspot", "Tact.ai",
]);

const BRAND_USE_CASE: Record<string, string> = {
  "Chorus": "sales-call", "Gong": "sales-call", "Revenue.io": "sales-call", "Avoma": "sales-call",
  "Backstory.ai": "sales-crm", "Tact.ai": "sales-crm",
  "Clari": "sales-pipeline", "6sense": "sales-pipeline",
  "Outreach": "sales-outreach", "Salesloft": "sales-outreach", "Conversica": "sales-outreach",
  "Apollo": "sales-outreach", "Lemlist": "sales-outreach", "Clay": "sales-outreach",
  "Reply.io": "sales-outreach", "Seamless.ai": "sales-outreach", "ZoomInfo": "sales-outreach",
  "Mindtickle": "sales-enablement", "Highspot": "sales-enablement",
};

const SOV_CLUSTERS = [
  { tag: "sales-call",       label: "Call Intelligence & Coaching" },
  { tag: "sales-crm",        label: "CRM Automation" },
  { tag: "sales-pipeline",   label: "Deal Risk & Pipeline Forecasting" },
  { tag: "sales-outreach",   label: "AI SDR & Outreach" },
  { tag: "sales-enablement", label: "Sales Enablement & Follow-up" },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface DailyRow      { date: string; brand: string; model: string; mention_count: number; avg_position: number | null }
interface WeeklyRow     { brand: string; model: string; mention_count: number; avg_position: number | null }
interface LLMVisRow     { model: string; visibility_pct: number; total_responses: number }
interface SOVRow        { bucket_tag: string; brand: string; total_appearances: number; sov_pct: number }
interface ClusterPosRow { bucket_tag: string; brand: string; avg_position: number; appearances: number }

interface Props {
  dailySummary:     DailyRow[];
  weeklySummary:    WeeklyRow[];
  llmVisibility:    LLMVisRow[];
  sovData:          SOVRow[];
  clusterPositions: ClusterPosRow[];
  featureReport:    SeamlessFeatureReportRow[];
}

// ── Sub-components ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CombinedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload]
    .filter((item: any) => item.value != null)
    .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0));
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.10)", borderRadius: 8, fontSize: 15, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "8px 12px", zIndex: 100 }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: NAVY }}>{fmtDate(String(label))}</p>
      {sorted.map((item: any) => (
        <div key={item.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0, display: "inline-block" }} />
          <span style={{ color: item.value > 0 ? item.color : "#aaa" }}>{displayBrand(String(item.dataKey))} : {item.value}</span>
        </div>
      ))}
    </div>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px", borderTop: accent ? `3px solid ${accent}` : undefined }}>
      {children}
    </div>
  );
}
function CardLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000", marginBottom: 8 }}>{children}</p>;
}
function BigNumber({ value, sub }: { value: string; sub: string }) {
  return (
    <>
      <p style={{ fontSize: 36, fontWeight: 800, color: NAVY, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      <p style={{ fontSize: 15, color: "#000" }}>{sub}</p>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const angle = percent >= 0.999 ? 90 : midAngle;
  const x = cx + radius * Math.cos(-angle * RADIAN);
  const y = cy + radius * Math.sin(-angle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 700, pointerEvents: "none" }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

function SOVCard({ cluster, rows }: { cluster: typeof SOV_CLUSTERS[number]; rows: SOVRow[] }) {
  const locked = rows.filter(r => LOCKED_SALES_BRANDS.has(r.brand) && BRAND_USE_CASE[r.brand] === cluster.tag);
  const totalAppearances = locked.reduce((s, r) => s + r.total_appearances, 0);
  const mapped = locked.map(r => ({
    ...r,
    sov_pct: totalAppearances > 0 ? Math.round((r.total_appearances / totalAppearances) * 1000) / 10 : 0,
  }));
  const top8 = mapped.slice(0, 8);
  const restAppearances = mapped.slice(8).reduce((s, r) => s + r.total_appearances, 0);
  const othersEntry = restAppearances > 0 ? {
    brand: "Others", bucket_tag: cluster.tag, total_appearances: restAppearances,
    sov_pct: Math.round((restAppearances / totalAppearances) * 1000) / 10,
  } : null;
  const slices = othersEntry ? [...top8, othersEntry] : top8;
  if (slices.length === 0) return null;
  const colorMap: Record<string, string> = Object.fromEntries(top8.map(r => [r.brand, getBrandColor(r.brand)]));
  if (othersEntry) colorMap["Others"] = "#94A3B8";
  return (
    <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px" }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 4, letterSpacing: "-0.01em" }}>{cluster.label}</h3>
      <p style={{ fontSize: 15, color: "#000", marginBottom: 16 }}>Share of voice · last 14 days</p>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ flexShrink: 0 }}>
          <PieChart width={150} height={150} style={{ overflow: "visible" }}>
            <Pie data={slices} dataKey="total_appearances" cx={70} cy={70} innerRadius={38} outerRadius={65} paddingAngle={2} labelLine={false} label={(props) => <PieSliceLabel {...props} />}>
              {slices.map(r => <Cell key={r.brand} fill={colorMap[r.brand]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 15, border: "1px solid rgba(0,0,0,0.1)" }}
              formatter={(_v: unknown, _n: unknown, p: any) => [`${(p.payload as SOVRow & { sov_pct: number }).sov_pct}%`, displayBrand((p.payload as SOVRow).brand)]} />
          </PieChart>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {slices.map(r => (
            <div key={r.brand} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: colorMap[r.brand] }} />
              <span style={{
                fontSize: 15, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                color: r.brand === "Seamless.ai" ? SEAMLESS_BLUE : NAVY,
                fontWeight: r.brand === "Seamless.ai" ? 700 : 400,
              }}>{displayBrand(r.brand)}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#000", flexShrink: 0 }}>{r.sov_pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Feature score band pill ────────────────────────────────────────────────────
function ScoreBand({ band, score }: { band: string; score: number | null }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    strong:       { bg: "rgba(5,150,105,0.10)",  color: "#059669", label: "Strong" },
    partial:      { bg: "rgba(217,119,6,0.10)",  color: "#D97706", label: "Partial" },
    weak:         { bg: "rgba(220,38,38,0.10)",  color: "#DC2626", label: "Weak" },
    undocumented: { bg: "rgba(0,0,0,0.06)",      color: "#555",    label: "Undocumented" },
  };
  const cfg = config[band] ?? config.undocumented;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: cfg.bg, color: cfg.color, borderRadius: 6, padding: "3px 10px", fontSize: 13, fontWeight: 700 }}>
      {score != null ? `${score} / ` : ""}{cfg.label}
    </span>
  );
}

// ── Feature labels ─────────────────────────────────────────────────────────────
const FEATURE_LABEL: Record<string, string> = {
  ai_personalisation:        "AI Personalisation",
  outreach_sequencing:       "Outreach Sequencing",
  cost_pricing_transparency: "Pricing Transparency",
  rai_data_privacy:          "Data Privacy",
};

const FEATURE_ORDER = ["ai_personalisation", "outreach_sequencing", "cost_pricing_transparency", "rai_data_privacy"];

// ── Main component ─────────────────────────────────────────────────────────────
export default function SeamlessReportCharts({
  dailySummary, weeklySummary, llmVisibility, sovData, clusterPositions, featureReport,
}: Props) {
  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());
  function toggleBrand(b: string) {
    setHiddenBrands(prev => { const next = new Set(prev); if (next.has(b)) next.delete(b); else next.add(b); return next; });
  }

  const CHART_DATE_FROM = "2026-07-06";
  const CHART_DATE_TO   = "2026-07-12";
  const rangedDaily = dailySummary.filter(r => r.date >= CHART_DATE_FROM && r.date <= CHART_DATE_TO);

  // ── Build chart data (locked brands only) ────────────────────────────────────
  const dateSet = new Set<string>();
  const index: Record<string, Record<string, number>> = {};
  for (const row of rangedDaily) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    dateSet.add(row.date);
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
  }

  const weeklyTotals: Record<string, { mentions: number; avgPos: number | null }> = {};
  for (const row of weeklySummary) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    const e = weeklyTotals[row.brand] ?? { mentions: 0, avgPos: null };
    weeklyTotals[row.brand] = { mentions: e.mentions + row.mention_count, avgPos: row.avg_position ?? e.avgPos };
  }

  const dates  = [...dateSet].sort();
  const brands = [...LOCKED_SALES_BRANDS].sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0));
  const brandColor = (b: string) => getBrandColor(b);

  const chartRows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const b of brands) row[b] = index[date]?.[b] ?? 0;
    return row;
  });

  const clusterCharts = SOV_CLUSTERS.map(cluster => {
    const clusterBrands = Object.entries(BRAND_USE_CASE)
      .filter(([, tag]) => tag === cluster.tag).map(([b]) => b)
      .filter(b => LOCKED_SALES_BRANDS.has(b))
      .sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0));
    const rows = dates.map(date => {
      const row: Record<string, number | string> = { date };
      for (const b of clusterBrands) row[b] = index[date]?.[b] ?? 0;
      return row;
    });
    return { ...cluster, clusterBrands, rows };
  });

  const totalMentions = Object.values(weeklyTotals).reduce((s, v) => s + v.mentions, 0);
  const hasWeekly = Object.keys(weeklyTotals).length > 0;
  const hasReal   = dailySummary.length > 0;
  const hasVis    = llmVisibility.length > 0;

  const topByMentions = brands.reduce<string | null>((best, b) =>
    !best || (weeklyTotals[b]?.mentions ?? 0) > (weeklyTotals[best]?.mentions ?? 0) ? b : best, null);
  const topMentionData = topByMentions ? weeklyTotals[topByMentions] : null;

  const modelMentionsByBrand: Record<string, { claude: number; gpt: number }> = {};
  for (const row of rangedDaily) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    if (!modelMentionsByBrand[row.brand]) modelMentionsByBrand[row.brand] = { claude: 0, gpt: 0 };
    if (row.model === "claude-haiku-4-5") modelMentionsByBrand[row.brand].claude += row.mention_count;
    else modelMentionsByBrand[row.brand].gpt += row.mention_count;
  }
  const modelMentionsData = brands
    .map(b => ({ brand: b, claude: modelMentionsByBrand[b]?.claude ?? 0, gpt: modelMentionsByBrand[b]?.gpt ?? 0 }))
    .filter(d => d.claude + d.gpt > 0)
    .sort((a, b) => (b.claude + b.gpt) - (a.claude + a.gpt));

  const posTable = Object.entries(weeklyTotals)
    .filter(([brand, v]) => LOCKED_SALES_BRANDS.has(brand) && v.avgPos != null)
    .sort((a, b) => (a[1].avgPos ?? 99) - (b[1].avgPos ?? 99))
    .slice(0, 20)
    .map(([brand, v], i) => ({ rank: i + 1, brand, avgPos: v.avgPos as number, mentions: v.mentions }));

  const clusterPosLookup: Record<string, Record<string, number>> = {};
  for (const row of clusterPositions) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    if (!clusterPosLookup[row.bucket_tag]) clusterPosLookup[row.bucket_tag] = {};
    clusterPosLookup[row.bucket_tag][row.brand] = row.avg_position;
  }
  const clusterGroups = SOV_CLUSTERS.map(cluster => {
    const brandsInCluster = Object.entries(BRAND_USE_CASE)
      .filter(([, tag]) => tag === cluster.tag).map(([brand]) => brand)
      .filter(brand => LOCKED_SALES_BRANDS.has(brand))
      .map(brand => ({ brand, avg_position: clusterPosLookup[cluster.tag]?.[brand] ?? null }))
      .sort((a, b) => (a.avg_position ?? 999) - (b.avg_position ?? 999));
    return { ...cluster, brands: brandsInCluster };
  });
  const hasClusterPos = clusterPositions.length > 0;

  // ── Seamless.ai feature report (keyed by feature_id) ─────────────────────────
  const featureMap = Object.fromEntries(featureReport.map(r => [r.feature_id, r]));

  // ── Next-step copy per feature ────────────────────────────────────────────────
  const NEXT_STEPS: Record<string, { type: "real" | "doc"; action: string }> = {
    ai_personalisation: {
      type: "real",
      action: "Build autonomous personalisation — the current Pitch Intelligence + AI Campaigns stack generates drafts for reps to send; closing this gap means enabling fully signal-triggered, automated send without human review.",
    },
    outreach_sequencing: {
      type: "doc",
      action: "Publish clear, indexed documentation for Seamless Connect's sequence builder and AI Campaigns. The capability now exists (launched Jan and Jun 2026) but LLMs can't confirm it — the fix is visibility, not development.",
    },
    cost_pricing_transparency: {
      type: "doc",
      action: "Publish tier-specific pricing details — what each plan includes, hard credit limits, and annual vs. monthly rates — directly on the pricing page, rather than routing mid-market buyers to a sales call.",
    },
    rai_data_privacy: {
      type: "doc",
      action: "Create a public Trust Center URL with SOC 2 report references, GDPR posture statement, and CCPA compliance details. SOC 2 Type II is claimed on-site but LLMs can't confirm it from public sources.",
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 1: Metric cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Card accent={SEAMLESS_BLUE}>
          <CardLabel>Brand Mentions · 7 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "—"}
            sub={hasWeekly ? `across ${brands.length} brands · 2 models` : "No data yet"}
          />
        </Card>
        <Card accent={INDIGO}>
          <CardLabel>LLM Visibility · 7 Days</CardLabel>
          {!hasVis ? <p style={{ fontSize: 17, color: "#000" }}>No data yet</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {llmVisibility.map((v, i) => {
                const label = v.model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? SEAMLESS_BLUE : INDIGO;
                return (
                  <div key={v.model}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#000", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
                      <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{v.visibility_pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                      <div style={{ height: 5, borderRadius: 999, width: `${Math.min(v.visibility_pct, 100)}%`, background: color }} />
                    </div>
                    <p style={{ fontSize: 14, color: "#000", marginTop: 4 }}>{v.total_responses} responses</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card accent={NAVY}>
          <CardLabel>Top Brand · 7 Days</CardLabel>
          {topByMentions && topMentionData ? (
            <>
              <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 4 }}>{displayBrand(topByMentions)}</p>
              <p style={{ fontSize: 15, color: "#000" }}>
                {topMentionData.mentions.toLocaleString()} mentions
                {topMentionData.avgPos != null ? ` · avg position ${topMentionData.avgPos.toFixed(1)}` : ""}
              </p>
            </>
          ) : <p style={{ fontSize: 17, color: "#000" }}>No data yet</p>}
        </Card>
      </div>

      {/* ── Row 2: Combined 7-day trend ─────────────────────────────────────── */}
      {hasReal && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px 16px" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>Brand Mentions: 7-Day Trend</h3>
          <p style={{ fontSize: 15, color: "#000", marginBottom: 14 }}>All brands · both models combined</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CombinedTooltip />} wrapperStyle={{ zIndex: 100 }} allowEscapeViewBox={{ x: false, y: true }} />
              {brands.map(b => (
                <Line key={b} type="monotone" dataKey={b} stroke={brandColor(b)}
                  strokeWidth={hiddenBrands.has(b) ? 0 : b === "Seamless.ai" ? 3 : 2}
                  dot={false} activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", flex: 1 }}>
              {brands.map(b => (
                <label key={b} style={{ display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", opacity: hiddenBrands.has(b) ? 0.45 : 1 }}>
                  <input type="checkbox" checked={!hiddenBrands.has(b)} onChange={() => toggleBrand(b)}
                    style={{ accentColor: brandColor(b), width: 13, height: 13, cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: hiddenBrands.has(b) ? "#999" : b === "Seamless.ai" ? SEAMLESS_BLUE : NAVY, fontWeight: b === "Seamless.ai" ? 700 : 400 }}>
                    {displayBrand(b)}
                  </span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
              <button onClick={() => setHiddenBrands(new Set())} style={{ fontSize: 12, fontWeight: 600, color: SEAMLESS_BLUE, background: "rgba(3,105,161,0.07)", border: "1px solid rgba(3,105,161,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>Select All</button>
              <button onClick={() => setHiddenBrands(new Set(brands))} style={{ fontSize: 12, fontWeight: 600, color: "#555", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: Trends by use case ────────────────────────────────────────── */}
      {hasReal && (
        <>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>Brand Mentions: 7-Day Trend by Use Case</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {clusterCharts.map(({ tag, label, clusterBrands, rows }) => (
              <div key={tag} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px 16px" }}>
                <h4 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>{label}</h4>
                <p style={{ fontSize: 15, color: "#000", marginBottom: 14 }}>7-day mentions · both models</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} dy={6} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip content={<CombinedTooltip />} wrapperStyle={{ zIndex: 100 }} allowEscapeViewBox={{ x: false, y: true }} />
                    {clusterBrands.map(b => (
                      <Line key={b} type="monotone" dataKey={b} name={displayBrand(b)} stroke={brandColor(b)}
                        strokeWidth={hiddenBrands.has(b) ? 0 : b === "Seamless.ai" ? 3 : 2}
                        dot={false} activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  {clusterBrands.map(b => (
                    <label key={b} style={{ display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", opacity: hiddenBrands.has(b) ? 0.45 : 1 }}>
                      <input type="checkbox" checked={!hiddenBrands.has(b)} onChange={() => toggleBrand(b)}
                        style={{ accentColor: brandColor(b), width: 13, height: 13, cursor: "pointer", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: hiddenBrands.has(b) ? "#999" : b === "Seamless.ai" ? SEAMLESS_BLUE : NAVY, fontWeight: b === "Seamless.ai" ? 700 : 400 }}>
                        {displayBrand(b)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Row 4a: Brand mentions by model ─────────────────────────────────── */}
      {hasReal && modelMentionsData.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 20px" }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>Brand Mentions · 7 Days · by Model</h3>
          <p style={{ fontSize: 16, color: "#000", marginBottom: 16 }}>Total mentions per brand across Claude Haiku and GPT-4o mini</p>
          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            {[{ label: "Claude Haiku", color: SEAMLESS_BLUE }, { label: "GPT-4o mini", color: INDIGO }].map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={modelMentionsData.length * 28 + 10}>
            <BarChart layout="vertical" data={modelMentionsData} margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barSize={14}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="brand" width={130} tickFormatter={displayBrand} tick={{ fontSize: 15, fill: NAVY }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.10)", fontSize: 16, color: NAVY }} labelFormatter={(label) => displayBrand(String(label))} formatter={(value, name) => [value, name === "claude" ? "Claude Haiku" : "GPT-4o mini"]} />
              <Bar dataKey="claude" stackId="a" fill={SEAMLESS_BLUE} radius={[0, 0, 0, 0]} />
              <Bar dataKey="gpt"    stackId="a" fill={INDIGO}        radius={[3, 3, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Row 4b: Brand position table ─────────────────────────────────────── */}
      {posTable.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>Brand Position Summary</h3>
            <p style={{ fontSize: 16, color: "#000" }}>Average position brands appear in AI responses (lower is stronger)</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 17 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.025)" }}>
                  {["Rank", "Brand", "Avg Position", "7-Day Mentions"].map(h => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 15, fontWeight: 700, color: "#000", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posTable.map((row, i) => (
                  <tr key={row.brand} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: row.brand === "Seamless.ai" ? "rgba(3,105,161,0.04)" : i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.012)" }}>
                    <td style={{ padding: "11px 20px", color: "#000", fontWeight: 600 }}>#{row.rank}</td>
                    <td style={{ padding: "11px 20px", fontWeight: 600, color: row.brand === "Seamless.ai" ? SEAMLESS_BLUE : NAVY }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(row.brand), flexShrink: 0, display: "inline-block" }} />
                        {displayBrand(row.brand)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", color: NAVY }}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", background: row.avgPos <= 3 ? "rgba(3,105,161,0.10)" : "rgba(0,0,0,0.05)", color: row.avgPos <= 3 ? SEAMLESS_BLUE : "#000" }}>
                        {row.avgPos.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", color: "#000" }}>{row.mentions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Row 5: Avg position by use case ─────────────────────────────────── */}
      {hasClusterPos && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>Avg Brand Position by Use Case</h3>
            <p style={{ fontSize: 16, color: "#000" }}>Each brand shown in its primary use case · lower is better</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            {clusterGroups.map((cluster, ci) => (
              <div key={cluster.tag} style={{ padding: "16px 20px", borderRight: ci % 3 !== 2 ? "1px solid rgba(0,0,0,0.06)" : undefined, borderBottom: ci < 3 ? "1px solid rgba(0,0,0,0.06)" : undefined }}>
                <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#000", marginBottom: 12 }}>{cluster.label}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cluster.brands.map(({ brand, avg_position }) => (
                    <div key={brand} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(brand), flexShrink: 0, display: "inline-block" }} />
                      <span style={{ flex: 1, fontSize: 16, fontWeight: brand === "Seamless.ai" ? 700 : 600, color: brand === "Seamless.ai" ? SEAMLESS_BLUE : NAVY }}>{displayBrand(brand)}</span>
                      {avg_position != null ? (
                        <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", background: avg_position <= 3 ? "rgba(3,105,161,0.10)" : "rgba(0,0,0,0.05)", color: avg_position <= 3 ? SEAMLESS_BLUE : "#000" }}>
                          {avg_position.toFixed(1)}
                        </span>
                      ) : <span style={{ fontSize: 15, color: "#000" }}>—</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 6: SOV donuts ───────────────────────────────────────────────── */}
      {sovData.length > 0 && (
        <>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>Use Case Share of Voice</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {SOV_CLUSTERS.map(cluster => {
              const rows = sovData.filter(r => r.bucket_tag === cluster.tag);
              return rows.length > 0 ? <SOVCard key={cluster.tag} cluster={cluster} rows={rows} /> : null;
            })}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── Seamless.ai analysis ─────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      {/* Section divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(3,105,161,0.2)" }} />
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SEAMLESS_BLUE, background: "rgba(3,105,161,0.08)", borderRadius: 999, padding: "6px 20px", whiteSpace: "nowrap" }}>
          Seamless.ai Analysis
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(3,105,161,0.2)" }} />
      </div>

      {/* Section 1 — SOV Position */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px", borderLeft: `4px solid ${SEAMLESS_BLUE}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: SEAMLESS_BLUE, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SEAMLESS_BLUE }}>SOV Position · AI SDR &amp; Outreach</span>
        </div>
        <p style={{ fontSize: 22, fontWeight: 800, color: NAVY, lineHeight: 1.3, marginBottom: 10, letterSpacing: "-0.01em" }}>
          You rank 11th of 300+ tracked brands in AI SDR &amp; Outreach at 2.95% share of voice.
        </p>
        <p style={{ fontSize: 16, color: "#000", lineHeight: 1.7 }}>
          76 confirmed mentions in the Jul 6–12 scoring window across Claude and GPT-4o mini. That puts Seamless.ai ahead of more than 290 other brands in the cluster — confirming real, category-recognized LLM visibility. Note: "Seamless," "Seamless AI," and "Seamless.AI" appear as separate variant strings adding 6 further mentions; merged, the figure is 82 mentions / ~3.18%, still 11th.
        </p>
      </div>

      {/* Section 2 — Feature Scores */}
      <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>Product Feature Scores</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {FEATURE_ORDER.map(fid => {
          const row = featureMap[fid];
          if (!row) return null;
          return (
            <div key={fid} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>{FEATURE_LABEL[fid] ?? fid}</span>
                <span style={{ color: "rgba(0,0,0,0.25)" }}>·</span>
                <span style={{ fontSize: 13, color: "#555" }}>feature_id: {fid}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Seamless.ai column */}
                <div style={{ background: "rgba(3,105,161,0.04)", border: "1px solid rgba(3,105,161,0.15)", borderRadius: 8, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: SEAMLESS_BLUE, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: SEAMLESS_BLUE }}>Seamless.ai</span>
                    <span style={{ marginLeft: "auto" }}><ScoreBand band={row.seamless_band} score={row.seamless_score} /></span>
                  </div>
                  {row.seamless_evidence ? (
                    <p style={{ fontSize: 13, color: "#000", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                      &ldquo;{row.seamless_evidence}&rdquo;
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: "#888", margin: 0, fontStyle: "italic" }}>No evidence text recorded.</p>
                  )}
                </div>
                {/* Top peer column */}
                <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: row.top_peer_brand ? getBrandColor(row.top_peer_brand) : "#ccc", display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{row.top_peer_brand ?? "—"}</span>
                    {row.top_peer_band && row.top_peer_score != null && (
                      <span style={{ marginLeft: "auto" }}><ScoreBand band={row.top_peer_band} score={row.top_peer_score} /></span>
                    )}
                  </div>
                  {row.top_peer_evidence ? (
                    <p style={{ fontSize: 13, color: "#000", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                      &ldquo;{row.top_peer_evidence}&rdquo;
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: "#888", margin: 0, fontStyle: "italic" }}>No evidence text recorded.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 3 — Synthesis */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 12, letterSpacing: "-0.01em" }}>What the data says</h3>
        <p style={{ fontSize: 16, color: "#000", lineHeight: 1.8, margin: 0 }}>
          Seamless.ai&apos;s 11th-place SOV ranking reflects real category recognition — its core strength in contact intelligence lands with LLMs. The pattern across the four scored features is consistent: three of the four null scores are documentation gaps, not capability absences. Outreach sequencing now exists via Seamless Connect but wasn&apos;t confirmed in the scoring window. Pricing and privacy documentation exists internally but isn&apos;t accessible enough for LLMs to cite. The one genuine functional gap is AI personalisation — currently rep-assist rather than autonomous — which is a real product investment, not a documentation fix.
        </p>
      </div>

      {/* Section 4 — Next Steps */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>Next Steps</h3>
          <p style={{ fontSize: 15, color: "#000" }}>One concrete action per feature gap</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {FEATURE_ORDER.map((fid, i) => {
            const step = NEXT_STEPS[fid];
            if (!step) return null;
            const row = featureMap[fid];
            return (
              <div key={fid} style={{ display: "flex", gap: 16, padding: "18px 24px", borderBottom: i < FEATURE_ORDER.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    display: "inline-block", width: 28, height: 28, borderRadius: "50%", textAlign: "center", lineHeight: "28px",
                    fontSize: 13, fontWeight: 700,
                    background: step.type === "real" ? "rgba(220,38,38,0.10)" : "rgba(3,105,161,0.10)",
                    color: step.type === "real" ? "#DC2626" : SEAMLESS_BLUE,
                  }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{FEATURE_LABEL[fid]}</span>
                    {row && <ScoreBand band={row.seamless_band} score={row.seamless_score} />}
                    <span style={{
                      fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                      color: step.type === "real" ? "#DC2626" : SEAMLESS_BLUE,
                      background: step.type === "real" ? "rgba(220,38,38,0.08)" : "rgba(3,105,161,0.08)",
                      borderRadius: 4, padding: "2px 7px",
                    }}>
                      {step.type === "real" ? "Real Gap" : "Documentation Gap"}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: 0 }}>{step.action}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
