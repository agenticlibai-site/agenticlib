"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import type {
  DexifyTopBrandRow,
  DexifyClusterRow,
  DexifyModelRow,
  DexifyTrendRow,
} from "@/lib/brand-visibility/db";
import { DEXIFY_FEATURES } from "@/lib/brand-visibility/dexify-features";

// ── Palette ────────────────────────────────────────────────────────────────────
const ACCENT  = "#EA580C";
const CLAUDE  = "#7C3AED";
const GPT     = "#2563EB";

const LINE_COLORS = [
  "#EA580C", "#7C3AED", "#2563EB", "#059669", "#DC2626",
  "#D97706", "#0891B2", "#C026D3", "#0D9488", "#BE185D",
  "#65A30D", "#0369A1", "#F43F5E", "#FB923C", "#818CF8",
];

function lineColor(i: number) { return LINE_COLORS[i % LINE_COLORS.length]; }

// ── Cluster config ─────────────────────────────────────────────────────────────
const CLUSTERS: { tag: string; label: string; description: string }[] = [
  { tag: "dexify-voice-quote",  label: "Voice-to-Quote Agent",             description: "Voice → branded PDF quote on site" },
  { tag: "dexify-post-job",     label: "Post-Job Admin & Invoicing Agent", description: "Job done → invoice sent automatically" },
  { tag: "dexify-compliance",   label: "Compliance & Documentation Agent", description: "SWMS and safety docs from voice" },
  { tag: "dexify-client-comms", label: "Inbound & Client Communication",   description: "AI receptionist and quote follow-up" },
];

// All clusters including general (used for feature scores section)
const ALL_CLUSTERS: { tag: string; label: string }[] = [
  { tag: "dexify-general",      label: "General Discovery" },
  { tag: "dexify-voice-quote",  label: "Voice-to-Quote Agent" },
  { tag: "dexify-post-job",     label: "Post-Job Admin & Invoicing" },
  { tag: "dexify-compliance",   label: "Compliance & Documentation" },
  { tag: "dexify-client-comms", label: "Inbound & Client Communication" },
];

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      height: 160, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 8, color: "rgba(0,0,0,0.3)",
      border: "1.5px dashed rgba(234,88,12,0.18)", borderRadius: 10,
    }}>
      <span style={{ fontSize: 28 }}>⏳</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12 }}>First data arrives after 6:45 AM UTC</span>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "1px solid rgba(0,0,0,0.07)",
      padding: "24px 28px", marginBottom: 20,
    }}>
      <div style={{ marginBottom: subtitle ? 4 : 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#000", margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", margin: "4px 0 18px" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Feature score types ────────────────────────────────────────────────────────
interface FeatureScoreRow {
  brand_name:         string;
  feature_id:         string;
  feature_tag:        string;
  score:              number;
  score_band:         string;
  flagged_for_review: boolean;
  evidence:           string | null;
}

const BAND_COLOR: Record<string, string> = {
  high:            "#16a34a",
  medium:          "#d97706",
  low:             "#dc2626",
  not_documented:  "rgba(0,0,0,0.18)",
};

function ScorePill({ band, score }: { band: string; score: number | null }) {
  const color = BAND_COLOR[band] ?? "rgba(0,0,0,0.18)";
  return (
    <span style={{
      display: "inline-block", minWidth: 36, textAlign: "center",
      padding: "2px 8px", borderRadius: 4, fontSize: 13, fontWeight: 700,
      color: band === "not_documented" ? "rgba(0,0,0,0.35)" : "#fff",
      background: color,
    }}>
      {score !== null ? score : "–"}
    </span>
  );
}

// ── Sentiment types ────────────────────────────────────────────────────────────
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

const SENTIMENT_CLUSTERS: { tag: string; label: string }[] = [
  { tag: "overall",      label: "Overall" },
  { tag: "voice-quote",  label: "Voice-to-Quote" },
  { tag: "post-job",     label: "Post-Job Admin" },
  { tag: "compliance",   label: "Compliance & Documentation" },
  { tag: "client-comms", label: "Inbound & Client Comms" },
];

const SENTIMENT_GATE = 1;

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  topBrands:     DexifyTopBrandRow[];
  byCluster:     DexifyClusterRow[];
  byModel:       DexifyModelRow[];
  trend:         DexifyTrendRow[];
  featureScores: FeatureScoreRow[];
  sentimentData: SentimentData;
}

export default function DexifyVisibilityCharts({ topBrands, byCluster, byModel, trend, featureScores, sentimentData }: Props) {

  // ── Overall top brands (horizontal bar) ─────────────────────────────────────
  const top20 = topBrands.slice(0, 20);
  const overallData = [...top20]
    .sort((a, b) => a.total_mentions - b.total_mentions)
    .map((r) => ({ brand: r.brand, mentions: r.total_mentions }));

  // ── Trend: pivot to recharts format, top 8 brands ────────────────────────────
  const top8brands = topBrands.slice(0, 15).map((r) => r.brand);
  const trendByDate: Record<string, Record<string, number | string>> = {};
  for (const r of trend) {
    if (!top8brands.includes(r.brand)) continue;
    if (!trendByDate[r.date]) trendByDate[r.date] = { date: r.date };
    trendByDate[r.date][r.brand] = r.mention_count;
  }
  const trendData = Object.values(trendByDate).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  // ── LLM split: top 12 brands, side-by-side claude vs gpt ─────────────────────
  const top12 = topBrands.slice(0, 15).map((r) => r.brand);
  const modelMap: Record<string, { claude: number; gpt: number }> = {};
  for (const r of byModel) {
    if (!top12.includes(r.brand)) continue;
    if (!modelMap[r.brand]) modelMap[r.brand] = { claude: 0, gpt: 0 };
    if (r.model.includes("claude")) modelMap[r.brand].claude += r.total_mentions;
    else modelMap[r.brand].gpt += r.total_mentions;
  }
  const modelData = top12
    .map((brand) => ({ brand, claude: modelMap[brand]?.claude ?? 0, gpt: modelMap[brand]?.gpt ?? 0 }))
    .sort((a, b) => (b.claude + b.gpt) - (a.claude + a.gpt));

  // ── Cluster charts: top 10 brands per cluster ────────────────────────────────
  const clusterMap: Record<string, { brand: string; mentions: number }[]> = {};
  for (const r of byCluster) {
    if (!clusterMap[r.cluster_tag]) clusterMap[r.cluster_tag] = [];
    clusterMap[r.cluster_tag].push({ brand: r.brand, mentions: r.total_mentions });
  }
  for (const tag of Object.keys(clusterMap)) {
    clusterMap[tag] = clusterMap[tag]
      .sort((a, b) => a.mentions - b.mentions)
      .slice(-10);
  }

  const hasData = topBrands.length > 0;

  return (
    <div>

      {/* ── Overall brand mentions ─────────────────────────────────────────── */}
      <Section
        title="Top Brands by Total Mentions"
        subtitle="All clusters combined · both models · all days collected so far"
      >
        {!hasData ? (
          <EmptyState label="No data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(260, top20.length * 26)}>
            <BarChart data={overallData} layout="vertical" margin={{ left: 0, right: 40, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#000" }} />
              <YAxis
                type="category" dataKey="brand" width={130}
                tick={{ fontSize: 12, fill: "#000" }} tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(234,88,12,0.06)" }}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
                formatter={(v: unknown) => [v as number, "mentions"]}
              />
              <Bar dataKey="mentions" fill={ACCENT} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ── Coverage over time ────────────────────────────────────────────── */}
      <Section
        title="Coverage Over Time"
        subtitle="Daily mention totals for the top 15 brands"
      >
        {trendData.length === 0 ? (
          <EmptyState label="Trend builds after day 2" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#000" }} />
              <YAxis tick={{ fontSize: 11, fill: "#000" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {top8brands.map((brand, i) => (
                <Line
                  key={brand} type="monotone" dataKey={brand}
                  stroke={lineColor(i)} strokeWidth={2}
                  dot={false} connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ── LLM model split ────────────────────────────────────────────────── */}
      <Section
        title="Visibility by LLM"
        subtitle="Claude Haiku vs GPT-4o-mini — top 15 brands"
      >
        {modelData.length === 0 ? (
          <EmptyState label="No data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelData} margin={{ left: 0, right: 16, top: 8, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="brand" tick={{ fontSize: 11, fill: "#000" }}
                interval={0} angle={-35} textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: "#000" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
                formatter={(v: unknown, name: unknown) => [v as number, name === "claude" ? "Claude Haiku" : "GPT-4o-mini"]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(v) => v === "claude" ? "Claude Haiku" : "GPT-4o-mini"}
              />
              <Bar dataKey="claude" name="claude" fill={CLAUDE} radius={[3, 3, 0, 0]} />
              <Bar dataKey="gpt"    name="gpt"    fill={GPT}    radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ── Use case cluster split ────────────────────────────────────────── */}
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Use Case Split
        </h2>
        <p style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>
          Which brands appear when LLMs are asked about each specific tradie AI agent use case
        </p>
      </div>

      {CLUSTERS.map((cluster) => {
        const data = clusterMap[cluster.tag] ?? [];
        return (
          <div key={cluster.tag} style={{
            background: "#fff", borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.07)",
            padding: "20px 28px", marginBottom: 16,
          }}>
            <div style={{ marginBottom: 4 }}>
              <div style={{ marginBottom: 2 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>
                  {cluster.label}
                </h3>
              </div>
              <p style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", margin: "0 0 14px" }}>
                {cluster.description}
              </p>
            </div>
            {data.length === 0 ? (
              <EmptyState label="No data yet for this cluster" />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(160, data.length * 28)}>
                <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40, top: 2, bottom: 2 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#000" }} />
                  <YAxis
                    type="category" dataKey="brand" width={130}
                    tick={{ fontSize: 12, fill: "#000" }} tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(234,88,12,0.06)" }}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
                    formatter={(v: unknown) => [v as number, "mentions"]}
                  />
                  <Bar dataKey="mentions" fill={ACCENT} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        );
      })}

      {/* ── Product Feature Scores ─────────────────────────────────────────── */}
      <div style={{ marginTop: 32, marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Product Feature Scores
        </h2>
        <p style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", margin: "0 0 16px" }}>
          How well each brand supports the core capabilities Dexify is built for — scored per use case cluster by Claude and GPT-4o-mini
        </p>
      </div>

      {featureScores.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.07)",
          padding: "28px", marginBottom: 16,
        }}>
          <EmptyState label="Feature scores arrive after the first 7:45 AM UTC aggregate run" />
        </div>
      ) : (
        ALL_CLUSTERS.map((cluster) => {
          const clusterFeatures = DEXIFY_FEATURES.filter((f) => f.feature_tag === cluster.tag);
          const clusterScores   = featureScores.filter((s) => s.feature_tag === cluster.tag);
          if (clusterFeatures.length === 0 || clusterScores.length === 0) return null;

          return (
            <div key={cluster.tag} style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "28px", marginBottom: 20,
            }}>
              {/* Cluster heading */}
              <p style={{
                fontFamily: "var(--font-space-mono, monospace)",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                color: "#2563EB", margin: "0 0 24px",
              }}>
                {cluster.label}
              </p>

              <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>
                {clusterFeatures.map((feature, fi) => {
                  const featureRows = clusterScores
                    .filter((s) => s.feature_id === feature.feature_id)
                    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
                  if (featureRows.length === 0) return null;

                  return (
                    <div key={feature.feature_id}>
                      {/* Feature name + definition */}
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
                        {feature.feature_name}
                      </p>
                      <p style={{ fontSize: 13, color: "#2563EB", margin: "0 0 18px", lineHeight: 1.5 }}>
                        {feature.description}
                      </p>

                      {/* Brand rows */}
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                        {featureRows.map((row) => {
                          const score   = row.score ?? 0;
                          const barColor = row.score_band === "high" ? "#16a34a"
                            : row.score_band === "medium" ? "#d97706"
                            : "#dc2626";
                          const cleanEvidence = row.evidence
                            ? row.evidence.replace(/<cite[^>]*>|<\/cite>/g, "").trim()
                            : null;

                          return (
                            <div key={row.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: cleanEvidence ? 6 : 0 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#000", width: 140, flexShrink: 0 }}>
                                  {row.brand_name}
                                </span>
                                <div style={{
                                  flex: 1, height: 10, borderRadius: 999,
                                  background: "rgba(0,0,0,0.06)", overflow: "hidden",
                                }}>
                                  <div style={{
                                    width: `${score}%`, height: "100%",
                                    background: barColor, borderRadius: 999,
                                    transition: "width 0.4s ease",
                                  }} />
                                </div>
                                <span style={{
                                  fontSize: 14, fontWeight: 700, color: barColor,
                                  width: 32, textAlign: "right" as const, flexShrink: 0,
                                  fontVariantNumeric: "tabular-nums",
                                }}>
                                  {score}
                                </span>
                              </div>
                              {cleanEvidence && (
                                <p style={{
                                  fontSize: 12, color: "rgba(0,0,0,0.5)", lineHeight: 1.65,
                                  margin: 0, paddingLeft: 152,
                                }}>
                                  {cleanEvidence}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {fi < clusterFeatures.length - 1 && (
                        <div style={{ marginTop: 28, borderTop: "1px solid rgba(0,0,0,0.06)" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* ── Sentiment Analysis ────────────────────────────────────────────── */}
      {(() => {
        const { rows: sentimentRows, meta: sentimentMeta } = sentimentData;
        const daysHave = sentimentMeta.dual_model_dates ?? 0;
        const ready    = daysHave >= SENTIMENT_GATE;

        // Build global descriptor frequency to highlight unique descriptors
        const globalDescFreq = new Map<string, number>();
        for (const row of sentimentRows) {
          for (const d of (row.top_descriptors ?? [])) {
            globalDescFreq.set(d, (globalDescFreq.get(d) ?? 0) + 1);
          }
        }

        function sentimentDateLabel() {
          const e = sentimentMeta.earliest_date;
          const l = sentimentMeta.latest_date;
          if (!e || !l) return "";
          const fmt = (d: string) =>
            new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", { month: "short", day: "numeric", timeZone: "UTC" });
          return e === l ? fmt(e) : `${fmt(e)} – ${fmt(l)}`;
        }

        return (
          <div style={{ marginTop: 32, marginBottom: 4 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
                Sentiment Analysis
                {!ready && (
                  <span style={{
                    marginLeft: 10, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase" as const, color: "#EA580C",
                    background: "rgba(234,88,12,0.10)", borderRadius: 999, padding: "3px 9px",
                    verticalAlign: "middle",
                  }}>
                    Collecting
                  </span>
                )}
              </h2>
              <p style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", margin: 0 }}>
                How LLMs perceive each brand across Dexify&apos;s five tradie use case clusters — updated daily
              </p>
            </div>

            <div style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "24px 28px", marginBottom: 20,
            }}>
              {!ready ? (
                <div style={{ textAlign: "center" as const, padding: "16px 0" }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#000", marginBottom: 8 }}>
                    Collecting data: {daysHave} of {SENTIMENT_GATE} minimum days
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", maxWidth: 400, margin: "0 auto" }}>
                    Sentiment bars appear once both Claude Haiku and GPT-4o-mini have collected on {SENTIMENT_GATE} separate days.
                    {daysHave > 0 && ` Check back in ${SENTIMENT_GATE - daysHave} day${SENTIMENT_GATE - daysHave !== 1 ? "s" : ""}.`}
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", marginBottom: 24 }}>
                    How Claude Haiku and GPT-4o-mini describe each brand · {sentimentDateLabel()}
                  </p>

                  {SENTIMENT_CLUSTERS.map((cluster) => {
                    const brands = sentimentRows
                      .filter((r) => r.bucket_tag === cluster.tag)
                      .sort((a, b) => b.positive_count - a.positive_count);
                    if (brands.length === 0) return null;

                    return (
                      <div key={cluster.tag} style={{ marginBottom: 28 }}>
                        <p style={{
                          fontSize: 12, fontWeight: 700, letterSpacing: "0.07em",
                          textTransform: "uppercase" as const, color: ACCENT, marginBottom: 14,
                        }}>
                          {cluster.label}
                        </p>
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
                          {brands.map((brand) => {
                            const total  = brand.total_count || 1;
                            const posPct = Math.round((brand.positive_count / total) * 100);
                            const neuPct = Math.round((brand.neutral_count  / total) * 100);
                            const negPct = 100 - posPct - neuPct;
                            const descriptors = [...new Set(brand.top_descriptors ?? [])].slice(0, 4);
                            return (
                              <div key={brand.brand_name}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                  <span style={{
                                    fontSize: 13, fontWeight: 600, color: "#000",
                                    width: 148, flexShrink: 0, lineHeight: 1.25,
                                  }}>
                                    {brand.brand_name}
                                  </span>
                                  <div style={{
                                    flex: 1, height: 8, borderRadius: 999,
                                    background: "rgba(0,0,0,0.06)", overflow: "hidden", display: "flex",
                                  }}>
                                    {posPct > 0 && <div style={{ width: `${posPct}%`, height: "100%", background: "#16a34a" }} />}
                                    {neuPct > 0 && <div style={{ width: `${neuPct}%`, height: "100%", background: "#d97706" }} />}
                                    {negPct > 0 && <div style={{ width: `${negPct}%`, height: "100%", background: "#dc2626" }} />}
                                  </div>
                                  <span style={{
                                    fontSize: 13, fontWeight: 700, color: "#16a34a",
                                    width: 34, textAlign: "right" as const, flexShrink: 0,
                                    fontVariantNumeric: "tabular-nums",
                                  }}>
                                    {posPct}%
                                  </span>
                                </div>
                                {descriptors.length > 0 && (
                                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, paddingLeft: 158 }}>
                                    {descriptors.map((d, i) => {
                                      const unique = (globalDescFreq.get(d) ?? 0) === 1;
                                      return (
                                        <span key={i} style={{
                                          fontSize: 12,
                                          color: unique ? "#2563eb" : "#000",
                                          background: unique ? "rgba(37,99,235,0.08)" : "rgba(0,0,0,0.04)",
                                          border: `1px solid ${unique ? "rgba(37,99,235,0.25)" : "rgba(0,0,0,0.08)"}`,
                                          borderRadius: 4, padding: "2px 7px", fontWeight: unique ? 600 : 400,
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
                  })}

                  <div style={{ display: "flex", gap: 16, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 4, flexWrap: "wrap" as const }}>
                    {[["#16a34a", "Positive"], ["#d97706", "Neutral"], ["#dc2626", "Negative"]].map(([color, label]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#000" }}>{label}</span>
                      </div>
                    ))}
                    <span style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", marginLeft: "auto" }}>
                      Both models · updates daily
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

    </div>
  );
}
