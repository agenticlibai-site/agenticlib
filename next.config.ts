import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // /domains (orphaned listing) → /explore (the actual discovery page)
      { source: "/domains", destination: "/explore", permanent: true },
      // /domains/[slug] (client-only, no SEO) → /domain/[slug] (SSG, full metadata)
      { source: "/domains/:slug", destination: "/domain/:slug", permanent: true },
      // Blog removed: send old blog links to the homepage
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug", destination: "/", permanent: true },
      // Old AgenticLib client report pages: send old links to the homepage
      ...["dexify", "hsai", "sdai", "ralfi", "esai", "sales", "skincare", "brand"].flatMap((c) => [
        { source: `/product/${c}-visibility`, destination: "/", permanent: true },
        { source: `/product/${c}-visibility/:path*`, destination: "/", permanent: true },
      ]),
      { source: "/product/backstory-report", destination: "/", permanent: true },
      { source: "/product/seamless-report", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;