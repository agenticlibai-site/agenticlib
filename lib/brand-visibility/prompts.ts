// Fixed prompt list — do NOT modify or regenerate. All 7 days of collection use this exact set.
export const PROMPTS = [
  { id: 1,  text: "What are the best AI marketing agents right now?",                                      tag: "overall"   },
  { id: 2,  text: "Give me the top 15 AI marketing agents for business growth.",                           tag: "overall"   },
  { id: 3,  text: "Compare the leading AI marketing agents.",                                              tag: "overall"   },
  { id: 4,  text: "What are the most advanced AI marketing agents available today?",                       tag: "overall"   },
  { id: 5,  text: "I run a small business — which AI marketing tools offer the best ROI?",                tag: "overall"   },
  { id: 6,  text: "What AI agents do enterprise marketing teams use?",                                     tag: "overall"   },
  { id: 7,  text: "If I could only choose five AI marketing tools, which ones should I use and why?",     tag: "overall"   },
  { id: 8,  text: "Which AI agents are best for improving paid ads on Meta, Google, and TikTok?",         tag: "ads"       },
  { id: 9,  text: "What AI agents help optimize ad spend and campaign performance?",                       tag: "ads"       },
  { id: 10, text: "Best AI agent for managing paid advertising campaigns",                                 tag: "ads"       },
  { id: 11, text: "What AI agents should I use for content creation and brand voice?",                     tag: "content"   },
  { id: 12, text: "What's the best AI agent for writing marketing copy at scale?",                        tag: "content"   },
  { id: 13, text: "Which AI agents help maintain consistent brand voice across content?",                  tag: "content"   },
  { id: 14, text: "What AI tools give the best marketing analytics and attribution insights?",             tag: "analytics" },
  { id: 15, text: "Best AI agent for marketing performance reporting and analytics",                       tag: "analytics" },
  { id: 16, text: "What AI agents help with lead gen, outreach, and funnel automation?",                  tag: "lead-gen"  },
  { id: 17, text: "Which AI agents are best for automating marketing funnels?",                            tag: "lead-gen"  },
  { id: 18, text: "What AI agents can generate leads automatically?",                                      tag: "lead-gen"  },
  { id: 19, text: "What's the best AI for SEO and content optimization?",                                 tag: "seo"       },
  { id: 20, text: "Which AI agents help improve organic search visibility?",                              tag: "seo"       },
  { id: 21, text: "Can an AI agent manage my social media accounts end-to-end?",                          tag: "social"    },
  { id: 22, text: "Which AI marketing agents have the best ROI?",                                         tag: "overall"   },
] as const;

export type Prompt = (typeof PROMPTS)[number];

// Instructs each model to return ONLY a JSON brands array — no markdown, no explanation.
export const COLLECTION_SYSTEM_PROMPT =
  'You are a market research assistant. Return ONLY valid JSON in this exact format: {"brands": ["Brand A", "Brand B", ...]}' +
  "\n\nList the AI marketing agent or tool brand names that would naturally appear in your response, " +
  "in the order they would appear. Include only distinct brand names. " +
  "No other text, no markdown formatting, no explanation — just the JSON object.";
