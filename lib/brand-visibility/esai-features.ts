// ESAI feature config, prompt templates, and scoring logic.
// 22 features per brand: 2 per cluster × 11 clusters.

// ── Grounding & output templates ───────────────────────────────────────────────

export const ESAI_FEATURE_SYSTEM_PROMPT =
  "You are a competitive intelligence analyst evaluating estimating and takeoff software used by Australian builders, trades and estimators. " +
  "For each feature, explain the brand's specific implementation and the practical value it delivers to a builder pricing a construction job — not generic feature existence. " +
  "Return ONLY valid JSON matching the exact schema. No markdown, no explanation — just the JSON object.";

export const ESAI_GROUNDING_INSTRUCTION =
  "Only include information specific to [BRAND]'s documented product. " +
  "Do not infer capabilities from what similar tools typically do. " +
  "If you are uncertain whether [BRAND] specifically has this capability for Australian construction estimating, " +
  "set has_capability to not_documented rather than guessing.";

export const ESAI_JSON_OUTPUT_SPEC =
  '{\n' +
  '  "has_capability": "yes|no|partial|not_documented",\n' +
  '  "evidence": "if yes/partial: 1-2 sentences on what [BRAND] specifically does for this capability and what makes its approach useful for a builder or estimator. If no/not_documented: what is absent or unclear.",\n' +
  '  "limitations": "any caveats or gaps",\n' +
  '  "confidence": "high|medium|low",\n' +
  '  "terminology_tags": ["0-3 short named terms (1-4 words each). Return ONLY terms that are a named product feature, branded mechanism, or product-specific integration. Return [] when evidence uses only generic language."]\n' +
  '}';

// ── Locked brand list ──────────────────────────────────────────────────────────
// Locked 2026-09-03 after brand eligibility review.
// Includes:
//   (a) AI-native / agentic estimating platforms — direct comps to EstiMate AI
//   (b) Dominant traditional tools — benchmark context for the report
// Excluded: general AI models (Claude, GPT, Gemini), general PM tools (Procore,
//           Monday, Asana), workforce tools (Bridgit), progress monitoring only
//           (Doxel, Buildots excluded as wrong domain despite being AI-native),
//           residential PM tools (CoConstruct, Buildertrend), accounting (Xero,
//           QuickBooks), noise/duplicates.
export const LOCKED_ESAI_BRANDS: readonly string[] = [
  // ── AI-native estimating (direct EstiMate AI competitors) ──────────────────
  "Togal.AI",        // AI takeoff — auto-detects/measures from drawings, chat with plans
  "Buildr",          // Agentic preconstruction — Kit agent reads RFPs, prices jobs
  "Buildxact",       // AI-assisted estimating — Blu assistant, Estimate Generator
  // ── Traditional estimating leaders (benchmark context) ─────────────────────
  "PlanSwift",       // #1 by mention — leading takeoff/estimating tool
  "Bluebeam",        // #2 by mention — PDF markup + takeoff
  "CostX",           // #11 — BIM-based estimating, strong in ANZ
  "On-Screen Takeoff", // #12 — On Center Software's takeoff tool
  "ProEst",          // #17 — cloud estimating for GCs
  "STACK",           // #34 — cloud takeoff and estimating
  "eTakeoff",        // #24 — digital takeoff (partnered with Togal.AI SnapAI)
  "Estimating Edge", // #25 — specialised trade estimating
  "Sage Estimating", // #9 — Sage's construction estimating product
  "Esticom",         // #37 — now Procore Estimating, still a known brand name
  "Glodon",          // #94 — BIM-based takeoff, strong in ANZ/Asia market
];

// ── Feature definitions ────────────────────────────────────────────────────────

export interface EsaiFeature {
  feature_id:   string;
  feature_tag:  string;
  feature_name: string;
  description:  string;
  prompt:       string;
}

const FOOTER = `[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`;

export const ESAI_FEATURES: EsaiFeature[] = [

  // ── Cluster 1 — Quantity Takeoff · esai-takeoff ───────────────────────────────
  {
    feature_id:   "takeoff_pdf_measurement",
    feature_tag:  "esai-takeoff",
    feature_name: "Automated quantity measurement from PDF plans",
    description:  "Whether the platform automatically measures and extracts quantities from uploaded PDF building plans without manual on-screen scaling.",
    prompt: `Builders and estimators spend hours manually measuring quantities from PDF plans. Does [BRAND] automatically measure and extract quantities — areas, lengths, volumes — directly from uploaded PDF architectural or structural drawings, without the user manually scaling or tracing on-screen?
${FOOTER}`,
  },
  {
    feature_id:   "takeoff_traceable",
    feature_tag:  "esai-takeoff",
    feature_name: "Quantities traceable back to source drawing",
    description:  "Whether every measured quantity can be traced back to the specific drawing or page it was measured from.",
    prompt: `Estimators need to verify quantities against drawings before submitting a price. Does [BRAND] make every measured quantity traceable back to its source — showing which drawing, page, or element it was measured from — so estimators can check and validate numbers before quoting?
${FOOTER}`,
  },

  // ── Cluster 2 — Plan & Document Reading · esai-plans ─────────────────────────
  {
    feature_id:   "plans_multi_doc_upload",
    feature_tag:  "esai-plans",
    feature_name: "Upload and read multiple document types in one project",
    description:  "Whether builders can upload architectural, structural, engineering and specification PDFs together and have the platform read them all.",
    prompt: `Real projects have multiple document types — architectural drawings, structural drawings, engineering specifications and finishes schedules. Does [BRAND] let users upload and read all of these document types together in a single project, treating them as a unified document set rather than isolated files?
${FOOTER}`,
  },
  {
    feature_id:   "plans_cross_reference",
    feature_tag:  "esai-plans",
    feature_name: "Automatic cross-referencing between documents",
    description:  "Whether the platform automatically cross-references information across architectural, structural and specification documents.",
    prompt: `Quantities often need to be verified across multiple documents — structural drawings may contradict or supplement architectural ones. Does [BRAND] automatically cross-reference information across different document types (e.g. architectural vs structural vs spec) to produce more accurate estimates rather than treating each document in isolation?
${FOOTER}`,
  },

  // ── Cluster 3 — Trade Scoping · esai-scope ────────────────────────────────────
  {
    feature_id:   "scope_trade_breakdown",
    feature_tag:  "esai-scope",
    feature_name: "Automatic trade-by-trade scope breakdown",
    description:  "Whether the platform automatically organises estimates by construction trade (concrete, framing, brickwork, roofing, openings, etc.).",
    prompt: `Builders price jobs by trade — concrete, framing, brickwork, roofing, openings and so on. Does [BRAND] automatically organise the measured scope and quantities into a trade-by-trade breakdown, so each trade package can be priced or sent to a subcontractor independently?
${FOOTER}`,
  },
  {
    feature_id:   "scope_material_labour_split",
    feature_tag:  "esai-scope",
    feature_name: "Separate materials, labour, plant and subcontract costs",
    description:  "Whether the platform separately identifies materials, labour, plant and subcontract costs within each trade line.",
    prompt: `Accurate estimating requires splitting costs by type — materials, labour, plant hire and subcontract. Does [BRAND] separately identify and track these four cost categories within each trade line item, rather than providing only a single combined rate?
${FOOTER}`,
  },

  // ── Cluster 4 — Rate Management & Pricing · esai-pricing ─────────────────────
  {
    feature_id:   "pricing_custom_rates",
    feature_tag:  "esai-pricing",
    feature_name: "Builder's own rates — not locked to a database",
    description:  "Whether builders can input and apply their own negotiated rates rather than being forced to use a fixed pricing database.",
    prompt: `Every builder has their own preferred subcontractor rates and supplier agreements. Does [BRAND] let builders input and apply their own rates — replacing or overriding any database pricing — so the final estimate reflects their actual costs rather than generic benchmarks?
${FOOTER}`,
  },
  {
    feature_id:   "pricing_aus_database",
    feature_tag:  "esai-pricing",
    feature_name: "Australian construction pricing database",
    description:  "Whether the platform includes a pricing database built for Australian construction rates, labour costs and materials.",
    prompt: `Generic pricing databases don't reflect Australian construction costs. Does [BRAND] include a pricing database specifically calibrated for Australian labour rates, material costs and trade structures — rather than a global or US-centric database that needs heavy adjustment before use?
${FOOTER}`,
  },

  // ── Cluster 5 — Quote & Estimate Output · esai-quote ─────────────────────────
  {
    feature_id:   "quote_pdf_export",
    feature_tag:  "esai-quote",
    feature_name: "Export a professional quote PDF",
    description:  "Whether the platform produces an exportable, professionally formatted quote or estimate PDF.",
    prompt: `Builders need to hand a priced document to clients or subbies. Does [BRAND] export a professional, formatted PDF quote or estimate — with trade breakdowns, quantities and rates — that can be sent directly to a client or subcontractor without further formatting?
${FOOTER}`,
  },
  {
    feature_id:   "quote_editable_lines",
    feature_tag:  "esai-quote",
    feature_name: "Every line item reviewable and adjustable before export",
    description:  "Whether builders can review, question and adjust any individual line item in the estimate before exporting.",
    prompt: `Builders need to stay in control of the final number — adjusting rates, querying quantities, and overriding lines before they commit. Does [BRAND] let users review, question and adjust every individual line item in the estimate — with full control over the final output — rather than producing a black-box total?
${FOOTER}`,
  },

  // ── Cluster 6 — Residential New Build · esai-residential ─────────────────────
  {
    feature_id:   "residential_new_build",
    feature_tag:  "esai-residential",
    feature_name: "Full residential new build estimating workflow",
    description:  "Whether the platform supports the complete estimating workflow for a residential new build from plan upload to priced quote.",
    prompt: `Residential new builds are the bread and butter for most Australian builders. Does [BRAND] support the full estimating workflow for a new home build — from uploading architectural and structural plans through to a trade-broken, priced quote — without the builder needing to manually re-enter quantities from the drawings?
${FOOTER}`,
  },
  {
    feature_id:   "residential_spec_finishes",
    feature_tag:  "esai-residential",
    feature_name: "Read and apply finishes schedule or specification",
    description:  "Whether the platform reads a finishes schedule or specification document and applies it to the estimate.",
    prompt: `Residential estimates often depend on a finishes schedule that specifies tiling, joinery, fixtures and fittings. Does [BRAND] read and apply a finishes schedule or specification document — incorporating the specified materials and finishes into the estimate, rather than requiring the estimator to manually extract and enter each line?
${FOOTER}`,
  },

  // ── Cluster 7 — Commercial Construction · esai-commercial ────────────────────
  {
    feature_id:   "commercial_multi_trade",
    feature_tag:  "esai-commercial",
    feature_name: "Multi-trade commercial project estimating",
    description:  "Whether the platform handles the scale and complexity of commercial construction estimating across many trades.",
    prompt: `Commercial projects are larger and more complex than residential — more trades, more documentation, more coordination. Does [BRAND] handle the scale and complexity of commercial construction estimating, supporting large document sets and multi-trade scopes without breaking down?
${FOOTER}`,
  },
  {
    feature_id:   "commercial_tender_pricing",
    feature_tag:  "esai-commercial",
    feature_name: "Support commercial tender pricing workflow",
    description:  "Whether the platform supports the specific workflow of preparing a commercial tender — from drawing set to submitted price.",
    prompt: `Commercial builders submit formal tenders with detailed pricing and trade breakdowns. Does [BRAND] support the commercial tender pricing workflow — from receiving a drawing set through to producing a fully priced, trade-broken tender document that meets commercial project requirements?
${FOOTER}`,
  },

  // ── Cluster 8 — Subcontractor & Trade Quoting · esai-subcontract ─────────────
  {
    feature_id:   "subcontract_trade_quoting",
    feature_tag:  "esai-subcontract",
    feature_name: "Trades and subbies can price from builder-issued documents",
    description:  "Whether the platform is usable by subcontractors and trades to produce their own quotes from builder-issued drawings.",
    prompt: `Subcontractors and specialist trades receive drawing sets from builders and need to produce their own quotes quickly. Does [BRAND] let a trade — a concreter, bricklayer, carpenter or roofer — upload builder-issued drawings and generate their own trade-specific quote without needing to do the full builder workflow?
${FOOTER}`,
  },
  {
    feature_id:   "subcontract_package_pricing",
    feature_tag:  "esai-subcontract",
    feature_name: "Price individual trade packages from a full drawing set",
    description:  "Whether the platform lets users scope and price a single trade package from a full project drawing set.",
    prompt: `Often a subcontractor only needs to price one trade from a full set of project drawings — the concreter only needs the concrete scope, not the whole project. Does [BRAND] let users scope and price a single trade package from a full project drawing set, without having to process or quote the entire project?
${FOOTER}`,
  },

  // ── Cluster 9 — AI-Powered Estimating · esai-ai ──────────────────────────────
  {
    feature_id:   "ai_plan_interpretation",
    feature_tag:  "esai-ai",
    feature_name: "AI interprets construction drawings — not just OCR",
    description:  "Whether the platform uses genuine AI understanding of construction drawings rather than simple OCR or manual digitisation.",
    prompt: `Basic tools extract text from PDFs but don't understand what the drawing shows. Does [BRAND] use AI to genuinely interpret construction drawings — understanding plan views, elevations, sections and annotations — rather than simply running OCR or requiring the user to digitise the plan manually?
${FOOTER}`,
  },
  {
    feature_id:   "ai_autonomous_scope",
    feature_tag:  "esai-ai",
    feature_name: "Autonomous scope generation from drawings without prompting",
    description:  "Whether the AI autonomously generates the full scope and quantities from drawings without the user specifying what to measure.",
    prompt: `The most powerful AI estimating tools don't wait for the user to tell them what to measure — they read the drawings and generate the full scope autonomously. Does [BRAND] autonomously generate the complete scope and quantities from an uploaded drawing set — without the user needing to specify elements, draw measurement lines, or prompt the system for each trade?
${FOOTER}`,
  },

  // ── Cluster 10 — Security & Data Trust · esai-security ──────────────────────
  {
    feature_id:   "security_data_residency",
    feature_tag:  "esai-security",
    feature_name: "Australian data hosting / data sovereignty",
    description:  "Whether project data and uploaded drawings are stored in Australian data centres, meeting Australian data sovereignty requirements.",
    prompt: `Australian builders upload sensitive project documents — drawings, specifications, and pricing — to these platforms. Does [BRAND] store project data and uploaded files in Australian data centres, explicitly offering Australian data sovereignty or data residency guarantees rather than defaulting to US or European servers?
${FOOTER}`,
  },
  {
    feature_id:   "security_compliance",
    feature_tag:  "esai-security",
    feature_name: "Security certification — SOC 2 or ISO 27001",
    description:  "Whether the platform holds SOC 2 Type II or ISO 27001 certification, or equivalent independently audited security standard.",
    prompt: `Enterprise builders and commercial contractors increasingly require vendors to hold independently audited security certifications before trusting them with project documents. Does [BRAND] hold SOC 2 Type II, ISO 27001, or an equivalent independently audited security certification — with the certification publicly documented rather than just claimed?
${FOOTER}`,
  },

  // ── Cluster 11 — Tender & Bid Preparation · esai-tender ─────────────────────
  {
    feature_id:   "tender_preparation",
    feature_tag:  "esai-tender",
    feature_name: "Full tender preparation from drawing set to submitted price",
    description:  "Whether the platform supports the end-to-end tender preparation process for Australian construction projects.",
    prompt: `Tender preparation is a multi-step process — receiving documents, measuring quantities, pricing trades, and submitting a formatted price. Does [BRAND] support the full tender preparation workflow from receiving a drawing set through to a formatted, submitted tender price — covering quantity takeoff, trade pricing and document output in a single workflow?
${FOOTER}`,
  },
  {
    feature_id:   "tender_bid_tracking",
    feature_tag:  "esai-tender",
    feature_name: "Track and manage multiple bids or tender submissions",
    description:  "Whether the platform lets estimators manage multiple active bids or tender submissions at once.",
    prompt: `Estimators often work on multiple tenders simultaneously — each at a different stage, with different deadlines. Does [BRAND] let estimators track and manage multiple active bids or tender submissions at once, with project-level organisation, status tracking, and the ability to compare or reuse estimates across jobs?
${FOOTER}`,
  },
];

// ── Prompt builder ─────────────────────────────────────────────────────────────

export function buildEsaiFeaturePrompt(feature: EsaiFeature, brandName: string): string {
  return feature.prompt
    .replace(/\[BRAND\]/g, brandName)
    .replace(/\[GROUNDING INSTRUCTION\]/g, ESAI_GROUNDING_INSTRUCTION.replace(/\[BRAND\]/g, brandName))
    .replace(/\[JSON OUTPUT\]/g, ESAI_JSON_OUTPUT_SPEC.replace(/\[BRAND\]/g, brandName));
}

// ── Scoring ────────────────────────────────────────────────────────────────────

type FeatureRun = {
  has_capability: string | null;
  confidence:     string | null;
  parse_error:    boolean;
  grounded:       boolean;
};

const CAPABILITY_SCORE: Record<string, number> = {
  yes: 100, partial: 50, no: 0, not_documented: 0,
};
const CONFIDENCE_WEIGHT: Record<string, number> = {
  high: 1.0, medium: 0.75, low: 0.5,
};

export function computeEsaiScore(runs: FeatureRun[]): {
  score: number | null; score_band: string | null;
  runs_agreeing: number | null; runs_total: number;
  flag_for_review: boolean; flag_reason: string | null;
} {
  const valid = runs.filter((r) => !r.parse_error && r.has_capability !== null);
  const runs_total = valid.length;

  if (runs_total === 0) {
    return { score: null, score_band: null, runs_agreeing: null, runs_total: 0, flag_for_review: true, flag_reason: "all_parse_errors" };
  }

  // Weighted average
  let weightedSum = 0, weightSum = 0;
  for (const r of valid) {
    const cap = r.has_capability ?? "not_documented";
    const w   = CONFIDENCE_WEIGHT[r.confidence ?? "medium"] ?? 0.75;
    weightedSum += (CAPABILITY_SCORE[cap] ?? 0) * w;
    weightSum   += w;
  }
  const score = Math.round(weightedSum / weightSum);

  // Consensus
  const capsCount = new Map<string, number>();
  for (const r of valid) {
    const cap = r.has_capability ?? "not_documented";
    capsCount.set(cap, (capsCount.get(cap) ?? 0) + 1);
  }
  const topCap = [...capsCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const runs_agreeing = topCap ? topCap[1] : 0;

  // Band
  let score_band: string;
  if (score >= 70)      score_band = "strong";
  else if (score >= 40) score_band = "partial";
  else if (score > 0)   score_band = "weak";
  else                  score_band = "absent";

  // Flag if consensus is weak
  const flag_for_review = runs_agreeing < Math.ceil(runs_total / 2);
  const flag_reason     = flag_for_review ? `low_consensus_${runs_agreeing}_of_${runs_total}` : null;

  return { score, score_band, runs_agreeing, runs_total, flag_for_review, flag_reason };
}
