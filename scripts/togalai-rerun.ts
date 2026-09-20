// scripts/togalai-rerun.ts
// Targeted re-run of Togal.AI's 17 missing ESAI feature scores.
// Run with: npx tsx scripts/togalai-rerun.ts

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { neon } from "@neondatabase/serverless";
import { ESAI_FEATURES, buildEsaiFeaturePrompt } from "../lib/brand-visibility/esai-features";

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BRAND = "Togal.AI";
const TODAY = new Date().toISOString().split("T")[0];
const RUNS  = 3;

const ALREADY_SCORED = new Set([
  "ai_autonomous_scope", "ai_plan_interpretation", "commercial_multi_trade",
  "commercial_tender_pricing", "plans_cross_reference",
]);
const MISSING = ESAI_FEATURES.filter(f => !ALREADY_SCORED.has(f.feature_id));
console.log(`Re-running ${MISSING.length} missing features for ${BRAND} on ${TODAY}`);

const SYSTEM_PROMPT =
  "You are a competitive intelligence analyst evaluating estimating and takeoff software used by Australian builders, trades and estimators. " +
  "For each feature, explain the brand's specific implementation and the practical value it delivers to a builder pricing a construction job — not generic feature existence. " +
  "Return ONLY valid JSON matching the exact schema. No markdown, no explanation — just the JSON object.";

function parse(raw: string): { parsed: Record<string, unknown> | null; error: boolean } {
  try {
    const s = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const i = s.indexOf("{"), j = s.lastIndexOf("}");
    if (i === -1 || j === -1) throw new Error("no JSON");
    return { parsed: JSON.parse(s.slice(i, j + 1)), error: false };
  } catch {
    return { parsed: null, error: true };
  }
}

async function callModel(model: "claude" | "openai", prompt: string): Promise<string> {
  if (model === "claude") {
    const m = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001", max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    return m.content[0].type === "text" ? m.content[0].text : "";
  } else {
    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini", max_tokens: 1024,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
    });
    return r.choices[0]?.message?.content ?? "";
  }
}

async function main() {
let done = 0;
for (const feature of MISSING) {
  for (const [model, modelName] of [["claude", "claude-haiku-4-5"], ["openai", "gpt-4o-mini"]] as const) {
    for (let run = 1; run <= RUNS; run++) {
      const prompt = buildEsaiFeaturePrompt(feature, BRAND);
      try {
        const raw = await callModel(model, prompt);
        const { parsed, error } = parse(raw);
        await sql`
          INSERT INTO esai_feature_responses
            (brand_name, feature_id, feature_tag, model, run_date, run_number,
             has_capability, evidence, limitations, confidence, grounded,
             terminology_tags, raw_json, parse_error)
          VALUES (
            ${BRAND}, ${feature.feature_id}, ${feature.feature_tag}, ${modelName},
            ${TODAY}::date, ${run},
            ${(parsed?.has_capability as string) ?? null},
            ${(parsed?.evidence as string) ?? null},
            ${(parsed?.limitations as string) ?? null},
            ${(parsed?.confidence as string) ?? null},
            false,
            ${(parsed?.terminology_tags as string[]) ?? null},
            ${parsed ?? null},
            ${error}
          )
        `;
        console.log(`  ✓ ${feature.feature_id} / ${modelName} / run${run} — ${(parsed?.has_capability as string) ?? "parse_error"}`);
      } catch (err) {
        console.error(`  ✗ ${feature.feature_id} / ${modelName} / run${run}:`, (err as Error).message);
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }
  done++;
  console.log(`[${done}/${MISSING.length}] ${feature.feature_id} complete`);
}

console.log("\nDone — now trigger esai-feature-aggregate to recompute Togal.AI scores.");
}

main().catch(err => { console.error(err); process.exit(1); });
