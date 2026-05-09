export type SeoDomain = {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  useCases: { title: string; description: string }[];
  agentLibrarySlug: string; // links to /domains/[slug]
  relatedSlugs: string[];   // links to other /domain/[slug] pages
};

export const seoDomains: SeoDomain[] = [
  {
    slug: "education",
    name: "Education",
    metaTitle: "Best AI Agents for Education | AgenticLib",
    metaDescription:
      "Discover the top AI agents for education - from personalised tutoring and curriculum generation to student assessment and administrative automation.",
    h1: "AI Agents for Education",
    intro:
      "AI agents are transforming education by enabling personalised learning experiences at scale. From intelligent tutoring systems that adapt to each student's pace, to automated grading tools that save teachers hours every week, the right AI agent can meaningfully improve outcomes across every level of education.",
    useCases: [
      {
        title: "Personalised Tutoring",
        description:
          "AI tutors that adapt content difficulty and pacing in real time based on each student's performance and learning style.",
      },
      {
        title: "Automated Assessment & Grading",
        description:
          "Instantly grade assignments, essays, and quizzes with AI, freeing educators to focus on teaching rather than marking.",
      },
      {
        title: "Curriculum & Lesson Planning",
        description:
          "Generate standards-aligned lesson plans, learning objectives, and course outlines in minutes using AI agents.",
      },
      {
        title: "Student Engagement & Support",
        description:
          "AI-powered chatbots and virtual assistants that answer student questions 24/7 and flag students who may need extra support.",
      },
    ],
    agentLibrarySlug: "education",
    relatedSlugs: [],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    metaTitle: "Best AI Agents for Real Estate | AgenticLib",
    metaDescription:
      "Find the top AI agents for real estate - automate property listings, lead qualification, market analysis, and client communication.",
    h1: "AI Agents for Real Estate",
    intro:
      "Real estate professionals are adopting AI agents to move faster, close more deals, and deliver a better client experience. From AI tools that automatically generate property listings and market reports, to intelligent lead qualification agents that prioritise your pipeline - the technology is already here.",
    useCases: [
      {
        title: "Property Listing Generation",
        description:
          "Automatically generate compelling, SEO-optimised property descriptions from photos, specs, and key features.",
      },
      {
        title: "Lead Qualification & Follow-Up",
        description:
          "AI agents that score inbound leads, send personalised follow-up messages, and book viewings automatically.",
      },
      {
        title: "Market Analysis & Pricing",
        description:
          "Get instant AI-generated comparable market analysis reports to help price properties accurately and competitively.",
      },
      {
        title: "Client Communication Automation",
        description:
          "Automate routine client updates, appointment reminders, and document requests so agents can focus on relationships.",
      },
    ],
    agentLibrarySlug: "real-estate",
    relatedSlugs: ["finance", "loans-insurance", "banking"],
  },
  {
    slug: "legal",
    name: "Legal",
    metaTitle: "Best AI Agents for Legal Professionals | AgenticLib",
    metaDescription:
      "Explore AI agents built for the legal industry - contract review, legal research, document drafting, and compliance automation.",
    h1: "AI Agents for Legal Professionals",
    intro:
      "Law firms and in-house legal teams are using AI agents to dramatically reduce the time spent on document review, research, and routine drafting. Tasks that once took a junior associate days can now be completed in minutes - with greater consistency and fewer errors.",
    useCases: [
      {
        title: "Contract Review & Analysis",
        description:
          "AI agents that read and flag non-standard clauses, missing terms, and risk areas across large volumes of contracts.",
      },
      {
        title: "Legal Research Automation",
        description:
          "Search case law, statutes, and regulations in seconds - AI agents surface relevant precedents and summarise findings.",
      },
      {
        title: "Document Drafting & Templates",
        description:
          "Generate first-draft NDAs, employment agreements, briefs, and correspondence tailored to your jurisdiction.",
      },
      {
        title: "Compliance & Regulatory Monitoring",
        description:
          "Stay ahead of regulatory changes with AI agents that monitor updates and alert your team to relevant shifts.",
      },
    ],
    agentLibrarySlug: "legal",
    relatedSlugs: ["cybersecurity", "finance", "accounting"],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    metaTitle: "Best AI Agents for Cybersecurity | AgenticLib",
    metaDescription:
      "Discover top AI agents for cybersecurity - threat detection, incident response, vulnerability scanning, and security automation.",
    h1: "AI Agents for Cybersecurity",
    intro:
      "The threat landscape is evolving faster than any human team can track alone. AI agents give security teams a force multiplier - continuously monitoring for anomalies, automating threat triage, and accelerating incident response across your entire infrastructure.",
    useCases: [
      {
        title: "Threat Detection & Monitoring",
        description:
          "AI agents that continuously analyse network traffic, logs, and behaviour patterns to detect threats in real time.",
      },
      {
        title: "Automated Incident Response",
        description:
          "Trigger automated playbooks when threats are detected - isolate endpoints, revoke access, and alert the right people instantly.",
      },
      {
        title: "Vulnerability Scanning & Patching",
        description:
          "Proactively scan infrastructure for vulnerabilities and prioritise remediation based on exploitability and business impact.",
      },
      {
        title: "Security Awareness & Phishing Simulation",
        description:
          "AI-driven tools that train employees to recognise social engineering attacks and track security posture over time.",
      },
    ],
    agentLibrarySlug: "cybersecurity",
    relatedSlugs: ["legal", "banking"],
  },
  {
    slug: "finance",
    name: "Finance",
    metaTitle: "Best AI Agents for Finance | AgenticLib",
    metaDescription:
      "Find the best AI agents for finance teams - automate financial reporting, forecasting, anomaly detection, and workflow automation.",
    h1: "AI Agents for Finance Teams",
    intro:
      "Finance teams are under growing pressure to deliver accurate insights faster, with leaner teams. AI agents are enabling finance professionals to automate repetitive analysis, accelerate month-end close, and build more reliable forecasts - without sacrificing accuracy.",
    useCases: [
      {
        title: "Financial Reporting Automation",
        description:
          "Automatically generate P&L statements, balance sheets, and management reports from your existing financial data.",
      },
      {
        title: "Cash Flow Forecasting",
        description:
          "AI agents that model future cash positions based on historical patterns, outstanding invoices, and committed spend.",
      },
      {
        title: "Anomaly Detection & Fraud Prevention",
        description:
          "Flag unusual transactions, duplicate payments, and potential fraud in real time across your financial systems.",
      },
      {
        title: "Accounts Payable & Receivable",
        description:
          "Automate invoice processing, payment matching, and collections follow-up to reduce manual effort and errors.",
      },
    ],
    agentLibrarySlug: "finance",
    relatedSlugs: ["accounting", "banking", "financial-advisory"],
  },
  {
    slug: "accounting",
    name: "Accounting",
    metaTitle: "Best AI Agents for Accounting | AgenticLib",
    metaDescription:
      "Explore AI agents for accounting - automate bookkeeping, tax preparation, reconciliation, and financial close processes.",
    h1: "AI Agents for Accounting",
    intro:
      "Accounting firms and internal finance teams are turning to AI agents to handle the high-volume, rule-based work that dominates the profession - freeing accountants to focus on advisory work and client relationships. From automated bank reconciliation to intelligent tax preparation assistance, the right AI tools can transform your practice.",
    useCases: [
      {
        title: "Bookkeeping Automation",
        description:
          "Automatically categorise transactions, reconcile accounts, and maintain up-to-date books with minimal manual input.",
      },
      {
        title: "Tax Preparation & Compliance",
        description:
          "AI agents that surface tax-saving opportunities, flag compliance risks, and pre-populate tax return data.",
      },
      {
        title: "Audit Preparation",
        description:
          "Organise and review supporting documentation, flag discrepancies, and prepare audit-ready workpapers faster.",
      },
      {
        title: "Expense Management",
        description:
          "Capture receipts, enforce expense policies, and code costs to the right accounts automatically.",
      },
    ],
    agentLibrarySlug: "accounting",
    relatedSlugs: ["finance", "banking", "legal"],
  },
  {
    slug: "banking",
    name: "Banking",
    metaTitle: "Best AI Agents for Banking | AgenticLib",
    metaDescription:
      "Discover AI agents for banking - customer service automation, KYC/AML compliance, loan processing, and risk management.",
    h1: "AI Agents for Banking",
    intro:
      "Banks and financial institutions are deploying AI agents to improve customer experience, reduce compliance costs, and accelerate core processes like loan origination and KYC verification. The shift from rule-based automation to intelligent agents means banks can now handle edge cases, personalise interactions, and respond to change much faster.",
    useCases: [
      {
        title: "Customer Service & Virtual Assistants",
        description:
          "AI-powered banking assistants that handle balance enquiries, transaction queries, and product recommendations 24/7.",
      },
      {
        title: "KYC & AML Compliance",
        description:
          "Automate identity verification, document checks, and transaction monitoring to meet regulatory requirements efficiently.",
      },
      {
        title: "Loan & Credit Processing",
        description:
          "Speed up credit decisions with AI agents that assess applications, verify documents, and surface risk signals.",
      },
      {
        title: "Fraud Detection",
        description:
          "Monitor transactions in real time with AI that identifies suspicious patterns and triggers instant alerts or blocks.",
      },
    ],
    agentLibrarySlug: "banking",
    relatedSlugs: ["finance", "loans-insurance", "financial-advisory"],
  },
  {
    slug: "loans-insurance",
    name: "Loans & Insurance",
    metaTitle: "Best AI Agents for Loans & Insurance | AgenticLib",
    metaDescription:
      "Find AI agents for loans and insurance - automate underwriting, claims processing, customer onboarding, and risk assessment.",
    h1: "AI Agents for Loans & Insurance",
    intro:
      "The loans and insurance industries are data-intensive businesses where speed, accuracy, and compliance are non-negotiable. AI agents are enabling lenders and insurers to process applications faster, assess risk more accurately, and handle claims with less friction - while keeping costs under control.",
    useCases: [
      {
        title: "Underwriting Automation",
        description:
          "AI agents that assess risk, process documentation, and generate underwriting decisions faster and more consistently.",
      },
      {
        title: "Claims Processing",
        description:
          "Automate first notice of loss, document collection, and claims assessment to speed up resolutions and reduce costs.",
      },
      {
        title: "Customer Onboarding",
        description:
          "Guide customers through applications, verify identity, and collect required documents with intelligent onboarding agents.",
      },
      {
        title: "Risk Scoring & Fraud Detection",
        description:
          "Use AI to detect fraudulent applications and claims, and build more accurate risk models from structured and unstructured data.",
      },
    ],
    agentLibrarySlug: "loans-insurance",
    relatedSlugs: ["banking", "real-estate", "financial-advisory"],
  },
  {
    slug: "financial-advisory",
    name: "Financial Advisory",
    metaTitle: "Best AI Agents for Financial Advisory | AgenticLib",
    metaDescription:
      "Explore AI agents for financial advisors - automate client reporting, portfolio analysis, compliance documentation, and meeting prep.",
    h1: "AI Agents for Financial Advisory",
    intro:
      "Financial advisors are using AI agents to scale their practice - delivering more personalised advice to more clients, without proportionally increasing time spent on administration. From automated client reporting and portfolio rebalancing alerts, to AI-assisted meeting preparation and compliance documentation, the tools are already available.",
    useCases: [
      {
        title: "Client Reporting & Portfolio Summaries",
        description:
          "Automatically generate personalised portfolio performance reports and client summaries ahead of review meetings.",
      },
      {
        title: "Investment Research & Analysis",
        description:
          "AI agents that surface relevant market news, summarise research reports, and flag portfolio drift.",
      },
      {
        title: "Compliance & Documentation",
        description:
          "Automatically generate suitability reports, record meeting notes, and maintain audit-ready client files.",
      },
      {
        title: "Client Communication",
        description:
          "Personalise outreach at scale - market updates, birthday messages, and proactive financial health check-ins.",
      },
    ],
    agentLibrarySlug: "financial-advisory",
    relatedSlugs: ["finance", "banking", "accounting"],
  },

  // ── New domains ──────────────────────────────────────────────────────────────

  {
    slug: "cash-flow-forecasting",
    name: "Cash Flow Forecasting",
    metaTitle: "Best AI Agents for Cash Flow Forecasting | AgenticLib",
    metaDescription:
      "Discover AI agents for cash flow forecasting - automate cash projections, scenario modelling, and liquidity management for smarter financial planning.",
    h1: "AI Agents for Cash Flow Forecasting",
    intro:
      "Managing cash flow is one of the highest-stakes responsibilities in any business. AI agents are giving finance teams the ability to build accurate, real-time cash projections - automatically pulling data from invoices, payables, and banking feeds to give treasury and CFO teams a continuous, reliable view of liquidity.",
    useCases: [
      {
        title: "Automated Cash Projections",
        description: "AI agents that pull live data from ERP, banking, and billing systems to generate rolling cash forecasts without manual spreadsheet work.",
      },
      {
        title: "Scenario & Sensitivity Modelling",
        description: "Run best-case, worst-case, and base-case scenarios instantly to stress-test liquidity under different business conditions.",
      },
      {
        title: "Receivables & Payables Tracking",
        description: "Monitor outstanding invoices and payment schedules in real time to anticipate shortfalls before they occur.",
      },
      {
        title: "Treasury Alerts & Recommendations",
        description: "AI-generated alerts when cash balances fall below thresholds, with recommended actions to optimise working capital.",
      },
    ],
    agentLibrarySlug: "cash-flow-forecasting",
    relatedSlugs: ["finance", "accounting", "banking"],
  },

  {
    slug: "pharmacy",
    name: "Pharmacy",
    metaTitle: "Best AI Agents for Pharmacy | AgenticLib",
    metaDescription:
      "Explore AI agents for pharmacy - automate prescription management, drug interaction checks, inventory, and patient communication.",
    h1: "AI Agents for Pharmacy",
    intro:
      "Pharmacies operate under immense pressure to dispense accurately, manage inventory efficiently, and communicate clearly with patients - all while navigating complex regulatory requirements. AI agents are helping pharmacists automate the administrative and operational burden so they can focus on patient care.",
    useCases: [
      {
        title: "Prescription Processing & Verification",
        description: "Automate prescription intake, verification, and routing to reduce errors and speed up dispensing workflows.",
      },
      {
        title: "Drug Interaction Checking",
        description: "AI agents that flag potential drug-drug and drug-allergy interactions before dispensing, improving patient safety.",
      },
      {
        title: "Inventory & Reorder Management",
        description: "Track stock levels in real time and automatically trigger reorders before medications run out.",
      },
      {
        title: "Patient Communication & Reminders",
        description: "Automated refill reminders, pickup notifications, and medication adherence messages sent directly to patients.",
      },
    ],
    agentLibrarySlug: "pharmacy",
    relatedSlugs: ["healthcare", "mental-health", "dental"],
  },

  {
    slug: "travel",
    name: "Travel",
    metaTitle: "Best AI Agents for Travel | AgenticLib",
    metaDescription:
      "Find AI agents for the travel industry - automate booking assistance, itinerary planning, customer support, and personalised travel recommendations.",
    h1: "AI Agents for Travel",
    intro:
      "The travel industry runs on personalisation, speed, and 24/7 availability - all areas where AI agents excel. From intelligent booking assistants that handle complex multi-leg itineraries, to automated customer support agents that resolve queries in seconds, AI is reshaping how travellers plan, book, and experience travel.",
    useCases: [
      {
        title: "Intelligent Booking Assistance",
        description: "AI agents that search, compare, and book flights, hotels, and transfers based on traveller preferences and budget.",
      },
      {
        title: "Personalised Itinerary Planning",
        description: "Generate customised day-by-day itineraries based on destination, duration, interests, and travel style.",
      },
      {
        title: "24/7 Customer Support",
        description: "Handle booking changes, cancellations, and travel disruption queries instantly without human intervention.",
      },
      {
        title: "Loyalty & Upsell Automation",
        description: "AI-powered agents that identify upsell opportunities and personalise loyalty rewards based on traveller history.",
      },
    ],
    agentLibrarySlug: "travel",
    relatedSlugs: ["hospitality", "customer-experience", "ecommerce"],
  },

  {
    slug: "hospitality",
    name: "Hospitality",
    metaTitle: "Best AI Agents for Hospitality | AgenticLib",
    metaDescription:
      "Discover AI agents for hospitality - automate guest services, reservations, staff scheduling, and personalised in-stay experiences.",
    h1: "AI Agents for Hospitality",
    intro:
      "Hotels, restaurants, and hospitality businesses live and die by the quality of their guest experience. AI agents are enabling hospitality teams to deliver faster, more personalised service at every touchpoint - from pre-arrival communication and check-in automation to in-stay requests and post-stay follow-up.",
    useCases: [
      {
        title: "Guest Communication & Concierge",
        description: "AI concierge agents that handle guest requests, local recommendations, and in-stay queries around the clock.",
      },
      {
        title: "Reservations & Booking Management",
        description: "Automate table bookings, room reservations, and availability management across multiple channels simultaneously.",
      },
      {
        title: "Staff Scheduling & Operations",
        description: "AI agents that optimise rosters based on occupancy forecasts, reducing labour costs and improving service coverage.",
      },
      {
        title: "Personalised Guest Experiences",
        description: "Use guest history and preferences to deliver personalised room settings, dining suggestions, and targeted offers.",
      },
    ],
    agentLibrarySlug: "hospitality",
    relatedSlugs: ["travel", "customer-experience", "retail"],
  },

  {
    slug: "retail",
    name: "Retail",
    metaTitle: "Best AI Agents for Retail | AgenticLib",
    metaDescription:
      "Explore AI agents for retail - personalised shopping, inventory forecasting, customer service automation, and visual merchandising.",
    h1: "AI Agents for Retail",
    intro:
      "Retail is one of the most competitive and data-rich industries in the world. AI agents are helping retailers deliver hyper-personalised shopping experiences, optimise inventory in real time, and automate customer service at scale - giving both online and physical retailers the tools to compete with larger players.",
    useCases: [
      {
        title: "Personalised Product Recommendations",
        description: "AI agents that analyse browsing, purchase history, and preferences to surface the right products to each shopper.",
      },
      {
        title: "Inventory Forecasting & Replenishment",
        description: "Predict demand, prevent stockouts, and automate replenishment orders based on sales trends and seasonality.",
      },
      {
        title: "Customer Service Automation",
        description: "Handle returns, order tracking, and product queries with AI agents that resolve issues instantly across all channels.",
      },
      {
        title: "Dynamic Pricing",
        description: "AI-driven pricing agents that adjust prices in real time based on demand, competition, and margin targets.",
      },
    ],
    agentLibrarySlug: "retail",
    relatedSlugs: ["ecommerce", "customer-experience", "logistics"],
  },

  {
    slug: "telecommunication",
    name: "Telecommunication",
    metaTitle: "Best AI Agents for Telecommunication | AgenticLib",
    metaDescription:
      "Find AI agents for telecoms - network optimisation, customer churn prediction, automated support, and billing automation.",
    h1: "AI Agents for Telecommunication",
    intro:
      "Telecoms companies manage enormous infrastructure, millions of customers, and increasingly complex service portfolios. AI agents are helping telcos reduce churn, automate customer support, optimise network performance, and process billing disputes - at a scale that human teams alone simply cannot match.",
    useCases: [
      {
        title: "Customer Churn Prediction & Retention",
        description: "AI agents that identify at-risk customers before they leave and trigger personalised retention campaigns automatically.",
      },
      {
        title: "Network Performance Monitoring",
        description: "Continuously monitor network health, predict failures, and automatically reroute traffic to maintain service quality.",
      },
      {
        title: "Automated Customer Support",
        description: "Resolve billing queries, plan changes, and technical issues with AI agents that handle millions of interactions at scale.",
      },
      {
        title: "Fraud Detection",
        description: "Detect subscription fraud, SIM swapping, and unusual usage patterns in real time before they impact revenue.",
      },
    ],
    agentLibrarySlug: "telecommunication",
    relatedSlugs: ["customer-experience", "cybersecurity", "technology"],
  },

  {
    slug: "agriculture",
    name: "Agriculture",
    metaTitle: "Best AI Agents for Agriculture | AgenticLib",
    metaDescription:
      "Discover AI agents for agriculture - crop monitoring, precision farming, supply chain optimisation, and yield prediction.",
    h1: "AI Agents for Agriculture",
    intro:
      "Agriculture faces growing pressure to produce more food with fewer resources while adapting to climate uncertainty. AI agents are giving farmers, agronomists, and agribusiness operators tools to monitor crops in real time, predict yields accurately, and optimise inputs - improving both productivity and sustainability.",
    useCases: [
      {
        title: "Crop Monitoring & Disease Detection",
        description: "AI agents that analyse satellite imagery and sensor data to detect crop stress, disease, and pest infestations early.",
      },
      {
        title: "Yield Prediction & Planning",
        description: "Use historical data, weather patterns, and soil conditions to generate accurate harvest forecasts and resource plans.",
      },
      {
        title: "Precision Irrigation & Input Optimisation",
        description: "Automate irrigation schedules and fertiliser application based on real-time soil and weather data to reduce waste.",
      },
      {
        title: "Supply Chain & Market Intelligence",
        description: "AI agents that track commodity prices, logistics costs, and buyer demand to optimise when and where to sell.",
      },
    ],
    agentLibrarySlug: "agriculture",
    relatedSlugs: ["logistics", "procurement", "robotics"],
  },

  {
    slug: "aerospace",
    name: "Aerospace",
    metaTitle: "Best AI Agents for Aerospace | AgenticLib",
    metaDescription:
      "Explore AI agents for aerospace - predictive maintenance, mission planning, quality control, and supply chain automation.",
    h1: "AI Agents for Aerospace",
    intro:
      "Aerospace demands the highest standards of precision, safety, and efficiency. AI agents are being deployed across aircraft maintenance, mission planning, manufacturing quality control, and supply chain management - reducing downtime, improving safety margins, and cutting the cost of complex operations.",
    useCases: [
      {
        title: "Predictive Maintenance",
        description: "AI agents that monitor engine and systems telemetry to predict component failures before they cause unscheduled downtime.",
      },
      {
        title: "Mission & Flight Planning",
        description: "Automate route optimisation, fuel calculations, and airspace conflict resolution for complex flight operations.",
      },
      {
        title: "Manufacturing Quality Inspection",
        description: "Computer vision AI agents that detect surface defects, dimensional errors, and assembly issues during production.",
      },
      {
        title: "Supply Chain & Parts Management",
        description: "Track critical parts inventory, manage supplier lead times, and automate procurement for maintenance and production.",
      },
    ],
    agentLibrarySlug: "aerospace",
    relatedSlugs: ["robotics", "procurement", "logistics"],
  },

  {
    slug: "healthcare",
    name: "Healthcare",
    metaTitle: "Best AI Agents for Healthcare | AgenticLib",
    metaDescription:
      "Find AI agents for healthcare - clinical documentation, patient triage, appointment scheduling, and medical data analysis.",
    h1: "AI Agents for Healthcare",
    intro:
      "Healthcare providers are turning to AI agents to reduce administrative burden, improve diagnostic accuracy, and deliver better patient outcomes at scale. From automating clinical documentation to supporting early diagnosis with medical imaging AI, the opportunity to improve both efficiency and care quality is significant.",
    useCases: [
      {
        title: "Clinical Documentation & Coding",
        description: "AI agents that transcribe consultations, generate clinical notes, and assign billing codes automatically - saving hours per clinician per day.",
      },
      {
        title: "Patient Triage & Symptom Assessment",
        description: "Intelligent triage agents that assess patient symptoms, prioritise urgency, and route patients to the right care pathway.",
      },
      {
        title: "Appointment Scheduling & Follow-Up",
        description: "Automate appointment booking, reminders, and follow-up communications to reduce no-shows and administrative workload.",
      },
      {
        title: "Medical Data Analysis & Diagnostics Support",
        description: "AI agents that analyse medical imaging, lab results, and patient history to surface insights that support clinical decisions.",
      },
    ],
    agentLibrarySlug: "healthcare",
    relatedSlugs: ["dental", "mental-health", "pharmacy"],
  },

  {
    slug: "dental",
    name: "Dental",
    metaTitle: "Best AI Agents for Dental Practices | AgenticLib",
    metaDescription:
      "Discover AI agents for dental practices - appointment management, X-ray analysis, patient communication, and treatment planning support.",
    h1: "AI Agents for Dental Practices",
    intro:
      "Dental practices face a unique combination of clinical demands and business pressures. AI agents are helping dental teams automate patient communication, streamline appointment management, and support clinical workflows like X-ray analysis and treatment planning - improving both patient experience and practice efficiency.",
    useCases: [
      {
        title: "Appointment Scheduling & Reminders",
        description: "Automate appointment booking, cancellation management, and personalised reminders to maximise chair utilisation.",
      },
      {
        title: "Dental X-Ray & Imaging Analysis",
        description: "AI agents that assist in analysing radiographs to detect cavities, bone loss, and anomalies with greater speed and consistency.",
      },
      {
        title: "Treatment Plan Communication",
        description: "Generate clear, personalised treatment plan explanations to improve patient understanding and case acceptance.",
      },
      {
        title: "Patient Follow-Up & Recall",
        description: "Automate recall messaging, post-treatment check-ins, and hygiene appointment reminders to improve patient retention.",
      },
    ],
    agentLibrarySlug: "dental",
    relatedSlugs: ["healthcare", "optometry", "veterinary"],
  },

  {
    slug: "optometry",
    name: "Optometry",
    metaTitle: "Best AI Agents for Optometry | AgenticLib",
    metaDescription:
      "Explore AI agents for optometry - eye examination support, patient scheduling, frame recommendations, and clinical documentation.",
    h1: "AI Agents for Optometry",
    intro:
      "Optometry practices are using AI agents to streamline clinical workflows, improve patient communication, and enhance the in-practice experience. From automated appointment management to AI-assisted retinal imaging analysis, the tools available are helping optometrists deliver better care while running more efficient practices.",
    useCases: [
      {
        title: "Retinal Imaging Analysis",
        description: "AI agents that assist in screening retinal images for signs of diabetic retinopathy, glaucoma, and macular degeneration.",
      },
      {
        title: "Appointment & Recall Management",
        description: "Automate scheduling, recall reminders, and follow-up messaging to improve patient retention and reduce no-shows.",
      },
      {
        title: "Frame & Lens Recommendations",
        description: "AI-powered tools that suggest suitable frame styles and lens options based on prescription and lifestyle needs.",
      },
      {
        title: "Clinical Documentation",
        description: "Automatically generate examination notes and clinical summaries, reducing documentation time per patient.",
      },
    ],
    agentLibrarySlug: "optometry",
    relatedSlugs: ["healthcare", "dental", "veterinary"],
  },

  {
    slug: "veterinary",
    name: "Veterinary",
    metaTitle: "Best AI Agents for Veterinary Practices | AgenticLib",
    metaDescription:
      "Find AI agents for veterinary practices - appointment management, clinical documentation, diagnostic support, and client communication.",
    h1: "AI Agents for Veterinary Practices",
    intro:
      "Veterinary practices balance complex clinical work with the demands of running a busy, client-facing business. AI agents are helping vet teams automate administrative tasks, improve diagnostic workflows, and communicate more effectively with pet owners - freeing clinicians to focus on animal care.",
    useCases: [
      {
        title: "Appointment Scheduling & Reminders",
        description: "Automate booking, vaccination reminders, and annual check-up recalls to keep the appointment book full and clients engaged.",
      },
      {
        title: "Clinical Documentation",
        description: "Generate consultation notes, treatment summaries, and discharge instructions automatically to reduce post-appointment admin.",
      },
      {
        title: "Diagnostic Image Analysis",
        description: "AI agents that assist vets in interpreting radiographs and ultrasound images to support faster, more accurate diagnoses.",
      },
      {
        title: "Client Communication",
        description: "Automated post-visit follow-ups, prescription reminders, and health education messages tailored to each patient.",
      },
    ],
    agentLibrarySlug: "veterinary",
    relatedSlugs: ["healthcare", "dental", "optometry"],
  },

  {
    slug: "mental-health",
    name: "Mental Health",
    metaTitle: "Best AI Agents for Mental Health | AgenticLib",
    metaDescription:
      "Discover AI agents for mental health - therapy support tools, patient intake automation, crisis detection, and clinician workflow assistance.",
    h1: "AI Agents for Mental Health",
    intro:
      "Mental health services are under extraordinary demand, with therapists and counsellors stretched far beyond capacity. AI agents are helping mental health providers automate intake and administrative processes, provide between-session support to patients, and flag early warning signs - expanding access to care without replacing the human therapeutic relationship.",
    useCases: [
      {
        title: "Patient Intake & Assessment",
        description: "AI agents that guide new patients through intake questionnaires and symptom assessments, delivering structured summaries to clinicians.",
      },
      {
        title: "Between-Session Support Tools",
        description: "Conversational AI tools that provide CBT-based exercises, mood tracking, and coping strategies between therapy appointments.",
      },
      {
        title: "Crisis Detection & Escalation",
        description: "AI agents that identify distress signals in patient communications and automatically escalate to a human clinician when needed.",
      },
      {
        title: "Clinician Documentation",
        description: "Automatically generate session notes and progress summaries from consultation transcripts, reducing clinician admin time.",
      },
    ],
    agentLibrarySlug: "mental-health",
    relatedSlugs: ["healthcare", "pharmacy", "dental"],
  },

  {
    slug: "marketing",
    name: "Marketing",
    metaTitle: "Best AI Agents for Marketing | AgenticLib",
    metaDescription:
      "Explore AI agents for marketing - content creation, campaign automation, audience segmentation, and performance analytics.",
    h1: "AI Agents for Marketing",
    intro:
      "Marketing teams are using AI agents to produce more content, run smarter campaigns, and extract better insights from data - without proportionally growing headcount. From automated copywriting and SEO content generation to real-time campaign optimisation and lead scoring, AI is transforming what a lean marketing team can achieve.",
    useCases: [
      {
        title: "Content Creation & Copywriting",
        description: "AI agents that generate blog posts, ad copy, social media content, and email campaigns at scale and on brand.",
      },
      {
        title: "Audience Segmentation & Personalisation",
        description: "Automatically segment audiences and personalise messaging based on behaviour, purchase history, and engagement data.",
      },
      {
        title: "Campaign Optimisation",
        description: "AI agents that monitor campaign performance in real time and adjust bids, targeting, and creative to maximise ROI.",
      },
      {
        title: "SEO & Content Strategy",
        description: "Generate keyword strategies, optimise existing content, and identify content gaps to improve organic search visibility.",
      },
    ],
    agentLibrarySlug: "marketing",
    relatedSlugs: ["digital-advertising", "ecommerce", "customer-experience"],
  },

  {
    slug: "ecommerce",
    name: "eCommerce",
    metaTitle: "Best AI Agents for eCommerce | AgenticLib",
    metaDescription:
      "Find AI agents for eCommerce - product recommendations, cart abandonment recovery, customer support automation, and conversion optimisation.",
    h1: "AI Agents for eCommerce",
    intro:
      "eCommerce businesses compete on speed, personalisation, and seamless customer experience. AI agents are enabling online retailers to deliver personalised product recommendations, recover abandoned carts, automate customer support, and optimise every step of the purchase funnel - at a scale that was previously only possible for the largest platforms.",
    useCases: [
      {
        title: "Personalised Product Recommendations",
        description: "AI agents that deliver real-time product recommendations based on browsing behaviour, purchase history, and similar shoppers.",
      },
      {
        title: "Cart Abandonment Recovery",
        description: "Automatically trigger personalised follow-up emails and messages to recover abandoned carts and incomplete checkouts.",
      },
      {
        title: "Customer Support Automation",
        description: "Handle order queries, returns, and product questions instantly with AI agents that resolve most issues without human escalation.",
      },
      {
        title: "Conversion Rate Optimisation",
        description: "AI agents that A/B test product pages, pricing, and checkout flows to continuously improve conversion rates.",
      },
    ],
    agentLibrarySlug: "ecommerce",
    relatedSlugs: ["retail", "marketing", "digital-advertising"],
  },

  {
    slug: "video-editing",
    name: "Video Editing",
    metaTitle: "Best AI Agents for Video Editing | AgenticLib",
    metaDescription:
      "Discover AI agents for video editing - automated editing, transcription, subtitle generation, colour grading assistance, and content repurposing.",
    h1: "AI Agents for Video Editing",
    intro:
      "Video content has never been in higher demand, and AI agents are dramatically reducing the time and cost of producing high-quality video. From automated rough cuts and subtitle generation to AI-assisted colour grading and intelligent content repurposing, video creators and production teams can now achieve more with smaller crews and tighter deadlines.",
    useCases: [
      {
        title: "Automated Rough Cut Editing",
        description: "AI agents that analyse raw footage, identify the best takes, and assemble a structured rough cut in minutes.",
      },
      {
        title: "Transcription & Subtitle Generation",
        description: "Automatically transcribe audio, generate accurate subtitles, and translate captions across multiple languages.",
      },
      {
        title: "Content Repurposing",
        description: "Transform long-form video into short clips, reels, and social snippets automatically, optimised for each platform.",
      },
      {
        title: "AI Colour Grading Assistance",
        description: "AI tools that suggest and apply colour grades based on scene type, mood, and visual reference - accelerating post-production.",
      },
    ],
    agentLibrarySlug: "video-editing",
    relatedSlugs: ["media", "marketing", "digital-advertising"],
  },

  {
    slug: "trading",
    name: "Trading",
    metaTitle: "Best AI Agents for Trading | AgenticLib",
    metaDescription:
      "Explore AI agents for trading - algorithmic strategy development, market data analysis, risk management, and trade execution automation.",
    h1: "AI Agents for Trading",
    intro:
      "Trading firms and individual traders are deploying AI agents to analyse market data at speeds and scales impossible for humans, identify patterns, manage risk, and automate execution. Whether applied to equities, crypto, forex, or commodities, AI agents are giving traders a significant analytical and operational edge.",
    useCases: [
      {
        title: "Market Data Analysis & Signal Generation",
        description: "AI agents that process real-time and historical market data to identify tradable patterns and generate actionable signals.",
      },
      {
        title: "Algorithmic Strategy Development",
        description: "Build, backtest, and optimise trading strategies using AI to discover edge cases human analysis would miss.",
      },
      {
        title: "Risk Management & Position Monitoring",
        description: "Continuously monitor portfolio exposure, drawdown limits, and correlation risks - triggering alerts or automated hedges when thresholds are breached.",
      },
      {
        title: "Trade Execution Automation",
        description: "Automate order placement, routing, and timing to achieve best execution while minimising market impact.",
      },
    ],
    agentLibrarySlug: "trading",
    relatedSlugs: ["finance", "banking", "financial-advisory"],
  },

  {
    slug: "media",
    name: "Media",
    metaTitle: "Best AI Agents for Media | AgenticLib",
    metaDescription:
      "Find AI agents for media companies - content generation, audience analytics, ad targeting, newsroom automation, and distribution.",
    h1: "AI Agents for Media",
    intro:
      "Media companies are under constant pressure to produce more content, reach the right audiences, and monetise effectively. AI agents are transforming newsrooms, content studios, and media sales teams - automating everything from article drafting and video production to audience segmentation and programmatic advertising.",
    useCases: [
      {
        title: "Automated Content Production",
        description: "AI agents that generate first drafts of news articles, reports, and summaries from structured data and press releases.",
      },
      {
        title: "Audience Analytics & Personalisation",
        description: "Analyse reader and viewer behaviour to deliver personalised content feeds that increase engagement and time on site.",
      },
      {
        title: "Ad Targeting & Revenue Optimisation",
        description: "AI-powered tools that optimise ad placements, targeting parameters, and floor prices to maximise advertising revenue.",
      },
      {
        title: "Content Rights & Distribution",
        description: "Automate content tagging, rights management, and multi-platform distribution workflows at scale.",
      },
    ],
    agentLibrarySlug: "media",
    relatedSlugs: ["digital-advertising", "marketing", "video-editing"],
  },

  {
    slug: "ai-agent-developer",
    name: "AI Agent Developer",
    metaTitle: "Best Tools & AI Agents for AI Agent Developers | AgenticLib",
    metaDescription:
      "Discover tools and AI agents purpose-built for AI agent developers - frameworks, orchestration platforms, testing tools, and deployment infrastructure.",
    h1: "AI Agents & Tools for AI Agent Developers",
    intro:
      "Building AI agents requires a new stack - from orchestration frameworks and memory systems to evaluation tooling and deployment infrastructure. AgenticLib curates the leading platforms, SDKs, and tools that professional AI agent developers rely on to build, test, and scale production-grade agentic systems.",
    useCases: [
      {
        title: "Agent Orchestration Frameworks",
        description: "Platforms and SDKs for building multi-step, multi-agent workflows - including tool use, memory, and planning capabilities.",
      },
      {
        title: "Evaluation & Testing Tools",
        description: "Test harnesses, benchmarking tools, and evaluation frameworks to measure agent performance, accuracy, and reliability.",
      },
      {
        title: "Memory & Knowledge Management",
        description: "Vector databases, retrieval systems, and memory architectures that give agents access to long-term and structured knowledge.",
      },
      {
        title: "Deployment & Monitoring Infrastructure",
        description: "Platforms for deploying agents at scale with observability, logging, and cost controls built in.",
      },
    ],
    agentLibrarySlug: "ai-agent-developer",
    relatedSlugs: ["technology", "robotics", "general-purpose"],
  },

  {
    slug: "digital-advertising",
    name: "Digital Advertising",
    metaTitle: "Best AI Agents for Digital Advertising | AgenticLib",
    metaDescription:
      "Explore AI agents for digital advertising - creative generation, bid optimisation, audience targeting, and campaign performance automation.",
    h1: "AI Agents for Digital Advertising",
    intro:
      "Digital advertising has become extraordinarily complex - spanning dozens of platforms, formats, and audience signals. AI agents are helping advertisers and agencies automate creative production, optimise bids in real time, and extract actionable insights from campaign data at a pace that human analysts alone cannot match.",
    useCases: [
      {
        title: "Creative Generation & Testing",
        description: "AI agents that generate ad variants - copy, headlines, and visual concepts - and automatically test them to identify top performers.",
      },
      {
        title: "Bid Optimisation & Budget Allocation",
        description: "Continuously adjust bids and reallocate budget across campaigns, channels, and audiences to maximise return on ad spend.",
      },
      {
        title: "Audience Targeting & Lookalike Building",
        description: "Build high-intent audience segments and lookalike audiences using AI to improve targeting precision and reduce CPAs.",
      },
      {
        title: "Campaign Reporting & Insights",
        description: "AI agents that surface the most important performance insights automatically, reducing hours spent in spreadsheets and dashboards.",
      },
    ],
    agentLibrarySlug: "digital-advertising",
    relatedSlugs: ["marketing", "ecommerce", "media"],
  },

  {
    slug: "customer-experience",
    name: "Customer Experience",
    metaTitle: "Best AI Agents for Customer Experience | AgenticLib",
    metaDescription:
      "Find AI agents for customer experience - intelligent support automation, sentiment analysis, feedback management, and personalised engagement.",
    h1: "AI Agents for Customer Experience",
    intro:
      "Customer experience is the primary battleground for brand loyalty. AI agents are enabling CX teams to resolve issues faster, personalise every interaction, and proactively address problems before customers even notice them. The result is lower support costs, higher satisfaction scores, and stronger retention.",
    useCases: [
      {
        title: "Intelligent Support Automation",
        description: "AI agents that handle the majority of customer enquiries - returns, billing, account changes - instantly and without human handoff.",
      },
      {
        title: "Sentiment Analysis & Voice of Customer",
        description: "Continuously analyse customer feedback, reviews, and support interactions to surface themes and sentiment trends.",
      },
      {
        title: "Proactive Customer Outreach",
        description: "AI agents that identify customers at risk of churning and trigger personalised retention actions before they cancel.",
      },
      {
        title: "Omnichannel Personalisation",
        description: "Deliver consistent, personalised interactions across chat, email, social, and voice - remembering context across every channel.",
      },
    ],
    agentLibrarySlug: "customer-experience",
    relatedSlugs: ["retail", "ecommerce", "marketing"],
  },

  {
    slug: "sports",
    name: "Sports",
    metaTitle: "Best AI Agents for Sports | AgenticLib",
    metaDescription:
      "Discover AI agents for sports - performance analytics, injury prevention, fan engagement, scouting, and broadcast automation.",
    h1: "AI Agents for Sports",
    intro:
      "AI agents are transforming sport at every level - from elite performance analytics and injury prevention tools used by professional teams, to fan engagement platforms and automated broadcast production. Whether you're a sports organisation, media company, or technology provider in sport, there are AI agents reshaping your industry.",
    useCases: [
      {
        title: "Performance Analytics & Coaching",
        description: "AI agents that analyse athlete movement, biometrics, and match data to surface actionable insights for coaches and performance staff.",
      },
      {
        title: "Injury Prediction & Prevention",
        description: "Monitor athlete load and biomechanical data to flag injury risk before it becomes a problem, enabling proactive management.",
      },
      {
        title: "Scouting & Recruitment Intelligence",
        description: "AI agents that analyse player data across leagues and competitions to identify transfer targets and recruitment opportunities.",
      },
      {
        title: "Fan Engagement & Personalisation",
        description: "Personalise fan communications, content, and ticketing offers using AI to drive loyalty and matchday revenue.",
      },
    ],
    agentLibrarySlug: "sports",
    relatedSlugs: ["media", "customer-experience", "healthcare"],
  },

  {
    slug: "logistics",
    name: "Logistics",
    metaTitle: "Best AI Agents for Logistics | AgenticLib",
    metaDescription:
      "Explore AI agents for logistics - route optimisation, warehouse automation, demand forecasting, and supply chain visibility.",
    h1: "AI Agents for Logistics",
    intro:
      "Logistics operations involve thousands of interdependent variables - routes, inventory levels, carrier capacity, customs requirements, and customer expectations. AI agents are giving logistics teams the ability to optimise in real time, anticipate disruptions, and automate coordination across complex global supply chains.",
    useCases: [
      {
        title: "Route Optimisation",
        description: "AI agents that calculate the most efficient delivery routes in real time, accounting for traffic, fuel costs, time windows, and vehicle capacity.",
      },
      {
        title: "Warehouse Automation & Picking",
        description: "Optimise warehouse slotting, picking sequences, and labour allocation to increase throughput and reduce errors.",
      },
      {
        title: "Demand Forecasting",
        description: "Predict shipment volumes and inventory needs across the network to reduce stockouts, overstocking, and transport costs.",
      },
      {
        title: "Supply Chain Visibility & Exception Management",
        description: "Real-time tracking across carriers and geographies, with AI agents that flag delays and recommend corrective actions.",
      },
    ],
    agentLibrarySlug: "logistics",
    relatedSlugs: ["procurement", "retail", "agriculture"],
  },

  {
    slug: "robotics",
    name: "Robotics",
    metaTitle: "Best AI Agents for Robotics | AgenticLib",
    metaDescription:
      "Find AI agents for robotics - motion planning, computer vision, autonomous navigation, and human-robot collaboration.",
    h1: "AI Agents for Robotics",
    intro:
      "Robotics is increasingly powered by AI agents that give physical systems the ability to perceive, reason, and act in complex, unstructured environments. From autonomous mobile robots in warehouses to collaborative robots on factory floors, AI agents are the intelligence layer that makes modern robotics genuinely useful.",
    useCases: [
      {
        title: "Autonomous Navigation & Path Planning",
        description: "AI agents that enable robots to navigate dynamic environments safely, avoiding obstacles and adapting to change in real time.",
      },
      {
        title: "Computer Vision & Object Recognition",
        description: "Give robots the ability to identify, classify, and interact with objects accurately across varied lighting and conditions.",
      },
      {
        title: "Human-Robot Collaboration",
        description: "AI systems that enable robots to work safely alongside humans, interpreting intent and adapting behaviour accordingly.",
      },
      {
        title: "Quality Inspection & Defect Detection",
        description: "Deploy AI-powered robotic inspection systems that identify defects on production lines faster and more consistently than human inspectors.",
      },
    ],
    agentLibrarySlug: "robotics",
    relatedSlugs: ["aerospace", "logistics", "technology"],
  },

  {
    slug: "ar-vr",
    name: "AR / VR",
    metaTitle: "Best AI Agents for AR & VR | AgenticLib",
    metaDescription:
      "Discover AI agents for augmented and virtual reality - intelligent virtual assistants, procedural content generation, spatial computing, and XR training.",
    h1: "AI Agents for AR & VR",
    intro:
      "Augmented and virtual reality experiences are becoming significantly more intelligent with the integration of AI agents. From AI-driven NPCs and procedural environment generation to intelligent virtual assistants within XR applications, AI is making AR and VR environments more responsive, personalised, and scalable to build.",
    useCases: [
      {
        title: "Intelligent Virtual Assistants in XR",
        description: "AI agents that operate as guides, assistants, or characters within AR/VR environments, understanding and responding to natural language.",
      },
      {
        title: "Procedural Content Generation",
        description: "AI systems that generate environments, scenarios, and assets dynamically - reducing the cost and time of XR content creation.",
      },
      {
        title: "XR Training & Simulation",
        description: "AI-powered training simulations that adapt difficulty, provide real-time feedback, and track learner progress in immersive environments.",
      },
      {
        title: "Spatial Computing & Scene Understanding",
        description: "AI agents that interpret physical spaces and anchor digital content contextually to real-world objects and surfaces.",
      },
    ],
    agentLibrarySlug: "ar-vr",
    relatedSlugs: ["technology", "robotics", "video-editing"],
  },

  {
    slug: "procurement",
    name: "Procurement",
    metaTitle: "Best AI Agents for Procurement | AgenticLib",
    metaDescription:
      "Explore AI agents for procurement - supplier management, spend analysis, contract automation, and purchase order processing.",
    h1: "AI Agents for Procurement",
    intro:
      "Procurement teams manage billions in company spend, yet many still rely on manual processes and disconnected systems. AI agents are helping procurement professionals automate purchase order processing, surface savings opportunities from spend data, manage supplier risk, and accelerate contract review - driving significant cost and efficiency gains.",
    useCases: [
      {
        title: "Spend Analysis & Savings Identification",
        description: "AI agents that analyse transaction data across categories and suppliers to identify consolidation opportunities and cost savings.",
      },
      {
        title: "Supplier Risk & Performance Management",
        description: "Monitor supplier financial health, delivery performance, and compliance status continuously with AI-driven risk scoring.",
      },
      {
        title: "Purchase Order Automation",
        description: "Automate PO creation, approval routing, and three-way matching to reduce cycle times and manual processing costs.",
      },
      {
        title: "Contract Review & Management",
        description: "AI agents that review supplier contracts, flag non-standard terms, and track key dates and renewal obligations.",
      },
    ],
    agentLibrarySlug: "procurement",
    relatedSlugs: ["logistics", "finance", "legal"],
  },

  {
    slug: "general-purpose",
    name: "General Purpose",
    metaTitle: "Best General-Purpose AI Agents | AgenticLib",
    metaDescription:
      "Discover the best general-purpose AI agents - versatile tools that automate tasks, assist with research, manage workflows, and boost productivity across any domain.",
    h1: "General-Purpose AI Agents",
    intro:
      "Not every AI agent is built for a single vertical. General-purpose AI agents are versatile, adaptable systems that can assist with research, writing, scheduling, data analysis, and workflow automation across virtually any context. They are often the starting point for individuals and teams exploring how AI can fit into their day-to-day work.",
    useCases: [
      {
        title: "Research & Information Retrieval",
        description: "AI agents that search, synthesise, and summarise information from multiple sources to answer complex questions quickly.",
      },
      {
        title: "Writing & Document Automation",
        description: "Draft emails, reports, proposals, and documentation - then refine and adapt them to any tone, format, or audience.",
      },
      {
        title: "Task & Workflow Automation",
        description: "Connect tools, automate repetitive tasks, and coordinate multi-step workflows without writing code.",
      },
      {
        title: "Data Analysis & Visualisation",
        description: "AI agents that interpret datasets, identify trends, and generate visualisations and summaries on demand.",
      },
    ],
    agentLibrarySlug: "general-purpose-technology",
    relatedSlugs: ["ai-agent-developer", "technology", "customer-experience"],
  },

  {
    slug: "technology",
    name: "Technology",
    metaTitle: "Best AI Agents for Technology Companies | AgenticLib",
    metaDescription:
      "Find AI agents for technology companies - software development assistance, DevOps automation, code review, incident management, and technical documentation.",
    h1: "AI Agents for Technology Companies",
    intro:
      "Technology teams are among the earliest and most effective adopters of AI agents. From AI coding assistants that accelerate software development, to intelligent DevOps agents that automate deployments and manage incidents, the right AI tools can significantly compress development cycles and improve system reliability.",
    useCases: [
      {
        title: "AI-Assisted Software Development",
        description: "AI coding agents that write, review, refactor, and debug code - helping developers ship faster with fewer errors.",
      },
      {
        title: "DevOps & Deployment Automation",
        description: "Automate CI/CD pipelines, infrastructure provisioning, and deployment processes with intelligent agents that handle edge cases.",
      },
      {
        title: "Incident Detection & Response",
        description: "AI agents that monitor system health, detect anomalies, and guide or automate incident response to minimise downtime.",
      },
      {
        title: "Technical Documentation Generation",
        description: "Automatically generate and maintain API docs, runbooks, and technical specs from code and system state.",
      },
    ],
    agentLibrarySlug: "general-purpose-technology",
    relatedSlugs: ["cybersecurity", "ai-agent-developer", "robotics"],
  },

  {
    slug: "gaming",
    name: "Gaming",
    metaTitle: "Best AI Agents for Gaming | AgenticLib",
    metaDescription:
      "Discover AI agents for gaming - procedural content generation, NPC behaviour, player analytics, anti-cheat, and game testing automation.",
    h1: "AI Agents for Gaming",
    intro:
      "AI agents are reshaping every layer of the gaming industry - from the way games are designed and tested, to how players experience them in real time. Game studios are deploying AI to generate procedural content at scale, power more believable NPC behaviour, personalise player journeys, and accelerate QA pipelines that would otherwise take weeks.",
    useCases: [
      {
        title: "Procedural Content Generation",
        description:
          "AI agents that generate levels, environments, quests, and assets dynamically - reducing manual design time and increasing replayability.",
      },
      {
        title: "NPC Behaviour & Dialogue",
        description:
          "Power non-player characters with AI-driven decision-making and natural language dialogue for more immersive, reactive game worlds.",
      },
      {
        title: "Player Analytics & Personalisation",
        description:
          "Analyse player behaviour in real time to personalise difficulty, content recommendations, and in-game offers for each user.",
      },
      {
        title: "Automated Game Testing & QA",
        description:
          "AI agents that simulate player actions across thousands of scenarios to detect bugs, balance issues, and exploits faster than human testers.",
      },
    ],
    agentLibrarySlug: "gaming",
    relatedSlugs: ["ar-vr", "media", "technology"],
  },

  {
    slug: "chemical-industry",
    name: "Chemical Industry",
    metaTitle: "Best AI Agents for the Chemical Industry | AgenticLib",
    metaDescription:
      "Explore AI agents for the chemical industry - process optimisation, safety monitoring, formulation discovery, and supply chain automation.",
    h1: "AI Agents for the Chemical Industry",
    intro:
      "Chemical manufacturers and R&D organisations are turning to AI agents to accelerate formulation discovery, optimise complex production processes, and maintain the highest standards of safety and regulatory compliance. AI is compressing the timeline from lab to production while reducing waste and operational risk across the value chain.",
    useCases: [
      {
        title: "Process Optimisation",
        description:
          "AI agents that continuously monitor reactor conditions, adjust parameters in real time, and maximise yield while minimising energy and raw material usage.",
      },
      {
        title: "Formulation & Material Discovery",
        description:
          "Accelerate R&D by using AI to predict formulation performance, identify candidate compounds, and reduce the number of physical experiments required.",
      },
      {
        title: "Safety & Hazard Monitoring",
        description:
          "Real-time AI monitoring of plant conditions to detect hazardous deviations, trigger alerts, and support proactive safety management.",
      },
      {
        title: "Regulatory Compliance & Documentation",
        description:
          "Automate safety data sheet generation, track regulatory changes across jurisdictions, and maintain compliance documentation at scale.",
      },
    ],
    agentLibrarySlug: "chemical-industry",
    relatedSlugs: ["life-sciences", "material-manufacturing", "procurement"],
  },

  {
    slug: "hedge-funds",
    name: "Hedge Funds",
    metaTitle: "Best AI Agents for Hedge Funds | AgenticLib",
    metaDescription:
      "Find AI agents for hedge funds - quantitative strategy development, alternative data analysis, risk management, and portfolio monitoring.",
    h1: "AI Agents for Hedge Funds",
    intro:
      "Hedge funds operate in an environment where information advantage and execution speed are everything. AI agents are giving quant and discretionary managers a step-change in analytical capacity - processing alternative data sets at scale, generating and backtesting strategies faster, and monitoring risk across complex portfolios in real time.",
    useCases: [
      {
        title: "Quantitative Strategy Development",
        description:
          "Build, backtest, and optimise trading strategies across asset classes using AI agents that surface non-obvious alpha signals from large datasets.",
      },
      {
        title: "Alternative Data Analysis",
        description:
          "Process satellite imagery, web traffic, earnings call transcripts, and social sentiment data to generate differentiated investment signals.",
      },
      {
        title: "Portfolio Risk Management",
        description:
          "Continuously monitor factor exposures, correlation risks, and tail scenarios across the full portfolio - with automated alerts when thresholds are breached.",
      },
      {
        title: "Investor Reporting Automation",
        description:
          "Generate accurate, bespoke investor reports and performance attribution analyses automatically, reducing the time spent on reporting operations.",
      },
    ],
    agentLibrarySlug: "hedge-funds",
    relatedSlugs: ["trading", "finance", "financial-advisory"],
  },

  {
    slug: "inventory-management",
    name: "Inventory Management",
    metaTitle: "Best AI Agents for Inventory Management | AgenticLib",
    metaDescription:
      "Discover AI agents for inventory management - demand forecasting, automated replenishment, stockout prevention, and warehouse optimisation.",
    h1: "AI Agents for Inventory Management",
    intro:
      "Inventory is one of the largest working capital commitments in any product business, and getting it wrong is expensive in both directions. AI agents are enabling operations teams to forecast demand with greater accuracy, automate replenishment decisions, and optimise stock positioning across locations - reducing both stockouts and excess inventory simultaneously.",
    useCases: [
      {
        title: "Demand Forecasting",
        description:
          "AI agents that incorporate sales history, seasonality, promotions, and external signals to generate accurate forward-looking demand forecasts.",
      },
      {
        title: "Automated Replenishment",
        description:
          "Trigger purchase orders and transfer requests automatically based on reorder points, lead times, and forecast data - without manual intervention.",
      },
      {
        title: "Stockout & Overstock Prevention",
        description:
          "Continuously monitor inventory health across SKUs and locations, flagging at-risk items before they result in lost sales or write-downs.",
      },
      {
        title: "Warehouse Slotting & Layout Optimisation",
        description:
          "AI agents that recommend optimal product placement within warehouses to minimise pick times and improve throughput.",
      },
    ],
    agentLibrarySlug: "inventory-management",
    relatedSlugs: ["logistics", "retail", "procurement"],
  },

  {
    slug: "material-manufacturing",
    name: "Material Manufacturing",
    metaTitle: "Best AI Agents for Material Manufacturing | AgenticLib",
    metaDescription:
      "Explore AI agents for material manufacturing - predictive maintenance, quality control, production scheduling, and defect detection.",
    h1: "AI Agents for Material Manufacturing",
    intro:
      "Material manufacturers face constant pressure to improve quality, reduce downtime, and operate with leaner margins. AI agents are being deployed across production lines to predict equipment failures before they happen, detect defects in real time, optimise scheduling, and reduce waste - delivering measurable improvements in OEE and output quality.",
    useCases: [
      {
        title: "Predictive Maintenance",
        description:
          "Monitor equipment telemetry continuously to predict failures before they cause unplanned downtime, and schedule maintenance at the optimal time.",
      },
      {
        title: "Automated Quality Inspection",
        description:
          "Deploy computer vision AI agents on production lines to detect surface defects, dimensional non-conformance, and assembly errors in real time.",
      },
      {
        title: "Production Scheduling Optimisation",
        description:
          "AI agents that optimise production sequences, machine allocation, and shift planning to maximise throughput and reduce changeover time.",
      },
      {
        title: "Yield & Waste Reduction",
        description:
          "Identify the root causes of material waste and yield loss using AI pattern analysis across process variables, batches, and equipment settings.",
      },
    ],
    agentLibrarySlug: "material-manufacturing",
    relatedSlugs: ["chemical-industry", "robotics", "procurement"],
  },

  {
    slug: "fashion-design",
    name: "Fashion Design",
    metaTitle: "Best AI Agents for Fashion Design | AgenticLib",
    metaDescription:
      "Find AI agents for fashion design - trend forecasting, generative design, virtual try-on, and supply chain sustainability tools.",
    h1: "AI Agents for Fashion Design",
    intro:
      "Fashion is a creative industry that operates on tight timelines and increasingly demands sustainability and personalisation at scale. AI agents are helping designers and brands forecast trends earlier, generate design concepts faster, reduce waste through smarter production planning, and deliver personalised shopping experiences that convert.",
    useCases: [
      {
        title: "Trend Forecasting & Market Intelligence",
        description:
          "AI agents that analyse social media, runway data, and search trends to surface emerging styles and colour palettes before they peak.",
      },
      {
        title: "Generative Design Assistance",
        description:
          "Generate concept sketches, pattern variations, and colourway options from designer prompts - accelerating the creative ideation process.",
      },
      {
        title: "Virtual Try-On & Fit Prediction",
        description:
          "AI tools that let customers virtually try garments and predict fit based on body measurements, reducing returns and improving conversion.",
      },
      {
        title: "Sustainable Production Planning",
        description:
          "Optimise fabric utilisation, minimise deadstock, and align production volumes with demand forecasts to reduce environmental impact.",
      },
    ],
    agentLibrarySlug: "fashion-design",
    relatedSlugs: ["retail", "ecommerce", "marketing"],
  },

  {
    slug: "research-innovation",
    name: "Research & Innovation",
    metaTitle: "Best AI Agents for Research & Innovation | AgenticLib",
    metaDescription:
      "Discover AI agents for research and innovation - literature review automation, hypothesis generation, experiment design, and IP monitoring.",
    h1: "AI Agents for Research & Innovation",
    intro:
      "Research teams across academia, corporate R&D, and innovation labs are using AI agents to dramatically accelerate the cycle from question to insight. By automating literature review, surfacing connections across disparate research, and assisting with experiment design and analysis, AI agents are compressing discovery timelines while reducing the burden of administrative research work.",
    useCases: [
      {
        title: "Literature Review & Synthesis",
        description:
          "AI agents that scan thousands of papers, extract key findings, and synthesise the state of knowledge on any research topic in minutes.",
      },
      {
        title: "Hypothesis Generation & Experiment Design",
        description:
          "Generate novel research hypotheses and suggest experimental designs by identifying gaps and patterns across existing literature.",
      },
      {
        title: "Data Analysis & Pattern Recognition",
        description:
          "Process large experimental datasets to identify significant patterns, anomalies, and correlations that manual analysis would miss.",
      },
      {
        title: "IP Monitoring & Patent Intelligence",
        description:
          "AI agents that monitor patent filings, competitor publications, and technology trends to inform R&D strategy and protect IP.",
      },
    ],
    agentLibrarySlug: "research-innovation",
    relatedSlugs: ["life-sciences", "chemical-industry", "ai-agent-developer"],
  },

  {
    slug: "life-sciences",
    name: "Life Sciences",
    metaTitle: "Best AI Agents for Life Sciences | AgenticLib",
    metaDescription:
      "Explore AI agents for life sciences - drug discovery, clinical trial optimisation, regulatory submissions, and genomic data analysis.",
    h1: "AI Agents for Life Sciences",
    intro:
      "Life sciences organisations are deploying AI agents to tackle some of the most complex and high-stakes challenges in science - from accelerating drug discovery and optimising clinical trial design, to automating regulatory submissions and interpreting vast genomic datasets. AI is not replacing scientific expertise; it is giving scientists the tools to work at a scale and speed that was previously impossible.",
    useCases: [
      {
        title: "Drug Discovery & Target Identification",
        description:
          "AI agents that analyse biological data, identify disease targets, and predict molecular candidates - compressing early-stage discovery timelines significantly.",
      },
      {
        title: "Clinical Trial Optimisation",
        description:
          "Improve patient recruitment, site selection, and trial protocol design using AI to reduce costs and increase the probability of trial success.",
      },
      {
        title: "Genomic & Omics Data Analysis",
        description:
          "Process whole-genome sequencing, proteomics, and multi-omics datasets with AI agents that surface clinically relevant insights at scale.",
      },
      {
        title: "Regulatory Submission Automation",
        description:
          "Automate the preparation of regulatory dossiers, cross-reference requirements across jurisdictions, and track submission status in real time.",
      },
    ],
    agentLibrarySlug: "life-sciences",
    relatedSlugs: ["healthcare", "research-innovation", "chemical-industry"],
  },

  {
    slug: "recruitment",
    name: "Recruitment",
    metaTitle: "Best AI Agents for Recruitment | AgenticLib",
    metaDescription:
      "Find AI agents for recruitment - resume screening, candidate sourcing, interview scheduling, and hiring workflow automation.",
    h1: "AI Agents for Recruitment",
    intro:
      "Recruiting teams are inundated with applications, yet still struggle to find and engage the best candidates quickly enough. AI agents are transforming the hiring workflow - automating the time-consuming work of screening, sourcing, and scheduling while helping recruiters focus their energy on the human judgment that actually matters in hiring decisions.",
    useCases: [
      {
        title: "Resume Screening & Shortlisting",
        description:
          "AI agents that parse and rank applications against job requirements - surfacing the strongest candidates instantly from hundreds of submissions.",
      },
      {
        title: "Candidate Sourcing & Outreach",
        description:
          "Proactively identify passive candidates across LinkedIn and talent databases, and send personalised outreach messages at scale.",
      },
      {
        title: "Interview Scheduling Automation",
        description:
          "Eliminate back-and-forth by automating interview scheduling, reminders, and rescheduling across recruiter and candidate calendars.",
      },
      {
        title: "Candidate Engagement & Nurturing",
        description:
          "Keep candidates informed and engaged throughout the hiring process with automated, personalised communication that reflects your employer brand.",
      },
    ],
    agentLibrarySlug: "recruitment",
    relatedSlugs: ["customer-experience", "marketing", "legal"],
  },

  {
    slug: "film-making",
    name: "Film Making",
    metaTitle: "Best AI Agents for Film Making | AgenticLib",
    metaDescription:
      "Discover AI agents for film making - scriptwriting assistance, pre-production planning, visual effects, post-production automation, and distribution.",
    h1: "AI Agents for Film Making",
    intro:
      "Film production is one of the most logistically complex and creatively demanding industries in the world. AI agents are giving studios, independent filmmakers, and production companies new tools to develop scripts faster, plan shoots more efficiently, accelerate post-production workflows, and reach audiences more effectively - without replacing the creative vision at the heart of filmmaking.",
    useCases: [
      {
        title: "Script Development & Story Analysis",
        description:
          "AI agents that assist with script drafting, coverage analysis, dialogue refinement, and story structure feedback to accelerate development.",
      },
      {
        title: "Pre-Production Planning",
        description:
          "Automate scheduling, budgeting, location scouting research, and shot list generation to reduce pre-production time and cost.",
      },
      {
        title: "Visual Effects & Post-Production",
        description:
          "AI tools that accelerate rotoscoping, colour grading, VFX compositing, and subtitle generation to compress post-production timelines.",
      },
      {
        title: "Audience Analytics & Distribution",
        description:
          "Analyse audience data and platform performance to optimise release strategy, marketing spend, and content distribution decisions.",
      },
    ],
    agentLibrarySlug: "film-making",
    relatedSlugs: ["media", "video-editing", "marketing"],
  },
];

export function getSeoDomain(slug: string): SeoDomain | undefined {
  return seoDomains.find((d) => d.slug === slug);
}
