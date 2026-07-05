"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const NAVY   = "#000000";
const BLUE   = "#2563EB";
const INDIGO = "#6B4FBB";

const LINE_COLORS = [
  "#2563EB", "#6B4FBB", "#E8447A", "#059669", "#DC2626",
  "#D97706", "#0891B2", "#C026D3", "#EA580C", "#0D9488",
  "#7C3AED", "#65A30D", "#0369A1", "#92400E", "#BE185D",
  "#F43F5E", "#84CC16", "#FB923C", "#818CF8", "#34D399",
  "#F472B6", "#38BDF8", "#A855F7", "#EF4444", "#14B8A6",
];

function lineColor(i: number) { return LINE_COLORS[i % LINE_COLORS.length]; }

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface DailyRow   { date: string; brand: string; model: string; mention_count: number; avg_position: number | null }
interface WeeklyRow  { brand: string; model: string; mention_count: number; avg_position: number | null }
interface LLMVisRow  { model: string; visibility_pct: number; total_responses: number }
interface SOVRow     { bucket_tag: string; brand: string; total_appearances: number; sov_pct: number }

interface Props {
  dailySummary:  DailyRow[];
  weeklySummary: WeeklyRow[];
  llmVisibility: LLMVisRow[];
  sovData:       SOVRow[];
}

// ── Brand classification ──────────────────────────────────────────────────────
const BRAND_TYPE: Record<string, "AI-native" | "Traditional AI"> = {
  // AI-native
  "Chorus":       "AI-native",
  "Gong":         "AI-native",
  "Clari":        "AI-native",
  "Conversica":   "AI-native",
  "Drift":        "AI-native",
  "Clay":         "AI-native",
  "Avoma":        "AI-native",
  "Backstory.ai": "AI-native",
  "6sense":       "AI-native",
  "Tact.ai":      "AI-native",
  "ExecVision":   "AI-native",
  "Nudge.ai":     "AI-native",
  "Crystal":      "AI-native",
  // Traditional AI
  "Outreach":     "Traditional AI",
  "Salesloft":    "Traditional AI",
  "Revenue.io":   "Traditional AI",
  "Apollo":       "Traditional AI",
  "ZoomInfo":     "Traditional AI",
  "Lemlist":      "Traditional AI",
  "Reply.io":     "Traditional AI",
  "Seamless.ai":  "Traditional AI",
  "Hunter":       "Traditional AI",
  "Smartlead":    "Traditional AI",
  "Mindtickle":   "Traditional AI",
  "Highspot":     "Traditional AI",
};

function TypeBadge({ brand, small }: { brand: string; small?: boolean }) {
  const type = BRAND_TYPE[brand];
  if (!type) return null;
  const isNative = type === "AI-native";
  return (
    <span style={{
      display: "inline-block",
      padding: small ? "1px 5px" : "2px 7px",
      borderRadius: 4,
      fontSize: small ? 9 : 10,
      fontWeight: 700,
      letterSpacing: "0.04em",
      textTransform: "uppercase" as const,
      background: isNative ? "rgba(37,99,235,0.10)" : "rgba(0,0,0,0.06)",
      color: isNative ? BLUE : "rgba(0,0,0,0.5)",
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
    }}>
      {isNative ? "AI-native" : "Traditional"}
    </span>
  );
}

// ── SOV clusters ──────────────────────────────────────────────────────────────
const SOV_CLUSTERS = [
  { tag: "sales-overall",   label: "Overall Sales AI" },
  { tag: "sales-call",      label: "Call Intelligence & Coaching" },
  { tag: "sales-crm",       label: "CRM Automation" },
  { tag: "sales-pipeline",  label: "Deal Risk & Pipeline" },
  { tag: "sales-outreach",  label: "AI SDR & Outreach" },
  { tag: "sales-enablement",label: "Sales Enablement" },
];

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
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.45)", marginBottom: 8 }}>
      {children}
    </p>
  );
}

function BigNumber({ value, sub }: { value: string; sub: string }) {
  return (
    <>
      <p style={{ fontSize: 36, fontWeight: 800, color: NAVY, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      <p style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>{sub}</p>
    </>
  );
}

// ── SOV donut card ────────────────────────────────────────────────────────────
function SOVCard({ cluster, rows }: { cluster: typeof SOV_CLUSTERS[number]; rows: SOVRow[] }) {
  const top = rows.slice(0, 8);
  if (top.length === 0) return null;

  const colorMap = Object.fromEntries(top.map((r, i) => [r.brand, lineColor(i)]));

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
      padding: "20px 24px",
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4, letterSpacing: "-0.01em" }}>
        {cluster.label}
      </h3>
      <p style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", marginBottom: 16 }}>Share of voice · last 7 days</p>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ flexShrink: 0 }}>
          <PieChart width={140} height={140}>
            <Pie data={top} dataKey="total_appearances" cx={65} cy={65} innerRadius={40} outerRadius={65} paddingAngle={2}>
              {top.map((r) => <Cell key={r.brand} fill={colorMap[r.brand]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid rgba(0,0,0,0.1)" }}
              formatter={(v, _n, p) => [`${(p.payload as SOVRow).sov_pct}%`, (p.payload as SOVRow).brand]}
            />
          </PieChart>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {top.slice(0, 6).map((r) => (
            <div key={r.brand} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: colorMap[r.brand] }} />
              <span style={{ fontSize: 11, color: NAVY, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.brand}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.55)", flexShrink: 0 }}>{r.sov_pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SalesVisibilityCharts({ dailySummary, weeklySummary, llmVisibility, sovData }: Props) {
  const hasReal = dailySummary.length > 0;

  // ── Build chart rows from daily summary (combine models per brand per date) ─
  const dateSet = new Set<string>();
  const brandSet = new Set<string>();
  const index: Record<string, Record<string, number>> = {};

  for (const row of dailySummary) {
    dateSet.add(row.date);
    brandSet.add(row.brand);
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
  }

  // Aggregate weekly by brand across models
  const weeklyTotals: Record<string, { mentions: number; avgPos: number | null }> = {};
  for (const row of weeklySummary) {
    const e = weeklyTotals[row.brand] ?? { mentions: 0, avgPos: null };
    weeklyTotals[row.brand] = { mentions: e.mentions + row.mention_count, avgPos: row.avg_position ?? e.avgPos };
  }

  const dates  = [...dateSet].sort();
  const brands = [...brandSet].sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0)).slice(0, 25);

  const chartRows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const brand of brands) row[brand] = index[date]?.[brand] ?? 0;
    return row;
  });

  const brandColorMap = Object.fromEntries(brands.map((b, i) => [b, lineColor(i)]));
  const brandColor = (b: string) => brandColorMap[b] ?? lineColor(0);

  // ── Brand filter state ────────────────────────────────────────────────────
  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());
  const toggleBrand = (b: string) =>
    setHiddenBrands(prev => { const n = new Set(prev); n.has(b) ? n.delete(b) : n.add(b); return n; });
  const selectAll = () => setHiddenBrands(new Set());
  const clearAll  = () => setHiddenBrands(new Set(brands));

  // ── Aggregate weekly for metric cards ─────────────────────────────────────
  const totalMentions = Object.values(weeklyTotals).reduce((s, v) => s + v.mentions, 0);
  const hasWeekly = Object.keys(weeklyTotals).length > 0;

  // ── LLM visibility ────────────────────────────────────────────────────────
  const hasVis = llmVisibility.length > 0;

  // ── Model mentions breakdown (horizontal stacked bar) ─────────────────────
  const modelMentionsByBrand: Record<string, { claude: number; gpt: number }> = {};
  for (const row of dailySummary) {
    if (!modelMentionsByBrand[row.brand]) modelMentionsByBrand[row.brand] = { claude: 0, gpt: 0 };
    if (row.model === "claude-haiku-4-5") modelMentionsByBrand[row.brand].claude += row.mention_count;
    else modelMentionsByBrand[row.brand].gpt += row.mention_count;
  }
  const modelMentionsData = brands
    .map(b => ({ brand: b, claude: modelMentionsByBrand[b]?.claude ?? 0, gpt: modelMentionsByBrand[b]?.gpt ?? 0 }))
    .filter(d => d.claude + d.gpt > 0)
    .sort((a, b) => (b.claude + b.gpt) - (a.claude + a.gpt));

  // ── Position table ────────────────────────────────────────────────────────
  const posTable = Object.entries(weeklyTotals)
    .filter(([, v]) => v.avgPos != null)
    .sort((a, b) => (a[1].avgPos ?? 99) - (b[1].avgPos ?? 99))
    .slice(0, 15)
    .map(([brand, v], i) => ({ rank: i + 1, brand, avgPos: v.avgPos as number, mentions: v.mentions }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 1: Metric cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

        <Card accent={BLUE}>
          <CardLabel>Brand Mentions · 7 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "—"}
            sub={hasWeekly ? `across ${Object.keys(weeklyTotals).length} brands · 2 models` : "No data yet"}
          />
        </Card>

        <Card accent={INDIGO}>
          <CardLabel>LLM Visibility · 7 Days</CardLabel>
          {!hasVis ? (
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }}>No data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {llmVisibility.map((v, i) => {
                const label = v.model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? BLUE : INDIGO;
                return (
                  <div key={v.model}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.55)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{label}</span>
                      <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{v.visibility_pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                      <div style={{ height: 5, borderRadius: 999, width: `${Math.min(v.visibility_pct, 100)}%`, background: color }} />
                    </div>
                    <p style={{ fontSize: 10, color: "rgba(0,0,0,0.4)", marginTop: 4 }}>{v.total_responses} responses</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card accent={NAVY}>
          <CardLabel>Top Brand · 7 Days</CardLabel>
          {posTable.length > 0 ? (
            <>
              <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 4 }}>
                {posTable[0].brand}
              </p>
              <p style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
                avg position {posTable[0].avgPos.toFixed(1)} · {posTable[0].mentions} mentions
              </p>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }}>No data yet</p>
          )}
        </Card>

      </div>

      {/* ── Row 2: 7-day trend ──────────────────────────────────────────────── */}
      {hasReal && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 16px" }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
              Brand Mentions — 7-Day Trend
            </h3>
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>Top 25 sales AI agent brands · both models combined</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 11, fill: "rgba(0,0,0,0.42)" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "rgba(0,0,0,0.42)" }} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.10)", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", color: NAVY }}
                labelStyle={{ fontWeight: 700, marginBottom: 4 }}
                labelFormatter={v => fmtDate(String(v))}
                formatter={(value, name) => [value, String(name)]}
              />
              {brands.map((brand) => (
                <Line key={brand} type="monotone" dataKey={brand} stroke={brandColor(brand)} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} hide={hiddenBrands.has(brand)} />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Brand filter */}
          <div style={{ marginTop: 14, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "rgba(0,0,0,0.4)" }}>Brands</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={selectAll} style={{ fontSize: 10, color: BLUE, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>Show all</button>
                <button onClick={clearAll}  style={{ fontSize: 10, color: "rgba(0,0,0,0.4)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>Hide all</button>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {brands.map((brand) => {
                const checked = !hiddenBrands.has(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "3px 8px", borderRadius: 6, cursor: "pointer",
                      fontSize: 11, fontWeight: checked ? 600 : 400,
                      background: checked ? "rgba(0,0,0,0.05)" : "transparent",
                      border: `1px solid ${checked ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)"}`,
                      color: "#000000", transition: "all 0.15s",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: checked ? brandColor(brand) : "rgba(0,0,0,0.2)", flexShrink: 0 }} />
                    {brand}
                    <TypeBadge brand={brand} small />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: Brand mentions by model ──────────────────────────────────── */}
      {hasReal && modelMentionsData.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 20px" }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
              Brand Mentions · 7 Days · by Model
            </h3>
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>Total mentions per brand across Claude Haiku and GPT-4o mini</p>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            {[{ label: "Claude Haiku", color: BLUE }, { label: "GPT-4o mini", color: INDIGO }].map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: NAVY }}>{label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={modelMentionsData.length * 28 + 10}>
            <BarChart layout="vertical" data={modelMentionsData} margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barSize={14}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="brand" width={150} tick={{ fontSize: 11, fill: NAVY }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.10)", fontSize: 12, color: NAVY }} formatter={(value, name) => [value, name === "claude" ? "Claude Haiku" : "GPT-4o mini"]} />
              <Bar dataKey="claude" stackId="a" fill={BLUE}   radius={[0, 0, 0, 0]} />
              <Bar dataKey="gpt"    stackId="a" fill={INDIGO} radius={[3, 3, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Row 4: Brand position table ─────────────────────────────────────── */}
      {posTable.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>Brand Position Summary</h3>
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>Average position brands appear in AI responses — lower is stronger</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.025)" }}>
                  {["Rank", "Brand", "Type", "Avg Position", "7-Day Mentions"].map(h => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.45)", textTransform: "uppercase" as const, letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posTable.map((row, i) => (
                  <tr key={row.brand} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.012)" }}>
                    <td style={{ padding: "11px 20px", color: "rgba(0,0,0,0.4)", fontWeight: 600 }}>#{row.rank}</td>
                    <td style={{ padding: "11px 20px", fontWeight: 600, color: NAVY }}>{row.brand}</td>
                    <td style={{ padding: "11px 20px" }}><TypeBadge brand={row.brand} /></td>
                    <td style={{ padding: "11px 20px", color: NAVY }}>
                      <span style={{
                        display: "inline-block", padding: "2px 8px", borderRadius: 4,
                        fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                        background: row.avgPos <= 3 ? "rgba(37,99,235,0.10)" : "rgba(0,0,0,0.05)",
                        color: row.avgPos <= 3 ? BLUE : "rgba(0,0,0,0.6)",
                      }}>
                        {row.avgPos.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", color: "rgba(0,0,0,0.6)" }}>{row.mentions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Row 5: SOV donuts ───────────────────────────────────────────────── */}
      {sovData.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>
            Use Case Share of Voice
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {SOV_CLUSTERS.map(cluster => {
              const rows = sovData.filter(r => r.bucket_tag === cluster.tag);
              return rows.length > 0 ? <SOVCard key={cluster.tag} cluster={cluster} rows={rows} /> : null;
            })}
          </div>
        </>
      )}

    </div>
  );
}
