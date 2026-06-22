import { sql } from "@vercel/postgres";
import {
  normalizeName,
  resolveInMemory,
  type ResolutionCache,
  type ResolutionKind,
  MIN_OCCURRENCES_FOR_TOP15,
} from "./normalization";
import {
  initBrandVisibilityDB,
  loadResolutionCache,
  loadDenylist,
  getRawBrandsForDate,
  getRawBrandsForWindow,
  persistNewCanonicals,
  persistAlias,
  addToReviewQueue,
  persistResponseCanonicalBrands,
  type RawBrandRow,
  type ResponseBrandEntry,
  type NewCanonical,
  type ReviewQueueEntry,
} from "./db";

// ── Shared resolution pipeline ─────────────────────────────────────────────────
// Used by both daily and weekly aggregation to normalize raw brand strings
// from the JSONB array into canonical display names, then persist any new
// canonicals/aliases/review-queue entries produced by the resolution.

interface ResolvedBrand {
  responseId: number;
  model: string;
  canonical: string;  // display name, e.g. "HubSpot"
  position: number;   // 1-based first occurrence in this response's brands array
}

/**
 * Runs the full normalization pipeline over a set of raw brand rows.
 * Returns the resolved brands (stoplist entries silently dropped) and
 * the set of new DB writes that must be persisted after this call.
 */
function resolveBrands(
  rows: RawBrandRow[],
  cache: ResolutionCache,
  date: string,
): {
  resolved: ResolvedBrand[];
  newCanonicals: NewCanonical[];
  newAliases: { rawName: string; canonical: string }[];
  reviewQueue: ReviewQueueEntry[];
} {
  // Track which (responseId, normalizedName) pairs we've already processed so
  // duplicate brand entries within a single response only contribute the lowest position.
  const seen = new Map<string, number>(); // key: `${responseId}::${normalized}` → position

  const resolved: ResolvedBrand[] = [];
  const newCanonicals: NewCanonical[] = [];
  const newAliases: { rawName: string; canonical: string }[] = [];
  const reviewQueue: ReviewQueueEntry[] = [];

  // Track new canonicals created in this batch to update cache inline
  const batchNewCanonicals = new Map<string, string>(); // normalized → displayName

  for (const row of rows) {
    const normalized = normalizeName(row.brandName);

    // Skip empty or extremely short strings (1–2 chars are almost never brand names)
    if (!normalized || normalized.length < 3) continue;

    const seenKey = `${row.responseId}::${normalized}`;
    const existingPos = seen.get(seenKey);

    // Only keep the minimum (first) position per (response, brand) pair
    if (existingPos !== undefined) {
      if (row.position < existingPos) seen.set(seenKey, row.position);
      continue; // canonical already resolved for this (response, brand)
    }

    // Augment the live cache with brands resolved earlier in this same batch
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
        // Record alias so this normalized form resolves instantly next time
        newAliases.push({ rawName: normalized, canonical: resolution.canonical });
        break;

      case "new":
        canonicalName = resolution.displayName;
        // Only queue each normalized name once per batch
        if (!batchNewCanonicals.has(normalized)) {
          newCanonicals.push({ displayName: resolution.displayName, normalizedName: normalized });
          batchNewCanonicals.set(normalized, resolution.displayName);
          reviewQueue.push({
            rawName: row.brandName,
            suggestedCanonical: null,
            levenshteinDist: null,
            firstSeen: date,
          });
        }
        break;
    }

    seen.set(seenKey, row.position);
    resolved.push({
      responseId: row.responseId,
      model: row.model,
      canonical: canonicalName,
      position: row.position,
    });
  }

  // Apply minimum-position correction for items processed earlier in the loop
  // (handles the edge case where the same brand appears at two positions in one response)
  const positionCorrections = new Map<string, number>();
  for (const r of resolved) {
    const k = `${r.responseId}::${normalizeName(r.canonical)}`;
    const cur = positionCorrections.get(k);
    if (cur === undefined || r.position < cur) positionCorrections.set(k, r.position);
  }
  for (const r of resolved) {
    const k = `${r.responseId}::${normalizeName(r.canonical)}`;
    r.position = positionCorrections.get(k) ?? r.position;
  }

  // Deduplicate (responseId, canonical) — keep minimum position only
  const deduped = new Map<string, ResolvedBrand>();
  for (const r of resolved) {
    const k = `${r.responseId}::${r.canonical}`;
    const existing = deduped.get(k);
    if (!existing || r.position < existing.position) deduped.set(k, r);
  }

  return {
    resolved: [...deduped.values()],
    newCanonicals,
    newAliases,
    reviewQueue,
  };
}

/**
 * Persist new canonicals/aliases/review-queue entries produced by resolveBrands.
 * Returns an updated canonical map (includes DB-assigned display names).
 */
async function flushResolutionWrites(
  newCanonicals: NewCanonical[],
  newAliases: { rawName: string; canonical: string }[],
  reviewQueue: ReviewQueueEntry[],
): Promise<void> {
  if (newCanonicals.length) await persistNewCanonicals(newCanonicals);
  for (const a of newAliases) await persistAlias(a.rawName, a.canonical);
  if (reviewQueue.length) await addToReviewQueue(reviewQueue);
}

// ── Metric 1 & 2: Brand mentions + avg position ────────────────────────────────
// Definition: for each distinct brand (after normalization and alias resolution),
// count how many RESPONSES included it (not total occurrences), and compute the
// average 1-based position of its FIRST occurrence across those responses.
// Confidence = 'low' if mention_count < 5, otherwise 'normal'.

export async function computeDailySummary(date: string): Promise<void> {
  await initBrandVisibilityDB();

  const [cache, rawRows, denylist] = await Promise.all([
    loadResolutionCache(),
    getRawBrandsForDate(date),
    loadDenylist(),
  ]);

  const { resolved, newCanonicals, newAliases, reviewQueue } = resolveBrands(rawRows, cache, date);

  // Persist new resolution entries before aggregating
  await flushResolutionWrites(newCanonicals, newAliases, reviewQueue);

  // Build per (brand, model) counts entirely in JS
  // brand → model → { responseIds, positions (one per responseId) }
  type BrandModelStats = { ids: Set<number>; positions: Map<number, number> };
  const stats = new Map<string, Map<string, BrandModelStats>>();

  for (const r of resolved) {
    if (!stats.has(r.canonical)) stats.set(r.canonical, new Map());
    const byModel = stats.get(r.canonical)!;
    if (!byModel.has(r.model)) byModel.set(r.model, { ids: new Set(), positions: new Map() });
    const entry = byModel.get(r.model)!;
    entry.ids.add(r.responseId);
    // Keep the minimum (first) position per response for this brand
    const existingPos = entry.positions.get(r.responseId);
    if (existingPos === undefined || r.position < existingPos) {
      entry.positions.set(r.responseId, r.position);
    }
  }

  // Remove denylisted brands before writing — raw_responses and response_canonical_brands
  // remain untouched; only the aggregation output (daily_summary) is filtered.
  for (const brand of stats.keys()) {
    if (denylist.has(brand.toLowerCase())) stats.delete(brand);
  }

  // Purge any stale denylisted rows that may have been written on earlier runs for this date.
  await sql`
    DELETE FROM daily_summary
    WHERE date = ${date}::date
      AND LOWER(brand) IN (SELECT LOWER(brand_name) FROM brand_denylist)
  `;

  // Upsert daily_summary — single batched UNNEST instead of one query per (brand, model).
  const dsDates: string[] = [];
  const dsBrands: string[] = [];
  const dsModels: string[] = [];
  const dsMentions: number[] = [];
  const dsAvgPos: number[] = [];
  const dsConf: string[] = [];

  for (const [brand, byModel] of stats) {
    for (const [model, { ids, positions }] of byModel) {
      const mentionCount = ids.size;
      const posArr = [...positions.values()];
      const avgPosition = posArr.reduce((a, b) => a + b, 0) / posArr.length;
      dsDates.push(date);
      dsBrands.push(brand);
      dsModels.push(model);
      dsMentions.push(mentionCount);
      dsAvgPos.push(avgPosition);
      dsConf.push(mentionCount < 5 ? "low" : "normal");
    }
  }

  if (dsBrands.length) {
    await sql`
      INSERT INTO daily_summary (date, brand, model, mention_count, avg_position, confidence)
      SELECT
        t.date::date, t.brand, t.model,
        t.mention_count::int,
        t.avg_position::float,
        t.confidence
      FROM UNNEST(
        ${dsDates}::text[],
        ${dsBrands}::text[],
        ${dsModels}::text[],
        ${dsMentions}::text[],
        ${dsAvgPos}::text[],
        ${dsConf}::text[]
      ) AS t(date, brand, model, mention_count, avg_position, confidence)
      ON CONFLICT (date, brand, model) DO UPDATE SET
        mention_count = EXCLUDED.mention_count,
        avg_position  = EXCLUDED.avg_position,
        confidence    = EXCLUDED.confidence
    `;
  }

  // Populate response_canonical_brands for this date so computeLLMVisibility
  // can use pure SQL joins without re-running normalization.
  const rcbEntries: ResponseBrandEntry[] = resolved.map((r) => ({
    responseId: r.responseId,
    canonicalBrand: r.canonical,
    position: r.position,
  }));
  if (rcbEntries.length) await persistResponseCanonicalBrands(rcbEntries);
}

// ── Weekly summary ─────────────────────────────────────────────────────────────
// Aggregates from response_canonical_brands (which already has canonical names and
// true per-response first-occurrence positions) so no re-normalization is needed.
// Upsert per (window_start, window_end, brand, model) — safe to re-run.

export async function computeWeeklySummary(windowStart: string, windowEnd: string): Promise<void> {
  await initBrandVisibilityDB();

  await sql`
    INSERT INTO weekly_summary (window_start, window_end, brand, model, mention_count, avg_position, confidence)
    SELECT
      ${windowStart}::date                                                AS window_start,
      ${windowEnd}::date                                                  AS window_end,
      rcb.canonical_brand                                                 AS brand,
      r.model,
      COUNT(DISTINCT r.id)                                                AS mention_count,
      AVG(rcb.position::float)                                            AS avg_position,
      CASE WHEN COUNT(DISTINCT r.id) < 5 THEN 'low' ELSE 'normal' END   AS confidence
    FROM response_canonical_brands rcb
    JOIN raw_responses r ON r.id = rcb.response_id
    WHERE r.date BETWEEN ${windowStart}::date AND ${windowEnd}::date
      AND LOWER(rcb.canonical_brand) NOT IN (SELECT LOWER(brand_name) FROM brand_denylist)
    GROUP BY rcb.canonical_brand, r.model
    ON CONFLICT (window_start, window_end, brand, model) DO UPDATE SET
      mention_count = EXCLUDED.mention_count,
      avg_position  = EXCLUDED.avg_position,
      confidence    = EXCLUDED.confidence
  `;

  // Purge any stale denylisted rows that may have been written on earlier runs for this window.
  await sql`
    DELETE FROM weekly_summary
    WHERE window_start = ${windowStart}::date
      AND window_end   = ${windowEnd}::date
      AND LOWER(brand) IN (SELECT LOWER(brand_name) FROM brand_denylist)
  `;
}

// ── Metric 3: Visibility by LLM ────────────────────────────────────────────────
// Definition: per model, in the window:
//   visibility_pct = (responses where ≥1 tracked brand appears) / (total responses) * 100
// "Tracked" brands come from top_15_brands (canonical display_names). If that table
// is empty, ALL brands count as tracked (pipeline is safe on day 1).
// Stores total_responses alongside the pct so the number is always auditable.
// Uses response_canonical_brands so comparisons are always against normalized names.

export async function computeLLMVisibility(windowStart: string, windowEnd: string): Promise<void> {
  await initBrandVisibilityDB();

  const trackedResult = await sql`SELECT brand_name FROM top_15_brands`;
  const trackedBrands: string[] = trackedResult.rows.map((r) => r.brand_name as string);
  const tableIsEmpty = trackedBrands.length === 0;

  // Total responses per model in the window
  const totalsResult = await sql`
    SELECT model, COUNT(*) AS total
    FROM raw_responses
    WHERE date BETWEEN ${windowStart}::date AND ${windowEnd}::date
    GROUP BY model
  `;

  for (const { model, total: totalRaw } of totalsResult.rows) {
    const total = parseInt(String(totalRaw), 10);
    if (total === 0) continue;

    let hitCount: number;
    if (tableIsEmpty) {
      // No tracked list yet — count every response that returned at least one resolved brand
      const hitResult = await sql`
        SELECT COUNT(DISTINCT r.id) AS hits
        FROM raw_responses r
        JOIN response_canonical_brands rcb ON rcb.response_id = r.id
        WHERE r.model = ${model}
          AND r.date BETWEEN ${windowStart}::date AND ${windowEnd}::date
      `;
      hitCount = parseInt(String(hitResult.rows[0]?.hits ?? "0"), 10);
    } else {
      const brandsJson = JSON.stringify(trackedBrands);
      const hitResult = await sql`
        SELECT COUNT(DISTINCT r.id) AS hits
        FROM raw_responses r
        JOIN response_canonical_brands rcb ON rcb.response_id = r.id
        WHERE r.model = ${model}
          AND r.date BETWEEN ${windowStart}::date AND ${windowEnd}::date
          AND rcb.canonical_brand = ANY(${brandsJson}::jsonb::text[])
      `;
      hitCount = parseInt(String(hitResult.rows[0]?.hits ?? "0"), 10);
    }

    const visibilityPct = (hitCount / total) * 100;

    // Upsert — idempotent per (window_start, window_end, model).
    await sql`
      INSERT INTO llm_visibility (window_start, window_end, model, visibility_pct, total_responses)
      VALUES (${windowStart}::date, ${windowEnd}::date, ${model}, ${visibilityPct}, ${total})
      ON CONFLICT (window_start, window_end, model) DO UPDATE SET
        visibility_pct  = EXCLUDED.visibility_pct,
        total_responses = EXCLUDED.total_responses
    `;
  }
}

// ── Convenience ───────────────────────────────────────────────────────────────

export async function runAllAggregations(date: string, windowStart: string): Promise<void> {
  // Daily must run first — it populates response_canonical_brands which weekly + LLM depend on
  await computeDailySummary(date);
  await computeWeeklySummary(windowStart, date);
  await computeLLMVisibility(windowStart, date);
}

// Re-export so callers can surface this in admin tooling
export { MIN_OCCURRENCES_FOR_TOP15 };
