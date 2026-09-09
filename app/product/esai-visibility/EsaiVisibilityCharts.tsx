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
];

// All feature clusters (for the feature scores section)
const ALL_CLUSTERS: { tag: string; label: string }[] = [
  { tag: "esai-takeoff",      label: "Quantity Takeoff" },
  { tag: "esai-plans",        label: "Plan & Document Reading" },
  { tag: "esai-scope",        label: "Trade Scoping" },
  { tag: "esai-quote",        label: "Quote & Estimate Output" },
  { tag: "esai-residential",  label: "Residential New Build" },
  { tag: "esai-commercial",   label: "Commercial Construction" },
  { tag: "esai-subcontract",  label: "Subcontractor & Trade Quoting" },
  { tag: "esai-ai",           label: "AI-Powered Estimating" },
  { tag: "esai-tender",       label: "Tender & Bid Preparation" },
  { tag: "esai-integrations", label: "Technical Capabilities & Integrations" },
  { tag: "esai-security",     label: "Security & Data Trust" },
  { tag: "esai-pricing",      label: "Rate Management & Pricing" },
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
  notes:              string | null;
  grounded_source:    boolean;
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

// ── Buyer intent ───────────────────────────────────────────────────────────────
interface BuyerIntentRow {
  brand:           string;
  total_mentions:  number;
  avg_position:    number | null;
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  topBrands:     EsaiTopBrandRow[];
  byCluster:     EsaiClusterRow[];
  byModel:       EsaiModelRow[];
  clusterTrend:  EsaiClusterTrendRow[];
  featureScores: FeatureScoreRow[];
  sentimentData: SentimentData;
  buyerIntent:   BuyerIntentRow[];
}

export default function EsaiVisibilityCharts({
  topBrands, byCluster, byModel, clusterTrend, featureScores, sentimentData, buyerIntent,
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
        {TREND_CLUSTERS.map((cluster) => {
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
              <p style={{ fontSize: 11, fontWeight: 600, color: ACCENT, margin: "0 0 14px" }}>
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
                          const reasoning = row.notes?.trim() || cleanEvidence || null;

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
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: reasoning ? 6 : 0 }}>
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
                              {reasoning && (
                                <p style={{
                                  fontSize: 12, color: "#000", lineHeight: 1.65,
                                  margin: 0, paddingLeft: 172, opacity: 0.68,
                                }}>
                                  {reasoning}
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

      {/* ── LLM Buyer Intent Visibility ───────────────────────────────────── */}
      {(() => {
        const PINNED = new Set(["EstiMate", "Togal.AI", "Buildr"]);
        const sorted = [...buyerIntent].sort((a, b) => b.total_mentions - a.total_mentions);
        const maxMentions = sorted[0]?.total_mentions ?? 1;
        const totalMentions = sorted.reduce((s, r) => s + r.total_mentions, 0);
        const estimateMentions = sorted.find(r => r.brand === "EstiMate")?.total_mentions ?? 0;

        const PROMPTS = [
          "What estimating software should an Australian building company invest in right now?",
          "I'm an Australian builder looking to switch estimating software — what do most builders actually recommend and why?",
          "Which AI estimating tool is worth paying for as an Australian builder in 2025, and what are the alternatives?",
        ];

        return (
          <Section
            title="LLM Buyer Intent Visibility"
            subtitle="When builders ask AI which estimating software to invest in or switch to, who gets recommended?"
          >
            {/* Prompts used */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#EA580C", marginBottom: 12 }}>
                Prompts tested
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {PROMPTS.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    background: "rgba(234,88,12,0.04)", borderLeft: "3px solid rgba(234,88,12,0.25)",
                    borderRadius: "0 8px 8px 0", padding: "10px 14px",
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "#EA580C",
                      background: "rgba(234,88,12,0.12)", borderRadius: 999,
                      padding: "2px 8px", flexShrink: 0, marginTop: 1,
                    }}>{i + 1}</span>
                    <p style={{ fontSize: 13, color: "#000", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                      &ldquo;{p}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Callout */}
            <div style={{
              background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.18)",
              borderRadius: 10, padding: "14px 18px", marginBottom: 28,
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: 13, color: "#000", lineHeight: 1.65, margin: 0 }}>
                <strong>EstiMate surfaces in {estimateMentions} out of ~{totalMentions} buyer-intent LLM responses.</strong>{" "}
                When a builder asks AI which estimating software to invest in, traditional tools dominate the recommendations.
                This is the gap: buyers using AI to shortlist software today won&apos;t encounter EstiMate unless they already know to search for it.
              </p>
            </div>

            {/* Bar chart */}
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#000", width: 180, flexShrink: 0 }}> </span>
                <span style={{ fontSize: 11, color: "#000", opacity: 0.45 }}>← fewer mentions · more mentions →</span>
              </div>
              {sorted.map((row) => {
                const isPinned = PINNED.has(row.brand);
                const pct = maxMentions > 0 ? (row.total_mentions / maxMentions) * 100 : 0;
                const barColor = isPinned ? "#EA580C" : "rgba(0,0,0,0.18)";
                const barFill  = isPinned ? "#EA580C" : "#64748b";
                return (
                  <div key={row.brand} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 13, fontWeight: isPinned ? 700 : 600,
                      color: isPinned ? "#EA580C" : "#000",
                      width: 180, flexShrink: 0,
                    }}>
                      {row.brand}
                      {isPinned && (
                        <span style={{
                          marginLeft: 6, fontSize: 10, fontWeight: 700,
                          background: "rgba(234,88,12,0.12)", color: "#EA580C",
                          borderRadius: 999, padding: "1px 6px", letterSpacing: "0.04em",
                        }}>AI</span>
                      )}
                    </span>
                    <div style={{ flex: 1, height: 10, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%", borderRadius: 999,
                        background: barFill, transition: "width 0.4s ease",
                        opacity: pct === 0 ? 0 : 1,
                      }} />
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: barColor,
                      width: 28, textAlign: "right" as const, flexShrink: 0,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {row.total_mentions}
                    </span>
                    {row.avg_position !== null && (
                      <span style={{ fontSize: 11, color: "#000", opacity: 0.45, width: 60, flexShrink: 0 }}>
                        pos.{" "}{Math.round(row.avg_position)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: "#000", opacity: 0.45, marginTop: 16 }}>
              Mentions = total times brand appeared across 3 prompts × 4 model runs (Claude Haiku + GPT-4o-mini, 2 collection dates). Position = average rank in the response when mentioned.
            </p>
          </Section>
        );
      })()}

      {/* ── LLM Visibility Playbook ───────────────────────────────────────── */}
      {(() => {
        const Cite = ({ children }: { children: React.ReactNode }) => (
          <span style={{
            fontFamily: "monospace", fontSize: 11, color: "#000", opacity: 0.45,
            background: "rgba(0,0,0,0.05)", borderRadius: 3, padding: "1px 5px",
            whiteSpace: "nowrap",
          }}>{children}</span>
        );

        const Dot = ({ children }: { children: React.ReactNode }) => (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ color: "#EA580C", fontSize: 16, lineHeight: "1.65", flexShrink: 0, marginTop: 0 }}>·</span>
            <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65, margin: 0 }}>{children}</p>
          </div>
        );

        const SignalBlock = ({ icon, title, why, children }: { icon: string; title: string; why: string; children: React.ReactNode }) => (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#000" }}>{title}</span>
              <span style={{ fontSize: 12, color: "#000", opacity: 0.45, fontStyle: "italic" }}>— {why}</span>
            </div>
            {children}
          </div>
        );

        const CaseStudy = ({ color, number, name, subtitle, children }: { color: string; number: string; name: string; subtitle: string; children: React.ReactNode }) => (
          <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: 24, marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.10em", textTransform: "uppercase", color, marginBottom: 4 }}>{number}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#000", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: 13, color: "#000", opacity: 0.5, fontStyle: "italic", marginBottom: 20 }}>{subtitle}</div>
            {children}
          </div>
        );

        const SnapGrid = ({ items }: { items: { label: string; value: string }[] }) => (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 1, background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 8, overflow: "hidden", marginBottom: 28,
          }}>
            {items.map(({ label, value }) => (
              <div key={label} style={{ background: "#fff", padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.10em", textTransform: "uppercase", color: "#000", opacity: 0.45, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#000", lineHeight: 1.4 }}>{value}</div>
              </div>
            ))}
          </div>
        );

        const SubHeading = ({ children }: { children: React.ReactNode }) => (
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "#000", opacity: 0.4, margin: "24px 0 10px" }}>
            {children}
          </div>
        );

        const PullQuote = ({ color, text, attr }: { color: string; text: string; attr: string }) => (
          <div style={{
            borderLeft: `3px solid ${color}`, background: `${color}10`,
            borderRadius: "0 6px 6px 0", padding: "12px 16px", margin: "12px 0", maxWidth: 560,
          }}>
            <p style={{ fontSize: 13, fontStyle: "italic", color: "#000", lineHeight: 1.65, margin: "0 0 6px" }}>&ldquo;{text}&rdquo;</p>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#000", opacity: 0.45 }}>{attr}</span>
          </div>
        );

        const GapBox = ({ children }: { children: React.ReactNode }) => (
          <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, padding: "16px 18px", marginTop: 16 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#000", opacity: 0.4, marginBottom: 10 }}>Visibility gaps — signals LLMs can&apos;t find</div>
            {children}
          </div>
        );

        const MentionBar = ({ label, color, pct, val }: { label: string; color: string; pct: number; val: string }) => (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: color !== "#94a3b8" ? color : "#000", width: 110, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#000", opacity: 0.45, width: 70, flexShrink: 0 }}>{val}</span>
          </div>
        );

        const Move = ({ num, title, why, children }: { num: number; title: string; why: string; children: React.ReactNode }) => (
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "0 18px", marginBottom: 36, alignItems: "start" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#EA580C", lineHeight: 1, paddingTop: 2 }}>{num}</div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "#000", marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 10.5, fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase", color: "#EA580C", marginBottom: 10 }}>{why}</div>
              {children}
            </div>
          </div>
        );

        const MoveDot = ({ children }: { children: React.ReactNode }) => (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
            <span style={{ color: "#EA580C", fontSize: 16, lineHeight: "1.65", flexShrink: 0 }}>·</span>
            <p style={{ fontSize: 13, color: "#000", lineHeight: 1.65, margin: 0 }}>{children}</p>
          </div>
        );

        const defnStyle: React.CSSProperties = {
          background: "rgba(234,88,12,0.06)", borderLeft: "4px solid #EA580C",
          borderRadius: "0 8px 8px 0", padding: "14px 18px", margin: "16px 0 24px",
        };

        return (
          <>
            {/* Intro */}
            <Section title="LLM Visibility Playbook" subtitle="How Togal.AI and Buildr are building LLM presence — and what EstiMate AI needs to do to become the answer">

              {/* What is LLM visibility */}
              <p style={{ fontSize: 14, color: "#000", lineHeight: 1.75, maxWidth: 640, marginBottom: 12 }}>
                When a builder types <em>&ldquo;what estimating software should I use?&rdquo;</em> into an AI assistant, the brands it names are the shortlist. Brands it doesn&apos;t name don&apos;t exist in that moment. <strong>LLM Visibility is the likelihood that an AI model names, recommends, or describes your product</strong> when a potential buyer asks a relevant question.
              </p>
              <div style={defnStyle}>
                <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.7, margin: 0 }}>
                  The three signals that most reliably build LLM visibility are: <strong>(1) mechanism-level content</strong> — pages that explain exactly what your product does in input → process → output terms; <strong>(2) named associations</strong> — integration partners, named competitors, named customers, named outcomes; and <strong>(3) third-party proof</strong> — reviews, case studies, press, forum mentions. LLMs weight information that appears in multiple independent sources.
                </p>
              </div>
              <div style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, padding: "14px 16px", marginBottom: 36, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📊</span>
                <p style={{ fontSize: 13, color: "#000", lineHeight: 1.65, margin: 0 }}>
                  Our data: across 3 buyer-intent prompts run against Claude Haiku and GPT-4o-mini, <strong>PlanSwift was named 34 times, Buildxact 18, Buildr 16, Togal.AI 5, and EstiMate AI once.</strong> The two case studies below explain what&apos;s driving those numbers.
                </p>
              </div>

              {/* ── CASE STUDY 1: TOGAL.AI ────────────────────────────── */}
              <CaseStudy color="#2563EB" number="Case Study 1" name="Togal.AI" subtitle="togal.ai — US market, AI-powered quantity takeoff for contractors and estimators">
                <SnapGrid items={[
                  { label: "Product", value: "AI quantity takeoff" },
                  { label: "Market", value: "US GCs & estimators" },
                  { label: "Blog articles", value: "27+ visible" },
                  { label: "Case studies", value: "13 named" },
                  { label: "Buyer intent mentions", value: "5 / ~83 responses" },
                  { label: "Avg position", value: "Position 16–17" },
                ]} />

                <SubHeading>What they&apos;re doing right</SubHeading>

                <SignalBlock icon="📄" title="Content volume and architecture" why="gives LLMs many retrieval surfaces">
                  <Dot>27+ visible blog/article cards across a multi-page archive. Content types span proof (case studies), education (blog guides), product mechanism (/features), competitive comparison (/vs/), and trade positioning (/trades) — each layer serves a different LLM retrieval query. <Cite>togal.ai/blog, togal.ai/trades</Cite></Dot>
                  <Dot>13 named case-study cards, each with a dedicated slug URL (<code style={{ fontSize: 12 }}>/case-study/slug</code>). Named customers include Coastal Construction, University of Kansas, UrbanCore, Consigli, Select Painting, Stevens Construction. <Cite>togal.ai/case-studies</Cite></Dot>
                  <Dot>Example titles that signal domain expertise: <em>&ldquo;How to Evaluate Construction Takeoff Software: Estimator&apos;s 8 Checkpoints,&rdquo;</em> <em>&ldquo;Repeating Groups: Stop Taking Off the Same Room Twice,&rdquo;</em> <em>&ldquo;5 Ways AI Takeoffs Can Stop Cash Burn in Construction.&rdquo;</em> <Cite>togal.ai/blog pages 1–3</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="⚙️" title="Mechanism-level product language" why="LLMs retrieve and repeat specific claims, not vague ones">
                  <Dot><strong>Upload → auto-name → rename:</strong> &ldquo;Upload documents, use Togal&apos;s auto-naming tool, and rename them in seconds.&rdquo; <Cite>togal.ai/features</Cite></Dot>
                  <Dot><strong>Draw bounding box → AI searches plan set → locate and count:</strong> &ldquo;Draw a box around an object, run AI-powered image, text, and pattern search across the plan set, and instantly locate and count it.&rdquo; <Cite>togal.ai/features</Cite></Dot>
                  <Dot><strong>Drawings → automated takeoff → quantities exported:</strong> &ldquo;Hit the green Togal button and let AI handle the repetitive work — then export quantities and classifications to your estimating software or Excel.&rdquo; <Cite>togal.ai/features, togal.ai/blog/how-to-export-information-takeoffs-with-togal-ai</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="🔗" title="Named integrations and file formats" why="LLMs associate your product with named tools in their answers">
                  <Dot><strong>Ediphi — native integration:</strong> &ldquo;Togal.AI and Ediphi built a native integration&rdquo; with quantities flowing directly to Ediphi&apos;s estimating environment. <Cite>togal.ai/blog/ediphi-togal-integration-techstack; Ediphi Instagram, Aug 5 2026</Cite></Dot>
                  <Dot><strong>ServiceTitan</strong> — named in the help centre. <strong>Zebel</strong> — named in the UrbanCore case study with quantities flowing into Zebel for pricing estimates. <Cite>help.togal.ai; togal.ai/case-study/urbancore-case-study-togal-ai-zebel-integration</Cite></Dot>
                  <Dot>File inputs explicitly named: <strong>PDF, CAD file, image</strong> (and in a separate article: PDFs, CAD exports, scanned images). Outputs: <strong>Excel and PDF</strong> confirmed. Note — Bluebeam and Procore integration were not found in reviewed official pages. <Cite>Parallel.ai research, Sep 2026</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="⚔️" title="Competitor comparison content" why="when a buyer asks 'Togal vs PlanSwift,' LLMs retrieve this page">
                  <Dot>Dedicated <code style={{ fontSize: 12 }}>/vs/planswift</code> page: &ldquo;Togal.AI vs PlanSwift — which takeoff software is best?&rdquo; — directly named comparison. <Cite>togal.ai/vs/planswift</Cite></Dot>
                  <Dot>University of Kansas comparative study naming On-Screen Takeoff (OST): ~70% time savings, accuracy within 5% of OST — a peer-reviewed study that answers the query &ldquo;Togal vs OST.&rdquo; <Cite>togal.ai/case-study/peer-reviewed-study-togal-ai-vs-on-screen-takeoff</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="📐" title="Named proof with measurable outcomes" why="specific numbers get cited; vague claims don't">
                  <Dot>Coastal Construction (Miami): takeoff time reduced from 50% to 10%, 14.5 hours saved per plan set, 1,160 hrs/month, <strong>~$1M first-year savings</strong>, accuracy 97%→98%. <Cite>togal.ai/case-study/coastal-construction-case-study</Cite></Dot>
                  <Dot>University of Kansas: <strong>76% time savings</strong> on Fire Station case; 71.03% average across two case studies; accuracy within 5% of OST. <Cite>togal.ai/case-study/ku-study-togal-vs-ost</Cite></Dot>
                  <Dot>UrbanCore: takeoffs &ldquo;up to 80% faster&rdquo;; new interns proficient &ldquo;in weeks.&rdquo; SOC 2 Type II certification confirmed independently. <Cite>togal.ai/case-study/urbancore; togal.ai/news</Cite></Dot>
                </SignalBlock>

                <SubHeading>What LLMs currently say</SubHeading>
                <div style={{ margin: "12px 0 4px" }}>
                  <MentionBar label="PlanSwift" color="#94a3b8" pct={100} val="34 mentions" />
                  <MentionBar label="Buildxact" color="#94a3b8" pct={53} val="18 mentions" />
                  <MentionBar label="Togal.AI" color="#2563EB" pct={15} val="5 mentions" />
                </div>
                <p style={{ fontSize: 11, fontFamily: "monospace", color: "#000", opacity: 0.45, marginBottom: 16 }}>Avg position when named: 16–17. Appearing late means LLMs reach for it as an afterthought, not a primary recommendation.</p>

                <PullQuote color="#2563EB" text="I love how Togal.AI organizes all our items in one easy-to-access software in the browser, which makes takeoffs effortless and super easy to get started." attr="Chris V., G2 · g2.com/products/togal-ai/reviews" />
                <PullQuote color="#2563EB" text="The automated button is really only used for simple counts on a floor plan, so it doesn't really apply to masonry specifically." attr="Scott G. (critical), G2 · g2.com/products/togal-ai/reviews" />

                <SubHeading>What&apos;s missing</SubHeading>
                <GapBox>
                  <Dot><strong>Zero AU market content.</strong> No Australian-specific blog posts, case studies, or pricing content. An AU builder asking an LLM gets a US-framed answer from Togal, if they get one at all.</Dot>
                  <Dot><strong>No Reddit or community footprint.</strong> One organic r/estimators post found (a buyer asking pre-purchase questions), zero visible Togal brand responses. LLMs weight community discussion heavily because it&apos;s independent. <Cite>reddit.com/r/estimators/comments/1ljkj48</Cite></Dot>
                  <Dot><strong>Capterra shows 0 reviews</strong> in reviewed pages — a dead third-party signal. <Cite>capterra.com/p/10001876/Togal-AI/reviews</Cite></Dot>
                  <Dot><strong>Last verifiable funding: $5M pre-Series A SAFE, March 2023</strong> — outside the 12-month window. No recent mainstream press found. <Cite>constructiondive.com/news/togalai-raises-5m/646254</Cite></Dot>
                </GapBox>
              </CaseStudy>

              {/* ── CASE STUDY 2: BUILDR ──────────────────────────────── */}
              <CaseStudy color="#059669" number="Case Study 2" name="Buildr" subtitle="buildr.com — US/Canada GC market, AI-powered preconstruction workspace">
                <SnapGrid items={[
                  { label: "Product", value: "AI preconstruction (estimating, CRM, takeoff, bid leveling)" },
                  { label: "Market", value: "US & Canada GCs only" },
                  { label: "Dateable content assets", value: "~14–16 in 18 months" },
                  { label: "Named GC customers", value: "17+ on /customers" },
                  { label: "Buyer intent mentions", value: "16 / ~83 responses" },
                  { label: "Avg position", value: "Position ~11" },
                ]} />

                <SubHeading>What they&apos;re doing right</SubHeading>

                <SignalBlock icon="🏗️" title="Platform-level positioning" why="LLMs name platforms more reliably than single-feature tools">
                  <Dot>Homepage: <em>&ldquo;The unified workspace for preconstruction&rdquo;</em> and <em>&ldquo;AI-powered preconstruction for general contractors.&rdquo;</em> Estimating, takeoff, CRM, bid leveling, and pipeline are all one product — so multiple LLM query types retrieve the same brand. <Cite>buildr.com</Cite></Dot>
                  <Dot>March 2026 blog post frames AI beyond estimating: business development intelligence, workforce capacity, pursuit economics, and pipeline health — each phrase captures a different LLM query. <Cite>buildr.com/blog/ai-beyond-estimating-bd-workforce-pipeline</Cite></Dot>
                  <Dot>A dedicated library page defines &ldquo;AI Agent in Construction&rdquo; — educational content LLMs retrieve when users ask what AI means for their industry. <Cite>buildr.com/library/ai-agent</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="🗂️" title="Layered URL architecture" why="separate pages for each use case = more retrieval surfaces">
                  <Dot><code style={{ fontSize: 12 }}>/estimating</code> — AI construction estimating for GCs; <code style={{ fontSize: 12 }}>/library/ai-takeoff</code> — mechanism-level AI takeoff explainer, published Aug 28 2026; <code style={{ fontSize: 12 }}>/vs/autodesk</code>, <code style={{ fontSize: 12 }}>/vs/cosential</code>, <code style={{ fontSize: 12 }}>/vs/spreadsheets</code> — three comparison pages each capturing a different competitive query. <Cite>buildr.com</Cite></Dot>
                  <Dot>Long-form content with dates: AI Construction GC Guide (Feb 20, 2026), AI Beyond Estimating (Mar 9, 2026), Construction Estimating Software guide (Apr 8, 2026), AI Takeoff library page (Aug 28, 2026). <Cite>buildr.com/blog</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="⚙️" title="Mechanism-level product language" why="three confirmed input→process→output descriptions">
                  <Dot><strong>Estimate assembly:</strong> Kit turns &ldquo;budgets, spreadsheets, markups, and project files&rdquo; into &ldquo;a structured Buildr budget&rdquo; ready for review. <Cite>buildr.com/estimating</Cite></Dot>
                  <Dot><strong>Bid-day handoff:</strong> Approved budget lines become bid packages; users compare &ldquo;gaps, risks, and alternates.&rdquo; <Cite>buildr.com/estimating</Cite></Dot>
                  <Dot><strong>AI takeoff:</strong> AI reads construction drawings, classifies sheets, detects building elements, cross-references schedules and specifications, rolls up quantities, and presents for human review. <Cite>buildr.com/library/ai-takeoff</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="🔗" title="Named integration ecosystem" why="named tools increase chances of appearing in integration-related queries">
                  <Dot><strong>Procore</strong> confirmed — dedicated help-centre collection titled &ldquo;Procore ⟷ Buildr Integration&rdquo; covering what is synced, best practices, and accessing Buildr inside a Procore account. <Cite>help.buildrtech.com/en/collections/2882875-procore-buildr-integration</Cite></Dot>
                  <Dot>Homepage names tools by workflow group: <em>HubSpot · Unanet · Dynamics</em> (CRM), <em>Sage Estimating · Destini · PlanSwift · Excel</em> (estimating), <em>InDesign · Word</em> (proposals), <em>Bridgit Bench</em> (workforce). <Cite>buildr.com</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="⚔️" title="Direct competitor naming" why="captures buyers in active switching evaluation">
                  <Dot>vs Autodesk: <em>&ldquo;Buildr is an Autodesk alternative built specifically for preconstruction&rdquo;</em> — frames Buildr as taking the &ldquo;opposite path.&rdquo; <Cite>buildr.com/vs/autodesk</Cite></Dot>
                  <Dot>vs Cosential: direct comparison for GC preconstruction. vs Spreadsheets: <em>&ldquo;Spreadsheets are a tool. Buildr is a system.&rdquo;</em> <Cite>buildr.com/vs/cosential; buildr.com/vs/spreadsheets</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="📊" title="Named customer proof with measurable outcomes" why="self-reported but specific — LLMs cite named outcomes">
                  <Dot>WPC (Central Florida GC, building with Buildr since Dec 2021): <em>&ldquo;Our internal communications are 5x more efficient.&rdquo;</em> <Cite>buildr.com/customers/wpc</Cite></Dot>
                  <Dot>WPC: <em>&ldquo;We easily increased our monthly pursuits 3–4x without increasing headcount.&rdquo;</em> Previous tool: Cosential by Unanet — a specific named competitor switch. <Cite>buildr.com/customers</Cite></Dot>
                  <Dot>Named customer roster: Mint Construction, Biltmore Construction, Rycon Construction, CoreBuilt, Magil Construction, EE Reed, Conlon, Lee Lewis, KPRS, SC Builders, Stout — breadth of named GCs strengthens the association between &ldquo;GC&rdquo; and &ldquo;Buildr.&rdquo; <Cite>buildr.com/customers</Cite></Dot>
                </SignalBlock>

                <SubHeading>What LLMs currently say</SubHeading>
                <div style={{ margin: "12px 0 4px" }}>
                  <MentionBar label="PlanSwift" color="#94a3b8" pct={100} val="34 mentions" />
                  <MentionBar label="Buildr" color="#059669" pct={47} val="16 mentions" />
                  <MentionBar label="Togal.AI" color="#94a3b8" pct={15} val="5 mentions" />
                </div>
                <p style={{ fontSize: 11, fontFamily: "monospace", color: "#000", opacity: 0.45, marginBottom: 16 }}>Buildr outperforms Togal.AI 3:1 on buyer intent — driven by its broader platform positioning and more named integrations. Still well behind traditional tools.</p>

                <PullQuote color="#059669" text="Buildr gives me one source of truth for customer relations, helps expedite estimating on projects, and tracks project budgets effectively." attr="G2 review · g2.com/products/buildr/reviews" />
                <PullQuote color="#059669" text="There are a few small improvements that could be made to the estimating tool that would make a big impact on its usability and efficiencies." attr="G2 review (critical) · g2.com/products/buildr/reviews" />

                <SubHeading>What&apos;s missing</SubHeading>
                <GapBox>
                  <Dot><strong>Zero Reddit or community presence.</strong> No relevant threads, no brand-posted content found across targeted searches. <Cite>Parallel.ai research, Sep 2026</Cite></Dot>
                  <Dot><strong>Pricing is fully gated.</strong> Says &ldquo;More predictable pricing&rdquo; and &ldquo;Unlimited Users&rdquo; but shows no dollar figures — only a sales email. LLMs can&apos;t tell a buyer what it costs. <Cite>buildr.com/pricing</Cite></Dot>
                  <Dot><strong>No AU market presence.</strong> US and Canada only — no content, customers, or pricing for Australian GCs.</Dot>
                  <Dot><strong>Uncorroborated funding signal.</strong> A $100K Signalbase entry dated March 24, 2026 — not confirmed by Tracxn, Crunchbase, or Caplight. No mainstream press in the last 12 months. <Cite>trysignalbase.com; tracxn.com</Cite></Dot>
                </GapBox>
              </CaseStudy>

              {/* ── RECOMMENDED MOVES FOR ESTIMATE AI ─────────────────── */}
              <div style={{ background: "rgba(234,88,12,0.05)", border: "1px solid rgba(234,88,12,0.15)", borderRadius: 12, padding: "32px 32px 36px", marginTop: 8 }}>
                <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#EA580C", marginBottom: 6 }}>EstiMate AI</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#000", letterSpacing: "-0.02em", marginBottom: 8 }}>Recommended Moves to Build LLM Visibility</div>
                <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.7, margin: "0 0 16px", maxWidth: 580 }}>
                  EstiMate AI surfaces in <strong>1 out of ~83 buyer-intent responses</strong>. The gap isn&apos;t a product gap — it&apos;s a content and signal gap. Neither Togal.AI nor Buildr publishes Australian-specific content. EstiMate can own this space.
                </p>
                <div style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 8, padding: "12px 16px", marginBottom: 32, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>🇦🇺</span>
                  <p style={{ fontSize: 13, color: "#000", lineHeight: 1.65, margin: 0 }}><strong>The AU advantage:</strong> Neither Togal.AI nor Buildr publishes Australian-specific content, pricing, or customer stories. Every AU builder using an LLM to research estimating software today gets a US-framed answer. EstiMate can own this gap completely and be the brand LLMs associate with &ldquo;AI estimating for Australian builders.&rdquo;</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
                  <Move num={1} title="Publish a dedicated 'EstiMate vs [Competitor]' page for every tool LLMs currently recommend instead of you" why="Highest impact — captures buyers in active evaluation">
                    <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>When a builder asks an LLM &ldquo;EstiMate vs Buildxact&rdquo; — which is the #1 AU-mentioned competitor in our data — there is currently no page for the LLM to retrieve. It guesses, or answers with the competitor&apos;s own marketing. A comparison page becomes the authoritative document the LLM retrieves for that query.</p>
                    <MoveDot><strong>EstiMate vs Buildxact</strong> — Buildxact is the top AU estimating mention in LLM responses (18 mentions vs your 1)</MoveDot>
                    <MoveDot><strong>EstiMate vs PlanSwift</strong> — leads overall at 34 mentions; it&apos;s what LLMs default to for &ldquo;estimating software&rdquo;</MoveDot>
                    <MoveDot><strong>EstiMate vs CostX</strong> — AU-present competitor named in LLM responses</MoveDot>
                    <MoveDot><strong>EstiMate vs Spreadsheets</strong> — captures the largest entry-level buyer segment</MoveDot>
                    <p style={{ fontSize: 13, color: "#000", lineHeight: 1.65, margin: "10px 0 0", opacity: 0.7 }}>Each page must name the competitor in the title, URL slug, and H1; include a feature table comparing AI capabilities; and end with a clear &ldquo;why EstiMate&rdquo; section.</p>
                  </Move>

                  <div style={{ borderTop: "1px solid rgba(234,88,12,0.15)", margin: "4px 0 32px" }} />

                  <Move num={2} title="Rewrite your feature pages with input → process → output language for every core capability" why="Tells LLMs exactly what to say when asked how your product works">
                    <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>Generic claims like &ldquo;AI-powered estimating&rdquo; or &ldquo;fast and accurate takeoffs&rdquo; don&apos;t get retrieved — they could apply to any product. Specific workflow descriptions get retrieved verbatim. For each feature, describe it as a transformation:</p>
                    <MoveDot><strong>Builder uploads PDF plans → AI measures floor areas, wall lengths, openings → outputs quantities in Rawlinsons AU rates format</strong></MoveDot>
                    <MoveDot><strong>Estimator reviews AI-generated quantities → adjusts line items → exports to Excel or sends as PDF quote</strong></MoveDot>
                    <MoveDot><strong>AI flags ambiguous elements → estimator reviews flagged items → approved estimate with auditable change log</strong></MoveDot>
                  </Move>

                  <div style={{ borderTop: "1px solid rgba(234,88,12,0.15)", margin: "4px 0 32px" }} />

                  <Move num={3} title="Publish one rigorous customer case study with measurable, named outcomes" why="Specific numbers get cited; testimonials without numbers don't">
                    <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>Togal.AI&apos;s Coastal Construction case study reports 14.5 hours saved per plan set and ~$1M first-year savings. LLMs retrieve and cite those numbers. A generic &ldquo;our clients love us&rdquo; testimonial produces zero LLM mentions. What a high-impact EstiMate case study looks like:</p>
                    <MoveDot>Named company (with permission), named state, named trade type — e.g. &ldquo;Coastal Homes, Queensland residential builder&rdquo;</MoveDot>
                    <MoveDot>Before state: X hours per estimate, Y estimates per month — After state: A hours per estimate, B estimates per month</MoveDot>
                    <MoveDot>Specific plan types tested — e.g. &ldquo;double-storey residential, 280m²&rdquo;</MoveDot>
                    <MoveDot>A direct quote from the estimator with their name attached</MoveDot>
                  </Move>

                  <div style={{ borderTop: "1px solid rgba(234,88,12,0.15)", margin: "4px 0 32px" }} />

                  <Move num={4} title="Name every integration and file format explicitly — create a dedicated /integrations page" why="LLMs associate your product with named tools; vague language produces no associations">
                    <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>When a builder asks &ldquo;does EstiMate integrate with Xero?&rdquo; — the LLM can only answer from what&apos;s documented publicly. &ldquo;Connects to your existing software&rdquo; produces no answer. &ldquo;Accepts PDF, DWG, and JPG drawings; exports to Excel, CSV, and Xero via direct API&rdquo; produces a confident yes.</p>
                    <MoveDot>List every accepted file format with the extension: <strong>.pdf, .dwg, .dxf, .jpg, .png</strong> (or whatever is accurate)</MoveDot>
                    <MoveDot>Name every integration: <strong>Xero, MYOB, Buildxact, Procore</strong> — each named integration expands what LLMs associate EstiMate with</MoveDot>
                    <MoveDot>Create a dedicated <code style={{ fontSize: 12 }}>/integrations</code> page with each integration as a named section — Buildr does this with Procore</MoveDot>
                  </Move>

                  <div style={{ borderTop: "1px solid rgba(234,88,12,0.15)", margin: "4px 0 32px" }} />

                  <Move num={5} title="Publish AU-specific estimating content that neither Togal.AI nor Buildr publishes" why="Own the geography gap — LLMs will associate 'AU construction estimating AI' with whoever fills this vacuum">
                    <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>Five pages that will be retrieved for the most common AU buyer queries:</p>
                    <MoveDot><em>&ldquo;AI estimating software for Australian builders 2026&rdquo;</em> — the primary buyer-intent keyword in AU</MoveDot>
                    <MoveDot><em>&ldquo;How to estimate a residential new build in Australia with AI&rdquo;</em> — captures the most common AU residential workflow</MoveDot>
                    <MoveDot><em>&ldquo;Rawlinsons rates vs AI estimating — accuracy comparison&rdquo;</em> — AU-specific proof content for any pricing accuracy question</MoveDot>
                    <MoveDot><em>&ldquo;AI takeoff for Australian architectural drawings&rdquo;</em> — captures the AU-specific plan-reading query</MoveDot>
                    <MoveDot><em>&ldquo;EstiMate AI vs Buildxact — which is better for AU residential builders?&rdquo;</em> — the comparison page for the most LLM-mentioned AU competitor</MoveDot>
                  </Move>

                  <div style={{ borderTop: "1px solid rgba(234,88,12,0.15)", margin: "4px 0 32px" }} />

                  <Move num={6} title="Seed a verified G2 or Capterra profile with real review text — not just star ratings" why="LLMs retrieve review text verbatim; star ratings produce no retrieval signal">
                    <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>Togal.AI&apos;s G2 reviews are retrievable — LLMs can cite specific reviewer quotes. EstiMate currently has no equivalent third-party text for LLMs to retrieve. Ask your first 3–5 customers to leave a review with specific detail:</p>
                    <MoveDot>What they did before EstiMate, what they do now, how long an estimate takes — specific before/after numbers</MoveDot>
                    <MoveDot>The trade category (residential, commercial, subcontract) and plan types they used</MoveDot>
                    <MoveDot>One honest critical review builds more LLM trust than five generic five-star reviews — LLMs weight balanced signals</MoveDot>
                  </Move>
                </div>
              </div>

            </Section>
          </>
        );
      })()}

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
