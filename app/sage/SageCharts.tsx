"use client";

import { useState } from "react";
import type { SOVRow, FeatureScoreRow, DexifyClusterRow } from "@/lib/brand-visibility/db";
import type { UseCaseBucketBrandRow } from "@/lib/skincare-visibility/db";

interface FeatureDef {
  feature_id:   string;
  feature_tag:  string;
  feature_name: string;
}

interface DomainConfig {
  id:    string;
  label: string;
  color: string;
  bg:    string;
  rgb:   string;
}

const DOMAINS: DomainConfig[] = [
  { id: "sales",     label: "Sales AI",     color: "#2563EB", bg: "rgba(37,99,235,0.09)",   rgb: "37,99,235"   },
  { id: "marketing", label: "Marketing AI", color: "#7C3AED", bg: "rgba(124,58,237,0.09)",  rgb: "124,58,237"  },
  { id: "dexify",    label: "Tradie AI",    color: "#EA580C", bg: "rgba(234,88,12,0.09)",   rgb: "234,88,12"   },
  { id: "skincare",  label: "Skincare AI",  color: "#BE185D", bg: "rgba(190,24,93,0.09)",   rgb: "190,24,93"   },
];

type DomainId = "sales" | "marketing" | "dexify" | "skincare";

const CLUSTERS: Record<DomainId, Record<string, string>> = {
  sales: {
    "sales-call":       "Sales Call Intelligence",
    "sales-crm":        "CRM & Pipeline Automation",
    "sales-pipeline":   "Pipeline Management",
    "sales-outreach":   "Outreach & Sequencing",
    "sales-enablement": "Sales Enablement",
    "technical":        "Technical Capabilities",
    "responsible-ai":   "Responsible AI",
    "cost":             "Cost & Pricing",
  },
  marketing: {
    "ads":            "Ads Management",
    "content":        "Content Creation",
    "lead-gen":       "Lead Generation",
    "lifecycle":      "Lifecycle & Retention",
    "technical":      "Technical Capabilities",
    "responsible-ai": "Responsible AI",
    "cost":           "Cost & Pricing",
  },
  dexify: {
    "dexify-voice-quote":  "Voice-to-Quote",
    "dexify-post-job":     "Post-Job Admin & Invoicing",
    "dexify-compliance":   "Compliance & Documentation",
    "dexify-client-comms": "Inbound & Client Comms",
  },
  skincare: {
    "routine-audit":        "Routine Audit",
    "personalized-routine": "Personalised Routine",
    "ingredient-analysis":  "Ingredient Analysis",
    "condition-specific":   "Condition-Specific",
    "tracking-progress":    "Tracking Progress",
  },
};

const SKINCARE_KEYS: Record<string, keyof UseCaseBucketBrandRow> = {
  "routine-audit":        "b1",
  "personalized-routine": "b2",
  "ingredient-analysis":  "b3",
  "condition-specific":   "b4",
  "tracking-progress":    "b5",
};

// ── Icons ──────────────────────────────────────────────────────────────────────

function SalesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 12l3.5-4 3 2.5L12 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="13" cy="4" r="1.5" fill="currentColor"/>
    </svg>
  );
}
function MarketingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 8h8M13 4l-3 4 3 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="2" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  );
}
function TradieIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M9.5 2.5l-7 7 1.5 1.5 7-7-1.5-1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 4l1.5-1.5 1 1L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11l-1 2 2-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function SkincareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DomainIcon({ id }: { id: string }) {
  if (id === "sales")     return <SalesIcon />;
  if (id === "marketing") return <MarketingIcon />;
  if (id === "dexify")    return <TradieIcon />;
  return <SkincareIcon />;
}

// ── Score pill ─────────────────────────────────────────────────────────────────

function ScorePill({ band, score }: { band: string; score: number }) {
  const styles: Record<string, { bg: string; color: string }> = {
    high:           { bg: "#16a34a", color: "#fff" },
    medium:         { bg: "#d97706", color: "#fff" },
    low:            { bg: "#dc2626", color: "#fff" },
    not_documented: { bg: "rgba(0,0,0,0.07)", color: "rgba(0,0,0,0.3)" },
  };
  const s = styles[band] ?? styles.not_documented;
  return (
    <span style={{
      display: "inline-block", minWidth: 34, textAlign: "center",
      padding: "2px 7px", borderRadius: 4, fontSize: 11.5, fontWeight: 700,
      background: s.bg, color: s.color,
    }}>
      {score ?? "–"}
    </span>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  marketingSOV:         SOVRow[];
  marketingFeatures:    FeatureScoreRow[];
  marketingFeatureDefs: FeatureDef[];
  salesClusters:        { bucket_tag: string; brand: string; avg_position: number; appearances: number }[];
  salesFeatures:        { brand_name: string; feature_id: string; feature_tag: string; score: number; score_band: string; evidence: string | null }[];
  salesFeatureDefs:     FeatureDef[];
  dexifyClusters:       DexifyClusterRow[];
  dexifyFeatures:       { brand_name: string; feature_id: string; feature_tag: string; score: number; score_band: string; evidence: string | null }[];
  dexifyFeatureDefs:    FeatureDef[];
  skincareClusters:     UseCaseBucketBrandRow[];
}

export default function SageCharts({
  marketingSOV, marketingFeatures, marketingFeatureDefs,
  salesClusters, salesFeatures, salesFeatureDefs,
  dexifyClusters, dexifyFeatures, dexifyFeatureDefs,
  skincareClusters,
}: Props) {
  const [domain, setDomain]   = useState<DomainId | null>(null);
  const [cluster, setCluster] = useState<string | null>(null);

  const activeDomain = DOMAINS.find(d => d.id === domain);
  const activeClusters = domain ? CLUSTERS[domain] : ({} as Record<string, string>);

  function selectDomain(id: DomainId) {
    setDomain(id);
    setCluster(null);
  }

  function getBrands(dom: DomainId, tag: string): { brand: string; rank: number }[] {
    if (dom === "sales") {
      return salesClusters
        .filter(r => r.bucket_tag === tag)
        .sort((a, b) => a.avg_position - b.avg_position)
        .slice(0, 12)
        .map((r, i) => ({ brand: r.brand, rank: i + 1 }));
    }
    if (dom === "marketing") {
      return marketingSOV
        .filter(r => r.bucket_tag === tag)
        .sort((a, b) => b.sov_pct - a.sov_pct)
        .slice(0, 12)
        .map((r, i) => ({ brand: r.brand, rank: i + 1 }));
    }
    if (dom === "dexify") {
      return dexifyClusters
        .filter(r => r.cluster_tag === tag)
        .sort((a, b) => b.total_mentions - a.total_mentions)
        .slice(0, 12)
        .map((r, i) => ({ brand: r.brand, rank: i + 1 }));
    }
    if (dom === "skincare") {
      const key = SKINCARE_KEYS[tag];
      if (!key) return [];
      return skincareClusters
        .filter(r => (r[key] as number) > 0)
        .sort((a, b) => (b[key] as number) - (a[key] as number))
        .slice(0, 12)
        .map((r, i) => ({ brand: r.brand, rank: i + 1 }));
    }
    return [];
  }

  function getFeatureDefs(dom: DomainId, tag: string): FeatureDef[] {
    if (dom === "sales")     return salesFeatureDefs.filter(f => f.feature_tag === tag);
    if (dom === "marketing") return marketingFeatureDefs.filter(f => f.feature_tag === tag);
    if (dom === "dexify")    return dexifyFeatureDefs.filter(f => f.feature_tag === tag);
    return [];
  }

  function getScoreMap(dom: DomainId, tag: string): Map<string, { score: number; score_band: string; evidence: string | null }> {
    const map = new Map<string, { score: number; score_band: string; evidence: string | null }>();
    const rows = dom === "sales" ? salesFeatures : dom === "marketing" ? marketingFeatures : dom === "dexify" ? dexifyFeatures : [];
    for (const r of rows) {
      if (r.feature_tag === tag) map.set(`${r.brand_name}::${r.feature_id}`, { score: r.score, score_band: r.score_band, evidence: r.evidence });
    }
    return map;
  }

  const visibleClusters = cluster
    ? Object.fromEntries(Object.entries(activeClusters).filter(([tag]) => tag === cluster))
    : activeClusters;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <aside style={{
        width: 192, background: "#0F1117", flexShrink: 0,
        display: "flex", flexDirection: "column", overflowY: "auto",
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, #7C3AED, #BE185D)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: "#fff",
            }}>S</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14.5, lineHeight: 1.2 }}>Sage</div>
              <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 10, marginTop: 2 }}>by AgenticLib</div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 20, padding: "3px 8px",
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ color: "#22c55e", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Domain nav */}
        <nav style={{ padding: "16px 10px", flex: 1 }}>
          <div style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)", marginBottom: 10, paddingLeft: 8,
          }}>
            Domains
          </div>

          {DOMAINS.map(d => {
            const isActive = domain === d.id;
            const domClusters = CLUSTERS[d.id as DomainId];
            return (
              <div key={d.id}>
                <button
                  onClick={() => selectDomain(d.id as DomainId)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 9,
                    padding: "9px 10px", borderRadius: 9, marginBottom: 2,
                    background: isActive ? `rgba(${d.rgb}, 0.15)` : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                    color: isActive ? d.color : "rgba(255,255,255,0.45)",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <span style={{ flexShrink: 0, display: "flex" }}><DomainIcon id={d.id} /></span>
                  <span style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500, flex: 1 }}>{d.label}</span>
                  {isActive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.color, flexShrink: 0 }} />}
                </button>

                {/* Use case sub-items */}
                {isActive && (
                  <div style={{ paddingLeft: 14, marginBottom: 6 }}>
                    <button
                      onClick={() => setCluster(null)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 7,
                        padding: "5px 10px", borderRadius: 7, marginBottom: 2,
                        background: cluster === null ? `rgba(${d.rgb}, 0.12)` : "transparent",
                        border: "none", cursor: "pointer", textAlign: "left",
                        color: cluster === null ? d.color : "rgba(255,255,255,0.3)",
                        fontSize: 12, fontWeight: cluster === null ? 700 : 400,
                        transition: "all 0.1s",
                      }}
                    >
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: cluster === null ? d.color : "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                      All use cases
                    </button>
                    {Object.entries(domClusters).map(([tag, label]) => (
                      <button
                        key={tag}
                        onClick={() => setCluster(cluster === tag ? null : tag)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 7,
                          padding: "5px 10px", borderRadius: 7, marginBottom: 2,
                          background: cluster === tag ? `rgba(${d.rgb}, 0.12)` : "transparent",
                          border: "none", cursor: "pointer", textAlign: "left",
                          color: cluster === tag ? d.color : "rgba(255,255,255,0.3)",
                          fontSize: 12, fontWeight: cluster === tag ? 600 : 400,
                          transition: "all 0.1s",
                        }}
                      >
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: cluster === tag ? d.color : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1, background: "#F3F4F9", overflowY: "auto", padding: "22px 16px" }}>
        {!domain ? (
          /* Empty state */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: "linear-gradient(135deg, rgba(124,58,237,0.10), rgba(190,24,93,0.10))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="rgba(0,0,0,0.22)" strokeWidth="2"/>
                <path d="M21 21l-4-4" stroke="rgba(0,0,0,0.22)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#000", margin: "0 0 6px" }}>Select a domain to get started</p>
              <p style={{ fontSize: 13.5, color: "rgba(0,0,0,0.4)", margin: 0 }}>Choose Sales AI, Marketing AI, Tradie AI, or Skincare AI from the sidebar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h1 style={{ fontSize: 20, fontWeight: 800, color: "#000", margin: 0, letterSpacing: "-0.02em" }}>
                    {activeDomain?.label} Intelligence
                  </h1>
                  {cluster && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: activeDomain?.bg, color: activeDomain?.color,
                      letterSpacing: "0.04em", textTransform: "uppercase",
                    }}>
                      {activeClusters[cluster]}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)", margin: 0 }}>
                  {cluster
                    ? `Filtered to: ${activeClusters[cluster]}`
                    : `${Object.keys(activeClusters).length} use cases · select one in the sidebar to focus`}
                </p>
              </div>
            </div>

            {/* Use case cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(visibleClusters).map(([tag, label]) => {
                const brands     = getBrands(domain, tag);
                const featureDefs = getFeatureDefs(domain, tag);
                const scoreMap   = getScoreMap(domain, tag);
                const isSkincare = domain === "skincare";
                const hasFeatures = !isSkincare && featureDefs.length > 0 && brands.length > 0;

                return (
                  <div key={tag} style={{
                    background: "#fff", borderRadius: 14,
                    border: "1px solid rgba(0,0,0,0.07)",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                    {/* Card header */}
                    <div style={{
                      padding: "13px 18px",
                      borderBottom: brands.length > 0 ? "1px solid rgba(0,0,0,0.05)" : "none",
                      display: "flex", alignItems: "center", gap: 10,
                      background: "rgba(0,0,0,0.01)",
                    }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: activeDomain?.bg, borderRadius: 20, padding: "4px 11px",
                      }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: activeDomain?.color }} />
                        <span style={{
                          fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em",
                          textTransform: "uppercase", color: activeDomain?.color,
                        }}>
                          {label}
                        </span>
                      </div>
                      <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(0,0,0,0.28)", fontWeight: 500 }}>
                        {brands.length > 0 ? `${brands.length} brands ranked` : "No data yet"}
                      </span>
                    </div>

                    {brands.length === 0 ? (
                      <div style={{
                        padding: "18px 18px", display: "flex", alignItems: "center", gap: 8,
                        color: "rgba(0,0,0,0.3)",
                      }}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>No data collected yet for this use case</span>
                      </div>
                    ) : domain === "dexify" && hasFeatures ? (
                      /* ── Dexify: feature-first bar chart layout ─────────── */
                      <div>
                        {featureDefs.map((f, fi) => (
                          <div key={f.feature_id} style={{
                            padding: "18px 20px",
                            borderBottom: fi < featureDefs.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                          }}>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#000", marginBottom: 14 }}>
                              {f.feature_name}
                            </div>
                            {brands.map((b, bi) => {
                              const s = scoreMap.get(`${b.brand}::${f.feature_id}`);
                              const isNotDoc = !s || s.score_band === "not_documented";
                              const barPct   = s?.score ?? 0;
                              const barColor = s?.score_band === "high"   ? "#16a34a"
                                             : s?.score_band === "medium" ? "#d97706"
                                             : s?.score_band === "low"    ? "#dc2626"
                                             : "rgba(0,0,0,0.10)";
                              const textColor = isNotDoc ? "rgba(0,0,0,0.25)" : barColor;
                              return (
                                <div key={b.brand} style={{ marginBottom: bi < brands.length - 1 ? 16 : 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: s?.evidence ? 5 : 0 }}>
                                    <span style={{
                                      width: 130, fontSize: 13, fontWeight: 500,
                                      color: "#000", flexShrink: 0, lineHeight: 1.3,
                                    }}>
                                      {b.brand}
                                    </span>
                                    <div style={{
                                      flex: 1, height: 7, background: "rgba(0,0,0,0.07)",
                                      borderRadius: 4, overflow: "hidden",
                                    }}>
                                      <div style={{
                                        height: "100%", width: `${barPct}%`,
                                        background: barColor, borderRadius: 4,
                                      }} />
                                    </div>
                                    <span style={{
                                      width: 32, textAlign: "right", fontSize: 14,
                                      fontWeight: 700, color: textColor, flexShrink: 0,
                                    }}>
                                      {s?.score ?? "–"}
                                    </span>
                                  </div>
                                  {s?.evidence && (
                                    <div style={{
                                      marginLeft: 144, fontSize: 12,
                                      color: "rgba(0,0,0,0.5)", lineHeight: 1.6,
                                    }}>
                                      {s.evidence}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ) : hasFeatures ? (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                              <th style={{
                                textAlign: "left", padding: "8px 10px 8px 18px",
                                fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 10.5,
                                letterSpacing: "0.05em", textTransform: "uppercase",
                                borderBottom: "1px solid rgba(0,0,0,0.05)", width: 30,
                              }}>#</th>
                              <th style={{
                                textAlign: "left", padding: "8px 12px",
                                fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 10.5,
                                letterSpacing: "0.05em", textTransform: "uppercase",
                                borderBottom: "1px solid rgba(0,0,0,0.05)",
                              }}>Brand</th>
                              {featureDefs.map(f => (
                                <th key={f.feature_id} style={{
                                  textAlign: "center", padding: "8px 10px",
                                  fontWeight: 700, color: "rgba(0,0,0,0.38)", fontSize: 10,
                                  letterSpacing: "0.04em", textTransform: "uppercase",
                                  borderBottom: "1px solid rgba(0,0,0,0.05)", whiteSpace: "nowrap",
                                }}>
                                  {f.feature_name.split(" ").slice(0, 3).join(" ")}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {brands.map((b, i) => (
                              <tr key={b.brand} style={{ borderBottom: i < brands.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                                <td style={{ padding: "10px 10px 10px 18px", color: "rgba(0,0,0,0.28)", fontSize: 12, fontWeight: 600 }}>
                                  {b.rank}
                                </td>
                                <td style={{ padding: "10px 12px", fontWeight: 600, color: "#000", whiteSpace: "nowrap" }}>
                                  {b.brand}
                                </td>
                                {featureDefs.map(f => {
                                  const s = scoreMap.get(`${b.brand}::${f.feature_id}`);
                                  return (
                                    <td key={f.feature_id} style={{ padding: "10px", textAlign: "center" }}>
                                      {s ? (
                                        <span title={s.evidence ?? undefined}>
                                          <ScorePill band={s.score_band} score={s.score} />
                                        </span>
                                      ) : (
                                        <span style={{ color: "rgba(0,0,0,0.15)", fontSize: 12 }}>–</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* Skincare / no features: ranked list */
                      <div>
                        {brands.map((b, i) => (
                          <div key={b.brand} style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "10px 18px",
                            borderBottom: i < brands.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                          }}>
                            <span style={{
                              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                              background: b.rank <= 3 ? activeDomain?.bg : "rgba(0,0,0,0.04)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700,
                              color: b.rank <= 3 ? activeDomain?.color : "rgba(0,0,0,0.3)",
                            }}>
                              {b.rank}
                            </span>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#000" }}>{b.brand}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Score legend */}
            {domain !== "skincare" && (
              <div style={{
                marginTop: 18, display: "flex", gap: 16, flexWrap: "wrap",
                padding: "12px 16px", background: "#fff", borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.06)", alignItems: "center",
              }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(0,0,0,0.32)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Feature Score
                </span>
                {[
                  ["#16a34a", "High (80–100)"],
                  ["#d97706", "Medium (40–79)"],
                  ["#dc2626", "Low (0–39)"],
                  ["rgba(0,0,0,0.12)", "Not documented"],
                ].map(([color, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "rgba(0,0,0,0.4)" }}>
                    <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: color }} />
                    {label}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <aside style={{
        width: 210, background: "#fff", borderLeft: "1px solid rgba(0,0,0,0.07)",
        padding: "22px 14px", overflowY: "auto", flexShrink: 0,
      }}>
        <div style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "rgba(0,0,0,0.28)", marginBottom: 18,
        }}>
          Overview
        </div>

        {!domain ? (
          /* Domain quick-pick */
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DOMAINS.map(d => (
              <button
                key={d.id}
                onClick={() => selectDomain(d.id as DomainId)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 12px", borderRadius: 10,
                  border: `1px solid rgba(${d.rgb}, 0.18)`,
                  background: d.bg, cursor: "pointer", textAlign: "left", width: "100%",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(0,0,0,0.38)", marginTop: 1 }}>
                    {Object.keys(CLUSTERS[d.id as DomainId]).length} use cases
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Domain summary */}
            <div style={{
              background: activeDomain?.bg, borderRadius: 12,
              padding: "14px 14px", marginBottom: 22,
              border: `1px solid rgba(${activeDomain?.rgb}, 0.15)`,
            }}>
              <div style={{
                fontSize: 10.5, fontWeight: 800, color: activeDomain?.color,
                marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                {activeDomain?.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#000", lineHeight: 1, marginBottom: 4 }}>
                {Object.keys(activeClusters).length}
              </div>
              <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>Use cases tracked</div>
            </div>

            {/* Agent Activity */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(0,0,0,0.28)", marginBottom: 12,
              }}>
                Agent Activity
              </div>
              {[
                { label: "LLM Scanning",         status: "Live",      color: "#16a34a" },
                { label: "Feature Scoring",       status: "Live",      color: "#16a34a" },
                { label: "Sentiment Analysis",    status: "Live",      color: "#16a34a" },
                { label: "Visibility Aggregate",  status: "Scheduled", color: "#d97706" },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: 12.5,
                }}>
                  <span style={{ color: "rgba(0,0,0,0.6)", fontWeight: 500 }}>{item.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.color }} />
                    <span style={{ color: item.color, fontWeight: 700, fontSize: 11 }}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Use case list */}
            <div>
              <div style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(0,0,0,0.28)", marginBottom: 10,
              }}>
                Use Cases
              </div>
              {Object.entries(activeClusters).map(([tag, label]) => {
                const count = getBrands(domain, tag).length;
                const isSelected = cluster === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setCluster(isSelected ? null : tag)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 10px", borderRadius: 8, marginBottom: 3,
                      background: isSelected ? activeDomain?.bg : "transparent",
                      border: "none", cursor: "pointer", textAlign: "left",
                      transition: "all 0.12s",
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.03)"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <span style={{
                      fontSize: 12.5, fontWeight: isSelected ? 700 : 400,
                      color: isSelected ? activeDomain?.color : "rgba(0,0,0,0.55)",
                      lineHeight: 1.3,
                    }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 6,
                      color: count > 0 ? activeDomain?.color : "rgba(0,0,0,0.2)",
                      background: count > 0 ? activeDomain?.bg : "rgba(0,0,0,0.04)",
                      borderRadius: 20, padding: "1px 8px",
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
