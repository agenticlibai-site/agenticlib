// Dexify sentiment pipeline — cluster definitions, prompt building.
// Aggregation and drift logic reused from lib/brand-visibility/sentiment.ts.

export const DEXIFY_SENTIMENT_SYSTEM_PROMPT =
  "You are a brand analyst evaluating AI agent platforms for tradespeople. " +
  "Return ONLY valid JSON matching the exact schema provided. " +
  "No markdown, no explanation — just the JSON object.";

// ── Context phrases per bucket_tag ────────────────────────────────────────────
// Each phrase frames the brand evaluation for a specific tradie use case,
// producing meaningfully different sentiment signals across clusters.

const CONTEXT_PHRASES: Record<string, string> = {
  "overall":      "as a potential AI agent platform for my trade business",
  "voice-quote":  "as an AI agent for generating professional quotes from spoken job descriptions on site",
  "post-job":     "as an AI agent for handling invoicing and post-job admin automatically when a job is complete",
  "compliance":   "as an AI agent for generating safety documentation and compliance records for Australian tradespeople",
  "client-comms": "as an AI agent for handling inbound client enquiries and following up on sent quotes automatically",
};

// ── Cluster definitions ───────────────────────────────────────────────────────
// All 5 clusters apply to all brands — the point is to see how LLMs perceive
// each visible brand in each tradie context Dexify competes in.

export interface DexifySentimentCluster {
  bucket_tag: string;
  prompt_id:  number;
}

export const DEXIFY_SENTIMENT_CLUSTERS: DexifySentimentCluster[] = [
  { bucket_tag: "overall",      prompt_id: 1 },
  { bucket_tag: "voice-quote",  prompt_id: 2 },
  { bucket_tag: "post-job",     prompt_id: 3 },
  { bucket_tag: "compliance",   prompt_id: 4 },
  { bucket_tag: "client-comms", prompt_id: 5 },
];

// ── Prompt builder ────────────────────────────────────────────────────────────

export function buildDexifySentimentPrompt(brandName: string, bucketTag: string): string {
  const phrase = CONTEXT_PHRASES[bucketTag] ?? CONTEXT_PHRASES["overall"];
  return `I'm researching ${brandName} ${phrase}. Based on what you know about ${brandName}, describe both its strengths AND its limitations or concerns as they relate to this specific use case. Be specific — vague praise is not useful.

Only describe ${brandName} specifically — you may reference how it compares to typical alternatives in this category if relevant to explaining a limitation.

Respond in JSON only:
{
  "sentiment": "positive|neutral|negative",
  "confidence": "high|medium|low",
  "descriptors": ["3 to 5 short phrases characterising ${brandName} in this context — include at least 1 limitation or concern if any exist"],
  "limitations": ["0 to 3 short phrases describing weaknesses, gaps, or concerns — empty array if genuinely none known"]
}

Guidance: return "neutral" if evidence is mixed, thin, or the brand is under-documented for this specific use case. Return "negative" only if there are specific known concerns (not just absence of praise).`;
}
