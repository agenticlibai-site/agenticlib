"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type { SOVRow, FeatureScoreRow, DexifyClusterRow } from "@/lib/brand-visibility/db";
import type { UseCaseBucketBrandRow } from "@/lib/skincare-visibility/db";

interface FeatureDef {
  feature_id:   string;
  feature_tag:  string;
  feature_name: string;
  feature_desc?: string; // 1-2 sentence definition shown below the heading
}

interface DomainConfig {
  id:     string;
  label:  string;
  color:  string;
  bg:     string;
  rgb:    string;
  locked?: boolean;
}

const DOMAINS: DomainConfig[] = [
  { id: "marketing", label: "Marketing AI", color: "#7C3AED", bg: "rgba(124,58,237,0.09)",  rgb: "124,58,237"              },
  { id: "sales",     label: "Sales AI",     color: "#2563EB", bg: "rgba(37,99,235,0.09)",   rgb: "37,99,235",  locked: true },
  { id: "dexify",    label: "Tradie AI",    color: "#EA580C", bg: "rgba(234,88,12,0.09)",   rgb: "234,88,12",  locked: true },
  { id: "skincare",  label: "Skincare AI",  color: "#BE185D", bg: "rgba(190,24,93,0.09)",   rgb: "190,24,93",  locked: true },
];

type DomainId = "sales" | "marketing" | "dexify" | "skincare";

const CLUSTERS: Record<DomainId, Record<string, string>> = {
  sales: {
    "sales-call":       "Sales Call Intelligence",
    "sales-crm":        "CRM & Pipeline Automation",
    "sales-pipeline":   "Pipeline Management",
    "sales-outreach":   "Outreach & Sequencing",
    "sales-enablement": "Sales Enablement",
  },
  marketing: {
    "ads":            "Ads Management",
    "content":        "Content Creation",
    "lead-gen":       "Lead Generation",
    "lifecycle":      "Lifecycle & Retention",
    "technical":      "Technical Capabilities",
    "responsible-ai": "Responsible AI",
    "cost":           "Cost Efficiency",
  },
  dexify: {
    "dexify-voice-quote":  "Voice-to-Quote",
    "dexify-post-job":     "Post-Job Admin & Invoicing",
    "dexify-compliance":   "Compliance & Documentation",
    "dexify-client-comms": "Inbound & Client Comms",
  },
  skincare: {
    "routine-audit":        "Routine Audit",
    "personalized-routine": "Personalised Routine",
    "ingredient-analysis":  "Ingredient Analysis",
    "condition-specific":   "Condition-Specific",
    "tracking-progress":    "Tracking Progress",
  },
};

// Descriptions shown at the top of each marketing use-case card,
// written from the perspective of an AI agent builder.
const USE_CASE_DESCRIPTIONS: Record<string, string> = {
  "ads": "AI agents in this space autonomously manage paid media — allocating budget across channels, adjusting bids in real time based on conversion signals, and testing creative variations without human intervention. The best platforms close the loop between audience signal and spend decision entirely through agentic logic.",
  "content": "AI agents here go beyond generation — they research, brief, draft, and optimise content across formats and channels at scale. Evaluate whether the agent can maintain brand voice, adapt tone by audience segment, and feed output directly into publishing or personalisation workflows.",
  "lead-gen": "AI agents in lead generation identify high-intent prospects, enrich contact data, and qualify leads against ICP criteria before any human touches them. The critical signal is whether the agent can act on intent data in real time — not just surface it.",
  "lifecycle": "AI agents in lifecycle and retention orchestrate individualised journeys across the full customer arc — from onboarding sequences to re-engagement and churn prediction. Look for agents that trigger interventions based on behavioural signals, not just time-based rules.",
};

// Tags that belong to cross-cutting capability sections (not use-case clusters).
// These get a sidebar separator + ScoresOnlyCard instead of SalesUseCaseCard.
const CROSS_CUTTING_TAGS: Partial<Record<DomainId, Set<string>>> = {
  marketing: new Set(["technical", "responsible-ai", "cost"]),
};

const SKINCARE_KEYS: Record<string, keyof UseCaseBucketBrandRow> = {
  "routine-audit":        "b1",
  "personalized-routine": "b2",
  "ingredient-analysis":  "b3",
  "condition-specific":   "b4",
  "tracking-progress":    "b5",
};

const CHART_COLORS = ["#2563EB", "#7C3AED", "#EA580C", "#16a34a", "#d97706", "#dc2626", "#BE185D", "#0891b2"];

// Tag palette for unique talking points
// Normalise DB score bands → the four canonical values ScorePill understands
function normalizeBand(band: string): string {
  const map: Record<string, string> = {
    strong: "high", good: "high", excellent: "high", verified: "high", full: "high",
    moderate: "medium", partial: "medium", adequate: "medium",
    weak: "low", limited: "low", poor: "low", minimal: "low",
    undocumented: "not_documented", unknown: "not_documented", none: "not_documented",
  };
  return map[band?.toLowerCase()] ?? band;
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function SalesIcon() {
  // Bar chart + zigzag trend arrow + $ = revenue growth
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {/* Dollar sign */}
      <text x="5.5" y="4.8" fontSize="4.5" fontWeight="700" fill="currentColor" textAnchor="middle">$</text>
      {/* Ascending bars, bottom-aligned */}
      <rect x="1"    y="11.5" width="2.5" height="3.5" rx="0.4" fill="currentColor" opacity="0.75"/>
      <rect x="4.5"  y="9"    width="2.5" height="6"   rx="0.4" fill="currentColor" opacity="0.75"/>
      <rect x="8"    y="6.5"  width="2.5" height="8.5" rx="0.4" fill="currentColor" opacity="0.75"/>
      <rect x="11.5" y="4"    width="2.5" height="11"  rx="0.4" fill="currentColor" opacity="0.75"/>
      {/* Zigzag rising trend line */}
      <path d="M1.5 13L4.5 8.5L8.5 11L14 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Arrow tip */}
      <path d="M12 4L14 4.5L13.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function MarketingIcon() {
  // Funnel — marketing funnel / lead gen stages
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {/* Funnel outline */}
      <path d="M1.5 2.5H14.5L10 9V13.5H6V9L1.5 2.5Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/>
      {/* Stage lines inside funnel */}
      <line x1="3.5" y1="5"   x2="12.5" y2="5"   stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="5"   y1="7.2" x2="11"   y2="7.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}
function TradieIcon() {
  // Wrench / tools
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10.5 2a3.5 3.5 0 0 0-3.4 4.2L2.4 11a1.4 1.4 0 0 0 2 2l4.8-4.7A3.5 3.5 0 0 0 13.7 4l-2 2-1.5-.5-.5-1.5 2-2A3.5 3.5 0 0 0 10.5 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="3.5" cy="12.5" r="0.8" fill="currentColor"/>
    </svg>
  );
}
function SkincareIcon() {
  // Sparkle / leaf
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2c0 0-5 3-5 7a5 5 0 0 0 10 0c0-4-5-7-5-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M8 14V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M8 10c-1-1-2.5-1.5-3-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}
function DomainIcon({ id }: { id: string }) {
  if (id === "sales")     return <SalesIcon />;
  if (id === "marketing") return <MarketingIcon />;
  if (id === "dexify")    return <TradieIcon />;
  return <SkincareIcon />;
}

// ── Score pill ─────────────────────────────────────────────────────────────────

function ScorePill({ band, score, onClick }: { band: string; score: number | null; onClick?: () => void }) {
  const nb = normalizeBand(band);
  const styles: Record<string, { bg: string; color: string }> = {
    high:           { bg: "#16a34a", color: "#fff" },
    medium:         { bg: "#d97706", color: "#fff" },
    low:            { bg: "#dc2626", color: "#fff" },
    not_documented: { bg: "rgba(0,0,0,0.07)", color: "rgba(0,0,0,0.3)" },
  };
  const s = styles[nb] ?? styles.not_documented;
  const baseStyle = {
    display: "inline-block", minWidth: 34, textAlign: "center" as const,
    padding: "2px 7px", borderRadius: 4, fontSize: 14.5, fontWeight: 700,
    background: s.bg, color: s.color,
  };
  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{ ...baseStyle, border: "none", cursor: "pointer", outline: "none", transition: "opacity 0.1s" }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.78")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        title="Click for details"
      >
        {score ?? "–"}
      </button>
    );
  }
  return <span style={baseStyle}>{score ?? "–"}</span>;
}

// ── Section heading ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 19, fontWeight: 800, letterSpacing: "-0.01em",
      color: "#000", marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface SalesSentimentRow {
  brand_name:      string;
  bucket_tag:      string;
  positive_count:  number;
  neutral_count:   number;
  negative_count:  number;
  total_count:     number;
  top_descriptors: string[];
}

interface DexifySentimentRow {
  brand_name:      string;
  bucket_tag:      string;
  positive_count:  number;
  neutral_count:   number;
  negative_count:  number;
  total_count:     number;
  top_descriptors: string[];
  unique_flags:    string[];
}

interface Props {
  marketingSOV:         SOVRow[];
  marketingFeatures:    FeatureScoreRow[];
  marketingFeatureDefs: FeatureDef[];
  marketingClusters:    { bucket_tag: string; brand: string; avg_position: number; appearances: number }[];
  marketingCoverage:    { date: string; bucket_tag: string; brand: string; mention_count: number }[];
  marketingSOVAll:      { bucket_tag: string; brand: string; total_appearances: number; sov_pct: number }[];
  marketingSentiment:   SalesSentimentRow[];
  salesClusters:        { bucket_tag: string; brand: string; avg_position: number; appearances: number }[];
  salesFeatures:        { brand_name: string; feature_id: string; feature_tag: string; score: number; score_band: string; evidence: string | null; terminology_tags: string[] | null }[];
  salesCoverage:        { date: string; bucket_tag: string; brand: string; mention_count: number }[];
  salesSOV:             { bucket_tag: string; brand: string; total_appearances: number; sov_pct: number }[];
  salesSentiment:       SalesSentimentRow[];
  salesFeatureDefs:     FeatureDef[];
  dexifyClusters:       DexifyClusterRow[];
  dexifyFeatures:       { brand_name: string; feature_id: string; feature_tag: string; score: number | null; score_band: string; evidence: string | null; terminology_tags: string[] | null }[];
  dexifyFeatureDefs:    FeatureDef[];
  dexifySentiment:      DexifySentimentRow[];
  skincareClusters:     UseCaseBucketBrandRow[];
}

// ── Feature detail panel ───────────────────────────────────────────────────────

interface ModalScore {
  brand:       string;
  featureName: string;
  featureId:   string;
  featureTag:  string;
  score:       number | null;
  scoreBand:   string;
  evidence:    string | null;
  terminologyTags: string[];
  domain:      string;
  rank:        number;
  total:       number;
}

function FeatureDetailPanel({ info, onClose }: { info: ModalScore; onClose: () => void }) {
  const band        = normalizeBand(info.scoreBand);
  const accentColor = band === "high" ? "#16a34a" : band === "medium" ? "#d97706" : band === "low" ? "#dc2626" : "rgba(0,0,0,0.25)";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, top: 64, background: "rgba(0,0,0,0.18)",
          zIndex: 40, backdropFilter: "blur(2px)",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", right: 0, top: 64, bottom: 0, width: 390,
        background: "#fff", zIndex: 50,
        boxShadow: "-6px 0 32px rgba(0,0,0,0.12)",
        overflowY: "auto", display: "flex", flexDirection: "column",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16, width: 28, height: 28,
            borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.07)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15.5, color: "rgba(0,0,0,0.5)", flexShrink: 0,
          }}
        >✕</button>

        {/* Header */}
        <div style={{ padding: "22px 22px 18px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <div style={{
            fontSize: 13.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase",
            color: "rgba(0,0,0,0.32)", marginBottom: 10,
          }}>
            {info.brand} · {info.featureName}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 60, fontWeight: 900, lineHeight: 1, color: accentColor, letterSpacing: "-0.03em" }}>
              {info.score ?? "–"}
            </span>
            {info.score !== null && (
              <span style={{ fontSize: 15.5, color: "rgba(0,0,0,0.38)", marginBottom: 10, fontWeight: 500 }}>out of 100</span>
            )}
          </div>
          {info.total > 0 && info.rank > 0 && (
            <div style={{ fontSize: 15.5, color: "rgba(0,0,0,0.4)", fontWeight: 500 }}>
              Ranked {info.rank} of {info.total}
            </div>
          )}
        </div>

        {/* Evidence */}
        {info.evidence && (
          <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(0,0,0,0.3)", marginBottom: 12 }}>
              Evidence
            </div>
            <blockquote style={{
              margin: 0, padding: "13px 16px",
              borderLeft: `3px solid ${accentColor}`,
              background: "rgba(0,0,0,0.018)", borderRadius: "0 8px 8px 0",
              fontSize: 15.5, lineHeight: 1.75, color: "rgba(0,0,0,0.72)",
              fontStyle: "normal",
            }}>
              &ldquo;{info.evidence.replace(/<[^>]+>/g, "")}&rdquo;
            </blockquote>
          </div>
        )}

      </div>
    </>
  );
}

// ── Sales use-case card ────────────────────────────────────────────────────────

interface SalesCardProps {
  tag:            string;
  label:          string;
  domain:         string;
  clusterBrands:  { brand: string; avg_position: number; appearances: number }[];
  coverage:       { date: string; brand: string; mention_count: number }[];
  sov:            { brand: string; total_appearances: number; sov_pct: number }[];
  featureDefs:    FeatureDef[];
  scoreMap:       Map<string, { score: number | null; score_band: string; evidence: string | null; terminology_tags: string[] | null }>;
  sentimentRows:  SalesSentimentRow[];
  color:          string;
  bg:             string;
  rgb:            string;
  onScoreClick:   (info: ModalScore) => void;
}

function SalesUseCaseCard({ tag, label, domain, clusterBrands, coverage, sov, featureDefs, scoreMap, sentimentRows, color, bg, rgb, onScoreClick }: SalesCardProps) {
  const top5 = clusterBrands.slice(0, 5);
  const hasFeatures = featureDefs.length > 0 && top5.length > 0;
  const hasSentiment = sentimentRows.length > 0;

  // ── Coverage over time: shape for recharts ─────────────────────────────────
  // top brands for lines
  const top5Names = top5.map(b => b.brand);
  const allDates = [...new Set(coverage.map(r => r.date))].sort().filter(d => d <= "2026-07-09");
  const coverageChartData = allDates.map(date => {
    const row: Record<string, string | number> = {
      date: new Date(date).toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
    };
    for (const brand of top5Names) {
      const match = coverage.find(r => r.date === date && r.brand === brand);
      row[brand] = match?.mention_count ?? 0;
    }
    return row;
  });

  // ── SOV: top 7 brands for pie ──────────────────────────────────────────────
  const sovTop7 = sov.slice(0, 7);
  const sovOtherPct = sov.slice(7).reduce((acc, r) => acc + r.sov_pct, 0);
  const pieData = [
    ...sovTop7.map(r => ({ name: r.brand, value: r.sov_pct })),
    ...(sovOtherPct > 0 ? [{ name: "Other", value: Math.round(sovOtherPct * 10) / 10 }] : []),
  ];

  if (top5.length === 0 && coverage.length === 0) {
    return (
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.01)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bg, borderRadius: 20, padding: "4px 11px" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color }}>{label}</span>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 15, color: "rgba(0,0,0,0.28)", fontWeight: 500 }}>No data yet</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

      {/* Card header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)", background: "rgba(0,0,0,0.01)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bg, borderRadius: 20, padding: "4px 11px", marginBottom: USE_CASE_DESCRIPTIONS[tag] ? 12 : 0 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color }}>{label}</span>
        </div>
        {USE_CASE_DESCRIPTIONS[tag] && (
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "rgba(0,0,0,0.52)", maxWidth: 780 }}>
            {USE_CASE_DESCRIPTIONS[tag]}
          </p>
        )}
      </div>

      {/* ── Row 1: Top brands + SOV pie ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>

        {/* Top 5 brands */}
        <div style={{ padding: "18px 20px", borderRight: "1px solid rgba(0,0,0,0.05)" }}>
          <SectionLabel>Top Brands</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(() => {
              const maxApps = Math.max(...top5.map(b => b.appearances), 1);
              return top5.map((b, i) => {
              const barPct = (b.appearances / maxApps) * 100;
              return (
                <div key={b.brand}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: i < 3 ? bg : "rgba(0,0,0,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14.5, fontWeight: 700,
                      color: i < 3 ? color : "rgba(0,0,0,0.3)",
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 15.5, fontWeight: 600, color: "#000", flex: 1 }}>{b.brand}</span>
                    <span style={{ fontSize: 14.5, color: "rgba(0,0,0,0.38)", fontWeight: 500, flexShrink: 0 }}>
                      {b.appearances} mentions
                    </span>
                  </div>
                  <div style={{ marginLeft: 30, height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${barPct}%`, background: CHART_COLORS[i] ?? color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            });
            })()}
          </div>
        </div>

        {/* SOV Pie chart */}
        <div style={{ padding: "18px 20px" }}>
          <SectionLabel>Use Case Share of Voice</SectionLabel>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={36}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={idx < CHART_COLORS.length ? CHART_COLORS[idx] : "#ccc"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v}%`, "Share"]}
                  contentStyle={{ fontSize: 15, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  formatter={(v: string) => <span style={{ fontSize: 14.5, color: "#000" }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.3)", fontSize: 15.5 }}>
              No SOV data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Coverage over time ───────────────────────────────────────── */}
      <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <SectionLabel>Brand Coverage Over Time</SectionLabel>
        {coverageChartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={coverageChartData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 14.5, fill: "rgba(0,0,0,0.4)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 14.5, fill: "rgba(0,0,0,0.4)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 15, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
                labelStyle={{ fontWeight: 700, marginBottom: 4 }}
              />
              {top5Names.map((brand, i) => (
                <Line
                  key={brand}
                  type="monotone"
                  dataKey={brand}
                  stroke={CHART_COLORS[i] ?? color}
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.3)", fontSize: 15.5 }}>
            Not enough data points yet
          </div>
        )}
        {/* Legend */}
        {top5Names.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10 }}>
            {top5Names.map((brand, i) => (
              <div key={brand} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14.5, color: "rgba(0,0,0,0.55)" }}>
                <span style={{ display: "inline-block", width: 18, height: 2.5, borderRadius: 2, background: CHART_COLORS[i] ?? color }} />
                {brand}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Row 3: Feature scores (bar chart, one section per feature) ────── */}
      {hasFeatures && (
        <div style={{ borderBottom: hasSentiment ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
          <div style={{ padding: "18px 20px 4px", display: "flex", alignItems: "baseline", gap: 12 }}>
            <SectionLabel>Product Features</SectionLabel>
            <span style={{ fontSize: 15, color: "rgba(0,0,0,0.7)", fontWeight: 500, marginBottom: 14 }}>
              ↗ Click any score to read the evidence
            </span>
          </div>
          {featureDefs.map((f, fi) => {
            // All brands in cluster, sorted by this feature's score desc
            const brandScores = clusterBrands.map(b => {
              const s = scoreMap.get(`${b.brand}::${f.feature_id}`);
              return { brand: b.brand, score: s?.score ?? null, scoreBand: s?.score_band ?? "", evidence: s?.evidence ?? null, terminologyTags: s?.terminology_tags ?? null };
            }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

            // Pre-compute ranks for detail panel
            const ranked = brandScores
              .filter((bx): bx is typeof bx & { score: number } => bx.score !== null)
              .sort((a, c) => c.score - a.score);

            return (
              <div
                key={f.feature_id}
                style={{
                  padding: "18px 20px",
                  borderTop: fi > 0 ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {/* Feature heading + description */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: "rgba(0,0,0,0.55)", letterSpacing: "-0.005em", marginBottom: f.feature_desc ? 4 : 0 }}>{f.feature_name}</div>
                  {f.feature_desc && (
                    <p style={{ fontSize: 15, color: "rgba(0,0,0,0.38)", margin: 0, lineHeight: 1.55 }}>{f.feature_desc}</p>
                  )}
                </div>

                {/* Brand rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {brandScores.map(b => {
                    const nb       = normalizeBand(b.scoreBand);
                    const hasScore = b.score !== null;
                    const barColor =
                      nb === "high"           ? "#16a34a" :
                      nb === "medium"         ? "#d97706" :
                      nb === "low"            ? "#dc2626" :
                      "rgba(0,0,0,0.1)";
                    const barBg =
                      nb === "high"           ? "rgba(22,163,74,0.10)" :
                      nb === "medium"         ? "rgba(217,119,6,0.10)" :
                      nb === "low"            ? "rgba(220,38,38,0.08)" :
                      "rgba(0,0,0,0.04)";
                    const rank  = ranked.findIndex(r => r.brand === b.brand) + 1;
                    const total = ranked.length;

                    const clickInfo = hasScore ? {
                      brand:       b.brand,
                      featureName: f.feature_name,
                      featureId:   f.feature_id,
                      featureTag:  f.feature_tag,
                      score:       b.score,
                      scoreBand:   b.scoreBand,
                      evidence:    b.evidence,
                      terminologyTags: b.terminologyTags ?? [],
                      domain,
                      rank,
                      total,
                    } : null;

                    return (
                      <div
                        key={b.brand}
                        onClick={clickInfo ? () => onScoreClick(clickInfo) : undefined}
                        role={clickInfo ? "button" : undefined}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          cursor: clickInfo ? "pointer" : "default",
                          borderRadius: 7, padding: "3px 0",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={e => { if (clickInfo) (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.03)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                      >
                        {/* Brand name */}
                        <span style={{
                          width: 160, flexShrink: 0, fontSize: 15.5,
                          fontWeight: 500, color: "#000", lineHeight: 1.3,
                        }}>
                          {b.brand}
                        </span>

                        {/* Bar track */}
                        <div style={{
                          flex: 1, height: 10, borderRadius: 5,
                          background: hasScore ? barBg : "rgba(0,0,0,0.04)",
                          overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%",
                            width: hasScore ? `${b.score}%` : "0%",
                            background: barColor,
                            borderRadius: 5,
                          }} />
                        </div>

                        {/* Score */}
                        <span style={{
                          width: 36, flexShrink: 0,
                          textAlign: "right" as const,
                          fontSize: 15.5, fontWeight: 800,
                          color: hasScore ? barColor : "rgba(0,0,0,0.18)",
                        }}>
                          {b.score ?? "–"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Row 4: Sentiment ────────────────────────────────────────────────── */}
      {hasSentiment && (() => {
        // Descriptors that appear in 50%+ of brands are "common" — render plain
        // Descriptors that appear in fewer brands are "unique" — highlight with color
        const descCount = new Map<string, number>();
        for (const r of sentimentRows)
          for (const d of r.top_descriptors)
            descCount.set(d, (descCount.get(d) ?? 0) + 1);
        const totalBrands  = sentimentRows.length;
        const isCommon = (d: string) => (descCount.get(d) ?? 0) / totalBrands >= 0.5;

        return (
          <div style={{ padding: "18px 20px" }}>
            <SectionLabel>Sentiment Analysis</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {sentimentRows.map(r => {
                const posW = r.total_count > 0 ? (r.positive_count / r.total_count) * 100 : 0;
                const neuW = r.total_count > 0 ? (r.neutral_count  / r.total_count) * 100 : 0;
                const negW = r.total_count > 0 ? (r.negative_count / r.total_count) * 100 : 0;
                return (
                  <div key={r.brand_name}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                      <span style={{ width: 130, fontSize: 15.5, fontWeight: 700, color: "#000", flexShrink: 0 }}>{r.brand_name}</span>
                      <div style={{ flex: 1, height: 8, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                        <div style={{ width: `${posW}%`, height: "100%", background: "#16a34a" }} />
                        <div style={{ width: `${neuW}%`, height: "100%", background: "#d97706" }} />
                        <div style={{ width: `${negW}%`, height: "100%", background: "#dc2626" }} />
                      </div>
                      <span style={{ width: 38, textAlign: "right", fontSize: 15.5, fontWeight: 800, color: "#16a34a", flexShrink: 0 }}>
                        {Math.round(posW)}%
                      </span>
                    </div>
                    {r.top_descriptors.length > 0 && (
                      <div style={{ marginLeft: 144, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {r.top_descriptors.map((d, di) => {
                          const unique = !isCommon(d);
                          return (
                            <span key={di} style={{
                              fontSize: 14.5, padding: "3px 10px", borderRadius: 20,
                              fontWeight: unique ? 600 : 400,
                              background: unique ? `rgba(${rgb}, 0.08)` : "transparent",
                              border: unique ? `1px solid rgba(${rgb}, 0.25)` : "1px solid rgba(0,0,0,0.12)",
                              color: unique ? color : "rgba(0,0,0,0.45)",
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
          </div>
        );
      })()}

    </div>
  );
}

// ── ScoresOnlyCard — for cross-cutting capability categories ──────────────────
// Unlike SalesUseCaseCard, this card has no top-brands bar, SOV pie, or coverage
// chart. It derives its brand list directly from the scoreMap so it works for
// tags (technical / responsible-ai / cost) that have no marketingClusters rows.

interface ScoresOnlyCardProps {
  tag:          string;
  label:        string;
  featureDefs:  FeatureDef[];
  scoreMap:     Map<string, { score: number | null; score_band: string; evidence: string | null; terminology_tags: string[] | null }>;
  color:        string;
  bg:           string;
  domain:       string;
  onScoreClick: (info: ModalScore) => void;
}

function ScoresOnlyCard({ tag, label, featureDefs, scoreMap, color, bg, domain, onScoreClick }: ScoresOnlyCardProps) {
  // Collect every unique brand mentioned in the scoreMap for this tag
  const allBrands = [...new Set([...scoreMap.keys()].map(k => k.split("::")[0]))].sort();
  const hasData = featureDefs.length > 0 && allBrands.length > 0;

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

      {/* Card header */}
      <div style={{ padding: "13px 18px", borderBottom: hasData ? "1px solid rgba(0,0,0,0.05)" : "none", display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.01)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bg, borderRadius: 20, padding: "4px 11px" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color }}>{label}</span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 15, color: "rgba(0,0,0,0.28)", fontWeight: 500 }}>
          {hasData ? `${featureDefs.length} capabilities · ${allBrands.length} brands` : "No data yet"}
        </span>
      </div>

      {!hasData ? (
        <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 8, color: "rgba(0,0,0,0.3)" }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 15.5, fontWeight: 500 }}>No capability data collected yet for this category</span>
        </div>
      ) : (
        <>
          <div style={{ padding: "10px 20px 2px", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 15, color: "rgba(0,0,0,0.7)", fontWeight: 500 }}>↗ Click any score to read the evidence</span>
          </div>
          {featureDefs.map((f, fi) => {
        // Collect scores for this feature, sorted high→low then unscored
        const brandScores = allBrands
          .map(brand => {
            const s = scoreMap.get(`${brand}::${f.feature_id}`);
            return s
              ? { brand, score: s.score, scoreBand: s.score_band, evidence: s.evidence, terminologyTags: s.terminology_tags }
              : null;
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);

        brandScores.sort((a, b) => {
          if (a.score !== null && b.score !== null) return b.score - a.score;
          if (a.score !== null) return -1;
          if (b.score !== null) return 1;
          return a.brand.localeCompare(b.brand);
        });

        const ranked = brandScores.filter(b => b.score !== null);

        return (
          <div key={f.feature_id} style={{ padding: "18px 20px", borderTop: fi === 0 ? "none" : "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: "#000", marginBottom: f.feature_desc ? 5 : 14 }}>{f.feature_name}</div>
            {f.feature_desc && (
              <p style={{ fontSize: 15, color: "rgba(0,0,0,0.44)", margin: "0 0 14px", lineHeight: 1.55 }}>{f.feature_desc}</p>
            )}
            {brandScores.map(b => {
              const nb        = normalizeBand(b.scoreBand);
              const hasScore  = b.score !== null;
              const barColor  = nb === "high" ? "#16a34a" : nb === "medium" ? "#d97706" : nb === "low" ? "#dc2626" : "rgba(0,0,0,0.10)";
              const textColor = hasScore ? barColor : "rgba(0,0,0,0.22)";
              const rank      = ranked.findIndex(r => r.brand === b.brand) + 1;
              const total     = ranked.length;
              const clickable = hasScore && !!b.evidence;

              return (
                <div
                  key={b.brand}
                  onClick={clickable ? () => onScoreClick({
                    brand:       b.brand,
                    featureName: f.feature_name,
                    featureId:   f.feature_id,
                    featureTag:  f.feature_tag,
                    score:       b.score!,
                    scoreBand:   b.scoreBand,
                    evidence:    b.evidence,
                    terminologyTags: b.terminologyTags ?? [],
                    domain,
                    rank,
                    total,
                  }) : undefined}
                  role={clickable ? "button" : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "4px 6px", borderRadius: 7, margin: "0 -6px", marginBottom: 10,
                    cursor: clickable ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (clickable) (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.03)"; }}
                  onMouseLeave={e => { if (clickable) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <span style={{ width: 150, flexShrink: 0, fontSize: 15.5, fontWeight: 500, color: "#000", lineHeight: 1.3 }}>{b.brand}</span>
                  <div style={{ flex: 1, height: 7, background: "rgba(0,0,0,0.07)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: hasScore ? `${b.score}%` : "0%", background: barColor, borderRadius: 4 }} />
                  </div>
                  <span style={{ width: 32, flexShrink: 0, textAlign: "right", fontSize: 15.5, fontWeight: 700, color: textColor }}>
                    {b.score ?? "–"}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
        </>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SageCharts({
  marketingSOV, marketingFeatures, marketingFeatureDefs,
  marketingClusters, marketingCoverage, marketingSOVAll, marketingSentiment,
  salesClusters, salesFeatures, salesCoverage, salesSOV, salesSentiment, salesFeatureDefs,
  dexifyClusters, dexifyFeatures, dexifyFeatureDefs, dexifySentiment,
  skincareClusters,
}: Props) {
  const [domain,      setDomain]      = useState<DomainId | null>(null);
  const [cluster,     setCluster]     = useState<string | null>(null);
  const [scoreModal,  setScoreModal]  = useState<ModalScore | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(290);
  const [reqOpen,     setReqOpen]     = useState(false);
  const [reqType,     setReqType]     = useState("use-case");
  const [reqDetail,   setReqDetail]   = useState("");
  const [reqEmail,    setReqEmail]    = useState("");
  const [reqState,    setReqState]    = useState<"idle"|"sending"|"done"|"error">("idle");
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, width: 0 });

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      const delta = e.clientX - dragStart.current.x;
      setSidebarWidth(Math.min(420, Math.max(180, dragStart.current.width + delta)));
    }
    function onMouseUp() { dragging.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, []);

  const openScore  = useCallback((info: ModalScore) => setScoreModal(info), []);
  const closeScore = useCallback(() => setScoreModal(null), []);

  const activeDomain   = DOMAINS.find(d => d.id === domain);
  const activeClusters = domain ? CLUSTERS[domain] : ({} as Record<string, string>);

  function selectDomain(id: DomainId) {
    setDomain(id);
    setCluster(null);
    const cfg = DOMAINS.find(d => d.id === id);
    if (!cfg?.locked) {
      // Auto-select first cluster so the user sees data immediately
      setCluster(Object.keys(CLUSTERS[id as DomainId])[0] ?? null);
    }
  }

  function getBrands(dom: DomainId, tag: string): { brand: string; rank: number }[] {
    if (dom === "sales") {
      return salesClusters
        .filter(r => r.bucket_tag === tag)
        .sort((a, b) => a.avg_position - b.avg_position)
        .slice(0, 12)
        .map((r, i) => ({ brand: r.brand, rank: i + 1 }));
    }
    if (dom === "marketing") {
      return marketingSOV
        .filter(r => r.bucket_tag === tag)
        .sort((a, b) => b.sov_pct - a.sov_pct)
        .slice(0, 12)
        .map((r, i) => ({ brand: r.brand, rank: i + 1 }));
    }
    if (dom === "dexify") {
      return dexifyClusters
        .filter(r => r.cluster_tag === tag)
        .sort((a, b) => b.total_mentions - a.total_mentions)
        .slice(0, 12)
        .map((r, i) => ({ brand: r.brand, rank: i + 1 }));
    }
    if (dom === "skincare") {
      const key = SKINCARE_KEYS[tag];
      if (!key) return [];
      return skincareClusters
        .filter(r => (r[key] as number) > 0)
        .sort((a, b) => (b[key] as number) - (a[key] as number))
        .slice(0, 12)
        .map((r, i) => ({ brand: r.brand, rank: i + 1 }));
    }
    return [];
  }

  function getFeatureDefs(dom: DomainId, tag: string): FeatureDef[] {
    if (dom === "sales")     return salesFeatureDefs.filter(f => f.feature_tag === tag);
    if (dom === "marketing") return marketingFeatureDefs.filter(f => f.feature_tag === tag);
    if (dom === "dexify")    return dexifyFeatureDefs.filter(f => f.feature_tag === tag);
    return [];
  }

  function getScoreMap(dom: DomainId, tag: string): Map<string, { score: number | null; score_band: string; evidence: string | null; terminology_tags: string[] | null }> {
    const map = new Map<string, { score: number | null; score_band: string; evidence: string | null; terminology_tags: string[] | null }>();
    const rows = dom === "sales" ? salesFeatures : dom === "marketing" ? marketingFeatures : dom === "dexify" ? dexifyFeatures : [];
    for (const r of rows) {
      if (r.feature_tag === tag) map.set(`${r.brand_name}::${r.feature_id}`, { score: r.score, score_band: r.score_band, evidence: r.evidence, terminology_tags: r.terminology_tags ?? null });
    }
    return map;
  }

  function getDexifySentimentRows(clusterTag: string): DexifySentimentRow[] {
    const bucketTag = clusterTag.replace(/^dexify-/, "");
    return dexifySentiment
      .filter(r => r.bucket_tag === bucketTag)
      .sort((a, b) => b.positive_count / b.total_count - a.positive_count / a.total_count);
  }

  const visibleClusters = cluster
    ? Object.fromEntries(Object.entries(activeClusters).filter(([tag]) => tag === cluster))
    : activeClusters;

  return (
    <>
    <div style={{ display: "flex", height: "100vh", marginTop: "-68px", overflow: "hidden", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarWidth, background: "#0F1117", flexShrink: 0,
        display: "flex", flexDirection: "column", overflowY: "auto",
        borderRight: "1px solid rgba(255,255,255,0.04)",
        position: "relative",
      }}>
        {/* Drag handle */}
        <div
          onMouseDown={e => {
            e.preventDefault();
            dragging.current = true;
            dragStart.current = { x: e.clientX, width: sidebarWidth };
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 5,
            cursor: "col-resize", zIndex: 10,
            background: "transparent",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.10)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        />
        {/* ── Brand row ─────────────────────────────────────────────────────── */}
        <div style={{
          height: 72 + 68, flexShrink: 0,
          display: "flex", alignItems: "flex-end", gap: 12,
          padding: "0 16px 16px",
          background: "rgba(91,60,200,0.14)",
          position: "relative",
        }}>
          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, lineHeight: 1 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: "#F0EEFF" }}>Sage</span>
            <span style={{
              fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em",
              background: "linear-gradient(90deg, #A78BFA, #F472B6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>AI</span>
          </div>

          {/* Gradient accent divider at bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(to right, transparent, rgba(124,58,237,0.7) 25%, rgba(236,72,153,0.7) 75%, transparent)",
          }} />
        </div>

        {/* Domain nav */}
        <nav style={{ padding: "18px 12px 24px", flex: 1 }}>

          {/* ── Business Domains ── */}
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 10, paddingLeft: 6 }}>
            Business Domains
          </div>

          {/* Unlocked domains first */}
          {DOMAINS.filter(d => !d.locked).map(d => {
            const isActive = domain === d.id;
            const domClusters = CLUSTERS[d.id as DomainId];
            const ccSet = CROSS_CUTTING_TAGS[d.id as DomainId];
            const useCaseEntries = Object.entries(domClusters).filter(([t]) => !ccSet?.has(t));
            const ccEntries      = ccSet ? Object.entries(domClusters).filter(([t]) => ccSet.has(t)) : [];

            const CC_ICONS: Record<string, React.ReactElement> = {
              "technical": (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                  <rect x="8" y="8" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M8 1v3M16 1v3M8 20v3M16 20v3M1 8h3M1 16h3M20 8h3M20 16h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              ),
              "responsible-ai": (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8 2 4 5 4 9c0 4.5 5 9 8 11 3-2 8-6.5 8-11 0-4-4-7-8-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              "cost": (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 6v1.5M12 16.5V18M9.5 9.5a2.5 2.5 0 0 1 5 0c0 2-5 2.5-5 5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              ),
            };

            const clusterBtn = (tag: string, lbl: string, isCc = false) => {
              const isSelected = cluster === tag;
              const icon = isCc ? CC_ICONS[tag] : null;
              return (
                <button
                  key={tag}
                  onClick={() => setCluster(tag)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 14px", borderRadius: 9, marginBottom: 2,
                    background: isSelected ? `rgba(${d.rgb}, 0.18)` : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left" as const,
                    color: isSelected ? d.color : "rgba(255,255,255,0.38)",
                    fontSize: 17, fontWeight: isSelected ? 700 : 400,
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  {icon
                    ? <span style={{ flexShrink: 0, display: "flex", opacity: isSelected ? 1 : 0.45 }}>{icon}</span>
                    : <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: isSelected ? d.color : "rgba(255,255,255,0.2)", marginTop: 1 }} />
                  }
                  {lbl}
                </button>
              );
            };

            return (
              <div key={d.id} style={{ marginBottom: isActive ? 6 : 2 }}>
                {/* Domain button */}
                <button
                  onClick={() => selectDomain(d.id as DomainId)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 14px", borderRadius: 12, marginBottom: isActive ? 2 : 0,
                    background: isActive ? `rgba(${d.rgb}, 0.22)` : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left" as const,
                    color: isActive ? d.color : "rgba(255,255,255,0.5)",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <span style={{ flexShrink: 0, display: "flex" }}><DomainIcon id={d.id} /></span>
                  <span style={{ fontSize: 18, fontWeight: isActive ? 800 : 500, flex: 1, letterSpacing: isActive ? "-0.01em" : 0 }}>{d.label}</span>
                  {isActive && (
                    <div style={{
                      width: 13, height: 13, borderRadius: "50%",
                      background: d.color, flexShrink: 0,
                      boxShadow: `0 0 8px ${d.color}`,
                    }} />
                  )}
                </button>

                {/* Expanded clusters */}
                {isActive && (
                  <div style={{ paddingLeft: 8, marginTop: 10, marginBottom: 4 }}>
                    {/* Use Cases */}
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8, paddingLeft: 6 }}>
                      Use Cases
                    </div>
                    {useCaseEntries.map(([t, l]) => clusterBtn(t, l))}

                    {/* Additional Product Features */}
                    {ccEntries.length > 0 && (
                      <>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "20px 0 8px", paddingLeft: 6 }}>
                          Additional Product Features
                        </div>
                        {ccEntries.map(([t, l]) => clusterBtn(t, l, true))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Locked domains (bottom) ── */}
          {DOMAINS.filter(d => d.locked).length > 0 && (
            <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
              {DOMAINS.filter(d => d.locked).map(d => (
                <button
                  key={d.id}
                  onClick={() => selectDomain(d.id as DomainId)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 12, marginBottom: 2,
                    background: domain === d.id ? "rgba(255,255,255,0.06)" : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left" as const,
                    color: "rgba(255,255,255,0.35)",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = domain === d.id ? "rgba(255,255,255,0.06)" : "transparent"; }}
                >
                  <span style={{ flexShrink: 0, display: "flex", opacity: 0.5 }}><DomainIcon id={d.id} /></span>
                  <span style={{ fontSize: 18, fontWeight: 500, flex: 1 }}>{d.label}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.07em",
                    color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.08)",
                    borderRadius: 5, padding: "3px 7px", flexShrink: 0,
                  }}>SOON</span>
                </button>
              ))}
            </div>
          )}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1, background: "#F3F4F9", overflowY: "auto", padding: "22px 20px", paddingTop: 68 + 22 }}>
        {!domain ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg, rgba(124,58,237,0.10), rgba(190,24,93,0.10))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="rgba(0,0,0,0.22)" strokeWidth="2"/>
                <path d="M21 21l-4-4" stroke="rgba(0,0,0,0.22)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 17.5, fontWeight: 700, color: "#000", margin: "0 0 6px" }}>Select a domain to get started</p>
              <p style={{ fontSize: 15.5, color: "rgba(0,0,0,0.4)", margin: 0 }}>Choose Marketing AI from the sidebar to explore rankings and feature scores</p>
            </div>
          </div>
        ) : activeDomain?.locked ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 20, background: activeDomain.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke={activeDomain.color} strokeWidth="1.8"/>
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={activeDomain.color} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ textAlign: "center", maxWidth: 340 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#000", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                {activeDomain.label} — Coming Soon
              </p>
              <p style={{ fontSize: 15.5, color: "rgba(0,0,0,0.42)", margin: 0, lineHeight: 1.6 }}>
                We&rsquo;re building out intelligence for this domain. Check back soon.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#000", margin: 0, letterSpacing: "-0.02em" }}>
                  {activeDomain?.label} Intelligence
                </h1>
                {cluster && (
                  <span style={{ fontSize: 14.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: activeDomain?.bg, color: activeDomain?.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {activeClusters[cluster]}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 15.5, color: "rgba(0,0,0,0.4)", margin: 0 }}>
                {cluster
                  ? `Filtered to: ${activeClusters[cluster]}`
                  : (() => {
                      const ccSet = domain ? CROSS_CUTTING_TAGS[domain] : undefined;
                      const allKeys = Object.keys(activeClusters);
                      const ucCount = ccSet ? allKeys.filter(t => !ccSet.has(t)).length : allKeys.length;
                      const ccCount = ccSet?.size ?? 0;
                      return ccCount > 0
                        ? `${ucCount} use cases · ${ccCount} capabilities — select one from the sidebar`
                        : `${ucCount} use cases · select one in the sidebar to focus`;
                    })()}
              </p>
            </div>

            {/* Use case cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {!cluster ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: activeDomain?.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DomainIcon id={domain} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 16.5, fontWeight: 700, color: "#000", margin: "0 0 5px" }}>Pick a use case</p>
                    <p style={{ fontSize: 15.5, color: "rgba(0,0,0,0.4)", margin: 0 }}>Select one from the sidebar to see rankings, coverage, and feature scores</p>
                  </div>
                </div>
              ) : (domain === "sales" || domain === "marketing") ? (
                // ── Sales + Marketing: rich cards with charts (or scores-only for cross-cutting) ──
                Object.entries(visibleClusters).map(([tag, lbl]) => {
                  const isMkt = domain === "marketing";
                  // Cross-cutting tags (technical / responsible-ai / cost) get a
                  // simplified scores-only card — no mention data exists for them.
                  if (isMkt && CROSS_CUTTING_TAGS.marketing?.has(tag)) {
                    const featureDefs = marketingFeatureDefs.filter(f => f.feature_tag === tag);
                    const scoreMap    = getScoreMap("marketing", tag);
                    return (
                      <ScoresOnlyCard
                        key={tag}
                        tag={tag}
                        label={lbl}
                        featureDefs={featureDefs}
                        scoreMap={scoreMap}
                        color={activeDomain!.color}
                        bg={activeDomain!.bg}
                        domain="marketing"
                        onScoreClick={openScore}
                      />
                    );
                  }

                  const clusterBrands = (isMkt ? marketingClusters : salesClusters)
                    .filter(r => r.bucket_tag === tag)
                    .sort((a, b) => b.appearances - a.appearances); // most mentions first
                  const clusterCoverage = (isMkt ? marketingCoverage : salesCoverage).filter(r => r.bucket_tag === tag);
                  const clusterSOV      = (isMkt ? marketingSOVAll : salesSOV).filter(r => r.bucket_tag === tag).sort((a, b) => b.sov_pct - a.sov_pct);
                  const clusterSentiment = (isMkt ? marketingSentiment : salesSentiment).filter(r => r.bucket_tag === tag);
                  const featureDefs     = (isMkt ? marketingFeatureDefs : salesFeatureDefs).filter(f => f.feature_tag === tag);
                  const scoreMap        = getScoreMap(domain, tag);
                  return (
                    <SalesUseCaseCard
                      key={tag}
                      tag={tag}
                      label={lbl}
                      domain={domain}
                      clusterBrands={clusterBrands}
                      coverage={clusterCoverage}
                      sov={clusterSOV}
                      featureDefs={featureDefs}
                      scoreMap={scoreMap}
                      sentimentRows={clusterSentiment}
                      color={activeDomain!.color}
                      bg={activeDomain!.bg}
                      rgb={activeDomain!.rgb}
                      onScoreClick={openScore}
                    />
                  );
                })
              ) : (
                // ── Other domains: existing card layout ────────────────────
                Object.entries(visibleClusters).map(([tag, lbl]) => {
                  const brands      = getBrands(domain, tag);
                  const featureDefs = getFeatureDefs(domain, tag);
                  const scoreMap    = getScoreMap(domain, tag);
                  const isSkincare  = domain === "skincare";
                  const hasFeatures = !isSkincare && featureDefs.length > 0 && brands.length > 0;
                  const sentRows    = domain === "dexify" ? getDexifySentimentRows(tag) : [];

                  return (
                    <div key={tag} style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      <div style={{ padding: "13px 18px", borderBottom: brands.length > 0 ? "1px solid rgba(0,0,0,0.05)" : "none", display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.01)" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: activeDomain?.bg, borderRadius: 20, padding: "4px 11px" }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: activeDomain?.color }} />
                          <span style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: activeDomain?.color }}>{lbl}</span>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: 15, color: "rgba(0,0,0,0.28)", fontWeight: 500 }}>
                          {brands.length > 0 ? `${brands.length} brands ranked` : "No data yet"}
                        </span>
                      </div>

                      {brands.length === 0 ? (
                        <div style={{ padding: "18px", display: "flex", alignItems: "center", gap: 8, color: "rgba(0,0,0,0.3)" }}>
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          <span style={{ fontSize: 15.5, fontWeight: 500 }}>No data collected yet for this use case</span>
                        </div>
                      ) : domain === "dexify" && hasFeatures ? (
                        <div>
                          {featureDefs.map(f => (
                            <div key={f.feature_id} style={{ padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                              <div style={{ fontWeight: 700, fontSize: 15.5, color: "#000", marginBottom: f.feature_desc ? 5 : 14 }}>{f.feature_name}</div>
                              {f.feature_desc && (
                                <p style={{ fontSize: 15, color: "rgba(0,0,0,0.44)", margin: "0 0 14px", lineHeight: 1.55 }}>{f.feature_desc}</p>
                              )}
                              {brands.map((b, bi) => {
                                const s = scoreMap.get(`${b.brand}::${f.feature_id}`);
                                const isNotDoc = !s || s.score_band === "not_documented";
                                const barPct   = s?.score ?? 0;
                                const barColor = s?.score_band === "high" ? "#16a34a" : s?.score_band === "medium" ? "#d97706" : s?.score_band === "low" ? "#dc2626" : "rgba(0,0,0,0.10)";
                                const textColor = isNotDoc ? "rgba(0,0,0,0.25)" : barColor;
                                return (
                                  <div key={b.brand} style={{ marginBottom: bi < brands.length - 1 ? 16 : 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: s?.evidence ? 5 : 0 }}>
                                      <span style={{ width: 130, fontSize: 15.5, fontWeight: 500, color: "#000", flexShrink: 0, lineHeight: 1.3 }}>{b.brand}</span>
                                      <div style={{ flex: 1, height: 7, background: "rgba(0,0,0,0.07)", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${barPct}%`, background: barColor, borderRadius: 4 }} />
                                      </div>
                                      <span style={{ width: 32, textAlign: "right", fontSize: 15.5, fontWeight: 700, color: textColor, flexShrink: 0 }}>{s?.score ?? "–"}</span>
                                    </div>
                                    {s?.evidence && <div style={{ marginLeft: 144, fontSize: 15, color: "rgba(0,0,0,0.5)", lineHeight: 1.6 }}>{s.evidence}</div>}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                          {sentRows.length > 0 && (
                            <div style={{ padding: "14px 20px 18px" }}>
                              <SectionLabel>Sentiment</SectionLabel>
                              {sentRows.map((r, ri) => {
                                const posW = r.total_count > 0 ? (r.positive_count / r.total_count) * 100 : 0;
                                const neuW = r.total_count > 0 ? (r.neutral_count  / r.total_count) * 100 : 0;
                                const negW = r.total_count > 0 ? (r.negative_count / r.total_count) * 100 : 0;
                                return (
                                  <div key={r.brand_name} style={{ marginBottom: ri < sentRows.length - 1 ? 18 : 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                                      <span style={{ width: 130, fontSize: 15.5, fontWeight: 700, color: "#000", flexShrink: 0 }}>{r.brand_name}</span>
                                      <div style={{ flex: 1, height: 7, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                                        <div style={{ width: `${posW}%`, height: "100%", background: "#16a34a" }} />
                                        <div style={{ width: `${neuW}%`, height: "100%", background: "#d97706" }} />
                                        <div style={{ width: `${negW}%`, height: "100%", background: "#dc2626" }} />
                                      </div>
                                      <span style={{ width: 36, textAlign: "right", fontSize: 15.5, fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>{Math.round(posW)}%</span>
                                    </div>
                                    {r.top_descriptors.length > 0 && (
                                      <div style={{ marginLeft: 144, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {r.top_descriptors.map((d, di) => {
                                          const isUnique = r.unique_flags[di] === "true";
                                          return (
                                            <span key={di} style={{ fontSize: 14.5, padding: "3px 10px", borderRadius: 20, fontWeight: isUnique ? 600 : 400, background: isUnique ? `rgba(${activeDomain?.rgb},0.10)` : "transparent", border: isUnique ? `1px solid rgba(${activeDomain?.rgb},0.25)` : "1px solid rgba(0,0,0,0.15)", color: isUnique ? activeDomain?.color : "rgba(0,0,0,0.5)" }}>
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
                          )}
                        </div>
                      ) : hasFeatures ? (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15.5 }}>
                            <thead>
                              <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                                <th style={{ textAlign: "left", padding: "8px 10px 8px 18px", fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 14.5, letterSpacing: "0.05em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(0,0,0,0.05)", width: 30 }}>#</th>
                                <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 14.5, letterSpacing: "0.05em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>Brand</th>
                                {featureDefs.map(f => (
                                  <th key={f.feature_id} style={{ textAlign: "center", padding: "8px 10px", fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 14.5, letterSpacing: "0.04em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(0,0,0,0.05)", whiteSpace: "nowrap" as const }}>
                                    {f.feature_name.split(" ").slice(0, 3).join(" ")}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {brands.map((b, i) => (
                                <tr key={b.brand} style={{ borderBottom: i < brands.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                                  <td style={{ padding: "10px 10px 10px 18px", color: "rgba(0,0,0,0.28)", fontSize: 15, fontWeight: 600 }}>{b.rank}</td>
                                  <td style={{ padding: "10px 12px", fontWeight: 600, color: "#000", whiteSpace: "nowrap" as const }}>{b.brand}</td>
                                  {featureDefs.map(f => {
                                    const s = scoreMap.get(`${b.brand}::${f.feature_id}`);
                                    return (
                                      <td key={f.feature_id} style={{ padding: "10px", textAlign: "center" }}>
                                        {s ? <span title={s.evidence ?? undefined}><ScorePill band={s.score_band} score={s.score} /></span> : <span style={{ color: "rgba(0,0,0,0.15)", fontSize: 15 }}>–</span>}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div>
                          {brands.map((b, i) => (
                            <div key={b.brand} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: i < brands.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                              <span style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: b.rank <= 3 ? activeDomain?.bg : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14.5, fontWeight: 700, color: b.rank <= 3 ? activeDomain?.color : "rgba(0,0,0,0.3)" }}>
                                {b.rank}
                              </span>
                              <span style={{ fontSize: 15.5, fontWeight: 600, color: "#000" }}>{b.brand}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Score legend */}
            {domain !== "skincare" && (
              <div style={{ marginTop: 18, display: "flex", gap: 20, flexWrap: "wrap", padding: "10px 16px", background: "#fff", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)", alignItems: "center" }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: "rgba(0,0,0,0.32)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Feature Score</span>
                {[
                  ["#16a34a", "rgba(22,163,74,0.10)",  "Strong (70–100)"],
                  ["#d97706", "rgba(217,119,6,0.10)",  "Partial (40–69)"],
                  ["#dc2626", "rgba(220,38,38,0.08)",  "Weak (0–39)"],
                ].map(([color, bg, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14.5, color: "rgba(0,0,0,0.45)" }}>
                    <span style={{ display: "inline-block", width: 22, height: 8, borderRadius: 4, background: bg, position: "relative" as const, overflow: "hidden" }}>
                      <span style={{ position: "absolute" as const, inset: 0, width: "65%", background: color, borderRadius: 4 }} />
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

    </div>

    {/* Feature detail panel — renders on top of everything */}
    {scoreModal && <FeatureDetailPanel info={scoreModal} onClose={closeScore} />}

    {/* ── Floating request button ───────────────────────────────────────────── */}
    <button
      onClick={() => { setReqOpen(true); setReqState("idle"); }}
      style={{
        position: "fixed", bottom: 28, left: 28, zIndex: 900,
        display: "flex", alignItems: "center", gap: 10,
        background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 60%, #EC4899 100%)",
        color: "#fff",
        border: "none", borderRadius: 50,
        padding: "14px 26px", fontSize: 15.5, fontWeight: 700,
        cursor: "pointer", boxShadow: "0 4px 24px rgba(124,58,237,0.45)",
        letterSpacing: "-0.01em",
        transition: "transform 0.15s, box-shadow 0.15s, filter 0.15s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(124,58,237,0.55)"; (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(124,58,237,0.45)"; (e.currentTarget as HTMLButtonElement).style.filter = "none"; }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Make a Request
    </button>

    {/* ── Request modal ─────────────────────────────────────────────────────── */}
    {reqOpen && (
      <div
        onClick={e => { if (e.target === e.currentTarget) setReqOpen(false); }}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{
          background: "#fff", borderRadius: 18, width: "100%", maxWidth: 520,
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#18181b" }}>Make a Request</p>
              <p style={{ margin: "4px 0 0", fontSize: 14.5, color: "rgba(0,0,0,0.45)", lineHeight: 1.5 }}>
                Tell us what you want to see — we'll prioritise and build it.
              </p>
            </div>
            <button onClick={() => setReqOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(0,0,0,0.35)", fontSize: 22, lineHeight: 1, marginTop: -2 }}>✕</button>
          </div>

          {reqState === "done" ? (
            <div style={{ padding: "44px 26px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#18181b", margin: "0 0 8px" }}>Request received!</p>
              <p style={{ fontSize: 15, color: "rgba(0,0,0,0.45)", margin: 0 }}>Thanks — we'll review and reach out if we need more detail.</p>
              <button onClick={() => { setReqOpen(false); setReqDetail(""); setReqEmail(""); setReqState("idle"); }}
                style={{ marginTop: 24, background: "#18181b", color: "#fff", border: "none", borderRadius: 10, padding: "11px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Close
              </button>
            </div>
          ) : (
            <div style={{ padding: "22px 26px 26px" }}>

              {/* Request type chips */}
              <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,0.55)", letterSpacing: "0.03em", textTransform: "uppercase" as const }}>What are you requesting?</p>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 22 }}>
                {([
                  ["use-case",        "More Use Cases"],
                  ["business-domain", "Business Domain"],
                  ["competitor",      "Competitor Brands"],
                  ["analytics",       "More Analytics"],
                  ["other",           "Other"],
                ] as [string, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setReqType(val)}
                    style={{
                      padding: "8px 16px", borderRadius: 30, fontSize: 14.5, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.12s",
                      background: reqType === val ? "#18181b" : "rgba(0,0,0,0.06)",
                      color:      reqType === val ? "#fff"     : "rgba(0,0,0,0.65)",
                      border:     reqType === val ? "2px solid #18181b" : "2px solid transparent",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Detail textarea */}
              <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,0.55)", letterSpacing: "0.03em", textTransform: "uppercase" as const }}>Tell us more</p>
              <textarea
                value={reqDetail}
                onChange={e => setReqDetail(e.target.value)}
                placeholder={
                  reqType === "use-case"        ? "e.g. Social media management, influencer marketing, SEO content..." :
                  reqType === "business-domain" ? "e.g. E-commerce, Legal, Healthcare, Finance..." :
                  reqType === "competitor"      ? "e.g. Add HubSpot, Jasper AI, Copy.ai to the ads use case..." :
                  reqType === "analytics"       ? "e.g. Market share trend over time, sentiment by region..." :
                  "Describe what you'd like to see..."
                }
                rows={4}
                style={{
                  width: "100%", boxSizing: "border-box" as const,
                  border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: 10,
                  padding: "12px 14px", fontSize: 15, lineHeight: 1.6,
                  color: "#18181b", background: "#fafafa",
                  resize: "vertical" as const, outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "#18181b"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; }}
              />

              {/* Optional email */}
              <p style={{ margin: "16px 0 8px", fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,0.55)", letterSpacing: "0.03em", textTransform: "uppercase" as const }}>Your email <span style={{ fontWeight: 400, textTransform: "none" as const, letterSpacing: 0 }}>(so we can follow up)</span></p>
              <input
                type="email"
                value={reqEmail}
                onChange={e => setReqEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%", boxSizing: "border-box" as const,
                  border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: 10,
                  padding: "11px 14px", fontSize: 15,
                  color: "#18181b", background: "#fafafa",
                  outline: "none", fontFamily: "inherit",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "#18181b"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; }}
              />

              {reqState === "error" && (
                <p style={{ margin: "12px 0 0", fontSize: 14, color: "#dc2626" }}>Something went wrong — please try again.</p>
              )}

              {/* Submit */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
                <button onClick={() => setReqOpen(false)}
                  style={{ background: "none", border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", color: "rgba(0,0,0,0.55)" }}>
                  Cancel
                </button>
                <button
                  disabled={!reqDetail.trim() || reqState === "sending"}
                  onClick={async () => {
                    if (!reqDetail.trim()) return;
                    setReqState("sending");
                    try {
                      const res = await fetch("/api/sage-request", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: reqType, detail: reqDetail, email: reqEmail || undefined }),
                      });
                      if (!res.ok) throw new Error("failed");
                      setReqState("done");
                    } catch {
                      setReqState("error");
                    }
                  }}
                  style={{
                    background: !reqDetail.trim() || reqState === "sending" ? "rgba(0,0,0,0.15)" : "#18181b",
                    color: "#fff", border: "none", borderRadius: 10,
                    padding: "11px 28px", fontSize: 15, fontWeight: 700,
                    cursor: !reqDetail.trim() || reqState === "sending" ? "not-allowed" : "pointer",
                    transition: "background 0.12s",
                  }}
                >
                  {reqState === "sending" ? "Sending…" : "Submit Request"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}
