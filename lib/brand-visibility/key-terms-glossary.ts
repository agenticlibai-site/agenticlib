// Hardcoded per-vertical term glossary used as a backfill fallback for evidence rows
// that pre-date the key_terms column. Terms are checked case-insensitively against
// the evidence text; up to 4 matching terms are returned.
//
// Going forward, new collection runs populate key_terms via the LLM response — no
// glossary lookup is needed for those rows.

const GLOSSARY: Record<string, string[]> = {
  // ── Marketing Ads ────────────────────────────────────────────────────────────
  ads: [
    "ROAS targets",
    "conversion signals",
    "bid adjustments",
    "automated rules",
    "budget pacing",
    "budget reallocation",
    "spend allocation",
    "autonomous bidding",
    "real-time optimization",
    "performance data",
    "click-through rate",
    "Google Ads",
    "Meta Ads",
    "TikTok Ads",
    "cross-channel",
    "ad sets",
    "campaign performance",
    "smart bidding",
  ],

  // ── Marketing Content ────────────────────────────────────────────────────────
  content: [
    "brand voice",
    "tone of voice",
    "copy variants",
    "A/B testing",
    "channel-specific",
    "email subject lines",
    "push notifications",
    "brand guidelines",
    "predictive scoring",
    "performance prediction",
    "multi-channel output",
    "brand consistency",
    "content brief",
    "language model",
    "style training",
    "variant testing",
    "tone examples",
  ],

  // ── Lead Generation ──────────────────────────────────────────────────────────
  "lead-gen": [
    "lead scoring",
    "CRM sync",
    "outreach sequences",
    "A/B testing",
    "engagement signals",
    "reply intent",
    "AI qualification",
    "HubSpot integration",
    "Salesforce integration",
    "inbox warming",
    "bounce monitoring",
    "email deliverability",
    "contact activity",
    "sequence status",
    "warm contacts",
    "high-intent leads",
  ],

  // ── Lifecycle & Retention ────────────────────────────────────────────────────
  lifecycle: [
    "send-time optimization",
    "churn prediction",
    "multi-channel orchestration",
    "re-engagement",
    "Smart Sending",
    "Optimal Send Time",
    "push notifications",
    "in-app messaging",
    "engagement patterns",
    "at-risk accounts",
    "ROI attribution",
    "subscriber inactivity",
    "predictive analytics",
    "Smart Campaigns",
    "drop-off rates",
    "lifecycle journeys",
  ],

  // ── Dexify (Tradie AI) ───────────────────────────────────────────────────────
  "dexify-voice-quote": [
    "voice-to-quote",
    "job cards",
    "conversational quoting",
    "quote capture",
    "branded proposal",
    "itemised pricing",
    "AI receptionist",
    "inbound call",
    "outbound follow-up",
  ],
  "dexify-post-job": [
    "automated invoicing",
    "post-job admin",
    "job notes",
    "Xero integration",
    "QuickBooks",
    "Google Calendar",
    "iCal",
    "Google Workspace",
    "job follow-up",
    "payment collection",
  ],
  "dexify-compliance": [
    "compliance documentation",
    "job safety",
    "certification tracking",
    "regulatory",
    "audit trail",
    "work order",
    "safety checklist",
  ],
  "dexify-client-comms": [
    "inbound triage",
    "warm transfer",
    "appointment booking",
    "24/7 call answering",
    "ServiceM8",
    "Tradify",
    "Fergus",
    "AI scheduling",
    "smart dispatch",
    "automated follow-up",
  ],
  "dexify-general": [
    "self-serve setup",
    "non-technical",
    "onboarding",
    "no IT support",
    "trade business",
    "sole trader",
  ],
};

/**
 * Return glossary terms for a given feature_tag that appear in the given text.
 * Used as a fallback when a feature_response row has no key_terms stored.
 * Returns up to 4 matching terms, ordered by position of first occurrence.
 */
export function glossaryKeyTerms(text: string, featureTag: string): string[] {
  const terms = GLOSSARY[featureTag] ?? [];
  const lowerText = text.toLowerCase();
  return terms
    .filter(t => lowerText.includes(t.toLowerCase()))
    .sort((a, b) => lowerText.indexOf(a.toLowerCase()) - lowerText.indexOf(b.toLowerCase()))
    .slice(0, 4);
}
