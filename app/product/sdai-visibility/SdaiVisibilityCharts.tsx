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
interface DailyRow        { date: string; brand: string; model: string; mention_count: number; avg_position: number | null }
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
  { tag: "sdai-recording",    label: "Screen Recording" },
  { tag: "sdai-production",   label: "AI Production" },
  { tag: "sdai-editor",       label: "Video Editor" },
  { tag: "sdai-voice",        label: "Voice & Avatar" },
  { tag: "sdai-captions",     label: "Captions" },
  { tag: "sdai-translation",  label: "Translation" },
  { tag: "sdai-distribution", label: "Distribution" },
  { tag: "sdai-branding",     label: "Branding" },
  { tag: "sdai-collab",       label: "Collaboration" },
  { tag: "sdai-agents",       label: "AI Agents" },
];

const SENTIMENT_CLUSTERS = [
  { tag: "sdai-recording",    label: "Screen Recording" },
  { tag: "sdai-production",   label: "AI Production" },
  { tag: "sdai-editor",       label: "Video Editor" },
  { tag: "sdai-voice",        label: "Voice & Avatar" },
  { tag: "sdai-captions",     label: "Captions" },
  { tag: "sdai-translation",  label: "Translation" },
  { tag: "sdai-distribution", label: "Distribution" },
  { tag: "sdai-branding",     label: "Branding" },
  { tag: "sdai-collab",       label: "Collaboration" },
  { tag: "sdai-agents",       label: "AI Agents" },
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
  const index: Record<string, Record<string, number>> = {};

  for (const row of dailySummary) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    dateSet.add(row.date);
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
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

  // ── Per-cluster chart rows ────────────────────────────────────────────────────
  const clusterCharts = SOV_CLUSTERS.map(cluster => {
    // Filter daily summary by cluster
    const clusterIndex: Record<string, Record<string, number>> = {};
    for (const row of dailySummary) {
      if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
      if (row.date < dates[0] || row.date > dates[dates.length - 1]) continue;
      // All brands compete in all clusters — use overall data (cluster filter done at DB)
    }
    const rows = dates.map(date => {
      const row: Record<string, number | string> = { date };
      for (const b of brands) row[b] = index[date]?.[b] ?? 0;
      return row;
    });
    return { ...cluster, clusterBrands: brands, rows };
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
            {clusterCharts.map(({ tag, label, clusterBrands, rows }) => (
              <div key={tag} style={{
                background: "#fff", borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
                padding: "20px 24px 16px",
              }}>
                <h4 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>{label}</h4>
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
                    const sa = a.score ?? bandScore(a.score_band);
                    const sb = b.score ?? bandScore(b.score_band);
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
                          const score = r.score ?? bandScore(r.score_band);
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

      {/* ── Row 9: Sentiment ────────────────────────────────────────────────── */}
      {(() => {
        const { rows: sentimentRows, meta: sentimentMeta } = sentimentData;
        const GATE = 3;
        const daysHave = sentimentMeta.dual_model_dates ?? 0;
        const ready = daysHave >= GATE;

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
                  Collecting
                </span>
              )}
            </div>

            {!ready && (
              <div style={{ padding: "28px 24px", textAlign: "center" as const }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 8 }}>
                  Collecting data: {daysHave} of {GATE} minimum days
                </p>
                <p style={{ fontSize: 16, color: "#000", maxWidth: 380, margin: "0 auto" }}>
                  Sentiment bars appear once both Claude Haiku and GPT-4o-mini have collected on {GATE} separate days.
                  Check back in {GATE - daysHave} day{GATE - daysHave !== 1 ? "s" : ""}.
                </p>
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
