// ESAI sentiment pipeline — brand-level sentiment for Australian construction estimating AI agents.
// 2 prompts per brand per run (overall + criticism).

export const ESAI_SENTIMENT_SYSTEM_PROMPT =
  "You are a brand analyst evaluating AI estimating agents for Australian builders, trades and estimators. " +
  "Return ONLY valid JSON matching the exact schema provided. " +
  "No markdown, no explanation — just the JSON object.";

export interface EsaiSentimentCluster {
  bucket_tag: string;
  prompt_id:  number;
}

export const ESAI_SENTIMENT_CLUSTERS: EsaiSentimentCluster[] = [
  { bucket_tag: "overall",           prompt_id: 1 },
  { bucket_tag: "overall-criticism", prompt_id: 2 },
];

export function buildEsaiSentimentPrompt(brandName: string, bucketTag: string): string {
  if (bucketTag === "overall-criticism") {
    return `I'm researching ${brandName} as an AI estimating agent for Australian builders and estimators. What are the most common criticisms, limitations, or concerns raised about ${brandName} in this context? Be specific — vague responses are not useful. Only describe ${brandName} specifically.

Respond in JSON only:
{
  "sentiment": "positive|neutral|negative",
  "confidence": "high|medium|low",
  "descriptors": ["3 to 5 short phrases characterising ${brandName} as an AI estimating tool — include at least 1 limitation or concern if any exist"],
  "limitations": ["0 to 3 short phrases describing weaknesses, gaps, or concerns — empty array if genuinely none known"]
}

Guidance: return "neutral" if evidence is mixed, thin, or the brand is under-documented for construction estimating. Return "negative" only if there are specific known concerns. Return [] for limitations only if genuinely none are documented.`;
  }

  return `I'm researching ${brandName} as an AI estimating agent for Australian builders and estimators. Based on what you know about ${brandName}, describe both its strengths AND its limitations or concerns in this context. Be specific — vague praise is not useful.

Only describe ${brandName} specifically — you may reference how it compares to typical alternatives if relevant to explaining a limitation.

Respond in JSON only:
{
  "sentiment": "positive|neutral|negative",
  "confidence": "high|medium|low",
  "descriptors": ["3 to 5 short phrases characterising ${brandName} as an AI estimating tool — include at least 1 limitation or concern if any exist"],
  "limitations": ["0 to 3 short phrases describing weaknesses, gaps, or concerns — empty array if genuinely none known"]
}

Guidance: return "neutral" if evidence is mixed, thin, or the brand is under-documented in the construction estimating space. Return "negative" only if there are specific known concerns (not just absence of praise).`;
}
