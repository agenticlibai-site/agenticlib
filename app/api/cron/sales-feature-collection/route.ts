import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  FEATURES,
  FEATURE_SYSTEM_PROMPT,
  getFeaturesForBrand,
  buildPrompt,
  type Feature,
} from "@/lib/brand-visibility/sales-features";
import {
  initSalesVisibilityDB,
  loadLockedSalesAgents,
  insertSalesFeatureResponse,
  type LockedSalesAgent,
} from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ── Split-job design ───────────────────────────────────────────────────────────
// ~178 brand+feature pairs × 3 runs = 534 API calls per model.
//
//   ?model=claude-haiku-4-5         →  Job 1, 7:00 UTC (all brands, ~2 min)
//   ?model=gpt-4o-mini&half=1       →  Job 2, 9:00 UTC (brands 0..mid, ~2.5 min)
//   ?model=gpt-4o-mini&half=2       →  Job 3, 9:15 UTC (brands mid..end, ~2.5 min)
//
// GPT split prevents the 5-minute maxDuration timeout (534 tasks × ~3.5s each).
// Scoring runs at 10:00 UTC via sales-feature-aggregate.
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
        console.warn(`[sales-feature-collection] 429 on ${label} — retry ${attempt + 1}/3 in ${delay}ms`);
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
    model:      "claude-haiku-4-5",
    max_tokens: 1024,
    system:     FEATURE_SYSTEM_PROMPT,
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
      { role: "system", content: FEATURE_SYSTEM_PROMPT },
      { role: "user",   content: promptText },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

function parseFeatureResponse(raw: string): {
  has_capability: string | null;
  evidence:       string | null;
  limitations:    string | null;
  confidence:     string | null;
  parsed:         object | null;
  parseError:     boolean;
} {
  function extract(obj: Record<string, unknown>) {
    return {
      has_capability: typeof obj.has_capability === "string" ? obj.has_capability : null,
      evidence:       typeof obj.evidence       === "string" ? obj.evidence       : null,
      limitations:    typeof obj.limitations    === "string" ? obj.limitations    : null,
      confidence:     typeof obj.confidence     === "string" ? obj.confidence     : null,
      parsed:         obj,
      parseError:     false,
    };
  }

  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return extract(JSON.parse(cleaned) as Record<string, unknown>);
  } catch { /* fall through */ }

  const first = cleaned.indexOf("{");
  const last  = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try {
      return extract(JSON.parse(cleaned.slice(first, last + 1)) as Record<string, unknown>);
    } catch { /* fall through */ }
  }

  return { has_capability: null, evidence: null, limitations: null, confidence: null, parsed: null, parseError: true };
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

async function callClaudeGrounded(brand: LockedSalesAgent, feature: Feature): Promise<string> {
  const featurePrompt = buildPrompt(feature, brand.brand_name);
  const res = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    tools:      [{ type: "web_search_20250305" as const, name: "web_search" as const }],
    messages:   [{
      role:    "user",
      content: `Search for information about ${brand.brand_name}'s product features, specifically: ${feature.feature_name}. Then answer this question about ${brand.brand_name} only, based on what you find:\n\n${featurePrompt}`,
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
    const batchResults = await Promise.all(batch.map((t) => t()));
    results.push(...batchResults);
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

  const now   = new Date();
  const today = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const { searchParams } = new URL(request.url);
  const modelParam = searchParams.get("model");
  const halfParam  = searchParams.get("half");

  if (!modelParam || !["claude-haiku-4-5", "gpt-4o-mini"].includes(modelParam)) {
    return Response.json({ error: "?model= required: claude-haiku-4-5 or gpt-4o-mini" }, { status: 400 });
  }

  const model = modelParam as "claude-haiku-4-5" | "gpt-4o-mini";
  const half  = halfParam === "1" ? 1 : halfParam === "2" ? 2 : null;
  const halfLabel = half !== null ? ` half=${half}` : "";

  try {
    await initSalesVisibilityDB();
    const allBrands = await loadLockedSalesAgents();

    // Both models split by brand half to stay within maxDuration=300s.
    const mid = Math.ceil(allBrands.length / 2);
    const brands = (half !== null)
      ? (half === 1 ? allBrands.slice(0, mid) : allBrands.slice(mid))
      : allBrands;

    const pairResults = new Map<string, RunSummary[]>();
    const pairMeta    = new Map<string, { brand: LockedSalesAgent; feature: Feature }>();

    const tasks: (() => Promise<{ success: boolean }>)[] = [];

    for (const brand of brands) {
      const features = getFeaturesForBrand(brand.brand_name);
      for (const feature of features) {
        const pairKey = `${brand.brand_name}::${feature.feature_id}`;
        pairMeta.set(pairKey, { brand, feature });

        for (let run = 1; run <= RUNS_PER_FEATURE; run++) {
          const b = brand;
          const f = feature;
          const r = run;

          tasks.push(async () => {
            try {
              const promptText = buildPrompt(f, b.brand_name);
              const callLabel  = `${b.brand_name}/${f.feature_id}/run${r}`;
              const rawText    = model === "claude-haiku-4-5"
                ? await withRetry(() => callClaude(promptText), callLabel)
                : await withRetry(() => callGPT(promptText),    callLabel);

              const { has_capability, evidence, limitations, confidence, parsed, parseError } =
                parseFeatureResponse(rawText);

              await insertSalesFeatureResponse({
                brand_name:     b.brand_name,
                feature_id:     f.feature_id,
                feature_tag:    f.feature_tag,
                model,
                run_number:     r,
                run_date:       today,
                has_capability,
                evidence,
                limitations,
                confidence,
                raw_json:       parseError ? { raw: rawText.slice(0, 2000) } : parsed,
                parse_error:    parseError,
                grounded:       false,
              });

              if (!pairResults.has(pairKey)) pairResults.set(pairKey, []);
              pairResults.get(pairKey)!.push({ has_capability, confidence, parse_error: parseError });

              return { success: true };
            } catch (err) {
              console.error(
                `[sales-feature-collection] error: ${brand.brand_name}/${feature.feature_id}/run${run} (${model}):`,
                err,
              );
              if (!pairResults.has(pairKey)) pairResults.set(pairKey, []);
              pairResults.get(pairKey)!.push({ has_capability: null, confidence: null, parse_error: true });
              return { success: false };
            }
          });
        }
      }
    }

    const expected  = tasks.length;
    console.log(`[sales-feature-collection] start — model=${model}${halfLabel}, date=${today}, brands=${brands.length}, expected=${expected} tasks`);
    const results   = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed    = expected - succeeded;
    console.log(`[sales-feature-collection] done — model=${model}${halfLabel}, succeeded=${succeeded}/${expected}, failed=${failed}`);

    let groundingRan = 0;
    let groundingFailed = 0;

    if (model === "claude-haiku-4-5") {
      const groundingTasks: (() => Promise<void>)[] = [];

      for (const [pairKey, runs] of pairResults) {
        if (!needsGrounding(runs)) continue;
        const meta = pairMeta.get(pairKey);
        if (!meta) continue;
        const { brand: b, feature: f } = meta;

        groundingTasks.push(async () => {
          try {
            const rawText = await withRetry(
              () => callClaudeGrounded(b, f),
              `${b.brand_name}/${f.feature_id}/grounded`,
            );
            const { has_capability, evidence, limitations, confidence, parsed, parseError } =
              parseFeatureResponse(rawText);

            await insertSalesFeatureResponse({
              brand_name:     b.brand_name,
              feature_id:     f.feature_id,
              feature_tag:    f.feature_tag,
              model:          "claude-haiku-4-5",
              run_number:     0,
              run_date:       today,
              has_capability,
              evidence,
              limitations,
              confidence,
              raw_json:       parseError ? { raw: rawText.slice(0, 2000) } : parsed,
              parse_error:    parseError,
              grounded:       true,
            });
            groundingRan++;
          } catch (err) {
            console.error(`[sales-feature-collection] grounding error: ${b.brand_name}/${f.feature_id}:`, err);
            groundingFailed++;
          }
        });
      }

      if (groundingTasks.length > 0) {
        console.log(`[sales-feature-collection] grounding pass: ${groundingTasks.length} uncertain pairs`);
        await runWithConcurrency(groundingTasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
      }
    }

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Sales Feature Collection failed (${model}${halfLabel}, ${today})`,
        html: `
          <h2>Sales Feature Pipeline — Collection Failures</h2>
          <table style="border-collapse:collapse;font-family:monospace">
            <tr><td style="padding:4px 12px 4px 0"><strong>Run timestamp</strong></td><td>${runTimestamp}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>${model}${halfLabel}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Date</strong></td><td>${today}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Succeeded</strong></td><td>${succeeded} / ${expected}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Failed</strong></td><td>${failed}</td></tr>
          </table>
          <p>Check Vercel function logs for per-task errors.</p>
        `,
      }).catch((e) => console.error("[alert] sales feature collection email failed:", e));
    }

    return Response.json({
      mode:             "sales_feature_collection",
      model,
      half:             half ?? "all",
      date:             today,
      brands:           brands.length,
      features:         FEATURES.length,
      expected,
      succeeded,
      failed,
      grounding_ran:    groundingRan,
      grounding_failed: groundingFailed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] sales-feature-collection crashed (${model}${halfLabel}):`, message);

    await sendEmail({
      subject: `[AgenticLib] CRASH — Sales Feature Collection (${model}${halfLabel}, ${today})`,
      html: `
        <h2>Sales Feature Pipeline — Unhandled Crash</h2>
        <table style="border-collapse:collapse;font-family:monospace">
          <tr><td style="padding:4px 12px 4px 0"><strong>Model</strong></td><td>${model}${halfLabel}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Timestamp</strong></td><td>${runTimestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Error</strong></td><td>${message}</td></tr>
        </table>
      `,
    }).catch(() => {});

    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
