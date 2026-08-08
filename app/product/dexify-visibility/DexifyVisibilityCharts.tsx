"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
  PieChart, Pie, Cell,
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

// ── Pie slice label — percentage on the ring ──────────────────────────────────
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
      style={{ fontSize: 11, fontWeight: 700, pointerEvents: "none" }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

// ── Trend tooltip — sorted highest to lowest ───────────────────────────────────
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
      <p style={{ fontWeight: 700, marginBottom: 4, color: "#000" }}>{label}</p>
      {sorted.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, padding: "1px 0" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0, display: "inline-block" }} />
          <span style={{ color: "#000" }}>{p.dataKey} : {p.value}</span>
        </div>
      ))}
    </div>
  );
}

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
  { tag: "dexify-security",     label: "Security & Data" },
  { tag: "dexify-pricing",      label: "Pricing & Access" },
];

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      height: 160, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 8, color: "#000",
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
        {subtitle && <p style={{ fontSize: 13, color: "#000", margin: "4px 0 18px" }}>{subtitle}</p>}
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
  score:              number | null;
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

  // ── Global brand→color map (consistent across all charts) ────────────────────
  // Assign colors in total-mentions order so the highest-visibility brand always
  // gets the same colour regardless of which cluster chart it appears in.
  const brandColorMap: Record<string, string> = {};
  [...topBrands]
    .sort((a, b) => b.total_mentions - a.total_mentions)
    .forEach((r, i) => { brandColorMap[r.brand] = LINE_COLORS[i % LINE_COLORS.length]; });
  const brandColor = (brand: string) => brandColorMap[brand] ?? "#94a3b8";

  // ── Overall top brands (horizontal bar) ─────────────────────────────────────
  const top20 = topBrands.slice(0, 20);
  const overallData = [...top20]
    .sort((a, b) => b.total_mentions - a.total_mentions)
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
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 10);
  }

  const hasData = topBrands.length > 0;

  return (
    <div>

      {/* ── Key Finding callout ───────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(234,88,12,0.06)",
        border: "1px solid rgba(234,88,12,0.25)",
        borderLeft: "4px solid #EA580C",
        borderRadius: "0 10px 10px 0",
        padding: "18px 22px",
        marginBottom: 24,
      }}>
        <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#EA580C", margin: "0 0 8px" }}>
          Key Finding
        </p>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>
          Despite prompts explicitly restricted to named AI agents for tradespeople, LLMs consistently default to job management tools, CRMs, and construction software, rather than AI agents in <strong>Top Brands by Total Mentions</strong>, <strong>Coverage Over Time</strong>, and <strong>Use Case Share of Voice</strong> sections. Brands like Procore, BambooHR, and CoConstruct appear here not because they are tradie AI agents, but because they are what AI assistants currently recall when asked. This is the core visibility gap Dexify (and every other AI-native tradie tool) is currently up against: even genuinely capable AI agents (see Product Feature Scores below) are largely invisible to LLMs today.
        </p>
        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: 0 }}>
          <strong>Product Feature Scores</strong> below only scores real, purpose-built AI agents for tradies, not the generic platforms that dominate the LLM visibility rankings above.
        </p>
      </div>

      {/* ── Overall brand mentions ─────────────────────────────────────────── */}
      <Section
        title="Top Brands by Total Mentions"
        subtitle="All clusters combined · both models"
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
              <Tooltip content={<TrendTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {top8brands.map((brand) => (
                <Line
                  key={brand} type="monotone" dataKey={brand}
                  stroke={brandColor(brand)} strokeWidth={2}
                  dot={false} connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Section>


      {/* ── Use case cluster split ────────────────────────────────────────── */}
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Use Case Share of Voice
        </h2>
        <p style={{ fontSize: 13, color: "#000", margin: "0 0 16px" }}>
          Which brands appear when LLMs are asked about each specific tradie AI agent use case
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {CLUSTERS.map((cluster) => {
          const data = clusterMap[cluster.tag] ?? [];
          const total = data.reduce((s, r) => s + r.mentions, 0);
          return (
            <div key={cluster.tag} style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "20px 24px",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#000", margin: "0 0 2px" }}>
                {cluster.label}
              </h3>
              <p style={{ fontSize: 12, color: "#000", margin: "0 0 16px" }}>
                {cluster.description}
              </p>
              {data.length === 0 ? (
                <EmptyState label="No data yet for this cluster" />
              ) : (
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ flexShrink: 0 }}>
                    <PieChart width={150} height={150}>
                      <Pie
                        data={data} dataKey="mentions"
                        cx={70} cy={70}
                        innerRadius={38} outerRadius={65}
                        paddingAngle={2}
                        labelLine={false}
                        label={(props) => <PieSliceLabel {...props} />}
                      >
                        {data.map((r) => (
                          <Cell key={r.brand} fill={brandColor(r.brand)} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }}
                        formatter={(v: unknown, _n: unknown, props: { payload?: { brand?: string } }) => [
                          `${v} (${total > 0 ? Math.round(((v as number) / total) * 100) : 0}%)`,
                          props.payload?.brand ?? "",
                        ]}
                      />
                    </PieChart>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                    {data.map((r) => (
                      <div key={r.brand} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: brandColor(r.brand) }} />
                        <span style={{ fontSize: 13, color: "#000", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.brand}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#000", flexShrink: 0 }}>
                          {total > 0 ? Math.round((r.mentions / total) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Product Feature Scores ─────────────────────────────────────────── */}
      <div style={{ marginTop: 32, marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Product Feature Scores
        </h2>
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
                fontSize: 15, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                color: "#2563EB", margin: "0 0 24px",
              }}>
                {cluster.label}
              </p>

              <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>
                {clusterFeatures.map((feature, fi) => {
                  const featureRows = clusterScores
                    .filter((s) => s.feature_id === feature.feature_id)
                    .sort((a, b) => {
                      // not_documented rows sink to the bottom
                      const aNd = a.score_band === "not_documented" ? 1 : 0;
                      const bNd = b.score_band === "not_documented" ? 1 : 0;
                      if (aNd !== bNd) return aNd - bNd;
                      return (b.score ?? 0) - (a.score ?? 0);
                    });
                  if (featureRows.length === 0) return null;

                  return (
                    <div key={feature.feature_id}>
                      {/* Feature name + definition */}
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
                        <span style={{ color: "#2563EB" }}>Product Feature {fi + 1}: </span>{feature.feature_name}
                      </p>
                      <p style={{ fontSize: 13, color: "#2563EB", margin: "0 0 18px", lineHeight: 1.5 }}>
                        {feature.description}
                      </p>

                      {/* Brand rows */}
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                        {featureRows.map((row) => {
                          const isNd    = row.score_band === "not_documented";
                          const score   = row.score ?? 0;
                          const barColor = row.score_band === "high"   ? "#16a34a"
                            : row.score_band === "medium" ? "#d97706"
                            : row.score_band === "low"    ? "#dc2626"
                            : "rgba(0,0,0,0.18)";
                          const cleanEvidence = row.evidence
                            ? row.evidence.replace(/<cite[^>]*>|<\/cite>/g, "").trim()
                            : null;

                          if (isNd) {
                            return (
                              <div key={row.brand_name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#000", width: 140, flexShrink: 0 }}>
                                  {row.brand_name}
                                </span>
                                <span style={{ fontSize: 12, color: "#000", fontStyle: "italic" }}>
                                  not documented
                                </span>
                              </div>
                            );
                          }

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
                                  fontSize: 12, color: "#000", lineHeight: 1.65,
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
        const ready = (sentimentMeta.dual_model_dates ?? 0) >= SENTIMENT_GATE;

        const overallBrands = sentimentRows
          .filter((r) => r.bucket_tag === "overall")
          // Wired suppressed: pipeline grounded search returned false negative ("does not exist").
          // Product is verified real at wired-trades.com — $80/mo, full integration list documented.
          // Re-run sentiment for Wired when credits allow; feature score of 95 is correct.
          .filter((r) => r.brand_name !== "Wired")
          .sort((a, b) => b.positive_count - a.positive_count);

        const globalDescFreq = new Map<string, number>();
        for (const row of overallBrands) {
          for (const d of (row.top_descriptors ?? [])) {
            globalDescFreq.set(d, (globalDescFreq.get(d) ?? 0) + 1);
          }
        }

        const e = sentimentMeta.earliest_date;
        const l = sentimentMeta.latest_date;
        const fmt = (d: string) =>
          new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", { month: "short", day: "numeric", timeZone: "UTC" });
        const dateLabel = e && l ? (e === l ? fmt(e) : `${fmt(e)} – ${fmt(l)}`) : "";

        return (
          <div style={{ marginTop: 32, marginBottom: 4 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
                Sentiment Analysis
              </h2>
              <p style={{ fontSize: 13, color: "#000", margin: 0 }}>
                How Claude Haiku and GPT-4o-mini describe each brand overall{dateLabel ? ` · ${dateLabel}` : ""}
              </p>
            </div>

            <div style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "24px 28px", marginBottom: 20,
            }}>
              {!ready || overallBrands.length === 0 ? (
                <EmptyState label="Collecting sentiment data" />
              ) : (
                <div>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                    {overallBrands.map((brand) => {
                      const total  = brand.total_count || 1;
                      const posPct = Math.round((brand.positive_count / total) * 100);
                      const neuPct = Math.round((brand.neutral_count  / total) * 100);
                      const negPct = 100 - posPct - neuPct;
                      const descriptors = [...new Set(brand.top_descriptors ?? [])].slice(0, 5);
                      return (
                        <div key={brand.brand_name}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: descriptors.length > 0 ? 6 : 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#000", width: 140, flexShrink: 0 }}>
                              {brand.brand_name}
                            </span>
                            <div style={{
                              flex: 1, height: 10, borderRadius: 999,
                              background: "rgba(0,0,0,0.06)", overflow: "hidden", display: "flex",
                            }}>
                              {posPct > 0 && <div style={{ width: `${posPct}%`, height: "100%", background: "#16a34a" }} />}
                              {neuPct > 0 && <div style={{ width: `${neuPct}%`, height: "100%", background: "#d97706" }} />}
                              {negPct > 0 && <div style={{ width: `${negPct}%`, height: "100%", background: "#dc2626" }} />}
                            </div>
                            <span style={{
                              fontSize: 14, fontWeight: 700, color: "#16a34a",
                              width: 36, textAlign: "right" as const, flexShrink: 0,
                              fontVariantNumeric: "tabular-nums",
                            }}>
                              {posPct}%
                            </span>
                          </div>
                          {descriptors.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, paddingLeft: 152 }}>
                              {descriptors.map((d, i) => {
                                const unique = (globalDescFreq.get(d) ?? 0) === 1;
                                return (
                                  <span key={i} style={{
                                    fontSize: 12,
                                    color: unique ? "#2563eb" : "rgba(0,0,0,0.55)",
                                    background: unique ? "rgba(37,99,235,0.07)" : "rgba(0,0,0,0.04)",
                                    border: `1px solid ${unique ? "rgba(37,99,235,0.2)" : "rgba(0,0,0,0.07)"}`,
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

                  <div style={{ display: "flex", gap: 16, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 20, flexWrap: "wrap" as const }}>
                    {[["#16a34a", "Positive"], ["#d97706", "Neutral"], ["#dc2626", "Negative"]].map(([color, label]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#000" }}>{label}</span>
                      </div>
                    ))}
                    <span style={{ fontSize: 12, color: "#000", marginLeft: "auto" }}>
                      Both models · updates weekly
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Product Feature Improvement Opportunities ───────────────────────── */}
      <div style={{ marginTop: 40, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          Product Feature Improvement Opportunities
        </h2>
        <p style={{ fontSize: 13, color: "#000", margin: "0 0 20px" }}>
          Gaps identified from locked-brand AI agent competitors and tradie customer feedback across use case clusters
        </p>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>

          {/* Opportunity 1 */}
          <div style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #2563EB",
            borderRadius: "0 12px 12px 0",
            padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>
                1. SWMS Auto-generation from Voice: Speak the Job, Get the Compliance Doc Too
              </p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#2563EB",
                background: "rgba(37,99,235,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>AU differentiator</span>
            </div>
            <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 12px" }}>
              Australian tradies are legally required to produce a Safe Work Method Statement before starting any high-risk construction work, and most write it manually or skip it entirely. Dexify already captures the full job description by voice on-site. Generating the SWMS automatically from that same input, alongside the quote, would close a mandatory compliance step with zero extra effort from the tradie. No other pure AI agent in the locked brand set does this well. It extends Dexify&apos;s voice-first, on-site paradigm into a workflow that is AU-specific, legally required, and completely underserved.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>Partial coverage in competitors:</span>
              {["simPRO"].map((b) => (
                <span key={b} style={{
                  fontSize: 12, color: "#000",
                  background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 8px",
                }}>{b}</span>
              ))}
              <span style={{ fontSize: 12, color: "#000", marginLeft: 4 }}>(no AI-native agent has cracked this)</span>
            </div>
          </div>

          {/* Opportunity 2 */}
          <div style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #16a34a",
            borderRadius: "0 12px 12px 0",
            padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>
                2. Quote Follow-up Automation and Read Tracking
              </p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#16a34a",
                background: "rgba(22,163,74,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>Deepens core</span>
            </div>
            <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 12px" }}>
              Sending a quote on the spot is only half the job. Tradies consistently lose work not because their quote is wrong but because they forget to follow up while juggling active jobs. The agent should automatically send a follow-up message to the client after 48 hours if no response is received, and notify the tradie the moment the client opens the quote. This transforms a send-and-forget workflow into a closed-loop sales process, within the same Voice-to-Quote cluster where Dexify already has an advantage.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>Competitors doing this:</span>
              {["Sammy AI", "Sophiie AI"].map((b) => (
                <span key={b} style={{
                  fontSize: 12, color: "#000",
                  background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 8px",
                }}>{b}</span>
              ))}
            </div>
          </div>

          {/* Opportunity 3 */}
          <div style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderLeft: "4px solid #d97706",
            borderRadius: "0 12px 12px 0",
            padding: "18px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: 0 }}>
                3. Native Integrations with Xero, ServiceM8, Fergus, and Tradify
              </p>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, color: "#d97706",
                background: "rgba(217,119,6,0.08)", borderRadius: 4, padding: "3px 8px",
              }}>Adoption lever</span>
            </div>
            <p style={{ fontSize: 14, color: "#000", lineHeight: 1.65, margin: "0 0 12px" }}>
              Most tradies already run some combination of Xero, ServiceM8, Fergus, or Tradify. The biggest barrier to adopting a new AI tool is not the AI itself: it is the switching cost and the fear of running two systems. Dexify integrated as the AI layer on top of the tools tradies already use (pushing quotes and invoices directly into Xero, pulling existing job cards from ServiceM8) would dramatically lower friction across every use case cluster rather than requiring the tradie to replace their existing stack entirely.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>Competitors doing this:</span>
              {["Wired", "Square AI", "simPRO"].map((b) => (
                <span key={b} style={{
                  fontSize: 12, color: "#000",
                  background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "2px 8px",
                }}>{b}</span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── LLM Visibility Playbook ──────────────────────────────────────────── */}
      <div style={{ marginTop: 40, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
          LLM Visibility Playbook
        </h2>
        <p style={{ fontSize: 13, color: "#000", margin: "0 0 20px" }}>
          The moves that turn LLM invisibility into first-mover advantage, ranked by expected lift
        </p>

        {/* White-space callout */}
        <div style={{
          background: "linear-gradient(135deg, #f8f4ff 0%, #f0f7ff 100%)",
          border: "1px solid rgba(99,102,241,0.15)",
          borderLeft: "3px solid #6366f1",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#1e1b4b", margin: 0 }}>
            <strong>Unlike sales AI, no tradie AI-agent brand has cracked LLM visibility yet.</strong> Every discovery prompt currently defaults to non-AI incumbents like Jobber and QuickBooks. That&apos;s not a competitive gap you need to close, it&apos;s white space nobody&apos;s claimed. In adjacent AI-agent categories, the two tactics that reliably work are narrow, named-competitor comparison content (6sense&apos;s model) and content volume paired with direct confrontation (Highspot&apos;s model). Dexify has the chance to be the first tradie AI-agent brand to apply either.
          </p>
        </div>

        {/* Two proven models */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" as const }}>
          {([
            {
              label: "Model A: 6sense (Sales AI Agent)",
              title: "Named-competitor comparison pages",
              priority: "Highest impact",
              priorityColor: "#16a34a",
              body: "Publish a dedicated 'Dexify vs [Competitor]' page for every incumbent: Jobber, ServiceM8, Tradify, simPRO. LLMs are trained on comparison content and retrieve it directly when users ask what alternatives exist. A single well-structured comparison page is worth more training signal than dozens of generic blog posts. Each page should name the competitor in the title, URL slug, and H1, include a feature table, and end with a clear 'why Dexify' section. Four pages covers the four tools LLMs currently default to in this space.",
            },
            {
              label: "Model B: Highspot (Sales AI Agent)",
              title: "Own one query cluster with volume",
              priority: "High impact",
              priorityColor: "#16a34a",
              body: "Pick the single query cluster where Dexify has the strongest product story (voice-to-quote is the natural choice) and publish 10-15 pieces all using exactly the same phrase: 'voice-to-quote AI agent for tradies.' LLMs learn category labels through repeated co-occurrence; when every piece on a topic uses the same phrase cluster and names Dexify, the model begins associating them. One scattered blog post does nothing. Concentrated volume on one anchor phrase breaks through.",
            },
          ] as { label: string; title: string; priority: string; priorityColor: string; body: string }[]).map(({ label, title, priority, priorityColor, body }) => (
            <div key={label} style={{
              flex: "1 1 300px",
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: priorityColor, background: `${priorityColor}18`, padding: "2px 8px", borderRadius: 999 }}>{priority}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#000", margin: "0 0 8px", lineHeight: 1.3 }}>{title}</p>
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#000", margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>

        {/* Tradie-specific tactics */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {([
            {
              tag: "Tradie-specific",
              title: "Hyper-local, trade-specific landing pages",
              body: "LLMs answer location+trade queries by surfacing whatever content exists for that combination. Create pages targeting: AI agent for electricians in Sydney, voice quoting for plumbers in Melbourne, AI invoicing for builders in Brisbane. No competitor has done this. These pages train LLMs to associate Dexify with specific trades and cities, the same way Jobber captured the field service software category through geo-targeted content, but Dexify can do it faster because the niche is empty.",
            },
            {
              tag: "Tradie-specific",
              title: "Trade forum and community seeding",
              body: "LLMs are trained on Reddit, Whirlpool, and trade forums. A genuine, helpful answer to questions like 'what AI tools do tradies use?' on r/AusFinance, HIA forums, or Master Builders community threads (mentioning Dexify by name with a specific use case) generates training signal that a blog post on Dexify's own domain cannot. Third-party mentions in communities carry outsized weight because they read as unsponsored.",
            },
            {
              tag: "Overall AI visibility",
              title: "Third-party AI directory listings",
              body: "G2, Capterra, ProductHunt, and Futurepedia are the directories LLMs trust most for product discovery. Dexify needs a listing on each with 'AI agent for tradespeople' in the description, not quoting software. LLMs surface Futurepedia and G2 listings directly in responses when a product lacks wider web presence. A complete listing with reviews is a credibility shortcut that also functions as training data.",
            },
            {
              tag: "Overall AI visibility",
              title: "Publish the best tradie AI agents listicle yourself",
              body: "LLMs frequently cite best-of roundup articles when answering discovery queries. If no independent publication has written about the best AI agents for Australian tradies, Dexify should publish it, including a fair assessment of competitors. LLMs do not penalise self-authored comparison content; they index it the same as any third party. This is how Highspot, Gong, and Clari built category authority before analysts caught up: they defined the category in writing before anyone else did.",
            },
          ] as { tag: string; title: string; body: string }[]).map(({ tag, title, body }) => (
            <div key={title} style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              padding: "16px 20px",
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{tag}</span>
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#000", margin: "0 0 6px", lineHeight: 1.3 }}>{title}</p>
                <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "#000", margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
