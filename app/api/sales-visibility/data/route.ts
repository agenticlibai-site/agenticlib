import {
  getSalesDailySummary,
  getSalesWeeklySummary,
  getSalesLLMVisibility,
  getSalesSOVData,
} from "@/lib/brand-visibility/db";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // 24 h

export async function GET() {
  try {
    const [dailySummary, weeklySummary, llmVisibility, sovData] = await Promise.all([
      getSalesDailySummary(7),
      getSalesWeeklySummary(),
      getSalesLLMVisibility(),
      getSalesSOVData(),
    ]);

    // Top brands by 7-day mention volume (aggregated across models)
    const totals: Record<string, { mentions: number; avgPos: number | null }> = {};
    for (const row of weeklySummary) {
      const e = totals[row.brand] ?? { mentions: 0, avgPos: null };
      totals[row.brand] = {
        mentions: e.mentions + row.mention_count,
        avgPos:   row.avg_position ?? e.avgPos,
      };
    }
    const topBrands = Object.entries(totals)
      .sort((a, b) => b[1].mentions - a[1].mentions)
      .slice(0, 25)
      .map(([brand, s], i) => ({ rank: i + 1, brand, total_mentions: s.mentions, avg_position: s.avgPos }));

    const totalMentions = topBrands.reduce((s, b) => s + b.total_mentions, 0);

    return Response.json({
      dailySummary,
      weeklySummary,
      llmVisibility,
      sovData,
      topBrands,
      totalMentions,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
