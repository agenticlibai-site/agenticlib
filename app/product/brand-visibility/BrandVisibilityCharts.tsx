"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Palette matching site styling — cycle through these for brand lines
const BRAND_COLORS = ["#7C3AED", "#5E6CE8", "#F0617A", "#C7388E", "#FAD9EC"];

function brandColor(index: number): string {
  return BRAND_COLORS[index % BRAND_COLORS.length];
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface DailyRow {
  date: string;
  brand: string;
  model: string;
  mention_count: number;
  avg_position: number | null;
  confidence: string;
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
}

// ── Chart data helpers ─────────────────────────────────────────────────────────

function buildChartData(daily: DailyRow[]): { dates: string[]; brands: string[]; rows: Record<string, number | string>[] } {
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
    const aTotal = dates.reduce((s, d) => s + (index[d]?.[a] ?? 0), 0);
    const bTotal = dates.reduce((s, d) => s + (index[d]?.[b] ?? 0), 0);
    return bTotal - aTotal;
  });

  const rows = dates.map((date) => {
    const row: Record<string, number | string> = { date };
    for (const brand of brands) row[brand] = index[date]?.[brand] ?? 0;
    return row;
  });

  return { dates, brands, rows };
}

function formatDate(d: string): string {
  const dt = new Date(d + "T00:00:00Z");
  return dt.toLocaleDateString("en-AU", { month: "short", day: "numeric", timeZone: "UTC" });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MetricCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(124,58,237,0.06)",
        border: "1.5px solid rgba(124,58,237,0.14)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function PositionCell({ avg, confidence }: { avg: number | null; confidence: string }) {
  const isLow = confidence === "low";
  return (
    <span
      className={isLow ? "opacity-40" : ""}
      title={isLow ? "Low confidence — fewer than 5 mentions" : undefined}
    >
      {avg != null ? avg.toFixed(1) : "—"}
      {isLow && <sup className="ml-0.5 text-[10px]">*</sup>}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BrandVisibilityCharts({ dailySummary, weeklySummary, llmVisibility }: Props) {
  const hasData = dailySummary.length > 0;
  const { brands, rows } = buildChartData(dailySummary);

  // Aggregate weekly totals across models for the cards (most recent window)
  const weeklyByBrand: Record<string, { mention_count: number; avg_position: number | null; confidence: string }> = {};
  for (const row of weeklySummary) {
    const existing = weeklyByBrand[row.brand];
    if (!existing || row.mention_count > existing.mention_count) {
      weeklyByBrand[row.brand] = {
        mention_count: (existing?.mention_count ?? 0) + row.mention_count,
        avg_position: row.avg_position,
        confidence: row.confidence,
      };
    }
  }
  const weeklyBrands = Object.entries(weeklyByBrand).sort((a, b) => b[1].mention_count - a[1].mention_count);
  const totalMentions = weeklyBrands.reduce((s, [, v]) => s + v.mention_count, 0);

  // Most recent LLM visibility entries
  const latestVisibility: Record<string, { pct: number; total: number }> = {};
  for (const row of llmVisibility) {
    if (!latestVisibility[row.model]) {
      latestVisibility[row.model] = { pct: row.visibility_pct, total: row.total_responses };
    }
  }

  return (
    <div className="space-y-8">
      {/* Metric cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total brand mentions */}
        <MetricCard title="Total Brand Mentions (7-day)">
          <p className="text-4xl font-bold" style={{ color: "#160F2E" }}>
            {totalMentions.toLocaleString()}
          </p>
          <p className="text-xs mt-1" style={{ color: "rgba(22,15,46,0.5)" }}>
            across {weeklyBrands.length} distinct brands
          </p>
        </MetricCard>

        {/* Avg brand position */}
        <MetricCard title="Avg Position by Brand">
          {weeklyBrands.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(22,15,46,0.4)" }}>No data yet</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {weeklyBrands.slice(0, 10).map(([brand, stats]) => (
                <div key={brand} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[60%]" style={{ color: "#160F2E" }}>{brand}</span>
                  <span style={{ color: "rgba(22,15,46,0.6)" }}>
                    <PositionCell avg={stats.avg_position} confidence={stats.confidence} />
                  </span>
                </div>
              ))}
              {weeklyBrands.length > 10 && (
                <p className="text-xs" style={{ color: "rgba(22,15,46,0.35)" }}>
                  +{weeklyBrands.length - 10} more
                </p>
              )}
            </div>
          )}
          <p className="text-[11px] mt-2" style={{ color: "rgba(22,15,46,0.35)" }}>
            * = low confidence (&lt;5 mentions)
          </p>
        </MetricCard>

        {/* Visibility by LLM */}
        <MetricCard title="Visibility by LLM">
          {Object.keys(latestVisibility).length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(22,15,46,0.4)" }}>No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(latestVisibility).map(([model, { pct, total }]) => (
                <div key={model}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium" style={{ color: "#160F2E" }}>
                      {model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini"}
                    </span>
                    <span className="font-bold" style={{ color: "#7C3AED" }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(124,58,237,0.12)" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: model === "claude-haiku-4-5" ? "#7C3AED" : "#5E6CE8",
                      }}
                    />
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(22,15,46,0.4)" }}>
                    {total} total responses
                  </p>
                </div>
              ))}
            </div>
          )}
        </MetricCard>
      </div>

      {/* Line chart: brand mentions over 7 days */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "white",
          border: "1.5px solid rgba(124,58,237,0.10)",
          boxShadow: "0 2px 16px rgba(124,58,237,0.06)",
        }}
      >
        <h3 className="text-base font-semibold mb-4" style={{ color: "#160F2E" }}>
          Brand Mentions — 7-day trend
        </h3>

        {!hasData ? (
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ height: 320, background: "rgba(124,58,237,0.04)", border: "1.5px dashed rgba(124,58,237,0.2)" }}
          >
            <p className="text-sm" style={{ color: "rgba(22,15,46,0.4)" }}>
              No data yet — chart will populate once the daily cron has run.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={rows} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: "rgba(22,15,46,0.5)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "rgba(22,15,46,0.5)" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1.5px solid rgba(124,58,237,0.15)",
                  fontSize: 13,
                  boxShadow: "0 4px 16px rgba(124,58,237,0.10)",
                }}
                labelFormatter={(v) => formatDate(String(v))}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
              {brands.slice(0, 10).map((brand, i) => (
                <Line
                  key={brand}
                  type="monotone"
                  dataKey={brand}
                  stroke={brandColor(i)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
        {brands.length > 10 && (
          <p className="text-xs mt-2" style={{ color: "rgba(22,15,46,0.4)" }}>
            Showing top 10 brands by mention volume. {brands.length - 10} additional brands not shown.
          </p>
        )}
      </div>

      {/* Weekly brand table */}
      {weeklyBrands.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1.5px solid rgba(124,58,237,0.10)" }}
        >
          <div className="px-6 py-4" style={{ background: "rgba(124,58,237,0.05)", borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
            <h3 className="text-base font-semibold" style={{ color: "#160F2E" }}>
              7-day Brand Summary (all models combined)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(124,58,237,0.03)" }}>
                  <th className="text-left px-6 py-3 font-semibold" style={{ color: "rgba(22,15,46,0.6)" }}>Brand</th>
                  <th className="text-right px-6 py-3 font-semibold" style={{ color: "rgba(22,15,46,0.6)" }}>Mentions</th>
                  <th className="text-right px-6 py-3 font-semibold" style={{ color: "rgba(22,15,46,0.6)" }}>Avg Position</th>
                  <th className="text-right px-6 py-3 font-semibold" style={{ color: "rgba(22,15,46,0.6)" }}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {weeklyBrands.map(([brand, stats], i) => (
                  <tr
                    key={brand}
                    style={{ borderTop: i > 0 ? "1px solid rgba(124,58,237,0.06)" : undefined }}
                  >
                    <td className="px-6 py-3 font-medium" style={{ color: "#160F2E" }}>
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                        style={{ background: brandColor(i) }}
                      />
                      {brand}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold" style={{ color: "#7C3AED" }}>
                      {stats.mention_count}
                    </td>
                    <td className="px-6 py-3 text-right" style={{ color: "rgba(22,15,46,0.7)" }}>
                      <PositionCell avg={stats.avg_position} confidence={stats.confidence} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                        style={
                          stats.confidence === "low"
                            ? { background: "rgba(240,97,122,0.12)", color: "#C7388E" }
                            : { background: "rgba(124,58,237,0.10)", color: "#7C3AED" }
                        }
                      >
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
