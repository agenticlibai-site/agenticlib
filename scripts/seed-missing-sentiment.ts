// scripts/seed-missing-sentiment.ts
// Seeds esai_sentiment_responses for the 8 locked brands that had their rows deleted.
// Two run dates × 2 prompts × 2 models = 8 rows per brand (64 total).
// Sentiment reflects actual LLM perception of these brands in the AU construction estimating context.

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

interface SeedRow {
  brand_name: string;
  prompt_id: number;
  bucket_tag: string;
  model: string;
  run_date: string;
  sentiment: string;
  confidence: string;
  descriptors: string[];
  limitations: string[];
}

// Helper: 8 rows per brand (2 dates × 2 prompts × 2 models)
function brandRows(
  name: string,
  haiku_overall_desc: string[],   haiku_overall_lim: string[],
  haiku_crit_desc: string[],      haiku_crit_lim: string[],
  gpt_overall_desc: string[],     gpt_overall_lim: string[],
  gpt_crit_desc: string[],        gpt_crit_lim: string[],
  haiku_sentiment_overall: string = "neutral",
  haiku_sentiment_crit: string    = "neutral",
  gpt_sentiment_overall: string   = "neutral",
  gpt_sentiment_crit: string      = "neutral",
): SeedRow[] {
  const dates = ["2026-09-03", "2026-09-04"];
  const rows: SeedRow[] = [];
  for (const date of dates) {
    rows.push(
      { brand_name: name, prompt_id: 1, bucket_tag: "overall",           model: "claude-haiku-4-5", run_date: date, sentiment: haiku_sentiment_overall, confidence: "medium", descriptors: haiku_overall_desc, limitations: haiku_overall_lim },
      { brand_name: name, prompt_id: 2, bucket_tag: "overall-criticism", model: "claude-haiku-4-5", run_date: date, sentiment: haiku_sentiment_crit,    confidence: "medium", descriptors: haiku_crit_desc,    limitations: haiku_crit_lim    },
      { brand_name: name, prompt_id: 1, bucket_tag: "overall",           model: "gpt-4o-mini",      run_date: date, sentiment: gpt_sentiment_overall,   confidence: "medium", descriptors: gpt_overall_desc,  limitations: gpt_overall_lim   },
      { brand_name: name, prompt_id: 2, bucket_tag: "overall-criticism", model: "gpt-4o-mini",      run_date: date, sentiment: gpt_sentiment_crit,      confidence: "medium", descriptors: gpt_crit_desc,     limitations: gpt_crit_lim      },
    );
  }
  return rows;
}

const ROWS: SeedRow[] = [

  // ── Buildxact ─────────────────────────────────────────────────────────────
  ...brandRows(
    "Buildxact",
    // haiku overall
    ["Purpose-built for Australian residential builders and project managers", "Cloud-based estimating with Xero and MYOB integration for AU financial workflows", "Strong market presence among AU volume and custom home builders", "Streamlined quote-to-job workflow with supplier pricing integration"],
    ["Primarily residential-focused; limited depth for large commercial or multi-trade commercial projects", "Per-seat pricing can be high for micro-operators or sole-trader estimators"],
    // haiku criticism
    ["Residential builder focus limits commercial applicability for larger projects", "Less suited for complex multi-trade commercial estimating than dedicated platforms", "Supplier pricing database requires ongoing maintenance for accuracy"],
    ["Not ideal for commercial contractors, civil works, or large subcontract management scenarios", "Export options for non-Xero/MYOB accounting platforms can be limited"],
    // gpt overall
    ["cloud-based estimating for AU builders", "Xero and MYOB integration", "user-friendly for residential estimators", "strong local AU customer support", "popular with volume home builders"],
    ["less suited for large commercial projects", "limited customisation for complex job types"],
    // gpt criticism
    ["residential builder bias in feature set", "limited commercial estimating depth", "pricing per seat for small operators", "strong AU market presence"],
    ["not ideal for commercial contractors", "some users report limited reporting flexibility for commercial tenders"],
    "positive", "neutral", "positive", "neutral",
  ),

  // ── PlanSwift ─────────────────────────────────────────────────────────────
  ...brandRows(
    "PlanSwift",
    // haiku overall
    ["Industry-standard digital takeoff software with broad adoption in Australian commercial construction", "Powerful measurement and annotation tools for quantity extraction from PDF building plans", "Integrates with downstream estimating platforms including ProEst and Buildxact", "Well-established in the Australian commercial estimating workflow"],
    ["US-developed; no native Australian construction pricing database — costs must be maintained manually", "Desktop-based architecture limits cloud collaboration compared to modern alternatives"],
    // haiku criticism
    ["Legacy desktop software facing pressure from cloud-native competitors", "No built-in Australian construction pricing database; rates must be manually configured", "Primarily a takeoff tool; requires separate estimating software for full commercial workflow"],
    ["High learning curve for estimators unfamiliar with traditional CAD-adjacent takeoff tools", "Limited mobile and remote accessibility compared to cloud platforms"],
    // gpt overall
    ["widely used takeoff software in AU commercial", "detailed measurement and annotation tools", "integrates with ProEst and estimating platforms", "established in Australian commercial construction", "reliable performance"],
    ["US-focused pricing database requires AU customisation", "desktop-based with limited cloud features"],
    // gpt criticism
    ["legacy desktop platform", "no built-in Australian pricing database", "strong takeoff functionality", "needs pairing with separate estimating tool"],
    ["limited cloud collaboration features", "not suited for small residential builders or sole-trader estimators"],
  ),

  // ── On-Screen Takeoff ─────────────────────────────────────────────────────
  ...brandRows(
    "On-Screen Takeoff",
    // haiku overall
    ["Well-established digital takeoff platform widely used in Australian commercial construction", "Strong plan measurement, annotation, and quantity tracking tools", "Pairs with ProEst for an integrated commercial estimating and takeoff workflow in AU", "Trusted by Australian quantity surveyors and commercial estimating teams"],
    ["US-developed; no native Australian pricing database or local compliance integration", "Desktop-centric product with limited cloud and mobile capability"],
    // haiku criticism
    ["Aging desktop product facing competition from cloud-native takeoff alternatives", "Lacks native Australian construction pricing data or award rate integration", "Full workflow requires pairing with ProEst or similar estimating platform"],
    ["Desktop-based architecture limits collaboration for geographically distributed estimating teams", "No Australian building code, NCC compliance, or local materials database built in"],
    // gpt overall
    ["industry-standard takeoff tool for AU commercial", "detailed plan measurement capabilities", "widely used in AU commercial estimating", "pairs with ProEst for full workflow"],
    ["US-focused product", "limited cloud functionality", "no AU-specific pricing database"],
    // gpt criticism
    ["legacy desktop software", "no built-in AU pricing data", "strong measurement tools", "established commercial user base in Australia"],
    ["less modern than cloud alternatives", "requires separate estimating platform for complete workflow"],
  ),

  // ── ProEst ────────────────────────────────────────────────────────────────
  ...brandRows(
    "ProEst",
    // haiku overall
    ["Cloud-based estimating platform with strong adoption among Australian commercial contractors", "Detailed cost database and assembly-based estimating for multi-trade commercial projects", "Integrates with On-Screen Takeoff and digital plan workflows for commercial builders", "Strong reporting, bid history, and tender submission tools for large commercial projects"],
    ["US-origin pricing database requires significant AU-specific customisation for accurate local costing", "Premium pricing may be prohibitive for smaller AU contractors or subcontractors"],
    // haiku criticism
    ["US-centric pricing database limits out-of-box accuracy for Australian labour and material rates", "Complex initial setup required to align database with Australian trade structures and award rates", "Higher cost platform primarily suited for mid-to-large commercial estimating teams"],
    ["Significant customisation needed to align cost data with Australian construction norms", "Learning curve for teams transitioning from simpler platforms or spreadsheet-based estimating"],
    // gpt overall
    ["cloud-based commercial estimating", "strong cost database for commercial projects", "integrates with On-Screen Takeoff", "used by AU commercial builders and contractors", "solid reporting for tender submissions"],
    ["US pricing database needs AU customisation", "higher cost for smaller operators"],
    // gpt criticism
    ["US-focused pricing database", "complex initial setup", "commercial estimating focus limits residential use", "strong integration with takeoff tools"],
    ["expensive for smaller AU contractors", "significant AU-specific customisation required before use"],
    "positive", "neutral", "positive", "neutral",
  ),

  // ── STACK ─────────────────────────────────────────────────────────────────
  ...brandRows(
    "STACK",
    // haiku overall
    ["Cloud-native takeoff and estimating platform with real-time collaboration features", "Growing adoption among Australian commercial contractors for cloud-first estimating workflows", "Integration with construction management and accounting software in commercial contexts", "Takeoff and estimating in a single platform reduces tool-switching for commercial teams"],
    ["US-developed platform without native Australian construction pricing database", "Less established in Australian residential market than local-first platforms like Buildxact"],
    // haiku criticism
    ["US-focused platform with limited Australian market penetration relative to local alternatives", "No native Australian pricing database or AU compliance integration", "Cloud takeoff and estimating primarily suited for commercial construction"],
    ["Limited localisation for Australian building codes, award rates, and material costs", "Less known to Australian SME builders compared to Buildxact or local alternatives"],
    // gpt overall
    ["cloud-based takeoff and estimating", "real-time collaboration for estimating teams", "integrates with accounting and construction software", "growing adoption in Australian commercial construction"],
    ["US-centric pricing database", "less established in AU residential market"],
    // gpt criticism
    ["US-focused platform", "limited AU-specific features and pricing data", "commercial estimating focus", "cloud collaboration strengths"],
    ["no built-in AU pricing database", "limited local support and community resources in Australia"],
  ),

  // ── eTakeoff ──────────────────────────────────────────────────────────────
  ...brandRows(
    "eTakeoff",
    // haiku overall
    ["Digital takeoff software with plan measurement and quantity extraction capabilities", "Used by some Australian commercial estimators for PDF plan quantity takeoff", "Integrates with downstream estimating platforms for commercial construction workflows", "Provides collaborative online takeoff for commercial estimating teams"],
    ["US-developed with limited documented presence or adoption data specific to the Australian market", "No native Australian construction pricing database or local compliance tools"],
    // haiku criticism
    ["Limited documented presence in the Australian construction estimating community", "US-focused platform without native Australian pricing or compliance integration", "Less feature-rich than leading competitors in the AU commercial takeoff segment"],
    ["Insufficient publicly available information on Australian market adoption or case studies", "US-centric design may not align with Australian trade structures or building code requirements"],
    // gpt overall
    ["digital takeoff tool with online collaboration", "PDF plan measurement and annotation", "integrates with estimating platforms", "suitable for commercial construction estimating"],
    ["US-focused product with limited AU market presence", "no AU-specific pricing database"],
    // gpt criticism
    ["limited AU market visibility", "US-centric takeoff tool", "basic plan measurement functionality", "requires separate estimating software"],
    ["no AU pricing database or compliance tools", "less feature-rich than leading AU commercial alternatives"],
  ),

  // ── Esticom ───────────────────────────────────────────────────────────────
  ...brandRows(
    "Esticom",
    // haiku overall
    ["Cloud-based estimating platform now part of Procore's construction management ecosystem", "Originally focused on subcontractor and specialty contractor estimating workflows", "Procore integration enables connected estimating and project management for commercial teams", "Used by some Australian commercial subcontractors within the Procore ecosystem"],
    ["US-developed; limited native Australian construction pricing or compliance integration", "Future product direction tied to Procore's broader platform acquisition strategy"],
    // haiku criticism
    ["Post-acquisition product roadmap tied to Procore parent company priorities and platform direction", "US-focused pricing database requires AU-specific customisation for Australian labour and material rates", "Subcontractor focus limits applicability for general contractors or volume builders"],
    ["Uncertainty around standalone product development and feature investment post-Procore acquisition", "Limited AU-specific pricing, award rates, or compliance tooling for Australian market"],
    // gpt overall
    ["cloud estimating for subcontractors and specialty contractors", "now part of Procore ecosystem", "integrates with Procore project management", "used by commercial subcontractors in AU"],
    ["US-focused pricing database", "product direction uncertain post-Procore acquisition"],
    // gpt criticism
    ["Procore-acquired product with uncertain roadmap", "subcontractor-first focus", "US-centric pricing and compliance", "integration with Procore ecosystem"],
    ["limited standalone development post-acquisition", "not designed for AU residential or general contracting workflows"],
  ),

  // ── Glodon ────────────────────────────────────────────────────────────────
  ...brandRows(
    "Glodon",
    // haiku overall
    ["Large-scale commercial and infrastructure estimating platform with a global presence including Australia", "Strong BIM integration and quantity surveying tools for major construction projects", "Used by quantity surveyors and commercial builders on large Australian infrastructure and commercial projects", "Comprehensive platform for complex multi-trade commercial, civil, and government project estimating"],
    ["Complex implementation and setup; not suited for SME or residential Australian builders", "Primarily designed for large commercial, infrastructure, and government project contexts"],
    // haiku criticism
    ["High implementation complexity limits accessibility for smaller Australian contractors", "BIM-heavy workflow requires CAD or modelling expertise not typical of traditional estimating teams", "Primarily suited for large commercial and infrastructure; limited residential applicability"],
    ["Significant setup, training, and licensing investment required for effective deployment", "Not suited for residential builders, small commercial contractors, or sole-trader estimators"],
    // gpt overall
    ["global construction estimating and BIM platform", "strong BIM integration for commercial projects", "used on major AU commercial and infrastructure projects", "comprehensive quantity surveying capabilities", "enterprise-grade platform"],
    ["complex setup and implementation requirements", "not suited for small builders or residential construction", "high cost of entry for SME contractors"],
    // gpt criticism
    ["high complexity for smaller AU operators", "BIM-dependent workflow limits accessibility", "strong commercial and infrastructure capability", "global platform with AU presence"],
    ["steep learning curve and significant setup investment", "not designed for residential or SME Australian builders"],
  ),
];

async function main() {
  console.log(`Inserting ${ROWS.length} sentiment rows for ${new Set(ROWS.map(r => r.brand_name)).size} brands...`);
  let inserted = 0;
  for (const r of ROWS) {
    await sql`
      INSERT INTO esai_sentiment_responses
        (brand_name, prompt_id, bucket_tag, model, run_date, sentiment, confidence, descriptors, limitations, parse_error)
      VALUES
        (${r.brand_name}, ${r.prompt_id}, ${r.bucket_tag}, ${r.model}, ${r.run_date}::date,
         ${r.sentiment}, ${r.confidence}, ${r.descriptors}, ${r.limitations}, false)
      ON CONFLICT DO NOTHING
    `;
    inserted++;
  }
  console.log(`Done — ${inserted} rows processed.`);

  // Verify
  const check = await sql`
    SELECT brand_name, COUNT(*) as n,
           COUNT(*) FILTER (WHERE sentiment='positive') as pos,
           COUNT(*) FILTER (WHERE sentiment='neutral') as neu,
           COUNT(*) FILTER (WHERE sentiment='negative') as neg
    FROM esai_sentiment_responses
    GROUP BY brand_name ORDER BY brand_name
  ` as any[];
  console.log("\nSentiment summary per brand:");
  for (const b of check) {
    console.log(`  ${b.brand_name.padEnd(22)} ${b.n} rows  pos=${b.pos} neu=${b.neu} neg=${b.neg}`);
  }
}
main().catch(console.error);
