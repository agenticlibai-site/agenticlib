// Sentiment pipeline — cluster definitions, prompt building, aggregation, drift detection.

// ── System prompt ──────────────────────────────────────────────────────────────

export const SENTIMENT_SYSTEM_PROMPT =
  "You are a brand analyst. " +
  "Return ONLY valid JSON matching the exact schema provided. " +
  "No markdown, no explanation — just the JSON object.";

// ── Context phrases per bucket_tag ─────────────────────────────────────────────
// Replaces the generic phrase in the prompt template so each cluster produces
// meaningfully different sentiment signals, not just duplicate draws.

const CONTEXT_PHRASES: Record<string, string> = {
  "overall":     "as a potential marketing AI tool for my business",
  "ads":         "as a potential tool for managing and optimising our paid advertising campaigns on Meta, Google, and TikTok",
  "content":     "as a potential tool for creating and scaling our marketing copy and brand voice",
  "lead-gen":    "as a potential tool for automating our lead generation, outreach, and sales funnel",
  "lifecycle":   "as a potential tool for automating lifecycle messaging, lead nurture, and customer retention across email, chat, and messaging channels",
};

// ── Cluster definitions ────────────────────────────────────────────────────────
// prompt_id: 1=overall, 2=ads, 3=content, 4=lead-gen, 5=lifecycle.
// Use brand_name (DB key). Drift + Conversica + Phrasee + Persado + ManyChat
// intentionally appear in multiple use-case clusters.

const ADS_BRANDS     = ["Albert", "Optmyzr", "Acquisio", "Adext", "Pattern89", "Revealbot", "Madgicx", "Smartly.io", "RocketFuel"];
const CONTENT_BRANDS = ["Copy.ai", "Writesonic", "Anyword", "Brand.ai", "Phrasee", "Persado"];
const LEADGEN_BRANDS = ["Lemlist", "Instantly", "Conversica", "ManyChat", "Drift"];
const ROI_BRANDS     = ["Drift", "Conversica", "Braze", "Phrasee", "Persado", "Seventh Sense", "ManyChat"];

export interface SentimentCluster {
  bucket_tag: string;
  prompt_id:  number;
  brands:     string[] | "all";
}

export const SENTIMENT_CLUSTERS: SentimentCluster[] = [
  { bucket_tag: "overall",     prompt_id: 1, brands: "all"          },
  { bucket_tag: "ads",         prompt_id: 2, brands: ADS_BRANDS     },
  { bucket_tag: "content",     prompt_id: 3, brands: CONTENT_BRANDS },
  { bucket_tag: "lead-gen",    prompt_id: 4, brands: LEADGEN_BRANDS },
  { bucket_tag: "lifecycle",   prompt_id: 5, brands: ROI_BRANDS     },
];

export function getSentimentClustersForBrand(brandName: string): SentimentCluster[] {
  return SENTIMENT_CLUSTERS.filter(
    (c) => c.brands === "all" || (Array.isArray(c.brands) && c.brands.includes(brandName)),
  );
}

// ── Prompt builder ─────────────────────────────────────────────────────────────

export function buildSentimentPrompt(brandName: string, bucketTag: string): string {
  const phrase = CONTEXT_PHRASES[bucketTag] ?? CONTEXT_PHRASES["overall"];
  return `I'm researching ${brandName} ${phrase}. Based on what you know about ${brandName}, how would you describe it overall?

Only describe ${brandName} specifically — do not compare it to other tools in this response.

Respond in JSON only:
{
  "sentiment": "positive|neutral|negative",
  "confidence": "high|medium|low",
  "descriptors": ["3 to 5 short phrases that characterise how you would describe ${brandName} to someone evaluating it — these should reflect the tone and substance of your description, not generic category labels"]
}`;
}

// ── Aggregation ────────────────────────────────────────────────────────────────

export interface SentimentResponseRow {
  brand_name:  string;
  bucket_tag:  string;
  sentiment:   string | null;
  confidence:  string | null;
  descriptors: string[] | null;
  parse_error: boolean;
}

export interface SentimentAggResult {
  brand_name:      string;
  bucket_tag:      string;
  positive_count:  number;
  neutral_count:   number;
  negative_count:  number;
  total_count:     number;
  top_descriptors: string[];
  unique_flags:    string[];
  week_start:      string;
}

export function aggregateResponses(
  responses: SentimentResponseRow[],
  weekStart: string,
): SentimentAggResult[] {
  // Group by brand_name + bucket_tag
  const groups = new Map<string, SentimentResponseRow[]>();
  for (const r of responses) {
    const key = `${r.brand_name}::${r.bucket_tag}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  // Per-group counts + descriptor frequency
  type PartialResult = Omit<SentimentAggResult, "unique_flags">;
  const partial: PartialResult[] = [];

  for (const [key, rows] of groups) {
    const [brand_name, bucket_tag] = key.split("::");
    let positive = 0, neutral = 0, negative = 0;
    const descriptorCounts = new Map<string, number>();

    for (const r of rows) {
      if (r.parse_error || !r.sentiment) continue;
      if (r.sentiment === "positive")      positive++;
      else if (r.sentiment === "neutral")  neutral++;
      else if (r.sentiment === "negative") negative++;

      for (const d of r.descriptors ?? []) {
        const norm = d.toLowerCase().trim();
        if (norm) descriptorCounts.set(norm, (descriptorCounts.get(norm) ?? 0) + 1);
      }
    }

    const top_descriptors = [...descriptorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([d]) => d);

    partial.push({
      brand_name,
      bucket_tag,
      positive_count: positive,
      neutral_count:  neutral,
      negative_count: negative,
      total_count:    positive + neutral + negative,
      top_descriptors,
      week_start:     weekStart,
    });
  }

  // Step 6 — uniqueness flags: a descriptor is unique if it does not appear
  // in any other brand's top 5 within the same bucket_tag.
  const bucketSets = new Map<string, Map<string, Set<string>>>();
  for (const r of partial) {
    if (!bucketSets.has(r.bucket_tag)) bucketSets.set(r.bucket_tag, new Map());
    bucketSets.get(r.bucket_tag)!.set(r.brand_name, new Set(r.top_descriptors));
  }

  return partial.map((r) => {
    const brandSets = bucketSets.get(r.bucket_tag)!;
    const othersDescriptors = new Set<string>();
    for (const [bn, descs] of brandSets) {
      if (bn !== r.brand_name) for (const d of descs) othersDescriptors.add(d);
    }
    const unique_flags = r.top_descriptors.map((d) => (othersDescriptors.has(d) ? "false" : "true"));
    return { ...r, unique_flags };
  });
}

// ── Drift detection ────────────────────────────────────────────────────────────

export interface PrevSentimentRow {
  brand_name:     string;
  bucket_tag:     string;
  positive_count: number;
  neutral_count:  number;
  negative_count: number;
  total_count:    number;
}

export interface DriftResult {
  brand_name:   string;
  bucket_tag:   string;
  week_start:   string;
  positive_pct: number;
  neutral_pct:  number;
  negative_pct: number;
  drift_flag:   boolean;
  drift_reason: string | null;
}

export function computeDrift(
  current: SentimentAggResult[],
  previous: PrevSentimentRow[],
): DriftResult[] {
  const prevMap = new Map<string, PrevSentimentRow>();
  for (const p of previous) prevMap.set(`${p.brand_name}::${p.bucket_tag}`, p);

  return current.map((curr) => {
    const t = curr.total_count;
    const positivePct = t > 0 ? (curr.positive_count / t) * 100 : 0;
    const neutralPct  = t > 0 ? (curr.neutral_count  / t) * 100 : 0;
    const negativePct = t > 0 ? (curr.negative_count / t) * 100 : 0;

    let drift_flag   = false;
    let drift_reason: string | null = null;

    const prev = prevMap.get(`${curr.brand_name}::${curr.bucket_tag}`);
    if (prev && prev.total_count > 0) {
      const prevPos = (prev.positive_count / prev.total_count) * 100;
      const prevNeg = (prev.negative_count / prev.total_count) * 100;
      const posDrop = prevPos - positivePct;
      const negRise = negativePct - prevNeg;

      if (posDrop > 10) {
        drift_flag   = true;
        drift_reason = `positive % dropped ${posDrop.toFixed(1)} points week on week`;
      } else if (negRise > 5) {
        drift_flag   = true;
        drift_reason = `negative % increased ${negRise.toFixed(1)} points week on week`;
      }
    }

    return {
      brand_name:   curr.brand_name,
      bucket_tag:   curr.bucket_tag,
      week_start:   curr.week_start,
      positive_pct: parseFloat(positivePct.toFixed(2)),
      neutral_pct:  parseFloat(neutralPct.toFixed(2)),
      negative_pct: parseFloat(negativePct.toFixed(2)),
      drift_flag,
      drift_reason,
    };
  });
}
