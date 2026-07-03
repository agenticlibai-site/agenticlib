// Feature config, prompt templates, and scoring logic for the feature pipeline.

// ── Grounding & output templates ───────────────────────────────────────────────

export const GROUNDING_INSTRUCTION =
  "Only include information specific to [BRAND]'s documented product. " +
  "Do not infer capabilities from what similar tools typically do. " +
  "If you are uncertain whether [BRAND] specifically has this capability, " +
  "set has_capability to not_documented rather than guessing.";

export const JSON_OUTPUT_SPEC =
  '{\n' +
  '  "has_capability": "yes|no|partial|not_documented",\n' +
  '  "evidence": "specific description of what [BRAND] actually does — quote product features or documented workflows where possible",\n' +
  '  "limitations": "any caveats, restrictions, or gaps",\n' +
  '  "confidence": "high|medium|low"\n' +
  '}';

export const FEATURE_SYSTEM_PROMPT =
  "You are a product analyst evaluating marketing AI tools. " +
  "Return ONLY valid JSON matching the exact schema provided. " +
  "No markdown, no explanation — just the JSON object.";

// ── Brand cluster lists ────────────────────────────────────────────────────────
// Use brand_name (DB key), not display_name. Revealbot = DB key; shows as "Birch (Revealbot)" in UI.

const ADS_BRANDS     = ["Albert", "Optmyzr", "Acquisio", "Adext", "Pattern89", "Revealbot", "Madgicx", "Smartly.io", "RocketFuel"];
const CONTENT_BRANDS = ["Copy.ai", "Writesonic", "Anyword", "Brand.ai", "Phrasee", "Persado"];
const LEADGEN_BRANDS = ["Lemlist", "Instantly", "Conversica", "ManyChat", "Drift"];
const ROI_BRANDS     = ["Drift", "Conversica", "Braze", "Phrasee", "Persado", "Seventh Sense", "ManyChat"];

// ── Feature definitions ────────────────────────────────────────────────────────

export interface Feature {
  feature_id:   string;
  feature_tag:  string;
  feature_name: string;
  applies_to:   string[] | "all";
  prompt:       string; // [BRAND], [GROUNDING INSTRUCTION], [JSON OUTPUT] are substituted at runtime
}

export const FEATURES: Feature[] = [
  // ── Ads (2 features × 9 brands = 18 brand+feature pairs) ─────────────────────
  {
    feature_id:   "ads_autonomous_bidding",
    feature_tag:  "ads",
    feature_name: "Autonomous bid optimisation",
    applies_to:   ADS_BRANDS,
    prompt: `I'm evaluating [BRAND] for managing our paid ad campaigns and want to know if it handles bid adjustments automatically. Does [BRAND] autonomously optimise bids across ad campaigns without requiring manual input for each adjustment — for example, automatically raising or lowering bids based on conversion signals or ROAS targets?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "ads_cross_platform",
    feature_tag:  "ads",
    feature_name: "Cross-platform campaign management",
    applies_to:   ADS_BRANDS,
    prompt: `I run ads on Meta, Google, and TikTok and I'm looking for one tool to manage all three. Does [BRAND] support managing paid campaigns across Meta, Google, and TikTok from a single interface — not just reporting, but actual campaign management and optimisation?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Content (2 features × 6 brands = 12 brand+feature pairs) ─────────────────
  {
    feature_id:   "content_brand_voice",
    feature_tag:  "content",
    feature_name: "Brand voice enforcement",
    applies_to:   CONTENT_BRANDS,
    prompt: `We have strict brand guidelines and I need a tool that keeps every piece of content on-voice. Does [BRAND] enforce consistent brand voice across content outputs — for example, through a trained style profile, tone settings, or a brand voice layer that applies automatically to all generated content?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "content_predictive_performance",
    feature_tag:  "content",
    feature_name: "Predictive copy performance scoring",
    applies_to:   CONTENT_BRANDS,
    prompt: `Before I publish a piece of copy I want to know which variant is most likely to convert — not after the fact, but before I spend budget on it. Does [BRAND] score or predict the performance of marketing copy before it goes live — for example, predicting click-through rate, engagement, or conversion likelihood across variants so I can choose the strongest one before publishing?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Lead-gen (2 features × 5 brands = 10 brand+feature pairs) ────────────────
  {
    feature_id:   "leadgen_outreach_sequencing",
    feature_tag:  "lead-gen",
    feature_name: "Automated outreach sequencing",
    applies_to:   LEADGEN_BRANDS,
    prompt: `I want to automate my outreach so leads move through a sequence — first email, follow-up, LinkedIn touch — without me manually triggering each step. Does [BRAND] automate multi-step outreach sequences end-to-end, where the next step triggers automatically based on the previous step's outcome?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "leadgen_qualification",
    feature_tag:  "lead-gen",
    feature_name: "Automated lead qualification",
    applies_to:   LEADGEN_BRANDS,
    prompt: `I get a lot of inbound leads and need a way to automatically filter and score them before they reach my sales team. Does [BRAND] automatically qualify or score leads based on their behaviour, profile data, or engagement — reducing the manual triage work before leads reach a human?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Lifecycle & Retention Automation (2 features × 7 brands = 14 brand+feature pairs) ─────────────
  // Drift and Conversica intentionally appear in both lead-gen and lifecycle clusters.
  {
    feature_id:   "roi_attribution",
    feature_tag:  "lifecycle",
    feature_name: "Lifecycle performance tracking",
    applies_to:   ROI_BRANDS,
    prompt: `I run lifecycle campaigns across email, chat, and messaging and I need to know what's actually moving the needle. Does [BRAND] track performance across lifecycle campaigns — for example, showing which messages, sequences, or channels drove opens, replies, conversions, or retention outcomes?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "roi_self_optimising",
    feature_tag:  "lifecycle",
    feature_name: "Autonomous message and journey optimisation",
    applies_to:   ROI_BRANDS,
    prompt: `I want my lifecycle campaigns to improve on their own — adjusting send times, message variants, or channel sequencing based on how contacts are actually responding. Does [BRAND] automatically optimise messaging or journey steps based on live engagement data, without me having to manually make each adjustment?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Technical (3 features × all 22 brands = 66 brand+feature pairs) ──────────
  {
    feature_id:   "tech_instruction_following",
    feature_tag:  "technical",
    feature_name: "Instruction following and constraint adherence",
    applies_to:   "all",
    prompt: `I have specific constraints every campaign must follow — budget caps, audience exclusions, content restrictions. Does [BRAND] reliably enforce user-defined constraints throughout a campaign — for example, respecting a budget ceiling or excluding specific audience segments without needing to be reminded each session?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "tech_integrations",
    feature_tag:  "technical",
    feature_name: "Native integrations",
    applies_to:   "all",
    prompt: `I need whatever tool I choose to connect with my existing stack — CRM, ad platforms, email tools. What CRM, ad platform, or marketing stack integrations does [BRAND] natively support — built-in, without needing middleware like Zapier?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "tech_multistep_reasoning",
    feature_tag:  "technical",
    feature_name: "Multi-step reasoning and workflow chaining",
    applies_to:   "all",
    prompt: `I want an AI that can handle a full workflow, not just a single task. Does [BRAND] chain multiple decisions autonomously — for example: analyse campaign performance, identify underperforming segments, adjust targeting or creative, then report on the change — without requiring human sign-off at each step?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Responsible AI (2 features × all 22 brands = 44 brand+feature pairs) ─────
  {
    feature_id:   "rai_data_privacy",
    feature_tag:  "responsible-ai",
    feature_name: "Data privacy and compliance posture",
    applies_to:   "all",
    prompt: `Before we bring any AI tool into our marketing stack our legal team will ask about data handling. Has [BRAND] published documentation on how it handles campaign data, customer data, or user data? Are there any GDPR, SOC 2, or other compliance certifications or commitments documented publicly?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "rai_explainability",
    feature_tag:  "responsible-ai",
    feature_name: "Decision transparency and explainability",
    applies_to:   "all",
    prompt: `When [BRAND] makes a recommendation or takes an autonomous action, does it explain why — for example, showing which signal triggered a bid change or why a specific audience segment was prioritised? Or does it only surface the output without the reasoning?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Cost (2 features × all 22 brands = 44 brand+feature pairs) ───────────────
  {
    feature_id:   "cost_free_tier",
    feature_tag:  "cost",
    feature_name: "Free tier accessibility",
    applies_to:   "all",
    prompt: `I want to try [BRAND] before committing budget. Is there a free tier or trial available — and if so, what can I actually do with it without paying? Not a sales demo, but genuine self-serve access to the product.
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "cost_pricing_transparency",
    feature_tag:  "cost",
    feature_name: "Pricing transparency",
    applies_to:   "all",
    prompt: `I need to build a business case for adopting [BRAND]. Is the pricing publicly documented — and what does the entry-level paid tier actually cost and include? If pricing requires a sales call to obtain, note that.
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getFeaturesForBrand(brandName: string): Feature[] {
  return FEATURES.filter(
    (f) => f.applies_to === "all" || (Array.isArray(f.applies_to) && f.applies_to.includes(brandName)),
  );
}

export function buildPrompt(feature: Feature, brandName: string): string {
  const grounding = GROUNDING_INSTRUCTION.replaceAll("[BRAND]", brandName);
  const outputSpec = JSON_OUTPUT_SPEC.replaceAll("[BRAND]", brandName);
  return feature.prompt
    .replaceAll("[BRAND]", brandName)
    .replace("[GROUNDING INSTRUCTION]", grounding)
    .replace("[JSON OUTPUT]", outputSpec);
}

// ── Scoring ────────────────────────────────────────────────────────────────────

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
  cap:          HasCapability | null;
  confidence:   Confidence | null;
  evidence:     string | null;
  runsAgreeing: number;
  flagged:      boolean;
  flagReason:   string | null;
}

function getModelConsensus(rows: FeatureRunRow[]): ModelConsensus {
  if (rows.length === 0) {
    return { cap: null, confidence: null, evidence: null, runsAgreeing: 0, flagged: false, flagReason: null };
  }

  const valid = rows.filter((r) => !r.parse_error && r.has_capability !== null);
  if (valid.length === 0) {
    return { cap: null, confidence: null, evidence: null, runsAgreeing: 0, flagged: true, flagReason: "all runs failed to parse" };
  }

  const caps = valid.map((r) => r.has_capability as HasCapability);
  const counts: Partial<Record<HasCapability, number>> = {};
  for (const c of caps) counts[c] = (counts[c] ?? 0) + 1;
  const sorted = (Object.entries(counts) as [HasCapability, number][]).sort((a, b) => b[1] - a[1]);
  const [topCap, topCount] = sorted[0];

  if (topCount < 2) {
    // All 3 valid runs returned different values
    return { cap: null, confidence: null, evidence: null, runsAgreeing: 0, flagged: true, flagReason: "inconsistent across 3 runs" };
  }

  // Majority exists — pick the best matching run for evidence/confidence
  const matchingRun = valid.find((r) => r.has_capability === topCap);
  const rawConf = (matchingRun?.confidence ?? "low") as Confidence;
  const evidence = matchingRun?.evidence ?? null;

  // Red flag: hedging language in evidence downgrades confidence but doesn't set flagged_for_review
  const lower = evidence?.toLowerCase() ?? "";
  const hasHedge = HEDGING_PHRASES.some((p) => lower.includes(p.toLowerCase()));
  const finalConf = hasHedge ? downgradeConfidence(rawConf) : rawConf;
  const flagReason = hasHedge ? "evidence contains hedging language" : null;

  return { cap: topCap, confidence: finalConf, evidence, runsAgreeing: topCount, flagged: false, flagReason };
}

export function deriveScore(cap: HasCapability, confidence: Confidence, evidenceLength: number): number | null {
  if (cap === "not_documented") return null;
  if (cap === "no")             return 10;
  if (cap === "yes") {
    if (confidence === "high")   return Math.min(100, 80 + (evidenceLength > 200 ? 10 : 0));
    if (confidence === "medium") return 60;
    return 50;
  }
  // partial
  if (confidence === "high")   return 45;
  if (confidence === "medium") return 35;
  return 25;
}

export function deriveBand(score: number | null): string {
  if (score === null) return "undocumented";
  if (score >= 75)    return "strong";
  if (score >= 50)    return "present";
  if (score >= 25)    return "partial";
  return "weak";
}

// Input shape — matches what getFeatureResponsesForScoring() returns
export interface FeatureRunRow {
  has_capability: string | null;
  evidence:       string | null;
  confidence:     string | null;
  parse_error:    boolean;
  model:          string;
}

export interface ScoreResult {
  score:              number | null;
  score_band:         string;
  runs_agreeing:      number | null;
  runs_total:         number;
  flagged_for_review: boolean;
  flag_reason:        string | null;
  notes:              string | null;
}

export function computeScore(rows: FeatureRunRow[]): ScoreResult {
  const claudeRows = rows.filter((r) => r.model.startsWith("claude"));
  const gptRows    = rows.filter((r) => r.model.startsWith("gpt"));

  const claude = getModelConsensus(claudeRows);
  const gpt    = getModelConsensus(gptRows);

  // Either model internally inconsistent → flag for review, no score
  if (claude.flagged || gpt.flagged) {
    const reasons = [claude.flagged ? claude.flagReason : null, gpt.flagged ? gpt.flagReason : null]
      .filter(Boolean)
      .join("; ");
    return {
      score: null, score_band: "undocumented",
      runs_agreeing: null, runs_total: rows.length,
      flagged_for_review: true, flag_reason: reasons, notes: null,
    };
  }

  // No usable data at all
  if (!claude.cap && !gpt.cap) {
    return {
      score: null, score_band: "undocumented",
      runs_agreeing: 0, runs_total: rows.length,
      flagged_for_review: false, flag_reason: null,
      notes: "no valid responses from either model",
    };
  }

  // Cross-model check
  let finalCap      = (claude.cap ?? gpt.cap) as HasCapability;
  let finalConf     = (claude.confidence ?? gpt.confidence) as Confidence;
  let finalEvidence = claude.evidence ?? gpt.evidence;
  let crossFlag     = false;
  let crossReason: string | null = null;

  if (claude.cap && gpt.cap && claude.cap !== gpt.cap) {
    crossFlag   = true;
    crossReason = "model disagreement";
    finalCap    = getLowerCapability(claude.cap, gpt.cap);
    const winner = claude.cap === finalCap ? claude : gpt;
    finalConf     = winner.confidence ?? "low";
    finalEvidence = winner.evidence;
  }

  // Collect hedge flag reasons (don't set flagged_for_review, but record in flag_reason)
  const hedgeReasons = [...new Set([claude.flagReason, gpt.flagReason].filter(Boolean))];
  const allReasons = [...hedgeReasons, crossReason].filter(Boolean).join("; ") || null;

  if (finalCap === "not_documented") {
    return {
      score: null, score_band: "undocumented",
      runs_agreeing: (claude.runsAgreeing ?? 0) + (gpt.runsAgreeing ?? 0),
      runs_total: rows.length,
      flagged_for_review: crossFlag,
      flag_reason: allReasons,
      notes: "insufficient public data — not scored",
    };
  }

  const evidenceLen = finalEvidence?.length ?? 0;
  const score       = deriveScore(finalCap, finalConf ?? "low", evidenceLen);
  const score_band  = deriveBand(score);

  return {
    score,
    score_band,
    runs_agreeing: (claude.runsAgreeing ?? 0) + (gpt.runsAgreeing ?? 0),
    runs_total:    rows.length,
    flagged_for_review: crossFlag,
    flag_reason:   allReasons,
    notes:         null,
  };
}
