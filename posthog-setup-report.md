<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into AgenticLib. The following changes were made:

- **`instrumentation-client.ts`** (new) — Initializes PostHog client-side using the Next.js 15.3+ instrumentation hook, with session replay, exception capture, and reverse proxy support.
- **`lib/posthog-server.ts`** (new) — Singleton PostHog Node.js client for server-side event capture in API routes.
- **`next.config.ts`** (updated) — Added reverse proxy rewrites for PostHog ingestion (`/ingest/*`) and `skipTrailingSlashRedirect`.
- **`.env.local`** (updated) — Added `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`.
- **`app/page.tsx`** (updated) — Tracks `get_started_clicked`, `hero_cta_clicked`, `library_searched`, `domain_selected_from_dropdown`.
- **`app/domains/page.tsx`** (updated) — Converted to client component, tracks `domain_card_clicked`.
- **`app/domains/[slug]/page.tsx`** (updated) — Converted to client component, tracks `agent_link_clicked`.
- **`app/recommend/page.tsx`** (updated) — Tracks `recommendation_requested`; captures exceptions on API errors.
- **`app/api/recommend/route.ts`** (updated) — Server-side capture of `recommendation_received` with domain and agent count metadata.
- **`components/FeedbackBox.tsx`** (updated) — Tracks `feedback_submitted`; captures exceptions on send failure.
- **`app/api/feedback/route.ts`** (updated) — Server-side capture of `feedback_sent`.
- **`app/blog/page.tsx`** (updated) — Tracks `blog_post_clicked`.
- **`app/blog/[slug]/page.tsx`** (updated) — Tracks `blog_post_viewed` on mount via useEffect (external system sync).

| Event | Description | File |
|---|---|---|
| `get_started_clicked` | User clicks "Get started" navbar button | `app/page.tsx` |
| `hero_cta_clicked` | User clicks hero "Get personalised AI agent recommendations" CTA | `app/page.tsx` |
| `library_searched` | User submits a search query in the library | `app/page.tsx` |
| `domain_selected_from_dropdown` | User selects a domain from the library dropdown | `app/page.tsx` |
| `domain_card_clicked` | User clicks a domain card on the domains listing page | `app/domains/page.tsx` |
| `agent_link_clicked` | User clicks an agent to visit its official site | `app/domains/[slug]/page.tsx` |
| `recommendation_requested` | User submits a use case description for recommendations | `app/recommend/page.tsx` |
| `recommendation_received` | Server returns AI agent recommendations (with domain detected) | `app/api/recommend/route.ts` |
| `feedback_submitted` | User submits feedback on recommendations | `components/FeedbackBox.tsx` |
| `feedback_sent` | Server successfully sends feedback email | `app/api/feedback/route.ts` |
| `blog_post_clicked` | User clicks on a blog post card | `app/blog/page.tsx` |
| `blog_post_viewed` | User views a blog post (top of content funnel) | `app/blog/[slug]/page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/377445/dashboard/1454961
- **Recommendation Conversion Funnel** (hero CTA → recommendation → feedback): https://us.posthog.com/project/377445/insights/a5WDhefo
- **Key Actions Over Time** (CTA clicks, recommendations, feedback): https://us.posthog.com/project/377445/insights/cy6qGsNf
- **Top Domains & Agent Clicks by Domain** (broken down by domain_name): https://us.posthog.com/project/377445/insights/dZPmpery
- **Library Discovery Engagement** (searches, dropdown, domain cards): https://us.posthog.com/project/377445/insights/LMLKRv5L
- **Blog Engagement** (clicks vs views, weekly): https://us.posthog.com/project/377445/insights/V0SWmn15

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
