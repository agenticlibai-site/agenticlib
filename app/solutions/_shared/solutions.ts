// Content for the FeatureStream solution pages (navbar → Solutions).
//
// Every domain page shares one structure (see SolutionPage.tsx):
//   Hero (with investigation mock) → FeatureStream solutions (with tiles)
// Only the domain-specific parts live here: how each FeatureStream solution
// applies in the domain: the illustrative UI content.
//
// Research informs the domain examples. No company names appear
// anywhere on these pages.

export type Solution = {
  slug: string;
  navLabel: string;
  /** Used in sentences: "PMs building {term} AI agents" */
  term: string;
  /** Used in the hero: "Build the best {heroTerm} agents" */
  heroTerm: string;
  metaTitle: string;
  metaDescription: string;
  /** Illustrative FeatureStream investigation (example data only; InsightMock, not currently shown) */
  investigation: Investigation;
  /** Small illustrative tiles for the six solution pillars */
  tiles: Tiles;
};

export type Tiles = {
  workflow: { name: string; steps: string[]; stuck: number };
  roadmap: { name: string; kind: string; status: "Now" | "Next" | "Later" }[];
  message: { who: string; parts: (string | { hl: string })[] };
  issues: { label: string; risk: "High" | "Medium" }[];
  evaluation: {
    scenario: string;
    rows: { name: string; result: "Better" | "Same" | "Worse" }[];
  };
  context: { need: string };
  decisions: { text: string; why: string }[];
};

export type Investigation = {
  panelTitle: string;
  question: string;
  subtitle: string;
  trend: { title: string; a: string; b: string };
  funnel: { title: string; steps: [string, number][] };
  reasons: { title: string; rows: [string, number][] };
  steps: { kind: "calendar" | "doc" | "grid" | "dot" | "chip"; text: string }[];
};

const meta = (heroTerm: string) => ({
  metaTitle: `${heroTerm[0].toUpperCase()}${heroTerm.slice(1)} AI agents – FeatureStream`,
  metaDescription: `FeatureStream helps product teams building ${heroTerm} AI agents understand what to improve next, connect agent behaviour to outcomes, and keep improving their products.`,
});

export const SOLUTIONS: Solution[] = [
  {
    slug: "insurance-ai",
    navLabel: "Insurance",
    term: "insurance",
    heroTerm: "insurance",
    ...meta("insurance"),
    tiles: {
      message: {
        who: "Policyholder",
        parts: [
          "Is water damage covered? ",
          { hl: "I asked this already" },
          ". I ",
          { hl: "don’t have the receipts" },
          " yet.",
        ],
      },
      issues: [
        { label: "Missing documents", risk: "High" },
        { label: "Repeated coverage question", risk: "Medium" },
      ],
      workflow: {
        name: "Claims workflow",
        steps: [
          "Report incident",
          "Check cover",
          "Collect documents",
          "Assess claim",
          "Settle",
        ],
        stuck: 2,
      },
      roadmap: [
        {
          name: "Add documents after lodging",
          kind: "Workflow",
          status: "Now",
        },
        {
          name: "Policy system integration",
          kind: "Integration",
          status: "Next",
        },
        {
          name: "Remember earlier claim details",
          kind: "Memory",
          status: "Next",
        },
        {
          name: "Explain coverage decisions",
          kind: "Reasoning",
          status: "Later",
        },
      ],
      evaluation: {
        scenario: "Water damage claim without receipts",
        rows: [
          { name: "Coverage answer correct", result: "Better" },
          { name: "Documents asked for once", result: "Better" },
          { name: "Fair, consistent decisions", result: "Same" },
          { name: "Claim lodged in one call", result: "Better" },
        ],
      },
      context: {
        need: "Let customers lodge a claim first and add documents later",
      },
      decisions: [
        {
          text: "Ask for the incident date up front",
          why: "Cut follow-ups in claims",
        },
        {
          text: "Allow documents after lodging",
          why: "Most drop-off was at the document step",
        },
        {
          text: "Hand complex claims to an assessor",
          why: "Policyholders asked for a person",
        },
      ],
    },
    investigation: {
      panelTitle: "Claim drop-off",
      question: "Why are customers abandoning claims with the agent?",
      subtitle: "Investigation into claims conversations from the last 30 days",
      trend: {
        title: "30 day claims trend",
        a: "Claims started",
        b: "Claims lodged",
      },
      funnel: {
        title: "Claims funnel",
        steps: [
          ["Claim started", 1240],
          ["Details provided", 860],
          ["Claim lodged", 410],
        ],
      },
      reasons: {
        title: "Why customers drop off",
        rows: [
          ["Asked for documents they don’t have", 34],
          ["Unsure if they’re covered", 27],
          ["Couldn’t add photos", 21],
          ["Waited too long for a reply", 9],
        ],
      },
      steps: [
        {
          kind: "calendar",
          text: "Reviewing the last 30 days of claims conversations",
        },
        {
          kind: "doc",
          text: "Building a funnel to find where customers drop off",
        },
        {
          kind: "chip",
          text: "33% of started claims are lodged",
        },
        {
          kind: "dot",
          text: "Most drop-off happens when the agent asks for documents",
        },
        {
          kind: "grid",
          text: "Matching drop-offs to support tickets and customer requests",
        },
        {
          kind: "dot",
          text: "Found it: customers want to lodge first and upload documents later",
        },
        {
          kind: "doc",
          text: "Adding a roadmap item with evaluation tests",
        },
      ],
    },
  },
  {
    slug: "sales-ai",
    navLabel: "Sales",
    term: "sales",
    heroTerm: "sales",
    ...meta("sales and revenue"),
    tiles: {
      message: {
        who: "Prospect",
        parts: [
          "We ",
          { hl: "already spoke last week" },
          ". Why am I ",
          { hl: "getting the same intro" },
          " again?",
        ],
      },
      issues: [
        { label: "Contradicts CRM history", risk: "High" },
        { label: "Same intro sent twice", risk: "Medium" },
      ],
      workflow: {
        name: "Outreach workflow",
        steps: [
          "Find leads",
          "Research company",
          "Personalise outreach",
          "Send email",
          "Follow up",
        ],
        stuck: 2,
      },
      roadmap: [
        {
          name: "Read CRM history before writing",
          kind: "Integration",
          status: "Now",
        },
        { name: "Remember past conversations", kind: "Memory", status: "Next" },
        { name: "Company research tool", kind: "Tool", status: "Next" },
        {
          name: "Hand pricing questions to a rep",
          kind: "Workflow",
          status: "Later",
        },
      ],
      evaluation: {
        scenario: "Prospect already contacted last week",
        rows: [
          { name: "Uses CRM history", result: "Better" },
          { name: "Personalised to the account", result: "Better" },
          { name: "No repeated outreach", result: "Better" },
          { name: "Meeting booked", result: "Same" },
        ],
      },
      context: {
        need: "Pick up where the last conversation left off",
      },
      decisions: [
        {
          text: "Research the account before writing",
          why: "Generic intros were ignored",
        },
        {
          text: "Never resend the same intro",
          why: "Prospects flagged repeats",
        },
        {
          text: "Route pricing questions to a rep",
          why: "Reps were rewriting drafts",
        },
      ],
    },
    investigation: {
      panelTitle: "Outreach replies",
      question: "Why are prospects not replying to agent outreach?",
      subtitle: "Investigation into SDR agent outreach from the last 30 days",
      trend: {
        title: "30 day outreach trend",
        a: "Emails sent",
        b: "Replies",
      },
      funnel: {
        title: "Outreach funnel",
        steps: [
          ["Emails sent", 3200],
          ["Opened", 1450],
          ["Replied", 190],
        ],
      },
      reasons: {
        title: "Why prospects don’t reply",
        rows: [
          ["Repeats an earlier email", 31],
          ["Wrong role or company details", 24],
          ["No clear next step", 18],
          ["Sent at the wrong time", 11],
        ],
      },
      steps: [
        {
          kind: "calendar",
          text: "Reviewing the last 30 days of agent outreach",
        },
        {
          kind: "doc",
          text: "Building a funnel from sent to replied",
        },
        {
          kind: "chip",
          text: "6% of emails get a reply",
        },
        {
          kind: "dot",
          text: "Replies drop sharply when the prospect is already in the CRM",
        },
        {
          kind: "grid",
          text: "Matching low-reply emails to rep feedback and sales calls",
        },
        {
          kind: "dot",
          text: "Found it: the agent isn’t reading account history before writing",
        },
        {
          kind: "doc",
          text: "Adding a roadmap item with evaluation tests",
        },
      ],
    },
  },
  {
    slug: "finance-ai",
    navLabel: "Finance",
    term: "finance",
    heroTerm: "finance",
    ...meta("finance"),
    tiles: {
      message: {
        who: "Finance team",
        parts: [
          { hl: "Where does this figure come from" },
          "? And this ",
          { hl: "should be Q3, not Q2" },
          ".",
        ],
      },
      issues: [
        { label: "Figure can’t be traced to source", risk: "High" },
        { label: "Wrong forecast period", risk: "Medium" },
      ],
      workflow: {
        name: "Month-end reporting workflow",
        steps: ["Pull data", "Reconcile", "Draft report", "Review", "Publish"],
        stuck: 3,
      },
      roadmap: [
        {
          name: "Link every figure to its source",
          kind: "Workflow",
          status: "Now",
        },
        {
          name: "Accounting system integration",
          kind: "Integration",
          status: "Next",
        },
        { name: "Remember forecast settings", kind: "Memory", status: "Next" },
        { name: "Variance explanation tool", kind: "Tool", status: "Later" },
      ],
      evaluation: {
        scenario: "Q3 forecast summary",
        rows: [
          { name: "Figures tie to the ledger", result: "Better" },
          { name: "Correct reporting period", result: "Better" },
          { name: "Variances explained", result: "Same" },
          { name: "Ready for sign-off", result: "Better" },
        ],
      },
      context: {
        need: "Show the source behind every number",
      },
      decisions: [
        {
          text: "Link every figure to its source",
          why: "Users rebuilt reports by hand",
        },
        {
          text: "Confirm the forecast period first",
          why: "Drafts used the wrong period",
        },
        {
          text: "Flag figures that need approval",
          why: "Compliance asked for it",
        },
      ],
    },
    investigation: {
      panelTitle: "Report trust",
      question: "Why are users rebuilding agent reports by hand?",
      subtitle:
        "Investigation into reporting agent usage from the last 30 days",
      trend: {
        title: "30 day report trend",
        a: "Reports generated",
        b: "Reports exported",
      },
      funnel: {
        title: "Report funnel",
        steps: [
          ["Generated", 980],
          ["Reviewed", 720],
          ["Used without edits", 260],
        ],
      },
      reasons: {
        title: "Why users edit reports",
        rows: [
          ["Can’t see the source of a figure", 38],
          ["Wrong time period", 23],
          ["Currency not converted", 17],
          ["Variance not explained", 12],
        ],
      },
      steps: [
        {
          kind: "calendar",
          text: "Reviewing the last 30 days of reporting conversations",
        },
        {
          kind: "doc",
          text: "Building a funnel from generated to used",
        },
        {
          kind: "chip",
          text: "27% of reports are used without edits",
        },
        {
          kind: "dot",
          text: "Most edits happen on reports with no source links",
        },
        {
          kind: "grid",
          text: "Matching edits to user feedback and customer requests",
        },
        {
          kind: "dot",
          text: "Found it: users trust figures they can trace back to the ledger",
        },
        {
          kind: "doc",
          text: "Adding a roadmap item with evaluation tests",
        },
      ],
    },
  },
  {
    slug: "trades-ai",
    navLabel: "Trades",
    term: "trades admin",
    heroTerm: "trades",
    ...meta("trades admin"),
    tiles: {
      message: {
        who: "Tradie",
        parts: [
          "The quote ",
          { hl: "left out the call-out fee" },
          " and I had to ",
          { hl: "type the whole job again" },
          ".",
        ],
      },
      issues: [
        { label: "Pricing missed from voice note", risk: "High" },
        { label: "Tradie retyped the quote", risk: "Medium" },
      ],
      workflow: {
        name: "Quote workflow",
        steps: [
          "Record job on site",
          "Transcribe voice note",
          "Match price list",
          "Build branded quote",
          "Send and follow up",
        ],
        stuck: 2,
      },
      roadmap: [
        {
          name: "Use the tradie’s own price list",
          kind: "Workflow",
          status: "Now",
        },
        {
          name: "Job and accounting system sync",
          kind: "Integration",
          status: "Next",
        },
        { name: "Remember regular clients", kind: "Memory", status: "Next" },
        {
          name: "Draft the SWMS from the same job",
          kind: "Capability",
          status: "Later",
        },
      ],
      evaluation: {
        scenario: "Voice note for a switchboard upgrade",
        rows: [
          { name: "Line items captured", result: "Better" },
          { name: "Price list applied", result: "Better" },
          { name: "GST correct", result: "Same" },
          { name: "Sent without retyping", result: "Better" },
        ],
      },
      context: { need: "Turn one site voice note into a quote and a SWMS" },
      decisions: [
        {
          text: "Ask before adding a call-out fee",
          why: "Quotes went out underpriced",
        },
        {
          text: "Keep client data hosted in Australia",
          why: "Tradies asked where data lives",
        },
        {
          text: "Have a person sign off every SWMS",
          why: "Safety documents need review",
        },
      ],
    },
    investigation: {
      panelTitle: "Booking follow-ups",
      question: "Why are customers calling the office after booking?",
      subtitle:
        "Investigation into booking conversations from the last 30 days",
      trend: {
        title: "30 day booking trend",
        a: "Agent bookings",
        b: "Calls to office",
      },
      funnel: {
        title: "Booking funnel",
        steps: [
          ["Enquiry", 1580],
          ["Booking started", 1120],
          ["Confirmed", 640],
        ],
      },
      reasons: {
        title: "Why customers call",
        rows: [
          ["No arrival window given", 36],
          ["Unsure the booking went through", 22],
          ["Urgent job booked for next week", 15],
          ["Wrong address on the job", 9],
        ],
      },
      steps: [
        {
          kind: "calendar",
          text: "Reviewing the last 30 days of booking conversations",
        },
        {
          kind: "doc",
          text: "Building a funnel from enquiry to confirmed job",
        },
        {
          kind: "chip",
          text: "41% of enquiries become bookings",
        },
        {
          kind: "dot",
          text: "Customers who get no arrival window are most likely to call",
        },
        {
          kind: "grid",
          text: "Matching calls to support tickets and technician notes",
        },
        {
          kind: "dot",
          text: "Found it: arrival windows in confirmations are the top opportunity",
        },
        {
          kind: "doc",
          text: "Adding a roadmap item with evaluation tests",
        },
      ],
    },
  },
  {
    slug: "legal-ai",
    navLabel: "Legal",
    term: "legal",
    heroTerm: "legal",
    ...meta("legal"),
    tiles: {
      message: {
        who: "Associate",
        parts: [
          "This case ",
          { hl: "doesn’t support the answer" },
          ", and ",
          { hl: "which jurisdiction is this" },
          "?",
        ],
      },
      issues: [
        { label: "Unsupported citation", risk: "High" },
        { label: "Jurisdiction not checked", risk: "Medium" },
      ],
      workflow: {
        name: "Research workflow",
        steps: [
          "Read question",
          "Check jurisdiction",
          "Find authorities",
          "Check citations",
          "Draft answer",
        ],
        stuck: 3,
      },
      roadmap: [
        { name: "Check each citation first", kind: "Reasoning", status: "Now" },
        {
          name: "Case law database integration",
          kind: "Integration",
          status: "Next",
        },
        { name: "Remember matter context", kind: "Memory", status: "Next" },
        { name: "Clause playbook comparison", kind: "Tool", status: "Later" },
      ],
      evaluation: {
        scenario: "Clause question across two jurisdictions",
        rows: [
          { name: "Citations support the answer", result: "Better" },
          { name: "Right jurisdiction applied", result: "Better" },
          { name: "Matches the firm playbook", result: "Same" },
          { name: "Ready for partner review", result: "Better" },
        ],
      },
      context: {
        need: "Rely on citations without re-checking each one",
      },
      decisions: [
        {
          text: "Check each citation first",
          why: "Lawyers stopped relying on answers",
        },
        {
          text: "Ask for the jurisdiction up front",
          why: "Answers applied the wrong law",
        },
        {
          text: "Compare clauses against a playbook",
          why: "Associates asked for it",
        },
      ],
    },
    investigation: {
      panelTitle: "Citation trust",
      question: "Why are lawyers re-checking agent research?",
      subtitle:
        "Investigation into research agent answers from the last 30 days",
      trend: {
        title: "30 day research trend",
        a: "Questions answered",
        b: "Answers re-checked",
      },
      funnel: {
        title: "Research funnel",
        steps: [
          ["Question asked", 1340],
          ["Answer given", 1210],
          ["Used without re-checking", 480],
        ],
      },
      reasons: {
        title: "Why lawyers re-check",
        rows: [
          ["Citation doesn’t support the answer", 37],
          ["Jurisdiction not confirmed", 24],
          ["Outdated source", 16],
          ["Clause missing from summary", 10],
        ],
      },
      steps: [
        {
          kind: "calendar",
          text: "Reviewing the last 30 days of research conversations",
        },
        {
          kind: "doc",
          text: "Building a funnel from question to trusted answer",
        },
        {
          kind: "chip",
          text: "36% of answers are used without re-checking",
        },
        {
          kind: "dot",
          text: "Re-checks spike when an answer cites more than one source",
        },
        {
          kind: "grid",
          text: "Matching re-checks to user feedback and support tickets",
        },
        {
          kind: "dot",
          text: "Found it: verifying each citation first is the top opportunity",
        },
        {
          kind: "doc",
          text: "Adding a roadmap item with evaluation tests",
        },
      ],
    },
  },
  {
    slug: "dental-ai",
    navLabel: "Dental",
    term: "dental",
    heroTerm: "dental",
    ...meta("dental"),
    tiles: {
      message: {
        who: "Patient",
        parts: [
          "Am I ",
          { hl: "covered for this crown" },
          "? I ",
          { hl: "already gave my insurance details" },
          ".",
        ],
      },
      issues: [
        { label: "Coverage not confirmed", risk: "High" },
        { label: "Repeated insurance question", risk: "Medium" },
      ],
      workflow: {
        name: "Booking workflow",
        steps: [
          "Answer call",
          "Identify patient",
          "Check insurance",
          "Find a slot",
          "Confirm booking",
        ],
        stuck: 2,
      },
      roadmap: [
        { name: "Check insurance at booking", kind: "Workflow", status: "Now" },
        {
          name: "Practice management integration",
          kind: "Integration",
          status: "Next",
        },
        { name: "Remember patient history", kind: "Memory", status: "Next" },
        {
          name: "Explain treatment costs",
          kind: "Reasoning",
          status: "Later",
        },
      ],
      evaluation: {
        scenario: "New patient asking about crown coverage",
        rows: [
          { name: "Insurance cover confirmed", result: "Better" },
          { name: "Booked in one call", result: "Better" },
          { name: "Dental pain sent to a person", result: "Same" },
          { name: "Patient details reused", result: "Better" },
        ],
      },
      context: {
        need: "Confirm insurance cover before the appointment",
      },
      decisions: [
        {
          text: "Check insurance at booking",
          why: "Patients asked about cover on most calls",
        },
        {
          text: "Send dental pain calls to a person",
          why: "Urgent cases need a clinician",
        },
        {
          text: "Reuse saved insurance details",
          why: "Patients repeated them on every call",
        },
      ],
    },
    investigation: {
      panelTitle: "Booking drop-off",
      question: "Why are patients hanging up before booking?",
      subtitle: "Investigation into patient calls from the last 30 days",
      trend: {
        title: "30 day call trend",
        a: "Calls answered",
        b: "Bookings made",
      },
      funnel: {
        title: "Booking funnel",
        steps: [
          ["Call answered", 1200],
          ["Patient identified", 1020],
          ["Appointment booked", 610],
        ],
      },
      reasons: {
        title: "Why patients hang up",
        rows: [
          ["Coverage question unanswered", 34],
          ["No suitable time offered", 22],
          ["Asked to repeat details", 15],
          ["Wanted to speak to a person", 11],
        ],
      },
      steps: [
        {
          kind: "calendar",
          text: "Reviewing the last 30 days of patient calls",
        },
        { kind: "doc", text: "Building a funnel from call to booking" },
        { kind: "chip", text: "Half of calls end without a booking" },
        { kind: "dot", text: "Drop-off spikes when patients ask about cover" },
        { kind: "grid", text: "Matching drop-off to call notes and feedback" },
        {
          kind: "dot",
          text: "Found it: checking insurance at booking is the top opportunity",
        },
        { kind: "doc", text: "Adding a roadmap item with evaluation tests" },
      ],
    },
  },
  {
    slug: "video-ai",
    navLabel: "Video",
    term: "video",
    heroTerm: "video",
    ...meta("video"),
    tiles: {
      message: {
        who: "Creator",
        parts: [
          "The ",
          { hl: "visuals don’t match the script" },
          " and the ",
          { hl: "voice changed halfway" },
          ".",
        ],
      },
      issues: [
        { label: "Scenes off-script", risk: "High" },
        { label: "Inconsistent narration voice", risk: "Medium" },
      ],
      workflow: {
        name: "Video workflow",
        steps: [
          "Pick topic",
          "Write script",
          "Storyboard",
          "Generate scenes",
          "Edit and export",
        ],
        stuck: 3,
      },
      roadmap: [
        {
          name: "Match scenes to script lines",
          kind: "Reasoning",
          status: "Now",
        },
        { name: "Publishing integration", kind: "Integration", status: "Next" },
        { name: "Remember channel style", kind: "Memory", status: "Next" },
        { name: "Regenerate a single scene", kind: "Tool", status: "Later" },
      ],
      evaluation: {
        scenario: "Ten-minute explainer from a one-line topic",
        rows: [
          { name: "Scenes match the script", result: "Better" },
          { name: "One narration voice", result: "Better" },
          { name: "Channel style kept", result: "Same" },
          { name: "Exported without re-renders", result: "Better" },
        ],
      },
      context: {
        need: "Keep visuals consistent with the script and style",
      },
      decisions: [
        {
          text: "Lock a visual style before scenes",
          why: "Scenes drifted in look across a video",
        },
        {
          text: "Let creators edit one scene at a time",
          why: "Full re-renders wasted time",
        },
        {
          text: "Keep one narration voice per video",
          why: "Creators noticed voice changes",
        },
      ],
    },
    investigation: {
      panelTitle: "Export drop-off",
      question: "Why are creators abandoning videos before export?",
      subtitle: "Investigation into video projects from the last 30 days",
      trend: {
        title: "30 day project trend",
        a: "Projects started",
        b: "Videos exported",
      },
      funnel: {
        title: "Project funnel",
        steps: [
          ["Topic entered", 1500],
          ["Storyboard approved", 980],
          ["Video exported", 520],
        ],
      },
      reasons: {
        title: "Why creators stop",
        rows: [
          ["Scenes don’t match the script", 33],
          ["Visual style drifts", 21],
          ["Can’t fix a single scene", 17],
          ["Narration sounds off", 12],
        ],
      },
      steps: [
        {
          kind: "calendar",
          text: "Reviewing the last 30 days of video projects",
        },
        { kind: "doc", text: "Building a funnel from topic to export" },
        { kind: "chip", text: "About a third of projects are exported" },
        {
          kind: "dot",
          text: "Drop-off spikes after the first generated scenes",
        },
        {
          kind: "grid",
          text: "Matching drop-off to creator feedback and tickets",
        },
        {
          kind: "dot",
          text: "Found it: matching scenes to the script is the top opportunity",
        },
        { kind: "doc", text: "Adding a roadmap item with evaluation tests" },
      ],
    },
  },
];

export function getSolution(slug: string): Solution {
  const s = SOLUTIONS.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown solution: ${slug}`);
  return s;
}
