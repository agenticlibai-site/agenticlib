import { sql } from "@vercel/postgres";
import { DEFAULT_STOPLIST, type ResolutionCache, type CanonicalEntry } from "@/lib/brand-visibility/normalization";

let dbInitialised = false;

export async function initSkincareDB(): Promise<void> {
  if (dbInitialised) return;

  // ── Collection tables ──────────────────────────────────────────────────────

  await sql`
    CREATE TABLE IF NOT EXISTS skincare_raw_responses (
      id             SERIAL PRIMARY KEY,
      date           DATE    NOT NULL,
      prompt_id      INTEGER NOT NULL CHECK (prompt_id BETWEEN 1 AND 13),
      prompt_text    TEXT    NOT NULL,
      bucket_tag     TEXT    NOT NULL,
      model          TEXT    NOT NULL CHECK (model IN ('claude-haiku-4-5', 'gpt-4o-mini')),
      model_snapshot TEXT,
      run_number     INTEGER NOT NULL CHECK (run_number BETWEEN 1 AND 3),
      brands         JSONB   NOT NULL DEFAULT '[]',
      created_at     TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS skincare_raw_responses_unique
    ON skincare_raw_responses (date, prompt_id, model, run_number)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS skincare_collection_errors (
      id            SERIAL PRIMARY KEY,
      date          DATE    NOT NULL,
      prompt_id     INTEGER,
      model         TEXT,
      run_number    INTEGER,
      raw_response  TEXT,
      error_message TEXT,
      archived      BOOLEAN NOT NULL DEFAULT FALSE,
      created_at    TIMESTAMP DEFAULT NOW()
    )
  `;

  // Bridge table — canonical brand per skincare response, for LLM visibility queries.
  await sql`
    CREATE TABLE IF NOT EXISTS skincare_response_canonical_brands (
      response_id     INTEGER NOT NULL REFERENCES skincare_raw_responses(id) ON DELETE CASCADE,
      canonical_brand TEXT    NOT NULL,
      position        INTEGER NOT NULL,
      PRIMARY KEY (response_id, canonical_brand)
    )
  `;

  // ── Aggregation output tables ──────────────────────────────────────────────

  // No avg_position column — not required for the skincare report.
  await sql`
    CREATE TABLE IF NOT EXISTS skincare_daily_summary (
      id            SERIAL PRIMARY KEY,
      date          DATE    NOT NULL,
      brand         TEXT    NOT NULL,
      model         TEXT    NOT NULL,
      mention_count INTEGER NOT NULL DEFAULT 0,
      confidence    TEXT    NOT NULL DEFAULT 'normal' CHECK (confidence IN ('low', 'normal')),
      created_at    TIMESTAMP DEFAULT NOW(),
      UNIQUE (date, brand, model)
    )
  `;

  // Tracked brand cohort for LLM visibility denominator.
  // Populate after day-1 review, same process as top_15_brands in marketing pipeline.
  // When empty, ALL brands count as tracked (safe on day 1).
  await sql`
    CREATE TABLE IF NOT EXISTS skincare_tracked_brands (
      id         SERIAL PRIMARY KEY,
      brand_name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Empty denylist — skincare noise differs from marketing noise
  // (e.g. dermatology clinics, e-commerce sites, beauty blogs).
  // Add entries after day-1 review: INSERT INTO skincare_denylist (brand_name) VALUES ('...')
  await sql`
    CREATE TABLE IF NOT EXISTS skincare_denylist (
      id         SERIAL PRIMARY KEY,
      brand_name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // LLM visibility — % of responses in a window that mention ≥1 tracked brand.
  // Recomputed daily over the growing window (window_start = first collection day, window_end = today).
  await sql`
    CREATE TABLE IF NOT EXISTS skincare_llm_visibility (
      id                SERIAL PRIMARY KEY,
      window_start      DATE    NOT NULL,
      window_end        DATE    NOT NULL,
      model             TEXT    NOT NULL,
      visibility_pct    NUMERIC(5,2) NOT NULL,
      total_responses   INTEGER NOT NULL,
      tracked_responses INTEGER NOT NULL,
      created_at        TIMESTAMP DEFAULT NOW(),
      UNIQUE (window_start, window_end, model)
    )
  `;

  // ── Part A: Use-case share of voice ───────────────────────────────────────────
  // Aggregated across all models; low_prompt_coverage flags single-prompt buckets.
  await sql`
    CREATE TABLE IF NOT EXISTS skincare_use_case_summary (
      id                    SERIAL PRIMARY KEY,
      window_start          DATE    NOT NULL,
      window_end            DATE    NOT NULL,
      bucket_tag            TEXT    NOT NULL,
      brand                 TEXT    NOT NULL,
      mentions_in_bucket    INTEGER NOT NULL,
      total_bucket_mentions INTEGER NOT NULL,
      share_pct             NUMERIC(5,2) NOT NULL,
      low_prompt_coverage   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at            TIMESTAMP DEFAULT NOW(),
      UNIQUE (window_start, window_end, bucket_tag, brand)
    )
  `;

  // ── Part B: Sentiment + tag collection (activated after top-10 confirmed) ───
  // skincare_sentiment_brands: user-populated list of confirmed top-10 brands.
  // Insert after discovery data is stable: INSERT INTO skincare_sentiment_brands (brand_name) VALUES ('...')
  await sql`
    CREATE TABLE IF NOT EXISTS skincare_sentiment_brands (
      id         SERIAL PRIMARY KEY,
      brand_name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // One row per (date, brand, model, run_number) — how AI models describe this agent.
  await sql`
    CREATE TABLE IF NOT EXISTS skincare_sentiment_responses (
      id         SERIAL PRIMARY KEY,
      date       DATE    NOT NULL,
      brand      TEXT    NOT NULL,
      model      TEXT    NOT NULL CHECK (model IN ('claude-haiku-4-5', 'gpt-4o-mini')),
      run_number INTEGER NOT NULL CHECK (run_number BETWEEN 1 AND 3),
      sentiment  TEXT    NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
      tags       JSONB   NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (date, brand, model, run_number)
    )
  `;

  // Malformed JSON responses — logged here instead of dropped silently.
  await sql`
    CREATE TABLE IF NOT EXISTS skincare_sentiment_errors (
      id            SERIAL PRIMARY KEY,
      date          DATE NOT NULL,
      brand         TEXT,
      model         TEXT,
      run_number    INTEGER,
      raw_response  TEXT,
      error_message TEXT,
      created_at    TIMESTAMP DEFAULT NOW()
    )
  `;

  // Aggregated per-brand sentiment percentages and top tags with cross-brand shared flag.
  // top_tags schema: [{tag: string, frequency: number, shared: boolean}, ...]
  // "Shared" means the tag also appears in another confirmed brand's top 4 — surfaced in UI,
  // not suppressed. An all-shared tag profile is itself a meaningful finding (undifferentiated player).
  await sql`
    CREATE TABLE IF NOT EXISTS skincare_sentiment_summary (
      id              SERIAL PRIMARY KEY,
      window_start    DATE         NOT NULL,
      window_end      DATE         NOT NULL,
      brand           TEXT         NOT NULL,
      positive_pct    NUMERIC(5,2) NOT NULL,
      neutral_pct     NUMERIC(5,2) NOT NULL,
      negative_pct    NUMERIC(5,2) NOT NULL,
      top_tags        JSONB        NOT NULL DEFAULT '[]',
      total_responses INTEGER      NOT NULL,
      created_at      TIMESTAMP    DEFAULT NOW(),
      UNIQUE (window_start, window_end, brand)
    )
  `;

  // ── Shared normalization tables (created by marketing pipeline init if not present) ──
  // canonical_brands, brand_aliases, brand_stoplist, brand_review_queue are category-agnostic
  // and shared across pipelines. Ensure they exist here too so skincare can run independently.

  await sql`
    CREATE TABLE IF NOT EXISTS canonical_brands (
      id              SERIAL PRIMARY KEY,
      display_name    TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      created_at      TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS brand_aliases (
      id           SERIAL PRIMARY KEY,
      raw_name     TEXT    NOT NULL UNIQUE,
      canonical_id INTEGER NOT NULL REFERENCES canonical_brands(id) ON DELETE CASCADE,
      created_at   TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS brand_review_queue (
      id                   SERIAL PRIMARY KEY,
      raw_name             TEXT    NOT NULL UNIQUE,
      suggested_canonical  TEXT,
      levenshtein_dist     INTEGER,
      first_seen           DATE    NOT NULL,
      occurrence_count     INTEGER NOT NULL DEFAULT 1,
      reviewed             BOOLEAN NOT NULL DEFAULT FALSE,
      created_at           TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS brand_stoplist (
      id         SERIAL PRIMARY KEY,
      term       TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  const stopTerms = [...DEFAULT_STOPLIST];
  await sql`
    INSERT INTO brand_stoplist (term)
    SELECT t.term FROM UNNEST(${stopTerms}::text[]) AS t(term)
    ON CONFLICT (term) DO NOTHING
  `;

  dbInitialised = true;
}

// ── Raw response writes ────────────────────────────────────────────────────────

export async function insertSkincareRawResponse(row: {
  date: string;
  promptId: number;
  promptText: string;
  bucketTag: string;
  model: string;
  modelSnapshot: string;
  runNumber: number;
  brands: string[];
}): Promise<void> {
  await sql`
    INSERT INTO skincare_raw_responses
      (date, prompt_id, prompt_text, bucket_tag, model, model_snapshot, run_number, brands)
    VALUES (
      ${row.date}::date, ${row.promptId}, ${row.promptText}, ${row.bucketTag},
      ${row.model}, ${row.modelSnapshot}, ${row.runNumber}, ${JSON.stringify(row.brands)}::jsonb
    )
    ON CONFLICT (date, prompt_id, model, run_number) DO UPDATE SET
      brands         = EXCLUDED.brands,
      model_snapshot = EXCLUDED.model_snapshot,
      created_at     = NOW()
  `;
  // A successful insert means this (date, model, prompt_id, run_number) slot resolved.
  // Archive any prior error for the same slot so the health check reflects reality.
  // This is a no-op when there is no matching error — adds negligible overhead.
  await sql`
    UPDATE skincare_collection_errors
    SET archived = TRUE
    WHERE date      = ${row.date}::date
      AND model      = ${row.model}
      AND prompt_id  = ${row.promptId}
      AND run_number = ${row.runNumber}
      AND archived   = FALSE
  `;
}

export async function insertSkincareCollectionError(row: {
  date: string;
  promptId: number | null;
  model: string | null;
  runNumber: number | null;
  rawResponse: string;
  errorMessage: string;
}): Promise<void> {
  await sql`
    INSERT INTO skincare_collection_errors
      (date, prompt_id, model, run_number, raw_response, error_message)
    VALUES (${row.date}::date, ${row.promptId}, ${row.model}, ${row.runNumber}, ${row.rawResponse}, ${row.errorMessage})
  `;
}

export async function archiveSkincareErrors(date: string, model: string): Promise<void> {
  await sql`
    UPDATE skincare_collection_errors
    SET archived = TRUE
    WHERE date = ${date}::date AND model = ${model} AND archived = FALSE
  `;
}

// ── Normalization cache (shared with marketing pipeline) ───────────────────────

export async function loadSkincareResolutionCache(): Promise<ResolutionCache> {
  const [aliasRows, canonicalRows, stopRows] = await Promise.all([
    sql`
      SELECT ba.raw_name, cb.display_name AS canonical
      FROM brand_aliases ba
      JOIN canonical_brands cb ON cb.id = ba.canonical_id
    `,
    sql`SELECT id, display_name, normalized_name FROM canonical_brands`,
    sql`SELECT term FROM brand_stoplist`,
  ]);

  const aliases = new Map<string, string>(
    aliasRows.rows.map((r) => [r.raw_name as string, r.canonical as string]),
  );
  const canonicals: CanonicalEntry[] = canonicalRows.rows.map((r) => ({
    id: r.id as number,
    displayName: r.display_name as string,
    normalizedName: r.normalized_name as string,
  }));
  const stoplist = new Set<string>(stopRows.rows.map((r) => r.term as string));

  return { aliases, canonicals, stoplist };
}

export async function loadSkincareDenylist(): Promise<Set<string>> {
  const result = await sql`SELECT brand_name FROM skincare_denylist`;
  return new Set(result.rows.map((r) => (r.brand_name as string).toLowerCase()));
}

// ── Raw brand rows for aggregation ────────────────────────────────────────────

export interface SkincareRawBrandRow {
  responseId: number;
  model: string;
  brandName: string;
  position: number;
}

export async function getSkincareRawBrandsForDate(date: string): Promise<SkincareRawBrandRow[]> {
  const result = await sql`
    SELECT r.id AS response_id, r.model, t.brand_name, t.pos::int AS position
    FROM skincare_raw_responses r,
         jsonb_array_elements_text(r.brands) WITH ORDINALITY AS t(brand_name, pos)
    WHERE r.date = ${date}::date
  `;
  return result.rows.map((r) => ({
    responseId: r.response_id as number,
    model: r.model as string,
    brandName: r.brand_name as string,
    position: r.position as number,
  }));
}

// ── Canonical brand + alias writes (shared tables) ────────────────────────────

export interface NewCanonical { displayName: string; normalizedName: string; }
export interface ReviewQueueEntry {
  rawName: string;
  suggestedCanonical: string | null;
  levenshteinDist: number | null;
  firstSeen: string;
}

export async function persistNewCanonicals(entries: NewCanonical[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (!entries.length) return result;
  const displayNames = entries.map((e) => e.displayName);
  const normalizedNames = entries.map((e) => e.normalizedName);
  const rows = await sql`
    INSERT INTO canonical_brands (display_name, normalized_name)
    SELECT * FROM UNNEST(${displayNames}::text[], ${normalizedNames}::text[]) AS t(display_name, normalized_name)
    ON CONFLICT (normalized_name) DO UPDATE SET normalized_name = EXCLUDED.normalized_name
    RETURNING id, display_name, normalized_name
  `;
  const ids = rows.rows.map((r) => r.id as number);
  const norms = rows.rows.map((r) => r.normalized_name as string);
  await sql`
    INSERT INTO brand_aliases (raw_name, canonical_id)
    SELECT * FROM UNNEST(${norms}::text[], ${ids}::int[]) AS t(raw_name, canonical_id)
    ON CONFLICT (raw_name) DO NOTHING
  `;
  for (const r of rows.rows) result.set(r.normalized_name as string, r.display_name as string);
  return result;
}

export async function persistAlias(rawName: string, canonicalDisplayName: string): Promise<void> {
  const row = await sql`SELECT id FROM canonical_brands WHERE display_name = ${canonicalDisplayName} LIMIT 1`;
  const id = row.rows[0]?.id as number | undefined;
  if (!id) return;
  await sql`
    INSERT INTO brand_aliases (raw_name, canonical_id) VALUES (${rawName}, ${id})
    ON CONFLICT (raw_name) DO NOTHING
  `;
}

export async function addToReviewQueue(entries: ReviewQueueEntry[]): Promise<void> {
  if (!entries.length) return;
  const rawNames = entries.map((e) => e.rawName);
  const suggested = entries.map((e) => e.suggestedCanonical);
  const dists = entries.map((e) => e.levenshteinDist);
  const firstSeens = entries.map((e) => e.firstSeen);
  await sql`
    INSERT INTO brand_review_queue (raw_name, suggested_canonical, levenshtein_dist, first_seen, occurrence_count)
    SELECT t.raw_name, t.suggested_canonical, t.levenshtein_dist::int, t.first_seen::date, 1
    FROM UNNEST(${rawNames}::text[], ${suggested}::text[], ${dists}::text[], ${firstSeens}::text[])
      AS t(raw_name, suggested_canonical, levenshtein_dist, first_seen)
    ON CONFLICT (raw_name) DO UPDATE SET occurrence_count = brand_review_queue.occurrence_count + 1
  `;
}

export interface SkincareResponseBrandEntry { responseId: number; canonicalBrand: string; position: number; }

export async function persistSkincareResponseCanonicalBrands(entries: SkincareResponseBrandEntry[]): Promise<void> {
  if (!entries.length) return;
  const responseIds = entries.map((e) => e.responseId);
  const canonicalBrands = entries.map((e) => e.canonicalBrand);
  const positions = entries.map((e) => e.position);
  await sql`
    INSERT INTO skincare_response_canonical_brands (response_id, canonical_brand, position)
    SELECT * FROM UNNEST(${responseIds}::int[], ${canonicalBrands}::text[], ${positions}::int[])
      AS t(response_id, canonical_brand, position)
    ON CONFLICT (response_id, canonical_brand) DO UPDATE SET
      position = LEAST(skincare_response_canonical_brands.position, EXCLUDED.position)
  `;
}

// ── Dashboard reads ────────────────────────────────────────────────────────────

// Minimum thresholds for a brand to appear in chart/table output.
// A brand must clear both bars over the look-back window to avoid one-off
// hallucinations and single-prompt artefacts inflating the leaderboard.
const BRAND_MIN_MENTIONS  = 5;   // total mention_count across all models in window
const BRAND_MIN_PROMPTS   = 2;   // must appear in responses from at least this many distinct prompt_ids

export async function getSkincareDailySummary(days = 7): Promise<
  { date: string; brand: string; model: string; mention_count: number; confidence: string }[]
> {
  await initSkincareDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const result = await sql`
    WITH brand_prompt_counts AS (
      SELECT rcb.canonical_brand AS brand,
             COUNT(DISTINCT r.prompt_id) AS distinct_prompts
      FROM skincare_response_canonical_brands rcb
      JOIN skincare_raw_responses r ON r.id = rcb.response_id
      WHERE r.date >= ${cutoffStr}::date
      GROUP BY rcb.canonical_brand
    ),
    qualified AS (
      -- brands that pass quantitative noise thresholds
      SELECT ds.brand
      FROM skincare_daily_summary ds
      JOIN brand_prompt_counts bpc ON bpc.brand = ds.brand
      WHERE ds.date >= ${cutoffStr}::date
        AND bpc.distinct_prompts >= ${BRAND_MIN_PROMPTS}
      GROUP BY ds.brand
      HAVING SUM(ds.mention_count) >= ${BRAND_MIN_MENTIONS}
      UNION
      -- manually tracked brands always shown regardless of thresholds
      SELECT brand_name AS brand FROM skincare_tracked_brands
    )
    SELECT date::text AS date, brand, model, mention_count, confidence
    FROM skincare_daily_summary
    WHERE date >= ${cutoffStr}::date
      AND brand IN (SELECT brand FROM qualified)
    ORDER BY date ASC, mention_count DESC
  `;
  return result.rows as { date: string; brand: string; model: string; mention_count: number; confidence: string }[];
}

export async function getSkincareWeeklySummary(): Promise<
  { brand: string; model: string; mention_count: number; confidence: string }[]
> {
  await initSkincareDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const result = await sql`
    WITH brand_prompt_counts AS (
      SELECT rcb.canonical_brand AS brand,
             COUNT(DISTINCT r.prompt_id) AS distinct_prompts
      FROM skincare_response_canonical_brands rcb
      JOIN skincare_raw_responses r ON r.id = rcb.response_id
      WHERE r.date >= ${cutoffStr}::date
      GROUP BY rcb.canonical_brand
    ),
    qualified AS (
      SELECT ds.brand
      FROM skincare_daily_summary ds
      JOIN brand_prompt_counts bpc ON bpc.brand = ds.brand
      WHERE ds.date >= ${cutoffStr}::date
        AND bpc.distinct_prompts >= ${BRAND_MIN_PROMPTS}
      GROUP BY ds.brand
      HAVING SUM(ds.mention_count) >= ${BRAND_MIN_MENTIONS}
      UNION
      SELECT brand_name AS brand FROM skincare_tracked_brands
    )
    SELECT brand, model,
           SUM(mention_count)::int AS mention_count,
           CASE WHEN SUM(mention_count) < 5 THEN 'low' ELSE 'normal' END AS confidence
    FROM skincare_daily_summary
    WHERE date >= ${cutoffStr}::date
      AND brand IN (SELECT brand FROM qualified)
    GROUP BY brand, model
    ORDER BY mention_count DESC
    LIMIT 2000
  `;
  return result.rows as { brand: string; model: string; mention_count: number; confidence: string }[];
}

export async function getSkincareLLMVisibility(): Promise<
  { window_start: string; window_end: string; model: string; visibility_pct: number; total_responses: number }[]
> {
  await initSkincareDB();
  const result = await sql`
    SELECT window_start::text, window_end::text, model, visibility_pct::float AS visibility_pct, total_responses
    FROM skincare_llm_visibility
    ORDER BY window_start DESC
    LIMIT 20
  `;
  return result.rows as { window_start: string; window_end: string; model: string; visibility_pct: number; total_responses: number }[];
}

// ── Use-case bucket share of voice ────────────────────────────────────────────
// Returns one row per brand with mention counts per bucket.
// Skincare.ai is filtered to only responses where the raw string contains the dot
// (i.e. "Skincare.ai" or "Skincare.AI") to avoid the canonical-rename inflation bug.

export interface UseCaseBucketBrandRow {
  brand: string;
  b1: number; // routine-audit (p7,8)
  b2: number; // personalized-routine (p9)
  b3: number; // ingredient-analysis (p10,11)
  b4: number; // condition-specific (p12)
  b5: number; // tracking-progress (p13)
}

export async function getSkincareUseCaseBuckets(): Promise<UseCaseBucketBrandRow[]> {
  await initSkincareDB();
  const result = await sql`
    WITH bucket_mentions AS (
      SELECT srcb.canonical_brand AS brand, r.prompt_id, r.id AS response_id
      FROM skincare_response_canonical_brands srcb
      JOIN skincare_raw_responses r ON r.id = srcb.response_id
      WHERE (
        srcb.canonical_brand != 'Skincare.ai'
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(r.brands) b
          WHERE b IN ('Skincare.ai', 'Skincare.AI')
        )
      )
      AND LOWER(srcb.canonical_brand) NOT IN (
        SELECT LOWER(brand_name) FROM skincare_denylist
      )
      AND srcb.canonical_brand IN (
        SELECT brand_name FROM skincare_tracked_brands
      )
    )
    SELECT
      brand,
      COUNT(DISTINCT CASE WHEN prompt_id IN (7,8)   THEN response_id END)::int AS b1,
      COUNT(DISTINCT CASE WHEN prompt_id IN (9)      THEN response_id END)::int AS b2,
      COUNT(DISTINCT CASE WHEN prompt_id IN (10,11)  THEN response_id END)::int AS b3,
      COUNT(DISTINCT CASE WHEN prompt_id IN (12)     THEN response_id END)::int AS b4,
      COUNT(DISTINCT CASE WHEN prompt_id IN (13)     THEN response_id END)::int AS b5
    FROM bucket_mentions
    GROUP BY brand
    HAVING (
      COUNT(DISTINCT CASE WHEN prompt_id IN (7,8)   THEN response_id END) +
      COUNT(DISTINCT CASE WHEN prompt_id IN (9)      THEN response_id END) +
      COUNT(DISTINCT CASE WHEN prompt_id IN (10,11)  THEN response_id END) +
      COUNT(DISTINCT CASE WHEN prompt_id IN (12)     THEN response_id END) +
      COUNT(DISTINCT CASE WHEN prompt_id IN (13)     THEN response_id END)
    ) > 0
    ORDER BY (
      COUNT(DISTINCT CASE WHEN prompt_id IN (7,8)   THEN response_id END) +
      COUNT(DISTINCT CASE WHEN prompt_id IN (9)      THEN response_id END) +
      COUNT(DISTINCT CASE WHEN prompt_id IN (10,11)  THEN response_id END) +
      COUNT(DISTINCT CASE WHEN prompt_id IN (12)     THEN response_id END) +
      COUNT(DISTINCT CASE WHEN prompt_id IN (13)     THEN response_id END)
    ) DESC
  `;
  return result.rows as UseCaseBucketBrandRow[];
}

// ── Observability ──────────────────────────────────────────────────────────────

export async function getSkincareDailyRunStats(date: string): Promise<{ success: number; activeErrors: number }> {
  const [s, e] = await Promise.all([
    sql`SELECT COUNT(*) AS count FROM skincare_raw_responses WHERE date = ${date}::date`,
    sql`SELECT COUNT(*) AS count FROM skincare_collection_errors WHERE date = ${date}::date AND archived = FALSE`,
  ]);
  return {
    success: parseInt(s.rows[0]?.count ?? "0", 10),
    activeErrors: parseInt(e.rows[0]?.count ?? "0", 10),
  };
}

// ── Sentiment collection ───────────────────────────────────────────────────────

export async function insertSkincareSentimentResponse(row: {
  date: string;
  brand: string;
  model: string;
  runNumber: number;
  sentiment: string;
  tags: string[];
}): Promise<void> {
  await sql`
    INSERT INTO skincare_sentiment_responses
      (date, brand, model, run_number, sentiment, tags)
    VALUES (
      ${row.date}::date, ${row.brand}, ${row.model}, ${row.runNumber},
      ${row.sentiment}, ${JSON.stringify(row.tags)}::jsonb
    )
    ON CONFLICT (date, brand, model, run_number) DO UPDATE SET
      sentiment  = EXCLUDED.sentiment,
      tags       = EXCLUDED.tags,
      created_at = NOW()
  `;
}

export async function insertSkincareSentimentError(row: {
  date: string;
  brand: string | null;
  model: string | null;
  runNumber: number | null;
  rawResponse: string;
  errorMessage: string;
}): Promise<void> {
  await sql`
    INSERT INTO skincare_sentiment_errors
      (date, brand, model, run_number, raw_response, error_message)
    VALUES (
      ${row.date}::date, ${row.brand}, ${row.model}, ${row.runNumber},
      ${row.rawResponse}, ${row.errorMessage}
    )
  `;
}

export interface SkincareSentimentTag {
  tag: string;
  frequency: number;
  shared: boolean;
}

export interface SkincareSentimentRow {
  brand: string;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  top_tags: SkincareSentimentTag[];
  total_responses: number;
}

export async function getSkincareSentimentSummary(): Promise<SkincareSentimentRow[]> {
  await initSkincareDB();
  const result = await sql`
    SELECT DISTINCT ON (brand)
      brand,
      positive_pct::float  AS positive_pct,
      neutral_pct::float   AS neutral_pct,
      negative_pct::float  AS negative_pct,
      top_tags,
      total_responses
    FROM skincare_sentiment_summary
    ORDER BY brand, window_end DESC
  `;
  return result.rows.map((r) => ({
    brand: r.brand as string,
    positive_pct: r.positive_pct as number,
    neutral_pct: r.neutral_pct as number,
    negative_pct: r.negative_pct as number,
    top_tags: (r.top_tags as SkincareSentimentTag[]) ?? [],
    total_responses: r.total_responses as number,
  }));
}
