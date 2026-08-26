// SDAI pipeline — AI Video Creation for Customer Education
// Collection system prompt + 39 prompts (9 overall + 30 SoV across 10 clusters × 3).

export const SDAI_COLLECTION_SYSTEM_PROMPT =
  'You are a market research assistant. Return ONLY valid JSON in this exact format: {"brands": ["Brand A", "Brand B", ...]}' +
  "\n\nList every brand name that would naturally appear in your response, in the order they would appear. Include all distinct brand names — do not filter or pre-select. Include every tool, platform, or product that comes up naturally when answering the question." +
  "\n\nNo other text, no markdown formatting, no explanation — just the JSON object.";

export interface SdaiPrompt {
  id:  number;
  tag: string;
  text: string;
}

export const SDAI_PROMPTS: SdaiPrompt[] = [

  // ── Overall Brand Mentions · sdai-overall (9 prompts) ────────────────────────
  { id: 1,  tag: "sdai-overall", text: "What are the best AI tools for creating customer education videos?" },
  { id: 2,  tag: "sdai-overall", text: "Which AI tools turn screen recordings into polished onboarding videos?" },
  { id: 3,  tag: "sdai-overall", text: "What AI video tools do SaaS companies use for customer onboarding and product demos?" },
  { id: 4,  tag: "sdai-overall", text: "Which AI platforms automatically produce professional walkthrough videos from screen recordings?" },
  { id: 5,  tag: "sdai-overall", text: "What AI tools help product teams create how-to and tutorial videos without manual editing?" },
  { id: 6,  tag: "sdai-overall", text: "Which AI video creation tools support voice cloning and AI narration?" },
  { id: 7,  tag: "sdai-overall", text: "What are the best alternatives to Loom for AI-powered video creation?" },
  { id: 8,  tag: "sdai-overall", text: "Which AI tools create customer education videos at scale with minimal effort?" },
  { id: 9,  tag: "sdai-overall", text: "What AI video tools are product and customer success teams adopting in 2025?" },

  // ── Cluster 1 — Screen Recording · sdai-recording (3 prompts) ───────────────
  { id: 10, tag: "sdai-recording", text: "Which AI video tools let you record your screen in the browser without installing anything?" },
  { id: 11, tag: "sdai-recording", text: "What AI tools record app walkthroughs and turn them into tutorial videos?" },
  { id: 12, tag: "sdai-recording", text: "Which AI video platforms support long screen recordings or video uploads for editing?" },

  // ── Cluster 2 — AI Production · sdai-production (3 prompts) ─────────────────
  { id: 13, tag: "sdai-production", text: "Which AI video tools automatically add zooms, transitions, and pacing to screen recordings?" },
  { id: 14, tag: "sdai-production", text: "What AI platforms produce polished demo videos without manual timeline editing?" },
  { id: 15, tag: "sdai-production", text: "Which AI tools automatically trim and enhance screen recordings into professional videos?" },

  // ── Cluster 3 — Voice & Narration · sdai-voice (3 prompts) ──────────────────
  { id: 16, tag: "sdai-voice", text: "Which AI video tools clone your voice for narrating tutorial and onboarding videos?" },
  { id: 17, tag: "sdai-voice", text: "What AI platforms add talking head avatars or voice narration to screen recordings?" },
  { id: 18, tag: "sdai-voice", text: "Which AI video tools narrate walkthrough videos in your own voice without re-recording?" },

  // ── Cluster 4 — Captions & Accessibility · sdai-captions (3 prompts) ─────────
  { id: 19, tag: "sdai-captions", text: "Which AI video tools automatically add styled captions to tutorial and demo videos?" },
  { id: 20, tag: "sdai-captions", text: "What AI platforms generate accurate captions for screen-recorded walkthrough videos?" },
  { id: 21, tag: "sdai-captions", text: "Which AI video tools support custom caption styles and branded subtitle formatting?" },

  // ── Cluster 5 — AI Translations · sdai-translation (3 prompts) ──────────────
  { id: 22, tag: "sdai-translation", text: "Which AI video tools translate onboarding and tutorial videos into multiple languages?" },
  { id: 23, tag: "sdai-translation", text: "What AI platforms regenerate video narration in different languages rather than just adding subtitles?" },
  { id: 24, tag: "sdai-translation", text: "Which AI video tools support localizing product walkthroughs for global audiences?" },

  // ── Cluster 6 — Branding & Templates · sdai-branding (3 prompts) ─────────────
  { id: 25, tag: "sdai-branding", text: "Which AI video tools let teams apply brand colors, logos, and backgrounds to every video?" },
  { id: 26, tag: "sdai-branding", text: "What AI video platforms support reusable branded templates for consistent video output?" },
  { id: 27, tag: "sdai-branding", text: "Which AI tools help product teams keep customer videos on-brand at scale?" },

  // ── Cluster 7 — AI Agents · sdai-agents (3 prompts) ─────────────────────────
  { id: 28, tag: "sdai-agents", text: "Which AI video tools use autonomous agents to record app flows automatically?" },
  { id: 29, tag: "sdai-agents", text: "What AI platforms let an AI agent navigate and record your product without manual recording?" },
  { id: 30, tag: "sdai-agents", text: "Which AI video tools offer automated recording agents that capture app walkthroughs on demand?" },

  // ── Cluster 8 — Distribution & Analytics · sdai-distribution (3 prompts) ─────
  { id: 31, tag: "sdai-distribution", text: "Which AI video tools let you share and embed customer education videos in help centers or portals?" },
  { id: 32, tag: "sdai-distribution", text: "What AI video platforms provide analytics on who watched a tutorial video and for how long?" },
  { id: 33, tag: "sdai-distribution", text: "Which AI video tools support video hosting, shareable links, and viewer engagement tracking?" },

  // ── Cluster 9 — Collaboration · sdai-collab (3 prompts) ──────────────────────
  { id: 34, tag: "sdai-collab", text: "Which AI video platforms support team collaboration on customer education video projects?" },
  { id: 35, tag: "sdai-collab", text: "What AI video tools have review and approval workflows for product and CS teams?" },
  { id: 36, tag: "sdai-collab", text: "Which AI video tools let multiple team members share, edit, and publish from a shared workspace?" },

  // ── Cluster 10 — Editor Control · sdai-editor (3 prompts) ────────────────────
  { id: 37, tag: "sdai-editor", text: "Which AI video tools give you a timeline editor to fine-tune zooms, trims, and captions?" },
  { id: 38, tag: "sdai-editor", text: "What AI video platforms let you add text animations and overlay effects to walkthrough videos?" },
  { id: 39, tag: "sdai-editor", text: "Which AI video tools combine automatic production with manual editing control?" },
];
