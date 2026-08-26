// SDAI sentiment pipeline — brand-level sentiment for AI video creation platforms.
// 2 prompts per brand per run (overall + criticism). bucket_tag: "overall".

export const SDAI_SENTIMENT_SYSTEM_PROMPT =
  "You are a brand analyst evaluating AI video creation platforms for product and customer success teams. " +
  "Return ONLY valid JSON matching the exact schema provided. " +
  "No markdown, no explanation — just the JSON object.";

export interface SdaiSentimentCluster {
  bucket_tag: string;
  prompt_id:  number;
}

export const SDAI_SENTIMENT_CLUSTERS: SdaiSentimentCluster[] = [
  { bucket_tag: "overall",           prompt_id: 1 },
  { bucket_tag: "overall-criticism", prompt_id: 2 },
];

export function buildSdaiSentimentPrompt(brandName: string, bucketTag: string): string {
  if (bucketTag === "overall-criticism") {
    return `I'm researching ${brandName} as an AI video creation tool for product and customer success teams. What are the most common criticisms, limitations, or concerns raised about ${brandName} in this context? Be specific — vague responses are not useful. Only describe ${brandName} specifically.

Respond in JSON only:
{
  "sentiment": "positive|neutral|negative",
  "confidence": "high|medium|low",
  "descriptors": ["3 to 5 short phrases characterising ${brandName} as an AI video tool — include at least 1 limitation or concern if any exist"],
  "limitations": ["0 to 3 short phrases describing weaknesses, gaps, or concerns — empty array if genuinely none known"]
}

Guidance: return "neutral" if evidence is mixed, thin, or the brand is under-documented for AI video creation. Return "negative" only if there are specific known concerns. Return [] for limitations only if genuinely none are documented.`;
  }

  return `I'm researching ${brandName} as an AI video creation tool for product and customer success teams. Based on what you know about ${brandName}, describe both its strengths AND its limitations or concerns in this context. Be specific — vague praise is not useful.

Only describe ${brandName} specifically — you may reference how it compares to typical alternatives if relevant to explaining a limitation.

Respond in JSON only:
{
  "sentiment": "positive|neutral|negative",
  "confidence": "high|medium|low",
  "descriptors": ["3 to 5 short phrases characterising ${brandName} as an AI video creation tool — include at least 1 limitation or concern if any exist"],
  "limitations": ["0 to 3 short phrases describing weaknesses, gaps, or concerns — empty array if genuinely none known"]
}

Guidance: return "neutral" if evidence is mixed, thin, or the brand is under-documented in the AI video creation space. Return "negative" only if there are specific known concerns (not just absence of praise).`;
}
