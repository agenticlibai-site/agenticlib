import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  RALFI_FEATURES,
  RALFI_FEATURE_SYSTEM_PROMPT,
  buildRalfiFeaturePrompt,
  type RalfiFeature,
} from "@/lib/brand-visibility/ralfi-features";
import {
  initRalfiDB,
  getRalfiTopBrandsForFeatureScoring,
  insertRalfiFeatureResponse,
} from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic     = "force-dynamic";
export const maxDuration = 300;

// ── Split-job design ───────────────────────────────────────────────────────────
// 18 features × brands × 3 runs = calls per model.
//
//   ?model=claude-haiku-4-5   →  e.g. 10:00 UTC (Days 5-7)
//   ?model=gpt-4o-mini        →  e.g. 10:15 UTC (Days 5-7)
//
// ralfi-feature-aggregate runs 30 min after GPT job.
//
// NOTE: 18 prompts per brand — 12 cluster feature prompts (Group A) +
//       6 brand-dimension prompts (Group B: security, pricing, technical).
//       Both groups are in RALFI_FEATURES and run in the same job.
// ──────────────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RUNS_PER_FEATURE  = 3;
const BATCH_CONCURRENCY = 10;
const BATCH_DELAY_MS    = 500;
const RETRY_DELAYS_MS   = [1000, 2000, 4000];

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 429 && attempt < RETRY_DELAYS_MS.length) {
        const delay = RETRY_DELAYS_MS[attempt];
        console.warn(`[ralfi-feature-collection] 429 on ${label} — retry ${attempt + 1}/3 in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function callClaude(promptText: string): Promise<string> {
  const res = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system:     RALFI_FEATURE_SYSTEM_PROMPT,
    messages:   [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

async function callGPT(promptText: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    max_tokens:      1024,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: RALFI_FEATURE_SYSTEM_PROMPT },
      { role: "user",   content: promptText },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

function parseFeatureResponse(raw: string): {
  has_capability:   string | null;
  evidence:         string | null;
  limitations:      string | null;
  confidence:       string | null;
  terminology_tags: string[] | null;
  parsed:           object | null;
  parseError:       boolean;
} {
  function extract(obj: Record<string, unknown>) {
    return {
      has_capability:   typeof obj.has_capability === "string" ? obj.has_capability : null,
      evidence:         typeof obj.evidence       === "string" ? obj.evidence       : null,
      limitations:      typeof obj.limitations    === "string" ? obj.limitations    : null,
      confidence:       typeof obj.confidence     === "string" ? obj.confidence     : null,
      terminology_tags: Array.isArray(obj.terminology_tags)
        ? (obj.terminology_tags as unknown[]).filter((t): t is string => typeof t === "string").slice(0, 3)
        : null,
      parsed:    obj,
      parseError: false,
    };
  }
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try { return extract(JSON.parse(cleaned) as Record<string, unknown>); } catch { /* fall */ }
  const first = cleaned.indexOf("{");
  const last  = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try { return extract(JSON.parse(cleaned.slice(first, last + 1)) as Record<string, unknown>); } catch { /* fall */ }
  }
  return {
    has_capability: null, evidence: null, limitations: null, confidence: null,
    terminology_tags: null, parsed: null, parseError: true,
  };
}

type RunSummary = { has_capability: string | null; confidence: string | null; parse_error: boolean };

function needsGrounding(runs: RunSummary[]): boolean {
  const valid    = runs.filter((r) => !r.parse_error && r.has_capability !== null);
  if (valid.length === 0) return true;
  const majority = Math.ceil(valid.length / 2);
  const notDoc   = valid.filter((r) => r.has_capability === "not_documented").length;
  const lowConf  = valid.filter((r) => r.confidence === "low").length;
  return notDoc >= majority || lowConf >= majority;
}

async function callClaudeGrounded(brandName: string, feature: RalfiFeature): Promise<string> {
  const featurePrompt = buildRalfiFeaturePrompt(feature, brandName);
  const res = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    tools:      [{ type: "web_search_20250305" as const, name: "web_search" as const }],
    messages:   [{
      role:    "user",
      content: `Search for information about ${brandName}'s product features for insurance brokers, specifically: ${feature.feature_name}. Then answer this question about ${brandName} only:\n\n${featurePrompt}`,
    }],
  });
  const textBlocks = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  return textBlocks[textBlocks.length - 1]?.text ?? "";
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
  delayMs: number,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    results.push(...await Promise.all(batch.map((t) => t())));
    if (i + concurrency < tasks.length) await new Promise((r) => setTimeout(r, delayMs));
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
  const modelParam   = searchParams.get("model");
  const dateParam    = searchParams.get("date");
  const today = (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam))
    ? dateParam
    : now.toISOString().split("T")[0];

  if (!modelParam || !["claude-haiku-4-5", "gpt-4o-mini"].includes(modelParam)) {
    return Response.json({ error: "?model= required: claude-haiku-4-5 or gpt-4o-mini" }, { status: 400 });
  }
  const model = modelParam as "claude-haiku-4-5" | "gpt-4o-mini";

  try {
    await initRalfiDB();
    const brands = await getRalfiTopBrandsForFeatureScoring();

    if (brands.length === 0) {
      return Response.json({
        mode: "ralfi_feature_collection",
        date: today,
        note: "no brands in LOCKED_RALFI_BRANDS yet — add brands after denylist review",
      });
    }

    const pairResults = new Map<string, RunSummary[]>();
    const pairMeta    = new Map<string, { brandName: string; feature: RalfiFeature }>();
    const tasks: (() => Promise<{ success: boolean }>)[] = [];

    for (const brandName of brands) {
      for (const feature of RALFI_FEATURES) {
        const pairKey = `${brandName}::${feature.feature_id}`;
        pairMeta.set(pairKey, { brandName, feature });

        for (let run = 1; run <= RUNS_PER_FEATURE; run++) {
          const b = brandName;
          const f = feature;
          const r = run;

          tasks.push(async () => {
            try {
              const promptText = buildRalfiFeaturePrompt(f, b);
              const callLabel  = `${b}/${f.feature_id}/run${r}`;
              const rawText    = model === "claude-haiku-4-5"
                ? await withRetry(() => callClaude(promptText), callLabel)
                : await withRetry(() => callGPT(promptText),    callLabel);

              const { has_capability, evidence, limitations, confidence, terminology_tags, parsed, parseError } =
                parseFeatureResponse(rawText);

              await insertRalfiFeatureResponse({
                brand_name:      b,
                feature_id:      f.feature_id,
                feature_tag:     f.feature_tag,
                model,
                run_number:      r,
                run_date:        today,
                has_capability,
                evidence,
                limitations,
                confidence,
                terminology_tags,
                raw_json:        parseError ? { raw: rawText.slice(0, 2000) } : parsed,
                parse_error:     parseError,
                grounded:        false,
              });

              if (!pairResults.has(pairKey)) pairResults.set(pairKey, []);
              pairResults.get(pairKey)!.push({ has_capability, confidence, parse_error: parseError });
              return { success: true };
            } catch (err) {
              console.error(`[ralfi-feature-collection] error: ${brandName}/${feature.feature_id}/run${run}:`, err);
              if (!pairResults.has(pairKey)) pairResults.set(pairKey, []);
              pairResults.get(pairKey)!.push({ has_capability: null, confidence: null, parse_error: true });
              return { success: false };
            }
          });
        }
      }
    }

    const expected  = tasks.length;
    console.log(`[ralfi-feature-collection] start — model=${model}, date=${today}, brands=${brands.length}, features=${RALFI_FEATURES.length}, tasks=${expected}`);
    const results   = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed    = expected - succeeded;
    console.log(`[ralfi-feature-collection] done — succeeded=${succeeded}/${expected}, failed=${failed}`);

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
            const { has_capability, evidence, limitations, confidence, terminology_tags, parsed, parseError } =
              parseFeatureResponse(rawText);
            await insertRalfiFeatureResponse({
              brand_name: b, feature_id: f.feature_id, feature_tag: f.feature_tag,
              model: "claude-haiku-4-5", run_number: 0, run_date: today,
              has_capability, evidence, limitations, confidence, terminology_tags,
              raw_json: parseError ? { raw: rawText.slice(0, 2000) } : parsed,
              parse_error: parseError, grounded: true,
            });
            groundingRan++;
          } catch (err) {
            console.error(`[ralfi-feature-collection] grounding error: ${b}/${f.feature_id}:`, err);
            groundingFailed++;
          }
        });
      }
      if (groundingTasks.length > 0) {
        console.log(`[ralfi-feature-collection] grounding pass: ${groundingTasks.length} pairs`);
        await runWithConcurrency(groundingTasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
      }
    }

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Ralfi Feature Collection failed (${model}, ${today})`,
        html: `<h2>Ralfi Feature Pipeline — Collection Failures</h2>
          <p>Model: ${model} | Date: ${today} | Succeeded: ${succeeded}/${expected} | Failed: ${failed}</p>
          <p>Check Vercel function logs for per-task errors.</p>`,
      }).catch((e) => console.error("[alert] ralfi feature collection email failed:", e));
    }

    return Response.json({
      mode: "ralfi_feature_collection", model, date: today,
      brands: brands.length, features: RALFI_FEATURES.length,
      expected, succeeded, failed, grounding_ran: groundingRan, grounding_failed: groundingFailed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] ralfi-feature-collection crashed (${model}):`, message);
    await sendEmail({
      subject: `[AgenticLib] CRASH — Ralfi Feature Collection (${model}, ${today ?? "unknown"})`,
      html: `<h2>Ralfi Feature Pipeline — Unhandled Crash</h2>
        <p>Model: ${model} | Timestamp: ${runTimestamp} | Error: ${message}</p>`,
    }).catch(() => {});
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
