"use client";

import { useState } from "react";
import type { PerceptionGap, FeatureScoreRow } from "@/lib/brand-visibility/db";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const NAVY   = "#000000";
const PURPLE = "#6B4FBB";

// 22 visually distinct colors, one per brand slot — no cycling, no repeats.
// Hues spread across the full wheel; lightness varied within similar-hue pairs
// to keep them apart even on a white background.
const LINE_COLORS = [
  "#6B4FBB", // 1.  purple
  "#E8447A", // 2.  raspberry
  "#2563EB", // 3.  blue
  "#059669", // 4.  emerald
  "#DC2626", // 5.  red
  "#D97706", // 6.  amber
  "#0891B2", // 7.  cyan
  "#C026D3", // 8.  fuchsia
  "#EA580C", // 9.  orange
  "#0D9488", // 10. teal
  "#7C3AED", // 11. violet
  "#65A30D", // 12. lime
  "#0369A1", // 13. dark blue
  "#92400E", // 14. brown
  "#BE185D", // 15. dark rose
  "#F43F5E", // 16. vivid rose
  "#84CC16", // 17. chartreuse
  "#FB923C", // 18. peach
  "#818CF8", // 19. periwinkle
  "#34D399", // 20. mint
  "#F472B6", // 21. pink
  "#38BDF8", // 22. sky blue
];

function lineColor(i: number) { return LINE_COLORS[i % LINE_COLORS.length]; }

// ── Seed data: realistic placeholder shown when no real data is available ──────
// Gives the chart visual content from day one instead of a dashed empty box.
const SEED_BRANDS = ["HubSpot", "Marketo", "Jasper", "Drift", "Klaviyo", "Copy.ai"];
const SEED_BASES  = [88, 58, 50, 44, 42, 40];

function makeSeedRows(): Record<string, string | number>[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const date = d.toISOString().split("T")[0];
    const row: Record<string, string | number> = { date };
    SEED_BRANDS.forEach((brand, bi) => {
      const wave = Math.round(SEED_BASES[bi] * 0.13 * Math.sin((i + bi * 2) * 0.85));
      row[brand] = Math.max(0, SEED_BASES[bi] + wave);
    });
    return row;
  });
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface DailyRow {
  date: string;
  brand: string;
  model: string;
  mention_count: number;
  avg_position: number | null;
  confidence: string;
  rank?: number;
  dominant_tag?: string;
}

interface SOVRow {
  brand: string;
  bucket_tag: string;
  total_appearances: number;
  sov_pct: number;
}

interface BrandPositionRow {
  brand_name: string;
  display_name: string;
  rank: number;
  dominant_tag: string;
  overall_avg_pos: number | null;
  cluster_avg_pos: number | null;
}

interface WeeklyRow {
  brand: string;
  model: string;
  mention_count: number;
  avg_position: number | null;
  confidence: string;
}

interface LLMVisRow {
  model: string;
  visibility_pct: number;
  total_responses: number;
}

interface SentimentRow {
  brand_name:      string;
  bucket_tag:      string;
  positive_count:  number;
  neutral_count:   number;
  negative_count:  number;
  total_count:     number;
  top_descriptors: string[];
}

const MARKETING_SENTIMENT_CLUSTERS = [
  { tag: "ads",       label: "Ads & Paid Campaigns" },
  { tag: "content",   label: "Content & Brand Voice" },
  { tag: "lifecycle", label: "Lifecycle & Retention" },
  { tag: "lead-gen",  label: "Lead-Gen & Funnel" },
];

interface Props {
  dailySummary: DailyRow[];
  weeklySummary: WeeklyRow[];
  llmVisibility: LLMVisRow[];
  brandPositions: BrandPositionRow[];
  sovData: SOVRow[];
  roiData: { brand: string; total_appearances: number; sov_pct: number }[];
  perceptionGaps: PerceptionGap[];
  featureScores: FeatureScoreRow[];
  sentimentData: {
    rows: SentimentRow[];
    meta: { dual_model_dates: number; earliest_date: string | null; latest_date: string | null };
  };
}

// ── Chart data helpers ─────────────────────────────────────────────────────────

function buildChartData(daily: DailyRow[]) {
  const dateSet = new Set<string>();
  const brandSet = new Set<string>();
  const index: Record<string, Record<string, number>> = {};
  const rankMap: Record<string, number> = {};
  const tagMap: Record<string, string> = {};

  for (const row of daily) {
    dateSet.add(row.date);
    brandSet.add(row.brand);
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
    if (row.rank !== undefined && rankMap[row.brand] === undefined) rankMap[row.brand] = row.rank;
    if (row.dominant_tag !== undefined && tagMap[row.brand] === undefined) tagMap[row.brand] = row.dominant_tag;
  }

  const dates = [...dateSet].sort();
  const hasRanks = Object.keys(rankMap).length > 0;
  const brands = [...brandSet].sort((a, b) => {
    if (hasRanks) return (rankMap[a] ?? 999) - (rankMap[b] ?? 999);
    const aT = dates.reduce((s, d) => s + (index[d]?.[a] ?? 0), 0);
    const bT = dates.reduce((s, d) => s + (index[d]?.[b] ?? 0), 0);
    return bT - aT;
  });

  const rows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const brand of brands) row[brand] = index[date]?.[brand] ?? 0;
    return row;
  });

  return { dates, brands, rows, tagMap };
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

const USE_CASE_CLUSTERS: { tag: string; label: string; promptHint: string; promptLabel?: string }[] = [
  { tag: "ads",       label: "Ads & Paid Campaigns",   promptHint: "Paid media run across platforms like Meta, Google, and TikTok, where you set a budget and pay to reach a targeted audience — with performance measured by how efficiently that spend converts into clicks, leads, or sales." },
  { tag: "content",   label: "Content & Brand Voice",  promptHint: "Marketing copy and creative — emails, ads, landing pages, and social posts — written and delivered in a consistent tone that reflects how a brand wants to sound to its audience." },
  { tag: "lifecycle", label: "Lifecycle & Retention Automation", promptHint: "Ongoing communication with existing contacts after they first engage — covering nurture sequences, re-engagement campaigns, and retention messaging sent through email, chat, or SMS." },
  { tag: "lead-gen",  label: "Lead-Gen & Funnel",      promptHint: "The process of attracting potential customers, qualifying whether they are a good fit, and moving them through a structured sequence of touchpoints until they are ready to speak with sales." },
  { tag: "analytics", label: "Analytics & Attribution",promptHint: "Marketing performance reporting and attribution" },
  { tag: "seo",       label: "SEO & Organic Content",  promptHint: "SEO and organic search visibility" },
  { tag: "social",    label: "Social Media",           promptHint: "End-to-end social media management" },
];

function ClusterTrendCard({
  cluster, brands, rows, brandColor, getDisplayName,
}: {
  cluster: typeof USE_CASE_CLUSTERS[number];
  brands: string[];
  rows: Record<string, string | number>[];
  brandColor: (b: string) => string;
  getDisplayName: (b: string) => string;
}) {
  const [hidden, setHidden] = useState(new Set<string>());
  const toggle = (b: string) => setHidden(prev => { const n = new Set(prev); n.has(b) ? n.delete(b) : n.add(b); return n; });

  if (brands.length === 0) return null;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
      padding: "24px 28px 16px",
    }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
          {cluster.label} — 7-Day Trend
        </h3>
        <p style={{ fontSize: 12, color: NAVY }}>{cluster.promptHint}</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(13,27,62,0.055)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fontSize: 11, fill: "rgba(13,27,62,0.42)" }}
            axisLine={false} tickLine={false} dy={6}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "rgba(13,27,62,0.42)" }}
            axisLine={false} tickLine={false} width={44}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(13,27,62,0.10)",
              fontSize: 12,
              boxShadow: "0 4px 16px rgba(13,27,62,0.12)",
              color: NAVY,
              background: "#fff",
            }}
            labelStyle={{ fontWeight: 700, marginBottom: 4 }}
            labelFormatter={v => fmtDate(String(v))}
            itemSorter={item => -(item.value as number)}
            formatter={(value, name) => [value, getDisplayName(String(name))]}
          />
          {brands.map(brand => (
            <Line
              key={brand}
              type="monotone"
              dataKey={brand}
              stroke={brandColor(brand)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              hide={hidden.has(brand)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 12, borderTop: "1px solid rgba(13,27,62,0.06)", paddingTop: 10, display: "flex", flexWrap: "wrap", gap: "5px 16px" }}>
        {brands.map(brand => {
          const color = brandColor(brand);
          const checked = !hidden.has(brand);
          return (
            <label key={brand} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <input
                type="checkbox" checked={checked} onChange={() => toggle(brand)}
                style={{ accentColor: color, width: 12, height: 12, cursor: "pointer", flexShrink: 0 }}
              />
              <span style={{ fontSize: 11, color: checked ? color : "#000000", fontWeight: checked ? 600 : 400 }}>
                {getDisplayName(brand)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

const SOV_OTHER_COLOR = "#CBD5E1";
const SOV_MIN_PCT = 3;
const SOV_CLUSTERS = ["ads", "content", "lifecycle", "lead-gen"];

function ClusterSOVCard({
  cluster, clusterRows, brandColorFn, getDisplayName,
}: {
  cluster: typeof USE_CASE_CLUSTERS[number];
  clusterRows: { brand: string; sov_pct: number | string }[];
  brandColorFn: (b: string) => string;
  getDisplayName: (b: string) => string;
}) {
  if (clusterRows.length === 0) return null;

  const sorted = [...clusterRows].sort((a, b) => Number(b.sov_pct) - Number(a.sov_pct));
  const main   = sorted.filter(r => Number(r.sov_pct) >= SOV_MIN_PCT);
  const others = sorted.filter(r => Number(r.sov_pct) <  SOV_MIN_PCT);
  const otherPct = others.reduce((s, r) => s + Number(r.sov_pct), 0);

  const slices = [
    ...main.map(r => ({
      name:  getDisplayName(r.brand),
      brand: r.brand,
      value: Number(r.sov_pct),
      color: brandColorFn(r.brand),
    })),
    ...(otherPct > 0 ? [{ name: "Other", brand: "_other", value: Math.round(otherPct * 10) / 10, color: SOV_OTHER_COLOR }] : []),
  ];

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
      padding: "20px 20px 16px",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
          {cluster.label}
        </h3>
        <p style={{ fontSize: 11, color: NAVY }}>{cluster.promptHint}</p>
        {cluster.promptLabel && (
          <p style={{ fontSize: 10, color: "#000000", marginTop: 3 }}>{cluster.promptLabel}</p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <Pie
            data={slices}
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="78%"
            dataKey="value"
            nameKey="name"
            stroke="none"
            paddingAngle={1}
            labelLine={false}
            label={(props) => {
              const { cx, cy, midAngle, innerRadius, outerRadius, value } = props as {
                cx: number; cy: number; midAngle: number;
                innerRadius: number; outerRadius: number; value: number;
              };
              const RADIAN = Math.PI / 180;
              const r = (innerRadius + outerRadius) / 2;
              const x = cx + r * Math.cos(-midAngle * RADIAN);
              const y = cy + r * Math.sin(-midAngle * RADIAN);
              return (
                <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700}>
                  {`${value.toFixed(0)}%`}
                </text>
              );
            }}
          >
            {slices.map((s, i) => <Cell key={i} fill={s.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(13,27,62,0.10)",
              fontSize: 12,
              boxShadow: "0 4px 16px rgba(13,27,62,0.12)",
              color: NAVY,
              background: "#fff",
            }}
            formatter={(value, name) => [`${Number(value).toFixed(1)}%`, String(name)]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
        {slices.map(s => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <span style={{ flexShrink: 0, display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: s.color }} />
              <span style={{ fontSize: 11, color: NAVY, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name}
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.brand === "_other" ? "#000000" : s.color, flexShrink: 0 }}>
              {s.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({
  children,
  accent = PURPLE,
  className = "",
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",
        borderRadius: 10,
        borderLeft: `4px solid ${accent}`,
        boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
        padding: "20px 24px",
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.1em",
      color: PURPLE,
      marginBottom: 10,
    }}>
      {children}
    </p>
  );
}

function BigNumber({ value, sub }: { value: string | number; sub?: string }) {
  return (
    <>
      <p style={{
        fontSize: 54,
        fontWeight: 800,
        color: NAVY,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        marginBottom: sub ? 8 : 0,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: "#000000" }}>{sub}</p>
      )}
    </>
  );
}

function EmptySlate({ message = "Collecting data…" }: { message?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
      {/* Tiny bar-chart glyph */}
      <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
        <rect x="0" y="8"  width="4" height="8" rx="1" fill={PURPLE} opacity="0.25" />
        <rect x="5" y="4"  width="4" height="12" rx="1" fill={PURPLE} opacity="0.40" />
        <rect x="10" y="1" width="4" height="15" rx="1" fill={PURPLE} opacity="0.55" />
        <rect x="15" y="6" width="3" height="10" rx="1" fill={PURPLE} opacity="0.35" />
      </svg>
      <p style={{ fontSize: 13, color: "#000000" }}>{message}</p>
    </div>
  );
}


// ── Feature Scores Preview ─────────────────────────────────────────────────────

const FEATURE_TAG_ORDER = ["ads", "content", "lead-gen", "lifecycle", "technical", "responsible-ai", "cost"];
const FEATURE_TAG_LABEL: Record<string, string> = {
  "ads":            "Paid Advertising",
  "content":        "Content & Copy",
  "lead-gen":       "Lead Generation",
  "lifecycle":      "Lifecycle & Retention",
  "technical":      "Technical Capabilities",
  "responsible-ai": "Responsible AI",
  "cost":           "Cost Efficiency",
};
const FEATURE_LABEL: Record<string, string> = {
  ads_budget_pacing:               "Budget pacing & allocation",
  ads_meta_google_native:          "Meta & Google native ads",
  ads_tiktok_support:              "TikTok ads support",
  content_channel_formats:         "Multi-channel content formats",
  content_style_training:          "Style & voice training",
  content_variant_testing:         "Content variant testing",
  leadgen_ab_testing:              "A/B testing for lead capture",
  leadgen_crm_sync:                "CRM sync & data enrichment",
  leadgen_email_deliverability:    "Email deliverability controls",
  leadgen_intent_signals:          "Intent signal detection",
  lifecycle_channel_orchestration: "Multi-channel orchestration",
  lifecycle_churn_detection:       "Churn prediction & detection",
  lifecycle_send_time:             "Send-time optimisation",
  rai_change_log:                  "Audit log & change tracking",
  rai_data_retention:              "Data retention controls",
  rai_soc2_gdpr:                   "SOC 2 & GDPR compliance",
  tech_public_api:                 "Public API availability",
  tech_sso_enterprise:             "SSO & enterprise auth",
  tech_webhook_support:            "Webhook support",
  cost_free_tier:                  "Free tier accessibility",
  cost_pricing_transparency:       "Pricing transparency",
};

function truncateEvidence(text: string): string {
  const LIMIT = 300;
  if (text.length <= LIMIT) return text;
  const cut = text.lastIndexOf('. ', LIMIT);
  return cut > LIMIT / 2 ? text.slice(0, cut + 1) : text.slice(0, LIMIT) + '…';
}

function scoreBarColor(score: number): string {
  if (score >= 75) return "#059669";
  if (score >= 50) return "#2563EB";
  if (score >= 25) return "#D97706";
  return "#DC2626";
}

function FeatureScoresSection({ featureScores }: { featureScores: FeatureScoreRow[] }) {
  const [open, setOpen] = useState(true);

  const grouped = new Map<string, Map<string, { brand_name: string; score: number; grounded_source: boolean; evidence: string | null }[]>>();
  for (const row of featureScores) {
    if (!grouped.has(row.feature_tag)) grouped.set(row.feature_tag, new Map());
    const fMap = grouped.get(row.feature_tag)!;
    if (!fMap.has(row.feature_id)) fMap.set(row.feature_id, []);
    fMap.get(row.feature_id)!.push({ brand_name: row.brand_name, score: row.score, grounded_source: row.grounded_source, evidence: row.evidence });
  }

  const orderedTags = FEATURE_TAG_ORDER.filter(t => grouped.has(t));
  if (orderedTags.length === 0) return null;

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 28px", background: "none", border: "none", cursor: "pointer",
            borderBottom: open ? "1px solid rgba(0,0,0,0.06)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#000000" }}>Product Feature Scores</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              background: "rgba(124,58,237,0.10)", color: "#7C3AED",
              padding: "2px 8px", borderRadius: 4,
            }}>
              Preview
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontWeight: 500 }}>
              2 days of data · scores update daily
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
            >
              <path d="M4 6l4 4 4-4" stroke="#6B4FBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        {open && (
          <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 32 }}>
            {orderedTags.map(tag => {
              const fMap = grouped.get(tag)!;
              return (
                <div key={tag}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase" as const, color: "#7C3AED", marginBottom: 16,
                  }}>
                    {FEATURE_TAG_LABEL[tag] ?? tag}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {[...fMap.entries()].map(([featureId, brands]) => {
                      const sorted = [...brands].sort((a, b) => b.score - a.score);
                      return (
                        <div key={featureId}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#000000", marginBottom: 10 }}>
                            {FEATURE_LABEL[featureId] ?? featureId}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {sorted.map(({ brand_name, score, grounded_source, evidence }) => (
                              <div key={brand_name}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ width: 120, fontSize: 11, color: "rgba(0,0,0,0.55)", flexShrink: 0, textAlign: "right" }}>
                                    {brand_name}
                                  </div>
                                  <div style={{ flex: 1, background: "rgba(0,0,0,0.06)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                                    <div style={{
                                      width: `${score}%`, height: "100%",
                                      background: scoreBarColor(score), borderRadius: 4,
                                    }} />
                                  </div>
                                  <div style={{ width: 40, fontSize: 11, fontWeight: 700, color: scoreBarColor(score), textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                                    {score}
                                    {grounded_source && (
                                      <span
                                        title="Score informed by live web search of product documentation"
                                        style={{ fontSize: 10, cursor: "help", lineHeight: 1 }}
                                      >
                                        🔍
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {evidence && (
                                  <p style={{ paddingLeft: 130, fontSize: 11, color: "rgba(0,0,0,0.4)", lineHeight: 1.4, margin: "3px 0 0" }}>
                                    {truncateEvidence(evidence)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── dominant_tag overrides ─────────────────────────────────────────────────────
// Applied client-side when the DB value doesn't match the desired grouping.
// Update the DB via /api/brand-visibility/audit/patch-locked-agent to make permanent.
const TAG_OVERRIDES: Record<string, string> = {
  Persado: "content",
  Phrasee: "content",
};

// ── Main component ─────────────────────────────────────────────────────────────

const clusterLabel = (tag: string) => USE_CASE_CLUSTERS.find(c => c.tag === tag)?.label ?? tag;

export default function BrandVisibilityCharts({ dailySummary, weeklySummary, llmVisibility, brandPositions, sovData, roiData, perceptionGaps, featureScores, sentimentData }: Props) {
  const hasReal = dailySummary.length > 0;
  const { brands: realBrands, rows: realRows, tagMap: realTagMap } = buildChartData(dailySummary);

  const displayMap = Object.fromEntries(brandPositions.map(p => [p.brand_name, p.display_name]));
  const getDisplayName = (b: string) => displayMap[b] ?? b;

  // Chart uses real data if available, seed data otherwise so chart always renders
  const chartBrands  = hasReal ? realBrands.slice(0, 22) : SEED_BRANDS;
  const chartRows    = hasReal ? realRows : makeSeedRows();
  const chartTagMap  = { ...(hasReal ? realTagMap : {} as Record<string, string>), ...TAG_OVERRIDES };

  // Apply TAG_OVERRIDES to brandPositions for the position table grouping
  const overriddenPositions = brandPositions.map(p =>
    TAG_OVERRIDES[p.brand_name] ? { ...p, dominant_tag: TAG_OVERRIDES[p.brand_name] } : p
  );

  // Stable color per brand (by rank order) so main and cluster charts share colours
  const brandColorMap = Object.fromEntries(chartBrands.map((b, i) => [b, lineColor(i)]));
  const brandColor    = (b: string) => brandColorMap[b] ?? lineColor(0);

  // Brand filter state — all visible by default; toggled client-side, no re-fetch
  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());
  const [sentimentOpen, setSentimentOpen] = useState(false);
  const toggleBrand = (brand: string) =>
    setHiddenBrands(prev => { const n = new Set(prev); n.has(brand) ? n.delete(brand) : n.add(brand); return n; });
  const selectAll = () => setHiddenBrands(new Set());
  const clearAll  = () => setHiddenBrands(new Set(chartBrands));

  // Aggregate weekly by brand across models
  const weeklyByBrand: Record<string, { mention_count: number; avg_position: number | null; confidence: string }> = {};
  for (const row of weeklySummary) {
    const e = weeklyByBrand[row.brand];
    weeklyByBrand[row.brand] = {
      mention_count: (e?.mention_count ?? 0) + row.mention_count,
      avg_position: row.avg_position,
      confidence: row.confidence,
    };
  }
  const weeklyBrands = Object.entries(weeklyByBrand).sort((a, b) => b[1].mention_count - a[1].mention_count);
  const totalMentions = weeklyBrands.reduce((s, [, v]) => s + v.mention_count, 0);
  const hasWeekly = weeklyBrands.length > 0;

  // Most recent LLM visibility per model
  const latestVis: Record<string, { pct: number; total: number }> = {};
  for (const row of llmVisibility) {
    if (!latestVis[row.model]) latestVis[row.model] = { pct: row.visibility_pct, total: row.total_responses };
  }
  const visModels = Object.entries(latestVis);
  const hasVis = visModels.length > 0;

  // Best avg-position per brand for position card
  const topByPos = weeklyBrands
    .filter(([, s]) => s.avg_position != null)
    .sort((a, b) => (a[1].avg_position ?? 99) - (b[1].avg_position ?? 99))
    .slice(0, 6);

  // Per-brand 7-day mentions split by model
  const modelMentionsByBrand: Record<string, { claude: number; gpt: number }> = {};
  for (const row of dailySummary) {
    if (!modelMentionsByBrand[row.brand]) modelMentionsByBrand[row.brand] = { claude: 0, gpt: 0 };
    if (row.model === "claude-haiku-4-5") modelMentionsByBrand[row.brand].claude += row.mention_count;
    else modelMentionsByBrand[row.brand].gpt += row.mention_count;
  }
  const modelMentionsData = chartBrands
    .map(b => ({
      brand: b,
      name: getDisplayName(b),
      claude: modelMentionsByBrand[b]?.claude ?? 0,
      gpt:    modelMentionsByBrand[b]?.gpt    ?? 0,
    }))
    .filter(d => d.claude + d.gpt > 0)
    .sort((a, b) => (b.claude + b.gpt) - (a.claude + a.gpt));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 1: Metric cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>

        {/* Card 1 — Total mentions */}
        <Card accent={PURPLE}>
          <CardLabel>Brand Mentions · 7 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "—"}
            sub={hasWeekly
              ? `across ${weeklyBrands.length} brands · 2 models`
              : "Run starts collecting tonight at 3 AM UTC"
            }
          />
        </Card>

        {/* Card 3 — LLM visibility */}
        <Card accent={NAVY}>
          <CardLabel>LLM Visibility · 7 Days</CardLabel>
          {!hasVis ? (
            <EmptySlate />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {visModels.map(([model, { pct, total }], i) => {
                const label = model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? PURPLE : NAVY;
                return (
                  <div key={model}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#000000", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(13,27,62,0.07)" }}>
                      <div style={{ height: 5, borderRadius: 999, width: `${Math.min(pct, 100)}%`, background: color }} />
                    </div>
                    <p style={{ fontSize: 10, color: "#000000", marginTop: 4 }}>
                      {total} responses
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Row 2: 7-day trend chart ─────────────────────────────────────────── */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
        padding: "24px 28px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
              Brand Mentions — 7-Day Trend
            </h3>
            <p style={{ fontSize: 12, color: "#000000" }}>
              {hasReal ? "Top 22 locked AI marketing agents · both models combined" : "Sample data — live chart populates after daily collection"}
            </p>
          </div>
          {!hasReal && (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
              letterSpacing: "0.08em", color: PURPLE, background: "rgba(107,79,187,0.10)",
              padding: "3px 8px", borderRadius: 999,
            }}>
              Preview
            </span>
          )}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(13,27,62,0.055)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 11, fill: "rgba(13,27,62,0.42)" }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "rgba(13,27,62,0.42)" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid rgba(13,27,62,0.10)",
                fontSize: 12,
                boxShadow: "0 4px 16px rgba(13,27,62,0.12)",
                color: NAVY,
              }}
              labelStyle={{ fontWeight: 700, marginBottom: 4 }}
              labelFormatter={v => fmtDate(String(v))}
              formatter={(value, name) => [value, getDisplayName(String(name))]}
            />
            {chartBrands.map((brand) => (
              <Line
                key={brand}
                type="monotone"
                dataKey={brand}
                stroke={brandColor(brand)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                hide={hiddenBrands.has(brand)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Interactive brand filter */}
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(13,27,62,0.06)", paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#000000" }}>
              Brands
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={selectAll} style={{ fontSize: 10, fontWeight: 600, color: PURPLE, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Select all
              </button>
              <button onClick={clearAll} style={{ fontSize: 10, fontWeight: 600, color: PURPLE, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Clear all
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
            {chartBrands.map((brand) => {
              const color = brandColor(brand);
              const checked = !hiddenBrands.has(brand);
              return (
                <label
                  key={brand}
                  style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand)}
                    style={{ accentColor: color, width: 12, height: 12, cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 11, color: checked ? color : "#000000", fontWeight: checked ? 600 : 400 }}>
                    {getDisplayName(brand)}
                  </span>
                </label>
              );
            })}
          </div>
          {hasReal && realBrands.length > 22 && (
            <p style={{ fontSize: 10, color: "#000000", marginTop: 8 }}>
              Showing top 22 of {realBrands.length} locked marketing agents.
            </p>
          )}
        </div>
      </div>

      {/* ── Row 2b: Brand mentions by model ─────────────────────────────────── */}
      {hasReal && modelMentionsData.length > 0 && (
        <div style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
          padding: "24px 28px 20px",
        }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
              Brand Mentions · 7 Days · by Model
            </h3>
            <p style={{ fontSize: 12, color: "#000000" }}>
              Total mentions per brand across Claude Haiku and GPT-4o mini
            </p>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: PURPLE, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: NAVY }}>Claude Haiku</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: NAVY, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: NAVY }}>GPT-4o mini</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={modelMentionsData.length * 28 + 10}>
            <BarChart
              layout="vertical"
              data={modelMentionsData}
              margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
              barSize={14}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 11, fill: NAVY }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid rgba(13,27,62,0.10)", fontSize: 12, color: NAVY }}
                formatter={(value, name) => [value, name === "claude" ? "Claude Haiku" : "GPT-4o mini"]}
              />
              <Bar dataKey="claude" stackId="a" fill={PURPLE} radius={[0, 0, 0, 0]} />
              <Bar dataKey="gpt"    stackId="a" fill={NAVY}   radius={[3, 3, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Rows 2c: Per-use-case cluster charts ────────────────────────────── */}
      {hasReal && USE_CASE_CLUSTERS.map(cluster => {
        const clusterBrands = chartBrands.filter(b => chartTagMap[b] === cluster.tag);
        return (
          <ClusterTrendCard
            key={cluster.tag}
            cluster={cluster}
            brands={clusterBrands}
            rows={chartRows}
            brandColor={brandColor}
            getDisplayName={getDisplayName}
          />
        );
      })}

      {/* ── Row 2c: Share of Voice donut charts (ads, content, overall, lead-gen) */}
      {hasReal && sovData.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {USE_CASE_CLUSTERS.filter(c => SOV_CLUSTERS.includes(c.tag)).map(cluster => (
            <ClusterSOVCard
              key={cluster.tag}
              cluster={cluster}
              clusterRows={cluster.tag === "lifecycle" ? roiData : sovData.filter(r => r.bucket_tag === cluster.tag)}
              brandColorFn={brandColor}
              getDisplayName={getDisplayName}
            />
          ))}
        </div>
      )}

      {/* ── Row 2d: Perception Gaps ─────────────────────────────────────────── */}
      {hasReal && (
        <div style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(13,27,62,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>
              Perception Gaps — where LLM visibility and reality diverge
            </h3>
            <p style={{ fontSize: 12, color: "#000000" }}>
              Brands where AI share of voice and documented capability tell different stories.
            </p>
          </div>
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {perceptionGaps.length === 0 && (
              <p style={{ fontSize: 13, color: "#000000", fontStyle: "italic" }}>
                No perception gaps detected — check /api/brand-visibility/audit/perception-gaps for diagnostics.
              </p>
            )}
            {perceptionGaps.map((gap, i) => {
              const label = clusterLabel(gap.cluster_tag);
              const explanation = `${gap.display_name} appears consistently in ${label} brand coverage but holds less than 3% share of voice when buyers ask specifically about ${label} — present in the conversation but not owning it.`;
              return (
                <div key={`${gap.brand_name}-${i}`} style={{
                  borderLeft: "3px solid #F59E0B",
                  background: "rgba(245,158,11,0.04)",
                  borderRadius: "0 6px 6px 0",
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{gap.display_name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
                      letterSpacing: "0.07em", padding: "2px 7px", borderRadius: 4,
                      background: "rgba(245,158,11,0.12)",
                      color: "#B45309",
                    }}>
                      SOV gap
                    </span>
                    <span style={{ fontSize: 11, color: "#000000" }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#000000", lineHeight: 1.55, margin: 0 }}>
                    {explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Row 3a: Average position by use case ────────────────────────────── */}
      {overriddenPositions.length > 0 && (() => {
        const fmt = (v: number | string | null) => v != null ? Number(v).toFixed(1) : "—";
        return (
          <div style={{
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
            overflow: "hidden",
          }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(13,27,62,0.07)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>
                Brand Position Summary
              </h3>
              <p style={{ fontSize: 12, color: "#000000" }}>
                Avg position in AI responses (1 = first mentioned). Lower is better.
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(13,27,62,0.07)" }}>
                    {["#", "Brand", "Use Case", "Overall", "In Use Case"].map((h, i) => (
                      <th key={h} style={{
                        padding: "10px 20px",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.07em",
                        color: "#000000",
                        textAlign: i === 0 ? "center" : i >= 3 ? "right" : "left",
                        background: "rgba(13,27,62,0.018)",
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const tagOrder = USE_CASE_CLUSTERS.map(c => c.tag);
                    const knownTags = new Set(tagOrder);
                    const grouped = [
                      ...tagOrder.map(tag => ({
                        tag,
                        brands: overriddenPositions.filter(p => p.dominant_tag === tag).sort((a, b) => a.rank - b.rank),
                      })).filter(g => g.brands.length > 0),
                      ...(overriddenPositions.some(p => !knownTags.has(p.dominant_tag))
                        ? [{ tag: "_other", brands: overriddenPositions.filter(p => !knownTags.has(p.dominant_tag)).sort((a, b) => a.rank - b.rank) }]
                        : []),
                    ];
                    return grouped.map((group, gi) => [
                      <tr key={`hdr-${group.tag}`} style={{
                        background: "rgba(13,27,62,0.025)",
                        borderTop: gi > 0 ? "1px solid rgba(13,27,62,0.09)" : undefined,
                        borderBottom: "1px solid rgba(13,27,62,0.07)",
                      }}>
                        <td colSpan={5} style={{ padding: "5px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#000000" }}>
                          {clusterLabel(group.tag)}
                        </td>
                      </tr>,
                      ...group.brands.map((p, i) => {
                        const color = brandColorMap[p.brand_name] ?? lineColor(overriddenPositions.findIndex(b => b.brand_name === p.brand_name));
                        const isLast = gi === grouped.length - 1 && i === group.brands.length - 1;
                        return (
                          <tr key={p.brand_name} style={{ borderBottom: !isLast ? "1px solid rgba(13,27,62,0.05)" : undefined }}>
                            <td style={{ padding: "11px 20px", textAlign: "center", color: "#000000", fontWeight: 700, fontSize: 11 }}>{p.rank}</td>
                            <td style={{ padding: "11px 20px", fontWeight: 600, color: NAVY, whiteSpace: "nowrap" }}>
                              <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, marginRight: 8, verticalAlign: "middle" }} />
                              {p.display_name}
                            </td>
                            <td style={{ padding: "11px 20px", color: "#000000", fontSize: 12 }}>
                              {clusterLabel(p.dominant_tag)}
                            </td>
                            <td style={{ padding: "11px 20px", textAlign: "right", fontWeight: 700, color: PURPLE }}>{fmt(p.overall_avg_pos)}</td>
                            <td style={{ padding: "11px 20px", textAlign: "right", color: "#000000" }}>{fmt(p.cluster_avg_pos)}</td>
                          </tr>
                        );
                      }),
                    ]);
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}


      <FeatureScoresSection featureScores={featureScores} />

      {/* ── AI Model Perception (marketing sentiment) ────────────────────────── */}
      {(() => {
        const { rows: sentimentRows, meta: sentimentMeta } = sentimentData;
        const GATE = 3;
        const daysHave = sentimentMeta.dual_model_dates ?? 0;
        const ready    = daysHave >= GATE;

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
                  {ready ? "Live" : "Collecting"}
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
                  How Claude Haiku and GPT-4o-mini describe each marketing AI brand · {sentimentDateLabel()}
                </p>
                {MARKETING_SENTIMENT_CLUSTERS.map(cluster => {
                  const brands = sentimentRows.filter(r => r.bucket_tag === cluster.tag);
                  if (brands.length === 0) return null;
                  return (
                    <div key={cluster.tag} style={{ marginBottom: 28 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: PURPLE, marginBottom: 14 }}>
                        {cluster.label}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {brands.map(brand => {
                          const total  = brand.total_count || 1;
                          const posPct = Math.round((brand.positive_count / total) * 100);
                          const neuPct = Math.round((brand.neutral_count  / total) * 100);
                          const negPct = 100 - posPct - neuPct;
                          return (
                            <div key={brand.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: NAVY, width: 120, flexShrink: 0 }}>
                                  {brand.brand_name}
                                </span>
                                <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden", display: "flex" }}>
                                  {posPct > 0 && <div style={{ width: `${posPct}%`, height: "100%", background: "#16a34a" }} />}
                                  {neuPct > 0 && <div style={{ width: `${neuPct}%`, height: "100%", background: "#d97706" }} />}
                                  {negPct > 0 && <div style={{ width: `${negPct}%`, height: "100%", background: "#dc2626" }} />}
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: posPct > 0 ? "#16a34a" : "rgba(0,0,0,0.4)", width: 34, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                                  {posPct}%
                                </span>
                              </div>
                              {brand.top_descriptors.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, paddingLeft: 130 }}>
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
                              )}
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
                    Both models · last 7 days · updates daily
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
