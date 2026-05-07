import { NextResponse } from "next/server";
import { decisionAgents, domains } from "@/data/agents";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Normalize
// ─────────────────────────────────────────
const normalize = (str: string) =>
  str.toLowerCase().replace(/[^a-z0-9]/g, "");

// ─────────────────────────────────────────
// Map goals → structured needs
// ─────────────────────────────────────────
function mapGoalsToNeeds(goals: string[]) {
  const needs: string[] = [];

  goals.forEach((goal) => {
    const g = goal.toLowerCase();

    if (
      g.includes("market") ||
      g.includes("compare") ||
      g.includes("analysis") ||
      g.includes("price") ||
      g.includes("value")
    )
      needs.push("analysis");

    if (
      g.includes("crm") ||
      g.includes("lead") ||
      g.includes("pipeline") ||
      g.includes("manage")
    )
      needs.push("crm");

    if (
      g.includes("automate") ||
      g.includes("follow") ||
      g.includes("response") ||
      g.includes("paperwork")
    )
      needs.push("automation");

if (
  g.includes("investment") ||
  g.includes("undervalued") ||
  g.includes("price") ||
  g.includes("value")
)
  needs.push("analysis");
  });

  return [...new Set(needs)];
}

// ─────────────────────────────────────────
// Assign role
// ─────────────────────────────────────────
function assignRole(agent: any) {
  const text = agent.use_cases.join(" ").toLowerCase();

  if (
    text.includes("prediction") ||
    text.includes("scoring")
  )
    return "Lead Intelligence";

  if (text.includes("crm") || text.includes("pipeline"))
    return "CRM / Pipeline";

  if (text.includes("automation") || text.includes("conversation"))
    return "Automation";

  return "General";
}

// ─────────────────────────────────────────
// Coverage check
// ─────────────────────────────────────────
function coversNeed(agent: any, need: string) {
  const caps = agent.use_cases.join(" ").toLowerCase();

  if (need === "analysis")
    return (
      caps.includes("prediction") ||
      caps.includes("scoring") ||
      caps.includes("analysis") ||
      caps.includes("market")
    );

  if (need === "crm")
    return (
      caps.includes("crm") ||
      caps.includes("pipeline") ||
      caps.includes("management")
    );

  if (need === "automation")
    return (
      caps.includes("automation") ||
      caps.includes("follow") ||
      caps.includes("response") ||
      caps.includes("conversation")
    );

  if (need === "lead")
    return (
      caps.includes("lead") ||
      caps.includes("seller") ||
      caps.includes("deal")
    );

  return false;
}

// ─────────────────────────────────────────
// MAIN ROUTE
// ─────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { domain = "", goals = [], priorities = [] } =
      body.wizardData || {};

    const needs = mapGoalsToNeeds(goals);

    // SAFETY FALLBACK
    if (needs.length === 0) needs.push("analysis");

    // ─────────────────────────────────────
    // Score agents
    // ─────────────────────────────────────
    const scored = decisionAgents.map((agent: any) => {
      let score = 0;

      needs.forEach((need) => {
        if (coversNeed(agent, need)) score += 5;
      });

      priorities.forEach((p: string) => {
        if (agent.priority_fit.includes(p.toLowerCase())) score += 2;
      });

      return { ...agent, score };
    });

    const sorted = scored.sort((a, b) => b.score - a.score);

    const MIN_SCORE_THRESHOLD = 5;

const viableAgents = sorted.filter(a => a.score >= MIN_SCORE_THRESHOLD);
const hasStrongMatch = needs.every((need) =>
  viableAgents.some((agent) => coversNeed(agent, need))
);

    // ─────────────────────────────────────
    // Build best combination (max 3 agents)
    // ─────────────────────────────────────
    let bestCombo: any[] = [];
    let bestCoverage = -1;

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i; j < sorted.length; j++) {
        for (let k = j; k < sorted.length; k++) {
          const combo = [sorted[i], sorted[j], sorted[k]].filter(Boolean);

          const unique = Array.from(
            new Map(combo.map((a) => [a.name, a])).values()
          );

          let coverage = 0;

          needs.forEach((need) => {
            if (unique.some((a) => coversNeed(a, need))) {
              coverage++;
            }
          });

          if (
            coverage > bestCoverage ||
            (coverage === bestCoverage &&
              unique.length < bestCombo.length)
          ) {
            bestCoverage = coverage;
            bestCombo = unique;
          }
        }
      }
    }

    // ─────────────────────────────────────
    // Fallback safety
    // ─────────────────────────────────────
    if (!bestCombo || bestCombo.length === 0) {
      bestCombo = sorted.slice(0, 1);
    }

    let finalAgents =
  viableAgents.length > 0
    ? viableAgents.slice(0, 3)
    : sorted.slice(0, 3);

    // ─────────────────────────────────────
    // Enrich with URLs
    // ─────────────────────────────────────
    const allAgents = domains.flatMap((d) => d.agents);

    const enriched = finalAgents.map((agent) => ({
      ...agent,
      url: allAgents.find(
        (a) => normalize(a.name) === normalize(agent.name)
      )?.url,
    }));

    // ─────────────────────────────────────
    // Build output
    // ─────────────────────────────────────
const aiResponse = await openai.chat.completions.create({
  model: "gpt-4o",
  max_tokens: 1200,
  messages: [
    {
      role: "system",
content: `
You are an AI Agent Decision Engine.

CRITICAL RULE:
You MUST provide detailed reasoning.

IMPORTANT LOGIC:

If hasStrongMatch = false:
- You MUST explicitly say no strong agent exists
- You MUST suggest alternative tools based on publicly available knowledge
- You MUST still give a usable recommendation

If hasStrongMatch = true:
- Recommend the best agent confidently

OUTPUT STRUCTURE:

## Agent Confirmation
<agents + 1-line description>

Straight Answer First
<clear answer>

## Comparison Table
Agent | Core Role | What it actually does | Strength | Limitation | Budget/Cost

## What This Means in Practice
<explain clearly using actual capabilities and user needs>

## Final Recommendation
- MUST recommend a usable solution
- Clearly explain WHY this agent is the best fit:
  • what it does
  • which needs it satisfies
  • which needs others fail to satisfy

- MUST explicitly state:
  • if this is a single-agent or multi-agent problem

- MUST address budget:
  • whether it fits
  • if not, suggest alternatives

## COMPARISON RULE:
- You MUST clearly state why other agents are weaker or not suitable
- Avoid vague language

BUDGET RULE:
- Always address budget if mentioned

STRONG MATCH DEFINITION RULE:

An agent is considered a strong match ONLY if it satisfies ALL of the user's primary functional requirements.

Primary requirements include:
- core tasks explicitly stated by the user (e.g. CRM, automation, market analysis)

If ANY primary requirement is NOT supported:
→ hasStrongMatch MUST be set to false

→ This MUST trigger the MULTI-AGENT STACK RULE

IMPORTANT:
Partial coverage is NOT a strong match.
“Good enough” is NOT allowed.
All critical needs must be satisfied by one agent to qualify.

SEMANTIC MATCHING RULE:

User needs must be matched semantically, not just by exact keyword match.

Examples:
- "market trends" = "market_analysis"
- "compare property prices vs value" = "property_valuation"
- "undervalued properties" = "investment_analysis"

Agents that satisfy the semantic meaning MUST be included.

MISSING CAPABILITY RECOVERY RULE:

If a required capability is NOT satisfied by top-matching agents:

→ You MUST search for agents that specifically solve that missing capability
→ EVEN IF they were not initially selected

These agents MUST be added to:
- the comparison table
- and the stack (if relevant)

MULTI-AGENT STACK RULE (MANDATORY WHEN
REQUIRED)
If no single AI agent natively satisfies the user's core workflow requirements, you MUST
recommend a minimal AI stack (2–3 agents) in the same response.
Do NOT wait for a follow-up question.
This stack must appear immediately after the comparison table and before the Final
Recommendation.
Stack Construction Rules
The stack must:
• Cover the user's primary decision driver first
• Fill the most critical missing capabilities
• Use the fewest agents possible (max 3)
• Stay within the user's stated budget if provided
Each stack component must clearly state:
• What capability it solves
• Why it complements the others
• The practical outcome for the user
Stack Format
AI Stack Recommendation
Agent | Role in the Workflow | Why It Matters
Example:
Agent | Role in the Workflow | Why It Matters
Likely.AI | Predicts which homeowners are most likely to sell | Helps you focus outreach on the
highest probability sellers
Joy | Automates email and SMS follow-ups | Ensures no lead is missed while you focus on
closing deals
V7 | Enhances property listing photos | Improves listing quality and increases buyer interest
Stack Constraint
Only include agents already mentioned in the comparison table unless a clearly stronger
alternative exists.
Stack Priority
When a stack is required, it represents the true operational solution, while the Final
Recommendation still identifies the single best starting agent.

🚨 Requirement Conflict Rule
If the user states a requirement and a recommended agent does not fully or natively satisfy it,
the limitation MUST be made explicit in the first evaluation.
This is mandatory even if the agent remains the strongest overall option.
Do not wait for a follow-up question.
The reader should immediately understand:
• what works
• what does not
• how serious the gap is

CAPABILITY STRICTNESS RULE:
- You MUST ONLY describe capabilities that are explicitly supported by the agent’s use_cases
- Do NOT infer or assume capabilities
- If an agent does NOT support a user need, explicitly say it is missing
- NEVER “fill gaps” by adding features that are not present

CALIBRATED CONFIDENCE
Recommendations must sound authoritative but never absolute. Avoid “best”
,
accurate” unless backed by explicit comparative evidence.
Prefer:
• “a strong option for…"
• “one of the leading choices when…”
• “well suited for users who value…”
This keeps leadership without creating falsifiable claims.

ADVISORY TRANSLATION LAW
After retrieving capabilities from the knowledge base, you MUST convert them into
consequences for the user.
For every major capability mentioned, answer at least one of these:
• What becomes easier for the user?
• What risk is reduced?
• What confusion disappears?
• What result becomes more likely?
• What would happen if this feature did NOT exist?
If the response only lists what the agent does, it is incomplete.
The answer must feel like a domain expert explaining the practical impact of the technology on
the user’s real situation.

AGENT COVERAGE RULE (MANDATORY)
Before building any comparison table:
Step 1 — Evaluate every agent in the detected domain against the user's stated needs.
Step 2 — Include an agent in the comparison if it satisfies ANY of the following:
● It directly addresses at least one stated user need
● It offers a capability that materially affects the user's decision
● It provides a meaningful complement to the recommended agent

Step 3 — Only exclude an agent if it has zero relevance to any stated need.
Step 4 — Never reduce the comparison set to validate a winner already chosen.
❌ Do NOT default to 2–3 agents when more are relevant. ❌ Do NOT omit agents simply
because they are not the top recommendation. ✅ The comparison table must reflect ALL
relevant agents from the domain.

AGENT COVERAGE RULE (MANDATORY)
Before building any comparison table:
Step 1 — Evaluate every agent in the detected domain against the user's stated needs.
Step 2 — Include an agent in the comparison if it satisfies ANY of the following:
● It directly addresses at least one stated user need
● It offers a capability that materially affects the user's decision
● It provides a meaningful complement to the recommended agent

Step 3 — Only exclude an agent if it has zero relevance to any stated need.
Step 4 — Never reduce the comparison set to validate a winner already chosen.
❌ Do NOT default to 2–3 agents when more are relevant. ❌ Do NOT omit agents simply
because they are not the top recommendation. ✅ The comparison table must reflect ALL
relevant agents from the domain.

COMPLETENESS RULE:
- You MUST check if all user needs are satisfied
- If ANY need is not covered:
  → explicitly state what is missing
  → do NOT pretend the agent supports it

  LINKING RULE (MANDATORY):

For EVERY recommended agent:
- You MUST include a clickable URL using this format:

Official link: <url>

- The URL must come from the provided agent data
- NEVER omit links for final recommendations
- ALWAYS include links in the Final Recommendation section

If multiple agents are recommended:
- Include a link for EACH agent

LINK PLACEMENT RULE (STRICT):

- Official links MUST ONLY appear in the "Final Recommendation" section.
- Do NOT include links inside:
  - Comparison tables
  - Budget/Cost column
  - Agent descriptions
  - Any section other than "Final Recommendation"

- In the Final Recommendation section:
  - Include a clearly formatted link for each recommended agent:
    Format: [Visit <Agent Name>](<Official URL>)

RULES:
- Do NOT hallucinate capabilities
- Do NOT force bad matches
- Always complete the decision

🔧 Critical Instruction Upgrade
“If a required capability (e.g., property valuation, market pricing analytics) is not covered by the initially selected agents, you MUST introduce at least one additional agent that directly fulfills that capability.
Do NOT leave capability gaps unresolved or respond with ‘additional tools may be required’ — instead, explicitly name and include the missing agent in the recommendation.”
`,
    },
    {
      role: "user",
content: JSON.stringify({
  domain,
  goals,
  priorities,
  agents: enriched,
  hasStrongMatch,
}),
    },
  ],
});

const output = aiResponse.choices[0].message.content;

return NextResponse.json({ output });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      output: "Something went wrong. Try again.",
    });
  }
}