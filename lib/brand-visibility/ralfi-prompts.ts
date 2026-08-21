// Ralfi pipeline — Insurance Broker AI Agents
// Collection system prompt + 39 prompts (9 overall + 30 SoV across 6 clusters).

export const RALFI_COLLECTION_SYSTEM_PROMPT =
  'You are a market research assistant. Return ONLY valid JSON in this exact format: {"brands": ["Brand A", "Brand B", ...]}' +
  "\n\nList every brand name that would naturally appear in your response, in the order they would appear. Include all distinct brand names — do not filter or pre-select." +
  "\n\nIMPORTANT: Only include brands that are AI agents or AI agent platforms specifically built for insurance brokers or insurance agencies. Do NOT include: traditional agency management systems or broking platforms (e.g. Applied Epic, Vertafore, EZLynx, AMS360, NowCerts, HawkSoft, Zywave unless it has a specific AI agent feature); insurance carriers or insurers (e.g. Allianz, QBE, CGU, Aon, Zurich, Suncorp); generic CRM platforms (e.g. Salesforce, HubSpot, Zoho); general-purpose AI assistants (e.g. ChatGPT, Microsoft Copilot, Google Gemini); or carrier-side underwriting and claims systems that are not marketed to brokers as AI agents." +
  "\n\nNo other text, no markdown formatting, no explanation — just the JSON object.";

export interface RalfiPrompt {
  id:  number;
  tag: string;
  text: string;
}

export const RALFI_PROMPTS: RalfiPrompt[] = [

  // ── Overall Brand Mentions · ralfi-overall (9 prompts) ───────────────────────
  { id: 1,  tag: "ralfi-overall", text: "What are the best AI agents for insurance brokers?" },
  { id: 2,  tag: "ralfi-overall", text: "What AI agents do insurance brokers use to manage client renewals?" },
  { id: 3,  tag: "ralfi-overall", text: "Which AI agents are purpose-built for insurance brokerages versus generic AI agents?" },
  { id: 4,  tag: "ralfi-overall", text: "What AI agents help insurance brokers with compliance and codes of practice?" },
  { id: 5,  tag: "ralfi-overall", text: "Which AI agents automate the workflow between insurance brokers, clients and insurers?" },
  { id: 6,  tag: "ralfi-overall", text: "What AI agents are insurance brokers adopting in 2025?" },
  { id: 7,  tag: "ralfi-overall", text: "Which AI agents help insurance brokers reduce admin time on renewals?" },
  { id: 8,  tag: "ralfi-overall", text: "What AI agents do commercial insurance brokers use for follow-ups and client communication?" },
  { id: 9,  tag: "ralfi-overall", text: "Which AI agent companies are building specifically for the insurance broker market?" },

  // ── Cluster 1 — Renewal Management · ralfi-renewal (5 prompts) ──────────────
  { id: 10, tag: "ralfi-renewal", text: "What AI agents help insurance brokers manage policy renewals?" },
  { id: 11, tag: "ralfi-renewal", text: "Which AI agents automate renewal follow-ups for insurance brokers?" },
  { id: 12, tag: "ralfi-renewal", text: "What AI agents keep insurance renewals from slipping through the cracks?" },
  { id: 13, tag: "ralfi-renewal", text: "Which AI agents track renewal timelines and chase insurers or clients?" },
  { id: 14, tag: "ralfi-renewal", text: "What AI agents help insurance brokers meet renewal deadlines?" },

  // ── Cluster 2 — Document Processing · ralfi-documents (5 prompts) ───────────
  { id: 15, tag: "ralfi-documents", text: "What AI agents do insurance brokers use to process policy documents?" },
  { id: 16, tag: "ralfi-documents", text: "Which AI agents extract data from insurance submissions and SOVs?" },
  { id: 17, tag: "ralfi-documents", text: "What AI agents automate document intake for insurance brokerages?" },
  { id: 18, tag: "ralfi-documents", text: "Which AI agents read and structure unstructured insurance documents?" },
  { id: 19, tag: "ralfi-documents", text: "What AI agents handle policy PDF extraction and data entry for brokers?" },

  // ── Cluster 3 — Risk & Submission Support · ralfi-risk (5 prompts) ──────────
  { id: 20, tag: "ralfi-risk", text: "What AI agents help insurance brokers prepare risk submissions for insurers?" },
  { id: 21, tag: "ralfi-risk", text: "Which AI agents help brokers collect and organise client risk information?" },
  { id: 22, tag: "ralfi-risk", text: "What AI agents help insurance brokers package submissions to get better insurer terms?" },
  { id: 23, tag: "ralfi-risk", text: "Which AI agents assist brokers in gathering the risk data insurers need to quote?" },
  { id: 24, tag: "ralfi-risk", text: "What AI agents help insurance brokers assess and present client risk profiles?" },

  // ── Cluster 4 — Claims Advocacy & Tracking · ralfi-claims (5 prompts) ───────
  { id: 25, tag: "ralfi-claims", text: "What AI agents help insurance brokers advocate for clients through the claims process?" },
  { id: 26, tag: "ralfi-claims", text: "Which AI agents help brokers track claim progress and follow up with insurers?" },
  { id: 27, tag: "ralfi-claims", text: "What AI agents keep insurance brokers informed on where a client claim stands?" },
  { id: 28, tag: "ralfi-claims", text: "Which AI agents help brokers chase insurers on outstanding or delayed claims?" },
  { id: 29, tag: "ralfi-claims", text: "What AI agents help insurance brokers support clients from claim lodgement to settlement?" },

  // ── Cluster 5 — Client Communication & Servicing · ralfi-comms (5 prompts) ──
  { id: 30, tag: "ralfi-comms", text: "What AI agents help insurance brokers communicate with clients?" },
  { id: 31, tag: "ralfi-comms", text: "Which AI agents give insurance brokers a client-facing assistant?" },
  { id: 32, tag: "ralfi-comms", text: "What AI agents help brokers answer client questions and service policies?" },
  { id: 33, tag: "ralfi-comms", text: "Which AI agents handle insurance broker client onboarding and FAQs?" },
  { id: 34, tag: "ralfi-comms", text: "What AI agents improve the client experience for insurance brokerage customers?" },

  // ── Cluster 6 — Compliance & Audit Trail · ralfi-compliance (5 prompts) ─────
  { id: 35, tag: "ralfi-compliance", text: "What AI agents help insurance brokers maintain compliance records?" },
  { id: 36, tag: "ralfi-compliance", text: "Which AI agents automatically log every client and insurer contact for brokers?" },
  { id: 37, tag: "ralfi-compliance", text: "What AI agents help insurance brokers comply with industry codes of practice?" },
  { id: 38, tag: "ralfi-compliance", text: "Which AI agents produce timestamped audit trails for insurance renewal workflows?" },
  { id: 39, tag: "ralfi-compliance", text: "What AI agents help insurance brokers export compliance records and renewal histories?" },
];
