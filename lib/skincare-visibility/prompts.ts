// Fixed prompt list — do NOT modify once collection has started.
// IDs 1–13 are skincare-pipeline-specific and do not overlap with the
// marketing pipeline's prompt IDs (1–22 in a separate table).
export const SKINCARE_PROMPTS = [
  { id: 1,  text: "What are the best AI skincare agents right now?",                                                                 tag: "discovery"    },
  { id: 2,  text: "What AI agents can give me personalized skincare advice?",                                                        tag: "personalized" },
  { id: 3,  text: "Recommend an AI skincare agent",                                                                                  tag: "discovery"    },
  { id: 4,  text: "What are the top AI skincare agents for routines?",                                                               tag: "routines"     },
  { id: 5,  text: "I have acne-prone skin, what AI skincare agent can help me build a routine?",                                     tag: "conditions"   },
  { id: 6,  text: "What's the best AI skincare agent for sensitive skin?",                                                           tag: "conditions"   },
  { id: 7,  text: "Can an AI skincare agent review my current routine and tell me what's not working?",                              tag: "routines"     },
  { id: 8,  text: "What AI skincare agent checks if my products conflict with each other?",                                          tag: "ingredients"  },
  { id: 9,  text: "What AI skincare agent asks questions before recommending a routine?",                                            tag: "personalized" },
  { id: 10, text: "What AI skincare agent analyzes ingredients and tells me if a product suits my skin?",                            tag: "ingredients"  },
  { id: 11, text: "Best AI skincare agent for checking if a product is safe for my skin type",                                       tag: "ingredients"  },
  { id: 12, text: "What AI skincare agent gives evidence-based advice for acne or skin conditions, not just trends?",                tag: "conditions"   },
  { id: 13, text: "Is there an AI skincare agent that tracks my progress and reminds me about my routine?",                          tag: "routines"     },
] as const;

export type SkincarePrompt = (typeof SKINCARE_PROMPTS)[number];

// Instructs each model to return ONLY a JSON brands array — no markdown, no explanation.
// Parallel to the marketing pipeline's COLLECTION_SYSTEM_PROMPT.
export const SKINCARE_SYSTEM_PROMPT =
  'You are a market research assistant. Return ONLY valid JSON in this exact format: {"brands": ["Brand A", "Brand B", ...]}' +
  "\n\nList the AI skincare agent or tool brand names that would naturally appear in your response, " +
  "in the order they would appear. Include only distinct brand names. " +
  "No other text, no markdown formatting, no explanation — just the JSON object." +
  "\n\nCRITICAL: Only include real, currently existing products you have specific knowledge of. " +
  "If you are not confident a product genuinely exists, do not include it. " +
  "It is better to return fewer names than to include uncertain or invented ones.";
