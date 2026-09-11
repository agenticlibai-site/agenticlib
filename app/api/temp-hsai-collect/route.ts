// TEMPORARY — delete after use. One-off backfill trigger for missed cron days.
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { HSAI_PROMPTS, HSAI_COLLECTION_SYSTEM_PROMPT } from "@/lib/brand-visibility/hsai-prompts";
import { initHsaiDB, insertHsaiRawResponse } from "@/lib/brand-visibility/db";

export const dynamic     = "force-dynamic";
export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TEMP_SECRET = "hsai-backfill-sep11-2026";

function parseBrands(raw: string): string[] {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed?.brands)) {
      return (parsed.brands as unknown[])
        .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
        .map((b) => b.trim());
    }
  } catch { /* fall */ }
  const first = cleaned.indexOf("{"), last = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try {
      const obj = JSON.parse(cleaned.slice(first, last + 1));
      if (Array.isArray(obj?.brands))
        return (obj.brands as unknown[])
          .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
          .map((b) => b.trim());
    } catch { /* fall */ }
  }
  return [];
}

async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    results.push(...await Promise.all(tasks.slice(i, i + concurrency).map(t => t())));
    if (i + concurrency < tasks.length) await new Promise(r => setTimeout(r, 150));
  }
  return results;
}

export async function GET(request: Request) {
  const secret = request.headers.get("x-temp-secret");
  if (secret !== TEMP_SECRET) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date  = searchParams.get("date");
  const model = searchParams.get("model") as "claude-haiku-4-5" | "gpt-4o-mini" | null;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "?date= required (YYYY-MM-DD)" }, { status: 400 });
  if (!model || !["claude-haiku-4-5", "gpt-4o-mini"].includes(model)) return Response.json({ error: "?model= required" }, { status: 400 });

  await initHsaiDB();

  const tasks: (() => Promise<{ success: boolean }>)[] = [];
  for (const prompt of HSAI_PROMPTS) {
    for (let run = 1; run <= 3; run++) {
      const p = prompt; const r = run;
      tasks.push(async () => {
        try {
          let text = "", modelSnapshot = model;
          if (model === "claude-haiku-4-5") {
            const res = await anthropic.messages.create({
              model: "claude-haiku-4-5-20251001", max_tokens: 512,
              system: HSAI_COLLECTION_SYSTEM_PROMPT,
              messages: [{ role: "user", content: p.text }],
            });
            const block = res.content.find(b => b.type === "text");
            text = block?.type === "text" ? block.text : "";
            modelSnapshot = res.model;
          } else {
            const res = await openai.chat.completions.create({
              model: "gpt-4o-mini", max_tokens: 512,
              response_format: { type: "json_object" },
              messages: [{ role: "system", content: HSAI_COLLECTION_SYSTEM_PROMPT }, { role: "user", content: p.text }],
            });
            text = res.choices[0]?.message?.content ?? "";
            modelSnapshot = res.model ?? "gpt-4o-mini";
          }
          const brands = parseBrands(text);
          await insertHsaiRawResponse({
            date, promptId: p.id, promptText: p.text, clusterTag: p.tag,
            model, modelSnapshot, runNumber: r, brands,
          });
          return { success: true };
        } catch (err) {
          console.error(`[temp-hsai-collect] error prompt ${p.id}/run${r}:`, err);
          return { success: false };
        }
      });
    }
  }

  const results  = await runWithConcurrency(tasks, 10);
  const succeeded = results.filter(r => r.success).length;
  const failed    = results.length - succeeded;

  return Response.json({ date, model, tasks: results.length, succeeded, failed });
}
