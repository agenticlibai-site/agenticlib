/**
 * Temporary one-time backfill endpoint.
 * DELETE THIS FILE after backfill is confirmed complete.
 *
 * Usage (browser or curl):
 *   GET /api/admin/backfill-claude-ralfi?token=ralfi-backfill-2026
 *   GET /api/admin/backfill-claude-ralfi?token=ralfi-backfill-2026&date=2026-08-21
 *
 * Processes one date at a time (pass ?date=) or all empty-brand dates automatically.
 */

import Anthropic from "@anthropic-ai/sdk";
import { sql } from "@vercel/postgres";
import { RALFI_PROMPTS, RALFI_COLLECTION_SYSTEM_PROMPT } from "@/lib/brand-visibility/ralfi-prompts";
import { initRalfiDB } from "@/lib/brand-visibility/db";

export const dynamic     = "force-dynamic";
export const maxDuration = 300;

const TOKEN   = "ralfi-backfill-2026";
const MODEL   = "claude-haiku-4-5";
const MODEL_ID = "claude-haiku-4-5-20251001";
const RUNS    = 3;
const CONCURRENCY = 10;

function parseBrands(raw: string): string[] {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed  = JSON.parse(cleaned);
  if (!Array.isArray(parsed.brands)) throw new Error("No brands array");
  return parsed.brands.filter((b: unknown) => typeof b === "string" && (b as string).length > 0);
}

async function runBatch<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    results.push(...await Promise.all(tasks.slice(i, i + concurrency).map(t => t())));
  }
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("token") !== TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  await initRalfiDB();

  // Determine which dates to process
  let dates: string[] = [];
  const dateParam = searchParams.get("date");

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    dates = [dateParam];
  } else {
    // Find all dates where Claude has empty brand arrays
    const rows = await sql`
      SELECT DISTINCT date::text AS date
      FROM ralfi_raw_responses
      WHERE model = ${MODEL}
        AND jsonb_array_length(brands) = 0
      ORDER BY date
    `;
    dates = rows.rows.map((r: { date: string }) => r.date);
  }

  if (dates.length === 0) {
    return Response.json({ status: "nothing_to_do", message: "No empty Claude rows found." });
  }

  const log: string[] = [];
  log.push(`Processing ${dates.length} date(s): ${dates.join(", ")}`);

  for (const date of dates) {
    // Delete existing empty rows for this date/model
    const deleted = await sql`
      DELETE FROM ralfi_raw_responses
      WHERE date = ${date}::date AND model = ${MODEL} AND jsonb_array_length(brands) = 0
      RETURNING id
    `;
    log.push(`[${date}] Deleted ${deleted.rowCount} empty rows`);

    let succeeded = 0;
    let failed    = 0;
    const tasks: (() => Promise<void>)[] = [];

    for (const prompt of RALFI_PROMPTS) {
      for (let run = 1; run <= RUNS; run++) {
        const p = prompt;
        const r = run;
        tasks.push(async () => {
          try {
            const res = await anthropic.messages.create({
              model:      MODEL_ID,
              max_tokens: 512,
              system: [{ type: "text", text: RALFI_COLLECTION_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
              messages: [{ role: "user", content: p.text }],
            });
            const block  = res.content.find(b => b.type === "text");
            const text   = block?.type === "text" ? block.text : "";
            const brands = parseBrands(text);

            await sql`
              INSERT INTO ralfi_raw_responses
                (date, prompt_id, prompt_text, cluster_tag, model, model_snapshot, run_number, brands)
              VALUES
                (${date}::date, ${p.id}, ${p.text}, ${p.tag}, ${MODEL}, ${MODEL_ID}, ${r}, ${JSON.stringify(brands)}::jsonb)
              ON CONFLICT (date, prompt_id, model, run_number) DO UPDATE SET
                brands         = EXCLUDED.brands,
                model_snapshot = EXCLUDED.model_snapshot
            `;
            succeeded++;
          } catch {
            failed++;
          }
        });
      }
    }

    await runBatch(tasks, CONCURRENCY);
    log.push(`[${date}] Collection: ${succeeded} ok, ${failed} failed`);

    // Re-aggregate this date for Claude only
    await sql`
      INSERT INTO ralfi_daily_summary (date, brand, model, cluster_tag, mention_count, avg_position)
      SELECT
        ${date}::date,
        TRIM(t.brand_name),
        r.model,
        r.cluster_tag,
        COUNT(*)::int            AS mention_count,
        AVG(t.ordinality)::float AS avg_position
      FROM ralfi_raw_responses r,
           jsonb_array_elements_text(r.brands) WITH ORDINALITY AS t(brand_name, ordinality)
      WHERE r.date = ${date}::date
        AND r.model = ${MODEL}
        AND LENGTH(TRIM(t.brand_name)) > 0
        AND LOWER(TRIM(t.brand_name)) NOT IN (SELECT LOWER(brand_name) FROM ralfi_denylist)
      GROUP BY TRIM(t.brand_name), r.model, r.cluster_tag
      ON CONFLICT (date, brand, model, cluster_tag) DO UPDATE SET
        mention_count = EXCLUDED.mention_count,
        avg_position  = EXCLUDED.avg_position
    `;
    log.push(`[${date}] Aggregation complete`);
  }

  // Sanity check
  const check = await sql`
    SELECT model, SUM(mention_count)::int AS total, COUNT(DISTINCT date)::int AS days
    FROM ralfi_daily_summary
    WHERE date >= CURRENT_DATE - INTERVAL '14 days'
    GROUP BY model ORDER BY model
  `;

  return Response.json({
    status: "done",
    dates_processed: dates,
    log,
    summary: check.rows,
  });
}
