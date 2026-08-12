import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";

/**
 * One-shot idempotent migration endpoint.
 * Run once to add any columns that the init-function memoisation cache prevented
 * from being applied to already-running processes.
 *
 * Safe to run multiple times — all statements use IF NOT EXISTS / DO NOTHING.
 * Authorised by CRON_SECRET in the Authorization header.
 *
 * Usage:
 *   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/admin/migrate
 */
export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { statement: string; ok: boolean; error?: string }[] = [];

  async function run(label: string, stmt: ReturnType<typeof sql>) {
    try {
      await stmt;
      results.push({ statement: label, ok: true });
    } catch (err) {
      results.push({ statement: label, ok: false, error: String(err) });
    }
  }

  // ── terminology_tags columns ──────────────────────────────────────────────────
  await run(
    "feature_responses.terminology_tags",
    sql`ALTER TABLE feature_responses ADD COLUMN IF NOT EXISTS terminology_tags TEXT[]`,
  );
  await run(
    "sales_feature_responses.terminology_tags",
    sql`ALTER TABLE sales_feature_responses ADD COLUMN IF NOT EXISTS terminology_tags TEXT[]`,
  );
  await run(
    "dexify_feature_responses.terminology_tags",
    sql`ALTER TABLE dexify_feature_responses ADD COLUMN IF NOT EXISTS terminology_tags TEXT[]`,
  );

  const failed = results.filter(r => !r.ok);
  return Response.json({
    ok:      failed.length === 0,
    results,
    summary: `${results.length - failed.length}/${results.length} statements succeeded`,
  }, { status: failed.length === 0 ? 200 : 207 });
}
