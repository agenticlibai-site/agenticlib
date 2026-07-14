"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const NAVY   = "#000000";
const BLUE   = "#2563EB";
const INDIGO = "#6B4FBB";

const LINE_COLORS = [
  "#2563EB", "#6B4FBB", "#E8447A", "#059669", "#DC2626",
  "#D97706", "#0891B2", "#C026D3", "#EA580C", "#0D9488",
  "#7C3AED", "#65A30D", "#0369A1", "#92400E", "#BE185D",
  "#F43F5E", "#84CC16", "#FB923C", "#818CF8", "#34D399",
];

function lineColor(i: number) { return LINE_COLORS[i % LINE_COLORS.length]; }


function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

// ── Locked brand list (20 brands — mirrors locked_sales_agents table) ─────────
const LOCKED_SALES_BRANDS = new Set([
  "Chorus", "Outreach", "Gong", "Salesloft", "Clari",
  "Conversica", "Revenue.io", "Apollo", "Drift", "ZoomInfo",
  "Lemlist", "Clay", "Reply.io", "Seamless.ai", "Avoma",
  "Backstory.ai", "6sense", "Mindtickle", "Highspot", "Tact.ai",
]);

// ── Primary use case per brand ────────────────────────────────────────────────
const BRAND_USE_CASE: Record<string, string> = {
  "Chorus":       "sales-call",
  "Gong":         "sales-call",
  "Revenue.io":   "sales-call",
  "Avoma":        "sales-call",
  "Backstory.ai": "sales-crm",
  "Tact.ai":      "sales-crm",
  "Clari":        "sales-pipeline",
  "6sense":       "sales-pipeline",
  "Outreach":     "sales-outreach",
  "Salesloft":    "sales-outreach",
  "Conversica":   "sales-outreach",
  "Apollo":       "sales-outreach",
  "Lemlist":      "sales-outreach",
  "Clay":         "sales-outreach",
  "Reply.io":     "sales-outreach",
  "Seamless.ai":  "sales-outreach",
  "ZoomInfo":     "sales-outreach",
  "Drift":        "sales-enablement",
  "Mindtickle":   "sales-enablement",
  "Highspot":     "sales-enablement",
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface DailyRow        { date: string; brand: string; model: string; mention_count: number; avg_position: number | null }
interface WeeklyRow       { brand: string; model: string; mention_count: number; avg_position: number | null }
interface LLMVisRow       { model: string; visibility_pct: number; total_responses: number }
interface SOVRow          { bucket_tag: string; brand: string; total_appearances: number; sov_pct: number }
interface ClusterPosRow   { bucket_tag: string; brand: string; avg_position: number; appearances: number }
interface FeatureScoreRow { brand_name: string; feature_id: string; feature_tag: string; score: number; score_band: string; flagged_for_review: boolean; evidence: string | null }
interface SentimentRow  { brand_name: string; bucket_tag: string; positive_count: number; neutral_count: number; negative_count: number; total_count: number; top_descriptors: string[] }
interface SentimentMeta { dual_model_dates: number; earliest_date: string | null; latest_date: string | null }

interface Props {
  dailySummary:     DailyRow[];
  weeklySummary:    WeeklyRow[];
  llmVisibility:    LLMVisRow[];
  sovData:          SOVRow[];
  clusterPositions: ClusterPosRow[];
  featureScores:    FeatureScoreRow[];
  sentimentData:    { rows: SentimentRow[]; meta: SentimentMeta };
}

// ── Feature scores config ──────────────────────────────────────────────────────
const BAND_COLORS: Record<string, string> = {
  strong:  "#16a34a",
  present: "#2563eb",
  partial: "#d97706",
  weak:    "#dc2626",
};

const FEATURE_NAMES: Record<string, string> = {
  call_transcription_timestamps:       "Call transcription & timestamps",
  call_talk_time_analytics:            "Talk-time analytics",
  call_coaching_scorecard:             "Rep coaching scorecard",
  call_competitor_objection_detection: "Competitor objection detection",
  pipeline_forecasting:                "AI pipeline forecasting",
  deal_risk_detection:                 "Deal risk detection",
  outreach_sequencing:                 "Multi-step outreach sequencing",
  ai_personalisation:                  "AI-personalised outreach at scale",
  crm_auto_update:                     "Automated CRM updates",
  crm_data_accuracy:                   "CRM data accuracy",
  followup_drafting:                   "Follow-up email drafting",
  sales_content_delivery:              "Sales content delivery",
  tech_crm_integration:                "Native CRM integration",
  tech_instruction_following:          "Instruction following",
  tech_workflow_automation:            "Workflow automation",
  rai_data_privacy:                    "Data privacy & compliance",
  rai_explainability:                  "Decision transparency",
  cost_pricing_transparency:           "Pricing transparency",
  cost_free_trial:                     "Free trial / self-serve access",
};

const FEATURE_GROUPS = [
  { label: "Call Intelligence & Coaching", features: ["call_transcription_timestamps", "call_talk_time_analytics", "call_coaching_scorecard", "call_competitor_objection_detection"] },
  { label: "Deal Risk & Pipeline",         features: ["pipeline_forecasting", "deal_risk_detection"] },
  { label: "AI SDR & Outreach",            features: ["outreach_sequencing", "ai_personalisation"] },
  { label: "CRM Automation",               features: ["crm_auto_update", "crm_data_accuracy"] },
  { label: "Sales Enablement",             features: ["followup_drafting", "sales_content_delivery"] },
  { label: "Technical Capabilities",       features: ["tech_crm_integration", "tech_instruction_following", "tech_workflow_automation"] },
  { label: "Responsible AI",               features: ["rai_data_privacy", "rai_explainability"] },
  { label: "Cost Efficiency",              features: ["cost_pricing_transparency", "cost_free_trial"] },
];

// Hidden pending P3 parsing fixes + broader brand coverage.
// These features show ≤4 of 20 brands or are flat at ceiling — not a real finding yet.
const HIDDEN_FEATURE_IDS = new Set([
  "call_transcription_timestamps",
  "pipeline_forecasting",
  "deal_risk_detection",
  "crm_auto_update",
  "sales_content_delivery",
  "tech_instruction_following",
]);

// ── Use case clusters ─────────────────────────────────────────────────────────
const SOV_CLUSTERS = [
  { tag: "sales-call",       label: "Call Intelligence & Coaching" },
  { tag: "sales-crm",        label: "CRM Automation" },
  { tag: "sales-pipeline",   label: "Deal Risk & Pipeline Forecasting" },
  { tag: "sales-outreach",   label: "AI SDR & Outreach" },
  { tag: "sales-enablement", label: "Sales Enablement & Follow-up" },
];

const SENTIMENT_CLUSTERS = [
  { tag: "sales-call",       label: "Call Intelligence & Coaching" },
  { tag: "sales-crm",        label: "CRM Automation" },
  { tag: "sales-pipeline",   label: "Pipeline & Forecasting" },
  { tag: "sales-outreach",   label: "AI SDR & Outreach" },
  { tag: "sales-enablement", label: "Enablement & Follow-up" },
];

// ── Combined chart tooltip ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CombinedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a: any, b: any) => (b.value as number) - (a.value as number));
  return (
    <div style={{
      background: "#fff", border: "1px solid rgba(0,0,0,0.10)", borderRadius: 8,
      fontSize: 11, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      padding: "8px 12px", maxHeight: 260, overflowY: "auto", zIndex: 100,
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: NAVY }}>{fmtDate(String(label))}</p>
      {sorted.map((item: any) => (
        <div key={item.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0, display: "inline-block" }} />
          <span style={{ color: item.color }}>{item.dataKey} : {item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Shared card shell ─────────────────────────────────────────────────────────
function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
      padding: "20px 24px",
      borderTop: accent ? `3px solid ${accent}` : undefined,
    }}>
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.45)", marginBottom: 8 }}>
      {children}
    </p>
  );
}

function BigNumber({ value, sub }: { value: string; sub: string }) {
  return (
    <>
      <p style={{ fontSize: 36, fontWeight: 800, color: NAVY, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      <p style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>{sub}</p>
    </>
  );
}

// ── In-slice pie label ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 9, fontWeight: 700, pointerEvents: "none" }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

// ── SOV donut card ────────────────────────────────────────────────────────────
function SOVCard({ cluster, rows }: { cluster: typeof SOV_CLUSTERS[number]; rows: SOVRow[] }) {
  const locked = rows.filter(r => LOCKED_SALES_BRANDS.has(r.brand));
  const totalAppearances = locked.reduce((s, r) => s + r.total_appearances, 0);
  const top = locked
    .map(r => ({
      ...r,
      sov_pct: totalAppearances > 0 ? Math.round((r.total_appearances / totalAppearances) * 1000) / 10 : 0,
    }))
    .slice(0, 8);

  if (top.length === 0) return null;

  const colorMap = Object.fromEntries(top.map((r, i) => [r.brand, lineColor(i)]));

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
      padding: "20px 24px",
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4, letterSpacing: "-0.01em" }}>
        {cluster.label}
      </h3>
      <p style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", marginBottom: 16 }}>Share of voice · last 7 days</p>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ flexShrink: 0 }}>
          <PieChart width={150} height={150}>
            <Pie
              data={top}
              dataKey="total_appearances"
              cx={70} cy={70}
              innerRadius={38} outerRadius={65}
              paddingAngle={2}
              labelLine={false}
              label={(props) => <PieSliceLabel {...props} />}
            >
              {top.map((r) => <Cell key={r.brand} fill={colorMap[r.brand]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid rgba(0,0,0,0.1)" }}
              formatter={(_v, _n, p) => [`${(p.payload as SOVRow & { sov_pct: number }).sov_pct}%`, (p.payload as SOVRow).brand]}
            />
          </PieChart>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {top.slice(0, 7).map((r) => (
            <div key={r.brand} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: colorMap[r.brand] }} />
              <span style={{ fontSize: 11, color: NAVY, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.brand}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.55)", flexShrink: 0 }}>{r.sov_pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SalesVisibilityCharts({
  dailySummary, weeklySummary, llmVisibility, sovData, clusterPositions, featureScores, sentimentData,
}: Props) {
  const hasReal = dailySummary.length > 0;
  const [featureOpen,    setFeatureOpen]    = useState(false);
  const [sentimentOpen,  setSentimentOpen]  = useState(false);

  // ── Build chart rows — filter to locked brands only ────────────────────────
  const dateSet = new Set<string>();
  const index: Record<string, Record<string, number>> = {};

  for (const row of dailySummary) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    dateSet.add(row.date);
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
  }

  // Aggregate weekly totals — locked brands only
  const weeklyTotals: Record<string, { mentions: number; avgPos: number | null }> = {};
  for (const row of weeklySummary) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    const e = weeklyTotals[row.brand] ?? { mentions: 0, avgPos: null };
    weeklyTotals[row.brand] = { mentions: e.mentions + row.mention_count, avgPos: row.avg_position ?? e.avgPos };
  }

  const dates  = [...dateSet].sort();
  const brands = [...LOCKED_SALES_BRANDS]
    .filter(b => weeklyTotals[b] || index[dates[0]]?.[b] !== undefined)
    .sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0));

  const brandColorMap = Object.fromEntries(brands.map((b, i) => [b, lineColor(i)]));
  const brandColor = (b: string) => brandColorMap[b] ?? lineColor(0);

  // ── Combined chart rows (all brands) ─────────────────────────────────────
  const chartRows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const b of brands) row[b] = index[date]?.[b] ?? 0;
    return row;
  });

  // ── Per-cluster 7-day chart rows ─────────────────────────────────────────
  const clusterCharts = SOV_CLUSTERS.map(cluster => {
    const clusterBrands = Object.entries(BRAND_USE_CASE)
      .filter(([, tag]) => tag === cluster.tag)
      .map(([b]) => b)
      .filter(b => LOCKED_SALES_BRANDS.has(b))
      .sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0));
    const rows = dates.map(date => {
      const row: Record<string, number | string> = { date };
      for (const b of clusterBrands) row[b] = index[date]?.[b] ?? 0;
      return row;
    });
    return { ...cluster, clusterBrands, rows };
  });

  // ── Aggregate weekly metrics ──────────────────────────────────────────────
  const totalMentions = Object.values(weeklyTotals).reduce((s, v) => s + v.mentions, 0);
  const hasWeekly = Object.keys(weeklyTotals).length > 0;

  // Top brand = highest total mentions
  const topByMentions = brands[0];
  const topMentionData = topByMentions ? weeklyTotals[topByMentions] : null;

  // ── LLM visibility ────────────────────────────────────────────────────────
  const hasVis = llmVisibility.length > 0;

  // ── Model mentions (locked brands only) ───────────────────────────────────
  const modelMentionsByBrand: Record<string, { claude: number; gpt: number }> = {};
  for (const row of dailySummary) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    if (!modelMentionsByBrand[row.brand]) modelMentionsByBrand[row.brand] = { claude: 0, gpt: 0 };
    if (row.model === "claude-haiku-4-5") modelMentionsByBrand[row.brand].claude += row.mention_count;
    else modelMentionsByBrand[row.brand].gpt += row.mention_count;
  }
  const modelMentionsData = brands
    .map(b => ({ brand: b, claude: modelMentionsByBrand[b]?.claude ?? 0, gpt: modelMentionsByBrand[b]?.gpt ?? 0 }))
    .filter(d => d.claude + d.gpt > 0)
    .sort((a, b) => (b.claude + b.gpt) - (a.claude + a.gpt));

  // ── Position table (locked brands only, sorted by avg position) ───────────
  const posTable = Object.entries(weeklyTotals)
    .filter(([brand, v]) => LOCKED_SALES_BRANDS.has(brand) && v.avgPos != null)
    .sort((a, b) => (a[1].avgPos ?? 99) - (b[1].avgPos ?? 99))
    .slice(0, 20)
    .map(([brand, v], i) => ({ rank: i + 1, brand, avgPos: v.avgPos as number, mentions: v.mentions }));

  // ── Avg position by use case: brand grouped into its primary cluster ───────
  // Build lookup: bucket_tag → brand → avg_position
  const clusterPosLookup: Record<string, Record<string, number>> = {};
  for (const row of clusterPositions) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    if (!clusterPosLookup[row.bucket_tag]) clusterPosLookup[row.bucket_tag] = {};
    clusterPosLookup[row.bucket_tag][row.brand] = row.avg_position;
  }

  // For each cluster, get the brands that belong to it (primary assignment), with their position in that cluster
  const clusterGroups = SOV_CLUSTERS.map(cluster => {
    const brandsInCluster = Object.entries(BRAND_USE_CASE)
      .filter(([, tag]) => tag === cluster.tag)
      .map(([brand]) => brand)
      .filter(brand => LOCKED_SALES_BRANDS.has(brand))
      .map(brand => ({
        brand,
        avg_position: clusterPosLookup[cluster.tag]?.[brand] ?? null,
      }))
      .sort((a, b) => (a.avg_position ?? 999) - (b.avg_position ?? 999));
    return { ...cluster, brands: brandsInCluster };
  });

  const hasClusterPos = clusterPositions.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 1: Metric cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

        <Card accent={BLUE}>
          <CardLabel>Brand Mentions · 7 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "—"}
            sub={hasWeekly ? `across ${brands.length} brands · 2 models` : "No data yet"}
          />
        </Card>

        <Card accent={INDIGO}>
          <CardLabel>LLM Visibility · 7 Days</CardLabel>
          {!hasVis ? (
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }}>No data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {llmVisibility.map((v, i) => {
                const label = v.model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? BLUE : INDIGO;
                return (
                  <div key={v.model}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.55)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{label}</span>
                      <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{v.visibility_pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                      <div style={{ height: 5, borderRadius: 999, width: `${Math.min(v.visibility_pct, 100)}%`, background: color }} />
                    </div>
                    <p style={{ fontSize: 10, color: "rgba(0,0,0,0.4)", marginTop: 4 }}>{v.total_responses} responses</p>
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
              <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 4 }}>
                {topByMentions}
              </p>
              <p style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
                {topMentionData.mentions.toLocaleString()} mentions
                {topMentionData.avgPos != null ? ` · avg position ${topMentionData.avgPos.toFixed(1)}` : ""}
              </p>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }}>No data yet</p>
          )}
        </Card>

      </div>

      {/* ── Row 2: Combined 7-day trend ─────────────────────────────────────── */}
      {hasReal && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px 16px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>Brand Mentions — 7-Day Trend</h3>
          <p style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", marginBottom: 14 }}>All brands · both models combined</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: "rgba(0,0,0,0.42)" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "rgba(0,0,0,0.42)" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CombinedTooltip />} wrapperStyle={{ zIndex: 100 }} />
              {brands.map(b => (
                <Line key={b} type="monotone" dataKey={b} stroke={brandColor(b)} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            {brands.map(b => (
              <span key={b} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: NAVY }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(b), flexShrink: 0, display: "inline-block" }} />
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 3: 7-day trends by use case ─────────────────────────────────── */}
      {hasReal && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>
            Brand Mentions — 7-Day Trend by Use Case
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {clusterCharts.map(({ tag, label, clusterBrands, rows }) => {
              return (
                <div
                  key={tag}
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
                    padding: "20px 24px 16px",
                  }}
                >
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>{label}</h4>
                  <p style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", marginBottom: 14 }}>7-day mentions · both models</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: "rgba(0,0,0,0.42)" }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "rgba(0,0,0,0.42)" }} axisLine={false} tickLine={false} width={32} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.10)", fontSize: 11, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", color: NAVY }}
                        labelStyle={{ fontWeight: 700, marginBottom: 4 }}
                        labelFormatter={v => fmtDate(String(v))}
                        formatter={(value, name) => [value, String(name)]}
                      />
                      {clusterBrands.map(b => (
                        <Line key={b} type="monotone" dataKey={b} stroke={brandColor(b)} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    {clusterBrands.map(b => (
                      <span key={b} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: NAVY }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(b), flexShrink: 0, display: "inline-block" }} />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Row 4: Brand mentions by model ──────────────────────────────────── */}
      {hasReal && modelMentionsData.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 20px" }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
              Brand Mentions · 7 Days · by Model
            </h3>
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>Total mentions per brand across Claude Haiku and GPT-4o mini</p>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            {[{ label: "Claude Haiku", color: BLUE }, { label: "GPT-4o mini", color: INDIGO }].map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: NAVY }}>{label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={modelMentionsData.length * 28 + 10}>
            <BarChart layout="vertical" data={modelMentionsData} margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barSize={14}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="brand" width={130} tick={{ fontSize: 11, fill: NAVY }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.10)", fontSize: 12, color: NAVY }} formatter={(value, name) => [value, name === "claude" ? "Claude Haiku" : "GPT-4o mini"]} />
              <Bar dataKey="claude" stackId="a" fill={BLUE}   radius={[0, 0, 0, 0]} />
              <Bar dataKey="gpt"    stackId="a" fill={INDIGO} radius={[3, 3, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Row 4: Brand position table ─────────────────────────────────────── */}
      {posTable.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>Brand Position Summary</h3>
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>Average position brands appear in AI responses — lower is stronger</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.025)" }}>
                  {["Rank", "Brand", "Avg Position", "7-Day Mentions"].map(h => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.45)", textTransform: "uppercase" as const, letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posTable.map((row, i) => (
                  <tr key={row.brand} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.012)" }}>
                    <td style={{ padding: "11px 20px", color: "rgba(0,0,0,0.4)", fontWeight: 600 }}>#{row.rank}</td>
                    <td style={{ padding: "11px 20px", fontWeight: 600, color: NAVY }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(row.brand), flexShrink: 0, display: "inline-block" }} />
                        {row.brand}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", color: NAVY }}>
                      <span style={{
                        display: "inline-block", padding: "2px 8px", borderRadius: 4,
                        fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                        background: row.avgPos <= 3 ? "rgba(37,99,235,0.10)" : "rgba(0,0,0,0.05)",
                        color: row.avgPos <= 3 ? BLUE : "rgba(0,0,0,0.6)",
                      }}>
                        {row.avgPos.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", color: "rgba(0,0,0,0.6)" }}>{row.mentions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Row 5: Avg position by use case (brands grouped into primary cluster) */}
      {hasClusterPos && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>
              Avg Brand Position by Use Case
            </h3>
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
              Each brand shown in its primary use case — avg position within that cluster's prompts
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            {clusterGroups.map((cluster, ci) => (
              <div key={cluster.tag} style={{
                padding: "16px 20px",
                borderRight: ci % 3 !== 2 ? "1px solid rgba(0,0,0,0.06)" : undefined,
                borderBottom: ci < 3 ? "1px solid rgba(0,0,0,0.06)" : undefined,
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "rgba(0,0,0,0.4)", marginBottom: 12 }}>
                  {cluster.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cluster.brands.map(({ brand, avg_position }) => (
                    <div key={brand} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(brand), flexShrink: 0, display: "inline-block" }} />
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: NAVY }}>{brand}</span>
                      {avg_position != null ? (
                        <span style={{
                          padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                          fontVariantNumeric: "tabular-nums",
                          background: avg_position <= 3 ? "rgba(37,99,235,0.10)" : "rgba(0,0,0,0.05)",
                          color: avg_position <= 3 ? BLUE : "rgba(0,0,0,0.6)",
                        }}>
                          {avg_position.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: "rgba(0,0,0,0.25)" }}>—</span>
                      )}
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
          <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>
            Use Case Share of Voice
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {SOV_CLUSTERS.map(cluster => {
              const rows = sovData.filter(r => r.bucket_tag === cluster.tag);
              return rows.length > 0 ? <SOVCard key={cluster.tag} cluster={cluster} rows={rows} /> : null;
            })}
          </div>
        </>
      )}

      {/* ── Row 7: Feature scores preview (collapsible) ─────────────────────── */}
      {featureScores.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <button
            onClick={() => setFeatureOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "16px 24px",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: featureOpen ? "1px solid rgba(0,0,0,0.07)" : "none",
              fontFamily: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
                Product Feature Scores
              </h3>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "rgba(0,0,0,0.4)", background: "rgba(0,0,0,0.06)", borderRadius: 999, padding: "3px 8px" }}>
                Preview
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: featureOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
              <path d="M4 6l4 4 4-4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {featureOpen && (
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", marginBottom: 24 }}>
                Both models · data from July 2026 · updates daily
              </p>
              {FEATURE_GROUPS.map(group => {
                const groupFeatures = group.features.flatMap(featureId => {
                  if (HIDDEN_FEATURE_IDS.has(featureId)) return [];
                  const rows = featureScores
                    .filter(r => r.feature_id === featureId)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3);
                  return rows.length >= 2 ? [{ featureId, rows }] : [];
                });
                if (groupFeatures.length === 0) return null;
                return (
                  <div key={group.label} style={{ marginBottom: 28 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: BLUE, marginBottom: 14 }}>
                      {group.label}
                    </p>
                    {groupFeatures.map(({ featureId, rows }) => (
                      <div key={featureId} style={{ marginBottom: 18 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 10 }}>
                          {FEATURE_NAMES[featureId] ?? featureId}
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {rows.map(r => (
                            <div key={r.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 12, fontWeight: 500, color: NAVY, width: 130, flexShrink: 0 }}>{r.brand_name}</span>
                                <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                                  <div style={{ width: `${r.score}%`, height: 6, borderRadius: 999, background: BAND_COLORS[r.score_band] ?? "#94a3b8" }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: BAND_COLORS[r.score_band] ?? NAVY, width: 28, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                                  {r.score}
                                </span>
                              </div>
                              {r.evidence && (
                                <p style={{ paddingLeft: 140, fontSize: 11, color: "rgba(0,0,0,0.4)", lineHeight: 1.4, margin: "3px 0 0" }}>
                                  {r.evidence.length > 200 ? r.evidence.slice(0, 200) + "…" : r.evidence}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              <p style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 4 }}>
                Top 3 brands per feature · scored by both Claude Haiku and GPT-4o mini
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Row 8: AI Model Perception (sentiment descriptors) ─────────────── */}
      {(() => {
        const { rows: sentimentRows, meta: sentimentMeta } = sentimentData;
        const GATE = 3;
        const daysHave = sentimentMeta.dual_model_dates ?? 0;
        const ready    = daysHave >= GATE;

        // Build a human-readable date range label from actual data coverage.
        function sentimentDateLabel() {
          const e = sentimentMeta.earliest_date;
          const l = sentimentMeta.latest_date;
          if (!e || !l) return "";
          const fmt = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", { month: "short", day: "numeric", timeZone: "UTC" });
          return e === l ? fmt(e) : `${fmt(e)} – ${fmt(l)}`;
        }

        return (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <button
              onClick={() => setSentimentOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "16px 24px",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: sentimentOpen ? "1px solid rgba(0,0,0,0.07)" : "none",
                fontFamily: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
                  AI Model Perception
                </h3>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "rgba(0,0,0,0.4)", background: "rgba(0,0,0,0.06)", borderRadius: 999, padding: "3px 8px" }}>
                  {ready ? "Preview" : "Collecting"}
                </span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: sentimentOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                <path d="M4 6l4 4 4-4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {sentimentOpen && !ready && (
              <div style={{ padding: "28px 24px", textAlign: "center" as const }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 8 }}>
                  Collecting data — {daysHave} of {GATE} minimum days
                </p>
                <p style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", maxWidth: 380, margin: "0 auto" }}>
                  Sentiment bars appear once both Claude Haiku and GPT-4o-mini have collected on {GATE} separate days.
                  Check back in {GATE - daysHave} day{GATE - daysHave !== 1 ? "s" : ""}.
                </p>
              </div>
            )}

            {sentimentOpen && ready && (
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", marginBottom: 24 }}>
                  How Claude Haiku and GPT-4o-mini describe each brand · {sentimentDateLabel()}
                </p>
                {SENTIMENT_CLUSTERS.map(cluster => {
                  const brands = sentimentRows
                    .filter(r => r.bucket_tag === cluster.tag)
                    .sort((a, b) => b.positive_count - a.positive_count);
                  if (brands.length === 0) return null;
                  return (
                    <div key={cluster.tag} style={{ marginBottom: 28 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: BLUE, marginBottom: 14 }}>
                        {cluster.label}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {brands.map(brand => {
                          const total = brand.total_count || 1;
                          const posPct = Math.round((brand.positive_count / total) * 100);
                          const neuPct = Math.round((brand.neutral_count  / total) * 100);
                          const negPct = 100 - posPct - neuPct;
                          return (
                            <div key={brand.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: NAVY, width: 110, flexShrink: 0 }}>
                                  {brand.brand_name}
                                </span>
                                <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden", display: "flex" }}>
                                  {posPct > 0 && <div style={{ width: `${posPct}%`, height: "100%", background: "#16a34a" }} />}
                                  {neuPct > 0 && <div style={{ width: `${neuPct}%`, height: "100%", background: "#d97706" }} />}
                                  {negPct > 0 && <div style={{ width: `${negPct}%`, height: "100%", background: "#dc2626" }} />}
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", width: 34, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                                  {posPct}%
                                </span>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, paddingLeft: 120 }}>
                                {brand.top_descriptors.slice(0, 4).map((d, i) => (
                                  <span key={i} style={{
                                    fontSize: 11, color: "rgba(0,0,0,0.55)",
                                    background: "rgba(0,0,0,0.04)",
                                    border: "1px solid rgba(0,0,0,0.08)",
                                    borderRadius: 4, padding: "2px 7px",
                                  }}>
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "flex", gap: 16, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 4 }}>
                  {[["#16a34a", "Positive"], ["#d97706", "Neutral"], ["#dc2626", "Negative"]].map(([color, label]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "rgba(0,0,0,0.45)" }}>{label}</span>
                    </div>
                  ))}
                  <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", marginLeft: "auto" }}>
                    Both models · updates daily
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
