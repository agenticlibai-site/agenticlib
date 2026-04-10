console.log("API KEY EXISTS:", !!process.env.OPENAI_API_KEY);

import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import agents from "@/data/agents.json";

export async function POST(req: Request) {
  try {
    console.log("🔥 API HIT");

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { input } = await req.json();

    // 🔥 STEP 1: DOMAIN DETECTION
    const domainResponse = await client.responses.create({
      model: "gpt-4.1",
      input: `
Classify the user's request into ONE of these domains:

- real estate
- education
- finance
- travel
- healthcare
- legal
- marketing
- general

ONLY return the domain name. No explanation.

User request:
${input}
`,
    });

    const detectedDomain =
      domainResponse.output_text
        ?.toLowerCase()
        .replace(/[^a-z ]/g, "")
        .trim() || "general";

    console.log("🧠 DETECTED DOMAIN:", detectedDomain);

    // 🔥 STEP 2: DOMAIN MAPPING
    const domainMap: any = {
      "real estate": "real estate",
      "finance": "financial",
      "education": "education",
      "travel": "travel",
      "legal": "legal",
      "healthcare": "pharmacy",
      "marketing": "marketing",
      "general": "",
    };

    const mappedDomain = domainMap[detectedDomain] || "";

    console.log("🔁 MAPPED DOMAIN:", mappedDomain);

    // 🔥 STEP 3: FILTER AGENTS (STRONGER MATCHING)
    const filteredAgents = Array.isArray(agents)
      ? agents.filter((a: any) => {
          const domain = a["Business_Domain"]?.toLowerCase() || "";

          return (
            domain.includes(mappedDomain) ||
            (mappedDomain === "financial" &&
              (domain.includes("bank") ||
               domain.includes("investment") ||
               domain.includes("finance")))
          );
        })
      : [];

    console.log("MATCHED AGENTS:", filteredAgents.length);

    // 🔥 STEP 4: GROUP AGENTS
    const grouped: any = {};

    filteredAgents.forEach((a: any) => {
      const name = a["Agent_Name"];
      if (!name) return;

      if (!grouped[name]) {
        grouped[name] = {
          name,
          type: a["Agent_Type"],
          capabilities: new Set(),
          features: new Set(),
          cost: "Unknown",
        };
      }

      if (a["Capability_Claim"]) {
        grouped[name].capabilities.add(a["Capability_Claim"]);
      }

      if (a["Sub_Parameter_L1"]) {
        grouped[name].features.add(a["Sub_Parameter_L1"]);
      }
    });

    const knowledge = Object.values(grouped).map((a: any) => ({
      name: a.name,
      type: a.type,
      capabilities: Array.from(a.capabilities).slice(0, 5),
      features: Array.from(a.features).slice(0, 5),
      cost: a.cost,
    }));

    console.log("📊 KNOWLEDGE SIZE:", knowledge.length);

    // 🔥 STEP 5: RELEVANCE RANKING (MAJOR UPGRADE)
    const scoredKnowledge = knowledge.map((agent: any) => {
      const text = (
        agent.name +
        " " +
        agent.capabilities.join(" ") +
        " " +
        agent.features.join(" ")
      ).toLowerCase();

      const query = input.toLowerCase();

      let score = 0;

      query.split(" ").forEach((word: string) => {
        if (text.includes(word)) score += 1;
      });

      return { ...agent, score };
    });

    const sortedKnowledge = scoredKnowledge.sort(
      (a: any, b: any) => b.score - a.score
    );

    const topKnowledge = sortedKnowledge.slice(0, 8);

    const knowledgeContext = JSON.stringify(topKnowledge, null, 2);

    // 🔥 STEP 6: FINAL RESPONSE (PRIVATE + PUBLIC RAG)
    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: `
You are an AI agent recommendation engine.

You have TWO sources of knowledge:

1. PRIVATE DATA (high priority):
${knowledgeContext}

2. PUBLIC KNOWLEDGE

RULES:

- Always prioritise PRIVATE DATA first

- If PRIVATE DATA has less than 2 strong matches:
→ Use PUBLIC DATA aggressively

- If user request is not clearly covered:
→ Use PUBLIC DATA

- If using public data, label:
"Based on publicly available information..."

- Different user queries MUST result in DIFFERENT answers

- DO NOT give generic answers

STRICT OUTPUT RULES:

1. Start with:
Agent Confirmation (ONE LINE)

2. Then:
Straight Answer First

3. ALWAYS include comparison table if multiple options

4. Compare based on:
- Pricing / Free access
- How it works
- Personalisation
- Deal-breakers

5. DO NOT mention:
- database
- internal logic
- AgenticLib

6. End with:
Final Recommendation (NO ambiguity)

FORMAT:

Agent Confirmation:
...

Comparison Table:
| Agent | Best For | Pricing | Strength | Weakness |

Final Recommendation:
...
          `,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const text = response.output_text || "No response generated";

    return NextResponse.json({
      output: text,
      domain: detectedDomain,
    });

  } catch (error: any) {
    console.error("❌ ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}