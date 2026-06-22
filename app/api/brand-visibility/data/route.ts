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
