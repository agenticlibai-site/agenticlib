import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import {
  getRalfiDailySummary,
  getRalfiWeeklySummary,
  getRalfiLLMVisibility,
  getRalfiSOVData,
  getRalfiCollectionHealth,
  initRalfiDB,
} from "@/lib/brand-visibility/db";
import RalfiVisibilityCharts from "../RalfiVisibilityCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ralfi Report: Insurance Broker AI Agent Visibility – AgenticLib",
  description:
    "Which AI agents appear when LLMs are asked about renewal management, document processing, and claims advocacy for insurance brokers.",
  robots: { index: false, follow: false },
};

const SALT = "|ralfi_gate_agenticlib_2026";

function computeToken(password: string): string {
  return createHash("sha256").update(password + SALT).digest("hex");
}

export default async function RalfiReportPage() {
  // ── Auth gate ────────────────────────────────────────────────────────────────
  const jar    = await cookies();
  const cookie = jar.get("ralfi_auth")?.value ?? "";
  const correct = process.env.RALFI_ACCESS_PASSWORD ?? "";
  const expected = correct ? computeToken(correct) : "";

  if (!cookie || !expected || cookie !== expected) {
    redirect("/product/ralfi-visibility/login");
  }

  // ── Data fetch ───────────────────────────────────────────────────────────────
  await initRalfiDB();

  const [dailySummary, weeklySummary, llmVisibility, sovData, health] = await Promise.all([
    getRalfiDailySummary(14),
    getRalfiWeeklySummary(),
    getRalfiLLMVisibility(),
    getRalfiSOVData(),
    getRalfiCollectionHealth(),
  ]);

  const now = new Date().toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Australia/Sydney",
  });

  return (
    <main className="min-h-screen page-gap-fix" style={{ background: "#F3FAF7" }}>

      {/* ── Header ── */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-0">
        <div style={{ marginBottom: 28 }}>
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}
          >
            Brand Intelligence · Insurance Brokers
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "#000000", letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Ralfi Report: Insurance Broker AI Agent Visibility
          </h1>
          <p className="text-base" style={{ color: "#444", lineHeight: 1.6, maxWidth: 580 }}>
            Which AI agents appear when Claude and GPT-4o-mini are asked about renewal management,
            document processing, risk submissions, claims advocacy, client communication, and compliance.
          </p>

          {/* Collection health strip */}
          <div
            style={{
              marginTop: 16,
              display: "inline-flex",
              flexWrap: "wrap" as const,
              gap: "6px 20px",
              fontSize: 13,
              color: "#333",
              background: "rgba(5,150,105,0.06)",
              border: "1px solid rgba(5,150,105,0.14)",
              borderRadius: 10,
              padding: "10px 16px",
            }}
          >
            <span><strong style={{ color: "#059669" }}>Days collected:</strong> {health.dates_collected}</span>
            <span><strong style={{ color: "#059669" }}>Total rows:</strong> {health.total_rows.toLocaleString()}</span>
            {health.model_breakdown.map((m) => (
              <span key={m.model}>
                <strong style={{ color: "#059669" }}>{m.model}:</strong> {m.row_count.toLocaleString()} rows
              </span>
            ))}
            {health.earliest_date && (
              <span>
                <strong style={{ color: "#059669" }}>Range:</strong>{" "}
                {health.earliest_date} → {health.latest_date}
              </span>
            )}
            <span style={{ color: "#888" }}>Updated {now} AEST</span>
          </div>
        </div>
      </div>

      {/* ── Charts (client component) ── */}
      <RalfiVisibilityCharts
        dailySummary={dailySummary}
        weeklySummary={weeklySummary}
        llmVisibility={llmVisibility}
        sovData={sovData}
      />

    </main>
  );
}
