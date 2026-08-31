// ESAI pipeline — AI agent visibility for Australian construction estimating
// Collection system prompt + 39 prompts (9 overall + 10 clusters × 3).

export const ESAI_COLLECTION_SYSTEM_PROMPT =
  'You are a market research assistant. Return ONLY valid JSON in this exact format: {"brands": ["Brand A", "Brand B", ...]}' +
  "\n\nList every brand name that would naturally appear in your response, in the order they would appear. Include all distinct brand names — do not filter or pre-select. Include every AI agent, platform, or product that comes up naturally when answering the question." +
  "\n\nNo other text, no markdown formatting, no explanation — just the JSON object.";

export interface EsaiPrompt {
  id:  number;
  tag: string;
  text: string;
}

export const ESAI_PROMPTS: EsaiPrompt[] = [

  // ── Overall Brand Mentions · esai-overall (9 prompts) ────────────────────────
  { id: 1,  tag: "esai-overall", text: "Which AI agents do Australian builders use to estimate the cost of a new home build?" },
  { id: 2,  tag: "esai-overall", text: "Which AI agents do Australian construction estimators use to measure quantities from drawings?" },
  { id: 3,  tag: "esai-overall", text: "Which AI agents are Australian builders and trades using for construction estimating?" },
  { id: 4,  tag: "esai-overall", text: "Which AI agents help Australian builders produce faster, more accurate quotes?" },
  { id: 5,  tag: "esai-overall", text: "Which AI agents do custom home builders in Australia use to price a job before tender?" },
  { id: 6,  tag: "esai-overall", text: "Which AI agents let builders upload PDF plans and get a trade-by-trade cost breakdown?" },
  { id: 7,  tag: "esai-overall", text: "Which AI agents are leading construction takeoff and estimating in Australia?" },
  { id: 8,  tag: "esai-overall", text: "Which AI agents do Australian estimators and quantity surveyors use to price residential projects?" },
  { id: 9,  tag: "esai-overall", text: "Which AI agents do Australian builders use to quote subcontract packages?" },

  // ── Cluster 1 — Quantity Takeoff · esai-takeoff (3 prompts) ─────────────────
  { id: 10, tag: "esai-takeoff", text: "Which AI agents automatically measure quantities from PDF building plans?" },
  { id: 11, tag: "esai-takeoff", text: "Which AI agents perform automated takeoffs from architectural and structural drawings?" },
  { id: 12, tag: "esai-takeoff", text: "Which AI agents let builders complete a quantity takeoff without manually scaling drawings?" },

  // ── Cluster 2 — Plan & Document Reading · esai-plans (3 prompts) ─────────────
  { id: 13, tag: "esai-plans", text: "Which AI agents can read and interpret PDF architectural drawings for estimating?" },
  { id: 14, tag: "esai-plans", text: "Which AI agents cross-reference architectural, structural and engineering documents for estimating?" },
  { id: 15, tag: "esai-plans", text: "Which AI agents extract measurements directly from uploaded construction plans?" },

  // ── Cluster 3 — Trade Scoping · esai-scope (3 prompts) ───────────────────────
  { id: 16, tag: "esai-scope", text: "Which AI agents break a construction job down trade by trade — concrete, framing, brickwork, roofing?" },
  { id: 17, tag: "esai-scope", text: "Which AI agents help builders scope a full new build across all construction trades?" },
  { id: 18, tag: "esai-scope", text: "Which AI agents organise a construction estimate by trade package for subcontractor pricing?" },

  // ── Cluster 4 — Rate Management & Pricing · esai-pricing (3 prompts) ─────────
  { id: 19, tag: "esai-pricing", text: "Which AI agents let builders apply their own rates when estimating a construction project?" },
  { id: 20, tag: "esai-pricing", text: "Which AI agents include an Australian construction pricing database?" },
  { id: 21, tag: "esai-pricing", text: "Which AI agents let estimators store and apply custom labour and material rates per trade?" },

  // ── Cluster 5 — Quote & Estimate Output · esai-quote (3 prompts) ─────────────
  { id: 22, tag: "esai-quote", text: "Which AI agents export a professional, trade-broken quote PDF for Australian building projects?" },
  { id: 23, tag: "esai-quote", text: "Which AI agents produce a client-ready quote from a set of construction drawings?" },
  { id: 24, tag: "esai-quote", text: "Which AI agents generate estimates that can be handed directly to a subcontractor?" },

  // ── Cluster 6 — Residential New Build · esai-residential (3 prompts) ─────────
  { id: 25, tag: "esai-residential", text: "Which AI agents do Australian residential builders use for new home build estimating?" },
  { id: 26, tag: "esai-residential", text: "Which AI agents do Australian volume and custom home builders use to estimate construction costs?" },
  { id: 27, tag: "esai-residential", text: "Which AI agents handle the full estimating workflow for a new house — from plans to priced quote?" },

  // ── Cluster 7 — Commercial Construction · esai-commercial (3 prompts) ─────────
  { id: 28, tag: "esai-commercial", text: "Which AI agents do Australian commercial builders and contractors use for estimating?" },
  { id: 29, tag: "esai-commercial", text: "Which AI agents handle commercial construction estimating and tender pricing in Australia?" },
  { id: 30, tag: "esai-commercial", text: "Which AI agents support multi-trade estimating for commercial projects in Australia?" },

  // ── Cluster 8 — Subcontractor & Trade Quoting · esai-subcontract (3 prompts) ──
  { id: 31, tag: "esai-subcontract", text: "Which AI agents help Australian trades and subcontractors produce their own quotes?" },
  { id: 32, tag: "esai-subcontract", text: "Which AI agents let a carpenter, concreter or bricklayer price a job from a set of drawings?" },
  { id: 33, tag: "esai-subcontract", text: "Which AI agents do Australian trades use to quote on builder-issued documents?" },

  // ── Cluster 9 — AI-Powered Estimating · esai-ai (3 prompts) ─────────────────
  { id: 34, tag: "esai-ai", text: "Which AI agents are automating construction estimating for Australian builders?" },
  { id: 35, tag: "esai-ai", text: "Which AI agents are changing how builders produce quotes and takeoffs in Australia?" },
  { id: 36, tag: "esai-ai", text: "Which AI agents read plans and generate cost estimates automatically for Australian construction?" },

  // ── Cluster 10 — Tender & Bid Preparation · esai-tender (3 prompts) ──────────
  { id: 37, tag: "esai-tender", text: "Which AI agents help Australian builders prepare and submit tender pricing packages?" },
  { id: 38, tag: "esai-tender", text: "Which AI agents do estimators use to manage bid preparation for construction tenders in Australia?" },
  { id: 39, tag: "esai-tender", text: "Which AI agents support the full tender workflow from drawings to submitted price in Australia?" },
];
