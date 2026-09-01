// ESAI pipeline — Australian Construction Estimating
// Collection system prompt + 39 prompts (9 overall + 30 SoV across 10 clusters).
// Scope: any estimating/takeoff/quoting tool used by Australian builders and trades —
// traditional, AI-assisted, or AI-native. Not restricted to AI agents only.

export const ESAI_COLLECTION_SYSTEM_PROMPT =
  'You are a market research assistant. Return ONLY valid JSON in this exact format: {"brands": ["Brand A", "Brand B", ...]}' +
  "\n\nAnswer the user's question naturally, then list every brand name you would mention in your answer, in the order they appear. Include any company, product, or platform name that is relevant — do not over-filter." +
  "\n\nIf the question is about estimating or takeoff software for Australian builders and trades, include any software product, platform, or tool that Australian builders, estimators or trades use for estimating, quoting, takeoff or job pricing — whether traditional software, AI-assisted, or AI-native. When in doubt, include it." +
  "\n\nNo other text, no markdown formatting, no explanation — just the JSON object.";

export interface EsaiPrompt {
  id:  number;
  tag: string;
  text: string;
}

export const ESAI_PROMPTS: EsaiPrompt[] = [

  // ── Overall Brand Mentions · esai-overall (9 prompts) ────────────────────────
  { id: 1,  tag: "esai-overall", text: "What estimating software do Australian builders use?" },
  { id: 2,  tag: "esai-overall", text: "What tools do Australian residential builders use to price jobs?" },
  { id: 3,  tag: "esai-overall", text: "What software do Australian estimators use for quantity takeoff?" },
  { id: 4,  tag: "esai-overall", text: "What estimating platforms are popular with Australian building companies?" },
  { id: 5,  tag: "esai-overall", text: "What software helps Australian builders price new homes?" },
  { id: 6,  tag: "esai-overall", text: "What tools do Australian trades and estimators use to quote jobs?" },
  { id: 7,  tag: "esai-overall", text: "What estimating software do Australian commercial builders use?" },
  { id: 8,  tag: "esai-overall", text: "What are Australian builders using to speed up their estimating process in 2025?" },
  { id: 9,  tag: "esai-overall", text: "Which estimating software companies are targeting the Australian construction market?" },

  // ── Cluster 1 — Quantity Takeoff · esai-takeoff (3 prompts) ─────────────────
  { id: 10, tag: "esai-takeoff", text: "What software do Australian builders use for quantity takeoff from plans?" },
  { id: 11, tag: "esai-takeoff", text: "What tools do Australian estimators use to measure quantities from PDF drawings?" },
  { id: 12, tag: "esai-takeoff", text: "What platforms help Australian builders do automated takeoff from building plans?" },

  // ── Cluster 2 — Plan & Document Reading · esai-plans (3 prompts) ─────────────
  { id: 13, tag: "esai-plans", text: "What software do Australian builders use to read and extract information from architectural drawings?" },
  { id: 14, tag: "esai-plans", text: "What tools help Australian estimators work with multiple building documents in one project?" },
  { id: 15, tag: "esai-plans", text: "What platforms let Australian builders upload and read plans, specs and engineering drawings together?" },

  // ── Cluster 3 — Trade Scoping · esai-scope (3 prompts) ──────────────────────
  { id: 16, tag: "esai-scope", text: "What software do Australian builders use to break down a job by trade?" },
  { id: 17, tag: "esai-scope", text: "What tools help Australian estimators organise scope by trade package?" },
  { id: 18, tag: "esai-scope", text: "What platforms automatically scope a construction job by trade for Australian builders?" },

  // ── Cluster 4 — Rate Management & Pricing · esai-pricing (3 prompts) ─────────
  { id: 19, tag: "esai-pricing", text: "What software do Australian builders use to price materials and labour?" },
  { id: 20, tag: "esai-pricing", text: "What estimating tools include Australian construction pricing databases?" },
  { id: 21, tag: "esai-pricing", text: "What estimating platforms let Australian builders apply their own rates?" },

  // ── Cluster 5 — Quote & Estimate Output · esai-quote (3 prompts) ─────────────
  { id: 22, tag: "esai-quote", text: "What software do Australian builders use to produce a formal quote or estimate?" },
  { id: 23, tag: "esai-quote", text: "What tools help Australian builders export a professional PDF quote?" },
  { id: 24, tag: "esai-quote", text: "What platforms produce trade-broken estimates for Australian construction projects?" },

  // ── Cluster 6 — Residential New Build · esai-residential (3 prompts) ─────────
  { id: 25, tag: "esai-residential", text: "What estimating software do Australian residential builders use?" },
  { id: 26, tag: "esai-residential", text: "What tools do Australian house builders use to price new home builds?" },
  { id: 27, tag: "esai-residential", text: "What platforms are popular with Australian volume and custom home builders for estimating?" },

  // ── Cluster 7 — Commercial Construction · esai-commercial (3 prompts) ─────────
  { id: 28, tag: "esai-commercial", text: "What estimating software do Australian commercial builders use?" },
  { id: 29, tag: "esai-commercial", text: "What tools help Australian commercial contractors price large construction projects?" },
  { id: 30, tag: "esai-commercial", text: "What platforms do Australian commercial builders use for tender estimating?" },

  // ── Cluster 8 — Subcontractor & Trade Quoting · esai-subcontract (3 prompts) ──
  { id: 31, tag: "esai-subcontract", text: "What estimating software do Australian subcontractors and trades use?" },
  { id: 32, tag: "esai-subcontract", text: "What tools help Australian trades price jobs from builder-issued drawings?" },
  { id: 33, tag: "esai-subcontract", text: "What platforms do Australian subcontractors use to produce trade quotes quickly?" },

  // ── Cluster 9 — AI-Powered Estimating · esai-ai (3 prompts) ─────────────────
  { id: 34, tag: "esai-ai", text: "What AI-powered estimating tools are available for Australian builders?" },
  { id: 35, tag: "esai-ai", text: "What software uses AI to automate quantity takeoff for Australian construction?" },
  { id: 36, tag: "esai-ai", text: "What platforms use artificial intelligence to help Australian builders price jobs faster?" },

  // ── Cluster 10 — Tender & Bid Preparation · esai-tender (3 prompts) ──────────
  { id: 37, tag: "esai-tender", text: "What software do Australian builders use to prepare tender submissions?" },
  { id: 38, tag: "esai-tender", text: "What tools help Australian estimators manage multiple tender bids?" },
  { id: 39, tag: "esai-tender", text: "What platforms support the full tender preparation workflow for Australian construction?" },
];
