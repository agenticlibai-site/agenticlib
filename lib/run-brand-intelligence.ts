import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// ── Types ─────────────────────────────────────────────────────────────────────

type Sentiment = "positive" | "negative" | "neutral";
type LLMKey = "claude" | "gpt" | "gemini";

interface MentionRecord {
  agent: string;
  rank: number;
  sentiment: Sentiment;
  foundWords: string[];
  useCase: string;
  promptText: string;
  llm: LLMKey;
}

export interface TopUseCase {
  useCase: string;
  prompt: string;
}

export interface AgentResult {
  name: string;
  visibilityScore: number;
  avgPosition: number;
  mentions: number;
  sentimentScore: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  descriptors: string[];
  topUseCases: TopUseCase[];
  perLLM: { claude: number; gpt: number; gemini: number };
}

export interface BrandIntelligenceData {
  domain: string;
  generatedAt: string;
  totalPrompts: number;
  agents: AgentResult[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT =
  "You are a helpful assistant. Answer concisely and factually. List tools by name clearly.";

export const USE_CASE_PROMPTS = [
  { prompt: "Which AI agent writes the best long-form blog content for marketing teams?",          useCase: "Long-form Blog Writing"  },
  { prompt: "Which AI agent is best for generating social media captions and posts at scale?",     useCase: "Social Media Content"    },
  { prompt: "Which AI agent creates the most effective email marketing campaigns?",                useCase: "Email Campaign Creation" },
  { prompt: "Which AI agent is best for SEO-optimised content creation?",                         useCase: "SEO Content"             },
  { prompt: "Which AI agent generates the best ad copy for paid marketing?",                      useCase: "Ad Copywriting"          },
  { prompt: "Which AI agent is best for brand voice consistency across marketing content?",       useCase: "Brand Voice"             },
  { prompt: "Which AI agent automates marketing workflows most effectively for small businesses?", useCase: "Marketing Automation"    },
  { prompt: "Which AI agent provides the best marketing analytics and reporting?",                useCase: "Analytics & Reporting"   },
  { prompt: "Which AI agent is best for product description writing for ecommerce?",              useCase: "Product Descriptions"    },
  { prompt: "Which AI agent creates the best video marketing scripts?",                           useCase: "Video Scripts"           },
  { prompt: "Which AI agent is best for content repurposing across multiple channels?",           useCase: "Content Repurposing"     },
  { prompt: "Which AI agent generates the best landing page copy?",                               useCase: "Landing Page Copy"       },
  { prompt: "Which AI agent is best for influencer and creator marketing content?",               useCase: "Creator Content"         },
  { prompt: "Which AI agent handles marketing personalisation best?",                             useCase: "Personalisation"         },
];

// Ordered longest-first to prevent partial-match collisions
export const TRACKED_AGENTS = [
  "HubSpot Breeze",
  "ActiveCampaign",
  "Writesonic",
  "HubSpot",
  "Jasper",
];

const CANONICAL: Record<string, string> = {
  HubSpot: "HubSpot Breeze",
};

const POSITIVE_INDICATORS = [
  "trusted", "reliable", "innovative", "leading", "expert",
  "best", "top", "powerful", "recommended", "popular",
  "excellent", "strong", "widely used", "great", "effective",
  "comprehensive", "robust", "advanced", "proven", "praised",
  "well-regarded", "highly rated", "widely adopted",
];

const NEGATIVE_INDICATORS = [
  "limited", "expensive", "overpriced", "complex", "difficult",
  "poor", "weak", "lacking", "criticized", "concerns",
  "complaints", "issues", "problems", "disappointing",
  "outdated", "slow", "unreliable", "basic", "restrictive",
];

// ── LLM query helpers ─────────────────────────────────────────────────────────

async function queryClaude(client: Anthropic, prompt: string): Promise<string | null> {
  try {
    const res = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    return res.content[0].type === "text" ? res.content[0].text : null;
  } catch (err) {
    console.error("Claude error:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function queryGPT(client: OpenAI, prompt: string): Promise<string | null> {
  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });
    return res.choices[0]?.message?.content ?? null;
  } catch (err) {
    console.error("GPT error:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ── Response parsing ──────────────────────────────────────────────────────────

function parseResponse(text: string, useCase: string, promptText: string, llm: LLMKey): MentionRecord[] {
  const lower = text.toLowerCase();
  const claimed: Array<[number, number]> = [];
  const found: Array<{ canonical: string; pos: number; sentiment: Sentiment; foundWords: string[] }> = [];

  for (const agent of TRACKED_AGENTS) {
    const term = agent.toLowerCase();
    const idx = lower.indexOf(term);
    if (idx === -1) continue;
    if (claimed.some(([s, e]) => idx >= s && idx < e)) continue;

    claimed.push([idx, idx + term.length]);

    const winStart = Math.max(0, idx - 250);
    const winEnd   = Math.min(lower.length, idx + term.length + 250);
    const window   = lower.slice(winStart, winEnd);

    console.log(`[sentiment] ${llm} | ${agent} @ ${idx} | window[${winStart}-${winEnd}]: "${window.replace(/\n/g, " ")}"`);

    const posFound = POSITIVE_INDICATORS.filter(w => window.includes(w));
    const negFound = NEGATIVE_INDICATORS.filter(w => window.includes(w));
    const sentiment: Sentiment =
      posFound.length > negFound.length ? "positive" :
      negFound.length > posFound.length ? "negative" : "neutral";

    console.log(`[sentiment] ${agent} → pos:[${posFound}] neg:[${negFound}] → ${sentiment}`);

    found.push({ canonical: CANONICAL[agent] ?? agent, pos: idx, sentiment, foundWords: [...posFound, ...negFound] });
  }

  found.sort((a, b) => a.pos - b.pos);

  return found.map((m, i) => ({
    agent: m.canonical,
    rank: i + 1,
    sentiment: m.sentiment,
    foundWords: m.foundWords,
    useCase,
    promptText,
    llm,
  }));
}

// ── Aggregation ───────────────────────────────────────────────────────────────

function aggregate(allMentions: MentionRecord[], totalPrompts: number): AgentResult[] {
  const byAgent = new Map<string, MentionRecord[]>();
  for (const m of allMentions) {
    if (!byAgent.has(m.agent)) byAgent.set(m.agent, []);
    byAgent.get(m.agent)!.push(m);
  }

  const totalCombinations = totalPrompts * 2;
  const results: AgentResult[] = [];

  for (const [name, mentions] of byAgent) {
    const n = mentions.length;

    const posCount = mentions.filter(m => m.sentiment === "positive").length;
    const negCount = mentions.filter(m => m.sentiment === "negative").length;
    const neuCount = n - posCount - negCount;

    const positiveScore = Math.round((posCount / n) * 100);
    const negativeScore = Math.round((negCount / n) * 100);
    const neutralScore  = 100 - positiveScore - negativeScore;
    const sentimentScore = Math.round(50 + (positiveScore - negativeScore) / 2);

    const descriptors = [...new Set(mentions.flatMap(m => m.foundWords))].slice(0, 4);

    const topUseCasesMap = new Map<string, TopUseCase>();
    for (const m of mentions) {
      if (m.rank === 1 && !topUseCasesMap.has(m.useCase)) {
        topUseCasesMap.set(m.useCase, { useCase: m.useCase, prompt: m.promptText });
      }
    }

    const byLLM = (llm: LLMKey) =>
      Math.round((mentions.filter(m => m.llm === llm).length / totalPrompts) * 100);

    results.push({
      name,
      visibilityScore: Math.round((n / totalCombinations) * 100),
      avgPosition: +(mentions.reduce((s, m) => s + m.rank, 0) / n).toFixed(1),
      mentions: n,
      sentimentScore,
      sentimentBreakdown: { positive: positiveScore, neutral: neutralScore, negative: negativeScore },
      descriptors,
      topUseCases: [...topUseCasesMap.values()],
      perLLM: { claude: byLLM("claude"), gpt: byLLM("gpt"), gemini: 0 },
    });
  }

  return results.sort((a, b) => b.visibilityScore - a.visibilityScore);
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function runBrandIntelligence(): Promise<BrandIntelligenceData> {
  const anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

  const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  const mentionsByPrompt = await Promise.all(
    USE_CASE_PROMPTS.map(async ({ prompt, useCase }) => {
      const [claudeText, gptText] = await Promise.all([
        anthropic ? queryClaude(anthropic, prompt) : null,
        openai    ? queryGPT(openai, prompt)        : null,
      ]);

      console.log(`\n${"─".repeat(72)}`);
      console.log(`[prompt] ${useCase}`);
      console.log(`[prompt] Q: "${prompt}"`);

      if (claudeText) {
        console.log(`[claude] response:\n${claudeText}`);
        const found = TRACKED_AGENTS.filter(a => claudeText.toLowerCase().includes(a.toLowerCase()));
        console.log(`[claude] agents found: ${found.length ? found.join(", ") : "(none)"}`);
      } else {
        console.log(`[claude] no response`);
      }

      if (gptText) {
        console.log(`[gpt]    response:\n${gptText}`);
        const found = TRACKED_AGENTS.filter(a => gptText.toLowerCase().includes(a.toLowerCase()));
        console.log(`[gpt]    agents found: ${found.length ? found.join(", ") : "(none)"}`);
      } else {
        console.log(`[gpt]    no response`);
      }

      const mentions: MentionRecord[] = [];
      if (claudeText) mentions.push(...parseResponse(claudeText, useCase, prompt, "claude"));
      if (gptText)    mentions.push(...parseResponse(gptText,    useCase, prompt, "gpt"));
      return mentions;
    })
  );

  return {
    domain: "marketing",
    generatedAt: new Date().toISOString(),
    totalPrompts: USE_CASE_PROMPTS.length,
    agents: aggregate(mentionsByPrompt.flat(), USE_CASE_PROMPTS.length),
  };
}
