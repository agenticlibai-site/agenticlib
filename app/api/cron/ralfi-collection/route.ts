import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { RALFI_PROMPTS, RALFI_COLLECTION_SYSTEM_PROMPT } from "@/lib/brand-visibility/ralfi-prompts";
import { initRalfiDB, insertRalfiRawResponse } from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 300;

// ── Split-job design ───────────────────────────────────────────────────────────
//   ?model=claude-haiku-4-5  →  Job 1, e.g. 8:00 AM UTC daily (Days 1-7)
//   ?model=gpt-4o-mini       →  Job 2, e.g. 8:10 AM UTC daily (Days 1-7)
//
// 39 prompts × 3 runs × 2 models = 234 total API calls per day.
// Aggregation runs via ralfi-aggregate ~35 min after both jobs complete.
// ──────────────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RUNS_PER_PROMPT   = 3;
const BATCH_CONCURRENCY = 10;
const BATCH_DELAY_MS    = 150;

interface ModelResult {
  text:          string;
  modelSnapshot: string;
}

async function callClaude(promptText: string): Promise<ModelResult> {
  const res = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: [
      {
        type:          "text",
        text:          RALFI_COLLECTION_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  return { text: block?.type === "text" ? block.text : "", modelSnapshot: res.model };
}

async function callGPT(promptText: string): Promise<ModelResult> {
  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    max_tokens:      512,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: RALFI_COLLECTION_SYSTEM_PROMPT },
      { role: "user",   content: promptText },
    ],
  });
  return { text: res.choices[0]?.message?.content ?? "", modelSnapshot: res.model };
}

function parseBrands(raw: string): string[] {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed  = JSON.parse(cleaned);
  if (!Array.isArray(parsed.brands)) throw new Error("Missing brands array");
  return parsed.brands.filter((b: unknown) => typeof b === "string" && b.length > 0);
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1000): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
    }
  }
  throw new Error("unreachable");
}

async function runWithConcurrency<T>(
  tasks:       (() => Promise<T>)[],
  concurrency: number,
  delayMs:     number,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    results.push(...await Promise.all(batch.map((t) => t())));
    if (i + concurrency < tasks.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now          = new Date();
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const { searchParams } = new URL(request.url);
  const modelParam       = searchParams.get("model");
  const dateParam        = searchParams.get("date");
  const today            = (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam))
    ? dateParam
    : now.toISOString().split("T")[0];

  if (!modelParam || !["claude-haiku-4-5", "gpt-4o-mini"].includes(modelParam)) {
    return Response.json({ error: "?model= required: claude-haiku-4-5 or gpt-4o-mini" }, { status: 400 });
  }

  const model = modelParam as "claude-haiku-4-5" | "gpt-4o-mini";

  try {
    await initRalfiDB();

    const expected = RALFI_PROMPTS.length * RUNS_PER_PROMPT;
    const tasks: (() => Promise<{ success: boolean }>)[] = [];

    for (const prompt of RALFI_PROMPTS) {
      for (let run = 1; run <= RUNS_PER_PROMPT; run++) {
        const p = prompt;
        const r = run;

        tasks.push(async () => {
          try {
            const result = await withRetry(() =>
              model === "claude-haiku-4-5" ? callClaude(p.text) : callGPT(p.text)
            );

            const brands = parseBrands(result.text);

            await insertRalfiRawResponse({
              date:          today,
              promptId:      p.id,
              promptText:    p.text,
              clusterTag:    p.tag,
              model,
              modelSnapshot: result.modelSnapshot,
              runNumber:     r,
              brands,
            });

            return { success: true };
          } catch (err) {
            console.error(`[ralfi-collection] prompt${p.id}/run${r} (${model}):`, err);
            return { success: false };
          }
        });
      }
    }

    const results   = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed    = expected - succeeded;

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Ralfi Collection failed (${model}, ${today})`,
        html: `
          <h2>Ralfi Pipeline — Collection Failures</h2>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>${model}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Succeeded</strong></td><td>${succeeded} / ${expected}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Failed</strong></td><td>${failed}</td></tr>
          </table>
          <p>Check Vercel function logs for per-task errors.</p>
        `,
      }).catch((e) => console.error("[alert] ralfi collection email failed:", e));
    }

    return Response.json({
      mode:      "ralfi_collection",
      model,
      date:      today,
      prompts:   RALFI_PROMPTS.length,
      runs:      RUNS_PER_PROMPT,
      expected,
      succeeded,
      failed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] ralfi-collection crashed (${model}):`, message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Ralfi Collection (${model}, ${today})`,
      html: `
        <h2>Ralfi Pipeline — Unhandled Crash</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>${model}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
      `,
    }).catch(() => {});

    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
