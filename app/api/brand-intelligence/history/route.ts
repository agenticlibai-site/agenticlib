import type { NextRequest } from "next/server";
import { getHistory } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const domain = searchParams.get("domain") ?? "marketing";
  const days   = Math.min(Math.max(parseInt(searchParams.get("days") ?? "7", 10), 1), 90);

  const rows = await getHistory(domain, days);

  // Group rows by date, then flatten to recharts-friendly objects
  const byDate = new Map<string, Record<string, number>>();
  for (const row of rows) {
    if (!byDate.has(row.recorded_date)) byDate.set(row.recorded_date, {});
    byDate.get(row.recorded_date)![row.agent_name] = row.visibility_score;
  }

  const chartData = [...byDate.entries()].map(([isoDate, agents]) => {
    const d = new Date(isoDate + "T12:00:00Z"); // noon UTC avoids DST edge
    const label = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    return { date: label, ...agents };
  });

  return Response.json(chartData);
}
