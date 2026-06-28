import { sql } from "@vercel/postgres";
import { initSkincareDB, loadSkincareDenylist } from "./db";

// Prompt-to-use-case bucket mapping. IDs reference SKINCARE_PROMPTS in prompts.ts.
// low_prompt_coverage: true when only 1 prompt backs the bucket — display as a caveat
// badge in the UI (not buried in a footnote) since single-prompt buckets have high variance.
export const USE_CASE_BUCKETS = {
  "routine-audit":        { promptIds: [7, 8],   lowPromptCoverage: false },
  "personalized-routine": { promptIds: [9],       lowPromptCoverage: true  },
  "ingredient-analysis":  { promptIds: [10, 11], lowPromptCoverage: false  },
  "condition-specific":   { promptIds: [12],      lowPromptCoverage: true  },
  "tracking-progress":    { promptIds: [13],      lowPromptCoverage: true  },
} as const satisfies Record<string, { promptIds: number[]; lowPromptCoverage: boolean }>;

// Computes share of voice per brand within each use-case bucket across the window.
// share_pct = brand mentions in bucket / total mentions across all brands in bucket × 100.
// Aggregated across both models (model-agnostic share of voice).
// Safe to re-run: ON CONFLICT DO UPDATE replaces prior values cleanly.
export async function computeSkincareUseCaseSummary(windowStart: string, windowEnd: string): Promise<void> {
  await initSkincareDB();
  const denylist = await loadSkincareDenylist();

  for (const [bucketTag, bucket] of Object.entries(USE_CASE_BUCKETS)) {
    const promptIds = bucket.promptIds as number[];

    const rows = await sql`
      SELECT
        srcb.canonical_brand,
        COUNT(DISTINCT r.id)::int AS mention_count
      FROM skincare_response_canonical_brands srcb
      JOIN skincare_raw_responses r ON r.id = srcb.response_id
      WHERE r.date BETWEEN ${windowStart}::date AND ${windowEnd}::date
        AND r.prompt_id IN (SELECT * FROM UNNEST(${promptIds}::int[]))
      GROUP BY srcb.canonical_brand
      ORDER BY mention_count DESC
    `;

    const filtered = rows.rows.filter(
      (r) => !denylist.has((r.canonical_brand as string).toLowerCase()),
    );

    const totalBucketMentions = filtered.reduce((s, r) => s + (r.mention_count as number), 0);
    if (totalBucketMentions === 0) continue;

    for (const row of filtered) {
      const brand = row.canonical_brand as string;
      const mentionsInBucket = row.mention_count as number;
      const sharePct = Math.round((mentionsInBucket / totalBucketMentions) * 10000) / 100;

      await sql`
        INSERT INTO skincare_use_case_summary
          (window_start, window_end, bucket_tag, brand, mentions_in_bucket, total_bucket_mentions, share_pct, low_prompt_coverage)
        VALUES (
          ${windowStart}::date, ${windowEnd}::date, ${bucketTag}, ${brand},
          ${mentionsInBucket}, ${totalBucketMentions}, ${sharePct}, ${bucket.lowPromptCoverage}
        )
        ON CONFLICT (window_start, window_end, bucket_tag, brand) DO UPDATE SET
          mentions_in_bucket    = EXCLUDED.mentions_in_bucket,
          total_bucket_mentions = EXCLUDED.total_bucket_mentions,
          share_pct             = EXCLUDED.share_pct,
          low_prompt_coverage   = EXCLUDED.low_prompt_coverage,
          created_at            = NOW()
      `;
    }
  }
}
