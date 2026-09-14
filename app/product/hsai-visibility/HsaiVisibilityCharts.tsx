"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell,
} from "recharts";
import type {
  HsaiTopBrandRow,
  HsaiClusterRow,
  HsaiModelRow,
  HsaiClusterTrendRow,
} from "@/lib/brand-visibility/db";
import { HSAI_FEATURES } from "@/lib/brand-visibility/hsai-features";

// ── Palette ────────────────────────────────────────────────────────────────────
const ACCENT = "#047857";  // safari/emerald green — Simbastack brand anchor
const CLAUDE = "#7C3AED";
const GPT    = "#2563EB";

const LINE_COLORS = [
  "#047857", "#EA580C", "#7C3AED", "#2563EB", "#DC2626",
  "#D97706", "#0891B2", "#C026D3", "#0D9488", "#BE185D",
  "#65A30D", "#0369A1", "#F43F5E", "#FB923C", "#818CF8",
];

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

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

// ── Use-case cluster config (for trend / pie charts) ───────────────────────────
const TREND_CLUSTERS: { tag: string; label: string; description: string }[] = [
  { tag: "hsai-booking",      label: "Booking & Reservations",      description: "Converting WhatsApp and email inquiries into confirmed bookings with live PMS availability" },
  { tag: "hsai-inquiry",      label: "Guest Inquiry & Concierge",   description: "24/7 AI answers to complex multi-intent guest questions about activities, transport, and experiences" },
  { tag: "hsai-multilingual", label: "Multilingual Support",        description: "Detecting and responding in guests' own language — French, German, Mandarin, and beyond" },
  { tag: "hsai-lead",         label: "Lead Capture & Nurture",      description: "Following up with prospects who received a quote but did not confirm" },
  { tag: "hsai-instay",       label: "In-stay & Upsell",            description: "Handling activity bookings, housekeeping, transport, and upsell offers during a guest's stay" },
  { tag: "hsai-ops",          label: "Operations & Back-office",    description: "Automating reservations management, check-in scheduling, and internal routing" },
  { tag: "hsai-str",          label: "Short-term & Vacation Rental", description: "Guest messaging and booking management for Airbnb and multi-property STR operators" },
  { tag: "hsai-pms",          label: "PMS & Channel Integration",   description: "Native connectivity with Cloudbeds, Mews, Opera, Guesty, and OTA channels like Airbnb/Booking.com" },
  { tag: "hsai-security",     label: "Security & Compliance",       description: "GDPR compliance, secure payment handling, and enterprise-grade data privacy" },
  { tag: "hsai-buyer-intent", label: "Buyer Intent",                description: "Decision-stage prompts: operators actively evaluating which AI agent to invest in" },
];

// Feature scoring clusters
const ALL_CLUSTERS: { tag: string; label: string }[] = [
  { tag: "hsai-messaging",    label: "Guest Messaging" },
  { tag: "hsai-booking",      label: "Booking & Reservations" },
  { tag: "hsai-multilingual", label: "Multilingual Support" },
  { tag: "hsai-inquiry",      label: "Inquiry Intelligence" },
  { tag: "hsai-staff-ops",    label: "Staff Operations & Back-office" },
  { tag: "hsai-pms",          label: "PMS & Channel Integration" },
  { tag: "hsai-concierge",    label: "In-stay & Concierge" },
  { tag: "hsai-upsell",       label: "Upsell & Revenue" },
  { tag: "hsai-security",     label: "Security & Compliance" },
  { tag: "hsai-technical",    label: "Technical Architecture" },
  { tag: "hsai-pricing",      label: "Pricing & ROI" },
];

// ── UI helpers ─────────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      height: 160, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 8, color: "#000",
      border: "1.5px dashed rgba(4,120,87,0.25)", borderRadius: 10,
    }}>
      <span style={{ fontSize: 28 }}>⏳</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

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
      }}>{label}</span>
      <span style={{
        fontSize: 28, fontWeight: 800, color: "#000",
        letterSpacing: "-0.02em", lineHeight: 1.1,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
      }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "#000", opacity: 0.6, marginTop: 2 }}>{sub}</span>}
    </div>
  );
}

// ── Dot bullet ────────────────────────────────────────────────────────────────
const Dot = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
    <span style={{ color: ACCENT, fontSize: 20, lineHeight: "1.45", flexShrink: 0, marginTop: 1, fontWeight: 900 }}>•</span>
    <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65, margin: 0 }}>{children}</p>
  </div>
);

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

interface BuyerIntentRow {
  brand:           string;
  total_mentions:  number;
  avg_position:    number | null;
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  topBrands:     HsaiTopBrandRow[];
  byCluster:     HsaiClusterRow[];
  byModel:       HsaiModelRow[];
  clusterTrend:  HsaiClusterTrendRow[];
  featureScores: FeatureScoreRow[];
  sentimentData: SentimentData;
  buyerIntent:   BuyerIntentRow[];
}

export default function HsaiVisibilityCharts({
  topBrands, byCluster, byModel, clusterTrend, featureScores, sentimentData, buyerIntent,
}: Props) {

  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());

  // ── Brand sets ───────────────────────────────────────────────────────────────
  const LOCKED_BRANDS = [
    "Asksuite", "HiJiffy", "Quicktext", "Akia", "Duve", "Alliants", "BookBoost",
    "Canary Technologies",
    "Jurny", "Hospitable", "HostAI",
  ];
  const LOCKED_SET = new Set(LOCKED_BRANDS);

  const LOCKED_COLORS: Record<string, string> = {
    "Asksuite":           "#EA580C",
    "HiJiffy":            "#7C3AED",
    "Quicktext":          "#2563EB",
    "Akia":               "#DC2626",
    "Duve":               "#D97706",
    "Alliants":           "#0891B2",
    "BookBoost":          "#C026D3",
    "Canary Technologies":"#92400E",  // deep amber — sole staff-ops competitor
    "Jurny":              "#0D9488",
    "Hospitable":         "#BE185D",
    "HostAI":             "#65A30D",
  };
  const brandColor = (brand: string) => LOCKED_COLORS[brand] ?? "#94a3b8";

  // ── Aggregate from clusterTrend ───────────────────────────────────────────
  const allDates = [...new Set(clusterTrend.map(r => r.date))].sort();

  const overallByBrand: Record<string, number> = {};
  const overallTrendMap: Record<string, Record<string, number>> = {};
  for (const r of clusterTrend) {
    if (!LOCKED_SET.has(r.brand)) continue;
    overallByBrand[r.brand] = (overallByBrand[r.brand] ?? 0) + r.mention_count;
    if (!overallTrendMap[r.date]) overallTrendMap[r.date] = {};
    overallTrendMap[r.date][r.brand] = (overallTrendMap[r.date][r.brand] ?? 0) + r.mention_count;
  }

  const sortedLocked = [...LOCKED_BRANDS].sort(
    (a, b) => (overallByBrand[b] ?? 0) - (overallByBrand[a] ?? 0)
  );

  // Dates where only one model collected (Claude API was exhausted Sep 8-9 2026).
  // Values are linearly interpolated between the nearest real days for display only.
  const GAP_DATES = new Set(["2026-09-08", "2026-09-09"]);

  const combinedTrendData = allDates.map((date, idx) => {
    const row: Record<string, string | number> = { date };

    if (GAP_DATES.has(date)) {
      const prevDate = [...allDates].slice(0, idx).reverse().find(d => !GAP_DATES.has(d));
      const nextDate = allDates.slice(idx + 1).find(d => !GAP_DATES.has(d));
      const prevIdx  = prevDate ? allDates.indexOf(prevDate) : -1;
      const nextIdx  = nextDate ? allDates.indexOf(nextDate) : -1;

      for (const brand of sortedLocked) {
        const prevVal = prevDate ? (overallTrendMap[prevDate]?.[brand] ?? 0) : 0;
        const nextVal = nextDate ? (overallTrendMap[nextDate]?.[brand] ?? 0) : 0;
        if (prevDate && nextDate) {
          const t = (idx - prevIdx) / (nextIdx - prevIdx);
          row[brand] = Math.round(prevVal + t * (nextVal - prevVal));
        } else {
          row[brand] = overallTrendMap[date]?.[brand] ?? 0;
        }
      }
    } else {
      for (const brand of sortedLocked) row[brand] = overallTrendMap[date]?.[brand] ?? 0;
    }

    return row;
  });

  // ── Stat card metrics ─────────────────────────────────────────────────────
  const totalMentions = Object.values(overallByBrand).reduce((a, b) => a + b, 0);
  const [topBrandName, topBrandCount] = Object.entries(overallByBrand)
    .sort((a, b) => b[1] - a[1])[0] ?? ["—", 0];

  // ── Per-cluster trend data ─────────────────────────────────────────────────
  type ClusterChartEntry = { brands: string[]; data: Record<string, string | number>[] };
  const perClusterTrend: Record<string, ClusterChartEntry> = {};

  for (const cluster of TREND_CLUSTERS) {
    const rows = clusterTrend.filter(r => r.cluster_tag === cluster.tag && LOCKED_SET.has(r.brand));
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

  // ── LLM split ────────────────────────────────────────────────────────────
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

  // ── Cluster pie data ───────────────────────────────────────────────────────
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

  // ── Feature score helpers ──────────────────────────────────────────────────
  const r5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

  const SCORE_BAND_COLOR = {
    strong:  "#047857",
    partial: "#D97706",
    weak:    "#DC2626",
    absent:  "#E5E7EB",
  };
  const scoreBandColor = (band: string) =>
    SCORE_BAND_COLOR[band as keyof typeof SCORE_BAND_COLOR] ?? "#E5E7EB";

  // Group feature scores by cluster → feature → brand
  const fsByCluster: Record<string, Record<string, FeatureScoreRow[]>> = {};
  for (const row of featureScores) {
    if (!LOCKED_SET.has(row.brand_name)) continue;
    if (!fsByCluster[row.feature_tag]) fsByCluster[row.feature_tag] = {};
    if (!fsByCluster[row.feature_tag][row.feature_id]) fsByCluster[row.feature_tag][row.feature_id] = [];
    fsByCluster[row.feature_tag][row.feature_id].push(row);
  }

  // Per-feature brand ordering is done at render time (highest score first)

  // ── Sentiment helpers ──────────────────────────────────────────────────────
  const LOCKED_SENTIMENT_SET = LOCKED_SET;
  const sentimentMeta = sentimentData.meta;
  const sentimentReady = (sentimentMeta.dual_model_dates ?? 0) >= 1;

  const overallBrands = sentimentData.rows
    .filter(r => r.bucket_tag === "hsai-sent-overall" && LOCKED_SENTIMENT_SET.has(r.brand_name))
    .sort((a, b) => b.positive_count - a.positive_count);

  // ── Buyer intent ───────────────────────────────────────────────────────────
  const buyerFiltered = buyerIntent
    .filter(r => LOCKED_BRANDS.includes(r.brand))
    .sort((a, b) => b.total_mentions - a.total_mentions);
  const buyerTotal = buyerFiltered.reduce((s, r) => s + r.total_mentions, 0);
  // Ranger/Simbastack buyer-intent count — from raw prop (not in locked list)
  const simbaIntentCount = buyerIntent.find(r => r.brand === "Simbastack")?.total_mentions ?? 0;

  // ── Pie percentage label ──────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.06) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight={700}>
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <div>

      {/* ── NOTE callout ──────────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(4,120,87,0.05)",
        border: "1px solid rgba(4,120,87,0.22)",
        borderLeft: "4px solid #047857",
        borderRadius: "0 10px 10px 0",
        padding: "18px 22px",
        marginBottom: 24,
      }}>
        <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#047857", margin: "0 0 8px" }}>
          Note
        </p>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>
          Every chart in this report covers 11 competitor brands across the hospitality AI agent category. Seven are AI-native guest-facing agents (Asksuite, HiJiffy, Quicktext, Akia, Duve, Alliants, BookBoost). <strong>Canary Technologies</strong> is the only verified competitor with staff-side operations tooling comparable to Ranger&rsquo;s staff copilot. Three short-term rental AI agents (Jurny, Hospitable, HostAI) provide adjacent market context.
        </p>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: 0 }}>
          Data is collected daily using Claude Haiku and GPT-4o-mini across 39 prompts in 11 use case clusters, 3 runs each.
        </p>
      </div>

      {/* ── Product Feature Recommendations ───────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 14px" }}>
          Product Feature Recommendations
        </h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>

          <div style={{
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #047857",
            borderRadius: "0 12px 12px 0", padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>
                1. Multi-PMS Integration: Cloudbeds, Mews, and Guesty
              </p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#047857",
                background: "rgba(4,120,87,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>Scale unlock</span>
            </div>
            <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 12px" }}>
              Ranger is currently built on KaribuKit — Simbastack&rsquo;s own PMS — which is the right foundation for Mara Hilltop but limits expansion to any property not on KaribuKit. Every verified competitor (Asksuite, HiJiffy, Duve, Canary Technologies) leads with Cloudbeds, Mews, Opera, and Guesty integrations. A lodge operator evaluating AI agents will dismiss any tool that can&rsquo;t read their existing PMS data. Native integration with the top 3&ndash;4 PMS platforms is the prerequisite for Ranger to become a product other properties can buy, not just a tool Simbastack built for itself.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>Competitors with native PMS integration:</span>
              {["Asksuite", "HiJiffy", "Canary Technologies", "Duve"].map(b => (
                <span key={b} style={{ fontSize: 12, color: "#000", background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 8px" }}>{b}</span>
              ))}
            </div>
          </div>

          <div style={{
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #0891B2",
            borderRadius: "0 12px 12px 0", padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>
                2. Lead Follow-up Automation: Re-engage Unconverted Inquiries
              </p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#0891B2",
                background: "rgba(8,145,178,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>Revenue lever</span>
            </div>
            <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 12px" }}>
              Ranger handles live inquiries well — availability quotes, instant replies, multilingual responses. The gap is what happens after a guest receives a quote and goes silent. For safari lodges where conversion windows stretch 2&ndash;6 weeks and guests compare multiple properties, automated follow-up sequences (a WhatsApp nudge at day 3, a personalised package offer at day 7) are where the booking is actually won or lost. No current Ranger documentation claims this capability. Asksuite and BookBoost both market lead nurture explicitly; Canary Technologies has pre-arrival messaging sequences. This is a category gap Ranger could close with its existing WhatsApp integration.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>Competitors with lead nurture:</span>
              {["Asksuite", "BookBoost", "Canary Technologies"].map(b => (
                <span key={b} style={{ fontSize: 12, color: "#000", background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 8px" }}>{b}</span>
              ))}
            </div>
          </div>

          <div style={{
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #D97706",
            borderRadius: "0 12px 12px 0", padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>
                3. Public Documentation of Ranger&rsquo;s Capabilities
              </p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#D97706",
                background: "rgba(217,119,6,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>LLM visibility</span>
            </div>
            <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 12px" }}>
              Ranger&rsquo;s near-zero LLM mention count is not a failure of the product — it is a failure of documentation. LLMs can only surface brands whose capabilities are described somewhere they were trained on: product pages, case studies, press coverage, and third-party reviews. Simbastack has a website but no documented feature list for Ranger, no published case study from Mara Hilltop, and no presence in hospitality tech publications. A single detailed case study — &ldquo;How Mara Hilltop Automated 90% of Guest Inquiries with Ranger&rdquo; — would give LLMs something to cite. This is the fastest path to measurable LLM visibility improvement.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>High-visibility competitors with published case studies:</span>
              {["Asksuite", "HiJiffy", "Canary Technologies"].map(b => (
                <span key={b} style={{ fontSize: 12, color: "#000", background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 8px" }}>{b}</span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Competitive Intelligence + stat cards ─────────────────────────── */}
      <p style={{
        fontSize: 52, fontWeight: 900, color: "#000000",
        letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 20px",
      }}>
        Competitive Intelligence
      </p>
      {hasData && (
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" as const }}>
          <StatCard label="Total Mentions" value={totalMentions.toLocaleString()} sub="12 tracked brands · hospitality AI agents" />
          <StatCard label="Top Brand" value={topBrandName} sub={`${(topBrandCount as number).toLocaleString()} mentions across all use case clusters`} />
          <StatCard label="Collection Period" value="7 days" sub="11 use case clusters · Claude Haiku &amp; GPT-4o-mini" />
        </div>
      )}

      {/* ── Coverage Over Time (interactive trend) ────────────────────────── */}
      <Section title="Coverage Over Time" subtitle="Daily brand mention totals across all use case clusters. Toggle brands using the legend below.">
        {!hasData ? <EmptyState label="Awaiting data collection" /> : (
          <>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 480 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={combinedTrendData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 11, fill: "#000" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#000" }} allowDecimals={false} />
                    <Tooltip content={<TrendTooltip />} />
                    {sortedLocked.map((brand) => (
                      <Line
                        key={brand}
                        type="monotone"
                        dataKey={brand}
                        stroke={brandColor(brand)}
                        strokeWidth={1.5}
                        dot={false}
                        hide={hiddenBrands.has(brand)}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Interactive legend */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px 10px", marginTop: 14 }}>
              {sortedLocked.map(brand => {
                const hidden = hiddenBrands.has(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => setHiddenBrands(prev => {
                      const next = new Set(prev);
                      if (next.has(brand)) next.delete(brand); else next.add(brand);
                      return next;
                    })}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: hidden ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.06)",
                      border: `1px solid ${hidden ? "rgba(0,0,0,0.08)" : brandColor(brand)}33`,
                      borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                      opacity: hidden ? 0.45 : 1, transition: "opacity 0.15s",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(brand), flexShrink: 0, display: "inline-block" }} />
                    <span style={{ fontSize: 11, color: "#000" }}>{brand}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Section>

      {/* ── Use Case Coverage (cluster pies) ──────────────────────────────── */}
      <Section title="Use Case Coverage" subtitle="Brand mention share within each use case cluster — which brands dominate each specific buyer moment.">
        {Object.keys(clusterMap).length === 0 ? (
          <EmptyState label="Awaiting data collection" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {TREND_CLUSTERS.map(cluster => {
              const data = (clusterMap[cluster.tag] ?? []).filter(d => d.mentions > 0);
              return (
                <div key={cluster.tag} style={{ background: "rgba(0,0,0,0.02)", borderRadius: 10, padding: "16px 14px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>{cluster.label}</p>
                  <p style={{ fontSize: 11, color: "#047857", margin: "0 0 10px", lineHeight: 1.5 }}>{cluster.description}</p>
                  {data.length === 0 ? (
                    <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 12, color: "#000", opacity: 0.4 }}>No mentions yet</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={data} dataKey="mentions" nameKey="brand" cx="50%" cy="50%"
                          outerRadius={58} innerRadius={28}
                          label={PieLabel} labelLine={false}>
                          {data.map(entry => (
                            <Cell key={entry.brand} fill={brandColor(entry.brand)} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v} mentions`, n]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {data.slice(0, 4).map(d => (
                    <div key={d.brand} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(d.brand), flexShrink: 0, display: "inline-block" }} />
                      <span style={{ fontSize: 11, color: "#000" }}>{d.brand}</span>
                      <span style={{ fontSize: 11, color: "#000", opacity: 0.5, marginLeft: "auto" }}>{d.mentions}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── Product Feature Scores ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>Product Feature Scores</h2>
          <p style={{ fontSize: 13, color: "#000", margin: 0 }}>
            0–100 score per feature for each of the 11 tracked brands. Scored by consensus across 3 model runs × 2 LLMs.
            Strong ≥70 · Partial 40–69 · Weak 1–39 · Absent 0.
          </p>
        </div>

        {featureScores.length === 0 ? (
          <EmptyState label="Feature scores pending first collection run" />
        ) : ALL_CLUSTERS.map(cluster => {
          const clusterFeatures = HSAI_FEATURES.filter(f => f.feature_tag === cluster.tag);
          const clusterRows = fsByCluster[cluster.tag] ?? {};

          // Staff-ops amber banner
          const isStaffOps = cluster.tag === "hsai-staff-ops";

          return (
            <div key={cluster.tag} style={{
              background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)",
              padding: "20px 24px", marginBottom: 14,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
                {cluster.label}
              </h3>

              {/* Staff-ops blue-ocean finding banner */}
              {isStaffOps && (
                <div style={{
                  background: "rgba(217,119,6,0.07)",
                  border: "1px solid rgba(217,119,6,0.30)",
                  borderLeft: "4px solid #D97706",
                  borderRadius: "0 8px 8px 0",
                  padding: "12px 16px",
                  marginBottom: 16,
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#B45309", margin: "0 0 4px", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                    Blue-ocean signal
                  </p>
                  <p style={{ fontSize: 13, color: "#000", lineHeight: 1.65, margin: 0 }}>
                    <strong>Canary Technologies is the only verified competitor</strong> with staff-side reservation, pricing, and check-in tooling across all 12 brands checked. Duve, Alliants, and BookBoost — initially assumed to be ops-depth competitors — were re-verified as guest-facing messaging platforms with no staff-copilot tooling. This is a wide-open lane: Ranger&rsquo;s staff copilot has essentially one verified competitor. Being the second well-documented player in this space is a realistic near-term position.
                  </p>
                </div>
              )}

              {clusterFeatures.map(feature => {
                const brandRows = clusterRows[feature.feature_id] ?? [];
                const brandRowMap: Record<string, FeatureScoreRow> = {};
                for (const r of brandRows) brandRowMap[r.brand_name] = r;

                return (
                  <div key={feature.feature_id} style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#000", margin: "0 0 10px" }}>
                      {feature.feature_name}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                      {(() => {
                        const sorted = [...LOCKED_BRANDS]
                          .map(brand => ({ brand, row: brandRowMap[brand] }))
                          .sort((a, b) => (b.row?.score ?? 0) - (a.row?.score ?? 0));

                        // Collapse tied bottom-score group: keep Canary + 2 others
                        const bottomScore = sorted[sorted.length - 1]?.row?.score ?? 0;
                        const bottomGroup = sorted.filter(x => (x.row?.score ?? 0) === bottomScore);
                        let display = sorted;
                        let hiddenCount = 0;
                        if (bottomGroup.length >= 4) {
                          const top = sorted.filter(x => (x.row?.score ?? 0) > bottomScore);
                          const canary = bottomGroup.find(x => x.brand === "Canary Technologies");
                          const others = bottomGroup.filter(x => x.brand !== "Canary Technologies").slice(0, 2);
                          display = [...top, ...(canary ? [canary] : []), ...others];
                          hiddenCount = bottomGroup.length - display.filter(x => (x.row?.score ?? 0) === bottomScore).length;
                        }

                        return (
                          <>
                            {display.map(({ brand, row }) => {
                              const score = row?.score != null ? r5(row.score) : null;
                              const band  = row?.score_band ?? "absent";
                              const color = scoreBandColor(band);
                              const pct   = score != null ? `${score}%` : "0%";
                              return (
                                <div key={brand}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                    <span style={{ fontSize: 11, color: "#000", width: 160, flexShrink: 0 }}>{brand}</span>
                                    <div style={{ flex: 1, height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden" }}>
                                      <div style={{ width: pct, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s" }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: "#000", width: 28, textAlign: "right" as const, fontVariantNumeric: "tabular-nums" }}>
                                      {score ?? 0}
                                    </span>
                                  </div>
                                  {row?.evidence && (
                                    <p style={{ fontSize: 11, color: "#000", margin: "0 0 0 168px", lineHeight: 1.5, opacity: 0.65 }}>
                                      {row.evidence}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                            {hiddenCount > 0 && (
                              <p style={{ fontSize: 11, color: "#000", opacity: 0.4, margin: "2px 0 0 0", fontStyle: "italic" }}>
                                +{hiddenCount} others also scored {r5(sorted[sorted.length - 1]?.row?.score ?? 0)}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Sentiment Analysis ────────────────────────────────────────────── */}
      <Section title="Sentiment Analysis" subtitle="How AI models describe each brand when asked about it directly. Blue tags are descriptors unique to that brand; grey tags are shared across brands.">
        {!sentimentReady ? (
          <EmptyState label="Sentiment data pending — requires dual-model collection" />
        ) : overallBrands.length === 0 ? (
          <EmptyState label="No sentiment rows yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 18 }}>
            {overallBrands.map(row => {
              const total = row.total_count;
              const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;
              return (
                <div key={row.brand_name} style={{ paddingBottom: 18, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: brandColor(row.brand_name), flexShrink: 0, display: "inline-block" }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#000" }}>{row.brand_name}</span>
                    <span style={{ fontSize: 11, color: "#000", opacity: 0.45, marginLeft: "auto" }}>{total} responses</span>
                  </div>
                  <div style={{ display: "flex", gap: 2, height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ width: `${pct(row.positive_count)}%`, background: "#047857" }} />
                    <div style={{ width: `${pct(row.neutral_count)}%`,  background: "#D97706" }} />
                    <div style={{ width: `${pct(row.negative_count)}%`, background: "#DC2626" }} />
                  </div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                    {[
                      { label: "Positive", count: row.positive_count, color: "#047857" },
                      { label: "Neutral",  count: row.neutral_count,  color: "#D97706" },
                      { label: "Negative", count: row.negative_count, color: "#DC2626" },
                    ].map(({ label, count, color }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
                        <span style={{ fontSize: 12, color: "#000" }}>{label} {pct(count)}%</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
                    {(row.top_descriptors as string[]).map((desc, idx) => {
                      // unique_flags may be present on extended row type
                      const ext = row as SentimentRow & { unique_flags?: string[] };
                      const isUnique = ext.unique_flags?.[idx] === "true";
                      return (
                        <span key={desc} style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 4,
                          background: isUnique ? "rgba(4,120,87,0.10)" : "rgba(0,0,0,0.05)",
                          color: isUnique ? "#047857" : "#000",
                          fontWeight: isUnique ? 600 : 400,
                        }}>{desc}</span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── Buyer-Intent Signals ─────────────────────────────────────────── */}
      {(() => {
        const BISBadge = ({ level }: { level: "strong" | "mixed" | "weak" | "none" }) => {
          const map = {
            strong: { label: "Strong signal", bg: "#dcfce7", color: "#15803d" },
            mixed:  { label: "Mixed signal",  bg: "#fef9c3", color: "#a16207" },
            weak:   { label: "Weak signal",   bg: "#fee2e2", color: "#b91c1c" },
            none:   { label: "Insufficient data", bg: "#f3f4f6", color: "#6b7280" },
          }[level];
          return (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
              background: map.bg, color: map.color, whiteSpace: "nowrap" as const,
            }}>
              {map.label}
            </span>
          );
        };

        const signals = [
          {
            icon: "💰",
            label: "Funding & Investment",
            canary: {
              badge: "strong" as const,
              text: "Raised $50M Series C in June 2024 (led by Insight Partners) and $80M Series D in June 2025 (led by Brighton Park Capital), at an approximately $600M valuation — $175M total disclosed. Repeated large institutional rounds confirm category conviction and multi-year product and expansion runway.",
              citations: [
                { label: "Series C announcement", href: "http://canarytechnologies.com/press/canary-raises-50m-ai-hotel-technology" },
                { label: "Series D announcement", href: "http://canarytechnologies.com/press/canary-raises-series-d" },
              ],
            },
            asksuite: {
              badge: "mixed" as const,
              text: "Institutional seed financing is confirmed — a R$4M investment from ABSeed in August 2020 and a $1.33M seed round in July 2021 — but figures conflict across databases and currencies, and no structured total or valuation is publicly disclosed.",
              citations: [
                { label: "TI Inside (R$4M, 2020)", href: "http://tiinside.com.br/en/25/08/2020/startup-asksuite-recebe-aporte-de-r-4-milhoes" },
                { label: "PitchBook", href: "http://pitchbook.com/profiles/company/366558-04" },
              ],
            },
          },
          {
            icon: "🧑‍💼",
            label: "Hiring Activity",
            canary: {
              badge: "strong" as const,
              text: "Public employee count rose from 14 in 2020 to 106 in 2024. Verified current postings include a Lead Physical Access Engineer and a Senior Software Engineer, LATAM Engineering — pointing to continued investment in product infrastructure, access workflows, and regional engineering.",
              citations: [
                { label: "Tracxn headcount history", href: "https://tracxn.com" },
                { label: "Physical Access Engineer", href: "http://jobs.lever.co/canarytechnologies/5c38f67e-089d-4a52-900f-ea4bdb425efb" },
                { label: "Senior SWE, LATAM", href: "http://jobs.lever.co/canarytechnologies/3fbb11e2-993a-4535-beb4-43d8d0634668" },
              ],
            },
            asksuite: {
              badge: "strong" as const,
              text: "Recruiting page shows ~10 current roles across Customer Experience, Marketing, Product, Revenue Operations, Sales, Talent, and IT/Engineering — including a BDR EMEA role. Company materials describe 150+ employees across seven or more countries.",
              citations: [
                { label: "Asksuite careers", href: "http://asksuite.recruitee.com/l/en" },
                { label: "BDR EMEA role", href: "http://asksuite.recruitee.com/l/en/o/business-development-representative-emea-south-africa-based" },
              ],
            },
          },
          {
            icon: "😤",
            label: "Pain Point Clarity",
            canary: {
              badge: "mixed" as const,
              text: "The clearest documented pain is a G2 review of Oracle OPERA reporting integration problems and difficulty working with the legacy PMS. The public record did not yield a representative corpus of hotels broadly citing manual messaging as a purchase trigger — treat as a positioning hypothesis, not a proven market-wide pain.",
              citations: [
                { label: "G2 — Oracle OPERA reviews", href: "https://www.g2.com/products/oracle-hospitality-opera-property-management-system/reviews" },
                { label: "Reddit: hotels using AI chatbots?", href: "https://www.reddit.com/r/hotels/comments/1cypdvk/are_there_any_hotels_using_ai_for_customer_service/" },
              ],
            },
            asksuite: {
              badge: "mixed" as const,
              text: "Same legacy-PMS dissatisfaction signal applies. Asksuite's positioning directly addresses the pain — automating traveler communication and reservations — but public evidence does not show that frustrated OPERA users specifically moved to Asksuite.",
              citations: [
                { label: "G2 — Oracle OPERA reviews", href: "https://www.g2.com/products/oracle-hospitality-opera-property-management-system/reviews" },
              ],
            },
          },
          {
            icon: "🌐",
            label: "Community Presence",
            canary: {
              badge: "mixed" as const,
              text: "Category-level conversation exists on Reddit: threads ask whether hotels are using AI chatbots for 24/7 requests and which companies are building high-end AI concierge products. Discussion is exploratory — asking whether products exist — rather than documenting a large practitioner base.",
              citations: [
                { label: "Reddit: hotels + AI chatbots", href: "https://www.reddit.com/r/hotels/comments/1cypdvk/are_there_any_hotels_using_ai_for_customer_service/" },
                { label: "Reddit: high-end AI concierge", href: "https://www.reddit.com/r/hotels/comments/12hb5p3/what_companies_are_doing_high_end_ai_concierge/" },
              ],
            },
            asksuite: {
              badge: "mixed" as const,
              text: "The same category-level Reddit threads are relevant to Asksuite. Public product discussion is present but shallow and fragmented across hospitality communities — awareness exists, but not a self-sustaining practitioner community.",
              citations: [
                { label: "Reddit: hotels + AI chatbots", href: "https://www.reddit.com/r/hotels/comments/1cypdvk/are_there_any_hotels_using_ai_for_customer_service/" },
                { label: "Reddit: high-end AI concierge", href: "https://www.reddit.com/r/hotels/comments/12hb5p3/what_companies_are_doing_high_end_ai_concierge/" },
              ],
            },
          },
          {
            icon: "🤝",
            label: "Partnerships & Integrations",
            canary: {
              badge: "strong" as const,
              text: "Announced a Host Hotel Systems PMS integration in July 2026 (Portugal, Spain, LatAm) and a strategic partnership with the Curator Hotel and Resort Collection in 2026. Recent activity signals a push to become part of the operating stack — not just a messaging layer.",
              citations: [
                { label: "Host Hotel Systems integration", href: "https://www.canarytechnologies.com/press/host-hotel-systems-integration" },
                { label: "Curator partnership", href: "https://www.curatorhotelsandresorts.com/news/curator-hotel-resort-collection-announces-strategic-partnership-with-canary-technologies-to-bring-ai-powered-guest-management-tools-to-independent-lifestyle-hotels/" },
              ],
            },
            asksuite: {
              badge: "mixed" as const,
              text: "Announced a strategic partnership with PC Hospitality in May 2026. Claims 250+ integrations, but this is company-reported; reviewed evidence did not verify a newly announced named PMS or OTA integration with deep write-enabled operational connections in the past 12–18 months.",
              citations: [
                { label: "PC Hospitality partnership", href: "https://thefridaytimes.com/15-May-2026/pc-hospitality-partners-asksuite-enhance-guest-experience-ai-powered-automation" },
                { label: "Integrations page", href: "https://asksuite.com/integrations/" },
              ],
            },
          },
          {
            icon: "📈",
            label: "Customer Growth",
            canary: {
              badge: "mixed" as const,
              text: "Named case study: Point Hotel saved nearly 300 staff hours and generated $60K+ in upsell revenue over six months. Proper Hospitality selected the platform in September 2025. Canary's site claims thousands of hotels, but that is company-reported; no clean acquisition cadence is verifiable from the public case archive.",
              citations: [
                { label: "Point Hotel case study", href: "https://www.canarytechnologies.com/customers/point-hotel" },
                { label: "Proper Hospitality", href: "https://www.canarytechnologies.com/press/proper-hospitality" },
                { label: "Customer cases", href: "https://www.canarytechnologies.com/customers" },
              ],
            },
            asksuite: {
              badge: "mixed" as const,
              text: "Named outcomes: AKTV Resorts ($150K in new business), 4R Hotels (54.6% after-hours interaction share, 17× ROI in 7 months), Parque Cerdeira (28:1 ROI). Company reports 5,500+ hotels across 80+ countries, but those scale figures are self-reported.",
              citations: [
                { label: "Customer cases", href: "https://asksuite.com/cases-ask/" },
                { label: "4R Hotels — 17× ROI", href: "http://asksuite.com/blog/4r-hotels" },
                { label: "Asksuite platform", href: "https://asksuite.com/" },
              ],
            },
          },
          {
            icon: "📰",
            label: "Press Momentum",
            canary: {
              badge: "none" as const,
              text: "Recent visibility includes a 2026 AI Agent Studio launch announcement and Inc. 5000 recognition in August 2026. These show current activity, but the available evidence does not support a reproducible count of independent press articles across comparable six-month windows — classified as insufficient data, not declining.",
              citations: [
                { label: "AI Agent Studio launch", href: "http://canarytechnologies.com/press/hospitality-ai-agent-studio-launched" },
                { label: "Inc. 5000 (August 2026)", href: "https://www.prnewswire.com/news-releases/canary-technologies-named-to-the-2026-inc-5000-list-302851020.html" },
              ],
            },
            asksuite: {
              badge: "none" as const,
              text: "Available evidence is dominated by company pages, award listings, and owned announcements rather than independent headlines. A low visible press count may reflect indexing, language, or publication practices rather than low activity — classified as insufficient data.",
              citations: [
                { label: "Tracxn profile", href: "http://platform.tracxn.com/a/d/company/58de0689e4b027db5f624b20/asksuite#a:about" },
              ],
            },
          },
          {
            icon: "🏆",
            label: "Analyst Recognition",
            canary: {
              badge: "strong" as const,
              text: "Eight HotelTechReport award wins in 2025 and nine in 2026, including Best Guest Experience System. Repeated top-category recognition provides persistent third-party visibility — meaningful for buyer awareness even if not equivalent to audited performance data.",
              citations: [
                { label: "HTR 2026 — Best Guest Experience", href: "https://www.canarytechnologies.com/press/canary-sweeps-hoteltechawards-2026" },
                { label: "HTR 2025 — 8 wins", href: "https://www.canarytechnologies.com/press/canary-sweeps-2025-hoteltechawards" },
                { label: "HTR 2026 HotelTechAwards", href: "https://hoteltechreport.com/news/2026-hta-pr" },
              ],
            },
            asksuite: {
              badge: "strong" as const,
              text: "Ranked #1 in Hotel Chatbot and #6 in Hotelier's Choice Top Companies on HotelTechReport 2026, in a field of 800+ companies. Strong buyer-facing visibility — indicating the product is actively evaluated, though rankings are not audited proof of retention or performance.",
              citations: [
                { label: "HTR #1 Hotel Chatbot (2026)", href: "https://asksuite.com/blog/global-leader-ai-reservation-assistance/" },
                { label: "HTR 2026 HotelTechAwards", href: "https://hoteltechreport.com/news/2026-hta-pr" },
              ],
            },
          },
          {
            icon: "🚀",
            label: "New Entrants Signal",
            canary: {
              badge: "strong" as const,
              text: "Multiple recent product launches validate the category: roommaster's Concierge (Sadie AI, July 2025), Yanolja Cloud's Pulse AI (August 2026, 1,000+ hotels in India), Hoteza AI Concierge, and NEWT Chat (multilingual, Japan). The mix includes established hospitality tech vendors — not just startups — signalling strategic, not experimental, intent.",
              citations: [
                { label: "roommaster / Sadie AI", href: "https://www.hotel-online.com/news/roommaster-launches-concierge-ai-powered-virtual-concierge-powered-by-sadie-ai-for-24-7-guest-engagement" },
                { label: "Yanolja Pulse AI", href: "https://www.digitaltoday.co.kr/en/view/92657/yanolja-launches-pulse-ai-ai-concierge-solution" },
                { label: "Hoteza AI Concierge", href: "https://hoteza.com/products/ai-concierge" },
                { label: "NEWT Chat", href: "https://hunted.space/dashboard/newt-chat" },
              ],
            },
            asksuite: {
              badge: "strong" as const,
              text: "The same expanding competitive field applies. PMS vendors, distribution companies, and AI specialists are all approaching the same hospitality workflow from different entry points — raising the bar for differentiation beyond a messaging layer.",
              citations: [
                { label: "roommaster / Sadie AI", href: "https://www.hotel-online.com/news/roommaster-launches-concierge-ai-powered-virtual-concierge-powered-by-sadie-ai-for-24-7-guest-engagement" },
                { label: "Yanolja Pulse AI", href: "https://www.digitaltoday.co.kr/en/view/92657/yanolja-launches-pulse-ai-ai-concierge-solution" },
                { label: "Hoteza AI Concierge", href: "https://hoteza.com/products/ai-concierge" },
                { label: "NEWT Chat", href: "https://hunted.space/dashboard/newt-chat" },
              ],
            },
          },
          {
            icon: "🎤",
            label: "Conference Activity",
            canary: {
              badge: "strong" as const,
              text: "Verified exhibitor presence at HITEC Indianapolis 2025 and HITEC San Antonio 2026 — the category's flagship trade event. Repeated HITEC participation is a commercial signal of ecosystem distribution strategy, though it does not by itself prove conversion or customer growth.",
              citations: [
                { label: "HITEC Indianapolis 2025", href: "https://s23.a2zinc.net/clients/HFTP/HITEC2025/Public/eBooth.aspx?BoothID=116356&Nav=False" },
                { label: "HITEC San Antonio 2026", href: "https://www.canarytechnologies.com/company/events-new/hitec-2026" },
              ],
            },
            asksuite: {
              badge: "strong" as const,
              text: "Verified booth at Equipotel 2025 (Latin America's leading hospitality event, booth N38) and hosted Asksuite Insights 2025, its own industry event. Trade presence supports commercial intent and community participation, primarily within LatAm.",
              citations: [
                { label: "Equipotel 2025 (booth N38)", href: "https://www.facebook.com/asksuite/posts/were-thrilled-to-be-at-equipotel-the-leading-event-in-hospitality-visit-us-at-bo/1482594282933865/" },
                { label: "Asksuite Insights 2025", href: "https://content.asksuite.com/es-rr-evento-asksuite_insights-10-2025/" },
              ],
            },
          },
        ];

        return (
          <div style={{
            background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)",
            padding: "28px 28px", marginBottom: 20,
          }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
              Buyer-Intent Signals
            </p>
            <p style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65, margin: "0 0 20px", opacity: 0.6 }}>
              Market readiness indicators for the hospitality AI agent category, assessed across Canary Technologies and Asksuite — the two most LLM-visible competitors to Ranger.
            </p>

            {/* Verdict callout */}
            <div style={{
              background: "rgba(4,120,87,0.06)", borderRadius: 10,
              border: "1px solid rgba(4,120,87,0.15)", padding: "14px 18px", marginBottom: 24,
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>✅</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#047857", margin: "0 0 3px" }}>
                  Moderate-to-strong category signal
                </p>
                <p style={{ fontSize: 12.5, color: "#047857", lineHeight: 1.6, margin: 0 }}>
                  7 of 10 signals show strong or mixed intent activity. Funding depth, analyst recognition, conference presence, and new entrant density all confirm that hospitality operators are actively evaluating and purchasing AI agent platforms — and that Canary Technologies is the best-capitalised incumbent in that buying moment.
                </p>
              </div>
            </div>

            {/* Column headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "140px 1fr 1fr", gap: 0,
              borderBottom: "1px solid rgba(0,0,0,0.10)", paddingBottom: 8, marginBottom: 0,
            }}>
              <div />
              <div style={{ paddingRight: 20, fontSize: 11, fontWeight: 700, color: "#92400E", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
                Canary Technologies
              </div>
              <div style={{ paddingLeft: 20, fontSize: 11, fontWeight: 700, color: "#EA580C", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
                Asksuite
              </div>
            </div>

            {/* Signal rows */}
            {signals.map((sig, i) => (
              <div key={sig.label} style={{
                display: "grid", gridTemplateColumns: "140px 1fr 1fr", gap: 0,
                borderBottom: i < signals.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                padding: "18px 0",
              }}>
                <div style={{ paddingRight: 16 }}>
                  <div style={{ fontSize: 15, marginBottom: 4 }}>{sig.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#000", lineHeight: 1.35 }}>{sig.label}</div>
                </div>
                <div style={{ paddingRight: 20, borderRight: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <BISBadge level={sig.canary.badge} />
                  </div>
                  <p style={{ fontSize: 12.5, color: "#000", lineHeight: 1.65, margin: "0 0 8px" }}>{sig.canary.text}</p>
                  {sig.canary.citations.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
                      {sig.canary.citations.map(c => (
                        <a key={c.href} href={c.href} target="_blank" rel="noopener noreferrer" style={{
                          fontSize: 10, fontWeight: 600, color: "#92400E",
                          background: "rgba(146,64,14,0.07)", borderRadius: 3,
                          padding: "2px 6px", textDecoration: "none", lineHeight: 1.5,
                        }}>↗ {c.label}</a>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ paddingLeft: 20 }}>
                  <div style={{ marginBottom: 6 }}>
                    <BISBadge level={sig.asksuite.badge} />
                  </div>
                  <p style={{ fontSize: 12.5, color: "#000", lineHeight: 1.65, margin: "0 0 8px" }}>{sig.asksuite.text}</p>
                  {sig.asksuite.citations.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
                      {sig.asksuite.citations.map(c => (
                        <a key={c.href} href={c.href} target="_blank" rel="noopener noreferrer" style={{
                          fontSize: 10, fontWeight: 600, color: "#EA580C",
                          background: "rgba(234,88,12,0.07)", borderRadius: 3,
                          padding: "2px 6px", textDecoration: "none", lineHeight: 1.5,
                        }}>↗ {c.label}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* What this means for Ranger */}
            <div style={{
              marginTop: 24, background: "rgba(4,120,87,0.04)", borderRadius: 10,
              borderLeft: "3px solid #047857", padding: "16px 18px",
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#047857", margin: "0 0 8px" }}>
                🧭 What this means for Ranger
              </p>
              <p style={{ fontSize: 12.5, color: "#000", lineHeight: 1.7, margin: "0 0 8px" }}>
                The category is real and buying. Canary Technologies is the benchmark competitor — well-capitalised, deeply integrated, and conference-active. Asksuite dominates LatAm but has thinner global reach. Neither owns the safari lodge and boutique East Africa niche, which Ranger already occupies operationally.
              </p>
              <p style={{ fontSize: 12.5, color: "#000", lineHeight: 1.7, margin: 0 }}>
                The gap is not market readiness — it is LLM discoverability. Ranger's unique positioning (staff copilot + guest concierge + WhatsApp-native for safari and boutique properties) is the differentiated claim neither Canary nor Asksuite makes. Publish that claim on indexed pages with the specific metrics buyers search for, and LLMs will begin surfacing Ranger where Canary and Asksuite currently dominate.
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── LLM Visibility Playbook ───────────────────────────────────────── */}
      <div style={{
        background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)",
        padding: "28px 28px", marginBottom: 20,
      }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 6px" }}>
          LLM Visibility Playbook for Ranger
        </p>
        <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 20px" }}>
          Ranger AI surfaces in <strong>{simbaIntentCount} out of ~{buyerTotal} buyer-intent LLM responses</strong> tracked in this report — the prompts that simulate a hospitality operator actively choosing an AI agent to invest in. That gap is not a brand awareness problem in the traditional sense; it is a documentation and discoverability problem. Here is what moves the needle.
        </p>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>

          <div style={{ background: "rgba(4,120,87,0.04)", borderRadius: 10, padding: "16px 18px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#000", margin: "0 0 10px" }}>
              1. Publish a detailed Mara Hilltop case study
            </p>
            <Dot>Title it around a real outcome Ranger actually delivered — something an operator would search: <em>&ldquo;How a Maasai Mara safari lodge automated [your actual %] of WhatsApp guest inquiries with an AI concierge.&rdquo;</em> The specific number must be Simbastack&apos;s own verified figure; do not use a placeholder in the published title.</Dot>
            <Dot>Include the specific metrics LLMs learn to cite: inquiry-to-booking conversion rate, average response time before vs. after Ranger, languages handled, and number of staff hours freed per week. These should all be real, sourced figures — LLMs that cite fabricated numbers create reputational risk if an operator cross-checks them.</Dot>
            <Dot>Publish it on simbastack.com and submit it to well-indexed hospitality trade publications — Skift and Hotel Management are the most broadly crawled in this category; Cloudbeds&apos; Resource Hub and Hotelogix Blog also surface frequently in hospitality search results. Getting byline coverage in any of these raises the probability of the content reaching LLM training pipelines, though this is an inference based on indexing patterns rather than a verified causal link.</Dot>
          </div>

          <div style={{ background: "rgba(4,120,87,0.04)", borderRadius: 10, padding: "16px 18px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#000", margin: "0 0 10px" }}>
              2. Build a public feature page for Ranger
            </p>
            <Dot>Create a dedicated <strong>simbastack.com/ranger</strong> page listing every capability in plain language — omnichannel messaging, live PMS quotes, multilingual responses, staff copilot, human handoff.</Dot>
            <Dot>Use the exact language hospitality operators use in buyer-intent queries: &ldquo;AI concierge for lodges,&rdquo; &ldquo;WhatsApp booking automation,&rdquo; &ldquo;safari lodge AI agent.&rdquo; These are the phrases LLMs pattern-match against when deciding which brands to surface.</Dot>
            <Dot>Add schema markup (Product, SoftwareApplication) to help search engines and LLM crawlers understand what Ranger is and who it is for.</Dot>
          </div>

          <div style={{ background: "rgba(4,120,87,0.04)", borderRadius: 10, padding: "16px 18px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#000", margin: "0 0 10px" }}>
              3. Claim the staff-copilot positioning explicitly
            </p>
            <Dot>Canary Technologies is the only verified competitor with documented staff-side reservation and check-in tooling. Every other brand in this report is positioning on the guest-facing side. Ranger does both — name that explicitly in all marketing copy and documentation.</Dot>
            <Dot>A phrase like <em>&ldquo;the only hospitality AI with both a guest concierge and a staff operations copilot in one system&rdquo;</em> is specific enough for LLMs to cite and differentiated enough to earn the positioning — but only once it appears on a published page they can index.</Dot>
          </div>

          <div style={{ background: "rgba(4,120,87,0.04)", borderRadius: 10, padding: "16px 18px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#000", margin: "0 0 10px" }}>
              4. Get listed in hospitality tech directories and review sites
            </p>
            <Dot>Capterra, G2, GetApp, and Hotel Tech Report are among the sources LLMs cite most frequently when recommending hospitality software. A Ranger listing on each — even with just a basic profile and one review — puts the product in front of the training data these models draw from.</Dot>
            <Dot>Hotel Tech Report specifically runs annual rankings for guest messaging and AI concierge tools that generate their own indexed content. Being listed before the next ranking cycle is a compounding discoverability investment.</Dot>
          </div>

        </div>
      </div>

      {/* ── Buyer Intent ──────────────────────────────────────────────────── */}
      <Section title="Buyer Intent Visibility" subtitle="How often each brand appears in decision-stage prompts — simulating a hospitality operator actively choosing an AI agent to invest in.">
        {buyerFiltered.every(r => r.total_mentions === 0) ? (
          <EmptyState label="Buyer intent data pending" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {buyerFiltered.map(row => {
              const pct = buyerTotal > 0 ? (row.total_mentions / buyerTotal) * 100 : 0;
              const isSimbastack = row.brand === "Simbastack";
              return (
                <div key={row.brand} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 12, color: "#000", width: 160, flexShrink: 0,
                    fontWeight: isSimbastack ? 700 : 400,
                  }}>{row.brand}</span>
                  <div style={{ flex: 1, height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: brandColor(row.brand), borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, color: "#000", width: 36, textAlign: "right" as const, fontVariantNumeric: "tabular-nums" }}>
                    {row.total_mentions}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>

    </div>
  );
}
