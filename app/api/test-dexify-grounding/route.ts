/**
 * TEMPORARY DIAGNOSTIC ROUTE — delete after grounding test is complete.
 *
 * Tests whether Claude web-search grounding actually surfaces product evidence
 * for Dexify locked brands that have zero LLM training-data knowledge.
 * Read-only — no database writes.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  DEXIFY_FEATURE_SYSTEM_PROMPT,
  DEXIFY_GROUNDING_INSTRUCTION,
  DEXIFY_JSON_OUTPUT_SPEC,
  DEXIFY_FEATURES,
  buildDexifyPrompt,
  type DexifyFeature,
} from "@/lib/brand-visibility/dexify-features";

export const dynamic    = "force-dynamic";
export const maxDuration = 120;

const TEST_BRANDS   = ["Sophiie AI", "Voxworks"];
const TEST_FEATURE_IDS = ["ai_inbound_enquiry_handling", "voice_to_quote_generation", "quote_followup_automation"];

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseJSON(raw: string): Record<string, unknown> | null {
  try {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch { return null; }
}

async function runUngrounded(brand: string, feature: DexifyFeature) {
  const promptText = buildDexifyPrompt(feature, brand);
  const res = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system:     DEXIFY_FEATURE_SYSTEM_PROMPT,
    messages:   [{ role: "user", content: promptText }],
  });
  const block = res.content.find((b) => b.type === "text");
  const raw = block?.type === "text" ? block.text : "";
  return { raw, parsed: parseJSON(raw) };
}

async function runGrounded(brand: string, feature: DexifyFeature) {
  const featurePrompt = buildDexifyPrompt(feature, brand);
  const searchMsg = `Search for information about ${brand}'s product features, specifically: ${feature.feature_name}. Then answer this question about ${brand} only:\n\n${featurePrompt}`;
  const res = await anthropic.messages.create({
    model:    "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    tools:    [{ type: "web_search_20250305" as const, name: "web_search" as const }],
    messages: [{ role: "user", content: searchMsg }],
  });
  const searchFired   = res.content.some((b) => b.type === "tool_use" && b.name === "web_search");
  const searchQueries = res.content
    .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "web_search")
    .map((b) => (b.input as { query?: string }).query ?? "(no query)");
  const blockTypes  = res.content.map((b) => b.type);
  const textBlocks  = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  const raw = textBlocks[textBlocks.length - 1]?.text ?? "";
  return { raw, parsed: parseJSON(raw), searchFired, searchQueries, blockTypes };
}

export async function GET(request: Request) {
  // Protected by DEXIFY_TEST_TOKEN — temp env var added for this diagnostic, deleted after.
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.DEXIFY_TEST_TOKEN || secret !== process.env.DEXIFY_TEST_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const features = DEXIFY_FEATURES.filter((f) => TEST_FEATURE_IDS.includes(f.feature_id));
  const results: Record<string, unknown>[] = [];

  for (const brand of TEST_BRANDS) {
    for (const feature of features) {
      const pair: Record<string, unknown> = { brand, feature_id: feature.feature_id };

      // Ungrounded
      try {
        const { parsed } = await runUngrounded(brand, feature);
        pair.ungrounded = {
          has_capability: parsed?.has_capability ?? "PARSE_ERROR",
          confidence:     parsed?.confidence     ?? "PARSE_ERROR",
          evidence:       parsed?.evidence       ?? "(none)",
          limitations:    parsed?.limitations    ?? "(none)",
        };
      } catch (err) {
        pair.ungrounded = { error: (err as Error).message };
      }

      await new Promise((r) => setTimeout(r, 800));

      // Grounded (forced, regardless of ungrounded result)
      try {
        const { parsed, searchFired, searchQueries, blockTypes } = await runGrounded(brand, feature);
        pair.grounded = {
          search_fired:   searchFired,
          search_queries: searchQueries,
          block_types:    blockTypes,
          has_capability: parsed?.has_capability ?? "PARSE_ERROR",
          confidence:     parsed?.confidence     ?? "PARSE_ERROR",
          evidence:       parsed?.evidence       ?? "(none)",
          limitations:    parsed?.limitations    ?? "(none)",
        };
      } catch (err) {
        pair.grounded = { error: (err as Error).message };
      }

      results.push(pair);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return Response.json({ test: "dexify-grounding", brands: TEST_BRANDS, features: TEST_FEATURE_IDS, results });
}
