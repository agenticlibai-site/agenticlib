import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  SDAI_FEATURES, SDAI_FEATURE_SYSTEM_PROMPT, buildSdaiFeaturePrompt, type SdaiFeature,
} from "@/lib/brand-visibility/sdai-features";
import { initSdaiDB, getSdaiTopBrandsForFeatureScoring, insertSdaiFeatureResponse } from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 300;

// 20 features × 12 brands × 3 runs = 720 calls per model.
// ?model=claude-haiku-4-5  →  10:00 UTC daily
// ?model=gpt-4o-mini       →  10:15 UTC daily
// sdai-feature-aggregate runs at 10:45 UTC.

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0 });

const RUNS_PER_FEATURE  = 3;
const BATCH_CONCURRENCY = 10;
const BATCH_DELAY_MS    = 500;
const RETRY_DELAYS_MS   = [1000, 2000, 4000];
const GROUNDING_DEADLINE_MS = 200_000;

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try { return await fn(); } catch (err) {
      const status = (err as { status?: number })?.status;
      if ((status === 429 || (status != null && status >= 500)) && attempt < RETRY_DELAYS_MS.length) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
        lastErr = err; continue;
      }
      console.error(`[sdai-feature-collection] non-retriable error on ${label}:`, err);
      throw err;
    }
  }
  throw lastErr;
}

async function callClaude(promptText: string): Promise<string> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001", max_tokens: 1024,
    system: SDAI_FEATURE_SYSTEM_PROMPT,
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
      { role: "system", content: SDAI_FEATURE_SYSTEM_PROMPT },
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

type RunSummary = { has_capability: string | null; confidence: string | null; parse_error: boolean };

function needsGrounding(runs: RunSummary[]): boolean {
  const valid = runs.filter((r) => !r.parse_error && r.has_capability !== null);
  if (valid.length === 0) return true;
  const majority = Math.ceil(valid.length / 2);
  const notDoc   = valid.filter((r) => r.has_capability === "not_documented").length;
  const lowConf  = valid.filter((r) => r.confidence === "low").length;
  return notDoc >= majority || lowConf >= majority;
}

async function callClaudeGrounded(brandName: string, feature: SdaiFeature): Promise<string> {
  const featurePrompt = buildSdaiFeaturePrompt(feature, brandName);
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001", max_tokens: 1024,
    tools: [{ type: "web_search_20250305" as const, name: "web_search" as const }],
    messages: [{
      role: "user",
      content: `Search for information about ${brandName}'s product features for AI video creation teams, specifically: ${feature.feature_name}. Then answer this question about ${brandName} only:\n\n${featurePrompt}`,
    }],
  });
  const textBlocks = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  return textBlocks[textBlocks.length - 1]?.text ?? "";
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
  const functionStart = Date.now();

  try {
    await initSdaiDB();
    const brands = await getSdaiTopBrandsForFeatureScoring();
    if (brands.length === 0) {
      return Response.json({ mode: "sdai_feature_collection", date: today, note: "no brands in LOCKED_SDAI_BRANDS yet" });
    }

    const pairResults = new Map<string, RunSummary[]>();
    const pairMeta    = new Map<string, { brandName: string; feature: SdaiFeature }>();
    const tasks: (() => Promise<{ success: boolean }>)[] = [];

    for (const brandName of brands) {
      for (const feature of SDAI_FEATURES) {
        const pairKey = `${brandName}::${feature.feature_id}`;
        pairMeta.set(pairKey, { brandName, feature });
        for (let run = 1; run <= RUNS_PER_FEATURE; run++) {
          const b = brandName, f = feature, r = run;
          tasks.push(async () => {
            try {
              const promptText = buildSdaiFeaturePrompt(f, b);
              const callLabel  = `${b}/${f.feature_id}/run${r}`;
              const rawText    = model === "claude-haiku-4-5"
                ? await withRetry(() => callClaude(promptText), callLabel)
                : await withRetry(() => callGPT(promptText),    callLabel);

              const { has_capability, evidence, limitations, confidence, terminology_tags, parsed, parseError } = parseFeatureResponse(rawText);
              await insertSdaiFeatureResponse({
                brand_name: b, feature_id: f.feature_id, feature_tag: f.feature_tag,
                model, run_number: r, run_date: today,
                has_capability, evidence, limitations, confidence, terminology_tags,
                raw_json: parseError ? { raw: rawText.slice(0, 2000) } : parsed,
                parse_error: parseError, grounded: false,
              });
              if (!pairResults.has(pairKey)) pairResults.set(pairKey, []);
              pairResults.get(pairKey)!.push({ has_capability, confidence, parse_error: parseError });
              return { success: true };
            } catch (err) {
              console.error(`[sdai-feature-collection] error: ${brandName}/${feature.feature_id}/run${run}:`, err);
              if (!pairResults.has(pairKey)) pairResults.set(pairKey, []);
              pairResults.get(pairKey)!.push({ has_capability: null, confidence: null, parse_error: true });
              return { success: false };
            }
          });
        }
      }
    }

    const expected  = tasks.length;
    console.log(`[sdai-feature-collection] start — model=${model}, date=${today}, brands=${brands.length}, features=${SDAI_FEATURES.length}, tasks=${expected}`);
    const results   = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed    = expected - succeeded;
    console.log(`[sdai-feature-collection] done — succeeded=${succeeded}/${expected}, failed=${failed}`);

    let groundingRan = 0, groundingFailed = 0;
    if (model === "claude-haiku-4-5") {
      const groundingTasks: (() => Promise<void>)[] = [];
      for (const [pairKey, runs] of pairResults) {
        if (!needsGrounding(runs)) continue;
        const meta = pairMeta.get(pairKey);
        if (!meta) continue;
        const { brandName: b, feature: f } = meta;
        groundingTasks.push(async () => {
          try {
            const rawText = await withRetry(() => callClaudeGrounded(b, f), `${b}/${f.feature_id}/grounded`);
            const { has_capability, evidence, limitations, confidence, terminology_tags, parsed, parseError } = parseFeatureResponse(rawText);
            await insertSdaiFeatureResponse({
              brand_name: b, feature_id: f.feature_id, feature_tag: f.feature_tag,
              model: "claude-haiku-4-5", run_number: 0, run_date: today,
              has_capability, evidence, limitations, confidence, terminology_tags,
              raw_json: parseError ? { raw: rawText.slice(0, 2000) } : parsed,
              parse_error: parseError, grounded: true,
            });
            groundingRan++;
          } catch (err) {
            console.error(`[sdai-feature-collection] grounding error: ${b}/${f.feature_id}:`, err);
            groundingFailed++;
          }
        });
      }
      if (groundingTasks.length > 0) {
        const elapsedMs = Date.now() - functionStart;
        if (elapsedMs > GROUNDING_DEADLINE_MS) {
          console.warn(`[sdai-feature-collection] grounding skipped — ${Math.round(elapsedMs / 1000)}s elapsed (${groundingTasks.length} pairs deferred)`);
        } else {
          await runWithConcurrency(groundingTasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
        }
      }
    }

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — SDAI Feature Collection failed (${model}, ${today})`,
        html: `<h2>SDAI Feature Pipeline — Failures</h2><p>Model: ${model} | Date: ${today} | Succeeded: ${succeeded}/${expected} | Failed: ${failed}</p>`,
      }).catch(() => {});
    }

    return Response.json({ mode: "sdai_feature_collection", model, date: today, brands: brands.length, features: SDAI_FEATURES.length, expected, succeeded, failed, grounding_ran: groundingRan, grounding_failed: groundingFailed });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] sdai-feature-collection crashed (${model}):`, message);
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
