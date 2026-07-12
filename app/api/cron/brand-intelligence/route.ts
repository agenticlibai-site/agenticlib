import { runBrandIntelligence } from "@/lib/run-brand-intelligence";
import { saveSnapshot } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await runBrandIntelligence();
  await saveSnapshot(data.agents, "marketing");

  return Response.json({
    success: true,
    timestamp: data.generatedAt,
    agents: data.agents.length,
  });
}
