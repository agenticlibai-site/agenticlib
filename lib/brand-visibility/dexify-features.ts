// Dexify feature config, prompt templates, and scoring logic.
// Architecture mirrors lib/brand-visibility/sales-features.ts exactly.
// Features are scoped to tradie/tradespeople use cases across 5 clusters.

// ── Grounding & output templates ───────────────────────────────────────────────

export const DEXIFY_FEATURE_SYSTEM_PROMPT =
  "You are a competitive intelligence analyst evaluating AI agent platforms and trade business software. " +
  "For each feature, explain the brand's specific implementation and the practical value it delivers to a tradie or trade business — not generic feature existence. " +
  "Return ONLY valid JSON matching the exact schema. No markdown, no explanation — just the JSON object.";

export const DEXIFY_GROUNDING_INSTRUCTION =
  "Only include information specific to [BRAND]'s documented product. " +
  "Do not infer capabilities from what similar tools typically do. " +
  "If you are uncertain whether [BRAND] specifically has this capability for tradespeople or trade businesses, " +
  "set has_capability to not_documented rather than guessing.";

export const DEXIFY_JSON_OUTPUT_SPEC =
  '{\n' +
  '  "has_capability": "yes|no|partial|not_documented",\n' +
  '  "evidence": "if yes/partial: 1-2 sentences on what [BRAND] specifically does for this capability and what makes its approach useful for a tradie — describe the mechanism and practical outcome, not just that the feature exists. If no/not_documented: what is absent or unclear.",\n' +
  '  "limitations": "any caveats or gaps",\n' +
  '  "confidence": "high|medium|low"\n' +
  '}';

// ── Locked brand list ──────────────────────────────────────────────────────────
// Only independently web-verified AI agents / platforms with named autonomous
// AI features for tradespeople. Do not add without verification.
export const LOCKED_DEXIFY_BRANDS: readonly string[] = [
  "Sophiie AI",      // Autonomous phone agent — books jobs, sends follow-ups, quotes (AU)
  "simPRO",          // Lightning platform: Cooper AI, FieldReady, JobReady, JobScribe, JobBrief agents (AU)
  "VoxTrade",        // Voice-to-quote AI (voxtrade.app — distinct from voxtradeapp.com stock app)
  "AirQuote",        // AI converts voice/plain-language job descriptions to priced quotes
  "ServiceM8",       // AI scheduling, automated job follow-up, and smart dispatch (AU)
  "ServiceTitan",    // Titan Intelligence + Atlas AI sidekick — scheduling, dispatch, booking, pricing
  "Voxworks",        // AU AI voice agent for tradies — inbound triage, warm transfer, outbound follow-up (AU)
  "Waboom AI",       // AU AI voice agent for construction — subcontractor coordination, quote capture, emergency triage (AU)
  "Square AI",       // AU AI agent for plumbers — call answering, job cards into ServiceM8/Tradify (AU, Penrith NSW)
  "Insta Quote AI",  // AU/NZ voice-to-quote and conversational quoting
];

// ── Feature definitions ────────────────────────────────────────────────────────

export interface DexifyFeature {
  feature_id:   string;
  feature_tag:  string;  // matches dexify cluster tag
  feature_name: string;
  prompt:       string;  // [BRAND], [GROUNDING INSTRUCTION], [JSON OUTPUT] substituted at runtime
}

export const DEXIFY_FEATURES: DexifyFeature[] = [

  // ── General Discovery · dexify-general ───────────────────────────────────────
  {
    feature_id:   "tradie_selfserve_onboarding",
    feature_tag:  "dexify-general",
    feature_name: "Self-serve setup with no IT or technical help needed",
    prompt: `As a sole trader or small trade business owner with no IT support or technical background, can I set up and use [BRAND] myself — without developer assistance, complex configuration, or a multi-week onboarding process? Does [BRAND] offer a self-serve setup that a non-technical tradie can complete and start using independently within a day?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Voice-to-Quote Agent · dexify-voice-quote ────────────────────────────────
  {
    feature_id:   "voice_to_quote_generation",
    feature_tag:  "dexify-voice-quote",
    feature_name: "Spoken job description to formatted customer quote, no typing",
    prompt: `I'm on a job site and want to describe what needs to be done by speaking into my phone — and have [BRAND] automatically generate a formatted quote I can send to the client immediately, without typing anything or going back to the office. Does [BRAND] support generating a customer-facing quote directly from a spoken voice description of the job, with the AI handling the structuring and pricing?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "branded_pdf_quote_output",
    feature_tag:  "dexify-voice-quote",
    feature_name: "Quote delivered as a professional branded PDF",
    prompt: `When [BRAND] generates a quote for a trade job, does it produce a professional, customer-facing PDF that includes the business's branding — logo, business name, contact details, and itemised job scope — ready to send directly to the client without reformatting? Not an internal cost estimate, but a document the client receives as a formal quote.
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Post-Job Admin & Invoicing · dexify-post-job ─────────────────────────────
  {
    feature_id:   "auto_invoice_on_job_completion",
    feature_tag:  "dexify-post-job",
    feature_name: "Invoice triggered and sent automatically when job is done, no manual entry",
    prompt: `When I finish a job, I want [BRAND] to automatically generate and send an invoice to my client without me manually entering job details, hours, or materials after the fact. Does [BRAND] trigger invoice creation and delivery automatically when a job is marked complete — with no manual data entry required from the tradie?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "payment_link_in_invoice",
    feature_tag:  "dexify-post-job",
    feature_name: "Invoice includes online payment link for immediate client payment",
    prompt: `Does [BRAND]'s automatically generated invoice include a direct online payment link so the client can pay immediately on receipt — without the tradie needing to follow up or manage a separate payment step? Does the system close the loop from job completion to payment collected without manual chasing?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Compliance & Documentation · dexify-compliance ───────────────────────────
  {
    feature_id:   "swms_auto_generation",
    feature_tag:  "dexify-compliance",
    feature_name: "AI generates Australian SWMS document automatically from job details",
    prompt: `Australian tradespeople are required to produce a Safe Work Method Statement (SWMS) before starting high-risk construction work. Can [BRAND] automatically generate a SWMS for a job — from either a spoken description or existing job details in the system — without the tradie writing it manually? This is specifically the Australian SWMS compliance document, not a generic risk assessment.
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "voice_to_site_report",
    feature_tag:  "dexify-compliance",
    feature_name: "Voice description on site to structured compliance or site report",
    prompt: `On site, I want to describe a job, hazard, or inspection outcome by speaking into my phone and have [BRAND] produce the required documentation automatically — site reports, safety observations, or completion sign-offs — without me writing anything. Does [BRAND] convert voice input directly into structured, shareable site documentation for trade work?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Inbound & Client Communication · dexify-client-comms ─────────────────────
  {
    feature_id:   "ai_inbound_enquiry_handling",
    feature_tag:  "dexify-client-comms",
    feature_name: "AI agent responds to and qualifies new client enquiries automatically",
    prompt: `When a potential client contacts my trade business — by phone, message, or web form — I want [BRAND] to handle the initial enquiry automatically: respond immediately, capture the job details, and either book a time or route the enquiry to me with a summary, without me needing to be available or respond manually in real time. Does [BRAND] provide an AI agent that handles inbound client enquiries for a trade business end-to-end, not just a chatbot widget?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "quote_followup_automation",
    feature_tag:  "dexify-client-comms",
    feature_name: "Automatic follow-up sent on behalf of tradie after quote is sent",
    prompt: `After I send a quote to a client, I often lose the job because I'm too busy to follow up manually. Does [BRAND] automatically send a follow-up message to the client on my behalf — after a set number of days — to check if they want to proceed, without me needing to remember or initiate it? The agent should handle the follow-up communication itself, not just remind me to do it.
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function buildDexifyPrompt(feature: DexifyFeature, brandName: string): string {
  const grounding  = DEXIFY_GROUNDING_INSTRUCTION.replaceAll("[BRAND]", brandName);
  const outputSpec = DEXIFY_JSON_OUTPUT_SPEC.replaceAll("[BRAND]", brandName);
  return feature.prompt
    .replaceAll("[BRAND]", brandName)
    .replace("[GROUNDING INSTRUCTION]", grounding)
    .replace("[JSON OUTPUT]", outputSpec);
}

// ── Scoring (identical logic to features.ts computeScore) ─────────────────────

export type HasCapability = "yes" | "partial" | "no" | "not_documented";
export type Confidence    = "high" | "medium" | "low";

const CAP_RANK: Record<HasCapability, number> = {
  yes: 3, partial: 2, no: 1, not_documented: 0,
};

const HEDGING_PHRASES = [
  "may ", "might ", "likely ", "probably ",
  "similar tools", "typically ", "I believe", "I think", "could ",
];

function downgradeConfidence(conf: Confidence): Confidence {
  if (conf === "high")   return "medium";
  if (conf === "medium") return "low";
  return "low";
}

function getLowerCapability(a: HasCapability, b: HasCapability): HasCapability {
  return CAP_RANK[a] <= CAP_RANK[b] ? a : b;
}

interface ModelConsensus {
  capability:  HasCapability;
  confidence:  Confidence;
  agreeing:    number;
  total:       number;
  hasGrounded: boolean;
}

export interface DexifyScoreResult {
  score:              number | null;
  score_band:         string;
  runs_agreeing:      number | null;
  runs_total:         number;
  flagged_for_review: boolean;
  flag_reason:        string | null;
  notes:              string | null;
  grounded_source:    boolean;
}

interface FeatureRunRow {
  model:          string;
  has_capability: string | null;
  evidence:       string | null;
  confidence:     string | null;
  parse_error:    boolean;
  grounded:       boolean;
}

function modelConsensus(rows: FeatureRunRow[]): ModelConsensus {
  const valid = rows.filter((r) => !r.parse_error && r.has_capability !== null);
  if (valid.length === 0) {
    return { capability: "not_documented", confidence: "low", agreeing: 0, total: 0, hasGrounded: false };
  }

  const capCounts: Partial<Record<HasCapability, number>> = {};
  for (const r of valid) {
    const cap = r.has_capability as HasCapability;
    capCounts[cap] = (capCounts[cap] ?? 0) + 1;
  }

  const majority     = Math.ceil(valid.length / 2);
  const leadEntry    = Object.entries(capCounts).sort((a, b) => b[1] - a[1])[0];
  const leadCap      = leadEntry[0] as HasCapability;
  const leadCount    = leadEntry[1];
  const hasGrounded  = valid.some((r) => r.grounded);
  const hasHedging   = valid.some((r) => HEDGING_PHRASES.some((p) => r.evidence?.toLowerCase().includes(p)));

  let conf: Confidence = leadCount >= Math.ceil(valid.length * 0.75) ? "high"
    : leadCount >= majority ? "medium"
    : "low";

  const avgConfValid = valid.filter((r) => r.confidence !== null);
  if (avgConfValid.length > 0) {
    const confRank = { high: 2, medium: 1, low: 0 };
    const avg      = avgConfValid.reduce((s, r) => s + (confRank[r.confidence as Confidence] ?? 0), 0) / avgConfValid.length;
    const modelConf: Confidence = avg >= 1.5 ? "high" : avg >= 0.8 ? "medium" : "low";
    conf = confRank[conf] <= confRank[modelConf] ? conf : modelConf;
  }

  if (hasHedging) conf = downgradeConfidence(conf);

  return { capability: leadCap, confidence: conf, agreeing: leadCount, total: valid.length, hasGrounded };
}

export function computeDexifyScore(rows: FeatureRunRow[]): DexifyScoreResult {
  const standardRows = rows.filter((r) => !r.grounded);
  const groundedRows = rows.filter((r) => r.grounded);

  const std = modelConsensus(standardRows);
  const gnd = groundedRows.length > 0 ? modelConsensus(groundedRows) : null;

  let cap  = std.capability;
  let conf = std.confidence;
  let grounded_source = false;

  if (gnd && gnd.capability !== "not_documented") {
    if (CAP_RANK[gnd.capability] > CAP_RANK[cap]) {
      cap  = gnd.capability;
      conf = gnd.confidence;
      grounded_source = true;
    } else if (gnd.capability === cap && gnd.confidence === "high") {
      conf = "high";
      grounded_source = true;
    }
  }

  const scoreMap: Record<HasCapability, Record<Confidence, number>> = {
    yes:            { high: 95, medium: 80, low: 65 },
    partial:        { high: 60, medium: 45, low: 30 },
    no:             { high: 5,  medium: 10, low: 15 },
    not_documented: { high: 0,  medium: 0,  low: 0  },
  };

  const score     = cap === "not_documented" ? null : scoreMap[cap][conf];
  const score_band =
    score === null  ? "not_documented"
    : score >= 80   ? "high"
    : score >= 40   ? "medium"
    : "low";

  const disagreement    = std.total > 0 && std.agreeing < Math.ceil(std.total / 2);
  const allParseErrors  = rows.every((r) => r.parse_error);
  const lowConfHighCap  = cap === "yes" && conf === "low" && !grounded_source;

  const flagged    = disagreement || allParseErrors || lowConfHighCap;
  const flag_reason =
    allParseErrors    ? "all_parse_errors"
    : disagreement    ? "model_disagreement"
    : lowConfHighCap  ? "low_confidence_yes"
    : null;

  return {
    score,
    score_band,
    runs_agreeing:      std.agreeing,
    runs_total:         std.total + (gnd?.total ?? 0),
    flagged_for_review: flagged,
    flag_reason,
    notes:              null,
    grounded_source,
  };
}
