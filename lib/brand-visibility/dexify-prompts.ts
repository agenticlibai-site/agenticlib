export const DEXIFY_COLLECTION_SYSTEM_PROMPT =
  'You are a market research assistant. Return ONLY valid JSON in this exact format: {"brands": ["Brand A", "Brand B", ...]}' +
  "\n\nList every AI agent, AI platform, or software brand name that would naturally appear in your response, " +
  "in the order they would appear. Include all distinct brand names — do not filter or pre-select. " +
  "No other text, no markdown formatting, no explanation — just the JSON object.";

export interface DexifyPrompt {
  id:   number;
  tag:  string;
  text: string;
}

export const DEXIFY_PROMPTS: DexifyPrompt[] = [

  // ── General Discovery · dexify-general (5 prompts) ──────────────────────────
  { id: 1,  tag: "dexify-general",    text: "What AI agents are available for tradespeople to handle business admin automatically?" },
  { id: 2,  tag: "dexify-general",    text: "Is there an AI agent built specifically for trade businesses that handles paperwork?" },
  { id: 3,  tag: "dexify-general",    text: "Agentic AI platforms built for tradies — what exists in 2026?" },
  { id: 4,  tag: "dexify-general",    text: "AI that handles the admin work for electricians and plumbers automatically" },
  { id: 5,  tag: "dexify-general",    text: "What AI agents are replacing paperwork and admin for small trade businesses?" },

  // ── Voice-to-Quote Agent · dexify-voice-quote (5 prompts) ───────────────────
  { id: 6,  tag: "dexify-voice-quote", text: "AI agent that turns a voice description of a job into a quote for tradespeople" },
  { id: 7,  tag: "dexify-voice-quote", text: "Is there an AI agent I can speak a job description to and it generates a professional PDF quote automatically?" },
  { id: 8,  tag: "dexify-voice-quote", text: "Voice to quote AI agent for tradespeople — describe the job, get a branded quote" },
  { id: 9,  tag: "dexify-voice-quote", text: "AI agent for tradies that creates customer quotes from spoken job descriptions on site" },
  { id: 10, tag: "dexify-voice-quote", text: "What AI agent converts voice notes into quotes for electricians and plumbers?" },

  // ── Post-Job Admin & Invoicing Agent · dexify-post-job (5 prompts) ──────────
  { id: 11, tag: "dexify-post-job",   text: "AI agent that automatically generates an invoice after a tradie finishes a job" },
  { id: 12, tag: "dexify-post-job",   text: "Is there an AI agent that converts spoken job notes into invoices without manual data entry?" },
  { id: 13, tag: "dexify-post-job",   text: "AI that handles post-job admin for tradespeople hands-free — what exists?" },
  { id: 14, tag: "dexify-post-job",   text: "AI agent for tradies that turns a job description into an invoice and sends it automatically" },
  { id: 15, tag: "dexify-post-job",   text: "What AI handles the gap between finishing a trade job and getting paid?" },

  // ── Job Compliance & Documentation Agent · dexify-compliance (5 prompts) ────
  { id: 16, tag: "dexify-compliance", text: "AI agent that generates SWMS documents automatically for Australian tradespeople" },
  { id: 17, tag: "dexify-compliance", text: "Is there an AI agent I can describe a job to and it creates the safety documentation?" },
  { id: 18, tag: "dexify-compliance", text: "AI that handles compliance documentation automatically for Australian trade businesses" },
  { id: 19, tag: "dexify-compliance", text: "AI agent that creates SWMS and site reports from voice descriptions for tradies" },
  { id: 20, tag: "dexify-compliance", text: "What AI agent handles the safety and compliance paperwork burden for Australian electricians and builders?" },

  // ── Inbound & Client Communication Agent · dexify-client-comms (5 prompts) ──
  { id: 21, tag: "dexify-client-comms", text: "AI agent that handles inbound job enquiries for tradespeople automatically" },
  { id: 22, tag: "dexify-client-comms", text: "Is there an AI agent that follows up on sent quotes for trade businesses?" },
  { id: 23, tag: "dexify-client-comms", text: "AI receptionist for electricians and plumbers that handles new customer calls and bookings" },
  { id: 24, tag: "dexify-client-comms", text: "AI agent that confirms job bookings and sends updates to clients for a trade business" },
  { id: 25, tag: "dexify-client-comms", text: "What AI handles customer communication automatically for a solo tradie or small trade business?" },
];
