"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const NAVY            = "#000000";
const BLUE            = "#2563EB";
const INDIGO          = "#6B4FBB";
const BACKSTORY_COLOR = "#BE185D";
const CLARI_COLOR     = "#DC2626";
const SIXSENSE_COLOR  = "#F43F5E";

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
  "Tact.ai": "sales-crm",
  "Backstory.ai": "sales-pipeline", "Clari": "sales-pipeline", "6sense": "sales-pipeline",
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
interface DailyRow        { date: string; brand: string; model: string; mention_count: number; avg_position: number | null }
interface WeeklyRow       { brand: string; model: string; mention_count: number; avg_position: number | null }
interface LLMVisRow       { model: string; visibility_pct: number; total_responses: number }
interface SOVRow          { bucket_tag: string; brand: string; total_appearances: number; sov_pct: number }
interface ClusterPosRow   { bucket_tag: string; brand: string; avg_position: number; appearances: number }
interface FeatureScoreRow { brand_name: string; feature_id: string; score: number; score_band: string; evidence: string | null }
interface SentimentRow    { brand_name: string; bucket_tag: string; positive_count: number; neutral_count: number; negative_count: number; total_count: number; top_descriptors: string[] }

interface Props {
  dailySummary:     DailyRow[];
  weeklySummary:    WeeklyRow[];
  llmVisibility:    LLMVisRow[];
  sovData:          SOVRow[];
  clusterPositions: ClusterPosRow[];
  featureScores:    FeatureScoreRow[];
  sentimentData:    { rows: SentimentRow[]; meta: { dual_model_dates: number; earliest_date: string | null; latest_date: string | null } };
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
                color: r.brand === "Backstory.ai" ? BACKSTORY_COLOR : NAVY,
                fontWeight: r.brand === "Backstory.ai" ? 700 : 400,
              }}>{displayBrand(r.brand)}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#000", flexShrink: 0 }}>{r.sov_pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function BackstoryReportCharts({
  dailySummary, weeklySummary, llmVisibility, sovData, clusterPositions, featureScores, sentimentData,
}: Props) {
  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());
  function toggleBrand(b: string) {
    setHiddenBrands(prev => { const next = new Set(prev); if (next.has(b)) next.delete(b); else next.add(b); return next; });
  }

  const CHART_DATE_FROM = "2026-07-06";
  const CHART_DATE_TO   = "2026-07-12";
  const rangedDaily = dailySummary.filter(r => r.date >= CHART_DATE_FROM && r.date <= CHART_DATE_TO);

  // ── Build chart data ─────────────────────────────────────────────────────────
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

  // ── Backstory.ai spotlight data ───────────────────────────────────────────────
  const backstoryPipelineMentions = sovData.find(r => r.bucket_tag === "sales-pipeline" && r.brand === "Backstory.ai")?.total_appearances ?? 0;
  const clariPipelineMentions     = sovData.find(r => r.bucket_tag === "sales-pipeline" && r.brand === "Clari")?.total_appearances ?? 0;
  const sixsensePipelineMentions  = sovData.find(r => r.bucket_tag === "sales-pipeline" && r.brand === "6sense")?.total_appearances ?? 0;
  const clariRiskScore    = featureScores.find(r => r.brand_name === "Clari"  && r.feature_id === "deal_risk_detection");
  const clariPipeScore    = featureScores.find(r => r.brand_name === "Clari"  && r.feature_id === "pipeline_forecasting");
  const sixsenseRiskScore = featureScores.find(r => r.brand_name === "6sense" && r.feature_id === "deal_risk_detection");
  const sixsensePipeScore = featureScores.find(r => r.brand_name === "6sense" && r.feature_id === "pipeline_forecasting");

  const bSent   = sentimentData.rows.find(r => r.brand_name === "Backstory.ai");
  const bTotal  = bSent?.total_count    ?? 0;
  const bPosPct = bTotal > 0 ? Math.round((bSent!.positive_count / bTotal) * 100) : 0;
  const bNeuPct = bTotal > 0 ? Math.round((bSent!.neutral_count  / bTotal) * 100) : 0;

  const bandColor = (band: string) =>
    band === "strong" ? "#059669" : band === "present" ? BLUE : band === "partial" ? "#D97706" : "#DC2626";
  const bandLabel = (band: string) =>
    band === "strong" ? "Strong" : band === "present" ? "Present" : band === "partial" ? "Partial" : "Weak";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 1: Metric cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {/* Brand Mentions */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px", borderTop: `3px solid ${BACKSTORY_COLOR}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000", marginBottom: 8 }}>Brand Mentions · 7 Days</p>
          <p style={{ fontSize: 36, fontWeight: 800, color: NAVY, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{totalMentions.toLocaleString()}</p>
          <p style={{ fontSize: 15, color: "#000" }}>across {brands.length} brands · 2 models</p>
        </div>
        {/* LLM Visibility */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px", borderTop: `3px solid ${INDIGO}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000", marginBottom: 8 }}>LLM Visibility · 7 Days</p>
          {!hasVis ? <p style={{ fontSize: 17, color: "#000" }}>No data yet</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {llmVisibility.map((v, i) => {
                const label = v.model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? BACKSTORY_COLOR : INDIGO;
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
        </div>
        {/* Top Brand */}
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px", borderTop: `3px solid ${NAVY}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000", marginBottom: 8 }}>Top Brand · 7 Days</p>
          {topByMentions && topMentionData ? (
            <>
              <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 4 }}>{displayBrand(topByMentions)}</p>
              <p style={{ fontSize: 15, color: "#000" }}>
                {topMentionData.mentions.toLocaleString()} mentions
                {topMentionData.avgPos != null ? ` · avg position ${topMentionData.avgPos.toFixed(1)}` : ""}
              </p>
            </>
          ) : <p style={{ fontSize: 17, color: "#000" }}>No data yet</p>}
        </div>
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
                <Line key={b} type="monotone" dataKey={b} stroke={getBrandColor(b)}
                  strokeWidth={hiddenBrands.has(b) ? 0 : b === "Backstory.ai" ? 3 : 2}
                  dot={false} activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", flex: 1 }}>
              {brands.map(b => (
                <label key={b} style={{ display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", opacity: hiddenBrands.has(b) ? 0.45 : 1 }}>
                  <input type="checkbox" checked={!hiddenBrands.has(b)} onChange={() => toggleBrand(b)}
                    style={{ accentColor: getBrandColor(b), width: 13, height: 13, cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: hiddenBrands.has(b) ? "#999" : b === "Backstory.ai" ? BACKSTORY_COLOR : NAVY, fontWeight: b === "Backstory.ai" ? 700 : 400 }}>
                    {displayBrand(b)}
                  </span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
              <button onClick={() => setHiddenBrands(new Set())} style={{ fontSize: 12, fontWeight: 600, color: BACKSTORY_COLOR, background: "rgba(190,24,93,0.07)", border: "1px solid rgba(190,24,93,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>Select All</button>
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
                      <Line key={b} type="monotone" dataKey={b} name={displayBrand(b)} stroke={getBrandColor(b)}
                        strokeWidth={hiddenBrands.has(b) ? 0 : b === "Backstory.ai" ? 3 : 2}
                        dot={false} activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  {clusterBrands.map(b => (
                    <label key={b} style={{ display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", opacity: hiddenBrands.has(b) ? 0.45 : 1 }}>
                      <input type="checkbox" checked={!hiddenBrands.has(b)} onChange={() => toggleBrand(b)}
                        style={{ accentColor: getBrandColor(b), width: 13, height: 13, cursor: "pointer", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: hiddenBrands.has(b) ? "#999" : b === "Backstory.ai" ? BACKSTORY_COLOR : NAVY, fontWeight: b === "Backstory.ai" ? 700 : 400 }}>
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
            {[{ label: "Claude Haiku", color: BACKSTORY_COLOR }, { label: "GPT-4o mini", color: INDIGO }].map(({ label, color }) => (
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
              <Bar dataKey="claude" stackId="a" fill={BACKSTORY_COLOR} radius={[0, 0, 0, 0]} />
              <Bar dataKey="gpt"    stackId="a" fill={INDIGO}          radius={[3, 3, 3, 3]} />
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
                  <tr key={row.brand} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: row.brand === "Backstory.ai" ? "rgba(190,24,93,0.04)" : i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.012)" }}>
                    <td style={{ padding: "11px 20px", color: "#000", fontWeight: 600 }}>#{row.rank}</td>
                    <td style={{ padding: "11px 20px", fontWeight: 600, color: row.brand === "Backstory.ai" ? BACKSTORY_COLOR : NAVY }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: getBrandColor(row.brand), flexShrink: 0, display: "inline-block" }} />
                        {displayBrand(row.brand)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", color: NAVY }}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", background: row.avgPos <= 3 ? "rgba(190,24,93,0.10)" : "rgba(0,0,0,0.05)", color: row.avgPos <= 3 ? BACKSTORY_COLOR : "#000" }}>
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
      {clusterPositions.length > 0 && (
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
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: getBrandColor(brand), flexShrink: 0, display: "inline-block" }} />
                      <span style={{ flex: 1, fontSize: 16, fontWeight: brand === "Backstory.ai" ? 700 : 600, color: brand === "Backstory.ai" ? BACKSTORY_COLOR : NAVY }}>{displayBrand(brand)}</span>
                      {avg_position != null ? (
                        <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", background: avg_position <= 3 ? "rgba(190,24,93,0.10)" : "rgba(0,0,0,0.05)", color: avg_position <= 3 ? BACKSTORY_COLOR : "#000" }}>
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
      {/* ── Backstory.ai Analysis ────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      {/* Section divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(190,24,93,0.2)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: BACKSTORY_COLOR, background: "rgba(190,24,93,0.08)", borderRadius: 999, padding: "6px 20px", whiteSpace: "nowrap" }}>
          Backstory.ai Analysis
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(190,24,93,0.2)" }} />
      </div>

      {/* Discovery headline */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "22px 24px", borderLeft: `4px solid ${BACKSTORY_COLOR}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: BACKSTORY_COLOR, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: BACKSTORY_COLOR }}>
            Discovery · Deal Risk &amp; Pipeline Forecasting cluster
          </span>
        </div>
        <p style={{ fontSize: 21, fontWeight: 800, color: NAVY, lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: 10 }}>
          Backstory.ai appeared {backstoryPipelineMentions} times across the Deal Risk &amp; Pipeline Forecasting cluster over 7 days.
        </p>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: 0 }}>
          3 buyer-language prompts — <em>&ldquo;identify at-risk deals before they go cold,&rdquo; &ldquo;pipeline forecasting and deal health scoring,&rdquo; &ldquo;flag when a deal has gone quiet or a champion has gone dark&rdquo;</em> — queried across 2 AI models, 7 days, multiple runs each. {backstoryPipelineMentions === 0 ? "Zero mentions." : `${backstoryPipelineMentions} mention${backstoryPipelineMentions !== 1 ? "s" : ""}.`} Clari and 6sense — the dominant tracked brands in this cluster — appeared {clariPipelineMentions} and {sixsensePipelineMentions} times respectively across the same prompts.
        </p>
      </div>

      {/* Feature score comparison */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
            Feature Score: Deal Risk Detection &amp; Pipeline Forecasting
          </h3>
          <p style={{ fontSize: 15, color: "#000", marginTop: 4 }}>
            Jul 6–12 2026 · Backstory.ai vs Clari &amp; 6sense (Deal Risk &amp; Pipeline Forecasting cluster)
          </p>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

            {/* Backstory.ai — pipeline features pending */}
            <div style={{ background: "rgba(190,24,93,0.04)", border: "1px solid rgba(190,24,93,0.15)", borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: BACKSTORY_COLOR, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: BACKSTORY_COLOR }}>Backstory.ai</span>
              </div>
              {(["Deal Risk Detection", "Pipeline Forecasting"] as const).map(label => (
                <div key={label} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#888", marginBottom: 6 }}>{label}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const, padding: "2px 8px", borderRadius: 4, background: "rgba(0,0,0,0.06)", color: "#777" }}>
                    collection pending
                  </span>
                </div>
              ))}
              <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, margin: 0, marginTop: 4 }}>
                Previously categorized under CRM Automation. Pipeline feature scores will populate once the feature collection pipeline resumes.
              </p>
            </div>

            {/* Clari */}
            <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" as const }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: CLARI_COLOR, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: CLARI_COLOR }}>Clari</span>
                <span style={{ fontSize: 11, color: "#888", marginLeft: "auto" }}>active market leader</span>
              </div>
              {([
                { label: "Deal Risk Detection", score: clariRiskScore },
                { label: "Pipeline Forecasting", score: clariPipeScore },
              ] as const).map(({ label, score }) => (
                <div key={label} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#888", marginBottom: 6 }}>{label}</p>
                  {score ? (
                    <>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const, padding: "2px 8px", borderRadius: 4, background: "rgba(5,150,105,0.10)", color: bandColor(score.score_band) }}>
                        {score.score} / {bandLabel(score.score_band)}
                      </span>
                      {score.evidence && (
                        <p style={{ fontSize: 12, color: "#000", lineHeight: 1.6, fontStyle: "italic", margin: "8px 0 0" }}>
                          &ldquo;{score.evidence}&rdquo;
                        </p>
                      )}
                    </>
                  ) : <span style={{ fontSize: 11, color: "#aaa" }}>no data</span>}
                </div>
              ))}
            </div>

            {/* 6sense */}
            <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: SIXSENSE_COLOR, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: SIXSENSE_COLOR }}>6sense</span>
              </div>
              {([
                { label: "Deal Risk Detection", score: sixsenseRiskScore },
                { label: "Pipeline Forecasting", score: sixsensePipeScore },
              ] as const).map(({ label, score }) => (
                <div key={label} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#888", marginBottom: 6 }}>{label}</p>
                  {score ? (
                    <>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const, padding: "2px 8px", borderRadius: 4, background: "rgba(5,150,105,0.10)", color: bandColor(score.score_band) }}>
                        {score.score} / {bandLabel(score.score_band)}
                      </span>
                      {score.evidence && (
                        <p style={{ fontSize: 12, color: "#000", lineHeight: 1.6, fontStyle: "italic", margin: "8px 0 0" }}>
                          &ldquo;{score.evidence}&rdquo;
                        </p>
                      )}
                    </>
                  ) : <span style={{ fontSize: 11, color: "#aaa" }}>no data</span>}
                </div>
              ))}
            </div>

          </div>

          {/* Editorial note */}
          <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", borderLeft: "3px solid rgba(245,158,11,0.55)", borderRadius: "0 8px 8px 0", padding: "11px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#92400E", marginBottom: 5 }}>
              Editorial note · context on the comparison
            </p>
            <p style={{ fontSize: 13, color: "#78350F", lineHeight: 1.65, fontStyle: "italic", margin: 0 }}>
              Clari is the dominant, well-documented player in deal risk and pipeline forecasting — actively marketed, extensively reviewed, and carrying a large training-data footprint in both models. Competing for buyer mindshare against an active market leader is a harder problem than the prior CRM comparison (Tact.ai, dormant since its 2023 acquisition). The 0-discovery-mention finding is stronger here, not weaker. Pipeline feature scoring for Backstory.ai is pending; discovery mentions confirm the visibility gap is already measurable at the organic level.
            </p>
          </div>
        </div>
      </div>

      {/* Triple-check synthesis */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "22px 24px" }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 14 }}>Three independent checks, one conclusion</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { text: <><strong>Zero organic discovery mentions</strong> in the Deal Risk &amp; Pipeline Forecasting cluster across 7 days — three prompts asking buyers about at-risk deal detection and pipeline forecasting, queried across two models, multiple runs each. Neither model surfaced Backstory.ai unprompted.</> },
            { text: <><strong>A direct feature-scoring test</strong> — naming Backstory.ai explicitly against its prior CRM Automation category — returned not_documented from Claude Haiku on all 18 runs across 7 days. GPT-4o mini answered &ldquo;yes&rdquo; on 86% of runs, but Claude (the model that requires grounded, cited evidence) could not confirm the capability from publicly accessible materials. Pipeline feature scoring is pending recategorization; the documentation gap pattern is already established.</> },
            { text: <><strong>Sentiment analysis from Claude</strong> describes Backstory.ai with <em>low confidence</em> — the only brand in this cluster rated low — with descriptors including &ldquo;insufficient public documentation to assess core capabilities reliably&rdquo; and &ldquo;unable to verify current product offerings.&rdquo;</> },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(190,24,93,0.10)", color: BACKSTORY_COLOR, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
              <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, fontStyle: "italic", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(190,24,93,0.12)" }}>
          This isn&apos;t a data gap. It&apos;s a real, well-documented product that Claude currently cannot confirm exists or describe from public sources.
        </p>
      </div>

      {/* Sentiment */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>Sentiment</h3>
          <p style={{ fontSize: 15, color: "#000", marginTop: 4 }}>{bTotal} responses · Jul 6–22 2026 · Claude Haiku + GPT-4o mini</p>
        </div>
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Neutral",  pct: bNeuPct, color: "#6B7280" },
              { label: "Positive", pct: bPosPct, color: "#059669" },
              { label: "Negative", pct: 0,       color: "#DC2626" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0, display: "inline-block" }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#000", flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#000", fontVariantNumeric: "tabular-nums" }}>{s.pct}%</span>
                </div>
                <div style={{ height: 7, borderRadius: 999, background: "rgba(0,0,0,0.06)" }}>
                  <div style={{ height: 7, borderRadius: 999, width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
              Claude confidence: <strong style={{ color: "#555" }}>low</strong> (only brand rated low in this cluster)
            </p>
          </div>
          <div style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 8, padding: "14px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>
              Claude Haiku descriptors (verbatim)
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px" }}>
              {[
                "insufficient public documentation to assess core capabilities",
                "limited visibility in mainstream sales tool reviews",
                "unable to verify current product offerings",
                "scarcity of detailed customer case studies",
                "unclear competitive differentiation",
                "no accessible compliance or security information",
              ].map(d => (
                <span key={d} style={{ display: "inline-block", background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "3px 8px", fontSize: 12, color: "#333" }}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What makes this different */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "22px 24px" }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 12 }}>This is not a capability gap — it&apos;s a visibility gap</h3>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.8, marginBottom: 12 }}>
          Backstory.ai has real customers across enterprise:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {["NVIDIA", "OpenAI", "Red Hat", "Zscaler"].map(c => (
            <span key={c} style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.09)", borderRadius: 6, padding: "4px 10px", fontSize: 13, fontWeight: 600, color: "#000" }}>{c}</span>
          ))}
        </div>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.8, margin: 0 }}>And an actively maintained product.</p>
        <div style={{ marginTop: 14, padding: "14px 16px", background: "rgba(190,24,93,0.04)", border: "1px solid rgba(190,24,93,0.12)", borderRadius: 8, fontSize: 15, color: "#000", lineHeight: 1.7 }}>
          The gap is in publicly accessible documentation — not the product. The content that would let an AI model confidently describe your capabilities doesn&apos;t currently exist in a form these models can find and cite.
        </div>
      </div>

      {/* Next steps */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>Next Steps</h3>
          <p style={{ fontSize: 15, color: "#000", marginTop: 4 }}>Three concrete actions</p>
        </div>
        {[
          {
            title: "Deal risk & pipeline documentation",
            text: "Publish specific, mechanism-level documentation of the deal risk and pipeline intelligence capabilities — describe exactly how Backstory.ai detects at-risk deals (signal types, champion engagement tracking, deal velocity), how forecasting works (AI vs rep-submitted numbers, confidence intervals), and what a revenue leader actually sees. The \"Revenue Answers Platform\" positioning is on the website; the underlying mechanics need to be publicly documented for AI models to confirm and cite them.",
          },
          {
            title: "Own the pipeline forecasting category page",
            text: "Publish a dedicated page targeting the buyer language AI models see — \"at-risk deal detection,\" \"pipeline forecasting,\" \"deal health scoring.\" Right now, Clari dominates this cluster because it has years of indexed, specific documentation. A strong, current page from Backstory.ai describing its revenue intelligence approach becomes the natural comparison document. A \"Backstory.ai vs Clari\" or \"Backstory.ai vs [legacy forecasting tool]\" page directly closes the visibility gap this report identified.",
          },
          {
            title: "Trust center or indexed case study",
            text: "Claude's sentiment limitations flag \"no accessible information on data security, compliance certifications, or data residency policies\" and \"no independently verified track record.\" A concise Trust Center page or one published customer case study (named outcomes, not just a logo) gives models a grounded, citable source — directly addressing the \"low confidence\" rating and the \"unable to verify current product offerings\" descriptor.",
          },
        ].map((step, i, arr) => (
          <div key={step.title} style={{ display: "flex", gap: 16, padding: "18px 24px", borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(190,24,93,0.10)", color: BACKSTORY_COLOR, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{step.title}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "rgba(190,24,93,0.08)", color: BACKSTORY_COLOR, borderRadius: 4, padding: "2px 7px" }}>Documentation gap</span>
              </div>
              <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: 0 }}>{step.text}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
