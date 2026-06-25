import {
  getSkincareDailySummary,
  getSkincareWeeklySummary,
  getSkincareLLMVisibility,
  initSkincareDB,
} from "@/lib/skincare-visibility/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initSkincareDB();

    const [dailySummary, weeklySummary, llmVisibility] = await Promise.all([
      getSkincareDailySummary(7),
      getSkincareWeeklySummary(),
      getSkincareLLMVisibility(),
    ]);

    return Response.json({ dailySummary, weeklySummary, llmVisibility });
  } catch (err) {
    console.error("skincare-visibility data API error:", err);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
