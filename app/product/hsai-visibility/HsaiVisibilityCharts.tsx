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
    "Simbastack",
    "Asksuite", "HiJiffy", "Quicktext", "Akia", "Duve", "Alliants", "BookBoost",
    "Canary Technologies",
    "Jurny", "Hospitable", "HostAI",
  ];
  const LOCKED_SET = new Set(LOCKED_BRANDS);

  // Simbastack is the subject — pinned in all coverage charts
  const PINNED_BRANDS = ["Simbastack"];
  const PINNED_COLORS: Record<string, string> = { "Simbastack": "#047857" };

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
  const brandColorMap: Record<string, string> = { ...PINNED_COLORS, ...LOCKED_COLORS };
  const brandColor = (brand: string) => brandColorMap[brand] ?? "#94a3b8";

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

  const combinedTrendData = allDates.map(date => {
    const row: Record<string, string | number> = { date };
    for (const brand of sortedLocked) row[brand] = overallTrendMap[date]?.[brand] ?? 0;
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

  // Brand ordering within feature score rows (Simbastack first, then by total score desc)
  const brandScoreTotals: Record<string, number> = {};
  for (const row of featureScores) {
    if (!LOCKED_SET.has(row.brand_name)) continue;
    brandScoreTotals[row.brand_name] = (brandScoreTotals[row.brand_name] ?? 0) + (row.score ?? 0);
  }
  const featureBrandOrder = ["Simbastack", ...LOCKED_BRANDS.filter(b => b !== "Simbastack")
    .sort((a, b) => (brandScoreTotals[b] ?? 0) - (brandScoreTotals[a] ?? 0))];

  // ── Sentiment helpers ──────────────────────────────────────────────────────
  const LOCKED_SENTIMENT_SET = LOCKED_SET;
  const sentimentMeta = sentimentData.meta;
  const sentimentReady = (sentimentMeta.dual_model_dates ?? 0) >= 1;

  const overallBrands = sentimentData.rows
    .filter(r => r.bucket_tag === "overall" && LOCKED_SENTIMENT_SET.has(r.brand_name))
    .sort((a, b) => b.positive_count - a.positive_count);

  // ── Buyer intent ───────────────────────────────────────────────────────────
  const LOCKED_BUYER = LOCKED_BRANDS;
  const buyerFiltered = buyerIntent
    .filter(r => LOCKED_BUYER.includes(r.brand))
    .sort((a, b) => b.total_mentions - a.total_mentions);
  const buyerTotal = buyerFiltered.reduce((s, r) => s + r.total_mentions, 0);
  const simbaIntentRow = buyerFiltered.find(r => r.brand === "Simbastack");

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
          Every chart in this report covers 12 brands across the hospitality AI agent category. <strong>Simbastack</strong> is the subject. Eight brands are AI-native guest-facing agents (Asksuite, HiJiffy, Quicktext, Akia, Duve, Alliants, BookBoost, and Simbastack). <strong>Canary Technologies</strong> is the only verified competitor with staff-side operations tooling comparable to Ranger&rsquo;s staff copilot. Three short-term rental AI agents (Jurny, Hospitable, HostAI) provide adjacent market context.
        </p>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: 0 }}>
          <strong>Simbastack</strong> is pinned in all coverage charts. It appears near-zero because LLMs rarely surface bespoke AI agents built by boutique operators — Ranger is deployed at one property (Mara Hilltop) and has minimal public documentation, which is the primary driver of its LLM invisibility. Data is collected daily using Claude Haiku and GPT-4o-mini across 39 prompts in 11 use case clusters, 3 runs each.
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
      <Section title="Coverage Over Time" subtitle="Daily brand mention totals across all use case clusters. Toggle brands using the legend below. Simbastack is pinned and shown even at zero — LLMs rarely surface bespoke boutique agents unprompted.">
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
                    {sortedLocked.map((brand, i) => {
                      const isPinned = PINNED_BRANDS.includes(brand);
                      return (
                        <Line
                          key={brand}
                          type="monotone"
                          dataKey={brand}
                          stroke={brandColor(brand)}
                          strokeWidth={isPinned ? 2.5 : 1.5}
                          strokeDasharray={isPinned ? undefined : "4 2"}
                          dot={false}
                          hide={hiddenBrands.has(brand)}
                          connectNulls
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Interactive legend */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px 10px", marginTop: 14 }}>
              {sortedLocked.map(brand => {
                const hidden = hiddenBrands.has(brand);
                const isPinned = PINNED_BRANDS.includes(brand);
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
                    <span style={{ fontSize: 11, fontWeight: isPinned ? 700 : 400, color: "#000" }}>{brand}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Section>

      {/* ── Visibility by LLM ─────────────────────────────────────────────── */}
      <Section title="Visibility by LLM" subtitle="How often each model mentions each brand. Differences reveal where brand perception diverges across Claude Haiku and GPT-4o-mini.">
        {modelData.every(d => d.claude === 0 && d.gpt === 0) ? (
          <EmptyState label="Awaiting data collection" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 480 }}>
              <ResponsiveContainer width="100%" height={Math.max(200, modelData.length * 32)}>
                <BarChart data={modelData} layout="vertical" margin={{ top: 0, right: 16, left: 100, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#000" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="brand" tick={{ fontSize: 11, fill: "#000" }} width={96} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="claude" name="Claude Haiku"   fill={CLAUDE} radius={[0, 3, 3, 0]} />
                  <Bar dataKey="gpt"    name="GPT-4o-mini"   fill={GPT}    radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          {[{ color: CLAUDE, label: "Claude Haiku" }, { color: GPT, label: "GPT-4o-mini" }].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "#000" }}>{label}</span>
            </div>
          ))}
        </div>
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
                  <p style={{ fontSize: 11, color: "#000", opacity: 0.55, margin: "0 0 10px", lineHeight: 1.4 }}>{cluster.description}</p>
                  {data.length === 0 ? (
                    <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 12, color: "#000", opacity: 0.4 }}>No mentions yet</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie data={data} dataKey="mentions" nameKey="brand" cx="50%" cy="50%" outerRadius={50} innerRadius={24}>
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
            0–100 score per feature for each of the 12 tracked brands. Scored by consensus across 3 model runs × 2 LLMs.
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
                      {featureBrandOrder.map(brand => {
                        const row = brandRowMap[brand];
                        const score = row?.score != null ? r5(row.score) : null;
                        const band  = row?.score_band ?? "absent";
                        const color = scoreBandColor(band);
                        const pct   = score != null ? `${score}%` : "0%";
                        const isSimbastack = brand === "Simbastack";
                        return (
                          <div key={brand}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                              <span style={{
                                fontSize: 11, color: "#000", width: 160, flexShrink: 0,
                                fontWeight: isSimbastack ? 700 : 400,
                                textDecoration: isSimbastack ? "underline" : "none",
                              }}>{brand}</span>
                              <div style={{ flex: 1, height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: pct, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s" }} />
                              </div>
                              <span style={{ fontSize: 11, color: "#000", width: 28, textAlign: "right" as const, fontVariantNumeric: "tabular-nums" }}>
                                {score ?? 0}
                              </span>
                              <span style={{
                                fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                                textTransform: "uppercase" as const, color: color,
                                width: 64, textAlign: "right" as const,
                              }}>{band}</span>
                            </div>
                            {row?.evidence && (
                              <p style={{ fontSize: 11, color: "#000", margin: "0 0 0 168px", lineHeight: 1.5, opacity: 0.65 }}>
                                {row.evidence}
                              </p>
                            )}
                          </div>
                        );
                      })}
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
                    <span style={{ fontSize: 14, fontWeight: row.brand_name === "Simbastack" ? 700 : 600, color: "#000" }}>{row.brand_name}</span>
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

      {/* ── LLM Visibility Playbook ───────────────────────────────────────── */}
      <div style={{
        background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)",
        padding: "28px 28px", marginBottom: 20,
      }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 6px" }}>
          LLM Visibility Playbook for Ranger
        </p>
        <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 20px" }}>
          Ranger AI surfaces in <strong>{simbaIntentRow?.total_mentions ?? 0} out of ~{buyerTotal} buyer-intent LLM responses</strong> tracked in this report — the prompts that simulate a hospitality operator actively choosing an AI agent to invest in. That gap is not a brand awareness problem in the traditional sense; it is a documentation and discoverability problem. Here is what moves the needle.
        </p>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>

          <div style={{ background: "rgba(4,120,87,0.04)", borderRadius: 10, padding: "16px 18px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#000", margin: "0 0 10px" }}>
              1. Publish a detailed Mara Hilltop case study
            </p>
            <Dot>Title it something an operator would search: <em>&ldquo;How a Maasai Mara safari lodge automated 90% of WhatsApp guest inquiries with an AI concierge.&rdquo;</em></Dot>
            <Dot>Include the specific metrics LLMs learn to cite: inquiry-to-booking conversion rate, average response time before vs. after Ranger, languages handled, and number of staff hours freed per week.</Dot>
            <Dot>Publish it on simbastack.com and submit it to hospitality tech publications (Hotelogix Blog, Cloudbeds Resource Hub, Skift, Hotel Management) — these are indexed sources LLMs draw from.</Dot>
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
