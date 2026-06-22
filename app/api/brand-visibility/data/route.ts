// TODO: Switch to getCohortDailySummary / getCohortWeeklySummary once top_15_brands is populated
// (see getEligibleBrandsForTop15 in db.ts). Do not switch before ~7 days of data have accumulated.
import { getDailySummary, getWeeklySummary, getLLMVisibility, initBrandVisibilityDB } from "@/lib/brand-visibility/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initBrandVisibilityDB();

    const [dailySummary, weeklySummary, llmVisibility] = await Promise.all([
      getDailySummary(7),
      getWeeklySummary(),
      getLLMVisibility(),
    ]);

    return Response.json({ dailySummary, weeklySummary, llmVisibility });
  } catch (err) {
    console.error("brand-visibility data API error:", err);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
