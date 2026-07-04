"use client";

import { useEffect, useState } from "react";
import {
  ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEMO_BRANDS = ["Drift", "Copy.ai", "Conversica", "Writesonic", "Albert"] as const;
type DemoBrand = typeof DEMO_BRANDS[number];

const BRAND_COLORS: Record<DemoBrand, string> = {
  "Drift":      "#C2186A",
  "Copy.ai":    "#6B4FBB",
  "Conversica": "#2563EB",
  "Writesonic": "#059669",
  "Albert":     "#DC2626",
};

const DONUT_PALETTE = ["#7C3AED", "#C2186A", "#2563EB", "#059669", "#B45309", "#94A3B8"];

const NAVY   = "#160F2E";
const ACCENT = "#7C3AED";

// ── Sample feature clusters (hardcoded for demo) ───────────────────────────────

const FEATURE_CLUSTERS = [
  { label: "ADS & PAID CAMPAIGNS", features: [
    { name: "Autonomous Bid Optimisation",  scores: { Drift: 62, "Copy.ai": 38, Conversica: 45, Writesonic: 35, Albert: 92 } },
    { name: "Cross-Platform Ad Management", scores: { Drift: 78, "Copy.ai": 44, Conversica: 42, Writesonic: 31, Albert: 88 } },
  ]},
  { label: "CONTENT & BRAND VOICE", features: [
    { name: "Brand Voice Enforcement",        scores: { Drift: 75, "Copy.ai": 93, Conversica: 66, Writesonic: 88, Albert: 48 } },
    { name: "Predictive Content Performance", scores: { Drift: 69, "Copy.ai": 84, Conversica: 61, Writesonic: 82, Albert: 53 } },
  ]},
  { label: "LEAD-GEN & FUNNEL", features: [
    { name: "Outreach Sequencing",           scores: { Drift: 88, "Copy.ai": 65, Conversica: 80, Writesonic: 53, Albert: 46 } },
    { name: "Lead Qualification Automation", scores: { Drift: 84, "Copy.ai": 61, Conversica: 83, Writesonic: 49, Albert: 43 } },
  ]},
  { label: "LIFECYCLE & RETENTION", features: [
    { name: "ROI Attribution",          scores: { Drift: 90, "Copy.ai": 70, Conversica: 80, Writesonic: 58, Albert: 72 } },
    { name: "Self-Optimising Workflows", scores: { Drift: 85, "Copy.ai": 66, Conversica: 77, Writesonic: 53, Albert: 68 } },
  ]},
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface DemoData {
  trend:         { brand: string; date: string; mentions: number }[];
  totals:        { brand: string; total_mentions: number }[];
  positions:     { brand: string; avg_position: number }[];
  totalMentions: number;
  priorMentions: number;
  sovAds:        SOVRow[];
  sovContent:    SOVRow[];
  sovLeadgen:    SOVRow[];
  sovLifecycle:  SOVRow[];
}
interface SOVRow { brand: string; appearances: number; sov_pct: number }
interface ChartRow { date: string; [brand: string]: string | number }

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  const dt  = new Date(d + "T00:00:00Z");
  const day = dt.getUTCDate();
  const mon = dt.toLocaleDateString("en-AU", { month: "long", timeZone: "UTC" });
  return `${day} ${mon}`;
}

function buildChartRows(trend: DemoData["trend"]): ChartRow[] {
  const map = new Map<string, Record<string, string | number>>();
  for (const row of trend) {
    if (!map.has(row.date)) map.set(row.date, { date: row.date });
    map.get(row.date)![row.brand] = (Number(map.get(row.date)![row.brand] ?? 0)) + row.mentions;
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v as ChartRow);
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Sk({ w = "100%", h = 14, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(22,15,46,0.07)", animation: "skpulse 1.4s ease-in-out infinite" }} />;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, subGreen = false, loading,
}: { label: string; value: string; sub: string; subGreen?: boolean; loading: boolean }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(22,15,46,0.08)", padding: "18px 20px", boxShadow: "0 1px 4px rgba(22,15,46,0.05)" }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(22,15,46,0.40)", marginBottom: 10 }}>
        {label}
      </p>
      {loading ? (
        <><Sk w={80} h={32} r={6} /><div style={{ marginTop: 8 }}><Sk w={120} h={12} /></div></>
      ) : (
        <>
          <p style={{ fontSize: 34, fontWeight: 800, color: NAVY, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 6 }}>
            {value}
          </p>
          <p style={{ fontSize: 12, fontWeight: 500, color: subGreen ? "#059669" : "rgba(22,15,46,0.45)" }}>
            {sub}
          </p>
        </>
      )}
    </div>
  );
}

// ── Mini donut (horizontal layout) ───────────────────────────────────────────

function MiniDonut({ title, rows, loading }: { title: string; rows: SOVRow[]; loading: boolean }) {
  const data = rows.map((r, i) => ({ name: r.brand, value: r.sov_pct, color: DONUT_PALETTE[i] ?? "#94A3B8" }));
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(22,15,46,0.08)", padding: "16px 18px", boxShadow: "0 1px 4px rgba(22,15,46,0.05)" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14, letterSpacing: "-0.01em" }}>{title}</p>
      {loading ? (
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Sk w={100} h={100} r={999} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {[80, 60, 70, 50, 40].map((w, i) => <Sk key={i} w={`${w}%`} h={12} />)}
          </div>
        </div>
      ) : rows.length === 0 ? (
        <p style={{ fontSize: 13, color: "rgba(22,15,46,0.30)", padding: "24px 0" }}>No data</p>
      ) : (
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <PieChart width={100} height={100}>
            <Pie data={data} cx={50} cy={50} innerRadius={32} outerRadius={48} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
              {data.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
            </Pie>
            <Tooltip
              formatter={(v) => [`${v}%`, "SOV"]}
              contentStyle={{ borderRadius: 8, border: "1px solid rgba(22,15,46,0.10)", fontSize: 11, background: "#fff" }}
            />
          </PieChart>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            {data.map((entry) => (
              <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: entry.color, flexShrink: 0, display: "inline-block" }} />
                <span style={{ flex: 1, fontSize: 12, color: NAVY, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, fontVariantNumeric: "tabular-nums" }}>{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HomepageDemoSection() {
  const [data,    setData]    = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/homepage/demo-data")
      .then((r) => r.json())
      .then((d: DemoData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Stat card values
  const totalMentions = data?.totalMentions ?? 0;
  const priorMentions = data?.priorMentions ?? 0;
  const pctChange     = priorMentions > 0
    ? Math.round((totalMentions - priorMentions) / priorMentions * 100)
    : null;
  const avgPos = data?.positions.length
    ? (data.positions.reduce((s, r) => s + r.avg_position, 0) / data.positions.length).toFixed(1)
    : null;

  const chartRows  = data ? buildChartRows(data.trend) : [];
  const chartDates = chartRows.map((r) => r.date);

  return (
    <section style={{ background: "linear-gradient(160deg, #EEF0FD 0%, #F4F5FD 45%, #F9FAFE 100%)", padding: "48px 0 0" }}>
      <style>{`
        @keyframes skpulse{0%,100%{opacity:1}50%{opacity:.45}}
        @media(max-width:900px){
          .demo-stat-grid{grid-template-columns:repeat(2,1fr)!important}
          .demo-chart-grid{grid-template-columns:1fr!important}
          .demo-sov-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:560px){
          .demo-stat-grid{grid-template-columns:1fr!important}
          .demo-feature-scroll{overflow-x:auto}
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 64px" }}>

        {/* ── Page title ── */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", marginBottom: 6 }}>
            Marketing AI Agents — Visibility Overview
          </h2>
          <p style={{ fontSize: 14, color: "rgba(22,15,46,0.50)" }}>
            Brand mentions, positioning, and feature coverage across AI answer engines.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="demo-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 36 }}>
          <StatCard
            label="Total Brand Mentions"
            value={loading ? "—" : totalMentions.toLocaleString()}
            sub={pctChange != null ? `${pctChange >= 0 ? "↑" : "↓"} ${Math.abs(pctChange)}% vs prior week` : "last 7 days"}
            subGreen={pctChange != null && pctChange >= 0}
            loading={loading}
          />
          <StatCard
            label="Avg Position Overall"
            value={loading ? "—" : (avgPos ?? "—")}
            sub="1 = first mentioned"
            loading={loading}
          />
          <StatCard
            label="Use Case Clusters"
            value="4"
            sub="22 brands tracked"
            loading={false}
          />
          <StatCard
            label="Avg Feature Score"
            value="80"
            sub="across 8 features"
            subGreen
            loading={false}
          />
        </div>

        {/* ── Brand Coverage ── */}
        <div style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: NAVY, letterSpacing: "-0.015em", marginBottom: 5 }}>
            Brand Coverage Over Time
          </h3>
          <p style={{ fontSize: 13, color: "rgba(22,15,46,0.50)", lineHeight: 1.55, maxWidth: 580, marginBottom: 20 }}>
            How often each brand appears in AI-generated responses over the past 7 days, tracked across Claude Haiku and GPT-4o-mini. A higher count means AI models are recommending that brand more frequently.
          </p>
        </div>

        <div className="demo-chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, marginBottom: 44 }}>
          {/* Area + line chart */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(22,15,46,0.08)", padding: "20px 20px 14px", boxShadow: "0 1px 4px rgba(22,15,46,0.05)" }}>
            {loading ? (
              <div style={{ height: 240, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, paddingBottom: 28 }}>
                {[50, 65, 45, 75, 55].map((h, i) => <Sk key={i} w="100%" h={h} r={4} />)}
              </div>
            ) : chartRows.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={chartRows} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(22,15,46,0.055)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    ticks={chartDates}
                    tickFormatter={fmtDate}
                    tick={{ fontSize: 11, fill: "rgba(22,15,46,0.45)" }}
                    axisLine={false} tickLine={false} dy={8}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "rgba(22,15,46,0.45)" }}
                    axisLine={false} tickLine={false} width={30}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid rgba(22,15,46,0.10)", fontSize: 12, boxShadow: "0 4px 16px rgba(22,15,46,0.10)", color: NAVY, background: "#fff" }}
                    labelFormatter={(v) => fmtDate(String(v))}
                    itemSorter={(item) => -(item.value as number)}
                  />
                  <Area type="monotone" dataKey="Drift" stroke="#C2186A" strokeWidth={2.5} fill="#C2186A" fillOpacity={0.10} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  {(["Copy.ai", "Conversica", "Writesonic", "Albert"] as DemoBrand[]).map((brand) => (
                    <Line key={brand} type="monotone" dataKey={brand} stroke={BRAND_COLORS[brand]} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: 14, color: "rgba(22,15,46,0.30)" }}>No data available</p>
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 18px", marginTop: 14 }}>
              {DEMO_BRANDS.map((brand) => (
                <div key={brand} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND_COLORS[brand], flexShrink: 0, display: "inline-block" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{brand}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right stat cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* LLM Visibility */}
            <div style={{ flex: 1, background: "#fff", borderRadius: 12, border: "1px solid rgba(22,15,46,0.08)", padding: "16px 18px", boxShadow: "0 1px 4px rgba(22,15,46,0.05)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(22,15,46,0.40)", marginBottom: 12 }}>
                LLM Visibility · 7 Days
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {loading
                  ? Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}><Sk w={8} h={8} r={99} /><Sk w={80} h={12} /><div style={{ flex: 1 }} /><Sk w={28} h={12} /></div>
                  ))
                  : (data?.totals ?? []).map((row) => {
                    const color = BRAND_COLORS[row.brand as DemoBrand] ?? ACCENT;
                    const max   = data!.totals[0]?.total_mentions ?? 1;
                    return (
                      <div key={row.brand}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: NAVY, flex: 1 }}>{row.brand}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{row.total_mentions.toLocaleString()}</span>
                        </div>
                        <div style={{ height: 3, borderRadius: 999, background: "rgba(22,15,46,0.07)", marginLeft: 14 }}>
                          <div style={{ height: 3, borderRadius: 999, background: color, width: `${(row.total_mentions / max) * 100}%`, opacity: 0.65 }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Avg Position */}
            <div style={{ flex: 1, background: "#fff", borderRadius: 12, border: "1px solid rgba(22,15,46,0.08)", padding: "16px 18px", boxShadow: "0 1px 4px rgba(22,15,46,0.05)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(22,15,46,0.40)", marginBottom: 2 }}>
                Avg Brand Position · 7 Days
              </p>
              <p style={{ fontSize: 10, color: "rgba(22,15,46,0.35)", marginBottom: 10 }}>(lower is better)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {loading
                  ? Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}><Sk w={8} h={8} r={99} /><Sk w={80} h={12} /><div style={{ flex: 1 }} /><Sk w={28} h={12} /></div>
                  ))
                  : (data?.positions ?? []).map((row, i) => {
                    const color = BRAND_COLORS[row.brand as DemoBrand] ?? ACCENT;
                    return (
                      <div key={row.brand} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: NAVY, flex: 1 }}>{row.brand}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: i === 0 ? "#059669" : NAVY }}>{row.avg_position.toFixed(1)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Use Case Share of Voice ── */}
        <div style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: NAVY, letterSpacing: "-0.015em", marginBottom: 5 }}>
            Use Case Share of Voice
          </h3>
          <p style={{ fontSize: 13, color: "rgba(22,15,46,0.50)", lineHeight: 1.55, maxWidth: 580, marginBottom: 20 }}>
            Which brand dominates AI recommendations within each marketing use case cluster — paid ads, content, lifecycle, and lead-gen. A higher share means that brand is recommended more than its competitors for that specific job.
          </p>
        </div>

        <div className="demo-sov-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 10 }}>
          <MiniDonut title="Ads & Paid Campaigns"         rows={data?.sovAds      ?? []} loading={loading} />
          <MiniDonut title="Content & Brand Voice"        rows={data?.sovContent   ?? []} loading={loading} />
          <MiniDonut title="Lifecycle & Retention Automation" rows={data?.sovLifecycle ?? []} loading={loading} />
          <MiniDonut title="Lead-Gen & Funnel"            rows={data?.sovLeadgen   ?? []} loading={loading} />
        </div>
        <p style={{ fontSize: 12, color: "rgba(22,15,46,0.38)", fontStyle: "italic", textAlign: "center", marginBottom: 44 }}>
          4 use case clusters tracked · 22 AI marketing agent brands · updated daily
        </p>

        {/* ── Product Feature Scores ── */}
        <div style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: NAVY, letterSpacing: "-0.015em", marginBottom: 5 }}>
            Product Feature Scores
          </h3>
          <p style={{ fontSize: 13, color: "rgba(22,15,46,0.50)", lineHeight: 1.55, maxWidth: 580, marginBottom: 20 }}>
            Each brand is scored 0–100 on agent capability, verified by asking AI models to assess documented features. Scores reflect how consistently AI describes each brand as having that capability — not a subjective rating.
          </p>
        </div>

        <div className="demo-feature-scroll" style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(22,15,46,0.08)", padding: "4px 24px 20px", boxShadow: "0 1px 4px rgba(22,15,46,0.05)", marginBottom: 44 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(22,15,46,0.07)" }}>
                <th style={{ textAlign: "left", padding: "16px 16px 12px 0", fontSize: 10, fontWeight: 700, color: "rgba(22,15,46,0.35)", textTransform: "uppercase" as const, letterSpacing: "0.09em", minWidth: 180 }}>
                  Feature
                </th>
                {DEMO_BRANDS.map((brand) => (
                  <th key={brand} style={{ padding: "16px 8px 12px", fontSize: 10, fontWeight: 700, color: BRAND_COLORS[brand], textTransform: "uppercase" as const, letterSpacing: "0.09em", whiteSpace: "nowrap" as const }}>
                    {brand}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_CLUSTERS.map((cluster) => (
                <>
                  {/* Cluster header row */}
                  <tr key={`hdr-${cluster.label}`}>
                    <td colSpan={6} style={{ padding: "18px 0 8px", fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase" as const, letterSpacing: "0.10em" }}>
                      {cluster.label}
                    </td>
                  </tr>
                  {cluster.features.map((feature, fi) => (
                    <tr key={`${cluster.label}-${fi}`} style={{ borderBottom: "1px solid rgba(22,15,46,0.045)" }}>
                      <td style={{ padding: "10px 16px 10px 0", fontSize: 13, fontWeight: 600, color: NAVY }}>
                        {feature.name}
                      </td>
                      {DEMO_BRANDS.map((brand) => {
                        const score = feature.scores[brand] ?? 0;
                        const color = BRAND_COLORS[brand];
                        return (
                          <td key={brand} style={{ padding: "10px 8px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 60, height: 5, background: "rgba(22,15,46,0.07)", borderRadius: 999, flexShrink: 0 }}>
                                <div style={{ width: `${score}%`, height: 5, background: color, borderRadius: 999 }} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontVariantNumeric: "tabular-nums" }}>
                                {score}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11, color: "rgba(22,15,46,0.38)", fontStyle: "italic", marginTop: 16, borderTop: "1px solid rgba(22,15,46,0.06)", paddingTop: 14 }}>
            6 capabilities scored per brand · verified across Claude Haiku and GPT-4o-mini · updated daily
          </p>
        </div>

        {/* ── Gradient CTA ── */}
        <div style={{
          background: "linear-gradient(135deg, #7C3AED 0%, #C2186A 100%)",
          borderRadius: 16,
          padding: "36px 40px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.88)", lineHeight: 1.6, marginBottom: 20, maxWidth: 520, margin: "0 auto 20px" }}>
            This is a live sample from our marketing AI agent pipeline — updated daily across Claude Haiku and GPT-4o-mini.
          </p>
          <a
            href="#contact"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 14, fontWeight: 700,
              color: ACCENT,
              background: "#fff",
              borderRadius: 999, padding: "12px 28px",
              textDecoration: "none",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.90"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
          >
            Request your brand&apos;s report →
          </a>
        </div>

      </div>
    </section>
  );
}
