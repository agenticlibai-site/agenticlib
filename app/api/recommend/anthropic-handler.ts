import Anthropic from "@anthropic-ai/sdk";
import { getDomainParams, DomainParam } from "./domain-params";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type SubScore = {
  score: number;
  plainEnglishExplanation: string;
};

export type AgentResult = {
  name: string;
  overallScore: number;
  recommended: boolean;
  realPricing: string;
  realFeatures: string[];
  subScores: Record<string, SubScore>;
  setupSteps: string[];
  link?: string;
};

export type ComparisonRow = {
  parameter: string;
  category: string;
  [agentName: string]: string;
};

export type StructuredRecommendation = {
  summary: string;
  primaryRequirement: string;
  recommended: string;
  agents: AgentResult[];
  comparisonTable: ComparisonRow[];
};

function buildPrompt(
  domain: string,
  wizardData: Record<string, unknown>,
  topAgents: { name: string; type: string; link?: string; capabilities: string[]; userValues: string[]; bestFor: string[]; score: number }[],
  params: DomainParam[]
): string {
  const agentNames = topAgents.map((a) => a.name).join(", ");
  const paramList = params.map((p) => `- ${p.l2} (${p.l1}): "${p.plainEnglish}"`).join("\n");

  return `IMPORTANT: Return raw JSON only. No markdown formatting, no backticks, no pipe-delimited tables. The entire response must be a single valid JSON object and nothing else.

You are an AI agent recommendation expert for the ${domain} domain.

The user's requirements:
${JSON.stringify(wizardData, null, 2)}

Candidate agents to evaluate: ${agentNames}

Your task:
1. Use web search to find current, accurate information about each agent — their actual features, real pricing, and recent reviews from G2, Capterra, or official sites. Do NOT hallucinate features or pricing.
2. Evaluate each agent against these domain parameters:
${paramList}
3. Identify the PRIMARY requirement from the user's wizard answers (the first/most important goal they selected).
4. Determine which agent best covers that primary requirement — that agent is the recommended one.

Return a single JSON object with EXACTLY this structure (no markdown, no explanation, just valid JSON):

{
  "summary": "2-3 sentence plain English recommendation tied to the user's specific goals and context",
  "primaryRequirement": "The single most important requirement from the user's answers",
  "recommended": "Name of the single best agent (or 'AgentA + AgentB' if multi-goal stack is needed)",
  "agents": [
    {
      "name": "Agent name",
      "overallScore": 82,
      "recommended": true,
      "realPricing": "From $X/month — free trial available" or "Contact for pricing",
      "realFeatures": ["Feature name — one sentence on what it does and why it directly helps with the user's stated goal", "Another feature — tied to their use case"],
      "subScores": {
        "Intent classification accuracy": {
          "score": 88,
          "plainEnglishExplanation": "1-2 sentences describing what this agent actually does for this parameter and how well, tied to the user's use case"
        }
      },
      "setupSteps": ["Step 1", "Step 2", "Step 3", "Step 4"]
    }
  ],
  "comparisonTable": [
    {
      "parameter": "Intent classification accuracy",
      "category": "Conversation Automation",
      "AgentA": "1-2 sentence description of what AgentA does for this parameter",
      "AgentB": "1-2 sentence description"
    }
  ]
}

Rules:
- Include ALL ${topAgents.length} agents in the agents array and all columns in comparisonTable
- Scores must have meaningful spread — best agent 75-90, weak fits 40-60
- subScores must include ALL parameters listed above for EACH agent
- comparisonTable rows must cover ALL parameters listed above
- For realPricing use your best knowledge of publicly available pricing — state clearly if uncertain
- For the RECOMMENDED agent's realFeatures: write 4-6 entries in the format "Feature name — one sentence explaining what it does and exactly why it helps this user achieve their stated goal". Ground each feature in real, publicly available knowledge about the product. Do NOT list generic marketing claims.
- For non-recommended agents' realFeatures: 2-3 concise factual feature names only
- Cells in comparisonTable must NEVER start with "does not", "lacks", "limited" without pivoting to what the agent does offer instead
- Return only valid JSON — no markdown code fences, no explanation text outside the JSON`;
}

export async function generateStructuredRecommendation(
  domain: string,
  wizardData: Record<string, unknown>,
  topAgents: { name: string; type: string; link?: string; capabilities: string[]; userValues: string[]; bestFor: string[]; score: number }[]
): Promise<StructuredRecommendation | null> {
  try {
    const top3 = topAgents.slice(0, 3);
    const params = getDomainParams(domain);
    const prompt = buildPrompt(domain, wizardData, top3, params);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    console.log("[anthropic-handler] stop_reason:", response.stop_reason, "output_tokens:", response.usage?.output_tokens);

    // Extract the final text block from the response
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const raw = textBlock.text.trim();

    // Strip any accidental markdown fences
    let jsonStr = raw.startsWith("```")
      ? raw.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "")
      : raw;

    // Fallback repair: if unterminated, truncate at the last complete closing brace
    if (!jsonStr.endsWith("}")) {
      const lastBrace = jsonStr.lastIndexOf("}");
      if (lastBrace !== -1) jsonStr = jsonStr.slice(0, lastBrace + 1);
    }

    const parsed = JSON.parse(jsonStr) as StructuredRecommendation;

    // Debug: log feature counts
    parsed.agents?.forEach((a) => {
      console.log(`[anthropic-handler] ${a.name} — recommended:${a.recommended} features:${a.realFeatures?.length ?? 0}`);
    });

    const recommended = parsed.agents?.find((a) => a.recommended);
    console.log("realFeatures for recommended agent:", recommended?.realFeatures);

    // Attach links from topAgents
    parsed.agents = parsed.agents.map((a) => ({
      ...a,
      link: topAgents.find((t) => t.name.toLowerCase() === a.name.toLowerCase())?.link ?? a.link,
    }));

    return parsed;
  } catch (err) {
    console.error("[anthropic-handler] error:", err);
    return null;
  }
}
