"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type {
  EsaiTopBrandRow,
  EsaiClusterRow,
  EsaiModelRow,
  EsaiClusterTrendRow,
} from "@/lib/brand-visibility/db";
import { ESAI_FEATURES } from "@/lib/brand-visibility/esai-features";

// ── Palette ────────────────────────────────────────────────────────────────────
const ACCENT = "#EA580C";
const CLAUDE = "#7C3AED";
const GPT    = "#2563EB";

const LINE_COLORS = [
  "#EA580C", "#7C3AED", "#2563EB", "#059669", "#DC2626",
  "#D97706", "#0891B2", "#C026D3", "#0D9488", "#BE185D",
  "#65A30D", "#0369A1", "#F43F5E", "#FB923C", "#818CF8",
];


function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

// ── Trend tooltip ──────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload]
    .filter((p: any) => p.value != null && p.value > 0)
    .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0));
  return (
    <div style={{
      background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8,
      fontSize: 12, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: "#000" }}>{fmtDate(String(label))}</p>
      {sorted.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, padding: "1px 0" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0, display: "inline-block" }} />
          <span style={{ color: "#000" }}>{p.dataKey} : {p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Cluster config (4 for the 2×2 pie grid) ───────────────────────────────────
const CLUSTERS: { tag: string; label: string; description: string }[] = [
  { tag: "esai-takeoff",     label: "Quantity Takeoff",              description: "PDF measurement, auto area & volume calculation" },
  { tag: "esai-ai",          label: "AI-Powered Estimating",         description: "Autonomous scope, plan interpretation, AI pricing" },
  { tag: "esai-residential", label: "Residential New Build",         description: "New construction estimates for Australian builders" },
  { tag: "esai-commercial",  label: "Commercial Construction",       description: "Multi-trade and tender pricing for commercial GCs" },
];

// Trend clusters (for per-cluster coverage charts)
const TREND_CLUSTERS: { tag: string; label: string; description: string }[] = [
  { tag: "esai-takeoff",      label: "Quantity Takeoff",               description: "Auto-measuring areas, lengths & counts from digital plans" },
  { tag: "esai-plans",        label: "Plan & Document Reading",        description: "Reading and interpreting architectural & structural drawing sets" },
  { tag: "esai-scope",        label: "Trade Scoping",                  description: "Breaking a project into trade-by-trade work packages" },
  { tag: "esai-pricing",      label: "Rate Management & Pricing",      description: "Managing labour, material & plant rate databases" },
  { tag: "esai-quote",        label: "Quote & Estimate Output",        description: "Producing an editable, exportable bill of quantities or quote" },
  { tag: "esai-residential",  label: "Residential New Build",          description: "Estimating new homes & multi-unit dwellings for AU builders" },
  { tag: "esai-commercial",   label: "Commercial Construction",        description: "Multi-trade pricing for commercial construction & fitout" },
  { tag: "esai-subcontract",  label: "Subcontractor & Trade Quoting",  description: "Getting trade prices and managing subie quote packages" },
  { tag: "esai-ai",           label: "AI-Powered Estimating",          description: "Auto-scope, plan interpretation & predictive pricing via AI" },
  { tag: "esai-tender",       label: "Tender & Bid Preparation",       description: "Compiling tender documents and tracking bid submissions" },
  { tag: "esai-buyer-intent", label: "Buyer Intent",                   description: "Signals that a builder or estimator is actively evaluating tools" },
];

// All feature clusters (for the feature scores section)
const ALL_CLUSTERS: { tag: string; label: string }[] = [
  { tag: "esai-takeoff",     label: "Quantity Takeoff" },
  { tag: "esai-plans",       label: "Plan & Document Reading" },
  { tag: "esai-scope",       label: "Trade Scoping" },
  { tag: "esai-pricing",     label: "Rate Management & Pricing" },
  { tag: "esai-quote",       label: "Quote & Estimate Output" },
  { tag: "esai-residential", label: "Residential New Build" },
  { tag: "esai-commercial",  label: "Commercial Construction" },
  { tag: "esai-subcontract", label: "Subcontractor & Trade Quoting" },
  { tag: "esai-ai",          label: "AI-Powered Estimating" },
  { tag: "esai-tender",      label: "Tender & Bid Preparation" },
  { tag: "esai-security",    label: "Security & Data Trust" },
];

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      height: 160, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 8, color: "#000",
      border: "1.5px dashed rgba(234,88,12,0.18)", borderRadius: 10,
    }}>
      <span style={{ fontSize: 28 }}>⏳</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "1px solid rgba(0,0,0,0.07)",
      padding: "24px 28px", marginBottom: 20,
    }}>
      <div style={{ marginBottom: subtitle ? 4 : 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#000", margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: "#000", margin: "4px 0 18px" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      flex: "1 1 0", background: "#fff", borderRadius: 14,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      padding: "22px 24px", display: "flex", flexDirection: "column" as const,
      gap: 4, minWidth: 0,
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase" as const, color: ACCENT,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 28, fontWeight: 800, color: "#000",
        letterSpacing: "-0.02em", lineHeight: 1.1,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
      }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 12, color: "#000", opacity: 0.6, marginTop: 2 }}>{sub}</span>}
    </div>
  );
}

// ── Feature score types ────────────────────────────────────────────────────────
interface FeatureScoreRow {
  brand_name:         string;
  feature_id:         string;
  feature_tag:        string;
  score:              number | null;
  score_band:         string;
  flagged_for_review: boolean;
  evidence:           string | null;
}

// ── Sentiment types ────────────────────────────────────────────────────────────
interface SentimentRow {
  brand_name:      string;
  bucket_tag:      string;
  positive_count:  number;
  neutral_count:   number;
  negative_count:  number;
  total_count:     number;
  top_descriptors: string[];
}

interface SentimentData {
  rows: SentimentRow[];
  meta: { dual_model_dates: number; earliest_date: string | null; latest_date: string | null };
}

const SENTIMENT_GATE = 1;

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  topBrands:     EsaiTopBrandRow[];
  byCluster:     EsaiClusterRow[];
  byModel:       EsaiModelRow[];
  clusterTrend:  EsaiClusterTrendRow[];
  featureScores: FeatureScoreRow[];
  sentimentData: SentimentData;
}

export default function EsaiVisibilityCharts({
  topBrands, byCluster, byModel, clusterTrend, featureScores, sentimentData,
}: Props) {

  // ── Hidden brands state (interactive trend) ───────────────────────────────
  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());

  // All brands with AI features (locked set) — shown in all charts
  const LOCKED_BRANDS = [
    "EstiMate", "Togal.AI", "Buildr",          // AI-native (pinned)
    "Buildxact", "PlanSwift", "On-Screen Takeoff",
    "ProEst", "STACK", "eTakeoff", "Esticom", "Glodon",
  ];
  const LOCKED_SET = new Set(LOCKED_BRANDS);
  // AI-native sub-set — pinned with bold lines in coverage charts
  const PINNED_BRANDS = ["EstiMate", "Togal.AI", "Buildr"];
  const PINNED_COLORS: Record<string, string> = {
    "EstiMate": "#EA580C",
    "Togal.AI": "#059669",
    "Buildr":   "#7C3AED",
  };
  // Dynamic colors for the non-pinned locked brands
  const LOCKED_COLORS: Record<string, string> = {
    "Buildxact":        "#2563EB",
    "PlanSwift":        "#D97706",
    "On-Screen Takeoff":"#0891B2",
    "ProEst":           "#C026D3",
    "STACK":            "#0D9488",
    "eTakeoff":         "#BE185D",
    "Esticom":          "#65A30D",
    "Glodon":           "#0369A1",
  };
  const brandColorMap: Record<string, string> = { ...PINNED_COLORS, ...LOCKED_COLORS };
  const brandColor = (brand: string) => brandColorMap[brand] ?? "#94a3b8";

  // ── Aggregate from clusterTrend — locked brands only ──
  const allDates = [...new Set(clusterTrend.map(r => r.date))].sort();

  const overallByBrand: Record<string, number> = {};
  const overallTrendMap: Record<string, Record<string, number>> = {};
  for (const r of clusterTrend) {
    if (!LOCKED_SET.has(r.brand)) continue;
    overallByBrand[r.brand] = (overallByBrand[r.brand] ?? 0) + r.mention_count;
    if (!overallTrendMap[r.date]) overallTrendMap[r.date] = {};
    overallTrendMap[r.date][r.brand] = (overallTrendMap[r.date][r.brand] ?? 0) + r.mention_count;
  }

  // Sort locked brands by total mentions descending; pinned brands always included even at 0
  const sortedLocked = [...LOCKED_BRANDS].sort(
    (a, b) => (overallByBrand[b] ?? 0) - (overallByBrand[a] ?? 0)
  );

  const combinedTrendData = allDates.map(date => {
    const row: Record<string, string | number> = { date };
    for (const brand of sortedLocked) row[brand] = overallTrendMap[date]?.[brand] ?? 0;
    return row;
  });

  // ── Stat card metrics ─────────────────────────────────────────────────────
  const totalMentions = Object.values(overallByBrand).reduce((a, b) => a + b, 0);
  const [topBrandName, topBrandCount] = Object.entries(overallByBrand)
    .sort((a, b) => b[1] - a[1])[0] ?? ["—", 0];

  // ── Per-cluster coverage data ─────────────────────────────────────────────
  type ClusterChartEntry = { brands: string[]; data: Record<string, string | number>[] };
  const perClusterTrend: Record<string, ClusterChartEntry> = {};

  for (const cluster of TREND_CLUSTERS) {
    const rows = clusterTrend.filter(r => r.cluster_tag === cluster.tag && LOCKED_SET.has(r.brand));

    // Sort brands by cluster mentions; always include pinned brands even at 0
    const clusterTotals: Record<string, number> = {};
    for (const r of rows) clusterTotals[r.brand] = (clusterTotals[r.brand] ?? 0) + r.mention_count;
    const sorted = [...LOCKED_BRANDS].sort((a, b) => (clusterTotals[b] ?? 0) - (clusterTotals[a] ?? 0));

    const dateMap: Record<string, Record<string, number>> = {};
    for (const r of rows) {
      if (!dateMap[r.date]) dateMap[r.date] = {};
      dateMap[r.date][r.brand] = r.mention_count;
    }

    const data = allDates.map(date => {
      const row: Record<string, string | number> = { date };
      for (const brand of sorted) row[brand] = dateMap[date]?.[brand] ?? 0;
      return row;
    });

    perClusterTrend[cluster.tag] = { brands: sorted, data };
  }

  // ── LLM split — locked brands only ──────────────────────────────────────
  const modelMap: Record<string, { claude: number; gpt: number }> = {};
  for (const r of byModel) {
    if (!LOCKED_SET.has(r.brand)) continue;
    if (!modelMap[r.brand]) modelMap[r.brand] = { claude: 0, gpt: 0 };
    if (r.model.includes("claude")) modelMap[r.brand].claude += r.total_mentions;
    else modelMap[r.brand].gpt += r.total_mentions;
  }
  const modelData = sortedLocked
    .map(brand => ({ brand, claude: modelMap[brand]?.claude ?? 0, gpt: modelMap[brand]?.gpt ?? 0 }))
    .sort((a, b) => (b.claude + b.gpt) - (a.claude + a.gpt));

  // ── Use case cluster charts (2×2 pie grid) — locked brands only ───────────
  const clusterMap: Record<string, { brand: string; mentions: number }[]> = {};
  for (const r of byCluster) {
    if (!LOCKED_SET.has(r.brand)) continue;
    if (!clusterMap[r.cluster_tag]) clusterMap[r.cluster_tag] = [];
    clusterMap[r.cluster_tag].push({ brand: r.brand, mentions: r.total_mentions });
  }
  for (const tag of Object.keys(clusterMap)) {
    clusterMap[tag] = clusterMap[tag].sort((a, b) => b.mentions - a.mentions);
  }

  const hasData = topBrands.length > 0;

  return (
    <div>

      {/* ── Note callout ──────────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(234,88,12,0.06)",
        border: "1px solid rgba(234,88,12,0.25)",
        borderLeft: "4px solid #EA580C",
        borderRadius: "0 10px 10px 0",
        padding: "18px 22px",
        marginBottom: 24,
      }}>
        <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#EA580C", margin: "0 0 8px" }}>
          Note
        </p>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>
          Every chart in this report shows only the 11 brands with AI features in the construction estimating category. Three are AI-native agents (<strong>EstiMate</strong>, <strong>Togal.AI</strong>, <strong>Buildr</strong>); eight are traditional estimating platforms with meaningful AI capabilities (Buildxact, PlanSwift, On-Screen Takeoff, ProEst, STACK, eTakeoff, Esticom, Glodon). Construction management, accounting, CAD, and zero-AI tools are excluded.
        </p>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: 0 }}>
          EstiMate, Togal.AI &amp; Buildr are pinned in coverage charts — they appear near-zero because LLMs rarely surface AI-native agents unprompted, defaulting instead to traditional incumbents. That invisibility gap is the market opportunity EstiMate is building into.
        </p>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      {hasData && (
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" as const }}>
          <StatCard
            label="Total Mentions"
            value={totalMentions.toLocaleString()}
            sub="AI-native agents · Aug 31 – Sep 6"
          />
          <StatCard
            label="Top Brand"
            value={topBrandName}
            sub={`${(topBrandCount as number).toLocaleString()} mentions across all clusters`}
          />
          <StatCard
            label="Collection Period"
            value="7 days"
            sub="Aug 31 – Sep 6, 2026 · 11 use case clusters"
          />
        </div>
      )}

      {/* ── Interactive combined trend ─────────────────────────────────────── */}
      <div style={{
        background: "#fff", borderRadius: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        padding: "24px 28px", marginBottom: 20,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Coverage Over Time
        </h2>
        <p style={{ fontSize: 13, color: "#000", margin: "0 0 4px", opacity: 0.7 }}>
          Daily mention totals · Aug 31 – Sep 6
        </p>
        <p style={{ fontSize: 12, color: ACCENT, margin: "0 0 16px", fontWeight: 600 }}>
          EstiMate, Togal.AI &amp; Buildr are pinned — they appear near‑zero because LLMs rarely surface AI-native agents unprompted. That gap is the point.
        </p>

        {combinedTrendData.length === 0 ? (
          <EmptyState label="Trend builds after day 2" />
        ) : (
          <>
            {/* Brand toggles */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 16, alignItems: "center" }}>
              <button
                onClick={() => setHiddenBrands(new Set())}
                style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 10px",
                  border: "1px solid rgba(0,0,0,0.18)", borderRadius: 999,
                  background: "#fff", color: "#000", cursor: "pointer",
                }}
              >
                Select All
              </button>
              <button
                onClick={() => setHiddenBrands(new Set(sortedLocked))}
                style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 10px",
                  border: "1px solid rgba(0,0,0,0.18)", borderRadius: 999,
                  background: "#fff", color: "#000", cursor: "pointer",
                }}
              >
                Clear All
              </button>
              {sortedLocked.map((brand) => {
                const hidden = hiddenBrands.has(brand);
                const color = brandColorMap[brand] ?? "#94a3b8";
                const isPinned = PINNED_BRANDS.includes(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => {
                      setHiddenBrands(prev => {
                        const next = new Set(prev);
                        if (next.has(brand)) next.delete(brand); else next.add(brand);
                        return next;
                      });
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontSize: 11, padding: "4px 10px",
                      border: `1px solid ${hidden ? "rgba(0,0,0,0.12)" : color}`,
                      borderRadius: 999,
                      background: hidden ? "#fff" : `${color}18`,
                      color: hidden ? "rgba(0,0,0,0.35)" : color,
                      cursor: "pointer", fontWeight: isPinned ? 700 : 600,
                      outline: isPinned && !hidden ? `2px solid ${color}` : "none",
                      outlineOffset: 1,
                    }}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: hidden ? "rgba(0,0,0,0.12)" : color,
                      flexShrink: 0, display: "inline-block",
                    }} />
                    {brand}
                  </button>
                );
              })}
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={combinedTrendData} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#000" }} tickFormatter={fmtDate} />
                <YAxis tick={{ fontSize: 11, fill: "#000" }} allowDecimals={false} />
                <Tooltip content={<TrendTooltip />} />
                {sortedLocked.map((brand) => {
                  const isPinned = PINNED_BRANDS.includes(brand);
                  return (
                    <Line
                      key={brand} type="monotone" dataKey={brand}
                      stroke={brandColorMap[brand] ?? "#94a3b8"}
                      strokeWidth={isPinned ? 2.5 : 1.5}
                      dot={false} hide={hiddenBrands.has(brand)}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* ── Per-cluster coverage over time ────────────────────────────────── */}
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Brand Coverage by Use Case
        </h2>
        <p style={{ fontSize: 13, color: "#000", margin: "0 0 16px", opacity: 0.7 }}>
          Which brands appear in each use case cluster over time · Aug 31 – Sep 6
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
        {TREND_CLUSTERS.map((cluster) => {
          const entry = perClusterTrend[cluster.tag];
          if (!entry) return null;
          const { brands, data } = entry;
          return (
            <div key={cluster.tag} style={{
              background: "#fff", borderRadius: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              padding: "20px 22px",
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#000", margin: "0 0 2px" }}>
                {cluster.label}
              </h3>
              <p style={{ fontSize: 11, fontWeight: 600, color: ACCENT, margin: "0 0 2px" }}>
                {cluster.description}
              </p>
              <p style={{ fontSize: 11, color: "#000", margin: "0 0 12px", opacity: 0.45 }}>
                AI estimating brands · daily mentions · EstiMate, Togal.AI &amp; Buildr pinned
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data} margin={{ left: -16, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#000" }} tickFormatter={fmtDate} />
                  <YAxis tick={{ fontSize: 10, fill: "#000" }} allowDecimals={false} width={28} />
                  <Tooltip content={<TrendTooltip />} />
                  {brands.map((brand) => {
                    const isPinned = PINNED_BRANDS.includes(brand);
                    return (
                      <Line
                        key={brand} type="monotone" dataKey={brand}
                        stroke={brandColorMap[brand] ?? "#94a3b8"}
                        strokeWidth={isPinned ? 2 : 1.5}
                        dot={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
              {/* Mini legend */}
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginTop: 10 }}>
                {brands.map((brand) => {
                  const isPinned = PINNED_BRANDS.includes(brand);
                  const color = brandColorMap[brand] ?? "#94a3b8";
                  return (
                    <span key={brand} style={{
                      display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                      color: isPinned ? color : "#000",
                      fontWeight: isPinned ? 700 : 400,
                    }}>
                      <span style={{
                        width: 10, height: isPinned ? 4 : 3, borderRadius: 999,
                        background: color, display: "inline-block", flexShrink: 0,
                      }} />
                      {brand}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Visibility by LLM ─────────────────────────────────────────────── */}
      <Section
        title="Visibility by LLM"
        subtitle="Claude Haiku vs GPT-4o-mini · AI-native estimating agents only"
      >
        <ResponsiveContainer width="100%" height={Math.max(120, modelData.length * 48)}>
          <BarChart data={modelData} layout="vertical" margin={{ left: 0, right: 40, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#000" }} />
            <YAxis
              type="category" dataKey="brand" width={130}
              tick={{ fontSize: 12, fill: "#000" }} tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(234,88,12,0.06)" }}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="claude" name="Claude Haiku" fill={CLAUDE} radius={[0, 4, 4, 0]} stackId="a" />
            <Bar dataKey="gpt"    name="GPT-4o-mini"  fill={GPT}    radius={[0, 4, 4, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* ── Use case cluster split ────────────────────────────────────────── */}
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Use Case Share of Voice
        </h2>
        <p style={{ fontSize: 13, color: "#000", margin: "0 0 16px" }}>
          Which brands appear when LLMs are asked about each specific estimating use case
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 }}>
        {CLUSTERS.map((cluster) => {
          const data = clusterMap[cluster.tag] ?? [];
          const total = data.reduce((s, r) => s + r.mentions, 0);
          return (
            <div key={cluster.tag} style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "20px 24px",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#000", margin: "0 0 2px" }}>
                {cluster.label}
              </h3>
              <p style={{ fontSize: 12, color: "#000", margin: "0 0 16px" }}>
                {cluster.description}
              </p>
              {data.length === 0 ? (
                <EmptyState label="No data yet for this cluster" />
              ) : (
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ flexShrink: 0 }}>
                    <PieChart width={150} height={150}>
                      <Pie
                        data={data} dataKey="mentions"
                        cx={70} cy={70}
                        innerRadius={38} outerRadius={65}
                        paddingAngle={2}
                        labelLine={false}
                      >
                        {data.map((r) => (
                          <Cell key={r.brand} fill={brandColor(r.brand)} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
                        formatter={(v: unknown, _n: unknown, props: { payload?: { brand?: string } }) => [
                          `${v} (${total > 0 ? Math.round(((v as number) / total) * 100) : 0}%)`,
                          props.payload?.brand ?? "",
                        ]}
                      />
                    </PieChart>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                    {data.map((r) => (
                      <div key={r.brand} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: brandColor(r.brand) }} />
                        <span style={{ fontSize: 13, color: "#000", flex: 1, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{r.brand}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#000", flexShrink: 0 }}>
                          {total > 0 ? Math.round((r.mentions / total) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Product Feature Scores ─────────────────────────────────────────── */}
      <div style={{ marginTop: 32, marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Product Feature Scores
        </h2>
      </div>

      {featureScores.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)",
          padding: "28px", marginBottom: 16,
        }}>
          <EmptyState label="Feature scores not yet available" />
        </div>
      ) : (
        ALL_CLUSTERS.map((cluster) => {
          const clusterFeatures = ESAI_FEATURES.filter((f) => f.feature_tag === cluster.tag);
          const clusterScores   = featureScores.filter((s) => s.feature_tag === cluster.tag);
          if (clusterFeatures.length === 0 || clusterScores.length === 0) return null;

          return (
            <div key={cluster.tag} style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "28px", marginBottom: 20,
            }}>
              <p style={{
                fontFamily: "var(--font-space-mono, monospace)",
                fontSize: 15, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                color: "#2563EB", margin: "0 0 24px",
              }}>
                {cluster.label}
              </p>

              <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>
                {clusterFeatures.map((feature, fi) => {
                  const featureRows = clusterScores
                    .filter((s) => s.feature_id === feature.feature_id && s.score_band !== "not_documented")
                    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
                  if (featureRows.length === 0) return null;

                  return (
                    <div key={feature.feature_id}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
                        <span style={{ color: "#2563EB" }}>Product Feature {fi + 1}: </span>{feature.feature_name}
                      </p>
                      <p style={{ fontSize: 13, color: "#2563EB", margin: "0 0 18px", lineHeight: 1.5 }}>
                        {feature.description}
                      </p>

                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                        {featureRows.map((row) => {
                          const isNd    = row.score_band === "not_documented";
                          const score   = row.score ?? 0;
                          const barColor = row.score_band === "strong"  ? "#16a34a"
                            : row.score_band === "partial" ? "#d97706"
                            : row.score_band === "weak"    ? "#dc2626"
                            : "rgba(0,0,0,0.18)";
                          const cleanEvidence = row.evidence
                            ? row.evidence.replace(/<cite[^>]*>|<\/cite>/g, "").trim()
                            : null;

                          if (isNd) {
                            return (
                              <div key={row.brand_name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#000", width: 160, flexShrink: 0 }}>
                                  {row.brand_name}
                                </span>
                                <span style={{ fontSize: 12, color: "#000", fontStyle: "italic" }}>
                                  not documented
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div key={row.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: cleanEvidence ? 6 : 0 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#000", width: 160, flexShrink: 0 }}>
                                  {row.brand_name}
                                </span>
                                <div style={{
                                  flex: 1, height: 10, borderRadius: 999,
                                  background: "rgba(0,0,0,0.06)", overflow: "hidden",
                                }}>
                                  <div style={{
                                    width: `${score}%`, height: "100%",
                                    background: barColor, borderRadius: 999,
                                    transition: "width 0.4s ease",
                                  }} />
                                </div>
                                <span style={{
                                  fontSize: 14, fontWeight: 700, color: barColor,
                                  width: 32, textAlign: "right" as const, flexShrink: 0,
                                  fontVariantNumeric: "tabular-nums",
                                }}>
                                  {score}
                                </span>
                              </div>
                              {cleanEvidence && (
                                <p style={{
                                  fontSize: 12, color: "#000", lineHeight: 1.65,
                                  margin: 0, paddingLeft: 172,
                                }}>
                                  {cleanEvidence}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {fi < clusterFeatures.length - 1 && (
                        <div style={{ marginTop: 28, borderTop: "1px solid rgba(0,0,0,0.06)" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* ── Sentiment Analysis ────────────────────────────────────────────── */}
      {(() => {
        const { rows: sentimentRows, meta: sentimentMeta } = sentimentData;
        const ready = (sentimentMeta.dual_model_dates ?? 0) >= SENTIMENT_GATE;

        const overallBrands = sentimentRows
          .filter((r) => r.bucket_tag === "overall")
          .sort((a, b) => b.positive_count - a.positive_count);

        const globalDescFreq = new Map<string, number>();
        for (const row of overallBrands) {
          for (const d of (row.top_descriptors ?? [])) {
            globalDescFreq.set(d, (globalDescFreq.get(d) ?? 0) + 1);
          }
        }

        const e = sentimentMeta.earliest_date;
        const l = sentimentMeta.latest_date;
        const fmt = (d: string) =>
          new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", { month: "short", day: "numeric", timeZone: "UTC" });
        const dateLabel = e && l ? (e === l ? fmt(e) : `${fmt(e)} – ${fmt(l)}`) : "";

        return (
          <div style={{ marginTop: 32, marginBottom: 4 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
                Sentiment Analysis
              </h2>
              <p style={{ fontSize: 13, color: "#000", margin: 0 }}>
                How Claude Haiku and GPT-4o-mini describe each brand overall{dateLabel ? ` · ${dateLabel}` : ""}
              </p>
            </div>

            <div style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "24px 28px", marginBottom: 20,
            }}>
              {!ready || overallBrands.length === 0 ? (
                <EmptyState label="Collecting sentiment data" />
              ) : (
                <div>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                    {overallBrands.map((brand) => {
                      const total  = brand.total_count || 1;
                      const posPct = Math.round((brand.positive_count / total) * 100);
                      const neuPct = Math.round((brand.neutral_count  / total) * 100);
                      const negPct = 100 - posPct - neuPct;
                      const descriptors = [...new Set(brand.top_descriptors ?? [])].slice(0, 5);
                      return (
                        <div key={brand.brand_name}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: descriptors.length > 0 ? 6 : 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#000", width: 160, flexShrink: 0 }}>
                              {brand.brand_name}
                            </span>
                            <div style={{
                              flex: 1, height: 10, borderRadius: 999,
                              background: "rgba(0,0,0,0.06)", overflow: "hidden", display: "flex",
                            }}>
                              {posPct > 0 && <div style={{ width: `${posPct}%`, height: "100%", background: "#16a34a" }} />}
                              {neuPct > 0 && <div style={{ width: `${neuPct}%`, height: "100%", background: "#d97706" }} />}
                              {negPct > 0 && <div style={{ width: `${negPct}%`, height: "100%", background: "#dc2626" }} />}
                            </div>
                            <span style={{
                              fontSize: 14, fontWeight: 700, color: "#16a34a",
                              width: 36, textAlign: "right" as const, flexShrink: 0,
                              fontVariantNumeric: "tabular-nums",
                            }}>
                              {posPct}%
                            </span>
                          </div>
                          {descriptors.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, paddingLeft: 172 }}>
                              {descriptors.map((d, i) => {
                                const unique = (globalDescFreq.get(d) ?? 0) === 1;
                                return (
                                  <span key={i} style={{
                                    fontSize: 12,
                                    color: unique ? "#2563eb" : "rgba(0,0,0,0.55)",
                                    background: unique ? "rgba(37,99,235,0.07)" : "rgba(0,0,0,0.04)",
                                    border: `1px solid ${unique ? "rgba(37,99,235,0.2)" : "rgba(0,0,0,0.07)"}`,
                                    borderRadius: 4, padding: "2px 7px", fontWeight: unique ? 600 : 400,
                                  }}>
                                    {d}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: 16, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 20, flexWrap: "wrap" as const }}>
                    {[["#16a34a", "Positive"], ["#d97706", "Neutral"], ["#dc2626", "Negative"]].map(([color, label]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#000" }}>{label}</span>
                      </div>
                    ))}
                    <span style={{ fontSize: 12, color: "#000", marginLeft: "auto" }}>
                      Both models · collected Sep 3 – Sep 6
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Product Feature Improvement Opportunities ───────────────────────── */}
      <div style={{ marginTop: 40, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Product Feature Improvement Opportunities
        </h2>
        <p style={{ fontSize: 13, color: "#000", margin: "0 0 20px" }}>
          Gaps identified from locked-brand AI estimating competitors and builder feedback across use case clusters
        </p>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>

          <div style={{
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #2563EB",
            borderRadius: "0 12px 12px 0", padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>
                1. Australian Pricing Database Integration: Rawlinsons, Cordell, Archicentre
              </p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#2563EB",
                background: "rgba(37,99,235,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>AU differentiator</span>
            </div>
            <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 12px" }}>
              Every Australian builder prices from Rawlinsons, Cordell, or Archicentre cost guides. No AI-native estimating tool — Togal.AI, Buildr, or EstiMate — natively pulls from these AU-specific databases. A builder who opens EstiMate and gets a line-item estimate auto-seeded with current Rawlinsons rates for their state has no reason to cross-check in a separate spreadsheet. This closes the single biggest credibility gap AI estimating tools face in the Australian market: the fear that AI-generated numbers are not real AU prices.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>No AI-native competitor has cracked this in AU:</span>
              {["Togal.AI (US-only)", "Buildr (US-only)"].map((b) => (
                <span key={b} style={{ fontSize: 12, color: "#000", background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 8px" }}>{b}</span>
              ))}
            </div>
          </div>

          <div style={{
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #16a34a",
            borderRadius: "0 12px 12px 0", padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>
                2. Voice-to-Scope from Site Visits: Describe the Job, Get the Estimate
              </p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#16a34a",
                background: "rgba(22,163,74,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>Deepens core</span>
            </div>
            <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 12px" }}>
              A builder does a site measure, walks the job, and knows exactly what it takes. The missing step is getting that knowledge into an estimate without sitting at a desk. An AI that listens to a voice note describing the scope — "three bedrooms, double brick extension, new slab, 120 square metres" — and generates a structured line-item estimate automatically would eliminate the desk-time bottleneck entirely. This extends the AI estimation paradigm to the first moment of pricing, before any plans exist, which is where most residential builders actually start.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>Partial in adjacent category:</span>
              {["Dexify (tradie AI)", "Otter.ai (transcription only)"].map((b) => (
                <span key={b} style={{ fontSize: 12, color: "#000", background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 8px" }}>{b}</span>
              ))}
            </div>
          </div>

          <div style={{
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #d97706",
            borderRadius: "0 12px 12px 0", padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>
                3. Subcontractor Quote Request & Comparison Automation
              </p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#d97706",
                background: "rgba(217,119,6,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>Adoption lever</span>
            </div>
            <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 12px" }}>
              After an estimate is built, the biggest time sink is emailing subcontractors for trade quotes, tracking responses, and comparing them. An AI that automatically packages the relevant scope items per trade, sends quote requests, and presents a comparison table when responses arrive would close the estimating loop without the builder manually managing email threads. No AI-native estimating platform in the locked brand set has this end-to-end. It is the difference between EstiMate being a tool that helps price a job and one that actually gets the job priced.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>Competitors with partial coverage:</span>
              {["Procore (large GC only)", "Buildxact (manual)"].map((b) => (
                <span key={b} style={{ fontSize: 12, color: "#000", background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 8px" }}>{b}</span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── LLM Visibility Playbook ──────────────────────────────────────────── */}
      <div style={{ marginTop: 40, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          LLM Visibility Playbook
        </h2>
        <p style={{ fontSize: 13, color: "#000", margin: "0 0 20px" }}>
          The moves that turn LLM invisibility into first-mover advantage, ranked by expected lift
        </p>

        <div style={{
          background: "linear-gradient(135deg, #f8f4ff 0%, #f0f7ff 100%)",
          border: "1px solid rgba(99,102,241,0.15)",
          borderLeft: "3px solid #6366f1",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#1e1b4b", margin: 0 }}>
            <strong>No AI-native estimating tool has cracked LLM visibility in the Australian builder market.</strong> Every query currently defaults to traditional tools — Bluebeam, PlanSwift, Buildxact — or US-focused platforms like Procore. That is not a gap to close: it is white space nobody has claimed. The two tactics that consistently work in adjacent AI-agent categories are named-competitor comparison content and concentrated query-cluster ownership. EstiMate has the chance to be the first AI-native estimating brand to apply either in AU.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" as const }}>
          {([
            {
              label: "Model A: Named Comparison Pages",
              title: "EstiMate vs Buildxact, vs Bluebeam, vs PlanSwift",
              priority: "Highest impact",
              priorityColor: "#16a34a",
              body: "Publish a dedicated 'EstiMate vs [Competitor]' page for every tool LLMs currently default to: Buildxact, Bluebeam, PlanSwift, CostX. LLMs are trained on comparison content and retrieve it directly when users ask what alternatives exist. Each page must name the competitor in the title, URL slug, and H1 — include a feature table comparing AI capabilities — and end with a clear 'why EstiMate' section. Four pages covering four dominant incumbents is all it takes to seed LLM training data with EstiMate as a named alternative.",
            },
            {
              label: "Model B: Cluster Ownership",
              title: "Own 'AI estimating for Australian builders' with concentrated content",
              priority: "High impact",
              priorityColor: "#16a34a",
              body: "Pick the single query cluster where EstiMate has the strongest story — AI-powered estimating for residential builders in Australia — and publish 10–15 pieces all using exactly the same phrase cluster. LLMs learn category labels through repeated co-occurrence. When every article, guide, and case study on this topic names EstiMate and uses the same anchor phrase, the model begins associating them. One post achieves nothing. Ten posts on one phrase, published over 90 days, can shift a model's associations for that query.",
            },
          ] as { label: string; title: string; priority: string; priorityColor: string; body: string }[]).map(({ label, title, priority, priorityColor, body }) => (
            <div key={label} style={{
              flex: "1 1 300px", background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12, padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: priorityColor, background: `${priorityColor}18`, padding: "2px 8px", borderRadius: 999 }}>{priority}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#000", margin: "0 0 8px", lineHeight: 1.3 }}>{title}</p>
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#000", margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {([
            {
              tag: "AU-specific",
              title: "Builder community and trade forum seeding",
              body: "LLMs are trained on forums and communities. Genuine, helpful answers on HIA member forums, Master Builders community threads, r/AusFinance, and commercial builder Facebook groups — mentioning EstiMate by name with a specific use case ('we use EstiMate to auto-measure from PDFs on residential jobs') — generate training signal that a blog post on estimateai.com.au cannot match. Third-party community mentions carry outsized LLM weight because they read as unsponsored. One well-placed answer per week for 12 weeks compounds significantly.",
            },
            {
              tag: "AU-specific",
              title: "State-based and trade-specific landing pages",
              body: "LLMs answer location+trade queries by surfacing whatever content exists for that combination. Create pages targeting: 'AI estimating for residential builders in NSW', 'construction estimating software for Queensland builders', 'AI takeoff tool for Australian commercial GCs'. No competitor has this content for the AU market. These pages train LLMs to associate EstiMate with specific contexts — the same way Buildxact captured 'estimating software for small builders' — but EstiMate can do it faster because the AI-native angle is unclaimed.",
            },
            {
              tag: "Overall AI visibility",
              title: "Third-party AI directory and product listings",
              body: "G2, Capterra, ProductHunt, and Futurepedia are the directories LLMs trust most for product discovery. EstiMate needs a listing on each with 'AI-powered estimating for Australian builders' in the description — not just 'estimating software'. LLMs surface these directories directly in responses when a product lacks wider web presence. A complete G2 listing with reviews is a credibility shortcut and training data source simultaneously.",
            },
            {
              tag: "Overall AI visibility",
              title: "Publish the best AI estimating tools listicle yourself",
              body: "LLMs frequently cite 'best-of' roundup articles for discovery queries. If no independent publication has written 'The best AI estimating tools for Australian builders in 2026', EstiMate should publish it — including a fair assessment of Togal.AI, Buildr, and Buildxact. LLMs do not penalise self-authored comparison content; they index it the same as any third party. This is how category-defining brands build LLM authority before analysts catch up: they write the category narrative before anyone else does.",
            },
          ] as { tag: string; title: string; body: string }[]).map(({ tag, title, body }) => (
            <div key={title} style={{
              background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12, padding: "16px 20px",
              display: "flex", gap: 16, alignItems: "flex-start",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{tag}</span>
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#000", margin: "0 0 6px", lineHeight: 1.3 }}>{title}</p>
                <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#000", margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
