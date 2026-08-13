/**
 * One-shot GPT-4o-mini collection for today's brand-visibility pipeline.
 * Run: OPENAI_API_KEY=<key> npx tsx _run-gpt-collection.ts
 * Delete after use.
 */

import OpenAI from "openai";
import { neon } from "@neondatabase/serverless";
import { PROMPTS, COLLECTION_SYSTEM_PROMPT } from "./lib/brand-visibility/prompts";

const DB_URL = "postgresql://neondb_owner:npg_hIcm0NT7bEuy@ep-ancient-art-a7i96lbm.ap-southeast-2.aws.neon.tech/neondb?sslmode=require";
const MODEL = "gpt-4o-mini";
const RUNS_PER_PROMPT = 5;
const CONCURRENCY = 10;
const DELAY_MS = 200;

const sql = neon(DB_URL);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const today = new Date().toISOString().split("T")[0];

async function callGPT(promptText: string) {
  const res = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 512,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: COLLECTION_SYSTEM_PROMPT },
      { role: "user", content: promptText },
    ],
  });
  return { text: res.choices[0]?.message?.content ?? "", modelSnapshot: res.model };
}

function parseBrands(raw: string): string[] {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed.brands)) throw new Error("Missing brands array");
  return parsed.brands.filter((b: unknown) => typeof b === "string" && (b as string).length > 0);
}

async function runBatch<T>(tasks: (() => Promise<T>)[], concurrency: number, delayMs: number) {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    results.push(...await Promise.all(batch.map(t => t())));
    if (i + concurrency < tasks.length) await new Promise(r => setTimeout(r, delayMs));
  }
  return results;
}

async function main() {
  console.log(`\n[gpt-collection] ${today} · ${PROMPTS.length} prompts × ${RUNS_PER_PROMPT} runs = ${PROMPTS.length * RUNS_PER_PROMPT} calls`);
  let success = 0, errors = 0;

  const tasks = PROMPTS.flatMap(p =>
    Array.from({ length: RUNS_PER_PROMPT }, (_, i) => async () => {
      const run = i + 1;
      try {
        const result = await callGPT(p.text);
        const brands = parseBrands(result.text);
        await sql`
          INSERT INTO raw_responses (date, prompt_id, prompt_text, bucket_tag, model, model_snapshot, run_number, brands)
          VALUES (${today}::date, ${p.id}, ${p.text}, ${p.tag}, ${MODEL}, ${result.modelSnapshot}, ${run}, ${JSON.stringify(brands)}::jsonb)
          ON CONFLICT (date, prompt_id, model, run_number) DO UPDATE SET brands = EXCLUDED.brands, model_snapshot = EXCLUDED.model_snapshot
        `;
        success++;
        process.stdout.write(`  ${success}/${PROMPTS.length * RUNS_PER_PROMPT} ✓\r`);
      } catch (err) {
        errors++;
        console.error(`\n  [ERROR] prompt ${p.id} run ${run}: ${err instanceof Error ? err.message : err}`);
      }
    })
  );

  await runBatch(tasks, CONCURRENCY, DELAY_MS);

  const rows = await sql`SELECT COUNT(*)::int AS cnt FROM raw_responses WHERE date = ${today}::date AND model = ${MODEL}`;
  console.log(`\n\n[done] success=${success} errors=${errors} · DB rows for ${MODEL}: ${rows[0].cnt}`);
}

main().catch(err => { console.error(err); process.exit(1); });
