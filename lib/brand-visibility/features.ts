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
  // ── Ads (3 features × 9 brands = 27 brand+feature pairs) ─────────────────────
  {
    feature_id:   "ads_meta_google_native",
    feature_tag:  "ads",
    feature_name: "Meta + Google native management",
    applies_to:   ADS_BRANDS,
    prompt: `I want to manage Meta Ads and Google Ads from one place. Does [BRAND] support both Meta Ads and Google Ads natively — meaning you can create, edit, and optimise campaigns on both platforms directly within [BRAND]'s interface, not just view reporting?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "ads_tiktok_support",
    feature_tag:  "ads",
    feature_name: "TikTok Ads support",
    applies_to:   ADS_BRANDS,
    prompt: `TikTok is now a significant channel for our campaigns. Does [BRAND] support TikTok Ads in its platform — can you manage, optimise, or create campaigns for TikTok directly within [BRAND], or is TikTok absent from its channel coverage?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "ads_budget_pacing",
    feature_tag:  "ads",
    feature_name: "Automated cross-channel budget pacing",
    applies_to:   ADS_BRANDS,
    prompt: `I run campaigns across multiple channels with a shared monthly budget and I need spend to be reallocated automatically as performance shifts. Does [BRAND] include automated budget pacing or reallocation — where it shifts spend between campaigns, ad sets, or channels within a flight based on live performance data, without manual intervention?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Content (3 features × 6 brands = 18 brand+feature pairs) ─────────────────
  {
    feature_id:   "content_style_training",
    feature_tag:  "content",
    feature_name: "Custom brand style training",
    applies_to:   CONTENT_BRANDS,
    prompt: `We have a brand voice guide that all our copy needs to follow. Can [BRAND] be trained or configured using our own style guide, example copy, or brand voice document — so that all generated content reflects our specific tone rather than a generic default?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "content_variant_testing",
    feature_tag:  "content",
    feature_name: "Copy variant generation and performance testing",
    applies_to:   CONTENT_BRANDS,
    prompt: `I need to test copy variants before picking a winner. Does [BRAND] generate multiple distinct copy variants for the same brief — and does it support A/B or multivariate testing, either by tracking which variants perform better or by automatically selecting the winner based on engagement data?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "content_channel_formats",
    feature_tag:  "content",
    feature_name: "Channel-specific output formats",
    applies_to:   CONTENT_BRANDS,
    prompt: `I need copy for email subject lines, social captions, and display ads — all from the same brief but formatted correctly for each channel. Does [BRAND] produce channel-specific copy variants natively — outputting appropriately formatted versions for email, social, display, or landing pages from a single content request?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Lead-gen (4 features × 5 brands = 20 brand+feature pairs) ────────────────
  {
    feature_id:   "leadgen_email_deliverability",
    feature_tag:  "lead-gen",
    feature_name: "Email deliverability tooling",
    applies_to:   LEADGEN_BRANDS,
    prompt: `I'm building outreach sequences and sender reputation is critical. Does [BRAND] include built-in email deliverability features — for example, inbox warming, bounce monitoring, spam score checking, or dedicated sending domains — as part of its own product rather than a third-party add-on?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "leadgen_ab_testing",
    feature_tag:  "lead-gen",
    feature_name: "Native A/B testing for sequences",
    applies_to:   LEADGEN_BRANDS,
    prompt: `Before scaling an outreach campaign I need to know which message variant performs better. Does [BRAND] support A/B or multivariate testing of outreach messages or sequences natively — without exporting to another tool — and does it report results per variant (open rate, reply rate, or similar)?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "leadgen_crm_sync",
    feature_tag:  "lead-gen",
    feature_name: "CRM sync without middleware",
    applies_to:   LEADGEN_BRANDS,
    prompt: `I need sequence activity to flow back into my CRM automatically. Does [BRAND] sync contact activity, sequence status, and reply data directly to a CRM (such as HubSpot or Salesforce) via a native integration — without requiring Zapier or similar middleware?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "leadgen_intent_signals",
    feature_tag:  "lead-gen",
    feature_name: "Engagement-based lead prioritisation",
    applies_to:   LEADGEN_BRANDS,
    prompt: `I want to know which leads to contact next based on how they've been engaging. Does [BRAND] rank or score contacts based on engagement signals — such as email opens, link clicks, or reply intent — to surface which leads are most worth pursuing right now?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Lifecycle (3 features × 7 brands = 21 brand+feature pairs) ───────────────
  // Drift and Conversica intentionally appear in both lead-gen and lifecycle clusters.
  {
    feature_id:   "lifecycle_send_time",
    feature_tag:  "lifecycle",
    feature_name: "Per-contact send time optimisation",
    applies_to:   ROI_BRANDS,
    prompt: `I want messages to reach each contact when they're most likely to open them, not just at a fixed broadcast time. Does [BRAND] automatically determine and apply the optimal send time per individual contact — based on their own past engagement history — rather than sending to all contacts at the same time?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "lifecycle_channel_orchestration",
    feature_tag:  "lifecycle",
    feature_name: "Multi-channel journey coordination",
    applies_to:   ROI_BRANDS,
    prompt: `My lifecycle journeys run across email, SMS, and in-app messages and I need them to work as one coordinated flow. Does [BRAND] coordinate messaging across multiple channels — email, SMS, push, in-app — as part of a single automated journey, where the channel used at each step is managed by [BRAND] rather than manually configured separately per channel?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "lifecycle_churn_detection",
    feature_tag:  "lifecycle",
    feature_name: "Churn and disengagement detection",
    applies_to:   ROI_BRANDS,
    prompt: `I want to catch disengaging contacts before they unsubscribe or churn. Does [BRAND] identify contacts at risk of disengaging or churning — for example by flagging declining open rates, predicting unsubscribes, or surfacing a re-engagement segment — before the contact has already lapsed?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Technical (3 features × all 22 brands = 66 brand+feature pairs) ──────────
  {
    feature_id:   "tech_public_api",
    feature_tag:  "technical",
    feature_name: "Documented public API",
    applies_to:   "all",
    prompt: `My team wants to build automations on top of [BRAND]. Does [BRAND] offer a documented public API — not just webhooks or Zapier triggers, but an actual developer API with authentication, endpoints, and published documentation that third-party developers can use to read or write data programmatically?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "tech_webhook_support",
    feature_tag:  "technical",
    feature_name: "Outbound webhook support",
    applies_to:   "all",
    prompt: `I need [BRAND] to push data to our internal systems when things happen — campaign completes, lead status changes, score threshold crossed. Does [BRAND] support outbound webhooks — where [BRAND] sends a real-time HTTP push to a URL you configure, triggered by events in the platform?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "tech_sso_enterprise",
    feature_tag:  "technical",
    feature_name: "Enterprise SSO authentication",
    applies_to:   "all",
    prompt: `Our IT team requires SSO before approving any new tool. Does [BRAND] support enterprise Single Sign-On — for example, SAML 2.0 or OAuth via an identity provider like Okta, Azure AD, or Google Workspace — documented as a supported feature for business accounts?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Responsible AI (3 features × all 22 brands = 66 brand+feature pairs) ─────
  {
    feature_id:   "rai_soc2_gdpr",
    feature_tag:  "responsible-ai",
    feature_name: "SOC 2 and GDPR compliance documentation",
    applies_to:   "all",
    prompt: `Our legal and security team will ask for compliance documentation before approving [BRAND]. Is [BRAND] SOC 2 Type II certified — or does it publish GDPR compliance documentation, a Data Processing Agreement, or equivalent enterprise data security commitments in its public documentation or trust centre?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "rai_data_retention",
    feature_tag:  "responsible-ai",
    feature_name: "Published data retention policy",
    applies_to:   "all",
    prompt: `We need to know how long [BRAND] holds our data before we can sign off on procurement. Does [BRAND] publish a clear data retention policy — specifying how long it stores campaign data, contact records, or user data before deletion — either in its privacy policy, terms of service, or a dedicated security page?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "rai_change_log",
    feature_tag:  "responsible-ai",
    feature_name: "AI action audit trail",
    applies_to:   "all",
    prompt: `When [BRAND] changes something autonomously — a bid, an audience, a message variant — I need to know what it did and why. Does [BRAND] provide an audit log, activity feed, or change history that records what actions the AI took — for example which campaigns it modified, what bids it changed, or which segments it updated — so you can review its decisions after the fact?
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
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "cost_pricing_transparency",
    feature_tag:  "cost",
    feature_name: "Pricing transparency",
    applies_to:   "all",
    prompt: `I need to build a business case for adopting [BRAND]. Is the pricing publicly documented — and what does the entry-level paid tier actually cost and include? If pricing requires a sales call to obtain, note that.
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

  const lower     = evidence?.toLowerCase() ?? "";
  const hasHedge  = HEDGING_PHRASES.some((p) => lower.includes(p.toLowerCase()));
  const finalConf = hasHedge ? downgradeConfidence(rawConf) : rawConf;
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

  // True when any grounded run had a valid, parseable result that entered the vote.
  const grounded_source = rows.some((r) => r.grounded && !r.parse_error && r.has_capability !== null);

  // Either model internally inconsistent → flag for review, no score
  if (claude.flagged || gpt.flagged) {
    const reasons = [claude.flagged ? claude.flagReason : null, gpt.flagged ? gpt.flagReason : null]
      .filter(Boolean)
      .join("; ");
    return {
      score: null, score_band: "undocumented",
      runs_agreeing: null, runs_total: rows.length,
      flagged_for_review: true, flag_reason: reasons, notes: null,
      grounded_source,
    };
  }

  // No usable data at all
  if (!claude.cap && !gpt.cap) {
    return {
      score: null, score_band: "undocumented",
      runs_agreeing: 0, runs_total: rows.length,
      flagged_for_review: false, flag_reason: null,
      notes: "no valid responses from either model",
      grounded_source,
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
    score,
    score_band,
    runs_agreeing: (claude.runsAgreeing ?? 0) + (gpt.runsAgreeing ?? 0),
    runs_total:    rows.length,
    flagged_for_review: crossFlag,
    flag_reason:   allReasons,
    notes:         null,
    grounded_source,
  };
}
