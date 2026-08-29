// Ralfi feature config, prompt templates, and scoring logic.
// 18 features per brand: 12 cluster (6 clusters × 2) + 6 brand-dimension (3 × 2).
// Architecture mirrors dexify-features.ts exactly.

// ── Grounding & output templates ───────────────────────────────────────────────

export const RALFI_FEATURE_SYSTEM_PROMPT =
  "You are a competitive intelligence analyst evaluating AI agent platforms for insurance brokers. " +
  "For each feature, explain the brand's specific implementation and the practical value it delivers to an insurance broker or brokerage — not generic feature existence. " +
  "Return ONLY valid JSON matching the exact schema. No markdown, no explanation — just the JSON object.";

export const RALFI_GROUNDING_INSTRUCTION =
  "Only include information specific to [BRAND]'s documented product for insurance brokers. " +
  "Do not infer capabilities from what similar tools typically do. " +
  "If you are uncertain whether [BRAND] specifically has this capability for insurance brokers or brokerages, " +
  "set has_capability to not_documented rather than guessing.";

export const RALFI_JSON_OUTPUT_SPEC =
  '{\n' +
  '  "has_capability": "yes|no|partial|not_documented",\n' +
  '  "evidence": "if yes/partial: 1-2 sentences on what [BRAND] specifically does for this capability and what makes its approach useful for an insurance broker — describe the mechanism and practical outcome, not just that the feature exists. If no/not_documented: what is absent or unclear.",\n' +
  '  "limitations": "any caveats or gaps",\n' +
  '  "confidence": "high|medium|low",\n' +
  '  "terminology_tags": ["0-3 short named terms (1-4 words each). Return ONLY terms that are a named product feature, branded mechanism, or product-specific integration mentioned in the evidence. Return [] when evidence uses only generic language — most responses should have 0-2 tags. Calibration: GOOD → \\"renewal timeline tracking\\" (named flow), \\"Outlook integration\\" (specific), \\"NIBA Code compliance\\" (named). BAD → \\"AI follow-up\\" (generic), \\"workflow automation\\" (common). Ask: would this exact phrase appear in a competitor\'s evidence? If yes, return []."]\n' +
  '}';

// ── Locked brand list ──────────────────────────────────────────────────────────
// Verified broker-facing, AI-native competitor brands. Finalised 2026-08-22 after
// denylist review of 358 brands from ralfi_daily_summary mention data.
// Criteria: broker-facing (retail/commercial brokers use it in their own workflow)
//           + AI as core product, not just a bolted-on feature.
// Excluded: direct carriers (Lemonade), carrier-only data platforms (Planck, Cytora,
//           Tractable, Friss, Cape Analytics), traditional AMS/CRM with AI features
//           (AgentSync, NowCerts, Insureio), wholesale/MGA-only (BindHQ),
//           unverified/name-collision risk (Limit AI), hallucinated brands (Claim Genius).
// Known limitation: ralfi-claims has only one genuine competitor (Snapsheet).
//   The other 9 brands will correctly score not_documented on claims features.
//   Report generation should flag this as a single-brand finding, not a thin chart.
// Do NOT add Ralfi itself here; this list is for competitor brands to score against.
export const LOCKED_RALFI_BRANDS: readonly string[] = [
  "Broker Buddha",      // AI application collection & workflow automation for brokers
  "Snapsheet",          // AI-driven claims workflow with virtual estimators
  "Indio",              // AI-powered insurance application intake (Applied Systems)
  "RiskGenius",         // AI policy analysis & gap identification for brokers
  "Chisel AI",          // AI document review & policy comparison for brokers/insurers
  "Better Agency",      // AI CRM & automation platform for insurance agents
  "Amy by Cover Whale", // Named AI agent for trucking insurance brokers
  "TrustLayer",         // AI-powered COI/certificate of insurance verification
  "InsuredMine",        // AI CRM + voice agents for independent insurance agencies
  "Outmarket",          // AI platform built specifically for insurance brokerages
];

// ── Feature definitions ────────────────────────────────────────────────────────

export interface RalfiFeature {
  feature_id:   string;
  feature_tag:  string;
  feature_name: string;
  description:  string;
  prompt:       string;
}

export const RALFI_FEATURES: RalfiFeature[] = [

  // ── Cluster 1 — Renewal Management · ralfi-renewal ───────────────────────────
  {
    feature_id:   "renewal_auto_followup",
    feature_tag:  "ralfi-renewal",
    feature_name: "Automatic follow-up with quiet clients or insurers during renewal",
    description:  "Whether the AI agent automatically follows up when a client or insurer goes quiet during a renewal — without the broker initiating it.",
    prompt: `During an insurance renewal, clients and insurers often go quiet and brokers lose track of who needs chasing. Does [BRAND] as an AI agent automatically detect when a client or insurer has gone quiet and send a follow-up on the broker's behalf — without the broker needing to initiate it each time?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "renewal_stage_reminders",
    feature_tag:  "ralfi-renewal",
    feature_name: "Renewal stage tracking with days-to-expiry reminders",
    description:  "Whether the agent tracks each renewal's stage and triggers reminders or actions based on days remaining until policy expiry.",
    prompt: `Insurance renewals have multiple stages — collecting client info, waiting on insurer terms, confirming cover, binding — each with a deadline. Does [BRAND] as an AI agent track where each renewal is in this workflow and automatically trigger the next action or reminder based on the number of days remaining until the policy expires?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 2 — Document Processing · ralfi-documents ───────────────────────
  {
    feature_id:   "doc_structured_extraction",
    feature_tag:  "ralfi-documents",
    feature_name: "Structured data extraction from policy documents and SOVs",
    description:  "Whether the agent extracts structured fields from policy PDFs, schedules of value, or broker submissions without manual entry.",
    prompt: `Insurance brokers deal with large volumes of policy documents, schedules of value (SOVs), and insurer submissions — often as unstructured PDFs. Does [BRAND] as an AI agent extract structured data from these documents automatically — populating fields like insured name, coverage limits, expiry dates, and premium amounts — without the broker doing manual data entry?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "doc_unstructured_processing",
    feature_tag:  "ralfi-documents",
    feature_name: "Processing of unstructured insurance documents from email attachments",
    description:  "Whether the agent reads and processes unstructured documents — PDFs, Word files — received as email attachments, without requiring upload or manual handling.",
    prompt: `Insurers and clients often send policy documents, endorsements, and renewal terms as email attachments in various formats. Does [BRAND] as an AI agent automatically read, process, and extract relevant information from these unstructured documents received via email — without the broker needing to download, upload, or manually handle them?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 3 — Risk & Submission Support · ralfi-risk ──────────────────────
  {
    feature_id:   "risk_client_data_collection",
    feature_tag:  "ralfi-risk",
    feature_name: "Automated collection and organisation of client risk data for submissions",
    description:  "Whether the agent collects and organises client risk information — turnover, payroll, asset values — in preparation for insurer submissions.",
    prompt: `Before a broker can submit a risk to insurers, they need to collect specific information from their client — turnover, payroll figures, asset values, claims history. Does [BRAND] as an AI agent help brokers collect and organise this client risk data automatically, reducing the manual back-and-forth of chasing clients for information?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "risk_submission_gap_detection",
    feature_tag:  "ralfi-risk",
    feature_name: "Missing information detection before submission is sent to insurer",
    description:  "Whether the agent identifies gaps in a broker submission before it is sent — flagging missing fields that insurers typically require.",
    prompt: `Incomplete submissions to insurers cause delays, rejection, or terms that don't reflect the real risk. Does [BRAND] as an AI agent check a broker's risk submission before it is sent and flag any missing or incomplete information that insurers typically require — so the broker can complete it before it goes out?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 4 — Claims Advocacy & Tracking · ralfi-claims ───────────────────
  {
    feature_id:   "claims_status_tracking",
    feature_tag:  "ralfi-claims",
    feature_name: "Claim status tracking with automatic insurer follow-up",
    description:  "Whether the agent tracks an open claim's status and automatically follows up with the insurer when updates are overdue.",
    prompt: `After a client lodges a claim, the broker needs to track its progress and follow up with the insurer when updates are overdue. Does [BRAND] as an AI agent track the status of open client claims and automatically follow up with the insurer when a response or update hasn't arrived within the expected timeframe — without the broker needing to manually chase?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "claims_quiet_alert",
    feature_tag:  "ralfi-claims",
    feature_name: "Alert when a claim or insurer response has gone quiet",
    description:  "Whether the agent proactively alerts the broker when a claim has stalled — no insurer response within a set window.",
    prompt: `Claims sometimes stall with no update from the insurer for days or weeks. Does [BRAND] as an AI agent proactively alert the broker when a claim has gone quiet — flagging that an insurer hasn't responded within a set timeframe — so the broker can escalate before the client notices the delay?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 5 — Client Communication & Servicing · ralfi-comms ───────────────
  {
    feature_id:   "comms_broker_voice_email",
    feature_tag:  "ralfi-comms",
    feature_name: "Client emails drafted in the broker's own voice from their email history",
    description:  "Whether the agent learns the broker's writing style and drafts client emails accordingly — not generic templates.",
    prompt: `Every broker has their own tone and relationship with clients. Does [BRAND] as an AI agent learn how a specific broker writes — from their existing email history — and draft client emails in that broker's own voice, rather than producing generic templates the broker needs to rewrite before sending?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "comms_client_self_service",
    feature_tag:  "ralfi-comms",
    feature_name: "Client self-service for routine policy questions without broker involvement",
    description:  "Whether the agent can handle routine client queries — coverage questions, renewal reminders — without the broker needing to respond manually.",
    prompt: `Clients regularly contact brokers with routine questions — what does my policy cover, when does it renew, what's my excess. Does [BRAND] as an AI agent handle these routine client queries automatically — answering from the client's policy data — without the broker needing to respond to each one manually?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 6 — Compliance & Audit Trail · ralfi-compliance ─────────────────
  {
    feature_id:   "compliance_timestamped_logging",
    feature_tag:  "ralfi-compliance",
    feature_name: "Automatic timestamped logging of every client and insurer contact",
    description:  "Whether every email, follow-up, and response is automatically timestamped and recorded — with no manual logging required from the broker.",
    prompt: `Insurance brokers are required to maintain records of every client and insurer contact as part of their compliance obligations under codes of practice. Does [BRAND] as an AI agent automatically timestamp and record every email, follow-up, and insurer response in a renewal — without the broker needing to manually log anything?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "compliance_audit_export",
    feature_tag:  "ralfi-compliance",
    feature_name: "Exportable audit trail covering every renewal action and timestamp",
    description:  "Whether the agent can generate a compliance export — every email, step, and timestamp in one file — for regulatory review or audit purposes.",
    prompt: `Brokers sometimes need to demonstrate compliance to their licensee, a regulator, or a client — showing exactly what was done, when, and in what order throughout a renewal. Does [BRAND] as an AI agent produce a compliance export covering every renewal action, contact, and timestamp in a single file — ready for review without any manual assembly by the broker?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Brand-Level Dimension: Security / Responsible AI · ralfi-security ─────────
  {
    feature_id:   "security_private_ai",
    feature_tag:  "ralfi-security",
    feature_name: "Private AI infrastructure — client data not used to train models",
    description:  "Whether the AI agent runs on private infrastructure where broker and client data is not used to train AI models.",
    prompt: `Insurance brokers handle highly sensitive client data — policy details, financials, claims history, personal information. Does [BRAND] as an AI agent run on private AI infrastructure where this data is not used to train AI models — and is there documented evidence of this commitment rather than just a general statement?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "security_data_control",
    feature_tag:  "ralfi-security",
    feature_name: "Broker data control — export and permanent deletion on request",
    description:  "Whether brokers can export all their data and request permanent deletion at any time — with no lock-in.",
    prompt: `If a brokerage decides to stop using [BRAND] as an AI agent, can they export all their data — client records, renewal histories, compliance logs — and request permanent deletion of everything from [BRAND]'s systems? Does [BRAND] offer this without lock-in or additional cost?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Brand-Level Dimension: Pricing · ralfi-pricing ────────────────────────────
  {
    feature_id:   "pricing_cost",
    feature_tag:  "ralfi-pricing",
    feature_name: "Stated cost for an insurance brokerage",
    description:  "Whether specific pricing is available — per broker, per seat, or flat brokerage fee.",
    prompt: `What does [BRAND] as an AI agent cost for an insurance brokerage? Is pricing per broker, per seat, per brokerage, or structured another way? Are there different tiers, and what is included at each level?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "pricing_transparency",
    feature_tag:  "ralfi-pricing",
    feature_name: "Pricing published without requiring a sales call",
    description:  "Whether [BRAND] publishes its pricing on its website so brokers can assess affordability without speaking to sales.",
    prompt: `Does [BRAND] as an AI agent publish its pricing clearly on its website — specific amounts or tier breakdowns — without requiring a broker to book a demo or speak to a salesperson first? Or does getting a price require a sales call?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Brand-Level Dimension: Technical Capabilities · ralfi-technical ───────────
  {
    feature_id:   "technical_integrations",
    feature_tag:  "ralfi-technical",
    feature_name: "Integrations with email and broker management systems",
    description:  "Which systems [BRAND] connects to — Outlook, Gmail, broking platforms, policy data sources.",
    prompt: `What systems does [BRAND] as an AI agent integrate with? Specifically: does it connect to Outlook or Gmail for email, and does it integrate with any broker management systems, policy administration platforms, or insurer portals used by insurance brokerages?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "technical_setup",
    feature_tag:  "ralfi-technical",
    feature_name: "Self-serve setup — no IT or technical implementation required",
    description:  "Whether a brokerage can connect and configure [BRAND] without technical staff, developers, or a lengthy implementation project.",
    prompt: `Can an insurance brokerage connect and configure [BRAND] as an AI agent without IT staff, developers, or a multi-week implementation project? Does [BRAND] offer a self-serve setup that a broker or practice manager can complete independently — connecting to existing email and data systems out of the box?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function buildRalfiFeaturePrompt(feature: RalfiFeature, brandName: string): string {
  const grounding  = RALFI_GROUNDING_INSTRUCTION.replaceAll("[BRAND]", brandName);
  const outputSpec = RALFI_JSON_OUTPUT_SPEC.replaceAll("[BRAND]", brandName);
  return feature.prompt
    .replaceAll("[BRAND]", brandName)
    .replace("[GROUNDING INSTRUCTION]", grounding)
    .replace("[JSON OUTPUT]", outputSpec);
}

// ── Scoring (identical logic to dexify-features.ts computeDexifyScore) ─────────

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

interface ModelConsensus {
  capability:  HasCapability;
  confidence:  Confidence;
  agreeing:    number;
  total:       number;
  hasGrounded: boolean;
}

export interface RalfiScoreResult {
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

  const majority    = Math.ceil(valid.length / 2);
  // Tiebreak by CAP_RANK so yes > partial > no > not_documented when counts are equal.
  const leadEntry   = Object.entries(capCounts).sort((a, b) =>
    b[1] - a[1] || (CAP_RANK[b[0] as HasCapability] ?? 0) - (CAP_RANK[a[0] as HasCapability] ?? 0)
  )[0];
  const leadCap     = leadEntry[0] as HasCapability;
  const leadCount   = leadEntry[1];
  const hasGrounded = valid.some((r) => r.grounded);
  const hasHedging  = valid.some((r) => HEDGING_PHRASES.some((p) => r.evidence?.toLowerCase().includes(p)));

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

export function computeRalfiScore(rows: FeatureRunRow[]): RalfiScoreResult {
  const standardRows = rows.filter((r) => !r.grounded);
  const groundedRows = rows.filter((r) => r.grounded);

  const std = modelConsensus(standardRows);
  const gnd = groundedRows.length > 0 ? modelConsensus(groundedRows) : null;

  let cap  = std.capability;
  let conf = std.confidence;
  let grounded_source = false;

  if (gnd && gnd.capability !== "not_documented") {
    cap  = gnd.capability;
    conf = gnd.confidence;
    grounded_source = true;
  }

  const scoreMap: Record<HasCapability, Record<Confidence, number>> = {
    yes:            { high: 95, medium: 80, low: 65 },
    partial:        { high: 60, medium: 45, low: 30 },
    no:             { high: 5,  medium: 10, low: 15 },
    not_documented: { high: 0,  medium: 0,  low: 0  },
  };

  const score      = cap === "not_documented" ? null : scoreMap[cap][conf];
  const score_band =
    score === null  ? "not_documented"
    : score >= 80   ? "high"
    : score >= 40   ? "medium"
    : "low";

  const disagreement       = std.total > 0 && std.agreeing < Math.ceil(std.total / 2);
  const allParseErrors     = rows.every((r) => r.parse_error);
  const lowConfHighCap     = cap === "yes" && conf === "low" && !grounded_source;
  const groundedDowngraded = grounded_source && gnd !== null && CAP_RANK[gnd.capability] < CAP_RANK[std.capability];

  const flagged    = disagreement || allParseErrors || lowConfHighCap || groundedDowngraded;
  const flag_reason =
    allParseErrors       ? "all_parse_errors"
    : groundedDowngraded ? "grounded_downgrade"
    : disagreement       ? "model_disagreement"
    : lowConfHighCap     ? "low_confidence_yes"
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
