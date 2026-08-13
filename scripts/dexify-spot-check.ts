/**
 * dexify-spot-check.ts
 * One-off diagnostic: does "Dexify" get mentioned when LLMs answer casual
 * tradie-voice queries about AI quoting / admin agents in Australia?
 *
 * Run:
 *   ANTHROPIC_API_KEY=sk-ant-... OPENAI_API_KEY=sk-proj-... \
 *     npx tsx scripts/dexify-spot-check.ts
 *
 * Output: console summary + scripts/dexify-spot-check-results.md
 *
 * Does NOT touch any DB tables, cron routes, or LOCKED_DEXIFY_BRANDS.
 */

import fs   from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI    from "openai";

// ── Load .env.local manually so the script works without dotenv ───────────────
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=\s][^=]*)=["']?(.*?)["']?\s*$/);
    if (!match) continue;
    const [, key, val] = match;
    if (!process.env[key] && val) process.env[key] = val;
  }
}
loadEnvLocal();

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const OPENAI_KEY    = process.env.OPENAI_API_KEY    ?? "";

if (!ANTHROPIC_KEY && !OPENAI_KEY) {
  console.error("❌  No API keys found. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY in your environment.");
  process.exit(1);
}

const anthropic = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;
const openai    = OPENAI_KEY    ? new OpenAI({ apiKey: OPENAI_KEY })       : null;

// ── Query set ────────────────────────────────────────────────────────────────
// Casual, realistic — the kind of thing a Sydney/AU tradie would type into
// ChatGPT or Claude, not a formal sales prompt.
const QUERIES: { label: string; cluster: string; text: string }[] = [
  {
    label:   "General discovery — AI agent for tradies",
    cluster: "general",
    text:    "best ai agent for tradies australia 2025",
  },
  {
    label:   "General discovery — AI agent for quoting on the go",
    cluster: "general",
    text:    "ai agent that does my quoting for me as a tradie australia",
  },
  {
    label:   "Voice-to-quote — AI agent voice to quote",
    cluster: "voice-quote",
    text:    "ai agent voice to quote for electrician or plumber australia",
  },
  {
    label:   "Voice-to-quote — speak job get quote AI agent",
    cluster: "voice-quote",
    text:    "ai agent you speak to on site and it generates a quote australia tradie",
  },
  {
    label:   "Post-job invoicing — AI agent invoicing",
    cluster: "post-job",
    text:    "ai agent that sends invoices for me after a job tradie australia",
  },
  {
    label:   "Post-job invoicing — AI agent follow up quotes",
    cluster: "post-job",
    text:    "ai agent that follows up on my unpaid quotes automatically",
  },
  {
    label:   "Compliance — AI agent SWMS on site",
    cluster: "compliance",
    text:    "ai agent that writes swms on site for me australia builder",
  },
  {
    label:   "Inbound comms — AI agent answers calls",
    cluster: "inbound-comms",
    text:    "ai agent that answers my calls and books jobs when im on a job site",
  },
  {
    label:   "Inbound comms — AI agent admin overnight",
    cluster: "inbound-comms",
    text:    "ai agent for small trade business that handles enquiries and admin overnight australia",
  },
  {
    label:   "General discovery — AI agent Sydney electrician",
    cluster: "general",
    text:    "ai agent for sydney electrician to cut down on admin and quotes",
  },
];

// Known competitors to extract from responses
const KNOWN_BRANDS = [
  "Dexify",
  "ServiceM8", "simPRO", "SimPRO", "Tradify", "AroFlo", "Fergus",
  "Jobber", "FieldPulse", "GorillaDesk", "Housecall Pro",
  "Sophiie AI", "Sophiie", "Voxworks", "Sammy AI", "Waboom AI",
  "Chime Labs", "Insta Quote AI", "Square AI", "Wired",
  "SmartSuites", "BuildXact", "Procore", "ServiceTitan",
  "monday.com", "Zapier", "Make", "n8n",
];

// ── API callers ───────────────────────────────────────────────────────────────
async function callClaudeUngrounded(text: string): Promise<string> {
  if (!anthropic) return "[skipped — no ANTHROPIC_API_KEY]";
  const res = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages:   [{ role: "user", content: text }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

async function callClaudeGrounded(text: string): Promise<string> {
  if (!anthropic) return "[skipped — no ANTHROPIC_API_KEY]";
  const res = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 800,
    tools:      [{ type: "web_search_20250305" as const, name: "web_search" as const }],
    messages:   [{ role: "user", content: text }],
  });
  // Concatenate all text blocks (web search responses span multiple blocks)
  const textBlocks = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  return textBlocks.map((b) => b.text).join("\n\n");
}

async function callGPTUngrounded(text: string): Promise<string> {
  if (!openai) return "[skipped — no OPENAI_API_KEY]";
  const res = await openai.chat.completions.create({
    model:      "gpt-4o-mini",
    max_tokens: 800,
    messages:   [{ role: "user", content: text }],
  });
  return res.choices[0]?.message?.content ?? "";
}

// ── Analysis helpers ──────────────────────────────────────────────────────────
function checkDexify(text: string): {
  mentioned: boolean;
  context: string | null;
  position: "first" | "early" | "buried" | "only-if-asked" | null;
} {
  if (!/dexify/i.test(text)) return { mentioned: false, context: null, position: null };

  const lc = text.toLowerCase();
  const idx = lc.indexOf("dexify");
  const totalLen = text.length;
  const snippet = text.slice(Math.max(0, idx - 80), idx + 120).replace(/\n+/g, " ").trim();

  let position: "first" | "early" | "buried" | "only-if-asked";
  if (idx < 150)               position = "first";
  else if (idx < totalLen / 3) position = "early";
  else                          position = "buried";

  return { mentioned: true, context: snippet, position };
}

function extractBrands(text: string): string[] {
  const found = new Set<string>();
  for (const brand of KNOWN_BRANDS) {
    if (new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(text)) {
      // Normalise casing to the canonical form
      found.add(brand === "SimPRO" ? "simPRO" : brand);
    }
  }
  return [...found].sort();
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface RunResult {
  queryLabel:  string;
  cluster:     string;
  queryText:   string;
  model:       string;
  grounded:    boolean;
  rawResponse: string;
  dexify:      ReturnType<typeof checkDexify>;
  brands:      string[];
}

async function main() {
  const results: RunResult[] = [];

  const RUNS: { model: string; grounded: boolean; fn: (t: string) => Promise<string> }[] = [
    { model: "claude-haiku-4-5", grounded: false, fn: callClaudeUngrounded },
    { model: "claude-haiku-4-5", grounded: true,  fn: callClaudeGrounded   },
    { model: "gpt-4o-mini",      grounded: false, fn: callGPTUngrounded    },
  ];

  const total = QUERIES.length * RUNS.length;
  let done = 0;

  console.log(`\n🔍  Dexify LLM visibility spot-check`);
  console.log(`    ${QUERIES.length} queries × ${RUNS.length} variants = ${total} API calls\n`);

  for (const q of QUERIES) {
    for (const run of RUNS) {
      done++;
      const tag = `[${done}/${total}] ${run.model}${run.grounded ? "+web" : "       "} — ${q.label}`;
      process.stdout.write(`  ${tag} … `);

      let rawResponse = "";
      try {
        rawResponse = await run.fn(q.text);
      } catch (err) {
        rawResponse = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
      }

      const dexify = checkDexify(rawResponse);
      const brands = extractBrands(rawResponse);

      const badge = dexify.mentioned
        ? `\x1b[32m✓ DEXIFY\x1b[0m [${dexify.position}]`
        : `\x1b[2m✗ no\x1b[0m`;
      console.log(`${badge}  —  ${brands.filter((b) => !/dexify/i.test(b)).join(", ") || "(no known brands)"}`);

      results.push({
        queryLabel:  q.label,
        cluster:     q.cluster,
        queryText:   q.text,
        model:       run.model,
        grounded:    run.grounded,
        rawResponse,
        dexify,
        brands,
      });

      // Small pause between calls
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  // ── Build markdown report ─────────────────────────────────────────────────
  const dexifyHits = results.filter((r) => r.dexify.mentioned);
  const lines: string[] = [
    `# Dexify LLM Visibility Spot-Check`,
    `_Run: ${new Date().toISOString()}_`,
    ``,
    `## Summary`,
    ``,
    `**Dexify mentioned in ${dexifyHits.length} / ${results.length} responses (${Math.round(dexifyHits.length / results.length * 100)}%)**`,
    ``,
    `| # | Query | Model | Grounded | Dexify? | Brands mentioned |`,
    `|---|-------|-------|----------|---------|-----------------|`,
  ];

  for (const r of results) {
    const dexStr = r.dexify.mentioned ? `✅ ${r.dexify.position}` : "✗";
    const others = r.brands.filter((b) => !/dexify/i.test(b)).join(", ") || "—";
    const modelShort = r.model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o-mini";
    const groundedStr = r.grounded ? "✓" : "—";
    lines.push(`| | **${r.queryLabel}** | ${modelShort} | ${groundedStr} | ${dexStr} | ${others} |`);
  }

  // Per-query detail sections
  lines.push(``, `---`, ``, `## Full responses by query`, ``);

  const byQuery: Record<string, RunResult[]> = {};
  for (const r of results) {
    if (!byQuery[r.queryLabel]) byQuery[r.queryLabel] = [];
    byQuery[r.queryLabel].push(r);
  }

  for (const [label, runs] of Object.entries(byQuery)) {
    const q = runs[0];
    lines.push(`### ${label}`, ``, `> "${q.queryText}"`, ``);
    for (const r of runs) {
      const modelLabel = `${r.model}${r.grounded ? " +web" : ""}`;
      lines.push(`#### ${modelLabel}`, ``);
      if (r.dexify.mentioned) {
        lines.push(`**🟢 Dexify mentioned (${r.dexify.position})**`, ``);
        lines.push(`> ...${r.dexify.context}...`, ``);
      } else {
        lines.push(`_Dexify not mentioned._`, ``);
      }
      lines.push(`**Brands found:** ${r.brands.join(", ") || "none detected"}`, ``);
      lines.push(`<details><summary>Full response</summary>`, ``, "```", r.rawResponse, "```", `</details>`, ``);
    }
  }

  // Competitor frequency across ALL responses
  const freq: Record<string, number> = {};
  for (const r of results) {
    for (const b of r.brands) {
      freq[b] = (freq[b] ?? 0) + 1;
    }
  }
  const ranked = Object.entries(freq).sort((a, b) => b[1] - a[1]);

  lines.push(`---`, ``, `## Competitor mention frequency (all responses)`, ``);
  lines.push(`| Brand | Mentions (out of ${results.length}) |`);
  lines.push(`|-------|---------|`);
  for (const [brand, count] of ranked) {
    const highlight = /dexify/i.test(brand) ? "**" : "";
    lines.push(`| ${highlight}${brand}${highlight} | ${count} |`);
  }

  // Save
  const outPath = path.join(process.cwd(), "scripts", "dexify-spot-check-results.md");
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");

  // ── Console summary table ─────────────────────────────────────────────────
  console.log(`\n${"─".repeat(90)}`);
  console.log(`SUMMARY   Dexify mentioned: ${dexifyHits.length}/${results.length}`);
  console.log(`${"─".repeat(90)}`);
  console.log(
    `${"Query".padEnd(44)} ${"Model".padEnd(14)} ${"Gnd".padEnd(4)} ${"Dexify?".padEnd(12)} Competitors`
  );
  console.log(`${"─".repeat(90)}`);

  for (const r of results) {
    const dexStr = r.dexify.mentioned ? `\x1b[32m✓ ${r.dexify.position}\x1b[0m` : "✗";
    const others = r.brands.filter((b) => !/dexify/i.test(b)).slice(0, 4).join(", ") || "—";
    const gnd    = r.grounded ? "●" : "○";
    const modelShort = r.model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o-mini";
    console.log(
      `${r.queryLabel.slice(0, 43).padEnd(44)} ${modelShort.padEnd(14)} ${gnd.padEnd(4)} ${dexStr.padEnd(12)} ${others}`
    );
  }

  console.log(`${"─".repeat(90)}`);
  console.log(`\n📄  Full results saved to: ${outPath}\n`);

  if (dexifyHits.length === 0) {
    console.log(`\x1b[33m⚠️   Dexify was not mentioned in any response.\x1b[0m`);
    console.log(`    This is an LLM training data gap — Dexify is new/small enough that`);
    console.log(`    neither model has it in training. Grounded (web search) results above`);
    console.log(`    reflect what web search can surface today.\n`);
  } else {
    console.log(`\x1b[32m✓   Dexify appeared in ${dexifyHits.length} response(s).\x1b[0m`);
    console.log(`    See the markdown report for full context on each mention.\n`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
