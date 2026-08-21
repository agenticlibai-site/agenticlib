// Ralfi sentiment pipeline — brand-level only (no per-cluster sentiment).
// 2 prompts per brand per run. Aggregation reuses the dexify scoring pattern.

export const RALFI_SENTIMENT_SYSTEM_PROMPT =
  "You are a brand analyst evaluating AI agent platforms for insurance brokers. " +
  "Return ONLY valid JSON matching the exact schema provided. " +
  "No markdown, no explanation — just the JSON object.";

// ── Sentiment cluster (single overall bucket) ─────────────────────────────────
// Ralfi pipeline runs brand-level sentiment only — no per-use-case breakdown.
// Both prompts use bucket_tag "overall" and feed the same aggregation table.

export interface RalfiSentimentCluster {
  bucket_tag: string;
  prompt_id:  number;
}

export const RALFI_SENTIMENT_CLUSTERS: RalfiSentimentCluster[] = [
  { bucket_tag: "overall",           prompt_id: 1 },
  { bucket_tag: "overall-criticism", prompt_id: 2 },
];

// ── Prompt builder ────────────────────────────────────────────────────────────

export function buildRalfiSentimentPrompt(brandName: string, bucketTag: string): string {
  if (bucketTag === "overall-criticism") {
    return `I'm researching ${brandName} as an AI agent for insurance brokers. What are the most common criticisms, limitations, or concerns raised about ${brandName} in the insurance broker market? Be specific — vague responses are not useful. Only describe ${brandName} specifically.

Respond in JSON only:
{
  "sentiment": "positive|neutral|negative",
  "confidence": "high|medium|low",
  "descriptors": ["3 to 5 short phrases characterising ${brandName} in the insurance broker context — include at least 1 limitation or concern if any exist"],
  "limitations": ["0 to 3 short phrases describing weaknesses, gaps, or concerns — empty array if genuinely none known"]
}

Guidance: return "neutral" if evidence is mixed, thin, or the brand is under-documented for insurance brokers. Return "negative" only if there are specific known concerns. Return [] for limitations only if genuinely none are documented.`;
  }

  // Default: overall
  return `I'm researching ${brandName} as an AI agent for insurance brokers. Based on what you know about ${brandName}, describe both its strengths AND its limitations or concerns in this context. Be specific — vague praise is not useful.

Only describe ${brandName} specifically — you may reference how it compares to typical alternatives if relevant to explaining a limitation.

Respond in JSON only:
{
  "sentiment": "positive|neutral|negative",
  "confidence": "high|medium|low",
  "descriptors": ["3 to 5 short phrases characterising ${brandName} as an AI agent for insurance brokers — include at least 1 limitation or concern if any exist"],
  "limitations": ["0 to 3 short phrases describing weaknesses, gaps, or concerns — empty array if genuinely none known"]
}

Guidance: return "neutral" if evidence is mixed, thin, or the brand is under-documented for insurance brokers. Return "negative" only if there are specific known concerns (not just absence of praise).`;
}
