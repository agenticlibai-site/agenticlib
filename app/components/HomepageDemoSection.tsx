"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Brand config ────────────────────────────────────────────────────────────

const DEMO_BRANDS = ["Drift", "Copy.ai", "Conversica", "Writesonic", "Albert"] as const;
type DemoBrand = typeof DEMO_BRANDS[number];

const BRAND_COLORS: Record<DemoBrand, string> = {
  "Drift":      "#C2186A",
  "Copy.ai":    "#6B4FBB",
  "Conversica": "#2563EB",
  "Writesonic": "#059669",
  "Albert":     "#DC2626",
};

// ── Types ────────────────────────────────────────────────────────────────────

interface DemoData {
  trend:     { brand: string; date: string; mentions: number }[];
  totals:    { brand: string; total_mentions: number }[];
  positions: { brand: string; avg_position: number }[];
}

interface ChartRow { date: string; [brand: string]: string | number; }

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

function buildChartRows(trend: DemoData["trend"]): ChartRow[] {
  const dateMap = new Map<string, Record<string, number>>();
  for (const row of trend) {
    if (!dateMap.has(row.date)) dateMap.set(row.date, {});
    dateMap.get(row.date)![row.brand] = (dateMap.get(row.date)![row.brand] ?? 0) + row.mentions;
  }
  return [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ w = "100%", h = 16, radius = 6 }: { w?: string | number; h?: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "rgba(22,15,46,0.07)",
      animation: "skpulse 1.4s ease-in-out infinite",
    }} />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HomepageDemoSection() {
  const [data, setData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/homepage/demo-data")
      .then((r) => r.json())
      .then((d: DemoData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const chartRows  = data ? buildChartRows(data.trend) : [];
  const chartDates = chartRows.map((r) => r.date);

  const NAVY   = "#160F2E";
  const ACCENT = "#7C3AED";

  return (
    <section style={{ padding: "0 32px 72px", maxWidth: 1100, margin: "0 auto" }}>
      <style>{`
        @keyframes skpulse{0%,100%{opacity:1}50%{opacity:.45}}
        @media(max-width:768px){
          .demo-grid{grid-template-columns:1fr!important}
          .demo-right{flex-direction:row!important;gap:12px!important}
          .demo-right>*{flex:1!important}
        }
        @media(max-width:520px){
          .demo-right{flex-direction:column!important}
          .demo-section-pad{padding:18px!important}
        }
      `}</style>

      {/* Card shell */}
      <div style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(22,15,46,0.08)",
        boxShadow: "0 4px 32px rgba(22,15,46,0.08), 0 1px 4px rgba(22,15,46,0.04)",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div className="demo-section-pad" style={{
          padding: "22px 28px 0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ACCENT, marginBottom: 5 }}>
              Live Intelligence Sample
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, letterSpacing: "-0.015em", marginBottom: 3 }}>
              Brand Coverage Over Time
            </h2>
            <p style={{ fontSize: 13, color: "rgba(22,15,46,0.50)" }}>
              Last 7 days · both models combined
            </p>
          </div>
          <span style={{
            flexShrink: 0,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            background: "#D1FAE5", color: "#065F46",
            borderRadius: 999, padding: "5px 12px",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
            Live Data
          </span>
        </div>

        {/* Two-column body */}
        <div
          className="demo-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 24,
            padding: "20px 28px 28px",
          }}
        >
          {/* ── Left: line chart ── */}
          <div>
            {loading ? (
              <div style={{ height: 280, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, paddingBottom: 32 }}>
                {[55, 70, 45, 80, 60].map((h, i) => (
                  <Skeleton key={i} w="100%" h={h} radius={4} />
                ))}
              </div>
            ) : chartRows.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartRows} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(22,15,46,0.055)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    ticks={chartDates}
                    tickFormatter={fmtDate}
                    tick={{ fontSize: 12, fill: "rgba(22,15,46,0.50)" }}
                    axisLine={false} tickLine={false} dy={6}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "rgba(22,15,46,0.50)" }}
                    axisLine={false} tickLine={false} width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid rgba(22,15,46,0.10)",
                      fontSize: 13,
                      boxShadow: "0 4px 16px rgba(22,15,46,0.12)",
                      color: NAVY,
                      background: "#fff",
                    }}
                    labelFormatter={(v) => fmtDate(String(v))}
                    itemSorter={(item) => -(item.value as number)}
                  />
                  {DEMO_BRANDS.map((brand) => (
                    <Line
                      key={brand}
                      type="monotone"
                      dataKey={brand}
                      stroke={BRAND_COLORS[brand]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: 14, color: "rgba(22,15,46,0.35)" }}>No data available</p>
              </div>
            )}

            {/* Legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", marginTop: 14 }}>
              {DEMO_BRANDS.map((brand) => (
                <div key={brand} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: BRAND_COLORS[brand], display: "inline-block",
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{brand}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: stat cards ── */}
          <div className="demo-right" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Card 1: LLM Visibility */}
            <div style={{
              flex: 1,
              background: "#FAFAFA",
              borderRadius: 10,
              border: "1px solid rgba(22,15,46,0.07)",
              padding: "14px 16px",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "rgba(22,15,46,0.45)", marginBottom: 12 }}>
                LLM Visibility · 7 Days
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {loading
                  ? Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Skeleton w={8} h={8} radius={99} />
                      <Skeleton w={90} h={13} />
                      <div style={{ flex: 1 }} />
                      <Skeleton w={32} h={13} />
                    </div>
                  ))
                  : (data?.totals ?? []).map((row) => {
                    const color = BRAND_COLORS[row.brand as DemoBrand] ?? ACCENT;
                    const max   = data!.totals[0]?.total_mentions ?? 1;
                    return (
                      <div key={row.brand}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, flex: 1 }}>{row.brand}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
                            {row.total_mentions.toLocaleString()}
                          </span>
                        </div>
                        <div style={{ height: 3, borderRadius: 999, background: "rgba(22,15,46,0.07)", marginLeft: 16 }}>
                          <div style={{ height: 3, borderRadius: 999, background: color, width: `${(row.total_mentions / max) * 100}%`, opacity: 0.7 }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Card 2: Avg Brand Position */}
            <div style={{
              flex: 1,
              background: "#FAFAFA",
              borderRadius: 10,
              border: "1px solid rgba(22,15,46,0.07)",
              padding: "14px 16px",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "rgba(22,15,46,0.45)", marginBottom: 4 }}>
                Avg Brand Position · 7 Days
              </p>
              <p style={{ fontSize: 11, color: "rgba(22,15,46,0.35)", marginBottom: 10 }}>
                1 = first mentioned · lower is better
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {loading
                  ? Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Skeleton w={8} h={8} radius={99} />
                      <Skeleton w={90} h={13} />
                      <div style={{ flex: 1 }} />
                      <Skeleton w={32} h={13} />
                    </div>
                  ))
                  : (data?.positions ?? []).map((row, i) => {
                    const color = BRAND_COLORS[row.brand as DemoBrand] ?? ACCENT;
                    return (
                      <div key={row.brand} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, flex: 1 }}>{row.brand}</span>
                        <span style={{
                          fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                          color: i === 0 ? "#059669" : NAVY,
                        }}>
                          {row.avg_position.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CTA strip */}
      <div style={{ textAlign: "center", marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <p style={{ fontSize: 14, color: "rgba(22,15,46,0.50)", lineHeight: 1.6, maxWidth: 480 }}>
          This is a live sample from our marketing AI agent pipeline — updated daily across Claude and GPT-4o-mini.
        </p>
        <a
          href="#contact"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 14, fontWeight: 700, color: "#fff",
            background: ACCENT,
            borderRadius: 999, padding: "12px 24px",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(124,58,237,0.30)",
            transition: "background 0.18s ease, box-shadow 0.18s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "#6D28D9";
            el.style.boxShadow = "0 6px 20px rgba(124,58,237,0.40)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = ACCENT;
            el.style.boxShadow = "0 4px 14px rgba(124,58,237,0.30)";
          }}
        >
          Request your brand&apos;s report →
        </a>
      </div>
    </section>
  );
}
