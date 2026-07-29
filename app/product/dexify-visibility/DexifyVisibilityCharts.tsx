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
  { tag: "dexify-general",      label: "General Discovery",                description: "Broad AI agent for tradespeople queries" },
  { tag: "dexify-voice-quote",  label: "Voice-to-Quote Agent",             description: "Voice → branded PDF quote on site" },
  { tag: "dexify-post-job",     label: "Post-Job Admin & Invoicing Agent", description: "Job done → invoice sent automatically" },
  { tag: "dexify-compliance",   label: "Compliance & Documentation Agent", description: "SWMS and safety docs from voice" },
  { tag: "dexify-client-comms", label: "Inbound & Client Communication",   description: "AI receptionist and quote follow-up" },
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

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  topBrands:     DexifyTopBrandRow[];
  byCluster:     DexifyClusterRow[];
  byModel:       DexifyModelRow[];
  trend:         DexifyTrendRow[];
  featureScores: FeatureScoreRow[];
}

export default function DexifyVisibilityCharts({ topBrands, byCluster, byModel, trend, featureScores }: Props) {

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
        CLUSTERS.map((cluster) => {
          const clusterFeatures = DEXIFY_FEATURES.filter((f) => f.feature_tag === cluster.tag);
          const clusterScores   = featureScores.filter((s) => s.feature_tag === cluster.tag);

          if (clusterScores.length === 0) return null;

          const brandsInCluster = [...new Set(clusterScores.map((s) => s.brand_name))];
          const scoreMap = new Map(clusterScores.map((s) => [`${s.brand_name}::${s.feature_id}`, s]));

          return (
            <div key={cluster.tag} style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "20px 28px", marginBottom: 16,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>
                {cluster.label}
              </h3>
              <p style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", margin: "0 0 16px" }}>
                {cluster.description}
              </p>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "6px 12px 6px 0", fontWeight: 700, color: "#000", borderBottom: "2px solid rgba(0,0,0,0.08)", whiteSpace: "nowrap" }}>
                        Brand
                      </th>
                      {clusterFeatures.map((f) => (
                        <th key={f.feature_id} style={{ textAlign: "center", padding: "6px 12px", fontWeight: 700, color: "#000", borderBottom: "2px solid rgba(0,0,0,0.08)", whiteSpace: "nowrap", fontSize: 12 }}>
                          {f.feature_name.split(" ").slice(0, 4).join(" ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {brandsInCluster.map((brand, i) => (
                      <tr key={brand} style={{ background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.018)" }}>
                        <td style={{ padding: "8px 12px 8px 0", fontWeight: 600, color: "#000", whiteSpace: "nowrap" }}>
                          {brand}
                        </td>
                        {clusterFeatures.map((f) => {
                          const s = scoreMap.get(`${brand}::${f.feature_id}`);
                          return (
                            <td key={f.feature_id} style={{ padding: "8px 12px", textAlign: "center" }}>
                              {s ? (
                                <div title={s.evidence ?? undefined}>
                                  <ScorePill band={s.score_band} score={s.score} />
                                </div>
                              ) : (
                                <span style={{ color: "rgba(0,0,0,0.2)", fontSize: 13 }}>–</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" as const }}>
                {[["#16a34a", "High (80–100)"], ["#d97706", "Medium (40–79)"], ["#dc2626", "Low (0–39)"], ["rgba(0,0,0,0.18)", "Not documented"]].map(([color, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: color }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

    </div>
  );
}
