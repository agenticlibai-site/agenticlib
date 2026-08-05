import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  DEXIFY_SENTIMENT_CLUSTERS,
  DEXIFY_SENTIMENT_SYSTEM_PROMPT,
  buildDexifySentimentPrompt,
  type DexifySentimentCluster,
} from "@/lib/brand-visibility/dexify-sentiment";
import {
  initDexifyDB,
  getDexifyTopBrandsForFeatureScoring,
  insertDexifySentimentResponse,
} from "@/lib/brand-visibility/db";
import { sendEmail } from "@/lib/email";

export const dynamic    = "force-dynamic";
export const maxDuration = 300;

// ── Schedule ───────────────────────────────────────────────────────────────────
//   ?model=claude-haiku-4-5  →  9:00 UTC daily
//   ?model=gpt-4o-mini       →  9:30 UTC daily
//
// ~20 brands × 5 clusters = 100 calls per model per day.
// Weekly aggregation: dexify-sentiment-aggregate, Sunday 2:00 AM UTC.
// ──────────────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
      if ((status === 429 || (status != null && status >= 500)) && attempt < RETRY_DELAYS_MS.length) {
        const delay = RETRY_DELAYS_MS[attempt];
        console.warn(`[dexify-sentiment-collection] ${status} on ${label} — retry ${attempt + 1}/3 in ${delay}ms`);
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
    max_tokens: 512,
    system:     DEXIFY_SENTIMENT_SYSTEM_PROMPT,
    messages:   [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

// Grounded variant: web search runs before the sentiment question.
// Used as a fallback when the standard Claude call signals low confidence,
// which for zero-knowledge brands (no LLM training data) happens reliably.
// The grounded result overwrites the standard row via ON CONFLICT DO UPDATE.
async function callClaudeGroundedSentiment(brandName: string, bucketTag: string): Promise<string> {
  const basePrompt = buildDexifySentimentPrompt(brandName, bucketTag);
  const searchMsg =
    `Search for user reviews, testimonials, and market perception of ${brandName} ` +
    `to understand how tradespeople evaluate it. Look for both praise and criticism. ` +
    `Then answer only about ${brandName}:\n\n${basePrompt}`;
  const res = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 512,
    tools:      [{ type: "web_search_20250305" as const, name: "web_search" as const }],
    messages:   [{ role: "user", content: searchMsg }],
  });
  // Concatenate ALL text blocks — the JSON may appear in any block when web
  // search is active, not necessarily the last one.
  const textBlocks = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  return textBlocks.map((b) => b.text).join("\n\n");
}

function needsSentimentGrounding(confidence: string | null, parseError: boolean): boolean {
  if (parseError) return true;
  if (confidence === "low") return true;
  return false;
}

async function callGPT(promptText: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    max_tokens:      512,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: DEXIFY_SENTIMENT_SYSTEM_PROMPT },
      { role: "user",   content: promptText },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

function parseSentimentResponse(raw: string): {
  sentiment:   string | null;
  confidence:  string | null;
  descriptors: string[] | null;
  limitations: string[] | null;
  parsed:      object | null;
  parseError:  boolean;
} {
  try {
    let jsonStr = raw.trim();

    // Strategy 1: extract from a ```json ... ``` block anywhere in the string.
    // Grounded responses include prose before/after the code block.
    const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlock) {
      jsonStr = codeBlock[1].trim();
    } else {
      // Strategy 2: strip a leading/trailing top-level fence (GPT structured output).
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      // Strategy 3: extract the first balanced JSON object from prose.
      const objMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objMatch) jsonStr = objMatch[0];
    }

    const obj = JSON.parse(jsonStr);
    const descriptors = Array.isArray(obj.descriptors)
      ? (obj.descriptors as unknown[]).filter((d): d is string => typeof d === "string")
      : null;
    const limitations = Array.isArray(obj.limitations)
      ? (obj.limitations as unknown[]).filter((d): d is string => typeof d === "string")
      : null;
    return {
      sentiment:   typeof obj.sentiment  === "string" ? obj.sentiment  : null,
      confidence:  typeof obj.confidence === "string" ? obj.confidence : null,
      descriptors: descriptors?.length ? descriptors : null,
      limitations: limitations?.length  ? limitations : null,
      parsed:      obj,
      parseError:  false,
    };
  } catch {
    return { sentiment: null, confidence: null, descriptors: null, limitations: null, parsed: null, parseError: true };
  }
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

  const now   = new Date();
  const today = now.toISOString().split("T")[0];
  const runTimestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const { searchParams } = new URL(request.url);
  const modelParam = searchParams.get("model");

  if (!modelParam || !["claude-haiku-4-5", "gpt-4o-mini"].includes(modelParam)) {
    return Response.json({ error: "?model= required: claude-haiku-4-5 or gpt-4o-mini" }, { status: 400 });
  }

  const model = modelParam as "claude-haiku-4-5" | "gpt-4o-mini";

  try {
    await initDexifyDB();
    const brands = await getDexifyTopBrandsForFeatureScoring();

    if (brands.length === 0) {
      return Response.json({
        mode:  "dexify_sentiment_collection",
        date:  today,
        note:  "no brands in dexify_daily_summary yet — run dexify-collection first",
      });
    }

    // Track standard results per (brand, bucketTag) so the grounding pass
    // knows which pairs need web-search fallback.
    type StandardResult = { confidence: string | null; parseError: boolean; cluster: DexifySentimentCluster };
    const standardResults = new Map<string, StandardResult>();

    const tasks: (() => Promise<{ success: boolean }>)[] = [];

    for (const brandName of brands) {
      for (const cluster of DEXIFY_SENTIMENT_CLUSTERS) {
        const b = brandName;
        const c = cluster;

        tasks.push(async () => {
          const callLabel = `${b}/${c.bucket_tag}`;
          try {
            const promptText = buildDexifySentimentPrompt(b, c.bucket_tag);
            const rawText    = model === "claude-haiku-4-5"
              ? await withRetry(() => callClaude(promptText), callLabel)
              : await withRetry(() => callGPT(promptText),   callLabel);

            const { sentiment, confidence, descriptors, limitations, parsed, parseError } =
              parseSentimentResponse(rawText);

            await insertDexifySentimentResponse({
              brand_name:  b,
              prompt_id:   c.prompt_id,
              bucket_tag:  c.bucket_tag,
              model,
              run_date:    today,
              sentiment,
              confidence,
              descriptors,
              limitations,
              raw_json:    parseError ? { raw: rawText.slice(0, 2000) } : parsed,
              parse_error: parseError,
            });

            // Record for Claude grounding-pass decision
            if (model === "claude-haiku-4-5") {
              standardResults.set(`${b}::${c.bucket_tag}`, { confidence, parseError, cluster: c });
            }

            return { success: true };
          } catch (err) {
            console.error(`[dexify-sentiment-collection] error: ${callLabel} (${model}):`, err);
            if (model === "claude-haiku-4-5") {
              standardResults.set(`${b}::${c.bucket_tag}`, { confidence: null, parseError: true, cluster: c });
            }
            return { success: false };
          }
        });
      }
    }

    const expected  = tasks.length;
    const results   = await runWithConcurrency(tasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
    const succeeded = results.filter((r) => r.success).length;
    const failed    = expected - succeeded;

    // ── Grounding pass (Claude only) ─────────────────────────────────────────
    // For any (brand, cluster) pair where the standard Claude call came back
    // low-confidence or parse-errored, re-run with web search.
    // The grounded result overwrites the standard row via ON CONFLICT DO UPDATE.
    // GPT has no grounding capability — see docs/dexify-grounding-gap.md for status.
    let groundingRan = 0, groundingFailed = 0;

    if (model === "claude-haiku-4-5") {
      const groundingTasks: (() => Promise<void>)[] = [];

      for (const [pairKey, result] of standardResults) {
        if (!needsSentimentGrounding(result.confidence, result.parseError)) continue;
        const [brandName, bucketTag] = pairKey.split("::");
        const cluster = result.cluster;

        groundingTasks.push(async () => {
          try {
            const rawText = await withRetry(
              () => callClaudeGroundedSentiment(brandName, bucketTag),
              `${brandName}/${bucketTag}/grounded`,
            );
            const { sentiment, confidence, descriptors, limitations, parsed, parseError } =
              parseSentimentResponse(rawText);

            // Only write grounded result when it successfully parsed — a failed
            // grounded parse must NOT overwrite the valid standard response via
            // ON CONFLICT DO UPDATE.
            if (parseError) {
              console.warn(
                `[dexify-sentiment-collection] grounding parse failed for ${brandName}/${bucketTag} — keeping standard result`,
              );
              groundingFailed++;
              return;
            }

            await insertDexifySentimentResponse({
              brand_name:  brandName,
              prompt_id:   cluster.prompt_id,
              bucket_tag:  bucketTag,
              model:       "claude-haiku-4-5",
              run_date:    today,
              sentiment,
              confidence,
              descriptors,
              limitations,
              raw_json:    { ...(parsed as object), grounded: true },
              parse_error: false,
            });
            groundingRan++;
          } catch (err) {
            console.error(`[dexify-sentiment-collection] grounding error: ${brandName}/${bucketTag}:`, err);
            groundingFailed++;
          }
        });
      }

      if (groundingTasks.length > 0) {
        console.log(`[dexify-sentiment-collection] grounding pass: ${groundingTasks.length} pairs`);
        await runWithConcurrency(groundingTasks, BATCH_CONCURRENCY, BATCH_DELAY_MS);
      }
    }

    if (failed > 0) {
      await sendEmail({
        subject: `[AgenticLib] ALERT — Dexify Sentiment Collection failed (${model}, ${today})`,
        html: `<h2>Dexify Sentiment Pipeline — Collection Failures</h2>
          <p>Timestamp: ${runTimestamp} | Model: ${model} | Date: ${today}</p>
          <p>Succeeded: ${succeeded} / ${expected} | Failed: ${failed}</p>
          <p>Check Vercel function logs for per-task errors.</p>`,
      }).catch((e) => console.error("[alert] dexify sentiment collection email failed:", e));
    }

    return Response.json({
      mode:            "dexify_sentiment_collection",
      model,
      date:            today,
      brands:          brands.length,
      clusters:        DEXIFY_SENTIMENT_CLUSTERS.length,
      expected,
      succeeded,
      failed,
      grounding_ran:   groundingRan,
      grounding_failed: groundingFailed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron] dexify-sentiment-collection crashed (${model}):`, message);
    await sendEmail({
      subject: `[AgenticLib] CRASH — Dexify Sentiment Collection (${model}, ${today ?? "unknown"})`,
      html: `<h2>Dexify Sentiment Pipeline — Unhandled Crash</h2>
        <p>Model: ${model} | Timestamp: ${runTimestamp} | Error: ${message}</p>`,
    }).catch(() => {});
    return Response.json({ error: "Internal server error", message }, { status: 500 });
  }
}
