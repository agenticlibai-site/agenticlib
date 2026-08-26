// SDAI feature config, prompt templates, and scoring logic.
// 20 features per brand: 2 per cluster × 10 clusters.

// ── Grounding & output templates ───────────────────────────────────────────────

export const SDAI_FEATURE_SYSTEM_PROMPT =
  "You are a competitive intelligence analyst evaluating AI video creation platforms for product and customer success teams. " +
  "For each feature, explain the brand's specific implementation and the practical value it delivers to a team creating customer education videos — not generic feature existence. " +
  "Return ONLY valid JSON matching the exact schema. No markdown, no explanation — just the JSON object.";

export const SDAI_GROUNDING_INSTRUCTION =
  "Only include information specific to [BRAND]'s documented product. " +
  "Do not infer capabilities from what similar tools typically do. " +
  "If you are uncertain whether [BRAND] specifically has this capability for AI video creation, " +
  "set has_capability to not_documented rather than guessing.";

export const SDAI_JSON_OUTPUT_SPEC =
  '{\n' +
  '  "has_capability": "yes|no|partial|not_documented",\n' +
  '  "evidence": "if yes/partial: 1-2 sentences on what [BRAND] specifically does for this capability and what makes its approach useful for a team making customer education videos — describe the mechanism and practical outcome, not just that the feature exists. If no/not_documented: what is absent or unclear.",\n' +
  '  "limitations": "any caveats or gaps",\n' +
  '  "confidence": "high|medium|low",\n' +
  '  "terminology_tags": ["0-3 short named terms (1-4 words each). Return ONLY terms that are a named product feature, branded mechanism, or product-specific integration mentioned in the evidence. Return [] when evidence uses only generic language — most responses should have 0-2 tags. Calibration: GOOD → \\"voice-to-video\\" (named flow), \\"Auto Zoom\\" (named), \\"Notion integration\\" (specific). BAD → \\"AI narration\\" (generic), \\"screen recording\\" (common), \\"video editing\\" (generic). Ask: would this exact phrase appear in a competitor\'s evidence? If yes, return []."]\n' +
  '}';

// ── Locked brand list ──────────────────────────────────────────────────────────
// Populated after Day 1 denylist review of sdai_daily_summary mention data.
// Criteria (applied after reviewing Day 1 data):
//   - AI agent (autonomous AI that produces/records/edits video) OR
//   - AI agent platform (platform whose core product includes an AI agent for video)
// Traditional SaaS with bolted-on AI features → sdai_denylist instead.
// Leave empty until denylist review is complete.
// Feature + sentiment scoring will no-op gracefully until this is populated.
export const LOCKED_SDAI_BRANDS: readonly string[] = [
  // Add verified brands here after Day 1 review
];

// ── Feature definitions ────────────────────────────────────────────────────────

export interface SdaiFeature {
  feature_id:   string;
  feature_tag:  string;
  feature_name: string;
  description:  string;
  prompt:       string;
}

export const SDAI_FEATURES: SdaiFeature[] = [

  // ── Cluster 1 — Screen Recording · sdai-recording ────────────────────────────
  {
    feature_id:   "recording_no_install",
    feature_tag:  "sdai-recording",
    feature_name: "Browser-based recording with no install required",
    description:  "Whether users can record their screen directly in the browser without a desktop app or browser extension.",
    prompt: `Product teams need to record walkthroughs quickly without IT setup or desktop installs. Does [BRAND] let users record their screen directly in a browser — with no desktop app, browser extension, or download required — and immediately start generating a video?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "recording_upload_support",
    feature_tag:  "sdai-recording",
    feature_name: "Upload existing video or support long recordings (10+ min)",
    description:  "Whether users can upload their own video footage or record long flows beyond 5 minutes.",
    prompt: `Teams often already have screen recordings they want to polish, or need to record flows longer than 5 minutes. Does [BRAND] allow users to upload existing video footage for AI production — or support recordings of 10 minutes or longer in a single session?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 2 — AI Production · sdai-production ──────────────────────────────
  {
    feature_id:   "production_auto_zoom",
    feature_tag:  "sdai-production",
    feature_name: "Auto-generated zooms, pacing, pauses and trims",
    description:  "Whether the platform automatically adds zoom effects, adjusts pacing, and trims dead air without manual editing.",
    prompt: `Manually editing zooms, pauses, and pacing in walkthrough videos takes hours. Does [BRAND] automatically generate zoom effects, adjust pacing, trim pauses, and clean up a raw screen recording — producing a professionally paced video without the user touching a timeline?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "production_transitions",
    feature_tag:  "sdai-production",
    feature_name: "Smooth transition slides between recording sections",
    description:  "Whether the platform inserts transition slides or segues between sections of a walkthrough video.",
    prompt: `Customer education videos benefit from clear segues between sections — like a title slide moving into a demo, or one feature flowing into the next. Does [BRAND] automatically insert smooth transition slides or segues between sections of a screen recording to make the video feel like a cohesive, intentional story?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 3 — Voice & Narration · sdai-voice ───────────────────────────────
  {
    feature_id:   "voice_cloning",
    feature_tag:  "sdai-voice",
    feature_name: "Voice cloning from a short sample (under 30 seconds)",
    description:  "Whether the platform clones the user's voice from a brief audio sample and uses it to narrate videos.",
    prompt: `Re-recording narration every time a product changes is a major pain point. Does [BRAND] clone a user's voice from a short sample — 30 seconds or less — and use that cloned voice to narrate videos, so they can update scripts without ever re-recording?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "voice_talking_head",
    feature_tag:  "sdai-voice",
    feature_name: "Talking head avatar that presents on screen",
    description:  "Whether the platform supports a talking head or AI avatar appearing on screen alongside the recording.",
    prompt: `Some teams want a human face in their education videos to build trust without being on camera. Does [BRAND] support a talking head presenter — either a cloned avatar of the user or a stock AI avatar — that appears on screen alongside the screen recording, narrating and presenting the content?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 4 — Captions & Accessibility · sdai-captions ─────────────────────
  {
    feature_id:   "captions_auto",
    feature_tag:  "sdai-captions",
    feature_name: "Automatic caption generation from narration",
    description:  "Whether the platform auto-generates captions from the video's narration or spoken audio.",
    prompt: `Most tutorial and onboarding videos need captions for accessibility and silent viewing. Does [BRAND] automatically generate accurate captions from a video's narration — without the user uploading a transcript or manually typing them?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "captions_styling",
    feature_tag:  "sdai-captions",
    feature_name: "Custom caption styles, presets, or branded formatting",
    description:  "Whether the platform lets teams style captions with custom fonts, colors, positions, or brand-aligned presets.",
    prompt: `Generic white-on-black captions look out of place in polished brand videos. Does [BRAND] let users customise caption styling — setting font, color, position, size, or choosing from branded presets — so captions look intentional rather than an afterthought?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 5 — AI Translations · sdai-translation ───────────────────────────
  {
    feature_id:   "translation_languages",
    feature_tag:  "sdai-translation",
    feature_name: "Multi-language translation (50+ languages)",
    description:  "Whether the platform translates videos into 50 or more languages.",
    prompt: `Global product teams need customer education videos in multiple languages without re-recording each one. Does [BRAND] translate finished videos into 50 or more languages — not just adding text subtitles, but producing a properly localised version?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "translation_narration_regen",
    feature_tag:  "sdai-translation",
    feature_name: "Narration regenerated in target language (not just subtitles)",
    description:  "Whether the platform regenerates the actual narration audio in the translated language rather than just overlaying subtitles.",
    prompt: `Subtitle-only translations still force viewers to listen to a foreign language. Does [BRAND] regenerate the actual narration audio in the translated language — so the video speaks in, for example, Spanish or French — rather than simply adding a subtitle track over the original narration?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 6 — Branding & Templates · sdai-branding ────────────────────────
  {
    feature_id:   "branding_brand_kit",
    feature_tag:  "sdai-branding",
    feature_name: "Custom brand colors, logo watermark, and custom backgrounds",
    description:  "Whether the platform lets teams set brand colors, upload a logo, and use custom background scenes.",
    prompt: `Customer-facing videos need to look like they came from the company's brand, not an off-the-shelf template. Does [BRAND] let teams configure a brand kit — setting their own colors, uploading a logo watermark, and using custom backgrounds — so every video is on-brand out of the box?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "branding_templates",
    feature_tag:  "sdai-branding",
    feature_name: "Reusable templates for consistent branding across all videos",
    description:  "Whether the platform supports saving and reusing branded templates so future videos match an established format.",
    prompt: `Teams creating videos at scale need every video to match the same branded format without redoing the setup each time. Does [BRAND] let users save the full look — layout, fonts, colors, backgrounds, intro/outro — as a reusable template so that future videos automatically inherit the brand without manual reconfiguration?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 7 — AI Agents · sdai-agents ─────────────────────────────────────
  {
    feature_id:   "agents_autonomous_record",
    feature_tag:  "sdai-agents",
    feature_name: "AI agent that autonomously records and navigates app flows",
    description:  "Whether the platform includes an AI agent that can drive a browser, navigate an app, and record the flow without a human doing it.",
    prompt: `Recording every product flow manually takes time and expertise. Does [BRAND] offer an AI agent that can autonomously navigate a web app in a hosted browser — clicking through flows, filling in fields, and recording the walkthrough — without a human driving the session?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "agents_safety",
    feature_tag:  "sdai-agents",
    feature_name: "Agent refuses destructive actions and does not store credentials",
    description:  "Whether the AI recording agent has safety guardrails — refusing deletes/purchases and not persisting user login credentials.",
    prompt: `When an AI agent accesses a live product to record it, teams need confidence it won't cause harm. Does [BRAND]'s AI recording agent explicitly refuse destructive actions — like deleting data or making purchases — and avoid storing the user's login credentials beyond the recording session?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 8 — Distribution & Analytics · sdai-distribution ────────────────
  {
    feature_id:   "distribution_embed",
    feature_tag:  "sdai-distribution",
    feature_name: "Video embedding and shareable link generation",
    description:  "Whether the platform provides shareable video links and embeddable players for help centers, docs, or portals.",
    prompt: `Finished customer education videos need to reach customers — embedded in help centers, shared via link, or published to documentation portals. Does [BRAND] provide shareable video links and an embeddable video player that teams can drop into any web page, help article, or customer portal?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "distribution_analytics",
    feature_tag:  "sdai-distribution",
    feature_name: "View analytics — watches, completion rate, viewer identity",
    description:  "Whether the platform shows who watched a video, how far they got, and engagement metrics.",
    prompt: `Knowing which customers watched a tutorial — and how much they watched — helps teams prioritise follow-up and improve content. Does [BRAND] provide view analytics showing who watched each video, what percentage they completed, and ideally which viewer or company they came from?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 9 — Collaboration · sdai-collab ──────────────────────────────────
  {
    feature_id:   "collab_team_workspace",
    feature_tag:  "sdai-collab",
    feature_name: "Shared team workspace with video library",
    description:  "Whether the platform supports a shared workspace where multiple team members can access, manage, and reuse videos.",
    prompt: `Product and CS teams often have multiple people creating and managing customer education videos. Does [BRAND] provide a shared team workspace — a shared library where members can see, access, and build on each other's video projects — rather than each person working in a separate silo?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "collab_review",
    feature_tag:  "sdai-collab",
    feature_name: "Review and approval workflow for video sign-off",
    description:  "Whether the platform has a review process where team leads or stakeholders can comment on and approve videos before publishing.",
    prompt: `Customer-facing videos often need sign-off from a manager or stakeholder before going live. Does [BRAND] include a review and approval workflow — where a reviewer can comment on specific moments in a video, request changes, and approve or reject it before it's published?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },

  // ── Cluster 10 — Editor Control · sdai-editor ────────────────────────────────
  {
    feature_id:   "editor_timeline",
    feature_tag:  "sdai-editor",
    feature_name: "Timeline editor for precise zoom, trim, and caption control",
    description:  "Whether the platform includes a timeline editor that lets users fine-tune every auto-generated element.",
    prompt: `AI-generated production gets you 80% of the way there — but teams need fine-grained control to finish the last 20%. Does [BRAND] include a timeline editor where users can precisely adjust auto-generated zooms, trims, caption timing, and other elements — without losing the AI production as a starting point?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
  {
    feature_id:   "editor_text_effects",
    feature_tag:  "sdai-editor",
    feature_name: "Text animations and overlay effects on video",
    description:  "Whether the platform lets users add animated text labels, callouts, and visual effects overlaid on the video.",
    prompt: `Tutorial videos often need on-screen text labels, callouts, or animated overlays to draw attention to key UI elements. Does [BRAND] let users add animated text effects — like animated labels, highlight callouts, or overlay cards — directly on top of the video, without needing a separate design tool?
[GROUNDING INSTRUCTION]
Return only the JSON object below. Do not include any explanation, markdown formatting, code blocks, or text before or after the JSON. Your entire response must be valid JSON starting with { and ending with }
[JSON OUTPUT]`,
  },
];

// ── Score computation (mirrors dexify/ralfi pattern) ──────────────────────────

export function computeSdaiScore(runs: {
  has_capability: string | null;
  confidence:     string | null;
  parse_error:    boolean;
  grounded:       boolean;
}[]): {
  score:          number | null;
  score_band:     string | null;
  runs_agreeing:  number;
  runs_total:     number;
  flag_for_review: boolean;
  flag_reason:    string | null;
} {
  const valid = runs.filter((r) => !r.parse_error && r.has_capability !== null);
  if (valid.length === 0) {
    return { score: null, score_band: null, runs_agreeing: 0, runs_total: runs.length, flag_for_review: true, flag_reason: "all_parse_error" };
  }
  const capMap: Record<string, number> = { yes: 100, partial: 50, no: 0, not_documented: 0 };
  const confMap: Record<string, number> = { high: 1.0, medium: 0.85, low: 0.65 };
  let weightedSum = 0, totalWeight = 0;
  for (const r of valid) {
    const cap  = capMap[r.has_capability ?? "not_documented"] ?? 0;
    const conf = confMap[r.confidence ?? "low"] ?? 0.65;
    const w    = r.grounded ? 1.3 : 1.0;
    weightedSum += cap * conf * w;
    totalWeight += w;
  }
  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const score_band = score >= 75 ? "strong" : score >= 40 ? "partial" : score >= 1 ? "weak" : "absent";
  const majority    = Math.ceil(valid.length / 2);
  const notDoc      = valid.filter((r) => r.has_capability === "not_documented").length;
  const allLowConf  = valid.every((r) => r.confidence === "low");
  const flag_for_review = notDoc >= majority || allLowConf;
  const flag_reason = flag_for_review
    ? (notDoc >= majority ? "majority_not_documented" : "all_low_confidence")
    : null;
  const yesCount = valid.filter((r) => r.has_capability === valid[0]?.has_capability).length;
  return { score, score_band, runs_agreeing: yesCount, runs_total: runs.length, flag_for_review, flag_reason };
}

export function buildSdaiFeaturePrompt(feature: SdaiFeature, brandName: string): string {
  return feature.prompt
    .replace(/\[BRAND\]/g, brandName)
    .replace("[GROUNDING INSTRUCTION]", SDAI_GROUNDING_INSTRUCTION.replace(/\[BRAND\]/g, brandName))
    .replace("[JSON OUTPUT]", SDAI_JSON_OUTPUT_SPEC.replace(/\[BRAND\]/g, brandName));
}
