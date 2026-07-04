import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";

/**
 * POST /api/brand-visibility/audit/add-locked-agent
 *
 * Adds a brand to locked_marketing_agents (the curated cohort shown on the
 * brand-visibility page). Also ensures the brand exists in canonical_brands
 * and brand_aliases so historical and future collection data maps to it.
 *
 * Body: { brand_name: string, display_name?: string, dominant_tag: string }
 *   brand_name    — canonical name, e.g. "Jasper"
 *   display_name  — UI label; defaults to brand_name if omitted
 *   dominant_tag  — primary use-case cluster: "content" | "ads" | "lead-gen" | "lifecycle" | "seo" | "social" | "overall"
 *
 * GET /api/brand-visibility/audit/add-locked-agent?brand=Jasper
 *   Returns a diagnostic: is the brand in locked_marketing_agents, canonical_brands,
 *   brand_denylist, and how many daily_summary rows exist for it.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 */

async function checkBrand(brand: string) {
  const [locked, canonical, denied, summary] = await Promise.all([
    sql`SELECT brand_name, display_name, rank, dominant_tag FROM locked_marketing_agents WHERE brand_name = ${brand}`,
    sql`SELECT id, display_name, normalized_name FROM canonical_brands WHERE display_name ILIKE ${brand}`,
    sql`SELECT brand_name FROM brand_denylist WHERE brand_name ILIKE ${brand}`,
    sql`SELECT COUNT(*)::int AS rows, MAX(date)::text AS latest FROM daily_summary WHERE brand ILIKE ${brand}`,
  ]);
  return {
    in_locked_marketing_agents: locked.rows[0] ?? null,
    in_canonical_brands:        canonical.rows[0] ?? null,
    in_brand_denylist:          denied.rows[0] ?? null,
    daily_summary:              summary.rows[0],
  };
}

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  if (!brand) return Response.json({ error: "?brand=<name> required" }, { status: 400 });

  const maxRankResult = await sql`SELECT COALESCE(MAX(rank), 0)::int AS max_rank FROM locked_marketing_agents`;
  const max_rank = (maxRankResult.rows[0] as { max_rank: number }).max_rank;

  return Response.json({ brand, next_available_rank: max_rank + 1, ...(await checkBrand(brand)) });
}

export async function POST(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as { brand_name?: string; display_name?: string; dominant_tag?: string; rank?: number };
  const { brand_name, dominant_tag } = body;
  const display_name = body.display_name ?? brand_name;

  if (!brand_name || !dominant_tag) {
    return Response.json({ error: "brand_name and dominant_tag are required" }, { status: 400 });
  }

  const VALID_TAGS = ["content", "ads", "lead-gen", "lifecycle", "seo", "social", "overall", "analytics"];
  if (!VALID_TAGS.includes(dominant_tag)) {
    return Response.json({ error: `dominant_tag must be one of: ${VALID_TAGS.join(", ")}` }, { status: 400 });
  }

  // Determine rank — use provided value or next available
  let rank = body.rank;
  if (!rank) {
    const res = await sql`SELECT COALESCE(MAX(rank), 0)::int AS max_rank FROM locked_marketing_agents`;
    rank = (res.rows[0] as { max_rank: number }).max_rank + 1;
  }

  // 1. Ensure canonical_brands entry exists
  await sql`
    INSERT INTO canonical_brands (display_name, normalized_name)
    VALUES (${brand_name}, ${brand_name.toLowerCase().trim()})
    ON CONFLICT (normalized_name) DO NOTHING
  `;

  // 2. Ensure brand_aliases entry exists (maps raw "Jasper" → canonical)
  const canonical = await sql`SELECT id FROM canonical_brands WHERE normalized_name = ${brand_name.toLowerCase().trim()}`;
  const canonicalId = (canonical.rows[0] as { id: number })?.id;
  if (canonicalId) {
    await sql`
      INSERT INTO brand_aliases (raw_name, canonical_id)
      VALUES (${brand_name}, ${canonicalId})
      ON CONFLICT (raw_name) DO NOTHING
    `;
  }

  // 3. Insert into locked_marketing_agents
  await sql`
    INSERT INTO locked_marketing_agents (brand_name, display_name, rank, dominant_tag)
    VALUES (${brand_name}, ${display_name}, ${rank}, ${dominant_tag})
    ON CONFLICT (brand_name) DO UPDATE
      SET display_name  = EXCLUDED.display_name,
          rank          = EXCLUDED.rank,
          dominant_tag  = EXCLUDED.dominant_tag
  `;

  const after = await checkBrand(brand_name);

  return Response.json({ ok: true, brand_name, display_name, rank, dominant_tag, ...after });
}
