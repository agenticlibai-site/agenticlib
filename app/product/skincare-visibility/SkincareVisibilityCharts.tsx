"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ROSE   = "#3B4DBE";
const PINK   = "#6677CC";
const DARK   = "#160F2E";

const LINE_COLORS = [
  "#C2186A", // 1.  rose
  "#6B4FBB", // 2.  purple
  "#2563EB", // 3.  blue
  "#059669", // 4.  emerald
  "#DC2626", // 5.  red
  "#D97706", // 6.  amber
  "#0891B2", // 7.  cyan
  "#C026D3", // 8.  fuchsia
  "#EA580C", // 9.  orange
  "#0D9488", // 10. teal
  "#7C3AED", // 11. violet
  "#65A30D", // 12. lime
  "#0369A1", // 13. dark blue
  "#92400E", // 14. brown
  "#BE185D", // 15. dark rose
  "#0F766E", // 16. dark teal
  "#B45309", // 17. dark amber
  "#4338CA", // 18. indigo
  "#047857", // 19. dark emerald
  "#9D174D", // 20. dark pink
];

function lineColor(i: number) { return LINE_COLORS[Math.min(i, LINE_COLORS.length - 1)]; }
function brandLineColor(brand: string, i: number): string {
  return BRAND_PIE_COLORS[brand] ?? BRAND_PIE_COLORS[displayName(brand)] ?? lineColor(i);
}

// ── Use-case bucket pie chart config ────────────────────────────────────────

interface UseCaseBucketBrandRow {
  brand: string;
  b1: number;
  b2: number;
  b3: number;
  b4: number;
  b5: number;
}

const BUCKET_DEFS = [
  {
    key: "b1" as const,
    label: "Routine audit & compatibility",
    sub: "prompts 7–8",
    description: "Reviews your existing skincare products for conflicts, incorrect layering order, and redundant steps - catching ingredient pairs that cancel each other out or cause irritation.",
  },
  {
    key: "b2" as const,
    label: "Personalised routine building",
    sub: "prompt 9",
    description: "Builds a morning and evening routine tailored to your skin type, concerns, budget, and lifestyle - no generic recommendations, just a plan matched to you.",
  },
  {
    key: "b3" as const,
    label: "Ingredient/product analysis",
    sub: "prompts 10–11",
    description: "Decodes what's actually in a product - what each ingredient does, how safe it is, and whether it suits your skin type or triggers your allergens.",
  },
  {
    key: "b4" as const,
    label: "Skin-condition-specific advice",
    sub: "prompt 12",
    description: "Targets named skin conditions - acne, rosacea, hyperpigmentation, eczema - with product recommendations or clinical pathways matched to the specific concern.",
  },
  {
    key: "b5" as const,
    label: "Tracking/reminders/progress",
    sub: "prompt 13",
    description: "Logs your routine consistency, sends step reminders, and tracks skin changes over time - turning skincare from a one-off event into a measurable habit.",
  },
];

const EXCLUDED_BRANDS = new Set([
  "SkinTypeAI", "SkinType AI", "Skin Type AI",
  "HiMirror", "Hi Mirror",
  "Skincare.ai", "Skincare.AI", "SkAI",
  "Skincarisma",
  "L'Oreal's Perso", "L'Oréal Perso", "L'Oreal Perso", "LOreal Perso",
  "L'Oréal's Perso", "Loreal Perso",
]);

const BRAND_PIE_COLORS: Record<string, string> = {
  "Curology":       "#C2186A",
  "SkAI":           "#6B4FBB",
  "INCI Decoder":   "#2563EB",
  "SkinSage":       "#059669",
  "SkinSAFE":       "#059669",
  "HelloAva":       "#7C3AED",
  "Clinique":       "#D97706",
  "Think Dirty":    "#0891B2",
  "SkinBetter":     "#C026D3",
  "DermEngine":     "#EA580C",
  "Dermatology AI": "#0D9488",
  "Skincare.ai":    "#EAB308",
  "SkinGenie":      "#0369A1",
  "SkinAdvisor":    "#4338CA",
  "Other":          "#CBD5E1",
};

function pieColor(name: string, idx: number): string {
  return BRAND_PIE_COLORS[name] ?? LINE_COLORS[(idx + 5) % LINE_COLORS.length];
}

const DISPLAY_NAMES: Record<string, string> = { "SkinSage": "SkinSAFE" };
function displayName(brand: string): string { return DISPLAY_NAMES[brand] ?? brand; }

function buildPieData(rows: UseCaseBucketBrandRow[], key: "b1" | "b2" | "b3" | "b4" | "b5") {
  const sorted = rows.filter(r => r[key] > 0 && !EXCLUDED_BRANDS.has(r.brand)).sort((a, b) => b[key] - a[key]);
  const top = sorted.slice(0, 5);
  const otherTotal = sorted.slice(5).reduce((s, r) => s + r[key], 0);
  const data = top.map(r => ({ name: r.brand, value: r[key] }));
  if (otherTotal > 0) data.push({ name: "Other", value: otherTotal });
  return data;
}

// ── Product Feature Comparison ───────────────────────────────────────────────

interface FeatureCompetitor { name: string; score: number; reasoning: string; bullets?: string[]; tag?: "outdated" | "limited-docs"; }
interface FeatureEntry {
  label: string;
  description: string;
  competitors: FeatureCompetitor[];
  callout?: string;
  dewwieSpotlight?: string;
  definitions?: { term: string; meaning: string }[];
}
interface FeatureBucket { bucket: string; features: FeatureEntry[]; }

const FEATURE_COMPARISON: FeatureBucket[] = [
  {
    bucket: "Routine audit & compatibility",
    features: [
      {
        label: "Ingredient conflict & compatibility detection",
        description: "Flags product-to-product clashes and incorrect layering order.",
        competitors: [
          { name: "INCI Decoder", score: 72, reasoning: "Explicit cross-product conflict detection with science-backed explanations of why specific ingredient combinations fail." },
          { name: "SkinGenie",    score: 52, reasoning: "Profile-aware product scan with swap suggestions - functional but lacks explanation of why ingredients clash across products." },
          { name: "Think Dirty",  score: 33, reasoning: "Flags hazards within a single product only; does not detect conflicts between two separate products in a routine." },
        ],
        dewwieSpotlight: "INCI Decoder's lead comes from explaining why ingredient pairs fail, not just flagging them. The differentiation opportunity is explanation-depth: surfacing the science behind a conflict so users understand it, rather than just seeing an alert.",
      },
      {
        label: "Routine structure audit",
        description: "Evaluates step order, redundancy, over-exfoliation, and missing categories.",
        competitors: [
          { name: "Curology",    score: 71, reasoning: "Licensed provider reviews the full routine at intake and each adjustment, flagging actives that conflict with the prescription." },
          { name: "SkinGenie",   score: 68, reasoning: "Builds AM/PM structure from scratch and identifies gaps and redundancies when auditing an uploaded routine." },
          { name: "SkinAdvisor", score: 52, reasoning: "Step-by-step conversational review of layering sequence - present but thinner in documented specifics than the other two." },
        ],
        dewwieSpotlight: "SkinGenie audits structure well but doesn't explain the reasoning behind the order. The opportunity is combining structural audit with clear why-this-order logic, giving users a corrected routine alongside an understanding of the principles behind it.",
      },
    ],
  },
  {
    bucket: "Personalised routine building",
    features: [
      {
        label: "Multi-question personalisation quiz",
        description: "Substantive questionnaire covering skin type, concerns, lifestyle, budget, and goals.",
        competitors: [
          { name: "HelloAva",  score: 78, reasoning: "12-question chatbot classifying into 30 skin types - most granular in this set - with demographic cohort data and past purchase history." },
          { name: "SkinGenie", score: 62, reasoning: "Clean quiz covering type, concerns, lifestyle, and budget in under 2 minutes with a purchasable AM/PM routine output." },
        ],
        dewwieSpotlight: "HelloAva classifies into 30 skin types across 12 questions, making it the most granular intake in this market. Granularity at intake directly lifts recommendation quality downstream; depth in the personalisation layer is worth investing in.",
        definitions: [
          { term: "Demographic cohort data", meaning: "HelloAva weights its recommendations using anonymised data from past customers with similar profiles - matching age group, skin type, lifestyle, and purchase patterns. Rather than relying only on what you tell it, the system surfaces products that have performed well for people like you." },
        ],
      },
      {
        label: "Expert-validated routine output",
        description: "A licensed expert reviews and confirms AI recommendations before delivery.",
        competitors: [
          { name: "Curology", score: 87, reasoning: "Licensed dermatology provider reviews every prescription and can output actual Rx actives - tretinoin, clindamycin, azelaic acid - unique to this brand." },
          { name: "HelloAva", score: 78, reasoning: "Licensed aesthetician structurally confirms every AI recommendation before checkout; human-in-the-loop is not optional for any customer." },
          { name: "Clinique",  score: 55, reasoning: "Dermatologist-guided product recommendations backed by 50+ years of research - but the expert validation happened at the brand level during product formulation, not at the individual customer level. No licensed expert reviews your specific skin situation before you receive a recommendation." },
        ],
        dewwieSpotlight: "Curology and HelloAva both have a human in the loop before the customer sees anything. A documented review step — even async, even lightweight — would be a meaningful credibility signal that no AI-only alternative in this set can match.",
        definitions: [
          { term: "Brand-level validation", meaning: "Expert expertise applied at the product design stage, not to your individual skin situation. Clinique's dermatologists shape the product formulations and ingredient choices for the brand, but don't review customer routines." },
          { term: "Per-customer review", meaning: "A licensed professional evaluates your specific recommendation or prescription before it reaches you." },
        ],
      },
    ],
  },
  {
    bucket: "Ingredient/product analysis",
    features: [
      {
        label: "Allergen tracking & personalised ingredient alerts",
        description: "User pre-sets allergens and receives automatic alerts on any flagged product.",
        competitors: [
          { name: "SkinSAFE",     score: 88, reasoning: "The strongest allergen system in this set: users pre-set personal allergens, patch-test results, and 30+ wellness markers (fragrance-free, gluten-free, BabySAFE, etc.) - every product scan is enforced against the full personal profile in real time. Co-developed with Mayo Clinic; no other brand in this set matches the breadth of the allergen database or the rigour of the per-scan enforcement." },
          { name: "Think Dirty",  score: 72, reasoning: "Pre-set personal allergens once; real-time scan-time alerts for any flagged ingredient, covering carcinogens, allergens, and endocrine disruptors." },
          { name: "INCI Decoder", score: 68, reasoning: "EU 80 mandatory fragrance allergens and CMR substances auto-flagged - but no user-configured personal alert profile for custom triggers." },
        ],
        dewwieSpotlight: "SkinSAFE built its defensibility on one thing: set your sensitivities once, and every future scan enforces them automatically. A personal allergen vault (configured once, applied everywhere) is the highest-leverage single feature in this category.",
      },
      {
        label: "Per-ingredient decode + skin-type suitability",
        description: "Explains what each ingredient does and whether it suits the user's specific skin type.",
        competitors: [
          { name: "INCI Decoder", score: 80, reasoning: "27,000+ ingredient database with science-based explanation of function, irritancy, and skin-type fit - the most complete per-ingredient decode in this set." },
          { name: "Think Dirty",  score: 55, reasoning: "0–10 Dirty Score with per-ingredient health concern detail - excellent for safety and toxicity but not optimised for skin-type compatibility." },
          { name: "SkinGenie",    score: 40, reasoning: "Rates overall product suitability against a skin profile with swap suggestions; no standalone per-ingredient decode without product context." },
        ],
        dewwieSpotlight: "INCI Decoder's 27,000+ database is the free public benchmark users already know. The differentiation here isn't breadth; it's contextualisation: connecting what an ingredient does to the user's specific skin profile, rather than a general explanation that applies to everyone.",
      },
    ],
  },
  {
    bucket: "Skin-condition-specific advice",
    features: [
      {
        label: "Prescription-grade condition treatment",
        description: "Clinically supported treatment recommendations for named skin conditions.",
        competitors: [
          { name: "Curology",       score: 84, reasoning: "The only brand prescribing Rx-only actives - tretinoin, clindamycin, azelaic acid - with a licensed provider adjusting formula as the condition responds." },
          { name: "Clinique",       score: 60, reasoning: "Condition-specific, dermatologist-guided product recommendations backed by 50+ years of research - but product selection, not prescription." },
          { name: "Dermatology AI", score: 55, reasoning: "Medical-grade identification of 44–68 skin conditions; FDA/CE-cleared in some implementations - diagnosis capability, not treatment delivery." },
        ],
        dewwieSpotlight: "Curology occupies the licensed Rx pathway. The open opportunity is the tier below: clear, condition-specific guidance on OTC actives (retinol, niacinamide, azelaic acid) with clinical rationale. No tracked brand in this set does this well.",
        definitions: [
          { term: "FDA/CE-cleared", meaning: "FDA (US) and CE (EU) regulatory clearance - the technology has been independently reviewed for medical safety and effectiveness, not just released as a consumer app." },
        ],
      },
      {
        label: "Photo-based skin condition identification",
        description: "Analyses a selfie to identify specific conditions rather than relying on self-report.",
        competitors: [
          { name: "Dermatology AI", score: 82, reasoning: "Primary use case: condition ID from photos with mole/lesion malignancy risk scoring, trained on dermatologist-verified data; FDA/CE-cleared." },
          { name: "Clinique",       score: 72, reasoning: "Clinical Reality plots 80+ data points per scan against 1M+ face scans - strong scale and accuracy, but narrower condition range." },
        ],
        dewwieSpotlight: "Dermatology AI sets a high clinical bar with FDA/CE clearance. The opportunity with photo-based intake is specificity of response: condition-specific output that's genuinely matched to what the photo shows, rather than a generic skin-type read.",
        definitions: [
          { term: "FDA/CE-cleared", meaning: "FDA (US) and CE (EU) regulatory clearance - the technology has been independently reviewed for medical safety and effectiveness, not just released as a consumer app." },
        ],
      },
    ],
  },
  {
    bucket: "Tracking/reminders/progress",
    features: [
      {
        label: "Routine check-off + habit reminders",
        description: "Daily step logging, scheduled reminders, and consistency feedback over time. SkinGenie is the only tracked brand with documented routine check-off and habit reminder functionality.",
        competitors: [
          { name: "SkinGenie", score: 68, reasoning: "Push reminders for morning and evening routines with gamified badge streaks for completion." },
        ],
        dewwieSpotlight: "This sub-feature is underdeveloped across the whole market. A streak plus a reflection nudge ('your skin improved after 2 weeks of SPF compliance') would outperform everything tracked here and build a habit loop no tracked competitor has nailed.",
      },
      {
        label: "Visual skin progress tracking",
        description: "Before/after selfie comparison or skin metric improvement visualised over weeks.",
        competitors: [
          { name: "SkinAdvisor", score: 68, reasoning: "Dedicated visual progress tracking in the paid tier - the Skin Diary logs cross-session skin history and tracks changes over time, giving users a record of how their skin is evolving." },
          { name: "SkinGenie",   score: 52, reasoning: "Cross-session Skin Journal records routine history and skin changes across sessions, giving users a longitudinal view of how their skin responds to a routine over time." },
          { name: "Curology",    score: 38, reasoning: "Before/after photos are stored in the clinical record and inform provider formula adjustments, but are not accessible to the user as a self-serve visual comparison - this is a provider tool, not a consumer-facing feature." },
        ],
        dewwieSpotlight: "Tracked brands show historical comparison, but predictive visualisation (showing projected outcome from a recommended routine) is largely untapped. A 'what your skin could look like in 8 weeks on this routine' layer would be a genuine first-mover feature among AI-native skincare tools.",
      },
    ],
  },
];

// ── Technical & Operational Dimensions ────────────────────────────────────────

const TECH_DIMENSIONS: FeatureBucket[] = [
  {
    bucket: "Technical Capabilities",
    features: [
      {
        label: "Instruction following & constraint adherence",
        description: "Does the agent reliably enforce user-stated constraints - budget, ingredient exclusions, allergens, skin goals?",
        competitors: [
          { name: "SkinSAFE",     score: 78, reasoning: "Sets a persistent profile of personal allergens, patch-test results, and 30+ wellness markers (fragrance-free, gluten-free, BabySAFE, and more) that enforces automatically at every product scan. The same profile acts as a skin goal filter. This is the only brand where constraint enforcement is passive and real-time - the user sets it once and it applies everywhere." },
          { name: "Curology",     score: 74, reasoning: "Intake form captures skin goals, allergies, and medical contraindications upfront; a licensed provider carries every stated constraint forward at each formula adjustment. Ingredient exclusions are enforced at prescription level." },
          { name: "SkinGenie",    score: 72, reasoning: "The quiz captures skin goals, allergens, and budget together and reflects all three in the output - a budget-appropriate routine with lower-cost swap alternatives, filtered by the Ingredient Checker for ingredient exclusions. The most balanced constraint coverage in this set." },
          { name: "Think Dirty",  score: 68, reasoning: "Users pre-set a personal allergen profile that fires real-time alerts at scan time, covering carcinogens, allergens, and endocrine disruptors across 850,000+ products (premium feature). Ingredient exclusion enforcement is the core capability - skin goal constraints are not part of the design." },
          { name: "HelloAva",     score: 62, reasoning: "The 11-question intake captures skin sensitivities and goals, with a licensed aesthetician reviewing every recommendation before it reaches the customer as an additional constraint check. Ingredient exclusions are noted in the intake but there is no documented real-time filtering between preferences and product output." },
          { name: "Clinique",     score: 32, reasoning: "The recommendation engine is scan-driven with no mechanism to pre-set personal constraints. Allergens, skin goals, and ingredient exclusions are not accepted as inputs - the agent recommends from its catalogue without personalised filtering." },
          { name: "SkinAdvisor",  score: 28, reasoning: "Selfie analysis drives the output with no documented way to define ingredient exclusions, allergens, or skin goals as enforced inputs. Recommendations are based on scan results rather than a user-set constraint profile.", tag: "limited-docs" },
          { name: "INCI Decoder", score: 22, reasoning: "The developer API supports include/exclude ingredient filtering, but the consumer-facing agent has no user profile - ingredient exclusions, allergens, and skin goals cannot be pre-set or enforced in the standard interface." },
        ],
      },
      {
        label: "Multi-step reasoning & conditional logic",
        description: "Does the agent chain multiple decisions - adapting on follow-up answers, re-assessing across sessions, applying conditional logic based on new inputs?",
        competitors: [
          { name: "Curology",     score: 80, reasoning: "Documented lifecycle chain: intake → formula design → ongoing provider chat → reformulation as skin goals change. Multi-step structure is built into the subscription model." },
          { name: "SkinGenie",    score: 74, reasoning: "Full session chain: questionnaire → selfie analysis → routine → swap options → Skin Journal cross-session tracking → routine refinement over time." },
          { name: "HelloAva",     score: 62, reasoning: "AI generates → aesthetician reviews → customer approves or swaps → purchase history carried into future sessions." },
          { name: "SkinAdvisor",  score: 32, reasoning: "Skin Diary stores cross-session analysis history; no documented conditional reasoning chain or re-assessment triggers.", tag: "limited-docs" },
          { name: "Think Dirty",  score: 18, reasoning: "Ingredient preference profile persists across sessions, but each individual scan is a standalone one-step pass with no documented inter-session chaining." },
        ],
      },
    ],
  },
  {
    bucket: "Responsible AI · Security",
    features: [
      {
        label: "Data privacy & compliance posture",
        description: "How well-documented is the brand's data privacy posture - policy publication, regulatory certifications, and protections for sensitive health, photo, or biometric data?",
        competitors: [
          { name: "Curology", score: 82, reasoning: "", bullets: [
            "HIPAA-compliant handling of Rx health data, confirmed across state-specific privacy addenda",
            "Cryptographic hashing and firewall controls documented in published policy",
            "Washington State health privacy addendum published; most transparent data posture in this set",
          ]},
          { name: "Clinique", score: 58, reasoning: "", bullets: [
            "Governed under the Estée Lauder Companies privacy framework with EU Standard Contractual Clauses in place",
            "Admin, technical, and physical safeguards documented",
            "Not HIPAA-regulated (cosmetics), no public SOC 2, but clear data handling standards from a regulated parent company",
          ]},
          { name: "Think Dirty", score: 48, reasoning: "", bullets: [
            "Privacy policy published and dated (Sep 2022); GDPR user rights addressed",
            "SSL/HTTPS in place; no data sold to third parties stated explicitly",
            "No SOC 2 or HIPAA certification, but policy is clear and publicly accessible",
          ]},
        ],
      },
      {
        label: "Medical-grade & clinical data handling",
        description: "Has the brand published verifiable documentation on medical-standard handling of sensitive health data, or obtained regulatory recognition for clinical-grade data practices?",
        competitors: [
          { name: "Curology", score: 88, reasoning: "", bullets: [
            "Rx health data treated as HIPAA-covered PHI; state-specific privacy addenda published",
            "Only brand in this set prescribing regulated actives (tretinoin, clindamycin, azelaic acid) under licensed provider oversight",
          ]},
          { name: "Clinique", score: 60, reasoning: "", bullets: [
            "50+ years of dermatological research with allergy-tested formulations and 6M+ application tests documented",
            "Not classified as a medical device; governed under a cosmetics/retail framework, not HIPAA",
          ]},
          { name: "SkinSAFE", score: 42, reasoning: "", bullets: [
            "Co-developed with Mayo Clinic; designed for patients with known allergens; healthcare provider group integration documented",
            "Consumer app, not a clinical agent - operates outside HIPAA requirements",
          ]},
        ],
      },
    ],
  },
  {
    bucket: "Cost Efficiency",
    features: [
      {
        label: "Free tier accessibility",
        description: "Is the agent accessible for a new user without payment?",
        competitors: [
          { name: "INCI Decoder", score: 95, reasoning: "Fully free; no account required; 27,000+ ingredient database accessible in full without any payment. Zero barrier to entry." },
          { name: "Clinique",     score: 88, reasoning: "Free to use on Clinique.com and partner retailer sites; Clinical Reality scan requires no payment; revenue comes from product purchase, not agent access." },
          { name: "SkinSAFE",     score: 72, reasoning: "Free core tier with meaningful allergen filtering across 30+ wellness markers; Premium ($59.99/year) is clearly tiered, with genuine free entry." },
          { name: "SkinGenie",    score: 68, reasoning: "Free tier includes 1 routine and 1 analysis per month; Pro at $2.99/month is the lowest monthly subscription price in this set." },
          { name: "Think Dirty",  score: 60, reasoning: "Free tier includes basic scanning; allergen-alert premium feature at $28.99/year ($2.42/month effective rate)." },
          { name: "HelloAva",     score: 65, reasoning: "$10 one-time consultation fee - includes a brief skin assessment, tailored guidance from a licensed esthetician, and personalised product routine delivered." },
          { name: "SkinAdvisor",  score: 45, reasoning: "Free to download with basic AI skin scans and a simplified routine suggestion included; full features (unlimited scans, routines, diet plans, progress tracking) require Premium at $9.99/month or $59.99/year." },
          { name: "Curology",     score: 22, reasoning: "$19.95/month minimum ongoing after trial; prescription model means sustained cost; justified by clinical supervision but highest recurring cost in this set." },
        ],
      },
      {
        label: "Subscription value & feature depth per dollar",
        description: "What do you get on the paid tier relative to cost?",
        competitors: [
          { name: "Curology",    score: 78, reasoning: "Licensed provider supervision, actual prescription actives, and formula adjustments included in the monthly fee - the only subscription in this set that delivers clinical outcomes, not just recommendations." },
          { name: "SkinGenie",   score: 75, reasoning: "$2.99/month delivers Sephora-integrated product catalogue, AI routine builder, Ingredient Checker, and cross-session Skin Journal. Best price-to-feature ratio in this set." },
          { name: "Think Dirty", score: 68, reasoning: "$28.99/year ($48.99/year All Access) gives real-time allergen alerts, 850,000+ product database, Ingredient Alerts, and curated safe lists. Clear per-feature value." },
          { name: "SkinSAFE",    score: 55, reasoning: "$59.99/year for Mayo Clinic-co-developed allergen engine with 30+ wellness markers and healthcare provider group integration. Defensible but not most affordable per feature." },
          { name: "SkinAdvisor", score: 52, reasoning: "$59.99/year ($5/month) includes unlimited skin scans, full routines, diet and lifestyle plans, visual progress tracking, and advanced product lists - diet integration is not offered by any other brand in this set. Falls short on price-to-feature value vs. SkinGenie, which delivers comparable routine-building features at $2.99/month." },
        ],
      },
    ],
  },
];

// ── Product Feature Opportunity ───────────────────────────────────────────────

interface BrandHighlight { brand: string; feature: string; detail: string; }
interface DewwieOpportunity { title: string; body: string; brand: string; }

const BRAND_HIGHLIGHTS: BrandHighlight[] = [
  {
    brand: "Curology",
    feature: "Licensed Rx prescription engine",
    detail: "The only brand that prescribes actual regulated actives - tretinoin, clindamycin, azelaic acid - adjusted by a licensed dermatology provider as your skin responds over time.",
  },
  {
    brand: "INCI Decoder",
    feature: "27,000+ ingredient decode database",
    detail: "The deepest free public ingredient library available - science-backed explanations of function, irritancy, and skin-type fit for every ingredient, no account required.",
  },
  {
    brand: "SkinSAFE",
    feature: "Mayo Clinic allergen engine with 30+ wellness markers",
    detail: "Co-developed with Mayo Clinic: users pre-set patch-test results and personal wellness markers (fragrance-free, gluten-free, BabySAFE, etc.) and every product scan is enforced against the full profile in real time.",
  },
  {
    brand: "HelloAva",
    feature: "Mandatory human-in-the-loop aesthetician review",
    detail: "Every AI-generated recommendation is reviewed and confirmed by a licensed aesthetician before the customer sees it - a required human checkpoint, not an optional upgrade.",
  },
  {
    brand: "Clinique",
    feature: "12-week predictive skin outcome simulation",
    detail: "Clinical Reality shows a projected visualisation of what your skin could look like after completing a recommended routine - the only predictive (not retrospective) progress tool in this set.",
  },
  {
    brand: "Think Dirty",
    feature: "0-10 ingredient toxicity scoring",
    detail: "Every ingredient receives a Dirty Score covering carcinogens, allergens, and endocrine disruptors - users pre-set personal allergen alerts that fire in real time at scan across 850,000+ products.",
  },
  {
    brand: "SkinGenie",
    feature: "Cross-session Skin Journal with Sephora integration",
    detail: "Tracks routine history and skin changes across sessions, with product recommendations drawn directly from the Sephora catalogue - bridging advice and purchase in one flow.",
  },
  {
    brand: "SkinAdvisor",
    feature: "Skin Diary and inside-out nutrition plans",
    detail: "Tracks skin history across sessions through a built-in Skin Diary, and connects nutritional and lifestyle inputs to skin outcome recommendations - the only brand in this set offering both cross-session skin logging and personalised diet plans designed to support skin from the inside out.",
  },
  {
    brand: "Dermatology AI",
    feature: "Photo-based clinical condition identification",
    detail: "Identifies 44-68 specific skin conditions from a selfie, including malignancy risk scoring for lesions - trained on dermatologist-verified data and FDA/CE-cleared in some implementations.",
  },
];

const DEWWIE_OPPORTUNITIES: DewwieOpportunity[] = [
  {
    title: "Persistent allergen and ingredient alert profile",
    body: "A personal allergen vault lets users record their sensitivities, patch-test reactions, and ingredient exclusions in one place. Every future product scan then checks automatically against that saved profile without the user needing to re-enter anything. In practice, this means someone with a fragrance sensitivity or a known reaction to retinol gets an instant flag every time a conflicting ingredient appears in a product they're considering — across 165,000+ products in real time. The profile also grows more useful over time: the more a user adds, the more personalised and protective every scan becomes. SkinSAFE, co-developed with Mayo Clinic, has built this as its core mechanic and 30+ wellness markers. Dewwie could potentially layer a similar vault directly into its existing product scanning flow, making every scan more meaningful from day one.",
    brand: "SkinSAFE",
  },
  {
    title: "Routine trajectory and goal visualisation",
    body: "Routine trajectory visualisation means showing a user not just where their skin is today, but where it is heading based on their current routine and consistency. In skincare terms, this could look like: a user who has been applying SPF daily for six weeks sees a projected improvement in hyperpigmentation over the next four weeks if they keep going. It turns skincare from a blind commitment into a visible, motivating journey. Clinique leads this with a 12-week skin outcome simulation based on clinical research. The difference is that Dewwie stores real user skin history and progress photos, meaning any trajectory shown is grounded in that individual's actual data rather than population averages. Dewwie could potentially surface this as a 'goal indicator' rather than a fixed prediction, framing it as a directional signal to keep users engaged with their routine.",
    brand: "Clinique",
  },
  {
    title: "Contextualised ingredient safety signal",
    body: "An ingredient safety signal flags potentially harmful substances in skincare products, such as carcinogens, endocrine disruptors, or known skin irritants. In practice, a user scanning a new moisturiser might see that one of its preservatives has a toxicity concern, helping them make a more informed purchase. Think Dirty built a large loyal following almost entirely on this feature, offering a simple 0-10 Dirty Score per product across 850,000+ items. The opportunity for deeper value is in contextualisation: rather than just surfacing a score, connecting that flag to what the user is already using. For example, noting that a flagged ingredient appears in three of the five products already in their routine, or that it conflicts with their niacinamide serum. Dewwie could potentially add this layer of connected insight to its existing ingredient analysis, making safety signals feel relevant rather than generic.",
    brand: "Think Dirty",
  },
  {
    title: "Cross-session routine memory with re-assessment triggers",
    body: "Routine memory means an AI skincare tool that actively tracks what a user has been doing over time and proactively suggests when something should change. For example, as seasons shift from summer to winter, skin typically needs more hydration and less exfoliation. A tool with routine memory could surface a prompt like 'your summer routine may need adjusting as the weather cools' without the user having to ask. Or, after six weeks of consistency, it could note 'your skin has been stable on this routine, here is how it has changed.' SkinGenie approaches this by chaining sessions and referencing prior recommendations in its reasoning. This is a relatively underdeveloped feature across the market as a whole. Dewwie, which already stores progress photos and skin history, could potentially build proactive re-assessment nudges into its existing session flow as a natural next step.",
    brand: "SkinGenie",
  },
];

function brandBarColor(name: string): string {
  return BRAND_PIE_COLORS[name] ?? ROSE;
}

function FeatureCard({ feature }: { feature: FeatureEntry }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: "1px solid rgba(22,15,46,0.08)",
      boxShadow: "0 2px 8px rgba(22,15,46,0.06)",
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ marginBottom: 4 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: DARK, lineHeight: 1.35 }}>
          {feature.label}
        </p>
      </div>
      <p style={{ fontSize: 13, color: DARK, marginBottom: 16, lineHeight: 1.5 }}>
        {feature.description}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {feature.competitors.map(c => (
          <div key={c.name}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: DARK, minWidth: 108, flexShrink: 0 }}>
                {c.name}
                {c.tag === "outdated" && (
                  <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 999, background: "rgba(217,119,6,0.10)", color: "#D97706", letterSpacing: "0.03em", verticalAlign: "middle" }}>2017–19</span>
                )}
                {c.tag === "limited-docs" && (
                  <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 999, background: "rgba(100,116,139,0.10)", color: "#475569", letterSpacing: "0.03em", verticalAlign: "middle" }}>limited docs</span>
                )}
              </span>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(22,15,46,0.07)", overflow: "hidden" }}>
                <div style={{ height: 6, borderRadius: 999, width: `${c.score}%`, background: brandBarColor(c.name) }} />
              </div>
              <span style={{
                fontSize: 15, fontWeight: 700, color: brandBarColor(c.name),
                minWidth: 24, textAlign: "right" as const, fontVariantNumeric: "tabular-nums",
              }}>
                {c.score}
              </span>
            </div>
            {c.bullets ? (
              <ul style={{ paddingLeft: 129, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                {c.bullets.map((b, i) => (
                  <li key={i} style={{ fontSize: 13, color: DARK, lineHeight: 1.5, listStyle: "none", display: "flex", gap: 6 }}>
                    <span style={{ flexShrink: 0 }}>•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{
                fontSize: 13, color: DARK, lineHeight: 1.5,
                paddingLeft: 117, margin: 0,
              }}>
                {c.reasoning}
              </p>
            )}
          </div>
        ))}
      </div>
      {feature.callout && (
        <div style={{
          marginTop: 12,
          background: "rgba(217,119,6,0.07)",
          border: "1px solid rgba(217,119,6,0.22)",
          borderRadius: 8, padding: "10px 14px",
          display: "flex", alignItems: "flex-start", gap: 8,
        }}>
          <span style={{ fontSize: 15, flexShrink: 0, color: "#D97706", lineHeight: 1.2 }}>★</span>
          <p style={{ fontSize: 13, color: "#92400E", lineHeight: 1.55, margin: 0 }}>
            {feature.callout}
          </p>
        </div>
      )}
      {feature.dewwieSpotlight && (
        <div style={{
          marginTop: 12,
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.18)",
          borderRadius: 8, padding: "10px 14px",
          display: "flex", alignItems: "flex-start", gap: 8,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.2 }}>💡</span>
          <p style={{ fontSize: 13, color: "#312E81", lineHeight: 1.55, margin: 0 }}>
            {feature.dewwieSpotlight}
          </p>
        </div>
      )}
      {feature.definitions && feature.definitions.length > 0 && (
        <div style={{
          marginTop: 14,
          borderTop: "1px solid rgba(22,15,46,0.07)",
          paddingTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}>
          {feature.definitions.map(({ term, meaning }) => (
            <p key={term} style={{ fontSize: 13, color: DARK, lineHeight: 1.55, margin: 0 }}>
              <strong>{term}</strong> — {meaning}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const SEED_BRANDS = ["PROVEN", "Curology", "Function of Beauty", "Atolla", "Skinsei", "Droplette"];
const SEED_BASES  = [82, 64, 55, 42, 38, 34];

function makeSeedRows(): Record<string, string | number>[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const date = d.toISOString().split("T")[0];
    const row: Record<string, string | number> = { date };
    SEED_BRANDS.forEach((brand, bi) => {
      const wave = Math.round(SEED_BASES[bi] * 0.13 * Math.sin((i + bi * 2) * 0.85));
      row[brand] = Math.max(0, SEED_BASES[bi] + wave);
    });
    return row;
  });
}

interface DailyRow {
  date: string;
  brand: string;
  model: string;
  mention_count: number;
  confidence: string;
}

interface WeeklyRow {
  brand: string;
  model: string;
  mention_count: number;
  confidence: string;
}

interface LLMVisRow {
  model: string;
  visibility_pct: number;
  total_responses: number;
}

interface SkincareSentimentTag { tag: string; frequency: number; shared: boolean; }
interface SkincareSentimentRow {
  brand: string;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  top_tags: SkincareSentimentTag[];
  total_responses: number;
}

interface Props {
  dailySummary: DailyRow[];
  weeklySummary: WeeklyRow[];
  llmVisibility: LLMVisRow[];
  useCaseBuckets: UseCaseBucketBrandRow[];
  sentimentData: SkincareSentimentRow[];
}

function buildChartData(daily: DailyRow[]) {
  const dateSet = new Set<string>();
  const brandSet = new Set<string>();
  const index: Record<string, Record<string, number>> = {};

  for (const row of daily) {
    if (EXCLUDED_BRANDS.has(row.brand)) continue;
    dateSet.add(row.date);
    brandSet.add(row.brand);
    if (!index[row.date]) index[row.date] = {};
    index[row.date][row.brand] = (index[row.date][row.brand] ?? 0) + row.mention_count;
  }

  const dates = [...dateSet].sort();
  const brands = [...brandSet].sort((a, b) => {
    const aT = dates.reduce((s, d) => s + (index[d]?.[a] ?? 0), 0);
    const bT = dates.reduce((s, d) => s + (index[d]?.[b] ?? 0), 0);
    return bT - aT;
  });

  const rows = dates.map(date => {
    const row: Record<string, number | string> = { date };
    for (const brand of brands) row[brand] = index[date]?.[brand] ?? 0;
    return row;
  });

  return { dates, brands, rows };
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-AU", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

function Card({ children, accent = ROSE }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      borderLeft: `4px solid ${accent}`,
      boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
      padding: "20px 24px",
    }}>
      {children}
    </div>
  );
}

function CardLabel({ children, color = ROSE }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{
      fontSize: 12,
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.1em",
      color,
      marginBottom: 10,
    }}>
      {children}
    </p>
  );
}

function BigNumber({ value, sub }: { value: string | number; sub?: string }) {
  return (
    <>
      <p style={{
        fontSize: 54,
        fontWeight: 800,
        color: DARK,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        marginBottom: sub ? 8 : 0,
      }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 14, color: DARK }}>{sub}</p>}
    </>
  );
}

function EmptySlate({ message = "Collecting data…" }: { message?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
      <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
        <rect x="0" y="8"  width="4" height="8" rx="1" fill={ROSE} opacity="0.25" />
        <rect x="5" y="4"  width="4" height="12" rx="1" fill={ROSE} opacity="0.40" />
        <rect x="10" y="1" width="4" height="15" rx="1" fill={ROSE} opacity="0.55" />
        <rect x="15" y="6" width="3" height="10" rx="1" fill={ROSE} opacity="0.35" />
      </svg>
      <p style={{ fontSize: 15, color: DARK }}>{message}</p>
    </div>
  );
}

export default function SkincareVisibilityCharts({ dailySummary, weeklySummary, llmVisibility, useCaseBuckets, sentimentData }: Props) {
  const hasReal = dailySummary.length > 0;
  const { brands: realBrands, rows: realRows } = buildChartData(dailySummary);

  const chartBrands = hasReal ? realBrands.slice(0, 20) : SEED_BRANDS;
  const chartRows   = hasReal ? realRows : makeSeedRows();
  const chartDates  = chartRows.map(r => String(r.date));
  const chartRowByDate = Object.fromEntries(chartRows.map(r => [String(r.date), r]));

  const [hiddenBrands, setHiddenBrands] = useState<Set<string>>(new Set());
  const toggleBrand = (brand: string) =>
    setHiddenBrands(prev => { const n = new Set(prev); n.has(brand) ? n.delete(brand) : n.add(brand); return n; });
  const selectAll = () => setHiddenBrands(new Set());
  const clearAll  = () => setHiddenBrands(new Set(chartBrands));

  const weeklyByBrand: Record<string, { mention_count: number; confidence: string }> = {};
  for (const row of weeklySummary) {
    if (EXCLUDED_BRANDS.has(row.brand)) continue;
    const e = weeklyByBrand[row.brand];
    weeklyByBrand[row.brand] = {
      mention_count: (e?.mention_count ?? 0) + row.mention_count,
      confidence: row.confidence,
    };
  }
  const weeklyBrands = Object.entries(weeklyByBrand).sort((a, b) => b[1].mention_count - a[1].mention_count);
  const totalMentions = weeklyBrands.reduce((s, [, v]) => s + v.mention_count, 0);
  const hasWeekly = weeklyBrands.length > 0;

  const latestVis: Record<string, { pct: number; total: number }> = {};
  for (const row of llmVisibility) {
    if (!latestVis[row.model]) latestVis[row.model] = { pct: row.visibility_pct, total: row.total_responses };
  }
  const visModels = Object.entries(latestVis);
  const hasVis = visModels.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Executive Summary */}
      <div style={{
        background: "linear-gradient(135deg, #EEF0FD 0%, #F0F2FE 100%)",
        border: "1px solid rgba(59,77,190,0.12)",
        borderRadius: 12,
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: ROSE, marginBottom: 6 }}>
            Executive Summary
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: DARK, lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: 10 }}>
            What this report is telling you
          </h2>
          <p style={{ fontSize: 15, color: DARK, lineHeight: 1.75, maxWidth: 740, opacity: 0.8 }}>
            This report benchmarks nine AI skincare brands across product features, technical capabilities, security measures, cost efficiency, and LLM visibility. It identifies the strongest capabilities in the current market and translates them into suggested product opportunities that can help Dewwie build a more differentiated and competitive AI skincare experience.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            {
              label: "Market Leader",
              value: "Curology",
              note: "Prescribes regulated actives (tretinoin, clindamycin, azelaic acid) via a licensed dermatology provider. Every recommendation is clinician-reviewed — the only platform here that operates as a genuine medical service, not a consumer app.",
            },
            {
              label: "Standout Feature Execution",
              value: "SkinSAFE allergen vault",
              note: "Set allergens, patch-test reactions, and preferences once. Every subsequent product scan is automatically checked against that profile in real time. Co-developed with Mayo Clinic, covering 165,000+ products. No re-entry, no missed triggers.",
            },
            {
              label: "Key Market Gap",
              value: "Routine memory",
              note: "An AI that tracks a user's routine across sessions and flags when something should change — a new season, a visible skin shift. No brand in this set does this. It is an unbuilt feature in a category where habit support is the main retention lever.",
            },
          ].map(({ label, value, note }) => (
            <div key={label} style={{
              background: "#fff",
              borderRadius: 8,
              padding: "16px 18px",
              borderTop: `2px solid ${ROSE}`,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              boxShadow: "0 1px 4px rgba(22,15,46,0.06)",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.09em", color: ROSE }}>{label}</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: DARK }}>{value}</p>
              <p style={{ fontSize: 13, color: DARK, lineHeight: 1.6, opacity: 0.7 }}>{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 1: Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>

        <Card accent={ROSE}>
          <CardLabel>Brand Mentions · 7 Days</CardLabel>
          <BigNumber
            value={hasWeekly ? totalMentions.toLocaleString() : "-"}
            sub={hasWeekly
              ? `across ${weeklyBrands.length} brands · 2 models`
              : "Run starts collecting at 5 AM UTC"
            }
          />
        </Card>

        <Card accent={DARK}>
          <CardLabel color={DARK}>LLM Visibility · 7 Days</CardLabel>
          {!hasVis ? (
            <EmptySlate />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {visModels.map(([model, { pct, total }], i) => {
                const label = model === "claude-haiku-4-5" ? "Claude Haiku" : "GPT-4o mini";
                const color = i === 0 ? ROSE : PINK;
                return (
                  <div key={model}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: DARK, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(22,15,46,0.07)" }}>
                      <div style={{ height: 5, borderRadius: 999, width: `${Math.min(pct, 100)}%`, background: color }} />
                    </div>
                    <p style={{ fontSize: 12, color: DARK, marginTop: 4 }}>{total} responses</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Row 2: 7-day trend chart */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
        padding: "24px 28px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, marginBottom: 2, letterSpacing: "-0.01em" }}>
              Brand Mentions - 5-Day Trend
            </h3>
            <p style={{ fontSize: 14, color: DARK }}>
              {hasReal ? "Top 20 brands by total mentions · both models combined" : "Sample data - live chart populates after daily collection"}
            </p>
          </div>
          {!hasReal && (
            <span style={{
              fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const,
              letterSpacing: "0.08em", color: ROSE, background: "rgba(59,77,190,0.10)",
              padding: "3px 8px", borderRadius: 999,
            }}>
              Preview
            </span>
          )}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartRows} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(22,15,46,0.055)" vertical={false} />
            <XAxis
              dataKey="date"
              ticks={chartDates}
              tickFormatter={fmtDate}
              tick={{ fontSize: 13, fill: DARK }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 13, fill: DARK }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid rgba(22,15,46,0.10)",
                fontSize: 14,
                boxShadow: "0 4px 16px rgba(22,15,46,0.12)",
                color: DARK,
                background: "#fff",
              }}
              labelStyle={{ fontWeight: 700, marginBottom: 4, color: DARK }}
              labelFormatter={v => fmtDate(String(v))}
              itemSorter={(item) => -(item.value as number)}
              formatter={(value, name) => [value, displayName(String(name))]}
            />
            {chartBrands.map((brand, i) => (
              <Line
                key={brand}
                type="monotone"
                dataKey={brand}
                stroke={brandLineColor(brand, i)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                hide={hiddenBrands.has(brand)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Per-date mention table */}
        <div style={{ marginTop: 20, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 12px 6px 0", fontSize: 12, fontWeight: 700, color: "rgba(22,15,46,0.45)", letterSpacing: "0.06em", textTransform: "uppercase" as const, borderBottom: "2px solid rgba(22,15,46,0.08)", whiteSpace: "nowrap" as const }}>
                  Brand
                </th>
                {chartDates.map(date => (
                  <th key={date} style={{ textAlign: "right", padding: "6px 10px", fontSize: 12, fontWeight: 700, color: "rgba(22,15,46,0.45)", letterSpacing: "0.06em", textTransform: "uppercase" as const, borderBottom: "2px solid rgba(22,15,46,0.08)", whiteSpace: "nowrap" as const, minWidth: 72 }}>
                    {fmtDate(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartBrands
                .map((brand, origIdx) => ({ brand, origIdx }))
                .filter(({ brand }) => !hiddenBrands.has(brand))
                .map(({ brand, origIdx }) => {
                  const color = brandLineColor(brand, origIdx);
                  return (
                    <tr key={brand} style={{ borderBottom: "1px solid rgba(22,15,46,0.04)" }}>
                      <td style={{ padding: "8px 12px 8px 0", whiteSpace: "nowrap" as const }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{displayName(brand)}</span>
                        </div>
                      </td>
                      {chartDates.map(date => {
                        const val = (chartRowByDate[date]?.[brand] as number) ?? 0;
                        return (
                          <td key={date} style={{ padding: "8px 10px", textAlign: "right", fontSize: 13, fontWeight: val > 0 ? 700 : 400, color: val > 0 ? color : "rgba(22,15,46,0.18)" }}>
                            {val > 0 ? val : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Brand filter */}
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(22,15,46,0.06)", paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: DARK }}>
              Brands
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={selectAll} style={{ fontSize: 12, fontWeight: 600, color: ROSE, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Select all
              </button>
              <button onClick={clearAll} style={{ fontSize: 12, fontWeight: 600, color: ROSE, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>
                Clear all
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
            {chartBrands.map((brand, i) => {
              const color = brandLineColor(brand, i);
              const checked = !hiddenBrands.has(brand);
              return (
                <label key={brand} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand)}
                    style={{ accentColor: color, width: 12, height: 12, cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: checked ? color : DARK, fontWeight: checked ? 600 : 400 }}>
                    {displayName(brand)}
                  </span>
                </label>
              );
            })}
          </div>
          {hasReal && realBrands.length > 20 && (
            <p style={{ fontSize: 12, color: DARK, marginTop: 8 }}>
              Showing top 20 of {realBrands.length} brands by mention volume.
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Use-case share of voice */}
      {useCaseBuckets.length > 0 && (
        <div style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(22,15,46,0.07)",
            display: "flex",
            alignItems: "baseline",
            gap: 12,
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
              Use-Case Share of Voice
            </h3>
            <span style={{ fontSize: 14, color: DARK }}>brand mentions by use case</span>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: 15, color: DARK, marginBottom: 20, lineHeight: 1.6, maxWidth: 680 }}>
              When AI models are asked about a specific skincare task, which brands do they mention most? Each chart below covers one use case and shows the share of brand mentions within it, giving you a read on which brands own each part of the skincare AI conversation.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {BUCKET_DEFS.map(({ key, label, sub, description }) => {
                const pieData = buildPieData(useCaseBuckets, key);
                if (pieData.length === 0) return null;
                const total = pieData.reduce((s, d) => s + d.value, 0);
                return (
                  <div key={key} style={{
                    borderRadius: 8,
                    border: "1px solid rgba(22,15,46,0.08)",
                    padding: "14px 16px 16px",
                  }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700, textTransform: "uppercase" as const,
                      letterSpacing: "0.1em", color: ROSE, marginBottom: 2,
                    }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 13, color: DARK, marginBottom: 8 }}>
                      {sub} · {total} mentions
                    </p>
                    <p style={{ fontSize: 13, color: DARK, lineHeight: 1.5, marginBottom: 10 }}>
                      {description}
                    </p>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          labelLine={false}
                          label={((props: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
                            const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
                            if (percent < 0.04) return <text />;
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          }) as any}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={entry.name} fill={pieColor(entry.name, index)} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: unknown) => {
                            const v = value as number;
                            return [`${((v / total) * 100).toFixed(1)}%`];
                          }}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid rgba(22,15,46,0.10)",
                            fontSize: 14,
                            boxShadow: "0 4px 12px rgba(22,15,46,0.10)",
                            color: DARK,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                      {pieData.map((entry, index) => (
                        <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{
                            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                            background: pieColor(entry.name, index),
                          }} />
                          <span style={{ fontSize: 13, color: DARK, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                            {displayName(entry.name)}
                          </span>
                          <span style={{ fontSize: 13, color: DARK, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                            {((entry.value / total) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Row 4: Product Feature Comparison */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(22,15,46,0.07)",
          display: "flex", alignItems: "baseline", gap: 12,
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
            Product Feature Comparison
          </h3>
          <span style={{ fontSize: 14, color: DARK }}>
            Score out of 100 · top 2–3 competitors per feature
          </span>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 28 }}>
          {FEATURE_COMPARISON.map(({ bucket, features }) => (
            <div key={bucket}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, textTransform: "uppercase" as const,
                  letterSpacing: "0.10em", color: ROSE,
                  background: "rgba(59,77,190,0.08)",
                  borderRadius: 999, padding: "4px 12px",
                }}>
                  {bucket}
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(22,15,46,0.07)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {features.map(f => (
                  <FeatureCard key={f.label} feature={f} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 5: Technical & Operational Intelligence */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(22,15,46,0.07)",
          display: "flex", alignItems: "baseline", gap: 12,
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
            Technical &amp; Operational Intelligence
          </h3>
          <span style={{ fontSize: 14, color: DARK }}>
            Score out of 100
          </span>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 28 }}>
          {TECH_DIMENSIONS.map(({ bucket, features }) => (
            <div key={bucket}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, textTransform: "uppercase" as const,
                  letterSpacing: "0.10em", color: ROSE,
                  background: "rgba(59,77,190,0.08)",
                  borderRadius: 999, padding: "4px 12px",
                }}>
                  {bucket}
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(22,15,46,0.07)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {features.map(f => (
                  <FeatureCard key={f.label} feature={f} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 24px 14px", borderTop: "1px solid rgba(22,15,46,0.05)", display: "flex", gap: 20, flexWrap: "wrap" as const }}>
          <span style={{ fontSize: 12, color: DARK, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ padding: "1px 5px", borderRadius: 999, background: "rgba(100,116,139,0.10)", color: "#475569", fontWeight: 700, fontSize: 9 }}>limited docs</span>
            SkinAdvisor: limited public documentation; scores reflect best available sources only.
          </span>
        </div>
      </div>

      {/* Row 7: Brand Sentiment */}
      {sentimentData.length > 0 && (
        <div style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(22,15,46,0.07)",
            display: "flex", alignItems: "baseline", gap: 12,
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
              Brand Sentiment
            </h3>
            <span style={{ fontSize: 14, color: DARK }}>AI model perception</span>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: 15, color: DARK, marginBottom: 20, lineHeight: 1.6, maxWidth: 680 }}>
              How positively or negatively do AI models describe each brand when asked about it directly? This tracks the tone of AI-generated responses (positive, neutral, or negative) to show how each brand is perceived in the AI layer, separate from what real users think.
            </p>
            {/* Legend */}
            <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
              {([
                { label: "Positive", color: "#059669" },
                { label: "Neutral",  color: "#D97706" },
                { label: "Negative", color: "#DC2626" },
              ] as const).map(({ label, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0, display: "inline-block" }} />
                  <span style={{ fontSize: 14, color: DARK, fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
            {/* Per-brand rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {sentimentData.map((row) => {
                const posCount = Math.round(row.positive_pct / 100 * row.total_responses);
                const negCount = Math.round(row.negative_pct / 100 * row.total_responses);
                const neuCount = row.total_responses - posCount - negCount;
                const accentColor = brandBarColor(row.brand);
                return (
                  <div key={row.brand} style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
                    <div style={{ width: 3, borderRadius: 999, background: accentColor, alignSelf: "stretch", flexShrink: 0, marginRight: 16 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: accentColor, minWidth: 80, flexShrink: 0 }}>
                          {row.brand}
                        </span>
                        <div style={{ flex: 1, height: 20, borderRadius: 4, overflow: "hidden", display: "flex", minWidth: 0 }}>
                          {row.positive_pct > 0 && (
                            <div style={{ width: `${row.positive_pct}%`, background: "#059669", flexShrink: 0 }} />
                          )}
                          {row.neutral_pct > 0 && (
                            <div style={{ width: `${row.neutral_pct}%`, background: "#D97706", flexShrink: 0 }} />
                          )}
                          {row.negative_pct > 0 && (
                            <div style={{ width: `${row.negative_pct}%`, background: "#DC2626", flexShrink: 0 }} />
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#059669", fontVariantNumeric: "tabular-nums", minWidth: 16, textAlign: "right" as const }}>{posCount}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#D97706", fontVariantNumeric: "tabular-nums", minWidth: 16, textAlign: "right" as const }}>{neuCount}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#DC2626", fontVariantNumeric: "tabular-nums", minWidth: 16, textAlign: "right" as const }}>{negCount}</span>
                        </div>
                      </div>
                      {row.top_tags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                          {row.top_tags.map(({ tag, shared }) => (
                            <span key={tag} style={{
                              fontSize: 13, fontWeight: 500,
                              padding: "3px 10px", borderRadius: 999,
                              background: shared ? "rgba(22,15,46,0.04)" : "rgba(59,77,190,0.06)",
                              border: `1px solid ${shared ? "rgba(22,15,46,0.10)" : "rgba(59,77,190,0.18)"}`,
                              color: shared ? DARK : ROSE,
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ marginTop: 16, fontSize: 13, color: DARK, lineHeight: 1.5 }}>
              Tags in <span style={{ color: ROSE, fontWeight: 600 }}>blue</span> are unique to this brand.
            </p>
          </div>
        </div>
      )}

      {/* Row 8: Product Feature Opportunity */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(22,15,46,0.07), 0 1px 2px rgba(22,15,46,0.04)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(22,15,46,0.07)", display: "flex", alignItems: "baseline", gap: 12 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, letterSpacing: "-0.01em" }}>
            Product Feature Opportunity
          </h3>
          <span style={{ fontSize: 14, color: DARK }}>standout feature per brand · Dewwie opportunity analysis</span>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
          <p style={{ fontSize: 15, color: DARK, lineHeight: 1.6, maxWidth: 680 }}>
            One standout or unique feature from each tracked brand — features that define how they compete and where the market is innovating.
          </p>

          {/* Brand highlights grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {BRAND_HIGHLIGHTS.map(({ brand, feature, detail }) => (
              <div key={brand} style={{
                borderRadius: 8,
                border: "1px solid rgba(22,15,46,0.08)",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: brandBarColor(brand) }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: brandBarColor(brand) }}>{brand}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: DARK, lineHeight: 1.35 }}>{feature}</p>
                <p style={{ fontSize: 13, color: DARK, lineHeight: 1.55 }}>{detail}</p>
              </div>
            ))}
          </div>

          {/* Dewwie opportunity conclusion */}
          <div style={{
            borderRadius: 10,
            background: "rgba(59,77,190,0.04)",
            border: "1px solid rgba(59,77,190,0.18)",
            padding: "20px 24px",
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: ROSE, marginBottom: 16 }}>
              Dewwie · Feature Opportunities
            </p>
            <p style={{ fontSize: 14, color: DARK, marginBottom: 20, lineHeight: 1.6 }}>
              Based on the competitive landscape, three feature directions would meaningfully extend Dewwie&apos;s existing strengths in personalised advice, routine auditing, and ingredient scanning.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {DEWWIE_OPPORTUNITIES.map(({ title, body, brand }, i) => (
                <div key={title} style={{ display: "flex", gap: 14 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 800, color: ROSE,
                    width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(59,77,190,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{title}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                        background: brandBarColor(brand), color: "#fff",
                        letterSpacing: "0.03em",
                      }}>
                        {brand} leads this
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: DARK, lineHeight: 1.65 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div style={{
        borderTop: "1px solid rgba(22,15,46,0.08)",
        paddingTop: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: DARK, marginBottom: 4 }}>
          Disclaimer &amp; Terms of Use
        </p>
        {[
          "This report is produced by Dewwie for internal strategic planning purposes only. It does not constitute legal, medical, financial, or professional advice of any kind.",
          "All feature scores, rankings, and assessments are based on publicly available information at the time of research and represent the author's independent evaluation. They are not official ratings, endorsements, or certifications of the brands, products, or technologies assessed.",
          "Brand names, product names, and trademarks referenced in this report are the property of their respective owners. Their inclusion does not imply affiliation with, sponsorship by, or endorsement from any referenced brand or company.",
          "Competitive intelligence data (including brand mention counts, share-of-voice figures, and AI model visibility scores) is derived from automated queries to publicly accessible large language model APIs. This data reflects model output at specific points in time and may not represent the current or future state of any brand's market position.",
          "Feature information may become outdated as brands update their products and services. Dewwie makes no warranty, express or implied, as to the accuracy, completeness, or timeliness of the information in this report.",
          "This report is intended for the private use of its recipient. Redistribution, publication, or commercial use of its contents without written permission is not permitted.",
          "Nothing in this report should be construed as a claim that any competitor's product is defective, unsafe, or unfit for its intended purpose. All comparative analysis is made in good faith on the basis of publicly available information.",
        ].map((line, i) => (
          <p key={i} style={{ fontSize: 12, color: DARK, lineHeight: 1.65, margin: 0 }}>{line}</p>
        ))}
      </div>
    </div>
  );
}
