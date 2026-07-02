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
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const NAVY   = "#0D1B3E";
const PURPLE = "#6B4FBB";
const PINK   = "#E8447A";

// 22 visually distinct colors, one per brand slot — no cycling, no repeats.
// Hues spread across the full wheel; lightness varied within similar-hue pairs
// to keep them apart even on a white background.
const LINE_COLORS = [
  "#6B4FBB", // 1.  purple
  "#E8447A", // 2.  raspberry
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
  "#F43F5E", // 16. vivid rose
  "#84CC16", // 17. chartreuse
  "#FB923C", // 18. peach
  "#818CF8", // 19. periwinkle
  "#34D399", // 20. mint
  "#F472B6", // 21. pink
  "#38BDF8", // 22. sky blue
];

function lineColor(i: number) { return LINE_COLORS[i % LINE_COLORS.length]; }

// ── Seed data: realistic placeholder shown when no real data is available ──────
// Gives the chart visual content from day one instead of a dashed empty box.
const SEED_BRANDS = ["HubSpot", "Marketo", "Jasper", "Drift", "Klaviyo", "Copy.ai"];
const SEED_BASES  = [88, 58, 50, 44, 42, 40];

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

// ── Types ──────────────────────────────────────────────────────────────────────

interface DailyRow {
  date: string;
  brand: string;
  model: string;
  mention_count: number;
  avg_position: number | null;
  confidence: string;
  rank?: number;
  dominant_tag?: string;
}

interface BrandPositionRow {
  brand_name: string;
  display_name: string;
  rank: number;
  overall_avg_pos: number | null;
  ads_avg_pos: number | null;
  content_avg_pos: number | null;
  roi_avg_pos: number | null;
  leadgen_avg_pos: number | null;
  analytics_avg_pos: number | null;
  seo_avg_pos: number | null;
  social_avg_pos: number | null;
}

interface WeeklyRow {
  brand: string;
  model: string;
  mention_count: number;
  avg_position: number | null;
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
  brandPositions: BrandPositionRow[];
}

// ── Chart data helpers ─────────────────────────────────────────────────────────

function buildChartData(daily: DailyRow[]) {
  const dateSet = new Set<string>();
  const brandSet = new Set<string>();
  const index: Record<string, Record<string, number>> = {};
  const rankMap: Record<string, number> = {};
  const tagMap: Record<string, string> = {};

  for (const row of daily) {
    dateSet.add(row.date);
    brandSet.add(row.brand);
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
    if (row.rank !== undefined && rankMap[row.brand] === undefined) rankMap[row.brand] = row.rank;
    if (row.dominant_tag !== undefined && tagMap[row.brand] === undefined) tagMap[row.brand] = row.dominant_tag;
  }

  const dates = [...dateSet].sort();
  const hasRanks = Object.keys(rankMap).length > 0;
  const brands = [...brandSet].sort((a, b) => {
    if (hasRanks) return (rankMap[a] ?? 999) - (rankMap[b] ?? 999);
    const aT = dates.reduce((s, d) => s + (index[d]?.[a] ?? 0), 0);
    const bT = dates.reduce((s, d) => s + (index[d]?.[b] ?? 0), 0);
    return bT - aT;
  });

  const rows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const brand of brands) row[brand] = index[date]?.[brand] ?? 0;
    return row;
  });

  return { dates, brands, rows, tagMap };
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

const USE_CASE_CLUSTERS: { tag: string; label: string; promptHint: string }[] = [
  { tag: "ads",       label: "Ads & Paid Campaigns",   promptHint: "Meta, Google, TikTok paid ads · ad spend optimisation" },
  { tag: "content",   label: "Content & Brand Voice",  promptHint: "Marketing copy at scale · consistent brand voice" },
  { tag: "overall",   label: "Overall Marketing ROI",  promptHint: "Best overall AI marketing agents by ROI" },
  { tag: "lead-gen",  label: "Lead-Gen & Funnel",      promptHint: "Lead gen, outreach, funnel automation" },
  { tag: "analytics", label: "Analytics & Attribution",promptHint: "Marketing performance reporting and attribution" },
  { tag: "seo",       label: "SEO & Organic Content",  promptHint: "SEO and organic search visibility" },
  { tag: "social",    label: "Social Media",           promptHint: "End-to-end social media management" },
];

function ClusterTrendCard({
  cluster, brands, rows, brandColor, getDisplayName,
}: {
  cluster: typeof USE_CASE_CLUSTERS[number];
  brands: string[];
  rows: Record<string, string | number>[];
  brandColor: (b: string) => string;
  getDisplayName: (b: string) => string;
}) {
  const [hidden, setHidden] = useState(new Set<string>());
  const toggle = (b: string) => setHidden(prev => { const n = new Set(prev); n.has(b) ? n.delete(b) : n.add(b); return n; });

  if (brands.length === 0) return null;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
      padding: "24px 28px 16px",
    }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
          {cluster.label} — 7-Day Trend
        </h3>
        <p style={{ fontSize: 12, color: "rgba(13,27,62,0.42)" }}>{cluster.promptHint}</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={rows} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(13,27,62,0.055)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fontSize: 11, fill: "rgba(13,27,62,0.42)" }}
            axisLine={false} tickLine={false} dy={6}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "rgba(13,27,62,0.42)" }}
            axisLine={false} tickLine={false} width={30}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid rgba(13,27,62,0.10)",
              fontSize: 12,
              boxShadow: "0 4px 16px rgba(13,27,62,0.12)",
              color: NAVY,
              background: "#fff",
            }}
            labelStyle={{ fontWeight: 700, marginBottom: 4 }}
            labelFormatter={v => fmtDate(String(v))}
            itemSorter={item => -(item.value as number)}
            formatter={(value, name) => [value, getDisplayName(String(name))]}
          />
          {brands.map(brand => (
            <Line
              key={brand}
              type="monotone"
              dataKey={brand}
              stroke={brandColor(brand)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              hide={hidden.has(brand)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 12, borderTop: "1px solid rgba(13,27,62,0.06)", paddingTop: 10, display: "flex", flexWrap: "wrap", gap: "5px 16px" }}>
        {brands.map(brand => {
          const color = brandColor(brand);
          const checked = !hidden.has(brand);
          return (
            <label key={brand} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <input
                type="checkbox" checked={checked} onChange={() => toggle(brand)}
                style={{ accentColor: color, width: 12, height: 12, cursor: "pointer", flexShrink: 0 }}
              />
              <span style={{ fontSize: 11, color: checked ? color : "rgba(13,27,62,0.28)", fontWeight: checked ? 600 : 400 }}>
                {getDisplayName(brand)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({
  children,
  accent = PURPLE,
  className = "",
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",
        borderRadius: 10,
        borderLeft: `4px solid ${accent}`,
        boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
        padding: "20px 24px",
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.1em",
      color: PURPLE,
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
        color: NAVY,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        marginBottom: sub ? 8 : 0,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: "rgba(13,27,62,0.45)" }}>{sub}</p>
      )}
    </>
  );
}

function EmptySlate({ message = "Collecting data…" }: { message?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
      {/* Tiny bar-chart glyph */}
      <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
        <rect x="0" y="8"  width="4" height="8" rx="1" fill={PURPLE} opacity="0.25" />
        <rect x="5" y="4"  width="4" height="12" rx="1" fill={PURPLE} opacity="0.40" />
        <rect x="10" y="1" width="4" height="15" rx="1" fill={PURPLE} opacity="0.55" />
        <rect x="15" y="6" width="3" height="10" rx="1" fill={PURPLE} opacity="0.35" />
      </svg>
      <p style={{ fontSize: 13, color: "rgba(13,27,62,0.38)" }}>{message}</p>
    </div>
  );
}

function PositionCell({ avg, confidence }: { avg: number | null; confidence: string }) {
  const isLow = confidence === "low";
  return (
    <span style={{ opacity: isLow ? 0.45 : 1 }} title={isLow ? "Low confidence (<5 mentions)" : undefined}>
      {avg != null ? avg.toFixed(1) : "—"}
      {isLow && <sup style={{ fontSize: 9, marginLeft: 1 }}>*</sup>}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BrandVisibilityCharts({ dailySummary, weeklySummary, llmVisibility, brandPositions }: Props) {
  const hasReal = dailySummary.length > 0;
  const { brands: realBrands, rows: realRows, tagMap: realTagMap } = buildChartData(dailySummary);

  const displayMap = Object.fromEntries(brandPositions.map(p => [p.brand_name, p.display_name]));
  const getDisplayName = (b: string) => displayMap[b] ?? b;

  // Chart uses real data if available, seed data otherwise so chart always renders
  const chartBrands  = hasReal ? realBrands.slice(0, 22) : SEED_BRANDS;
  const chartRows    = hasReal ? realRows : makeSeedRows();
  const chartTagMap  = hasReal ? realTagMap : {} as Record<string, string>;

  // Stable color per brand (by rank order) so main and cluster charts share colours
  const brandColorMap = Object.fromEntries(chartBrands.map((b, i) => [b, lineColor(i)]));
  const brandColor    = (b: string) => brandColorMap[b] ?? lineColor(0);

  // Brand filter state — all visible by default; toggled client-side, no re-fetch
  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());
  const toggleBrand = (brand: string) =>
    setHiddenBrands(prev => { const n = new Set(prev); n.has(brand) ? n.delete(brand) : n.add(brand); return n; });
  const selectAll = () => setHiddenBrands(new Set());
  const clearAll  = () => setHiddenBrands(new Set(chartBrands));

  // Aggregate weekly by brand across models
  const weeklyByBrand: Record<string, { mention_count: number; avg_position: number | null; confidence: string }> = {};
  for (const row of weeklySummary) {
    const e = weeklyByBrand[row.brand];
    weeklyByBrand[row.brand] = {
      mention_count: (e?.mention_count ?? 0) + row.mention_count,
      avg_position: row.avg_position,
      confidence: row.confidence,
    };
  }
  const weeklyBrands = Object.entries(weeklyByBrand).sort((a, b) => b[1].mention_count - a[1].mention_count);
  const totalMentions = weeklyBrands.reduce((s, [, v]) => s + v.mention_count, 0);
  const hasWeekly = weeklyBrands.length > 0;

  // Most recent LLM visibility per model
  const latestVis: Record<string, { pct: number; total: number }> = {};
  for (const row of llmVisibility) {
    if (!latestVis[row.model]) latestVis[row.model] = { pct: row.visibility_pct, total: row.total_responses };
  }
  const visModels = Object.entries(latestVis);
  const hasVis = visModels.length > 0;

  // Best avg-position per brand for position card
  const topByPos = weeklyBrands
    .filter(([, s]) => s.avg_position != null)
    .sort((a, b) => (a[1].avg_position ?? 99) - (b[1].avg_position ?? 99))
    .slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 1: Metric cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>

        {/* Card 1 — Total mentions */}
        <Card accent={PURPLE}>
          <CardLabel>Brand Mentions · 7 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "—"}
            sub={hasWeekly
              ? `across ${weeklyBrands.length} brands · 2 models`
              : "Run starts collecting tonight at 3 AM UTC"
            }
          />
        </Card>

        {/* Card 3 — LLM visibility */}
        <Card accent={NAVY}>
          <CardLabel>LLM Visibility · 7 Days</CardLabel>
          {!hasVis ? (
            <EmptySlate />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {visModels.map(([model, { pct, total }], i) => {
                const label = model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? PURPLE : NAVY;
                return (
                  <div key={model}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(13,27,62,0.55)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(13,27,62,0.07)" }}>
                      <div style={{ height: 5, borderRadius: 999, width: `${Math.min(pct, 100)}%`, background: color }} />
                    </div>
                    <p style={{ fontSize: 10, color: "rgba(13,27,62,0.38)", marginTop: 4 }}>
                      {total} responses
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Row 2: 7-day trend chart ─────────────────────────────────────────── */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
        padding: "24px 28px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
              Brand Mentions — 7-Day Trend
            </h3>
            <p style={{ fontSize: 12, color: "rgba(13,27,62,0.42)" }}>
              {hasReal ? "Top 22 locked AI marketing agents · both models combined" : "Sample data — live chart populates after daily collection"}
            </p>
          </div>
          {!hasReal && (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
              letterSpacing: "0.08em", color: PURPLE, background: "rgba(107,79,187,0.10)",
              padding: "3px 8px", borderRadius: 999,
            }}>
              Preview
            </span>
          )}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartRows} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(13,27,62,0.055)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 11, fill: "rgba(13,27,62,0.42)" }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "rgba(13,27,62,0.42)" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid rgba(13,27,62,0.10)",
                fontSize: 12,
                boxShadow: "0 4px 16px rgba(13,27,62,0.12)",
                color: NAVY,
              }}
              labelStyle={{ fontWeight: 700, marginBottom: 4 }}
              labelFormatter={v => fmtDate(String(v))}
              formatter={(value, name) => [value, getDisplayName(String(name))]}
            />
            {chartBrands.map((brand) => (
              <Line
                key={brand}
                type="monotone"
                dataKey={brand}
                stroke={brandColor(brand)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                hide={hiddenBrands.has(brand)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Interactive brand filter */}
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(13,27,62,0.06)", paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "rgba(13,27,62,0.32)" }}>
              Brands
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={selectAll} style={{ fontSize: 10, fontWeight: 600, color: PURPLE, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Select all
              </button>
              <button onClick={clearAll} style={{ fontSize: 10, fontWeight: 600, color: PURPLE, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Clear all
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
            {chartBrands.map((brand) => {
              const color = brandColor(brand);
              const checked = !hiddenBrands.has(brand);
              return (
                <label
                  key={brand}
                  style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand)}
                    style={{ accentColor: color, width: 12, height: 12, cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 11, color: checked ? color : "rgba(13,27,62,0.28)", fontWeight: checked ? 600 : 400 }}>
                    {getDisplayName(brand)}
                  </span>
                </label>
              );
            })}
          </div>
          {hasReal && realBrands.length > 22 && (
            <p style={{ fontSize: 10, color: "rgba(13,27,62,0.30)", marginTop: 8 }}>
              Showing top 22 of {realBrands.length} locked marketing agents.
            </p>
          )}
        </div>
      </div>

      {/* ── Rows 2b: Per-use-case cluster charts ────────────────────────────── */}
      {hasReal && USE_CASE_CLUSTERS.map(cluster => {
        const clusterBrands = chartBrands.filter(b => chartTagMap[b] === cluster.tag);
        return (
          <ClusterTrendCard
            key={cluster.tag}
            cluster={cluster}
            brands={clusterBrands}
            rows={chartRows}
            brandColor={brandColor}
            getDisplayName={getDisplayName}
          />
        );
      })}

      {/* ── Row 3: Weekly brand table (only when real data exists) ───────────── */}
      {hasWeekly && (
        <div style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
          overflow: "hidden",
        }}>
          {/* Table header */}
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(13,27,62,0.07)",
            display: "flex",
            alignItems: "baseline",
            gap: 12,
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em" }}>
              7-Day Brand Summary
            </h3>
            <span style={{ fontSize: 12, color: "rgba(13,27,62,0.40)" }}>
              all models combined
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(13,27,62,0.07)" }}>
                  {["#", "Brand", "Mentions", "Avg Position", "Confidence"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 20px",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.07em",
                        color: "rgba(13,27,62,0.45)",
                        textAlign: i === 0 ? "center" : i >= 2 ? "right" : "left",
                        background: "rgba(13,27,62,0.018)",
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
                    style={{
                      borderBottom: i < weeklyBrands.length - 1 ? "1px solid rgba(13,27,62,0.05)" : undefined,
                      transition: "background 0.1s",
                    }}
                  >
                    <td style={{ padding: "11px 20px", textAlign: "center", color: "rgba(13,27,62,0.28)", fontWeight: 700, fontSize: 11 }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "11px 20px", fontWeight: 600, color: NAVY }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: lineColor(i),
                          marginRight: 8,
                          verticalAlign: "middle",
                        }}
                      />
                      {brand}
                    </td>
                    <td style={{ padding: "11px 20px", textAlign: "right", fontWeight: 700, color: PURPLE }}>
                      {stats.mention_count.toLocaleString()}
                    </td>
                    <td style={{ padding: "11px 20px", textAlign: "right", color: "rgba(13,27,62,0.65)" }}>
                      <PositionCell avg={stats.avg_position} confidence={stats.confidence} />
                    </td>
                    <td style={{ padding: "11px 20px", textAlign: "right" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "2px 9px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        ...(stats.confidence === "low"
                          ? { background: "rgba(232,68,122,0.10)", color: PINK }
                          : { background: "rgba(107,79,187,0.10)", color: PURPLE }
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

      {/* ── Row 4: Average position breakdown ────────────────────────────────── */}
      {brandPositions.length > 0 && (
        <div style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(13,27,62,0.07), 0 1px 2px rgba(13,27,62,0.04)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(13,27,62,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>
              Average Position by Use Case
            </h3>
            <p style={{ fontSize: 12, color: "rgba(13,27,62,0.40)" }}>
              Position = average rank in AI response (1 = mentioned first). Lower is better.
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(13,27,62,0.07)" }}>
                  {["#", "Brand", "All Prompts", "Ads", "Content", "ROI", "Lead-Gen", "Analytics", "SEO", "Social"].map((h, i) => (
                    <th key={h} style={{
                      padding: "10px 14px",
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.07em",
                      color: "rgba(13,27,62,0.45)",
                      textAlign: i <= 1 ? "left" : "right",
                      background: "rgba(13,27,62,0.018)",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brandPositions.map((p, i) => {
                  const color = brandColorMap[p.brand_name] ?? lineColor(i);
                  const fmt = (v: number | null) => v != null ? v.toFixed(1) : "—";
                  return (
                    <tr key={p.brand_name} style={{ borderBottom: i < brandPositions.length - 1 ? "1px solid rgba(13,27,62,0.05)" : undefined }}>
                      <td style={{ padding: "10px 14px", color: "rgba(13,27,62,0.28)", fontWeight: 700, fontSize: 11 }}>{p.rank}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: NAVY, whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, marginRight: 8, verticalAlign: "middle" }} />
                        {p.display_name}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: PURPLE }}>{fmt(p.overall_avg_pos)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "rgba(13,27,62,0.65)" }}>{fmt(p.ads_avg_pos)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "rgba(13,27,62,0.65)" }}>{fmt(p.content_avg_pos)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "rgba(13,27,62,0.65)" }}>{fmt(p.roi_avg_pos)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "rgba(13,27,62,0.65)" }}>{fmt(p.leadgen_avg_pos)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "rgba(13,27,62,0.65)" }}>{fmt(p.analytics_avg_pos)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "rgba(13,27,62,0.65)" }}>{fmt(p.seo_avg_pos)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "rgba(13,27,62,0.65)" }}>{fmt(p.social_avg_pos)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
