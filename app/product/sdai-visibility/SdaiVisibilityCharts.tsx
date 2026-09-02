"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "rgba(124,58,237,0.10)";

const LINE_COLORS = [
  "#7C3AED","#C026D3","#2563EB","#059669","#DC2626",
  "#D97706","#0891B2","#EA580C","#65A30D","#BE185D",
  "#84CC16","#0369A1","#92400E","#F43F5E","#FB923C",
  "#818CF8","#34D399","#FCD34D","#6EE7B7","#A78BFA",
];

function lineColor(i: number) { return LINE_COLORS[i % LINE_COLORS.length]; }

const BRAND_COLOR_MAP: Record<string, string> = {
  "Descript":      "#7C3AED",
  "Synthesia":     "#C026D3",
  "HeyGen":        "#2563EB",
  "Opus Clip":     "#059669",
  "D-ID":          "#DC2626",
  "DeepBrain":     "#D97706",
  "Renderforest":  "#0891B2",
};

function getBrandColor(brand: string): string {
  return BRAND_COLOR_MAP[brand] ?? LINE_COLORS[0];
}

const LOCKED_SDAI_BRANDS = new Set([
  "Descript","Synthesia","HeyGen","Opus Clip","D-ID","DeepBrain","Renderforest",
]);

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
  recording_no_install:      "Browser recording, no install",
  recording_upload_support:  "Upload or 10+ min recordings",
  production_auto_zoom:      "Auto zoom, pacing & trim",
  production_transitions:    "Transition slides between sections",
  voice_cloning:             "AI voice cloning from samples",
  voice_talking_head:        "AI talking head / avatar video",
  captions_auto:             "Auto-generated captions",
  captions_styling:          "Caption styling & branding",
  translation_languages:     "Multi-language translation",
  translation_narration_regen:"Narration regeneration post-translation",
  branding_brand_kit:        "Brand kit (colours, logo, fonts)",
  branding_templates:        "Video templates & themes",
  agents_autonomous_record:  "Autonomous AI recording agent",
  agents_safety:             "AI safety & compliance controls",
  distribution_embed:        "Embed & share player",
  distribution_analytics:    "View analytics & engagement tracking",
  collab_team_workspace:     "Team workspace & permissions",
  collab_review:             "Commenting & review workflow",
  editor_timeline:           "Timeline / multi-track editor",
  editor_text_effects:       "Animated text effects & callouts",
};

const FEATURE_GROUPS = [
  { label: "Screen Recording",   features: ["recording_no_install","recording_upload_support"] },
  { label: "AI Production",      features: ["production_auto_zoom","production_transitions"] },
  { label: "Voice & Avatar",     features: ["voice_cloning","voice_talking_head"] },
  { label: "Captions",           features: ["captions_auto","captions_styling"] },
  { label: "Translation",        features: ["translation_languages","translation_narration_regen"] },
  { label: "Branding",           features: ["branding_brand_kit","branding_templates"] },
  { label: "AI Agents",          features: ["agents_autonomous_record","agents_safety"] },
  { label: "Distribution",       features: ["distribution_embed","distribution_analytics"] },
  { label: "Collaboration",      features: ["collab_team_workspace","collab_review"] },
  { label: "Editor",             features: ["editor_timeline","editor_text_effects"] },
];

const BAND_COLORS: Record<string, string> = {
  high:    "#16a34a",
  medium:  "#2563eb",
  low:     "#d97706",
  strong:  "#16a34a",
  present: "#2563eb",
  partial: "#d97706",
  weak:    "#dc2626",
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
  const LIMIT = 500;
  if (stripped.length <= LIMIT) return stripped;
  const cut = stripped.lastIndexOf(". ", LIMIT);
  return cut > 0 ? stripped.slice(0, cut + 1) : stripped;
}

// ── Cluster label map ───────────────────────────────────────────────────────────
const CLUSTER_LABELS: Record<string, string> = {
  "sdai-overall":      "Overall",
  "sdai-recording":    "Screen Recording",
  "sdai-editor":       "Editor",
  "sdai-voice":        "Voice & Avatar",
  "sdai-captions":     "Captions",
  "sdai-translation":  "Translation",
  "sdai-distribution": "Distribution",
  "sdai-production":   "AI Production",
  "sdai-branding":     "Branding",
  "sdai-collab":       "Collaboration",
  "sdai-agents":       "AI Agents",
};

function clusterLabel(tag: string): string {
  return CLUSTER_LABELS[tag] ?? tag;
}

// ── Shared card style ───────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(124,58,237,0.07)",
      padding: "24px 28px", ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#111", letterSpacing: "-0.01em", margin: "0 0 16px" }}>
      {children}
    </h2>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SdaiVisibilityCharts({
  dailySummary, weeklySummary, llmVisibility, sovData,
  clusterPositions, featureScores, sentimentData,
}: Props) {

  const [selectedCluster, setSelectedCluster] = useState("sdai-overall");
  const [selectedSentBrand, setSelectedSentBrand] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [featureBrand, setFeatureBrand] = useState<string | null>(null);

  // All locked brands actually present
  const allBrands = Array.from(
    new Set(dailySummary.map(r => r.brand).filter(b => LOCKED_SDAI_BRANDS.has(b)))
  ).sort();

  // ── Section 1: Mention trend (daily) ─────────────────────────────────────────
  const trendDates = Array.from(new Set(dailySummary.map(r => r.date))).sort();
  const trendByBrand: Record<string, Record<string, number>> = {};
  for (const row of dailySummary) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    if (!trendByBrand[row.brand]) trendByBrand[row.brand] = {};
    trendByBrand[row.brand][row.date] = (trendByBrand[row.brand][row.date] ?? 0) + row.mention_count;
  }
  const trendData = trendDates.map(date => {
    const point: Record<string, number | string> = { date: fmtDate(date) };
    for (const brand of allBrands) {
      point[brand] = trendByBrand[brand]?.[date] ?? 0;
    }
    return point;
  });

  // ── Section 2: Weekly summary bar ─────────────────────────────────────────────
  const weeklyByBrand: Record<string, number> = {};
  for (const row of weeklySummary) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    weeklyByBrand[row.brand] = (weeklyByBrand[row.brand] ?? 0) + row.mention_count;
  }
  const weeklyData = Object.entries(weeklyByBrand)
    .map(([brand, total]) => ({ brand, total }))
    .sort((a, b) => b.total - a.total);

  // ── Section 3: LLM visibility ─────────────────────────────────────────────────
  const llmData = llmVisibility.map(r => ({
    model: r.model === "claude-haiku-4-5" ? "Claude Haiku 4.5" : r.model,
    visibility_pct: r.visibility_pct,
    total: r.total_responses,
  }));

  // ── Section 4: SOV per cluster ────────────────────────────────────────────────
  const clusters = Array.from(new Set(sovData.map(r => r.cluster_tag))).sort();
  const sovForCluster = sovData
    .filter(r => r.cluster_tag === selectedCluster && LOCKED_SDAI_BRANDS.has(r.brand))
    .sort((a, b) => b.sov_pct - a.sov_pct)
    .slice(0, 10);

  // ── Section 5: Cluster position heatmap ──────────────────────────────────────
  const positionClusters = Array.from(new Set(clusterPositions.map(r => r.cluster_tag))).sort();
  const posGrid: Record<string, Record<string, number | null>> = {};
  for (const brand of allBrands) posGrid[brand] = {};
  for (const row of clusterPositions) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    if (!posGrid[row.brand]) posGrid[row.brand] = {};
    posGrid[row.brand][row.cluster_tag] = row.avg_position;
  }

  // ── Section 6: Feature scores ─────────────────────────────────────────────────
  const featureBrands = Array.from(
    new Set(featureScores.map(r => r.brand_name).filter(b => LOCKED_SDAI_BRANDS.has(b)))
  ).sort();

  // ── Section 7: Sentiment ──────────────────────────────────────────────────────
  const sentBrands = Array.from(
    new Set(sentimentData.rows.map(r => r.brand_name).filter(b => LOCKED_SDAI_BRANDS.has(b)))
  ).sort();
  const displaySentBrand = selectedSentBrand ?? sentBrands[0] ?? null;

  const sentRows = displaySentBrand
    ? sentimentData.rows.filter(r => r.brand_name === displaySentBrand)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8" style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── 1. Mention trend ── */}
      {trendData.length > 0 && (
        <Card>
          <SectionTitle>Daily mention trend (last 7 days)</SectionTitle>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
            Total appearances across all clusters and both models combined.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {allBrands.map((brand, i) => (
                <Line
                  key={brand}
                  type="monotone"
                  dataKey={brand}
                  stroke={getBrandColor(brand)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12 }}>
            {allBrands.map((brand, i) => (
              <span key={brand} style={{ fontSize: 12, color: "#444", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: getBrandColor(brand) }} />
                {brand}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* ── 2. Weekly totals ── */}
      {weeklyData.length > 0 && (
        <Card>
          <SectionTitle>7-day total mentions by brand</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="brand" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {weeklyData.map((entry) => (
                  <Cell key={entry.brand} fill={getBrandColor(entry.brand)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── 3. LLM visibility ── */}
      {llmData.length > 0 && (
        <Card>
          <SectionTitle>LLM visibility rate</SectionTitle>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
            % of prompts where any locked brand appeared in the response.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {llmData.map((m) => (
              <div key={m.model} style={{
                flex: "1 1 160px",
                background: ACCENT_LIGHT,
                borderRadius: 10,
                padding: "16px 20px",
                minWidth: 140,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 4 }}>{m.model}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: ACCENT, letterSpacing: "-0.02em" }}>
                  {m.visibility_pct}%
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {m.total.toLocaleString()} responses
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── 4. Share of voice per cluster ── */}
      {sovData.length > 0 && (
        <Card>
          <SectionTitle>Share of voice by cluster</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {clusters.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCluster(c)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "1.5px solid",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: selectedCluster === c ? ACCENT : "transparent",
                  color: selectedCluster === c ? "#fff" : ACCENT,
                  borderColor: ACCENT,
                  transition: "all 120ms ease",
                }}
              >
                {clusterLabel(c)}
              </button>
            ))}
          </div>

          {sovForCluster.length > 0 ? (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: "0 0 220px" }}>
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie data={sovForCluster} dataKey="sov_pct" nameKey="brand" cx="50%" cy="50%" outerRadius={90} innerRadius={48}>
                      {sovForCluster.map((entry) => (
                        <Cell key={entry.brand} fill={getBrandColor(entry.brand)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                {sovForCluster.map((entry) => (
                  <div key={entry.brand} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, flexShrink: 0, background: getBrandColor(entry.brand) }} />
                    <span style={{ fontSize: 13, color: "#333", flex: 1 }}>{entry.brand}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111", fontVariantNumeric: "tabular-nums" }}>
                      {entry.sov_pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#888" }}>No data yet for this cluster.</p>
          )}
        </Card>
      )}

      {/* ── 5. Cluster position heatmap ── */}
      {allBrands.length > 0 && positionClusters.length > 0 && (
        <Card style={{ overflowX: "auto" }}>
          <SectionTitle>Avg mention position by cluster (lower = better)</SectionTitle>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
            Average ordinal position in the LLM's ranked list. Position 1 = named first.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: 700, color: "#555", minWidth: 100, background: "#FAFAFA", borderBottom: "1px solid #eee" }}>
                  Brand
                </th>
                {positionClusters.map(c => (
                  <th key={c} style={{ padding: "6px 8px", fontWeight: 600, color: "#555", background: "#FAFAFA", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>
                    {clusterLabel(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allBrands.map((brand, i) => (
                <tr key={brand} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "7px 10px", fontWeight: 700, color: "#111" }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: getBrandColor(brand), marginRight: 6 }} />
                    {brand}
                  </td>
                  {positionClusters.map(c => {
                    const pos = posGrid[brand]?.[c];
                    const bg = pos == null
                      ? "transparent"
                      : pos <= 2 ? "rgba(124,58,237,0.14)"
                      : pos <= 4 ? "rgba(124,58,237,0.07)"
                      : "transparent";
                    return (
                      <td key={c} style={{ padding: "7px 8px", textAlign: "center", color: pos == null ? "#ccc" : "#222", background: bg, fontVariantNumeric: "tabular-nums" }}>
                        {pos == null ? "—" : pos.toFixed(1)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* ── 6. Feature scores ── */}
      {featureScores.length > 0 && (
        <Card>
          <SectionTitle>Feature capability scores</SectionTitle>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
            20 features scored per brand across 10 capability clusters.
            Click a cell to see evidence.
          </p>

          {/* Brand filter tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            <button
              onClick={() => setFeatureBrand(null)}
              style={{
                padding: "4px 10px", borderRadius: 999, border: "1.5px solid",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                background: featureBrand === null ? ACCENT : "transparent",
                color: featureBrand === null ? "#fff" : ACCENT,
                borderColor: ACCENT,
              }}
            >
              All brands
            </button>
            {featureBrands.map(b => (
              <button
                key={b}
                onClick={() => setFeatureBrand(featureBrand === b ? null : b)}
                style={{
                  padding: "4px 10px", borderRadius: 999, border: "1.5px solid",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: featureBrand === b ? getBrandColor(b) : "transparent",
                  color: featureBrand === b ? "#fff" : getBrandColor(b),
                  borderColor: getBrandColor(b),
                }}
              >
                {b}
              </button>
            ))}
          </div>

          {FEATURE_GROUPS.map(group => {
            const rows = featureScores.filter(r =>
              group.features.includes(r.feature_id) &&
              LOCKED_SDAI_BRANDS.has(r.brand_name) &&
              (featureBrand === null || r.brand_name === featureBrand)
            );
            if (rows.length === 0) return null;

            const brands = featureBrand
              ? [featureBrand]
              : featureBrands;

            return (
              <div key={group.label} style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: ACCENT, marginBottom: 10,
                }}>
                  {group.label}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "5px 10px", fontWeight: 600, color: "#666", background: "#FAFAFA", borderBottom: "1px solid #eee", minWidth: 160 }}>Feature</th>
                        {brands.map(b => (
                          <th key={b} style={{ padding: "5px 10px", fontWeight: 700, color: "#333", background: "#FAFAFA", borderBottom: "1px solid #eee", whiteSpace: "nowrap", minWidth: 90 }}>
                            {b}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.features.map((fid, fi) => (
                        <tr key={fid} style={{ background: fi % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                          <td style={{ padding: "7px 10px", color: "#333", fontWeight: 500 }}>
                            {featureName(fid)}
                          </td>
                          {brands.map(b => {
                            const score = featureScores.find(r => r.brand_name === b && r.feature_id === fid);
                            const cellKey = `${b}::${fid}`;
                            const bandColor = score ? (BAND_COLORS[score.score_band] ?? "#888") : "#ddd";
                            const isExpanded = expandedFeature === cellKey;
                            const ev = score ? cleanEvidence(score.evidence) : null;
                            return (
                              <td key={b} style={{ padding: "6px 10px", textAlign: "center", verticalAlign: "top" }}>
                                {score ? (
                                  <div>
                                    <button
                                      onClick={() => setExpandedFeature(isExpanded ? null : cellKey)}
                                      style={{
                                        display: "inline-flex", alignItems: "center", gap: 4,
                                        background: `${bandColor}18`,
                                        color: bandColor,
                                        border: `1px solid ${bandColor}40`,
                                        borderRadius: 6,
                                        padding: "3px 8px",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: ev ? "pointer" : "default",
                                        fontVariantNumeric: "tabular-nums",
                                      }}
                                    >
                                      {score.score != null ? score.score : score.score_band}
                                      {ev && <span style={{ opacity: 0.7, fontSize: 10 }}>▾</span>}
                                    </button>
                                    {isExpanded && ev && (
                                      <div style={{
                                        marginTop: 6, padding: "8px 10px",
                                        background: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 6,
                                        fontSize: 11,
                                        color: "#444",
                                        textAlign: "left",
                                        lineHeight: 1.5,
                                        maxWidth: 260,
                                      }}>
                                        {score.has_capability && (
                                          <span style={{
                                            display: "inline-block",
                                            fontSize: 10, fontWeight: 700,
                                            color: BAND_COLORS[score.has_capability === "yes" ? "high" : score.has_capability === "partial" ? "low" : "weak"] ?? "#888",
                                            marginBottom: 4,
                                          }}>
                                            {score.has_capability.toUpperCase()}
                                          </span>
                                        )}
                                        <p style={{ margin: 0 }}>{ev}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ color: "#ccc", fontSize: 12 }}>—</span>
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
            );
          })}
        </Card>
      )}

      {/* ── 7. Sentiment ── */}
      {sentimentData.rows.length > 0 && (
        <Card>
          <SectionTitle>Sentiment by brand</SectionTitle>
          {sentimentData.meta.earliest_date && (
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
              Based on {sentimentData.meta.dual_model_dates} dual-model collection date(s),{" "}
              {sentimentData.meta.earliest_date} → {sentimentData.meta.latest_date}.
            </p>
          )}

          {/* Brand tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {sentBrands.map(b => (
              <button
                key={b}
                onClick={() => setSelectedSentBrand(b)}
                style={{
                  padding: "5px 12px", borderRadius: 999, border: "1.5px solid",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: displaySentBrand === b ? getBrandColor(b) : "transparent",
                  color: displaySentBrand === b ? "#fff" : getBrandColor(b),
                  borderColor: getBrandColor(b),
                  transition: "all 120ms ease",
                }}
              >
                {b}
              </button>
            ))}
          </div>

          {displaySentBrand && sentRows.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sentRows.map(row => {
                const total = row.total_count || 1;
                const posPct = Math.round((row.positive_count / total) * 100);
                const neuPct = Math.round((row.neutral_count / total) * 100);
                const negPct = 100 - posPct - neuPct;
                const bucketLabel = row.bucket_tag.replace(/^sdai-/, "").replace(/-/g, " ");
                return (
                  <div key={row.bucket_tag} style={{
                    padding: "12px 14px",
                    background: "#FAFAFA",
                    borderRadius: 8,
                    border: "1px solid #f0f0f0",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#333", textTransform: "capitalize" }}>{bucketLabel}</span>
                      <span style={{ fontSize: 11, color: "#888" }}>{row.total_count} responses</span>
                    </div>
                    {/* Stacked bar */}
                    <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 8, gap: 1 }}>
                      {posPct > 0 && <div style={{ width: `${posPct}%`, background: "#16a34a" }} />}
                      {neuPct > 0 && <div style={{ width: `${neuPct}%`, background: "#d97706" }} />}
                      {negPct > 0 && <div style={{ width: `${negPct}%`, background: "#dc2626" }} />}
                    </div>
                    <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#555" }}>
                      <span><span style={{ color: "#16a34a", fontWeight: 700 }}>+{posPct}%</span> positive</span>
                      <span><span style={{ color: "#d97706", fontWeight: 700 }}>{neuPct}%</span> neutral</span>
                      <span><span style={{ color: "#dc2626", fontWeight: 700 }}>{negPct}%</span> negative</span>
                    </div>
                    {row.top_descriptors && row.top_descriptors.length > 0 && (
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {row.top_descriptors.map((d: string) => (
                          <span key={d} style={{
                            fontSize: 10, fontWeight: 600,
                            background: ACCENT_LIGHT, color: ACCENT,
                            borderRadius: 4, padding: "2px 6px",
                          }}>{d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#888" }}>No sentiment data collected yet for this brand.</p>
          )}
        </Card>
      )}

      {/* ── Empty state ── */}
      {dailySummary.length === 0 && featureScores.length === 0 && sentimentData.rows.length === 0 && (
        <Card>
          <p style={{ fontSize: 15, color: "#666", textAlign: "center", margin: "20px 0" }}>
            No data collected yet. Check back after the first pipeline run.
          </p>
        </Card>
      )}

    </div>
  );
}
