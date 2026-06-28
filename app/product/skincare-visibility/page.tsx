import Link from "next/link";
import { sql } from "@vercel/postgres";
import {
  getSkincareDailySummary,
  getSkincareWeeklySummary,
  getSkincareLLMVisibility,
  getSkincareUseCaseBuckets,
  initSkincareDB,
  type UseCaseBucketBrandRow,
} from "@/lib/skincare-visibility/db";
import SkincareVisibilityCharts from "./SkincareVisibilityCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Skincare Brand Visibility",
  description: "Track how AI skincare agent brands appear across Claude and GPT-4o mini responses over time.",
};

interface RawBrandRow { brand: string; mentions: number; model: string; }

async function getData() {
  try {
    await initSkincareDB();
    const today = new Date().toISOString().split("T")[0];
    const [dailySummary, weeklySummary, llmVisibility, useCaseBuckets, rawResult, metaResult] = await Promise.all([
      getSkincareDailySummary(7),
      getSkincareWeeklySummary(),
      getSkincareLLMVisibility(),
      getSkincareUseCaseBuckets(),
      // Direct read from raw_responses — available the moment collection runs, before aggregation
      sql`
        SELECT brand_name AS brand, model, COUNT(*)::int AS mentions
        FROM skincare_raw_responses r,
             jsonb_array_elements_text(r.brands) AS brand_name
        WHERE r.date = ${today}::date
        GROUP BY brand_name, model
        ORDER BY mentions DESC
        LIMIT 50
      `,
      sql`
        SELECT model, COUNT(*)::int AS rows,
               MAX(created_at AT TIME ZONE 'UTC') AS last_write
        FROM skincare_raw_responses
        WHERE date = ${today}::date
        GROUP BY model
      `,
    ]);
    return {
      dailySummary,
      weeklySummary,
      llmVisibility,
      useCaseBuckets,
      rawBrands: rawResult.rows as RawBrandRow[],
      rawMeta: metaResult.rows as { model: string; rows: number; last_write: string }[],
      today,
    };
  } catch {
    return { dailySummary: [], weeklySummary: [], llmVisibility: [], useCaseBuckets: [] as UseCaseBucketBrandRow[], rawBrands: [], rawMeta: [], today: "" };
  }
}

const ROSE = "#C2186A";
const DARK = "#160F2E";

function fmtModel(m: string) {
  return m === "claude-haiku-4-5" ? "Claude Haiku" : m === "gpt-4o-mini" ? "GPT-4o mini" : m;
}

export default async function SkincareVisibilityPage() {
  const { dailySummary, weeklySummary, llmVisibility, useCaseBuckets, rawBrands, rawMeta, today } = await getData();

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #FDE8F2 0%, #FFF0F8 45%, #FFF8FC 100%)" }}
    >
      {/* Background grain */}
      <svg className="pointer-events-none fixed inset-0 w-full h-full z-0" style={{ opacity: 0.10 }} aria-hidden="true">
        <filter id="grain-sv">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-sv)" />
      </svg>

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div style={{ position: "absolute", top: "-80px", right: "-120px", width: "600px", height: "600px", borderRadius: "50%", background: "rgba(194,24,106,0.07)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(232,68,122,0.06)", filter: "blur(70px)" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5 flex items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ textDecoration: "none", background: "white", borderRadius: 8, padding: "8px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", color: "#C2186A" }}
        >
          ← AgenticLib
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="mb-10">
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(194,24,106,0.10)", color: "#C2186A" }}
          >
            Skincare Intelligence
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "#160F2E", letterSpacing: "-0.02em" }}>
            Skincare Brand Visibility
          </h1>
          <p className="text-base max-w-xl" style={{ color: "rgba(22,15,46,0.6)", lineHeight: 1.6 }}>
            How AI skincare agent brands appear in Claude and GPT-4o mini responses across 13 prompts,
            3 runs each, collected daily.
          </p>
        </div>

        {/* ── Today's raw collection — always visible, no aggregate needed ── */}
        {rawBrands.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: DARK, letterSpacing: "-0.01em", margin: 0 }}>
                Today&apos;s Raw Collection
              </h2>
              <span style={{ fontSize: 11, fontWeight: 600, background: "rgba(194,24,106,0.10)", color: ROSE, borderRadius: 999, padding: "3px 10px", letterSpacing: "0.04em" }}>
                {today}
              </span>
            </div>

            {/* Per-model status pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {(["claude-haiku-4-5", "gpt-4o-mini"] as const).map(m => {
                const meta = rawMeta.find(r => r.model === m);
                const done = meta && meta.rows >= 39;
                return (
                  <div key={m} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: done ? "rgba(5,150,105,0.08)" : "rgba(22,15,46,0.05)",
                    border: `1px solid ${done ? "rgba(5,150,105,0.20)" : "rgba(22,15,46,0.10)"}`,
                    borderRadius: 999, padding: "5px 12px",
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: done ? "#059669" : "#94A3B8", flexShrink: 0, display: "inline-block" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: done ? "#065f46" : "rgba(22,15,46,0.45)" }}>
                      {fmtModel(m)} — {meta ? `${meta.rows}/39 rows` : "pending"}
                    </span>
                  </div>
                );
              })}
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(22,15,46,0.04)", border: "1px solid rgba(22,15,46,0.09)", borderRadius: 999, padding: "5px 12px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: dailySummary.length > 0 ? "#059669" : "#94A3B8", flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: dailySummary.length > 0 ? "#065f46" : "rgba(22,15,46,0.45)" }}>
                  Aggregate — {dailySummary.length > 0 ? "complete" : "pending"}
                </span>
              </div>
            </div>

            {/* Brand mention table, grouped by model */}
            {(["gpt-4o-mini", "claude-haiku-4-5"] as const).map(model => {
              const brands = rawBrands.filter(r => r.model === model);
              if (brands.length === 0) return null;
              const top = brands.slice(0, 20);
              const maxMentions = top[0]?.mentions ?? 1;
              return (
                <div key={model} style={{
                  background: "#fff",
                  borderRadius: 10,
                  boxShadow: "0 2px 8px rgba(22,15,46,0.07)",
                  marginBottom: 14,
                  overflow: "hidden",
                }}>
                  <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(22,15,46,0.07)", background: "rgba(22,15,46,0.018)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{fmtModel(model)}</span>
                    <span style={{ fontSize: 11, color: "rgba(22,15,46,0.40)" }}>raw mentions today · pre-aggregation · top 20</span>
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    {top.map((row, i) => (
                      <div key={row.brand} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 20px", borderBottom: i < top.length - 1 ? "1px solid rgba(22,15,46,0.04)" : undefined }}>
                        <span style={{ fontSize: 11, color: "rgba(22,15,46,0.28)", fontWeight: 700, minWidth: 18, textAlign: "right" }}>{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: DARK, minWidth: 160 }}>{row.brand}</span>
                        <div style={{ flex: 1, height: 5, background: "rgba(22,15,46,0.06)", borderRadius: 999 }}>
                          <div style={{ height: 5, borderRadius: 999, background: ROSE, width: `${(row.mentions / maxMentions) * 100}%`, opacity: 0.75 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: ROSE, minWidth: 28, textAlign: "right" }}>{row.mentions}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Aggregated charts (populated after daily aggregate runs) ── */}
        <SkincareVisibilityCharts
          dailySummary={dailySummary}
          weeklySummary={weeklySummary}
          llmVisibility={llmVisibility}
          useCaseBuckets={useCaseBuckets}
        />
      </div>
    </main>
  );
}
