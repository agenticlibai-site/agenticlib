"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ROSE   = "#C2186A";
const PINK   = "#E8447A";
const DARK   = "#160F2E";

const LINE_COLORS = [
  "#C2186A", // 1.  rose
  "#6B4FBB", // 2.  purple
  "#2563EB", // 3.  blue
  "#059669", // 4.  emerald
  "#DC2626", // 5.  red
  "#D97706", // 6.  amber
  "#0891B2", // 7.  cyan
  "#C026D3", // 8.  fuchsia
  "#EA580C", // 9.  orange
  "#0D9488", // 10. teal
  "#7C3AED", // 11. violet
  "#65A30D", // 12. lime
  "#0369A1", // 13. dark blue
  "#92400E", // 14. brown
  "#BE185D", // 15. dark rose
  "#0F766E", // 16. dark teal
  "#B45309", // 17. dark amber
  "#4338CA", // 18. indigo
  "#047857", // 19. dark emerald
  "#9D174D", // 20. dark pink
];

function lineColor(i: number) { return LINE_COLORS[Math.min(i, LINE_COLORS.length - 1)]; }

// ── Use-case bucket pie chart config ────────────────────────────────────────

interface UseCaseBucketBrandRow {
  brand: string;
  b1: number;
  b2: number;
  b3: number;
  b4: number;
  b5: number;
}

const BUCKET_DEFS = [
  { key: "b1" as const, label: "Routine Audit",        sub: "prompts 7–8"   },
  { key: "b2" as const, label: "Personalized Routine", sub: "prompt 9"      },
  { key: "b3" as const, label: "Ingredient Analysis",  sub: "prompts 10–11" },
  { key: "b4" as const, label: "Condition-Specific",   sub: "prompt 12"     },
  { key: "b5" as const, label: "Tracking & Progress",  sub: "prompt 13"     },
];

const BRAND_PIE_COLORS: Record<string, string> = {
  "Curology":       "#C2186A",
  "SkAI":           "#6B4FBB",
  "INCI Decoder":   "#2563EB",
  "SkinSage":       "#059669",
  "HelloAva":       "#DC2626",
  "Clinique":       "#D97706",
  "Think Dirty":    "#0891B2",
  "SkinBetter":     "#C026D3",
  "DermEngine":     "#EA580C",
  "Dermatology AI": "#0D9488",
  "Skincare.ai":    "#7C3AED",
  "SkinGenie":      "#0369A1",
  "Other":          "#CBD5E1",
};

function pieColor(name: string, idx: number): string {
  return BRAND_PIE_COLORS[name] ?? LINE_COLORS[(idx + 5) % LINE_COLORS.length];
}

function buildPieData(rows: UseCaseBucketBrandRow[], key: "b1" | "b2" | "b3" | "b4" | "b5") {
  const sorted = rows.filter(r => r[key] > 0).sort((a, b) => b[key] - a[key]);
  const top = sorted.slice(0, 5);
  const otherTotal = sorted.slice(5).reduce((s, r) => s + r[key], 0);
  const data = top.map(r => ({ name: r.brand, value: r[key] }));
  if (otherTotal > 0) data.push({ name: "Other", value: otherTotal });
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────

const SEED_BRANDS = ["PROVEN", "Curology", "Function of Beauty", "Atolla", "Skinsei", "Droplette"];
const SEED_BASES  = [82, 64, 55, 42, 38, 34];

function makeSeedRows(): Record<string, string | number>[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const date = d.toISOString().split("T")[0];
    const row: Record<string, string | number> = { date };
    SEED_BRANDS.forEach((brand, bi) => {
      const wave = Math.round(SEED_BASES[bi] * 0.13 * Math.sin((i + bi * 2) * 0.85));
      row[brand] = Math.max(0, SEED_BASES[bi] + wave);
    });
    return row;
  });
}

interface DailyRow {
  date: string;
  brand: string;
  model: string;
  mention_count: number;
  confidence: string;
}

interface WeeklyRow {
  brand: string;
  model: string;
  mention_count: number;
  confidence: string;
}

interface LLMVisRow {
  model: string;
  visibility_pct: number;
  total_responses: number;
}

interface Props {
  dailySummary: DailyRow[];
  weeklySummary: WeeklyRow[];
  llmVisibility: LLMVisRow[];
  useCaseBuckets: UseCaseBucketBrandRow[];
}

function buildChartData(daily: DailyRow[]) {
  const dateSet = new Set<string>();
  const brandSet = new Set<string>();
  const index: Record<string, Record<string, number>> = {};

  for (const row of daily) {
    dateSet.add(row.date);
    brandSet.add(row.brand);
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
  }

  const dates = [...dateSet].sort();
  const brands = [...brandSet].sort((a, b) => {
    const aT = dates.reduce((s, d) => s + (index[d]?.[a] ?? 0), 0);
    const bT = dates.reduce((s, d) => s + (index[d]?.[b] ?? 0), 0);
    return bT - aT;
  });

  const rows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const brand of brands) row[brand] = index[date]?.[brand] ?? 0;
    return row;
  });

  return { dates, brands, rows };
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

function Card({ children, accent = ROSE }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      borderLeft: `4px solid ${accent}`,
      boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
      padding: "20px 24px",
    }}>
      {children}
    </div>
  );
}

function CardLabel({ children, color = ROSE }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.1em",
      color,
      marginBottom: 10,
    }}>
      {children}
    </p>
  );
}

function BigNumber({ value, sub }: { value: string | number; sub?: string }) {
  return (
    <>
      <p style={{
        fontSize: 54,
        fontWeight: 800,
        color: DARK,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        marginBottom: sub ? 8 : 0,
      }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: "rgba(22,15,46,0.45)" }}>{sub}</p>}
    </>
  );
}

function EmptySlate({ message = "Collecting data…" }: { message?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
      <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
        <rect x="0" y="8"  width="4" height="8" rx="1" fill={ROSE} opacity="0.25" />
        <rect x="5" y="4"  width="4" height="12" rx="1" fill={ROSE} opacity="0.40" />
        <rect x="10" y="1" width="4" height="15" rx="1" fill={ROSE} opacity="0.55" />
        <rect x="15" y="6" width="3" height="10" rx="1" fill={ROSE} opacity="0.35" />
      </svg>
      <p style={{ fontSize: 13, color: "rgba(22,15,46,0.38)" }}>{message}</p>
    </div>
  );
}

export default function SkincareVisibilityCharts({ dailySummary, weeklySummary, llmVisibility, useCaseBuckets }: Props) {
  const hasReal = dailySummary.length > 0;
  const { brands: realBrands, rows: realRows } = buildChartData(dailySummary);

  const chartBrands = hasReal ? realBrands.slice(0, 20) : SEED_BRANDS;
  const chartRows   = hasReal ? realRows : makeSeedRows();

  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());
  const toggleBrand = (brand: string) =>
    setHiddenBrands(prev => { const n = new Set(prev); n.has(brand) ? n.delete(brand) : n.add(brand); return n; });
  const selectAll = () => setHiddenBrands(new Set());
  const clearAll  = () => setHiddenBrands(new Set(chartBrands));

  const weeklyByBrand: Record<string, { mention_count: number; confidence: string }> = {};
  for (const row of weeklySummary) {
    const e = weeklyByBrand[row.brand];
    weeklyByBrand[row.brand] = {
      mention_count: (e?.mention_count ?? 0) + row.mention_count,
      confidence: row.confidence,
    };
  }
  const weeklyBrands = Object.entries(weeklyByBrand).sort((a, b) => b[1].mention_count - a[1].mention_count);
  const totalMentions = weeklyBrands.reduce((s, [, v]) => s + v.mention_count, 0);
  const hasWeekly = weeklyBrands.length > 0;

  const latestVis: Record<string, { pct: number; total: number }> = {};
  for (const row of llmVisibility) {
    if (!latestVis[row.model]) latestVis[row.model] = { pct: row.visibility_pct, total: row.total_responses };
  }
  const visModels = Object.entries(latestVis);
  const hasVis = visModels.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Row 1: Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>

        <Card accent={ROSE}>
          <CardLabel>Brand Mentions · 7 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "—"}
            sub={hasWeekly
              ? `across ${weeklyBrands.length} brands · 2 models`
              : "Run starts collecting at 5 AM UTC"
            }
          />
        </Card>

        <Card accent={DARK}>
          <CardLabel color={DARK}>LLM Visibility · 7 Days</CardLabel>
          {!hasVis ? (
            <EmptySlate />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {visModels.map(([model, { pct, total }], i) => {
                const label = model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? ROSE : PINK;
                return (
                  <div key={model}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(22,15,46,0.55)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(22,15,46,0.07)" }}>
                      <div style={{ height: 5, borderRadius: 999, width: `${Math.min(pct, 100)}%`, background: color }} />
                    </div>
                    <p style={{ fontSize: 10, color: "rgba(22,15,46,0.38)", marginTop: 4 }}>{total} responses</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Row 2: 7-day trend chart */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
        padding: "24px 28px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 2, letterSpacing: "-0.01em" }}>
              Brand Mentions — 7-Day Trend
            </h3>
            <p style={{ fontSize: 12, color: "rgba(22,15,46,0.42)" }}>
              {hasReal ? "Top 20 brands by total mentions · both models combined" : "Sample data — live chart populates after daily collection"}
            </p>
          </div>
          {!hasReal && (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
              letterSpacing: "0.08em", color: ROSE, background: "rgba(194,24,106,0.10)",
              padding: "3px 8px", borderRadius: 999,
            }}>
              Preview
            </span>
          )}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartRows} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(22,15,46,0.055)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 11, fill: "rgba(22,15,46,0.42)" }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "rgba(22,15,46,0.42)" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid rgba(22,15,46,0.10)",
                fontSize: 12,
                boxShadow: "0 4px 16px rgba(22,15,46,0.12)",
                color: DARK,
              }}
              labelStyle={{ fontWeight: 700, marginBottom: 4 }}
              labelFormatter={v => fmtDate(String(v))}
            />
            {chartBrands.map((brand, i) => (
              <Line
                key={brand}
                type="monotone"
                dataKey={brand}
                stroke={lineColor(i)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                hide={hiddenBrands.has(brand)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Brand filter */}
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(22,15,46,0.06)", paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "rgba(22,15,46,0.32)" }}>
              Brands
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={selectAll} style={{ fontSize: 10, fontWeight: 600, color: ROSE, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Select all
              </button>
              <button onClick={clearAll} style={{ fontSize: 10, fontWeight: 600, color: ROSE, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Clear all
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
            {chartBrands.map((brand, i) => {
              const color = lineColor(i);
              const checked = !hiddenBrands.has(brand);
              return (
                <label key={brand} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand)}
                    style={{ accentColor: color, width: 12, height: 12, cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 11, color: checked ? color : "rgba(22,15,46,0.28)", fontWeight: checked ? 600 : 400 }}>
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
          {hasReal && realBrands.length > 20 && (
            <p style={{ fontSize: 10, color: "rgba(22,15,46,0.30)", marginTop: 8 }}>
              Showing top 20 of {realBrands.length} brands by mention volume.
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Use-case share of voice */}
      {useCaseBuckets.length > 0 && (
        <div style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(22,15,46,0.07)",
            display: "flex",
            alignItems: "baseline",
            gap: 12,
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
              Use-Case Share of Voice
            </h3>
            <span style={{ fontSize: 12, color: "rgba(22,15,46,0.40)" }}>brand mentions by bucket · all data · both models</span>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {BUCKET_DEFS.map(({ key, label, sub }) => {
                const pieData = buildPieData(useCaseBuckets, key);
                if (pieData.length === 0) return null;
                const total = pieData.reduce((s, d) => s + d.value, 0);
                return (
                  <div key={key} style={{
                    borderRadius: 8,
                    border: "1px solid rgba(22,15,46,0.08)",
                    padding: "14px 16px 16px",
                  }}>
                    <p style={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
                      letterSpacing: "0.1em", color: ROSE, marginBottom: 2,
                    }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(22,15,46,0.38)", marginBottom: 10 }}>
                      {sub} · {total} mentions
                    </p>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={entry.name} fill={pieColor(entry.name, index)} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: unknown) => {
                            const v = value as number;
                            return [`${v} (${((v / total) * 100).toFixed(1)}%)`];
                          }}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid rgba(22,15,46,0.10)",
                            fontSize: 12,
                            boxShadow: "0 4px 12px rgba(22,15,46,0.10)",
                            color: DARK,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                      {pieData.map((entry, index) => (
                        <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{
                            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                            background: pieColor(entry.name, index),
                          }} />
                          <span style={{ fontSize: 11, color: DARK, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                            {entry.name}
                          </span>
                          <span style={{ fontSize: 11, color: "rgba(22,15,46,0.45)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                            {entry.value} · {((entry.value / total) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Row 4: Weekly brand table */}
      {hasWeekly && (
        <div style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(22,15,46,0.07)",
            display: "flex",
            alignItems: "baseline",
            gap: 12,
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
              7-Day Brand Summary
            </h3>
            <span style={{ fontSize: 12, color: "rgba(22,15,46,0.40)" }}>all models combined</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(22,15,46,0.07)" }}>
                  {["#", "Brand", "Mentions", "Confidence"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 20px",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.07em",
                        color: "rgba(22,15,46,0.45)",
                        textAlign: i === 0 ? "center" : i >= 2 ? "right" : "left",
                        background: "rgba(22,15,46,0.018)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyBrands.map(([brand, stats], i) => (
                  <tr
                    key={brand}
                    style={{ borderBottom: i < weeklyBrands.length - 1 ? "1px solid rgba(22,15,46,0.05)" : undefined }}
                  >
                    <td style={{ padding: "11px 20px", textAlign: "center", color: "rgba(22,15,46,0.28)", fontWeight: 700, fontSize: 11 }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "11px 20px", fontWeight: 600, color: DARK }}>
                      <span style={{
                        display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                        background: lineColor(i), marginRight: 8, verticalAlign: "middle",
                      }} />
                      {brand}
                    </td>
                    <td style={{ padding: "11px 20px", textAlign: "right", fontWeight: 700, color: ROSE }}>
                      {stats.mention_count.toLocaleString()}
                    </td>
                    <td style={{ padding: "11px 20px", textAlign: "right" }}>
                      <span style={{
                        display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                        ...(stats.confidence === "low"
                          ? { background: "rgba(232,68,122,0.10)", color: PINK }
                          : { background: "rgba(194,24,106,0.10)", color: ROSE }
                        ),
                      }}>
                        {stats.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
