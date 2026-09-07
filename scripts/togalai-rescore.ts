// scripts/togalai-rescore.ts
// Corrects Togal.AI feature scores based on web research (Capterra, G2, Togal.AI website, KU study).
// LLM-scored features underestimate Togal.AI because LLMs have low training data on it.
// Corrections are grounded_source=true so the UI can mark them as web-researched.
// Run: DATABASE_URL=... npx tsx scripts/togalai-rescore.ts

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL!;

interface Correction {
  feature_id: string;
  feature_tag: string;
  score: number;
  score_band: "strong" | "partial" | "weak" | "absent";
  notes: string;
}

// Web-researched corrections based on:
// - Capterra & G2 feature listings (2026)
// - togal.ai/blog/2025-features-roundup
// - KU 2025 independent study (76% faster, 98% accuracy)
// - forconstructionpros.com estimating tool review
const CORRECTIONS: Correction[] = [
  {
    feature_id: "takeoff_pdf_measurement",
    feature_tag: "esai-takeoff",
    score: 85,
    score_band: "strong",
    notes:
      "Core product feature. Proprietary AI auto-detects, measures, and labels spaces from PDF/JPEG/PNG/TIFF drawings with 98% accuracy. KU 2025 independent study: 76% faster than leading alternatives. 'Togal Button' completes takeoffs in seconds.",
  },
  {
    feature_id: "takeoff_traceable",
    feature_tag: "esai-takeoff",
    score: 72,
    score_band: "partial",
    notes:
      "AI measurements render visually back onto drawings (areas, lines, counts overlaid on plan). Users can review and adjust; traceability to source drawing confirmed but audit-trail depth unclear.",
  },
  {
    feature_id: "ai_plan_interpretation",
    feature_tag: "esai-ai",
    score: 82,
    score_band: "strong",
    notes:
      "Core AI feature. Computer vision auto-classifies room and wall types from architectural drawings. Detects, labels, and measures spaces — not just pixel-counting but semantic understanding of plan elements.",
  },
  {
    feature_id: "ai_autonomous_scope",
    feature_tag: "esai-ai",
    score: 45,
    score_band: "partial",
    notes:
      "Repeating Groups (2025 feature) allows takeoff once on a master unit and apply to hundreds of identical spaces — partial autonomous scope for standardised layouts (hotels, hospitals, apartments). Full autonomous scope generation not confirmed.",
  },
  {
    feature_id: "plans_multi_doc_upload",
    feature_tag: "esai-plans",
    score: 72,
    score_band: "partial",
    notes:
      "Supports all drawing formats: PDF, JPEG, PNG, TIFF. Multiple plan uploads confirmed. Document Management and Document Storage listed as features on Capterra/GetApp. No confirmed limit on concurrent uploads.",
  },
  {
    feature_id: "plans_cross_reference",
    feature_tag: "esai-plans",
    score: 42,
    score_band: "partial",
    notes:
      "Drawing comparison feature confirmed — Togal.AI can compare two sets of plans to identify changes. Used for revision tracking on plan updates. Full structured cross-referencing between spec sheets and plans not confirmed.",
  },
  {
    feature_id: "residential_new_build",
    feature_tag: "esai-residential",
    score: 60,
    score_band: "partial",
    notes:
      "Residential templates confirmed for single-family homes and multi-unit dwellings. AI auto-detects residential room types (bedrooms, bathrooms, living areas). Primary market is US residential but works on AU plans in same format.",
  },
  {
    feature_id: "residential_spec_finishes",
    feature_tag: "esai-residential",
    score: 20,
    score_band: "weak",
    notes:
      "Quantity takeoff includes area measurements that feed into finish estimates, but no confirmed spec-finish template or material selection workflow. Users must manually apply finish costs to measured quantities.",
  },
  {
    feature_id: "commercial_multi_trade",
    feature_tag: "esai-commercial",
    score: 55,
    score_band: "partial",
    notes:
      "Commercial templates confirmed for office buildings, retail spaces. Assemblies (2025) cover drywall walls, ceilings, wood framing, metal framing — grouping multi-trade elements. Concrete Assemblies scheduled for 2026.",
  },
  {
    feature_id: "commercial_tender_pricing",
    feature_tag: "esai-commercial",
    score: 35,
    score_band: "weak",
    notes:
      "Tender pricing supported via integrations with Procore, PlanSwift, Bluebeam — Togal.AI feeds quantities into those platforms' pricing engines. Native tender pricing database not confirmed; relies on downstream tools.",
  },
  {
    feature_id: "quote_editable_lines",
    feature_tag: "esai-quote",
    score: 58,
    score_band: "partial",
    notes:
      "Produces detailed quantity takeoff data (areas, lines, counts by trade/assembly). Customizable Reports confirmed. Editable estimate lines confirmed via integration with PlanSwift and OnScreen Takeoff for pricing.",
  },
  {
    feature_id: "quote_pdf_export",
    feature_tag: "esai-quote",
    score: 68,
    score_band: "partial",
    notes:
      "Customizable Reports feature confirmed on Capterra and GetApp. Document Management and Document Storage listed. PDF export of takeoff reports confirmed. Full structured bill-of-quantities export format unclear.",
  },
  {
    feature_id: "scope_trade_breakdown",
    feature_tag: "esai-scope",
    score: 50,
    score_band: "partial",
    notes:
      "Assembly Takeoff feature groups measurements by trade: drywall, ceilings, wood framing, metal framing (2025). Expanding to concrete (2026). Per-trade quantity breakdown confirmed; cost-per-trade breakdown depends on pricing integration.",
  },
  {
    feature_id: "scope_material_labour_split",
    feature_tag: "esai-scope",
    score: 20,
    score_band: "weak",
    notes:
      "No confirmed native material vs labour split in Togal.AI output. Quantities are measured; labour split requires downstream estimating software (PlanSwift, Procore). Job Costing listed as a feature but detail unclear.",
  },
];

async function main() {
  const sql = neon(DATABASE_URL);

  console.log(`Applying ${CORRECTIONS.length} corrected scores for Togal.AI...`);

  for (const c of CORRECTIONS) {
    await sql`
      UPDATE esai_feature_scores
      SET
        score            = ${c.score},
        score_band       = ${c.score_band},
        grounded_source  = true,
        notes            = ${c.notes},
        flagged_for_review = false,
        flag_reason      = null,
        scored_at        = NOW()
      WHERE brand_name = 'Togal.AI'
        AND feature_id  = ${c.feature_id}
        AND feature_tag = ${c.feature_tag}
    `;
    console.log(`  ✓ ${c.feature_id}: ${c.score_band} (${c.score})`);
  }

  console.log("\nDone. Verify with:");
  const updated = await sql`
    SELECT feature_id, score, score_band, grounded_source
    FROM esai_feature_scores
    WHERE brand_name = 'Togal.AI'
    ORDER BY feature_tag, feature_id
  ` as any[];
  for (const r of updated) {
    const flag = r.grounded_source ? "🌐" : "🤖";
    console.log(`  ${flag} ${r.feature_id}: ${r.score_band} (${r.score})`);
  }
}

main().catch(console.error);
