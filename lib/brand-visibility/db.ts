import { sql } from "@vercel/postgres";
import { DEFAULT_STOPLIST, type ResolutionCache, type CanonicalEntry } from "./normalization";

let dbInitialised = false;

export async function initBrandVisibilityDB(): Promise<void> {
  if (dbInitialised) return;

  // ── Core collection tables ─────────────────────────────────────────────────

  // Raw per-call responses — one row per (date, prompt, model, run)
  await sql`
    CREATE TABLE IF NOT EXISTS raw_responses (
      id             SERIAL PRIMARY KEY,
      date           DATE    NOT NULL,
      prompt_id      INTEGER NOT NULL CHECK (prompt_id BETWEEN 1 AND 22),
      prompt_text    TEXT    NOT NULL,
      bucket_tag     TEXT    NOT NULL,
      model          TEXT    NOT NULL CHECK (model IN ('claude-haiku-4-5', 'gpt-4o-mini')),
      model_snapshot TEXT,
      run_number     INTEGER NOT NULL CHECK (run_number BETWEEN 1 AND 5),
      brands         JSONB   NOT NULL DEFAULT '[]',
      created_at     TIMESTAMP DEFAULT NOW()
    )
  `;
  // Backfill column on tables created before this column was added
  await sql`ALTER TABLE raw_responses ADD COLUMN IF NOT EXISTS model_snapshot TEXT`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS raw_responses_unique
    ON raw_responses (date, prompt_id, model, run_number)
  `;

  // Parse failures — raw text logged here instead of silently dropped
  await sql`
    CREATE TABLE IF NOT EXISTS collection_errors (
      id            SERIAL PRIMARY KEY,
      date          DATE    NOT NULL,
      prompt_id     INTEGER,
      model         TEXT,
      run_number    INTEGER,
      raw_response  TEXT,
      error_message TEXT,
      created_at    TIMESTAMP DEFAULT NOW()
    )
  `;

  // ── Brand normalization tables ─────────────────────────────────────────────

  // Registry of known canonical brand names.
  // display_name: how it appears in the UI (e.g. "HubSpot").
  // normalized_name: lowercased, suffixes stripped — used for alias lookup and fuzzy matching.
  await sql`
    CREATE TABLE IF NOT EXISTS canonical_brands (
      id              SERIAL PRIMARY KEY,
      display_name    TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      created_at      TIMESTAMP DEFAULT NOW()
    )
  `;

  // Maps a normalized raw brand string → canonical brand.
  // Populated on first encounter; avoids re-running fuzzy logic on subsequent runs.
  await sql`
    CREATE TABLE IF NOT EXISTS brand_aliases (
      id           SERIAL PRIMARY KEY,
      raw_name     TEXT    NOT NULL UNIQUE,
      canonical_id INTEGER NOT NULL REFERENCES canonical_brands(id) ON DELETE CASCADE,
      created_at   TIMESTAMP DEFAULT NOW()
    )
  `;

  // New auto-created canonicals awaiting manual confirmation.
  // raw_name: original LLM output (un-normalized, for readability).
  // suggested_canonical/levenshtein_dist: populated when a close-but-not-exact fuzzy match exists.
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

  // Generic terms excluded from brand counting.
  // Seeded from DEFAULT_STOPLIST on first init; extend via direct DB INSERT.
  await sql`
    CREATE TABLE IF NOT EXISTS brand_stoplist (
      id         SERIAL PRIMARY KEY,
      term       TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Per-response brand resolution — bridge table enabling SQL-level LLM visibility queries.
  // position: 1-based index of this brand's first occurrence in the response's brands array.
  await sql`
    CREATE TABLE IF NOT EXISTS response_canonical_brands (
      response_id     INTEGER NOT NULL REFERENCES raw_responses(id) ON DELETE CASCADE,
      canonical_brand TEXT    NOT NULL,
      position        INTEGER NOT NULL,
      PRIMARY KEY (response_id, canonical_brand)
    )
  `;

  // ── Aggregation output tables ──────────────────────────────────────────────

  await sql`
    CREATE TABLE IF NOT EXISTS daily_summary (
      id            SERIAL PRIMARY KEY,
      date          DATE    NOT NULL,
      brand         TEXT    NOT NULL,
      model         TEXT    NOT NULL,
      mention_count INTEGER NOT NULL DEFAULT 0,
      avg_position  FLOAT,
      confidence    TEXT    NOT NULL DEFAULT 'normal' CHECK (confidence IN ('low', 'normal')),
      created_at    TIMESTAMP DEFAULT NOW(),
      UNIQUE (date, brand, model)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS weekly_summary (
      id            SERIAL PRIMARY KEY,
      window_start  DATE    NOT NULL,
      window_end    DATE    NOT NULL,
      brand         TEXT    NOT NULL,
      model         TEXT    NOT NULL,
      mention_count INTEGER NOT NULL DEFAULT 0,
      avg_position  FLOAT,
      confidence    TEXT    NOT NULL DEFAULT 'normal' CHECK (confidence IN ('low', 'normal')),
      created_at    TIMESTAMP DEFAULT NOW(),
      UNIQUE (window_start, window_end, brand, model)
    )
  `;

  // Stores denominator (total_responses) alongside pct so the percentage is always auditable.
  await sql`
    CREATE TABLE IF NOT EXISTS llm_visibility (
      id              SERIAL PRIMARY KEY,
      window_start    DATE    NOT NULL,
      window_end      DATE    NOT NULL,
      model           TEXT    NOT NULL,
      visibility_pct  FLOAT   NOT NULL,
      total_responses INTEGER NOT NULL,
      created_at      TIMESTAMP DEFAULT NOW(),
      UNIQUE (window_start, window_end, model)
    )
  `;

  // Placeholder for top-15 brand list — uses canonical display_names.
  // Populate manually after first week once brands meet MIN_OCCURRENCES_FOR_TOP15.
  // When empty, all brands are treated as tracked (pipeline safe on day 1).
  await sql`
    CREATE TABLE IF NOT EXISTS top_15_brands (
      id         SERIAL PRIMARY KEY,
      brand_name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Brands excluded from aggregation output (daily_summary, weekly_summary) but
  // kept in raw_responses and response_canonical_brands for audit purposes.
  // Add new entries directly: INSERT INTO brand_denylist (brand_name) VALUES ('...')
  await sql`
    CREATE TABLE IF NOT EXISTS brand_denylist (
      id         SERIAL PRIMARY KEY,
      brand_name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  const denyEntries = [
    // Legacy / non-AI-first martech platforms
    "HubSpot", "Salesforce", "Salesforce Einstein", "Salesforce Marketing Cloud",
    "Marketo", "Adobe Analytics", "Adobe", "Adobe Sensei", "Adobe Experience Cloud",
    "Adobe Marketo Engage", "Adobe Advertising Cloud", "Tableau", "Segment",
    "Mixpanel", "Amplitude", "Looker", "Power BI", "Zoho", "Zoho CRM",
    "Zoho Analytics", "Pipedrive", "ZoomInfo", "Domo", "Klipfolio", "Heap",
    "Google Search Console", "Google Marketing Platform", "Microsoft Advertising",
    "Ahrefs", "Moz", "Semrush", "SE Ranking", "BuzzSumo", "Brightedge",
    // Model / maker-name artifacts
    "Claude", "Anthropic", "ChatGPT", "OpenAI", "Gemini", "Google",
    // Customer support / adjacent tools — out of scope for marketing-agent tracking
    "Intercom",
    // Legacy paid-ads platforms predating the AI agent wave
    "Pardot", "WordStream", "Kenshoo", "Skai",
    // Email marketing / CRM / non-AI-native platforms
    "Klaviyo", "ConvertKit", "GetResponse", "Sendinblue", "Drip",
    // Social media management tools (not AI agents)
    "Hootsuite", "Buffer", "Sprout Social", "Brandwatch",
    // Ad platforms / analytics tools (not AI agents)
    "AdRoll", "Marin Software", "Kissmetrics", "Meta Ads Manager", "Terminus",
    // Sales prospecting tools (not marketing AI agents)
    "Apollo", "Hunter.io", "Clay",
    // A/B testing / optimisation (not AI agents)
    "Optimizely",
    // B2B demand-gen / intent-data platforms (not AI agents)
    "6sense", "Demandbase",
  ];
  await sql`
    INSERT INTO brand_denylist (brand_name)
    SELECT t.name FROM UNNEST(${denyEntries}::text[]) AS t(name)
    ON CONFLICT (brand_name) DO NOTHING
  `;

  // ── Audit / changelog tables ───────────────────────────────────────────────

  // Records every change to the 22-prompt set in prompts.ts.
  // Populate manually whenever prompts.ts changes — the pipeline does not auto-log this.
  await sql`
    CREATE TABLE IF NOT EXISTS prompt_changelog (
      id         SERIAL PRIMARY KEY,
      date       DATE        NOT NULL DEFAULT CURRENT_DATE,
      prompt_id  INTEGER     NOT NULL,
      action     TEXT        NOT NULL CHECK (action IN ('added', 'modified', 'removed')),
      old_text   TEXT,
      new_text   TEXT,
      created_at TIMESTAMP   DEFAULT NOW()
    )
  `;

  // Records every change to the stoplist (DEFAULT_STOPLIST additions or DB inserts/deletes).
  // Populate manually when terms are added/removed — the pipeline does not auto-log this.
  await sql`
    CREATE TABLE IF NOT EXISTS stoplist_changelog (
      id         SERIAL PRIMARY KEY,
      date       DATE        NOT NULL DEFAULT CURRENT_DATE,
      term       TEXT        NOT NULL,
      action     TEXT        NOT NULL CHECK (action IN ('added', 'removed')),
      reason     TEXT,
      created_at TIMESTAMP   DEFAULT NOW()
    )
  `;

  // Seed stoplist on first init — single batch insert (idempotent via ON CONFLICT DO NOTHING)
  const stopTerms = [...DEFAULT_STOPLIST];
  await sql`
    INSERT INTO brand_stoplist (term)
    SELECT t.term FROM UNNEST(${stopTerms}::text[]) AS t(term)
    ON CONFLICT (term) DO NOTHING
  `;

  // Add archived column to collection_errors for per-run scoping (safe if already exists)
  await sql`ALTER TABLE collection_errors ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE`;

  // One-time cleanup: archive errors for any (date, model) pair that already has a full
  // set of 110 successful raw_responses rows — those errors were from superseded failed runs.
  await sql`
    UPDATE collection_errors ce
    SET archived = TRUE
    WHERE ce.archived = FALSE
      AND ce.model IS NOT NULL
      AND (
        SELECT COUNT(*)
        FROM raw_responses rr
        WHERE rr.date = ce.date AND rr.model = ce.model
      ) = 110
  `;

  dbInitialised = true;
}

// ── Raw response writes ────────────────────────────────────────────────────────

export async function insertRawResponse(row: {
  date: string;
  promptId: number;
  promptText: string;
  bucketTag: string;
  model: string;
  modelSnapshot: string; // exact snapshot returned by API, e.g. "claude-haiku-4-5-20241022"
  runNumber: number;
  brands: string[];
}): Promise<void> {
  await sql`
    INSERT INTO raw_responses (date, prompt_id, prompt_text, bucket_tag, model, model_snapshot, run_number, brands)
    VALUES (
      ${row.date}::date, ${row.promptId}, ${row.promptText}, ${row.bucketTag},
      ${row.model}, ${row.modelSnapshot}, ${row.runNumber}, ${JSON.stringify(row.brands)}::jsonb
    )
    ON CONFLICT (date, prompt_id, model, run_number) DO UPDATE SET
      brands         = EXCLUDED.brands,
      model_snapshot = EXCLUDED.model_snapshot,
      created_at     = NOW()
  `;
}

/**
 * Archive all active (non-archived) collection_errors for a specific date + model.
 * Call this at the START of a collection retry so errors from the previous attempt
 * don't persist as active errors once a new run begins.
 */
export async function archiveErrorsForRun(date: string, model: string): Promise<void> {
  await sql`
    UPDATE collection_errors
    SET archived = TRUE
    WHERE date = ${date}::date AND model = ${model} AND archived = FALSE
  `;
}

export async function insertCollectionError(row: {
  date: string;
  promptId: number | null;
  model: string | null;
  runNumber: number | null;
  rawResponse: string;
  errorMessage: string;
}): Promise<void> {
  await sql`
    INSERT INTO collection_errors (date, prompt_id, model, run_number, raw_response, error_message)
    VALUES (${row.date}::date, ${row.promptId}, ${row.model}, ${row.runNumber}, ${row.rawResponse}, ${row.errorMessage})
  `;
}

// ── Normalization cache helpers ────────────────────────────────────────────────

/**
 * Load the full resolution cache in three parallel queries.
 * Called once per aggregation run; all brand resolution is then done in-memory.
 */
export async function loadResolutionCache(): Promise<ResolutionCache> {
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

/**
 * Returns all denylisted brand names as a lowercase Set for O(1) lookup.
 * Called once per aggregation run; the denylist is applied before any row is
 * written to daily_summary or weekly_summary.
 */
export async function loadDenylist(): Promise<Set<string>> {
  await initBrandVisibilityDB();
  const result = await sql`SELECT brand_name FROM brand_denylist`;
  return new Set(result.rows.map((r) => (r.brand_name as string).toLowerCase()));
}

// ── Raw brand rows for aggregation ────────────────────────────────────────────

export interface RawBrandRow {
  responseId: number;
  model: string;
  brandName: string; // raw string from LLM — not yet normalized
  position: number;  // 1-based ordinal position in that response's brands array
}

export async function getRawBrandsForDate(date: string): Promise<RawBrandRow[]> {
  const result = await sql`
    SELECT r.id AS response_id, r.model, t.brand_name, t.pos::int AS position
    FROM raw_responses r,
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

export async function getRawBrandsForWindow(start: string, end: string): Promise<RawBrandRow[]> {
  const result = await sql`
    SELECT r.id AS response_id, r.model, t.brand_name, t.pos::int AS position
    FROM raw_responses r,
         jsonb_array_elements_text(r.brands) WITH ORDINALITY AS t(brand_name, pos)
    WHERE r.date BETWEEN ${start}::date AND ${end}::date
  `;
  return result.rows.map((r) => ({
    responseId: r.response_id as number,
    model: r.model as string,
    brandName: r.brand_name as string,
    position: r.position as number,
  }));
}

// ── Canonical brand + alias writes ─────────────────────────────────────────────

export interface NewCanonical {
  displayName: string;
  normalizedName: string;
}

/**
 * Persist a batch of new canonical entries and aliases produced by the resolution pipeline.
 * Returns a map of normalizedName → assigned display_name (refreshed from DB to handle races).
 */
export async function persistNewCanonicals(
  entries: NewCanonical[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (!entries.length) return result;

  // Batch all canonical inserts in a single statement using unnest.
  // ON CONFLICT DO UPDATE returns the winning row (existing or inserted).
  const displayNames = entries.map((e) => e.displayName);
  const normalizedNames = entries.map((e) => e.normalizedName);
  const rows = await sql`
    INSERT INTO canonical_brands (display_name, normalized_name)
    SELECT * FROM UNNEST(
      ${displayNames}::text[],
      ${normalizedNames}::text[]
    ) AS t(display_name, normalized_name)
    ON CONFLICT (normalized_name) DO UPDATE SET normalized_name = EXCLUDED.normalized_name
    RETURNING id, display_name, normalized_name
  `;

  // Batch self-alias inserts in a single statement
  const ids = rows.rows.map((r) => r.id as number);
  const norms = rows.rows.map((r) => r.normalized_name as string);
  await sql`
    INSERT INTO brand_aliases (raw_name, canonical_id)
    SELECT * FROM UNNEST(${norms}::text[], ${ids}::int[]) AS t(raw_name, canonical_id)
    ON CONFLICT (raw_name) DO NOTHING
  `;

  for (const r of rows.rows) {
    result.set(r.normalized_name as string, r.display_name as string);
  }
  return result;
}

export async function persistAlias(rawName: string, canonicalDisplayName: string): Promise<void> {
  const row = await sql`
    SELECT id FROM canonical_brands WHERE display_name = ${canonicalDisplayName} LIMIT 1
  `;
  const id = row.rows[0]?.id as number | undefined;
  if (!id) return;
  await sql`
    INSERT INTO brand_aliases (raw_name, canonical_id)
    VALUES (${rawName}, ${id})
    ON CONFLICT (raw_name) DO NOTHING
  `;
}

// ── Review queue ──────────────────────────────────────────────────────────────

export interface ReviewQueueEntry {
  rawName: string;
  suggestedCanonical: string | null;
  levenshteinDist: number | null;
  firstSeen: string;
}

export async function addToReviewQueue(entries: ReviewQueueEntry[]): Promise<void> {
  if (!entries.length) return;
  const rawNames = entries.map((e) => e.rawName);
  const suggestedCanonicals = entries.map((e) => e.suggestedCanonical);
  const levenshteinDists = entries.map((e) => e.levenshteinDist);
  const firstSeens = entries.map((e) => e.firstSeen);
  await sql`
    INSERT INTO brand_review_queue (raw_name, suggested_canonical, levenshtein_dist, first_seen, occurrence_count)
    SELECT
      t.raw_name,
      t.suggested_canonical,
      t.levenshtein_dist::int,
      t.first_seen::date,
      1
    FROM UNNEST(
      ${rawNames}::text[],
      ${suggestedCanonicals}::text[],
      ${levenshteinDists}::text[],
      ${firstSeens}::text[]
    ) AS t(raw_name, suggested_canonical, levenshtein_dist, first_seen)
    ON CONFLICT (raw_name) DO UPDATE SET
      occurrence_count = brand_review_queue.occurrence_count + 1
  `;
}

// ── response_canonical_brands writes ─────────────────────────────────────────

export interface ResponseBrandEntry {
  responseId: number;
  canonicalBrand: string;
  position: number; // 1-based first occurrence in response's brands array
}

export async function persistResponseCanonicalBrands(entries: ResponseBrandEntry[]): Promise<void> {
  if (!entries.length) return;
  const responseIds = entries.map((e) => e.responseId);
  const canonicalBrands = entries.map((e) => e.canonicalBrand);
  const positions = entries.map((e) => e.position);
  await sql`
    INSERT INTO response_canonical_brands (response_id, canonical_brand, position)
    SELECT * FROM UNNEST(${responseIds}::int[], ${canonicalBrands}::text[], ${positions}::int[])
      AS t(response_id, canonical_brand, position)
    ON CONFLICT (response_id, canonical_brand) DO UPDATE SET
      position = LEAST(response_canonical_brands.position, EXCLUDED.position)
  `;
}

// ── Top-15 eligibility helper ─────────────────────────────────────────────────

/**
 * Returns brands that have accumulated at least minOccurrences total mentions
 * across all days in daily_summary. Use this to decide which brands to add to
 * top_15_brands — only confirmed, high-frequency brands should be tracked.
 */
export async function getEligibleBrandsForTop15(minOccurrences: number): Promise<
  { brand: string; total_mentions: number }[]
> {
  await initBrandVisibilityDB();
  const result = await sql`
    SELECT brand, SUM(mention_count) AS total_mentions
    FROM daily_summary
    GROUP BY brand
    HAVING SUM(mention_count) >= ${minOccurrences}
    ORDER BY total_mentions DESC
  `;
  return result.rows as { brand: string; total_mentions: number }[];
}

// ── Daily summary reads (for frontend) ────────────────────────────────────────

export async function getDailySummary(days = 7): Promise<
  { date: string; brand: string; model: string; mention_count: number; avg_position: number | null; confidence: string }[]
> {
  await initBrandVisibilityDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const result = await sql`
    SELECT date::text AS date, brand, model, mention_count, avg_position, confidence
    FROM daily_summary
    WHERE date >= ${cutoffStr}::date
    ORDER BY date ASC, mention_count DESC
  `;
  return result.rows as { date: string; brand: string; model: string; mention_count: number; avg_position: number | null; confidence: string }[];
}

export async function getWeeklySummary(): Promise<
  { window_start: string; window_end: string; brand: string; model: string; mention_count: number; avg_position: number | null; confidence: string }[]
> {
  await initBrandVisibilityDB();
  const result = await sql`
    SELECT window_start::text, window_end::text, brand, model, mention_count, avg_position, confidence
    FROM weekly_summary
    ORDER BY window_start DESC, mention_count DESC
    LIMIT 2000
  `;
  return result.rows as { window_start: string; window_end: string; brand: string; model: string; mention_count: number; avg_position: number | null; confidence: string }[];
}

// ── Locked-cohort reads ────────────────────────────────────────────────────────
// Joins daily_summary / weekly_summary against locked_marketing_agents so only
// the curated 22 marketing AI agents are returned. rank is passed through so
// the chart can order its legend by locked rank rather than mention volume.

export async function getLockedDailySummary(days = 7): Promise<
  { date: string; brand: string; model: string; mention_count: number; avg_position: number | null; confidence: string; rank: number; dominant_tag: string }[]
> {
  await initBrandVisibilityDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const result = await sql`
    SELECT ds.date::text AS date, ds.brand, ds.model,
           ds.mention_count, ds.avg_position, ds.confidence,
           lma.rank, lma.dominant_tag
    FROM daily_summary ds
    JOIN locked_marketing_agents lma ON lma.brand_name = ds.brand
    WHERE ds.date >= ${cutoffStr}::date
    ORDER BY ds.date ASC, lma.rank ASC
  `;
  return result.rows as { date: string; brand: string; model: string; mention_count: number; avg_position: number | null; confidence: string; rank: number; dominant_tag: string }[];
}

export interface BrandPositionRow {
  brand_name: string;
  display_name: string;
  rank: number;
  overall_avg_pos: number | null;
  ads_avg_pos: number | null;
  content_avg_pos: number | null;
  roi_avg_pos: number | null;
  leadgen_avg_pos: number | null;
  analytics_avg_pos: number | null;
  seo_avg_pos: number | null;
  social_avg_pos: number | null;
}

export async function getLockedBrandPositions(): Promise<BrandPositionRow[]> {
  await initBrandVisibilityDB();
  const result = await sql`
    WITH cluster_pos AS (
      SELECT rcb.canonical_brand AS brand_name, rr.bucket_tag,
        ROUND(AVG(rcb.position)::numeric, 1) AS avg_pos
      FROM response_canonical_brands rcb
      JOIN raw_responses rr ON rr.id = rcb.response_id
      JOIN locked_marketing_agents lma ON lma.brand_name = rcb.canonical_brand
      GROUP BY rcb.canonical_brand, rr.bucket_tag
    ),
    overall_pos AS (
      SELECT ds.brand, ROUND(AVG(ds.avg_position)::numeric, 1) AS avg_pos
      FROM daily_summary ds
      JOIN locked_marketing_agents lma ON lma.brand_name = ds.brand
      WHERE ds.avg_position IS NOT NULL
      GROUP BY ds.brand
    )
    SELECT lma.brand_name, lma.display_name, lma.rank,
      op.avg_pos AS overall_avg_pos,
      MAX(CASE WHEN cp.bucket_tag = 'ads'       THEN cp.avg_pos END) AS ads_avg_pos,
      MAX(CASE WHEN cp.bucket_tag = 'content'   THEN cp.avg_pos END) AS content_avg_pos,
      MAX(CASE WHEN cp.bucket_tag = 'overall'   THEN cp.avg_pos END) AS roi_avg_pos,
      MAX(CASE WHEN cp.bucket_tag = 'lead-gen'  THEN cp.avg_pos END) AS leadgen_avg_pos,
      MAX(CASE WHEN cp.bucket_tag = 'analytics' THEN cp.avg_pos END) AS analytics_avg_pos,
      MAX(CASE WHEN cp.bucket_tag = 'seo'       THEN cp.avg_pos END) AS seo_avg_pos,
      MAX(CASE WHEN cp.bucket_tag = 'social'    THEN cp.avg_pos END) AS social_avg_pos
    FROM locked_marketing_agents lma
    LEFT JOIN overall_pos op ON op.brand = lma.brand_name
    LEFT JOIN cluster_pos cp ON cp.brand_name = lma.brand_name
    GROUP BY lma.brand_name, lma.display_name, lma.rank, op.avg_pos
    ORDER BY lma.rank
  `;
  return result.rows as BrandPositionRow[];
}

// ── Legacy cohort reads (top_15_brands) ───────────────────────────────────────
// These functions mirror getDailySummary / getWeeklySummary but join against
// top_15_brands so only the locked cohort is returned.
//
// NOT wired into any live route yet — switch the dashboard calls once
// top_15_brands is populated (see getEligibleBrandsForTop15).
// Do not activate before ~7 days of data have accumulated.

export async function getCohortDailySummary(days = 7): Promise<
  { date: string; brand: string; model: string; mention_count: number; avg_position: number | null; confidence: string }[]
> {
  await initBrandVisibilityDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const result = await sql`
    SELECT ds.date::text AS date, ds.brand, ds.model, ds.mention_count, ds.avg_position, ds.confidence
    FROM daily_summary ds
    JOIN top_15_brands t ON t.brand_name = ds.brand
    WHERE ds.date >= ${cutoffStr}::date
    ORDER BY ds.date ASC, ds.mention_count DESC
  `;
  return result.rows as { date: string; brand: string; model: string; mention_count: number; avg_position: number | null; confidence: string }[];
}

export async function getCohortWeeklySummary(): Promise<
  { window_start: string; window_end: string; brand: string; model: string; mention_count: number; avg_position: number | null; confidence: string }[]
> {
  await initBrandVisibilityDB();
  const result = await sql`
    SELECT ws.window_start::text, ws.window_end::text, ws.brand, ws.model, ws.mention_count, ws.avg_position, ws.confidence
    FROM weekly_summary ws
    JOIN top_15_brands t ON t.brand_name = ws.brand
    ORDER BY ws.window_start DESC, ws.mention_count DESC
    LIMIT 2000
  `;
  return result.rows as { window_start: string; window_end: string; brand: string; model: string; mention_count: number; avg_position: number | null; confidence: string }[];
}

export async function getLLMVisibility(): Promise<
  { window_start: string; window_end: string; model: string; visibility_pct: number; total_responses: number }[]
> {
  await initBrandVisibilityDB();
  const result = await sql`
    SELECT window_start::text, window_end::text, model, visibility_pct, total_responses
    FROM llm_visibility
    ORDER BY window_start DESC
    LIMIT 20
  `;
  return result.rows as { window_start: string; window_end: string; model: string; visibility_pct: number; total_responses: number }[];
}

// ── Observability ──────────────────────────────────────────────────────────────

export async function getDailyRunStats(date: string): Promise<{ success: number; activeErrors: number }> {
  const [successResult, errorResult] = await Promise.all([
    sql`SELECT COUNT(*) AS count FROM raw_responses WHERE date = ${date}::date`,
    sql`SELECT COUNT(*) AS count FROM collection_errors WHERE date = ${date}::date AND archived = FALSE`,
  ]);
  return {
    success: parseInt(successResult.rows[0]?.count ?? "0", 10),
    activeErrors: parseInt(errorResult.rows[0]?.count ?? "0", 10),
  };
}
