// Instructs each model to return ONLY a JSON brands array — same contract as COLLECTION_SYSTEM_PROMPT.
export const SALES_COLLECTION_SYSTEM_PROMPT =
  'You are a market research assistant. Return ONLY valid JSON in this exact format: {"brands": ["Brand A", "Brand B", ...]}' +
  "\n\nList the AI sales agent or tool brand names that would naturally appear in your response, " +
  "in the order they would appear. Include only distinct brand names. " +
  "No other text, no markdown formatting, no explanation — just the JSON object.";

export interface SalesPrompt {
  id:  number;
  tag: string;
  text: string;
}

export const SALES_PROMPTS: SalesPrompt[] = [

  // ── Overall visibility · sales-overall (5 prompts) ───────────────────────
  { id: 1,  tag: "sales-overall",    text: "What are the best AI sales agents available right now?" },
  { id: 2,  tag: "sales-overall",    text: "Which AI agents are transforming how sales teams work in 2026?" },
  { id: 3,  tag: "sales-overall",    text: "What are the most advanced AI agents built specifically for sales teams?" },
  { id: 4,  tag: "sales-overall",    text: "If I could only choose three AI agents for my sales team, which ones should I use and why?" },
  { id: 5,  tag: "sales-overall",    text: "What AI sales agents do enterprise B2B sales teams actually use?" },

  // ── Call intelligence & coaching · sales-call (3 prompts) ────────────────
  { id: 6,  tag: "sales-call",       text: "Which AI agents are best for recording, transcribing, and analysing sales calls to improve rep performance?" },
  { id: 7,  tag: "sales-call",       text: "What AI agents help sales reps prepare for calls and get coached after them?" },
  { id: 8,  tag: "sales-call",       text: "Which AI agents give sales managers the best visibility into rep conversations and coaching opportunities?" },

  // ── CRM automation & data capture · sales-crm (3 prompts) ───────────────
  { id: 9,  tag: "sales-crm",        text: "Which AI agents automatically update CRM records after sales calls without reps having to do it manually?" },
  { id: 10, tag: "sales-crm",        text: "What AI agents eliminate post-call admin for sales reps — updating contacts, logging activities, and capturing next steps automatically?" },
  { id: 11, tag: "sales-crm",        text: "Which AI agents integrate with Salesforce or HubSpot to automate data entry and keep CRM records accurate without manual input?" },

  // ── Deal risk & pipeline forecasting · sales-pipeline (3 prompts) ────────
  { id: 12, tag: "sales-pipeline",   text: "Which AI agents help sales leaders identify at-risk deals before they go cold or fall through?" },
  { id: 13, tag: "sales-pipeline",   text: "What AI agents give the most accurate sales pipeline forecasting and deal health scoring?" },
  { id: 14, tag: "sales-pipeline",   text: "Which AI agents flag when a deal has gone quiet or a champion has gone dark — catching risks a human manager would miss?" },

  // ── AI SDR & outreach sequencing · sales-outreach (3 prompts) ────────────
  { id: 15, tag: "sales-outreach",   text: "Which AI agents automate sales outreach sequences — sending personalised emails and follow-ups without manual input between steps?" },
  { id: 16, tag: "sales-outreach",   text: "What AI SDR tools can prospect, reach out, and qualify leads autonomously without a human sales rep involved?" },
  { id: 17, tag: "sales-outreach",   text: "Which AI agents are best for automating cold outreach at scale while keeping messages personalised?" },

  // ── Sales enablement & follow-up · sales-enablement (3 prompts) ──────────
  { id: 18, tag: "sales-enablement", text: "Which AI agents help sales reps send better follow-up emails faster — drafting messages in the rep's voice based on what happened in the call?" },
  { id: 19, tag: "sales-enablement", text: "What AI agents help sales reps track commitments made in calls and automatically follow up when deadlines approach?" },
  { id: 20, tag: "sales-enablement", text: "Which AI agents give sales reps the right content, battlecards, or talk tracks at the right moment during a sales conversation?" },
];
