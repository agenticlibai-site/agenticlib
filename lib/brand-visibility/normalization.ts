// ── Constants ──────────────────────────────────────────────────────────────────

// A brand must accumulate at least this many total mentions across all days
// before it is eligible to be added to top_15_brands.
export const MIN_OCCURRENCES_FOR_TOP15 = 10;

// Strip TLD domain suffixes and common generic product-category suffixes.
// Applied before fuzzy matching so "HubSpot AI" and "HubSpot" both normalize to "hubspot".
// Order: TLD first, then standalone words (whole-word match only).
const TLD_RE = /\.(ai|com|io|app|co|net|org)\b/gi;
const SUFFIX_WORDS_RE =
  /\b(ai|app|apps|agent|agents|tool|tools|platform|platforms|suite|suites|software|solution|solutions|service|services)\b/gi;
const TRAILING_PUNCT_RE = /[.,;:!?'"()\[\]{}<>]+$/g;
const WHITESPACE_RE = /\s+/g;

// Default stoplist seed — generic terms LLMs sometimes return instead of brand names.
// Persisted in brand_stoplist on first DB init. Add domain-specific terms via the DB table.
export const DEFAULT_STOPLIST: string[] = [
  // Generic category words
  "ai", "artificial intelligence", "ml", "machine learning", "llm", "gpt",
  "chatbot", "chatbots", "bot", "bots", "virtual assistant",
  "tool", "tools", "software", "solution", "solutions",
  "platform", "platforms", "service", "services",
  "agent", "agents", "assistant", "assistants",
  "automation", "workflow", "workflows", "integration", "integrations",
  // Marketing-specific generic phrases
  "marketing tool", "marketing tools", "marketing platform", "marketing platforms",
  "marketing agent", "marketing agents", "marketing software", "marketing solution",
  "ai tool", "ai tools", "ai platform", "ai platforms",
  "ai agent", "ai agents", "ai assistant", "ai assistants",
  "content tool", "email tool", "seo tool", "analytics tool", "ad tool",
  "social media tool", "social media platform",
  // Qualitative descriptors LLMs sometimes return bare
  "various", "many", "several", "different", "other", "some",
  "top", "best", "leading", "popular", "advanced", "recommended",
  "free", "paid", "premium", "enterprise", "open source",
  // Very short generic abbreviations that survive suffix stripping
  "crm", "cms", "erp", "saas", "api",
  // Infrastructure / adjacent tools that are NOT AI marketing agents.
  // Added after day-1 review — these polluted brand rankings because LLMs
  // frequently cite them alongside actual agents in marketing context prompts.
  "chatgpt",
  "zapier",
  "make",           // formerly Integromat; "make" also survives suffix stripping as a verb
  "google",
  "google analytics",
  "google ads",
  "meta",
  "facebook",
  "mailchimp",
  "canva",
  "notion",
  "slack",
  "salesforce",
  "openai",
  // LLM self-references — model names the model while answering, not a competitor brand.
  // Stoplist matches the EXACT normalized form only; compound products like
  // "Claude Enterprise" or "Anthropic Research" would normalize to different strings
  // and are not affected.
  "claude",
  "anthropic",
  // Bare parent-company names — the company alone is not a trackable product signal;
  // their specific products (Adobe Sensei, Adobe Marketo Engage, Microsoft Advertising,
  // Microsoft Copilot, IBM Watson Marketing, etc.) normalize to compound strings
  // ("adobe sensei", "microsoft advertising", etc.) and are NOT caught by these entries.
  "adobe",
  "microsoft",
  // "ibm" — omitted; bare IBM never appeared as a canonical_brand in day-1 data.
  //   Add here if it appears in future runs.
];

// ── Normalization ──────────────────────────────────────────────────────────────

/**
 * Canonical normalization pipeline applied to every raw brand string before
 * alias lookup or fuzzy matching. Strips TLD suffixes, generic category words,
 * trailing punctuation, then lowercases and collapses whitespace.
 */
export function normalizeName(raw: string): string {
  let s = raw.trim();
  s = s.replace(TLD_RE, " ");
  s = s.replace(SUFFIX_WORDS_RE, " ");
  s = s.replace(TRAILING_PUNCT_RE, "");
  s = s.replace(WHITESPACE_RE, " ").trim().toLowerCase();
  return s;
}

// ── Levenshtein distance ───────────────────────────────────────────────────────

/**
 * Standard DP Levenshtein distance — O(m·n).
 * Used for fuzzy matching normalized brand names against existing canonicals.
 * Only called when both strings have length > 5 (per spec).
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // Allocate two rows instead of full matrix to save memory
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// ── Resolution types ───────────────────────────────────────────────────────────

export interface CanonicalEntry {
  id: number;
  displayName: string;   // e.g. "HubSpot" — shown in UI and stored in daily_summary
  normalizedName: string; // e.g. "hubspot" — used for alias lookup and fuzzy matching
}

export interface ResolutionCache {
  // normalized raw_name → canonical displayName
  aliases: Map<string, string>;
  // normalizedName → CanonicalEntry (for fuzzy matching)
  canonicals: CanonicalEntry[];
  // set of terms to silently drop
  stoplist: Set<string>;
}

export type ResolutionKind =
  | { kind: "stoplist" }
  | { kind: "alias";  canonical: string }
  | { kind: "fuzzy";  canonical: string; matchedNormalized: string; distance: number }
  | { kind: "new";    normalized: string; displayName: string };

/**
 * Resolves a single normalized brand name against the in-memory cache.
 * No DB calls — all I/O is batched outside this function.
 *
 * Fuzzy matching only applies when normalized.length > 5 (per spec).
 */
export function resolveInMemory(
  normalized: string,
  rawDisplay: string,
  cache: ResolutionCache,
): ResolutionKind {
  // 1. Stoplist check
  if (cache.stoplist.has(normalized)) return { kind: "stoplist" };

  // 2. Exact alias cache hit
  const aliasHit = cache.aliases.get(normalized);
  if (aliasHit) return { kind: "alias", canonical: aliasHit };

  // 3. Fuzzy match against canonicals (only for strings longer than 5 chars)
  if (normalized.length > 5) {
    let bestDist = Infinity;
    let bestEntry: CanonicalEntry | null = null;

    for (const entry of cache.canonicals) {
      const dist = levenshtein(normalized, entry.normalizedName);
      if (dist <= 2 && dist < bestDist) {
        bestDist = dist;
        bestEntry = entry;
      }
    }

    if (bestEntry) {
      return { kind: "fuzzy", canonical: bestEntry.displayName, matchedNormalized: bestEntry.normalizedName, distance: bestDist };
    }
  }

  // 4. No match — brand is unknown; must be created and queued for review
  return { kind: "new", normalized, displayName: rawDisplay };
}
