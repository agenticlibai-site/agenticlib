import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";

/**
 * POST /api/brand-visibility/audit/patch-locked-agent
 *
 * One-time patch: updates a single field on a locked_marketing_agents row.
 * Delete this route after use.
 *
 * Body: { brand_name: string, field: "dominant_tag", value: string }
 * Auth: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as { brand_name?: string; field?: string; value?: string };
  const { brand_name, field, value } = body;

  if (!brand_name || !field || value === undefined) {
    return Response.json({ error: "brand_name, field, value required" }, { status: 400 });
  }

  if (field !== "dominant_tag") {
    return Response.json({ error: "Only dominant_tag may be patched via this route" }, { status: 400 });
  }

  // Read current state first
  const before = await sql`SELECT brand_name, dominant_tag FROM locked_marketing_agents WHERE brand_name = ${brand_name}`;
  if (before.rowCount === 0) {
    return Response.json({ error: `No row found for brand_name = '${brand_name}'` }, { status: 404 });
  }

  await sql`UPDATE locked_marketing_agents SET dominant_tag = ${value} WHERE brand_name = ${brand_name}`;

  const after = await sql`SELECT brand_name, dominant_tag FROM locked_marketing_agents WHERE brand_name = ${brand_name}`;

  return Response.json({
    brand_name,
    before: before.rows[0],
    after: after.rows[0],
  });
}
