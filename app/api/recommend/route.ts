console.log("🔥 API HIT");
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import agents from "@/data/agents.json";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log("🔥 API HIT");

    const { input } = await req.json();

    // ✅ STEP 1: detect domain
    const domain = input.toLowerCase().includes("real estate")
      ? "Real Estate"
      : null;

    console.log("DOMAIN:", domain);
    console.log("TOTAL AGENTS:", agents.length);

    // ✅ STEP 2: filter agents (FIXED KEYS)
    const filteredAgents = Array.isArray(agents)
      ? agents.filter((a: any) =>
          domain ? a["Business_Domain"] === domain : true
        )
      : [];

    console.log("AFTER FILTER:", filteredAgents.length);
    console.log("FIRST ROW:", filteredAgents[0]);

    if (filteredAgents.length === 0) {
      return NextResponse.json({
        output:
          "No agents found. Check your JSON keys (Agent_Name, Business_Domain, etc.)",
      });
    }

    // ✅ STEP 3: group by agent name
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
      capabilities: Array.from(a.capabilities),
      features: Array.from(a.features),
      cost: a.cost,
    }));

    console.log("FINAL AGENTS:", knowledge.length);

    // 🚨 SAFETY CHECK
    if (knowledge.length === 0) {
      return NextResponse.json({
        output:
          "Still empty → your JSON keys are mismatched. Check console logs.",
      });
    }

    // ✅ STEP 4: call model
    const response = await client.responses.create({
      model: "gpt-4.1",
      input: `
You are AgenticLib — an AI agent comparison engine.

You MUST:
- Compare ALL agents provided
- NEVER invent agents
- NEVER group them into categories

AGENTS:
${JSON.stringify(knowledge, null, 2)}

USER REQUEST:
${input}

---

OUTPUT FORMAT:

Agent Confirmation:
[Best Agent Name]: [Agent Type]

Straight Answer First:
Yes/No + key limitation

Comparison Table:
| Agent | Core Capabilities | How it works | Personalisation | Cost | Deal-breakers |
|-------|------------------|-------------|-----------------|------|----------------|

RULES:
- EACH row = ONE REAL agent
- MINIMUM 3 agents
- Use REAL capabilities from data

Final Recommendation:
Clear winner + why
`,
    });

    const text = response.output[0].content[0].text;

    return NextResponse.json({
      output: text,
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" });
  }
}