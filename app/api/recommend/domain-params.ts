export type DomainParam = {
  l1: string;
  l2: string;
  plainEnglish: string;
};

export const DOMAIN_PARAMS: Record<string, DomainParam[]> = {
  "Customer Service": [
    { l1: "Conversation Automation", l2: "Intent classification accuracy", plainEnglish: "How well it understands what your customers are asking, even when phrased differently" },
    { l1: "Conversation Automation", l2: "Auto-response generation", plainEnglish: "How effectively it drafts or sends replies without a human needing to write them" },
    { l1: "Ticket Intelligence", l2: "Ticket routing precision", plainEnglish: "How accurately it sends each support request to the right team or agent" },
    { l1: "Knowledge Retrieval", l2: "Knowledge base grounding", plainEnglish: "How well it uses your existing help content to answer questions accurately" },
    { l1: "Sentiment & Emotion Detection", l2: "Tone adaptation", plainEnglish: "How well it adjusts its language based on whether a customer is frustrated, happy, or confused" },
    { l1: "Ticket Intelligence", l2: "Escalation prediction", plainEnglish: "How reliably it spots situations that need a human agent before the customer gets frustrated" },
    { l1: "Quality & Compliance", l2: "CSAT prediction", plainEnglish: "How accurately it predicts whether a customer will be satisfied with the resolution" },
    { l1: "Quality & Compliance", l2: "Compliance flagging", plainEnglish: "How well it catches responses that could violate regulations or company policy" },
  ],

  "Finance - Banking": [
    { l1: "Risk & Fraud Intelligence", l2: "Fraud detection precision", plainEnglish: "How accurately it identifies fraudulent transactions without blocking legitimate ones" },
    { l1: "Risk & Fraud Intelligence", l2: "Risk scoring methodology", plainEnglish: "How transparent and explainable its risk scores are for audit and compliance purposes" },
    { l1: "Loan & Underwriting Automation", l2: "Document extraction accuracy", plainEnglish: "How reliably it pulls key data from loan applications, IDs, and financial statements" },
    { l1: "Loan & Underwriting Automation", l2: "Underwriting decision transparency", plainEnglish: "How clearly it explains why a loan was approved or declined" },
    { l1: "Claims Processing", l2: "Claims triage automation", plainEnglish: "How quickly it categorises and routes incoming claims without manual effort" },
    { l1: "Customer Interaction & KYC", l2: "AML/KYC verification", plainEnglish: "How thoroughly it checks customer identity and flags anti-money-laundering risks" },
    { l1: "Regulatory Compliance", l2: "Regulatory audit trails", plainEnglish: "How well it maintains records that satisfy regulator inspection requirements" },
  ],

  "Finance - Loans & Insurance": [
    { l1: "Loan & Underwriting Automation", l2: "Document extraction accuracy", plainEnglish: "How reliably it pulls structured data from loan applications and supporting documents" },
    { l1: "Loan & Underwriting Automation", l2: "Underwriting decision transparency", plainEnglish: "How clearly the system can explain its approval or decline decision" },
    { l1: "Claims Processing", l2: "Claims triage automation", plainEnglish: "How quickly it categorises, prioritises, and routes incoming claims" },
    { l1: "Risk & Fraud Intelligence", l2: "Fraud detection precision", plainEnglish: "How accurately it spots fraudulent claims or applications" },
    { l1: "Risk & Fraud Intelligence", l2: "Risk scoring methodology", plainEnglish: "How explainable and auditable its risk scores are" },
    { l1: "Customer Interaction & KYC", l2: "AML/KYC verification", plainEnglish: "How thoroughly it verifies customer identity against regulatory requirements" },
    { l1: "Regulatory Compliance", l2: "Regulatory audit trails", plainEnglish: "How complete the audit trail is for compliance and reporting" },
  ],

  "Real Estate": [
    { l1: "Lead Intelligence & Qualification", l2: "Lead scoring accuracy", plainEnglish: "How well it predicts which leads are most likely to convert into deals" },
    { l1: "Lead Intelligence & Qualification", l2: "Intent detection", plainEnglish: "How accurately it identifies when someone is actively ready to buy or sell" },
    { l1: "Property Analysis & Valuation", l2: "AVM accuracy", plainEnglish: "How closely its automated property valuations match actual market prices" },
    { l1: "Property Analysis & Valuation", l2: "Comparable property matching", plainEnglish: "How well it finds truly similar properties for accurate price comparisons" },
    { l1: "Document & Workflow Automation", l2: "Contract generation", plainEnglish: "How quickly and accurately it drafts offers, contracts, and legal paperwork" },
    { l1: "Document & Workflow Automation", l2: "Transaction timeline automation", plainEnglish: "How well it tracks and nudges each step of a deal toward closing" },
    { l1: "Image/Visual Intelligence", l2: "Damage detection", plainEnglish: "How accurately it spots property defects or damage from photos" },
    { l1: "Market Forecasting", l2: "Comparable property matching", plainEnglish: "How well it uses local market data to forecast price trends" },
  ],

  "Marketing": [
    { l1: "Content Intelligence", l2: "Content quality scoring", plainEnglish: "How accurately it predicts whether content will perform well before you publish" },
    { l1: "Audience Segmentation", l2: "Persona clustering", plainEnglish: "How well it groups your audience into meaningful segments for targeted campaigns" },
    { l1: "Campaign Automation", l2: "Channel-level optimisation", plainEnglish: "How intelligently it adjusts spend and creative per channel based on performance" },
    { l1: "Creative Generation", l2: "Creative variation generation", plainEnglish: "How many quality ad or content variants it can produce automatically for A/B testing" },
    { l1: "Performance Analytics", l2: "Attribution modeling", plainEnglish: "How accurately it traces which marketing activity actually drove a conversion" },
    { l1: "Campaign Automation", l2: "Budget pacing intelligence", plainEnglish: "How well it spreads spend across a campaign to avoid over- or under-delivery" },
    { l1: "Brand Safety & Compliance", l2: "Brand guideline enforcement", plainEnglish: "How consistently it keeps all content within your tone, style, and legal requirements" },
    { l1: "Audience Segmentation", l2: "Lead scoring", plainEnglish: "How accurately it ranks leads by their likelihood to convert" },
    { l1: "Performance Analytics", l2: "Conversion prediction", plainEnglish: "How well it forecasts which leads or campaigns will result in a sale" },
  ],

  "Media & Entertainment": [
    { l1: "Content Production Automation", l2: "Script generation quality", plainEnglish: "How well it writes broadcast-ready scripts from briefs or raw notes" },
    { l1: "Editorial Intelligence", l2: "Scene/shot detection", plainEnglish: "How accurately it identifies and labels scenes, cuts, and key moments in video" },
    { l1: "Brand Safety & Compliance", l2: "Content moderation accuracy", plainEnglish: "How reliably it flags harmful, misleading, or policy-violating content before broadcast" },
    { l1: "Rights & Compliance", l2: "Rights metadata extraction", plainEnglish: "How well it reads and manages licensing, ownership, and usage rights from media assets" },
    { l1: "Audience Analytics", l2: "Audience retention prediction", plainEnglish: "How accurately it predicts where audiences will drop off or stay engaged" },
    { l1: "Distribution & Scheduling", l2: "Cross-platform scheduling", plainEnglish: "How intelligently it times content releases across platforms for maximum reach" },
    { l1: "Creative Enhancement", l2: "Video/audio enhancement", plainEnglish: "How effectively it improves visual quality, colour grading, or audio clarity" },
    { l1: "Multimedia Understanding", l2: "Captioning & transcription accuracy", plainEnglish: "How accurately it converts speech to text and adds timed captions" },
  ],
};

export function getDomainParams(domain: string): DomainParam[] {
  return DOMAIN_PARAMS[domain] ?? DOMAIN_PARAMS["Customer Service"];
}
