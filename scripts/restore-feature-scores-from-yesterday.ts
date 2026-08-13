/**
 * restore-feature-scores-from-yesterday.ts
 *
 * Re-runs the dexify-feature-aggregate logic for yesterday's run_date
 * and upserts the resulting scores into dexify_feature_scores.
 *
 * Use case: today's grounding pass failed mid-run (credit exhaustion),
 * so today's aggregate wrote degraded / not_documented scores.
 * This restores yesterday's known-good, fully-grounded scores.
 *
 * Run:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/restore-feature-scores-from-yesterday.ts
 *
 * Or add DATABASE_URL to .env.local and run:
 *   npx tsx scripts/restore-feature-scores-from-yesterday.ts
 *
 * Does NOT touch dexify_feature_responses rows (source data left as-is).
 */

import { neon } from "@neondatabase/serverless";
import fs   from "fs";
import path from "path";

// ── Load .env.local ────────────────────────────────────────────────────────────
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=\s][^=]*)=["']?(.*?)["']?\s*$/);
    if (!match) continue;
    const [, key, val] = match;
    if (!process.env[key] && val) process.env[key] = val;
  }
}
loadEnvLocal();

const DB_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
if (!DB_URL) {
  console.error("❌  DATABASE_URL not set. Add it to .env.local or pass it in the environment.");
  process.exit(1);
}

const sql = neon(DB_URL);

// ── Scoring logic (mirrors dexify-features.ts exactly) ────────────────────────

type HasCapability = "yes" | "partial" | "no" | "not_documented";
type Confidence    = "high" | "medium" | "low";

const CAP_RANK: Record<HasCapability, number> = {
  yes: 3, partial: 2, no: 1, not_documented: 0,
};

const HEDGING_PHRASES = [
  "may ", "might ", "likely ", "probably ",
  "similar tools", "typically ", "I believe", "I think", "could ",
];

function downgradeConfidence(conf: Confidence): Confidence {
  if (conf === "high")   return "medium";
  if (conf === "medium") return "low";
  return "low";
}

interface FeatureRunRow {
  model:          string;
  has_capability: string | null;
  evidence:       string | null;
  confidence:     string | null;
  parse_error:    boolean;
  grounded:       boolean;
}

interface ModelConsensus {
  capability:  HasCapability;
  confidence:  Confidence;
  agreeing:    number;
  total:       number;
  hasGrounded: boolean;
}

function modelConsensus(rows: FeatureRunRow[]): ModelConsensus {
  const valid = rows.filter((r) => !r.parse_error && r.has_capability !== null);
  if (valid.length === 0) {
    return { capability: "not_documented", confidence: "low", agreeing: 0, total: 0, hasGrounded: false };
  }

  const capCounts: Partial<Record<HasCapability, number>> = {};
  for (const r of valid) {
    const cap = r.has_capability as HasCapability;
    capCounts[cap] = (capCounts[cap] ?? 0) + 1;
  }

  const majority    = Math.ceil(valid.length / 2);
  const leadEntry   = Object.entries(capCounts).sort((a, b) => b[1] - a[1])[0];
  const leadCap     = leadEntry[0] as HasCapability;
  const leadCount   = leadEntry[1];
  const hasGrounded = valid.some((r) => r.grounded);
  const hasHedging  = valid.some((r) => HEDGING_PHRASES.some((p) => r.evidence?.toLowerCase().includes(p)));

  let conf: Confidence = leadCount >= Math.ceil(valid.length * 0.75) ? "high"
    : leadCount >= majority ? "medium"
    : "low";

  const avgConfValid = valid.filter((r) => r.confidence !== null);
  if (avgConfValid.length > 0) {
    const confRank = { high: 2, medium: 1, low: 0 };
    const avg      = avgConfValid.reduce((s, r) => s + (confRank[r.confidence as Confidence] ?? 0), 0) / avgConfValid.length;
    const modelConf: Confidence = avg >= 1.5 ? "high" : avg >= 0.8 ? "medium" : "low";
    conf = confRank[conf] <= confRank[modelConf] ? conf : modelConf;
  }

  if (hasHedging) conf = downgradeConfidence(conf);

  return { capability: leadCap, confidence: conf, agreeing: leadCount, total: valid.length, hasGrounded };
}

interface DexifyScoreResult {
  score:              number | null;
  score_band:         string;
  runs_agreeing:      number | null;
  runs_total:         number;
  flagged_for_review: boolean;
  flag_reason:        string | null;
  notes:              string | null;
  grounded_source:    boolean;
}

function computeDexifyScore(rows: FeatureRunRow[]): DexifyScoreResult {
  const standardRows = rows.filter((r) => !r.grounded);
  const groundedRows = rows.filter((r) => r.grounded);

  const std = modelConsensus(standardRows);
  const gnd = groundedRows.length > 0 ? modelConsensus(groundedRows) : null;

  let cap  = std.capability;
  let conf = std.confidence;
  let grounded_source = false;

  if (gnd && gnd.capability !== "not_documented") {
    cap  = gnd.capability;
    conf = gnd.capability === "not_documented" ? gnd.confidence : gnd.confidence;
    grounded_source = true;
    // Re-assign explicitly to match original
    conf = gnd.confidence;
  }

  const scoreMap: Record<HasCapability, Record<Confidence, number>> = {
    yes:            { high: 95, medium: 80, low: 65 },
    partial:        { high: 60, medium: 45, low: 30 },
    no:             { high: 5,  medium: 10, low: 15 },
    not_documented: { high: 0,  medium: 0,  low: 0  },
  };

  const score     = cap === "not_documented" ? null : scoreMap[cap][conf];
  const score_band =
    score === null ? "not_documented"
    : score >= 80  ? "high"
    : score >= 40  ? "medium"
    : "low";

  const disagreement       = std.total > 0 && std.agreeing < Math.ceil(std.total / 2);
  const allParseErrors     = rows.every((r) => r.parse_error);
  const lowConfHighCap     = cap === "yes" && conf === "low" && !grounded_source;
  const groundedDowngraded = grounded_source && gnd !== null && CAP_RANK[gnd.capability] < CAP_RANK[std.capability];

  const flagged     = disagreement || allParseErrors || lowConfHighCap || groundedDowngraded;
  const flag_reason =
    allParseErrors      ? "all_parse_errors"
    : groundedDowngraded ? "grounded_downgrade"
    : disagreement       ? "model_disagreement"
    : lowConfHighCap     ? "low_confidence_yes"
    : null;

  return {
    score,
    score_band,
    runs_agreeing:      std.agreeing,
    runs_total:         std.total + (gnd?.total ?? 0),
    flagged_for_review: flagged,
    flag_reason,
    notes:              null,
    grounded_source,
  };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const today     = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];

  console.log(`\n📋  Dexify Feature Score Restore`);
  console.log(`    Today:     ${today}  (broken — leaving responses untouched)`);
  console.log(`    Restoring: ${yesterday}\n`);

  // ── Step 1: Verify yesterday's data ──────────────────────────────────────────
  const countRows = await sql`
    SELECT grounded, COUNT(*) AS rows, COUNT(DISTINCT brand_name) AS brands
    FROM dexify_feature_responses
    WHERE run_date = ${yesterday}::date
    GROUP BY grounded
    ORDER BY grounded
  `;

  if (countRows.length === 0) {
    console.error(`❌  No dexify_feature_responses found for ${yesterday}. Aborting.`);
    process.exit(1);
  }

  console.log(`Yesterday's response data (${yesterday}):`);
  for (const r of countRows) {
    console.log(`  grounded=${r.grounded}  rows=${r.rows}  brands=${r.brands}`);
  }

  const groundedYesterday = countRows.find((r) => r.grounded === true);
  if (!groundedYesterday || Number(groundedYesterday.brands) < 10) {
    const b = groundedYesterday ? groundedYesterday.brands : 0;
    console.warn(`\n⚠️   Yesterday only has grounded data for ${b}/10 brands.`);
    console.warn(`    This is lower than expected — proceeding anyway but verify the output.\n`);
  } else {
    console.log(`\n✅  Yesterday's grounded data is complete: ${groundedYesterday.rows} rows, ${groundedYesterday.brands} brands\n`);
  }

  // ── Step 2: Fetch yesterday's responses ──────────────────────────────────────
  const responses = await sql`
    SELECT brand_name, feature_id, feature_tag, model,
           has_capability, evidence, confidence, parse_error,
           COALESCE(grounded, FALSE) AS grounded
    FROM dexify_feature_responses
    WHERE run_date = ${yesterday}::date
    ORDER BY brand_name, feature_id, model, grounded ASC, run_number
  `;

  if (responses.length === 0) {
    console.error("❌  No responses returned. Aborting.");
    process.exit(1);
  }

  console.log(`Fetched ${responses.length} response rows for ${yesterday}`);

  // ── Step 3: Group and score ───────────────────────────────────────────────────
  const groups     = new Map<string, FeatureRunRow[]>();
  const featureTags = new Map<string, string>(); // key → feature_tag

  for (const r of responses) {
    const key = `${r.brand_name}::${r.feature_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push({
      model:          r.model,
      has_capability: r.has_capability,
      evidence:       r.evidence,
      confidence:     r.confidence,
      parse_error:    r.parse_error,
      grounded:       r.grounded,
    });
    if (r.feature_tag) featureTags.set(key, r.feature_tag as string);
  }

  console.log(`Grouped into ${groups.size} brand+feature pairs\n`);
  console.log("─".repeat(80));
  console.log(`${"Brand".padEnd(20)} ${"Feature ID".padEnd(36)} ${"Score".padEnd(6)} Band`);
  console.log("─".repeat(80));

  let scored = 0, notDocumented = 0, errors = 0;

  for (const [key, rows] of groups) {
    const [brand_name, feature_id] = key.split("::");
    const feature_tag = featureTags.get(key);

    if (!feature_tag) {
      console.error(`❌  No feature_tag for ${key} — skipping`);
      errors++;
      continue;
    }

    try {
      const result = computeDexifyScore(rows);
      const isGnd  = result.grounded_source ? " [gnd]" : "";

      await sql`
        INSERT INTO dexify_feature_scores
          (brand_name, feature_id, feature_tag, score, score_band,
           runs_agreeing, runs_total, flagged_for_review, flag_reason, notes,
           grounded_source, scored_at)
        VALUES
          (${brand_name}, ${feature_id}, ${feature_tag}, ${result.score},
           ${result.score_band}, ${result.runs_agreeing}, ${result.runs_total},
           ${result.flagged_for_review}, ${result.flag_reason}, ${result.notes},
           ${result.grounded_source}, NOW())
        ON CONFLICT (brand_name, feature_id) DO UPDATE SET
          feature_tag        = EXCLUDED.feature_tag,
          score              = EXCLUDED.score,
          score_band         = EXCLUDED.score_band,
          runs_agreeing      = EXCLUDED.runs_agreeing,
          runs_total         = EXCLUDED.runs_total,
          flagged_for_review = EXCLUDED.flagged_for_review,
          flag_reason        = EXCLUDED.flag_reason,
          notes              = EXCLUDED.notes,
          grounded_source    = EXCLUDED.grounded_source,
          scored_at          = NOW()
      `;

      const scoreStr = result.score !== null ? String(result.score) : "null";
      console.log(`${brand_name.padEnd(20)} ${feature_id.padEnd(36)} ${scoreStr.padEnd(6)} ${result.score_band}${isGnd}`);
      scored++;
      if (result.score_band === "not_documented") notDocumented++;
    } catch (err) {
      console.error(`❌  Error scoring ${key}:`, err instanceof Error ? err.message : err);
      errors++;
    }
  }

  console.log("─".repeat(80));
  console.log(`\n✅  Restore complete`);
  console.log(`    Upserted: ${scored} brand+feature pairs`);
  console.log(`    Not documented: ${notDocumented}`);
  console.log(`    Errors: ${errors}`);

  // ── Step 4: Spot check ───────────────────────────────────────────────────────
  const spotCheckPairs = [
    { brand: "Sammy AI",  feature: "voice_to_quote_generation",  expectNot: "not_documented" },
    { brand: "Voxworks",  feature: "branded_pdf_quote_output",   expectNot: "not_documented" },
  ];

  console.log(`\n── Spot check ──────────────────────────────────────────────────────────────`);
  for (const { brand, feature, expectNot } of spotCheckPairs) {
    const rows = await sql`
      SELECT score, score_band, grounded_source, runs_agreeing, runs_total
      FROM dexify_feature_scores
      WHERE brand_name = ${brand} AND feature_id = ${feature}
    `;
    if (rows.length === 0) {
      console.log(`  ⚠️  ${brand} / ${feature} — no row found`);
    } else {
      const r   = rows[0];
      const ok  = r.score_band !== expectNot;
      const gnd = r.grounded_source ? " (grounded)" : "";
      const badge = ok ? "✅" : "❌";
      console.log(`  ${badge}  ${brand} / ${feature}: score=${r.score} band=${r.score_band}${gnd} (${r.runs_agreeing}/${r.runs_total} runs agreeing)`);
    }
  }

  console.log();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
