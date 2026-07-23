# Pipeline Status

Running log of feature/sentiment clusters mid-rewrite or on a checkpoint clock.
Update this file whenever a cluster is rewritten, deployed, or checkpointed.
Do not derive state from conversation history — this file is the source of truth.

---

## Active Checkpoints

| Pipeline | Component | Day-0 | 3-day check | 5-7 day trust | Status |
|---|---|---|---|---|---|
| Marketing | Sentiment — claude + gpt (limitations field) | 2026-07-09 | ~2026-07-12 | 2026-07-14 to 07-16 | collecting |
| Sales | Sentiment — claude + gpt (limitations field) | 2026-07-08/09 | ~2026-07-11 to 07-12 | 2026-07-13 to 07-15 | collecting; claude now on GitHub Actions |
| Marketing | Feature scoring — 6 rewritten clusters | 2026-07-10 | 2026-07-13 | 2026-07-15 to 07-17 | collecting |
| Marketing | Feature scoring — cost cluster | — | — | — | unchanged; already usable |
| Sales | Feature scoring — sales-call (4 new sub-features) | 2026-07-10 | 2026-07-13 | 2026-07-15 to 07-17 | collecting |
| Sales | Feature scoring — sales-outreach, responsible-ai, technical, cost | — | — | — | unchanged; validated, already usable |
| Sales | Feature scoring — sales-pipeline | not yet | — | — | **flagged**: ceiling problem (~50% of brands at 90); not yet rewritten |

### 3-day distribution check query (due 2026-07-13, sales-call + marketing features)

```sql
-- Sales-call: confirm differentiation across 4 new sub-features
SELECT
  feature_id,
  ROUND(AVG(score)::numeric, 1)               AS avg_score,
  ROUND(STDDEV(score)::numeric, 1)            AS stddev,
  COUNT(*) FILTER (WHERE score >= 90)         AS at_ceiling,
  COUNT(*)                                    AS total
FROM feature_scores
WHERE feature_tag = 'sales-call'
  AND scored_at::date >= '2026-07-10'
GROUP BY feature_id ORDER BY feature_id;

-- Marketing features: same check across all 6 rewritten clusters
SELECT
  feature_tag,
  ROUND(AVG(score)::numeric, 1)               AS avg_score,
  ROUND(STDDEV(score)::numeric, 1)            AS stddev,
  COUNT(*) FILTER (WHERE score >= 90)         AS at_ceiling,
  COUNT(*)                                    AS total
FROM feature_scores
WHERE scored_at::date >= '2026-07-10'
GROUP BY feature_tag ORDER BY feature_tag;
```

Flag any feature/tag where `at_ceiling / total > 0.50` — needs further narrowing.

---

## Known Infra Facts

| Fact | Detail | Since |
|---|---|---|
| Sales-sentiment claude trigger | Moved from Vercel cron to **GitHub Actions** (`.github/workflows/sales-sentiment-claude.yml`) due to persistent Vercel non-invocation on the 11:00 UTC slot (missed 6 of 7 days). GPT sales-sentiment remains on Vercel at 15:00 UTC. | 2026-07-10 |
| Marketing feature-scoring claude schedule | Moved from **06:00 → 08:30 UTC** to avoid race condition against the 02:00 UTC brand-intelligence cron, which was only partially populating `locked_marketing_agents` by 06:00 (10/23 brands on 07-09; 20-22 on prior days). | 2026-07-10 |
| CRON_SECRET | Rotated on 2026-07-10. GitHub Actions secret updated to match. Vercel auto-redeployed on rotation. | 2026-07-10 |
| Claude API credits | Ran low around 2026-07-09, causing a wave of missed claude-model crons that week (all tasks returning `succeeded: 0, failed: N` with HTTP 400 "credit balance too low"). Credits topped up 2026-07-10; all claude pipelines confirmed working. | resolved 2026-07-10 |
| Watchdog coverage | 5:45 UTC watchdog checks yesterday's claude sentiment rows and triggers recovery via `after()` if count = 0. 16:00 UTC watchdog checks today's GPT sentiment rows. Both remain active as backup regardless of GitHub Actions. | 2026-07-10 |

---

## Retired Feature IDs (sales-call, as of 2026-07-10)

These IDs exist in `feature_responses` for dates ≤ 2026-07-09 but collect no new data:

| Retired ID | Replaced by |
|---|---|
| `call_recording_analysis` | `call_transcription_timestamps`, `call_talk_time_analytics` |
| `call_coaching_automation` | `call_coaching_scorecard`, `call_competitor_objection_detection` |

---

## Sales Feature Scores — LOCKED (as of 2026-07-23)

**`sales_feature_scores` is intentionally frozen.** Do not re-enable the writer
crons without reading the root-cause section below.

### Crons paused (removed from vercel.json, confirmed via `vercel cron ls` 2026-07-23)

- `/api/cron/sales-feature-collection?model=gpt-4o-mini&half=1` (was 9:00 UTC daily)
- `/api/cron/sales-feature-collection?model=gpt-4o-mini&half=2` (was 9:15 UTC daily)
- `/api/cron/sales-feature-aggregate` (was 10:00 UTC daily)

### Root cause

`sales-feature-aggregate` queries `WHERE run_date = today` and blindly upserts into
`sales_feature_scores` (singleton: one row per brand+feature, always overwritten).

When Claude Haiku stopped collecting after 2026-07-13, the July 22 aggregate ran
with only GPT-4o-mini responses. Single-model scoring is more conservative — GPT
evidence containing hedging phrases (`"may"`, `"might"`, `"typically"`) downgrades
confidence by one level. Scores that were 90 (strong, dual-model) silently dropped
to 35–60 across ~86 rows.

### ⚠️ Required fix before re-enabling

Replace `WHERE run_date = today` in `getSalesFeatureResponsesForScoring()` with a
fixed date window, e.g. `WHERE run_date BETWEEN '2026-07-06' AND '2026-07-12'`.
Without this, the same silent degradation will recur whenever one model's daily
collection is thin or absent.

### Fix history (2026-07-23)

| Script | What it did |
|--------|-------------|
| `scripts/restore-scores-july6-12.ts` | Bulk re-scored all brand+feature combos from July 6–12 responses. Fixed Clari/pipeline_forecasting (60→90) but damaged ~86 rows where Claude was conservative in that early window. |
| `scripts/fix-call-features-july22.ts` | Targeted fix for 3 new call features (call_coaching_scorecard, call_competitor_objection_detection, call_talk_time_analytics) — re-scored from July 22 data. |
| `scripts/revert-to-july22.ts` | Created but **NOT run**. Would have reverted everything to the July 22 GPT-only state. |
| `scripts/sweep-and-fix-conservative-scores.ts` | Full sweep of all 182 restore-script rows. Fixed 86 where July 22 scored higher (Claude conservative pattern); left 96 dual-model rows untouched; skipped 8 retired features with no July 22 data. |

### Final verified state (all 194 rows correct as of 2026-07-23)

| scored_at | Rows | Source |
|-----------|------|--------|
| `2026-07-22 10:05:48` | 98 | July 22 GPT data (fixed from conservative July 6-12 Claude) |
| `2026-07-23 04:46:xx` | 96 | July 6-12 dual-model data (correctly untouched) |
