/**
 * Dexify self-visibility spot-check
 * Asks GPT-4o and GPT-4o-mini user-perspective tradie AI agent queries,
 * extracts brand mentions, checks if "Dexify" appears.
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPTS = [
  {
    label: "General discovery — tradie AI agent AU",
    text: "I run a small electrical contracting business in Sydney. I've been looking for an AI agent or AI-powered admin tool that can help me generate quotes and invoices on the spot when I'm on a job site, without having to type everything up manually later. What tools or platforms should I be looking at?",
  },
  {
    label: "Voice-to-quote — on-site, Australia",
    text: "What are the best AI tools for Australian tradespeople that let you describe a job by voice and instantly get a quote you can send to the customer? I'm a plumber in Melbourne and I want something I can use on-site.",
  },
  {
    label: "AI agent for field service quoting — direct",
    text: "Which AI agent platforms are specifically built for field service or tradie businesses in Australia to automate quoting and invoicing? List the main ones you know about.",
  },
  {
    label: "AI admin agent for tradies — broad",
    text: "What AI admin agents exist for trade businesses — plumbers, electricians, builders — that can handle voice-to-quote, smart invoicing, and sending documents to customers from the job site? I'm based in Australia.",
  },
  {
    label: "Specific product discovery — Dexify by name",
    text: "Have you heard of an AI product called Dexify? It's marketed as an AI admin agent for Australian tradespeople — voice-to-quote, smart invoicing, on-site quote sending. What do you know about it?",
  },
  {
    label: "Competitive landscape — tradie AI 2025",
    text: "What are the leading AI-powered quoting and invoicing tools for trade businesses in Australia as of 2025? I want to compare options before choosing one for my HVAC business in Brisbane.",
  },
];

const MODELS = ["gpt-4o", "gpt-4o-mini"];

function extractMentions(text) {
  // Look for capitalised brand-like words and known brand names
  const knownBrands = [
    "Dexify", "ServiceM8", "Tradify", "simPRO", "SimPRO", "Jobber",
    "AroFlo", "FieldPulse", "GorillaDesk", "Fergus", "Simpro",
    "Voxworks", "Sophiie", "Sammy", "Waboom", "Chime Labs",
    "Square AI", "Insta Quote", "Wired",
  ];
  const found = new Set();
  for (const brand of knownBrands) {
    const re = new RegExp(brand, "i");
    if (re.test(text)) found.add(brand === "SimPRO" ? "simPRO" : brand);
  }
  // Also pick up anything that looks like a product name in the text
  const genericBrandRe = /\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?(?:\s(?:AI|Pro|One|Go|Now|Plus))?)\b/g;
  let m;
  while ((m = genericBrandRe.exec(text)) !== null) {
    const w = m[1];
    if (w.length > 3 && !["The", "You", "Your", "This", "That", "There", "With",
      "From", "Here", "They", "Their", "When", "What", "Which", "These",
      "Business", "Australia", "Australian", "Sydney", "Melbourne", "Brisbane",
      "Tradespeople", "Tradies", "Invoice", "Quote", "Admin"].includes(w)) {
      found.add(w);
    }
  }
  return [...found].sort();
}

async function query(model, promptText) {
  const res = await openai.chat.completions.create({
    model,
    max_tokens: 600,
    messages: [{ role: "user", content: promptText }],
  });
  return res.choices[0]?.message?.content ?? "";
}

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED    = "\x1b[31m";
const CYAN   = "\x1b[36m";
const DIM    = "\x1b[2m";

async function main() {
  console.log(`${BOLD}Dexify LLM Visibility Spot-Check${RESET}`);
  console.log(`Models: ${MODELS.join(", ")}  |  ${PROMPTS.length} prompts\n`);

  const summary = []; // { prompt, model, dexifyMentioned, brands, response }

  for (const prompt of PROMPTS) {
    console.log(`${CYAN}── ${prompt.label}${RESET}`);
    console.log(`${DIM}${prompt.text.slice(0, 100)}...${RESET}\n`);

    for (const model of MODELS) {
      process.stdout.write(`  ${model}: `);
      try {
        const response = await query(model, prompt.text);
        const brands = extractMentions(response);
        const dexifyMentioned = /dexify/i.test(response);

        const badge = dexifyMentioned ? `${GREEN}✓ DEXIFY MENTIONED${RESET}` : `${RED}✗ not mentioned${RESET}`;
        console.log(badge);
        console.log(`  ${DIM}Brands found: ${brands.join(", ") || "(none detected)"}${RESET}`);
        console.log(`  ${DIM}Response: ${response.slice(0, 200).replace(/\n/g, " ")}...${RESET}\n`);

        summary.push({ prompt: prompt.label, model, dexifyMentioned, brands, response });
      } catch (e) {
        console.log(`${YELLOW}ERROR: ${e.message}${RESET}\n`);
        summary.push({ prompt: prompt.label, model, dexifyMentioned: false, brands: [], response: `ERROR: ${e.message}` });
      }
    }
  }

  // ── Summary table ──────────────────────────────────────────────────────────
  console.log(`\n${BOLD}═══ SUMMARY ═══${RESET}`);
  const dexifyHits = summary.filter((r) => r.dexifyMentioned);
  const total = summary.length;
  console.log(`Dexify mentioned in ${dexifyHits.length}/${total} responses (${Math.round(dexifyHits.length/total*100)}%)\n`);

  for (const r of summary) {
    const icon = r.dexifyMentioned ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
    console.log(`  ${icon}  [${r.model.padEnd(12)}]  ${r.prompt}`);
  }

  // ── Competitor frequency ───────────────────────────────────────────────────
  const freq = {};
  for (const r of summary) {
    for (const b of r.brands) {
      freq[b] = (freq[b] ?? 0) + 1;
    }
  }
  const ranked = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);
  console.log(`\n${BOLD}Brand mention frequency across all responses:${RESET}`);
  for (const [brand, count] of ranked) {
    const bar = "█".repeat(count);
    const highlight = /dexify/i.test(brand) ? GREEN : "";
    console.log(`  ${highlight}${bar.padEnd(14)} ${brand} (${count})${RESET}`);
  }
}

main().catch(console.error);
