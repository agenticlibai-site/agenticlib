"use client";

import { useState, useEffect, useCallback } from "react";
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
}

interface DomainConfig {
  id:    string;
  label: string;
  color: string;
  bg:    string;
  rgb:   string;
}

const DOMAINS: DomainConfig[] = [
  { id: "sales",     label: "Sales AI",     color: "#2563EB", bg: "rgba(37,99,235,0.09)",   rgb: "37,99,235"   },
  { id: "marketing", label: "Marketing AI", color: "#7C3AED", bg: "rgba(124,58,237,0.09)",  rgb: "124,58,237"  },
  { id: "dexify",    label: "Tradie AI",    color: "#EA580C", bg: "rgba(234,88,12,0.09)",   rgb: "234,88,12"   },
  { id: "skincare",  label: "Skincare AI",  color: "#BE185D", bg: "rgba(190,24,93,0.09)",   rgb: "190,24,93"   },
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
    "ads":       "Ads Management",
    "content":   "Content Creation",
    "lead-gen":  "Lead Generation",
    "lifecycle": "Lifecycle & Retention",
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

const SKINCARE_KEYS: Record<string, keyof UseCaseBucketBrandRow> = {
  "routine-audit":        "b1",
  "personalized-routine": "b2",
  "ingredient-analysis":  "b3",
  "condition-specific":   "b4",
  "tracking-progress":    "b5",
};

const CHART_COLORS = ["#2563EB", "#7C3AED", "#EA580C", "#16a34a", "#d97706", "#dc2626", "#BE185D", "#0891b2"];

// Tag palette for unique talking points
const TAG_PALETTE = [
  { bg: "rgba(37,99,235,0.08)",  border: "rgba(37,99,235,0.22)",  text: "#1d4ed8" },
  { bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.22)", text: "#6d28d9" },
  { bg: "rgba(234,88,12,0.08)",  border: "rgba(234,88,12,0.22)",  text: "#c2410c" },
  { bg: "rgba(22,163,74,0.08)",  border: "rgba(22,163,74,0.22)",  text: "#15803d" },
  { bg: "rgba(190,24,93,0.08)",  border: "rgba(190,24,93,0.22)",  text: "#be185d" },
];

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

// Pull quoted phrases (3–50 chars) from evidence text as talking points
function extractTalkingPoints(evidence: string | null): string[] {
  if (!evidence) return [];
  const matches = evidence.match(/"([^"]{3,50})"/g) ?? [];
  const cleaned = matches.map(m => m.replace(/^"|"$/g, "").trim());
  return [...new Set(cleaned)].slice(0, 5);
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function SalesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 12l3.5-4 3 2.5L12 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="13" cy="4" r="1.5" fill="currentColor"/>
    </svg>
  );
}
function MarketingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 8h8M13 4l-3 4 3 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="2" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  );
}
function TradieIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M9.5 2.5l-7 7 1.5 1.5 7-7-1.5-1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 4l1.5-1.5 1 1L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11l-1 2 2-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function SkincareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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
    padding: "2px 7px", borderRadius: 4, fontSize: 11.5, fontWeight: 700,
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
      fontSize: 9.5, fontWeight: 700, letterSpacing: "0.13em",
      textTransform: "uppercase", color: "rgba(0,0,0,0.3)",
      marginBottom: 14,
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
  salesClusters:        { bucket_tag: string; brand: string; avg_position: number; appearances: number }[];
  salesFeatures:        { brand_name: string; feature_id: string; feature_tag: string; score: number; score_band: string; evidence: string | null }[];
  salesCoverage:        { date: string; bucket_tag: string; brand: string; mention_count: number }[];
  salesSOV:             { bucket_tag: string; brand: string; total_appearances: number; sov_pct: number }[];
  salesSentiment:       SalesSentimentRow[];
  salesFeatureDefs:     FeatureDef[];
  dexifyClusters:       DexifyClusterRow[];
  dexifyFeatures:       { brand_name: string; feature_id: string; feature_tag: string; score: number | null; score_band: string; evidence: string | null }[];
  dexifyFeatureDefs:    FeatureDef[];
  dexifySentiment:      DexifySentimentRow[];
  skincareClusters:     UseCaseBucketBrandRow[];
}

// ── Feature detail panel ───────────────────────────────────────────────────────

interface ModalScore {
  brand:       string;
  featureName: string;
  featureId:   string;
  score:       number | null;
  scoreBand:   string;
  evidence:    string | null;
  domain:      string;
  rank:        number;
  total:       number;
}

function FeatureDetailPanel({ info, onClose }: { info: ModalScore; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [modelScores, setModelScores] = useState<{ model: string; model_score: number | null }[]>([]);
  const [history,     setHistory]     = useState<{ week: string; score: number | null }[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/sage/feature-detail?brand=${encodeURIComponent(info.brand)}&feature_id=${encodeURIComponent(info.featureId)}&domain=${info.domain}`
    )
      .then(r => r.json())
      .then(data => {
        setModelScores(data.modelScores ?? []);
        setHistory(data.history ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [info.brand, info.featureId, info.domain]);

  const band        = normalizeBand(info.scoreBand);
  const accentColor = band === "high" ? "#16a34a" : band === "medium" ? "#d97706" : band === "low" ? "#dc2626" : "rgba(0,0,0,0.25)";
  const talkingPts  = extractTalkingPoints(info.evidence);

  const claudeScore = modelScores.find(m => m.model.includes("claude"))?.model_score ?? null;
  const gptScore    = modelScores.find(m => m.model.includes("gpt"))?.model_score    ?? null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)",
          zIndex: 40, backdropFilter: "blur(2px)",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width: 390,
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
            fontSize: 13, color: "rgba(0,0,0,0.5)", flexShrink: 0,
          }}
        >✕</button>

        {/* Header */}
        <div style={{ padding: "22px 22px 18px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <div style={{
            fontSize: 9.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase",
            color: "rgba(0,0,0,0.32)", marginBottom: 10,
          }}>
            {info.brand} · {info.featureName}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 58, fontWeight: 900, lineHeight: 1, color: accentColor, letterSpacing: "-0.03em" }}>
              {info.score ?? "–"}
            </span>
            {info.score !== null && (
              <span style={{ fontSize: 14, color: "rgba(0,0,0,0.38)", marginBottom: 10, fontWeight: 500 }}>out of 100</span>
            )}
          </div>
          {info.total > 0 && info.rank > 0 && (
            <div style={{ fontSize: 13, color: "rgba(0,0,0,0.4)", fontWeight: 500 }}>
              Ranked {info.rank} of {info.total}
            </div>
          )}
        </div>

        {/* Model breakdown */}
        {!loading && (claudeScore !== null || gptScore !== null) && (
          <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(0,0,0,0.3)", marginBottom: 14 }}>
              By Model
            </div>
            <div style={{ display: "flex", gap: 28 }}>
              {claudeScore !== null && (
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", marginBottom: 4 }}>
                    Claude
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#000", letterSpacing: "-0.02em" }}>{claudeScore}</div>
                </div>
              )}
              {gptScore !== null && (
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", marginBottom: 4 }}>
                    GPT-4o-mini
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#000", letterSpacing: "-0.02em" }}>{gptScore}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evidence */}
        {info.evidence && (
          <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(0,0,0,0.3)", marginBottom: 12 }}>
              Evidence
            </div>
            <blockquote style={{
              margin: 0, padding: "13px 16px",
              borderLeft: `3px solid ${accentColor}`,
              background: "rgba(0,0,0,0.018)", borderRadius: "0 8px 8px 0",
              fontSize: 13.5, lineHeight: 1.75, color: "rgba(0,0,0,0.72)",
              fontStyle: "italic",
            }}>
              "{info.evidence}"
            </blockquote>
          </div>
        )}

        {/* Score history */}
        {!loading && history.length > 0 && (
          <div style={{ padding: "16px 22px", borderBottom: talkingPts.length > 0 ? "1px solid rgba(0,0,0,0.07)" : "none" }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(0,0,0,0.3)", marginBottom: 14 }}>
              Score History
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {history.map((h, i) => {
                const sc = h.score ?? 0;
                const tileBg = sc >= 70 ? "#16a34a" : sc >= 40 ? "#d97706" : sc > 0 ? "#dc2626" : "rgba(0,0,0,0.1)";
                const isLatest = i === history.length - 1;
                return (
                  <div key={i} style={{
                    width: 52, height: 52, borderRadius: 11,
                    background: tileBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isLatest ? `0 0 0 2.5px ${tileBg}, 0 0 0 4px rgba(0,0,0,0.12)` : "none",
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{h.score ?? "–"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Unique talking points */}
        {talkingPts.length > 0 && (
          <div style={{ padding: "16px 22px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(0,0,0,0.3)", marginBottom: 12 }}>
              Unique Talking Points
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {talkingPts.map((pt, i) => {
                const tc = TAG_PALETTE[i % TAG_PALETTE.length];
                return (
                  <span key={i} style={{
                    padding: "5px 13px", borderRadius: 20,
                    fontSize: 12.5, fontWeight: 600,
                    background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text,
                  }}>
                    {pt}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ padding: "32px 22px", display: "flex", justifyContent: "center", color: "rgba(0,0,0,0.28)", fontSize: 13 }}>
            Loading…
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
  scoreMap:       Map<string, { score: number | null; score_band: string; evidence: string | null }>;
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
  const allDates = [...new Set(coverage.map(r => r.date))].sort();
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
            <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color }}>{label}</span>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(0,0,0,0.28)", fontWeight: 500 }}>No data yet</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

      {/* Card header */}
      <div style={{ padding: "13px 18px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.01)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bg, borderRadius: 20, padding: "4px 11px" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color }}>{label}</span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(0,0,0,0.28)", fontWeight: 500 }}>
          {clusterBrands.length} brands · {allDates.length} days of data
        </span>
      </div>

      {/* ── Row 1: Top brands + SOV pie ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>

        {/* Top 5 brands */}
        <div style={{ padding: "18px 20px", borderRight: "1px solid rgba(0,0,0,0.05)" }}>
          <SectionLabel>Top Brands by LLM Recall</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {top5.map((b, i) => {
              const maxApps = top5[0]?.appearances ?? 1;
              const barPct = (b.appearances / maxApps) * 100;
              return (
                <div key={b.brand}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: i < 3 ? bg : "rgba(0,0,0,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700,
                      color: i < 3 ? color : "rgba(0,0,0,0.3)",
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#000", flex: 1 }}>{b.brand}</span>
                    <span style={{ fontSize: 11.5, color: "rgba(0,0,0,0.38)", fontWeight: 500, flexShrink: 0 }}>
                      {b.appearances} mentions
                    </span>
                  </div>
                  <div style={{ marginLeft: 30, height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${barPct}%`, background: CHART_COLORS[i] ?? color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
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
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  formatter={(v: string) => <span style={{ fontSize: 11.5, color: "#000" }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.3)", fontSize: 13 }}>
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
                tick={{ fontSize: 10.5, fill: "rgba(0,0,0,0.4)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10.5, fill: "rgba(0,0,0,0.4)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
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
          <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.3)", fontSize: 13 }}>
            Not enough data points yet
          </div>
        )}
        {/* Legend */}
        {top5Names.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10 }}>
            {top5Names.map((brand, i) => (
              <div key={brand} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "rgba(0,0,0,0.55)" }}>
                <span style={{ display: "inline-block", width: 18, height: 2.5, borderRadius: 2, background: CHART_COLORS[i] ?? color }} />
                {brand}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Row 3: Feature scores ───────────────────────────────────────────── */}
      {hasFeatures && (
        <div style={{ borderBottom: hasSentiment ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
          <div style={{ padding: "14px 20px 10px" }}>
            <SectionLabel>Product Feature Scores</SectionLabel>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px 8px 20px", fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(0,0,0,0.05)", width: 28 }}>#</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>Brand</th>
                  {featureDefs.map(f => (
                    <th key={f.feature_id} style={{ textAlign: "center", padding: "8px 10px", fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 9.5, letterSpacing: "0.04em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(0,0,0,0.05)", whiteSpace: "nowrap" as const }}>
                      {f.feature_name.split(" ").slice(0, 3).join(" ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {top5.map((b, i) => (
                  <tr key={b.brand} style={{ borderBottom: i < top5.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                    <td style={{ padding: "10px 10px 10px 20px", color: "rgba(0,0,0,0.28)", fontSize: 12, fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#000", whiteSpace: "nowrap" as const }}>{b.brand}</td>
                    {featureDefs.map(f => {
                      const s = scoreMap.get(`${b.brand}::${f.feature_id}`);
                      // Compute rank among all brands in this cluster for this feature
                      const rankedBrands = clusterBrands
                        .map(bx => ({ brand: bx.brand, score: scoreMap.get(`${bx.brand}::${f.feature_id}`)?.score }))
                        .filter((bx): bx is { brand: string; score: number } => bx.score !== null && bx.score !== undefined)
                        .sort((a, c) => c.score - a.score);
                      const rank  = rankedBrands.findIndex(bx => bx.brand === b.brand) + 1;
                      const total = rankedBrands.length;
                      return (
                        <td key={f.feature_id} style={{ padding: "10px", textAlign: "center" }}>
                          {s ? (
                            <ScorePill
                              band={s.score_band}
                              score={s.score}
                              onClick={s.score !== null ? () => onScoreClick({
                                brand:       b.brand,
                                featureName: f.feature_name,
                                featureId:   f.feature_id,
                                score:       s.score,
                                scoreBand:   s.score_band,
                                evidence:    s.evidence,
                                domain,
                                rank,
                                total,
                              }) : undefined}
                            />
                          ) : (
                            <span style={{ color: "rgba(0,0,0,0.15)", fontSize: 12 }}>–</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Row 4: Sentiment ────────────────────────────────────────────────── */}
      {hasSentiment && (
        <div style={{ padding: "18px 20px" }}>
          <SectionLabel>Sentiment Analysis</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sentimentRows.map(r => {
              const posW = r.total_count > 0 ? (r.positive_count / r.total_count) * 100 : 0;
              const neuW = r.total_count > 0 ? (r.neutral_count  / r.total_count) * 100 : 0;
              const negW = r.total_count > 0 ? (r.negative_count / r.total_count) * 100 : 0;
              return (
                <div key={r.brand_name}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
                    <span style={{ width: 130, fontSize: 13, fontWeight: 700, color: "#000", flexShrink: 0 }}>{r.brand_name}</span>
                    <div style={{ flex: 1, height: 7, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                      <div style={{ width: `${posW}%`, height: "100%", background: "#16a34a" }} />
                      <div style={{ width: `${neuW}%`, height: "100%", background: "#d97706" }} />
                      <div style={{ width: `${negW}%`, height: "100%", background: "#dc2626" }} />
                    </div>
                    <span style={{ width: 36, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>
                      {Math.round(posW)}%
                    </span>
                  </div>
                  {r.top_descriptors.length > 0 && (
                    <div style={{ marginLeft: 144, display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {r.top_descriptors.map((d, di) => (
                        <span key={di} style={{ fontSize: 11, padding: "2px 9px", borderRadius: 20, border: "1px solid rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.5)" }}>{d}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SageCharts({
  marketingSOV, marketingFeatures, marketingFeatureDefs,
  marketingClusters, marketingCoverage, marketingSOVAll,
  salesClusters, salesFeatures, salesCoverage, salesSOV, salesSentiment, salesFeatureDefs,
  dexifyClusters, dexifyFeatures, dexifyFeatureDefs, dexifySentiment,
  skincareClusters,
}: Props) {
  const [domain,     setDomain]     = useState<DomainId | null>(null);
  const [cluster,    setCluster]    = useState<string | null>(null);
  const [scoreModal, setScoreModal] = useState<ModalScore | null>(null);

  const openScore  = useCallback((info: ModalScore) => setScoreModal(info), []);
  const closeScore = useCallback(() => setScoreModal(null), []);

  const activeDomain   = DOMAINS.find(d => d.id === domain);
  const activeClusters = domain ? CLUSTERS[domain] : ({} as Record<string, string>);

  function selectDomain(id: DomainId) {
    setDomain(id);
    setCluster(null);
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

  function getScoreMap(dom: DomainId, tag: string): Map<string, { score: number | null; score_band: string; evidence: string | null }> {
    const map = new Map<string, { score: number | null; score_band: string; evidence: string | null }>();
    const rows = dom === "sales" ? salesFeatures : dom === "marketing" ? marketingFeatures : dom === "dexify" ? dexifyFeatures : [];
    for (const r of rows) {
      if (r.feature_tag === tag) map.set(`${r.brand_name}::${r.feature_id}`, { score: r.score, score_band: r.score_band, evidence: r.evidence });
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
    <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <aside style={{
        width: 192, background: "#0F1117", flexShrink: 0,
        display: "flex", flexDirection: "column", overflowY: "auto",
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, #7C3AED, #BE185D)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: "#fff",
            }}>S</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14.5, lineHeight: 1.2 }}>Sage</div>
              <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 10, marginTop: 2 }}>by AgenticLib</div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 20, padding: "3px 8px",
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Domain nav */}
        <nav style={{ padding: "16px 10px", flex: 1 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10, paddingLeft: 8 }}>
            Domains
          </div>
          {DOMAINS.map(d => {
            const isActive = domain === d.id;
            const domClusters = CLUSTERS[d.id as DomainId];
            return (
              <div key={d.id}>
                <button
                  onClick={() => selectDomain(d.id as DomainId)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 9,
                    padding: "9px 10px", borderRadius: 9, marginBottom: 2,
                    background: isActive ? `rgba(${d.rgb}, 0.15)` : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                    color: isActive ? d.color : "rgba(255,255,255,0.45)",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <span style={{ flexShrink: 0, display: "flex" }}><DomainIcon id={d.id} /></span>
                  <span style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500, flex: 1 }}>{d.label}</span>
                  {isActive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.color, flexShrink: 0 }} />}
                </button>
                {isActive && (
                  <div style={{ paddingLeft: 14, marginBottom: 6 }}>
                    <button
                      onClick={() => setCluster(null)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 7,
                        padding: "5px 10px", borderRadius: 7, marginBottom: 2,
                        background: cluster === null ? `rgba(${d.rgb}, 0.12)` : "transparent",
                        border: "none", cursor: "pointer", textAlign: "left",
                        color: cluster === null ? d.color : "rgba(255,255,255,0.3)",
                        fontSize: 12, fontWeight: cluster === null ? 700 : 400,
                        transition: "all 0.1s",
                      }}
                    >
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: cluster === null ? d.color : "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                      All use cases
                    </button>
                    {Object.entries(domClusters).map(([tag, lbl]) => (
                      <button
                        key={tag}
                        onClick={() => setCluster(cluster === tag ? null : tag)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 7,
                          padding: "5px 10px", borderRadius: 7, marginBottom: 2,
                          background: cluster === tag ? `rgba(${d.rgb}, 0.12)` : "transparent",
                          border: "none", cursor: "pointer", textAlign: "left",
                          color: cluster === tag ? d.color : "rgba(255,255,255,0.3)",
                          fontSize: 12, fontWeight: cluster === tag ? 600 : 400,
                          transition: "all 0.1s",
                        }}
                      >
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: cluster === tag ? d.color : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                        {lbl}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1, background: "#F3F4F9", overflowY: "auto", padding: "22px 20px" }}>
        {!domain ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg, rgba(124,58,237,0.10), rgba(190,24,93,0.10))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="rgba(0,0,0,0.22)" strokeWidth="2"/>
                <path d="M21 21l-4-4" stroke="rgba(0,0,0,0.22)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#000", margin: "0 0 6px" }}>Select a domain to get started</p>
              <p style={{ fontSize: 13.5, color: "rgba(0,0,0,0.4)", margin: 0 }}>Choose Sales AI, Marketing AI, Tradie AI, or Skincare AI from the sidebar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: "#000", margin: 0, letterSpacing: "-0.02em" }}>
                  {activeDomain?.label} Intelligence
                </h1>
                {cluster && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: activeDomain?.bg, color: activeDomain?.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {activeClusters[cluster]}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)", margin: 0 }}>
                {cluster
                  ? `Filtered to: ${activeClusters[cluster]}`
                  : `${Object.keys(activeClusters).length} use cases · select one in the sidebar to focus`}
              </p>
            </div>

            {/* Use case cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(domain === "sales" || domain === "marketing") ? (
                // ── Sales + Marketing: rich cards with charts ──────────────
                Object.entries(visibleClusters).map(([tag, lbl]) => {
                  const isMkt = domain === "marketing";
                  const clusterBrands = (isMkt ? marketingClusters : salesClusters)
                    .filter(r => r.bucket_tag === tag)
                    .sort((a, b) => a.avg_position - b.avg_position);
                  const clusterCoverage = (isMkt ? marketingCoverage : salesCoverage).filter(r => r.bucket_tag === tag);
                  const clusterSOV      = (isMkt ? marketingSOVAll : salesSOV).filter(r => r.bucket_tag === tag).sort((a, b) => b.sov_pct - a.sov_pct);
                  const clusterSentiment = isMkt ? [] : salesSentiment.filter(r => r.bucket_tag === tag);
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
                          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: activeDomain?.color }}>{lbl}</span>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(0,0,0,0.28)", fontWeight: 500 }}>
                          {brands.length > 0 ? `${brands.length} brands ranked` : "No data yet"}
                        </span>
                      </div>

                      {brands.length === 0 ? (
                        <div style={{ padding: "18px", display: "flex", alignItems: "center", gap: 8, color: "rgba(0,0,0,0.3)" }}>
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>No data collected yet for this use case</span>
                        </div>
                      ) : domain === "dexify" && hasFeatures ? (
                        <div>
                          {featureDefs.map(f => (
                            <div key={f.feature_id} style={{ padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                              <div style={{ fontWeight: 700, fontSize: 13.5, color: "#000", marginBottom: 14 }}>{f.feature_name}</div>
                              {brands.map((b, bi) => {
                                const s = scoreMap.get(`${b.brand}::${f.feature_id}`);
                                const isNotDoc = !s || s.score_band === "not_documented";
                                const barPct   = s?.score ?? 0;
                                const barColor = s?.score_band === "high" ? "#16a34a" : s?.score_band === "medium" ? "#d97706" : s?.score_band === "low" ? "#dc2626" : "rgba(0,0,0,0.10)";
                                const textColor = isNotDoc ? "rgba(0,0,0,0.25)" : barColor;
                                return (
                                  <div key={b.brand} style={{ marginBottom: bi < brands.length - 1 ? 16 : 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: s?.evidence ? 5 : 0 }}>
                                      <span style={{ width: 130, fontSize: 13, fontWeight: 500, color: "#000", flexShrink: 0, lineHeight: 1.3 }}>{b.brand}</span>
                                      <div style={{ flex: 1, height: 7, background: "rgba(0,0,0,0.07)", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${barPct}%`, background: barColor, borderRadius: 4 }} />
                                      </div>
                                      <span style={{ width: 32, textAlign: "right", fontSize: 14, fontWeight: 700, color: textColor, flexShrink: 0 }}>{s?.score ?? "–"}</span>
                                    </div>
                                    {s?.evidence && <div style={{ marginLeft: 144, fontSize: 12, color: "rgba(0,0,0,0.5)", lineHeight: 1.6 }}>{s.evidence}</div>}
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
                                      <span style={{ width: 130, fontSize: 13, fontWeight: 700, color: "#000", flexShrink: 0 }}>{r.brand_name}</span>
                                      <div style={{ flex: 1, height: 7, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                                        <div style={{ width: `${posW}%`, height: "100%", background: "#16a34a" }} />
                                        <div style={{ width: `${neuW}%`, height: "100%", background: "#d97706" }} />
                                        <div style={{ width: `${negW}%`, height: "100%", background: "#dc2626" }} />
                                      </div>
                                      <span style={{ width: 36, textAlign: "right", fontSize: 14, fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>{Math.round(posW)}%</span>
                                    </div>
                                    {r.top_descriptors.length > 0 && (
                                      <div style={{ marginLeft: 144, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {r.top_descriptors.map((d, di) => {
                                          const isUnique = r.unique_flags[di] === "true";
                                          return (
                                            <span key={di} style={{ fontSize: 11.5, padding: "3px 10px", borderRadius: 20, fontWeight: isUnique ? 600 : 400, background: isUnique ? `rgba(${activeDomain?.rgb},0.10)` : "transparent", border: isUnique ? `1px solid rgba(${activeDomain?.rgb},0.25)` : "1px solid rgba(0,0,0,0.15)", color: isUnique ? activeDomain?.color : "rgba(0,0,0,0.5)" }}>
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
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                                <th style={{ textAlign: "left", padding: "8px 10px 8px 18px", fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(0,0,0,0.05)", width: 30 }}>#</th>
                                <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>Brand</th>
                                {featureDefs.map(f => (
                                  <th key={f.feature_id} style={{ textAlign: "center", padding: "8px 10px", fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase" as const, borderBottom: "1px solid rgba(0,0,0,0.05)", whiteSpace: "nowrap" as const }}>
                                    {f.feature_name.split(" ").slice(0, 3).join(" ")}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {brands.map((b, i) => (
                                <tr key={b.brand} style={{ borderBottom: i < brands.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                                  <td style={{ padding: "10px 10px 10px 18px", color: "rgba(0,0,0,0.28)", fontSize: 12, fontWeight: 600 }}>{b.rank}</td>
                                  <td style={{ padding: "10px 12px", fontWeight: 600, color: "#000", whiteSpace: "nowrap" as const }}>{b.brand}</td>
                                  {featureDefs.map(f => {
                                    const s = scoreMap.get(`${b.brand}::${f.feature_id}`);
                                    return (
                                      <td key={f.feature_id} style={{ padding: "10px", textAlign: "center" }}>
                                        {s ? <span title={s.evidence ?? undefined}><ScorePill band={s.score_band} score={s.score} /></span> : <span style={{ color: "rgba(0,0,0,0.15)", fontSize: 12 }}>–</span>}
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
                              <span style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: b.rank <= 3 ? activeDomain?.bg : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: b.rank <= 3 ? activeDomain?.color : "rgba(0,0,0,0.3)" }}>
                                {b.rank}
                              </span>
                              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#000" }}>{b.brand}</span>
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
              <div style={{ marginTop: 18, display: "flex", gap: 16, flexWrap: "wrap", padding: "12px 16px", background: "#fff", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)", alignItems: "center" }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(0,0,0,0.32)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Feature Score</span>
                {[["#16a34a", "High (80–100)"], ["#d97706", "Medium (40–79)"], ["#dc2626", "Low (0–39)"], ["rgba(0,0,0,0.12)", "Not documented"]].map(([color, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "rgba(0,0,0,0.4)" }}>
                    <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: color }} />
                    {label}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <aside style={{ width: 210, background: "#fff", borderLeft: "1px solid rgba(0,0,0,0.07)", padding: "22px 14px", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(0,0,0,0.28)", marginBottom: 18 }}>
          Overview
        </div>

        {!domain ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DOMAINS.map(d => (
              <button key={d.id} onClick={() => selectDomain(d.id as DomainId)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 10, border: `1px solid rgba(${d.rgb}, 0.18)`, background: d.bg, cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.15s" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(0,0,0,0.38)", marginTop: 1 }}>{Object.keys(CLUSTERS[d.id as DomainId]).length} use cases</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div style={{ background: activeDomain?.bg, borderRadius: 12, padding: "14px 14px", marginBottom: 22, border: `1px solid rgba(${activeDomain?.rgb}, 0.15)` }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: activeDomain?.color, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{activeDomain?.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#000", lineHeight: 1, marginBottom: 4 }}>{Object.keys(activeClusters).length}</div>
              <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>Use cases tracked</div>
            </div>

            {domain === "sales" && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,0,0,0.28)", marginBottom: 12 }}>Data Coverage</div>
                {[
                  { label: "Brand recall days", value: `${[...new Set(salesCoverage.map(r => r.date))].length}` },
                  { label: "Brands tracked", value: `${[...new Set(salesClusters.map(r => r.brand))].length}` },
                  { label: "Feature scores", value: `${salesFeatures.length}` },
                  { label: "Sentiment", value: salesSentiment.length > 0 ? "Live" : "Pending" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: 12.5 }}>
                    <span style={{ color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: "#000", fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,0,0,0.28)", marginBottom: 10 }}>Use Cases</div>
              {Object.entries(activeClusters).map(([tag, lbl]) => {
                const count = domain === "sales"
                  ? salesClusters.filter(r => r.bucket_tag === tag).length
                  : getBrands(domain, tag).length;
                const isSelected = cluster === tag;
                return (
                  <button key={tag} onClick={() => setCluster(isSelected ? null : tag)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, marginBottom: 3, background: isSelected ? activeDomain?.bg : "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.12s" }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.03)"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 12.5, fontWeight: isSelected ? 700 : 400, color: isSelected ? activeDomain?.color : "rgba(0,0,0,0.55)", lineHeight: 1.3 }}>{lbl}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 6, color: count > 0 ? activeDomain?.color : "rgba(0,0,0,0.2)", background: count > 0 ? activeDomain?.bg : "rgba(0,0,0,0.04)", borderRadius: 20, padding: "1px 8px" }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </aside>
    </div>

    {/* Feature detail panel — renders on top of everything */}
    {scoreModal && <FeatureDetailPanel info={scoreModal} onClose={closeScore} />}
    </>
  );
}
