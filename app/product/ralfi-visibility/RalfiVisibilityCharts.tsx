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
interface FeatureScoreRow { brand_name: string; feature_id: string; feature_tag: string; score: number; score_band: string; flagged_for_review: boolean; evidence: string | null }
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

const HIDDEN_FEATURE_IDS = new Set<string>([]);

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
            <p style={{ fontSize: 16, color: "#000" }}>Average position brands appear in AI responses (lower is stronger)</p>
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
                    <td style={{ padding: "11px 20px", color: "#000" }}>{row.mentions.toLocaleString()}</td>
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
                  const rows = featureScores.filter(r => r.feature_id === featureId).sort((a, b) => b.score - a.score).slice(0, 3);
                  return { featureId, rows };
                });
              return (
                <div key={group.label} style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: GREEN, marginBottom: 14 }}>{group.label}</p>
                  {groupFeatures.map(({ featureId, rows }) => (
                    <div key={featureId} style={{ marginBottom: 18 }}>
                      <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 4 }}>{featureName(featureId)}</p>
                      {FEATURE_DESCRIPTIONS[featureId] && (
                        <p style={{ fontSize: 15, color: GREEN, lineHeight: 1.6, margin: "0 0 10px" }}>{FEATURE_DESCRIPTIONS[featureId]}</p>
                      )}
                      {rows.length === 0 ? (
                        <p style={{ fontSize: 14, color: "#94a3b8", fontStyle: "italic", margin: 0 }}>Scoring in progress — no brand has documented this feature yet.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {rows.map(r => {
                            const ev = cleanEvidence(r.evidence) ?? BAND_FALLBACK[r.score_band];
                            return (
                              <div key={r.brand_name}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 16, fontWeight: 500, color: NAVY, width: 168, flexShrink: 0, lineHeight: 1.3 }}>{r.brand_name}</span>
                                  <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                                    <div style={{ width: `${r.score}%`, height: 6, borderRadius: 999, background: BAND_COLORS[r.score_band] ?? "#94a3b8" }} />
                                  </div>
                                  <span style={{ fontSize: 16, fontWeight: 700, color: BAND_COLORS[r.score_band] ?? NAVY, width: 28, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{r.score}</span>
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
        };
        const spotlight = Array.from(LOCKED_RALFI_BRANDS).map(brand => {
          const top = featureScores.filter(r => r.brand_name === brand).sort((a, b) => b.score - a.score)[0] ?? null;
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
                  const descShort = description ? (description.length > 200 ? description.slice(0, 197) + "…" : description) : null;
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
          <div style={{ marginBottom: 24, padding: "12px 16px", background: "rgba(5,150,105,0.04)", borderRadius: 8, border: "1px solid rgba(5,150,105,0.12)" }}>
            <p style={{ fontSize: 13, color: "#333", lineHeight: 1.65, margin: 0 }}>
              LLM visibility is built through two channels. The first is what a brand publishes on its own site: product pages, integration documentation, case studies, pricing. The second is what third parties independently write about the brand: review sites, press coverage, analyst reports. Both matter. A brand with strong self-documentation but no third-party corroboration is cited with less confidence. A brand with press coverage but thin product documentation gets cited for the wrong things. The research below covers both channels for each brand, with the sources that back each finding.
            </p>
          </div>

          {/* ── Broker Buddha ── */}
          <div style={{ marginBottom: 28, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: "rgba(5,150,105,0.05)", padding: "12px 18px", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>Broker Buddha</span>
              <div style={{ display: "flex", gap: 6 }}>
                {["Renewal Management","Document Processing","Risk & Submission"].map(c => (
                  <span key={c} style={{ fontSize: 11, fontWeight: 600, color: GREEN, background: "rgba(5,150,105,0.10)", borderRadius: 4, padding: "2px 7px" }}>{c}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* What they published */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: GREEN, letterSpacing: "0.09em", textTransform: "uppercase" as const, margin: "0 0 10px" }}>What they published on their own site</p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  Broker Buddha&rsquo;s LLM visibility was not built through high content volume. Research identified roughly 5&ndash;7 notable items across the past 18 months &mdash; a product launch, podcast appearances, and partner announcements &mdash; not a large editorial program. What made those items effective for LLM citation is how specific they were, not how many there were. The{" "}
                  <a href="https://www.brokerbuddha.com/simplicity/introducing-broker-buddha-ai-public-beta" target="_blank" rel="noopener" style={{ color: GREEN, fontSize: 12 }}>March 2026 public beta announcement ↗</a>{" "}
                  positioned the platform as a unified operating system combining seven named insurance workflows: insured-data intake, opportunity and placement management, market submissions, loss-run sourcing, policy servicing, policy administration, and eSign. That level of enumeration &mdash; seven specific workflows listed by name &mdash; gives LLMs something concrete to retrieve and quote when a buyer asks what Broker Buddha actually does.
                </p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  Integration documentation follows the same pattern of specificity. The{" "}
                  <a href="http://brokerbuddha.com/en/faqs" target="_blank" rel="noopener" style={{ color: GREEN, fontSize: 12 }}>FAQ ↗</a>{" "}
                  names <strong>AMS360, Applied Epic, HawkSoft, and Momentum Amp</strong> explicitly rather than saying &ldquo;integrates with your existing systems.&rdquo; A{" "}
                  <a href="http://brokerbuddha.com/integrations/applied-epic" target="_blank" rel="noopener" style={{ color: GREEN, fontSize: 12 }}>dedicated Applied Epic page ↗</a>{" "}
                  lists exactly which data objects sync, in which direction (live / periodic / not available), and what API scope is covered. Named systems with direction labels give LLMs precise anchor strings &mdash; far more citable than generic integration claims.
                </p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  Product page language describes mechanisms, not just outcomes. The{" "}
                  <a href="http://brokerbuddha.com/en/products" target="_blank" rel="noopener" style={{ color: GREEN, fontSize: 12 }}>products page ↗</a>{" "}
                  uses operational nouns throughout: &ldquo;captures insured information through guided smart forms and generates ACORD forms automatically, pre-filling data from your AMS&rdquo;; &ldquo;multi-carrier submissions wizard with status tracking, quote comparison, and market evaluation.&rdquo; When a model is asked whether Broker Buddha can handle a specific task, it can point to named mechanisms &mdash; not just a marketing promise.
                </p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 4px" }}>
                  Broker Buddha also directly names competitors on its{" "}
                  <a href="http://brokerbuddha.com/en/products" target="_blank" rel="noopener" style={{ color: GREEN, fontSize: 12 }}>products page ↗</a>{" "}
                  in &ldquo;Switch from&rdquo; migration copy: Indio, Wunderite, CSR24, InsurLink, AgencyZoom, InsuredMine, and HubSpot are all named. This is a deliberate visibility tactic &mdash; a buyer searching for &ldquo;Broker Buddha vs Indio&rdquo; or &ldquo;switch from AgencyZoom&rdquo; lands directly on migration-oriented product copy. It is not a deep comparison strategy (no feature matrices, no pricing tables), but it captures high-intent switching searches that Ralfi currently does not have a content answer for.
                </p>
              </div>

              {/* What third parties said */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#2563eb", letterSpacing: "0.09em", textTransform: "uppercase" as const, margin: "0 0 10px" }}>What third parties said about them</p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  The{" "}
                  <a href="https://www.prnewswire.com/news-releases/hawksoft-and-broker-buddha-announce-two-way-integration-partnership-302824900.html" target="_blank" rel="noopener" style={{ color: "#2563eb", fontSize: 12 }}>HawkSoft integration was announced via PR Newswire on July 14, 2026 ↗</a>{" "}
                  &mdash; a third-party wire, not just a Broker Buddha blog post &mdash; which anchors the AMS360/HawkSoft named integration in an independently indexed source. Loss Run Pro (July 21) and CoverForce (July 28) followed as formal partner announcements. This pattern of ecosystem announcements creates a cluster of indexed documents that all reference the same product name in the same month, which raises LLM citation confidence across sources.
                </p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  <a href="http://capterra.com/p/190786/Broker-Buddha" target="_blank" rel="noopener" style={{ color: "#2563eb", fontSize: 12 }}>Capterra reviews (4.6/5 from 13 reviews) ↗</a>{" "}
                  show a pattern that matters for LLM citation: reviewers independently use language like &ldquo;prefilled renewals&rdquo; and &ldquo;automated follow-ups&rdquo; &mdash; the same terms Broker Buddha uses on its own product pages. When an LLM encounters the same capability language on a vendor&rsquo;s own site and again in independent reviews, it treats the claim as corroborated rather than self-reported. That cross-source alignment is what raises citation confidence beyond what owned copy alone can achieve.
                </p>

                <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "10px 12px", marginBottom: 10 }}>
                  <p style={{ fontSize: 12, color: "#b91c1c", margin: "0 0 4px", fontWeight: 700 }}>Negative signal: NowCerts integration complaint</p>
                  <p style={{ fontSize: 12, color: "#7f1d1d", margin: 0, lineHeight: 1.6 }}>
                    A documented reviewer complaint about a failed NowCerts integration exists in the third-party record. This matters beyond the individual review: when an LLM encounters a specific connector complaint, it learns to qualify the vendor&rsquo;s integration claims as connector-specific rather than universal. The result is the difference between a model citing &ldquo;Broker Buddha integrates with AMS360 and Applied Epic&rdquo; (specific, high confidence) and &ldquo;Broker Buddha integrates with most AMS platforms&rdquo; (a claim the model will hedge). For Ralfi: name only integrations that are fully tested and documented, because a single negative review of one connector creates a lasting qualifier in training data.
                  </p>
                </div>

                <div style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 6, padding: "10px 12px" }}>
                  <p style={{ fontSize: 12, color: "#92400e", fontWeight: 700, margin: "0 0 4px" }}>Three gaps worth noting</p>
                  <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.65, margin: 0 }}>
                    <strong>Customer proof is aging.</strong> Broker Buddha&rsquo;s visible case studies number roughly seven pages, but the ones with verifiable dates are from November 2022 &mdash; including PWS &amp; Company and IBOAZ. The recent public footprint is partner-led and announcement-led, not new customer outcomes.{" "}
                    <strong>Headline inconsistency.</strong> The March 2026 beta announcement says seven workflows; the July 2026 HawkSoft press release says eight distinct workflows. When primary sources disagree on a core headline number, LLMs hedge or omit it rather than commit &mdash; that&rsquo;s a direct visibility cost. <strong>No Reddit or forum presence.</strong> A Reddit search for &ldquo;Broker Buddha&rdquo; returns gaming results (Blox Fruits) and unrelated posts &mdash; no insurance-software discussion, no company posts, no customer threads.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Snapsheet ── */}
          <div style={{ marginBottom: 24, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: "rgba(13,148,136,0.05)", padding: "12px 18px", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>Snapsheet</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#0D9488", background: "rgba(13,148,136,0.10)", borderRadius: 4, padding: "2px 7px" }}>Claims Advocacy</span>
            </div>

            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* What they published */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#0D9488", letterSpacing: "0.09em", textTransform: "uppercase" as const, margin: "0 0 10px" }}>What they published on their own site</p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  Snapsheet&rsquo;s public content index shows approximately 15 unique pieces (10 blog posts, 3 news items, 2 press items), with titles focused on thought leadership rather than product announcements: <em>&ldquo;Using AI and operationalizing AI are not the same. Know the difference.&rdquo;</em> <em>&ldquo;Redefining the Claims Process With Agentic AI-Powered Workflows.&rdquo;</em>{" "}
                  <a href="https://www.snapsheetclaims.com/resources/blog" target="_blank" rel="noopener" style={{ color: "#0D9488", fontSize: 12 }}>Blog ↗</a>{" "}
                  The content index does not show publication dates, which means the exact publishing cadence is not measurable from the outside &mdash; but the visible mix suggests a program built around claims operations and AI governance thinking, not just product announcements.
                </p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  The strongest owned-visibility asset is the{" "}
                  <a href="https://www.snapsheetclaims.com/products/snapsheet-ai" target="_blank" rel="noopener" style={{ color: "#0D9488", fontSize: 12 }}>AI product page ↗</a>,{" "}
                  which documents a complete mechanism chain rather than just claiming &ldquo;AI-powered.&rdquo; Users can select a foundational model, configure system and user prompts, deploy AI actions in a side panel or inside no-code workflows using real-time claim data, chain outputs into if/then logic, and route to humans when oversight is required. This is an operational description &mdash; it answers how the AI works, not just what it claims to do &mdash; which is what LLMs retrieve as evidence of a specific capability.
                </p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  Every major capability has its own stable URL:{" "}
                  <a href="https://www.snapsheetclaims.com/products/snapsheet-ai" target="_blank" rel="noopener" style={{ color: "#0D9488", fontSize: 12 }}>/products/snapsheet-ai ↗</a>,{" "}
                  <a href="https://www.snapsheetclaims.com/products/workflows" target="_blank" rel="noopener" style={{ color: "#0D9488", fontSize: 12 }}>/products/workflows ↗</a>,{" "}
                  <a href="https://www.snapsheetclaims.com/products/integration-apis" target="_blank" rel="noopener" style={{ color: "#0D9488", fontSize: 12 }}>/products/integration-apis ↗</a>,{" "}
                  <a href="https://www.snapsheetclaims.com/products/analytics-oversight" target="_blank" rel="noopener" style={{ color: "#0D9488", fontSize: 12 }}>/products/analytics-oversight ↗</a>. Each page is a clean retrieval target for a single capability question. When a model is asked whether Snapsheet handles analytics, there is a dedicated indexed page to find &mdash; not a paragraph buried inside a longer product overview.
                </p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 4px" }}>
                  Their{" "}
                  <a href="http://snapsheetclaims.com/partnerships" target="_blank" rel="noopener" style={{ color: "#0D9488", fontSize: 12 }}>partner directory ↗</a>{" "}
                  names Foundation AI, CCC Intelligent Solutions, CLARA Analytics, AWS, CARFAX, and KeyBank &mdash; each with a described integration function. Like Broker Buddha&rsquo;s named AMS integrations, named partner names give LLMs distinctive anchor strings. Notably, Snapsheet publishes no official &ldquo;Snapsheet vs. [rival]&rdquo; comparison pages. G2 names Guidewire, FileHandler, and others as Snapsheet alternatives, but G2 wrote those pages &mdash; Snapsheet did not. Their competitive posture is differentiation-led: let the platform breadth and customer outcomes speak, and let directories supply the explicit comparison framing.
                </p>
              </div>

              {/* What third parties said */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#2563eb", letterSpacing: "0.09em", textTransform: "uppercase" as const, margin: "0 0 10px" }}>What third parties said about them</p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  The highest-confidence earned signal is analyst recognition. On July 7, 2026, Celent named Snapsheet a{" "}
                  <a href="https://www.prnewswire.com/news-releases/snapsheet-named-a-luminary-in-celents-2026-north-america-pc-claims-systems-report-302819057.html" target="_blank" rel="noopener" style={{ color: "#2563eb", fontSize: 12 }}>Luminary in its 2026 North America P&amp;C Claims Systems Report ↗</a>{" "}
                  &mdash; Celent&rsquo;s highest distinction, awarded to 6 of 66 systems evaluated. This is not a press release; it is an independent analyst firm publishing its evaluation of the market and selecting Snapsheet as a top-tier product. When LLMs encounter analyst-tier recognition, they treat it as strong corroborating evidence of capability claims &mdash; a qualitatively different signal than a customer announcement or a product page.
                </p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  <a href="https://www.prnewswire.com/news-releases/aspire-general-insurance-selects-snapsheet-as-the-claims-management-system-to-support-their-next-phase-of-growth-302616632.html" target="_blank" rel="noopener" style={{ color: "#2563eb", fontSize: 12 }}>Aspire General Insurance (November 17, 2025) ↗</a>{" "}
                  reported 90-day implementation, more than a dozen custom workflow automations built without engineering resources, and tasks that previously took an hour completing in minutes. This is a vendor-distributed announcement rather than independent journalism &mdash; Snapsheet issued it via PR Newswire &mdash; which means it functions as customer evidence, not independent validation. The distinction matters: LLMs weight vendor-distributed press releases lower than independent editorial coverage.
                </p>

                <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: "0 0 10px" }}>
                  The Claimtouch integration (August 20&ndash;21, 2026) is a stronger earned signal precisely because it was covered by independent trade press, not just a Snapsheet announcement. FFNews and Insurance Innovation Reporter both reported on the partnership independently, describing AI, machine learning, and big-data validation including pricing and fraud flags flowing into Snapsheet workflows. When two trade publications cover the same integration without being handed a press release to reprint verbatim, LLMs encounter the claim from multiple independent perspectives &mdash; a qualitatively different corroboration than a single vendor-distributed announcement.
                </p>

                <div style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 6, padding: "10px 12px" }}>
                  <p style={{ fontSize: 12, color: "#92400e", fontWeight: 700, margin: "0 0 4px" }}>Three gaps worth noting</p>
                  <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.65, margin: 0 }}>
                    <strong>No public pricing.</strong> Snapsheet publishes no pricing page, which limits an LLM&rsquo;s ability to characterise cost tier when a buyer asks &ldquo;how much does Snapsheet cost&rdquo; or &ldquo;is Snapsheet enterprise-only?&rdquo;{" "}
                    <strong>Case study dates are hidden.</strong> The case study index (Aspire, Getaround, Mutual of Enumclaw, Clearcover) shows no publication dates, so LLMs cannot determine how recent the proof is.{" "}
                    <strong>No Reddit or forum presence.</strong> The only identifiable Reddit result for Snapsheet is a 4-year-old r/Geico post asking whether it is a good employer &mdash; an employment question, not a product discussion, with no official Snapsheet account visible. Like Broker Buddha, Snapsheet has no meaningful community footprint that an LLM could draw on for organic third-party discussion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Verdict ── */}
          <div style={{ marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div style={{ padding: "12px 14px", background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.15)", borderRadius: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: GREEN, letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 5px" }}>Broker Buddha: specificity over volume</p>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: 0 }}>Built visibility through 5&ndash;7 highly specific items &mdash; named integrations with data-direction labels, workflow enumeration, ACORD mechanism language &mdash; not through publishing volume. Proves that LLM visibility is a documentation quality problem, not a quantity problem.</p>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#2563eb", letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 5px" }}>Snapsheet: analyst recognition as the gold standard</p>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: 0 }}>Celent Luminary (6 of 66 systems) is the highest-confidence earned signal in this research &mdash; independent analyst evaluation outweighs customer PRs and review sites because it cannot be self-published. Combined with independent trade press (FFNews/IIR on Claimtouch), Snapsheet has corroboration at multiple tiers.</p>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(217,119,6,0.05)", border: "1px solid rgba(217,119,6,0.15)", borderRadius: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#d97706", letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 5px" }}>Both: community presence is unclaimed</p>
              <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: 0 }}>Neither brand has any meaningful broker community, Reddit, or independent forum footprint. A Reddit search for Broker Buddha returns gaming results; Snapsheet&rsquo;s only Reddit result is a 4-year-old career question. First-mover organic community presence in broker communities is genuinely unclaimed territory.</p>
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
          <p style={{ fontSize: 15, color: "#000", margin: "6px 0 0" }}>Three moves Ralfi is positioned to make — based on what this cohort's data reveals</p>
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

    </div>
  );
}
