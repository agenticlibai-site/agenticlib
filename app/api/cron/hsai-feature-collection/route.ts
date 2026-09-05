import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  HSAI_FEATURES, HSAI_FEATURE_SYSTEM_PROMPT, buildHsaiFeaturePrompt, type HsaiFeature,
} from "@/lib/brand-visibility/hsai-features";
import { initHsaiDB, getHsaiBrandsForFeatureScoring, insertHsaiFeatureResponse } from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 300;

// 22 features × 12 brands × 3 runs = 792 API calls per model.
// ?model=claude-haiku-4-5  →  13:05 UTC daily
// ?model=gpt-4o-mini       →  13:20 UTC daily
// hsai-feature-aggregate runs at 13:55 UTC.

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0 });

const RUNS_PER_FEATURE  = 3;
const BATCH_CONCURRENCY = 10;
const BATCH_DELAY_MS    = 500;
const RETRY_DELAYS_MS   = [1000, 2000, 4000];

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try { return await fn(); } catch (err) {
      const status = (err as { status?: number })?.status;
      if ((status === 429 || (status != null && status >= 500)) && attempt < RETRY_DELAYS_MS.length) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
        lastErr = err; continue;
      }
      console.error(`[hsai-feature-collection] non-retriable error on ${label}:`, err);
      throw err;
    }
  }
  throw lastErr;
}

async function callClaude(promptText: string): Promise<string> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001", max_tokens: 1024,
    system: HSAI_FEATURE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

async function callGPT(promptText: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini", max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: HSAI_FEATURE_SYSTEM_PROMPT },
      { role: "user",   content: promptText },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

function parseFeatureResponse(raw: string) {
  function extract(obj: Record<string, unknown>) {
    return {
      has_capability:   typeof obj.has_capability === "string" ? obj.has_capability : null,
      evidence:         typeof obj.evidence       === "string" ? obj.evidence       : null,
      limitations:      typeof obj.limitations    === "string" ? obj.limitations    : null,
      confidence:       typeof obj.confidence     === "string" ? obj.confidence     : null,
      terminology_tags: Array.isArray(obj.terminology_tags)
        ? (obj.terminology_tags as unknown[]).filter((t): t is string => typeof t === "string").slice(0, 3)
        : null,
      parsed: obj, parseError: false,
    };
  }
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try { return extract(JSON.parse(cleaned) as Record<string, unknown>); } catch { /* fall */ }
  const first = cleaned.indexOf("{"), last = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try { return extract(JSON.parse(cleaned.slice(first, last + 1)) as Record<string, unknown>); } catch { /* fall */ }
  }
  return { has_capability: null, evidence: null, limitations: null, confidence: null, terminology_tags: null, parsed: null, parseError: true };
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

  const now = new Date();
  const { searchParams } = new URL(request.url);
  const dateParam  = searchParams.get("date");
  const modelParam = searchParams.get("model");
  const today = (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam))
    ? dateParam : now.toISOString().split("T")[0];

  if (!modelParam || !["claude-haiku-4-5", "gpt-4o-mini"].includes(modelParam)) {
    return Response.json({ error: "?model= required: claude-haiku-4-5 or gpt-4o-mini" }, { status: 400 });
  }
  const model = modelParam as "claude-haiku-4-5" | "gpt-4o-mini";

  try {
    await initHsaiDB();
    const brands = await getHsaiBrandsForFeatureScoring();
    if (brands.length === 0) {
      return Response.json({ mode: "hsai_feature_collection", date: today, note: "no brands in LOCKED_HSAI_BRANDS yet" });
    }

    const tasks: (() => Promise<{ success: boolean }>)[] = [];

    for (const brandName of brands) {
      for (const feature of HSAI_FEATURES) {
        for (let run = 1; run <= RUNS_PER_FEATURE; run++) {
          const b = brandName, f: HsaiFeature = feature, r = run;
          tasks.push(async () => {
            try {
              const promptText = buildHsaiFeaturePrompt(f, b);
              const callLabel  = `${b}/${f.feature_id}/run${r}`;
              const rawText    = model === "claude-haiku-4-5"
                ? await withRetry(() => callClaude(promptText), callLabel)
                : await withRetry(() => callGPT(promptText),    callLabel);

              const { has_capability, evidence, limitations, confidence, terminology_tags, parsed, parseError } = parseFeatureResponse(rawText);
              await insertHsaiFeatureResponse({
                brand_name: b, feature_id: f.feature_id, feature_tag: f.feature_tag,
                model, run_number: r, run_date: today,
                has_capability, evidence, limitations, confidence, terminology_tags,
                raw_json: parseError ? { raw: rawText.slice(0, 2000) } : parsed,
                parse_error: parseError, grounded: false,
              });
              return { success: true };
            } catch (err) {
              console.error(`[hsai-feature-collection] error: ${brandName}/${feature.feature_id}/run${run}:`, err);
              return { success: false };
            }
          });
        }
      }
    }

    const expected = tasks.length;
    console.log(`[hsai-feature-collection] start — model=${model}, date=${today}, brands=${brands.length}, features=${HSAI_FEATURES.length}, tasks=${expected}`);
    const results   = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed    = expected - succeeded;
    console.log(`[hsai-feature-collection] done — succeeded=${succeeded}/${expected}, failed=${failed}`);

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — HSAI Feature Collection failed (${model}, ${today})`,
        html: `<h2>HSAI Feature Pipeline — Failures</h2><p>Model: ${model} | Date: ${today} | Succeeded: ${succeeded}/${expected} | Failed: ${failed}</p>`,
      }).catch(() => {});
    }

    return Response.json({ mode: "hsai_feature_collection", model, date: today, brands: brands.length, features: HSAI_FEATURES.length, expected, succeeded, failed });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] hsai-feature-collection crashed (${model}):`, message);
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
