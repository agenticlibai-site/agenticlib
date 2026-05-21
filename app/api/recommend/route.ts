import { NextResponse } from "next/server";
import { decisionAgents, domains } from "@/data/agents";
import agentsJson from "@/data/agents.json";
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
// CUSTOMER SERVICE HANDLER
// ─────────────────────────────────────────

type AgentRow = {
  Agent_ID: string;
  Business_Domain: string;
  Agent_Name: string;
  Agent_Type: string;
  Sub_Parameter_L2: string;
  Capability_Claim: string;
  Layman_Explanation: string;
  User_Value: string;
  Best_For_User_Needs: string;
  When_To_Use: string;
  Link: string;
  Confidence_Level: string;
};

type CSAgentProfile = {
  id: string;
  name: string;
  type: string;
  link: string;
  capabilities: string[];
  claims: string[];
  userValues: string[];
  bestFor: string[];
  whenToUse: string[];
  score: number;
};

type CSWizardData = {
  csGoal: string[];
  csIndustry: string;
  csChannel: string[];
  csVolume: string;
  csTech: string;
  csNotes?: string;
};

function scoreCSAgent(profile: Omit<CSAgentProfile, "score">, data: CSWizardData): number {
  const text = [
    ...profile.capabilities,
    ...profile.claims,
    ...profile.userValues,
    ...profile.bestFor,
    ...profile.whenToUse,
    profile.type,
  ].join(" ").toLowerCase();

  let score = 0;
  const goals = data.csGoal.map((g) => g.toLowerCase());
  const channels = data.csChannel.map((c) => c.toLowerCase());
  const volume = data.csVolume.toLowerCase();
  const tech = data.csTech.toLowerCase();

  // Goal signals - any selected goal that matches scores
  if (goals.some((g) => g.includes("response time")) && (text.includes("resol") || text.includes("deflect") || text.includes("autonomous"))) score += 5;
  if (goals.some((g) => g.includes("faq")) && (text.includes("faq") || text.includes("self-service") || text.includes("knowledge"))) score += 5;
  if (goals.some((g) => g.includes("complaint")) && (text.includes("escalat") || text.includes("complaint") || text.includes("handoff"))) score += 5;
  if (goals.some((g) => g.includes("quality")) && (text.includes("csat") || text.includes("quality") || text.includes("sentiment") || text.includes("feedback"))) score += 5;

  // Channel signals - each selected channel that matches adds score
  if (channels.some((c) => c.includes("email")) && text.includes("email")) score += 4;
  if (channels.some((c) => c.includes("whatsapp")) && text.includes("whatsapp")) score += 4;
  if (channels.some((c) => c.includes("live chat")) && (text.includes("live chat") || text.includes("web chat") || text.includes("chat"))) score += 4;
  if (channels.some((c) => c.includes("chatbot")) && (text.includes("chatbot") || text.includes("web") || text.includes("chat"))) score += 4;
  if (channels.some((c) => c.includes("social")) && (text.includes("social") || text.includes("facebook") || text.includes("instagram"))) score += 4;
  if (channels.some((c) => c.includes("voice") || c.includes("phone")) && (text.includes("voice") || text.includes("phone") || text.includes("telephony") || text.includes("call"))) score += 4;
  if (channels.some((c) => c.includes("video")) && (text.includes("video") || text.includes("avatar") || text.includes("cvi") || text.includes("visual"))) score += 4;
  if (text.includes("omnichannel")) score += 2;

  // Ecommerce-specific signals
  const industry = data.csIndustry.toLowerCase();
  if (industry.includes("e-commerce") || industry.includes("ecommerce")) {
    if (text.includes("shopify") || text.includes("ecommerce") || text.includes("e-commerce") || text.includes("post-purchase") || text.includes("returns") || text.includes("order tracking") || text.includes("dtc")) score += 4;
  }

  // Volume signals
  if (volume.includes("high") && (text.includes("enterprise") || text.includes("high volume") || text.includes("scale") || text.includes("large"))) score += 3;
  if (volume.includes("medium") && (text.includes("mid-market") || text.includes("smb") || text.includes("growing") || text.includes("mid"))) score += 3;
  if (volume.includes("low") && (text.includes("small") || text.includes("startup") || text.includes("low volume"))) score += 3;

  // Tech preference signals
  if (tech.includes("no-code") && (text.includes("no-code") || text.includes("no code") || text.includes("easy") || text.includes("plug-and-play"))) score += 3;
  if (tech.includes("api") && (text.includes("api") || text.includes("developer") || text.includes("integration"))) score += 3;
  if (tech.includes("crm") && (text.includes("salesforce") || text.includes("crm") || text.includes("enterprise") || text.includes("hubspot"))) score += 3;

  return score;
}

const CS_SYSTEM_PROMPT = `You are a Customer Service AI Agent Expert with deep knowledge of enterprise support tooling.

The user completed a 5-question wizard. You will receive their answers and a list of matched agents from our database.

OUTPUT - you MUST produce exactly these four sections, in this order, using these exact headings:

## Summary
2–3 sentences. Name the best-fit agent and explain in plain language why it matches this user's specific goal, channel, and scale. No filler.

## Comparison Table
A markdown table with columns: Agent Name | Strength | Best Use Case | Limitation | Fit Score
Fit Score must be High / Medium / Low relative to this user's answers.
Include ALL provided agents.

## Recommended Agent
Start with "Best choice: **[Agent Name]**". Then 3–5 sentences: what it does, why it fits this user's goal + channel + volume + tech preference, and one concrete outcome the user can expect. If a secondary agent meaningfully complements the primary (covers a gap), name it and say why in 1–2 sentences.

## Setup Instructions
Numbered list of 4–6 practical steps to get started with the recommended agent. Be specific - mention the agent by name, reference the channel/integration, and match the user's stated tech preference.

## Official Links
For each recommended agent, format as: [Visit Agent Name](url)

RULES:
- Only describe capabilities explicitly present in the provided agent data. Do NOT invent features.
- Fit Score must reflect the user's specific answers - not generic agent quality.
- Keep tone professional and direct. No marketing language.
- Do NOT include links anywhere except the "Official Links" section.`;

function extractCSRequirements(data: CSWizardData): string[] {
  const reqs: string[] = [];

  const goalMap: Record<string, string> = {
    "Reduce response time":
      "Reduction of customer response and resolution time as a primary performance target",
    "Automate FAQs":
      "Self-service FAQ automation and knowledge base deflection requirements",
    "Handle complaints":
      "Complaint handling, escalation management, and resolution workflow requirements",
    "Improve support quality":
      "Support quality improvement through AI-assisted sentiment analysis and CSAT optimisation",
  };
  const industryMap: Record<string, string> = {
    "E-commerce":
      "E-commerce and post-purchase customer support automation requirements",
    "SaaS":
      "SaaS product support and customer success automation requirements",
    "Real estate":
      "Real estate customer enquiry and lead support automation requirements",
    "Healthcare":
      "Healthcare patient communication and compliance-aware support requirements",
    "Education":
      "Education and student services support automation requirements",
  };
  const channelMap: Record<string, string> = {
    "Email":
      "Email-based support automation and ticket management requirements",
    "Live chat":
      "Real-time live chat and web chat automation requirements",
    "WhatsApp":
      "WhatsApp and messaging channel automation requirements",
    "Website chatbot":
      "Website chatbot and conversational AI deployment requirements",
    "Social media":
      "Social media monitoring and automated customer response requirements",
    "Voice / Phone":
      "Voice and phone channel automation and IVR integration requirements",
  };
  const volumeMap: Record<string, string> = {
    "Low (fewer than 50 / day)":
      "Small-scale deployment optimised for low-volume support operations",
    "Medium (50–500 / day)":
      "Mid-scale deployment supporting 50–500 daily customer interactions",
    "High (500+ / day)":
      "Enterprise-scale deployment for high-volume support operations (500+ daily queries)",
  };
  const techMap: Record<string, string> = {
    "No-code setup":
      "No-code deployment preference with minimal technical implementation overhead",
    "API-based integration":
      "API-based integration with existing support stack and CRM infrastructure",
    "Enterprise CRM integration":
      "Enterprise CRM integration requirements (Salesforce, HubSpot, or equivalent)",
  };

  (data.csGoal ?? []).forEach((g) => { if (goalMap[g]) reqs.push(goalMap[g]); });
  if (data.csIndustry && industryMap[data.csIndustry]) reqs.push(industryMap[data.csIndustry]);
  (data.csChannel ?? []).forEach((c) => { if (channelMap[c]) reqs.push(channelMap[c]); });
  if (data.csVolume && volumeMap[data.csVolume]) reqs.push(volumeMap[data.csVolume]);
  if (data.csTech && techMap[data.csTech]) reqs.push(techMap[data.csTech]);
  if (data.csNotes?.trim()) reqs.push(`Additional context: ${data.csNotes.trim().slice(0, 140)}${data.csNotes.trim().length > 140 ? "…" : ""}`);

  return [...new Set(reqs)].slice(0, 7);
}

async function handleCSRecommend(wizardData: CSWizardData) {
  // 1. Filter Customer Service rows from agents.json
  const csRows = (agentsJson as AgentRow[]).filter(
    (r) => r.Business_Domain === "Customer Service"
  );

  // 2. Group by Agent_ID into profiles
  const agentMap = new Map<string, Omit<CSAgentProfile, "score">>();
  for (const row of csRows) {
    if (!agentMap.has(row.Agent_ID)) {
      agentMap.set(row.Agent_ID, {
        id: row.Agent_ID,
        name: row.Agent_Name,
        type: row.Agent_Type,
        link: row.Link ?? "",
        capabilities: [],
        claims: [],
        userValues: [],
        bestFor: [],
        whenToUse: [],
      });
    }
    const profile = agentMap.get(row.Agent_ID)!;
    if (row.Sub_Parameter_L2) profile.capabilities.push(row.Sub_Parameter_L2);
    if (row.Capability_Claim) profile.claims.push(row.Capability_Claim);
    if (row.User_Value) profile.userValues.push(row.User_Value);
    if (row.Best_For_User_Needs) profile.bestFor.push(row.Best_For_User_Needs);
    if (row.When_To_Use) profile.whenToUse.push(row.When_To_Use);
  }

  // 3. Score and rank
  const scored: CSAgentProfile[] = Array.from(agentMap.values())
    .map((p) => ({ ...p, score: scoreCSAgent(p, wizardData) }))
    .sort((a, b) => b.score - a.score);

  // Send top 5 to OpenAI (trim claim arrays to keep prompt size reasonable)
  const topAgents = scored.slice(0, 5).map((a) => ({
    name: a.name,
    type: a.type,
    link: a.link,
    score: a.score,
    capabilities: a.capabilities,
    userValues: [...new Set(a.userValues)].slice(0, 6),
    bestFor: [...new Set(a.bestFor)].slice(0, 4),
    whenToUse: [...new Set(a.whenToUse)].slice(0, 4),
  }));

  // 4. OpenAI call
  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1600,
    messages: [
      { role: "system", content: CS_SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({ wizardAnswers: wizardData, agents: topAgents }),
      },
    ],
  });

  const csRequirements = extractCSRequirements(wizardData);
  const csRequirementsSection =
    `## Key Requirements Captured\n\n` +
    csRequirements.map((r) => `- ${r}`).join("\n") +
    "\n\n";
  const csGptOutput = aiResponse.choices[0].message.content ?? "No recommendations generated.";

  return NextResponse.json({
    output: csRequirementsSection + csGptOutput,
  });
}

// ─────────────────────────────────────────
// MEDIA HANDLER
// ─────────────────────────────────────────

type MediaWizardData = {
  mediaVision: string[];
  mediaStartingPoint: string[];
  mediaTransformation: string[];
  mediaStyle: string[];
  mediaProduction: string[];
  mediaDuration: string;
  mediaUrgency: string;
  mediaNotes?: string;
};

type MediaAgentProfile = {
  id: string;
  name: string;
  type: string;
  link: string;
  capabilities: string[];
  claims: string[];
  userValues: string[];
  bestFor: string[];
  whenToUse: string[];
  score: number;
};

function scoreMediaAgent(profile: Omit<MediaAgentProfile, "score">, data: MediaWizardData): number {
  const text = [
    ...profile.capabilities,
    ...profile.claims,
    ...profile.userValues,
    ...profile.bestFor,
    ...profile.whenToUse,
    profile.type,
  ].join(" ").toLowerCase();

  let score = 0;

  // Flatten each multi-select array into a single searchable string
  const t = data.mediaTransformation.join(" ").toLowerCase();
  const v = data.mediaVision.join(" ").toLowerCase();
  const s = data.mediaStartingPoint.join(" ").toLowerCase();
  const st = data.mediaStyle.join(" ").toLowerCase();
  const p = data.mediaProduction.join(" ").toLowerCase();

  // ── Q3 transformation - strongest signal (weight 8 per match) ──
  if (t.includes("generate full video") &&
      (text.includes("generat") || text.includes("text-to-video") || text.includes("ai video"))) score += 8;
  if (t.includes("vfx") &&
      (text.includes("vfx") || text.includes("character") || text.includes("cg") || text.includes("wonder"))) score += 8;
  if (t.includes("edit and assemble") &&
      (text.includes("edit") || text.includes("transcript") || text.includes("assemble") || text.includes("descript"))) score += 8;
  if (t.includes("clean audio") &&
      (text.includes("audio") || text.includes("noise") || text.includes("dialogue") || text.includes("sound"))) score += 8;
  if (t.includes("dubbing") &&
      (text.includes("dub") || text.includes("lip") || text.includes("translat") || text.includes("language"))) score += 8;
  if (t.includes("enhance cinematic") &&
      (text.includes("enhanc") || text.includes("color") || text.includes("quality") || text.includes("upscal") || text.includes("sensei"))) score += 8;

  // ── Q1 vision type (weight 4) ──
  if (v.includes("cinematic film") &&
      (text.includes("cinematic") || text.includes("film") || text.includes("visual quality"))) score += 4;
  if (v.includes("vfx") &&
      (text.includes("vfx") || text.includes("character") || text.includes("cg"))) score += 4;
  if (v.includes("documentary") &&
      (text.includes("transcript") || text.includes("edit") || text.includes("interview") || text.includes("audio"))) score += 4;
  if (v.includes("social media") &&
      (text.includes("social") || text.includes("short") || text.includes("content") || text.includes("creat"))) score += 4;
  if (v.includes("animated") &&
      (text.includes("animat") || text.includes("stylized") || text.includes("generat"))) score += 4;
  if (v.includes("music video") &&
      (text.includes("visual") || text.includes("generat") || text.includes("creative"))) score += 3;

  // ── Q2 starting material (weight 4) ──
  if (s.includes("raw video") &&
      (text.includes("footage") || text.includes("edit") || text.includes("video"))) score += 4;
  if (s.includes("script") &&
      (text.includes("generat") || text.includes("text-to") || text.includes("script"))) score += 4;
  if (s.includes("audio") &&
      (text.includes("audio") || text.includes("transcript") || text.includes("podcast"))) score += 4;
  if (s.includes("images") &&
      (text.includes("image") || text.includes("generat") || text.includes("animat"))) score += 3;
  if (s.includes("just an idea") &&
      (text.includes("generat") || text.includes("creat") || text.includes("from scratch"))) score += 4;

  // ── Q4 style direction (weight 3) ──
  if (st.includes("hyper-real") &&
      (text.includes("cinematic") || text.includes("visual quality") || text.includes("realism"))) score += 3;
  if (st.includes("stylized") &&
      (text.includes("stylized") || text.includes("artistic") || text.includes("generat"))) score += 3;
  if (st.includes("social media") &&
      (text.includes("social") || text.includes("short-form") || text.includes("edit"))) score += 3;
  if (st.includes("documentary") &&
      (text.includes("transcript") || text.includes("interview") || text.includes("realistic"))) score += 3;
  if (st.includes("animated") &&
      (text.includes("animat") || text.includes("fantasy") || text.includes("generat"))) score += 3;
  if (st.includes("dark") &&
      (text.includes("cinematic") || text.includes("dramatic") || text.includes("visual"))) score += 2;

  // ── Q5 production platform (weight 2) ──
  if ((p.includes("tiktok") || p.includes("youtube")) &&
      (text.includes("content") || text.includes("social") || text.includes("creator") || text.includes("edit"))) score += 2;
  if (p.includes("film") &&
      (text.includes("film") || text.includes("production") || text.includes("cinema"))) score += 2;
  if (p.includes("client") &&
      (text.includes("professional") || text.includes("commercial") || text.includes("enterprise"))) score += 2;

  return score;
}

const MEDIA_SYSTEM_PROMPT = `You are a Creative AI Mentor helping media professionals find the right AI production tool.

You support exactly these five tools: Runway, Wonder Dynamics, Descript, Adobe Sensei, Flawless AI.

The user has answered 5 structured questions covering: vision type, starting material, AI role, style direction, and production context (platform, duration, urgency). You have their answers and scored agent profiles from the database.

Tool routing logic (use this to validate your recommendation):
- Generate full video → Runway
- VFX / CG characters into live footage → Wonder Dynamics
- Edit / assemble footage / transcription → Descript
- Audio cleanup / dialogue → Descript or Adobe Sensei
- Dubbing / lip-sync / language → Flawless AI
- Color / quality enhancement / automation → Adobe Sensei
If multiple tools match, return the top 2 ranked by fit.

OUTPUT - produce exactly these sections in this order using these exact headings:

## Creative Brief
2–3 cinematic sentences restating the user's intent. Name the transformation type, style direction, and production goal. Sound like a creative director briefing a team - not a chatbot summarising a form.

## Comparison Table
| Tool | Best For | Transformation Type | Style Match | Production Scale |
Include ALL provided agents. Use the user's actual answers to assess fit.

## Recommended Tool
Start with: "Your ideal tool: **[Tool Name]**"
3–4 sentences: what it does, exactly why it matches this user's vision + transformation + style + platform + duration.
State confidence: High / Medium / Low.
If a second tool meaningfully covers a gap the primary can't handle, name it and explain in 1–2 sentences.

## Setup Path
4–5 numbered, practical steps to get started with the recommended tool. Reference the user's actual starting material, platform, and urgency.

## Official Links
[Visit Tool Name](url) for each recommended tool.

RULES:
- Only describe capabilities present in the provided agent data. Do NOT invent features.
- Tone: cinematic, mentor-like, direct. No corporate filler.
- Fit must reflect the user's specific answers - not generic tool rankings.
- Links appear ONLY in the Official Links section.`;

async function handleMediaRecommend(wizardData: MediaWizardData) {
  const mediaRows = (agentsJson as AgentRow[]).filter(
    (r) => r.Business_Domain === "Media & Entertainment"
  );

  const agentMap = new Map<string, Omit<MediaAgentProfile, "score">>();
  for (const row of mediaRows) {
    if (!agentMap.has(row.Agent_ID)) {
      agentMap.set(row.Agent_ID, {
        id: row.Agent_ID,
        name: row.Agent_Name,
        type: row.Agent_Type,
        link: row.Link ?? "",
        capabilities: [],
        claims: [],
        userValues: [],
        bestFor: [],
        whenToUse: [],
      });
    }
    const profile = agentMap.get(row.Agent_ID)!;
    if (row.Sub_Parameter_L2) profile.capabilities.push(row.Sub_Parameter_L2);
    if (row.Capability_Claim) profile.claims.push(row.Capability_Claim);
    if (row.User_Value) profile.userValues.push(row.User_Value);
    if (row.Best_For_User_Needs) profile.bestFor.push(row.Best_For_User_Needs);
    if (row.When_To_Use) profile.whenToUse.push(row.When_To_Use);
  }

  const scored: MediaAgentProfile[] = Array.from(agentMap.values())
    .map((p) => ({ ...p, score: scoreMediaAgent(p, wizardData) }))
    .sort((a, b) => b.score - a.score);

  const topAgents = scored.slice(0, 5).map((a) => ({
    name: a.name,
    type: a.type,
    link: a.link,
    score: a.score,
    capabilities: a.capabilities,
    userValues: [...new Set(a.userValues)].slice(0, 6),
    bestFor: [...new Set(a.bestFor)].slice(0, 4),
    whenToUse: [...new Set(a.whenToUse)].slice(0, 4),
  }));

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1600,
    messages: [
      { role: "system", content: MEDIA_SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({ wizardAnswers: wizardData, agents: topAgents }),
      },
    ],
  });

  return NextResponse.json({
    output: aiResponse.choices[0].message.content ?? "No recommendations generated.",
  });
}

// ─────────────────────────────────────────
// FINANCE HANDLER
// ─────────────────────────────────────────

type FinanceWizardData = {
  finSubdomain: string;
  finFocus?: string[];
  finChannel?: string[];
  finInstitution?: string;
  finOutcome?: string[];
  finNotes?: string;
  loanArea?: string[];
  loanWorkflow?: string[];
  loanChallenge?: string[];
  loanAutomation?: string;
  loanNotes?: string;
};

type FinanceAgentProfile = {
  id: string;
  name: string;
  type: string;
  link: string;
  capabilities: string[];
  claims: string[];
  userValues: string[];
  bestFor: string[];
  whenToUse: string[];
  score: number;
};

function scoreFinanceAgent(
  profile: Omit<FinanceAgentProfile, "score">,
  data: FinanceWizardData
): number {
  const text = [
    ...profile.capabilities,
    ...profile.claims,
    ...profile.userValues,
    ...profile.bestFor,
    ...profile.whenToUse,
    profile.type,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;

  if (data.finSubdomain === "Banking") {
    const focus = (data.finFocus ?? []).join(" ").toLowerCase();
    const channels = (data.finChannel ?? []).join(" ").toLowerCase();
    const institution = (data.finInstitution ?? "").toLowerCase();
    const outcome = (data.finOutcome ?? []).join(" ").toLowerCase();

    if (focus.includes("customer onboarding") && (text.includes("onboard") || text.includes("kyc") || text.includes("digital"))) score += 6;
    if (focus.includes("loan") && (text.includes("loan") || text.includes("credit") || text.includes("underwriting") || text.includes("lending"))) score += 6;
    if (focus.includes("fraud") && (text.includes("fraud") || text.includes("compliance") || text.includes("risk") || text.includes("aml"))) score += 6;
    if (focus.includes("customer engagement") && (text.includes("engagement") || text.includes("retention") || text.includes("personaliz"))) score += 6;
    if (focus.includes("operational") && (text.includes("operational") || text.includes("efficiency") || text.includes("automat") || text.includes("cost"))) score += 6;

    if (channels.includes("voice") && (text.includes("voice") || text.includes("phone") || text.includes("call"))) score += 4;
    if (channels.includes("web") && (text.includes("web") || text.includes("digital") || text.includes("mobile") || text.includes("chat"))) score += 4;
    if (channels.includes("branch") && (text.includes("branch") || text.includes("in-person") || text.includes("staff"))) score += 4;
    if (channels.includes("back-office") && (text.includes("back-office") || text.includes("api") || text.includes("integration"))) score += 4;
    if (channels.includes("whatsapp") && (text.includes("whatsapp") || text.includes("messaging") || text.includes("sms"))) score += 4;

    if (institution.includes("community") && (text.includes("community") || text.includes("credit union") || text.includes("cooperative"))) score += 3;
    if (institution.includes("retail") && (text.includes("retail") || text.includes("consumer"))) score += 3;
    if (institution.includes("neobank") && (text.includes("neobank") || text.includes("fintech") || text.includes("startup"))) score += 3;
    if (institution.includes("enterprise") && (text.includes("enterprise") || text.includes("tier-1") || text.includes("large"))) score += 3;
    if (institution.includes("regional") && (text.includes("regional") || text.includes("mid-size"))) score += 3;

    if (outcome.includes("loan default") && (text.includes("default") || text.includes("risk") || text.includes("credit"))) score += 3;
    if (outcome.includes("customer nps") && (text.includes("nps") || text.includes("satisfaction") || text.includes("engagement"))) score += 3;
    if (outcome.includes("speed") && (text.includes("speed") || text.includes("faster") || text.includes("automat") || text.includes("real-time"))) score += 3;
    if (outcome.includes("operational costs") && (text.includes("cost") || text.includes("efficienc") || text.includes("reduc"))) score += 3;
    if (outcome.includes("regulatory") && (text.includes("regulat") || text.includes("compliance") || text.includes("audit"))) score += 3;
  } else {
    const area = (data.loanArea ?? []).join(" ").toLowerCase();
    const workflow = (data.loanWorkflow ?? []).join(" ").toLowerCase();
    const challenge = (data.loanChallenge ?? []).join(" ").toLowerCase();
    const automation = (data.loanAutomation ?? "").toLowerCase();

    if (area.includes("loan origination") && (text.includes("origination") || text.includes("underwriting") || text.includes("lending"))) score += 6;
    if (area.includes("claims") && (text.includes("claim") || text.includes("insurance") || text.includes("processing"))) score += 6;
    if (area.includes("fraud") && (text.includes("fraud") || text.includes("risk") || text.includes("detection"))) score += 6;
    if (area.includes("customer service") && (text.includes("customer") || text.includes("service") || text.includes("self-service") || text.includes("support"))) score += 6;
    if (area.includes("compliance") && (text.includes("compliance") || text.includes("regulatory") || text.includes("audit"))) score += 6;

    if (workflow.includes("document") && (text.includes("document") || text.includes("ocr") || text.includes("extraction"))) score += 5;
    if (workflow.includes("automated credit") && (text.includes("credit") || text.includes("decision") || text.includes("automat"))) score += 5;
    if (workflow.includes("customer communication") && (text.includes("communication") || text.includes("engagement") || text.includes("messaging"))) score += 5;
    if (workflow.includes("back-office") && (text.includes("back-office") || text.includes("workflow") || text.includes("process"))) score += 5;
    if (workflow.includes("reporting") && (text.includes("report") || text.includes("analytic") || text.includes("portfolio"))) score += 5;

    if (challenge.includes("slow manual") && (text.includes("automat") || text.includes("speed") || text.includes("efficiency"))) score += 3;
    if (challenge.includes("high cost") && (text.includes("cost") || text.includes("efficienc") || text.includes("reduc"))) score += 3;
    if (challenge.includes("compliance") && (text.includes("compliance") || text.includes("regulat") || text.includes("audit"))) score += 3;
    if (challenge.includes("data quality") && (text.includes("data") || text.includes("accuracy") || text.includes("extract"))) score += 3;
    if (challenge.includes("limited automation") && (text.includes("automat") || text.includes("workflow") || text.includes("process"))) score += 3;

    if (automation.includes("full automation") && (text.includes("fully automat") || text.includes("autonomous") || text.includes("end-to-end"))) score += 3;
    if (automation.includes("ai-assisted") && (text.includes("assist") || text.includes("copilot") || text.includes("recommend"))) score += 3;
    if (automation.includes("decision support") && (text.includes("decision support") || text.includes("advisory") || text.includes("analytic"))) score += 3;
  }

  return score;
}

const FINANCE_SYSTEM_PROMPT = `You are a Financial Services AI Expert with deep knowledge of fintech, banking operations, and lending automation.

The user completed a 5-question wizard. You will receive their answers and a list of matched agents from our database.

OUTPUT - you MUST produce exactly these four sections, in this order, using these exact headings:

## Summary
2–3 sentences. Name the best-fit agent and explain in plain language why it matches this user's specific subdomain, focus area, and institution type. No filler.

## Comparison Table
A markdown table with columns: Agent Name | Strength | Best Use Case | Limitation | Fit Score
Fit Score must be High / Medium / Low relative to this user's answers.
Include ALL provided agents.

## Recommended Agent
Start with "Best choice: **[Agent Name]**". Then 3–5 sentences: what it does, why it fits this user's subdomain + focus + institution + outcome, and one concrete result the user can expect. If a secondary agent meaningfully covers a gap, name it and explain in 1–2 sentences.

## Setup Instructions
Numbered list of 4–6 practical steps to get started with the recommended agent. Be specific — reference the user's focus area, institution type, and integration needs.

## Official Links
For each recommended agent, format as: [Visit Agent Name](url)

RULES:
- Only describe capabilities explicitly present in the provided agent data. Do NOT invent features.
- Fit Score must reflect the user's specific answers — not generic agent quality.
- Keep tone professional and direct. No marketing language.
- Do NOT include links anywhere except the "Official Links" section.`;

function extractKeyRequirements(data: FinanceWizardData): string[] {
  const reqs: string[] = [];

  if (data.finSubdomain === "Banking") {
    const focusMap: Record<string, string> = {
      "Customer onboarding & digital banking":
        "Customer onboarding optimisation and digital self-service channel requirements",
      "Loan & credit decisioning":
        "Automated loan and credit decisioning workflow requirements",
      "Fraud detection & compliance":
        "Fraud detection, AML monitoring, and regulatory compliance requirements",
      "Customer engagement & retention":
        "Customer engagement, personalisation, and retention automation requirements",
      "Operational efficiency":
        "Banking operations efficiency and workflow automation requirements",
    };
    const channelMap: Record<string, string> = {
      "Web / mobile banking app":
        "Digital self-service via web and mobile banking channels",
      "Voice / phone banking":
        "Omnichannel voice and phone banking capability requirement",
      "Branch in-person support":
        "Branch staff augmentation and in-person assisted service support",
      "Back-office / API integration":
        "Back-office automation and API-based core banking system integration",
      "WhatsApp / messaging":
        "Conversational AI delivery via messaging and WhatsApp channels",
    };
    const institutionMap: Record<string, string> = {
      "Community bank / credit union":
        "Purpose-built deployment for community banking and credit union scale",
      "Retail / consumer bank":
        "Retail and consumer banking operations optimisation focus",
      "Neobank / fintech startup":
        "Fintech-native, API-first deployment for neobank and startup scale",
      "Enterprise / tier-1 bank":
        "Enterprise-grade capability requirements for tier-1 banking institutions",
      "Regional / mid-size bank":
        "Mid-market regional banking operational and integration requirements",
    };
    const outcomeMap: Record<string, string> = {
      "Reduce loan default rate":
        "Reduction in loan default rate through improved credit risk assessment",
      "Improve customer NPS / satisfaction":
        "Customer satisfaction and NPS improvement as a primary performance target",
      "Speed up processing time":
        "Significant reduction in processing and decision turnaround time",
      "Lower operational costs":
        "Operational cost reduction through AI-driven workflow automation",
      "Achieve regulatory compliance":
        "Regulatory compliance, audit readiness, and reporting automation requirements",
    };

    (data.finFocus ?? []).forEach((f) => { if (focusMap[f]) reqs.push(focusMap[f]); });
    (data.finChannel ?? []).forEach((c) => { if (channelMap[c]) reqs.push(channelMap[c]); });
    if (data.finInstitution && institutionMap[data.finInstitution]) reqs.push(institutionMap[data.finInstitution]);
    (data.finOutcome ?? []).forEach((o) => { if (outcomeMap[o]) reqs.push(outcomeMap[o]); });
    if (data.finNotes?.trim()) reqs.push(`Additional context: ${data.finNotes.trim().slice(0, 140)}${data.finNotes.trim().length > 140 ? "…" : ""}`);
  } else {
    const areaMap: Record<string, string> = {
      "Loan origination & underwriting":
        "Automated loan origination and AI-driven underwriting process requirements",
      "Claims processing & management":
        "Insurance claims automation and end-to-end processing efficiency requirements",
      "Fraud detection & risk scoring":
        "Real-time fraud detection and AI-powered risk scoring requirements",
      "Customer service & self-service":
        "AI-driven customer self-service and assisted support channel requirements",
      "Compliance & regulatory reporting":
        "Regulatory compliance automation and audit reporting requirements",
    };
    const workflowMap: Record<string, string> = {
      "Document processing & data extraction":
        "Intelligent document processing and OCR-based data extraction requirements",
      "Automated credit decisioning":
        "Explainable AI credit decisioning engine with configurable policy rules",
      "Customer communications & follow-up":
        "Automated customer communication and application follow-up workflow requirements",
      "Back-office workflow automation":
        "End-to-end back-office process automation and orchestration requirements",
      "Reporting & portfolio analytics":
        "Portfolio analytics, performance reporting, and dashboard automation requirements",
    };
    const challengeMap: Record<string, string> = {
      "Slow manual underwriting processes":
        "Elimination of manual underwriting bottlenecks as a primary operational objective",
      "High cost to originate / serve":
        "Reduction in cost-to-originate and cost-to-serve as primary financial targets",
      "Compliance and audit overhead":
        "Reduction of compliance and audit overhead through structured automation",
      "Poor data quality / extraction":
        "Improvement of data quality, document accuracy, and extraction reliability",
      "Limited automation in place":
        "Greenfield AI automation deployment across lending and insurance operational workflows",
    };
    const automationMap: Record<string, string> = {
      "Full automation (minimal human oversight)":
        "Fully autonomous AI decisioning pipeline with minimal human intervention required",
      "AI-assisted (AI recommends, human approves)":
        "AI-assisted workflow with human-in-the-loop approval and oversight requirement",
      "Decision support only (human decides)":
        "AI-powered decision support and analytics layer with human authority retained",
    };

    (data.loanArea ?? []).forEach((a) => { if (areaMap[a]) reqs.push(areaMap[a]); });
    (data.loanWorkflow ?? []).forEach((w) => { if (workflowMap[w]) reqs.push(workflowMap[w]); });
    (data.loanChallenge ?? []).forEach((c) => { if (challengeMap[c]) reqs.push(challengeMap[c]); });
    if (data.loanAutomation && automationMap[data.loanAutomation]) reqs.push(automationMap[data.loanAutomation]);
    if (data.loanNotes?.trim()) reqs.push(`Additional context: ${data.loanNotes.trim().slice(0, 140)}${data.loanNotes.trim().length > 140 ? "…" : ""}`);
  }

  return [...new Set(reqs)].slice(0, 7);
}

async function handleFinanceRecommend(wizardData: FinanceWizardData) {
  const domainFilter =
    wizardData.finSubdomain === "Banking"
      ? "Finance - Banking"
      : "Finance - Loans & Insurance";

  const finRows = (agentsJson as AgentRow[]).filter(
    (r) => r.Business_Domain === domainFilter
  );

  const agentMap = new Map<string, Omit<FinanceAgentProfile, "score">>();
  for (const row of finRows) {
    if (!agentMap.has(row.Agent_ID)) {
      agentMap.set(row.Agent_ID, {
        id: row.Agent_ID,
        name: row.Agent_Name,
        type: row.Agent_Type,
        link: row.Link ?? "",
        capabilities: [],
        claims: [],
        userValues: [],
        bestFor: [],
        whenToUse: [],
      });
    }
    const profile = agentMap.get(row.Agent_ID)!;
    if (row.Sub_Parameter_L2) profile.capabilities.push(row.Sub_Parameter_L2);
    if (row.Capability_Claim) profile.claims.push(row.Capability_Claim);
    if (row.User_Value) profile.userValues.push(row.User_Value);
    if (row.Best_For_User_Needs) profile.bestFor.push(row.Best_For_User_Needs);
    if (row.When_To_Use) profile.whenToUse.push(row.When_To_Use);
  }

  const scored: FinanceAgentProfile[] = Array.from(agentMap.values())
    .map((p) => ({ ...p, score: scoreFinanceAgent(p, wizardData) }))
    .sort((a, b) => b.score - a.score);

  const topAgents = scored.slice(0, 5).map((a) => ({
    name: a.name,
    type: a.type,
    link: a.link,
    score: a.score,
    capabilities: a.capabilities,
    userValues: [...new Set(a.userValues)].slice(0, 6),
    bestFor: [...new Set(a.bestFor)].slice(0, 4),
    whenToUse: [...new Set(a.whenToUse)].slice(0, 4),
  }));

  const requirements = extractKeyRequirements(wizardData);
  const requirementsSection =
    `## Key Requirements Captured\n\n` +
    requirements.map((r) => `- ${r}`).join("\n") +
    "\n\n";

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1600,
    messages: [
      { role: "system", content: FINANCE_SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({ wizardAnswers: wizardData, agents: topAgents }),
      },
    ],
  });

  const gptOutput = aiResponse.choices[0].message.content ?? "No recommendations generated.";

  return NextResponse.json({
    output: requirementsSection + gptOutput,
  });
}

// ─────────────────────────────────────────
// REAL ESTATE REQUIREMENTS EXTRACTION
// ─────────────────────────────────────────

function extractRealEstateRequirements(data: {
  goals: string[];
  persona: string;
  priorities: string[];
  notes: string;
}): string[] {
  const reqs: string[] = [];

  const goalMap: Record<string, string> = {
    "Find undervalued investment properties":
      "Identification and prioritisation of undervalued investment property opportunities",
    "Compare property prices vs actual value":
      "Property price vs intrinsic market value comparison and valuation analytics requirements",
    "Automate paperwork / offer documents":
      "Automated document generation and offer paperwork workflow requirements",
    "Analyse market trends":
      "Real-time market trend analysis and predictive property analytics requirements",
    "Manage leads / CRM":
      "Lead management, pipeline automation, and CRM integration requirements",
  };
  const personaMap: Record<string, string> = {
    "Beginner investor":
      "Guided decision support suited to beginner investor workflows and simplified onboarding",
    "Active investor":
      "Advanced analytics and portfolio management capabilities for active investor workflows",
    "Real estate agent":
      "Agent productivity, client management, and listing automation requirements",
    "Buyer":
      "Property buyer journey support and purchase decision intelligence requirements",
  };
  const priorityMap: Record<string, string> = {
    "Accuracy":
      "High data accuracy and valuation reliability as a primary performance requirement",
    "Ease of use":
      "Ease of use and low-friction adoption as a key deployment requirement",
    "Automation":
      "Workflow automation and operational efficiency as primary functional targets",
    "Cost":
      "Cost-effectiveness and return on investment as primary procurement criteria",
    "Advanced analytics":
      "Advanced analytics and AI-driven market insights as a core capability requirement",
  };

  (data.goals ?? []).forEach((g) => { if (goalMap[g]) reqs.push(goalMap[g]); });
  if (data.persona && personaMap[data.persona]) reqs.push(personaMap[data.persona]);
  (data.priorities ?? []).forEach((p) => { if (priorityMap[p]) reqs.push(priorityMap[p]); });
  if (data.notes?.trim()) reqs.push(`Additional context: ${data.notes.trim().slice(0, 140)}${data.notes.trim().length > 140 ? "…" : ""}`);

  return [...new Set(reqs)].slice(0, 7);
}

// ─────────────────────────────────────────
// MAIN ROUTE
// ─────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { domain = "", goals = [], priorities = [] } =
      body.wizardData || {};

    // Route Customer Support requests to dedicated handler
    if (domain === "Customer Support") {
      return handleCSRecommend(body.wizardData as CSWizardData);
    }

    if (domain === "Media") {
      return handleMediaRecommend(body.wizardData as MediaWizardData);
    }

    if (domain === "Finance") {
      return handleFinanceRecommend(body.wizardData as FinanceWizardData);
    }

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
Step 1 - Evaluate every agent in the detected domain against the user's stated needs.
Step 2 - Include an agent in the comparison if it satisfies ANY of the following:
● It directly addresses at least one stated user need
● It offers a capability that materially affects the user's decision
● It provides a meaningful complement to the recommended agent

Step 3 - Only exclude an agent if it has zero relevance to any stated need.
Step 4 - Never reduce the comparison set to validate a winner already chosen.
❌ Do NOT default to 2–3 agents when more are relevant. ❌ Do NOT omit agents simply
because they are not the top recommendation. ✅ The comparison table must reflect ALL
relevant agents from the domain.

AGENT COVERAGE RULE (MANDATORY)
Before building any comparison table:
Step 1 - Evaluate every agent in the detected domain against the user's stated needs.
Step 2 - Include an agent in the comparison if it satisfies ANY of the following:
● It directly addresses at least one stated user need
● It offers a capability that materially affects the user's decision
● It provides a meaningful complement to the recommended agent

Step 3 - Only exclude an agent if it has zero relevance to any stated need.
Step 4 - Never reduce the comparison set to validate a winner already chosen.
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
Do NOT leave capability gaps unresolved or respond with ‘additional tools may be required’ - instead, explicitly name and include the missing agent in the recommendation.”
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

const gptOutput = aiResponse.choices[0].message.content ?? "";

let finalOutput = gptOutput;
if (domain === "Real Estate") {
  const reReqs = extractRealEstateRequirements({
    goals,
    persona: body.wizardData?.persona ?? "",
    priorities,
    notes: body.wizardData?.notes ?? "",
  });
  const reSection =
    `## Key Requirements Captured\n\n` +
    reReqs.map((r) => `- ${r}`).join("\n") +
    "\n\n";
  finalOutput = reSection + gptOutput;
}

return NextResponse.json({ output: finalOutput });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      output: "Something went wrong. Try again.",
    });
  }
}