// HSAI pipeline — Hospitality AI Agents
// Collection system prompt + 39 prompts across 11 use-case clusters.
// Scope: AI agent platforms purpose-built for hotels, lodges, resorts,
// and vacation/short-term rentals — guest-facing and operations agents.

export const HSAI_COLLECTION_SYSTEM_PROMPT =
  'You are a market research assistant. Return ONLY valid JSON in this exact format: {"brands": ["Brand A", "Brand B", ...]}' +
  "\n\nAnswer the user's question naturally, then list every brand name you would mention in your answer, in the order they appear. Include any company, product, or platform name that is relevant — do not over-filter." +
  "\n\nIf the question is about AI agents or chatbot tools for hospitality operators (hotels, lodges, resorts, vacation rentals), include any AI platform, chatbot, guest-messaging tool, or automation product that hospitality operators use — whether purpose-built AI agents, AI-enhanced PMS features, or AI guest communication tools. When in doubt, include it." +
  "\n\nNo other text, no markdown formatting, no explanation — just the JSON object.";

export interface HsaiPrompt {
  id:  number;
  tag: string;
  text: string;
}

export const HSAI_PROMPTS: HsaiPrompt[] = [

  // ── Overall · hsai-overall (9 prompts) ───────────────────────────────────────
  { id: 1,  tag: "hsai-overall", text: "What AI agent tools do hotel and lodge operators use to automate guest communications?" },
  { id: 2,  tag: "hsai-overall", text: "What AI platforms are purpose-built for hospitality operators to handle guest inquiries?" },
  { id: 3,  tag: "hsai-overall", text: "What chatbot or AI concierge tools do hotels and resorts use?" },
  { id: 4,  tag: "hsai-overall", text: "What are the leading AI agent platforms for the hospitality industry?" },
  { id: 5,  tag: "hsai-overall", text: "Which companies are building AI agents specifically for hotels, lodges, and vacation rentals?" },
  { id: 6,  tag: "hsai-overall", text: "What software do boutique hotels and safari lodges use to automate their guest journey?" },
  { id: 7,  tag: "hsai-overall", text: "What AI tools help hospitality operators reduce front desk workload?" },
  { id: 8,  tag: "hsai-overall", text: "What are the best AI concierge platforms for independent hotels and boutique lodges in 2025?" },
  { id: 9,  tag: "hsai-overall", text: "Which AI agent companies are targeting the hospitality sector right now?" },

  // ── Booking & Reservations · hsai-booking (3 prompts) ────────────────────────
  { id: 10, tag: "hsai-booking", text: "What AI tools can handle the full hotel booking flow — availability, quotes, and confirmed reservations — without a human?" },
  { id: 11, tag: "hsai-booking", text: "What AI platforms help hotels and lodges convert WhatsApp and email inquiries into direct bookings?" },
  { id: 12, tag: "hsai-booking", text: "What software lets a lodge accept bookings through chat or WhatsApp with real-time PMS integration?" },

  // ── Guest Inquiry & Concierge · hsai-inquiry (3 prompts) ─────────────────────
  { id: 13, tag: "hsai-inquiry", text: "What AI concierge tools handle complex guest questions about activities, transport, and local experiences for hotels and lodges?" },
  { id: 14, tag: "hsai-inquiry", text: "What AI agents can answer guest WhatsApp and email inquiries 24/7 without human involvement for a safari lodge?" },
  { id: 15, tag: "hsai-inquiry", text: "What platforms let hotel guests ask anything and get an accurate, on-brand answer from an AI — not a scripted FAQ bot?" },

  // ── Multilingual Support · hsai-multilingual (3 prompts) ─────────────────────
  { id: 16, tag: "hsai-multilingual", text: "What AI tools automatically detect a hotel guest's language and respond in French, German, Spanish, or Mandarin?" },
  { id: 17, tag: "hsai-multilingual", text: "What hospitality AI platforms support multilingual guest communication across WhatsApp, email, and web chat?" },
  { id: 18, tag: "hsai-multilingual", text: "Which AI agents are best at maintaining brand voice when responding to international hotel guests in their own language?" },

  // ── Lead Capture & Nurture · hsai-lead (3 prompts) ───────────────────────────
  { id: 19, tag: "hsai-lead", text: "What AI tools capture guest inquiry leads and automatically follow up with prospects who haven't booked yet?" },
  { id: 20, tag: "hsai-lead", text: "Which hospitality AI platforms automatically nurture unconverted lodge inquiries over days or weeks?" },
  { id: 21, tag: "hsai-lead", text: "What software helps a hotel automatically re-engage guests who received a quote but didn't confirm?" },

  // ── In-stay & Upsell · hsai-instay (3 prompts) ───────────────────────────────
  { id: 22, tag: "hsai-instay", text: "What AI tools handle in-stay guest requests — activity bookings, housekeeping, transport — through WhatsApp or SMS?" },
  { id: 23, tag: "hsai-instay", text: "Which hospitality AI platforms proactively upsell activities and room upgrades to guests before and during their stay?" },
  { id: 24, tag: "hsai-instay", text: "What AI concierge tools let hotel guests manage their entire stay through messaging without calling the front desk?" },

  // ── Operations & Back-office · hsai-ops (3 prompts) ──────────────────────────
  { id: 25, tag: "hsai-ops", text: "What AI tools automate hospitality back-office tasks like reservations management, check-in scheduling, and internal routing?" },
  { id: 26, tag: "hsai-ops", text: "What platforms help hotel and lodge operators automate the admin behind running a property — beyond just guest chat?" },
  { id: 27, tag: "hsai-ops", text: "Which AI agent tools reduce the manual coordination work for a hotel operations team?" },

  // ── Short-term & Vacation Rental · hsai-str (3 prompts) ──────────────────────
  { id: 28, tag: "hsai-str", text: "What AI tools automate guest messaging and booking management for Airbnb and Booking.com short-term rental hosts?" },
  { id: 29, tag: "hsai-str", text: "What platforms help vacation rental operators manage guest communications across multiple properties with AI?" },
  { id: 30, tag: "hsai-str", text: "Which AI agents are built for short-term rental operators to automate check-in, review collection, and maintenance coordination?" },

  // ── PMS & Channel Integration · hsai-pms (3 prompts) ────────────────────────
  { id: 31, tag: "hsai-pms", text: "What AI guest communication tools integrate natively with Cloudbeds, Mews, Opera, or other hotel PMS platforms?" },
  { id: 32, tag: "hsai-pms", text: "Which AI agents sync with OTA channels like Airbnb, Booking.com, and Expedia to centralise hotel guest messaging?" },
  { id: 33, tag: "hsai-pms", text: "What AI hospitality platforms read live availability from a PMS and generate real-time quotes in conversation?" },

  // ── Security & Compliance · hsai-security (3 prompts) ────────────────────────
  { id: 34, tag: "hsai-security", text: "Which hospitality AI platforms are GDPR-compliant and store guest data in certified, secure infrastructure?" },
  { id: 35, tag: "hsai-security", text: "What AI guest messaging tools handle payment and booking data securely for hotel operators?" },
  { id: 36, tag: "hsai-security", text: "Which AI agents for hospitality are trusted by enterprise hotel groups for data privacy and security compliance?" },

  // ── Buyer Intent · hsai-buyer-intent (3 prompts) ─────────────────────────────
  // Decision-stage prompts — simulates a hospitality operator actively evaluating
  // and about to invest in an AI agent tool.
  { id: 37, tag: "hsai-buyer-intent", text: "What AI agent should a boutique lodge or hotel invest in right now to automate guest communications?" },
  { id: 38, tag: "hsai-buyer-intent", text: "I'm a hotel GM looking to replace our manual WhatsApp process with an AI agent — what do most operators actually recommend?" },
  { id: 39, tag: "hsai-buyer-intent", text: "Which hospitality AI platform is worth paying for as an independent lodge operator, and what are the real alternatives?" },
];
