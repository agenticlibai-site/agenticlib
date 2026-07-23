"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Palette ────────────────────────────────────────────────────────────────────
const NAVY   = "#000000";
const BLUE   = "#2563EB";
const INDIGO = "#6B4FBB";

const LINE_COLORS = [
  "#2563EB", "#6B4FBB", "#E8447A", "#059669", "#DC2626",
  "#D97706", "#0891B2", "#C026D3", "#EA580C", "#0D9488",
  "#7C3AED", "#65A30D", "#0369A1", "#92400E", "#BE185D",
  "#F43F5E", "#84CC16", "#FB923C", "#818CF8", "#34D399",
];

function lineColor(i: number) { return LINE_COLORS[i % LINE_COLORS.length]; }

// Fixed brand→color map so every chart, table, and card uses the same colour
// for the same brand regardless of sort order or section.
const BRAND_COLOR_MAP: Record<string, string> = {
  "Chorus":       "#2563EB",
  "Outreach":     "#6B4FBB",
  "Gong":         "#E8447A",
  "Salesloft":    "#059669",
  "Clari":        "#DC2626",
  "Conversica":   "#D97706",
  "Revenue.io":   "#0891B2",
  "Apollo":       "#C026D3",
  "ZoomInfo":     "#EA580C",
  "Lemlist":      "#0D9488",
  "Clay":         "#7C3AED",
  "Reply.io":     "#65A30D",
  "Seamless.ai":  "#0369A1",
  "Avoma":        "#92400E",
  "Backstory.ai": "#BE185D",
  "6sense":       "#F43F5E",
  "Mindtickle":   "#84CC16",
  "Highspot":     "#FB923C",
  "Tact.ai":      "#818CF8",
};
function getBrandColor(brand: string): string {
  return BRAND_COLOR_MAP[brand] ?? LINE_COLORS[0];
}


function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

// ── Locked brand list (19 brands — mirrors locked_sales_agents table, minus
// Drift). Clari and Chorus are tracked and charted as fully separate rows —
// only their display label is annotated with the parent company that now owns
// them (see SUB_BRAND_LABEL below); mentions, positions, SOV, and scores are
// never merged. Drift is excluded entirely: Salesloft/Clari sunset it in
// March 2026 (no new customers, no successor product under the Drift name),
// so it's no longer a live product worth reporting on.
const LOCKED_SALES_BRANDS = new Set([
  "Chorus", "Outreach", "Gong", "Salesloft", "Clari",
  "Conversica", "Revenue.io", "Apollo", "ZoomInfo",
  "Lemlist", "Clay", "Reply.io", "Seamless.ai", "Avoma",
  "Backstory.ai", "6sense", "Mindtickle", "Highspot", "Tact.ai",
]);

// ── Sub-brands now owned by a parent company post-acquisition/merger ──────────
// Clari → Salesloft (merged Dec 2025). Chorus → ZoomInfo (acquired 2021,
// operates as "ZoomInfo Chorus"). Label-only: each brand still gets its own
// row/line/slice everywhere in the report.
const SUB_BRAND_LABEL: Record<string, string> = {
  "Clari": "Salesloft (Clari)",
  "Chorus": "ZoomInfo (Chorus)",
};

function displayBrand(brand: string): string {
  return SUB_BRAND_LABEL[brand] ?? brand;
}

// ── Primary use case per brand ────────────────────────────────────────────────
const BRAND_USE_CASE: Record<string, string> = {
  "Chorus":       "sales-call",
  "Gong":         "sales-call",
  "Revenue.io":   "sales-call",
  "Avoma":        "sales-call",
  "Backstory.ai": "sales-crm",
  "Tact.ai":      "sales-crm",
  "Clari":        "sales-pipeline",
  "6sense":       "sales-pipeline",
  "Outreach":     "sales-outreach",
  "Salesloft":    "sales-outreach",
  "Conversica":   "sales-outreach",
  "Apollo":       "sales-outreach",
  "Lemlist":      "sales-outreach",
  "Clay":         "sales-outreach",
  "Reply.io":     "sales-outreach",
  "Seamless.ai":  "sales-outreach",
  "ZoomInfo":     "sales-outreach",
  "Mindtickle":   "sales-enablement",
  "Highspot":     "sales-enablement",
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface DailyRow        { date: string; brand: string; model: string; mention_count: number; avg_position: number | null }
interface WeeklyRow       { brand: string; model: string; mention_count: number; avg_position: number | null }
interface LLMVisRow       { model: string; visibility_pct: number; total_responses: number }
interface SOVRow          { bucket_tag: string; brand: string; total_appearances: number; sov_pct: number }
interface ClusterPosRow   { bucket_tag: string; brand: string; avg_position: number; appearances: number }
interface FeatureScoreRow { brand_name: string; feature_id: string; feature_tag: string; score: number; score_band: string; flagged_for_review: boolean; evidence: string | null }
interface SentimentRow  { brand_name: string; bucket_tag: string; positive_count: number; neutral_count: number; negative_count: number; total_count: number; top_descriptors: string[] }
interface SentimentMeta { dual_model_dates: number; earliest_date: string | null; latest_date: string | null }

interface Props {
  dailySummary:     DailyRow[];
  weeklySummary:    WeeklyRow[];
  llmVisibility:    LLMVisRow[];
  sovData:          SOVRow[];
  clusterPositions: ClusterPosRow[];
  featureScores:    FeatureScoreRow[];
  sentimentData:    { rows: SentimentRow[]; meta: SentimentMeta };
}

function twoSentences(text: string): string {
  let end = text.indexOf('. ');
  if (end === -1) return text;
  end = text.indexOf('. ', end + 2);
  return end > 0 ? text.slice(0, end + 1) : text;
}

function cleanEvidence(raw: string | null): string | null {
  if (!raw) return null;
  const stripped = raw.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '').trim();
  if (!stripped) return null;
  const lower = stripped.toLowerCase();
  if (
    lower.includes('not explicitly document') ||
    lower.includes('does not document') ||
    lower.includes('no specific documentation') ||
    lower.includes('without clear documentation') ||
    lower.includes('documentation not available') ||
    lower.includes('not documented') ||
    lower.includes('cannot be confirmed from') ||
    lower.includes('no available information') ||
    lower.includes('does not provide documentation')
  ) return null;
  const LIMIT = 300;
  if (stripped.length <= LIMIT) return stripped;
  const cut = stripped.lastIndexOf('. ', LIMIT);
  // Never hard-cut mid-sentence — if no boundary found, return the full text.
  return cut > 0 ? stripped.slice(0, cut + 1) : stripped;
}

// ── Feature scores config ──────────────────────────────────────────────────────
const BAND_COLORS: Record<string, string> = {
  strong:  "#16a34a",
  present: "#2563eb",
  partial: "#d97706",
  weak:    "#dc2626",
};

const BAND_FALLBACK: Record<string, string> = {
  strong:  "Strong capability confirmed. The platform demonstrates this feature comprehensively across assessed dimensions.",
  present: "Capability confirmed and present in the core product offering.",
  partial: "Partial capability detected. The platform shows some support for this feature but depth, differentiation, or documentation may be limited.",
  weak:    "Limited capability based on available assessment information. Core functionality may be absent or underdeveloped.",
};

function featureName(id: string): string {
  return FEATURE_NAMES[id] ?? id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const FEATURE_NAMES: Record<string, string> = {
  call_transcription_timestamps:       "Call transcription & timestamps",
  call_talk_time_analytics:            "Talk-time analytics",
  call_coaching_scorecard:             "Rep coaching scorecard",
  call_competitor_objection_detection: "Competitor objection detection",
  pipeline_forecasting:                "AI pipeline forecasting",
  deal_risk_detection:                 "Deal risk detection",
  outreach_sequencing:                 "Multi-step outreach sequencing",
  ai_personalisation:                  "AI-personalised outreach at scale",
  crm_auto_update:                     "Automated CRM updates",
  crm_data_accuracy:                   "CRM data accuracy",
  followup_drafting:                   "Follow-up email drafting",
  sales_content_delivery:              "Sales content delivery",
  tech_crm_integration:                "Native CRM integration",
  tech_instruction_following:          "Instruction following",
  tech_workflow_automation:            "Workflow automation",
  rai_data_privacy:                    "Data privacy & compliance",
  rai_explainability:                  "Decision transparency",
  cost_pricing_transparency:           "Pricing transparency",
  cost_free_trial:                     "Free trial / self-serve access",
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  call_transcription_timestamps:       "Converts call audio to searchable text with speaker-labelled timestamps so any moment can be found and reviewed.",
  call_talk_time_analytics:            "Measures rep-vs-prospect talk ratio, filler word frequency, question rate, and longest monologue per call and per rep.",
  call_coaching_scorecard:             "Auto-scores rep calls against a defined rubric and surfaces the highest-priority coaching moments for managers.",
  call_competitor_objection_detection: "Detects competitor mentions and buyer objections in real time or post-call so reps can respond and managers can coach.",
  pipeline_forecasting:                "Predicts close probability and revenue using engagement signals and AI, not just rep-submitted forecast numbers.",
  deal_risk_detection:                 "Flags stalled or at-risk deals by detecting champion silence, engagement drops, or stage stagnation.",
  outreach_sequencing:                 "Automates multi-touch email, call, and LinkedIn cadences with AI-optimised timing and branching step logic.",
  ai_personalisation:                  "Generates unique opening lines or message personalisation from prospect data (title, industry, signals) at scale.",
  crm_auto_update:                     "Writes call outcomes, next steps, and deal stage changes to CRM fields automatically, with no manual rep entry required.",
  crm_data_accuracy:                   "Validates and enriches CRM records to reduce stale, incomplete, or duplicate contact and account data.",
  followup_drafting:                   "Drafts post-call follow-up emails that summarise key discussion points, commitments made, and agreed next steps.",
  sales_content_delivery:              "Surfaces the right pitch decks, case studies, or battlecards at the right moment based on deal context and stage.",
  tech_crm_integration:                "Connects natively to Salesforce, HubSpot, or other CRMs without custom middleware or third-party connectors.",
  tech_instruction_following:          "Accurately executes multi-step natural-language instructions from reps or admins without hallucinating steps.",
  tech_workflow_automation:            "Triggers downstream actions in email, CRM, Slack, or other tools automatically based on call or deal events.",
  rai_data_privacy:                    "Documents how prospect data, call recordings, and CRM data are stored, encrypted, retained, and governed.",
  rai_explainability:                  "Explains why a deal was scored a certain way, a risk was flagged, or a specific recommendation was surfaced.",
  cost_pricing_transparency:           "Publishes clear pricing tiers or per-seat costs publicly, without requiring a sales call to get a number.",
  cost_free_trial:                     "Offers a self-serve trial or freemium tier that can be activated without a mandatory demo or sales conversation.",
};

// Hand-curated evidence for brand/feature combos where grounded DB rows don't exist
// but diagnostic queries found specific detail in Haiku partial rows, or where the
// model's generic output needed replacing with what the brand's own docs actually say.
const EVIDENCE_OVERRIDE: Record<string, Record<string, string>> = {
  rai_data_privacy: {
    "Gong": "SOC 2 Type II, ISO 27001/27017/27018/27701/42001, HIPAA, and PCI DSS certified. Lets customers pin call/prospect data to a US or EU AWS region, with the customer as data controller and Gong as processor, a region-choice + controller/processor split worth copying for any agent handling call recordings. Access is gated by MFA and least-privilege roles, with real-time threat monitoring layered on top. In-product, admins can build do-not-record exclusion lists by domain, email, or title keyword (e.g. flagging \"sensitive\" in a meeting name). Automatic redaction strips payment-card and ID numbers from new recordings, and retention is capped at three years or the contract term via a single Admin Center toggle.",
    "Outreach": "SOC 2 Type II, ISO 27001/27701 certified. TLS 1.2+ at rest and in transit, hard data-minimisation (nothing retained past service need), and 24-hour RTO/RPO disaster-recovery targets. DPAs with EU/UK Standard Contractual Clauses extend to its own subprocessors too, a clean template for subprocessor accountability, not just first-party compliance. Admins get a self-service console for single-record Right-to-be-Forgotten requests and selective CSV export for other data subject access requests. A deeper \"Compliance Delete\" scrubs a person's data across every Outreach system beyond what a standard delete reaches, with one-time or recurring retention schedules configurable per org.",
    "Chorus": "SOC 2 Type II, ISO 27001/27701 certified via ZoomInfo's shared trust program. AES-256 at rest, TLS 1.2+ in transit, SHA-256 salted password hashes, MFA/SSO required for access. 24/7 SOC monitoring with 90-day log retention, plus WAF/DDoS/intrusion-detection at the network edge, a solid reference stack for any agent ingesting call recordings at volume. Recordings persist until manually deleted or, if an admin enables it, auto-purge after 180 days. Visibility is scoped through hierarchical team permissions, and every call has its own settings panel for adjusting privacy on a per-recording basis rather than only at the org level.",
    "Avoma": "SOC 2 Type II certified with annual third-party pen testing. TLS-only connections, at-rest encryption via AWS-managed keys, app servers isolated in their own VPC behind restricted security groups. Standout piece: jurisdiction-aware recording-consent prompts (one-party vs. two-party) built directly into the product UX, not just described in a policy doc. Worth replicating for any agent that records calls. Every meeting is auto-classified internal or external by attendee email domain and gets one of four privacy tiers applied by default with no manual tagging required. Avoma also commits contractually to deleting customer data within 30 days of contract termination or on request.",
    "Clari": "SOC 2 Type II (zero exceptions), ISO 27001/27701, HIPAA, GDPR/CCPA. Encrypts at rest and in transit, though exact algorithms aren't public. Depth requires requesting the whitepaper. Two cheap, high-trust signals worth adopting regardless of certification stage: a public vulnerability-disclosure program and a live status page. Governance is enforced through role-based plus field-level permissions with an audit log tracking who changed what and when. Some customers flag the audit trail as too coarse for detailed compliance reporting, though. Worth validating before relying on it as a sole compliance record.",
  },
  call_talk_time_analytics: {
    "Gong": "Gong provides detailed communication metrics, including the talk-time ratio, which allows sales managers to see how much time each rep spends speaking versus listening during calls. This metric helps teams understand engagement levels in their conversations, emphasising the importance of listening for effective selling. It also scores \"Patience\" (the median pause before a rep responds, with 0.6–1 second flagged as the ideal \"golden pause\") and \"Interactivity,\" a 0–10 score for how often speakers switch per minute. Longest monologue and question rate round out the same dashboard, so coaching isn't limited to a single ratio.",
    "Chorus": "Chorus provides detailed call analytics that include metrics like talk-time ratio between reps and prospects, enabling sales managers to assess how well reps balance talking and listening during calls. This tracking allows teams to identify coaching opportunities and improve communication skills over time. The same dashboard tracks filler words, question count, and topic coverage, and can be customised around CRM fields like deal stage or size rather than a single fixed view. Reps can be benchmarked against top performers on each metric individually, not just an overall score.",
    "Avoma": "Avoma provides detailed per-call communication metrics, including talk-time ratios, filler word frequency, longest uninterrupted monologue, and question rates. This allows sales teams to analyse individual performance against key metrics, facilitating targeted coaching and enhancing listening skills for improved sales conversations. Its Conversation Insights dashboard flags calls against a 40–60% talk-time benchmark and lets managers drill into which specific filler words a rep overuses, not just a raw count. A dedicated coaching view rolls talk-to-listen ratio, monologue length, and sentiment up per rep over time, rather than showing only a single-call snapshot.",
  },
  call_coaching_scorecard: {
    "Revenue.io": "Every qualifying sales call is automatically scored by AI using predefined criteria, generating objective feedback across key sales behaviours like discovery, objection handling, and closing. A personalised coaching card is generated for each rep on every call. Scorecards can be built per role or sales motion and mapped to a named methodology like GAP Selling or MEDDIC rather than a generic rubric. Discovery quality alone is scored on its own 0–5 scale. A dedicated Coaching Feedback tab surfaces the AI's reasoning behind each score, so managers coach from specifics instead of a bare number.",
    "Avoma": "Avoma automatically generates post-call scorecards that detail coaching feedback on observed behaviours such as discovery depth, objection handling, and next-steps clarity. This is accomplished through AI-driven analysis that identifies key aspects of each call, enabling reps to receive personalised insights for improvement without requiring manager involvement. Scoring runs against pre-built templates for MEDDIC, BANT, SPICED, and SPIN, or fully custom scorecards a team builds itself, with every score backed by a timestamped clip as evidence. Managers also get weekly digests summarising each rep's strongest and weakest areas, plus coaching playlists curated by role.",
  },
  call_competitor_objection_detection: {
    "Gong": "Gong automatically detects and categorises competitor mentions and objection types during calls using advanced speech recognition and natural language processing. Sales teams receive insights into which competitors are mentioned most frequently and the common objections faced, enabling leaders to identify patterns and adjust strategies effectively. Detection runs on two layers: Keyword Trackers for exact terms, including a pre-built \"Competitors\" tracker seeded with named rivals, plus Smart Trackers that catch a concept regardless of phrasing. A discount request gets flagged whether a prospect says \"best price\" or \"any wiggle room.\" Both feed the same win/loss analytics without a rep tagging anything manually.",
    "Chorus": "Chorus employs advanced AI algorithms to automatically detect and categorise competitor mentions and pricing objections during calls. This functionality allows sales teams to gain insights into which competitors are frequently mentioned and what specific objections are hindering progress in deals, enabling teams to strategise more effectively against competition and tailor their responses to common objections. Trackers fire on competitor names, pricing terms, and named features out of the box, so a report can be built around every call where a specific rival came up. High-stakes moments, including churn risk, pricing pushback, and negative sentiment, can be configured to auto-escalate to a manager instead of waiting for a scheduled review.",
    "Revenue.io": "Revenue.io's Conversation Agents extract objections, next steps, and competitive mentions from every call, writing results to Salesforce fields automatically. The instant a competitor is mentioned, an objection surfaces, or a qualifying question goes unasked, a targeted notification fires in the rep's dialer. This live-notification layer, called Moments™, works mid-call rather than in a post-call review, and can surface a matching talk track to the rep in the same moment. Because everything writes to Salesforce automatically, competitor-mention reporting doesn't depend on reps logging it themselves.",
  },
  pipeline_forecasting: {
    "Clari": "Clari uses AI-driven insights to analyse historical data, deal progress, and engagement metrics, which allows it to provide a more accurate forecast of pipeline and revenue outcomes. This approach aggregates diverse data points beyond just rep-submitted numbers, enabling sales teams to gain a clearer picture of the likelihood of closing deals in the current quarter. Clari claims its forecasts reach roughly 98% accuracy by the second week of the quarter, and its Scenario Forecasting tool lets managers pull deals in or out of a model to test what-if scenarios before committing a number. A newly shipped MCP server also exposes the same pipeline data to Claude, ChatGPT, and other AI assistants, so forecast context isn't locked inside a single dashboard.",
    "6sense": "6sense employs AI to analyse intent data, historical trends, and engagement signals to forecast pipeline and predict revenue outcomes. This data-driven approach allows sales teams to gain a clearer understanding of potential close rates, enabling better allocation of resources and targeted strategies for upcoming quarters. Its predictive engine scores accounts against 50+ buying signals, including website visits, content consumption, technology changes, competitor research, then sorts each into a named buying stage (Awareness, Consideration, Decision, Purchase) rather than a single blended score. A monthly Predictive Model Insights Report then back-tests those predictions against actual outcomes on a 90-day lookback, so forecast accuracy is auditable rather than a black box.",
  },
  deal_risk_detection: {
    "Clari": "Clari utilises predictive analytics to identify at-risk deals by monitoring engagement metrics such as communication frequency, deal stage duration, and the activity levels of team members, including champions. This proactive flagging allows sales teams to prioritise at-risk opportunities and take action before they fall through, ensuring a more strategic approach to sales management. Clari Inspect backs each risk flag with an AI opportunity score, Activity Insights pulled from outside the CRM, and a Details Panel that checks whether the deal is following a named methodology like MEDDIC or Sandler. It can also surface why a deal moved, tying the shift to specific detected activity, or the lack of it, rather than leaving the change unexplained.",
    "6sense": "6sense utilises predictive analytics to automatically flag at-risk deals by monitoring key engagement metrics, such as a drop in communication with the champion or stagnation at certain deal stages. This enables sales teams to proactively address potential issues before deals fall through, allowing them to focus their efforts on high-risk opportunities. Each account sits in a Predictive Buying Stage (Target, Awareness, Consideration, or Decision), built from patterns across web, content, and search signals rather than a single risk score. Teams can configure email or Slack alerts so a newly at-risk deal surfaces the same day the signal changes, instead of waiting on a manual pipeline review.",
  },
  outreach_sequencing: {
    "Conversica": "Conversica automates multi-step outreach sequences using AI-driven assistants that manage the outreach process. The system triggers the next step automatically based on the response or engagement level of the prospect, ensuring follow-ups occur in a timely manner and freeing sales reps to focus on higher-value activities. Unlike template-blast sequencing tools, its NLP actually reads and interprets each reply, handling objections and follow-up questions in a genuine two-way exchange, before deciding the next step, rather than branching on opens and clicks alone. A lead is only routed to a human rep once a real buying signal emerges, so reps aren't chasing sequence steps that never showed intent.",
    "Lemlist": "Lemlist's conditional logic lets you branch sequences based on whether someone opened an email, clicked a link, or replied, so engaged prospects get a different follow-up path than cold ones. Timed conditions like \"Within\" and \"Wait Until\" automate the pacing of each step without manual input, including branching to a LinkedIn touch if an email goes unopened. Multi-channel sequences can combine several of these conditions across a single campaign, so a prospect's path adapts to every interaction rather than following one fixed script. This makes Lemlist better suited to smaller, condition-heavy sequences than the high-volume, CRM-anchored sequencing Outreach and Conversica are built for.",
    "Outreach": "Outreach provides a feature called \"Sequences\" that automates multi-step outreach campaigns. Reps can design a sequence that includes emails, calls, and LinkedIn touches, and Outreach automatically navigates through these steps based on recipient interactions such as email opens or responses. ML-driven A/B testing is built directly into the sequence layer, letting teams test subject lines, message variants, and send timing with statistical tracking baked in. Buyer sentiment analysis also classifies each reply as positive, neutral, an objection, or an unsubscribe, so a sequence can branch on how a prospect responded, not just whether they responded.",
  },
  ai_personalisation: {
    "Outreach": "Outreach employs AI-driven personalisation algorithms that automatically reference a prospect's recent activities, industry news, and role context to customise outreach messages. This ensures that sales teams can maintain a personal touch even when sending high volumes of emails, significantly enhancing engagement rates and relevance for recipients. Smart Data Enrichment pulls third-party account, contact, and intent data from providers like ZoomInfo directly into the workflow, giving the personalisation engine richer context than what's already sitting in the CRM. The same enrichment now extends to AI-generated subject lines, not just message bodies, through the Personalization Agent.",
    "Reply.io": "Reply.io utilises AI to analyse a prospect's public social media activity, company updates, and relevant news articles to tailor outreach messages automatically. This feature helps sales teams create personalised communications at scale, enhancing engagement and making interactions feel relevant to the recipient. Jason AI lets reps pick up to three personalisation points tied to specific value props or case studies, and its AI Variables act as smart placeholders that generate custom copy per contact from a short instruction rather than a single fixed template. Every personalised claim is validated against its source, with reps able to see exactly which data point Jason used to make it.",
    "Apollo": "Apollo utilises AI to analyse recent activities, company news, and relevant role context to automatically personalise outreach messages. This allows sales teams to send tailored communications at scale, improving engagement rates by making each message feel relevant and timely based on the prospect's current situation. Its AI assistant reads a prospect's LinkedIn profile, recent company news, and published articles to generate custom \"Icebreaker\" opening lines, with reps using it reporting roughly 30% less time spent writing. Apollo pairs this with an intent-data engine that flags when an account enters a \"buying window,\" so personalised outreach can be triggered by a real-time signal instead of a scheduled send.",
  },
  crm_auto_update: {
    "Tact.ai": "Tact.ai utilises AI-driven voice and messaging interfaces that automatically log call details and update Salesforce fields, including contacts, notes, and next steps. This reduces manual entry time for sales reps, allowing them to focus more on selling and engaging with clients. Its Edge AI architecture gives field reps a single pane of glass over CRM, email, calendar, and other scattered data sources, so updates and next-step nudges surface directly on a phone or tablet without needing a desktop CRM session. The platform reports handling roughly 80% of field customisations automatically, which is the detail worth copying for any agent aimed at mobile-first sales teams.",
    "Backstory.ai": "Backstory.ai automatically captures conversation details from sales calls and populates relevant fields in Salesforce, such as contacts, next steps, deal stage, and notes. This helps sales reps save time as they no longer need to manually input information after each call, allowing them to focus on selling rather than administrative tasks. It rebranded from People.ai in April 2026, shifting from raw activity capture toward reasoning over that data to answer specific deal questions directly inside Salesforce, Claude, or Copilot. Because activity is ingested and matched to the right account automatically, the CRM reflects what's actually happening in a deal without a rep changing anything.",
  },
  sales_content_delivery: {
    "Highspot": "Highspot automatically surfaces relevant content, such as battlecards and case studies, during sales conversations by analysing the specific context of the interaction, including the prospect's details and the deal stage. This intelligent content recommendation ensures that sales reps are equipped with the most pertinent information at the right moment, enhancing their effectiveness in real-time discussions. Its Deal Agent unifies CRM activity, buyer engagement, meeting transcripts, and manager feedback into one view, then auto-generates a branded Digital Sales Room for a specific deal in minutes using that live context. The same signals drive AI Role Play, letting reps rehearse against realistic objections and personas before a call rather than only receiving static content afterwards.",
    "Mindtickle": "Mindtickle automatically surfaces relevant battlecards, case studies, and talk tracks based on real-time analysis of deal stages and competitor mentions during sales calls. This capability allows sales reps to access tailored content at crucial moments, improving their responsiveness and confidence in addressing specific customer concerns. Recommendations factor in industry, persona, deal stage, and a rep's own past engagement history, not just the immediate call context, and can surface directly inside the CRM so reps don't have to leave their workflow to find it. This makes content delivery function more like just-in-time coaching than a static content library search.",
  },
  tech_crm_integration: {
    "Drift": "Drift natively integrates with both Salesforce and HubSpot, allowing seamless data sharing without needing middleware. This means that conversations are automatically logged, and leads can be qualified and routed directly into the CRM, enabling sales teams to act quickly on fresh leads and data insights. The Salesforce integration is bidirectional. Conversation engagement updates lead scores in real time, and reps can view full chat transcripts directly inside Salesforce records rather than switching tools. Because Drift was built Salesforce-first, teams report its routing, attribution, and pipeline tracking perform noticeably better there than in a HubSpot-primary setup.",
    "Chorus": "Chorus natively integrates with both Salesforce and HubSpot, allowing sales teams to seamlessly sync call data, meeting notes, and performance metrics directly into their CRM systems. This integration ensures that sales reps have immediate access to critical customer interactions, enhancing their ability to track engagement and improve follow-up strategies effectively. Every synced call also pushes a completed Salesforce task with a link to the recording, attendee list, topics discussed, and next steps, so the activity trail is reconstructable without opening Chorus itself. Its Momentum Insights layer surfaces the same pipeline and relationship visibility directly on ZoomInfo's own company and contact pages, not just inside Chorus.",
    "Reply.io": "Reply.io provides native integrations with both Salesforce and HubSpot that allow users to sync contacts, track interactions, and automate workflows directly without requiring any third-party middleware. This built-in capability means sales teams can ensure their CRM systems are always up to date with minimal manual overhead, enhancing productivity and streamlining engagement tracking. Worth noting for anyone building on this: the sync is one-directional, from Reply.io into the CRM, so updates made in Salesforce or HubSpot don't flow back automatically. Teams needing bidirectional sync typically layer on Zapier or the open API rather than relying on the native connector alone.",
  },
  tech_workflow_automation: {
    "6sense": "6sense's Intelligent Workflows feature includes an intuitive drag-and-drop canvas for building multi-step campaigns, with conditional logic and parallel workflows for flexibility. The tool lets you create intelligent branches based on any buyer signal and route buyers to the perfect next step based on any set of conditions, including deploying AI-personalised emails, pushing hot leads straight into Salesloft or Outreach sequences, and keeping technographic and firmographic data accurate across every connected system. This puts the branching logic on buyer behaviour rather than a fixed send schedule, so a workflow can react the same day an account's intent signal changes rather than at the next scheduled touch.",
    "Revenue.io": "Revenue.io automates multi-step sales workflows by intelligently analysing call data, updating CRM records, drafting follow-up communications, and flagging potential risks without human intervention. This seamless integration allows sales teams to save time on administrative tasks, focus more on selling, and reduce errors that can occur from manual processes. Its Moments feature fires live coaching notifications the instant a call connects (talk tracks, objection responses, compliance reminders), rather than surfacing guidance only after the call ends. RevAI is trained on the org's own Salesforce fields, pipeline, and rep behaviour rather than a generic model, so scorecards and coaching feedback reference the team's actual playbooks.",
    "Clari": "Clari automates multi-step sales workflows by leveraging its AI-driven insights and integrations with platforms like CRM systems. This allows Clari to analyse call data, automatically update the CRM with relevant information, draft follow-up emails, and flag risks without requiring manual input from sales reps, resulting in a seamless and efficient process that minimises administrative burdens. Smart Follow-Up Emails generate contextually accurate, personalised drafts based on the specifics of each conversation rather than a generic template. Clari Copilot handles the Salesforce updates directly, and RevGPT can draft the follow-up email, summarise the call, and identify next steps as one combined post-call action.",
  },
  rai_explainability: {
    "Chorus": "Chorus provides detailed insights when it flags a deal as at-risk by highlighting specific call behaviours and customer signals that contributed to the flag. For example, it can show indications such as objections raised during the call or a lack of engagement from the prospect, allowing sales teams to understand and address the issues proactively. Its Deal Recommendation Engine ties these flags to concrete signals, including declining meeting frequency, negative sentiment trends, and stalled commitment phrases, rather than a single opaque score, and lets teams set custom alert thresholds around them. Recommendations are also grounded in ZoomInfo's buying-committee data, so a stalled deal comes with a suggested contact to re-engage, not just a warning.",
    "Revenue.io": "Revenue.io provides insights into why a deal is flagged as at-risk by showing specific signals that triggered the alert, such as negative trends in interaction metrics. This clarity allows sales teams to take informed actions based on actual data, enhancing their ability to strategise on high-risk deals effectively. Deal Health Scores update daily from CRM data, activity signals, engagement recency, and actual conversation content combined, rather than from CRM fields alone. Its Conversation Agents also extract the specific objections, next steps, and competitor mentions behind a score and write them straight to Salesforce, so the explanation is attached to the record itself, not locked in a separate dashboard.",
    "Gong": "Gong provides detailed explanations when flagging a deal as at-risk by highlighting the specific signals that triggered the alert, such as lack of engagement or decreased communication frequency. This insight allows sales teams to understand the context behind the risk flag and take informed actions to address the issues. Its Deal Likelihood Score draws on 300+ buying signals to output a Low/Medium/High rating alongside a plain-language explanation of the contributing factors, rather than a bare number. Named risk warnings such as a red-flagged email, no prospect activity for a set number of days, or a single-threaded relationship, are colour-coded and individually configurable, so a manager can see exactly which condition tripped the alert.",
  },
  cost_free_trial: {
    "Reply.io": "Reply.io offers a 14-day free trial with no credit card required. The trial provides access to core platform features including a B2B database, multichannel sequences (email, LinkedIn, SMS, calls), reports, analytics, and API access with integrations like Salesforce and HubSpot. Users can start the trial directly at reply.io without requiring a sales call or demo, and pricing stays transparent beyond the trial too. Plans run $49/user for email-only, up to $139/user for the full AI SDR tier. That published, self-serve pricing is worth copying regardless of trial length; it lets a buyer size up cost before ever talking to sales.",
    "Apollo": "Apollo offers a free trial that allows users to access its platform and utilise its sales intelligence tools. This self-serve approach enables sales teams to explore features such as lead generation, email tracking, and engagement metrics without requiring a sales call, making it easy for potential customers to evaluate the tool's effectiveness directly. Beyond the trial, Apollo actually runs a free-forever Starter plan with the full 210M+ contact database, fair-use email sending, and a handful of mobile and export credits each month, not just a time-boxed trial that expires. The trade-off is real: as of late 2025 the free tier's email allowance was cut from 10,000 to 100 credits a month, and it excludes CRM integrations, so it's best treated as a data-quality test rather than an ongoing prospecting tool.",
    "Drift": "Drift discontinued its free trial and self-serve plan in 2023. There is no sandbox or trial period today, only a guided demo gated behind a sales call. Pricing now starts around $2,500/month for the entry-level Premium plan, scaling to $6,000–10,000+/month at Enterprise, which puts it in a different buying category from the self-serve tools in this cluster. Worth flagging for any team evaluating this group: Drift is the one product here that can't be tested hands-on before a sales conversation, which matters if fast, low-commitment evaluation is a priority.",
  },
};

function evidenceFor(featureId: string, brand: string, raw: string | null): string | null {
  return EVIDENCE_OVERRIDE[featureId]?.[brand] ?? cleanEvidence(raw);
}

// ── G2-sourced spotlight evidence (fallback when DB has no scored data) ────────
const G2_EVIDENCE: Record<string, { featureLabel: string; evidence: string }> = {
  "Backstory.ai": {
    featureLabel: "Revenue Activity Capture",
    evidence: "Backstory (formerly People.ai) is a Revenue Answers Platform grounded in 100% of actual sales activity, connecting every signal to accounts and opportunities so reps can query deal context inside Salesforce, Claude, or Copilot without relying on what got manually logged.",
  },
  "Tact.ai": {
    featureLabel: "Mobile CRM Automation",
    evidence: "Tact's patented Edge AI gives field sellers frictionless mobile access to Salesforce, logging activities, surfacing next-step recommendations, and automating multi-step workflows so Fortune 500 teams at Honeywell and Cisco can work deals without touching a laptop.",
  },
  "Avoma": {
    featureLabel: "AI Meeting Intelligence",
    evidence: "Avoma records, transcribes, and AI-scores every sales call (9.5/10 on G2 for call recording), then auto-extracts action items and coaching scorecards and syncs them to CRM, eliminating post-call admin for reps entirely.",
  },
  "Chorus": {
    featureLabel: "Conversation Intelligence",
    evidence: "Chorus captures every call, email, and video meeting with AI sentiment analysis and automatic CRM sync, giving managers rep-by-rep visibility into deal risks and coachable moments without manual logging or post-call data entry.",
  },
  "Revenue.io": {
    featureLabel: "Real-Time Call Guidance",
    evidence: "Revenue.io surfaces AI-powered guidance on live calls in real time, not in post-call reviews, so reps receive the right play at the exact moment a buying signal or objection appears, while natively logging every interaction in Salesforce automatically.",
  },
  "Gong": {
    featureLabel: "Revenue AI Operating System",
    evidence: "Gong's Revenue AI OS analyses 100% of customer conversations to surface deal risk, coaching opportunities, and competitive intelligence. Ranked G2's #1 Best Software Product for multiple years, with users citing searchable call archives and real-time deal alerts as its defining advantage.",
  },
  "Salesloft": {
    featureLabel: "AI Sales Engagement",
    evidence: "Salesloft's cadence engine automates multi-touch sequences across email, phone, and LinkedIn with ML-driven engagement recommendations based on historical buyer behaviour. With 11,000+ G2 reviews make it the #1 rated sales engagement platform, with teams reporting 20–30% productivity gains.",
  },
  "Outreach": {
    featureLabel: "AI Deal Management",
    evidence: "Outreach's Kaia AI delivers real-time notes, action items, and competitive battlecards mid-call, while the Deal Agent automatically surfaces AI-recommended CRM field updates, eliminating manual pipeline hygiene so reps stay focused on customer conversations.",
  },
  "Clari": {
    featureLabel: "AI Pipeline Forecasting",
    evidence: "Clari automatically captures activity from emails and meetings so managers never need to chase reps for CRM updates, with predictive AI scoring deal risk in real time and live forecast management that G2 users consistently rate as the cleanest interface in revenue software.",
  },
  "6sense": {
    featureLabel: "Predictive Account Intelligence",
    evidence: "6sense's 6AI engine scores accounts by buying stage and purchase intent, surfacing up to 1,000 daily signals across 15+ signal types per seller, so sales teams engage the right accounts at exactly the right moment, with 98% of G2 reviewers rating it 4 or 5 stars.",
  },
  "Apollo": {
    featureLabel: "AI GTM Platform",
    evidence: "Apollo combines a 210M+ contact database with agentic AI workflows for lead scoring, personalised message generation, and send-time optimisation. The first GTM platform to reach 9,000+ G2 reviews, holding #1 rankings across sales intelligence and engagement in the Winter 2026 report.",
  },
  "Clay": {
    featureLabel: "AI Data Enrichment & Outreach",
    evidence: "Clay's Claygent AI enriches prospects with 300+ attributes across 100+ data sources, then generates hyper-personalised outreach at scale. Users report replacing multiple data provider subscriptions and cutting manual research time by 60–70% per campaign.",
  },
  "Conversica": {
    featureLabel: "Autonomous AI Sales Assistant",
    evidence: "Conversica's AI Assistants engage leads in human-like two-way dialogue with 98% claimed accuracy across email, SMS, and chat, qualifying prospects and booking meetings autonomously while syncing all conversation history to Salesforce, with users reporting 98% reduction in time-to-first-contact.",
  },
  "Reply.io": {
    featureLabel: "AI SDR Agent",
    evidence: "Reply.io's AI SDR Agent learns your product, sources prospects from a 1B+ verified contact database, and autonomously runs multi-channel sequences across email, LinkedIn, SMS, and WhatsApp, with built-in deliverability infrastructure including email warm-up and DMARC monitoring.",
  },
  "Lemlist": {
    featureLabel: "Personalised Multi-Channel Outreach",
    evidence: "Lemlist's AI mines job title, industry, and social signals to generate unique intro lines for each prospect at scale, with native ChatGPT/Gemini integration for message personalisation and built-in Lemwarm deliverability infrastructure, rated a top cold outreach tool across 1,400+ G2 reviews.",
  },
  "ZoomInfo": {
    featureLabel: "GTM Intelligence Platform",
    evidence: "ZoomInfo's Pulse Feed surfaces up to 1,000 daily signals per seller across 15+ types (intent, job changes, funding rounds, hiring activity) so reps see exactly which accounts changed and what to do next, with the platform ranked #1 in Sales Intelligence with a perfect G2 satisfaction score of 100.",
  },
  "Seamless.ai": {
    featureLabel: "Real-Time Contact Intelligence",
    evidence: "Seamless.ai crawls the web in real time to find verified emails and direct dials across 1.7B+ contacts with 98% claimed accuracy, with a Chrome Extension that syncs leads from LinkedIn directly to Salesforce, HubSpot, or Outreach with a single click.",
  },
  "Mindtickle": {
    featureLabel: "AI Sales Coaching & Readiness",
    evidence: "Mindtickle is G2's #1-rated sales onboarding and training platform, using AI to deliver personalised role-play simulations so reps practise high-stakes conversations before they happen. Managers review recorded pitches with skill-gap analytics and a 100% G2 satisfaction score backs its coaching depth.",
  },
  "Highspot": {
    featureLabel: "AI Sales Enablement",
    evidence: "Highspot's patented semantic search surfaces the right content to sellers at the right moment in any deal, while its Deal Agent spots risk and recommends next moves in every active opportunity. AI Role Play lets teams rehearse difficult conversations before they happen.",
  },
};

const FEATURE_GROUPS = [
  { label: "Call Intelligence & Coaching", features: ["call_transcription_timestamps", "call_talk_time_analytics", "call_coaching_scorecard", "call_competitor_objection_detection"] },
  { label: "Deal Risk & Pipeline",         features: ["pipeline_forecasting", "deal_risk_detection"] },
  { label: "AI SDR & Outreach",            features: ["outreach_sequencing", "ai_personalisation"] },
  { label: "CRM Automation",               features: ["crm_auto_update", "crm_data_accuracy"] },
  { label: "Sales Enablement",             features: ["followup_drafting", "sales_content_delivery"] },
  { label: "Technical Capabilities",       features: ["tech_crm_integration", "tech_instruction_following", "tech_workflow_automation"] },
  { label: "Responsible AI",               features: ["rai_data_privacy", "rai_explainability"] },
  { label: "Cost Efficiency",              features: ["cost_pricing_transparency", "cost_free_trial"] },
];

// Hidden features: flat-ceiling (call_transcription_timestamps), 140/140 not_documented
// across all brands/models (followup_drafting — P4 prompt-narrowing needed, not a re-run),
// or genuinely not_documented for all brands in the cluster (crm_data_accuracy).
// sales_content_delivery: reinstated — Highspot=90, Mindtickle=90, Drift=null/no data.
// pipeline_forecasting, deal_risk_detection, crm_auto_update: reinstated — confirmed
// valid scores for all brands in their cluster (2/2 for pipeline, 2/2 for CRM).
const HIDDEN_FEATURE_IDS = new Set([
  "call_transcription_timestamps",
  "crm_data_accuracy",
  "followup_drafting",
  "tech_instruction_following",
]);

const DESCRIPTOR_BLOCKLIST: Record<string, string[]> = {
  "Salesloft (Clari)": ["robust forecasting capabilities"],
};

// ── Use case clusters ─────────────────────────────────────────────────────────
const SOV_CLUSTERS = [
  { tag: "sales-call",       label: "Call Intelligence & Coaching" },
  { tag: "sales-crm",        label: "CRM Automation" },
  { tag: "sales-pipeline",   label: "Deal Risk & Pipeline Forecasting" },
  { tag: "sales-outreach",   label: "AI SDR & Outreach" },
  { tag: "sales-enablement", label: "Sales Enablement & Follow-up" },
];

const SENTIMENT_CLUSTERS = [
  { tag: "sales-call",       label: "Call Intelligence & Coaching" },
  { tag: "sales-crm",        label: "CRM Automation" },
  { tag: "sales-pipeline",   label: "Pipeline & Forecasting" },
  { tag: "sales-outreach",   label: "AI SDR & Outreach" },
  { tag: "sales-enablement", label: "Enablement & Follow-up" },
];

// ── Combined chart tooltip ────────────────────────────────────────────────────
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
            {displayBrand(String(item.dataKey))} : {item.value}
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
  const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 700, pointerEvents: "none" }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

// ── SOV donut card ────────────────────────────────────────────────────────────
function SOVCard({ cluster, rows }: { cluster: typeof SOV_CLUSTERS[number]; rows: SOVRow[] }) {
  const locked = rows.filter(r => LOCKED_SALES_BRANDS.has(r.brand));
  const totalAppearances = locked.reduce((s, r) => s + r.total_appearances, 0);
  const top = locked
    .map(r => ({
      ...r,
      sov_pct: totalAppearances > 0 ? Math.round((r.total_appearances / totalAppearances) * 1000) / 10 : 0,
    }))
    .slice(0, 8);

  if (top.length === 0) return null;

  const colorMap = Object.fromEntries(top.map((r) => [r.brand, getBrandColor(r.brand)]));

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
      <p style={{ fontSize: 15, color: "#000", marginBottom: 16 }}>Share of voice · last 14 days</p>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ flexShrink: 0 }}>
          <PieChart width={150} height={150}>
            <Pie
              data={top}
              dataKey="total_appearances"
              cx={70} cy={70}
              innerRadius={38} outerRadius={65}
              paddingAngle={2}
              labelLine={false}
              label={(props) => <PieSliceLabel {...props} />}
            >
              {top.map((r) => <Cell key={r.brand} fill={colorMap[r.brand]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 15, border: "1px solid rgba(0,0,0,0.1)" }}
              formatter={(_v, _n, p) => [`${(p.payload as SOVRow & { sov_pct: number }).sov_pct}%`, displayBrand((p.payload as SOVRow).brand)]}
            />
          </PieChart>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {top.slice(0, 7).map((r) => (
            <div key={r.brand} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: colorMap[r.brand] }} />
              <span style={{ fontSize: 15, color: NAVY, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayBrand(r.brand)}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#000", flexShrink: 0 }}>{r.sov_pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SalesVisibilityCharts({
  dailySummary, weeklySummary, llmVisibility, sovData, clusterPositions,
  featureScores: featureScoresRaw, sentimentData: sentimentDataRaw,
}: Props) {
  // featureScores/sentimentData aren't scoped to LOCKED_SALES_BRANDS server-side (unlike
  // dailySummary/weeklySummary/sovData/clusterPositions), so Drift needs an explicit filter
  // here too — otherwise its rows would still show up in Feature Scores and Sentiment Analysis.
  const featureScores = featureScoresRaw.filter(r => r.brand_name !== "Drift");
  const sentimentData = { ...sentimentDataRaw, rows: sentimentDataRaw.rows.filter(r => r.brand_name !== "Drift") };
  const hasReal = dailySummary.length > 0;
  const [featureOpen,       setFeatureOpen]       = useState(false);
  const [sentimentOpen,     setSentimentOpen]     = useState(false);
  const [spotlightOpen,     setSpotlightOpen]     = useState(true);
  const [visibilityOpen,    setVisibilityOpen]    = useState(true);
  const [improvementsOpen,  setImprovementsOpen]  = useState(true);
  const [hiddenBrands,      setHiddenBrands]      = useState<Set<string>>(new Set());

  function toggleBrand(b: string) {
    setHiddenBrands(prev => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b); else next.add(b);
      return next;
    });
  }

  // ── Build chart rows — filter to locked brands only ────────────────────────
  const dateSet = new Set<string>();
  const index: Record<string, Record<string, number>> = {};

  for (const row of dailySummary) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    dateSet.add(row.date);
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
  }

  // Aggregate weekly totals — locked brands only
  const weeklyTotals: Record<string, { mentions: number; avgPos: number | null }> = {};
  for (const row of weeklySummary) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    const e = weeklyTotals[row.brand] ?? { mentions: 0, avgPos: null };
    weeklyTotals[row.brand] = { mentions: e.mentions + row.mention_count, avgPos: row.avg_position ?? e.avgPos };
  }

  const dates  = [...dateSet].sort();
  const brands = [...LOCKED_SALES_BRANDS]
    .filter(b => weeklyTotals[b] || index[dates[0]]?.[b] !== undefined)
    .sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0));

  const brandColor = (b: string) => getBrandColor(b);

  // ── Combined chart rows (all brands) ─────────────────────────────────────
  const chartRows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const b of brands) row[b] = index[date]?.[b] ?? 0;
    return row;
  });

  // ── Per-cluster 7-day chart rows ─────────────────────────────────────────
  const clusterCharts = SOV_CLUSTERS.map(cluster => {
    const clusterBrands = Object.entries(BRAND_USE_CASE)
      .filter(([, tag]) => tag === cluster.tag)
      .map(([b]) => b)
      .filter(b => LOCKED_SALES_BRANDS.has(b))
      .sort((a, b) => (weeklyTotals[b]?.mentions ?? 0) - (weeklyTotals[a]?.mentions ?? 0));
    const rows = dates.map(date => {
      const row: Record<string, number | string> = { date };
      for (const b of clusterBrands) row[b] = index[date]?.[b] ?? 0;
      return row;
    });
    return { ...cluster, clusterBrands, rows };
  });

  // ── Aggregate weekly metrics ──────────────────────────────────────────────
  const totalMentions = Object.values(weeklyTotals).reduce((s, v) => s + v.mentions, 0);
  const hasWeekly = Object.keys(weeklyTotals).length > 0;

  // Top brand: hardcoded to Outreach per explicit request (overrides the highest-mentions
  // brand, which is otherwise `brands[0]`).
  const topByMentions = "Outreach";
  const topMentionData = topByMentions ? weeklyTotals[topByMentions] : null;

  // ── LLM visibility ────────────────────────────────────────────────────────
  const hasVis = llmVisibility.length > 0;

  // ── Model mentions (locked brands only) ───────────────────────────────────
  const modelMentionsByBrand: Record<string, { claude: number; gpt: number }> = {};
  for (const row of dailySummary) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    if (!modelMentionsByBrand[row.brand]) modelMentionsByBrand[row.brand] = { claude: 0, gpt: 0 };
    if (row.model === "claude-haiku-4-5") modelMentionsByBrand[row.brand].claude += row.mention_count;
    else modelMentionsByBrand[row.brand].gpt += row.mention_count;
  }
  const modelMentionsData = brands
    .map(b => ({ brand: b, claude: modelMentionsByBrand[b]?.claude ?? 0, gpt: modelMentionsByBrand[b]?.gpt ?? 0 }))
    .filter(d => d.claude + d.gpt > 0)
    .sort((a, b) => (b.claude + b.gpt) - (a.claude + a.gpt));

  // ── Position table (locked brands only, sorted by avg position) ───────────
  const posTable = Object.entries(weeklyTotals)
    .filter(([brand, v]) => LOCKED_SALES_BRANDS.has(brand) && v.avgPos != null)
    .sort((a, b) => (a[1].avgPos ?? 99) - (b[1].avgPos ?? 99))
    .slice(0, 20)
    .map(([brand, v], i) => ({ rank: i + 1, brand, avgPos: v.avgPos as number, mentions: v.mentions }));

  // ── Avg position by use case: brand grouped into its primary cluster ───────
  // Build lookup: bucket_tag → brand → avg_position
  const clusterPosLookup: Record<string, Record<string, number>> = {};
  for (const row of clusterPositions) {
    if (!LOCKED_SALES_BRANDS.has(row.brand)) continue;
    if (!clusterPosLookup[row.bucket_tag]) clusterPosLookup[row.bucket_tag] = {};
    clusterPosLookup[row.bucket_tag][row.brand] = row.avg_position;
  }

  // For each cluster, get the brands that belong to it (primary assignment), with their position in that cluster
  const clusterGroups = SOV_CLUSTERS.map(cluster => {
    const brandsInCluster = Object.entries(BRAND_USE_CASE)
      .filter(([, tag]) => tag === cluster.tag)
      .map(([brand]) => brand)
      .filter(brand => LOCKED_SALES_BRANDS.has(brand))
      .map(brand => ({
        brand,
        avg_position: clusterPosLookup[cluster.tag]?.[brand] ?? null,
      }))
      .sort((a, b) => (a.avg_position ?? 999) - (b.avg_position ?? 999));
    return { ...cluster, brands: brandsInCluster };
  });

  const hasClusterPos = clusterPositions.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 1: Metric cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

        <Card accent={BLUE}>
          <CardLabel>Brand Mentions · 14 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "—"}
            sub={hasWeekly ? `across ${brands.length} brands · 2 models` : "No data yet"}
          />
        </Card>

        <Card accent={INDIGO}>
          <CardLabel>LLM Visibility · 14 Days</CardLabel>
          {!hasVis ? (
            <p style={{ fontSize: 17, color: "#000" }}>No data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {llmVisibility.map((v, i) => {
                const label = v.model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? BLUE : INDIGO;
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
          <CardLabel>Top Brand · 14 Days</CardLabel>
          {topByMentions && topMentionData ? (
            <>
              <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 4 }}>
                {displayBrand(topByMentions)}
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            {brands.map(b => (
              <button key={b} onClick={() => toggleBrand(b)} style={{
                display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14,
                color: hiddenBrands.has(b) ? "#aaa" : NAVY,
                background: hiddenBrands.has(b) ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.03)",
                border: "1px solid",
                borderColor: hiddenBrands.has(b) ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.10)",
                borderRadius: 999, padding: "3px 10px 3px 7px", cursor: "pointer",
                textDecoration: hiddenBrands.has(b) ? "line-through" : "none",
                opacity: hiddenBrands.has(b) ? 0.55 : 1,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: hiddenBrands.has(b) ? "#ccc" : brandColor(b),
                  flexShrink: 0, display: "inline-block",
                }} />
                {displayBrand(b)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 3: 7-day trends by use case ─────────────────────────────────── */}
      {hasReal && (
        <>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>
            Brand Mentions: 7-Day Trend by Use Case
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {clusterCharts.map(({ tag, label, clusterBrands, rows }) => {
              return (
                <div
                  key={tag}
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
                    padding: "20px 24px 16px",
                  }}
                >
                  <h4 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>{label}</h4>
                  <p style={{ fontSize: 15, color: "#000", marginBottom: 14 }}>14-day mentions · both models</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.055)" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: "#000" }} axisLine={false} tickLine={false} width={32} />
                      <Tooltip content={<CombinedTooltip />} wrapperStyle={{ zIndex: 100 }} allowEscapeViewBox={{ x: false, y: true }} />
                      {clusterBrands.map(b => (
                        <Line key={b} type="monotone" dataKey={b} name={displayBrand(b)} stroke={brandColor(b)}
                          strokeWidth={hiddenBrands.has(b) ? 0 : 2}
                          dot={false}
                          activeDot={hiddenBrands.has(b) ? false : { r: 4, strokeWidth: 0 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    {clusterBrands.map(b => (
                      <button key={b} onClick={() => toggleBrand(b)} style={{
                        display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14,
                        color: hiddenBrands.has(b) ? "#aaa" : NAVY,
                        background: hiddenBrands.has(b) ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.03)",
                        border: "1px solid",
                        borderColor: hiddenBrands.has(b) ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.10)",
                        borderRadius: 999, padding: "3px 10px 3px 7px", cursor: "pointer",
                        textDecoration: hiddenBrands.has(b) ? "line-through" : "none",
                        opacity: hiddenBrands.has(b) ? 0.55 : 1,
                      }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: hiddenBrands.has(b) ? "#ccc" : brandColor(b),
                          flexShrink: 0, display: "inline-block",
                        }} />
                        {displayBrand(b)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Row 4: Brand mentions by model ──────────────────────────────────── */}
      {hasReal && modelMentionsData.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", padding: "24px 28px 20px" }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, marginBottom: 2, letterSpacing: "-0.01em" }}>
              Brand Mentions · 14 Days · by Model
            </h3>
            <p style={{ fontSize: 16, color: "#000" }}>Total mentions per brand across Claude Haiku and GPT-4o mini</p>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            {[{ label: "Claude Haiku", color: BLUE }, { label: "GPT-4o mini", color: INDIGO }].map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={modelMentionsData.length * 28 + 10}>
            <BarChart layout="vertical" data={modelMentionsData} margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barSize={14}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="brand" width={130} tickFormatter={displayBrand} tick={{ fontSize: 15, fill: NAVY }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(0,0,0,0.10)", fontSize: 16, color: NAVY }} labelFormatter={(label) => displayBrand(String(label))} formatter={(value, name) => [value, name === "claude" ? "Claude Haiku" : "GPT-4o mini"]} />
              <Bar dataKey="claude" stackId="a" fill={BLUE}   radius={[0, 0, 0, 0]} />
              <Bar dataKey="gpt"    stackId="a" fill={INDIGO} radius={[3, 3, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Row 4: Brand position table ─────────────────────────────────────── */}
      {posTable.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>Brand Position Summary</h3>
            <p style={{ fontSize: 16, color: "#000" }}>Average position brands appear in AI responses (lower is stronger)</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 17 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.025)" }}>
                  {["Rank", "Brand", "Avg Position", "7-Day Mentions"].map(h => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 15, fontWeight: 700, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posTable.map((row, i) => (
                  <tr key={row.brand} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.012)" }}>
                    <td style={{ padding: "11px 20px", color: "#000", fontWeight: 600 }}>#{row.rank}</td>
                    <td style={{ padding: "11px 20px", fontWeight: 600, color: NAVY }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(row.brand), flexShrink: 0, display: "inline-block" }} />
                        {displayBrand(row.brand)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", color: NAVY }}>
                      <span style={{
                        display: "inline-block", padding: "2px 8px", borderRadius: 4,
                        fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                        background: row.avgPos <= 3 ? "rgba(37,99,235,0.10)" : "rgba(0,0,0,0.05)",
                        color: row.avgPos <= 3 ? BLUE : "#000",
                      }}>
                        {row.avgPos.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", color: "#000" }}>{row.mentions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Row 5: Avg position by use case (brands grouped into primary cluster) */}
      {hasClusterPos && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: 2 }}>
              Avg Brand Position by Use Case
            </h3>
            <p style={{ fontSize: 16, color: "#000" }}>
              Each brand shown in its primary use case, avg position within that cluster's prompts · lower is better
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            {clusterGroups.map((cluster, ci) => (
              <div key={cluster.tag} style={{
                padding: "16px 20px",
                borderRight: ci % 3 !== 2 ? "1px solid rgba(0,0,0,0.06)" : undefined,
                borderBottom: ci < 3 ? "1px solid rgba(0,0,0,0.06)" : undefined,
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#000", marginBottom: 12 }}>
                  {cluster.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cluster.brands.map(({ brand, avg_position }) => (
                    <div key={brand} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: brandColor(brand), flexShrink: 0, display: "inline-block" }} />
                      <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: NAVY }}>{displayBrand(brand)}</span>
                      {avg_position != null ? (
                        <span style={{
                          padding: "2px 7px", borderRadius: 4, fontSize: 15, fontWeight: 700,
                          fontVariantNumeric: "tabular-nums",
                          background: avg_position <= 3 ? "rgba(37,99,235,0.10)" : "rgba(0,0,0,0.05)",
                          color: avg_position <= 3 ? BLUE : "#000",
                        }}>
                          {avg_position.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 15, color: "#000" }}>—</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 6: SOV donuts ───────────────────────────────────────────────── */}
      {sovData.length > 0 && (
        <>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", marginBottom: -8 }}>
            Use Case Share of Voice
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {SOV_CLUSTERS.map(cluster => {
              const rows = sovData.filter(r => r.bucket_tag === cluster.tag);
              return rows.length > 0 ? <SOVCard key={cluster.tag} cluster={cluster} rows={rows} /> : null;
            })}
          </div>
        </>
      )}

      {/* ── Row 7: Feature scores preview (collapsible) ─────────────────────── */}
      {featureScores.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <button
            onClick={() => setFeatureOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "16px 24px",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: featureOpen ? "1px solid rgba(0,0,0,0.07)" : "none",
              fontFamily: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
                Product Feature Scores
              </h3>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: featureOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
              <path d="M4 6l4 4 4-4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {featureOpen && (
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 15, color: "#000", marginBottom: 24 }}>
                Both models · data from July 2026 · updates daily
              </p>
              {FEATURE_GROUPS.map(group => {
                const groupFeatures = group.features.flatMap(featureId => {
                  if (HIDDEN_FEATURE_IDS.has(featureId)) return [];
                  const rows = featureScores
                    .filter(r => r.feature_id === featureId)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3);
                  return rows.length >= 2 ? [{ featureId, rows }] : [];
                });
                if (groupFeatures.length === 0) return null;
                return (
                  <div key={group.label} style={{ marginBottom: 28 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: BLUE, marginBottom: 14 }}>
                      {group.label}
                    </p>
                    {groupFeatures.map(({ featureId, rows }) => (
                      <div key={featureId} style={{ marginBottom: 18 }}>
                        <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 2 }}>
                          {featureName(featureId)}
                        </p>
                        {FEATURE_DESCRIPTIONS[featureId] && (
                          <p style={{ fontSize: 16, color: "#2563EB", lineHeight: 1.5, margin: "0 0 10px" }}>
                            {FEATURE_DESCRIPTIONS[featureId]}
                          </p>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {rows.map(r => (
                            <div key={r.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 16, fontWeight: 500, color: NAVY, width: 168, flexShrink: 0, lineHeight: 1.3 }}>
                                  {displayBrand(r.brand_name)}
                                </span>
                                <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,0,0,0.07)" }}>
                                  <div style={{ width: `${r.score}%`, height: 6, borderRadius: 999, background: BAND_COLORS[r.score_band] ?? "#94a3b8" }} />
                                </div>
                                <span style={{ fontSize: 16, fontWeight: 700, color: BAND_COLORS[r.score_band] ?? NAVY, width: 28, textAlign: "right" as const, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                                  {r.score}
                                </span>
                              </div>
                              {(() => {
                                const ev = evidenceFor(featureId, r.brand_name, r.evidence);
                                const text = ev ?? BAND_FALLBACK[r.score_band];
                                return text ? (
                                  <p style={{ paddingLeft: 178, fontSize: 17, color: ev ? "#000" : "#000", lineHeight: 1.5, margin: "4px 0 0", fontStyle: ev ? "normal" : "italic" }}>{text}</p>
                                ) : null;
                              })()}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              <p style={{ fontSize: 15, color: "#000", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12, marginTop: 4 }}>
                Top 3 brands per feature · scored by both Claude Haiku and GPT-4o mini
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Row 8: Sentiment Analysis (sentiment descriptors) ─────────────── */}
      {(() => {
        const { rows: sentimentRows, meta: sentimentMeta } = sentimentData;
        const GATE = 3;
        const daysHave = sentimentMeta.dual_model_dates ?? 0;
        const ready    = daysHave >= GATE;
        // Global frequency: a descriptor is only "unique" if no other brand uses it anywhere.
        const globalDescFreq = new Map<string, number>();
        for (const r of sentimentRows) for (const d of r.top_descriptors) globalDescFreq.set(d, (globalDescFreq.get(d) ?? 0) + 1);

        // Build a human-readable date range label from actual data coverage.
        function sentimentDateLabel() {
          const e = sentimentMeta.earliest_date;
          const l = sentimentMeta.latest_date;
          if (!e || !l) return "";
          const fmt = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", { month: "short", day: "numeric", timeZone: "UTC" });
          return e === l ? fmt(e) : `${fmt(e)} – ${fmt(l)}`;
        }

        return (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <button
              onClick={() => setSentimentOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "16px 24px",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: sentimentOpen ? "1px solid rgba(0,0,0,0.07)" : "none",
                fontFamily: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
                  Sentiment Analysis
                </h3>
                {!ready && (
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" as const, color: "#000", background: "rgba(0,0,0,0.06)", borderRadius: 999, padding: "3px 8px" }}>
                    Collecting
                  </span>
                )}
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: sentimentOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                <path d="M4 6l4 4 4-4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {sentimentOpen && !ready && (
              <div style={{ padding: "28px 24px", textAlign: "center" as const }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 8 }}>
                  Collecting data: {daysHave} of {GATE} minimum days
                </p>
                <p style={{ fontSize: 16, color: "#000", maxWidth: 380, margin: "0 auto" }}>
                  Sentiment bars appear once both Claude Haiku and GPT-4o-mini have collected on {GATE} separate days.
                  Check back in {GATE - daysHave} day{GATE - daysHave !== 1 ? "s" : ""}.
                </p>
              </div>
            )}

            {sentimentOpen && ready && (
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 15, color: "#000", marginBottom: 24 }}>
                  How Claude Haiku and GPT-4o-mini describe each brand · {sentimentDateLabel()}
                </p>
                {SENTIMENT_CLUSTERS.map(cluster => {
                  const brands = sentimentRows
                    .filter(r => r.bucket_tag === cluster.tag)
                    .sort((a, b) => b.positive_count - a.positive_count);
                  if (brands.length === 0) return null;
                  return (
                    <div key={cluster.tag} style={{ marginBottom: 28 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: BLUE, marginBottom: 14 }}>
                        {cluster.label}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {brands.map(brand => {
                          const total = brand.total_count || 1;
                          const posPct = Math.round((brand.positive_count / total) * 100);
                          const neuPct = Math.round((brand.neutral_count  / total) * 100);
                          const negPct = 100 - posPct - neuPct;
                          return (
                            <div key={brand.brand_name}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                                <span style={{ fontSize: 16, fontWeight: 600, color: NAVY, width: 148, flexShrink: 0, lineHeight: 1.25 }}>
                                  {displayBrand(brand.brand_name)}
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
                              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, paddingLeft: 158 }}>
                                {[...new Set(brand.top_descriptors)].filter(d => !(DESCRIPTOR_BLOCKLIST[brand.brand_name] ?? []).includes(d)).slice(0, 4).map((d, i) => {
                                  const unique = globalDescFreq.get(d) === 1;
                                  return (
                                    <span key={i} style={{
                                      fontSize: 15,
                                      color: unique ? "#2563eb" : "#000",
                                      background: unique ? "rgba(37,99,235,0.08)" : "rgba(0,0,0,0.04)",
                                      border: `1px solid ${unique ? "rgba(37,99,235,0.25)" : "rgba(0,0,0,0.08)"}`,
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

      {/* ── Feature scores footnotes ─────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 4px" }}>
        <p style={{ fontSize: 11, color: "#000", margin: 0, textAlign: "center" }}>
          Based on 23 daily prompts across Claude Haiku and GPT-4o-mini · Sales AI agent category · collecting since July 2026
        </p>
        <p style={{ fontSize: 11, color: "#000", margin: "0 auto", textAlign: "center", maxWidth: 680 }}>
          Scores require agreement between both AI models. When models disagree, we take the more conservative rating, so a lower score sometimes means models disagree, not that documentation is absent. Check the evidence text for the fuller picture.
        </p>
      </div>

      {/* ── Row 9: Brand Capability Spotlight ────────────────────────────────── */}
      {(() => {

        const BONUS = new Set(["rai_data_privacy", "rai_explainability"]);

        type SpotEntry = { featureId: string; evidence: string } | null;
        const brandMap = new Map<string, { primary: SpotEntry; bonus: SpotEntry }>();
        // Seed every locked brand so brands with no feature scores still get a card
        for (const brand of LOCKED_SALES_BRANDS) {
          brandMap.set(brand, { primary: null, bonus: null });
        }

        // Primary: highest-scoring non-hidden, non-bonus feature with real evidence
        const primarySorted = [...featureScores]
          .filter(r => !HIDDEN_FEATURE_IDS.has(r.feature_id) && !BONUS.has(r.feature_id))
          .sort((a, b) => b.score - a.score);

        for (const row of primarySorted) {
          const entry = brandMap.get(row.brand_name)!;
          if (entry.primary) continue;
          const ev = evidenceFor(row.feature_id, row.brand_name, row.evidence);
          if (ev) entry.primary = { featureId: row.feature_id, evidence: ev };
        }

        // Bonus: best BONUS feature with real evidence
        const bonusSorted = [...featureScores]
          .filter(r => BONUS.has(r.feature_id))
          .sort((a, b) => b.score - a.score);

        for (const row of bonusSorted) {
          const entry = brandMap.get(row.brand_name)!;
          if (entry.bonus) continue;
          const ev = evidenceFor(row.feature_id, row.brand_name, row.evidence);
          if (ev) entry.bonus = { featureId: row.feature_id, evidence: ev };
        }

        // Fallback: hand-curated RAI evidence for brands with no scored DB row yet.
        // Lemlist has no rai_data_privacy/rai_explainability row, but its Trust Center
        // and published GDPR docs give real, citable detail.
        const RAI_FALLBACK: Record<string, { featureId: string; evidence: string }> = {
          "Lemlist": {
            featureId: "rai_data_privacy",
            evidence: "Lemlist's Trust Center (trust.lemlist.com) documents a SOC 2 Type II report covering 58 controls spanning cloud security, access management, and application security, though full detail requires a trust-portal access request. Per lemlist's own GDPR help documentation, all data, including LinkedIn-sourced prospect data, is stored exclusively on servers in France hosted by OVH within the EEA, with no transfers outside it; only publicly available LinkedIn fields (name, job title, company, employment history) are stored by default, with email and phone captured only when a user enriches or supplies them. Customers are the data controller under a Data Processing Addendum (lemlist.com/legal/dpa) with lemlist acting as processor, and recipients can request deletion directly through lemlist's privacy team.",
          },
        };
        for (const [brand, fallback] of Object.entries(RAI_FALLBACK)) {
          const entry = brandMap.get(brand);
          if (entry && !entry.bonus) entry.bonus = fallback;
        }

        const spotlights = [...brandMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b));

        if (spotlights.length === 0) return null;
        return (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <button
              onClick={() => setSpotlightOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "16px 24px",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: spotlightOpen ? "1px solid rgba(0,0,0,0.07)" : "none",
                fontFamily: "inherit",
              }}
            >
              <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
                Brand Capability Spotlight
              </h3>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: spotlightOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                <path d="M4 6l4 4 4-4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {spotlightOpen && (
              <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {spotlights.map(([brand, { primary, bonus }]) => {
                  const color = getBrandColor(brand);
                  const g2 = G2_EVIDENCE[brand];
                  const usingG2 = !primary && !!g2;
                  return (
                  <div key={brand} style={{
                    border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "16px 18px",
                  }}>
                    {/* Coloured dot + brand name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 17, fontWeight: 700, color }}>{displayBrand(brand)}</span>
                    </div>
                    {/* Feature heading — DB feature name or G2 category label */}
                    {(primary || g2) && (
                      <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 0 8px" }}>
                        <p style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.3 }}>
                          {primary ? featureName(primary.featureId) : g2!.featureLabel}
                        </p>
                        {usingG2 && (
                          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#000", background: "rgba(0,0,0,0.06)", borderRadius: 4, padding: "2px 5px", flexShrink: 0 }}>
                            G2
                          </span>
                        )}
                      </div>
                    )}
                    {/* Evidence — DB or G2 fallback */}
                    {primary && (
                      <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: 0 }}>{twoSentences(primary.evidence)}</p>
                    )}
                    {usingG2 && (
                      <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: 0 }}>{twoSentences(g2!.evidence)}</p>
                    )}
                    {/* Placeholder only when neither DB nor G2 has data */}
                    {!primary && !g2 && !bonus && (
                      <p style={{ fontSize: 16, color: "#000", fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>
                        Capability data collecting. Check back after the next daily run.
                      </p>
                    )}
                    {/* Bonus compliance callout */}
                    {bonus && (
                      <div style={{
                        background: "rgba(0,0,0,0.025)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderLeft: "3px solid rgba(0,0,0,0.13)",
                        borderRadius: "0 6px 6px 0",
                        padding: "8px 12px",
                        marginTop: 12,
                      }}>
                        <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#000", margin: "0 0 4px" }}>
                          {featureName(bonus.featureId)}
                        </p>
                        <p style={{ fontSize: 15, color: "#000", lineHeight: 1.5, margin: 0 }}>
                          {(() => { const cut = bonus.evidence.indexOf('. '); return cut > 0 ? bonus.evidence.slice(0, cut + 1) : bonus.evidence; })()}
                        </p>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Building AI Visibility — competitor playbooks for earning AI-search visibility */}
      {(() => {
        const VISIBILITY_PLAYBOOKS = [
          {
            brand: "Highspot",
            tactic: "Volume + Direct Confrontation",
            whyVisible: "High content volume and named-competitor takedown pages simultaneously.",
            how: "Highspot does everything at once: publishes a lot AND runs multiple named-competitor takedown pages.",
            points: [
              { text: "Publishes heavily: 100+ posts in 18 months, roughly 5-10 per month.", cite: "highspot.com/blog" },
              { text: "Backs it up with 171 case studies naming real enterprise customers (HSBC, Visa, Siemens).", cite: "highspot.com/success-stories" },
              {
                text: "Runs three separate “us vs. them” pages, each following the same playbook: paint the rival as fragmented, position Highspot as the unified alternative:",
                sub: [
                  "vs. Seismic: claims 85+ companies switched from Seismic, “+15% win rates”",
                  "vs. Showpad",
                  "vs. Gong: frames Gong as narrow (“just call intelligence”) compared to Highspot's broader platform",
                ],
              },
              { text: "Shipped 3 major product launches in the last year (mid-2025 through mid-2026), each reinforcing an “AI-powered” narrative." },
            ],
            dataLabel: "Highspot data:",
            yourData: "Sales content delivery 90, highest score in the Sales Enablement cluster. The evidence text cited three actual Highspot product names (Deal Agent, AI Role Play, Digital Sales Rooms) as proof the feature exists and works in a particular way. 89% positive sentiment, highest of all brands tracked in this report. Appears consistently in the Sales Enablement & Follow-up mention trend.",
            takeaway: "Different category from yours (content enablement, not deal execution), but the tactic of pairing real content volume with direct named-competitor pages is the most complete playbook here. Worth studying the mechanism even though Highspot itself isn't a competitor.",
          },
          {
            brand: "6sense",
            tactic: "Narrow, Named-Competitor Content as the Wedge",
            whyVisible: "A much smaller content operation than Clari's, but with one sharp, deliberate asset: a dedicated head-to-head page.",
            how: "6sense runs a focused content operation built around a small number of pages that directly name and take on specific rivals.",
            points: [
              { text: "Publishes steadily, around 15-20 posts visible at a time.", cite: "6sense.com/blog" },
              { text: "Builds dedicated pages to win specific comparisons, including a \"6sense vs. Demandbase: See Why 6sense is #1\" landing page built to own that exact search.", cite: "6sense.com/cp/demandbase" },
              { text: "Runs a second comparison page, naming UserGems directly.", cite: "6sense.com/blog/6sense-vs-usergems" },
              { text: "Keeps it sharp, not broad: two targeted pages instead of a \"compare us to everyone\" hub, each aimed at winning one specific matchup." },
              { text: "Repositioning toward \"AI agent platform\" framing, moving beyond \"pipeline forecasting\" as the sole pitch.", cite: "6sense.com/guides/pipeline-forecasting" },
            ],
            dataLabel: "6sense data:",
            yourData: "Deal risk detection 90: the evidence text cited three actual 6sense product names (Predictive Buying Stage system with named stages Target/Awareness/Consideration/Decision, plus email and Slack alert configuration) as proof the feature exists and works in a particular way. Pipeline forecasting 60: evidence cited the 50+ buying signal engine and a monthly Predictive Model Insights Report with a 90-day lookback. 83% positive sentiment. 9 discovery mentions in the Deal Risk & Pipeline Forecasting cluster.",
            takeaway: "This is the cheapest, fastest-to-replicate lever of the four: pairing a small number of sharp, named-competitor pages with steady content. It's built to win specific comparison moments (\"6sense vs. Demandbase\") rather than to maximise overall mention count.",
          },
          {
            brand: "Backstory.ai",
            tactic: "The Other Side of the Question: Why It's Invisible",
            whyLabel: "Why it's invisible:",
            whyVisible: "A real, funded competitor in your exact category (CRM auto-update from sales calls), with none of the visibility tactics above in play, and confirmed through three independent methods to be functionally unfindable by AI models.",
            how: "Backstory.ai publishes modestly, runs no comparison content, has essentially no community presence, and has spent its recent marketing effort on a rebrand rather than category-specific content.",
            points: [
              { text: "Publishes lightly, about 1-2 posts a month, all dated within the last 6 months (no older archive visible). Content leans toward broad \"pipeline visibility\" thought leadership, not specific \"how we auto-update Salesforce\" guides.", cite: "backstory.ai/blog" },
              { text: "Zero Reddit or forum presence found. Searched r/sales, r/RevOps, r/salesforce, and broad Reddit. Nothing relevant found." },
              { text: "The one real PR moment was a rebrand, not a product story. Renamed from People.ai to Backstory in April 2026. No funding news since a 2021 Series D.", cite: "Rebrand announcement", citeUrl: "https://www.backstory.ai/newsroom/people-ai-becomes-backstory-redefining-how-revenue-teams-get-answers-about-their-deals" },
              { text: "Publishes no \"Backstory vs. X\" pages of its own. Every comparison URL 404s. Its posture toward Gong is co-existence, not competition: it's an official Gong Collective integration partner, processing Gong's call transcripts rather than competing with Gong directly.", cite: "Gong Collective listing", citeUrl: "https://collective.gong.io/integrations/people-ai" },
              { text: "Real customers, real product. NVIDIA, OpenAI, Red Hat, and Zscaler are named on the customer page, and blog content is current as of last month. This isn't a dead company. It's a real, actively maintained product that simply isn't showing up.", cite: "backstory.ai/customers" },
              { text: "No public pricing, no public changelog. /pricing, /changelog, and /release-notes all 404, and the newsroom page exists but is empty. Marketing effort has gone into the site's surface, not into ongoing documentation." },
            ],
            dataLabel: "Backstory.ai data:",
            yourData: "CRM automation score 90: the evidence text cited automatic Salesforce field population (contacts, next steps, deal stage, notes) from sales calls, with activity auto-matched to the right account without rep input. Despite this: 0 discovery mentions across 179 tracked prompts over 6 days, despite prompts describing this exact category in buyer language (\"update CRM records after sales calls,\" \"post-call admin,\" \"Salesforce/HubSpot data entry\"). Sentiment data agrees: \"unable to verify current product offerings.\"",
            takeaway: "Three separate methods, one conclusion: this is a real, well-funded, actively-used competitor in your exact category that AI models currently cannot find. It's the clearest evidence in this report that having a real product and real customers isn't enough on its own. None of the other four brands' tactics (volume, targeted comparisons, acquisition equity, or aggressive confrontation) are present here at all. This is likely a large part of why it's invisible.",
          },
        ];

        return (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <button
              onClick={() => setVisibilityOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "16px 24px",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: visibilityOpen ? "1px solid rgba(0,0,0,0.07)" : "none",
                fontFamily: "inherit",
              }}
            >
              <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
                Building AI Visibility
              </h3>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: visibilityOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                <path d="M4 6l4 4 4-4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {visibilityOpen && (
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{
                  background: "rgba(37,99,235,0.04)",
                  border: "1px solid rgba(37,99,235,0.12)",
                  borderRadius: 10,
                  padding: "16px 20px",
                }}>
                  <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>
                    AI visibility is earned, not bought. When a buyer asks an AI model to recommend a sales agent, the model draws on what it has learned from publicly available content, including documentation, reviews, case studies, and product pages. Brands that are consistently named, described with specificity, and grounded in third-party evidence appear at the top. Brands with thin or generic content are skipped entirely.
                  </p>
                  <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, margin: 0 }}>
                    <strong>Highspot</strong> is a strong example: both Claude and GPT-4o-mini cite its actual product names (Deal Agent, AI Role Play, Digital Sales Rooms) as evidence of specific capabilities. That level of specificity signals to AI models that the feature is real and documented, not just claimed. <strong>6sense</strong> earns visibility differently: its Predictive Buying Stage framework, built on 50+ intent signals and a 90-day lookback model, gives AI something concrete to quote when buyers ask about pipeline forecasting or deal risk. Both brands publish content that answers the question before it is asked.
                  </p>
                </div>
                {VISIBILITY_PLAYBOOKS.map((pb, _pbIdx, _pbArr) => (
                  <div key={pb.brand} style={{
                    border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "18px 20px",
                  }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.3 }}>
                      {pb.brand}: {pb.tactic}
                    </p>

                    <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: "0 0 10px" }}>
                      <span style={{ fontWeight: 700 }}>{"whyLabel" in pb ? pb.whyLabel : "Why it's visible:"} </span>{pb.whyVisible}
                    </p>

                    <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: "0 0 10px" }}>
                      <span style={{ fontWeight: 700 }}>How: </span>{pb.how}
                    </p>

                    <ul style={{ margin: "0 0 12px", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                      {pb.points.map((point, i) => (
                        <li key={i} style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: NAVY, marginTop: 6 }} />
                          <span>
                            {point.text}
                            {"cite" in point && point.cite && (() => {
                              const label = point.cite;
                              const href = ("citeUrl" in point && point.citeUrl)
                                ? point.citeUrl as string
                                : (label.includes('.') && !label.includes(' ') ? `https://${label}` : null);
                              return href
                                ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", marginLeft: 4, fontSize: 15, textDecoration: "underline" }}>{label}</a>
                                : <span style={{ color: "#000", marginLeft: 4 }}>{label}</span>;
                            })()}
                            {"sub" in point && point.sub && (
                              <ul style={{ margin: "6px 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                                {point.sub.map((s, j) => (
                                  <li key={j} style={{ fontSize: 16, color: "#000", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 8 }}>
                                    <span style={{ flexShrink: 0, width: 5, height: 5, borderRadius: "50%", border: `1.5px solid ${NAVY}`, marginTop: 7 }} />
                                    <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <p style={{
                      fontSize: 16, color: "#000", lineHeight: 1.6, margin: "0 0 10px",
                      ...("dataLabel" in pb ? {
                        background: "rgba(250,204,21,0.15)",
                        border: "1px solid rgba(250,204,21,0.4)",
                        borderRadius: 6,
                        padding: "8px 12px",
                      } : {}),
                    }}>
                      <span style={{ fontWeight: 700 }}>{"dataLabel" in pb ? pb.dataLabel : "Your data:"} </span>{pb.yourData}
                    </p>

                    <div style={{
                      background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.03) 100%)",
                      border: "1px solid rgba(37,99,235,0.18)",
                      borderLeft: "4px solid #2563eb",
                      borderRadius: "0 10px 10px 0",
                      padding: "14px 18px",
                    }}>
                      <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: BLUE, margin: "0 0 6px" }}>
                        Takeaway
                      </p>
                      <p style={{ fontSize: 16, color: "#000", lineHeight: 1.65, margin: 0, fontWeight: 400 }}>
                        {pb.takeaway}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Conclusion */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.03) 100%)",
                  border: "1px solid rgba(37,99,235,0.18)",
                  borderLeft: "4px solid #2563eb",
                  borderRadius: "0 10px 10px 0",
                  padding: "20px 22px",
                }}>
                  <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: BLUE, margin: "0 0 10px" }}>
                    Recommended Move for Lamigo
                  </p>
                  <p style={{ fontSize: 16, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>
                    The clearest lever available, and the one most consistently associated with AI model visibility across this report, is <strong>publishing 1–2 named-comparison pages</strong> targeted at your direct competitive overlaps. Not general "why us" content, but pages that answer a specific question a buyer might ask an AI: <em>"How does Lamigo compare to [Competitor] for deal execution?"</em>
                  </p>
                  <p style={{ fontSize: 16, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>
                    One thing worth flagging before the recommendation: 6sense&apos;s own overall visibility is modest, rank #15 of 19, only 76 mentions. If the tactic below is worth copying, it&apos;s not because it&apos;s made 6sense a top brand. It&apos;s because it&apos;s the cheapest, most controllable lever available to a small player, and it reliably wins the specific comparison moment it targets, even while 6sense&apos;s broader visibility stays low. That&apos;s a different, more realistic promise than &ldquo;do this and become visible&rdquo; — it&apos;s &ldquo;do this and own one specific question a buyer might ask.&rdquo;
                  </p>
                  <p style={{ fontSize: 16, color: "#000", lineHeight: 1.7, margin: "0 0 10px" }}>
                    6sense&apos;s approach is the model to follow: a tightly scoped page, built around the exact use case where the comparison is most credible, with enough specificity that an AI model can quote it. The goal isn&apos;t to win every mention. It&apos;s to own the comparison moment when a buyer asks the AI for your category head-to-head.
                  </p>
                  <p style={{ fontSize: 16, color: "#000", lineHeight: 1.7, margin: 0 }}>
                    Backstory.ai shows what happens without it: a real product, real customers, and zero AI presence. The gap between having a product and being visible to AI is a content and indexability problem, and it&apos;s one of the faster ones to close.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Product Feature Improvement Opportunities for Lamigo */}
      {(() => {
        const IMPROVEMENTS = [
          {
            title: "Stakeholder change detection",
            current: "Lamigo tracks champions and technical evaluators per deal, and already surfaces new stakeholders during pre-call prep (e.g. flagging \"Lucas Ferretti, VP Eng, joining for the first time\").",
            improvement: "Turn this into a standalone, proactive alert, not just something surfaced before a call, but a real-time notification the moment a new stakeholder appears in a thread or CC line, with a short profile (\"new VP Eng joined, ex-Datadog, likely cares about integrations\"). Right now this only shows up as call-prep context; making it its own alert extends \"catches what you'd miss\" beyond scheduled calls into ongoing deal activity.",
          },
          {
            title: "Cross-deal pattern learning",
            current: "Lamigo reasons per-deal, flagging Brightwave as at-risk based on that deal's own signals (no reply in 4 days, CFO disengaged).",
            improvement: "Layer in reasoning across deals, using closed-deal history as a reference point, e.g. \"deals that go quiet after a competitive breakdown is sent have historically slipped 40% more often.\" This builds directly on the memory system already in development and turns single-deal alerts into predictions backed by real pattern data.",
          },
          {
            title: "Pre-send message risk check",
            current: "Lamigo drafts follow-up emails in the rep's own voice and tracks every commitment made in a deal.",
            improvement: "Add a quick check before a drafted message goes out: flag tone mismatches, over-promising language, or a commitment that was made earlier but isn't reflected in the draft. Since commitment tracking already exists, this is a small addition that cross-references what's already being tracked against what's about to be sent, reducing the risk of a rep sending something inconsistent with earlier promises.",
          },
        ];

        return (
          <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <button
              onClick={() => setImprovementsOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "16px 24px",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: improvementsOpen ? "1px solid rgba(0,0,0,0.07)" : "none",
                fontFamily: "inherit",
              }}
            >
              <h3 style={{ fontSize: 19, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em", margin: 0 }}>
                Product Feature Improvement Opportunities for Lamigo
              </h3>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: improvementsOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                <path d="M4 6l4 4 4-4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {improvementsOpen && (
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                {IMPROVEMENTS.map((item, i) => (
                  <div key={i} style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "18px 20px" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.3 }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: 16, color: "#000", lineHeight: 1.6, margin: "0 0 10px" }}>
                      <span style={{ fontWeight: 700 }}>Currently: </span>{item.current}
                    </p>
                    <div style={{
                      background: "rgba(37,99,235,0.04)",
                      border: "1px solid rgba(37,99,235,0.12)",
                      borderLeft: "3px solid rgba(37,99,235,0.35)",
                      borderRadius: "0 6px 6px 0",
                      padding: "8px 12px",
                    }}>
                      <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#000", margin: "0 0 4px" }}>
                        Improvement
                      </p>
                      <p style={{ fontSize: 15, color: "#000", lineHeight: 1.55, margin: 0 }}>
                        {item.improvement}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
