"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const NAVY    = "#000000";
const PURPLE  = "#7C3AED";
const MAGENTA = "#C026D3";

const LINE_COLORS = [
  "#7C3AED", "#C026D3", "#2563EB", "#059669", "#DC2626",
  "#D97706", "#0891B2", "#EA580C", "#65A30D", "#BE185D",
  "#84CC16", "#0369A1", "#92400E", "#F43F5E", "#FB923C",
  "#818CF8", "#34D399", "#FCD34D", "#6EE7B7", "#A78BFA",
];

const BRAND_COLOR_MAP: Record<string, string> = {
  "Descript":     "#7C3AED",
  "Synthesia":    "#C026D3",
  "HeyGen":       "#2563EB",
  "Opus Clip":    "#059669",
  "D-ID":         "#DC2626",
  "DeepBrain":    "#D97706",
  "Renderforest": "#0891B2",
};

function getBrandColor(brand: string): string {
  return BRAND_COLOR_MAP[brand] ?? LINE_COLORS[0];
}

const LOCKED_SDAI_BRANDS = new Set([
  "Descript", "Synthesia", "HeyGen", "Opus Clip", "D-ID", "DeepBrain", "Renderforest",
]);

// Primary cluster per brand — for position-by-cluster grid
const BRAND_PRIMARY_CLUSTER: Record<string, string> = {
  "Descript":     "sdai-editor",
  "Synthesia":    "sdai-voice",
  "HeyGen":       "sdai-voice",
  "Opus Clip":    "sdai-captions",
  "D-ID":         "sdai-production",
  "DeepBrain":    "sdai-production",
  "Renderforest": "sdai-production",
};

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface DailyRow        { date: string; brand: string; model: string; cluster_tag: string; mention_count: number; avg_position: number | null }
interface WeeklyRow       { brand: string; model: string; mention_count: number; avg_position: number | null }
interface LLMVisRow       { model: string; visibility_pct: number; total_responses: number }
interface SOVRow          { cluster_tag: string; brand: string; total_appearances: number; sov_pct: number }
interface ClusterPosRow   { cluster_tag: string; brand: string; avg_position: number; appearances: number }
interface FeatureScoreRow { brand_name: string; feature_id: string; feature_tag: string; score: number | null; score_band: string; flagged_for_review: boolean; runs_agreeing?: number | null; runs_total?: number | null; evidence: string | null; has_capability: string | null }
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
  recording_no_install:          "Browser recording, no install",
  recording_upload_support:      "Upload or 10+ min recordings",
  production_auto_zoom:          "Auto zoom, pacing & trim",
  production_transitions:        "Transition slides between sections",
  voice_cloning:                 "AI voice cloning from samples",
  voice_talking_head:            "AI talking head / avatar video",
  captions_auto:                 "Auto-generated captions",
  captions_styling:              "Caption styling & branding",
  translation_languages:         "Multi-language translation",
  translation_narration_regen:   "Narration regeneration post-translation",
  branding_brand_kit:            "Brand kit (colours, logo, fonts)",
  branding_templates:            "Video templates & themes",
  agents_autonomous_record:      "Autonomous AI recording agent",
  agents_safety:                 "AI safety & compliance controls",
  distribution_embed:            "Embed & share player",
  distribution_analytics:        "View & engagement analytics",
  collab_team_workspace:         "Team workspace & permissions",
  collab_review:                 "Commenting & review workflow",
  editor_timeline:               "Timeline / multi-track editor",
  editor_text_effects:           "Animated text effects & callouts",
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  recording_no_install:          "Teams need to record walkthroughs without IT setup or browser extensions — instantly, in a tab.",
  recording_upload_support:      "Existing footage or long recordings (10+ min) can be brought in and processed without re-recording.",
  production_auto_zoom:          "The platform automatically adds zoom effects, adjusts pacing, and trims dead air without manual editing.",
  production_transitions:        "Clean transition slides or segues are inserted between sections, making the video feel intentionally structured.",
  voice_cloning:                 "A rep or narrator's voice can be cloned from samples, so any script reads in the same voice.",
  voice_talking_head:            "An AI presenter delivers the script as a talking-head video, removing the need for a human on camera.",
  captions_auto:                 "Captions are generated automatically from the audio track — no manual transcription.",
  captions_styling:              "Caption font, colour, position, and animation can be matched to the brand's own visual identity.",
  translation_languages:         "The video can be translated and dubbed into multiple languages from the same source.",
  translation_narration_regen:   "After translation, the AI voice is regenerated in the new language — lip sync and timing adjusted.",
  branding_brand_kit:            "Logos, brand colours, and fonts are stored in a kit and applied automatically to every video.",
  branding_templates:            "Pre-built video templates speed up creation and enforce a consistent look across the team.",
  agents_autonomous_record:      "An AI agent can record and produce a video autonomously from a brief — no human recording session required.",
  agents_safety:                 "Controls exist to prevent harmful, misleading, or non-compliant AI-generated video output.",
  distribution_embed:            "Videos can be embedded on external pages or shared via a hosted player link.",
  distribution_analytics:        "View counts, watch time, and engagement metrics are tracked per video.",
  collab_team_workspace:         "Multiple team members can work in a shared workspace with role-based access.",
  collab_review:                 "Reviewers can leave timestamped comments on a video before it's published.",
  editor_timeline:               "A full timeline editor allows multi-track, frame-level control over the video.",
  editor_text_effects:           "Animated text callouts, lower thirds, or kinetic titles can be added to highlight key moments.",
};

const FEATURE_GROUPS = [
  { label: "Screen Recording",   features: ["recording_no_install", "recording_upload_support"] },
  { label: "AI Production",      features: ["production_auto_zoom", "production_transitions"] },
  { label: "Voice & Avatar",     features: ["voice_cloning", "voice_talking_head"] },
  { label: "Captions",           features: ["captions_auto", "captions_styling"] },
  { label: "Translation",        features: ["translation_languages", "translation_narration_regen"] },
  { label: "Branding",           features: ["branding_brand_kit", "branding_templates"] },
  { label: "AI Agents",          features: ["agents_autonomous_record", "agents_safety"] },
  { label: "Distribution",       features: ["distribution_embed", "distribution_analytics"] },
  { label: "Collaboration",      features: ["collab_team_workspace", "collab_review"] },
  { label: "Editor",             features: ["editor_timeline", "editor_text_effects"] },
];

const BAND_COLORS: Record<string, string> = {
  high:    "#16a34a",
  medium:  "#7C3AED",
  low:     "#d97706",
  strong:  "#16a34a",
  present: "#7C3AED",
  partial: "#d97706",
  weak:    "#dc2626",
};

const BAND_FALLBACK: Record<string, string> = {
  high:    "Strong capability confirmed. The platform demonstrates this feature comprehensively.",
  medium:  "Capability confirmed and present in the core product offering.",
  low:     "Partial capability detected. Some support exists but depth or documentation may be limited.",
  strong:  "Strong capability confirmed. The platform demonstrates this feature comprehensively.",
  present: "Capability confirmed and present in the core product offering.",
  partial: "Partial capability detected. Some support exists but depth or documentation may be limited.",
  weak:    "Limited capability based on available assessment information.",
};

function bandScore(band: string): number {
  return { high: 90, strong: 90, medium: 70, present: 70, low: 35, partial: 35, weak: 10 }[band] ?? 50;
}

function featureName(id: string): string {
  return FEATURE_NAMES[id] ?? id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function cleanEvidence(raw: string | null): string | null {
  if (!raw) return null;
  const stripped = raw.replace(/<cite[^>]*>/g, "").replace(/<\/cite>/g, "").trim();
  if (!stripped) return null;
  const lower = stripped.toLowerCase();
  if (
    lower.includes("not explicitly document") ||
    lower.includes("does not document") ||
    lower.includes("no specific documentation") ||
    lower.includes("without clear documentation") ||
    lower.includes("documentation not available") ||
    lower.includes("not documented") ||
    lower.includes("cannot be confirmed from") ||
    lower.includes("no available information") ||
    lower.includes("does not provide documentation")
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

// ── Cluster config ─────────────────────────────────────────────────────────────
const SOV_CLUSTERS = [
  { tag: "sdai-recording",    label: "Screen Recording",  description: "Which brands LLMs surface when asked about capturing app flows in the browser — no install, no extension, just record and go." },
  { tag: "sdai-production",   label: "AI Production",     description: "Which brands LLMs surface when asked about automatic zoom generation, pacing, dead-air trimming, and transition slides between sections." },
  { tag: "sdai-editor",       label: "Video Editor",      description: "Which brands LLMs surface when asked about timeline editing, text effects, and fine-grained manual control over the final cut." },
  { tag: "sdai-voice",        label: "Voice & Avatar",    description: "Which brands LLMs surface when asked about AI voice cloning, talking-head avatars, and narration generation without recording again." },
  { tag: "sdai-captions",     label: "Captions",          description: "Which brands LLMs surface when asked about auto-generated captions, caption styling, and on-brand subtitle presentation." },
  { tag: "sdai-translation",  label: "Translation",       description: "Which brands LLMs surface when asked about multi-language dubbing and narration regeneration — one recording, every market." },
  { tag: "sdai-distribution", label: "Distribution",      description: "Which brands LLMs surface when asked about embedding finished videos, sharing via a hosted player, and tracking viewer engagement." },
  { tag: "sdai-branding",     label: "Branding",          description: "Which brands LLMs surface when asked about brand kits, custom backgrounds, logo watermarking, and reusable video templates." },
  { tag: "sdai-collab",       label: "Collaboration",     description: "Which brands LLMs surface when asked about team workspaces, role-based access, and timestamped review and approval workflows." },
  { tag: "sdai-agents",       label: "AI Agents",         description: "Which brands LLMs surface when asked about autonomous AI that records app flows without a human at the keyboard." },
];

const SENTIMENT_CLUSTERS = [
  { tag: "overall",          label: "Overall" },
  { tag: "overall-criticism", label: "Criticism & Limitations" },
];

// ── Custom tooltip ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CombinedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload]
    .filter((item: any) => item.value != null)
    .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0));
  return (
    <div style={{
      background: "#fff", border: "1px solid rgba(0,0,0,0.10)", borderRadius: 8,
      fontSize: 15, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      padding: "8px 12px", zIndex: 100,
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: NAVY }}>{fmtDate(String(label))}</p>
      {sorted.map((item: any) => (
        <div key={item.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0, display: "inline-block" }} />
          <span style={{ color: item.value > 0 ? item.color : "#aaa" }}>
            {String(item.dataKey)}: {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Shared card shell ─────────────────────────────────────────────────────────
function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
      padding: "20px 24px",
      borderTop: accent ? `3px solid ${accent}` : undefined,
    }}>
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000", marginBottom: 8 }}>
      {children}
    </p>
  );
}

function BigNumber({ value, sub }: { value: string; sub: string }) {
  return (
    <>
      <p style={{ fontSize: 36, fontWeight: 800, color: NAVY, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      <p style={{ fontSize: 15, color: "#000" }}>{sub}</p>
    </>
  );
}

// ── In-slice pie label ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const angle = percent >= 0.999 ? 90 : midAngle;
  const x = cx + radius * Math.cos(-angle * RADIAN);
  const y = cy + radius * Math.sin(-angle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 700, pointerEvents: "none" }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

// ── SOV donut card ────────────────────────────────────────────────────────────
function SOVCard({ cluster, rows }: { cluster: typeof SOV_CLUSTERS[number]; rows: SOVRow[] }) {
  const locked = rows.filter(r => LOCKED_SDAI_BRANDS.has(r.brand));
  const totalAppearances = locked.reduce((s, r) => s + r.total_appearances, 0);
  const mapped = locked.map(r => ({
    ...r,
    sov_pct: totalAppearances > 0 ? Math.round((r.total_appearances / totalAppearances) * 1000) / 10 : 0,
  })).sort((a, b) => b.sov_pct - a.sov_pct);

  if (mapped.length === 0) return null;

  const colorMap: Record<string, string> = Object.fromEntries(mapped.map(r => [r.brand, getBrandColor(r.brand)]));

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
      padding: "20px 24px",
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 4, letterSpacing: "-0.01em" }}>
        {cluster.label}
      </h3>
      <p style={{ fontSize: 15, color: "#000", marginBottom: 16 }}>Share of voice · last 7 days</p>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ flexShrink: 0 }}>
          <PieChart width={150} height={150} style={{ overflow: "visible" }}>
            <Pie
              data={mapped}
              dataKey="total_appearances"
              cx={70} cy={70}
              innerRadius={38} outerRadius={65}
              paddingAngle={2}
              labelLine={false}
              label={(props) => <PieSliceLabel {...props} />}
            >
              {mapped.map(r => <Cell key={r.brand} fill={colorMap[r.brand]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 15, border: "1px solid rgba(0,0,0,0.1)" }}
              formatter={(_v, _n, p) => [`${(p.payload as SOVRow & { sov_pct: number }).sov_pct}%`, (p.payload as SOVRow).brand]}
            />
          </PieChart>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {mapped.map(r => (
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

// ── Main component ─────────────────────────────────────────────────────────────
export default function SdaiVisibilityCharts({
  dailySummary, weeklySummary, llmVisibility, sovData,
  clusterPositions, featureScores, sentimentData,
}: Props) {
  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());

  function toggleBrand(b: string) {
    setHiddenBrands(prev => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b); else next.add(b);
      return next;
    });
  }

  const hasReal = dailySummary.length > 0;

  // ── Build chart indexes ───────────────────────────────────────────────────────
  const dateSet = new Set<string>();
  // overall index: date → brand → total mentions (all clusters combined)
  const index: Record<string, Record<string, number>> = {};
  // per-cluster index: cluster_tag → date → brand → mentions
  const clusterIndex: Record<string, Record<string, Record<string, number>>> = {};

  for (const row of dailySummary) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    dateSet.add(row.date);
    // overall
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
    // per-cluster
    const ct = row.cluster_tag;
    if (!clusterIndex[ct]) clusterIndex[ct] = {};
    if (!clusterIndex[ct][row.date]) clusterIndex[ct][row.date] = {};
    clusterIndex[ct][row.date][row.brand] = (clusterIndex[ct][row.date][row.brand] ?? 0) + row.mention_count;
  }

  // Weekly totals
  const weeklyTotals: Record<string, { mentions: number; avgPos: number | null }> = {};
  for (const row of weeklySummary) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    const e = weeklyTotals[row.brand] ?? { mentions: 0, avgPos: null };
    weeklyTotals[row.brand] = { mentions: e.mentions + row.mention_count, avgPos: row.avg_position ?? e.avgPos };
  }

  const dates  = [...dateSet].sort();
  const brands = [...LOCKED_SDAI_BRANDS]
    .sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0));

  const brandColor = (b: string) => getBrandColor(b);

  // ── Combined chart rows ───────────────────────────────────────────────────────
  const chartRows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const b of brands) row[b] = index[date]?.[b] ?? 0;
    return row;
  });

  // ── Per-cluster chart rows (using cluster_tag-specific data) ─────────────────
  const clusterCharts = SOV_CLUSTERS.map(cluster => {
    const ci = clusterIndex[cluster.tag] ?? {};
    const rows = dates.map(date => {
      const row: Record<string, number | string> = { date };
      for (const b of brands) row[b] = ci[date]?.[b] ?? 0;
      return row;
    });
    // Only show clusters that have any data
    const hasData = rows.some(r => brands.some(b => (r[b] as number) > 0));
    return { ...cluster, clusterBrands: brands, rows, hasData };
  });

  // ── Aggregate weekly metrics ──────────────────────────────────────────────────
  const totalMentions = Object.values(weeklyTotals).reduce((s, v) => s + v.mentions, 0);
  const hasWeekly = Object.keys(weeklyTotals).length > 0;

  const topByMentions = brands.reduce<string | null>((best, b) =>
    !best || (weeklyTotals[b]?.mentions ?? 0) > (weeklyTotals[best]?.mentions ?? 0) ? b : best
  , null);
  const topMentionData = topByMentions ? weeklyTotals[topByMentions] : null;

  const hasVis = llmVisibility.length > 0;

  // ── Model mentions breakdown ──────────────────────────────────────────────────
  const modelMentionsByBrand: Record<string, { claude: number; gpt: number }> = {};
  for (const row of dailySummary) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    if (!modelMentionsByBrand[row.brand]) modelMentionsByBrand[row.brand] = { claude: 0, gpt: 0 };
    if (row.model === "claude-haiku-4-5") modelMentionsByBrand[row.brand].claude += row.mention_count;
    else modelMentionsByBrand[row.brand].gpt += row.mention_count;
  }
  const modelMentionsData = brands
    .map(b => ({ brand: b, claude: modelMentionsByBrand[b]?.claude ?? 0, gpt: modelMentionsByBrand[b]?.gpt ?? 0 }))
    .filter(d => d.claude + d.gpt > 0)
    .sort((a, b) => (b.claude + b.gpt) - (a.claude + a.gpt));

  // ── Position table ────────────────────────────────────────────────────────────
  const posTable = Object.entries(weeklyTotals)
    .filter(([brand, v]) => LOCKED_SDAI_BRANDS.has(brand) && v.avgPos != null)
    .sort((a, b) => (a[1].avgPos ?? 99) - (b[1].avgPos ?? 99))
    .map(([brand, v], i) => ({ rank: i + 1, brand, avgPos: v.avgPos as number, mentions: v.mentions }));

  // ── Position by primary cluster ───────────────────────────────────────────────
  const clusterPosLookup: Record<string, Record<string, number>> = {};
  for (const row of clusterPositions) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    if (!clusterPosLookup[row.cluster_tag]) clusterPosLookup[row.cluster_tag] = {};
    clusterPosLookup[row.cluster_tag][row.brand] = row.avg_position;
  }

  const clusterGroups = SOV_CLUSTERS.map(cluster => {
    const brandsInCluster = Object.entries(BRAND_PRIMARY_CLUSTER)
      .filter(([, tag]) => tag === cluster.tag)
      .map(([brand]) => brand)
      .filter(brand => LOCKED_SDAI_BRANDS.has(brand))
      .map(brand => ({
        brand,
        avg_position: clusterPosLookup[cluster.tag]?.[brand] ?? null,
      }))
      .sort((a, b) => (a.avg_position ?? 999) - (b.avg_position ?? 999));
    return { ...cluster, brands: brandsInCluster };
  }).filter(c => c.brands.length > 0);

  const hasClusterPos = clusterPositions.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 1: Metric cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

        <Card accent={PURPLE}>
          <CardLabel>Brand Mentions · 7 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "—"}
            sub={hasWeekly ? `across ${brands.length} brands · 2 models` : "No data yet"}
          />
        </Card>

        <Card accent={MAGENTA}>
          <CardLabel>LLM Visibility · 7 Days</CardLabel>
          {!hasVis ? (
            <p style={{ fontSize: 17, color: "#000" }}>No data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {llmVisibility.map((v, i) => {
                const label = v.model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? PURPLE : MAGENTA;
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
          <CardLabel>Top Brand · 7 Days</CardLabel>
          {topByMentions && topMentionData ? (
            <>
              <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 4 }}>
                {topByMentions}
              </p>
              <p style={{ fontSize: 15, color: "#000" }}>
                {topMentionData.mentions.toLocaleString()} mentions
                {topMentionData.avgPos != null ? ` · avg position ${topMentionData.avgPos.toFixed(1)}` : ""}
              </p>
            </>
          ) : (
            <p style={{ fontSize: 17, color: "#000" }}>No data yet</p>
          )}
        </Card>

      </div>

      {/* ── Row 2: Combined 7-day trend ─────────────────────────────────────── */}
      {hasReal && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px 16px" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>Brand Mentions: 7-Day Trend</h3>
          <p style={{ fontSize: 15, color: "#000", marginBottom: 14 }}>All brands · both models combined</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CombinedTooltip />} wrapperStyle={{ zIndex: 100 }} allowEscapeViewBox={{ x: false, y: true }} />
              {brands.map(b => (
                <Line key={b} type="monotone" dataKey={b} stroke={brandColor(b)}
                  strokeWidth={hiddenBrands.has(b) ? 0 : 2}
                  dot={false}
                  activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", flex: 1 }}>
              {brands.map(b => (
                <label key={b} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer",
                  opacity: hiddenBrands.has(b) ? 0.45 : 1,
                }}>
                  <input
                    type="checkbox"
                    checked={!hiddenBrands.has(b)}
                    onChange={() => toggleBrand(b)}
                    style={{ accentColor: brandColor(b), width: 13, height: 13, cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: hiddenBrands.has(b) ? "#999" : NAVY }}>{b}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
              <button onClick={() => setHiddenBrands(new Set())} style={{
                fontSize: 12, fontWeight: 600, color: PURPLE,
                background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 6, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" as const,
              }}>Select All</button>
              <button onClick={() => setHiddenBrands(new Set(brands))} style={{
                fontSize: 12, fontWeight: 600, color: "#555",
                background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 6, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" as const,
              }}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: 7-day trends by cluster ──────────────────────────────────── */}
      {hasReal && (
        <>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>
            Brand Mentions: 7-Day Trend by Cluster
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {clusterCharts.filter(c => c.hasData).map(({ tag, label, description: clusterDesc, clusterBrands, rows }) => (
              <div key={tag} style={{
                background: "#fff", borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
                padding: "20px 24px 16px",
              }}>
                <h4 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>{label}</h4>
                {clusterDesc && (
                  <p style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", marginBottom: 4, lineHeight: 1.55 }}>{clusterDesc}</p>
                )}
                <p style={{ fontSize: 15, color: "#000", marginBottom: 14 }}>7-day mentions · both models</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} dy={6} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip content={<CombinedTooltip />} wrapperStyle={{ zIndex: 100 }} allowEscapeViewBox={{ x: false, y: true }} />
                    {clusterBrands.map(b => (
                      <Line key={b} type="monotone" dataKey={b} stroke={brandColor(b)}
                        strokeWidth={hiddenBrands.has(b) ? 0 : 2}
                        dot={false}
                        activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  {clusterBrands.map(b => (
                    <label key={b} style={{
                      display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer",
                      opacity: hiddenBrands.has(b) ? 0.45 : 1,
                    }}>
                      <input
                        type="checkbox"
                        checked={!hiddenBrands.has(b)}
                        onChange={() => toggleBrand(b)}
                        style={{ accentColor: brandColor(b), width: 13, height: 13, cursor: "pointer", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 13, color: hiddenBrands.has(b) ? "#999" : NAVY }}>{b}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Row 4: Brand mentions by model ──────────────────────────────────── */}
      {hasReal && modelMentionsData.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 20px" }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
              Brand Mentions · 7 Days · by Model
            </h3>
            <p style={{ fontSize: 16, color: "#000" }}>Total mentions per brand across Claude Haiku and GPT-4o mini</p>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            {[{ label: "Claude Haiku", color: PURPLE }, { label: "GPT-4o mini", color: MAGENTA }].map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={modelMentionsData.length * 28 + 10}>
            <BarChart layout="vertical" data={modelMentionsData} margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barSize={14}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="brand" width={110} tick={{ fontSize: 15, fill: NAVY }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.10)", fontSize: 16, color: NAVY }} formatter={(value, name) => [value, name === "claude" ? "Claude Haiku" : "GPT-4o mini"]} />
              <Bar dataKey="claude" stackId="a" fill={PURPLE}  radius={[0, 0, 0, 0]} />
              <Bar dataKey="gpt"    stackId="a" fill={MAGENTA} radius={[3, 3, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Row 5: Brand position table ─────────────────────────────────────── */}
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
                  {["Rank", "Brand", "Avg Position", "7-Day Mentions"].map(h => (
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
                      <span style={{
                        display: "inline-block", padding: "2px 8px", borderRadius: 4,
                        fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                        background: row.avgPos <= 3 ? "rgba(124,58,237,0.10)" : "rgba(0,0,0,0.05)",
                        color: row.avgPos <= 3 ? PURPLE : "#000",
                      }}>
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

      {/* ── Row 6: Avg position by primary cluster ─────────────────────────── */}
      {hasClusterPos && clusterGroups.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>
              Avg Brand Position by Cluster
            </h3>
            <p style={{ fontSize: 16, color: "#000" }}>
              Each brand shown in its primary cluster, avg position within that cluster&apos;s prompts · lower is better
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            {clusterGroups.map((cluster, ci) => (
              <div key={cluster.tag} style={{
                padding: "16px 20px",
                borderRight: (ci + 1) % 3 !== 0 ? "1px solid rgba(0,0,0,0.06)" : undefined,
                borderBottom: ci < clusterGroups.length - 3 ? "1px solid rgba(0,0,0,0.06)" : undefined,
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#000", marginBottom: 12 }}>
                  {cluster.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cluster.brands.map(({ brand, avg_position }) => (
                    <div key={brand} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(brand), flexShrink: 0, display: "inline-block" }} />
                      <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: NAVY }}>{brand}</span>
                      {avg_position != null ? (
                        <span style={{
                          padding: "2px 7px", borderRadius: 4, fontSize: 15, fontWeight: 700,
                          fontVariantNumeric: "tabular-nums",
                          background: avg_position <= 3 ? "rgba(124,58,237,0.10)" : "rgba(0,0,0,0.05)",
                          color: avg_position <= 3 ? PURPLE : "#000",
                        }}>
                          {avg_position.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 15, color: "#000" }}>—</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 7: SOV donuts ───────────────────────────────────────────────── */}
      {sovData.length > 0 && (
        <>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>
            Use Case Share of Voice
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {SOV_CLUSTERS.map(cluster => {
              const rows = sovData.filter(r => r.cluster_tag === cluster.tag);
              return rows.length > 0 ? <SOVCard key={cluster.tag} cluster={cluster} rows={rows} /> : null;
            })}
          </div>
        </>
      )}

      {/* ── Row 8: Feature scores ───────────────────────────────────────────── */}
      {featureScores.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
              Product Feature Scores
            </h3>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: 15, color: "#000", marginBottom: 24 }}>
              Both models · scored across 20 features · updates daily
            </p>
            {FEATURE_GROUPS.map(group => {
              const groupFeatures = group.features.flatMap(featureId => {
                const rows = featureScores
                  .filter(r => r.feature_id === featureId && LOCKED_SDAI_BRANDS.has(r.brand_name))
                  .sort((a, b) => {
                    const sa = Math.round((a.score ?? bandScore(a.score_band)) / 10) * 10;
                    const sb = Math.round((b.score ?? bandScore(b.score_band)) / 10) * 10;
                    return sb - sa;
                  })
                  .slice(0, 3);
                return rows.length >= 1 ? [{ featureId, rows }] : [];
              });
              if (groupFeatures.length === 0) return null;
              return (
                <div key={group.label} style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: PURPLE, marginBottom: 14 }}>
                    {group.label}
                  </p>
                  {groupFeatures.map(({ featureId, rows }) => (
                    <div key={featureId} style={{ marginBottom: 18 }}>
                      <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 2 }}>
                        {featureName(featureId)}
                      </p>
                      {FEATURE_DESCRIPTIONS[featureId] && (
                        <p style={{ fontSize: 16, color: PURPLE, lineHeight: 1.5, margin: "0 0 10px" }}>
                          {FEATURE_DESCRIPTIONS[featureId]}
                        </p>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {rows.map(r => {
                          const score = Math.round((r.score ?? bandScore(r.score_band)) / 10) * 10;
                          const ev = cleanEvidence(r.evidence);
                          const text = ev ?? BAND_FALLBACK[r.score_band];
                          return (
                            <div key={r.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 16, fontWeight: 500, color: NAVY, width: 130, flexShrink: 0, lineHeight: 1.3 }}>
                                  {r.brand_name}
                                </span>
                                <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                                  <div style={{ width: `${score}%`, height: 6, borderRadius: 999, background: BAND_COLORS[r.score_band] ?? "#94a3b8" }} />
                                </div>
                                <span style={{ fontSize: 16, fontWeight: 700, color: BAND_COLORS[r.score_band] ?? NAVY, width: 28, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                                  {score}
                                </span>
                              </div>
                              {text && (
                                <p style={{ paddingLeft: 140, fontSize: 17, color: "#000", lineHeight: 1.5, margin: "4px 0 0", fontStyle: ev ? "normal" : "italic" }}>{text}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            <p style={{ fontSize: 15, color: "#000", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 4 }}>
              Top 3 brands per feature · scored by both Claude Haiku and GPT-4o mini
            </p>
          </div>
        </div>
      )}

      {/* ── Row 8b: Pricing · Security · Integrations (research-sourced) ──── */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
            Buyer-Readiness Scores
          </h3>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: 15, color: "#000", marginBottom: 24 }}>
            Research-sourced · pricing, security, integrations · all 7 brands
          </p>
          {[
            {
              groupLabel: "Buyer Readiness",
              features: [
                {
                  id: "pricing",
                  name: "Pricing Transparency",
                  desc: "How clearly pricing tiers and costs are disclosed publicly.",
                  brands: [
                    { brand: "Descript",     score: 90, band: "high",   evidence: "All three paid tiers (Free, Creator at $12/mo, Pro at $24/mo) are clearly listed with feature breakdowns on the public pricing page. A buyer can self-qualify and purchase without speaking to sales." },
                    { brand: "Synthesia",    score: 90, band: "high",   evidence: "Pricing is fully self-serve with named tiers (Basic free, Starter at $29/mo) listed publicly alongside feature comparisons. Enterprise pricing requires contact, but the entry path is clear and accessible." },
                    { brand: "HeyGen",       score: 90, band: "high",   evidence: "Four tiers are publicly priced — Free, Creator ($29/mo), Pro ($49/mo+), and Business ($149/mo+) — with feature comparisons visible without sign-in, making it easy for buyers to evaluate independently." },
                    { brand: "D-ID",         score: 80, band: "high",   evidence: "Studio and API plans are listed separately on public pricing pages (Lite from $9/mo, Advanced from $299/mo). The gap between tiers is large and some enterprise options require a conversation, but the baseline is transparent." },
                    { brand: "DeepBrain",    score: 80, band: "high",   evidence: "Starter ($30/mo) and Pro ($225/mo) plans are clearly listed on aistudios.com/pricing with feature comparisons. Enterprise custom pricing is not disclosed publicly but standard plans require no sales conversation." },
                    { brand: "Renderforest", score: 80, band: "high",   evidence: "A free tier and paid plans from $9.99/mo are listed on the /subscription page with clear feature breakdowns. No contact-sales wall exists for standard plans, which lowers friction for self-serve buyers." },
                    { brand: "Opus Clip",    score: 70, band: "medium", evidence: "A free tier and Pro plan are documented, but the exact monthly price for Pro is not consistently surfaced without creating an account. Business pricing is contact-only, which adds friction for teams evaluating at scale." },
                  ],
                },
                {
                  id: "security",
                  name: "Enterprise Security",
                  desc: "Breadth of certifications (SOC 2, ISO), trust centre, and enterprise IAM features.",
                  brands: [
                    { brand: "Synthesia",    score: 100, band: "high",   evidence: "The strongest security posture in the competitive set. Synthesia holds SOC 2 Type II, ISO 27001:2022, and ISO 42001 (AI management system), with a dedicated public Trust Centre at security.synthesia.io covering SSO, data residency, and audit controls." },
                    { brand: "Descript",     score:  90, band: "high",   evidence: "SOC 2 Type II certified with GDPR and CCPA compliance documented on a public /security page. AES-256 encryption at rest is confirmed. A strong posture for a creative tool, though no dedicated trust centre exists." },
                    { brand: "HeyGen",       score:  90, band: "high",   evidence: "Enterprise-grade security with SOC 2 Type II, GDPR, and EU AI Act compliance. Supports SAML SSO, SCIM provisioning, RBAC, and audit logs — and employs a dedicated Data Protection Officer, which is uncommon at this price point." },
                    { brand: "D-ID",         score:  70, band: "medium", evidence: "SOC 2 certification is referenced in company communications rather than a dedicated security page, and GDPR compliance is implied through EU data handling practices. The absence of a public trust centre limits what buyers can verify independently." },
                    { brand: "Opus Clip",    score:  50, band: "low",    evidence: "A trust portal exists at trust.opus.pro with documented security policies, but SOC 2 certification has not been publicly confirmed. Suitable for teams with moderate security requirements, but unlikely to clear enterprise procurement without additional assurances." },
                    { brand: "Renderforest", score:  40, band: "low",    evidence: "Covers GDPR as required for EU users, but holds no SOC 2, ISO 27001, or equivalent enterprise certifications. Security posture reflects a consumer and small-business product rather than an enterprise procurement target." },
                    { brand: "DeepBrain",    score:  30, band: "weak",   evidence: "No verifiable public security certifications, trust centre, or structured compliance documentation was found at time of research. Not positioned to pass a standard enterprise security review in its current state." },
                  ],
                },
                {
                  id: "integrations",
                  name: "Technical Integrations",
                  desc: "API availability, named third-party connectors, and ecosystem depth.",
                  brands: [
                    { brand: "Descript",     score: 90, band: "high",   evidence: "API access is in open beta and well-documented, with a dedicated /integrations page covering Google Drive, Slack, Adobe Premiere, Final Cut Pro, Dropbox, and Zapier. A Claude MCP connector extends Descript into AI agent workflows — the deepest ecosystem of any brand in this set." },
                    { brand: "Synthesia",    score: 90, band: "high",   evidence: "A mature, documented REST API at docs.synthesia.io supports production workloads. Named connectors span PowerPoint, 360Learning, HubSpot, Shopify, WordPress, and major LMS platforms — covering both the L&D buyer and the marketing automation buyer." },
                    { brand: "HeyGen",       score: 80, band: "high",   evidence: "Zapier integration (available on Pro+ plans) connects to over 9,000 apps without custom development. A native REST API and a dedicated Video Agent API are also available, with separate API pricing documented — a solid ecosystem for teams building automated video workflows." },
                    { brand: "Opus Clip",    score: 80, band: "high",   evidence: "API access is available to Business plan holders. Native Zapier and Make.com integrations handle workflow automation, while Adobe Premiere and DaVinci Resolve exports serve professional editors. Social auto-posting to major platforms is built in, reducing manual distribution steps." },
                    { brand: "D-ID",         score: 80, band: "high",   evidence: "D-ID is built API-first — the Creative Reality Studio API is the primary product interface, with dedicated API pricing at d-id.com/pricing/api. A PowerPoint plugin brings avatar generation directly into presentation workflows, making the product accessible to non-developer buyers." },
                    { brand: "DeepBrain",    score: 60, band: "medium", evidence: "An API is documented at docs.aistudios.com and supports webhook-based event triggers, giving developers a foundation to build custom workflows. However, named third-party integrations are limited, and the out-of-the-box connector ecosystem is thin compared to the leading platforms." },
                    { brand: "Renderforest", score: 50, band: "low",    evidence: "A subscriber API supports programmatic video creation and analytics integrations including Google Analytics, Meta Pixel, and SEMRush. The integration surface is primarily backend-focused with SDKs, and no native connectors exist for LMS, CRM, or enterprise collaboration tools." },
                  ],
                },
              ],
            },
          ].map(group => (
            <div key={group.groupLabel} style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: PURPLE, marginBottom: 14 }}>
                {group.groupLabel}
              </p>
              {group.features.map(feat => (
                <div key={feat.id} style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 2 }}>
                    {feat.name}
                  </p>
                  <p style={{ fontSize: 16, color: PURPLE, lineHeight: 1.5, margin: "0 0 10px" }}>
                    {feat.desc}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {feat.brands.map(({ brand, score, band, evidence }) => (
                      <div key={brand}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 16, fontWeight: 500, color: NAVY, width: 130, flexShrink: 0, lineHeight: 1.3 }}>
                            {brand}
                          </span>
                          <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                            <div style={{ width: `${score}%`, height: 6, borderRadius: 999, background: BAND_COLORS[band] ?? "#94a3b8" }} />
                          </div>
                          <span style={{ fontSize: 16, fontWeight: 700, color: BAND_COLORS[band] ?? NAVY, width: 28, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                            {score}
                          </span>
                        </div>
                        <p style={{ paddingLeft: 140, fontSize: 17, color: "#000", lineHeight: 1.5, margin: "4px 0 0" }}>{evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <p style={{ fontSize: 15, color: "#000", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 4 }}>
            Research-sourced scores · based on public documentation at time of research
          </p>
        </div>
      </div>

      {/* ── Row 9: Sentiment ────────────────────────────────────────────────── */}
      {(() => {
        const { rows: sentimentRows, meta: sentimentMeta } = sentimentData;
        const ready = sentimentRows.length > 0;

        const globalDescFreq = new Map<string, number>();
        for (const r of sentimentRows) for (const d of r.top_descriptors) globalDescFreq.set(d, (globalDescFreq.get(d) ?? 0) + 1);

        function sentimentDateLabel() {
          const e = sentimentMeta.earliest_date;
          const l = sentimentMeta.latest_date;
          if (!e || !l) return "";
          const fmt = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", { month: "short", day: "numeric", timeZone: "UTC" });
          return e === l ? fmt(e) : `${fmt(e)} – ${fmt(l)}`;
        }

        return (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
                Sentiment Analysis
              </h3>
              {!ready && (
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#000", background: "rgba(0,0,0,0.06)", borderRadius: 999, padding: "3px 8px" }}>
                  No data yet
                </span>
              )}
            </div>

            {!ready && (
              <div style={{ padding: "28px 24px", textAlign: "center" as const }}>
                <p style={{ fontSize: 16, color: "#000" }}>No sentiment data collected yet.</p>
              </div>
            )}

            {ready && (
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 15, color: "#000", marginBottom: 24 }}>
                  How Claude Haiku and GPT-4o-mini describe each brand · {sentimentDateLabel()}
                </p>
                {SENTIMENT_CLUSTERS.map(cluster => {
                  const clusterBrands = sentimentRows
                    .filter(r => r.bucket_tag === cluster.tag && LOCKED_SDAI_BRANDS.has(r.brand_name))
                    .sort((a, b) => b.positive_count - a.positive_count);
                  if (clusterBrands.length === 0) return null;
                  return (
                    <div key={cluster.tag} style={{ marginBottom: 28 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: PURPLE, marginBottom: 14 }}>
                        {cluster.label}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {clusterBrands.map(brand => {
                          const total = brand.total_count || 1;
                          const posPct = Math.round((brand.positive_count / total) * 100);
                          const neuPct = Math.round((brand.neutral_count  / total) * 100);
                          const negPct = 100 - posPct - neuPct;
                          return (
                            <div key={brand.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                                <span style={{ fontSize: 16, fontWeight: 600, color: NAVY, width: 120, flexShrink: 0, lineHeight: 1.25 }}>
                                  {brand.brand_name}
                                </span>
                                <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden", display: "flex" }}>
                                  {posPct > 0 && <div style={{ width: `${posPct}%`, height: "100%", background: "#16a34a" }} />}
                                  {neuPct > 0 && <div style={{ width: `${neuPct}%`, height: "100%", background: "#d97706" }} />}
                                  {negPct > 0 && <div style={{ width: `${negPct}%`, height: "100%", background: "#dc2626" }} />}
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 700, color: "#16a34a", width: 34, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                                  {posPct}%
                                </span>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, paddingLeft: 130 }}>
                                {[...new Set(brand.top_descriptors)].slice(0, 4).map((d, i) => {
                                  const unique = globalDescFreq.get(d) === 1;
                                  return (
                                    <span key={i} style={{
                                      fontSize: 15,
                                      color: unique ? PURPLE : "#000",
                                      background: unique ? "rgba(124,58,237,0.08)" : "rgba(0,0,0,0.04)",
                                      border: `1px solid ${unique ? "rgba(124,58,237,0.25)" : "rgba(0,0,0,0.08)"}`,
                                      borderRadius: 4, padding: "2px 7px", fontWeight: unique ? 600 : 400,
                                    }}>
                                      {d}
                                    </span>
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
                  {[["#16a34a", "Positive"], ["#d97706", "Neutral"], ["#dc2626", "Negative"]].map(([color, label]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 15, color: "#000" }}>{label}</span>
                    </div>
                  ))}
                  <span style={{ fontSize: 15, color: "#000", marginLeft: "auto" }}>
                    Both models · updates daily
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Row 10: LLM Visibility Playbook ─────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const,
            color: PURPLE, marginBottom: 8,
          }}>Research · LLM Visibility</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8 }}>
            How AI Video Companies Earn LLM Visibility
          </h3>
          <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 1.65, maxWidth: 620 }}>
            Why Descript and Synthesia are consistently cited by Claude and GPT when asked about AI video creation, and what Superdegree should do about it.
          </p>
        </div>

        {/* Descript — Lamigo-format card */}
        {(() => {
          const descEditorScore = (() => {
            const r = featureScores.find(f => f.brand_name === "Descript" && f.feature_id === "editor_timeline");
            return r ? Math.round((r.score ?? bandScore(r.score_band)) / 10) * 10 : null;
          })();
          const synVoiceScore = (() => {
            const r = featureScores.find(f => f.brand_name === "Synthesia" && f.feature_id === "voice_talking_head");
            return r ? Math.round((r.score ?? bandScore(r.score_band)) / 10) * 10 : null;
          })();
          return (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
          <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.3 }}>
              Descript: Mechanism-First Documentation
            </p>
            <ul style={{ margin: "0 0 14px", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {([
                {
                  text: "Every public page is built around a specific workflow, not a product category. The video-editing page states the exact sequence: footage is transcribed, the user edits the text, and the video changes to match.",
                  cite: "descript.com/video-editing",
                  url: "https://www.descript.com/video-editing",
                },
                {
                  text: `The Underlord help page describes it as an "agentic co-editor" that "can act on your behalf." The filler-words page specifies it "detects filler words and silences, then removes them automatically from the transcript and audio in one pass."`,
                  cite: "help.descript.com/underlord",
                  url: "https://help.descript.com/hc/en-us/articles/36803785502221",
                },
                {
                  text: "Dedicated stable URLs per capability: /video-editing, /underlord, /integrations, /pricing, /customers/revelo. Each one is a retrievable, indexable document for a specific query rather than a homepage mention.",
                  cite: null, url: null,
                },
                {
                  text: `The integrations page names Google Drive, Slack, Adobe Premiere, Ecamm, Final Cut Pro, and Dropbox and says they "enable 1-click imports" — more citable than a generic "works with your existing tools" claim.`,
                  cite: "descript.com/integrations",
                  url: "https://www.descript.com/integrations",
                },
                {
                  text: "Pricing is displayed publicly, including the Hobbyist tier at $16 per month annually — no sales-call gate.",
                  cite: "descript.com/pricing",
                  url: "https://www.descript.com/pricing",
                },
                {
                  text: `Vizard's March 2026 roundup independently labelled Descript "the best transcript-first editor for podcasts, interviews, and talking-head videos."`,
                  cite: "vizard.ai — Best AI Video Editors 2026",
                  url: "https://vizard.ai/blog/best-ai-video-editing-tools-2026",
                },
                {
                  text: `G2 reviews repeat the mechanism in user language — praise ("the most intuitive software I've ever used") and criticism ("an incredibly frustrating user experience") — giving AI models realistic decision-context rather than vendor-curated claims.`,
                  cite: "g2.com/products/descript/reviews",
                  url: "https://www.g2.com/products/descript/reviews?qs=pros-and-cons",
                },
                {
                  text: `Reddit threads including "Descript AI Video Editing is a Disaster" and reports of consuming "half of my monthly AI credits" add unprompted, specific vocabulary about pricing and failure modes that broadens the range of queries the brand appears in.`,
                  cite: "r/podcasting, r/Descript",
                  url: "https://www.reddit.com/r/podcasting/comments/1l4irrs/descript_ai_video_editing_is_a_disaster_all_ai",
                },
                {
                  text: `Revelo case study: podcast workflow went from "a couple of days" to "a couple of hours" — named customer, named outcome, no PR assistance required to cite it.`,
                  cite: "descript.com/customers/revelo",
                  url: "https://www.descript.com/customers/revelo",
                },
              ] as { text: string; cite: string | null; url: string | null }[]).map((pt, i) => (
                <li key={i} style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 7 }} />
                  <span>
                    {pt.text}
                    {pt.cite && pt.url && (
                      <a href={pt.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", marginLeft: 5, fontSize: 14, textDecoration: "underline" }}>{pt.cite}</a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p style={{
              fontSize: 16, color: "#000", lineHeight: 1.6, margin: "12px 0",
              background: "rgba(250,204,21,0.15)",
              border: "1px solid rgba(250,204,21,0.4)",
              borderRadius: 6,
              padding: "8px 12px",
            }}>
              <span style={{ fontWeight: 700 }}>Descript data: </span>
              {`Timeline / multi-track editor ${descEditorScore ?? "—"}. The evidence text cited the transcript-to-video workflow as a complete input-process-output chain. Descript appears in the Video Editor and Screen Recording mention trends.`}
            </p>
            <div style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.03) 100%)",
              border: "1px solid rgba(37,99,235,0.18)",
              borderLeft: "4px solid #2563eb",
              borderRadius: "0 10px 10px 0",
              padding: "14px 18px",
            }}>
              <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#2563eb", margin: "0 0 6px" }}>
                Takeaway
              </p>
              <p style={{ fontSize: 16, color: "#000", lineHeight: 1.65, margin: 0, fontWeight: 400 }}>
                Descript&apos;s most replicable lesson is to describe every capability as an input-to-output sequence rather than a feature name. Superdegree already has a version of this on its site — agents record in a cloud browser, edit, add zooms, captions, and narration, and output a video or written guide — but it is not yet anchored at a stable, indexable URL with that exact claim front and centre.
              </p>
            </div>
          </div>

          {/* Synthesia — Lamigo-format card */}
          <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.3 }}>
              Synthesia: Enterprise Positioning via Independent Press
            </p>
            <ul style={{ margin: "0 0 14px", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {([
                {
                  text: "CNBC and TechCrunch both independently describe Synthesia's product in their own words across multiple 2025 articles — editorial coverage, not press releases.",
                  cite: "cnbc.com, techcrunch.com",
                  url: "https://cnbc.com/2025/01/15/ai-video-platform-synthesia-doubles-valuation-to-2point1-billion.html",
                },
                {
                  text: `CNBC: "a platform creating AI-generated clips with human avatars that speak multiple languages." TechCrunch: "approximately 60,000 enterprises and 1 million users using avatar-based videos from text."`,
                  cite: null, url: null,
                },
                {
                  text: `The text-to-video page explicitly names accepted inputs: "Use a prompt, a URL, a document, or a script," then describes the output as scenes, voiceover, and an AI avatar.`,
                  cite: "synthesia.io/features/text-to-video",
                  url: "https://www.synthesia.io/features/text-to-video",
                },
                {
                  text: "The Learning and Development page breaks the workflow into a machine-readable four-step sequence: Create your script, Customise your video, Collaborate, Share and export — each step specifying an input and an output.",
                  cite: "synthesia.io/learning-and-development",
                  url: "https://www.synthesia.io/learning-and-development",
                },
                {
                  text: "Integration documentation names 360Learning, HubSpot, Shopify, WordPress, and PowerPoint. Each named platform is a retrieval anchor — a signal that the claim is specific, documented, and linked to something real.",
                  cite: "docs.synthesia.io/docs/synthesia-integrations",
                  url: "https://docs.synthesia.io/docs/synthesia-integrations",
                },
                {
                  text: "Pricing is public: Basic at $0, with Starter, Creator, and Enterprise tiers named. No sales-call gate on the entry tier.",
                  cite: "synthesia.io/pricing",
                  url: "https://www.synthesia.io/pricing",
                },
                {
                  text: `G2 reviews carry both praise ("The ability to make edits without having to reshoot an entire video is a huge advantage") and criticism ("The avatars I used mostly look flat and expressionless") — adding realistic decision-context AI models encounter in the wild.`,
                  cite: "g2.com/products/synthesia/reviews",
                  url: "https://www.g2.com/products/synthesia/reviews?qs=pros-and-cons",
                },
                {
                  text: "Trustpilot adds an additional independent corroboration layer with both positive and negative feedback, including commentary on content policy limits.",
                  cite: "trustpilot.com/review/synthesia.io",
                  url: "https://www.trustpilot.com/review/synthesia.io",
                },
                {
                  text: `Moody's case study: "If something took us 4 hours, it's taking us 30 minutes with Synthesia" — 87% reduction, named customer, stated baseline, and direct quote. The most citation-ready evidence unit in this category.`,
                  cite: "synthesia.io/case-studies",
                  url: "https://www.synthesia.io/case-studies",
                },
              ] as { text: string; cite: string | null; url: string | null }[]).map((pt, i) => (
                <li key={i} style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 7 }} />
                  <span>
                    {pt.text}
                    {pt.cite && pt.url && (
                      <a href={pt.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", marginLeft: 5, fontSize: 14, textDecoration: "underline" }}>{pt.cite}</a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p style={{
              fontSize: 16, color: "#000", lineHeight: 1.6, margin: "12px 0",
              background: "rgba(250,204,21,0.15)",
              border: "1px solid rgba(250,204,21,0.4)",
              borderRadius: 6,
              padding: "8px 12px",
            }}>
              <span style={{ fontWeight: 700 }}>Synthesia data: </span>
              {`AI talking head / avatar video ${synVoiceScore ?? "—"}. The evidence text cited the text-to-avatar pipeline as a named, multi-step workflow with specific accepted inputs. Synthesia appears in the Voice and Avatar and Translation mention trends.`}
            </p>
            <div style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.03) 100%)",
              border: "1px solid rgba(37,99,235,0.18)",
              borderLeft: "4px solid #2563eb",
              borderRadius: "0 10px 10px 0",
              padding: "14px 18px",
            }}>
              <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#2563eb", margin: "0 0 6px" }}>
                Takeaway
              </p>
              <p style={{ fontSize: 16, color: "#000", lineHeight: 1.65, margin: 0, fontWeight: 400 }}>
                Synthesia&apos;s most replicable lesson is independent press corroboration: the same claim repeated on an owned page, in a G2 review, in a CNBC article, and in a TechCrunch funding story gives AI models four independent sources for the same identity. The Moody&apos;s case study — 4 hours to 30 minutes, 87% reduction, named customer — is the strongest single evidence unit produced by any brand in this report and the direct model for what Superdegree should commission.
              </p>
            </div>
          </div>
        </div>
        );
        })()}

        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", margin: "28px 0 28px" }} />

        {/* Shared pattern table */}
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 6 }}>The Shared Visibility Pattern</h4>
          <p style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", lineHeight: 1.6, marginBottom: 16 }}>
            Both companies have built an evidence system, not just a marketing site. The same claim appears across a product page, a documentation page, a customer story, a review, and an independent article.
          </p>
          <div style={{ overflowX: "auto" as const }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
              <thead>
                <tr>
                  {["Pattern", "Descript", "Synthesia"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.07em", textTransform: "uppercase" as const,
                      color: "rgba(0,0,0,0.4)", borderBottom: "2px solid rgba(0,0,0,0.08)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    {
                      pattern: "Dedicated feature URLs",
                      descript: (
                        <>
                          <a href="https://www.descript.com/video-editing" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/video-editing</a>
                          {", "}
                          <a href="https://help.descript.com/underlord" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/underlord</a>
                          {", "}
                          <a href="https://www.descript.com/integrations" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/integrations</a>
                        </>
                      ),
                      synthesia: (
                        <>
                          <a href="https://www.synthesia.io/features/text-to-video" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/features/text-to-video</a>
                          {", "}
                          <a href="https://www.synthesia.io/features/avatars" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/features/avatars</a>
                          {", "}
                          <a href="https://www.synthesia.io/enterprise" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/enterprise</a>
                        </>
                      ),
                    },
                    {
                      pattern: "Input-to-output language",
                      descript: "Footage, transcript, text edits, updated video",
                      synthesia: "Prompt, URL, document, or script, then scenes, voiceover, avatar video",
                    },
                    {
                      pattern: "Named integrations",
                      descript: (
                        <>
                          Google Drive, Slack, Adobe Premiere, Final Cut Pro —{" "}
                          <a href="https://www.descript.com/integrations" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>see all</a>
                        </>
                      ),
                      synthesia: (
                        <>
                          PowerPoint, 360Learning, HubSpot, Shopify, LMS platforms —{" "}
                          <a href="https://docs.synthesia.io/docs/synthesia-integrations" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>see all</a>
                        </>
                      ),
                    },
                    {
                      pattern: "Public pricing",
                      descript: (
                        <>
                          Free and paid tiers displayed, Hobbyist pricing shown —{" "}
                          <a href="https://www.descript.com/pricing" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>pricing page</a>
                        </>
                      ),
                      synthesia: (
                        <>
                          Basic at $0, Starter, Creator, Enterprise all named —{" "}
                          <a href="https://www.synthesia.io/pricing" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>pricing page</a>
                        </>
                      ),
                    },
                    {
                      pattern: "Named proof format",
                      descript: (
                        <a href="https://www.descript.com/customers/revelo" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>Revelo: days to hours</a>
                      ),
                      synthesia: (
                        <a href="https://www.synthesia.io/case-studies" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>{"Moody's: 4 hours to 30 minutes, 87% reduction"}</a>
                      ),
                    },
                    {
                      pattern: "Comparison surface",
                      descript: (
                        <a href="https://www.descript.com/vs/riverside" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>Official Descript vs Riverside page</a>
                      ),
                      synthesia: (
                        <a href="https://www.g2.com/products/synthesia/competitors/alternatives" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>G2 alternatives page names HeyGen, Descript, VEED</a>
                      ),
                    },
                  ] as { pattern: string; descript: React.ReactNode; synthesia: React.ReactNode }[]
                ).map(({ pattern, descript, synthesia }) => (
                  <tr key={pattern}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 600, color: NAVY, verticalAlign: "top", width: "28%" }}>{pattern}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#000", verticalAlign: "top", width: "36%" }}>{descript}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#000", verticalAlign: "top", width: "36%" }}>{synthesia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", margin: "8px 0 28px" }} />

        {/* Playbook */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: PURPLE, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "rgba(0,0,0,0.45)" }}>Superdegree</span>
          </div>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 4 }}>
            How Superdegree Becomes LLM-Visible
          </h4>
          <div style={{
            background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)",
            borderRadius: 8, padding: "14px 18px", margin: "14px 0 24px",
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 4 }}>The core opportunity</p>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.6)", lineHeight: 1.65, margin: 0 }}>
              Superdegree already has the mechanism. It is missing the evidence system around it. The agent claim exists on the domain but has not yet been independently corroborated across review platforms, press, and community discussion.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {[
              {
                rank: 1,
                impact: "High",
                type: "Owned",
                action: "Publish a canonical autonomous-browser-agent workflow page",
                what: `Create a stable URL such as /features/autonomous-browser-video-agent and document the exact sequence: task brief or product URL, cloud-browser navigation, screen recording, automatic editing with zooms, captions, and narration, then a finished product video plus a written guide. Include a short worked example showing the agent's starting instruction, observed browser actions, and final artefacts.`,
                why: `Descript and Synthesia make their identities citable by expressing a complete input-to-output workflow. Superdegree already has the underlying claim on its site but spread across multiple pages rather than anchored at one stable URL.`,
                source: "Evidence: descript.com/video-editing, synthesia.io/features/text-to-video, super.degree/learn",
              },
              {
                rank: 2,
                impact: "High",
                type: "Owned",
                action: "Name the agent and publish its exact action primitives",
                what: `Give the system a stable product name and publish an action inventory: open URL, click, type, navigate, recover from a changed interface, record, detect steps, add zoom, narrate, caption, generate guide. Do not describe it only as "AI-powered." Define what the agent observes, does, and returns.`,
                why: `Descript's phrase "It's an agentic co-editor" and "can act on your behalf" gives a language model an identifiable object and a set of behaviours to retrieve. Without a named entity, the claim cannot be cited with confidence.`,
                source: "Evidence: help.descript.com/underlord, synthesia.io/learning-and-development",
              },
              {
                rank: 3,
                impact: "High",
                type: "Earned",
                action: "Commission independently auditable benchmark case studies",
                what: `Recruit three product, support, or enablement teams and publish before-and-after measures: recording time, editing time, interface steps, revision count, guide creation time, and percentage of screens successfully completed without human intervention. Give customers permission to publish their own versions on their own domains or on neutral review platforms.`,
                why: `Synthesia's Moody's case is citable because it gives a named customer, a baseline, an outcome, and a direct quote. A claim that exists only on Superdegree's own domain cannot be independently corroborated.`,
                source: "Evidence: synthesia.io/case-studies, descript.com/customers/revelo",
              },
              {
                rank: 4,
                impact: "High",
                type: "Earned",
                action: "Earn neutral category labels through hands-on reviews and roundups",
                what: `Offer Superdegree to independent reviewers who cover AI video, product education, browser agents, and screen-recording automation. Provide a reproducible test brief but do not script the conclusion. The target is a phrase such as "best autonomous browser agent for product demo videos" supported by the reviewer's own observed workflow.`,
                why: `Vizard gives Descript a durable category label in its 2026 roundup. G2's alternatives page creates named comparison context around Synthesia. A neutral category description is the largest missing evidence layer for Superdegree.`,
                source: "Evidence: vizard.ai/blog/best-ai-video-editing-tools-2026",
              },
              {
                rank: 5,
                impact: "Medium",
                type: "Owned",
                action: "Build factual comparison pages against adjacent tools",
                what: `Publish comparisons such as Superdegree vs Descript for autonomous product walkthroughs, Superdegree vs Synthesia for browser-grounded demos, and Superdegree vs conventional screen recorders. Use a capability matrix covering browser navigation, recording, editing, avatars, transcript editing, written guides, and integrations. State only what each public source documents.`,
                why: `Descript has an official "Descript vs Riverside" comparison page. G2's Synthesia alternatives page names several competitors and maps their positioning. Competitor nouns help models resolve the category.`,
                source: "Evidence: descript.com/blog/article/descript-vs-riverside-best-remote-recording-tool",
              },
              {
                rank: 6,
                impact: "Medium",
                type: "Owned",
                action: "Publish named integrations, export formats, and operational constraints",
                what: `Create /integrations and /docs pages naming the browser environment, supported application types, export formats, caption and narration options, guide formats, and handoff destinations. State constraints plainly, including the 10-minute recording limit and the fact that no extension or desktop app is required.`,
                why: `Descript names every major integration and says they enable "1-click imports." Superdegree already has a differentiating constraint documented on its homepage but it is not yet on a dedicated, indexable page.`,
                source: "Evidence: descript.com/integrations, docs.synthesia.io/docs/synthesia-integrations",
              },
              {
                rank: 7,
                impact: "Medium",
                type: "Owned + Earned",
                action: "Publish transparent pricing and a limitations page",
                what: `Put at least one exact plan or a transparent credit formula on /pricing, explain what consumes credits, and state when a human review step is recommended. Add a public limitations page covering browser-only recording, recording duration, dynamic interfaces, authentication, failed steps, and revision behaviour.`,
                why: `Both comparators make pricing discoverable. Their review and Reddit visibility also includes criticism: Descript's AI-credit complaints and Synthesia's avatar limitations. Transparent constraints make Superdegree more trustworthy and give independent writers concrete, testable material.`,
                source: "Evidence: descript.com/pricing, synthesia.io/pricing",
              },
            ].map(({ rank, impact, type, action, what, why, source }) => (
              <div key={rank} style={{
                display: "flex", gap: 16, alignItems: "flex-start",
                padding: "18px 20px",
                background: "#FAFAFA",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.06)",
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", background: PURPLE,
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 2,
                }}>{rank}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 7 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const,
                      color: PURPLE, background: "rgba(124,58,237,0.1)", borderRadius: 999, padding: "2px 8px",
                    }}>Impact: {impact}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: "rgba(0,0,0,0.45)",
                      background: "rgba(0,0,0,0.05)", borderRadius: 999, padding: "2px 8px",
                    }}>{type}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 8, lineHeight: 1.3 }}>{action}</p>
                  <p style={{ fontSize: 13, color: "#000", lineHeight: 1.65, marginBottom: 8 }}><strong style={{ color: NAVY }}>What to do: </strong>{what}</p>
                  <p style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", lineHeight: 1.6, paddingLeft: 10, borderLeft: `3px solid rgba(124,58,237,0.25)`, marginBottom: 6 }}><strong style={{ color: NAVY }}>Why it works: </strong>{why}</p>
                  <p style={{ fontSize: 11, color: "rgba(0,0,0,0.3)" }}>{source}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key move */}
          <div style={{
            background: NAVY, borderRadius: 10, padding: "24px 26px", marginTop: 20,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Single highest-leverage move</div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 10 }}>
              Make the browser agent a named, testable, cross-source entity
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: 0 }}>
              Superdegree&apos;s genuine differentiator is an autonomous browser-navigating agent that neither Descript nor Synthesia has built. But this differentiator currently exists only on Superdegree&apos;s own domain. The highest-leverage move is to publish one canonical claim at a stable URL, in mechanism-level language, and then facilitate independent tests that reproduce the exact workflow and publish their own observations. The goal is for a language model to encounter the same claim across Superdegree&apos;s own documentation, a customer case study, an independent reviewer&apos;s article, and a review platform. That converts a marketing assertion into a named, testable entity that Claude and GPT-4o-mini can confidently cite.
            </p>
          </div>
          <p style={{ fontSize: 11, color: "rgba(0,0,0,0.3)", marginTop: 10, textAlign: "center" as const }}>
            Research conducted via Parallel.ai · August 2026 · AgenticLib
          </p>
        </div>
      </div>

      {/* ── Row 11: Product improvement opportunities ───────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 24px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
              Product Feature Opportunities
            </h3>
            <span style={{ fontSize: 12, fontWeight: 600, background: "rgba(124,58,237,0.1)", color: PURPLE, borderRadius: 999, padding: "3px 10px" }}>
              Superdegree
            </span>
          </div>
          <p style={{ fontSize: 15, color: "#000", margin: 0, lineHeight: 1.6 }}>
            Three capabilities where Superdegree&apos;s current product is well-positioned but a targeted expansion would improve AI model coverage — and team outcomes.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            {
              title: "Reusable flow library",
              current: "Superdegree offers brand formats and reusable templates.",
              improvement: `Add a "flow library" where common app segments — login, settings navigation, key UI states — are saved as reusable clips. When the UI changes, updating the clip propagates to every video that references it, turning one-time recordings into maintainable assets. This addresses a gap the Collaboration and AI Agents clusters are already probing for.`,
            },
            {
              title: "Agent decision notes",
              current: "The Ask agent drives the app autonomously in a hosted browser and captures the full flow without a human at the keyboard.",
              improvement: `Surface lightweight agent decision notes alongside the captured recording — "I clicked here because this is the primary CTA," "I paused here because I detected a required field" — as a review layer editors see before publishing. Closes the gap between autonomous capture and trustworthy autonomous capture, and gives LLMs concrete language to describe the feature.`,
            },
            {
              title: "Cross-team narration consistency",
              current: "Superdegree clones individual voices and lets anyone re-record lines without re-recording. The brand kit covers visual consistency.",
              improvement: "Add a narration consistency check that surfaces when a new video's pacing or tone reads significantly differently from the team's existing library. Useful for CS and product teams publishing to a shared help centre, and directly addressable by AI models when asked about enterprise video governance — a currently underdocumented cluster.",
            },
          ].map(({ title, current, improvement }, i, arr) => (
            <div key={title} style={{
              display: "flex",
              gap: 20,
              padding: "20px 0",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
            }}>
              <div style={{ width: 28, flexShrink: 0, paddingTop: 2 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: PURPLE, color: "#fff",
                  fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {i + 1}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: "0 0 8px", letterSpacing: "-0.01em" }}>{title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#059669", background: "rgba(5,150,105,0.08)", borderRadius: 999, padding: "2px 8px", flexShrink: 0, marginTop: 1 }}>Current</span>
                    <p style={{ fontSize: 14, color: "#000", margin: 0, lineHeight: 1.65 }}>{current}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: PURPLE, background: "rgba(124,58,237,0.08)", borderRadius: 999, padding: "2px 8px", flexShrink: 0, marginTop: 1 }}>Opportunity</span>
                    <p style={{ fontSize: 14, color: "#000", margin: 0, lineHeight: 1.65 }}>{improvement}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footnotes ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 4px" }}>
        <p style={{ fontSize: 11, color: "#000", margin: 0, textAlign: "center" }}>
          Based on 22 daily prompts across Claude Haiku and GPT-4o-mini · AI Video Creation category · collecting since August 2026
        </p>
        <p style={{ fontSize: 11, color: "#000", margin: "0 auto", textAlign: "center", maxWidth: 680 }}>
          Scores require agreement between both AI models. When models disagree, we take the more conservative rating, so a lower score sometimes means models disagree, not that documentation is absent. Check the evidence text for the fuller picture.
        </p>
      </div>

    </div>
  );
}
