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
  '  "evidence": "if yes/partial: 1-2 sentences on what [BRAND] specifically does for this capability and what makes its approach useful — describe the mechanism and practical outcome for a marketing team, not just that the feature exists. If no/not_documented: what is absent or unclear.",\n' +
  '  "limitations": "any caveats, restrictions, or gaps",\n' +
  '  "confidence": "high|medium|low",\n' +
  '  "terminology_tags": ["0-3 short named terms (1-4 words each). Return ONLY terms that are a named product feature, branded mechanism, or product-specific metric mentioned in the evidence. Return [] when evidence uses only generic language common to any similar tool — most responses should have 0-2 tags and many should have []. Calibration: GOOD → \\"ROAS targets\\" (specific metric), \\"Budget Pacing\\" (named feature), \\"Autonomous Budget Allocator\\" (branded), \\"Smart Sending\\" (named). BAD → [] → \\"CRM integration\\" (generic), \\"AI-powered\\" (generic), \\"automated rules\\" (common). Ask: would this exact phrase appear in a competitor\'s evidence for the same feature? If yes, return []."]\n' +
  '}';

export const FEATURE_SYSTEM_PROMPT =
  "You are a competitive intelligence analyst writing capability profiles of marketing AI tools. " +
  "For each feature, explain the brand's specific implementation and the practical value it delivers — not generic feature existence. " +
  "Return ONLY valid JSON matching the exact schema. No markdown, no explanation — just the JSON object.";

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
  feature_desc: string; // 1-2 sentence plain-English definition shown in the UI below the heading
  applies_to:   string[] | "all";
  prompt:       string; // [BRAND], [GROUNDING INSTRUCTION], [JSON OUTPUT] are substituted at runtime
}

export const FEATURES: Feature[] = [
  // ── Ads (3 features) ──────────────────────────────────────────────────────────
  {
    feature_id:   "ads_autonomous_bidding",
    feature_tag:  "ads",
    feature_name: "Autonomous bid management",
    feature_desc: "Evaluates whether the AI automatically adjusts bids in real time based on conversion signals and ROAS targets — without manual rule configuration for every scenario.",
    applies_to:   ADS_BRANDS,
    prompt: `I need bids to adjust themselves based on live performance — not rules I write manually. Does [BRAND] autonomously adjust bids based on real-time conversion signals and ROAS targets, without requiring manual rule configuration for every scenario?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "ads_budget_pacing",
    feature_tag:  "ads",
    feature_name: "Budget pacing & allocation",
    feature_desc: "Looks at whether spend is reallocated dynamically across campaigns, ad sets, or channels as performance shifts — preventing underspend or overspend within a budget period.",
    applies_to:   ADS_BRANDS,
    prompt: `I run campaigns across multiple channels with a shared monthly budget and I need spend to be reallocated automatically as performance shifts. Does [BRAND] include automated budget pacing or reallocation — where it shifts spend between campaigns, ad sets, or channels based on live performance data, without manual intervention?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "ads_meta_google_native",
    feature_tag:  "ads",
    feature_name: "Meta & Google native ads",
    feature_desc: "Checks whether campaigns on both Meta Ads and Google Ads can be created, edited, and optimised natively in one interface — not just viewed in reporting.",
    applies_to:   ADS_BRANDS,
    prompt: `I want to manage Meta Ads and Google Ads from one place. Does [BRAND] support both Meta Ads and Google Ads natively — meaning you can create, edit, and optimise campaigns on both platforms directly within [BRAND]'s interface, not just view reporting?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Content (3 features) ──────────────────────────────────────────────────────
  {
    feature_id:   "content_variant_testing",
    feature_tag:  "content",
    feature_name: "Copy variant generation & testing",
    feature_desc: "Assesses whether the tool generates multiple distinct copy variants for the same brief and supports A/B or multivariate testing with per-variant performance tracking.",
    applies_to:   CONTENT_BRANDS,
    prompt: `I need to test copy variants before picking a winner. Does [BRAND] generate multiple distinct copy variants for the same brief — and does it support A/B or multivariate testing, either by tracking which variants perform better or by automatically selecting the winner based on engagement data?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "content_brand_voice",
    feature_tag:  "content",
    feature_name: "Brand voice customisation",
    feature_desc: "Examines whether the tool can be trained on a brand's own style guide, example copy, or tone document so all generated content reflects a specific voice rather than a generic default.",
    applies_to:   CONTENT_BRANDS,
    prompt: `We have a brand voice guide that all our copy needs to follow. Can [BRAND] be trained or configured using our own style guide, example copy, or brand voice document — so that all generated content reflects our specific tone rather than a generic default?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "content_channel_formats",
    feature_tag:  "content",
    feature_name: "Multi-channel output formats",
    feature_desc: "Covers whether the tool produces correctly formatted copy for email, social, display, and landing pages from a single brief — adapting length and structure per channel.",
    applies_to:   CONTENT_BRANDS,
    prompt: `I need copy for email subject lines, social captions, and display ads — all from the same brief but formatted correctly for each channel. Does [BRAND] produce channel-specific copy variants natively — outputting appropriately formatted versions for email, social, display, or landing pages from a single content request?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Lead-gen (3 features) ─────────────────────────────────────────────────────
  {
    feature_id:   "leadgen_ab_testing",
    feature_tag:  "lead-gen",
    feature_name: "A/B testing for sequences",
    feature_desc: "Looks at native A/B or multivariate testing of outreach messages or sequences — without exporting to a third-party tool — with per-variant reporting on open, reply, or conversion rates.",
    applies_to:   LEADGEN_BRANDS,
    prompt: `Before scaling an outreach campaign I need to know which message variant performs better. Does [BRAND] support A/B or multivariate testing of outreach messages or sequences natively — without exporting to another tool — and does it report results per variant (open rate, reply rate, or similar)?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "leadgen_crm_sync",
    feature_tag:  "lead-gen",
    feature_name: "CRM sync without middleware",
    feature_desc: "Checks whether contact activity, sequence status, and reply data sync directly to a CRM like HubSpot or Salesforce via a native integration — without Zapier or custom middleware.",
    applies_to:   LEADGEN_BRANDS,
    prompt: `I need sequence activity to flow back into my CRM automatically. Does [BRAND] sync contact activity, sequence status, and reply data directly to a CRM (such as HubSpot or Salesforce) via a native integration — without requiring Zapier or similar middleware?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "leadgen_qualification",
    feature_tag:  "lead-gen",
    feature_name: "AI lead qualification",
    feature_desc: "Evaluates whether the tool automatically scores or qualifies leads based on behavioural signals, engagement patterns, or conversation history — without manual scoring rules.",
    applies_to:   LEADGEN_BRANDS,
    prompt: `I want AI to automatically score and qualify leads so my team only contacts the most ready prospects. Does [BRAND] automatically qualify or score leads based on behavioural signals, conversation history, or engagement patterns — without requiring manual scoring rules for every scenario?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Lifecycle (3 features × 7 brands = 21 brand+feature pairs) ───────────────
  // Drift and Conversica intentionally appear in both lead-gen and lifecycle clusters.
  {
    feature_id:   "lifecycle_send_time",
    feature_tag:  "lifecycle",
    feature_name: "Per-contact send time optimisation",
    feature_desc: "Looks at whether each contact receives messages at the time they're individually most likely to engage — derived from their own past open and click history, not a fixed broadcast slot.",
    applies_to:   ROI_BRANDS,
    prompt: `I want messages to reach each contact when they're most likely to open them, not just at a fixed broadcast time. Does [BRAND] automatically determine and apply the optimal send time per individual contact — based on their own past engagement history — rather than sending to all contacts at the same time?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "lifecycle_channel_orchestration",
    feature_tag:  "lifecycle",
    feature_name: "Multi-channel journey coordination",
    feature_desc: "Examines whether the tool coordinates email, SMS, push, and in-app messages as a unified automated journey — managing channel selection per step rather than separate per-channel flows.",
    applies_to:   ROI_BRANDS,
    prompt: `My lifecycle journeys run across email, SMS, and in-app messages and I need them to work as one coordinated flow. Does [BRAND] coordinate messaging across multiple channels — email, SMS, push, in-app — as part of a single automated journey, where the channel used at each step is managed by [BRAND] rather than manually configured separately per channel?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "lifecycle_churn_detection",
    feature_tag:  "lifecycle",
    feature_name: "Churn and disengagement detection",
    feature_desc: "Assesses whether the tool proactively identifies contacts at risk of churning or disengaging — flagging declining engagement before the contact has already lapsed.",
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
    feature_desc: "Checks whether the platform offers a published developer API with authentication and documented endpoints that third-party teams can use to read or write data programmatically.",
    applies_to:   "all",
    prompt: `My team wants to build automations on top of [BRAND]. Does [BRAND] offer a documented public API — not just webhooks or Zapier triggers, but an actual developer API with authentication, endpoints, and published documentation that third-party developers can use to read or write data programmatically?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "tech_webhook_support",
    feature_tag:  "technical",
    feature_name: "Outbound webhook support",
    feature_desc: "Evaluates whether the tool sends real-time HTTP push notifications to a configured URL when specific events occur — campaign completions, status changes, score thresholds.",
    applies_to:   "all",
    prompt: `I need [BRAND] to push data to our internal systems when things happen — campaign completes, lead status changes, score threshold crossed. Does [BRAND] support outbound webhooks — where [BRAND] sends a real-time HTTP push to a URL you configure, triggered by events in the platform?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "tech_sso_enterprise",
    feature_tag:  "technical",
    feature_name: "Enterprise SSO authentication",
    feature_desc: "Assesses support for enterprise Single Sign-On via SAML 2.0 or OAuth through identity providers such as Okta, Azure AD, or Google Workspace.",
    applies_to:   "all",
    prompt: `Our IT team requires SSO before approving any new tool. Does [BRAND] support enterprise Single Sign-On — for example, SAML 2.0 or OAuth via an identity provider like Okta, Azure AD, or Google Workspace — documented as a supported feature for business accounts?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  {
    feature_id:   "tech_instruction_following",
    feature_tag:  "technical",
    feature_name: "Instruction following & task accuracy",
    feature_desc: "Examines how reliably the tool executes complex, nested instructions — including negative constraints and multi-step structured tasks — without misinterpreting the brief or dropping conditions.",
    applies_to:   "all",
    prompt: `I need [BRAND] to reliably execute complex, multi-step instructions without misinterpreting the task or dropping constraints midway. Does [BRAND] demonstrate strong instruction-following — for example by handling nested conditions, honoring negative constraints ("don't do X"), or accurately completing structured tasks like filling templates or reformatting data — as documented or demonstrated in its product?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "tech_integrations",
    feature_tag:  "technical",
    feature_name: "Native integration ecosystem",
    feature_desc: "Looks at the breadth of built-in connectors to CRMs, ad platforms, email tools, and analytics — without relying on Zapier or custom middleware to bridge the gaps.",
    applies_to:   "all",
    prompt: `I need [BRAND] to connect to our existing marketing stack — CRMs, ad platforms, email tools, analytics — without building custom middleware. How many native integrations does [BRAND] offer, and does it include the major platforms (such as Salesforce, HubSpot, Google Ads, Meta Ads, or Slack) via a built-in connector rather than Zapier?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "tech_multistep_reasoning",
    feature_tag:  "technical",
    feature_name: "Multi-step task reasoning",
    feature_desc: "Evaluates whether the tool can plan and execute multi-step workflows autonomously — adapting if an intermediate step fails — rather than requiring a new prompt for each individual action.",
    applies_to:   "all",
    prompt: `I want [BRAND] to handle tasks that require planning and sequencing — not just single-turn responses. Does [BRAND] support multi-step reasoning or agentic workflows where it can break down a goal, execute a sequence of actions, and adapt if an intermediate step fails — for example running a research task, drafting content, and then revising based on feedback in a single flow?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Responsible AI (3 features × all 22 brands = 66 brand+feature pairs) ─────
  {
    feature_id:   "rai_soc2_gdpr",
    feature_tag:  "responsible-ai",
    feature_name: "SOC 2 and GDPR compliance documentation",
    feature_desc: "Checks whether the vendor holds SOC 2 Type II certification or publishes GDPR compliance documentation and a Data Processing Agreement for enterprise procurement review.",
    applies_to:   "all",
    prompt: `Our legal and security team will ask for compliance documentation before approving [BRAND]. Is [BRAND] SOC 2 Type II certified — or does it publish GDPR compliance documentation, a Data Processing Agreement, or equivalent enterprise data security commitments in its public documentation or trust centre?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "rai_data_retention",
    feature_tag:  "responsible-ai",
    feature_name: "Published data retention policy",
    feature_desc: "Assesses whether the vendor publicly specifies how long campaign data, contact records, and user data are stored before deletion — in its privacy policy or a dedicated security page.",
    applies_to:   "all",
    prompt: `We need to know how long [BRAND] holds our data before we can sign off on procurement. Does [BRAND] publish a clear data retention policy — specifying how long it stores campaign data, contact records, or user data before deletion — either in its privacy policy, terms of service, or a dedicated security page?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "rai_change_log",
    feature_tag:  "responsible-ai",
    feature_name: "AI action audit trail",
    feature_desc: "Looks at whether every autonomous AI action — bid changed, segment updated, variant selected — is logged in an accessible audit trail so decisions can be reviewed after the fact.",
    applies_to:   "all",
    prompt: `When [BRAND] changes something autonomously — a bid, an audience, a message variant — I need to know what it did and why. Does [BRAND] provide an audit log, activity feed, or change history that records what actions the AI took — for example which campaigns it modified, what bids it changed, or which segments it updated — so you can review its decisions after the fact?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  {
    feature_id:   "rai_data_privacy",
    feature_tag:  "responsible-ai",
    feature_name: "Customer data privacy controls",
    feature_desc: "Examines how the vendor handles customer PII fed into the platform — whether it trains on that data by default, whether opt-out exists, and how data is isolated between customers.",
    applies_to:   "all",
    prompt: `My company handles customer PII — email addresses, purchase history, behavioural data — and we need to know how [BRAND] treats that data. Does [BRAND] document how it handles customer data fed into its system — for example, does it train on customer data by default, allow opt-out of model training, or guarantee data isolation between customers — as stated in its privacy policy or product documentation?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },
  {
    feature_id:   "rai_explainability",
    feature_tag:  "responsible-ai",
    feature_name: "AI decision explainability",
    feature_desc: "Evaluates whether AI-driven decisions come with human-readable explanations — which signals drove a recommendation, why a lead was flagged, or which variant was selected and why.",
    applies_to:   "all",
    prompt: `When [BRAND] makes an automated decision — adjusting a bid, flagging a lead, changing a message — I need to understand why. Does [BRAND] provide explanations for its AI-driven decisions — for example showing which signals drove a recommendation, why a contact was flagged as high-intent, or why a specific variant was selected — in a way a non-technical marketer can understand?
[GROUNDING INSTRUCTION]
[JSON OUTPUT]`,
  },

  // ── Cost (2 features × all 22 brands = 44 brand+feature pairs) ───────────────
  {
    feature_id:   "cost_free_tier",
    feature_tag:  "cost",
    feature_name: "Free tier accessibility",
    feature_desc: "Assesses whether there is genuine self-serve free access — not a sales-gated demo — allowing teams to try core functionality before committing any budget.",
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
    feature_desc: "Looks at whether pricing is publicly documented — what the entry-level tier costs and what it includes — without requiring a sales call to get a number.",
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
