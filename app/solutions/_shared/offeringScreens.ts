// Per-domain content for the eight offering screens (see SolutionTiles.tsx).
// Grounded in how AI agents in each domain work and where they commonly fail
// (claims intake, AI SDRs, month-end close, voice-to-quote, legal research,
// dental reception, script-to-video). Illustrative and qualitative only:
// no figures, no company names.

type Hl = string | { hl: string };

export type OfferingScreens = {
  opportunity: string; // biggest opportunity, for the top need
  easier: string; // how to make the stuck step easier
  firstWhy: string; // why the top capability comes first
  works: string; // why the agent succeeds
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
  review: {
    user: string;
    agent: Hl[];
    flag: string;
    fix: string;
    pattern: string;
  };
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
    opportunity: "Let policyholders lodge first and add documents later",
    easier: "Let documents follow after lodging",
    firstWhy: "Every cover question depends on it",
    works: "Simple claims flow when cover comes from the live policy",
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
      {
        text: "Explain why a claim was declined",
        sources: ["Complaints", "Adjuster notes"],
        trend: "Steady",
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
      pattern: "Also in injury and hardship claims",
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
      { type: "Decision", text: "Hand complex claims to an assessor" },
      { type: "Learning", text: "Policy jargon prompts repeat questions" },
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
    opportunity: "Personalise only from facts with a source",
    easier: "Personalise only from verified sources",
    firstWhy: "Invented details cost the most trust",
    works: "Replies land when the opener cites a real event",
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
      {
        text: "Answers to technical questions in the thread",
        sources: ["Replies"],
        trend: "Steady",
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
      pattern: "Also after “wrong person” replies",
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
      { type: "Decision", text: "Pause sequences after a “not now”" },
      {
        type: "Learning",
        text: "One pitch per account avoids duplicate threads",
      },
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
    opportunity: "Show the source behind every figure",
    easier: "Auto-match items and flag only true exceptions",
    firstWhy: "Reconciliation is where the close stalls",
    works: "Reports pass review when every figure links to source",
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
      {
        text: "Commentary in the board pack’s style",
        sources: ["Controller feedback"],
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
      pattern: "Also in payroll and travel variances",
    },
    kb: [
      { type: "Decision", text: "Every figure links to its source" },
      { type: "Workflow", text: "Pull → reconcile → draft → review → publish" },
      { type: "Insight", text: "Controllers review commentary line by line" },
      { type: "Learning", text: "Intercompany items need a human check" },
      { type: "Decision", text: "Controllers approve before anything posts" },
      { type: "Learning", text: "Generic commentary gets rewritten in review" },
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
    opportunity: "Quote from the tradie’s own prices, on site",
    easier: "Flag unlisted items for a quick price",
    firstWhy: "Guessed prices are why quotes get edited",
    works: "Quotes go out unedited when every item is listed",
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
      {
        text: "Quotes in my own branding",
        sources: ["Quotes sent"],
        trend: "Steady",
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
      pattern: "Also on call-out fees and materials",
    },
    kb: [
      { type: "Decision", text: "Never guess a price" },
      { type: "Workflow", text: "Record → transcribe → price → build → send" },
      { type: "Insight", text: "Tradies quote from the van between jobs" },
      { type: "Learning", text: "Trade slang trips up transcription" },
      { type: "Decision", text: "Attach site photos to every quote" },
      { type: "Learning", text: "Quotes without a follow-up tend to go cold" },
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
    opportunity: "Citations lawyers can rely on first time",
    easier: "Show the supporting passage beside each cite",
    firstWhy: "Overturned cases are the riskiest miss",
    works: "Answers get used when every cite shows its passage",
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
      {
        text: "Research saved to the matter",
        sources: ["Lawyer feedback"],
        trend: "Steady",
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
      pattern: "Also in contract and tort questions",
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
      { type: "Decision", text: "Only cite courts that bind the matter" },
      { type: "Learning", text: "Overturned cases slip past existence checks" },
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
    opportunity: "Hand cost questions to the team with a ready reply",
    easier: "Offer after-school and same-dentist times first",
    firstWhy: "Parents ask to book siblings together",
    works: "Patients book when the text names their own reason",
    needs: [
      {
        text: "Know what I’ll pay before I book",
        sources: ["SMS replies", "Team inbox"],
        trend: "Rising",
      },
      {
        text: "Times after school for the kids",
        sources: ["SMS replies"],
        trend: "Rising",
      },
      {
        text: "Book the whole family in one go",
        sources: ["SMS replies", "Team inbox"],
        trend: "New",
      },
      {
        text: "See the same dentist as last time",
        sources: ["Practice system", "SMS replies"],
        trend: "Steady",
      },
      {
        text: "Ask me again when I’m ready",
        sources: ["SMS replies"],
        trend: "Steady",
      },
    ],
    flow: [
      { name: "Find patients due", state: "ok" },
      {
        name: "Send first text",
        note: "Feels generic to lapsed patients",
        state: "slow",
      },
      { name: "Follow up", state: "ok" },
      {
        name: "Offer times",
        note: "Replied, but no time suited",
        state: "stuck",
      },
      {
        name: "Book or hand over",
        note: "Simple questions handed over",
        state: "slow",
      },
    ],
    capabilities: [
      {
        kind: "Behaviour",
        name: "Family bookings in one reply",
        unlocks: "Siblings booked side by side",
        value: "High",
      },
      {
        kind: "Ability",
        name: "Match the usual dentist",
        unlocks: "Times patients actually accept",
        value: "High",
      },
      {
        kind: "Integration",
        name: "More practice systems",
        unlocks: "Follow-up for more clinics",
        value: "High",
      },
      {
        kind: "Tool",
        name: "Hold offered times",
        unlocks: "No clashing offers",
        value: "Medium",
      },
    ],
    review: {
      user: "How much will the crown be?",
      agent: [
        "Great question! ",
        { hl: "It’s usually a few hundred dollars after your cover." },
      ],
      flag: "Gave a fee estimate it can’t verify",
      fix: "Hand to the team with a suggested reply",
      pattern: "Also for clinical questions about pain",
    },
    kb: [
      { type: "Decision", text: "Never give clinical or fee advice" },
      { type: "Workflow", text: "Due → first text → follow up → times → book" },
      { type: "Insight", text: "Lapsed patients reply to a personal reason" },
      { type: "Decision", text: "Stop means stop, every time" },
      { type: "Learning", text: "Parents want after-school times first" },
      { type: "Learning", text: "Fee questions need a suggested reply" },
    ],
    evaluation: {
      scenario: "Lapsed patient, overdue for a check-up",
      rows: [
        {
          name: "Sounds like the clinic",
          against: "User need",
          result: "Better",
        },
        { name: "Booked by text", against: "Product goal", result: "Better" },
        { name: "Opt-outs", against: "Product goal", result: "Same" },
        {
          name: "Patient back in the chair",
          against: "Real outcome",
          result: "Better",
        },
      ],
    },
    loop: {
      signal: "Lapsed patients ignore the first text",
      insight: "Generic nudges get no reply",
      change: "Open with the patient’s own reason to return",
      result: "More replies from lapsed patients",
      watching: "Opt-outs",
    },
  },

  "video-ai": {
    opportunity: "Keep characters consistent across every scene",
    easier: "Lock a character reference before generating",
    firstWhy: "Character drift drives the most regenerations",
    works: "Videos export first time when the presenter stays locked",
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
      {
        text: "Captions in more languages",
        sources: ["Creator feedback"],
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
      pattern: "Also with logos and product shots",
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
      { type: "Decision", text: "Regenerate one scene, never the whole video" },
      { type: "Learning", text: "Brand kits must load before the storyboard" },
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
