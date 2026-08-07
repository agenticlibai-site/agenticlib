/**
 * recheck-voice-to-quote.ts
 *
 * Targeted grounded re-check of voice_to_quote_generation for the 7 brands
 * currently scored not_documented. Uses the updated, disambiguated prompt
 * from dexify-features.ts. ONE grounded Claude call per brand — no full re-run.
 *
 * Does NOT write anything to the DB. Prints results for manual approval.
 *
 * Run:
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/recheck-voice-to-quote.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import fs   from "fs";
import path from "path";

// ── Load .env.local ────────────────────────────────────────────────────────────
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=\s][^=]*)=["']?(.*?)["']?\s*$/);
    if (!m) continue;
    const [, key, val] = m;
    if (!process.env[key] && val) process.env[key] = val;
  }
}
loadEnvLocal();

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";
if (!ANTHROPIC_KEY) {
  console.error("❌  ANTHROPIC_API_KEY not set.");
  process.exit(1);
}

const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ── Feature config (mirrors dexify-features.ts exactly) ───────────────────────

const GROUNDING_INSTRUCTION =
  "Only include information specific to [BRAND]'s documented product. " +
  "Do not infer capabilities from what similar tools typically do. " +
  "If you are uncertain whether [BRAND] specifically has this capability for tradespeople or trade businesses, " +
  "set has_capability to not_documented rather than guessing.";

const JSON_OUTPUT_SPEC =
  '{\n' +
  '  "has_capability": "yes|no|partial|not_documented",\n' +
  '  "evidence": "if yes/partial: 1-2 sentences on what [BRAND] specifically does for this capability and what makes its approach useful for a tradie — describe the mechanism and practical outcome, not just that the feature exists. If no/not_documented: what is absent or unclear.",\n' +
  '  "limitations": "any caveats or gaps",\n' +
  '  "confidence": "high|medium|low"\n' +
  '}';

// Updated, disambiguated prompt from Step 1
const VOICE_TO_QUOTE_PROMPT =
  `I'm on a job site and want to describe what needs to be done by speaking into my phone — and have [BRAND] automatically generate a formatted, client-facing quote from that spoken description, without typing anything or going back to the office. Does [BRAND] support voice-to-quote generation specifically in this sense: the TRADIE speaks a job description (scope, materials, labour) and the platform converts it into a structured quote document the tradie can send to their client?

IMPORTANT — this is NOT the same as AI inbound call handling. Do NOT count [BRAND] as having this capability if its primary voice feature is an AI receptionist that answers incoming customer calls and mentions prices during that call. This feature requires the tradie themselves to initiate a voice description of a job, with no customer on the line, and receive a formatted quote document as output. If [BRAND]'s voice capability is inbound-call-only (AI answering customer enquiries), set has_capability to not_documented for this feature.
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`;

const SYSTEM_PROMPT =
  "You are a competitive intelligence analyst evaluating AI agent platforms and trade business software. " +
  "For each feature, explain the brand's specific implementation and the practical value it delivers to a tradie or trade business — not generic feature existence. " +
  "Return ONLY valid JSON matching the exact schema. No markdown, no explanation — just the JSON object.";

function buildPrompt(brandName: string): string {
  const grounding  = GROUNDING_INSTRUCTION.replaceAll("[BRAND]", brandName);
  const outputSpec = JSON_OUTPUT_SPEC.replaceAll("[BRAND]", brandName);
  return VOICE_TO_QUOTE_PROMPT
    .replaceAll("[BRAND]", brandName)
    .replace("[GROUNDING INSTRUCTION]", grounding)
    .replace("[JSON OUTPUT]", outputSpec);
}

// ── JSON parser (mirrors parseSentimentResponse logic) ────────────────────────
function parseResponse(raw: string): { has_capability: string; evidence: string; confidence: string } | null {
  let s = raw.trim();
  const block = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (block) s = block[1].trim();
  else {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const obj = s.match(/\{[\s\S]*\}/);
    if (obj) s = obj[0];
  }
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// ── Brands to recheck ─────────────────────────────────────────────────────────
const BRANDS = [
  "Sophiie AI",
  "Chime Labs",
  "Waboom AI",
  "Voxworks",
  "simPRO",
  "Square AI",
  "Wired",
];

// ── Main ──────────────────────────────────────────────────────────────────────
interface Result {
  brand:          string;
  has_capability: string;
  confidence:     string;
  evidence:       string;
  raw:            string;
  parse_error:    boolean;
}

async function main() {
  console.log(`\n🔍  Targeted voice_to_quote_generation recheck`);
  console.log(`    Feature: voice_to_quote_generation (disambiguated prompt)`);
  console.log(`    Brands:  ${BRANDS.join(", ")}`);
  console.log(`    Calls:   1 grounded Claude call per brand (${BRANDS.length} total)\n`);
  console.log(`    ⚠️  READ-ONLY — results printed for approval, nothing written to DB\n`);

  const results: Result[] = [];

  for (const brand of BRANDS) {
    process.stdout.write(`  [${results.length + 1}/${BRANDS.length}] ${brand.padEnd(16)} grounded … `);

    const prompt = buildPrompt(brand);
    let raw = "";
    let parseError = false;

    try {
      const res = await client.messages.create({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system:     SYSTEM_PROMPT,
        tools:      [{ type: "web_search_20250305" as const, name: "web_search" as const }],
        messages:   [{ role: "user", content: prompt }],
      });
      // Concatenate all text blocks (web search spans multiple blocks)
      const textBlocks = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
      raw = textBlocks.map((b) => b.text).join("\n\n");
    } catch (err) {
      raw = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
      parseError = true;
    }

    const parsed = parseError ? null : parseResponse(raw);
    if (!parsed) parseError = true;

    const cap  = parsed?.has_capability ?? "parse_error";
    const conf = parsed?.confidence    ?? "—";
    const evid = parsed?.evidence      ?? raw.slice(0, 120);

    const badge =
      cap === "yes"           ? "\x1b[32myes\x1b[0m" :
      cap === "partial"       ? "\x1b[33mpartial\x1b[0m" :
      cap === "no"            ? "\x1b[31mno\x1b[0m" :
      cap === "not_documented"? "\x1b[2mnot_documented\x1b[0m" :
                                "\x1b[35mparse_error\x1b[0m";

    console.log(`${badge} (${conf})`);

    results.push({ brand, has_capability: cap, confidence: conf, evidence: evid, raw, parse_error: parseError });

    await new Promise(r => setTimeout(r, 600));
  }

  // ── Summary table ─────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(88)}`);
  console.log(`RESULTS — voice_to_quote_generation (grounded, disambiguated prompt)`);
  console.log(`${"─".repeat(88)}`);
  console.log(`${"Brand".padEnd(18)} ${"has_capability".padEnd(17)} ${"Conf".padEnd(8)} Evidence`);
  console.log(`${"─".repeat(88)}`);

  for (const r of results) {
    const evShort = r.evidence.replace(/\n/g, " ").slice(0, 55);
    console.log(`${r.brand.padEnd(18)} ${r.has_capability.padEnd(17)} ${r.confidence.padEnd(8)} ${evShort}`);
  }

  console.log(`${"─".repeat(88)}`);

  // ── Per-brand evidence detail ─────────────────────────────────────────────
  console.log(`\n── Evidence detail ─────────────────────────────────────────────────────────\n`);
  for (const r of results) {
    console.log(`\x1b[1m${r.brand}\x1b[0m  →  ${r.has_capability} (${r.confidence})`);
    console.log(`  ${r.evidence.replace(/\n/g, "\n  ")}`);
    console.log();
  }

  console.log(`\n⏸️  Awaiting approval. Nothing has been written to dexify_feature_scores.`);
  console.log(`   Once you confirm which results are correct, re-run with --upsert to apply.\n`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
