// Sales feature config, prompt templates, and scoring logic for the sales feature pipeline.
// Architecture mirrors lib/brand-visibility/features.ts exactly.

// ── Grounding & output templates ───────────────────────────────────────────────

export const GROUNDING_INSTRUCTION =
  "Only include information specific to [BRAND]'s documented product. " +
  "Do not infer capabilities from what similar tools typically do. " +
  "If you are uncertain whether [BRAND] specifically has this capability, " +
  "set has_capability to not_documented rather than guessing.";

export const JSON_OUTPUT_SPEC =
  '{\n' +
  '  "has_capability": "yes|no|partial|not_documented",\n' +
  '  "evidence": "if yes/partial: 1-2 sentences on what [BRAND] specifically does for this capability and what makes its approach useful — describe the mechanism and practical outcome for a sales team, not just that the feature exists. If no/not_documented: what is absent or unclear.",\n' +
  '  "limitations": "any caveats or gaps",\n' +
  '  "confidence": "high|medium|low",\n' +
  '  "terminology_tags": ["0-3 short named terms (1-4 words each). Return ONLY terms that are a named product feature, branded mechanism, or product-specific metric mentioned in the evidence. Return [] when evidence uses only generic language common to any similar tool — most responses should have 0-2 tags and many should have []. Calibration: GOOD → \\"Deal Intelligence\\" (named feature), \\"Conversation Intelligence\\" (branded), \\"Revenue Forecast\\" (named). BAD → [] → \\"CRM integration\\" (generic), \\"call transcription\\" (generic), \\"AI-powered coaching\\" (common). Ask: would this exact phrase appear in a competitor\'s evidence for the same feature? If yes, return []."]\n' +
  '}';

export const FEATURE_SYSTEM_PROMPT =
  "You are a competitive intelligence analyst writing capability profiles of sales AI tools. " +
  "For each feature, explain the brand's specific implementation and the practical value it delivers — not generic feature existence. " +
  "Return ONLY valid JSON matching the exact schema. No markdown, no explanation — just the JSON object.";

// Verified facts injected into prompts where models have demonstrated stale or hallucinated data.
// Keyed by brand name → feature_id → correction string.
// Add an entry whenever a model repeatedly returns a known-wrong value.
const VERIFIED_FACTS: Record<string, Partial<Record<string, string>>> = {
  "Reply.io": {
    cost_pricing_transparency:
      "VERIFIED PRICING (as of July 2026): Starter $49/user/month (email-only), " +
      "Professional $89/user/month (adds LinkedIn, calling, SMS), " +
      "Ultimate $139/user/month (full AI SDR). " +
      "Add-ons such as LinkedIn automation ($69) and cloud calling ($29) are not included in the base price. " +
      "Do NOT cite $70 — that figure is outdated or incorrect.",
  },
};

// ── Brand cluster lists ────────────────────────────────────────────────────────

const CALL_BRANDS       = ["Chorus", "Gong", "Revenue.io", "Avoma"];
const CRM_BRANDS        = ["Tact.ai"];
const PIPELINE_BRANDS   = ["Backstory.ai", "Clari", "6sense"];
const OUTREACH_BRANDS   = ["Outreach", "Salesloft", "Conversica", "Apollo", "Lemlist", "Clay", "Reply.io", "Seamless.ai"];
const ENABLEMENT_BRANDS = ["Drift", "Mindtickle", "Highspot"];

// ── Feature definitions ────────────────────────────────────────────────────────

export interface Feature {
  feature_id:   string;
  feature_tag:  string;
  feature_name: string;
  feature_desc: string; // 1-2 sentence plain-English definition shown in the UI below the heading
  applies_to:   string[] | "all";
  prompt:       string; // [BRAND], [GROUNDING INSTRUCTION], [JSON OUTPUT] substituted at runtime
}

export const FEATURES: Feature[] = [

  // ── Sales-Call (4 features × 4 brands = 16 brand+feature pairs) ──────────────
  // Rewritten 2026-07-10 (day-0): split 2 broad features into 4 narrower ones
  // to break score ceiling (75% of brands were hitting 90 on prior prompts).
  // Distribution check scheduled for 2026-07-13 (stddev, ceiling %).
  {
    feature_id:   "call_transcription_timestamps",
    feature_tag:  "sales-call",
    feature_name: "Speaker-labeled transcription with searchable timestamps",
    feature_desc: "Produces a word-for-word, speaker-labeled transcript of every call with searchable timestamps — so reps and managers can jump to any moment without replaying the full recording.",
    applies_to:   CALL_BRANDS,
    prompt: `My reps sometimes dispute what was said on a call — or I need to find the exact moment a prospect raised a concern without replaying the whole recording. Does [BRAND] produce a speaker-labeled, timestamped transcript of every call automatically — identifying who said what and when, with the ability to search for a keyword or topic and jump directly to that moment in the recording?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "call_talk_time_analytics",
    feature_tag:  "sales-call",
    feature_name: "Talk-time ratio and communication pattern metrics",
    feature_desc: "Measures how much each participant talked on a call — surfacing talk-time ratios, filler word counts, monologue length, and question rates per rep and trackable over time.",
    applies_to:   CALL_BRANDS,
    prompt: `I want to know if my reps are dominating calls or actually listening. Does [BRAND] measure and report specific per-call communication metrics — such as talk-time ratio between rep and prospect, filler word frequency, longest uninterrupted monologue, or question rate — broken down per rep and trackable over time?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "call_coaching_scorecard",
    feature_tag:  "sales-call",
    feature_name: "Automated per-rep coaching scorecard per call",
    feature_desc: "Automatically generates written coaching feedback for each rep after every call — covering discovery, objection handling, and next-steps clarity — without a manager listening to recordings.",
    applies_to:   CALL_BRANDS,
    prompt: `I want every rep to receive written coaching feedback after each call without me having to listen to recordings. Does [BRAND] automatically generate a per-rep coaching scorecard after each call — written feedback on specific observed behaviors such as discovery depth, objection handling, and next steps clarity — that a rep can review and act on without manager input?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "call_competitor_objection_detection",
    feature_tag:  "sales-call",
    feature_name: "Automatic competitor mention and objection flagging",
    feature_desc: "Detects and categorises competitor mentions and objection types during or after a call — without rep tagging — so teams can see which rivals come up most and which objections block deals.",
    applies_to:   CALL_BRANDS,
    prompt: `My reps often forget to log when a competitor came up or a prospect raised a pricing objection. Does [BRAND] automatically detect and categorise competitor mentions and objection types during or after a call — without a rep having to manually tag anything — so I can see across all calls which competitors come up most and what objections are blocking deals?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Sales-CRM (2 features × 2 brands = 4 brand+feature pairs) ────────────────
  {
    feature_id:   "crm_auto_update",
    feature_tag:  "sales-crm",
    feature_name: "Automatic CRM data capture post-call",
    feature_desc: "Automatically captures call outcomes, next steps, and contact updates and writes them back to the CRM — eliminating post-call data entry for reps.",
    applies_to:   CRM_BRANDS,
    prompt: `My reps spend too much time updating Salesforce after every call. Does [BRAND] automatically capture what happened in a sales call and update CRM fields — contacts, next steps, deal stage, notes — without the rep having to do it manually?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "crm_data_accuracy",
    feature_tag:  "sales-crm",
    feature_name: "CRM data accuracy and completeness enforcement",
    feature_desc: "Validates CRM data completeness by flagging missing fields, auto-populating from calls and emails, and alerting managers when deal records fall below the team's data standards.",
    applies_to:   CRM_BRANDS,
    prompt: `Our CRM data is always incomplete because reps skip fields. Does [BRAND] enforce CRM completeness — for example flagging missing fields, auto-populating data from emails and calls, or alerting managers when deal records are incomplete?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Sales-Pipeline (2 features × 2 brands = 4 brand+feature pairs) ───────────
  {
    feature_id:   "deal_risk_detection",
    feature_tag:  "sales-pipeline",
    feature_name: "At-risk deal detection and early warning",
    feature_desc: "Identifies deals going cold before they fall through — flagging when a champion goes silent, engagement drops, or a deal stalls at the same stage too long.",
    applies_to:   PIPELINE_BRANDS,
    prompt: `I need to know which deals are going cold before they fall through. Does [BRAND] automatically identify at-risk deals — for example flagging when a champion goes silent, engagement drops, or a deal has been stuck at the same stage too long — without a manager having to manually review every opportunity?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "pipeline_forecasting",
    feature_tag:  "sales-pipeline",
    feature_name: "AI pipeline forecasting and revenue prediction",
    feature_desc: "Uses AI to predict what will actually close — going beyond rep-submitted forecasts and stage probabilities to give a signal-based view of expected revenue.",
    applies_to:   PIPELINE_BRANDS,
    prompt: `Our manual forecasting is always wrong. Does [BRAND] use AI to forecast pipeline and predict revenue outcomes — going beyond rep-submitted numbers to give a data-driven view of what will actually close this quarter?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Sales-Outreach (2 features × 8 brands = 16 brand+feature pairs) ──────────
  {
    feature_id:   "outreach_sequencing",
    feature_tag:  "sales-outreach",
    feature_name: "Automated multi-step outreach sequencing",
    feature_desc: "Automates multi-step outreach across email, phone, and other channels — managing timing, follow-ups, and task reminders so reps don't have to manually trigger each step.",
    applies_to:   OUTREACH_BRANDS,
    prompt: `I want to automate my outreach so prospects move through a sequence — first email, follow-up, LinkedIn touch — without my reps manually triggering each step. Does [BRAND] automate multi-step outreach sequences end-to-end, where the next step triggers automatically based on the previous step's outcome?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "ai_personalisation",
    feature_tag:  "sales-outreach",
    feature_name: "AI-generated personalised outreach at scale",
    feature_desc: "Generates personalised outreach messages for individual prospects at scale — referencing their company, role, or recent activity — without reps writing each message from scratch.",
    applies_to:   OUTREACH_BRANDS,
    prompt: `I need my outreach to feel personal even at high volume. Does [BRAND] use AI to personalise outreach messages at scale — for example referencing a prospect's recent activity, company news, or role context automatically without a rep writing each message manually?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Sales-Enablement (2 features × 3 brands = 6 brand+feature pairs) ─────────
  {
    feature_id:   "followup_drafting",
    feature_tag:  "sales-enablement",
    feature_name: "Automated follow-up email drafting",
    feature_desc: "Automatically drafts a personalised follow-up email after each call — pulling commitments and next steps from the conversation so reps aren't starting from a blank page.",
    applies_to:   ENABLEMENT_BRANDS,
    prompt: `After every sales call my reps spend 20 minutes writing follow-up emails. Does [BRAND] automatically draft follow-up emails based on what was discussed in the call — capturing commitments made, next steps agreed, and personalising the message to the prospect without the rep starting from scratch?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "sales_content_delivery",
    feature_tag:  "sales-enablement",
    feature_name: "Real-time sales content and battlecard delivery",
    feature_desc: "Surfaces relevant battlecards, case studies, or talk tracks automatically during or before a call — triggered by the prospect, deal stage, or competitor mentioned.",
    applies_to:   ENABLEMENT_BRANDS,
    prompt: `I want my reps to have the right content at the right moment — not searching for it during a call. Does [BRAND] surface relevant battlecards, case studies, or talk tracks automatically during or before a sales conversation based on the prospect, deal stage, or competitor mentioned?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Technical (3 features × all 20 brands = 60 brand+feature pairs) ──────────
  {
    feature_id:   "tech_crm_integration",
    feature_tag:  "technical",
    feature_name: "Native CRM integration",
    feature_desc: "Checks whether the tool connects directly to Salesforce or HubSpot via a built-in native integration — without Zapier or a custom API build.",
    applies_to:   "all",
    prompt: `I need whatever tool I choose to connect directly with Salesforce or HubSpot without middleware. Does [BRAND] natively integrate with Salesforce and HubSpot — built-in, without needing Zapier or custom API work?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "tech_workflow_automation",
    feature_tag:  "technical",
    feature_name: "Multi-step workflow automation",
    feature_desc: "Evaluates whether the tool can chain multiple sales actions end-to-end — analyse a call, update the CRM, draft the follow-up, flag the risk — without human intervention at each step.",
    applies_to:   "all",
    prompt: `I want a tool that chains actions automatically — analyse a call, update the CRM, draft the follow-up, flag the risk — without a rep touching anything between steps. Does [BRAND] automate multi-step sales workflows end-to-end without human intervention at each step?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "tech_instruction_following",
    feature_tag:  "technical",
    feature_name: "Constraint and rule enforcement",
    feature_desc: "Assesses whether user-defined rules — contact frequency limits, mandatory disclaimers, industry exclusions — are enforced automatically across all outreach without reps needing to remember them.",
    applies_to:   "all",
    prompt: `I have rules every rep must follow — never contact a prospect more than twice a week, always include legal disclaimers, exclude certain industries. Does [BRAND] enforce user-defined rules and constraints automatically across all outreach and workflows without reps having to remember them each time?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Responsible AI (2 features × all 20 brands = 40 brand+feature pairs) ─────
  {
    feature_id:   "rai_data_privacy",
    feature_tag:  "responsible-ai",
    feature_name: "Data privacy and compliance posture",
    feature_desc: "Examines how the vendor handles prospect data, call recordings, and CRM data — including any SOC 2, GDPR, or equivalent compliance certifications documented publicly.",
    applies_to:   "all",
    prompt: `Before our legal team approves any new sales tool they ask about data handling. Has [BRAND] published documentation on how it handles prospect data, call recordings, and CRM data? Are there any SOC 2, GDPR, or other compliance certifications documented publicly?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "rai_explainability",
    feature_tag:  "responsible-ai",
    feature_name: "Decision transparency and explainability",
    feature_desc: "Looks at whether AI outputs — risk flags, coaching scores, deal forecasts — come with visible reasoning a rep or manager can understand, rather than just surfacing a number.",
    applies_to:   "all",
    prompt: `When [BRAND] flags a deal as at-risk, recommends an action, or scores a rep's call — does it explain why? For example showing which signals triggered the risk flag or which call behaviours drove the score. Or does it only surface the output without the reasoning?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Cost (2 features × all 20 brands = 40 brand+feature pairs) ───────────────
  {
    feature_id:   "cost_free_trial",
    feature_tag:  "cost",
    feature_name: "Free trial or self-serve access",
    feature_desc: "Assesses whether there is a self-serve trial offering meaningful product access without a sales call or contract signature required upfront.",
    applies_to:   "all",
    prompt: `I want to try [BRAND] before committing budget. Is there a free trial or self-serve access available — where I can actually use the product without a sales call or demo first?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "cost_pricing_transparency",
    feature_tag:  "cost",
    feature_name: "Pricing transparency",
    feature_desc: "Looks at whether pricing is publicly available — what the entry-level tier costs and what it includes — without requiring a sales conversation to get a number.",
    applies_to:   "all",
    prompt: `I need to build a business case for adopting [BRAND]. Is the pricing publicly documented — what does the entry-level paid tier cost and what does it include? If pricing requires a sales call to obtain, note that.
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
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
  const verifiedFact = VERIFIED_FACTS[brandName]?.[feature.feature_id];
  const groundingBase = GROUNDING_INSTRUCTION.replaceAll("[BRAND]", brandName);
  const grounding = verifiedFact
    ? groundingBase + "\n\nFACT CHECK — use these verified figures, do not override them:\n" + verifiedFact
    : groundingBase;
  const outputSpec = JSON_OUTPUT_SPEC.replaceAll("[BRAND]", brandName);
  return feature.prompt
    .replaceAll("[BRAND]", brandName)
    .replace("[GROUNDING INSTRUCTION]", grounding)
    .replace("[JSON OUTPUT]", outputSpec);
}

// ── Scoring (identical logic to features.ts) ───────────────────────────────────

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

  // Grounded rows count 2× in the majority vote.
  const counts: Partial<Record<HasCapability, number>> = {};
  let totalWeight = 0;
  for (const r of valid) {
    const w = r.grounded ? 2 : 1;
    const cap = r.has_capability as HasCapability;
    counts[cap] = (counts[cap] ?? 0) + w;
    totalWeight += w;
  }
  const sorted = (Object.entries(counts) as [HasCapability, number][]).sort((a, b) => b[1] - a[1]);
  const [topCap, topWeight] = sorted[0];

  // Require strict majority (>50% of weighted votes).
  if (topWeight * 2 <= totalWeight) {
    return { cap: null, confidence: null, evidence: null, runsAgreeing: 0, flagged: true, flagReason: "inconsistent across runs" };
  }

  // Prefer the grounded run's evidence/confidence when available.
  const groundedMatch = valid.find((r) => r.grounded && r.has_capability === topCap);
  const matchingRun   = groundedMatch ?? valid.find((r) => r.has_capability === topCap);
  const rawConf       = (matchingRun?.confidence ?? "low") as Confidence;
  const evidence      = matchingRun?.evidence ?? null;

  const lower    = evidence?.toLowerCase() ?? "";
  const hasHedge = HEDGING_PHRASES.some((p) => lower.includes(p.toLowerCase()));
  const finalConf  = hasHedge ? downgradeConfidence(rawConf) : rawConf;
  const flagReason = hasHedge ? "evidence contains hedging language" : null;

  return { cap: topCap, confidence: finalConf, evidence, runsAgreeing: topWeight, flagged: false, flagReason };
}

export function deriveScore(cap: HasCapability, confidence: Confidence, evidenceLength: number): number | null {
  if (cap === "not_documented") return null;
  if (cap === "no")             return 10;
  if (cap === "yes") {
    if (confidence === "high")   return Math.min(100, 80 + (evidenceLength > 200 ? 10 : 0));
    if (confidence === "medium") return 60;
    return 50;
  }
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

export interface FeatureRunRow {
  has_capability: string | null;
  evidence:       string | null;
  confidence:     string | null;
  parse_error:    boolean;
  model:          string;
  grounded:       boolean;
}

export interface ScoreResult {
  score:              number | null;
  score_band:         string;
  runs_agreeing:      number | null;
  runs_total:         number;
  flagged_for_review: boolean;
  flag_reason:        string | null;
  notes:              string | null;
  grounded_source:    boolean;
}

export function computeScore(rows: FeatureRunRow[]): ScoreResult {
  const claudeRows = rows.filter((r) => r.model.startsWith("claude"));
  const gptRows    = rows.filter((r) => r.model.startsWith("gpt"));

  const claude = getModelConsensus(claudeRows);
  const gpt    = getModelConsensus(gptRows);

  const grounded_source = rows.some((r) => r.grounded && !r.parse_error && r.has_capability !== null);

  if (claude.flagged || gpt.flagged) {
    const reasons = [claude.flagged ? claude.flagReason : null, gpt.flagged ? gpt.flagReason : null]
      .filter(Boolean).join("; ");
    return {
      score: null, score_band: "undocumented",
      runs_agreeing: null, runs_total: rows.length,
      flagged_for_review: true, flag_reason: reasons, notes: null,
      grounded_source,
    };
  }

  if (!claude.cap && !gpt.cap) {
    return {
      score: null, score_band: "undocumented",
      runs_agreeing: 0, runs_total: rows.length,
      flagged_for_review: false, flag_reason: null,
      notes: "no valid responses from either model",
      grounded_source,
    };
  }

  let finalCap      = (claude.cap ?? gpt.cap) as HasCapability;
  let finalConf     = (claude.confidence ?? gpt.confidence) as Confidence;
  let finalEvidence = claude.evidence ?? gpt.evidence;
  let crossFlag     = false;
  let crossReason: string | null = null;

  if (claude.cap && gpt.cap && claude.cap !== gpt.cap) {
    crossFlag     = true;
    crossReason   = "model disagreement";
    finalCap      = getLowerCapability(claude.cap, gpt.cap);
    const winner  = claude.cap === finalCap ? claude : gpt;
    finalConf     = winner.confidence ?? "low";
    finalEvidence = winner.evidence;
  }

  const hedgeReasons = [...new Set([claude.flagReason, gpt.flagReason].filter(Boolean))];
  const allReasons   = [...hedgeReasons, crossReason].filter(Boolean).join("; ") || null;

  if (finalCap === "not_documented") {
    return {
      score: null, score_band: "undocumented",
      runs_agreeing: (claude.runsAgreeing ?? 0) + (gpt.runsAgreeing ?? 0),
      runs_total: rows.length,
      flagged_for_review: crossFlag,
      flag_reason: allReasons,
      notes: "insufficient public data — not scored",
      grounded_source,
    };
  }

  const evidenceLen = finalEvidence?.length ?? 0;
  const score       = deriveScore(finalCap, finalConf ?? "low", evidenceLen);
  const score_band  = deriveBand(score);

  return {
    score, score_band,
    runs_agreeing: (claude.runsAgreeing ?? 0) + (gpt.runsAgreeing ?? 0),
    runs_total:    rows.length,
    flagged_for_review: crossFlag,
    flag_reason:   allReasons,
    notes:         null,
    grounded_source,
  };
}
