"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const NAVY    = "#000000";
const PURPLE  = "#7C3AED";
const MAGENTA = "#C026D3";

const LINE_COLORS = [
  "#7C3AED", "#C026D3", "#2563EB", "#059669", "#DC2626",
  "#D97706", "#0891B2", "#EA580C", "#65A30D", "#BE185D",
  "#84CC16", "#0369A1", "#92400E", "#F43F5E", "#FB923C",
  "#818CF8", "#34D399", "#FCD34D", "#6EE7B7", "#A78BFA",
];

const BRAND_COLOR_MAP: Record<string, string> = {
  "Descript":     "#7C3AED",
  "Synthesia":    "#C026D3",
  "HeyGen":       "#2563EB",
  "Opus Clip":    "#059669",
  "D-ID":         "#DC2626",
  "DeepBrain":    "#D97706",
  "Renderforest": "#0891B2",
};

function getBrandColor(brand: string): string {
  return BRAND_COLOR_MAP[brand] ?? LINE_COLORS[0];
}

const LOCKED_SDAI_BRANDS = new Set([
  "Descript", "Synthesia", "HeyGen", "Opus Clip", "D-ID", "DeepBrain", "Renderforest",
]);

// Primary cluster per brand — for position-by-cluster grid
const BRAND_PRIMARY_CLUSTER: Record<string, string> = {
  "Descript":     "sdai-editor",
  "Synthesia":    "sdai-voice",
  "HeyGen":       "sdai-voice",
  "Opus Clip":    "sdai-captions",
  "D-ID":         "sdai-production",
  "DeepBrain":    "sdai-production",
  "Renderforest": "sdai-production",
};

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface DailyRow        { date: string; brand: string; model: string; cluster_tag: string; mention_count: number; avg_position: number | null }
interface WeeklyRow       { brand: string; model: string; mention_count: number; avg_position: number | null }
interface LLMVisRow       { model: string; visibility_pct: number; total_responses: number }
interface SOVRow          { cluster_tag: string; brand: string; total_appearances: number; sov_pct: number }
interface ClusterPosRow   { cluster_tag: string; brand: string; avg_position: number; appearances: number }
interface FeatureScoreRow { brand_name: string; feature_id: string; feature_tag: string; score: number | null; score_band: string; flagged_for_review: boolean; runs_agreeing?: number | null; runs_total?: number | null; evidence: string | null; has_capability: string | null }
interface SentimentRow    { brand_name: string; bucket_tag: string; positive_count: number; neutral_count: number; negative_count: number; total_count: number; top_descriptors: string[] }
interface SentimentMeta   { dual_model_dates: number; earliest_date: string | null; latest_date: string | null }

interface Props {
  dailySummary:     DailyRow[];
  weeklySummary:    WeeklyRow[];
  llmVisibility:    LLMVisRow[];
  sovData:          SOVRow[];
  clusterPositions: ClusterPosRow[];
  featureScores:    FeatureScoreRow[];
  sentimentData:    { rows: SentimentRow[]; meta: SentimentMeta };
}

// ── Feature config ─────────────────────────────────────────────────────────────
const FEATURE_NAMES: Record<string, string> = {
  recording_no_install:          "Browser recording, no install",
  recording_upload_support:      "Upload or 10+ min recordings",
  production_auto_zoom:          "Auto zoom, pacing & trim",
  production_transitions:        "Transition slides between sections",
  voice_cloning:                 "AI voice cloning from samples",
  voice_talking_head:            "AI talking head / avatar video",
  captions_auto:                 "Auto-generated captions",
  captions_styling:              "Caption styling & branding",
  translation_languages:         "Multi-language translation",
  translation_narration_regen:   "Narration regeneration post-translation",
  branding_brand_kit:            "Brand kit (colours, logo, fonts)",
  branding_templates:            "Video templates & themes",
  agents_autonomous_record:      "Autonomous AI recording agent",
  agents_safety:                 "AI safety & compliance controls",
  distribution_embed:            "Embed & share player",
  distribution_analytics:        "View & engagement analytics",
  collab_team_workspace:         "Team workspace & permissions",
  collab_review:                 "Commenting & review workflow",
  editor_timeline:               "Timeline / multi-track editor",
  editor_text_effects:           "Animated text effects & callouts",
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  recording_no_install:          "Teams need to record walkthroughs without IT setup or browser extensions — instantly, in a tab.",
  recording_upload_support:      "Existing footage or long recordings (10+ min) can be brought in and processed without re-recording.",
  production_auto_zoom:          "The platform automatically adds zoom effects, adjusts pacing, and trims dead air without manual editing.",
  production_transitions:        "Clean transition slides or segues are inserted between sections, making the video feel intentionally structured.",
  voice_cloning:                 "A rep or narrator's voice can be cloned from samples, so any script reads in the same voice.",
  voice_talking_head:            "An AI presenter delivers the script as a talking-head video, removing the need for a human on camera.",
  captions_auto:                 "Captions are generated automatically from the audio track — no manual transcription.",
  captions_styling:              "Caption font, colour, position, and animation can be matched to the brand's own visual identity.",
  translation_languages:         "The video can be translated and dubbed into multiple languages from the same source.",
  translation_narration_regen:   "After translation, the AI voice is regenerated in the new language — lip sync and timing adjusted.",
  branding_brand_kit:            "Logos, brand colours, and fonts are stored in a kit and applied automatically to every video.",
  branding_templates:            "Pre-built video templates speed up creation and enforce a consistent look across the team.",
  agents_autonomous_record:      "An AI agent can record and produce a video autonomously from a brief — no human recording session required.",
  agents_safety:                 "Controls exist to prevent harmful, misleading, or non-compliant AI-generated video output.",
  distribution_embed:            "Videos can be embedded on external pages or shared via a hosted player link.",
  distribution_analytics:        "View counts, watch time, and engagement metrics are tracked per video.",
  collab_team_workspace:         "Multiple team members can work in a shared workspace with role-based access.",
  collab_review:                 "Reviewers can leave timestamped comments on a video before it's published.",
  editor_timeline:               "A full timeline editor allows multi-track, frame-level control over the video.",
  editor_text_effects:           "Animated text callouts, lower thirds, or kinetic titles can be added to highlight key moments.",
};

// Per-brand, per-feature descriptions — shown under each score bar
const BRAND_FEATURE_DESCRIPTIONS: Record<string, Record<string, string>> = {
  recording_no_install: {
    "Descript":     "Descript records screen and webcam via its desktop app — no browser extension is required, but the desktop application does need to be installed. Recording stops and the transcript appears immediately, with the session landing directly on the project timeline ready for text-based editing. This makes it fast for a repeat user but adds friction for a first-time team member who has not yet installed the app. For teams that need a zero-install, browser-tab solution, Descript is not the right fit.",
    "HeyGen":       "HeyGen offers in-browser screen capture with a webcam overlay and no extension required, making it genuinely accessible to new team members without any IT setup. Recordings import automatically into the HeyGen editor for further production — avatar overlays, captions, and multi-language dubbing can all be applied to the captured footage. The browser-based capture is designed for presenter-style screen walkthroughs rather than long multi-track recording sessions. It is a strong fit for teams that want to go from browser tab to polished video without leaving the browser.",
    "Opus Clip":    "Opus Clip does not capture screen sessions natively — users must record externally and then upload the file or provide a YouTube link. The platform's value is in post-processing: repurposing long-form content into social-ready short clips with auto-captions and branding. For a team that already has a capture tool and wants to turn recordings into social clips quickly, Opus Clip fits well. For a team that needs the capture step handled as well, a separate tool is required.",
    "Synthesia":    "Synthesia does not offer screen recording at all. The platform's input is a written script, not a live recording session — it generates avatar presenter videos from text, not from captured footage. Teams using Synthesia are creating training or explainer content where a human on camera is replaced by an AI avatar, not recording app walkthroughs. Any screen content must be imported as a background image or pre-recorded video clip rather than captured live.",
    "D-ID":         "D-ID does not offer screen recording. The platform generates talking-head avatar videos from a photograph and a script — the output is a person speaking to camera, not a screen capture. It is designed for creating spokesperson or narrator videos rather than recording software walkthroughs. Teams looking for product tour or demo recording capabilities would need a separate capture tool alongside D-ID.",
    "DeepBrain":    "DeepBrain is avatar-centric and does not include a native screen recording tool. All videos begin with a written script that an AI avatar then presents — there is no mechanism to capture a live browser session or app walkthrough. Teams that want to create step-by-step product tutorials would need to record the screen separately and import the footage as a background asset within a DeepBrain scene.",
    "Renderforest": "Renderforest does not include screen recording capability of any kind. Videos are assembled from pre-built animated templates and uploaded media assets — the workflow is design-first, not capture-first. It is suited to creating explainer animations, logo reveals, and promotional videos from scratch, not for recording app walkthroughs or software demos.",
  },
  recording_upload_support: {
    "Descript":     "Descript accepts all major video and audio formats on upload, generates a full transcript automatically, and places each file on a multi-track timeline with separate audio, video, and screen layers. Long recordings — including hour-long webinars or podcast sessions — are handled without special treatment. The transcript-first approach means an uploaded 90-minute recording can be edited by deleting words from a text document rather than scrubbing a timeline. This makes Descript unusually fast for editing imported footage compared to traditional timeline editors.",
    "Opus Clip":    "Opus Clip is built entirely around imported long-form video — uploading an existing recording or pasting a YouTube link is the primary starting point for the entire workflow. It accepts direct file uploads and YouTube links as the core input for its clip-generation pipeline. The platform then segments the long-form content into short, high-energy clips with auto-captions and branded overlays. Teams that record webinars, podcasts, or product demos elsewhere and want to repurpose them into social content will find Opus Clip well-matched to this workflow.",
    "HeyGen":       "HeyGen accepts uploaded video as the input for its Video Translate and Video Avatar features — importing existing footage is central to its repurposing and dubbing workflows. A recorded human presenter video can be uploaded and dubbed into 175+ languages or overlaid with an AI avatar while preserving the original lip movements and voice characteristics. This makes HeyGen a strong choice for teams with an existing library of recorded content they want to adapt for new markets or formats without re-recording. Standard file format support covers common export formats from major editing tools.",
    "D-ID":         "D-ID accepts uploaded images and short video clips for face-animation and avatar-overlay workflows — the import is used to re-animate or transform existing visual assets rather than for editing long-form footage. A headshot can be animated to speak a new script, or an existing video can have an AI avatar overlaid. Long-form multi-track editing of uploaded footage is not a supported workflow. Teams looking to edit raw recordings rather than re-animate existing visuals will need a different tool for that step.",
    "Synthesia":    "Synthesia's primary input is a written script, not uploaded video. Some media upload is supported for scene backgrounds and supporting assets, but the platform does not process raw footage for editing. Teams using Synthesia are creating net-new avatar presenter content from scripts rather than editing or repurposing recorded footage. If the goal is to take an existing recording and edit or translate it, Synthesia is not the right tool — HeyGen or Descript would be a better fit for that workflow.",
    "DeepBrain":    "DeepBrain generates videos from scripts and avatar selections rather than processing uploaded footage for editing. Media imports are limited to background images and overlay assets used within avatar scenes. A team cannot upload a raw screen recording or webinar and edit it in DeepBrain — the workflow always starts from a written script that an avatar then narrates. Teams with large libraries of existing recorded content would need a separate editing tool before bringing assets into DeepBrain for avatar presentation.",
    "Renderforest": "Renderforest supports media uploads for use within template slots — a logo, a product image, or a short video clip can be placed within a template design. However, it is not designed for importing raw footage for editorial-style editing or transcription. Long recordings cannot be processed, trimmed, or translated through the Renderforest workflow. The platform is designed for teams creating promotional or explainer content from scratch using pre-built animated templates, not for teams editing existing recordings.",
  },
  production_auto_zoom: {
    "Opus Clip":    "Auto-zoom is Opus Clip's defining capability — the platform analyses the speaker's position and vocal energy frame by frame, then dynamically centres and zooms to emphasise high-energy moments during clip generation. No manual keyframing is needed at any point. The result is a clip that feels edited by a professional social video producer, with tight framing on the speaker during key moments and wider pulls during quieter transitions. This is the feature most consistently cited as Opus Clip's competitive advantage in independent reviews.",
    "Descript":     "Underlord can apply zoom effects timed to transcript events — topic shifts, high-energy phrases, or moments flagged by the AI — rather than requiring manual keyframe placement. The zoom is text-derived, which means it responds to what was said rather than motion in the frame. This approach works well for screen recordings and talking-head videos where the transcript accurately reflects the content structure. Teams editing product walkthroughs can have zoom emphasis added to key steps without touching the timeline directly.",
    "HeyGen":       "HeyGen applies camera movement and zoom presets to avatar presenter videos — a simulated push-in, pan, or dynamic crop — to make the final output feel less static. These are template-configured camera movements rather than content-aware automatic zoom applied to real-world footage. It does not analyse imported video and track the speaker to apply dynamic zoom — that capability is not part of the HeyGen workflow. Teams creating scripted avatar presentations will find the presets sufficient; teams needing speaker-tracking zoom on recorded footage should look at Opus Clip or Descript.",
    "Synthesia":    "Synthesia's avatar scenes use fixed or pre-set camera angles configured at the scene level. Zoom-style effects are applied through template selection rather than automatic content analysis of what was said or who is on screen. Enterprise templates may include camera movement animations, but these are designer-defined and applied uniformly rather than adapted to the content of each video. For teams that need dynamic, content-aware zoom on real-world recordings, Synthesia is not the right tool.",
    "D-ID":         "D-ID applies controlled camera movements — pans and slow pushes — to avatar-generated content as a production polish option. These are preset animations attached to the avatar sequence rather than automatic speaker-tracking applied to imported footage. Real-world screen recording or presenter footage is not analysed for dynamic zoom. The camera movement options in D-ID are more comparable to a subtle production effect than a clip-generation zoom system like Opus Clip's.",
    "DeepBrain":    "DeepBrain supports camera movement presets within avatar scene templates — pushes, pans, and zoom transitions can be selected during scene setup. These are fixed animations tied to the template rather than dynamic zoom generated from analysing the content or the speaker's energy. A team producing training videos from scripts will find these presets add some visual variety without needing manual keyframing. Content-aware dynamic zoom based on speech analysis is not a supported feature.",
    "Renderforest": "Camera movement and zoom effects are available within Renderforest's animated templates, but they are baked into the template design rather than applied based on the video content. Every instance of a given template will use the same camera movement sequence regardless of what is on screen. Teams creating logo reveals or explainer animations will benefit from these effects, but teams needing adaptive auto-zoom on recorded footage would find Renderforest unsuitable for that use case.",
  },
  production_transitions: {
    "Descript":     "Underlord analyses pacing and filler words to suggest cut points rather than inserting stylistic transitions between segments. Standard transition effects — cuts, dissolves, and fades — are available in the timeline editor for manual application between clips. The platform's strength is in cutting content down intelligently rather than decorating the cuts with visual transitions. Teams that need structured section separators or motion-graphics-style transitions between chapters will likely need to add these manually or export to a motion graphics tool.",
    "Opus Clip":    "Clip boundaries and transition styles are selected automatically during the repurposing workflow — the platform chooses edit points that maintain energy and flow, then applies matching visual transitions. The output is a social-ready clip with cuts that feel intentional rather than abrupt. Transition style options can be adjusted within the clip editor, but the automatic selection means most teams do not need to configure this manually. The transitions are optimised for short-form social video rather than long-form structured training content.",
    "HeyGen":       "Scene transitions between avatar segments are available within HeyGen's video editor — cuts, fades, and wipes can be selected for the boundary between each scene. Templates include pre-set transition styles that match the overall visual design of the chosen layout. Teams creating multi-section training or presentation videos will find the transition options sufficient for a professional result. The transitions are selected per-scene rather than applied automatically based on content analysis.",
    "Synthesia":    "Synthesia's multi-scene format includes defined entry and exit points per scene, with transition styles configurable in the script and scene editor. Each scene can have a different entry animation and transition to the next, allowing a structured chapter-by-chapter video to feel polished without manual editing. Enterprise teams can lock transition styles within a brand template so all team-produced videos maintain consistent visual structure. The transition library is more limited than a dedicated motion graphics tool but sufficient for L&D and corporate communication use cases.",
    "D-ID":         "Transitions between avatar scenes can be configured within the Creative Reality Studio interface — basic cuts, fades, and wipes are available between segments. The options are functional but less extensive than full-featured video editors or motion graphics platforms. Teams producing multi-section avatar content will find the transitions sufficient for a professional finish. The main constraint is that transitions are applied manually per-scene rather than suggested automatically.",
    "DeepBrain":    "Pre-defined transition styles are available between scenes in DeepBrain's multi-scene avatar video editor, and template sets include matching transition themes so the visual language stays consistent across a multi-section video. Teams producing corporate training or onboarding content will find these transitions cover common professional needs. The options are more limited than a dedicated video editing tool, but the template-matched approach means transitions are applied consistently without manual configuration.",
    "Renderforest": "A library of transition styles is available within the Renderforest template editor, applied between video segments and motion graphics sequences as part of the template design. Many templates include designed transition sequences that are part of the overall animation system — these are not editable as freely as in a timeline editor. Teams using Renderforest for promotional or explainer content will find the built-in transitions match the visual style of the chosen template without requiring additional configuration.",
  },
  voice_cloning: {
    "Descript":     "Descript's Overdub creates a text-to-speech clone of a speaker's voice from a recorded sample — typically a few minutes of clean audio. Any future script edit in the Descript timeline can then be re-narrated automatically in the cloned voice without a new recording session. This is particularly useful for correcting mistakes or updating outdated sections of a recorded video without re-shooting the entire piece. The cloned voice is tied to the consenting speaker's Descript account, and a spoken consent statement is required at creation time to prevent misuse.",
    "HeyGen":       "HeyGen Voice Clone generates a branded AI voice from a short audio sample — as little as two minutes of clean speech — that can then narrate any script consistently across multiple videos. The cloned voice eliminates repeated recording for teams that produce high video volumes with a consistent narrator, such as a weekly product update series or a recurring training curriculum. Cloned voices are available across all video types on eligible plans and can be paired with an avatar for a fully synthetic presenter. Explicit consent from the voice owner is required during the cloning process.",
    "Synthesia":    "Synthesia supports custom AI voice creation and voice cloning through its enterprise tier, allowing an organisation to deploy a consistent branded narrator voice across its entire avatar video library. Cloned voices are tightly integrated with avatar templates — the same voice can be applied across different avatar identities while maintaining recognisable consistency. This is particularly valuable for L&D teams that produce training content at scale and need every module to sound like the same authoritative voice. Enterprise approval is required before a cloned voice can be deployed across the workspace.",
    "D-ID":         "D-ID supports voice synthesis alongside its avatar generation workflow, allowing a cloned or custom voice to drive a photorealistic talking-head in synchronised lip-animation. Voice and visual are rendered together in a single pipeline — the avatar's mouth movements are generated to match the synthesised speech frame by frame. This makes D-ID a strong choice for teams that need a realistic human spokesperson without access to a camera crew, particularly for one-off announcements or product updates where recording is impractical.",
    "DeepBrain":    "DeepBrain offers custom AI voice creation as part of its avatar production workflow, with each voice clone associated with a specific avatar persona for consistent output across that persona's video library. Teams building a branded AI spokesperson — such as a company ambassador avatar — can pair a distinctive voice with a distinctive avatar and maintain both consistently across all future content. The voice creation process requires a sample recording from the consenting individual and is available on enterprise plans.",
    "Opus Clip":    "Opus Clip does not natively support voice cloning — the platform uses the existing audio track from uploaded recordings rather than generating new synthesised speech. Its strength is in repurposing existing recorded content rather than creating new narration from text. Teams that need to re-narrate corrected scripts, produce content in a consistent voice without re-recording, or generate narration for an AI avatar would need a separate voice cloning tool outside of Opus Clip's workflow.",
    "Renderforest": "Renderforest does not offer voice cloning. Text-to-speech functionality within the platform uses a pre-built voice library — teams can select from available synthetic voices but cannot clone a specific person's voice. For teams that want branded narration in a unique or proprietary voice, a separate voice cloning tool would be required before importing the audio as a Renderforest asset.",
  },
  voice_talking_head: {
    "Synthesia":    "Synthesia's core product is a library of 240+ AI presenter avatars that lip-sync to any script with realistic facial expressions, natural blinking, and subtle body language — no camera or human presenter is required at any stage of production. Avatars are available in multiple ethnicities, styles, and backgrounds, and enterprise accounts can commission a custom avatar based on a consented individual. The same avatar can present the same script in 130+ languages without re-recording or re-shooting. This makes Synthesia the most mature and scalable talking-head avatar platform in the competitive set.",
    "HeyGen":       "HeyGen generates photorealistic avatar presenters either from a short video sample of a real person or from its pre-built library of diverse avatar identities, with accurate lip sync across 175+ languages and matching facial expressions. Custom avatars created from a video sample typically require only 2-5 minutes of recorded footage to produce a usable result. The output is a convincing on-camera presenter that can narrate any script without access to a studio or camera crew. HeyGen's real-time avatar and instant avatar features make this one of the fastest avatar creation workflows available.",
    "D-ID":         "D-ID animates a single still photograph into a realistic talking-head video — the photograph is all that is required to create a speaking avatar. This is a significantly lower barrier to entry than Synthesia or HeyGen, which require either video footage or a large pre-built library. D-ID is particularly useful for creating spokesperson content from headshots — a team photo, a CEO portrait, or a product mascot image can all be turned into a speaking presenter in minutes. The trade-off is that the output is less expressive than a full-body video-trained avatar.",
    "DeepBrain":    "DeepBrain's core product is enterprise-grade photorealistic AI avatars, with the platform's primary market being corporate L&D and broadcast-quality training video production. Avatars present any script at broadcast-quality resolution with natural lighting, realistic expression, and professional staging. The platform is particularly strong for regulated industries — finance, healthcare, and legal — where a professional, consistent on-camera presenter is required for compliance-grade training content. Custom avatar creation from a consented individual is available on enterprise plans.",
    "Descript":     "Descript includes an AI avatar and Green Screen feature, but talking-head avatar generation is a secondary capability compared to its primary strength of text-based editing of real recorded footage. The avatar feature allows a presenter to be generated for a script, but the depth, variety, and realism of Descript's avatars is not comparable to specialist platforms like Synthesia or HeyGen. Teams whose primary need is avatar-based content creation would be better served by a dedicated avatar platform, with Descript reserved for editing real recordings.",
    "Opus Clip":    "Opus Clip repurposes existing video recordings rather than synthesising new presenter content — the platform's AI works on real footage that has already been recorded. Talking-head avatar generation from a script is not a supported feature. Teams that need to produce presenter videos without a camera or recording session would need to use a separate avatar platform such as Synthesia or HeyGen and then potentially import the output into Opus Clip for social repurposing.",
    "Renderforest": "Renderforest provides animated characters and illustrated presenter figures within certain animated templates, but does not support photorealistic talking-head avatar generation from scripts or photos. The animated characters are design assets baked into the template rather than AI-generated human presenters. Teams that need a photorealistic AI spokesperson would need a dedicated avatar platform — Renderforest is suited to animated explainer content rather than realistic presenter video.",
  },
  captions_auto: {
    "Descript":     "Captions are generated automatically from the project transcript on every recording — because the transcript is the source of truth for the entire editing workflow, caption accuracy is exceptionally high from the moment a recording stops. Captions are fully editable in the transcript view before export, so a single text correction simultaneously fixes both the narration and the caption. Styled caption exports, SRT files, and embedded caption overlays are all supported. This makes Descript one of the most accurate and editable auto-caption tools in the competitive set.",
    "Opus Clip":    "Auto-captions are generated on every clip with animated word-by-word highlighting — this is designed specifically for social video, where viewers often watch without sound and attention is held by the text animation. Caption accuracy is high because Opus Clip's processing pipeline prioritises this as a primary output rather than a secondary feature. Multiple caption style presets are available to match different social platform aesthetics. Teams producing short-form social content from existing recordings will find Opus Clip's captions significantly faster to produce than manual subtitle workflows.",
    "HeyGen":       "Auto-captions are generated for both avatar videos and imported footage, with accuracy tied to the quality of the script or the audio clarity of the recording. HeyGen offers caption styling and animation options that are designed for social-ready output — word-highlight animations, font customisation, and position control are all available. Captions are generated within the HeyGen editor and can be reviewed and corrected before the final export. For teams producing multi-language videos, captions are generated in the target language alongside the dubbed audio track.",
    "Synthesia":    "Captions are generated from the known script that drives the avatar — because the platform knows exactly what was said before rendering, caption accuracy is 100% by design. Captions can be toggled on or off per video and are available in the script's source language by default. For multi-language videos, captions are generated in each target language and aligned precisely with the dubbed audio track. Enterprise accounts can configure caption display as part of the brand template, ensuring consistent caption presentation across all team-produced videos.",
    "DeepBrain":    "Auto-captions are derived from the script used to produce the avatar video, so accuracy is guaranteed — the text source is known before rendering rather than inferred from audio after the fact. This gives DeepBrain a structural advantage for caption quality over platforms that transcribe recorded speech. Caption display and styling options are available within the video editor before export. Teams producing compliance-grade or accessibility-critical training content will find script-derived captions a significant reliability advantage.",
    "Renderforest": "Captions can be added as text overlays within Renderforest templates, but there is no automatic speech-to-text captioning engine. A team must write or paste caption text manually into the template editor. This is workable for short, scripted video content where the text is already known, but not practical for long-form recordings that need accurate transcription. Teams with accessibility or caption requirements would need to generate captions externally and then import them as text elements within the Renderforest template.",
    "D-ID":         "Caption support in D-ID is available as a post-processing text overlay rather than as a fully integrated transcription and caption workflow. Captions are added after the avatar video is generated, and the caption text must be provided by the user rather than auto-generated from the avatar's speech. This is a meaningful limitation for teams who need accurate, auto-generated captions as part of the production process. Specialist captioning is not a primary focus of D-ID's product development.",
  },
  captions_styling: {
    "Opus Clip":    "Caption styling is one of Opus Clip's strongest features and a core differentiator from generic editing tools — font family, colour, size, stroke, shadow, word-highlight colour, and animation style are all independently customisable. Branded preset styles can be saved and applied automatically to every new clip, so a team's visual language is enforced without manual configuration on each video. Social-platform-specific presets — TikTok, Instagram Reels, YouTube Shorts — are available as starting points. The result is caption-led social video that feels deliberately designed rather than auto-generated.",
    "Descript":     "Caption styling in Descript supports font and colour customisation within the layout editor, covering the common needs of branded content without requiring a separate design tool. The styling options are less extensive than dedicated social caption tools like Opus Clip, but are sufficient for webinar recordings, product demos, and professional tutorial content. Caption style can be applied globally across a project rather than configured per clip. Teams with strict brand requirements for highly animated or heavily styled social captions may find Descript's options limiting.",
    "HeyGen":       "Caption style options within HeyGen's editor include font, colour, position, and animation style, with social-optimised presets for common platform formats including vertical video ratios. Styled captions are designed to match the overall visual language of the chosen video template. Teams producing a mix of avatar presenter content and imported footage will find that caption styling options are consistent across both workflows within HeyGen. More advanced caption animation — such as Opus Clip-style word-by-word highlighting — is less pronounced.",
    "Synthesia":    "Captions in Synthesia support language-specific font rendering — critical for non-Latin scripts like Arabic, Hindi, or Chinese — and can be styled within the scene template to match the brand's visual identity. Enterprise templates enforce consistent caption presentation across all team-produced videos, so an administrator can define the approved caption style once and lock it for the entire workspace. This level of governance makes Synthesia the strongest choice for large teams or regulated industries where visual consistency and accessibility compliance are non-negotiable requirements.",
    "Renderforest": "Text style options are available through the Renderforest template editor, with font, colour, and size selection tied to the template's overall design system. Caption customisation is constrained by the template structure — not every position or style combination is available in every template. Teams whose branding requirements are closely matched by an existing Renderforest template will find the styling sufficient, but teams with precise brand typography requirements may find the template constraints limiting.",
    "DeepBrain":    "Font and colour options for captions are supported within DeepBrain's video editor, covering the essential styling needs for corporate training and onboarding content. Animation options for captions are present but limited — basic lower-third reveals are available rather than the animated word-by-word highlighting found in dedicated social caption tools. For professional corporate video content where captions need to be legible and on-brand rather than highly animated, DeepBrain's styling options are adequate.",
    "D-ID":         "Caption styling in D-ID is limited — the platform's primary output is the avatar video, and caption presentation is a secondary and less developed part of the product. Basic font and position options are available, but animated captions, word-highlighting, and brand preset systems are not part of the D-ID workflow. Teams with significant caption styling needs would be better served applying caption overlays in a post-production tool after exporting from D-ID.",
  },
  translation_languages: {
    "Synthesia":    "Synthesia generates avatar videos natively in 130+ languages with localised voiceovers and lip-synced avatars — the same script is rendered from scratch in each target language rather than dubbing over existing footage. No source video re-recording is required at any stage: the workflow is write script once, render in every language. This makes Synthesia the most scalable translation-to-video solution for teams producing L&D, onboarding, or compliance content across global markets. Language selection happens at the scene level, and a translated video can be produced in minutes from a finished script.",
    "HeyGen":       "HeyGen Video Translate converts an existing video — a recorded human presenter or imported footage — into 175+ languages, preserving the original speaker's voice characteristics, lip movements, and expressions with accurate lip-syncing to the new translated audio. This is the highest language count in the competitive set for dubbed video translation. The output preserves the speaker's voice identity in the translated version rather than substituting a generic synthetic voice, which is critical for teams that have an established presenter identity they want to carry across markets.",
    "Opus Clip":    "Opus Clip translates video captions into 30+ languages, making it useful for producing subtitled versions of social content for international audiences. However, translation is subtitle-only — the audio track is not touched, meaning the original speech plays underneath foreign-language captions. This is effective for audiences who can read the target language and tolerate the source-language audio, but is not equivalent to full dubbing or narration regeneration. Teams that need true multilingual video — where the audio itself speaks the target language — need a different platform.",
    "Descript":     "Descript transcribes recordings in multiple languages and supports some transcript-level translation, but full AI dubbing into other languages with synchronised lip movements is limited and not a core capability. Translation in Descript is primarily a text operation on the transcript rather than a full audio-visual replacement. Teams that need to produce genuinely dubbed multilingual video — where the narration is regenerated in the target language — would need to use HeyGen or Synthesia for that step and potentially import the result back into Descript for final editing.",
    "D-ID":         "D-ID supports video translation and dubbing with the avatar's lip movements re-generated in the target language — meaning the avatar speaks the translated audio natively rather than the original language being post-dubbed. This produces a more natural result than subtitle-only translation because the mouth animation matches the translated speech. The translation capability is available through the D-ID API and Studio interface, making it accessible for both developer-led and no-code workflows. Language support covers the major global markets.",
    "DeepBrain":    "DeepBrain generates multilingual avatar videos by narrating the script in the chosen language at video creation time rather than dubbing over existing footage. The avatar speaks the target language natively — both the voice and lip animation are generated fresh for each language version from the same script. This is a fully regenerated multilingual output rather than a post-processed translation. Teams producing training content for global workforces can produce language variants from a single script without any re-recording or re-shooting.",
    "Renderforest": "Renderforest does not offer automated video translation or audio dubbing at any tier. Producing a language variant of a Renderforest video requires manually duplicating the project, replacing all text elements in the template editor, and recording or sourcing new voiceover audio separately. This manual process is workable for teams producing a small number of language variants but does not scale for teams with ongoing multilingual content needs.",
  },
  translation_narration_regen: {
    "Synthesia":    "Narration is regenerated natively for each language — the avatar speaks the target language from the script from the start of the render pipeline, rather than overdubbing an existing audio track. This produces authentic lip sync and natural intonation because the mouth animation is generated to match the target language's phonetics rather than mapped to the source language's timing. The result is a video that sounds like it was originally recorded in the target language rather than translated after the fact. For teams producing L&D content across 10+ language markets, this regeneration approach eliminates the uncanny-valley timing that characterises post-dubbed video.",
    "HeyGen":       "HeyGen regenerates narration in the target language using the original speaker's cloned voice, maintaining consistent voice identity — including distinctive tone and cadence characteristics — across all language versions of the same video. The lip movements in the translated version are re-generated to match the translated audio rather than stretched or compressed to fit the original timing. This preserves the speaker's identity across markets, which is valuable for teams where the presenter is a recognised brand voice. The Voice Clone feature is required for this workflow, which adds a one-time setup step.",
    "D-ID":         "D-ID re-generates both the avatar's speech and lip movements in the target language, producing a native-sounding translated version using the same avatar identity and source script. The re-generation approach means the translated video does not show the lip-timing mismatches typical of post-dubbed content. This makes D-ID a practical choice for teams that need translated avatar video without a separate dubbing studio. Language support covers major global markets and the output is available through both the Studio interface and the API.",
    "DeepBrain":    "DeepBrain generates new narration in the target language from the same avatar, with both voice synthesis and lip animation updated to match the translated script from the ground up. The translated video is effectively a new render from the same script and avatar configuration — not a dub applied to an existing video. Teams producing training content in multiple languages can work from a single master script and generate each language variant without additional recording or manual audio post-production. This approach scales well for high-volume multilingual content programmes.",
    "Descript":     "Overdub can re-narrate script changes and corrections in a cloned voice, but cross-language narration regeneration with synchronised lip movements is not a current core Descript capability. Full multilingual dubbing — where the audio track and lip animation are both replaced to match a target language — is not supported in the Descript workflow. Teams that need this capability should use Synthesia or HeyGen for the multilingual step and then import the resulting video into Descript if additional editing is required.",
    "Opus Clip":    "Opus Clip does not regenerate narration for translation — the source audio track is not touched and cannot be replaced with a synthesised version in another language. Translation in Opus Clip is a caption overlay applied to the original audio, not a regenerated multilingual output. Teams that need the actual spoken narration to be in the target language — for audiences who do not speak the source language or for accessibility compliance — would need a full narration regeneration tool outside of Opus Clip.",
    "Renderforest": "Renderforest does not support narration regeneration for translation at any tier. Audio tracks must be recorded separately and replaced manually for each language variant. A team producing a translated version of a Renderforest video must source a new voice recording in the target language, import it as a replacement audio asset, and adjust any timing that does not align with the new narration. This is a significant production overhead for teams with recurring multilingual content needs.",
  },
  branding_brand_kit: {
    "Descript":     "Descript's Brand Studio stores colours, fonts, logo assets, and background presets for automatic application across all video projects within a team workspace. Templates created within the workspace are stamped with the brand identity from the start, so a new team member producing their first video will use approved brand assets by default without needing a designer's involvement. Brand kit access is available on Creator and Pro plans, making it accessible to small teams as well as enterprise deployments. Logo placement, background colour, and font selection within the kit all propagate automatically to new projects.",
    "Synthesia":    "Enterprise accounts in Synthesia apply a full brand kit — logo, fonts, approved colour palette, and template lock — to all avatar video templates across the workspace. Brand consistency is enforced at the workspace administrator level, meaning individual team members cannot deviate from approved visual standards without an administrator override. This level of governance is particularly valuable for regulated industries or large organisations where off-brand content creates compliance or reputational risk. A custom avatar can also be part of the brand kit, ensuring the same AI presenter appears across all company videos.",
    "HeyGen":       "HeyGen's Brand Kit stores logo, brand colours, and approved fonts for automatic application across video templates — available on Business and Enterprise plans. Once a kit is configured, every team member's new video defaults to approved brand assets, reducing the time spent on visual configuration and eliminating common mistakes like outdated logos or wrong colour hex values. HeyGen also allows custom avatar personas to be stored in the brand kit so a consistent AI spokesperson appears across all team-produced content.",
    "Renderforest": "Brand kits are one of Renderforest's strongest and most consistently praised capabilities — logos, brand colours, and font pairs are stored once and applied automatically across every template in the library. This is particularly powerful given Renderforest's template breadth: a single brand kit configuration ensures visual consistency whether a team member is producing a logo animation, a social media story, or an explainer video. Teams with a high volume of varied content formats benefit significantly from the automatic application rather than manual colour-matching per project.",
    "Opus Clip":    "Branding elements — logo placement, brand colour palette, and intro/outro sequences — are saved as a brand preset and applied automatically to every generated clip. This ensures that a team's high-volume social output maintains consistent visual identity without per-clip manual configuration. The brand kit in Opus Clip is specifically designed for short-form social content workflows where clips are produced at scale: tens or hundreds of clips from a single long-form video should all carry the same logo and colours automatically.",
    "DeepBrain":    "Brand kits in DeepBrain cover background colours, logo placement, and font selection for titles and lower-thirds, and can be applied to avatar video templates across the workspace. A team producing ongoing training or communication content from a consistent set of brand guidelines will find the brand kit reduces per-video setup time significantly. The brand kit applies to the avatar video templates rather than to individual asset slots, so the visual frame of the video — stage, background, text elements — reflects the brand configuration consistently.",
    "D-ID":         "Background and overlay customisation is available in D-ID, and logo assets can be placed within the video layout, but D-ID's brand kit feature is less comprehensive and automated than dedicated video production platforms. Custom branding — particularly ensuring consistent font use, colour palettes, and logo sizing — requires more manual configuration per video rather than drawing from a stored kit. Teams with high brand consistency requirements would find D-ID's branding tools a secondary consideration compared to the platform's primary talking-head generation capability.",
  },
  branding_templates: {
    "Renderforest": "Renderforest's core product is a library of thousands of animated video templates covering explainer videos, social content, logo reveals, presentations, promotional pieces, and corporate communications. Template variety is the platform's defining competitive advantage — virtually any type of branded video content can be started from an existing template and customised to brand specifications. New templates are added regularly and span a wide range of industries and use cases. Teams with diverse content format needs will find Renderforest's breadth hard to match from a single platform.",
    "Synthesia":    "Synthesia provides a library of professionally designed avatar video templates with scene layouts, avatar positioning, transition styles, and background options curated for L&D, HR, and corporate communications use cases. Enterprise teams can create and lock custom templates that encode the brand's approved avatar, background, font, and colour choices — ensuring every team member's video is on-brand without requiring design input. The template library grows regularly, and enterprise accounts can commission fully custom templates aligned to specific campaign or compliance requirements.",
    "HeyGen":       "HeyGen's template library covers avatar presenter layouts for training, marketing, social, and product content — covering the main use cases for teams producing scripted video at scale. Templates are fully customisable within the HeyGen editor: avatar, background, text, and layout can all be adjusted to match brand requirements. Social platform-specific templates — including vertical video for TikTok and Instagram — are included alongside widescreen formats for presentations and training modules. Teams can save customised templates for reuse across the team.",
    "Descript":     "Descript includes layout templates and intro/outro presets for framing recordings in a polished, branded wrapper. The template options are simpler than dedicated template-first platforms like Renderforest — they cover common needs like title cards, lower-thirds, and end screens but do not include complex animated sequences. For teams focused on editing and repurposing recorded content, Descript's templates are sufficient and integrate naturally with the text-based editing workflow. Teams needing a wider range of animated or highly designed video formats would need a separate tool.",
    "Opus Clip":    "Social content templates for formatted short clips — including animated caption styles, hook text overlays, and CTA end cards — are available in Opus Clip, optimised for vertical video and the major short-form social platforms. The templates are designed for the specific visual language of TikTok, Instagram Reels, and YouTube Shorts rather than for long-form or presentation-style content. Teams producing a high volume of social content from repurposed long-form recordings will find the template system significantly reduces the time required to produce platform-ready output.",
    "DeepBrain":    "DeepBrain includes template sets for training and corporate communication scenarios, covering stage design, background, avatar layout, and text placement for common use cases like onboarding modules, product training, and compliance briefings. The template library is narrower than Renderforest but more relevant to DeepBrain's target market of enterprise L&D teams. Custom templates can be configured at the enterprise level and locked for workspace-wide use, ensuring consistent visual standards without per-video designer involvement.",
    "D-ID":         "Scene and background templates are available for avatar video production in D-ID, but the template variety is more limited than dedicated template-first platforms. The focus is on quick setup of talking-head presenter content rather than on a broad range of animated design styles. Teams producing spokesperson or narrator videos will find the templates sufficient for a professional result. Teams with complex animated content needs or a wide variety of format requirements would find Renderforest or Synthesia a better fit.",
  },
  agents_autonomous_record: {
    "Descript":     "Underlord performs autonomous editing actions — trimming filler words, shortening long pauses, applying transcript corrections, and suggesting cuts — but does not autonomously initiate or conduct a recording session without a human present. A recording must still be started and stopped by a person. The AI agency in Descript is post-capture, not pre-capture. For teams that want an AI to navigate software, capture a walkthrough independently, and produce a finished video without any human operating the screen, Descript does not currently offer this capability.",
    "Synthesia":    "Synthesia does not offer an autonomous recording or AI agent capability. Video creation always starts from a human-authored script that the platform renders with an AI avatar presenter. There is no mechanism for Synthesia to navigate software, observe UI states, decide what to capture, or produce a video from a task brief alone. The platform's AI works at the rendering and synthesis layer — turning text into video — rather than at the agency layer of observing and navigating an application.",
    "HeyGen":       "HeyGen's Video Agent API enables programmatic video generation from structured inputs — a defined script, avatar selection, and voice configuration — but a human must define the content and trigger the request. The agent does not observe software, navigate browser sessions, or decide what to capture based on a goal. HeyGen's 'agent' is an API abstraction for programmatic video creation rather than an autonomous browser-navigating agent. Fully autonomous recording from a brief remains outside HeyGen's current product scope.",
    "Opus Clip":    "Opus Clip does not autonomously record. Any 'agent' functionality focuses on repurposing footage that has already been captured by a human rather than initiating recording sessions independently. The platform's AI observes an uploaded video and applies intelligent clip selection, but it requires the source footage to already exist. Teams that want an AI to record a product walkthrough without a human operating the screen would need a separate agentic recording tool before bringing the footage into Opus Clip for repurposing.",
    "D-ID":         "D-ID does not offer an autonomous recording agent of any kind. Videos are generated on demand from scripts and images provided by a human operator — there is no mechanism for D-ID to navigate software, observe application states, or produce a video from a high-level task brief. The platform's AI works at the synthesis layer, turning static assets and text into video output, rather than at the agentic observation and capture layer. This is a fundamental product architecture difference from platforms designed around autonomous browser operation.",
    "DeepBrain":    "DeepBrain does not offer autonomous agent-driven recording or observation capability. A human must provide the full script before any video generation begins. DeepBrain's AI layer handles avatar animation, voice synthesis, and scene composition — not task planning, browser navigation, or autonomous decision-making about what to capture. Teams evaluating platforms for agentic product demo recording would find DeepBrain outside the relevant category.",
    "Renderforest": "Renderforest does not offer autonomous recording or agent-driven production capability of any kind. The platform's workflow is entirely human-directed: a user selects a template, uploads assets, and configures the design manually. There is no AI layer that observes a goal, navigates software, or decides what content to include. For teams looking for agentic video production capabilities, Renderforest is not in the relevant category.",
  },
  agents_safety: {
    "Synthesia":    "Synthesia publishes a comprehensive AI ethics policy and has restricted avatar creation to consented individuals since the platform's early days — no avatar can be created from a person's likeness without their explicit written consent. The platform maintains a Trust & Safety programme that covers deepfake prevention, responsible use standards, and content screening for misuse before publication. KPMG independently audited Synthesia's safety practices in 2024, making it the only platform in this competitive set with a third-party safety audit on record. Enterprise customers receive additional governance features including content approval workflows and usage monitoring.",
    "HeyGen":       "HeyGen requires explicit consent from the voice owner and the person being avatarised before cloning can proceed — this is enforced at the platform level rather than left to the user's discretion. The platform operates an abuse prevention programme that screens generated content for non-consensual deepfake characteristics and complies with EU AI Act disclosure requirements for AI-generated content. HeyGen's consent model is one of the stronger implementations in the competitive set, with the consent requirement embedded in the creation flow rather than limited to terms-of-service language.",
    "Descript":     "Descript requires a spoken consent statement — the person whose voice is being cloned must audibly confirm consent during the sample recording process before Overdub can be created. Usage policies restrict the cloned voice to the consenting person's own content and prohibit creating voice clones of other people without their involvement. The consent mechanism is technically enforced rather than honour-system-based. Enterprise accounts receive additional controls around who within a workspace can create voice clones and how Overdub voices can be shared across projects.",
    "D-ID":         "D-ID has published ethical guidelines for its avatar and face-animation technology, with a stated policy prohibiting the generation of content impersonating real individuals without their explicit consent. The platform applies content review measures to detect misuse of the face-animation API, particularly for political or non-consensual content. However, D-ID's published safety programme is less detailed and less independently audited than Synthesia's or HeyGen's. Teams in regulated industries or with strong governance requirements may find Synthesia's safety documentation more auditable.",
    "Opus Clip":    "Opus Clip's safety controls focus on general content moderation — screening for harmful or platform-policy-violating content in uploads — rather than AI-generation governance specific to voice cloning or avatar consent. There is no publicly documented avatar consent framework or voice-clone governance programme equivalent to Synthesia's or HeyGen's. For teams in regulated industries that need to demonstrate AI safety compliance as part of a procurement process, Opus Clip's current documentation would not satisfy that requirement without supplementary controls.",
    "DeepBrain":    "DeepBrain publishes guidelines around consent for custom avatar creation and requires a consent agreement before a custom avatar is produced, but the published safety programme is not equivalent in depth or independent verification to Synthesia's or HeyGen's. There is no publicly available third-party audit of DeepBrain's safety practices. Teams evaluating multiple platforms on safety governance depth will find DeepBrain's documentation adequate for standard enterprise use but potentially insufficient for regulated industries with rigorous procurement requirements.",
    "Renderforest": "Renderforest does not produce AI-generated talking-head avatars or voice clones, so the avatar consent and AI generation governance frameworks applicable to Synthesia, HeyGen, and D-ID are not directly relevant. Standard content policy — prohibiting unlawful, harmful, or deceptive content — applies to all Renderforest output. Teams using Renderforest for animated template-based content rather than AI presenter generation are operating in a different risk category and would not need to assess deepfake prevention or avatar consent governance as part of their platform evaluation.",
  },
  distribution_embed: {
    "Descript":     "Published Descript videos are accessible via a hosted link or embeddable iframe — both options are available without additional configuration. The hosted Descript player includes transcript display alongside the video, chapter navigation for longer recordings, and clip-level sharing so specific segments can be shared independently. This makes Descript a strong choice for teams distributing educational content where the transcript provides searchable, accessible context. Embed codes work across standard web builders and LMS platforms without custom integration.",
    "Synthesia":    "All Synthesia videos are hosted on the platform's infrastructure and shareable via a branded player link from the moment the video is published. Embed codes are available for inserting videos into web pages, LMS platforms, customer portals, and internal communications tools. The hosted player displays cleanly at any screen size without additional configuration. Enterprise accounts can restrict video access to authenticated users, making Synthesia suitable for distributing compliance or confidential training content behind an access control layer.",
    "HeyGen":       "Generated HeyGen videos can be shared via a hosted link or downloaded for distribution through other platforms. Embed codes are available for inserting content into websites, product documentation, and external platforms. The hosted player supports branding customisation — a logo and custom thumbnail can be applied. Teams distributing video across multiple channels will find HeyGen's distribution options flexible enough for both self-hosted and externally-hosted workflows.",
    "Renderforest": "Renderforest videos can be shared via a hosted link or downloaded in standard formats for distribution through any external platform or player. Embed codes are supported for integrating Renderforest video content into websites and external pages. The hosted player is clean and functional. Teams using Renderforest primarily for promotional or social content will typically download and upload to their distribution channel of choice rather than using the hosted player embed.",
    "Opus Clip":    "Clips produced in Opus Clip can be published directly to connected social platform accounts — TikTok, Instagram, YouTube, LinkedIn — or downloaded for manual upload. A hosted link is also available for sharing clips with stakeholders before publishing. The workflow is primarily designed around direct-to-social publishing rather than embed-first distribution. Teams whose distribution channel is social media will find the direct publishing workflow significantly faster than download-upload cycles.",
    "D-ID":         "Generated D-ID videos are downloadable in standard formats and shareable via a hosted link. Studio videos can be embedded using an iframe code, though D-ID is more commonly deployed for API-driven delivery into custom applications — a customer service interface, a product tour, or a kiosk experience — rather than for traditional hosted player scenarios. Teams integrating AI presenter video into a product or app experience will find D-ID's API distribution model more relevant than its embed player.",
    "DeepBrain":    "Completed DeepBrain videos are downloadable and shareable via a hosted link from the platform. An embed player option is available for inserting avatar videos into external pages or portals. The distribution workflow is straightforward for teams producing training or communication content who want to share final videos via link or embed within an LMS. Analytics for embedded videos are basic — view count and completion rate — rather than granular engagement data.",
  },
  distribution_analytics: {
    "Synthesia":    "Synthesia tracks view counts, watch time, and completion rates per video, with data available in the platform dashboard from the moment a video goes live. Enterprise accounts get team-level analytics across the full video library — completion rates by module, engagement by team or department, and trend data over time — enabling L&D teams to identify which training videos are being completed and which are being abandoned. This analytics depth makes Synthesia one of the few video creation platforms that is genuinely useful for measuring learning outcomes, not just content production.",
    "Descript":     "Basic view analytics are available for published Descript videos, covering view count and watch time at the video level. The analytics surface is simpler than dedicated video hosting platforms — there is no per-chapter engagement, no device breakdown, and no viewer-level data in standard plans. For teams whose primary purpose is content production rather than detailed distribution analytics, Descript's built-in metrics are sufficient for a high-level view of how content is performing. Teams with sophisticated engagement measurement needs would integrate a separate analytics or hosting platform.",
    "HeyGen":       "View counts and basic engagement metrics are available for videos shared via HeyGen's hosted link, with more detailed analytics — including watch time, rewatch rates, and geographic breakdown — unlocked on higher-tier plans. The analytics are useful for teams that primarily distribute content via HeyGen's own hosted player rather than exporting to a third-party LMS or CMS. For teams embedding HeyGen video in an external platform, analytics from that external platform will typically be more detailed than HeyGen's native metrics.",
    "Renderforest": "Basic download and view metrics are surfaced within the Renderforest dashboard, covering how many times a video has been viewed or downloaded from the hosted link. Analytics depth is limited compared to dedicated video hosting or analytics tools — there is no watch-time data, completion rate tracking, or viewer-level information. Teams using Renderforest as a production tool that exports to a distribution platform will rely on the distribution platform's analytics rather than Renderforest's native data.",
    "Opus Clip":    "Opus Clip tracks social performance metrics — views, likes, shares, comments, and reach — for clips published directly to connected social platform accounts. The analytics reflect the data returned by each social platform's API rather than Opus Clip's own player metrics. Teams whose distribution channel is social media will find this data useful for identifying which clips are driving engagement and which are underperforming. For content distributed via hosted link or embed rather than social platforms, analytics are more limited.",
    "D-ID":         "Basic view metrics are available for videos shared via the D-ID platform's hosted link, but analytics are not a primary feature or investment area of the product. Teams using D-ID as part of an API-driven application pipeline will typically measure engagement through their own application's analytics layer rather than D-ID's built-in metrics. For hosted player distribution, D-ID's analytics are functional but not comparable to platforms like Synthesia that have invested specifically in learning engagement measurement.",
    "DeepBrain":    "View metrics are available for videos hosted on the DeepBrain platform, covering basic view count and access data. The analytics depth is limited for a video production tool — completion rates, watch-time segments, and viewer-level data are not consistently documented as available features. Teams whose L&D content distribution requires demonstrable completion and engagement data for compliance reporting would find Synthesia's analytics significantly more capable than DeepBrain's current offering.",
  },
  collab_team_workspace: {
    "Descript":     "Team plans include a shared workspace where members collaborate on projects with role-based access — Creator and Editor roles determine who can publish and who can only edit. Projects, recordings, and assets are all accessible to the full team rather than siloed to individual accounts. Administrators can manage member access and reassign projects without losing editing history. The shared workspace is central to Descript's team workflow, making it practical for a content team of 3-15 people to collaborate on a shared production pipeline without emailing files.",
    "Synthesia":    "Enterprise accounts provide a full shared workspace with team management, role-based access, and the ability to assign avatar video projects and custom templates across the team for consistent output. Administrators can create team-level approved template libraries that individual members draw from without modification access. Usage tracking at the workspace level shows which team members are active and how video credits are being consumed. This governance depth makes Synthesia the strongest collaboration offering in the competitive set for large-scale enterprise L&D or communications deployments.",
    "HeyGen":       "Team and Enterprise plans provide a shared video library, role assignments — Owner, Admin, Member — and brand kit access across all team members. Workspace management supports multi-department rollout where different teams share the same brand assets but manage their own video libraries independently. An administrator can invite external collaborators — such as agency partners or freelance scriptwriters — with limited access to specific projects. The collaboration model is sufficient for teams of 5-50 that produce video across multiple departments.",
    "Renderforest": "Team collaboration in Renderforest is supported through shared brand kit access and project folder permissions with role-based access on team plans. Team members can access shared brand assets — logo, colours, fonts — without needing to configure them individually, and project folders can be shared with specific members or the full team. Real-time co-editing of the same video simultaneously is not supported, but asynchronous collaboration within a shared project is functional for most team workflows.",
    "Opus Clip":    "Team workspace features in Opus Clip enable shared clip libraries and consistent brand settings — logo, colours, caption style — applied automatically across all team members' output. Collaboration is centred on output consistency and shared asset access rather than real-time co-editing of the same clip simultaneously. Brand managers can configure the team's visual standards once and enforce them across all clip production without relying on individual team members to set up branding correctly on each video.",
    "D-ID":         "Organisational accounts in D-ID allow shared access to generated content, avatar libraries, and API credentials across multiple users. Role-based access control is available for enterprise customers managing multiple users or departments. The collaboration model is less workflow-centric than Descript or Synthesia — it is closer to shared asset access than a collaborative production environment. Teams using D-ID primarily through the API will manage multi-user access through API key governance rather than a visual workspace interface.",
    "DeepBrain":    "Team accounts in DeepBrain provide shared access to the organisation's avatar library, approved template sets, and completed video library. Role-based workspace management is available for enterprise deployments — administrators can control who can create custom avatars, which templates are available to which teams, and how video credits are allocated. This is sufficient for a centralised L&D or communications team managing video production for a larger organisation, though the workspace features are less refined than Synthesia's enterprise workspace offering.",
  },
  collab_review: {
    "Descript":     "Collaborators with view or edit access can leave timestamped comments directly on the video timeline at the exact frame where feedback applies. Comments are marked resolved when the relevant edit is applied, creating a clear and auditable feedback loop without requiring a separate project management tool. External reviewers — such as legal, compliance, or a client — can be given view-only access to leave comments without the ability to edit the project. This built-in review workflow is one of Descript's most practical features for teams that require sign-off before publishing.",
    "HeyGen":       "Review links allow external stakeholders to view and comment on a video before it is finalised, without requiring the reviewer to hold a HeyGen account. Feedback is collected in a single accessible view and tied to the video timeline so comments refer to specific moments. This is particularly useful for client-facing video production workflows where the client needs to review and approve before the final download. Review links can be set with an expiry date to ensure outdated drafts are not re-reviewed accidentally.",
    "Synthesia":    "Sharing links enable stakeholder review of Synthesia videos before final publication. Timestamped commenting within the Synthesia platform is available for workspace collaborators on shared video projects, allowing internal reviewers to flag specific scenes for revision. For regulated industries where video content requires compliance sign-off, Synthesia's review link can be circulated to approvers without granting them full workspace access. The commenting workflow is functional for linear review cycles, though it is less refined than Descript's integrated timeline commenting.",
    "Renderforest": "Projects in Renderforest can be shared for stakeholder feedback via a link, but in-platform timestamped review and commenting is limited. Most review workflows for Renderforest content occur via external communication tools — sharing a downloaded preview via email or Slack and collecting feedback there. For teams with a simple, low-volume review workflow, this is manageable. Teams producing high volumes of content that require structured approval processes would find a dedicated review tool or a platform with native timestamped commenting more efficient.",
    "Opus Clip":    "Clips can be shared for review before publishing to social platforms — a preview link allows a stakeholder to view the clip and provide feedback before the team publishes. Direct timestamped commenting within the Opus Clip platform is not a primary feature, so feedback is typically collected externally and applied manually. For the short-form social video use case Opus Clip is designed for, this lightweight review process is usually sufficient — clips are short, review cycles are fast, and the turnaround time between feedback and revision is minimal.",
    "D-ID":         "Review links allow stakeholder sign-off before a D-ID video is finalised — stakeholders can view the generated video via a shared link without needing a D-ID account. In-platform collaborative commenting is limited; review and feedback collection primarily occurs via external tools like email or Slack. For teams producing spokesperson or announcement videos that require approval before publishing, the review link provides a functional sign-off mechanism, though the absence of timestamped in-platform feedback is a gap for complex revision cycles.",
    "DeepBrain":    "Review links allow sharing of completed DeepBrain videos for stakeholder approval before download and distribution. In-platform commenting and timestamped feedback are limited — most review workflows happen outside the DeepBrain platform via external communication. Teams with structured approval processes — compliance sign-off, legal review, or client approval — would benefit from a more built-in review workflow, and may supplement DeepBrain with a separate video review tool such as Frame.io or Loom for the feedback collection step.",
  },
  editor_timeline: {
    "Descript":     "Descript's timeline supports multi-track audio and video with the transcript as the primary editing interface — edits made in the transcript propagate to the timeline automatically, so deleting a word or sentence from the text removes the corresponding audio and video frames without touching the timeline directly. For teams that find traditional timeline scrubbing slow and imprecise, this text-first approach dramatically reduces editing time. Direct timeline manipulation is also available for fine-grained frame-level control when needed. This dual-mode editing — text for speed, timeline for precision — makes Descript uniquely flexible among the platforms in this set.",
    "HeyGen":       "HeyGen includes a scene-based video editor for arranging avatar segments, overlay elements, and imported media within a structured timeline. The editor is suited to building structured presentation-style videos — training modules, product demos, and how-to content — where scenes follow a logical sequence. It is not designed for frame-level editorial work on raw footage, freeform multi-track mixing, or complex audio post-production. Teams whose editing needs are confined to arranging scripted scenes and adding overlays will find HeyGen's editor sufficient without a separate tool.",
    "Opus Clip":    "Opus Clip has a lightweight clip editor for trimming and adjusting the auto-generated short clips — cut points, caption timing, and overlay positions can all be adjusted after the initial AI clip selection. The editor is optimised for quick social edits on clips that are already mostly ready rather than for complex multi-track production from raw footage. Teams that need to make rapid adjustments to AI-selected clips before publishing to social will find the editor fast. Teams that need full editorial control over a multi-track recording should use Descript instead.",
    "Synthesia":    "Synthesia's editor is scene-based, designed for arranging scripted avatar presentations in a logical sequence — it operates at the scene level rather than the frame level. It is not designed or suited for traditional multi-track timeline editing of recorded footage, which is a fundamental product architecture choice: Synthesia generates video from scripts rather than editing video that was recorded. Teams that need to intercut recorded footage with avatar presenter segments would need to export from Synthesia and finish in a traditional editor like Descript or Premiere.",
    "D-ID":         "D-ID's editor focuses on avatar configuration — selecting the source image, choosing the voice, and applying background — rather than timeline-based video editing with multiple tracks. Multi-track production, audio mixing, and frame-level cutting of recorded footage are not core capabilities of the platform. Teams that need to assemble a multi-segment video with interspersed avatar, screen recording, and B-roll would need to finish that assembly in a separate timeline editor after generating the avatar segments in D-ID.",
    "DeepBrain":    "DeepBrain includes a scene-level editor for arranging and sequencing avatar segments within a multi-scene video — scenes can be reordered, duplicated, and configured with different backgrounds and overlays. Full multi-track timeline editing of raw recorded footage is not a primary feature. The editor is designed for the scripted avatar production workflow where the primary creative decisions are about scene content and layout rather than frame-by-frame timing and audio mixing. For production needs beyond scene sequencing, a traditional timeline editor would be required.",
    "Renderforest": "Renderforest's template-based editor allows segment reordering, text replacement, colour and font changes, and media asset swaps within the fixed structure of the chosen template. Traditional frame-level multi-track timeline editing — where a team member can place clips freely at any point, mix multiple audio tracks, and control timing at the frame level — is not supported. The editor is designed for making a template-defined video feel unique to a brand through customisation rather than for building a video structure from scratch. Teams with complex editorial needs should use a dedicated timeline editor.",
  },
  editor_text_effects: {
    "Descript":     "Text overlays, title cards, lower-thirds, and callout annotations are available within Descript's layout editor and can be added at specific transcript timestamps — meaning the text appears and disappears in sync with what is being said without manual timeline keyframing. Animation options for lower-thirds and title cards are included, covering common branded content needs: slide-in reveals, fade-ins, and hold-then-exit animations. The options are less extensive than dedicated motion graphics tools, but are sufficient for professional-looking branded content without leaving Descript's workflow.",
    "Opus Clip":    "Animated captions and text hooks are a core Opus Clip feature specifically engineered for short-form social video — word-by-word caption animation, hook text overlays that appear over the first few seconds, and CTA callouts with countdown timers are all available and extensively customisable. Branded presets for each animation style can be saved and reused across every new clip automatically. The animated text system in Opus Clip is designed to replicate the high-retention text treatment seen in top-performing TikTok and Reels content — it is the most social-optimised animated text feature in this competitive set.",
    "Renderforest": "Animated text effects are a primary strength and core product feature of Renderforest's template library — many templates are built around kinetic typography, logo reveal animations, and motion-graphics-style text sequences. The variety and production quality of Renderforest's animated text effects exceeds what is available in any other platform in this set for promotional or explainer video content. Teams producing branded intro sequences, lower-third packages, or explainer videos with motion-type elements will find Renderforest's template quality hard to match from a no-code platform.",
    "HeyGen":       "HeyGen includes text overlay and animated title card options within its video editor — lower-thirds, title cards, and subtitle-style overlays can be added at specified timestamps within the scene structure. The animated text options are designed for avatar presentation videos — professional and clean rather than highly stylised. Teams producing sales, training, or product overview content in avatar format will find HeyGen's text effects appropriate for the genre. Teams that need advanced motion-graphics-style kinetic typography should look at Renderforest or Opus Clip for that specific element.",
    "Synthesia":    "Text overlays, lower-thirds, and title cards are available within Synthesia's scene templates — these can be positioned within the scene layout and configured to appear and disappear at specified points in the avatar narration. Animation options are template-defined and apply consistently across the workspace rather than being freely configurable per video. Enterprise templates can lock the approved text animation style, ensuring all team-produced videos use consistent text treatment. The effect library is functional for corporate and L&D content but not as broad as dedicated motion graphics tools.",
    "D-ID":         "Basic text overlay capability is available in D-ID — a label, title, or short caption can be placed over the avatar video. Animated text effects are limited within D-ID's primary avatar video workflow: the platform is optimised for generating the talking-head output rather than for decorating it with motion graphics. Teams that require sophisticated animated text callouts, kinetic typography, or complex lower-third animations would need to add those elements in a post-production tool after exporting from D-ID.",
    "DeepBrain":    "Text overlays and lower-thirds are supported within DeepBrain's video editor, and can be applied as titles, section headers, and speaker labels within the scene structure. Animation options for text elements are present — standard reveal animations and lower-third slide-ins are available — but the range is more limited than platforms specialising in editorial video production. For corporate training and communications content where clear, professional text labels are the requirement rather than highly stylised motion graphics, DeepBrain's text effects are adequate.",
  },
};

const FEATURE_GROUPS = [
  { label: "Screen Recording",   features: ["recording_no_install", "recording_upload_support"] },
  { label: "AI Production",      features: ["production_auto_zoom", "production_transitions"] },
  { label: "Voice & Avatar",     features: ["voice_cloning", "voice_talking_head"] },
  { label: "Captions",           features: ["captions_auto", "captions_styling"] },
  { label: "Translation",        features: ["translation_languages", "translation_narration_regen"] },
  { label: "Branding",           features: ["branding_brand_kit", "branding_templates"] },
  { label: "AI Agents",          features: ["agents_autonomous_record", "agents_safety"] },
  { label: "Distribution",       features: ["distribution_embed", "distribution_analytics"] },
  { label: "Collaboration",      features: ["collab_team_workspace", "collab_review"] },
  { label: "Editor",             features: ["editor_timeline", "editor_text_effects"] },
];

const BAND_COLORS: Record<string, string> = {
  high:    "#16a34a",
  medium:  "#7C3AED",
  low:     "#d97706",
  strong:  "#16a34a",
  present: "#7C3AED",
  partial: "#d97706",
  weak:    "#dc2626",
};

const BAND_FALLBACK: Record<string, string> = {
  high:    "Strong capability confirmed. The platform demonstrates this feature comprehensively.",
  medium:  "Capability confirmed and present in the core product offering.",
  low:     "Partial capability detected. Some support exists but depth or documentation may be limited.",
  strong:  "Strong capability confirmed. The platform demonstrates this feature comprehensively.",
  present: "Capability confirmed and present in the core product offering.",
  partial: "Partial capability detected. Some support exists but depth or documentation may be limited.",
  weak:    "Limited capability based on available assessment information.",
};

function bandScore(band: string): number {
  return { high: 90, strong: 90, medium: 70, present: 70, low: 35, partial: 35, weak: 10 }[band] ?? 50;
}

function featureName(id: string): string {
  return FEATURE_NAMES[id] ?? id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function cleanEvidence(raw: string | null): string | null {
  if (!raw) return null;
  const stripped = raw.replace(/<cite[^>]*>/g, "").replace(/<\/cite>/g, "").trim();
  if (!stripped) return null;
  const lower = stripped.toLowerCase();
  if (
    lower.includes("not explicitly document") ||
    lower.includes("does not document") ||
    lower.includes("no specific documentation") ||
    lower.includes("without clear documentation") ||
    lower.includes("documentation not available") ||
    lower.includes("not documented") ||
    lower.includes("cannot be confirmed from") ||
    lower.includes("no available information") ||
    lower.includes("does not provide documentation")
  ) return null;
  const LIMIT = 300;
  if (stripped.length <= LIMIT) return stripped;
  const cut = stripped.lastIndexOf(". ", LIMIT);
  return cut > 0 ? stripped.slice(0, cut + 1) : stripped;
}

function twoSentences(text: string): string {
  let end = text.indexOf(". ");
  if (end === -1) return text;
  end = text.indexOf(". ", end + 2);
  return end > 0 ? text.slice(0, end + 1) : text;
}

// ── Cluster config ─────────────────────────────────────────────────────────────
const SOV_CLUSTERS = [
  { tag: "sdai-recording",    label: "Screen Recording",  description: "Which brands LLMs surface when asked about capturing app flows in the browser — no install, no extension, just record and go." },
  { tag: "sdai-production",   label: "AI Production",     description: "Which brands LLMs surface when asked about automatic zoom generation, pacing, dead-air trimming, and transition slides between sections." },
  { tag: "sdai-editor",       label: "Video Editor",      description: "Which brands LLMs surface when asked about timeline editing, text effects, and fine-grained manual control over the final cut." },
  { tag: "sdai-voice",        label: "Voice & Avatar",    description: "Which brands LLMs surface when asked about AI voice cloning, talking-head avatars, and narration generation without recording again." },
  { tag: "sdai-captions",     label: "Captions",          description: "Which brands LLMs surface when asked about auto-generated captions, caption styling, and on-brand subtitle presentation." },
  { tag: "sdai-translation",  label: "Translation",       description: "Which brands LLMs surface when asked about multi-language dubbing and narration regeneration — one recording, every market." },
  { tag: "sdai-distribution", label: "Distribution",      description: "Which brands LLMs surface when asked about embedding finished videos, sharing via a hosted player, and tracking viewer engagement." },
  { tag: "sdai-branding",     label: "Branding",          description: "Which brands LLMs surface when asked about brand kits, custom backgrounds, logo watermarking, and reusable video templates." },
  { tag: "sdai-collab",       label: "Collaboration",     description: "Which brands LLMs surface when asked about team workspaces, role-based access, and timestamped review and approval workflows." },
  { tag: "sdai-agents",       label: "AI Agents",         description: "Which brands LLMs surface when asked about software that can record a product walkthrough on its own — navigating your app in a browser, capturing every step, and producing a finished video or guide without anyone at the keyboard." },
];

const SENTIMENT_CLUSTERS = [
  { tag: "overall",          label: "Overall" },
  { tag: "overall-criticism", label: "Criticism & Limitations" },
];

// ── Custom tooltip ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CombinedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload]
    .filter((item: any) => item.value != null)
    .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0));
  return (
    <div style={{
      background: "#fff", border: "1px solid rgba(0,0,0,0.10)", borderRadius: 8,
      fontSize: 15, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      padding: "8px 12px", zIndex: 100,
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: NAVY }}>{fmtDate(String(label))}</p>
      {sorted.map((item: any) => (
        <div key={item.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0, display: "inline-block" }} />
          <span style={{ color: item.value > 0 ? item.color : "#aaa" }}>
            {String(item.dataKey)}: {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Shared card shell ─────────────────────────────────────────────────────────
function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
      padding: "20px 24px",
      borderTop: accent ? `3px solid ${accent}` : undefined,
    }}>
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000", marginBottom: 8 }}>
      {children}
    </p>
  );
}

function BigNumber({ value, sub }: { value: string; sub: string }) {
  return (
    <>
      <p style={{ fontSize: 36, fontWeight: 800, color: NAVY, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      <p style={{ fontSize: 15, color: "#000" }}>{sub}</p>
    </>
  );
}

// ── In-slice pie label ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const angle = percent >= 0.999 ? 90 : midAngle;
  const x = cx + radius * Math.cos(-angle * RADIAN);
  const y = cy + radius * Math.sin(-angle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 700, pointerEvents: "none" }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

// ── SOV donut card ────────────────────────────────────────────────────────────
function SOVCard({ cluster, rows }: { cluster: typeof SOV_CLUSTERS[number]; rows: SOVRow[] }) {
  const locked = rows.filter(r => LOCKED_SDAI_BRANDS.has(r.brand));
  const totalAppearances = locked.reduce((s, r) => s + r.total_appearances, 0);
  const mapped = locked.map(r => ({
    ...r,
    sov_pct: totalAppearances > 0 ? Math.round((r.total_appearances / totalAppearances) * 1000) / 10 : 0,
  })).sort((a, b) => b.sov_pct - a.sov_pct);

  if (mapped.length === 0) return null;

  const colorMap: Record<string, string> = Object.fromEntries(mapped.map(r => [r.brand, getBrandColor(r.brand)]));

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
      padding: "20px 24px",
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 4, letterSpacing: "-0.01em" }}>
        {cluster.label}
      </h3>
      <p style={{ fontSize: 15, color: "#000", marginBottom: 16 }}>Share of voice · last 7 days</p>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ flexShrink: 0 }}>
          <PieChart width={150} height={150} style={{ overflow: "visible" }}>
            <Pie
              data={mapped}
              dataKey="total_appearances"
              cx={70} cy={70}
              innerRadius={38} outerRadius={65}
              paddingAngle={2}
              labelLine={false}
              label={(props) => <PieSliceLabel {...props} />}
            >
              {mapped.map(r => <Cell key={r.brand} fill={colorMap[r.brand]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 15, border: "1px solid rgba(0,0,0,0.1)" }}
              formatter={(_v, _n, p) => [`${(p.payload as SOVRow & { sov_pct: number }).sov_pct}%`, (p.payload as SOVRow).brand]}
            />
          </PieChart>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {mapped.map(r => (
            <div key={r.brand} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: colorMap[r.brand] }} />
              <span style={{ fontSize: 15, color: NAVY, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.brand}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#000", flexShrink: 0 }}>{r.sov_pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SdaiVisibilityCharts({
  dailySummary, weeklySummary, llmVisibility, sovData,
  clusterPositions, featureScores, sentimentData,
}: Props) {
  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());

  function toggleBrand(b: string) {
    setHiddenBrands(prev => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b); else next.add(b);
      return next;
    });
  }

  const hasReal = dailySummary.length > 0;

  // ── Build chart indexes ───────────────────────────────────────────────────────
  const dateSet = new Set<string>();
  // overall index: date → brand → total mentions (all clusters combined)
  const index: Record<string, Record<string, number>> = {};
  // per-cluster index: cluster_tag → date → brand → mentions
  const clusterIndex: Record<string, Record<string, Record<string, number>>> = {};

  for (const row of dailySummary) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    dateSet.add(row.date);
    // overall
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
    // per-cluster
    const ct = row.cluster_tag;
    if (!clusterIndex[ct]) clusterIndex[ct] = {};
    if (!clusterIndex[ct][row.date]) clusterIndex[ct][row.date] = {};
    clusterIndex[ct][row.date][row.brand] = (clusterIndex[ct][row.date][row.brand] ?? 0) + row.mention_count;
  }

  // Weekly totals
  const weeklyTotals: Record<string, { mentions: number; avgPos: number | null }> = {};
  for (const row of weeklySummary) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    const e = weeklyTotals[row.brand] ?? { mentions: 0, avgPos: null };
    weeklyTotals[row.brand] = { mentions: e.mentions + row.mention_count, avgPos: row.avg_position ?? e.avgPos };
  }

  const dates  = [...dateSet].sort();
  const brands = [...LOCKED_SDAI_BRANDS]
    .sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0));

  const brandColor = (b: string) => getBrandColor(b);

  // ── Combined chart rows ───────────────────────────────────────────────────────
  const chartRows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const b of brands) row[b] = index[date]?.[b] ?? 0;
    return row;
  });

  // ── Per-cluster chart rows (using cluster_tag-specific data) ─────────────────
  const clusterCharts = SOV_CLUSTERS.map(cluster => {
    const ci = clusterIndex[cluster.tag] ?? {};
    const rows = dates.map(date => {
      const row: Record<string, number | string> = { date };
      for (const b of brands) row[b] = ci[date]?.[b] ?? 0;
      return row;
    });
    // Only show clusters that have any data
    const hasData = rows.some(r => brands.some(b => (r[b] as number) > 0));
    return { ...cluster, clusterBrands: brands, rows, hasData };
  });

  // ── Aggregate weekly metrics ──────────────────────────────────────────────────
  const totalMentions = Object.values(weeklyTotals).reduce((s, v) => s + v.mentions, 0);
  const hasWeekly = Object.keys(weeklyTotals).length > 0;

  const topByMentions = brands.reduce<string | null>((best, b) =>
    !best || (weeklyTotals[b]?.mentions ?? 0) > (weeklyTotals[best]?.mentions ?? 0) ? b : best
  , null);
  const topMentionData = topByMentions ? weeklyTotals[topByMentions] : null;

  const hasVis = llmVisibility.length > 0;

  // ── Model mentions breakdown ──────────────────────────────────────────────────
  const modelMentionsByBrand: Record<string, { claude: number; gpt: number }> = {};
  for (const row of dailySummary) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    if (!modelMentionsByBrand[row.brand]) modelMentionsByBrand[row.brand] = { claude: 0, gpt: 0 };
    if (row.model === "claude-haiku-4-5") modelMentionsByBrand[row.brand].claude += row.mention_count;
    else modelMentionsByBrand[row.brand].gpt += row.mention_count;
  }
  const modelMentionsData = brands
    .map(b => ({ brand: b, claude: modelMentionsByBrand[b]?.claude ?? 0, gpt: modelMentionsByBrand[b]?.gpt ?? 0 }))
    .filter(d => d.claude + d.gpt > 0)
    .sort((a, b) => (b.claude + b.gpt) - (a.claude + a.gpt));

  // ── Position table ────────────────────────────────────────────────────────────
  const posTable = Object.entries(weeklyTotals)
    .filter(([brand, v]) => LOCKED_SDAI_BRANDS.has(brand) && v.avgPos != null)
    .sort((a, b) => (a[1].avgPos ?? 99) - (b[1].avgPos ?? 99))
    .map(([brand, v], i) => ({ rank: i + 1, brand, avgPos: v.avgPos as number, mentions: v.mentions }));

  // ── Position by primary cluster ───────────────────────────────────────────────
  const clusterPosLookup: Record<string, Record<string, number>> = {};
  for (const row of clusterPositions) {
    if (!LOCKED_SDAI_BRANDS.has(row.brand)) continue;
    if (!clusterPosLookup[row.cluster_tag]) clusterPosLookup[row.cluster_tag] = {};
    clusterPosLookup[row.cluster_tag][row.brand] = row.avg_position;
  }

  const clusterGroups = SOV_CLUSTERS.map(cluster => {
    const brandsInCluster = Object.entries(BRAND_PRIMARY_CLUSTER)
      .filter(([, tag]) => tag === cluster.tag)
      .map(([brand]) => brand)
      .filter(brand => LOCKED_SDAI_BRANDS.has(brand))
      .map(brand => ({
        brand,
        avg_position: clusterPosLookup[cluster.tag]?.[brand] ?? null,
      }))
      .sort((a, b) => (a.avg_position ?? 999) - (b.avg_position ?? 999));
    return { ...cluster, brands: brandsInCluster };
  }).filter(c => c.brands.length > 0);

  const hasClusterPos = clusterPositions.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 1: Metric cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

        <Card accent={PURPLE}>
          <CardLabel>Brand Mentions · 7 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "—"}
            sub={hasWeekly ? `across ${brands.length} brands · 2 models` : "No data yet"}
          />
        </Card>

        <Card accent={MAGENTA}>
          <CardLabel>LLM Visibility · 7 Days</CardLabel>
          {!hasVis ? (
            <p style={{ fontSize: 17, color: "#000" }}>No data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {llmVisibility.map((v, i) => {
                const label = v.model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? PURPLE : MAGENTA;
                return (
                  <div key={v.model}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{label}</span>
                      <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{v.visibility_pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                      <div style={{ height: 5, borderRadius: 999, width: `${Math.min(v.visibility_pct, 100)}%`, background: color }} />
                    </div>
                    <p style={{ fontSize: 14, color: "#000", marginTop: 4 }}>{v.total_responses} responses</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card accent={NAVY}>
          <CardLabel>Top Brand · 7 Days</CardLabel>
          {topByMentions && topMentionData ? (
            <>
              <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 4 }}>
                {topByMentions}
              </p>
              <p style={{ fontSize: 15, color: "#000" }}>
                {topMentionData.mentions.toLocaleString()} mentions
                {topMentionData.avgPos != null ? ` · avg position ${topMentionData.avgPos.toFixed(1)}` : ""}
              </p>
            </>
          ) : (
            <p style={{ fontSize: 17, color: "#000" }}>No data yet</p>
          )}
        </Card>

      </div>

      {/* ── Row 2: Combined 7-day trend ─────────────────────────────────────── */}
      {hasReal && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "20px 24px 16px" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>Brand Mentions: 7-Day Trend</h3>
          <p style={{ fontSize: 15, color: "#000", marginBottom: 14 }}>All brands · both models combined</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CombinedTooltip />} wrapperStyle={{ zIndex: 100 }} allowEscapeViewBox={{ x: false, y: true }} />
              {brands.map(b => (
                <Line key={b} type="monotone" dataKey={b} stroke={brandColor(b)}
                  strokeWidth={hiddenBrands.has(b) ? 0 : 2}
                  dot={false}
                  activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", flex: 1 }}>
              {brands.map(b => (
                <label key={b} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer",
                  opacity: hiddenBrands.has(b) ? 0.45 : 1,
                }}>
                  <input
                    type="checkbox"
                    checked={!hiddenBrands.has(b)}
                    onChange={() => toggleBrand(b)}
                    style={{ accentColor: brandColor(b), width: 13, height: 13, cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: hiddenBrands.has(b) ? "#999" : NAVY }}>{b}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
              <button onClick={() => setHiddenBrands(new Set())} style={{
                fontSize: 12, fontWeight: 600, color: PURPLE,
                background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 6, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" as const,
              }}>Select All</button>
              <button onClick={() => setHiddenBrands(new Set(brands))} style={{
                fontSize: 12, fontWeight: 600, color: "#555",
                background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 6, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap" as const,
              }}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: 7-day trends by cluster ──────────────────────────────────── */}
      {hasReal && (
        <>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>
            Brand Mentions: 7-Day Trend by Cluster
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {clusterCharts.filter(c => c.hasData).map(({ tag, label, description: clusterDesc, clusterBrands, rows }) => (
              <div key={tag} style={{
                background: "#fff", borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
                padding: "20px 24px 16px",
              }}>
                <h4 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>{label}</h4>
                {clusterDesc && (
                  <p style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", marginBottom: 4, lineHeight: 1.55 }}>{clusterDesc}</p>
                )}
                <p style={{ fontSize: 15, color: "#000", marginBottom: 14 }}>7-day mentions · both models</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} dy={6} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip content={<CombinedTooltip />} wrapperStyle={{ zIndex: 100 }} allowEscapeViewBox={{ x: false, y: true }} />
                    {clusterBrands.map(b => (
                      <Line key={b} type="monotone" dataKey={b} stroke={brandColor(b)}
                        strokeWidth={hiddenBrands.has(b) ? 0 : 2}
                        dot={false}
                        activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  {clusterBrands.map(b => (
                    <label key={b} style={{
                      display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer",
                      opacity: hiddenBrands.has(b) ? 0.45 : 1,
                    }}>
                      <input
                        type="checkbox"
                        checked={!hiddenBrands.has(b)}
                        onChange={() => toggleBrand(b)}
                        style={{ accentColor: brandColor(b), width: 13, height: 13, cursor: "pointer", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 13, color: hiddenBrands.has(b) ? "#999" : NAVY }}>{b}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Row 7: SOV donuts ───────────────────────────────────────────────── */}
      {sovData.length > 0 && (
        <>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>
            Use Case Share of Voice
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {SOV_CLUSTERS.map(cluster => {
              const rows = sovData.filter(r => r.cluster_tag === cluster.tag);
              return rows.length > 0 ? <SOVCard key={cluster.tag} cluster={cluster} rows={rows} /> : null;
            })}
          </div>
        </>
      )}

      {/* ── Row 8: Feature scores ───────────────────────────────────────────── */}
      {featureScores.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
              Product Feature Scores
            </h3>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: 15, color: "#000", marginBottom: 24 }}>
              Both models · scored across 20 features · updates daily
            </p>
            {FEATURE_GROUPS.map(group => {
              const groupFeatures = group.features.flatMap(featureId => {
                const rows = featureScores
                  .filter(r => r.feature_id === featureId && LOCKED_SDAI_BRANDS.has(r.brand_name))
                  .sort((a, b) => {
                    const sa = Math.round((a.score ?? bandScore(a.score_band)) / 10) * 10;
                    const sb = Math.round((b.score ?? bandScore(b.score_band)) / 10) * 10;
                    return sb - sa;
                  })
                  .slice(0, 3);
                return rows.length >= 1 ? [{ featureId, rows }] : [];
              });
              if (groupFeatures.length === 0) return null;
              return (
                <div key={group.label} style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: PURPLE, marginBottom: 14 }}>
                    {group.label}
                  </p>
                  {groupFeatures.map(({ featureId, rows }) => (
                    <div key={featureId} style={{ marginBottom: 18 }}>
                      <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 2 }}>
                        {featureName(featureId)}
                      </p>
                      {FEATURE_DESCRIPTIONS[featureId] && (
                        <p style={{ fontSize: 16, color: PURPLE, lineHeight: 1.5, margin: "0 0 10px" }}>
                          {FEATURE_DESCRIPTIONS[featureId]}
                        </p>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {rows.map(r => {
                          const score = Math.round((r.score ?? bandScore(r.score_band)) / 10) * 10;
                          const ev = cleanEvidence(r.evidence);
                          const text = BRAND_FEATURE_DESCRIPTIONS[featureId]?.[r.brand_name] ?? ev ?? BAND_FALLBACK[r.score_band];
                          return (
                            <div key={r.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 16, fontWeight: 500, color: NAVY, width: 130, flexShrink: 0, lineHeight: 1.3 }}>
                                  {r.brand_name}
                                </span>
                                <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                                  <div style={{ width: `${score}%`, height: 6, borderRadius: 999, background: BAND_COLORS[r.score_band] ?? "#94a3b8" }} />
                                </div>
                                <span style={{ fontSize: 16, fontWeight: 700, color: BAND_COLORS[r.score_band] ?? NAVY, width: 28, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                                  {score}
                                </span>
                              </div>
                              {text && (
                                <p style={{ paddingLeft: 140, fontSize: 17, color: "#000", lineHeight: 1.5, margin: "4px 0 0", fontStyle: ev ? "normal" : "italic" }}>{text}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            {/* ── Research-sourced: Pricing · Security · Integrations ── */}
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", margin: "8px 0 24px", paddingTop: 24 }}>
              {[
                {
                  id: "pricing",
                  name: "Pricing Transparency",
                  desc: "How clearly pricing tiers and costs are disclosed publicly.",
                  brands: [
                    { brand: "Descript",     score: 90, band: "high",   evidence: "All three paid tiers (Free, Creator at $12/mo, Pro at $24/mo) are clearly listed with feature breakdowns on the public pricing page. A buyer can self-qualify and purchase without speaking to sales." },
                    { brand: "Synthesia",    score: 90, band: "high",   evidence: "Pricing is fully self-serve with named tiers (Basic free, Starter at $29/mo) listed publicly alongside feature comparisons. Enterprise pricing requires contact, but the entry path is clear and accessible." },
                    { brand: "HeyGen",       score: 90, band: "high",   evidence: "Four tiers are publicly priced — Free, Creator ($29/mo), Pro ($49/mo+), and Business ($149/mo+) — with feature comparisons visible without sign-in, making it easy for buyers to evaluate independently." },
                    { brand: "D-ID",         score: 80, band: "high",   evidence: "Studio and API plans are listed separately on public pricing pages (Lite from $9/mo, Advanced from $299/mo). The gap between tiers is large and some enterprise options require a conversation, but the baseline is transparent." },
                    { brand: "DeepBrain",    score: 80, band: "high",   evidence: "Starter ($30/mo) and Pro ($225/mo) plans are clearly listed on aistudios.com/pricing with feature comparisons. Enterprise custom pricing is not disclosed publicly but standard plans require no sales conversation." },
                    { brand: "Renderforest", score: 80, band: "high",   evidence: "A free tier and paid plans from $9.99/mo are listed on the /subscription page with clear feature breakdowns. No contact-sales wall exists for standard plans, which lowers friction for self-serve buyers." },
                    { brand: "Opus Clip",    score: 70, band: "medium", evidence: "A free tier and Pro plan are documented, but the exact monthly price for Pro is not consistently surfaced without creating an account. Business pricing is contact-only, which adds friction for teams evaluating at scale." },
                  ],
                },
                {
                  id: "security",
                  name: "Enterprise Security",
                  desc: "Breadth of certifications (SOC 2, ISO), trust centre, and enterprise IAM features.",
                  brands: [
                    { brand: "Synthesia",    score: 100, band: "high",   evidence: "The strongest security posture in the competitive set. Synthesia holds SOC 2 Type II, ISO 27001:2022, and ISO 42001 (AI management system), with a dedicated public Trust Centre at security.synthesia.io covering SSO, data residency, and audit controls." },
                    { brand: "Descript",     score:  90, band: "high",   evidence: "SOC 2 Type II certified with GDPR and CCPA compliance documented on a public /security page. AES-256 encryption at rest is confirmed. A strong posture for a creative tool, though no dedicated trust centre exists." },
                    { brand: "HeyGen",       score:  90, band: "high",   evidence: "Enterprise-grade security with SOC 2 Type II, GDPR, and EU AI Act compliance. Supports SAML SSO, SCIM provisioning, RBAC, and audit logs — and employs a dedicated Data Protection Officer, which is uncommon at this price point." },
                    { brand: "D-ID",         score:  70, band: "medium", evidence: "SOC 2 certification is referenced in company communications rather than a dedicated security page, and GDPR compliance is implied through EU data handling practices. The absence of a public trust centre limits what buyers can verify independently." },
                    { brand: "Opus Clip",    score:  50, band: "low",    evidence: "A trust portal exists at trust.opus.pro with documented security policies, but SOC 2 certification has not been publicly confirmed. Suitable for teams with moderate security requirements, but unlikely to clear enterprise procurement without additional assurances." },
                    { brand: "Renderforest", score:  40, band: "low",    evidence: "Covers GDPR as required for EU users, but holds no SOC 2, ISO 27001, or equivalent enterprise certifications. Security posture reflects a consumer and small-business product rather than an enterprise procurement target." },
                    { brand: "DeepBrain",    score:  30, band: "weak",   evidence: "No verifiable public security certifications, trust centre, or structured compliance documentation was found at time of research. Not positioned to pass a standard enterprise security review in its current state." },
                  ],
                },
                {
                  id: "integrations",
                  name: "Technical Integrations",
                  desc: "API availability, named third-party connectors, and ecosystem depth.",
                  brands: [
                    { brand: "Descript",     score: 90, band: "high",   evidence: "API access is in open beta and well-documented, with a dedicated /integrations page covering Google Drive, Slack, Adobe Premiere, Final Cut Pro, Dropbox, and Zapier. A Claude MCP connector extends Descript into AI agent workflows — the deepest ecosystem of any brand in this set." },
                    { brand: "Synthesia",    score: 90, band: "high",   evidence: "A mature, documented REST API at docs.synthesia.io supports production workloads. Named connectors span PowerPoint, 360Learning, HubSpot, Shopify, WordPress, and major LMS platforms — covering both the L&D buyer and the marketing automation buyer." },
                    { brand: "HeyGen",       score: 80, band: "high",   evidence: "Zapier integration (available on Pro+ plans) connects to over 9,000 apps without custom development. A native REST API and a dedicated Video Agent API are also available, with separate API pricing documented." },
                    { brand: "Opus Clip",    score: 80, band: "high",   evidence: "API access is available to Business plan holders. Native Zapier and Make.com integrations handle workflow automation, while Adobe Premiere and DaVinci Resolve exports serve professional editors. Social auto-posting to major platforms is built in." },
                    { brand: "D-ID",         score: 80, band: "high",   evidence: "D-ID is built API-first — the Creative Reality Studio API is the primary product interface, with dedicated API pricing at d-id.com/pricing/api. A PowerPoint plugin brings avatar generation directly into presentation workflows." },
                    { brand: "DeepBrain",    score: 60, band: "medium", evidence: "An API is documented at docs.aistudios.com and supports webhook-based event triggers, giving developers a foundation to build custom workflows. Named third-party integrations are limited and the out-of-the-box connector ecosystem is thin." },
                    { brand: "Renderforest", score: 50, band: "low",    evidence: "A subscriber API supports programmatic video creation with analytics integrations (Google Analytics, Meta Pixel, SEMRush). No native connectors exist for LMS, CRM, or enterprise collaboration tools." },
                  ],
                },
              ].map(feat => (
                <div key={feat.id} style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 2 }}>{feat.name}</p>
                  <p style={{ fontSize: 16, color: PURPLE, lineHeight: 1.5, margin: "0 0 10px" }}>{feat.desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {feat.brands.map(({ brand, score, band, evidence }) => (
                      <div key={brand}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 16, fontWeight: 500, color: NAVY, width: 130, flexShrink: 0, lineHeight: 1.3 }}>{brand}</span>
                          <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                            <div style={{ width: `${score}%`, height: 6, borderRadius: 999, background: BAND_COLORS[band] ?? "#94a3b8" }} />
                          </div>
                          <span style={{ fontSize: 16, fontWeight: 700, color: BAND_COLORS[band] ?? NAVY, width: 28, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{score}</span>
                        </div>
                        <p style={{ paddingLeft: 140, fontSize: 17, color: "#000", lineHeight: 1.5, margin: "4px 0 0" }}>{evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 15, color: "#000", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 4 }}>
              Top 3 brands per feature · scored by both Claude Haiku and GPT-4o mini
            </p>
          </div>
        </div>
      )}

      {/* ── Row 9: Sentiment ────────────────────────────────────────────────── */}
      {(() => {
        const { rows: sentimentRows, meta: sentimentMeta } = sentimentData;
        const ready = sentimentRows.length > 0;

        const globalDescFreq = new Map<string, number>();
        for (const r of sentimentRows) for (const d of r.top_descriptors) globalDescFreq.set(d, (globalDescFreq.get(d) ?? 0) + 1);

        function sentimentDateLabel() {
          const e = sentimentMeta.earliest_date;
          const l = sentimentMeta.latest_date;
          if (!e || !l) return "";
          const fmt = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", { month: "short", day: "numeric", timeZone: "UTC" });
          return e === l ? fmt(e) : `${fmt(e)} – ${fmt(l)}`;
        }

        return (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
                Sentiment Analysis
              </h3>
              {!ready && (
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#000", background: "rgba(0,0,0,0.06)", borderRadius: 999, padding: "3px 8px" }}>
                  No data yet
                </span>
              )}
            </div>

            {!ready && (
              <div style={{ padding: "28px 24px", textAlign: "center" as const }}>
                <p style={{ fontSize: 16, color: "#000" }}>No sentiment data collected yet.</p>
              </div>
            )}

            {ready && (
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 15, color: "#000", marginBottom: 24 }}>
                  How Claude Haiku and GPT-4o-mini describe each brand · {sentimentDateLabel()}
                </p>
                {SENTIMENT_CLUSTERS.map(cluster => {
                  const clusterBrands = sentimentRows
                    .filter(r => r.bucket_tag === cluster.tag && LOCKED_SDAI_BRANDS.has(r.brand_name))
                    .sort((a, b) => b.positive_count - a.positive_count);
                  if (clusterBrands.length === 0) return null;
                  return (
                    <div key={cluster.tag} style={{ marginBottom: 28 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: PURPLE, marginBottom: 14 }}>
                        {cluster.label}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {clusterBrands.map(brand => {
                          const total = brand.total_count || 1;
                          const posPct = Math.round((brand.positive_count / total) * 100);
                          const neuPct = Math.round((brand.neutral_count  / total) * 100);
                          const negPct = 100 - posPct - neuPct;
                          return (
                            <div key={brand.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                                <span style={{ fontSize: 16, fontWeight: 600, color: NAVY, width: 120, flexShrink: 0, lineHeight: 1.25 }}>
                                  {brand.brand_name}
                                </span>
                                <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden", display: "flex" }}>
                                  {posPct > 0 && <div style={{ width: `${posPct}%`, height: "100%", background: "#16a34a" }} />}
                                  {neuPct > 0 && <div style={{ width: `${neuPct}%`, height: "100%", background: "#d97706" }} />}
                                  {negPct > 0 && <div style={{ width: `${negPct}%`, height: "100%", background: "#dc2626" }} />}
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 700, color: "#16a34a", width: 34, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                                  {posPct}%
                                </span>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, paddingLeft: 130 }}>
                                {[...new Set(brand.top_descriptors)].slice(0, 4).map((d, i) => {
                                  const unique = globalDescFreq.get(d) === 1;
                                  return (
                                    <span key={i} style={{
                                      fontSize: 15,
                                      color: unique ? PURPLE : "#000",
                                      background: unique ? "rgba(124,58,237,0.08)" : "rgba(0,0,0,0.04)",
                                      border: `1px solid ${unique ? "rgba(124,58,237,0.25)" : "rgba(0,0,0,0.08)"}`,
                                      borderRadius: 4, padding: "2px 7px", fontWeight: unique ? 600 : 400,
                                    }}>
                                      {d}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "flex", gap: 16, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 4 }}>
                  {[["#16a34a", "Positive"], ["#d97706", "Neutral"], ["#dc2626", "Negative"]].map(([color, label]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 15, color: "#000" }}>{label}</span>
                    </div>
                  ))}
                  <span style={{ fontSize: 15, color: "#000", marginLeft: "auto" }}>
                    Both models · updates daily
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Row 10: LLM Visibility Playbook ─────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const,
            color: PURPLE, marginBottom: 8,
          }}>Research · LLM Visibility</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8 }}>
            How AI Video Companies Earn LLM Visibility
          </h3>
          <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 1.65, maxWidth: 620 }}>
            Why Descript and Synthesia are consistently cited by Claude and GPT when asked about AI video creation.
          </p>
        </div>

        {/* Descript — Lamigo-format card */}
        {(() => {
          const descEditorScore = (() => {
            const r = featureScores.find(f => f.brand_name === "Descript" && f.feature_id === "editor_timeline");
            return r ? Math.round((r.score ?? bandScore(r.score_band)) / 10) * 10 : null;
          })();
          const synVoiceScore = (() => {
            const r = featureScores.find(f => f.brand_name === "Synthesia" && f.feature_id === "voice_talking_head");
            return r ? Math.round((r.score ?? bandScore(r.score_band)) / 10) * 10 : null;
          })();
          return (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
          <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.3 }}>
              Descript: Mechanism-First Documentation
            </p>
            <ul style={{ margin: "0 0 14px", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {([
                {
                  text: "Every public page is built around a specific workflow, not a product category. The video-editing page states the exact sequence: footage is transcribed, the user edits the text, and the video changes to match.",
                  cite: "descript.com/video-editing",
                  url: "https://www.descript.com/video-editing",
                },
                {
                  text: `The Underlord help page describes it as an "agentic co-editor" that "can act on your behalf." The filler-words page specifies it "detects filler words and silences, then removes them automatically from the transcript and audio in one pass."`,
                  cite: "help.descript.com/underlord",
                  url: "https://help.descript.com/hc/en-us/articles/36803785502221",
                },
                {
                  text: "Dedicated stable URLs per capability: /video-editing, /underlord, /integrations, /pricing, /customers/revelo. Each one is a retrievable, indexable document for a specific query rather than a homepage mention.",
                  cite: null, url: null,
                },
                {
                  text: `The integrations page names Google Drive, Slack, Adobe Premiere, Ecamm, Final Cut Pro, and Dropbox and says they "enable 1-click imports" — more citable than a generic "works with your existing tools" claim.`,
                  cite: "descript.com/integrations",
                  url: "https://www.descript.com/integrations",
                },
                {
                  text: "Pricing is displayed publicly, including the Hobbyist tier at $16 per month annually — no sales-call gate.",
                  cite: "descript.com/pricing",
                  url: "https://www.descript.com/pricing",
                },
                {
                  text: `Vizard's March 2026 roundup independently labelled Descript "the best transcript-first editor for podcasts, interviews, and talking-head videos."`,
                  cite: "vizard.ai — Best AI Video Editors 2026",
                  url: "https://vizard.ai/blog/best-ai-video-editing-tools-2026",
                },
                {
                  text: `G2 reviews repeat the mechanism in user language — praise ("the most intuitive software I've ever used") and criticism ("an incredibly frustrating user experience") — giving AI models realistic decision-context rather than vendor-curated claims.`,
                  cite: "g2.com/products/descript/reviews",
                  url: "https://www.g2.com/products/descript/reviews?qs=pros-and-cons",
                },
                {
                  text: `Reddit threads including "Descript AI Video Editing is a Disaster" and reports of consuming "half of my monthly AI credits" add unprompted, specific vocabulary about pricing and failure modes that broadens the range of queries the brand appears in.`,
                  cite: "r/podcasting, r/Descript",
                  url: "https://www.reddit.com/r/podcasting/comments/1l4irrs/descript_ai_video_editing_is_a_disaster_all_ai",
                },
                {
                  text: `Revelo case study: podcast workflow went from "a couple of days" to "a couple of hours" — named customer, named outcome, no PR assistance required to cite it.`,
                  cite: "descript.com/customers/revelo",
                  url: "https://www.descript.com/customers/revelo",
                },
              ] as { text: string; cite: string | null; url: string | null }[]).map((pt, i) => (
                <li key={i} style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 7 }} />
                  <span>
                    {pt.text}
                    {pt.cite && pt.url && (
                      <a href={pt.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", marginLeft: 5, fontSize: 14, textDecoration: "underline" }}>{pt.cite}</a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p style={{
              fontSize: 16, color: "#000", lineHeight: 1.6, margin: "12px 0",
              background: "rgba(250,204,21,0.15)",
              border: "1px solid rgba(250,204,21,0.4)",
              borderRadius: 6,
              padding: "8px 12px",
            }}>
              <span style={{ fontWeight: 700 }}>Descript data: </span>
              {`Timeline / multi-track editor ${descEditorScore ?? "—"}. The evidence text cited the transcript-to-video workflow as a complete input-process-output chain. Descript appears in the Video Editor and Screen Recording mention trends.`}
            </p>
            <div style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.03) 100%)",
              border: "1px solid rgba(37,99,235,0.18)",
              borderLeft: "4px solid #2563eb",
              borderRadius: "0 10px 10px 0",
              padding: "14px 18px",
            }}>
              <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#2563eb", margin: "0 0 6px" }}>
                Takeaway
              </p>
              <p style={{ fontSize: 16, color: "#000", lineHeight: 1.65, margin: 0, fontWeight: 400 }}>
                Superdegree already has a version of this on its site — agents record in a cloud browser, edit, add zooms, captions, and narration, and output a video or written guide — but it is not yet anchored at a stable, indexable URL with that exact claim front and centre.
              </p>
            </div>
          </div>

          {/* Synthesia — Lamigo-format card */}
          <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.3 }}>
              Synthesia: Enterprise Positioning via Independent Press
            </p>
            <ul style={{ margin: "0 0 14px", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {([
                {
                  text: "CNBC and TechCrunch both independently describe Synthesia's product in their own words across multiple 2025 articles — editorial coverage, not press releases.",
                  cite: "cnbc.com, techcrunch.com",
                  url: "https://cnbc.com/2025/01/15/ai-video-platform-synthesia-doubles-valuation-to-2point1-billion.html",
                },
                {
                  text: `CNBC: "a platform creating AI-generated clips with human avatars that speak multiple languages." TechCrunch: "approximately 60,000 enterprises and 1 million users using avatar-based videos from text."`,
                  cite: null, url: null,
                },
                {
                  text: `The text-to-video page explicitly names accepted inputs: "Use a prompt, a URL, a document, or a script," then describes the output as scenes, voiceover, and an AI avatar.`,
                  cite: "synthesia.io/features/text-to-video",
                  url: "https://www.synthesia.io/features/text-to-video",
                },
                {
                  text: "The Learning and Development page breaks the workflow into a machine-readable four-step sequence: Create your script, Customise your video, Collaborate, Share and export — each step specifying an input and an output.",
                  cite: "synthesia.io/learning-and-development",
                  url: "https://www.synthesia.io/learning-and-development",
                },
                {
                  text: "Integration documentation names 360Learning, HubSpot, Shopify, WordPress, and PowerPoint. Each named platform is a retrieval anchor — a signal that the claim is specific, documented, and linked to something real.",
                  cite: "docs.synthesia.io/docs/synthesia-integrations",
                  url: "https://docs.synthesia.io/docs/synthesia-integrations",
                },
                {
                  text: "Pricing is public: Basic at $0, with Starter, Creator, and Enterprise tiers named. No sales-call gate on the entry tier.",
                  cite: "synthesia.io/pricing",
                  url: "https://www.synthesia.io/pricing",
                },
                {
                  text: `G2 reviews carry both praise ("The ability to make edits without having to reshoot an entire video is a huge advantage") and criticism ("The avatars I used mostly look flat and expressionless") — adding realistic decision-context AI models encounter in the wild.`,
                  cite: "g2.com/products/synthesia/reviews",
                  url: "https://www.g2.com/products/synthesia/reviews?qs=pros-and-cons",
                },
                {
                  text: "Trustpilot adds an additional independent corroboration layer with both positive and negative feedback, including commentary on content policy limits.",
                  cite: "trustpilot.com/review/synthesia.io",
                  url: "https://www.trustpilot.com/review/synthesia.io",
                },
                {
                  text: `Moody's case study: "If something took us 4 hours, it's taking us 30 minutes with Synthesia" — 87% reduction, named customer, stated baseline, and direct quote. The most citation-ready evidence unit in this category.`,
                  cite: "synthesia.io/case-studies",
                  url: "https://www.synthesia.io/case-studies",
                },
              ] as { text: string; cite: string | null; url: string | null }[]).map((pt, i) => (
                <li key={i} style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 7 }} />
                  <span>
                    {pt.text}
                    {pt.cite && pt.url && (
                      <a href={pt.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", marginLeft: 5, fontSize: 14, textDecoration: "underline" }}>{pt.cite}</a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p style={{
              fontSize: 16, color: "#000", lineHeight: 1.6, margin: "12px 0",
              background: "rgba(250,204,21,0.15)",
              border: "1px solid rgba(250,204,21,0.4)",
              borderRadius: 6,
              padding: "8px 12px",
            }}>
              <span style={{ fontWeight: 700 }}>Synthesia data: </span>
              {`AI talking head / avatar video ${synVoiceScore ?? "—"}. The evidence text cited the text-to-avatar pipeline as a named, multi-step workflow with specific accepted inputs. Synthesia appears in the Voice and Avatar and Translation mention trends.`}
            </p>
            <div style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.03) 100%)",
              border: "1px solid rgba(37,99,235,0.18)",
              borderLeft: "4px solid #2563eb",
              borderRadius: "0 10px 10px 0",
              padding: "14px 18px",
            }}>
              <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#2563eb", margin: "0 0 6px" }}>
                Takeaway
              </p>
              <p style={{ fontSize: 16, color: "#000", lineHeight: 1.65, margin: 0, fontWeight: 400 }}>
                Synthesia&apos;s most replicable lesson is independent press corroboration: the same claim repeated on an owned page, in a G2 review, in a CNBC article, and in a TechCrunch funding story gives AI models four independent sources for the same identity. The Moody&apos;s case study — 4 hours to 30 minutes, 87% reduction, named customer — is the strongest single evidence unit produced by any brand in this report and the direct model for what Superdegree should commission.
              </p>
            </div>
          </div>
        </div>
        );
        })()}

        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", margin: "28px 0 28px" }} />

        {/* Shared pattern table */}
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 6 }}>The Shared Visibility Pattern</h4>
          <p style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", lineHeight: 1.6, marginBottom: 16 }}>
            Both companies have built an evidence system, not just a marketing site. The same claim appears across a product page, a documentation page, a customer story, a review, and an independent article.
          </p>
          <div style={{ overflowX: "auto" as const }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
              <thead>
                <tr>
                  {["Pattern", "Descript", "Synthesia"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.07em", textTransform: "uppercase" as const,
                      color: "rgba(0,0,0,0.4)", borderBottom: "2px solid rgba(0,0,0,0.08)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    {
                      pattern: "Dedicated feature URLs",
                      desc: "Each core capability lives at its own stable, crawlable URL — giving LLMs a dedicated document to cite per query rather than a single homepage mention.",
                      descript: (
                        <>
                          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: "0 0 6px" }}>Publishes a separate product page per workflow. Each URL describes one capability end-to-end so a model can retrieve the exact page when asked about that feature.</p>
                          <a href="https://www.descript.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/video-editing</a>
                          {", "}
                          <a href="https://www.descript.com/underlord" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/underlord</a>
                          {", "}
                          <a href="https://www.descript.com/integrations" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/integrations</a>
                        </>
                      ),
                      synthesia: (
                        <>
                          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: "0 0 6px" }}>Publishes a dedicated landing page per use case — avatar video, text-to-video, and enterprise each sit at their own indexed URL with full feature descriptions.</p>
                          <a href="https://www.synthesia.io/features/text-to-video" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/features/text-to-video</a>
                          {", "}
                          <a href="https://www.synthesia.io/features/avatars" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/features/avatars</a>
                          {", "}
                          <a href="https://www.synthesia.io/enterprise" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>/enterprise</a>
                        </>
                      ),
                    },
                    {
                      pattern: "Input-to-output language",
                      desc: "Every product description names a concrete starting material and a concrete output — so an LLM can retrieve an exact transformation rather than a vague capability claim.",
                      descript: (
                        <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: 0 }}>The core workflow is described as: footage in → edit the transcript → video updates. No ambiguity about what triggers the change or what the output looks like.</p>
                      ),
                      synthesia: (
                        <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: 0 }}>Any text input (prompt, URL, document, or script) becomes scenes, AI voiceover, and an avatar-narrated video. The transformation is stated explicitly on every product page.</p>
                      ),
                    },
                    {
                      pattern: "Named integrations",
                      desc: "Rather than claiming broad compatibility, both companies name specific applications — giving LLMs concrete tool names to associate with the product when answering workflow questions.",
                      descript: (
                        <>
                          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: "0 0 6px" }}>The integrations page names Google Drive, Slack, Adobe Premiere, Final Cut Pro, DaVinci Resolve, Dropbox, and Zoom individually — each with its own connector card.</p>
                          <a href="https://www.descript.com/integrations" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>descript.com/integrations</a>
                        </>
                      ),
                      synthesia: (
                        <>
                          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: "0 0 6px" }}>The integrations docs name PowerPoint, 360Learning, HubSpot, Shopify, WordPress, and major LMS platforms by name — making the product retrievable for L&D and marketing workflow queries.</p>
                          <a href="https://docs.synthesia.io/docs/synthesia-integrations" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>docs.synthesia.io/integrations</a>
                        </>
                      ),
                    },
                    {
                      pattern: "Public pricing",
                      desc: "Named, numbered tiers on a public page give LLMs a retrievable fact (e.g. \"$29/mo Starter\") rather than a \"contact us\" dead end that cannot be cited.",
                      descript: (
                        <>
                          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: "0 0 6px" }}>Five tiers (Free, Hobbyist $16/mo, Creator $24/mo, Business $50/mo, Enterprise) are named with prices and feature breakdowns — no sign-in required to see them.</p>
                          <a href="https://www.descript.com/pricing" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>descript.com/pricing</a>
                        </>
                      ),
                      synthesia: (
                        <>
                          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: "0 0 6px" }}>Four tiers (Basic free, Starter $29/mo, Creator $89/mo, Enterprise) are named and publicly listed with per-feature comparisons. A buyer can self-qualify without speaking to sales.</p>
                          <a href="https://www.synthesia.io/pricing" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>synthesia.io/pricing</a>
                        </>
                      ),
                    },
                    {
                      pattern: "Named proof format",
                      desc: "Outcomes are expressed as a named customer + a measurable before/after metric — giving LLMs a citable fact rather than a vague testimonial that cannot be independently retrieved.",
                      descript: (
                        <>
                          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: "0 0 6px" }}>{"Revelo's CMO describes taking podcast production from days to hours using Descript's text-based editing — a named company, a named contact, and a directional improvement."}</p>
                          <a href="https://www.descript.com/customers/revelo" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>descript.com/customers/revelo</a>
                        </>
                      ),
                      synthesia: (
                        <>
                          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: "0 0 6px" }}>{"Moody's cut training video production from 4 hours to 30 minutes — an 87% reduction — with a named customer contact and a reproducible baseline. The strongest single evidence unit in this competitive set."}</p>
                          <a href="https://www.synthesia.io/case-studies" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>synthesia.io/case-studies</a>
                        </>
                      ),
                    },
                    {
                      pattern: "Comparison surface",
                      desc: "A page that explicitly names competitors and explains the difference creates a document that connects the brand to a competitive category — making it retrievable for \"X vs Y\" queries.",
                      descript: (
                        <>
                          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: "0 0 6px" }}>Publishes an official compare page positioning Descript vs Riverside — names the competitor, explains the workflow trade-offs, and sits at a stable indexed URL.</p>
                          <a href="https://www.descript.com/compare/descript-vs-riverside" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>descript.com/compare/descript-vs-riverside</a>
                        </>
                      ),
                      synthesia: (
                        <>
                          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: "0 0 6px" }}>{"G2's alternatives page independently names HeyGen, Descript, and VEED alongside Synthesia — creating neutral third-party comparison context that LLMs can cite without attributing it to Synthesia's own marketing."}</p>
                          <a href="https://www.g2.com/products/synthesia/competitors/alternatives" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>g2.com/products/synthesia/competitors</a>
                        </>
                      ),
                    },
                  ] as { pattern: string; desc: string; descript: React.ReactNode; synthesia: React.ReactNode }[]
                ).map(({ pattern, desc, descript, synthesia }) => (
                  <tr key={pattern}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(0,0,0,0.06)", verticalAlign: "top", width: "28%" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>{pattern}</p>
                      <p style={{ fontSize: 14, color: "#000", lineHeight: 1.55, margin: 0 }}>{desc}</p>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#000", verticalAlign: "top", width: "36%" }}>{descript}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#000", verticalAlign: "top", width: "36%" }}>{synthesia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", margin: "8px 0 28px" }} />

        {/* Playbook */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: PURPLE, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "rgba(0,0,0,0.45)" }}>Superdegree</span>
          </div>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 4 }}>
            The recommended steps Superdegree can take to become LLM-Visible
          </h4>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {[
              {
                rank: 1,
                impact: "High",
                type: "Owned",
                action: "Publish a canonical autonomous-browser-agent workflow page",
                what: `Create a stable URL such as /features/autonomous-browser-video-agent and document the exact sequence: task brief or product URL, cloud-browser navigation, screen recording, automatic editing with zooms, captions, and narration, then a finished product video plus a written guide. Include a short worked example showing the agent's starting instruction, observed browser actions, and final artefacts.`,
                why: `Descript and Synthesia make their identities citable by expressing a complete input-to-output workflow. Superdegree already has the underlying claim on its site but spread across multiple pages rather than anchored at one stable URL.`,
                source: "Evidence: descript.com/video-editing, synthesia.io/features/text-to-video, super.degree/learn",
              },
              {
                rank: 2,
                impact: "High",
                type: "Owned",
                action: "Name the agent and publish its exact action primitives",
                what: `Give the system a stable product name and publish an action inventory: open URL, click, type, navigate, recover from a changed interface, record, detect steps, add zoom, narrate, caption, generate guide. Do not describe it only as "AI-powered." Define what the agent observes, does, and returns.`,
                why: `Descript's phrase "It's an agentic co-editor" and "can act on your behalf" gives a language model an identifiable object and a set of behaviours to retrieve. Without a named entity, the claim cannot be cited with confidence.`,
                source: "Evidence: help.descript.com/underlord, synthesia.io/learning-and-development",
              },
              {
                rank: 3,
                impact: "High",
                type: "Earned",
                action: "Commission independently auditable benchmark case studies",
                what: `Recruit three product, support, or enablement teams and publish before-and-after measures: recording time, editing time, interface steps, revision count, guide creation time, and percentage of screens successfully completed without human intervention. Give customers permission to publish their own versions on their own domains or on neutral review platforms.`,
                why: `Synthesia's Moody's case is citable because it gives a named customer, a baseline, an outcome, and a direct quote. A claim that exists only on Superdegree's own domain cannot be independently corroborated.`,
                source: "Evidence: synthesia.io/case-studies, descript.com/customers/revelo",
              },
              {
                rank: 4,
                impact: "High",
                type: "Earned",
                action: "Earn neutral category labels through hands-on reviews and roundups",
                what: `Offer Superdegree to independent reviewers who cover AI video, product education, browser agents, and screen-recording automation. Provide a reproducible test brief but do not script the conclusion. The target is a phrase such as "best autonomous browser agent for product demo videos" supported by the reviewer's own observed workflow.`,
                why: `Vizard gives Descript a durable category label in its 2026 roundup. G2's alternatives page creates named comparison context around Synthesia. A neutral category description is the largest missing evidence layer for Superdegree.`,
                source: "Evidence: vizard.ai/blog/best-ai-video-editing-tools-2026",
              },
              {
                rank: 5,
                impact: "Medium",
                type: "Owned",
                action: "Build factual comparison pages against adjacent tools",
                what: `Publish comparisons such as Superdegree vs Descript for autonomous product walkthroughs, Superdegree vs Synthesia for browser-grounded demos, and Superdegree vs conventional screen recorders. Use a capability matrix covering browser navigation, recording, editing, avatars, transcript editing, written guides, and integrations. State only what each public source documents.`,
                why: `Descript has an official "Descript vs Riverside" comparison page. G2's Synthesia alternatives page names several competitors and maps their positioning. Competitor nouns help models resolve the category.`,
                source: "Evidence: descript.com/blog/article/descript-vs-riverside-best-remote-recording-tool",
              },
              {
                rank: 6,
                impact: "Medium",
                type: "Owned",
                action: "Publish named integrations, export formats, and operational constraints",
                what: `Create /integrations and /docs pages naming the browser environment, supported application types, export formats, caption and narration options, guide formats, and handoff destinations. State constraints plainly, including the 10-minute recording limit and the fact that no extension or desktop app is required.`,
                why: `Descript names every major integration and says they enable "1-click imports." Superdegree already has a differentiating constraint documented on its homepage but it is not yet on a dedicated, indexable page.`,
                source: "Evidence: descript.com/integrations, docs.synthesia.io/docs/synthesia-integrations",
              },
              {
                rank: 7,
                impact: "Medium",
                type: "Owned + Earned",
                action: "Publish transparent pricing and a limitations page",
                what: `Put at least one exact plan or a transparent credit formula on /pricing, explain what consumes credits, and state when a human review step is recommended. Add a public limitations page covering browser-only recording, recording duration, dynamic interfaces, authentication, failed steps, and revision behaviour.`,
                why: `Both comparators make pricing discoverable. Their review and Reddit visibility also includes criticism: Descript's AI-credit complaints and Synthesia's avatar limitations. Transparent constraints make Superdegree more trustworthy and give independent writers concrete, testable material.`,
                source: "Evidence: descript.com/pricing, synthesia.io/pricing",
              },
            ].map(({ rank, impact, type, action, what, why, source }) => (
              <div key={rank} style={{
                display: "flex", gap: 16, alignItems: "flex-start",
                padding: "18px 20px",
                background: "#FAFAFA",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.06)",
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", background: PURPLE,
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 2,
                }}>{rank}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 7 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const,
                      color: PURPLE, background: "rgba(124,58,237,0.1)", borderRadius: 999, padding: "2px 8px",
                    }}>Impact: {impact}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: "rgba(0,0,0,0.45)",
                      background: "rgba(0,0,0,0.05)", borderRadius: 999, padding: "2px 8px",
                    }}>{type}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 8, lineHeight: 1.3 }}>{action}</p>
                  <p style={{ fontSize: 13, color: "#000", lineHeight: 1.65, marginBottom: 8 }}><strong style={{ color: NAVY }}>What to do: </strong>{what}</p>
                  <p style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", lineHeight: 1.6, paddingLeft: 10, borderLeft: `3px solid rgba(124,58,237,0.25)`, marginBottom: 6 }}><strong style={{ color: NAVY }}>Why it works: </strong>{why}</p>
                  <p style={{ fontSize: 11, color: "rgba(0,0,0,0.3)" }}>{source}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key move */}
          <div style={{
            background: NAVY, borderRadius: 10, padding: "24px 26px", marginTop: 20,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Single highest-leverage move</div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 10 }}>
              Make the browser agent a named, testable, cross-source entity
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: 0 }}>
              Superdegree&apos;s genuine differentiator is an autonomous browser-navigating agent that no brand in this competitive set has built — all seven tracked brands (Descript, Synthesia, HeyGen, Opus Clip, D-ID, DeepBrain, Renderforest) score 0 on autonomous browser recording in the feature scores above, each for a different reason. But this differentiator currently exists only on Superdegree&apos;s own domain. The highest-leverage move is to publish one canonical claim at a stable URL, in mechanism-level language, and then facilitate independent tests that reproduce the exact workflow and publish their own observations. The goal is for a language model to encounter the same claim across Superdegree&apos;s own documentation, a customer case study, an independent reviewer&apos;s article, and a review platform. That converts a marketing assertion into a named, testable entity that Claude and GPT-4o-mini can confidently cite.
            </p>
          </div>
          <p style={{ fontSize: 11, color: "rgba(0,0,0,0.3)", marginTop: 10, textAlign: "center" as const }}>
            Research conducted via Parallel.ai · August 2026 · AgenticLib
          </p>
        </div>
      </div>

      {/* ── Row 11: Product improvement opportunities ───────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 24px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
              Product Feature Opportunities
            </h3>
            <span style={{ fontSize: 12, fontWeight: 600, background: "rgba(124,58,237,0.1)", color: PURPLE, borderRadius: 999, padding: "3px 10px" }}>
              Superdegree
            </span>
          </div>
          <p style={{ fontSize: 15, color: "#000", margin: 0, lineHeight: 1.6 }}>
            Three capabilities where Superdegree&apos;s current product is well-positioned but a targeted expansion would improve AI model coverage — and team outcomes. All three require net-new product work, not documentation of existing features.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            {
              title: "Reusable flow library",
              current: "Superdegree offers brand formats and reusable templates.",
              improvement: `Add a "flow library" where common app segments — login, settings navigation, key UI states — are saved as reusable clips. When the UI changes, updating the clip propagates to every video that references it, turning one-time recordings into maintainable assets. This addresses a gap the Collaboration and AI Agents clusters are already probing for.`,
            },
            {
              title: "Agent decision notes",
              current: "The Ask agent drives the app autonomously in a hosted browser and captures the full flow without a human at the keyboard.",
              improvement: `Surface lightweight agent decision notes alongside the captured recording — "I clicked here because this is the primary CTA," "I paused here because I detected a required field" — as a review layer editors see before publishing. Closes the gap between autonomous capture and trustworthy autonomous capture, and gives LLMs concrete language to describe the feature.`,
            },
            {
              title: "Cross-team narration consistency",
              current: "Superdegree clones individual voices and lets anyone re-record lines without re-recording. The brand kit covers visual consistency.",
              improvement: "Add a narration consistency check that surfaces when a new video's pacing or tone reads significantly differently from the team's existing library. Useful for CS and product teams publishing to a shared help centre, and directly addressable by AI models when asked about enterprise video governance — a currently underdocumented cluster.",
            },
          ].map(({ title, current, improvement }, i, arr) => (
            <div key={title} style={{
              display: "flex",
              gap: 20,
              padding: "20px 0",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
            }}>
              <div style={{ width: 28, flexShrink: 0, paddingTop: 2 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: PURPLE, color: "#fff",
                  fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {i + 1}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8, flexWrap: "wrap" as const }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0, letterSpacing: "-0.01em" }}>{title}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#d97706", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 4, padding: "1px 7px", whiteSpace: "nowrap" as const, flexShrink: 0 }}>Product build required</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#059669", background: "rgba(5,150,105,0.08)", borderRadius: 999, padding: "2px 8px", flexShrink: 0, marginTop: 1 }}>Current</span>
                    <p style={{ fontSize: 14, color: "#000", margin: 0, lineHeight: 1.65 }}>{current}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: PURPLE, background: "rgba(124,58,237,0.08)", borderRadius: 999, padding: "2px 8px", flexShrink: 0, marginTop: 1 }}>Opportunity</span>
                    <p style={{ fontSize: 14, color: "#000", margin: 0, lineHeight: 1.65 }}>{improvement}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footnotes ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 4px" }}>
        <p style={{ fontSize: 11, color: "#000", margin: 0, textAlign: "center" }}>
          Based on 22 daily prompts across Claude Haiku and GPT-4o-mini · AI Video Creation category · collecting since August 2026
        </p>
        <p style={{ fontSize: 11, color: "#000", margin: "0 auto", textAlign: "center", maxWidth: 680 }}>
          Scores require agreement between both AI models. When models disagree, we take the more conservative rating, so a lower score sometimes means models disagree, not that documentation is absent. Check the evidence text for the fuller picture.
        </p>
      </div>

    </div>
  );
}
