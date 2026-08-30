"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const NAVY  = "#000000";
const GREEN = "#059669";
const TEAL  = "#0D9488";

const LINE_COLORS = [
  "#059669","#0D9488","#2563EB","#7C3AED","#C026D3",
  "#DC2626","#D97706","#0891B2","#EA580C","#65A30D",
  "#BE185D","#84CC16","#0369A1","#92400E","#F43F5E",
  "#FB923C","#818CF8","#34D399","#FCD34D","#6EE7B7",
];

function lineColor(i: number) { return LINE_COLORS[i % LINE_COLORS.length]; }

const BRAND_COLOR_MAP: Record<string, string> = {
  "Broker Buddha":      "#059669",
  "Snapsheet":          "#0D9488",
  "RiskGenius":         "#2563EB",
  "Indio":              "#7C3AED",
  "Chisel AI":          "#C026D3",
  "InsuredMine":        "#DC2626",
  "Better Agency":      "#D97706",
  "TrustLayer":         "#0891B2",
  "Outmarket":          "#EA580C",
  "Amy by Cover Whale": "#65A30D",
};
function getBrandColor(brand: string): string {
  return BRAND_COLOR_MAP[brand] ?? LINE_COLORS[0];
}

// ── Locked brand list ─────────────────────────────────────────────────────────
const LOCKED_RALFI_BRANDS = new Set([
  "Broker Buddha","Snapsheet","Indio","RiskGenius","Chisel AI",
  "Better Agency","Amy by Cover Whale","TrustLayer","InsuredMine","Outmarket",
]);

// ── Primary use case per brand ────────────────────────────────────────────────
const BRAND_USE_CASE: Record<string, string> = {
  "Broker Buddha":      "ralfi-renewal",
  "Better Agency":      "ralfi-renewal",
  "Outmarket":          "ralfi-renewal",
  "Indio":              "ralfi-documents",
  "Chisel AI":          "ralfi-documents",
  "RiskGenius":         "ralfi-risk",
  "Snapsheet":          "ralfi-claims",
  "InsuredMine":        "ralfi-comms",
  "Amy by Cover Whale": "ralfi-comms",
  "TrustLayer":         "ralfi-compliance",
};

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface DailyRow        { date: string; brand: string; model: string; mention_count: number; avg_position: number | null }
interface WeeklyRow       { brand: string; model: string; mention_count: number; avg_position: number | null }
interface LLMVisRow       { model: string; visibility_pct: number; total_responses: number }
interface SOVRow          { cluster_tag: string; brand: string; total_appearances: number; sov_pct: number }
interface ClusterPosRow   { cluster_tag: string; brand: string; avg_position: number; appearances: number }
interface FeatureScoreRow { brand_name: string; feature_id: string; feature_tag: string; score: number | null; score_band: string; flagged_for_review: boolean; evidence: string | null }
interface SentimentRow    { brand_name: string; bucket_tag: string; positive_count: number; neutral_count: number; negative_count: number; total_count: number; top_descriptors: string[] }
interface SentimentMeta   { dual_model_dates: number; earliest_date: string | null; latest_date: string | null }

interface Props {
  dailySummary:     DailyRow[];
  weeklySummary:    WeeklyRow[];
  llmVisibility:    LLMVisRow[];
  sovData:          SOVRow[];
  clusterPositions: ClusterPosRow[];
  featureScores:    FeatureScoreRow[];
  sentimentData:    { rows: SentimentRow[]; meta: SentimentMeta };
}

// ── Feature config ─────────────────────────────────────────────────────────────
const FEATURE_NAMES: Record<string, string> = {
  renewal_auto_followup:         "Automatic follow-up with quiet clients or insurers",
  renewal_stage_reminders:       "Renewal stage tracking with days-to-expiry reminders",
  doc_structured_extraction:     "Structured data extraction from policy documents",
  doc_unstructured_processing:   "Processing of unstructured documents from email attachments",
  risk_client_data_collection:   "Automated collection of client risk data for submissions",
  risk_submission_gap_detection: "Missing information detection before submission is sent",
  claims_status_tracking:        "Claim status tracking with automatic insurer follow-up",
  claims_quiet_alert:            "Alert when a claim or insurer response has gone quiet",
  comms_broker_voice_email:      "Client emails drafted in the broker's own voice",
  comms_client_self_service:     "Client self-service for routine policy questions",
  compliance_timestamped_logging:"Automatic timestamped logging of every client and insurer contact",
  compliance_audit_export:       "Exportable audit trail covering every renewal action",
  security_private_ai:           "Private AI infrastructure — client data not used to train models",
  security_data_control:         "Broker data control — export and permanent deletion on request",
  pricing_cost:                  "Stated cost for an insurance brokerage",
  pricing_transparency:          "Pricing published without requiring a sales call",
  technical_integrations:        "Integrations with email and broker management systems",
  technical_setup:               "Self-serve setup — no IT or technical implementation required",
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  renewal_auto_followup:         "When a client or insurer goes quiet mid-renewal, the agent follows up automatically — no broker prompt required. This is the difference between a renewal that completes and one that quietly lapses.",
  renewal_stage_reminders:       "The agent tracks where each renewal sits in the pipeline and fires reminders or triggers the next action as the expiry date approaches. Nothing slips because the broker forgot to check.",
  doc_structured_extraction:     "Policy PDFs, schedules of values, and broker submissions are read automatically and their key fields entered into structured records — no manual re-keying from documents.",
  doc_unstructured_processing:   "Unstructured files — Word documents, free-form PDFs, email attachments in any format — are processed without the broker having to open and re-enter them manually.",
  risk_client_data_collection:   "The agent gathers the risk information an insurer needs — turnover, payroll, asset values, business descriptions — directly from the client, ready for submission. The broker doesn't have to chase each field by hand.",
  risk_submission_gap_detection: "Before a submission goes to an insurer, the agent checks it for missing fields and flags gaps early. Incomplete submissions get caught before the insurer does — not after a rejection or a request for clarification.",
  claims_status_tracking:        "Open claims are tracked automatically, and when an insurer response is overdue the agent follows up without being asked. The broker stays informed without having to monitor each claim manually.",
  claims_quiet_alert:            "When a claim has gone quiet — no insurer movement in a set window — the broker is alerted proactively. Stalled claims surface before they become a client complaint.",
  comms_broker_voice_email:      "The agent learns the broker's own writing style and drafts client emails in that voice — not in generic, clearly-AI-generated templates. The output reads like the broker wrote it.",
  comms_client_self_service:     "Routine client queries — what's my excess, when does my policy renew, what am I covered for — are handled by the agent without the broker stepping in. Clients get answers immediately; brokers get their time back.",
  compliance_timestamped_logging:"Every client contact, insurer email, and follow-up is automatically logged with a timestamp the moment it happens — no manual entry, no gaps in the record.",
  compliance_audit_export:       "The full renewal history — every email, action, and timestamp — can be exported in a single file for regulatory review, internal audit, or NIBA Code of Practice compliance.",
  security_private_ai:           "The AI runs on private infrastructure, which means broker and client data is not used to train models and does not flow into a shared AI pool. What the brokerage puts in stays within its own boundary.",
  security_data_control:         "Brokers can export everything they've ever entered and request permanent deletion at any time — no data held hostage, no lock-in past the end of the relationship.",
  pricing_cost:                  "The platform publishes a specific price — per broker, per seat, or a flat brokerage fee — so a firm can assess cost before speaking to anyone.",
  pricing_transparency:          "Pricing is on the website. A brokerage can work out whether the product fits its budget without having to book a sales call just to find out the number.",
  technical_integrations:        "The systems the agent connects to — Outlook, Gmail, broker management platforms, policy data sources — are documented publicly, so a brokerage knows what it's buying before it commits.",
  technical_setup:               "A brokerage can connect and configure the agent without technical staff, IT involvement, or a months-long implementation project. Self-serve setup is the standard, not a premium add-on.",
};

const FEATURE_GROUPS = [
  { label: "Renewal Management",    features: ["renewal_auto_followup","renewal_stage_reminders"] },
  { label: "Document Processing",   features: ["doc_structured_extraction","doc_unstructured_processing"] },
  { label: "Risk & Submission",     features: ["risk_client_data_collection","risk_submission_gap_detection"] },
  { label: "Claims Advocacy",       features: ["claims_status_tracking","claims_quiet_alert"] },
  { label: "Client Communication",  features: ["comms_client_self_service"] },
  { label: "Compliance & Audit",    features: ["compliance_timestamped_logging"] },
  { label: "Pricing & Technical",   features: ["pricing_cost","pricing_transparency","technical_integrations","technical_setup"] },
];

const HIDDEN_FEATURE_IDS = new Set<string>(["pricing_cost"]);

const BAND_COLORS: Record<string, string> = {
  // DB stores high/medium/low from ralfi scoring function
  high:    "#16a34a",
  medium:  "#2563eb",
  low:     "#d97706",
  // legacy aliases (Lamigo-style)
  strong:  "#16a34a",
  present: "#2563eb",
  partial: "#d97706",
  weak:    "#dc2626",
};
const BAND_FALLBACK: Record<string, string> = {
  strong:  "Strong capability confirmed. The platform demonstrates this feature comprehensively.",
  present: "Capability confirmed and present in the core product offering.",
  partial: "Partial capability detected. Some support exists but depth or documentation may be limited.",
  weak:    "Limited capability based on available assessment information.",
};

function featureName(id: string): string {
  return FEATURE_NAMES[id] ?? id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function cleanEvidence(raw: string | null): string | null {
  if (!raw) return null;
  const stripped = raw.replace(/<cite[^>]*>/g, "").replace(/<\/cite>/g, "").trim();
  if (!stripped) return null;
  const lower = stripped.toLowerCase();
  if (
    lower.includes("not explicitly document") || lower.includes("does not document") ||
    lower.includes("no specific documentation") || lower.includes("not documented") ||
    lower.includes("cannot be confirmed") || lower.includes("no available information")
  ) return null;
  const LIMIT = 300;
  if (stripped.length <= LIMIT) return stripped;
  const cut = stripped.lastIndexOf(". ", LIMIT);
  return cut > 0 ? stripped.slice(0, cut + 1) : stripped;
}

function twoSentences(text: string): string {
  let end = text.indexOf(". ");
  if (end === -1) return text;
  end = text.indexOf(". ", end + 2);
  return end > 0 ? text.slice(0, end + 1) : text;
}

// ── SOV clusters ──────────────────────────────────────────────────────────────
const SOV_CLUSTERS = [
  { tag: "ralfi-renewal",    label: "Renewal Management" },
  { tag: "ralfi-documents",  label: "Document Processing" },
  { tag: "ralfi-risk",       label: "Risk & Submission" },
  { tag: "ralfi-claims",     label: "Claims Advocacy" },
  { tag: "ralfi-comms",      label: "Client Communication" },
  { tag: "ralfi-compliance", label: "Compliance & Audit" },
];

const SENTIMENT_CLUSTERS = [
  { tag: "ralfi-renewal",    label: "Renewal Management" },
  { tag: "ralfi-documents",  label: "Document Processing" },
  { tag: "ralfi-risk",       label: "Risk & Submission" },
  { tag: "ralfi-claims",     label: "Claims Advocacy" },
  { tag: "ralfi-comms",      label: "Client Communication" },
  { tag: "ralfi-compliance", label: "Compliance & Audit" },
];

// ── Tooltip ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CombinedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted = [...payload].filter((i: any) => i.value != null).sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0));
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.10)", borderRadius: 8, fontSize: 15, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "8px 12px", zIndex: 100 }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: NAVY }}>{fmtDate(String(label))}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {sorted.map((item: any) => (
        <div key={item.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0, display: "inline-block" }} />
          <span style={{ color: item.value > 0 ? item.color : "#aaa" }}>{String(item.dataKey)}: {item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px", borderTop: accent ? `3px solid ${accent}` : undefined }}>
      {children}
    </div>
  );
}
function CardLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000", marginBottom: 8 }}>{children}</p>;
}
function BigNumber({ value, sub }: { value: string; sub: string }) {
  return (
    <>
      <p style={{ fontSize: 36, fontWeight: 800, color: NAVY, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      <p style={{ fontSize: 15, color: "#000" }}>{sub}</p>
    </>
  );
}

// ── Pie label ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const angle = percent >= 0.999 ? 90 : midAngle;
  const x = cx + radius * Math.cos(-angle * RADIAN);
  const y = cy + radius * Math.sin(-angle * RADIAN);
  return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 13, fontWeight: 700, pointerEvents: "none" }}>{`${Math.round(percent * 100)}%`}</text>;
}

// ── SOV donut card ────────────────────────────────────────────────────────────
function SOVCard({ cluster, rows }: { cluster: typeof SOV_CLUSTERS[number]; rows: SOVRow[] }) {
  const locked = rows.filter(r => LOCKED_RALFI_BRANDS.has(r.brand) && BRAND_USE_CASE[r.brand] === cluster.tag);
  const totalApp = locked.reduce((s, r) => s + r.total_appearances, 0);
  const mapped = locked.map(r => ({ ...r, sov_pct: totalApp > 0 ? Math.round((r.total_appearances / totalApp) * 1000) / 10 : 0 }));
  const top8 = mapped.slice(0, 8);
  const restApp = mapped.slice(8).reduce((s, r) => s + r.total_appearances, 0);
  const othersEntry = restApp > 0 ? { brand: "Others", cluster_tag: cluster.tag, total_appearances: restApp, sov_pct: Math.round((restApp / totalApp) * 1000) / 10 } : null;
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
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 15, border: "1px solid rgba(0,0,0,0.1)" }} formatter={(_v, _n, p) => [`${(p.payload as SOVRow & { sov_pct: number }).sov_pct}%`, (p.payload as SOVRow).brand]} />
          </PieChart>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {slices.map(r => (
            <div key={r.brand} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: colorMap[r.brand] }} />
              <span style={{ fontSize: 15, color: NAVY, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.brand}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#000", flexShrink: 0 }}>{r.sov_pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RalfiVisibilityCharts({ dailySummary, weeklySummary, llmVisibility, sovData, clusterPositions, featureScores, sentimentData: sentimentDataRaw }: Props) {
  const sentimentData = { ...sentimentDataRaw, rows: sentimentDataRaw.rows.filter(r => LOCKED_RALFI_BRANDS.has(r.brand_name)) };
  const hasReal = dailySummary.length > 0;

  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());
  function toggleBrand(b: string) {
    setHiddenBrands(prev => { const next = new Set(prev); next.has(b) ? next.delete(b) : next.add(b); return next; });
  }

  // ── Build chart rows — locked brands only ─────────────────────────────────
  const dateSet = new Set<string>();
  const index: Record<string, Record<string, number>> = {};
  for (const row of dailySummary) {
    if (!LOCKED_RALFI_BRANDS.has(row.brand)) continue;
    dateSet.add(row.date);
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
  }

  // ── Weekly totals ──────────────────────────────────────────────────────────
  const weeklyTotals: Record<string, { mentions: number; avgPos: number | null }> = {};
  for (const row of weeklySummary) {
    if (!LOCKED_RALFI_BRANDS.has(row.brand)) continue;
    const e = weeklyTotals[row.brand] ?? { mentions: 0, avgPos: null };
    weeklyTotals[row.brand] = { mentions: e.mentions + row.mention_count, avgPos: row.avg_position ?? e.avgPos };
  }

  const dates  = [...dateSet].sort();
  const brands = [...LOCKED_RALFI_BRANDS].sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0));
  const brandColor = (b: string) => getBrandColor(b);

  // ── Combined chart rows ────────────────────────────────────────────────────
  const chartRows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const b of brands) row[b] = index[date]?.[b] ?? 0;
    return row;
  });

  // ── Per-cluster chart rows ─────────────────────────────────────────────────
  const clusterCharts = SOV_CLUSTERS.map(cluster => {
    const clusterBrands = Object.entries(BRAND_USE_CASE)
      .filter(([, tag]) => tag === cluster.tag)
      .map(([b]) => b)
      .filter(b => LOCKED_RALFI_BRANDS.has(b))
      .sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0));
    const rows = dates.map(date => {
      const row: Record<string, number | string> = { date };
      for (const b of clusterBrands) row[b] = index[date]?.[b] ?? 0;
      return row;
    });
    return { ...cluster, clusterBrands, rows };
  });

  // ── Aggregate metrics ──────────────────────────────────────────────────────
  const totalMentions = Object.values(weeklyTotals).reduce((s, v) => s + v.mentions, 0);
  const hasWeekly = Object.keys(weeklyTotals).length > 0;
  const topByMentions = brands.reduce<string | null>((best, b) =>
    !best || (weeklyTotals[b]?.mentions ?? 0) > (weeklyTotals[best]?.mentions ?? 0) ? b : best, null);

  // ── Model mentions by brand ────────────────────────────────────────────────
  const modelMentionsByBrand: Record<string, { claude: number; gpt: number }> = {};
  for (const row of dailySummary) {
    if (!LOCKED_RALFI_BRANDS.has(row.brand)) continue;
    if (!modelMentionsByBrand[row.brand]) modelMentionsByBrand[row.brand] = { claude: 0, gpt: 0 };
    if (row.model === "claude-haiku-4-5") modelMentionsByBrand[row.brand].claude += row.mention_count;
    else modelMentionsByBrand[row.brand].gpt += row.mention_count;
  }
  const modelMentionsData = brands
    .map(b => ({ brand: b, claude: modelMentionsByBrand[b]?.claude ?? 0, gpt: modelMentionsByBrand[b]?.gpt ?? 0 }))
    .filter(d => d.claude + d.gpt > 0)
    .sort((a, b) => (b.claude + b.gpt) - (a.claude + a.gpt));

  // ── Position table ─────────────────────────────────────────────────────────
  const posTable = Object.entries(weeklyTotals)
    .filter(([brand, v]) => LOCKED_RALFI_BRANDS.has(brand) && v.avgPos != null)
    .sort((a, b) => (a[1].avgPos ?? 99) - (b[1].avgPos ?? 99))
    .map(([brand, v], i) => ({ rank: i + 1, brand, avgPos: v.avgPos as number, mentions: v.mentions }));

  // ── Position by use case ───────────────────────────────────────────────────
  const clusterPosLookup: Record<string, Record<string, number>> = {};
  for (const row of clusterPositions) {
    if (!LOCKED_RALFI_BRANDS.has(row.brand)) continue;
    if (!clusterPosLookup[row.cluster_tag]) clusterPosLookup[row.cluster_tag] = {};
    clusterPosLookup[row.cluster_tag][row.brand] = row.avg_position;
  }
  const clusterGroups = SOV_CLUSTERS.map(cluster => {
    const brandsInCluster = Object.entries(BRAND_USE_CASE)
      .filter(([, tag]) => tag === cluster.tag)
      .map(([brand]) => brand)
      .filter(brand => LOCKED_RALFI_BRANDS.has(brand))
      .map(brand => ({ brand, avg_position: clusterPosLookup[cluster.tag]?.[brand] ?? null }))
      .sort((a, b) => (a.avg_position ?? 999) - (b.avg_position ?? 999));
    return { ...cluster, brands: brandsInCluster };
  });
  const hasClusterPos = clusterPositions.length > 0;

  // ── Sentiment helpers ──────────────────────────────────────────────────────
  function sentimentDateLabel() {
    const e = sentimentData.meta.earliest_date;
    const l = sentimentData.meta.latest_date;
    if (!e || !l) return "";
    const fmt = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", { month: "short", day: "numeric", timeZone: "UTC" });
    return e === l ? fmt(e) : `${fmt(e)} – ${fmt(l)}`;
  }
  const globalDescFreq = new Map<string, number>();
  for (const r of sentimentData.rows) for (const d of r.top_descriptors) globalDescFreq.set(d, (globalDescFreq.get(d) ?? 0) + 1);
  const sentimentReady = (sentimentData.meta.dual_model_dates ?? 0) >= 3;

  const hasVis = llmVisibility.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-0" style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 80 }}>

      {/* ── Row 1: Metric cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

        <Card accent={GREEN}>
          <CardLabel>Brand Mentions · 14 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "—"}
            sub={hasWeekly ? `across ${brands.filter(b => (weeklyTotals[b]?.mentions ?? 0) > 0).length} brands · 2 models` : "No data yet"}
          />
        </Card>

        <Card accent={TEAL}>
          <CardLabel>LLM Visibility · 14 Days</CardLabel>
          {!hasVis ? <p style={{ fontSize: 17, color: "#000" }}>No data yet</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {llmVisibility.map((v, i) => {
                const label = v.model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? GREEN : TEAL;
                return (
                  <div key={v.model}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{label}</span>
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
        </Card>

        <Card accent={NAVY}>
          <CardLabel>Top Brand · 14 Days</CardLabel>
          {topByMentions && weeklyTotals[topByMentions] ? (
            <>
              <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 4 }}>{topByMentions}</p>
              <p style={{ fontSize: 15, color: "#000" }}>
                {weeklyTotals[topByMentions].mentions.toLocaleString()} mentions
                {weeklyTotals[topByMentions].avgPos != null ? ` · avg position ${weeklyTotals[topByMentions].avgPos!.toFixed(1)}` : ""}
              </p>
            </>
          ) : <p style={{ fontSize: 17, color: "#000" }}>No data yet</p>}
        </Card>

      </div>

      {/* ── Row 2: Combined trend ── */}
      {hasReal && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px 16px" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>Brand Mentions: 14-Day Trend</h3>
          <p style={{ fontSize: 15, color: "#000", marginBottom: 14 }}>All locked brands · both models combined</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CombinedTooltip />} wrapperStyle={{ zIndex: 100 }} allowEscapeViewBox={{ x: false, y: true }} />
              {brands.map(b => (
                <Line key={b} type="monotone" dataKey={b} stroke={brandColor(b)}
                  strokeWidth={hiddenBrands.has(b) ? 0 : 2} dot={false}
                  activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", flex: 1 }}>
              {brands.map(b => (
                <label key={b} style={{ display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", opacity: hiddenBrands.has(b) ? 0.45 : 1 }}>
                  <input type="checkbox" checked={!hiddenBrands.has(b)} onChange={() => toggleBrand(b)} style={{ accentColor: brandColor(b), width: 13, height: 13, cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: hiddenBrands.has(b) ? "#999" : NAVY }}>{b}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
              <button onClick={() => setHiddenBrands(new Set())} style={{ fontSize: 12, fontWeight: 600, color: GREEN, background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" as const }}>Select All</button>
              <button onClick={() => setHiddenBrands(new Set(brands))} style={{ fontSize: 12, fontWeight: 600, color: "#555", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" as const }}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: Trends by use case ── */}
      {hasReal && (
        <>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>Brand Mentions: Trend by Use Case</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {clusterCharts.map(({ tag, label, clusterBrands, rows }) => (
              <div key={tag} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px 16px" }}>
                <h4 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>{label}</h4>
                <p style={{ fontSize: 15, color: "#000", marginBottom: 14 }}>14-day mentions · both models</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} dy={6} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip content={<CombinedTooltip />} wrapperStyle={{ zIndex: 100 }} allowEscapeViewBox={{ x: false, y: true }} />
                    {clusterBrands.map(b => (
                      <Line key={b} type="monotone" dataKey={b} stroke={brandColor(b)}
                        strokeWidth={hiddenBrands.has(b) ? 0 : 2} dot={false}
                        activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  {clusterBrands.map(b => (
                    <label key={b} style={{ display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", opacity: hiddenBrands.has(b) ? 0.45 : 1 }}>
                      <input type="checkbox" checked={!hiddenBrands.has(b)} onChange={() => toggleBrand(b)} style={{ accentColor: brandColor(b), width: 13, height: 13, cursor: "pointer", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: hiddenBrands.has(b) ? "#999" : NAVY }}>{b}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Row 4: Brand mentions by model ── */}
      {hasReal && modelMentionsData.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 20px" }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>Brand Mentions · 14 Days · by Model</h3>
            <p style={{ fontSize: 16, color: "#000" }}>Total mentions per brand across Claude Haiku and GPT-4o mini</p>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            {[{ label: "Claude Haiku", color: "#2563EB" }, { label: "GPT-4o mini", color: GREEN }].map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={modelMentionsData.length * 28 + 10}>
            <BarChart layout="vertical" data={modelMentionsData} margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barSize={14}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="brand" width={150} tick={{ fontSize: 15, fill: NAVY }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.10)", fontSize: 16 }} formatter={(value, name) => [value, name === "claude" ? "Claude Haiku" : "GPT-4o mini"]} />
              <Bar dataKey="claude" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} />
              <Bar dataKey="gpt"    stackId="a" fill={GREEN}  radius={[3, 3, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Row 4b: Position table ── */}
      {posTable.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>Brand Position Summary</h3>
            <p style={{ fontSize: 16, color: "#000", marginBottom: 6 }}>Average position brands appear in AI responses (lower is stronger)</p>
            <p style={{ fontSize: 13, color: "#92400e", background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 6, padding: "7px 12px", margin: 0, lineHeight: 1.55 }}>
              <strong>Small-sample caution:</strong> Average position is only meaningful with 10+ mentions. A brand that appeared once, in position 1, ranks ahead of brands with hundreds of mentions but a position-2 average — that&rsquo;s a data artefact, not a visibility win. Rows marked <span style={{ fontWeight: 700, color: "#d97706" }}>low sample</span> should not be compared directly to high-mention brands.
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 17 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.025)" }}>
                  {["Rank","Brand","Avg Position","14-Day Mentions"].map(h => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 15, fontWeight: 700, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posTable.map((row, i) => (
                  <tr key={row.brand} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.012)" }}>
                    <td style={{ padding: "11px 20px", color: "#000", fontWeight: 600 }}>#{row.rank}</td>
                    <td style={{ padding: "11px 20px", fontWeight: 600, color: NAVY }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(row.brand), flexShrink: 0, display: "inline-block" }} />
                        {row.brand}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", color: NAVY }}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", background: row.avgPos <= 3 ? "rgba(5,150,105,0.10)" : "rgba(0,0,0,0.05)", color: row.avgPos <= 3 ? GREEN : "#000" }}>
                        {row.avgPos.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", color: "#000" }}>
                      {row.mentions.toLocaleString()}
                      {row.mentions < 10 && (
                        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "#d97706", background: "rgba(217,119,6,0.10)", border: "1px solid rgba(217,119,6,0.25)", borderRadius: 3, padding: "1px 5px" }}>low sample</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Row 5: Avg position by use case ── */}
      {hasClusterPos && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>Avg Brand Position by Use Case</h3>
            <p style={{ fontSize: 16, color: "#000" }}>Each brand shown in its primary use case · lower is better</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            {clusterGroups.map((cluster, ci) => (
              <div key={cluster.tag} style={{ padding: "16px 20px", borderRight: ci % 3 !== 2 ? "1px solid rgba(0,0,0,0.06)" : undefined, borderBottom: ci < 3 ? "1px solid rgba(0,0,0,0.06)" : undefined }}>
                <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#000", marginBottom: 12 }}>{cluster.label}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cluster.brands.map(({ brand, avg_position }) => (
                    <div key={brand} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(brand), flexShrink: 0, display: "inline-block" }} />
                      <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: NAVY }}>{brand}</span>
                      {avg_position != null ? (
                        <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", background: avg_position <= 3 ? "rgba(5,150,105,0.10)" : "rgba(0,0,0,0.05)", color: avg_position <= 3 ? GREEN : "#000" }}>
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

      {/* ── Row 6: SOV donuts ── */}
      {sovData.length > 0 && (
        <>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>Use Case Share of Voice</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {SOV_CLUSTERS.map(cluster => {
              const rows = sovData.filter(r => r.cluster_tag === cluster.tag);
              return rows.length > 0 ? <SOVCard key={cluster.tag} cluster={cluster} rows={rows} /> : null;
            })}
          </div>
        </>
      )}

      {/* ── Row 7: Feature scores ── */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>Product Feature Scores</h3>
          {featureScores.length === 0 && <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#000", background: "rgba(0,0,0,0.06)", borderRadius: 999, padding: "3px 8px" }}>Collecting</span>}
        </div>
        {featureScores.length === 0 ? (
          <div style={{ padding: "28px 24px", textAlign: "center" as const }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Feature scores are being collected</p>
            <p style={{ fontSize: 16, color: "#000", maxWidth: 420, margin: "0 auto" }}>
              Scores appear once the feature assessment pipeline has run across the locked brands. Check back soon.
            </p>
          </div>
        ) : (
          <div style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: 15, color: "#000", marginBottom: 24 }}>Both models · updates daily</p>
            {FEATURE_GROUPS.map(group => {
              const groupFeatures = group.features
                .filter(featureId => !HIDDEN_FEATURE_IDS.has(featureId))
                .map(featureId => {
                  const allRows = featureScores.filter(r => r.feature_id === featureId);
                  const scoredRows = allRows
                    .filter(r => r.score !== null && r.score_band !== "not_documented")
                    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                    .slice(0, 3);
                  const allNotDocumented = allRows.length > 0 && allRows.every(r => r.score_band === "not_documented");
                  return { featureId, rows: scoredRows, allNotDocumented };
                });
              return (
                <div key={group.label} style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: GREEN, marginBottom: 14 }}>{group.label}</p>
                  {groupFeatures.map(({ featureId, rows, allNotDocumented }) => (
                    <div key={featureId} style={{ marginBottom: 18 }}>
                      <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 4 }}>{featureName(featureId)}</p>
                      {FEATURE_DESCRIPTIONS[featureId] && (
                        <p style={{ fontSize: 15, color: GREEN, lineHeight: 1.6, margin: "0 0 10px" }}>{FEATURE_DESCRIPTIONS[featureId]}</p>
                      )}
                      {rows.length === 0 && !allNotDocumented ? (
                        <p style={{ fontSize: 14, color: "#94a3b8", fontStyle: "italic", margin: 0 }}>Scoring in progress — no brand has documented this feature yet.</p>
                      ) : rows.length === 0 && allNotDocumented ? (
                        <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, lineHeight: 1.55 }}>
                          <strong style={{ color: "#64748b" }}>Not documented across all 10 brands.</strong>{" "}
                          LLMs found no publicly available information confirming any brand in this cohort has documented this capability — meaning a brand that does document it clearly will have no competition for LLM citation on this feature.
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {rows.map(r => {
                            const ev = cleanEvidence(r.evidence) ?? BAND_FALLBACK[r.score_band];
                            return (
                              <div key={r.brand_name}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 16, fontWeight: 500, color: NAVY, width: 168, flexShrink: 0, lineHeight: 1.3 }}>{r.brand_name}</span>
                                  <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                                    <div style={{ width: `${r.score ?? 0}%`, height: 6, borderRadius: 999, background: BAND_COLORS[r.score_band] ?? "#94a3b8" }} />
                                  </div>
                                  <span style={{ fontSize: 16, fontWeight: 700, color: BAND_COLORS[r.score_band] ?? NAVY, width: 28, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{r.score ?? "—"}</span>
                                </div>
                                {ev && <p style={{ paddingLeft: 178, fontSize: 17, color: "#000", lineHeight: 1.5, margin: "4px 0 0" }}>{ev}</p>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
            <p style={{ fontSize: 15, color: "#000", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 4 }}>
              Top 3 brands per feature · scored by both Claude Haiku and GPT-4o mini
            </p>
          </div>
        )}
      </div>

      {/* ── Row 8: Sentiment analysis ── */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>Sentiment Analysis</h3>
          {!sentimentReady && <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#000", background: "rgba(0,0,0,0.06)", borderRadius: 999, padding: "3px 8px" }}>Collecting</span>}
        </div>
        {!sentimentReady ? (
          <div style={{ padding: "28px 24px", textAlign: "center" as const }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Collecting data: {sentimentData.meta.dual_model_dates} of 3 minimum days</p>
            <p style={{ fontSize: 16, color: "#000", maxWidth: 380, margin: "0 auto" }}>
              Sentiment bars appear once both Claude Haiku and GPT-4o-mini have collected on 3 separate days.
            </p>
          </div>
        ) : (
          <div style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: 15, color: "#000", marginBottom: 24 }}>How Claude Haiku and GPT-4o-mini describe each brand · {sentimentDateLabel()}</p>
            {SENTIMENT_CLUSTERS.map(cluster => {
              const clusterBrands = sentimentData.rows.filter(r => r.bucket_tag === cluster.tag).sort((a, b) => b.positive_count - a.positive_count);
              if (clusterBrands.length === 0) return null;
              return (
                <div key={cluster.tag} style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: GREEN, marginBottom: 14 }}>{cluster.label}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {clusterBrands.map(brand => {
                      const total = brand.total_count || 1;
                      const posPct = Math.round((brand.positive_count / total) * 100);
                      const neuPct = Math.round((brand.neutral_count  / total) * 100);
                      const negPct = 100 - posPct - neuPct;
                      return (
                        <div key={brand.brand_name}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                            <span style={{ fontSize: 16, fontWeight: 600, color: NAVY, width: 148, flexShrink: 0, lineHeight: 1.25 }}>{brand.brand_name}</span>
                            <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden", display: "flex" }}>
                              {posPct > 0 && <div style={{ width: `${posPct}%`, height: "100%", background: "#16a34a" }} />}
                              {neuPct > 0 && <div style={{ width: `${neuPct}%`, height: "100%", background: "#d97706" }} />}
                              {negPct > 0 && <div style={{ width: `${negPct}%`, height: "100%", background: "#dc2626" }} />}
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "#16a34a", width: 34, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{posPct}%</span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, paddingLeft: 158 }}>
                            {[...new Set(brand.top_descriptors)].slice(0, 4).map((d, i) => {
                              const unique = globalDescFreq.get(d) === 1;
                              return (
                                <span key={i} style={{ fontSize: 15, color: unique ? GREEN : "#000", background: unique ? "rgba(5,150,105,0.08)" : "rgba(0,0,0,0.04)", border: `1px solid ${unique ? "rgba(5,150,105,0.25)" : "rgba(0,0,0,0.08)"}`, borderRadius: 4, padding: "2px 7px", fontWeight: unique ? 600 : 400 }}>{d}</span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 16, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 4 }}>
              {[["#16a34a","Positive"],["#d97706","Neutral"],["#dc2626","Negative"]].map(([color, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: "#000" }}>{label}</span>
                </div>
              ))}
              <span style={{ fontSize: 15, color: "#000", marginLeft: "auto" }}>Both models · updates weekly</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Brand Capability Spotlight ── */}
      {featureScores.length > 0 && (() => {
        const CLUSTER_LABEL: Record<string, string> = {
          "ralfi-renewal":    "Renewal Management",
          "ralfi-documents":  "Document Processing",
          "ralfi-risk":       "Risk & Submission",
          "ralfi-claims":     "Claims Advocacy",
          "ralfi-comms":      "Client Communication",
          "ralfi-compliance": "Compliance & Audit",
          "ralfi-security":   "Security & Privacy",
          "ralfi-pricing":    "Pricing & Technical",
          "ralfi-technical":  "Pricing & Technical",
        };
        // Manually reviewed overrides where pipeline evidence is insufficient or misleading
        const SPOTLIGHT_OVERRIDE: Record<string, { feature: string; cluster: string; description: string }> = {
          "Amy by Cover Whale": {
            feature: "Commercial Auto Broker Platform",
            cluster: "Claims Advocacy",
            description: "Amy by Cover Whale operates in the commercial trucking and auto insurance space, built for the 6,000+ agents and brokers distributing Cover Whale products. Cover Whale's AI stack centres on instant quoting, real-time telematics-based risk monitoring, and underwriting automation — though Amy's specific broker workflow capabilities are not yet widely documented in LLM training data.",
          },
          "TrustLayer": {
            feature: "Certificate of Insurance Tracking",
            cluster: "Compliance & Audit",
            description: "TrustLayer automates certificate of insurance collection and compliance verification — tracking vendor and contractor insurance requirements, flagging coverage gaps, and identifying expired policies. The AI layer reduces the manual work of chasing and reviewing compliance documentation across broker and client networks.",
          },
          "Snapsheet": {
            feature: "AI-Configured Claims Workflow",
            cluster: "Claims Advocacy",
            description: "Snapsheet's AI product lets users select a foundational model, configure system and user prompts, deploy AI actions inside no-code workflows using real-time claim data, chain outputs into if/then logic, and route to human oversight when required. Named a Celent Luminary in the 2026 North America P&C Claims Systems Report — the highest distinction, awarded to 6 of 66 systems evaluated.",
          },
        };
        const spotlight = Array.from(LOCKED_RALFI_BRANDS).map(brand => {
          // Only consider features with a genuine positive score (> 0) — score=0 means "no" verdict
          const top = featureScores.filter(r => r.brand_name === brand && r.score !== null && r.score > 0).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null;
          return { brand, top };
        });
        return (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>Brand Capability Spotlight</h3>
              <p style={{ fontSize: 15, color: "#000", margin: "6px 0 0" }}>Each brand&rsquo;s strongest documented capability · multi-model LLM assessment</p>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
                {spotlight.map(({ brand, top }) => {
                  const override = SPOTLIGHT_OVERRIDE[brand];
                  const clusterLabel = override
                    ? override.cluster
                    : (top ? (CLUSTER_LABEL[top.feature_tag] ?? "") : (CLUSTER_LABEL[BRAND_USE_CASE[brand]] ?? ""));
                  const featureLabel = override ? override.feature : (top ? featureName(top.feature_id) : null);
                  const description = override
                    ? override.description
                    : (top ? (cleanEvidence(top.evidence) ?? null) : null);
                  const descShort = description ?? null;
                  return (
                    <div key={brand} style={{
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderLeft: `3px solid ${GREEN}`,
                      borderRadius: 8,
                      padding: "14px 16px",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: NAVY, flex: 1, lineHeight: 1.3 }}>{brand}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#555", background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap" as const, letterSpacing: "0.03em", flexShrink: 0 }}>{clusterLabel}</span>
                      </div>
                      {featureLabel && (
                        <p style={{ fontSize: 14, fontWeight: 600, color: GREEN, margin: "0 0 8px", lineHeight: 1.35 }}>{featureLabel}</p>
                      )}
                      {descShort
                        ? <p style={{ fontSize: 13, color: "#555", lineHeight: 1.55, margin: 0 }}>{descShort}</p>
                        : <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" as const, margin: 0 }}>No capability documentation found in LLM training data.</p>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── LLM Visibility Playbook ── */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>LLM Visibility Playbook: New Research</h3>
          <p style={{ fontSize: 15, color: "#000", margin: "6px 0 0" }}>How Broker Buddha and Snapsheet got visible to AI models — and what Ralfi should do next</p>
        </div>
        <div style={{ padding: "20px 24px" }}>

          {/* Framing */}
          <p style={{ fontSize: 16, color: "#444", lineHeight: 1.6, margin: "0 0 24px" }}>
            Here&rsquo;s how your two most visible competitors built that visibility &mdash; and what to take from each.
          </p>

          {/* ── Broker Buddha ── */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>Broker Buddha: Naming Everything at Once</p>
            <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: "0 0 10px" }}>
              <span style={{ fontWeight: 700 }}>Why it&rsquo;s visible: </span>Broker Buddha built LLM retrieval through a small number of highly specific documentation choices &mdash; named workflows, named integrations with data-direction labels, and named competitor comparisons &mdash; rather than publishing volume.
            </p>
            <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: "0 0 6px" }}>
              <span style={{ fontWeight: 700 }}>How:</span>
            </p>
            <ul style={{ margin: "0 0 12px", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span><a href="https://www.brokerbuddha.com/simplicity/introducing-broker-buddha-ai-public-beta" target="_blank" rel="noopener" style={{ color: GREEN }}>March 2026 beta announcement ↗</a> named 7 specific workflows: insured-data intake, opportunity &amp; placement, market submissions, loss-run sourcing, policy servicing, policy administration, eSign. Enumeration gives LLMs something concrete to retrieve.</span>
              </li>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span><a href="http://brokerbuddha.com/en/faqs" target="_blank" rel="noopener" style={{ color: GREEN }}>FAQ ↗</a> names <strong>AMS360, Applied Epic, HawkSoft, and Momentum Amp</strong> explicitly &mdash; not &ldquo;your existing systems.&rdquo; A <a href="http://brokerbuddha.com/integrations/applied-epic" target="_blank" rel="noopener" style={{ color: GREEN }}>dedicated Applied Epic page ↗</a> shows exact sync objects, data direction (live / periodic / not available), and API scope.</span>
              </li>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span><a href="http://brokerbuddha.com/en/products" target="_blank" rel="noopener" style={{ color: GREEN }}>Products page ↗</a> uses mechanism language: &ldquo;ACORD forms auto pre-filled from AMS,&rdquo; &ldquo;multi-carrier submissions wizard with status tracking and quote comparison.&rdquo; Named mechanisms are citable; outcomes alone are not.</span>
              </li>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span>&ldquo;Switch from&rdquo; migration copy names 7 competitors directly: <strong>Indio, Wunderite, CSR24, InsurLink, AgencyZoom, InsuredMine, HubSpot</strong>. A buyer searching &ldquo;switch from Indio&rdquo; lands on Broker Buddha&rsquo;s own product page.</span>
              </li>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span><a href="https://www.prnewswire.com/news-releases/hawksoft-and-broker-buddha-announce-two-way-integration-partnership-302824900.html" target="_blank" rel="noopener" style={{ color: GREEN }}>HawkSoft on PR Newswire (July 14) ↗</a>, then Loss Run Pro (July 21) and CoverForce (July 28) &mdash; three independently indexed documents naming the same product in one month, raising LLM citation confidence across sources.</span>
              </li>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span><a href="http://capterra.com/p/190786/Broker-Buddha" target="_blank" rel="noopener" style={{ color: GREEN }}>Capterra 4.6/5 (13 reviews) ↗</a>: reviewers independently use &ldquo;prefilled renewals&rdquo; and &ldquo;automated follow-ups&rdquo; &mdash; the same language as the product pages. Cross-source match is what turns a self-reported claim into a corroborated one.</span>
              </li>
            </ul>
            {(() => {
              const bb = weeklyTotals["Broker Buddha"];
              return (
                <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: "0 0 12px", background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.4)", borderRadius: 6, padding: "8px 12px" }}>
                  <span style={{ fontWeight: 700 }}>Broker Buddha data: </span>
                  {bb ? <>{bb.mentions.toLocaleString()} mentions{bb.avgPos != null ? `, avg position ${bb.avgPos.toFixed(1)}` : ""} across all clusters in this report.</> : "Data loading."}
                </p>
              );
            })()}
            <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.03) 100%)", border: "1px solid rgba(37,99,235,0.18)", borderLeft: "4px solid #2563eb", borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
              <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#2563eb", margin: "0 0 6px" }}>Takeaway</p>
              <p style={{ fontSize: 16, color: "#000", lineHeight: 1.65, margin: 0 }}>The 5&ndash;7 highly specific items &mdash; named integrations with data-direction labels, workflow enumeration, ACORD mechanism language &mdash; prove that LLM visibility is a documentation quality problem, not a quantity problem. Every named item is a discrete retrieval anchor; the category claim &ldquo;renewal automation platform&rdquo; adds almost none.</p>
            </div>
          </div>

          {/* ── Snapsheet ── */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>Snapsheet: Mechanism Depth + Analyst Authority</p>
            <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: "0 0 10px" }}>
              <span style={{ fontWeight: 700 }}>Why it&rsquo;s visible: </span>Snapsheet combined a mechanistic product page &mdash; giving LLMs a citable explanation of exactly how its AI works &mdash; with an independent analyst designation that no self-published document can replicate.
            </p>
            <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: "0 0 6px" }}>
              <span style={{ fontWeight: 700 }}>How:</span>
            </p>
            <ul style={{ margin: "0 0 12px", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span>Their <a href="https://www.snapsheetclaims.com/products/snapsheet-ai" target="_blank" rel="noopener" style={{ color: GREEN }}>AI product page ↗</a> walks through exactly how the product works, step by step: choose a base AI model &rarr; write the instructions it follows &rarr; build the workflow in a drag-and-drop editor &rarr; set rules for what happens next &rarr; route edge cases to a human reviewer. That level of specificity is what AI models pull when asked to explain a product &mdash; vague capability claims get skipped.</span>
              </li>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span>Every major capability has its own dedicated page: <a href="https://www.snapsheetclaims.com/products/snapsheet-ai" target="_blank" rel="noopener" style={{ color: GREEN }}>/snapsheet-ai ↗</a>, <a href="https://www.snapsheetclaims.com/products/workflows" target="_blank" rel="noopener" style={{ color: GREEN }}>/workflows ↗</a>, <a href="https://www.snapsheetclaims.com/products/integration-apis" target="_blank" rel="noopener" style={{ color: GREEN }}>/integration-apis ↗</a>, <a href="https://www.snapsheetclaims.com/products/analytics-oversight" target="_blank" rel="noopener" style={{ color: GREEN }}>/analytics-oversight ↗</a>. When an AI model is asked specifically about claims workflow automation, there&rsquo;s one clean page to land on &mdash; not a buried paragraph inside a longer product overview.</span>
              </li>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span>Their <a href="http://snapsheetclaims.com/partnerships" target="_blank" rel="noopener" style={{ color: GREEN }}>partner directory ↗</a> names Foundation AI, CCC Intelligent Solutions, CLARA Analytics, AWS, CARFAX, and KeyBank &mdash; with a sentence on what each one does in the workflow. &ldquo;Integrates with leading platforms&rdquo; is invisible to AI models; named partners with described roles become citable facts.</span>
              </li>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span>Named a <a href="https://www.prnewswire.com/news-releases/snapsheet-named-a-luminary-in-celents-2026-north-america-pc-claims-systems-report-302819057.html" target="_blank" rel="noopener" style={{ color: GREEN }}>Celent Luminary (July 2026) ↗</a>. Celent is an independent research firm that evaluates insurance technology vendors &mdash; they are not paid by the vendors they rank. The Luminary designation is their top category: Snapsheet was one of 6 systems selected out of 66 evaluated. Because no vendor can buy or self-publish this recognition, AI models treat it as stronger evidence than a press release or customer review.</span>
              </li>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span><a href="https://www.prnewswire.com/news-releases/aspire-general-insurance-selects-snapsheet-as-the-claims-management-system-to-support-their-next-phase-of-growth-302616632.html" target="_blank" rel="noopener" style={{ color: GREEN }}>Aspire General Insurance selected Snapsheet (November 2025) ↗</a>, going live in 90 days with 12+ custom automations. This was distributed via PR Newswire &mdash; a press release wire service that syndicates to news sites &mdash; so it functions as customer evidence rather than independent journalism.</span>
              </li>
              <li style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 8 }} />
                <span>When Snapsheet integrated with Claimtouch (August 2026), two trade publications &mdash; <em>FFNews</em> and <em>Insurance Innovation Reporter</em> &mdash; wrote independent stories about it without being handed a press release to reprint. Independent editorial coverage carries more weight than a vendor announcement because a journalist chose to write it; AI models distinguish between the two.</span>
              </li>
            </ul>
            {(() => {
              const ss = weeklyTotals["Snapsheet"];
              return (
                <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: "0 0 12px", background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.4)", borderRadius: 6, padding: "8px 12px" }}>
                  <span style={{ fontWeight: 700 }}>Snapsheet data: </span>
                  {ss ? <>{ss.mentions.toLocaleString()} mentions{ss.avgPos != null ? `, avg position ${ss.avgPos.toFixed(1)}` : ""} across all clusters; sole designated Claims Advocacy brand in this cohort.</> : "Data loading."}
                </p>
              );
            })()}
            <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.03) 100%)", border: "1px solid rgba(37,99,235,0.18)", borderLeft: "4px solid #2563eb", borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
              <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#2563eb", margin: "0 0 6px" }}>Takeaway</p>
              <p style={{ fontSize: 16, color: "#000", lineHeight: 1.65, margin: 0 }}>The Celent Luminary designation is the highest-confidence signal in this report because it&rsquo;s the one thing Snapsheet could not have written itself &mdash; an independent research firm reviewed 66 systems and chose 6. Combine that with two journalists independently covering the Claimtouch integration, and Snapsheet has third-party corroboration at analyst level and editorial level simultaneously.</p>
            </div>
          </div>

          {/* ── Verdict ── */}
          <div style={{ marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <div style={{ padding: "12px 14px", background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.15)", borderRadius: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: GREEN, letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 5px" }}>Broker Buddha: specificity over volume</p>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: 0 }}>Built visibility through a small number of highly specific documentation choices &mdash; naming the exact 7 workflows in the beta announcement, giving each AMS integration its own page with data-direction labels, using mechanism language like &ldquo;ACORD forms auto pre-filled from AMS&rdquo; rather than generic benefit claims. AI models retrieve named, specific facts; they skip vague capability summaries. LLM visibility is a documentation quality problem, not a quantity problem.</p>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#2563eb", letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 5px" }}>Snapsheet: answer every question with its own page</p>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: 0 }}>Snapsheet&rsquo;s site is structured so that every question an AI model might ask has a specific page to land on. Their AI product page walks through the mechanism step by step &mdash; base model selection, prompt configuration, no-code workflow builder, branching logic, human escalation &mdash; giving AI models something concrete to retrieve rather than a generic capability claim. Each capability then gets its own URL: /snapsheet-ai, /workflows, /integration-apis, /analytics-oversight. And their partner directory names Foundation AI, CLARA Analytics, AWS, CARFAX, and others with a described role for each. Named, specific, structured: that&rsquo;s the pattern.</p>
            </div>
          </div>

          {/* ── Ralfi recommended moves ── */}
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 4 }}>Ralfi&rsquo;s recommended moves &mdash; ranked by LLM citation impact</p>
            <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>The research above shows two separate playbooks: one for what Ralfi publishes on its own site, and one for building third-party corroboration. Both are needed. Owned documentation is the primary retrieval surface &mdash; without it, even strong third-party mentions cite the wrong things. Earned corroboration is what raises confidence from &ldquo;mentioned&rdquo; to &ldquo;cited with conviction.&rdquo;</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  rank: "1",
                  track: "Owned",
                  trackColor: GREEN,
                  title: "Name exact integrations with mechanism detail &mdash; one page per system",
                  why: "Highest citation impact",
                  body: "Create a dedicated page for each AMS or system Ralfi connects to. Each page should name the system, describe data direction (what Ralfi reads vs writes), list the specific objects synced (renewal dates, insured details, policy premiums), and state sync frequency. Follow the Broker Buddha Applied Epic page as the structural model: it is the clearest example of how named integrations with direction labels become citable facts rather than generic claims.",
                  color: "#16a34a",
                },
                {
                  rank: "2",
                  track: "Owned",
                  trackColor: GREEN,
                  title: "One stable URL per capability &mdash; and keep the headline numbers consistent",
                  why: "High citation impact",
                  body: "Give each Ralfi capability its own crawlable page: /capabilities/renewal-tracking, /capabilities/compliance-logging, /capabilities/document-extraction. The page title, URL, first paragraph, and metadata should all contain the exact capability name. And critically: whatever headline number Ralfi uses (e.g. how many workflow steps are automated, how many integrations are live) must be consistent across every page, press release, and partner announcement. Broker Buddha&rsquo;s beta announcement said seven workflows; its HawkSoft press release said eight. When primary sources disagree on a headline number, LLMs hedge or omit it rather than commit &mdash; that inconsistency is a direct and invisible visibility cost.",
                  color: "#16a34a",
                },
                {
                  rank: "3",
                  track: "Owned",
                  trackColor: GREEN,
                  title: "Document the mechanism: input, what runs, output, where it goes, when a human steps in",
                  why: "High citation impact",
                  body: "For every capability, answer five questions in one passage: what enters (e.g. &ldquo;renewal date from AMS&rdquo;), what mechanism runs (e.g. &ldquo;Analyse step scans for missing payroll and turnover fields&rdquo;), what output is created (e.g. &ldquo;gap report&rdquo;), where it goes (e.g. &ldquo;emailed to the broker before terms are sent&rdquo;), and when a human steps in. Snapsheet&rsquo;s AI product page demonstrates this pattern: it names foundational model selection, prompt configuration, if/then logic, task routing, and human oversight as a connected chain &mdash; not just the end result.",
                  color: "#2563eb",
                },
                {
                  rank: "4",
                  track: "Earned",
                  trackColor: "#2563eb",
                  title: "Get listed on G2 and Capterra with capability-matched language",
                  why: "Medium citation impact",
                  body: "The Broker Buddha Capterra profile is effective because reviewer language mirrors product-page language. That cross-source alignment is the mechanism &mdash; not simply &ldquo;get reviews.&rdquo; Ensure that capability names, integration system names, and workflow terms in Ralfi&rsquo;s G2 and Capterra profile match the exact language on Ralfi&rsquo;s own pages. When an LLM encounters the same term in an owned source and a review source, it treats the claim as independently corroborated rather than self-reported.",
                  color: "#2563eb",
                },
                {
                  rank: "5",
                  track: "Earned",
                  trackColor: "#2563eb",
                  title: "Target InsurTech analyst recognition and independent trade press",
                  why: "High earned impact",
                  body: "Snapsheet&rsquo;s Celent Luminary recognition is the highest-confidence earned signal in this research because it cannot be self-published &mdash; an independent analyst firm evaluated 66 systems and selected Snapsheet as one of six. Ralfi should identify the InsurTech and insurance broker AI analyst publications that cover the renewal management and compliance automation space and pursue inclusion in their evaluations. Similarly, the Claimtouch integration gained earned value because FFNews and IIR covered it independently rather than reprinting a press release &mdash; independent trade press coverage of a partnership is qualitatively stronger than a vendor-distributed announcement.",
                  color: "#2563eb",
                },
                {
                  rank: "6",
                  track: "Earned",
                  trackColor: "#2563eb",
                  title: "Publish one named brokerage case study per capability &mdash; and seed community discussion",
                  why: "Supporting impact",
                  body: "Publish one case study per high-value capability naming the brokerage, the specific workflow Ralfi replaced, and a concrete result (e.g. &ldquo;renewals that previously required three broker touchpoints now complete without broker action&rdquo;). Both Broker Buddha and Snapsheet have aging or undated customer proof &mdash; Broker Buddha&rsquo;s verifiable case studies are from 2022; Snapsheet hides publication dates. Then seed the finding in broker communities where both brands have zero presence: r/Insurance, IIABA online communities, independent agency forums. This is unclaimed territory that costs almost nothing to enter.",
                  color: "#d97706",
                },
              ].map(({ rank, track, trackColor, title, why, body, color }, i, arr) => (
                <div key={rank} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color }}>{rank}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: trackColor, background: `${trackColor}12`, border: `1px solid ${trackColor}30`, borderRadius: 3, padding: "1px 5px", whiteSpace: "nowrap" as const }}>{track}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: 0 }} dangerouslySetInnerHTML={{ __html: title }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" as const }}>{why}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: 0 }} dangerouslySetInnerHTML={{ __html: body }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Product feature opportunities ── */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>Product Feature Opportunities</h3>
          <p style={{ fontSize: 15, color: "#000", margin: "6px 0 8px" }}>Three moves Ralfi is positioned to make — drawn from the feature scores above</p>
          <p style={{ fontSize: 13, color: "#1e3a5f", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.18)", borderRadius: 6, padding: "7px 12px", margin: 0, lineHeight: 1.55 }}>
            <strong>Analyst interpretation, not pipeline output.</strong> The feature scores and not_documented verdicts above were independently verified by the AI collection pipeline. The three opportunities below are analyst conclusions drawn from that data — each is grounded in the cohort&rsquo;s feature scores and mention volumes, but the interpretation (what Ralfi should do with them) is editorial judgment, not a separately verified finding.
          </p>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Opportunity 1 */}
          <div style={{ display: "flex", gap: 20, padding: "20px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: "rgba(5,150,105,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: GREEN }}>1</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 5, flexWrap: "wrap" as const }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>Missing-information detection before renewal terms are sent</p>
                <span style={{ fontSize: 13, fontWeight: 600, color: GREEN, background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: 4, padding: "1px 7px", whiteSpace: "nowrap" as const }}>Risk &amp; Submission</span>
              </div>
              <p style={{ fontSize: 15, color: "#000", margin: "0 0 8px", lineHeight: 1.6 }}>
                Indio scores 65 on exactly this pattern: its submission review flags completeness gaps before terms go to an insurer. Ralfi's &ldquo;Analyze&rdquo; step already ingests renewal data from Outlook and policy sources — extending it to surface missing payroll figures or turnover data before terms are sent out is the same mechanism Ralfi has already built, one step earlier in the pipeline.
              </p>
              <p style={{ fontSize: 13, color: "#000", margin: 0, fontStyle: "italic" }}>Benchmark: Indio 65 · nearest competitor. No other brand scores above low on this feature.</p>
            </div>
          </div>

          {/* Opportunity 2 */}
          <div style={{ display: "flex", gap: 20, padding: "20px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: "rgba(5,150,105,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: GREEN }}>2</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 5, flexWrap: "wrap" as const }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>Client self-service for routine policy questions</p>
                <span style={{ fontSize: 13, fontWeight: 600, color: GREEN, background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: 4, padding: "1px 7px", whiteSpace: "nowrap" as const }}>Client Communication</span>
              </div>
              <p style={{ fontSize: 15, color: "#000", margin: "0 0 8px", lineHeight: 1.6 }}>
                The single highest-scoring feature across the entire cohort — Chisel AI, InsuredMine, and Better Agency all score 80 on client self-service, the strongest three-way consensus of any feature scored. Ralfi already has client-facing infrastructure (the portal where clients fill in details, sign, and return forms). Extending that surface to answer routine questions — &ldquo;what&rsquo;s my excess,&rdquo; &ldquo;when does my policy renew&rdquo; — enters a category the market has clearly validated.
              </p>
              <p style={{ fontSize: 13, color: "#000", margin: 0, fontStyle: "italic" }}>Benchmark: Chisel AI · InsuredMine · Better Agency all score 80. Market consensus is strong.</p>
            </div>
          </div>

          {/* Opportunity 3 */}
          <div style={{ display: "flex", gap: 20, padding: "20px 0 4px" }}>
            <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: "rgba(5,150,105,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: GREEN }}>3</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 5, flexWrap: "wrap" as const }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>Own the Compliance &amp; Audit cluster</p>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#d97706", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 4, padding: "1px 7px", whiteSpace: "nowrap" as const }}>Highest-leverage · zero build time</span>
              </div>
              <p style={{ fontSize: 15, color: "#000", margin: "0 0 8px", lineHeight: 1.6 }}>
                This is different in kind from the first two: Ralfi doesn&rsquo;t need to build anything. The &ldquo;Record&rdquo; step — NIBA Code of Practice tracking, timestamped logging, exportable renewal history — already does this. The market signal: Compliance &amp; Audit is the thinnest cluster in the dataset (TrustLayer, the only brand with any visibility here, records 1–4 mentions across 14 days) and TrustLayer scores only 15 on pricing transparency, meaning it&rsquo;s not a strong incumbent. Low competitive density. Ralfi already has the capability. The capability is currently undocumented in LLM-facing content. This is the highest-leverage move available — the only cost is documentation time.
              </p>
              <p style={{ fontSize: 13, color: "#000", margin: 0, fontStyle: "italic" }}>Benchmark: TrustLayer is the only named competitor · 1–4 mentions/day · scores 15 on pricing. The cluster is unclaimed.</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Feature scores footnotes ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 4px" }}>
        <p style={{ fontSize: 11, color: "#000", margin: 0, textAlign: "center" }}>
          Based on 18 features across 10 locked brands · Insurance Broker AI Agent category · Claude Haiku and GPT-4o-mini
        </p>
        <p style={{ fontSize: 11, color: "#000", margin: "0 auto", textAlign: "center", maxWidth: 680 }}>
          Scores require agreement between both AI models. When models disagree, we take the more conservative rating, so a lower score sometimes means models disagree, not that documentation is absent.
        </p>
      </div>

      {/* ── Disclaimer footer ── */}
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#333", margin: 0 }}>Disclaimer &amp; Terms of Use</p>
        <p style={{ fontSize: 12, color: "#555", lineHeight: 1.65, margin: 0, maxWidth: 820 }}>
          This report was created by AgenticLib. All feature scores, rankings, and assessments are based on publicly available information at the time of research and represent AgenticLib&rsquo;s independent evaluation. Competitive intelligence data is derived from automated queries to Claude Haiku and GPT-4o-mini APIs. This data reflects model output at specific points in time and may not represent the current or future state of any brand&rsquo;s market position.
        </p>
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>&copy; 2026 AgenticLib. All rights reserved.</p>
      </div>

    </div>
  );
}
