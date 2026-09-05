import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { HSAI_PROMPTS, HSAI_COLLECTION_SYSTEM_PROMPT } from "@/lib/brand-visibility/hsai-prompts";
import { initHsaiDB, insertHsaiRawResponse } from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 300;

// ── Split-job design ───────────────────────────────────────────────────────────
//   ?model=claude-haiku-4-5  →  08:05 UTC daily
//   ?model=gpt-4o-mini       →  08:15 UTC daily
// hsai-aggregate runs at 08:45 UTC.
// 39 prompts × 3 runs × 2 models = 234 API calls per day.
// ──────────────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RUNS_PER_PROMPT   = 3;
const BATCH_CONCURRENCY = 10;
const BATCH_DELAY_MS    = 150;

interface ModelResult { text: string; modelSnapshot: string; }

async function callClaude(promptText: string): Promise<ModelResult> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001", max_tokens: 512,
    system: HSAI_COLLECTION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  const text  = block?.type === "text" ? block.text : "";
  return { text, modelSnapshot: res.model };
}

async function callGPT(promptText: string): Promise<ModelResult> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini", max_tokens: 512,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: HSAI_COLLECTION_SYSTEM_PROMPT },
      { role: "user",   content: promptText },
    ],
  });
  return { text: res.choices[0]?.message?.content ?? "", modelSnapshot: res.model ?? "gpt-4o-mini" };
}

function parseBrands(raw: string): string[] {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed?.brands)) {
      return (parsed.brands as unknown[]).filter((b): b is string => typeof b === "string" && b.trim().length > 0).map((b) => b.trim());
    }
  } catch { /* fall */ }
  const first = cleaned.indexOf("{"), last = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try {
      const obj = JSON.parse(cleaned.slice(first, last + 1));
      if (Array.isArray(obj?.brands)) return (obj.brands as unknown[]).filter((b): b is string => typeof b === "string" && b.trim().length > 0).map((b) => b.trim());
    } catch { /* fall */ }
  }
  return [];
}

async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], concurrency: number, delayMs: number): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    results.push(...await Promise.all(tasks.slice(i, i + concurrency).map((t) => t())));
    if (i + concurrency < tasks.length) await new Promise((r) => setTimeout(r, delayMs));
  }
  return results;
}

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now   = new Date();
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const today = (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam))
    ? dateParam : now.toISOString().split("T")[0];
  const modelParam = searchParams.get("model");
  if (!modelParam || !["claude-haiku-4-5", "gpt-4o-mini"].includes(modelParam)) {
    return Response.json({ error: "?model= required: claude-haiku-4-5 or gpt-4o-mini" }, { status: 400 });
  }
  const model = modelParam as "claude-haiku-4-5" | "gpt-4o-mini";

  try {
    await initHsaiDB();

    const tasks: (() => Promise<{ success: boolean }>)[] = [];
    for (const prompt of HSAI_PROMPTS) {
      for (let run = 1; run <= RUNS_PER_PROMPT; run++) {
        const p = prompt; const r = run;
        tasks.push(async () => {
          try {
            const result = model === "claude-haiku-4-5"
              ? await callClaude(p.text) : await callGPT(p.text);
            const brands = parseBrands(result.text);
            await insertHsaiRawResponse({
              date: today, promptId: p.id, promptText: p.text, clusterTag: p.tag,
              model, modelSnapshot: result.modelSnapshot, runNumber: r, brands,
            });
            return { success: true };
          } catch (err) {
            console.error(`[hsai-collection] error prompt ${p.id}/run${r}:`, err);
            return { success: false };
          }
        });
      }
    }

    const expected = tasks.length;
    console.log(`[hsai-collection] start — model=${model}, date=${today}, prompts=${HSAI_PROMPTS.length}, tasks=${expected}`);
    const results   = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed    = expected - succeeded;
    console.log(`[hsai-collection] done — succeeded=${succeeded}/${expected}, failed=${failed}`);

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — HSAI Collection failed (${model}, ${today})`,
        html: `<h2>HSAI Brand Coverage — Collection Failures</h2><p>Model: ${model} | Date: ${today} | Succeeded: ${succeeded}/${expected} | Failed: ${failed}</p>`,
      }).catch(() => {});
    }

    return Response.json({ mode: "hsai_collection", model, date: today, prompts: HSAI_PROMPTS.length, expected, succeeded, failed });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] hsai-collection crashed (${model}):`, message);
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
