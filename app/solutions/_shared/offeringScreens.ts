// Per-domain content for the eight offering screens (see SolutionTiles.tsx).
// Grounded in how AI agents in each domain work and where they commonly fail
// (claims intake, AI SDRs, month-end close, voice-to-quote, legal research,
// dental reception, script-to-video). Illustrative and qualitative only:
// no figures, no company names.

type Hl = string | { hl: string };

export type OfferingScreens = {
  needs: {
    text: string;
    sources: string[];
    trend: "Rising" | "Steady" | "New";
  }[];
  flow: { name: string; note?: string; state: "ok" | "slow" | "stuck" }[];
  capabilities: {
    kind: "Integration" | "Tool" | "Ability" | "Behaviour";
    name: string;
    unlocks: string;
    value: "High" | "Medium";
  }[];
  review: { user: string; agent: Hl[]; flag: string; fix: string };
  kb: {
    type: "Decision" | "Workflow" | "Insight" | "Learning";
    text: string;
  }[];
  evaluation: {
    scenario: string;
    rows: {
      name: string;
      against: "User need" | "Product goal" | "Real outcome";
      result: "Better" | "Same" | "Worse";
    }[];
  };
  loop: {
    signal: string;
    insight: string;
    change: string;
    result: string;
    watching: string;
  };
};

export const OFFERING_SCREENS: Record<string, OfferingScreens> = {
  "insurance-ai": {
    needs: [
      {
        text: "Lodge a claim now, add documents later",
        sources: ["Agent logs", "Complaints"],
        trend: "Rising",
      },
      {
        text: "Know claim status without calling",
        sources: ["Call notes", "Surveys"],
        trend: "Rising",
      },
      {
        text: "A plain answer to “am I covered?”",
        sources: ["Agent logs", "Adjuster notes"],
        trend: "Steady",
      },
      {
        text: "A person for sensitive claims",
        sources: ["Complaints"],
        trend: "New",
      },
    ],
    flow: [
      { name: "Report incident", state: "ok" },
      { name: "Check cover", note: "Policy wording unclear", state: "slow" },
      {
        name: "Collect documents",
        note: "Policyholders stall here",
        state: "stuck",
      },
      { name: "Assess claim", note: "Agent re-asks details", state: "slow" },
      { name: "Settle", state: "ok" },
    ],
    capabilities: [
      {
        kind: "Integration",
        name: "Policy system lookup",
        unlocks: "Answer cover from the live policy",
        value: "High",
      },
      {
        kind: "Tool",
        name: "Upload documents mid-claim",
        unlocks: "Lodge without receipts on hand",
        value: "High",
      },
      {
        kind: "Behaviour",
        name: "Route sensitive claims to a person",
        unlocks: "Bereavement and injury handled with care",
        value: "High",
      },
      {
        kind: "Ability",
        name: "Proactive status updates",
        unlocks: "Fewer “where is my claim?” calls",
        value: "Medium",
      },
    ],
    review: {
      user: "My mum passed away and I need to claim on her policy.",
      agent: [
        "Sorry to hear that. ",
        { hl: "Please upload the policy schedule to continue." },
      ],
      flag: "Missed sensitive context",
      fix: "Hand bereavement claims to a person",
    },
    kb: [
      { type: "Decision", text: "Allow documents after lodging" },
      {
        type: "Workflow",
        text: "Report → cover → documents → assess → settle",
      },
      { type: "Insight", text: "Policyholders want status without calling" },
      {
        type: "Learning",
        text: "Asking the incident date first cuts follow-ups",
      },
    ],
    evaluation: {
      scenario: "Water damage claim without receipts",
      rows: [
        {
          name: "Cover answer matches policy wording",
          against: "User need",
          result: "Better",
        },
        {
          name: "Documents asked for once",
          against: "User need",
          result: "Better",
        },
        {
          name: "Sensitive claims escalated",
          against: "Product goal",
          result: "Same",
        },
        {
          name: "Claim lodged without a call",
          against: "Real outcome",
          result: "Better",
        },
      ],
    },
    loop: {
      signal: "Policyholders abandon claims at the document step",
      insight: "They want to lodge first and add documents later",
      change: "Upload documents after lodging",
      result: "Better on claims without receipts",
      watching: "Claim status questions",
    },
  },

  "sales-ai": {
    needs: [
      {
        text: "Outreach that references something real",
        sources: ["Replies", "Sales calls"],
        trend: "Rising",
      },
      {
        text: "One conversation per company, not per person",
        sources: ["Replies", "CRM data"],
        trend: "Rising",
      },
      {
        text: "Back off when I say “not now”",
        sources: ["Replies"],
        trend: "Steady",
      },
      {
        text: "A human for pricing questions",
        sources: ["Sales calls"],
        trend: "New",
      },
    ],
    flow: [
      { name: "Find leads", state: "ok" },
      { name: "Research company", note: "Thin or stale data", state: "slow" },
      { name: "Personalise outreach", note: "Invents details", state: "stuck" },
      { name: "Send email", note: "Deliverability drops", state: "slow" },
      { name: "Follow up", state: "ok" },
    ],
    capabilities: [
      {
        kind: "Behaviour",
        name: "Cite a source for every claim",
        unlocks: "No invented trigger events",
        value: "High",
      },
      {
        kind: "Ability",
        name: "Account-level coordination",
        unlocks: "One thread per company",
        value: "High",
      },
      {
        kind: "Integration",
        name: "CRM write-back",
        unlocks: "Reps see every touch",
        value: "Medium",
      },
      {
        kind: "Tool",
        name: "Inbox health and send ramp",
        unlocks: "Protects deliverability",
        value: "Medium",
      },
    ],
    review: {
      user: "We just had layoffs. Not a good time.",
      agent: [
        "Totally understand! ",
        { hl: "Are you free Thursday for a quick demo?" },
      ],
      flag: "Ignored “not now”",
      fix: "Pause the sequence and set a revisit date",
    },
    kb: [
      {
        type: "Decision",
        text: "Never mention a trigger event without a source",
      },
      {
        type: "Workflow",
        text: "Find → research → personalise → send → follow up",
      },
      { type: "Insight", text: "Executives prefer a reply from a person" },
      { type: "Learning", text: "Template openers get recognised and ignored" },
    ],
    evaluation: {
      scenario: "Prospect with no recent news",
      rows: [
        { name: "No invented details", against: "User need", result: "Better" },
        {
          name: "Falls back to a relevant angle",
          against: "User need",
          result: "Better",
        },
        { name: "Opt-outs respected", against: "Product goal", result: "Same" },
        { name: "Positive reply", against: "Real outcome", result: "Better" },
      ],
    },
    loop: {
      signal: "A prospect called out a funding round that never happened",
      insight: "The agent fills research gaps with guesses",
      change: "Only cite verified sources",
      result: "No invented details in testing",
      watching: "Reply sentiment",
    },
  },

  "finance-ai": {
    needs: [
      {
        text: "See the source behind every figure",
        sources: ["Controller feedback", "Audit findings"],
        trend: "Rising",
      },
      {
        text: "Variance explanations, not just numbers",
        sources: ["Controller feedback"],
        trend: "Rising",
      },
      {
        text: "Exceptions flagged before close day",
        sources: ["Close checklist"],
        trend: "Steady",
      },
      {
        text: "Approval steps kept intact",
        sources: ["Audit findings"],
        trend: "New",
      },
    ],
    flow: [
      { name: "Pull data", state: "ok" },
      { name: "Reconcile", note: "Unmatched items pile up", state: "stuck" },
      { name: "Draft report", note: "Commentary too generic", state: "slow" },
      { name: "Review", note: "Controllers re-trace figures", state: "slow" },
      { name: "Publish", state: "ok" },
    ],
    capabilities: [
      {
        kind: "Integration",
        name: "Sub-ledger connection",
        unlocks: "Reconcile without exports",
        value: "High",
      },
      {
        kind: "Ability",
        name: "Drill from figure to transaction",
        unlocks: "Reviewers trace figures in one step",
        value: "High",
      },
      {
        kind: "Behaviour",
        name: "Driver-based variance commentary",
        unlocks: "Explains why, not just what",
        value: "Medium",
      },
      {
        kind: "Tool",
        name: "Approval routing",
        unlocks: "Segregation of duties kept",
        value: "Medium",
      },
    ],
    review: {
      user: "Why did marketing spend jump this month?",
      agent: [
        { hl: "Marketing spend increased due to higher marketing activity." },
      ],
      flag: "Circular explanation",
      fix: "Break variances down by driver and vendor",
    },
    kb: [
      { type: "Decision", text: "Every figure links to its source" },
      { type: "Workflow", text: "Pull → reconcile → draft → review → publish" },
      { type: "Insight", text: "Controllers review commentary line by line" },
      { type: "Learning", text: "Intercompany items need a human check" },
    ],
    evaluation: {
      scenario: "Month with a large one-off accrual",
      rows: [
        {
          name: "Figures tie to the ledger",
          against: "Product goal",
          result: "Better",
        },
        {
          name: "Accrual explained correctly",
          against: "User need",
          result: "Better",
        },
        {
          name: "Approval steps followed",
          against: "Product goal",
          result: "Same",
        },
        {
          name: "Report signed off first pass",
          against: "Real outcome",
          result: "Better",
        },
      ],
    },
    loop: {
      signal: "Controllers re-trace figures during review",
      insight: "They can’t see where numbers come from",
      change: "Link every figure to its source",
      result: "Better on review checks",
      watching: "Review comments",
    },
  },

  "trades-ai": {
    needs: [
      {
        text: "Quote before leaving the driveway",
        sources: ["Voice notes", "Agent logs"],
        trend: "Rising",
      },
      {
        text: "Use my prices, never a guess",
        sources: ["Quotes sent"],
        trend: "Rising",
      },
      {
        text: "Chase unanswered quotes for me",
        sources: ["Customer replies"],
        trend: "Steady",
      },
      {
        text: "Add site photos to the quote",
        sources: ["Voice notes"],
        trend: "New",
      },
    ],
    flow: [
      { name: "Record job on site", state: "ok" },
      {
        name: "Transcribe voice note",
        note: "Trade terms misheard",
        state: "slow",
      },
      {
        name: "Match price list",
        note: "Items not on the list",
        state: "stuck",
      },
      { name: "Build branded quote", state: "ok" },
      {
        name: "Send and follow up",
        note: "Follow-ups not sent",
        state: "slow",
      },
    ],
    capabilities: [
      {
        kind: "Behaviour",
        name: "Flag missing items, never guess",
        unlocks: "No invented prices",
        value: "High",
      },
      {
        kind: "Ability",
        name: "Site photo to line item",
        unlocks: "Fewer missed items",
        value: "High",
      },
      {
        kind: "Integration",
        name: "Invoicing sync",
        unlocks: "Accepted quote becomes an invoice",
        value: "High",
      },
      {
        kind: "Tool",
        name: "Automatic follow-up texts",
        unlocks: "Quotes don’t go cold",
        value: "Medium",
      },
    ],
    review: {
      user: "Replace the kitchen tap and reseal the shower, about two hours.",
      agent: ["Quote ready. ", { hl: "Shower reseal: price estimated." }],
      flag: "Guessed a price",
      fix: "Flag items missing from the price list",
    },
    kb: [
      { type: "Decision", text: "Never guess a price" },
      { type: "Workflow", text: "Record → transcribe → price → build → send" },
      { type: "Insight", text: "Tradies quote from the van between jobs" },
      { type: "Learning", text: "Trade slang trips up transcription" },
    ],
    evaluation: {
      scenario: "Voice note with an unlisted item",
      rows: [
        {
          name: "Prices match the price list",
          against: "Product goal",
          result: "Better",
        },
        {
          name: "Missing item flagged",
          against: "User need",
          result: "Better",
        },
        {
          name: "Trade terms transcribed",
          against: "User need",
          result: "Same",
        },
        {
          name: "Quote sent same day",
          against: "Real outcome",
          result: "Better",
        },
      ],
    },
    loop: {
      signal: "Tradies keep editing quote prices",
      insight: "The agent guesses items not on the price list",
      change: "Flag unlisted items instead",
      result: "Better on unlisted items",
      watching: "Quote edits",
    },
  },

  "legal-ai": {
    needs: [
      {
        text: "Rely on citations without re-checking each one",
        sources: ["Lawyer feedback", "Citation checks"],
        trend: "Rising",
      },
      {
        text: "Authority from my jurisdiction only",
        sources: ["Lawyer feedback"],
        trend: "Rising",
      },
      {
        text: "Know when a case has been overturned",
        sources: ["Citation checks"],
        trend: "Steady",
      },
      {
        text: "See the passage that supports the point",
        sources: ["Agent logs"],
        trend: "New",
      },
    ],
    flow: [
      { name: "Read question", state: "ok" },
      {
        name: "Check jurisdiction",
        note: "Mixes jurisdictions",
        state: "slow",
      },
      { name: "Find authorities", state: "ok" },
      {
        name: "Check citations",
        note: "Lawyers re-check every cite",
        state: "stuck",
      },
      { name: "Draft answer", note: "Overstates holdings", state: "slow" },
    ],
    capabilities: [
      {
        kind: "Integration",
        name: "Citator check",
        unlocks: "Flags overturned cases",
        value: "High",
      },
      {
        kind: "Ability",
        name: "Pinpoint passages",
        unlocks: "Shows the text that supports the point",
        value: "High",
      },
      {
        kind: "Behaviour",
        name: "Binding-authority filter",
        unlocks: "Only courts that bind this matter",
        value: "High",
      },
      {
        kind: "Tool",
        name: "Matter workspace",
        unlocks: "Research saved to the matter",
        value: "Medium",
      },
    ],
    review: {
      user: "Find authority on implied terms in employment contracts in this state.",
      agent: [
        "The leading case confirms this, ",
        { hl: "citing a decision from another jurisdiction." },
      ],
      flag: "Wrong jurisdiction",
      fix: "Filter authorities to binding courts",
    },
    kb: [
      { type: "Decision", text: "Show the supporting passage on every cite" },
      {
        type: "Workflow",
        text: "Question → jurisdiction → authorities → cites → draft",
      },
      { type: "Insight", text: "Lawyers check every cite before filing" },
      {
        type: "Learning",
        text: "Real cases can still be cited for the wrong point",
      },
    ],
    evaluation: {
      scenario: "Clause question across two jurisdictions",
      rows: [
        {
          name: "Every citation exists",
          against: "Product goal",
          result: "Better",
        },
        {
          name: "Case supports the stated point",
          against: "User need",
          result: "Better",
        },
        {
          name: "Binding jurisdiction only",
          against: "User need",
          result: "Better",
        },
        {
          name: "Draft used without re-research",
          against: "Real outcome",
          result: "Same",
        },
      ],
    },
    loop: {
      signal: "Lawyers re-check every citation",
      insight: "Real cases are cited for the wrong point",
      change: "Pinpoint passage on every cite",
      result: "Better on supported holdings",
      watching: "Citation edits",
    },
  },

  "dental-ai": {
    needs: [
      {
        text: "Book after hours without a callback",
        sources: ["Patient calls", "Missed calls"],
        trend: "Rising",
      },
      {
        text: "Know if my treatment is covered",
        sources: ["Patient calls", "Front desk notes"],
        trend: "Rising",
      },
      { text: "Reschedule by text", sources: ["SMS replies"], trend: "Steady" },
      {
        text: "Same-day help for dental pain",
        sources: ["Patient calls"],
        trend: "New",
      },
    ],
    flow: [
      { name: "Answer call", state: "ok" },
      {
        name: "Identify patient",
        note: "New vs existing confused",
        state: "slow",
      },
      {
        name: "Check insurance",
        note: "Coverage questions stall",
        state: "stuck",
      },
      { name: "Find a slot", note: "Wrong appointment length", state: "slow" },
      { name: "Confirm booking", state: "ok" },
    ],
    capabilities: [
      {
        kind: "Integration",
        name: "Practice system sync",
        unlocks: "Books into the live schedule",
        value: "High",
      },
      {
        kind: "Integration",
        name: "Eligibility check",
        unlocks: "Coverage checked before the visit",
        value: "High",
      },
      {
        kind: "Behaviour",
        name: "Appointment-type rules",
        unlocks: "Right slot length per treatment",
        value: "High",
      },
      {
        kind: "Ability",
        name: "Urgent pain triage",
        unlocks: "Emergencies seen same day",
        value: "Medium",
      },
    ],
    review: {
      user: "Will my insurance cover a crown?",
      agent: [
        "Good news! ",
        { hl: "We accept your insurance, so you’re covered." },
      ],
      flag: "Confused “accepted” with “covered”",
      fix: "Check plan benefits before answering",
    },
    kb: [
      { type: "Decision", text: "Collect member ID during booking" },
      {
        type: "Workflow",
        text: "Answer → identify → insurance → slot → confirm",
      },
      { type: "Insight", text: "Many patients call after hours" },
      { type: "Learning", text: "Benefit questions need a billing callback" },
    ],
    evaluation: {
      scenario: "New patient asking if a crown is covered",
      rows: [
        {
          name: "Accepted vs covered answered right",
          against: "User need",
          result: "Better",
        },
        {
          name: "Member ID collected",
          against: "Product goal",
          result: "Better",
        },
        {
          name: "Right appointment length",
          against: "Product goal",
          result: "Same",
        },
        {
          name: "No billing surprise at the desk",
          against: "Real outcome",
          result: "Better",
        },
      ],
    },
    loop: {
      signal: "Patients surprised by bills at the front desk",
      insight: "The agent says “covered” when it means “accepted”",
      change: "Check eligibility before confirming",
      result: "Better on coverage answers",
      watching: "Billing complaints",
    },
  },

  "video-ai": {
    needs: [
      {
        text: "The same character in every scene",
        sources: ["Creator feedback", "Project data"],
        trend: "Rising",
      },
      {
        text: "My brand fonts and colours by default",
        sources: ["Creator feedback"],
        trend: "Rising",
      },
      {
        text: "Fix one scene without redoing all",
        sources: ["Agent logs"],
        trend: "Steady",
      },
      {
        text: "Know the credit cost before generating",
        sources: ["Support tickets"],
        trend: "New",
      },
    ],
    flow: [
      { name: "Pick topic", state: "ok" },
      { name: "Write script", state: "ok" },
      {
        name: "Storyboard",
        note: "Shots drift from the script",
        state: "slow",
      },
      {
        name: "Generate scenes",
        note: "Characters change look",
        state: "stuck",
      },
      {
        name: "Edit and export",
        note: "Full re-render for small fixes",
        state: "slow",
      },
    ],
    capabilities: [
      {
        kind: "Ability",
        name: "Character reference lock",
        unlocks: "Same face across scenes",
        value: "High",
      },
      {
        kind: "Behaviour",
        name: "Scene-level regeneration",
        unlocks: "Fix one shot, keep the rest",
        value: "High",
      },
      {
        kind: "Tool",
        name: "Brand kit",
        unlocks: "On-brand by default",
        value: "High",
      },
      {
        kind: "Integration",
        name: "Publish to social channels",
        unlocks: "Export straight to each channel",
        value: "Medium",
      },
    ],
    review: {
      user: "Keep the same presenter as scene one.",
      agent: ["Scene four is ready, ", { hl: "with a new presenter look." }],
      flag: "Character drift",
      fix: "Lock a reference image per character",
    },
    kb: [
      {
        type: "Decision",
        text: "Lock characters once a creator approves them",
      },
      {
        type: "Workflow",
        text: "Topic → script → storyboard → scenes → export",
      },
      { type: "Insight", text: "Creators fix one scene at a time" },
      { type: "Learning", text: "Text-only prompts let characters drift" },
    ],
    evaluation: {
      scenario: "Ten-scene explainer with one presenter",
      rows: [
        {
          name: "Presenter consistent",
          against: "User need",
          result: "Better",
        },
        {
          name: "Brand colours applied",
          against: "Product goal",
          result: "Better",
        },
        {
          name: "Scenes match the script",
          against: "User need",
          result: "Same",
        },
        {
          name: "Exported without a re-render",
          against: "Real outcome",
          result: "Better",
        },
      ],
    },
    loop: {
      signal: "Creators regenerate scenes because characters drift",
      insight: "The agent has no character reference",
      change: "Lock a reference per character",
      result: "Better on consistency",
      watching: "Regeneration requests",
    },
  },
};
