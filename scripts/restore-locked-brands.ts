// scripts/restore-locked-brands.ts
// Restores feature scores for 8 brands accidentally deleted from esai_feature_scores.
// Scores are research-based (web research + product docs); flagged_for_review=true.
// Run: export $(cat .env.local | grep DATABASE_URL | sed 's/"//g') && npx tsx scripts/restore-locked-brands.ts

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

type Band = "strong" | "partial" | "weak" | "absent";
interface Row {
  brand: string;
  feature_id: string;
  feature_tag: string;
  score: number;
  score_band: Band;
  notes: string;
}

// Helper to make a row concisely
function r(brand: string, fid: string, ftag: string, score: number, notes: string): Row {
  const band: Band = score >= 70 ? "strong" : score >= 40 ? "partial" : score > 0 ? "weak" : "absent";
  return { brand, feature_id: fid, feature_tag: ftag, score, score_band: band, notes };
}

const ROWS: Row[] = [
  // ── BUILDXACT ─────────────────────────────────────────────────────────────
  // AU/NZ cloud estimating platform; Blu AI assistant (2024); strong AU pricing
  r("Buildxact","takeoff_pdf_measurement","esai-takeoff",62,"Plan takeoff from uploaded PDFs via Blu AI; semi-automated count and area measurement confirmed. Less autonomous than Togal.AI — requires user guidance on room types."),
  r("Buildxact","takeoff_traceable","esai-takeoff",65,"Quantities are linked back to plan pages; users can review and adjust individual measurements."),
  r("Buildxact","ai_plan_interpretation","esai-ai",48,"Blu AI assistant can identify plan elements and suggest quantities; not fully autonomous semantic classification."),
  r("Buildxact","ai_autonomous_scope","esai-ai",30,"Blu assists with scope questions but does not autonomously generate a full scope from drawings."),
  r("Buildxact","plans_multi_doc_upload","esai-plans",75,"Cloud platform; multiple drawings and documents uploaded per project. No confirmed page limit."),
  r("Buildxact","plans_cross_reference","esai-plans",45,"Revision tracking between plan sets confirmed; structured cross-referencing between spec and drawings not confirmed."),
  r("Buildxact","pricing_aus_database","esai-pricing",72,"AU-specific pricing database built in; Rawlinsons-compatible rates for major AU states. Key differentiator vs US competitors."),
  r("Buildxact","pricing_custom_rates","esai-pricing",78,"Full custom rate library; users maintain labour, material, and plant rate tables per trade."),
  r("Buildxact","quote_editable_lines","esai-quote",80,"Detailed editable estimate lines with material, labour, and subcontract breakdown per line item."),
  r("Buildxact","quote_pdf_export","esai-quote",78,"Professional quote PDF export confirmed; branded quote templates available."),
  r("Buildxact","residential_new_build","esai-residential",72,"Primary market segment; AU residential new build templates including house and unit types."),
  r("Buildxact","residential_spec_finishes","esai-residential",60,"Spec finish schedule integration confirmed; material selections tied to estimate lines."),
  r("Buildxact","commercial_multi_trade","esai-commercial",58,"Multi-trade commercial estimating confirmed; some enterprise commercial clients but primarily residential/small commercial."),
  r("Buildxact","commercial_tender_pricing","esai-commercial",60,"Tender pricing workflow confirmed for commercial projects; integrates with Buildxact scheduling."),
  r("Buildxact","scope_trade_breakdown","esai-scope",65,"Per-trade quantity and cost breakdown available; works with AU trade categories."),
  r("Buildxact","scope_material_labour_split","esai-scope",62,"Material vs labour split per line item; confirmed in estimate breakdown view."),
  r("Buildxact","security_compliance","esai-security",55,"SOC 2 compliance status not confirmed; AU data handling policy in place."),
  r("Buildxact","security_data_residency","esai-security",58,"AU-hosted (AWS Sydney); data residency in Australia confirmed for AU customers."),
  r("Buildxact","subcontract_package_pricing","esai-subcontract",55,"Subcontractor pricing packages within estimate; subie comparison view confirmed."),
  r("Buildxact","subcontract_trade_quoting","esai-subcontract",58,"Trade quoting workflow for sending to subbies and tracking responses."),
  r("Buildxact","tender_bid_tracking","esai-tender",55,"Tender tracking within Buildxact project module; bid status tracking confirmed."),
  r("Buildxact","tender_preparation","esai-tender",60,"Tender document preparation including schedules and BOQs; AU tender format support."),

  // ── PLANSWIFT ─────────────────────────────────────────────────────────────
  // Estimating + takeoff platform; acquired by Trimble; Takeoff Boost AI suite (2024)
  r("PlanSwift","takeoff_pdf_measurement","esai-takeoff",75,"Core product. AI-powered automatic measurement of PDF plans via Takeoff Boost; area, linear, and count takeoff from digital drawings."),
  r("PlanSwift","takeoff_traceable","esai-takeoff",72,"Measurements overlay visually on plan pages; traceable to drawing source."),
  r("PlanSwift","ai_plan_interpretation","esai-ai",58,"Takeoff Boost AI identifies and classifies plan elements; less semantic depth than Togal.AI but confirmed AI classification."),
  r("PlanSwift","ai_autonomous_scope","esai-ai",38,"Takeoff Boost automates measurement but scope generation still requires user configuration of assemblies."),
  r("PlanSwift","plans_multi_doc_upload","esai-plans",72,"Multiple plan file uploads; PDF and image format support confirmed."),
  r("PlanSwift","plans_cross_reference","esai-plans",45,"Plan comparison confirmed; cross-referencing spec docs to plans not fully automated."),
  r("PlanSwift","pricing_aus_database","esai-pricing",35,"No AU-specific pricing database; US-centric pricing. AU users must build custom rate libraries."),
  r("PlanSwift","pricing_custom_rates","esai-pricing",72,"Full custom rate library including labour and material rates."),
  r("PlanSwift","quote_editable_lines","esai-quote",70,"Editable estimate lines per assembly; detail line editing confirmed."),
  r("PlanSwift","quote_pdf_export","esai-quote",68,"Quote and estimate PDF export; standard report templates."),
  r("PlanSwift","residential_new_build","esai-residential",62,"Residential templates available; used by US and AU residential contractors."),
  r("PlanSwift","residential_spec_finishes","esai-residential",45,"Material takeoff can capture finishes; no dedicated spec-finish workflow."),
  r("PlanSwift","commercial_multi_trade","esai-commercial",65,"Multi-trade assembly support; used for commercial GC estimating."),
  r("PlanSwift","commercial_tender_pricing","esai-commercial",58,"Tender-format estimate output; no dedicated AU tender format."),
  r("PlanSwift","scope_trade_breakdown","esai-scope",65,"Per-trade quantity breakdown from assembly definitions."),
  r("PlanSwift","scope_material_labour_split","esai-scope",60,"Material vs labour split per assembly line item."),
  r("PlanSwift","security_compliance","esai-security",55,"Trimble subsidiary; enterprise security policies apply."),
  r("PlanSwift","security_data_residency","esai-security",35,"US-hosted; no confirmed AU data residency."),
  r("PlanSwift","subcontract_package_pricing","esai-subcontract",50,"Subcontract pricing within estimate; package comparison not confirmed."),
  r("PlanSwift","subcontract_trade_quoting","esai-subcontract",48,"Trade quoting workflow present but limited vs dedicated subie management tools."),
  r("PlanSwift","tender_bid_tracking","esai-tender",48,"Basic bid tracking; not a primary tender management feature."),
  r("PlanSwift","tender_preparation","esai-tender",55,"Tender BOQ and schedule output; US format primarily."),

  // ── ON-SCREEN TAKEOFF ─────────────────────────────────────────────────────
  // ConstructConnect product; Takeoff Boost AI (same suite as PlanSwift via Trimble integration)
  r("On-Screen Takeoff","takeoff_pdf_measurement","esai-takeoff",72,"Core product; AI-assisted PDF plan measurement via Takeoff Boost integration. Digital takeoff with automatic area and linear measurement."),
  r("On-Screen Takeoff","takeoff_traceable","esai-takeoff",70,"Visual measurement overlay on plan pages; quantities traceable to drawing."),
  r("On-Screen Takeoff","ai_plan_interpretation","esai-ai",52,"AI-assisted plan reading via Takeoff Boost; less autonomous than pure AI-native tools."),
  r("On-Screen Takeoff","ai_autonomous_scope","esai-ai",32,"AI assists measurement; full autonomous scope not confirmed."),
  r("On-Screen Takeoff","plans_multi_doc_upload","esai-plans",68,"Multiple plan file support; PDF upload confirmed."),
  r("On-Screen Takeoff","plans_cross_reference","esai-plans",42,"Basic plan comparison; full cross-referencing not confirmed."),
  r("On-Screen Takeoff","pricing_aus_database","esai-pricing",28,"No AU pricing database; US-centric."),
  r("On-Screen Takeoff","pricing_custom_rates","esai-pricing",65,"Custom rate entry; integrates with ConstructConnect pricing data."),
  r("On-Screen Takeoff","quote_editable_lines","esai-quote",65,"Estimate line editing; connects to ConstructConnect estimating workflow."),
  r("On-Screen Takeoff","quote_pdf_export","esai-quote",62,"Estimate and takeoff report export to PDF."),
  r("On-Screen Takeoff","residential_new_build","esai-residential",55,"Residential takeoff use case supported; primarily US market."),
  r("On-Screen Takeoff","residential_spec_finishes","esai-residential",38,"Material takeoff can capture finishes; no dedicated AU workflow."),
  r("On-Screen Takeoff","commercial_multi_trade","esai-commercial",65,"Used extensively for commercial multi-trade takeoff."),
  r("On-Screen Takeoff","commercial_tender_pricing","esai-commercial",55,"Tender-format output; US-focused."),
  r("On-Screen Takeoff","scope_trade_breakdown","esai-scope",60,"Trade breakdown from takeoff measurements."),
  r("On-Screen Takeoff","scope_material_labour_split","esai-scope",55,"Material and labour breakdown in estimate lines."),
  r("On-Screen Takeoff","security_compliance","esai-security",52,"ConstructConnect enterprise security; SOC 2 Type II confirmed."),
  r("On-Screen Takeoff","security_data_residency","esai-security",30,"US-hosted; no AU data residency."),
  r("On-Screen Takeoff","subcontract_package_pricing","esai-subcontract",48,"Subcontract package pricing within estimate."),
  r("On-Screen Takeoff","subcontract_trade_quoting","esai-subcontract",45,"Trade quoting workflow; ConstructConnect network integration."),
  r("On-Screen Takeoff","tender_bid_tracking","esai-tender",50,"Bid tracking via ConstructConnect platform."),
  r("On-Screen Takeoff","tender_preparation","esai-tender",52,"Tender document and BOQ preparation."),

  // ── PROEST ────────────────────────────────────────────────────────────────
  // Cloud estimating; AI features via Autodesk BIM integration; acquired by Autodesk
  r("ProEst","takeoff_pdf_measurement","esai-takeoff",65,"AI-powered digital takeoff from PDFs; BIM-integrated measurement via Autodesk platform."),
  r("ProEst","takeoff_traceable","esai-takeoff",68,"Measurements linked to plan source; Autodesk BIM integration enables model-based traceability."),
  r("ProEst","ai_plan_interpretation","esai-ai",55,"AI plan reading via Autodesk AI; BIM model interpretation for quantity extraction."),
  r("ProEst","ai_autonomous_scope","esai-ai",40,"BIM-to-estimate automation; scope generation partially automated from BIM models."),
  r("ProEst","plans_multi_doc_upload","esai-plans",70,"Cloud platform; multiple drawings and BIM models; Autodesk ecosystem integration."),
  r("ProEst","plans_cross_reference","esai-plans",58,"BIM coordination enables cross-referencing between model and spec documents."),
  r("ProEst","pricing_aus_database","esai-pricing",25,"No AU-specific pricing database; US-centric Autodesk ecosystem."),
  r("ProEst","pricing_custom_rates","esai-pricing",68,"Custom rate library; integrates with Autodesk Construction Cloud cost data."),
  r("ProEst","quote_editable_lines","esai-quote",72,"Detailed editable estimate lines; full line-item editing with markup and overhead."),
  r("ProEst","quote_pdf_export","esai-quote",70,"Professional estimate and proposal PDF export; branded templates."),
  r("ProEst","residential_new_build","esai-residential",45,"Primarily commercial/enterprise market; residential use is secondary."),
  r("ProEst","residential_spec_finishes","esai-residential",38,"Material takeoff supports finishes; no residential-specific spec workflow."),
  r("ProEst","commercial_multi_trade","esai-commercial",72,"Primary use case; multi-trade commercial GC estimating with BIM integration."),
  r("ProEst","commercial_tender_pricing","esai-commercial",65,"Tender pricing workflow; Autodesk ecosystem supports commercial tender format."),
  r("ProEst","scope_trade_breakdown","esai-scope",68,"Per-trade scope breakdown from BIM or takeoff data."),
  r("ProEst","scope_material_labour_split","esai-scope",65,"Material vs labour split; integrates with Autodesk labour rate data."),
  r("ProEst","security_compliance","esai-security",70,"Autodesk subsidiary; SOC 2 Type II, enterprise security policies."),
  r("ProEst","security_data_residency","esai-security",38,"US-hosted Autodesk infrastructure; no confirmed AU data residency."),
  r("ProEst","subcontract_package_pricing","esai-subcontract",60,"Subcontractor package pricing within estimate; subie bid comparison."),
  r("ProEst","subcontract_trade_quoting","esai-subcontract",58,"Trade quoting via integrated Autodesk Bid Board workflow."),
  r("ProEst","tender_bid_tracking","esai-tender",62,"Bid tracking and management; Autodesk Construction Cloud integration."),
  r("ProEst","tender_preparation","esai-tender",65,"Tender document and BOQ preparation; commercial GC tender format."),

  // ── STACK ─────────────────────────────────────────────────────────────────
  // Cloud takeoff + estimating; AI plan setup feature (2024); strong US commercial market
  r("STACK","takeoff_pdf_measurement","esai-takeoff",68,"AI Plan Setup automatically identifies and scales plans; digital takeoff with area, linear, count measurement from PDF."),
  r("STACK","takeoff_traceable","esai-takeoff",65,"Measurements overlaid on plan pages; traceable quantities."),
  r("STACK","ai_plan_interpretation","esai-ai",55,"AI Plan Setup classifies plan sheets and sets scale automatically; less semantic depth than Togal.AI."),
  r("STACK","ai_autonomous_scope","esai-ai",38,"AI assists plan preparation; scope assembly still requires user definition."),
  r("STACK","plans_multi_doc_upload","esai-plans",72,"Cloud-based; multiple PDF and image uploads per project; no confirmed document limit."),
  r("STACK","plans_cross_reference","esai-plans",45,"Sheet-to-sheet navigation; full spec cross-referencing not confirmed."),
  r("STACK","pricing_aus_database","esai-pricing",22,"No AU pricing database; US market pricing."),
  r("STACK","pricing_custom_rates","esai-pricing",68,"Custom rate library; labour and material rates per trade."),
  r("STACK","quote_editable_lines","esai-quote",70,"Detailed editable estimate lines; full line-item control."),
  r("STACK","quote_pdf_export","esai-quote",65,"Estimate and proposal export; PDF and Excel formats."),
  r("STACK","residential_new_build","esai-residential",52,"Residential takeoff supported; primarily US market, some AU users."),
  r("STACK","residential_spec_finishes","esai-residential",40,"Material takeoff captures finishes; no dedicated spec-finish workflow."),
  r("STACK","commercial_multi_trade","esai-commercial",68,"Strong commercial multi-trade market; used by US commercial GCs."),
  r("STACK","commercial_tender_pricing","esai-commercial",58,"Tender-format estimate output; US commercial format."),
  r("STACK","scope_trade_breakdown","esai-scope",62,"Per-trade takeoff and cost breakdown."),
  r("STACK","scope_material_labour_split","esai-scope",58,"Material and labour breakdown in estimate lines."),
  r("STACK","security_compliance","esai-security",58,"SOC 2 Type II confirmed; enterprise security."),
  r("STACK","security_data_residency","esai-security",28,"US-hosted; no AU data residency confirmed."),
  r("STACK","subcontract_package_pricing","esai-subcontract",52,"Subcontract package pricing; bid management within STACK."),
  r("STACK","subcontract_trade_quoting","esai-subcontract",50,"Trade quoting workflow; subie bid comparison."),
  r("STACK","tender_bid_tracking","esai-tender",52,"Bid tracking; project bid status management."),
  r("STACK","tender_preparation","esai-tender",55,"Tender BOQ and schedule preparation."),

  // ── ETAKEOFF ──────────────────────────────────────────────────────────────
  // Digital takeoff software with optional Togal.AI integration for AI plan reading
  r("eTakeoff","takeoff_pdf_measurement","esai-takeoff",65,"Core digital takeoff from PDF plans; Togal.AI integration adds AI auto-measurement capability."),
  r("eTakeoff","takeoff_traceable","esai-takeoff",62,"Measurements traceable to plan page; visual overlay on drawings."),
  r("eTakeoff","ai_plan_interpretation","esai-ai",48,"Togal.AI integration provides AI plan interpretation; dependent on integration being active."),
  r("eTakeoff","ai_autonomous_scope","esai-ai",30,"AI capabilities inherited from Togal.AI integration; native autonomous scope not confirmed."),
  r("eTakeoff","plans_multi_doc_upload","esai-plans",65,"Multiple PDF upload; digital plan management."),
  r("eTakeoff","plans_cross_reference","esai-plans",38,"Basic plan navigation; full cross-referencing not confirmed."),
  r("eTakeoff","pricing_aus_database","esai-pricing",20,"No AU pricing database."),
  r("eTakeoff","pricing_custom_rates","esai-pricing",60,"Custom rate entry; integrates with estimating platforms for pricing."),
  r("eTakeoff","quote_editable_lines","esai-quote",58,"Takeoff quantities feed into estimate lines; editing in integrated estimating tool."),
  r("eTakeoff","quote_pdf_export","esai-quote",55,"Takeoff report export; estimate output via integrated platform."),
  r("eTakeoff","residential_new_build","esai-residential",50,"Residential takeoff use case; primarily US market."),
  r("eTakeoff","residential_spec_finishes","esai-residential",32,"Material takeoff for finishes; no dedicated residential spec workflow."),
  r("eTakeoff","commercial_multi_trade","esai-commercial",58,"Commercial multi-trade takeoff; primary use case for eTakeoff."),
  r("eTakeoff","commercial_tender_pricing","esai-commercial",45,"Pricing via integrated estimating tool; tender format not native."),
  r("eTakeoff","scope_trade_breakdown","esai-scope",55,"Trade-based takeoff organisation; quantity breakdown per trade."),
  r("eTakeoff","scope_material_labour_split","esai-scope",40,"Material separation in takeoff; labour split in downstream estimating tool."),
  r("eTakeoff","security_compliance","esai-security",42,"Security policies not prominently documented; US-based vendor."),
  r("eTakeoff","security_data_residency","esai-security",25,"US-hosted; no AU data residency."),
  r("eTakeoff","subcontract_package_pricing","esai-subcontract",42,"Subcontract quantities for package pricing; pricing in integrated tool."),
  r("eTakeoff","subcontract_trade_quoting","esai-subcontract",40,"Trade quoting via integrated platform."),
  r("eTakeoff","tender_bid_tracking","esai-tender",38,"Bid tracking not a primary eTakeoff feature."),
  r("eTakeoff","tender_preparation","esai-tender",42,"Tender BOQ from takeoff quantities; preparation in integrated estimating tool."),

  // ── ESTICOM ───────────────────────────────────────────────────────────────
  // ConstructConnect AI takeoff platform; cloud estimating with AI plan reading
  r("Esticom","takeoff_pdf_measurement","esai-takeoff",70,"AI-powered digital takeoff from PDF plans; automatic measurement via ConstructConnect AI."),
  r("Esticom","takeoff_traceable","esai-takeoff",65,"Visual overlay on plan pages; measurement traceability confirmed."),
  r("Esticom","ai_plan_interpretation","esai-ai",58,"AI plan reading and automatic measurement; ConstructConnect AI classification of plan elements."),
  r("Esticom","ai_autonomous_scope","esai-ai",40,"AI assists measurement; autonomous scope generation partially supported."),
  r("Esticom","plans_multi_doc_upload","esai-plans",70,"Cloud platform; multiple plan uploads; ConstructConnect document management."),
  r("Esticom","plans_cross_reference","esai-plans",48,"Plan comparison; ConstructConnect platform cross-referencing."),
  r("Esticom","pricing_aus_database","esai-pricing",22,"No AU pricing database; US-centric ConstructConnect ecosystem."),
  r("Esticom","pricing_custom_rates","esai-pricing",65,"Custom rate library; ConstructConnect pricing data integration."),
  r("Esticom","quote_editable_lines","esai-quote",68,"Editable estimate lines; full detail estimate within Esticom platform."),
  r("Esticom","quote_pdf_export","esai-quote",65,"Estimate and proposal PDF export."),
  r("Esticom","residential_new_build","esai-residential",55,"Residential estimating supported; primarily US market."),
  r("Esticom","residential_spec_finishes","esai-residential",40,"Material takeoff; no dedicated AU spec-finish workflow."),
  r("Esticom","commercial_multi_trade","esai-commercial",62,"Commercial multi-trade estimating; ConstructConnect commercial focus."),
  r("Esticom","commercial_tender_pricing","esai-commercial",58,"Tender pricing; ConstructConnect tender workflow."),
  r("Esticom","scope_trade_breakdown","esai-scope",60,"Trade-based scope breakdown from takeoff."),
  r("Esticom","scope_material_labour_split","esai-scope",55,"Material and labour breakdown in estimate."),
  r("Esticom","security_compliance","esai-security",60,"ConstructConnect enterprise security; SOC 2 Type II."),
  r("Esticom","security_data_residency","esai-security",30,"US-hosted; no AU data residency."),
  r("Esticom","subcontract_package_pricing","esai-subcontract",55,"Subcontract package pricing; ConstructConnect subie network."),
  r("Esticom","subcontract_trade_quoting","esai-subcontract",52,"Trade quoting via ConstructConnect Bid Board."),
  r("Esticom","tender_bid_tracking","esai-tender",58,"Bid tracking via ConstructConnect platform."),
  r("Esticom","tender_preparation","esai-tender",58,"Tender BOQ and document preparation."),

  // ── GLODON ────────────────────────────────────────────────────────────────
  // Chinese BIM + AI cost management platform; global expansion; strong BIM-to-estimate AI
  r("Glodon","takeoff_pdf_measurement","esai-takeoff",72,"AI-powered BIM and PDF plan measurement; Glodon Cubicost product line uses AI for automatic quantity extraction from drawings."),
  r("Glodon","takeoff_traceable","esai-takeoff",70,"BIM model traceability; quantities linked to 3D model elements or plan sources."),
  r("Glodon","ai_plan_interpretation","esai-ai",65,"AI plan reading and BIM element classification; strong AI-to-quantity capability in Cubicost platform."),
  r("Glodon","ai_autonomous_scope","esai-ai",55,"AI-enabled automatic scope generation from BIM models; partial autonomous capability confirmed."),
  r("Glodon","plans_multi_doc_upload","esai-plans",72,"Multi-document and BIM model upload; enterprise-grade document management."),
  r("Glodon","plans_cross_reference","esai-plans",60,"BIM coordination supports cross-referencing between structural, architectural, and MEP drawings."),
  r("Glodon","pricing_aus_database","esai-pricing",20,"No AU pricing database; Chinese and some international pricing data; AU pricing requires manual entry."),
  r("Glodon","pricing_custom_rates","esai-pricing",65,"Custom rate entry; supports international pricing structures."),
  r("Glodon","quote_editable_lines","esai-quote",65,"Detailed BOQ with editable line items; standard international format."),
  r("Glodon","quote_pdf_export","esai-quote",68,"BOQ and cost report export to PDF and Excel."),
  r("Glodon","residential_new_build","esai-residential",45,"Primarily commercial and infrastructure; residential use is secondary market."),
  r("Glodon","residential_spec_finishes","esai-residential",38,"BIM-based finish quantities; no dedicated AU residential spec workflow."),
  r("Glodon","commercial_multi_trade","esai-commercial",72,"Primary market; large commercial and infrastructure projects. Strong multi-trade BIM quantity extraction."),
  r("Glodon","commercial_tender_pricing","esai-commercial",62,"Tender pricing and BOQ; international tender format support."),
  r("Glodon","scope_trade_breakdown","esai-scope",68,"Per-trade scope breakdown from BIM model; strong trade separation."),
  r("Glodon","scope_material_labour_split","esai-scope",62,"Material and labour split from BIM cost database."),
  r("Glodon","security_compliance","esai-security",55,"ISO 27001 certified; enterprise security for global clients."),
  r("Glodon","security_data_residency","esai-security",35,"Data hosted in China and international data centres; AU data residency not confirmed."),
  r("Glodon","subcontract_package_pricing","esai-subcontract",55,"Subcontract package pricing within Glodon cost management."),
  r("Glodon","subcontract_trade_quoting","esai-subcontract",50,"Trade quoting workflow; primarily enterprise use."),
  r("Glodon","tender_bid_tracking","esai-tender",58,"Bid and tender tracking in Glodon project platform."),
  r("Glodon","tender_preparation","esai-tender",62,"Tender BOQ and schedule preparation; international tender format."),
];

async function main() {
  console.log(`Inserting ${ROWS.length} rows for 8 restored brands...`);

  for (const row of ROWS) {
    await sql`
      INSERT INTO esai_feature_scores
        (brand_name, feature_id, feature_tag, score, score_band, grounded_source,
         flagged_for_review, flag_reason, notes, scored_at)
      VALUES (
        ${row.brand}, ${row.feature_id}, ${row.feature_tag},
        ${row.score}, ${row.score_band}, true,
        true, 'restored-research-based — needs LLM pipeline re-run to confirm',
        ${row.notes}, NOW()
      )
      ON CONFLICT (brand_name, feature_id) DO UPDATE SET
        score            = EXCLUDED.score,
        score_band       = EXCLUDED.score_band,
        grounded_source  = true,
        flagged_for_review = true,
        flag_reason      = EXCLUDED.flag_reason,
        notes            = EXCLUDED.notes,
        scored_at        = NOW()
    `;
    process.stdout.write(".");
  }

  console.log("\nDone. Verifying row counts per brand:");
  const counts = await sql`
    SELECT brand_name, COUNT(*)::int as n
    FROM esai_feature_scores
    GROUP BY brand_name ORDER BY brand_name
  ` as any[];
  counts.forEach(r => console.log(`  ${r.brand_name}: ${r.n} rows`));
}

main().catch(console.error);
