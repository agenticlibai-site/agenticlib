/* Domain-specific copy for the "Help your PMs build a better AI product"
   section on each solution page: one description + four points per pillar
   (pillar titles stay the same everywhere), plus who the end user is and
   which signals feed the Customer context tile. */

export type DomainCopy = {
  /** Tile colours for this domain: two soft tints, a border and a dark accent */
  tint: { a: string; b: string; border: string; accent: string };
  /** Singular end user, capitalised: "Patient", "Policyholder" */
  user: string;
  /** Section lead under the heading */
  lead: string;
  /** Five signal sources shown as chips in the context tile */
  sources: string[];
  /** The sources linked to the example need (subset of sources) */
  linked: string[];
  /** Per pillar, in order: workflow, roadmap, behaviour, evaluation, context, knowledge */
  pillars: { body: string; items: string[] }[];
  /** Subtitles on the example screens */
  screens: {
    workflowSub: string;
    roadmapSub: string;
    reviewSub: string;
    decisionSub: string;
  };
};

export const DOMAIN_COPY: Record<string, DomainCopy> = {
  "insurance-ai": {
    tint: { a: "#FFEFEC", b: "#FFDDD6", border: "#F8C9BF", accent: "#C2412B" },
    screens: {
      workflowSub: "Where policyholders drop off",
      roadmapSub: "From policyholder and adjuster signals",
      reviewSub: "Friction found in this claim call",
      decisionSub: "Why the claims agent works this way",
    },
    user: "Policyholder",
    lead: "Your PMs know where policyholders struggle and what to build next, backed by your claims calls, complaints, adjuster notes and agent logs.",
    sources: [
      "Claims calls",
      "Complaints",
      "Adjuster notes",
      "Agent logs",
      "Policy data",
    ],
    linked: ["Complaints", "Agent logs", "Adjuster notes"],
    pillars: [
      {
        body: "See exactly where policyholders stall or drop off. FeatureStream maps every claim and policy conversation to its steps.",
        items: [
          "Map policyholder problems to claims steps",
          "Find where claims stall before settlement",
          "Prioritise fixes by drop-off and cost",
          "Track cycle times after each change",
        ],
      },
      {
        body: "A ranked roadmap built from what policyholders and adjusters ask for, each item linked to the conversations behind it.",
        items: [
          "Capture requests from claims and service",
          "Spot recurring coverage questions",
          "Prioritise by claim volume and risk",
          "Tie improvements to settlement outcomes",
        ],
      },
      {
        body: "Fewer confused and frustrated policyholders. FeatureStream flags issues like unclear cover decisions and ties each one to a fix.",
        items: [
          "Find repeated coverage misunderstandings",
          "Spot frustration in distressing claims",
          "Flag unfair or unclear decisions",
          "Track complaints after each change",
        ],
      },
      {
        body: "No surprises after release. FeatureStream tests each new version on past claims and show what improved, what regressed and any new compliance risk.",
        items: [
          "Build scenarios from past claims",
          "Compare versions on accuracy and fairness",
          "Watch for new compliance risks",
          "Learn from adjuster overrides",
        ],
      },
      {
        body: "Every roadmap item backed by real evidence. FeatureStream links calls, complaints and adjuster notes to the policyholder need behind them.",
        items: [
          "Combine calls, complaints and notes",
          "Understand what policyholders need",
          "Link needs to roadmap items",
          "Keep history across policy renewals",
        ],
      },
      {
        body: "A clear record of why each cover rule and decision exists, so new PMs and auditors can follow the reasoning.",
        items: [
          "Record why claims rules exist",
          "Track product and wording changes",
          "Keep an audit-ready decision history",
          "Onboard new PMs to insurance quickly",
        ],
      },
    ],
  },

  "sales-ai": {
    tint: { a: "#FFF3E6", b: "#FFE2C6", border: "#F8D0A9", accent: "#B65A1A" },
    screens: {
      workflowSub: "Where prospects stop replying",
      roadmapSub: "From prospect replies and rep feedback",
      reviewSub: "Friction found in this email thread",
      decisionSub: "Why the SDR agent works this way",
    },
    user: "Prospect",
    lead: "Your PMs know where prospects drop off and what to build next, backed by your sales calls, email replies, CRM data and agent logs.",
    sources: [
      "Sales calls",
      "Rep feedback",
      "CRM data",
      "Agent logs",
      "Email replies",
    ],
    linked: ["Sales calls", "Agent logs", "CRM data"],
    pillars: [
      {
        body: "See the exact step where leads go quiet. FeatureStream maps every prospect conversation from first touch to booked meeting.",
        items: [
          "Map lead journeys from reply to meeting",
          "Find where qualification breaks down",
          "Prioritise fixes by pipeline impact",
          "Track speed to lead after changes",
        ],
      },
      {
        body: "A ranked roadmap built from rep feedback and prospect objections, each item linked to the threads behind it.",
        items: [
          "Capture requests from sales reps",
          "Spot recurring objections",
          "Prioritise by meetings and pipeline",
          "Tie improvements to qualified meetings",
        ],
      },
      {
        body: "Outreach that sounds on-brand and keeps prospects engaged. FeatureStream flags repetitive or off-putting messages and ties each to a fix.",
        items: [
          "Find off-brand or repetitive messages",
          "Spot prospects annoyed by follow-ups",
          "Flag wrong-fit leads passed to reps",
          "Track reply rates after each change",
        ],
      },
      {
        body: "No surprises after release. FeatureStream tests each new version on past prospect threads and show where qualification improved or regressed.",
        items: [
          "Build scenarios from past threads",
          "Compare versions on qualification accuracy",
          "Watch for opt-out and spam risk",
          "Learn from rep corrections",
        ],
      },
      {
        body: "Every roadmap item backed by real evidence. FeatureStream links calls, emails and CRM notes to the prospect need behind them.",
        items: [
          "Combine calls, emails and CRM notes",
          "Understand what reps need from leads",
          "Link needs to roadmap items",
          "Keep account history across cycles",
        ],
      },
      {
        body: "A clear record of why each qualification and routing rule exists, so sales leaders and new PMs can follow the reasoning.",
        items: [
          "Record why routing rules exist",
          "Track messaging and offer changes",
          "Share decisions with sales leaders",
          "Onboard new PMs to sales quickly",
        ],
      },
    ],
  },

  "finance-ai": {
    tint: { a: "#F2F9E8", b: "#E1F1CB", border: "#CDE4AE", accent: "#4C6A1A" },
    screens: {
      workflowSub: "Where month-end slows down",
      roadmapSub: "From finance team and reviewer signals",
      reviewSub: "Friction found in this report review",
      decisionSub: "Why the finance agent works this way",
    },
    user: "Finance team",
    lead: "Your PMs know where finance teams lose time and what to build next, backed by your exception queues, controller feedback, audit findings and agent logs.",
    sources: [
      "Exception queues",
      "Controller feedback",
      "Audit findings",
      "Agent logs",
      "ERP data",
    ],
    linked: ["Controller feedback", "Audit findings", "ERP data"],
    pillars: [
      {
        body: "See exactly where exceptions pile up. FeatureStream maps each invoice, match and close task to its steps.",
        items: [
          "Map finance problems to process steps",
          "Find where exceptions pile up",
          "Prioritise fixes by hours saved",
          "Track close times after each change",
        ],
      },
      {
        body: "A ranked roadmap built from controller requests and audit findings, each item linked to the cases behind it.",
        items: [
          "Capture requests from controllers",
          "Spot recurring exception types",
          "Prioritise by volume and risk",
          "Tie improvements to close outcomes",
        ],
      },
      {
        body: "Outputs finance teams trust. FeatureStream flags matching errors and unexplained numbers and ties each one to a fix.",
        items: [
          "Find repeated matching errors",
          "Spot where teams stop trusting outputs",
          "Flag unexplained numbers",
          "Track manual rework after changes",
        ],
      },
      {
        body: "No surprises after release. FeatureStream tests each new version on past exceptions and ledgers and show match accuracy and any new control risk.",
        items: [
          "Build scenarios from past exceptions",
          "Compare versions on match accuracy",
          "Watch for control and audit risks",
          "Learn from reviewer corrections",
        ],
      },
      {
        body: "Every roadmap item backed by real evidence. FeatureStream links queues, controller notes and audit findings to the finance team need behind them.",
        items: [
          "Combine queues, notes and findings",
          "Understand what finance teams need",
          "Link needs to roadmap items",
          "Keep context across close cycles",
        ],
      },
      {
        body: "An audit-ready history of every decision, with a clear record of why each control and threshold exists.",
        items: [
          "Record why controls exist",
          "Track policy and threshold changes",
          "Keep an audit-ready decision history",
          "Onboard new PMs to finance quickly",
        ],
      },
    ],
  },

  "trades-ai": {
    tint: { a: "#FFFBE3", b: "#FFF3B8", border: "#F3E39A", accent: "#7A6400" },
    screens: {
      workflowSub: "Where quotes stall before sending",
      roadmapSub: "From tradie edits and customer replies",
      reviewSub: "Friction found in this quote",
      decisionSub: "Why the admin agent works this way",
    },
    user: "Tradie",
    lead: "Your PMs know where admin gets stuck and what to build next, backed by your tradies’ voice notes, quotes, invoices and agent logs.",
    sources: [
      "Voice notes",
      "Quotes sent",
      "Invoices",
      "Agent logs",
      "Customer replies",
    ],
    linked: ["Voice notes", "Quotes sent", "Agent logs"],
    pillars: [
      {
        body: "See exactly where quotes and invoices stall. FeatureStream maps each job from site visit to paid invoice.",
        items: [
          "Map tradie admin to quote and invoice steps",
          "Find where quotes stall before sending",
          "Prioritise fixes by unsent and unpaid work",
          "Track time to invoice after each change",
        ],
      },
      {
        body: "A ranked roadmap built from tradie edits and customer replies, each item linked to the jobs behind it.",
        items: [
          "Capture requests from tradies on site",
          "Spot recurring pricing and paperwork gaps",
          "Prioritise by quotes won and jobs paid",
          "Tie improvements to jobs invoiced",
        ],
      },
      {
        body: "Less retyping for tradies and fewer missed enquiries. FeatureStream flags quotes with missing line items and ties each issue to a fix.",
        items: [
          "Find quotes with missed line items",
          "Spot tradies retyping agent output",
          "Flag unanswered customer enquiries",
          "Track corrections after each change",
        ],
      },
      {
        body: "No surprises after release. FeatureStream tests each new version on past voice notes and jobs and show quote and invoice accuracy side by side.",
        items: [
          "Build scenarios from past voice notes",
          "Compare versions on quote and invoice accuracy",
          "Watch for safety document risks",
          "Learn from tradie edits",
        ],
      },
      {
        body: "Every roadmap item backed by real evidence. FeatureStream links voice notes, quotes and customer replies to the tradie need behind them.",
        items: [
          "Combine notes, quotes and replies",
          "Understand what tradies need",
          "Link needs to roadmap items",
          "Keep history across repeat clients",
        ],
      },
      {
        body: "A clear record of why each pricing rule and safety template exists, so support and new PMs can follow the reasoning.",
        items: [
          "Record why pricing rules exist",
          "Track SWMS template changes",
          "Share decisions with support and onboarding",
          "Onboard new PMs to the trades quickly",
        ],
      },
    ],
  },

  "legal-ai": {
    tint: { a: "#EEF8F2", b: "#D9F0E3", border: "#C2E4D1", accent: "#1F6F5C" },
    screens: {
      workflowSub: "Where answers lose lawyers’ trust",
      roadmapSub: "From associate and partner feedback",
      reviewSub: "Friction found in this research answer",
      decisionSub: "Why the research agent works this way",
    },
    user: "Lawyer",
    lead: "Your PMs know where lawyers lose trust and what to build next, backed by lawyer feedback, matter notes, citation checks and agent logs.",
    sources: [
      "Lawyer feedback",
      "Matter notes",
      "Citation checks",
      "Agent logs",
      "Client emails",
    ],
    linked: ["Lawyer feedback", "Agent logs", "Citation checks"],
    pillars: [
      {
        body: "See exactly where lawyers re-check the agent’s work. FeatureStream maps each research, review and intake task to its steps.",
        items: [
          "Map lawyer problems to task steps",
          "Find where answers get re-checked",
          "Prioritise fixes by hours saved",
          "Track review time after changes",
        ],
      },
      {
        body: "A ranked roadmap built from practice group requests and research gaps, each item linked to the matters behind it.",
        items: [
          "Capture requests from practice groups",
          "Spot recurring research gaps",
          "Prioritise by matter volume and risk",
          "Tie improvements to trusted answers",
        ],
      },
      {
        body: "Work lawyers can rely on. FeatureStream flags unsupported citations, missed clauses and missed deadlines and ties each one to a fix.",
        items: [
          "Find unsupported citations",
          "Spot where lawyers stop trusting answers",
          "Flag missed clauses and deadlines",
          "Track re-checks after each change",
        ],
      },
      {
        body: "No surprises after release. FeatureStream tests each new version on past legal questions and documents and show citation accuracy and any new risk.",
        items: [
          "Build scenarios from past matters",
          "Compare versions on citation accuracy",
          "Watch for privilege and advice risks",
          "Learn from lawyer edits",
        ],
      },
      {
        body: "Every roadmap item backed by real evidence. FeatureStream links lawyer feedback, matter notes and citation checks to the lawyer need behind them.",
        items: [
          "Combine feedback, notes and checks",
          "Understand what lawyers need",
          "Link needs to roadmap items",
          "Keep context across matters",
        ],
      },
      {
        body: "A defensible history of every decision, with a clear record of why each playbook and review rule exists.",
        items: [
          "Record why review rules exist",
          "Track playbook and jurisdiction changes",
          "Keep a defensible decision history",
          "Onboard new PMs to legal quickly",
        ],
      },
    ],
  },

  "dental-ai": {
    tint: { a: "#ECF8F7", b: "#D5F0EE", border: "#BCE3E0", accent: "#14646A" },
    screens: {
      workflowSub: "Where patient calls fail to book",
      roadmapSub: "From patient calls and front desk notes",
      reviewSub: "Friction found in this patient call",
      decisionSub: "Why the reception agent works this way",
    },
    user: "Patient",
    lead: "Your PMs know where calls fail to book and what to build next, backed by your patient calls, front desk notes, practice data and agent logs.",
    sources: [
      "Patient calls",
      "Front desk notes",
      "Practice data",
      "Agent logs",
      "Patient reviews",
    ],
    linked: ["Patient calls", "Agent logs", "Front desk notes"],
    pillars: [
      {
        body: "See exactly where patients hang up before booking. FeatureStream maps each patient call to its steps.",
        items: [
          "Map patient problems to call steps",
          "Find where patients hang up",
          "Prioritise fixes by empty chair time",
          "Track bookings after each change",
        ],
      },
      {
        body: "A ranked roadmap built from front desk requests and patient questions, each item linked to the calls behind it.",
        items: [
          "Capture requests from front desk staff",
          "Spot recurring insurance questions",
          "Prioritise by bookings and recalls",
          "Tie improvements to kept appointments",
        ],
      },
      {
        body: "Calmer patients and no missed emergencies. FeatureStream flags unanswered coverage questions and anxious callers and ties each issue to a fix.",
        items: [
          "Find unanswered coverage questions",
          "Spot anxious or frustrated patients",
          "Flag missed dental emergencies",
          "Track hang-ups after each change",
        ],
      },
      {
        body: "No surprises after release. FeatureStream tests each new version on past patient calls and show booking accuracy and any new privacy or clinical risk.",
        items: [
          "Build scenarios from past calls",
          "Compare versions on booking accuracy",
          "Watch for privacy and clinical risks",
          "Learn from front desk corrections",
        ],
      },
      {
        body: "Every roadmap item backed by real evidence. FeatureStream links calls, front desk notes and reviews to the patient need behind them.",
        items: [
          "Combine calls, notes and reviews",
          "Understand what patients need",
          "Link needs to roadmap items",
          "Keep history across visits",
        ],
      },
      {
        body: "A clear record of why each triage and booking rule exists, so practice managers and new PMs can follow the reasoning.",
        items: [
          "Record why triage rules exist",
          "Track insurance and scheduling changes",
          "Share decisions with practice managers",
          "Onboard new PMs to dental quickly",
        ],
      },
    ],
  },

  "video-ai": {
    tint: { a: "#FFF0F5", b: "#FFDCE8", border: "#F7C6D7", accent: "#B23A68" },
    screens: {
      workflowSub: "Where drafts get scrapped",
      roadmapSub: "From creator edits and viewer signals",
      reviewSub: "Friction found in this video draft",
      decisionSub: "Why the video agent works this way",
    },
    user: "Creator",
    lead: "Your PMs know where projects stall and what to build next, backed by creator feedback, project data, render logs and agent logs.",
    sources: [
      "Creator feedback",
      "Project data",
      "Render logs",
      "Agent logs",
      "Support tickets",
    ],
    linked: ["Creator feedback", "Agent logs", "Project data"],
    pillars: [
      {
        body: "See exactly where creators abandon drafts. FeatureStream maps each project from topic to export.",
        items: [
          "Map creator problems to production steps",
          "Find where projects are abandoned",
          "Prioritise fixes by exported videos",
          "Track export rates after changes",
        ],
      },
      {
        body: "A ranked roadmap built from creator requests and editing needs, each item linked to the projects behind it.",
        items: [
          "Capture creator feature requests",
          "Spot recurring editing needs",
          "Prioritise by projects finished",
          "Tie improvements to published videos",
        ],
      },
      {
        body: "Videos that stay on script, on style and on voice. FeatureStream flags drift and repeated re-renders and ties each one to a fix.",
        items: [
          "Find scenes that drift from the script",
          "Spot frustration with re-renders",
          "Flag style and voice inconsistencies",
          "Track regenerations after each change",
        ],
      },
      {
        body: "No surprises after release. FeatureStream tests each new version on past projects and show script adherence and any new content policy risk.",
        items: [
          "Build scenarios from past projects",
          "Compare versions on script adherence",
          "Watch for content policy risks",
          "Learn from creator edits",
        ],
      },
      {
        body: "Every roadmap item backed by real evidence. FeatureStream links creator feedback, project data and tickets to the creator need behind them.",
        items: [
          "Combine feedback, projects and tickets",
          "Understand what creators need",
          "Link needs to roadmap items",
          "Keep each channel’s style over time",
        ],
      },
      {
        body: "A clear record of why each style and generation rule exists, so the team and new PMs can follow the reasoning.",
        items: [
          "Record why generation rules exist",
          "Track model and style changes",
          "Share decisions with the team",
          "Onboard new PMs to video quickly",
        ],
      },
    ],
  },
};
