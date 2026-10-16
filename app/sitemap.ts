import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/demo`,                          lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/demo-video`,                    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/privacy`,                       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,                         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/disclaimer`,                    lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  return staticPages;
}
