import { sql } from "@vercel/postgres";
import {
  normalizeName,
  resolveInMemory,
  type ResolutionCache,
  type ResolutionKind,
} from "@/lib/brand-visibility/normalization";
import {
  initSkincareDB,
  loadSkincareResolutionCache,
  loadSkincareDenylist,
  getSkincareRawBrandsForDate,
  persistNewCanonicals,
  persistAlias,
  addToReviewQueue,
  persistSkincareResponseCanonicalBrands,
  type SkincareRawBrandRow,
  type NewCanonical,
  type ReviewQueueEntry,
} from "./db";
import { computeSkincareUseCaseSummary } from "./use-case-aggregation";

// ── Brand resolution ───────────────────────────────────────────────────────────

interface ResolvedBrand {
  responseId: number;
  model: string;
  canonical: string;
  position: number;
}

function resolveBrands(
  rows: SkincareRawBrandRow[],
  cache: ResolutionCache,
  date: string,
): {
  resolved: ResolvedBrand[];
  newCanonicals: NewCanonical[];
  newAliases: { rawName: string; canonical: string }[];
  reviewQueue: ReviewQueueEntry[];
} {
  const seen = new Map<string, number>();
  const resolved: ResolvedBrand[] = [];
  const newCanonicals: NewCanonical[] = [];
  const newAliases: { rawName: string; canonical: string }[] = [];
  const reviewQueue: ReviewQueueEntry[] = [];
  const batchNewCanonicals = new Map<string, string>();

  for (const row of rows) {
    const normalized = normalizeName(row.brandName);
    if (!normalized || normalized.length < 3) continue;

    const seenKey = `${row.responseId}::${normalized}`;
    const existingPos = seen.get(seenKey);

    if (existingPos !== undefined) {
      if (row.position < existingPos) seen.set(seenKey, row.position);
      continue;
    }

    const augmentedCache: ResolutionCache = {
      ...cache,
      aliases: new Map([
        ...cache.aliases,
        ...Array.from(batchNewCanonicals.entries()).map(([n, d]) => [n, d] as [string, string]),
      ]),
      canonicals: [
        ...cache.canonicals,
        ...newCanonicals.map((nc) => ({ id: -1, displayName: nc.displayName, normalizedName: nc.normalizedName })),
      ],
    };

    const resolution: ResolutionKind = resolveInMemory(normalized, row.brandName, augmentedCache);
    if (resolution.kind === "stoplist") continue;

    let canonicalName: string;

    switch (resolution.kind) {
      case "alias":
        canonicalName = resolution.canonical;
        break;
      case "fuzzy":
        canonicalName = resolution.canonical;
        newAliases.push({ rawName: normalized, canonical: resolution.canonical });
        break;
      case "new":
        canonicalName = resolution.displayName;
        if (!batchNewCanonicals.has(normalized)) {
          newCanonicals.push({ displayName: resolution.displayName, normalizedName: normalized });
          batchNewCanonicals.set(normalized, resolution.displayName);
          reviewQueue.push({ rawName: row.brandName, suggestedCanonical: null, levenshteinDist: null, firstSeen: date });
        }
        break;
    }

    seen.set(seenKey, row.position);
    resolved.push({ responseId: row.responseId, model: row.model, canonical: canonicalName, position: row.position });
  }

  // Deduplicate (responseId, canonical) — keep minimum position
  const deduped = new Map<string, ResolvedBrand>();
  for (const r of resolved) {
    const k = `${r.responseId}::${r.canonical}`;
    const existing = deduped.get(k);
    if (!existing || r.position < existing.position) deduped.set(k, r);
  }

  return { resolved: [...deduped.values()], newCanonicals, newAliases, reviewQueue };
}

// ── Metric 1 & 2: Daily brand mentions (mention count, no avg_position) ────────

export async function computeSkincareDailySummary(date: string): Promise<void> {
  await initSkincareDB();

  const [cache, rawRows, denylist] = await Promise.all([
    loadSkincareResolutionCache(),
    getSkincareRawBrandsForDate(date),
    loadSkincareDenylist(),
  ]);

  const { resolved, newCanonicals, newAliases, reviewQueue } = resolveBrands(rawRows, cache, date);

  if (newCanonicals.length) await persistNewCanonicals(newCanonicals);
  for (const a of newAliases) await persistAlias(a.rawName, a.canonical);
  if (reviewQueue.length) await addToReviewQueue(reviewQueue);

  // Persist bridge table for LLM visibility queries
  await persistSkincareResponseCanonicalBrands(
    resolved.map((r) => ({ responseId: r.responseId, canonicalBrand: r.canonical, position: r.position })),
  );

  // Count mentions per (brand, model) — a "mention" is one response that included the brand
  type BrandModelStat = { ids: Set<number> };
  const stats = new Map<string, Map<string, BrandModelStat>>();

  for (const r of resolved) {
    if (!stats.has(r.canonical)) stats.set(r.canonical, new Map());
    const byModel = stats.get(r.canonical)!;
    if (!byModel.has(r.model)) byModel.set(r.model, { ids: new Set() });
    byModel.get(r.model)!.ids.add(r.responseId);
  }

  for (const brand of stats.keys()) {
    if (denylist.has(brand.toLowerCase())) stats.delete(brand);
  }

  // Upsert into skincare_daily_summary
  // confidence: 'low' when mention_count < 5 (same threshold as marketing pipeline)
  const entries: { date: string; brand: string; model: string; mentionCount: number; confidence: string }[] = [];
  for (const [brand, byModel] of stats) {
    for (const [model, stat] of byModel) {
      const mentionCount = stat.ids.size;
      entries.push({ date, brand, model, mentionCount, confidence: mentionCount < 5 ? "low" : "normal" });
    }
  }

  if (!entries.length) return;

  const dates  = entries.map((e) => e.date);
  const brands = entries.map((e) => e.brand);
  const models = entries.map((e) => e.model);
  const counts = entries.map((e) => e.mentionCount);
  const confs  = entries.map((e) => e.confidence);

  await sql`
    INSERT INTO skincare_daily_summary (date, brand, model, mention_count, confidence)
    SELECT t.date::date, t.brand, t.model, t.mention_count::int, t.confidence
    FROM UNNEST(${dates}::text[], ${brands}::text[], ${models}::text[], ${counts}::text[], ${confs}::text[])
      AS t(date, brand, model, mention_count, confidence)
    ON CONFLICT (date, brand, model) DO UPDATE SET
      mention_count = EXCLUDED.mention_count,
      confidence    = EXCLUDED.confidence,
      created_at    = NOW()
  `;
}

// ── Metric 3: LLM Visibility ───────────────────────────────────────────────────
// Percentage of responses (across the window) that mention at least one tracked brand.
// If skincare_tracked_brands is empty, all resolved brands count as tracked.
// Computed separately per model.

export async function computeSkincareLLMVisibility(windowStart: string, windowEnd: string): Promise<void> {
  await initSkincareDB();

  // Load tracked brands (empty = all brands tracked)
  const trackedResult = await sql`SELECT brand_name FROM skincare_tracked_brands`;
  const trackedBrands = new Set(trackedResult.rows.map((r) => (r.brand_name as string).toLowerCase()));

  const denylist = await loadSkincareDenylist();

  for (const model of ["claude-haiku-4-5", "gpt-4o-mini"] as const) {
    const totalResult = await sql`
      SELECT COUNT(*) AS total
      FROM skincare_raw_responses
      WHERE date BETWEEN ${windowStart}::date AND ${windowEnd}::date
        AND model = ${model}
    `;
    const total = parseInt(totalResult.rows[0]?.total ?? "0", 10);
    if (total === 0) continue;

    // Count responses with ≥1 tracked (non-denylisted) brand
    const bridgeResult = await sql`
      SELECT DISTINCT srcb.response_id, srcb.canonical_brand
      FROM skincare_response_canonical_brands srcb
      JOIN skincare_raw_responses r ON r.id = srcb.response_id
      WHERE r.date BETWEEN ${windowStart}::date AND ${windowEnd}::date
        AND r.model = ${model}
    `;

    const responseIdsWithTracked = new Set<number>();
    for (const row of bridgeResult.rows) {
      const brand = (row.canonical_brand as string).toLowerCase();
      if (denylist.has(brand)) continue;
      if (trackedBrands.size > 0 && !trackedBrands.has(brand)) continue;
      responseIdsWithTracked.add(row.response_id as number);
    }

    const trackedCount = responseIdsWithTracked.size;
    const visibilityPct = total > 0 ? Math.round((trackedCount / total) * 10000) / 100 : 0;

    await sql`
      INSERT INTO skincare_llm_visibility (window_start, window_end, model, visibility_pct, total_responses, tracked_responses)
      VALUES (
        ${windowStart}::date, ${windowEnd}::date, ${model},
        ${visibilityPct}, ${total}, ${trackedCount}
      )
      ON CONFLICT (window_start, window_end, model) DO UPDATE SET
        visibility_pct    = EXCLUDED.visibility_pct,
        total_responses   = EXCLUDED.total_responses,
        tracked_responses = EXCLUDED.tracked_responses,
        created_at        = NOW()
    `;
  }
}

export async function runSkincareAggregations(date: string, windowStart: string): Promise<void> {
  await computeSkincareDailySummary(date);
  await computeSkincareLLMVisibility(windowStart, date);
  await computeSkincareUseCaseSummary(windowStart, date);
}
