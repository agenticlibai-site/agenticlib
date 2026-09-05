// HSAI pipeline — sentiment analysis prompts.
// 6 bucket clusters probing how AI models perceive hospitality AI agent brands.

export const HSAI_SENTIMENT_SYSTEM_PROMPT =
  "You are a hospitality technology reviewer evaluating AI agent platforms for hotel, lodge, and vacation rental operators. " +
  "Assess [BRAND] based on publicly available information — their website, user reviews, industry coverage, and case studies. " +
  "Return ONLY valid JSON matching the exact schema. No markdown, no explanation — just the JSON object.";

export const HSAI_SENTIMENT_JSON_SPEC =
  '{\n' +
  '  "sentiment": "positive|negative|neutral|mixed",\n' +
  '  "confidence": "high|medium|low",\n' +
  '  "descriptors": ["2-5 specific words or short phrases that characterise how [BRAND] is perceived in this context — e.g. \'reliable\', \'clunky setup\', \'strong WhatsApp integration\'"],\n' +
  '  "limitations": "what is unclear, contested, or missing from the public record for [BRAND] in this context"\n' +
  '}';

export interface HsaiSentimentCluster {
  id:        number;
  bucket_tag: string;
  text:       string;
}

const SPEC_FOOTER = `[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]
${HSAI_SENTIMENT_JSON_SPEC}`;

export const HSAI_SENTIMENT_CLUSTERS: HsaiSentimentCluster[] = [

  // ── Overall brand perception ──────────────────────────────────────────────────
  {
    id:         1,
    bucket_tag: "hsai-sent-overall",
    text: `How is [BRAND] generally perceived by hotel, lodge, and vacation rental operators who have used their AI agent platform? Summarise the overall sentiment — what do operators appreciate most, and what are the most common criticisms?
${SPEC_FOOTER}`,
  },

  // ── Ease of setup & onboarding ────────────────────────────────────────────────
  {
    id:         2,
    bucket_tag: "hsai-sent-setup",
    text: `How do hospitality operators describe the setup and onboarding experience with [BRAND]? Is it considered quick to deploy and configure for a hotel or lodge — or do operators report a steep learning curve, long implementation timelines, or heavy reliance on the vendor's team to get live?
${SPEC_FOOTER}`,
  },

  // ── AI response quality ───────────────────────────────────────────────────────
  {
    id:         3,
    bucket_tag: "hsai-sent-ai-quality",
    text: `What do hotel and lodge operators say about the quality of [BRAND]'s AI responses to guests? Are operators confident the AI handles complex, multi-part inquiries accurately and in the right tone — or do they report frequent errors, hallucinations, off-brand replies, or situations where the AI gives guests incorrect information that creates problems?
${SPEC_FOOTER}`,
  },

  // ── Integration reliability ───────────────────────────────────────────────────
  {
    id:         4,
    bucket_tag: "hsai-sent-integration",
    text: `How do operators describe [BRAND]'s integrations with their property management systems and messaging channels like WhatsApp? Are integrations considered reliable and well-maintained — or do users report frequent sync failures, broken OTA connections, or PMS data that falls out of date?
${SPEC_FOOTER}`,
  },

  // ── Support & responsiveness ─────────────────────────────────────────────────
  {
    id:         5,
    bucket_tag: "hsai-sent-support",
    text: `What is the general sentiment around [BRAND]'s customer support for hotel and lodge operators? Are operators confident that help is available quickly when the AI misbehaves or an integration breaks — especially given that guest-facing failures happen in real time, 24/7?
${SPEC_FOOTER}`,
  },

  // ── Value for money ───────────────────────────────────────────────────────────
  {
    id:         6,
    bucket_tag: "hsai-sent-value",
    text: `Do hospitality operators consider [BRAND] good value for money given what it actually delivers? What is the general sentiment around its pricing model — is it seen as affordable and ROI-positive for independent hotels and lodges, or expensive and hard to justify relative to time savings and direct booking impact?
${SPEC_FOOTER}`,
  },
];

export function buildHsaiSentimentPrompt(brand: string, cluster: HsaiSentimentCluster): string {
  return cluster.text.replace(/\[BRAND\]/g, brand);
}
