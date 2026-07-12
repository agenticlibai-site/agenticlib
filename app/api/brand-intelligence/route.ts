import { runBrandIntelligence, type BrandIntelligenceData } from "@/lib/run-brand-intelligence";
import { saveSnapshot } from "@/lib/db";

// Re-export types so the component can still import from this path
export type { AgentResult, BrandIntelligenceData, TopUseCase } from "@/lib/run-brand-intelligence";

// ── In-memory cache ───────────────────────────────────────────────────────────

export const cache = new Map<string, { data: BrandIntelligenceData; timestamp: number }>();
const CACHE_TTL = 86_400_000; // 24 hours
cache.clear();

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const hit = cache.get("marketing");
  if (hit && Date.now() - hit.timestamp < CACHE_TTL) {
    return Response.json(hit.data);
  }

  const data = await runBrandIntelligence();
  cache.set("marketing", { data, timestamp: Date.now() });

  // Persist to DB — non-blocking so a DB error never breaks the API response
  saveSnapshot(data.agents, "marketing").catch(err =>
    console.error("[db] saveSnapshot failed:", err instanceof Error ? err.message : err)
  );

  return Response.json(data);
}
