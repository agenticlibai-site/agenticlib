import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";

/**
 * GET  /api/brand-visibility/audit/rename-cluster   — preview: SELECT counts only
 * POST /api/brand-visibility/audit/rename-cluster   — apply:   all three UPDATEs
 *
 * Renames 'overall' / 'overall-roi' → 'lifecycle' across three tables:
 *   1. locked_marketing_agents  (dominant_tag)
 *   2. raw_responses            (bucket_tag)
 *   3. sentiment_responses      (bucket_tag)
 *
 * Delete this route after migration is confirmed.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 */

async function requireAuth(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) return false;
  return true;
}

export async function GET(request: Request) {
  if (!await requireAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [agents, rawResponses, sentimentResponses] = await Promise.all([
    sql`SELECT brand_name, dominant_tag, rank FROM locked_marketing_agents WHERE dominant_tag = 'overall' ORDER BY rank`,
    sql`SELECT COUNT(*)::int AS count FROM raw_responses WHERE bucket_tag = 'overall-roi'`,
    sql`SELECT COUNT(*)::int AS count FROM sentiment_responses WHERE bucket_tag = 'overall-roi'`,
  ]);

  return Response.json({
    action: "preview — no changes made",
    locked_marketing_agents: { rows_to_update: agents.rowCount, brands: agents.rows },
    raw_responses:            { rows_to_update: rawResponses.rows[0].count },
    sentiment_responses:      { rows_to_update: sentimentResponses.rows[0].count },
  });
}

export async function POST(request: Request) {
  if (!await requireAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Snapshot before
  const agentsBefore = await sql`
    SELECT brand_name, dominant_tag, rank
    FROM locked_marketing_agents
    WHERE dominant_tag = 'overall'
    ORDER BY rank
  `;

  // Run all three updates
  const [agentsUpdate, rawUpdate, sentimentUpdate] = await Promise.all([
    sql`UPDATE locked_marketing_agents SET dominant_tag = 'lifecycle' WHERE dominant_tag = 'overall'`,
    sql`UPDATE raw_responses            SET bucket_tag  = 'lifecycle' WHERE bucket_tag  = 'overall-roi'`,
    sql`UPDATE sentiment_responses      SET bucket_tag  = 'lifecycle' WHERE bucket_tag  = 'overall-roi'`,
  ]);

  // Verify after
  const [agentsAfter, orphanedOverall, orphanedOverallRoi] = await Promise.all([
    sql`SELECT brand_name, dominant_tag, rank FROM locked_marketing_agents WHERE dominant_tag = 'lifecycle' ORDER BY rank`,
    sql`SELECT COUNT(*)::int AS count FROM locked_marketing_agents WHERE dominant_tag = 'overall'`,
    sql`SELECT COUNT(*)::int AS count FROM raw_responses WHERE bucket_tag = 'overall-roi'`,
  ]);

  return Response.json({
    action: "UPDATE applied",
    locked_marketing_agents: {
      rows_updated: agentsUpdate.rowCount,
      brands_before: agentsBefore.rows,
      brands_after:  agentsAfter.rows,
      orphaned_overall_remaining: orphanedOverall.rows[0].count,
    },
    raw_responses: {
      rows_updated: rawUpdate.rowCount,
      orphaned_overall_roi_remaining: orphanedOverallRoi.rows[0].count,
    },
    sentiment_responses: {
      rows_updated: sentimentUpdate.rowCount,
    },
  });
}
