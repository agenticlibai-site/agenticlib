// HSAI feature config, prompt templates, and scoring logic.
// 22 features per brand: 2 per cluster × 11 clusters.

// ── Grounding & output templates ───────────────────────────────────────────────

export const HSAI_FEATURE_SYSTEM_PROMPT =
  "You are a hospitality technology analyst evaluating AI agent platforms used by hotel, lodge, safari, and vacation rental operators. " +
  "For each feature, describe the brand's specific implementation and the practical value it delivers to an operator — not generic feature existence. " +
  "Return ONLY valid JSON matching the exact schema. No markdown, no explanation — just the JSON object.";

export const HSAI_GROUNDING_INSTRUCTION =
  "Only include information specific to [BRAND]'s documented product. " +
  "Do not infer capabilities from what similar tools typically do. " +
  "If you are uncertain whether [BRAND] specifically has this capability for hospitality operators, " +
  "set has_capability to not_documented rather than guessing.";

export const HSAI_JSON_OUTPUT_SPEC =
  '{\n' +
  '  "has_capability": "yes|no|partial|not_documented",\n' +
  '  "evidence": "if yes/partial: 1-2 sentences on what [BRAND] specifically does and why it matters for a hospitality operator. If no/not_documented: what is absent or unclear.",\n' +
  '  "limitations": "any caveats or gaps",\n' +
  '  "confidence": "high|medium|low",\n' +
  '  "terminology_tags": ["0-3 short named terms (1-4 words each). Return ONLY branded/named product features or integrations. Return [] when evidence uses only generic language."]\n' +
  '}';

// ── Locked brand list ──────────────────────────────────────────────────────────
// Locked 2026-09-05.
// Includes:
//   (a) Simbastack — the subject of this report
//   (b) AI-native hospitality agents — direct competitors
//   (c) Traditional hospitality tech with AI — benchmark context
// Excluded: general PMS platforms with minor AI features only, OTA platforms,
//           revenue management tools without a guest-agent component.
export const LOCKED_HSAI_BRANDS: readonly string[] = [
  // ── The subject ─────────────────────────────────────────────────────────────
  "Simbastack",          // Custom AI agents for hospitality — Ranger (concierge), ops agent
  // ── AI-native hospitality agents (direct competitors) ───────────────────────
  "Asksuite",            // Hotel chatbot + booking engine, global
  "HiJiffy",             // AI guest communications hub — WhatsApp, webchat, OTA messaging
  "Quicktext",           // Hotel chatbot + AI upsell, Velma AI assistant
  "Akia",                // AI guest messaging for hotels and short-term rentals
  "Canary Technologies", // Digital guest journey — messaging, check-in, upsell
  "Jurny",               // AI-powered short-term rental management
  "Hospitable",          // AI automation for vacation rental hosts
  "HostAI",              // AI assistant for short-term rental operators
  // ── Traditional hospitality tech with significant AI (benchmark) ────────────
  "Cloudbeds",           // PMS + Whistle AI guest messaging
  "Revinate",            // Guest data platform + Ivy AI concierge
  "Mews",                // Cloud PMS with automation and AI assistant features
];

// ── Feature definitions ────────────────────────────────────────────────────────

export interface HsaiFeature {
  feature_id:   string;
  feature_tag:  string;
  feature_name: string;
  description:  string;
  prompt:       string;
}

const FOOTER = `[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`;

export const HSAI_FEATURES: HsaiFeature[] = [

  // ── Cluster 1 — Guest Messaging · hsai-messaging ─────────────────────────────
  {
    feature_id:   "messaging_omnichannel",
    feature_tag:  "hsai-messaging",
    feature_name: "Omnichannel guest communication",
    description:  "Whether the platform handles guest messages across multiple channels — WhatsApp, email, SMS, web chat, and OTAs — from a single unified interface.",
    prompt: `Hotel guests contact properties across WhatsApp, email, SMS, web chat, and OTAs like Booking.com and Airbnb. Does [BRAND] unify all these channels into a single conversation interface — so an operator or AI agent can see and respond to every guest touchpoint in one place, without switching between tools?
${FOOTER}`,
  },
  {
    feature_id:   "messaging_24_7_automation",
    feature_tag:  "hsai-messaging",
    feature_name: "24/7 autonomous response without human escalation",
    description:  "Whether the platform's AI can fully resolve common guest inquiries end-to-end at any hour, without requiring a human to review or approve each response.",
    prompt: `A guest sends a WhatsApp message at 2am asking about room rates, what's included in the package, and how to get from the airport. Can [BRAND]'s AI autonomously answer this full inquiry — not just acknowledge it or flag it for a human — and handle multi-turn follow-up questions too, 24 hours a day?
${FOOTER}`,
  },

  // ── Cluster 2 — Booking & Reservations · hsai-booking ───────────────────────
  {
    feature_id:   "booking_live_availability",
    feature_tag:  "hsai-booking",
    feature_name: "Real-time availability and quote generation",
    description:  "Whether the AI checks live inventory from the PMS and generates accurate, up-to-date quotes in conversation without staff involvement.",
    prompt: `A guest asks an AI agent: 'Do you have a tent available for 3 nights from the 15th, and what would that cost with full board?' Does [BRAND] pull live availability data from the property's booking system in real time and generate an accurate, current quote in the conversation — without a staff member having to check and reply manually?
${FOOTER}`,
  },
  {
    feature_id:   "booking_direct_conversion",
    feature_tag:  "hsai-booking",
    feature_name: "Direct booking and payment within conversation",
    description:  "Whether a guest can complete a booking and pay directly through the AI conversation, without being redirected to a third-party booking engine.",
    prompt: `Beyond generating a quote, can [BRAND]'s AI close the booking in-conversation — collecting guest details, processing a deposit or full payment, and sending a confirmation — all without redirecting the guest to an external booking engine or requiring staff to be involved?
${FOOTER}`,
  },

  // ── Cluster 3 — Multilingual Support · hsai-multilingual ────────────────────
  {
    feature_id:   "multilingual_detection",
    feature_tag:  "hsai-multilingual",
    feature_name: "Automatic language detection and response",
    description:  "Whether the platform automatically detects the guest's language and responds in that language without any manual configuration per conversation.",
    prompt: `A French guest sends a WhatsApp message in French. Does [BRAND] automatically detect the language and reply in fluent French — without the operator needing to set a language preference or route the message to a different agent? How many languages does it support natively?
${FOOTER}`,
  },
  {
    feature_id:   "multilingual_brand_voice",
    feature_tag:  "hsai-multilingual",
    feature_name: "Brand voice and tone preservation across languages",
    description:  "Whether the platform maintains the property's specific tone, personality, and warmth when responding in different languages — not just literal translation.",
    prompt: `When [BRAND] responds to guests in different languages, does it preserve the warmth, tone, and brand personality of the property — or does it default to generic, literal translations? Can operators customise the AI's voice and personality per language?
${FOOTER}`,
  },

  // ── Cluster 4 — Inquiry Intelligence · hsai-inquiry ─────────────────────────
  {
    feature_id:   "inquiry_intent_detection",
    feature_tag:  "hsai-inquiry",
    feature_name: "Contextual multi-intent detection",
    description:  "Whether the AI can parse multiple distinct intents in a single guest message — availability, activities, logistics, dietary needs — and address each accurately.",
    prompt: `A guest sends a long message that mixes questions about room types, asks about a specific safari package, mentions a dietary restriction, and asks how to get from Nairobi. Can [BRAND] correctly parse all these separate intents and address each one accurately in a single, organised reply — without confusing topics or missing any part of the question?
${FOOTER}`,
  },
  {
    feature_id:   "inquiry_human_handoff",
    feature_tag:  "hsai-inquiry",
    feature_name: "Intelligent human handoff with full context",
    description:  "Whether the platform smoothly escalates to a human agent when needed, passing full conversation history and guest context so the human doesn't start from scratch.",
    prompt: `When [BRAND]'s AI reaches the limit of what it can resolve — a complex complaint, a VIP guest request, or an unusual situation — how does it hand off to a human? Does the human receive the full conversation history, guest profile, and context gathered, so they can pick up seamlessly without re-asking the guest for information already provided?
${FOOTER}`,
  },

  // ── Cluster 5 — Lead Management · hsai-lead ─────────────────────────────────
  {
    feature_id:   "lead_capture",
    feature_tag:  "hsai-lead",
    feature_name: "Automated lead capture with guest data collection",
    description:  "Whether the AI proactively collects guest contact details and travel intent during conversations, creating a lead record without manual input from staff.",
    prompt: `When a guest makes an inquiry but doesn't book, does [BRAND] automatically capture their contact details, travel dates, and preferences — creating a structured lead record in the system that the operator can follow up on — without requiring any manual action from the property team?
${FOOTER}`,
  },
  {
    feature_id:   "lead_followup",
    feature_tag:  "hsai-lead",
    feature_name: "Automated follow-up sequences for unconverted inquiries",
    description:  "Whether the platform automatically sends follow-up messages to guests who inquired but didn't convert, over a defined time period.",
    prompt: `If a guest asks about availability, receives a quote, but goes quiet — does [BRAND] automatically send follow-up messages over the next few days to re-engage them? Can operators customise the timing, tone, and content of these follow-up sequences without developer involvement?
${FOOTER}`,
  },

  // ── Cluster 6 — PMS & Channel Integration · hsai-pms ───────────────────────
  {
    feature_id:   "pms_native_integration",
    feature_tag:  "hsai-pms",
    feature_name: "Native PMS integration",
    description:  "Whether the platform has pre-built, maintained integrations with leading property management systems — allowing the AI to read availability, create reservations, and sync guest data.",
    prompt: `Which property management systems does [BRAND] integrate with natively — for example Cloudbeds, Mews, Opera, RMS, Little Hotelier, or Guesty? Does the integration allow the AI to read live availability, create reservations, and update guest records directly in the PMS — or is it a one-way data pull only?
${FOOTER}`,
  },
  {
    feature_id:   "pms_ota_sync",
    feature_tag:  "hsai-pms",
    feature_name: "OTA channel synchronisation and messaging",
    description:  "Whether the platform syncs with OTAs (Airbnb, Booking.com, Expedia) to centralise messaging and keep availability consistent across channels.",
    prompt: `Does [BRAND] connect with OTA channels like Airbnb, Booking.com, and Expedia — so that guest messages from those platforms are handled by the AI in the same interface, and availability stays in sync across channels to prevent double bookings?
${FOOTER}`,
  },

  // ── Cluster 7 — In-stay & Concierge · hsai-concierge ───────────────────────
  {
    feature_id:   "concierge_inroom_requests",
    feature_tag:  "hsai-concierge",
    feature_name: "In-stay request handling via messaging",
    description:  "Whether the AI handles requests from guests during their stay — housekeeping, F&B, transport, activity bookings — through WhatsApp or SMS without staff relay.",
    prompt: `During a guest's stay, they WhatsApp asking for extra towels, want to book a sundowner game drive for tomorrow, and need a taxi to the airport at 6am. Can [BRAND]'s AI handle all three of these in-stay requests autonomously — logging them internally and confirming back to the guest — without a staff member needing to relay the messages?
${FOOTER}`,
  },
  {
    feature_id:   "concierge_local_recommendations",
    feature_tag:  "hsai-concierge",
    feature_name: "Personalised local activity and experience recommendations",
    description:  "Whether the AI provides tailored, contextual recommendations for local experiences, activities, and dining based on guest preferences and context — not generic list responses.",
    prompt: `A guest staying at a Maasai Mara lodge asks what they should do on their last afternoon before flying out. Can [BRAND] provide specific, personalised recommendations — not a generic list — based on what the guest has already done, their stated interests, and the time and logistics available?
${FOOTER}`,
  },

  // ── Cluster 8 — Upsell & Revenue · hsai-upsell ──────────────────────────────
  {
    feature_id:   "upsell_automated_prompts",
    feature_tag:  "hsai-upsell",
    feature_name: "Proactive upsell and upgrade messaging",
    description:  "Whether the platform automatically identifies and acts on upsell opportunities at appropriate moments — room upgrades, activity add-ons, dining packages — without waiting for the guest to ask.",
    prompt: `Does [BRAND] proactively identify upsell opportunities and send personalised offers to guests — for example, offering a room upgrade 48 hours before arrival, or suggesting a private game drive after a guest books a standard package? Or does upselling only happen when the guest initiates the conversation?
${FOOTER}`,
  },
  {
    feature_id:   "upsell_dynamic_pricing",
    feature_tag:  "hsai-upsell",
    feature_name: "Dynamic pricing or rate recommendation",
    description:  "Whether the platform adjusts or recommends pricing based on demand, occupancy, seasonality, or competitor rates — rather than applying only fixed operator-set rates.",
    prompt: `Does [BRAND] support dynamic pricing — automatically adjusting room rates or package prices based on occupancy, demand signals, or seasonality — or does it apply only fixed rates set manually by the operator? Can the AI recommend rate adjustments to the property team based on booking pace?
${FOOTER}`,
  },

  // ── Cluster 9 — Security & Compliance · hsai-security ───────────────────────
  {
    feature_id:   "security_data_privacy",
    feature_tag:  "hsai-security",
    feature_name: "Data privacy and regulatory compliance (GDPR / local regulations)",
    description:  "Whether the platform handles guest personal data in documented compliance with GDPR and relevant local privacy regulations, with operator control over data retention.",
    prompt: `Hotels collect personal data — names, passport numbers, payment info, travel dates. Does [BRAND] have documented GDPR compliance and data handling policies? Where is guest data stored, and can operators control data retention and deletion? Is there an onshore or regional storage option for markets that require it?
${FOOTER}`,
  },
  {
    feature_id:   "security_payment",
    feature_tag:  "hsai-security",
    feature_name: "Secure payment handling and PCI compliance",
    description:  "Whether the platform handles payment collection in a PCI-compliant manner, protecting card data through tokenised payment links rather than raw card collection in chat.",
    prompt: `When [BRAND] processes deposits or payments through the AI conversation, how is payment security handled? Is the platform PCI-DSS compliant? Does it use tokenised payment links rather than collecting card details directly in chat — protecting guest financial data from exposure through the messaging channel?
${FOOTER}`,
  },

  // ── Cluster 10 — Technical Architecture · hsai-technical ────────────────────
  {
    feature_id:   "technical_api",
    feature_tag:  "hsai-technical",
    feature_name: "API, webhook, and custom integration support",
    description:  "Whether the platform offers open APIs, webhooks, and custom integration options for operators who need to connect non-standard or bespoke internal systems.",
    prompt: `Our property uses a custom-built reservation system and a bespoke activity booking platform that aren't on any standard integration list. Does [BRAND] offer APIs or webhooks that allow us to connect these custom systems — so the AI has live access to our data — or is it limited to its pre-built integrations?
${FOOTER}`,
  },
  {
    feature_id:   "technical_multi_model",
    feature_tag:  "hsai-technical",
    feature_name: "Multi-model AI and custom fine-tuning",
    description:  "Whether the platform uses multiple AI models, allows operators to fine-tune on their own property data, or avoids single-LLM lock-in.",
    prompt: `Is [BRAND] built on a single LLM (e.g. only GPT-4 or only Claude) or does it use multiple AI models — routing different tasks to the most appropriate model? Can operators fine-tune the AI on their own property data, FAQs, and tone of voice? What happens to performance and uptime if a single AI provider has an outage?
${FOOTER}`,
  },

  // ── Cluster 11 — Pricing & ROI · hsai-pricing ───────────────────────────────
  {
    feature_id:   "pricing_model",
    feature_tag:  "hsai-pricing",
    feature_name: "Transparent and predictable pricing model",
    description:  "Whether the platform's pricing is clearly documented and predictable for operators, without hidden per-message or usage-based fees that make costs unpredictable at scale.",
    prompt: `How does [BRAND] charge for its platform — flat monthly fee per property, per conversation, per message, or percentage of bookings generated? Is pricing publicly documented? Are there hidden costs for channel integrations, additional languages, or high message volumes that would make the total cost unpredictable for a busy lodge in peak season?
${FOOTER}`,
  },
  {
    feature_id:   "pricing_roi_metrics",
    feature_tag:  "hsai-pricing",
    feature_name: "Measurable ROI and performance reporting",
    description:  "Whether the platform provides operators with clear analytics on response times, inquiry resolution rates, conversion rates, and revenue attributed to the AI agent.",
    prompt: `Does [BRAND] provide operators with a dashboard or reports showing measurable ROI — for example, how many inquiries the AI resolved without human help, what conversion rate it achieved on leads, how much direct booking revenue it influenced, and how many hours of staff time it saved per week? Are these metrics exportable?
${FOOTER}`,
  },
];

// ── Feature prompt builder ─────────────────────────────────────────────────────

export function buildHsaiFeaturePrompt(feature: HsaiFeature, brandName: string): string {
  return feature.prompt
    .replace(/\[BRAND\]/g, brandName)
    .replace(/\[GROUNDING INSTRUCTION\]/g, HSAI_GROUNDING_INSTRUCTION.replace(/\[BRAND\]/g, brandName))
    .replace(/\[JSON OUTPUT\]/g, HSAI_JSON_OUTPUT_SPEC.replace(/\[BRAND\]/g, brandName));
}

// ── Feature scoring ────────────────────────────────────────────────────────────

type HsaiFeatureRun = {
  has_capability: string | null;
  confidence:     string | null;
  parse_error:    boolean;
  grounded:       boolean;
};

const HSAI_CAPABILITY_SCORE: Record<string, number> = {
  yes: 100, partial: 50, no: 0, not_documented: 0,
};
const HSAI_CONFIDENCE_WEIGHT: Record<string, number> = {
  high: 1.0, medium: 0.75, low: 0.5,
};

export function computeHsaiScore(runs: HsaiFeatureRun[]): {
  score: number | null; score_band: string | null;
  runs_agreeing: number | null; runs_total: number;
  flag_for_review: boolean; flag_reason: string | null;
} {
  const valid = runs.filter((r) => !r.parse_error && r.has_capability !== null);
  const runs_total = valid.length;

  if (runs_total === 0) {
    return { score: null, score_band: null, runs_agreeing: null, runs_total: 0, flag_for_review: true, flag_reason: "all_parse_errors" };
  }

  // Weighted average — grounded runs count double
  let weightedSum = 0, weightSum = 0;
  for (const r of valid) {
    const cap = r.has_capability ?? "not_documented";
    const w   = (HSAI_CONFIDENCE_WEIGHT[r.confidence ?? "medium"] ?? 0.75) * (r.grounded ? 2 : 1);
    weightedSum += (HSAI_CAPABILITY_SCORE[cap] ?? 0) * w;
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

  const flag_for_review = runs_agreeing < Math.ceil(runs_total / 2);
  const flag_reason     = flag_for_review ? `low_consensus_${runs_agreeing}_of_${runs_total}` : null;

  return { score, score_band, runs_agreeing, runs_total, flag_for_review, flag_reason };
}
