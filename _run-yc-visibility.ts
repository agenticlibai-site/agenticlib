#!/usr/bin/env npx tsx
/**
 * YC AI Agent LLM Visibility Tester
 * Usage:
 *   1. Create yc-companies.csv with columns: name,description,batch,tags
 *      OR name,description  (minimum)
 *   2. npx tsx _run-yc-visibility.ts
 *   3. Review cluster breakdown, type "go" to start API testing
 *
 * Output:
 *   yc-visibility-results.csv  — ranked by mention_rate ASC (highest outreach priority first)
 *   yc-visibility-raw.json     — full LLM responses for quote extraction
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Types ─────────────────────────────────────────────────────────────────────

interface Company {
  name:        string;
  description: string;
  batch:       string;
  tags:        string;
}

interface ClusteredCompany extends Company {
  cluster:  string;
  excluded: boolean;
  reason:   string;  // "active", "infra/dev-tooling", "niche — no comparison set"
}

interface QueryResult {
  company:    string;
  cluster:    string;
  query:      string;
  model:      string;
  mentioned:  boolean;
  response:   string;
}

interface CompanyResult {
  company_name:             string;
  cluster:                  string;
  mention_rate:             number;
  queries_tested:           number;
  mentioned_count:          number;
  competitors_that_appeared: string[];
  named_recall_check:       string;
}

// ── Keyword maps ───────────────────────────────────────────────────────────────

// One-match = immediately excluded as infra/dev-tooling
const STRONG_INFRA_PHRASES = [
  "control plane for ai agent", "phone numbers for ai agent", "debit cards for ai agent",
  "spend control layer for ai agent", "cloud computers for ai agent",
  "file system for agent", "infra for enterprise voice agent",
  "identity gateway for ai agent", "authorization layer for ai agent",
  "staging environment for enterprise ai agent", "sandboxes for ai agent",
  "monitoring and learning layer for long-running agent",
  "runtime layer that makes ai agent", "translation layer between ai agent",
  "continual learning for ai agent", "continual learning for agent",
  "improvement loop for ai agent", "guardrails to validate your agent",
  "train eval and build autonomous agent", "simulation environments to train",
  "reasoning and verification infra", "interpretability and reasoning infra",
  "aws for ai agent", "agent-native aws", "sentry for ai agent", "datadog for agent",
  "code review platform for human and agent", "platform for software factor",
  "self updating wiki for your coding agent", "test your app with ai catch bug",
  "ai for ai infrastructure", "marketplace for ai agents to hire human",
  "agentrel", "devrel for agent", "open weight model", "inference for embedded compute",
  "product analytics for teams building conversational agent",
  "help software companies get discovered and used by ai agent",
  "market to ai agent", "high performance file system", "payments infrastructure for voice agent",
  "agentic coding app", "agent-native messaging", "firmware simulation",
];

// Per-company manual cluster override — use when keyword heuristics misfire
const MANUAL_CLUSTER: Record<string, string> = {
  // Clear infra that keyword scoring misses
  "Agnost AI":       "infra", "BentoLabs AI":    "infra", "Chronicle Labs":  "infra",
  "Dialogus":        "infra", "Envariant":       "infra", "Experiential Labs":"infra",
  "Moda":            "infra", "Superset":        "infra", "Kimpton AI":      "infra",
  "Manicule":        "infra", "Scope":           "infra", "Unusual":         "infra",
  "RentAHuman":      "infra", "Assemble":        "infra", "Autosana":        "infra",
  "Archal":          "infra", "Armature":        "infra", "Ashr":            "infra",
  "Approxima":       "infra", "Callab AI":       "infra", "Captain":         "infra",
  "Clarm":           "infra", "Corelayer":       "infra", "Crustdata":       "infra",
  "Decawork":        "infra", "Deeptrace":       "infra", "Docket":          "infra",
  "Egoist Machines": "infra", "Fabraix":         "infra", "Glen":            "infra",
  "Humwork":         "infra", "IncidentFox":     "infra", "Inkbox":          "infra",
  "Kestrel AI":      "infra", "Keyframe Labs":   "infra", "Linzumi":         "infra",
  "Maven":           "infra", "Memory Store":    "infra", "Mireye":          "infra",
  "OneGrep":         "infra", "Ontora":          "infra", "Ooak Data":       "infra",
  "Overshoot":       "infra", "Sila":            "infra", "Simantic":        "infra",
  "Syntropy":        "infra", "Talking Computers":"infra","The Context Company":"infra",
  "Tracer":          "infra", "Truffle AI":      "infra", "Tusk":            "infra",
  "VOYGR":           "infra", "Waddle Labs":     "infra", "Wato":            "infra",
  "Wordware":        "infra", "Revnu":           "infra", "Gigacatalyst":    "infra",
  "AutoSitu":        "infra", "Cascade":         "infra",
  // Wrong cluster → correct cluster
  "Conduit":         "hospitality-travel", "Lance":          "hospitality-travel",
  "Novoflow":        "healthcare",         "Rovi Health":    "healthcare",
  "Mango Medical":   "healthcare",         "Egress Health":  "healthcare",
  "Klarify":         "healthcare",         "Locata":         "healthcare",
  "Tepali":          "healthcare",         "Trapeze":        "healthcare",
  "Simplex":         "healthcare",         "Dodo":           "healthcare",
  "TakeCareOS":      "healthcare",         "Layers":         "healthcare",
  "Remedy":          "healthcare",         "Novoflow":       "healthcare",
  "Wideframe":       "marketing-content",  "Cardboard":      "marketing-content",
  "Overlap":         "marketing-content",  "Pluto":          "marketing-content",
  "Rational":        "accounting-finance", "Arden":          "accounting-finance",
  "Asendia AI":      "recruiting-hr",      "Saffron":        "recruiting-hr",
  "Outship":         "recruiting-hr",      "Amulet":         "infra",
  // New clusters
  "Altur":           "fintech-finance", "Proximitty":  "fintech-finance",
  "PathPilot":       "fintech-finance", "Zolvo":       "fintech-finance",
  "Veritus":         "fintech-finance", "Fenrock AI":  "fintech-finance",
  "o11":             "fintech-finance", "Kenley":      "fintech-finance",
  "LATO":            "fintech-finance", "WithAI":      "fintech-finance",
  "Arva AI":         "fintech-finance", "Domu Technology Inc.": "fintech-finance",
  "MouseCat":        "fintech-finance", "Soria":       "fintech-finance",
  "Collar":          "fintech-finance", "Clarum":      "fintech-finance",
  "Cohesion":        "fintech-finance", "Revi":        "fintech-finance",
  "Alt-X":           "fintech-finance", "Pearson Labs":"fintech-finance",
  "Avent":           "supply-chain-logistics", "Soff":        "supply-chain-logistics",
  "Whitespace":      "supply-chain-logistics", "Comena":      "supply-chain-logistics",
  "Prototyping.io":  "supply-chain-logistics", "Dayjob":      "supply-chain-logistics",
  "CellType":        "pharma-biotech",   "Enjamb Labs": "pharma-biotech",
  "Ritivel":         "pharma-biotech",
  "Fed10":           "government",       "GovGuard":    "government",
  "Stratum Industries": "government",
  "Andco":           "legal",            "Vesence":     "legal",
  "Payna":           "legal",
  "OpenFunnel":      "sales-gtm",        "Primer":      "sales-gtm",
  "Karumi":          "sales-gtm",
  "InspectMind AI":  "construction-field-service",
  "Macadamia":       "construction-field-service",
  "NOSO LABS":       "construction-field-service",
  "Terminal Use":    "infra",
  "Supafax":         "uncategorised",    // generic productivity, no clear vertical
  // Uncategorised that are actually infra
  "Relari":          "infra", "Stage":           "infra", "TrustAI":         "infra",
  // Wrong cluster due to erp⊂enterprise substring bug
  "Inth":            "security-compliance",
  "qomplement":      "supply-chain-logistics",
  "LedgerUp":        "accounting-finance",
  "Userlens":        "customer-support",  // account expansion = CS not accounting
  "Agentin AI":      "uncategorised",     // generic enterprise automation, no clear vertical
  "Rex":             "accounting-finance", // O2C / AR / enterprise collections = finance back-office, not ecommerce
};

const INFRA_SIGNALS = [
  "developer", "dev tool", "sdk", "api layer", "framework", "infrastructure",
  "platform for building", "llm infrastructure", "model training", "fine-tun",
  "orchestration", "agent framework", "deployment", "kubernetes",
  "devops", "testing framework", "ci/cd",
  "coding agent", "code generation", "engineer productivity", "copilot for",
  "data pipeline", "vector database", "embedding", "retrieval", "rag pipeline",
  "control plane", "memory layer", "context window", "token", "prompt management",
  "model serving", "gpu", "mlops", "data labeling", "annotation",
  "synthetic data", "evaluation framework", "evals", "ai safety layer",
  "open source", "self-hosted", "on-premise llm", "multi-agent framework",
  "agent runtime", "workflow engine", "tool calling", "function calling",
  "auth for ai", "identity for agents", "mcp server", "agent protocol",
];

const CLUSTER_KEYWORDS: Record<string, string[]> = {
  "sales-gtm": [
    "sales", "sdr", "bdr", "pipeline", "prospecting", "outbound", "revenue",
    "account executive", "cold email", "cold call", "crm", "deal", "closing",
    "lead generation", "lead qualify", "sales engagement", "sales enablement",
    "sales call", "sales coaching", "sales intelligence", "gtm", "go-to-market",
    "b2b sales", "enterprise sales", "sales automation", "sales rep",
  ],
  "customer-support": [
    "customer support", "helpdesk", "help desk", "ticket", "customer service",
    "live chat", "faq", "resolution", "support agent", "contact center",
    "call center", "customer success", "churn", "retention", "cx", "after-sales",
    "returns", "refund", "complaints", "support workflow",
  ],
  "recruiting-hr": [
    "recruit", "hiring", "talent", "candidate", "hr ", "human resource",
    "workforce", "payroll", "onboarding", "job description", "interview",
    "screening", "applicant", "ats", "background check", "headhunting",
    "talent acquisition", "people ops", "performance review", "employee",
    "staffing",
  ],
  "healthcare": [
    "medical", "health", "clinical", "patient", "doctor", "pharmacy",
    "hospital", "therap", "mental health", "diagnostic", "radiology",
    "prior auth", "ehr", "emr", "telehealth",
    "care coordination", "nursing", "dentist", "dental", "physician",
    "clinic", "medspa", "med spa", "payor", "primary care",
    "long term care", "home care", "home health", "behavioral health",
    "optometry", "orthopedic",
  ],
  "legal": [
    "legal", "contract review", "law firm", "attorney", "paralegal",
    "due diligence", "litigation", "intellectual property",
    "legal research", "nda", "gdpr",
    "privacy compliance", "legal document", "immigration law",
    "personal injury", "plaintiff", "ip enforcement",
  ],
  "accounting-finance": [
    "accounting", "tax", "bookkeeping", "invoice", "accounts payable",
    "accounts receivable", "audit", "cfo",
    "financial planning", "budgeting", "cash flow", "reconciliation",
    " erp ", "erp for", "agentic erp", "quickbooks", "xero", "financial report", "spend management",
    "revenue cycle", "billing",
  ],
  "fintech-finance": [
    "bank", "banking", "lend", "loan", "consumer lend", "commercial lend",
    "debt collect", "collections", "aml", "kyc", "kyb",
    "private market", "institutional investor", "asset manager",
    "m&a", "deal origin", "financial advisory", "financial service",
    "financial firm", "trading", "securities", "investment research",
    "fraud investigat", "payment company", "fintech",
  ],
  "real-estate": [
    "real estate", "property", "mortgage", "housing", "rental", "landlord",
    "tenant", "lease", "proptech", "apartment", "commercial property",
    "property management", "real estate agent", "listing",
  ],
  "insurance": [
    "insurance", "claim", "underwriting", "policy", "risk assessment",
    "insurer", "actuarial", "broker", "coverage", "insurtech",
  ],
  "marketing-content": [
    "marketing", "content creation", "seo", "ads", "social media", "brand",
    "copywriting", "advertising", "campaign", "influencer", "email marketing",
    "marketing automation", "demand generation", "martech", "creative",
    "video creation", "video editor", "blog", "newsletter", "video agent",
  ],
  "ecommerce-retail": [
    "e-commerce", "ecommerce", "retail", "shopping", "inventory", "order",
    "fulfillment", "product listing", "dropshipping", "d2c",
    "direct to consumer", "merchant", "shopify", "amazon seller",
  ],
  "supply-chain-logistics": [
    "supply chain", "logistics", "procurement", "warehouse", "freight",
    "shipping", "last mile", "fleet", "trucking", "short haul",
    "import", "export", "customs", "cargo", "inventory management",
    "distributor", "wholesale", "industrial commerce", "manufacturer",
    "trade compliance", "tariff",
  ],
  "hospitality-travel": [
    "hospitality", "hotel", "restaurant", "travel", "booking", "reservation",
    "vacation", "tour", "airline", "food delivery", "event planning",
    "back-of-house", "back of house",
  ],
  "pharma-biotech": [
    "drug", "pharma", "pharmaceutical", "biotech", "life science",
    "clinical trial", "fda approval", "fda", "biology", "molecule",
    "compound", "therapeutics", "genomic", "drug discovery",
    "life-science", "drug team",
  ],
  "government": [
    "government", "gov ", "foia", "federal", "public sector", "municipal",
    "government affair", "government workflow", "government backlog",
  ],
  "construction-field-service": [
    "construction", "contractor", "construction drawing", "field service", "trade",
    "hvac", "plumbing", "electrical", "inspection", "project management site",
    "job site", "maintenance", "facility",
  ],
  "security-compliance": [
    "cybersecurity", "security", "threat detection", "identity", "access",
    "soc", "vulnerability", "pen test", "zero trust", "data protection",
  ],
  "data-analytics": [
    "data analytics", "business intelligence", "bi tool", "dashboard",
    "reporting", "insights", "data platform", "sql agent", "data pipeline",
    "data engineer", "data ops",
  ],
};

// ── Step 1: Categorise and cluster ────────────────────────────────────────────

function scoreInfra(company: Company): number {
  const text = `${company.name} ${company.description} ${company.tags}`.toLowerCase();
  return INFRA_SIGNALS.filter(s => text.includes(s)).length;
}

function scoreCluster(company: Company, clusterKeywords: string[]): number {
  const text = `${company.description} ${company.tags}`.toLowerCase();
  return clusterKeywords.filter(k => text.includes(k)).length;
}

function categorise(companies: Company[]): ClusteredCompany[] {
  return companies.map(c => {
    // 1. Manual overrides win — handle both "infra" and specific cluster
    const manual = MANUAL_CLUSTER[c.name];
    if (manual) {
      if (manual === "infra") {
        return { ...c, cluster: "infra/dev-tooling", excluded: true, reason: "infra/dev-tooling" };
      }
      if (manual === "uncategorised") {
        return { ...c, cluster: "uncategorised", excluded: true, reason: "niche — no comparison set" };
      }
      return { ...c, cluster: manual, excluded: false, reason: "active" };
    }

    const text = `${c.name} ${c.description} ${c.tags}`.toLowerCase();

    // 2. Strong-phrase infra detection — one match = excluded
    if (STRONG_INFRA_PHRASES.some(p => text.includes(p))) {
      return { ...c, cluster: "infra/dev-tooling", excluded: true, reason: "infra/dev-tooling" };
    }

    // 3. Regular infra signal scoring
    const infraScore = scoreInfra(c);
    if (infraScore >= 2) {
      return { ...c, cluster: "infra/dev-tooling", excluded: true, reason: "infra/dev-tooling" };
    }

    // 4. Vertical cluster matching
    let bestCluster = "";
    let bestScore   = 0;
    for (const [cluster, keywords] of Object.entries(CLUSTER_KEYWORDS)) {
      const s = scoreCluster(c, keywords);
      if (s > bestScore) { bestScore = s; bestCluster = cluster; }
    }

    if (bestScore === 0) {
      return { ...c, cluster: "uncategorised", excluded: true, reason: "niche — no comparison set" };
    }

    return { ...c, cluster: bestCluster, excluded: false, reason: "active" };
  });
}

// ── Step 2: Query generation ───────────────────────────────────────────────────

const QUERY_TEMPLATES: Record<string, string[]> = {
  "sales-gtm": [
    "best AI agent for B2B outbound sales in 2026",
    "AI tool that automates SDR prospecting and email sequences",
    "top AI agents for sales pipeline management",
    "alternatives to Outreach or Salesloft for AI-native sales",
    "AI that writes and sends cold emails on behalf of sales reps",
  ],
  "customer-support": [
    "best AI agent for automating customer support tickets",
    "AI tool that resolves customer service queries without human handoff",
    "top AI agents for helpdesk automation 2026",
    "alternatives to Intercom or Zendesk AI for customer support",
    "AI that handles live chat and support emails automatically",
  ],
  "recruiting-hr": [
    "best AI agent for automating recruiting and candidate screening",
    "AI tool that shortlists job applicants and schedules interviews",
    "top AI agents for HR and talent acquisition 2026",
    "alternatives to Workday or Greenhouse for AI-powered hiring",
    "AI that writes job descriptions and screens resumes automatically",
  ],
  "healthcare": [
    "best AI agent for clinical documentation and prior authorizations",
    "AI tool that automates medical coding and patient intake",
    "top AI agents for healthcare administrative tasks 2026",
    "AI that handles EHR data entry and care coordination",
    "AI medical assistant for doctor-patient workflows",
  ],
  "legal": [
    "best AI agent for contract review and legal document analysis",
    "AI tool that automates legal research and due diligence",
    "top AI agents for law firms 2026",
    "alternatives to Harvey AI for legal document automation",
    "AI that drafts NDAs and reviews contract terms automatically",
  ],
  "accounting-finance": [
    "best AI agent for accounts receivable automation and order-to-cash operations",
    "AI tool that automates enterprise AR collections invoice submission and dispute resolution",
    "top AI agents for accounting firms bookkeeping and tax preparation 2026",
    "AI that handles month-end close reconciliation and financial reporting automatically",
    "AI assistant for CFOs and finance teams to automate audit payroll and cash application",
  ],
  "real-estate": [
    "best AI agent for real estate agents and property management",
    "AI tool that automates property listings and client follow-up",
    "top AI agents for real estate 2026",
    "AI that qualifies leads and books property viewings automatically",
    "AI assistant for mortgage brokers and real estate professionals",
  ],
  "insurance": [
    "best AI agent for insurance claims processing",
    "AI tool that automates underwriting and policy management",
    "top AI agents for insurance companies 2026",
    "AI that handles first notice of loss and claims triage automatically",
    "AI assistant for insurance brokers and risk assessment",
  ],
  "marketing-content": [
    "best AI agent for content creation and marketing automation",
    "AI tool that writes blog posts SEO articles and social media content",
    "top AI agents for marketing teams 2026",
    "alternatives to Jasper or Copy.ai for AI marketing content",
    "AI that runs social media accounts and creates ad copy automatically",
  ],
  "ecommerce-retail": [
    "best AI agent for e-commerce store automation",
    "AI tool that manages product listings and customer queries for online stores",
    "top AI agents for e-commerce and retail 2026",
    "AI that automates order management and product recommendations",
    "AI assistant for Shopify and Amazon sellers",
  ],
  "supply-chain-logistics": [
    "best AI agent for supply chain and logistics automation",
    "AI tool that optimises freight routing and procurement",
    "top AI agents for logistics companies 2026",
    "AI that automates warehouse operations and inventory management",
    "AI assistant for freight brokers and supply chain managers",
  ],
  "hospitality-travel": [
    "best AI agent for hotels and restaurant booking management",
    "AI tool that automates reservations and guest communications",
    "top AI agents for hospitality industry 2026",
    "AI that handles restaurant orders and hotel front desk queries",
    "AI assistant for travel booking and event planning",
  ],
  "education": [
    "best AI agent for tutoring and personalised learning",
    "AI tool that automates student assessments and course creation",
    "top AI agents for education and edtech 2026",
    "alternatives to traditional LMS for AI-native learning",
    "AI that teaches students and grades assignments automatically",
  ],
  "construction-field-service": [
    "best AI agent for construction and field service companies",
    "AI tool that automates quoting invoicing and job scheduling for tradespeople",
    "top AI agents for contractors and field service businesses 2026",
    "AI that handles compliance documentation and job site reporting",
    "AI assistant for construction project management and trades",
  ],
  "security-compliance": [
    "best AI agent for cybersecurity threat detection and response",
    "AI tool that automates security compliance and audit preparation",
    "top AI agents for enterprise security teams 2026",
    "AI that monitors for threats and remediates vulnerabilities automatically",
    "AI assistant for SOC teams and security operations",
  ],
  "data-analytics": [
    "best AI agent for data analysis and business intelligence",
    "AI tool that answers business questions by querying data automatically",
    "top AI agents for analytics and reporting 2026",
    "alternatives to Tableau or Power BI for AI-native analytics",
    "AI that writes SQL queries and generates dashboards from natural language",
  ],
  "fintech-finance": [
    "best AI agent for banking and financial services operations 2026",
    "AI tool that automates AML KYC compliance checks for financial institutions",
    "top AI agents for debt collection and accounts receivable 2026",
    "AI agent for commercial lending and loan origination",
    "AI that handles financial due diligence and investment research automatically",
  ],
  "pharma-biotech": [
    "best AI agent for drug discovery and pharmaceutical research 2026",
    "AI tool that automates clinical trial documentation and FDA submissions",
    "top AI agents for biotech and life sciences companies 2026",
    "AI that accelerates drug development from discovery to approval",
    "AI assistant for pharmaceutical regulatory affairs and documentation",
  ],
  "government": [
    "best AI agent for government and public sector workflow automation 2026",
    "AI tool that automates government administrative processes and backlogs",
    "top AI agents for government affairs and regulatory filings 2026",
    "AI that handles FOIA requests and government document processing",
    "AI assistant for government compliance and public sector operations",
  ],
};

function getQueries(cluster: string): string[] {
  return QUERY_TEMPLATES[cluster] ?? [
    `best AI agent for ${cluster.replace(/-/g, " ")} in 2026`,
    `AI tool that automates ${cluster.replace(/-/g, " ")} tasks`,
    `top AI agents for ${cluster.replace(/-/g, " ")}`,
    `AI assistant for ${cluster.replace(/-/g, " ")} professionals`,
  ];
}

// ── Step 3: LLM calls ──────────────────────────────────────────────────────────

async function callClaude(prompt: string): Promise<string> {
  try {
    const res = await anthropic.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages:   [{ role: "user", content: prompt }],
    });
    const block = res.content.find(b => b.type === "text");
    return block?.type === "text" ? block.text : "";
  } catch (e) {
    console.error(`  [claude error] ${e instanceof Error ? e.message : e}`);
    return "";
  }
}

async function callGPT(prompt: string): Promise<string> {
  try {
    const res = await openai.chat.completions.create({
      model:      "gpt-4o-mini",
      max_tokens: 1024,
      messages:   [{ role: "user", content: prompt }],
    });
    return res.choices[0]?.message?.content ?? "";
  } catch (e) {
    console.error(`  [gpt error] ${e instanceof Error ? e.message : e}`);
    return "";
  }
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function isMentioned(companyName: string, response: string): boolean {
  const name = companyName.toLowerCase();
  const text = response.toLowerCase();
  // Exact name match, or name without common suffixes
  const bare = name.replace(/\.(ai|io|com|co)$/, "").trim();
  return text.includes(name) || (bare.length > 3 && text.includes(bare));
}

// ── CSV parsing ────────────────────────────────────────────────────────────────

function parseCSV(content: string): Company[] {
  const lines  = content.trim().split("\n");
  const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
  const nameIdx = header.findIndex(h => h === "name" || h === "company" || h === "company_name");
  const descIdx = header.findIndex(h => h.includes("desc") || h.includes("one") || h.includes("about") || h.includes("tagline"));
  const batchIdx = header.findIndex(h => h === "batch");
  const tagsIdx  = header.findIndex(h => h === "tags" || h === "tag" || h === "category");

  if (nameIdx === -1) throw new Error("CSV must have a 'name' or 'company' column");

  const companies: Company[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (!cols[nameIdx]?.trim()) continue;
    companies.push({
      name:        cols[nameIdx]?.trim().replace(/"/g, "") ?? "",
      description: cols[descIdx]?.trim().replace(/"/g, "") ?? "",
      batch:       cols[batchIdx]?.trim().replace(/"/g, "") ?? "",
      tags:        cols[tagsIdx]?.trim().replace(/"/g, "") ?? "",
    });
  }
  return companies;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = ""; let inQuote = false;
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (ch === "," && !inQuote) { result.push(cur); cur = ""; continue; }
    cur += ch;
  }
  result.push(cur);
  return result;
}

// ── Prompt helper ──────────────────────────────────────────────────────────────

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const inputFile = process.argv[2] ?? "yc-companies.csv";
  if (!fs.existsSync(inputFile)) {
    console.error(`\nInput file not found: ${inputFile}`);
    console.error(`Create a CSV at that path with columns: name, description, batch (optional), tags (optional)`);
    console.error(`Then run: npx tsx _run-yc-visibility.ts [filename]\n`);
    process.exit(1);
  }

  const raw  = fs.readFileSync(inputFile, "utf8");
  const all  = parseCSV(raw);
  console.log(`\nLoaded ${all.length} companies from ${inputFile}`);

  // ── STEP 1: Categorise ───────────────────────────────────────────────────────

  console.log("\n── STEP 1: Pre-filter & cluster ─────────────────────────────────────────\n");
  const categorised = categorise(all);

  const active    = categorised.filter(c => !c.excluded);
  const infraList = categorised.filter(c => c.reason === "infra/dev-tooling");
  const niches    = categorised.filter(c => c.reason === "niche — no comparison set");

  // Group active by cluster and drop clusters with < 3 companies
  const clusterMap: Record<string, ClusteredCompany[]> = {};
  for (const c of active) {
    if (!clusterMap[c.cluster]) clusterMap[c.cluster] = [];
    clusterMap[c.cluster].push(c);
  }

  const tooSmall: ClusteredCompany[] = [];
  const approvedClusters: Record<string, ClusteredCompany[]> = {};
  for (const [cluster, comps] of Object.entries(clusterMap)) {
    if (comps.length < 3) { tooSmall.push(...comps); }
    else                   { approvedClusters[cluster] = comps; }
  }

  // Print breakdown
  console.log(`BUYER-FACING CLUSTERS (${Object.keys(approvedClusters).length} clusters, ${Object.values(approvedClusters).reduce((s, c) => s + c.length, 0)} companies)\n`);
  for (const [cluster, comps] of Object.entries(approvedClusters).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${cluster.padEnd(30)} ${comps.length} companies`);
    for (const c of comps) console.log(`    • ${c.name}${c.description ? " — " + c.description.slice(0, 80) : ""}`);
    console.log();
  }

  if (tooSmall.length > 0) {
    console.log(`NICHE / CLUSTER TOO SMALL (<3 companies in cluster — excluded from testing):`);
    for (const c of tooSmall) console.log(`  • ${c.name} [${c.cluster}]`);
    console.log();
  }

  if (niches.length > 0) {
    console.log(`UNCATEGORISED (no keyword match — excluded from testing):`);
    for (const c of niches) console.log(`  • ${c.name}${c.description ? " — " + c.description.slice(0, 70) : ""}`);
    console.log();
  }

  console.log(`EXCLUDED — INFRA/DEV-TOOLING (${infraList.length} companies, no API calls):`);
  for (const c of infraList) console.log(`  • ${c.name}`);
  console.log();

  console.log(`────────────────────────────────────────────────────────────────────────`);
  console.log(`  Active for testing : ${Object.values(approvedClusters).reduce((s, c) => s + c.length, 0)}`);
  console.log(`  Excluded (infra)   : ${infraList.length}`);
  console.log(`  Excluded (niche)   : ${tooSmall.length + niches.length}`);
  console.log(`  Total input        : ${all.length}`);
  console.log(`────────────────────────────────────────────────────────────────────────\n`);

  // Save Step 1 output
  const step1Output = {
    clusters:  Object.fromEntries(Object.entries(approvedClusters).map(([k, v]) => [k, v.map(c => c.name)])),
    excluded_infra: infraList.map(c => c.name),
    excluded_niche: [...tooSmall, ...niches].map(c => ({ name: c.name, cluster: c.cluster })),
  };
  fs.writeFileSync("yc-visibility-step1.json", JSON.stringify(step1Output, null, 2));
  console.log("Cluster breakdown saved to yc-visibility-step1.json\n");

  // ── Approval gate ────────────────────────────────────────────────────────────

  const ans = await ask('Type "go" to start LLM testing, or a cluster name to test only that cluster (or "exit"): ');
  if (ans.toLowerCase() === "exit") { console.log("Exiting."); process.exit(0); }

  const targetClusters = ans.toLowerCase() === "go"
    ? approvedClusters
    : Object.fromEntries(Object.entries(approvedClusters).filter(([k]) => k.includes(ans.toLowerCase())));

  if (Object.keys(targetClusters).length === 0) {
    console.log("No matching clusters. Exiting.");
    process.exit(0);
  }

  // ── STEP 2 + 3: Query & test ─────────────────────────────────────────────────

  console.log(`\n── STEP 2+3: Querying LLMs ──────────────────────────────────────────────\n`);

  const allResults:     QueryResult[] = [];
  const namedRecalls:   Record<string, string> = {};
  const clusterEntries = Object.entries(targetClusters);

  for (let ci = 0; ci < clusterEntries.length; ci++) {
    const [cluster, companies] = clusterEntries[ci];
    const queries = getQueries(cluster);
    console.log(`\n[${ci + 1}/${clusterEntries.length}] Cluster: ${cluster} — ${companies.length} companies, ${queries.length} queries × 2 models`);

    for (let qi = 0; qi < queries.length; qi++) {
      const q = queries[qi];
      process.stdout.write(`  query ${qi + 1}/${queries.length}: "${q.slice(0, 60)}..." `);

      const [claudeResp, gptResp] = await Promise.all([callClaude(q), callGPT(q)]);
      process.stdout.write(`✓\n`);

      for (const company of companies) {
        allResults.push({
          company:   company.name,
          cluster,
          query:     q,
          model:     "claude-haiku-4-5",
          mentioned: isMentioned(company.name, claudeResp),
          response:  claudeResp,
        });
        allResults.push({
          company:   company.name,
          cluster,
          query:     q,
          model:     "gpt-4o-mini",
          mentioned: isMentioned(company.name, gptResp),
          response:  gptResp,
        });
      }

      await delay(400);
    }

    // Named recall checks — one per company, run after cluster queries
    console.log(`  Running named-recall checks for ${companies.length} companies...`);
    for (const company of companies) {
      const recallQ = `What do you know about ${company.name}? What does the company do and who uses it?`;
      const recallResp = await callClaude(recallQ);
      namedRecalls[company.name] = recallResp.slice(0, 500);
      await delay(200);
    }
    console.log(`  ✓ cluster ${cluster} complete`);
  }

  // ── STEP 4: Compile results ──────────────────────────────────────────────────

  console.log(`\n── STEP 4: Compiling results ────────────────────────────────────────────\n`);

  const companyResults: CompanyResult[] = [];

  for (const [cluster, companies] of Object.entries(targetClusters)) {
    for (const company of companies) {
      const compRows    = allResults.filter(r => r.company === company.name);
      const mentionedN  = compRows.filter(r => r.mentioned).length;
      const mentionRate = compRows.length > 0 ? mentionedN / compRows.length : 0;

      // Find which other companies in same cluster appeared in queries where this one didn't
      const missedQueries = compRows.filter(r => !r.mentioned).map(r => ({ query: r.query, model: r.model, response: r.response }));
      const competitorSet = new Set<string>();
      for (const mq of missedQueries) {
        const sibs = companies.filter(c => c.name !== company.name);
        for (const sib of sibs) {
          if (isMentioned(sib.name, mq.response)) competitorSet.add(sib.name);
        }
      }

      companyResults.push({
        company_name:              company.name,
        cluster,
        mention_rate:              Math.round(mentionRate * 100),
        queries_tested:            compRows.length / 2, // per company (both models per query)
        mentioned_count:           mentionedN,
        competitors_that_appeared: [...competitorSet],
        named_recall_check:        namedRecalls[company.name] ?? "",
      });
    }
  }

  // Sort ascending by mention_rate (lowest = highest outreach priority)
  companyResults.sort((a, b) => a.mention_rate - b.mention_rate);

  // ── Write CSV ────────────────────────────────────────────────────────────────

  const csvLines = [
    "company_name,cluster,mention_rate,queries_tested,mentioned_count,competitors_that_appeared,named_recall_check",
    ...companyResults.map(r =>
      [
        `"${r.company_name}"`,
        r.cluster,
        r.mention_rate + "%",
        r.queries_tested,
        r.mentioned_count,
        `"${r.competitors_that_appeared.join("; ")}"`,
        `"${r.named_recall_check.replace(/"/g, "'")}"`,
      ].join(",")
    ),
  ];
  fs.writeFileSync("yc-visibility-results.csv", csvLines.join("\n"));

  // ── Write raw JSON ────────────────────────────────────────────────────────────

  fs.writeFileSync("yc-visibility-raw.json", JSON.stringify({
    generated_at:  new Date().toISOString(),
    total_queries: allResults.length / 2,
    results:       allResults,
    named_recalls: namedRecalls,
  }, null, 2));

  // ── Flag LLM-invisible clusters ──────────────────────────────────────────────

  console.log("── Results Summary ──────────────────────────────────────────────────────\n");
  console.log(`${"Company".padEnd(35)} ${"Cluster".padEnd(28)} ${"Mention rate".padEnd(14)} Competitors seen`);
  console.log("─".repeat(100));
  for (const r of companyResults) {
    const bar = r.mention_rate === 0 ? "🚨 ZERO" : r.mention_rate < 20 ? "⚠️  LOW " : "   OK  ";
    console.log(
      `${bar} ${r.company_name.padEnd(33)} ${r.cluster.padEnd(28)} ${(r.mention_rate + "%").padEnd(14)} ${r.competitors_that_appeared.slice(0, 3).join(", ")}`
    );
  }

  // Flag clusters with zero visibility across all companies
  for (const [cluster, companies] of Object.entries(targetClusters)) {
    const clusterRows = companyResults.filter(r => r.cluster === cluster);
    const anyVisible  = clusterRows.some(r => r.mention_rate > 0);
    if (!anyVisible) {
      console.log(`\n⚡ FIRST-MOVER OPPORTUNITY: no company in "${cluster}" appeared in any query — "category not yet legible to LLMs" pitch angle`);
    }
  }

  console.log(`\n✓ Results saved to yc-visibility-results.csv`);
  console.log(`✓ Raw responses saved to yc-visibility-raw.json`);
  console.log(`✓ ${companyResults.filter(r => r.mention_rate === 0).length} companies with ZERO visibility (highest outreach priority)\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
