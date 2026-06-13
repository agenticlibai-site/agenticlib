import { runBrandIntelligence } from "@/lib/run-brand-intelligence";
import { saveSnapshot } from "@/lib/db";
import { cache } from "@/app/api/brand-intelligence/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Clear the main route's in-memory cache so the next visitor gets fresh data
  cache.clear();

  const data = await runBrandIntelligence();
  await saveSnapshot(data.agents, "marketing");

  // Repopulate cache
  cache.set("marketing", { data, timestamp: Date.now() });

  return Response.json({
    success: true,
    timestamp: data.generatedAt,
    agents: data.agents.length,
  });
}
