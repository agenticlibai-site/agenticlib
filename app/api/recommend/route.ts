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

    const domain = input.toLowerCase().includes("real estate")
      ? "Real Estate"
      : null;

    const filteredAgents = Array.isArray(agents)
      ? agents.filter((a: any) =>
          domain ? a["Business_Domain"] === domain : true
        )
      : [];

    if (filteredAgents.length === 0) {
      return NextResponse.json({
        output: "No agents found.",
      });
    }

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

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: `
You are AgenticLib — an AI agent comparison engine.

AGENTS:
${JSON.stringify(knowledge, null, 2)}

USER REQUEST:
${input}

OUTPUT:
- Agent Confirmation
- Straight Answer
- Comparison Table
- Final Recommendation
`,
    });

    const text = response.output_text || "No response generated";

    return NextResponse.json({
      output: text,
    });

  } catch (error: any) {
    console.error("❌ ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}