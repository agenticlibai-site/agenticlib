import { sql } from "@vercel/postgres";
import { initSkincareDB } from "./db";

// How AI models describe each agent — not verified user sentiment or ground truth.
// Source: 3 runs × 2 models × 3 days = 18 structured responses per brand.

interface TagEntry { tag: string; frequency: number; shared: boolean; }

export async function computeSkincareSentimentSummary(windowStart: string, windowEnd: string): Promise<void> {
  await initSkincareDB();

  const rows = await sql`
    SELECT brand, sentiment, tags
    FROM skincare_sentiment_responses
    WHERE date BETWEEN ${windowStart}::date AND ${windowEnd}::date
  `;

  if (!rows.rows.length) return;

  // Group by brand
  type BrandData = { sentiments: string[]; tagFreq: Map<string, number> };
  const byBrand = new Map<string, BrandData>();

  for (const row of rows.rows) {
    const brand = row.brand as string;
    if (!byBrand.has(brand)) byBrand.set(brand, { sentiments: [], tagFreq: new Map() });
    const data = byBrand.get(brand)!;

    data.sentiments.push(row.sentiment as string);

    const tags = Array.isArray(row.tags) ? row.tags : [];
    for (const rawTag of tags) {
      const tag = String(rawTag).trim().toLowerCase();
      if (!tag) continue;
      data.tagFreq.set(tag, (data.tagFreq.get(tag) ?? 0) + 1);
    }
  }

  // Per brand: compute top 4 tags (frequency ≥ 2 — discard single-occurrence noise)
  // Preserve original casing from first occurrence for display.
  const tagCasingMap = new Map<string, string>(); // normalized → display case
  for (const row of rows.rows) {
    for (const rawTag of (Array.isArray(row.tags) ? row.tags : [])) {
      const tag = String(rawTag).trim();
      const norm = tag.toLowerCase();
      if (!tagCasingMap.has(norm)) tagCasingMap.set(norm, tag);
    }
  }

  const brandTopTags = new Map<string, { tag: string; frequency: number }[]>();
  for (const [brand, data] of byBrand) {
    const sorted = [...data.tagFreq.entries()]
      .filter(([, freq]) => freq >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([norm, freq]) => ({ tag: tagCasingMap.get(norm) ?? norm, frequency: freq }));
    brandTopTags.set(brand, sorted);
  }

  // Cross-brand tag comparison: mark shared if the same tag (case-insensitive)
  // appears in any other confirmed brand's top 4. Surfaced as-is in the UI —
  // an all-shared profile is a real finding (undifferentiated player), not suppressed.
  for (const [brand, tags] of brandTopTags) {
    const otherTopTags = new Set<string>();
    for (const [otherBrand, otherTags] of brandTopTags) {
      if (otherBrand === brand) continue;
      for (const t of otherTags) otherTopTags.add(t.tag.toLowerCase());
    }

    const withShared: TagEntry[] = tags.map((t) => ({
      tag: t.tag,
      frequency: t.frequency,
      shared: otherTopTags.has(t.tag.toLowerCase()),
    }));

    const data = byBrand.get(brand)!;
    const total = data.sentiments.length;
    const posPct  = Math.round((data.sentiments.filter((s) => s === "positive").length / total) * 10000) / 100;
    const neuPct  = Math.round((data.sentiments.filter((s) => s === "neutral").length  / total) * 10000) / 100;
    const negPct  = Math.round((data.sentiments.filter((s) => s === "negative").length / total) * 10000) / 100;

    await sql`
      INSERT INTO skincare_sentiment_summary
        (window_start, window_end, brand, positive_pct, neutral_pct, negative_pct, top_tags, total_responses)
      VALUES (
        ${windowStart}::date, ${windowEnd}::date, ${brand},
        ${posPct}, ${neuPct}, ${negPct},
        ${JSON.stringify(withShared)}::jsonb, ${total}
      )
      ON CONFLICT (window_start, window_end, brand) DO UPDATE SET
        positive_pct    = EXCLUDED.positive_pct,
        neutral_pct     = EXCLUDED.neutral_pct,
        negative_pct    = EXCLUDED.negative_pct,
        top_tags        = EXCLUDED.top_tags,
        total_responses = EXCLUDED.total_responses,
        created_at      = NOW()
    `;
  }
}
