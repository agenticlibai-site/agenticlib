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
function Section({ title, subtitle, titleSize, children }: { title: string; subtitle?: string; titleSize?: number; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "1px solid rgba(0,0,0,0.07)",
      padding: "24px 28px", marginBottom: 20,
    }}>
      <div style={{ marginBottom: subtitle ? 4 : 18 }}>
        <h2 style={{ fontSize: titleSize ?? 16, fontWeight: 700, color: "#000", margin: 0 }}>{title}</h2>
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
          EstiMate, Togal.AI &amp; Buildr are pinned in coverage charts — they appear near-zero because LLMs rarely surface AI-native agents unprompted. EstiMate was mentioned twice in the Residential New Build use case cluster, both times by Claude Haiku (Aug 31 &amp; Sep 1), at position 13 — triggered by prompts asking <em>&ldquo;What estimating software do Australian residential builders use?&rdquo;</em> and <em>&ldquo;What tools do Australian house builders use to price new home builds?&rdquo;</em>
        </p>
      </div>

      {/* ── Product Feature Improvement Opportunities ───────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 14px" }}>
          Product Feature Improvement Opportunities
        </h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>

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
              A builder does a site measure, walks the job, and knows exactly what it takes. The missing step is getting that knowledge into an estimate without sitting at a desk. An AI that listens to a voice note describing the scope — &ldquo;three bedrooms, double brick extension, new slab, 120 square metres&rdquo; — and generates a structured line-item estimate automatically would eliminate the desk-time bottleneck entirely. This extends the AI estimation paradigm to the first moment of pricing, before any plans exist, which is where most residential builders actually start.
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
                3. Subcontractor Quote Request &amp; Comparison Automation
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

      {/* ── Use Case Expansion Clusters ──────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Potential Use Case Clusters to Expand Into
        </h2>
        <p style={{ fontSize: 13, color: "#000", margin: "0 0 14px" }}>
          Based on EstiMate&apos;s current product positioning, AU market data, and gaps in the locked-brand competitor set. Each cluster below is: (1) unowned by any AI-native AU estimating tool, (2) consistent with EstiMate&apos;s existing capabilities, and (3) a distinct LLM retrieval surface with its own query type.
        </p>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>

          <div style={{
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #EA580C",
            borderRadius: "0 12px 12px 0", padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>Residential Renovations &amp; Extensions</p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#EA580C",
                background: "rgba(234,88,12,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>Highest priority</span>
            </div>
            <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65, margin: "0 0 10px" }}>
              Extensions, renovations, and additions are the most common residential building job type in Australia — higher volume than new builds, but harder to estimate because scope varies widely and plans are often incomplete or in alteration. EstiMate already lists extensions and renovations on its services page and completed a 3-minute-53-second additions/alterations estimate as its public product demo. <strong>No AI estimating tool has built a dedicated content cluster, landing page, or positioning around this specific job type for the AU market.</strong>
            </p>
            <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65, margin: "0 0 10px" }}>
              Prompts EstiMate could own: <em>&ldquo;How do I estimate a home renovation in Australia?&rdquo;</em>, <em>&ldquo;What software do Australian builders use to price extensions?&rdquo;</em>, <em>&ldquo;AI estimating for house additions Australia.&rdquo;</em>
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>No AU AI-native competitor active in this cluster.</span>
            </div>
          </div>

          <div style={{
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #7C3AED",
            borderRadius: "0 12px 12px 0", padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>Pre-Design Budget Estimates (No Plans Yet)</p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#7C3AED",
                background: "rgba(124,58,237,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>Early-funnel</span>
            </div>
            <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65, margin: "0 0 10px" }}>
              Most AU residential builders need a rough budget estimate before commissioning plans — to quote on a prospective job, assess feasibility, or give a client a ballpark. This is the first moment of pricing and it happens entirely without plans. EstiMate&apos;s Startmate roadmap explicitly names this expansion (budgeting, procurement, project intelligence). A voice-to-scope or brief-to-estimate feature would make EstiMate the only AI tool present at the start of the job lifecycle, not just the plan-reading stage.
            </p>
            <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65, margin: "0 0 10px" }}>
              Prompts EstiMate could own: <em>&ldquo;How much does a 3-bedroom extension cost in Melbourne?&rdquo;</em>, <em>&ldquo;Rough cost estimate for a double-storey addition NSW&rdquo;</em>, <em>&ldquo;Feasibility cost for home renovation before getting plans drawn.&rdquo;</em>
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>Partial in adjacent space:</span>
              {["HiPages (cost guides only)", "Archicentre (professional fee only)"].map((b) => (
                <span key={b} style={{ fontSize: 12, color: "#000", background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 8px" }}>{b}</span>
              ))}
            </div>
          </div>

          <div style={{
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #059669",
            borderRadius: "0 12px 12px 0", padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>Spec &amp; Finishes Pricing (Volume &amp; Custom Builders)</p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#059669",
                background: "rgba(5,150,105,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>Product depth</span>
            </div>
            <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65, margin: "0 0 10px" }}>
              Volume and custom home builders in Australia spend significant estimating time on finishes schedules — tiles, fixtures, joinery, appliances, fittings. These are highly variable, client-driven, and rarely covered by standard estimating tools. The Residential New Build cluster prompts — <em>&ldquo;What platforms are popular with Australian volume and custom home builders?&rdquo;</em> — are exactly the query type where EstiMate appeared at position 13. Dedicated finishes-schedule capability and content about this specific workflow would move EstiMate up from position 13 to position 3–5 in these responses.
            </p>
            <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65, margin: "0 0 10px" }}>
              Prompts EstiMate could own: <em>&ldquo;How do custom home builders in Australia estimate finishes and selections?&rdquo;</em>, <em>&ldquo;AI tool for volume builder finishes schedule pricing AU.&rdquo;</em>
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>No AU AI-native competitor addressing this specifically.</span>
            </div>
          </div>

        </div>
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
          EstiMate, Togal.AI &amp; Buildr are pinned — they appear near‑zero because LLMs rarely surface AI-native agents unprompted.
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
                  const ALWAYS_SHOW_BRANDS = new Set(["EstiMate", "Togal.AI", "Buildr"]);
                  const allSortedRows = clusterScores
                    .filter((s) => s.feature_id === feature.feature_id && s.score_band !== "not_documented")
                    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
                  const top3Names = new Set(allSortedRows.slice(0, 3).map(r => r.brand_name));
                  const featureRows = allSortedRows.filter(r => top3Names.has(r.brand_name) || ALWAYS_SHOW_BRANDS.has(r.brand_name));
                  if (featureRows.length === 0) return null;
                  const r5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

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
                          const score   = r5(row.score ?? 0);
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
                                  fontSize: 13, color: "#000", lineHeight: 1.7,
                                  margin: "5px 0 0", paddingLeft: 172,
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
            title="Buyer-Intent Insights"
            titleSize={22}
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
              <div>
                <p style={{ fontSize: 13, color: "#000", lineHeight: 1.65, margin: "0 0 8px" }}>
                  <strong>EstiMate surfaces in {estimateMentions} out of ~{totalMentions} buyer-intent LLM responses.</strong>{" "}
                  When a builder asks AI which estimating software to invest in, traditional tools dominate the recommendations.
                </p>
                <p style={{ fontSize: 12.5, color: "#000", lineHeight: 1.65, margin: 0 }}>
                  <strong>Which prompt triggered EstiMate&apos;s mention:</strong> GPT-4o-mini mentioned EstiMate once, most likely on Prompt 3 — <em>&ldquo;Which AI estimating tool is worth paying for as an Australian builder in 2025, and what are the alternatives?&rdquo;</em> — which explicitly asks for AI-native tools. Claude Haiku did not mention EstiMate in any of the three buyer-intent prompts.
                </p>
              </div>
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
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: "#000", opacity: 0.45, marginTop: 16 }}>
              Mentions = total times brand appeared across 3 prompts × 4 model runs (Claude Haiku + GPT-4o-mini, 2 collection dates).
            </p>
          </Section>
        );
      })()}

      {/* ── AI Estimating Market Validation ──────────────────────────────── */}
      <Section title="AI Estimating Market Validation" subtitle="Is the category real? 10-signal independent assessment of Togal.AI and Buildr — research by Parallel.ai, Sep 2026">
        {(() => {
          const Badge = ({ level }: { level: "strong" | "mixed" | "weak" | "none" }) => {
            const map = {
              strong: { label: "Strong signal", bg: "#dcfce7", color: "#15803d" },
              mixed:  { label: "Mixed signal",  bg: "#fef9c3", color: "#a16207" },
              weak:   { label: "Weak signal",   bg: "#fee2e2", color: "#b91c1c" },
              none:   { label: "Insufficient data", bg: "#f3f4f6", color: "#6b7280" },
            }[level];
            return (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: map.bg, color: map.color, whiteSpace: "nowrap" as const }}>
                {map.label}
              </span>
            );
          };

          const signals: Array<{
            id: string;
            label: string;
            icon: string;
            togal: { badge: "strong" | "mixed" | "weak" | "none"; text: string };
            buildr: { badge: "strong" | "mixed" | "weak" | "none"; text: string };
          }> = [
            {
              id: "funding",
              label: "Funding",
              icon: "💰",
              togal: {
                badge: "strong",
                text: "$17.23M total disclosed across 5 rounds (2019–2023). Latest: $5M pre-Series A SAFE, March 2023, $50M valuation cap, led by Florida Funders with participation from Meta and Goldman Sachs executives. Use of funds not stated publicly.",
              },
              buildr: {
                badge: "weak",
                text: "One $100K entry on a third-party funding database (Signalbase, March 2026). Not confirmed by Tracxn, Crunchbase, or Caplight. No press release or investor names found. Treat as a low-confidence signal only.",
              },
            },
            {
              id: "hiring",
              label: "Hiring & Headcount",
              icon: "👥",
              togal: {
                badge: "strong",
                text: "7 open roles on Ashby: Customer Success Manager, Product Specialist, Senior PM (trades), Business Development Rep, Enterprise Campaign Manager, AI QA, security leadership. ~65–71 employees. Mix signals commercial scaling, not just product build.",
              },
              buildr: {
                badge: "mixed",
                text: "No current openings on Gusto careers page. However, headcount grew from 7 employees (2021) → 24 (2024) → ~35 on LinkedIn. May be in a hiring pause or using referral/private channels. Historical growth is real; current momentum is unclear.",
              },
            },
            {
              id: "pain",
              label: "Status-Quo Pain",
              icon: "🔥",
              togal: {
                badge: "strong",
                text: "Reddit r/estimators documents PlanSwift lagging badly on large PDFs/DWG files. Bluebeam users cite cumbersome interface, crashes on large files, high cost. Togal directly addresses this with OST comparison study and explicit legacy-tool messaging. The problem is real and well-documented.",
              },
              buildr: {
                badge: "mixed",
                text: "Buildr positions against 'disconnected preconstruction workflows' and spreadsheets broadly — less tool-specific than Togal's messaging. The underlying pain (fragmented data across estimating, CRM, and bids) is real for GCs but the complaint volume is lower in public forums.",
              },
            },
            {
              id: "community",
              label: "Community Pull",
              icon: "💬",
              togal: {
                badge: "strong",
                text: "Reddit r/Construction and r/estimators threads explicitly discuss AI takeoff tools and name Togal, Kreo, Attentive.ai, Beam AI, SnapAI, and others. Users discuss time savings and accuracy verification needs. The conversation has moved from 'should AI be used?' to 'which AI tool?'",
              },
              buildr: {
                badge: "mixed",
                text: "Category-level AI estimating conversation is active, but Buildr is named less frequently than Togal in community searches. Their workflow-level positioning is less visible in forums focused on takeoff and estimating software specifically.",
              },
            },
            {
              id: "partnerships",
              label: "Partnerships & Integrations",
              icon: "🔗",
              togal: {
                badge: "strong",
                text: "ServiceTitan integration named in help centre. Ediphi native integration documented with a full workflow: Togal quantities → Ediphi catalog mapping → audit trail. Stevens Construction named as a joint customer. Ediphi announcement confirmed May 2026.",
              },
              buildr: {
                badge: "mixed",
                text: "Procore integration confirmed with dedicated help-centre documentation. Homepage names HubSpot, Unanet, Sage Estimating, PlanSwift, Bridgit Bench. However, no dated partnership announcement was found and no joint-customer evidence was surfaced.",
              },
            },
            {
              id: "customers",
              label: "Customer Growth",
              icon: "📈",
              togal: {
                badge: "mixed",
                text: "13+ named case study cards spanning GCs, specialty trades, education, and international markets. 4.8/5 rating across 60 reviews. Quantified outcomes: $1M savings (Coastal), 76% faster (UKansas), 80% faster (UrbanCore). Case-study publication cadence not provable from available dates.",
              },
              buildr: {
                badge: "mixed",
                text: "17+ named GC customers including Mint, Rycon, Magil, Lee Lewis, EE Reed, CoreBuilt. WPC case study is detailed with revenue and productivity claims. Strong breadth but, like Togal, publication cadence cannot be established from available evidence.",
              },
            },
            {
              id: "press",
              label: "Press Momentum",
              icon: "📰",
              togal: {
                badge: "mixed",
                text: "Philadelphia Inquirer article confirmed August 11, 2026 (most recent 6-month window). Media page lists Bloomberg, Fox Weather, South Florida Business Journal, Walls & Ceilings, Design and Build UK — but without verified publication dates. Direction: increasing from a low base.",
              },
              buildr: {
                badge: "weak",
                text: "No independently dated press articles surfaced in either 6-month window (Mar–Sep 2026 or Sep 2025–Mar 2026). Visible coverage is owned content only. Buildr's momentum appears concentrated in product, customer, and integration materials rather than independent media.",
              },
            },
            {
              id: "analyst",
              label: "Analyst & Industry Recognition",
              icon: "🏆",
              togal: {
                badge: "strong",
                text: "Named in BuiltWorlds '40 AI-Driven AEC Solutions to Watch in 2026' (published Jan 21, 2026) — an industry-curated list, not a self-reported claim. Patrick Murphy (founder) confirmed keynote speaker at Smart Cities Conference 2026.",
              },
              buildr: {
                badge: "none",
                text: "No equivalent appearance found in the sampled corpus of industry reports or roundups. This is absence from the sampled sources, not proof of non-existence — but Togal's institutional visibility is materially stronger.",
              },
            },
            {
              id: "newentrants",
              label: "New Entrant Activity",
              icon: "🚀",
              togal: {
                badge: "strong",
                text: "Category-level signal: Bobyard raised $35M Series A (Dec 2025) and expanded into drywall, electrical, HVAC, plumbing. Fresco (YC F24) backed by SignalFire and Bessemer, reports 140% MoM growth. OpenTakeoff launched on Hacker News as open-source. ScoutOut on Product Hunt. Capital and developers are both entering the space.",
              },
              buildr: {
                badge: "strong",
                text: "Same category signal applies — the new entrants validate the market Buildr operates in. Bobyard's $35M round in particular shows institutional capital is betting on AI taking over the estimating workflow. Competition increasing = category is real.",
              },
            },
            {
              id: "conference",
              label: "Conference & Trade Presence",
              icon: "🎤",
              togal: {
                badge: "mixed",
                text: "Patrick Murphy confirmed keynote at Smart Cities Conference 2026. Togal's news page lists other media appearances. No verified major construction trade show exhibit (e.g. World of Concrete, AGC) found in reviewed evidence.",
              },
              buildr: {
                badge: "none",
                text: "No exhibitor or speaker listing surfaced in conference searches. This may reflect a private sales motion or lower event investment, not necessarily weak market position — but it limits independent visibility.",
              },
            },
          ];

          return (
            <div>
              {/* Category verdict callout */}
              <div style={{ background: "rgba(21,128,61,0.06)", border: "1px solid rgba(21,128,61,0.2)", borderRadius: 10, padding: "16px 20px", marginBottom: 28, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>✅</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d", marginBottom: 4 }}>Verdict: Genuine and growing market</div>
                  <p style={{ fontSize: 13, color: "#000", lineHeight: 1.65, margin: 0 }}>
                    Across all 10 signal types, AI construction estimating shows the markers of a real category: funded companies, documented customer outcomes, active community discussion, new venture-backed entrants, and named integrations. <strong>Togal.AI is the stronger commercial scaling signal</strong> — more funding, more hiring, more press, and analyst recognition. <strong>Buildr validates through headcount growth and customer breadth</strong> but is less publicly documented. The combined evidence supports category confidence. The caveat: customer-side verification of AI takeoff accuracy on real-world plan complexity is still the missing piece of the investment thesis.
                  </p>
                </div>
              </div>

              {/* Signal rows */}
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
                {signals.map((sig, i) => (
                  <div key={sig.id} style={{
                    display: "grid", gridTemplateColumns: "140px 1fr 1fr",
                    gap: 0, borderBottom: i < signals.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                    padding: "20px 0",
                  }}>
                    {/* Signal label */}
                    <div style={{ paddingRight: 16 }}>
                      <div style={{ fontSize: 15, marginBottom: 4 }}>{sig.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#000", lineHeight: 1.3 }}>{sig.label}</div>
                    </div>
                    {/* Togal column */}
                    <div style={{ paddingRight: 20, borderRight: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB" }}>Togal.AI</span>
                        <Badge level={sig.togal.badge} />
                      </div>
                      <p style={{ fontSize: 12.5, color: "#000", lineHeight: 1.65, margin: 0 }}>{sig.togal.text}</p>
                    </div>
                    {/* Buildr column */}
                    <div style={{ paddingLeft: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>Buildr</span>
                        <Badge level={sig.buildr.badge} />
                      </div>
                      <p style={{ fontSize: 12.5, color: "#000", lineHeight: 1.65, margin: 0 }}>{sig.buildr.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* What this means for EstiMate */}
              <div style={{ background: "rgba(234,88,12,0.05)", border: "1px solid rgba(234,88,12,0.15)", borderRadius: 10, padding: "18px 20px", marginTop: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "#EA580C", marginBottom: 8 }}>What this means for EstiMate AI</div>
                <p style={{ fontSize: 13, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>
                  The AI construction estimating category is real, growing, and attracting capital — but it is still early. Togal.AI and Buildr have spent 3–4 years building LLM visibility through content, case studies, and integrations. EstiMate AI is entering a validated market, not a speculative one.
                </p>
                <p style={{ fontSize: 13, color: "#000", lineHeight: 1.7, margin: 0 }}>
                  The gap EstiMate can exploit: <strong>neither Togal nor Buildr publishes Australia-specific content, pricing, or customer stories.</strong> Every AU builder using an LLM to research estimating software today gets a US-framed answer. EstiMate can own this space completely — and the playbook for how to do it is laid out in the section below.
                </p>
              </div>
            </div>
          );
        })()}
      </Section>

      {/* ── LLM Visibility Playbook ───────────────────────────────────────── */}
      {(() => {
        const Cite = ({ children }: { children: React.ReactNode }) => {
          const text = typeof children === "string" ? children : "";
          const firstToken = text.split(/[\s;]/)[0];
          const looksLikeUrl = firstToken.includes(".") && /^[a-zA-Z0-9]/.test(firstToken);
          const href = looksLikeUrl
            ? (firstToken.startsWith("http") ? firstToken : "https://" + firstToken)
            : null;
          const baseStyle: React.CSSProperties = {
            fontFamily: "monospace", fontSize: 11,
            background: "rgba(0,0,0,0.05)", borderRadius: 3, padding: "1px 5px",
            whiteSpace: "nowrap",
          };
          if (href) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer"
                style={{ ...baseStyle, color: "#EA580C", textDecoration: "none", opacity: 0.8 }}>
                {children}
              </a>
            );
          }
          return <span style={{ ...baseStyle, color: "#000", opacity: 0.45 }}>{children}</span>;
        };

        const Dot = ({ children }: { children: React.ReactNode }) => (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ color: "#EA580C", fontSize: 20, lineHeight: "1.45", flexShrink: 0, marginTop: 1, fontWeight: 900 }}>•</span>
            <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65, margin: 0 }}>{children}</p>
          </div>
        );

        const SignalBlock = ({ icon, title, why, explain, children }: { icon: string; title: string; why: string; explain?: string; children: React.ReactNode }) => (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: explain ? 6 : 10 }}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#000" }}>{title}</span>
              <span style={{ fontSize: 12, color: "#000", fontStyle: "italic" }}>— {why}</span>
            </div>
            {explain && <p style={{ fontSize: 12.5, color: "#000", lineHeight: 1.65, margin: "0 0 10px" }}>{explain}</p>}
            {children}
          </div>
        );

        const KeyTakeaway = ({ color, children }: { color: string; children: React.ReactNode }) => (
          <div style={{
            background: `${color}0d`, border: `1px solid ${color}30`,
            borderRadius: 10, padding: "20px 22px", marginTop: 24, marginBottom: 8,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color, marginBottom: 8 }}>Key Takeaway</div>
            <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.7, margin: 0 }}>{children}</p>
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
            borderRadius: "0 6px 6px 0", padding: "12px 16px", margin: "12px 0",
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

                <SubHeading>What they&apos;re doing right</SubHeading>

                <SignalBlock icon="📄" title="Content volume and architecture" why="gives LLMs many retrieval surfaces" explain="The more web pages you have explaining your product, the more chances an AI has to find and cite you. Togal publishes blog posts, case studies, feature pages, comparison pages, and trade-specific pages — so whether a buyer asks 'what is AI takeoff?', 'how do I speed up estimating?', or 'Togal vs PlanSwift?', there is a Togal page an LLM can retrieve and repeat back.">
                  <Dot>27+ visible blog/article cards across a multi-page archive. Content types span proof (case studies), education (blog guides), product mechanism (/features), competitive comparison (/vs/), and trade positioning (/trades) — each layer serves a different LLM retrieval query. <Cite>togal.ai/blog, togal.ai/trades</Cite></Dot>
                  <Dot>13 named case-study cards, each with a dedicated slug URL (<code style={{ fontSize: 12 }}>/case-study/slug</code>). Named customers include Coastal Construction, University of Kansas, UrbanCore, Consigli, Select Painting, Stevens Construction. <Cite>togal.ai/case-studies</Cite></Dot>
                  <Dot>Example titles that signal domain expertise: <em>&ldquo;How to Evaluate Construction Takeoff Software: Estimator&apos;s 8 Checkpoints,&rdquo;</em> <em>&ldquo;Repeating Groups: Stop Taking Off the Same Room Twice,&rdquo;</em> <em>&ldquo;5 Ways AI Takeoffs Can Stop Cash Burn in Construction.&rdquo;</em> <Cite>togal.ai/blog pages 1–3</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="⚙️" title="Mechanism-level product language" why="LLMs retrieve and repeat specific claims, not vague ones" explain="LLMs don't repeat vague promises like 'faster takeoffs.' They repeat specific workflows. Togal describes exactly what you click, what happens next, and what comes out — so when someone asks an AI 'how does Togal work?', the AI has a concrete, step-by-step answer to give. This is the difference between a tool that gets cited and one that gets forgotten.">
                  <Dot><strong>Upload → auto-name → rename:</strong> &ldquo;Upload documents, use Togal&apos;s auto-naming tool, and rename them in seconds.&rdquo; <Cite>togal.ai/features</Cite></Dot>
                  <Dot><strong>Draw bounding box → AI searches plan set → locate and count:</strong> &ldquo;Draw a box around an object, run AI-powered image, text, and pattern search across the plan set, and instantly locate and count it.&rdquo; <Cite>togal.ai/features</Cite></Dot>
                  <Dot><strong>Drawings → automated takeoff → quantities exported:</strong> &ldquo;Hit the green Togal button and let AI handle the repetitive work — then export quantities and classifications to your estimating software or Excel.&rdquo; <Cite>togal.ai/features, togal.ai/blog/how-to-export-information-takeoffs-with-togal-ai</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="🔗" title="Named integrations and file formats" why="LLMs associate your product with named tools in their answers" explain="When a buyer asks their AI assistant 'does this tool connect to Ediphi?' or 'what software works with ServiceTitan?', the AI needs named evidence to give an answer. Togal has documented these integrations publicly — so they appear in answers to integration questions, not just general takeoff questions. Every named connection is an additional retrieval surface.">
                  <Dot><strong>Ediphi — native integration:</strong> &ldquo;Togal.AI and Ediphi built a native integration&rdquo; with quantities flowing directly to Ediphi&apos;s estimating environment. <Cite>togal.ai/blog/ediphi-togal-integration-techstack; Ediphi Instagram, Aug 5 2026</Cite></Dot>
                  <Dot><strong>ServiceTitan</strong> — named in the help centre. <strong>Zebel</strong> — named in the UrbanCore case study with quantities flowing into Zebel for pricing estimates. <Cite>help.togal.ai; togal.ai/case-study/urbancore-case-study-togal-ai-zebel-integration</Cite></Dot>
                  <Dot>File inputs explicitly named: <strong>PDF, CAD file, image</strong> (and in a separate article: PDFs, CAD exports, scanned images). Outputs: <strong>Excel and PDF</strong> confirmed. Note — Bluebeam and Procore integration were not found in reviewed official pages. <Cite>Parallel.ai research, Sep 2026</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="⚔️" title="Competitor comparison content" why="when a buyer asks 'Togal vs PlanSwift,' LLMs retrieve this page" explain="When a buyer has already shortlisted tools and types 'Togal vs PlanSwift' into an AI, they are very close to buying. Togal has a dedicated comparison page and a peer-reviewed university study that directly addresses this query. The AI retrieves it and Togal becomes the recommended answer — not just a brand on a general list.">
                  <Dot>Dedicated <code style={{ fontSize: 12 }}>/vs/planswift</code> page: &ldquo;Togal.AI vs PlanSwift — which takeoff software is best?&rdquo; — directly named comparison. <Cite>togal.ai/vs/planswift</Cite></Dot>
                  <Dot>University of Kansas comparative study naming On-Screen Takeoff (OST): ~70% time savings, accuracy within 5% of OST — a peer-reviewed study that answers the query &ldquo;Togal vs OST.&rdquo; <Cite>togal.ai/case-study/peer-reviewed-study-togal-ai-vs-on-screen-takeoff</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="📐" title="Named proof with measurable outcomes" why="specific numbers get cited; vague claims don't" explain="AIs don't cite vague testimonials. They cite specific numbers: '$1M savings at Coastal Construction', '76% time reduction at University of Kansas', '80% faster at UrbanCore'. Togal's case studies give LLMs concrete facts to repeat, turning real customer outcomes into an always-on sales conversation happening inside AI tools — every time a buyer asks an AI for recommendations.">
                  <Dot>Coastal Construction (Miami): takeoff time reduced from 50% to 10%, 14.5 hours saved per plan set, 1,160 hrs/month, <strong>~$1M first-year savings</strong>, accuracy 97%→98%. <Cite>togal.ai/case-study/coastal-construction-case-study</Cite></Dot>
                  <Dot>University of Kansas: <strong>76% time savings</strong> on Fire Station case; 71.03% average across two case studies; accuracy within 5% of OST. <Cite>togal.ai/case-study/ku-study-togal-vs-ost</Cite></Dot>
                  <Dot>UrbanCore: takeoffs &ldquo;up to 80% faster&rdquo;; new interns proficient &ldquo;in weeks.&rdquo; SOC 2 Type II certification confirmed independently. <Cite>togal.ai/case-study/urbancore; togal.ai/news</Cite></Dot>
                </SignalBlock>

                <PullQuote color="#2563EB" text="I love how Togal.AI organizes all our items in one easy-to-access software in the browser, which makes takeoffs effortless and super easy to get started." attr="Chris V., G2 · g2.com/products/togal-ai/reviews" />
                <PullQuote color="#2563EB" text="The automated button is really only used for simple counts on a floor plan, so it doesn't really apply to masonry specifically." attr="Scott G. (critical), G2 · g2.com/products/togal-ai/reviews" />

                <KeyTakeaway color="#2563EB">
                  Togal.AI built LLM visibility by becoming the most documented tool in the AI takeoff category. They published 27+ articles, 13 named case studies with exact dollar and time savings, a peer-reviewed university study, and comparison pages against legacy competitors like PlanSwift and On-Screen Takeoff. The strategy is straightforward: give AI models so much evidence about your product that they can&apos;t help but cite you. Togal didn&apos;t wait for press coverage — they manufactured their own retrievable proof, page by page.
                </KeyTakeaway>
              </CaseStudy>

              {/* ── CASE STUDY 2: BUILDR ──────────────────────────────── */}
              <CaseStudy color="#059669" number="Case Study 2" name="Buildr" subtitle="buildr.com — US/Canada GC market, AI-powered preconstruction workspace">

                <SubHeading>What they&apos;re doing right</SubHeading>

                <SignalBlock icon="🏗️" title="Platform-level positioning" why="LLMs name platforms more reliably than single-feature tools" explain="LLMs are asked many different questions: 'what's the best AI estimating tool?', 'how do GCs manage bids?', 'what software handles preconstruction?'. Buildr positions itself as the answer to all of these at once — one connected workspace for estimating, CRM, takeoff, and bid management. This means any buyer question about GC preconstruction has a chance of surfacing Buildr, whereas a single-feature tool only appears when someone asks about that specific feature.">
                  <Dot>Homepage: <em>&ldquo;The unified workspace for preconstruction&rdquo;</em> and <em>&ldquo;AI-powered preconstruction for general contractors.&rdquo;</em> Estimating, takeoff, CRM, bid leveling, and pipeline are all one product — so multiple LLM query types retrieve the same brand. <Cite>buildr.com</Cite></Dot>
                  <Dot>March 2026 blog post frames AI beyond estimating: business development intelligence, workforce capacity, pursuit economics, and pipeline health — each phrase captures a different LLM query. <Cite>buildr.com/blog/ai-beyond-estimating-bd-workforce-pipeline</Cite></Dot>
                  <Dot>A dedicated library page defines &ldquo;AI Agent in Construction&rdquo; — educational content LLMs retrieve when users ask what AI means for their industry. <Cite>buildr.com/library/ai-agent</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="🗂️" title="Layered URL architecture" why="separate pages for each use case = more retrieval surfaces" explain="Search engines and AI models treat each URL as an independent piece of evidence. Buildr has separate pages for estimating, AI takeoff, and comparisons with Autodesk, Cosential, and spreadsheets, plus a growing blog archive. Each page is an independent signal LLMs can retrieve independently. More pages covering more buyer questions equals more chances to appear in AI-generated answers.">
                  <Dot><code style={{ fontSize: 12 }}>/estimating</code> — AI construction estimating for GCs; <code style={{ fontSize: 12 }}>/library/ai-takeoff</code> — mechanism-level AI takeoff explainer, published Aug 28 2026; <code style={{ fontSize: 12 }}>/vs/autodesk</code>, <code style={{ fontSize: 12 }}>/vs/cosential</code>, <code style={{ fontSize: 12 }}>/vs/spreadsheets</code> — three comparison pages each capturing a different competitive query. <Cite>buildr.com</Cite></Dot>
                  <Dot>Long-form content with dates: AI Construction GC Guide (Feb 20, 2026), AI Beyond Estimating (Mar 9, 2026), Construction Estimating Software guide (Apr 8, 2026), AI Takeoff library page (Aug 28, 2026). <Cite>buildr.com/blog</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="⚙️" title="Mechanism-level product language" why="three confirmed input→process→output descriptions" explain="Same principle as Togal: LLMs remember and repeat specific workflows, not general claims. Buildr describes what files go in, what the AI does to them, and what comes out — so when a buyer asks an AI 'how does AI construction estimating actually work?', Buildr has a concrete, step-by-step answer ready to be cited.">
                  <Dot><strong>Estimate assembly:</strong> Kit turns &ldquo;budgets, spreadsheets, markups, and project files&rdquo; into &ldquo;a structured Buildr budget&rdquo; ready for review. <Cite>buildr.com/estimating</Cite></Dot>
                  <Dot><strong>Bid-day handoff:</strong> Approved budget lines become bid packages; users compare &ldquo;gaps, risks, and alternates.&rdquo; <Cite>buildr.com/estimating</Cite></Dot>
                  <Dot><strong>AI takeoff:</strong> AI reads construction drawings, classifies sheets, detects building elements, cross-references schedules and specifications, rolls up quantities, and presents for human review. <Cite>buildr.com/library/ai-takeoff</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="🔗" title="Named integration ecosystem" why="named tools increase chances of appearing in integration-related queries" explain="Buildr names the tools their GC customers already use: Procore for project management, HubSpot for CRM, Sage and PlanSwift for estimating, Bridgit Bench for workforce planning. When a buyer asks an AI 'does this tool work with Procore?' or 'what connects to HubSpot?', Buildr appears in the answer. Named tools aren't just features — they're search queries that Buildr now has a presence in.">
                  <Dot><strong>Procore</strong> confirmed — dedicated help-centre collection titled &ldquo;Procore ⟷ Buildr Integration&rdquo; covering what is synced, best practices, and accessing Buildr inside a Procore account. <Cite>help.buildrtech.com/en/collections/2882875-procore-buildr-integration</Cite></Dot>
                  <Dot>Homepage names tools by workflow group: <em>HubSpot · Unanet · Dynamics</em> (CRM), <em>Sage Estimating · Destini · PlanSwift · Excel</em> (estimating), <em>InDesign · Word</em> (proposals), <em>Bridgit Bench</em> (workforce). <Cite>buildr.com</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="⚔️" title="Direct competitor naming" why="captures buyers in active switching evaluation" explain="Buyers who are actively considering switching will ask their AI 'is there an alternative to Autodesk for preconstruction?' or 'what's better than spreadsheets for GC bids?'. Buildr has dedicated pages that answer both of these questions directly, framing themselves as the modern solution to frustrations buyers are already looking to escape.">
                  <Dot>vs Autodesk: <em>&ldquo;Buildr is an Autodesk alternative built specifically for preconstruction&rdquo;</em> — frames Buildr as taking the &ldquo;opposite path.&rdquo; <Cite>buildr.com/vs/autodesk</Cite></Dot>
                  <Dot>vs Cosential: direct comparison for GC preconstruction. vs Spreadsheets: <em>&ldquo;Spreadsheets are a tool. Buildr is a system.&rdquo;</em> <Cite>buildr.com/vs/cosential; buildr.com/vs/spreadsheets</Cite></Dot>
                </SignalBlock>

                <SignalBlock icon="📊" title="Named customer proof with measurable outcomes" why="self-reported but specific — LLMs cite named outcomes" explain="When an AI assistant recommends a product, it often backs that recommendation with customer examples. Buildr's WPC case study gives LLMs a specific story to tell: 3-4x more monthly pursuits, 5x communication efficiency, doubled revenue. Combined with 17+ named GC customers, an AI can say 'companies like Rycon, Lee Lewis, and Magil Construction use Buildr' — which sounds like a credible, researched recommendation rather than a generic mention.">
                  <Dot>WPC (Central Florida GC, building with Buildr since Dec 2021): <em>&ldquo;Our internal communications are 5x more efficient.&rdquo;</em> <Cite>buildr.com/customers/wpc</Cite></Dot>
                  <Dot>WPC: <em>&ldquo;We easily increased our monthly pursuits 3–4x without increasing headcount.&rdquo;</em> Previous tool: Cosential by Unanet — a specific named competitor switch. <Cite>buildr.com/customers</Cite></Dot>
                  <Dot>Named customer roster: Mint Construction, Biltmore Construction, Rycon Construction, CoreBuilt, Magil Construction, EE Reed, Conlon, Lee Lewis, KPRS, SC Builders, Stout — breadth of named GCs strengthens the association between &ldquo;GC&rdquo; and &ldquo;Buildr.&rdquo; <Cite>buildr.com/customers</Cite></Dot>
                </SignalBlock>

                <PullQuote color="#059669" text="Buildr gives me one source of truth for customer relations, helps expedite estimating on projects, and tracks project budgets effectively." attr="G2 review · g2.com/products/buildr/reviews" />
                <PullQuote color="#059669" text="There are a few small improvements that could be made to the estimating tool that would make a big impact on its usability and efficiencies." attr="G2 review (critical) · g2.com/products/buildr/reviews" />

                <KeyTakeaway color="#059669">
                  Buildr built LLM visibility by positioning broader than their competitors. While Togal owns &ldquo;AI takeoff&rdquo;, Buildr claims &ldquo;everything that happens before a GC breaks ground.&rdquo; This platform-level positioning means any buyer question about preconstruction — estimating, bid management, CRM, workforce — has a chance of surfacing Buildr. Combined with 17+ named customer references, a deep Procore integration, and comparison pages against Autodesk and spreadsheets, Buildr shows up across a wider range of AI queries. The lesson: owning a broader category gives you more retrieval surfaces, even with less total content than Togal.
                </KeyTakeaway>
              </CaseStudy>

              {/* ── RECOMMENDED MOVES FOR ESTIMATE AI ─────────────────── */}
              <div style={{ background: "rgba(234,88,12,0.05)", border: "1px solid rgba(234,88,12,0.15)", borderRadius: 12, padding: "32px 32px 36px", marginTop: 8 }}>
                <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#EA580C", marginBottom: 6 }}>EstiMate AI</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#000", letterSpacing: "-0.02em", marginBottom: 8 }}>Recommended Moves to Build LLM Visibility</div>
                <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.7, margin: "0 0 16px" }}>
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

    </div>
  );
}
