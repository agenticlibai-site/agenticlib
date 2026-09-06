// scripts/esai-interpolate-sep1.ts
// Fills in the missing 2026-09-01 date in esai_daily_summary by linearly
// interpolating between 2026-08-31 and 2026-09-02 for every
// brand × model × cluster_tag combination that exists on both flanking dates.
// Run with: npx tsx scripts/esai-interpolate-sep1.ts

import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const SEP1 = "2026-09-01";
const AUG31 = "2026-08-31";
const SEP2  = "2026-09-02";

async function main() {
  // Check if Sep 1 data already exists
  const existing = await sql`
    SELECT COUNT(*)::int AS n FROM esai_daily_summary WHERE date = ${SEP1}::date
  ` as { n: number }[];
  if (existing[0]?.n > 0) {
    console.log(`Sep 1 already has ${existing[0].n} rows — nothing to do.`);
    return;
  }

  // Pull Aug 31 and Sep 2 data
  const aug31 = await sql`
    SELECT brand, model, cluster_tag, mention_count, avg_position
    FROM esai_daily_summary WHERE date = ${AUG31}::date
  ` as { brand: string; model: string; cluster_tag: string; mention_count: number; avg_position: number }[];

  const sep2 = await sql`
    SELECT brand, model, cluster_tag, mention_count, avg_position
    FROM esai_daily_summary WHERE date = ${SEP2}::date
  ` as { brand: string; model: string; cluster_tag: string; mention_count: number; avg_position: number }[];

  console.log(`Aug 31 rows: ${aug31.length} | Sep 2 rows: ${sep2.length}`);

  // Index Sep 2 for fast lookup
  const sep2Map = new Map<string, { mention_count: number; avg_position: number }>();
  for (const r of sep2) {
    sep2Map.set(`${r.brand}::${r.model}::${r.cluster_tag}`, r);
  }

  // Build interpolated Sep 1 rows (only where both flanking dates exist)
  const rows: { brand: string; model: string; cluster_tag: string; mention_count: number; avg_position: number }[] = [];
  for (const a of aug31) {
    const key = `${a.brand}::${a.model}::${a.cluster_tag}`;
    const s = sep2Map.get(key);
    if (!s) continue; // only present on Aug 31, skip
    rows.push({
      brand:         a.brand,
      model:         a.model,
      cluster_tag:   a.cluster_tag,
      mention_count: Math.round((a.mention_count + s.mention_count) / 2),
      avg_position:  Math.round(((a.avg_position + s.avg_position) / 2) * 10) / 10,
    });
  }

  console.log(`Interpolating ${rows.length} rows for ${SEP1}…`);

  // Insert in batches of 100
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    for (const r of batch) {
      await sql`
        INSERT INTO esai_daily_summary (date, brand, model, cluster_tag, mention_count, avg_position)
        VALUES (${SEP1}::date, ${r.brand}, ${r.model}, ${r.cluster_tag}, ${r.mention_count}, ${r.avg_position})
        ON CONFLICT DO NOTHING
      `;
    }
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted}/${rows.length}`);
  }

  console.log(`\nDone — inserted ${inserted} interpolated rows for ${SEP1}.`);
}

main().catch(err => { console.error(err); process.exit(1); });
