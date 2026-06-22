import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { PROMPTS, COLLECTION_SYSTEM_PROMPT } from "@/lib/brand-visibility/prompts";
import { initBrandVisibilityDB, insertRawResponse, insertCollectionError, getDailyRunStats } from "@/lib/brand-visibility/db";
import { runAllAggregations } from "@/lib/brand-visibility/aggregation";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Split-job design ───────────────────────────────────────────────────────────
// 220 calls from syd1 to US APIs (~2-3s each) exceeds the Hobby plan's 60s limit
// when run as one job. We split into three cron jobs instead:
//
//   ?model=claude-haiku-4-5  →  110 calls (~35s), no aggregation
//   ?model=gpt-4o-mini       →  110 calls (~35s), no aggregation
//   ?aggregate               →  aggregation only, runs after both collection jobs
//
// The vercel.json schedules them 10 min apart so collection always completes first.
// ──────────────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RUNS_PER_PROMPT = 5;
const BATCH_CONCURRENCY = 10; // higher concurrency since each job is one model only
const BATCH_DELAY_MS = 150;

// ── Model call helpers ─────────────────────────────────────────────────────────

interface ModelResult {
  text: string;
  modelSnapshot: string;
}

async function callClaude(promptText: string): Promise<ModelResult> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: COLLECTION_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  return {
    text: block?.type === "text" ? block.text : "",
    modelSnapshot: res.model,
  };
}

async function callGPT(promptText: string): Promise<ModelResult> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 512,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: COLLECTION_SYSTEM_PROMPT },
      { role: "user", content: promptText },
    ],
  });
  return {
    text: res.choices[0]?.message?.content ?? "",
    modelSnapshot: res.model,
  };
}

function parseBrands(raw: string): string[] {
  // Strip markdown code fences — Claude ignores the system prompt instruction
  // and wraps output in ```json ... ``` despite being told not to.
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed.brands)) throw new Error("Missing brands array");
  return parsed.brands.filter((b: unknown) => typeof b === "string" && b.length > 0);
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
  delayMs: number,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((t) => t()));
    results.push(...batchResults);
    if (i + concurrency < tasks.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}

// ── Cron handler ───────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initBrandVisibilityDB();

  const { searchParams } = new URL(request.url);
  const modelParam = searchParams.get("model");    // "claude-haiku-4-5" | "gpt-4o-mini" | null
  const aggregateOnly = searchParams.has("aggregate");

  const today = new Date().toISOString().split("T")[0];
  const windowStartDate = new Date();
  windowStartDate.setDate(windowStartDate.getDate() - 6);
  const windowStart = windowStartDate.toISOString().split("T")[0];

  // ── Aggregate-only mode (third cron, 3:25 AM UTC) ─────────────────────────
  if (aggregateOnly) {
    await runAllAggregations(today, windowStart);
    const stats = await getDailyRunStats(today);
    return Response.json({
      mode: "aggregate_only",
      date: today,
      db_success_rows: stats.success,
      window_start: windowStart,
      window_end: today,
    });
  }

  // ── Collection mode ────────────────────────────────────────────────────────
  // When ?model= is set, only that model is queried (110 calls, ~35s).
  // When called without ?model= (e.g. local testing), both models run (220 calls).
  const modelsToRun: ("claude-haiku-4-5" | "gpt-4o-mini")[] =
    modelParam === "claude-haiku-4-5" ? ["claude-haiku-4-5"]
    : modelParam === "gpt-4o-mini"    ? ["gpt-4o-mini"]
    : ["claude-haiku-4-5", "gpt-4o-mini"];

  const expected = PROMPTS.length * RUNS_PER_PROMPT * modelsToRun.length;
  const tasks: (() => Promise<{ success: boolean }>)[] = [];

  for (const prompt of PROMPTS) {
    for (const model of modelsToRun) {
      for (let run = 1; run <= RUNS_PER_PROMPT; run++) {
        const p = prompt;
        const m = model;
        const r = run;

        tasks.push(async () => {
          try {
            const result = m === "claude-haiku-4-5"
              ? await callClaude(p.text)
              : await callGPT(p.text);

            const brands = parseBrands(result.text);

            await insertRawResponse({
              date: today,
              promptId: p.id,
              promptText: p.text,
              bucketTag: p.tag,
              model: m,
              modelSnapshot: result.modelSnapshot,
              runNumber: r,
              brands,
            });

            return { success: true };
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            await insertCollectionError({
              date: today,
              promptId: p.id,
              model: m,
              runNumber: r,
              rawResponse: errorMessage.slice(0, 2000),
              errorMessage,
            }).catch(() => {});
            return { success: false };
          }
        });
      }
    }
  }

  const results = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
  const succeeded = results.filter((r) => r.success).length;

  return Response.json({
    mode: "collection",
    model: modelParam ?? "all",
    date: today,
    expected,
    succeeded,
    failed: expected - succeeded,
  });
}
