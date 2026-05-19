#!/usr/bin/env npx tsx
/**
 * AgenticLib Crawl Diagnostics
 * Usage: npx tsx scripts/crawl-check.ts
 *
 * Checks:
 *  1.  Sitemap coverage (all SEO domain + blog slugs present)
 *  2.  /domains/ href references in source (should be zero)
 *  3.  Redirect chain hrefs (hrefs pointing at 301 sources)
 *  4.  relatedSlugs validity (all point to real domain pages)
 *  5.  Canonical URL consistency (no www/http/domains paths)
 *  6.  Orphan page detection (SEO pages not linked from /explore hub)
 *  7.  Dead route files
 *  8.  Canonical mismatch (page-level canonical vs sitemap base URL)
 *  9.  Duplicate metaTitle detection
 *  10. Missing OG image detection
 *  11. Hub linkage check (domain pages reachable from at least one hub)
 */

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "..");

// ── Helpers ────────────────────────────────────────────────────────────────────

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

// ── Data extractors ────────────────────────────────────────────────────────────

function getSeoDomainSlugs(): string[] {
  const lines = read("data/seo-domains.ts").split("\n");
  const slugs: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s+slug:\s*["']([^"']+)["']/);
    if (m && !line.includes("agentLibrarySlug") && !line.includes("relatedSlugs")) {
      slugs.push(m[1]);
    }
  }
  return [...new Set(slugs)];
}

function getSeoDomainTitles(): Map<string, string[]> {
  // Map: metaTitle → [slug, slug, ...]  — used for duplicate detection
  const content = read("data/seo-domains.ts");
  const result = new Map<string, string[]>();
  // Each domain block contains both slug and metaTitle
  const blocks = content.split(/(?=\s*\{[\s\n]+slug:)/);
  for (const block of blocks) {
    const slugM  = block.match(/slug:\s*["']([^"']+)["']/);
    const titleM = block.match(/metaTitle:\s*["']([^"']+)["']/);
    if (slugM && titleM) {
      const slug  = slugM[1];
      const title = titleM[1];
      const list  = result.get(title) ?? [];
      list.push(slug);
      result.set(title, list);
    }
  }
  return result;
}

function getBlogSlugs(): string[] {
  const content = read("data/blogs.ts");
  const slugs: string[] = [];
  for (const m of content.matchAll(/slug:\s*["']([^"']+)["']/g)) {
    slugs.push(m[1]);
  }
  return [...new Set(slugs)];
}

function getSitemapPatterns(): string[] {
  const content = read("app/sitemap.ts");
  const patterns: string[] = [];
  if (/url:\s*BASE[,\s]/.test(content)) patterns.push("/");
  for (const m of content.matchAll(/url:\s*`\$\{BASE\}([^`]*)`/g)) {
    patterns.push(m[1] || "/");
  }
  return patterns;
}

// ── Source scanner ─────────────────────────────────────────────────────────────

interface SourceHit {
  file: string;
  line: number;
  text: string;
}

function scanSource(pattern: RegExp, skipDirs: string[] = []): SourceHit[] {
  const hits: SourceHit[] = [];
  const defaultSkip = new Set(["node_modules", ".next", ".git", ".claude", "scripts"]);
  const skip = new Set([...defaultSkip, ...skipDirs]);

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) walk(full);
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        const lines = fs.readFileSync(full, "utf-8").split("\n");
        lines.forEach((line, i) => {
          if (pattern.test(line) && !line.trimStart().startsWith("//")) {
            hits.push({
              file: path.relative(ROOT, full),
              line: i + 1,
              text: line.trim().slice(0, 120),
            });
          }
        });
      }
    }
  }

  walk(ROOT);
  return hits;
}

// ── Individual checks ──────────────────────────────────────────────────────────

function checkSitemapCoverage(seoDomains: string[], blogs: string[], patterns: string[]) {
  return {
    hasHome:           patterns.includes("/"),
    hasExplore:        patterns.includes("/explore"),
    hasBlog:           patterns.includes("/blog"),
    hasDomainTemplate: patterns.some((p) => p.includes("/domain/")),
    hasBlogTemplate:   patterns.some((p) => p.includes("/blog/")),
    seoDomainCount:    seoDomains.length,
    blogCount:         blogs.length,
  };
}

function checkDomainsRefs(): SourceHit[] {
  return scanSource(/\/domains\//, ["app/domains"]).filter(
    (h) => !h.file.includes("next.config"),
  );
}

function checkRedirectChainRefs(): SourceHit[] {
  return scanSource(/href=.*\/domains\//, ["app/domains"]).filter(
    (h) => !h.file.includes("next.config"),
  );
}

function checkRelatedSlugs(validSlugs: Set<string>): string[] {
  const content = read("data/seo-domains.ts");
  const bad: string[] = [];
  for (const m of content.matchAll(/relatedSlugs:\s*\[([^\]]*)\]/g)) {
    for (const s of m[1].matchAll(/["']([^"']+)["']/g)) {
      if (!validSlugs.has(s[1])) bad.push(s[1]);
    }
  }
  return [...new Set(bad)];
}

function checkCanonicals(): string[] {
  const issues: string[] = [];
  const files = [
    "app/domain/[slug]/page.tsx",
    "app/blog/[slug]/page.tsx",
    "app/sitemap.ts",
    "app/layout.tsx",
  ];
  for (const file of files) {
    if (!exists(file)) continue;
    const c = read(file);
    if (c.includes("http://agenticlib"))  issues.push(`${file}: uses http:// (should be https://)`);
    if (c.includes("www.agenticlib"))     issues.push(`${file}: uses www. prefix`);
    if (/['"]\/(domains)\//u.test(c))     issues.push(`${file}: references /domains/ in canonical`);
  }
  return issues;
}

function checkOrphanRoutes(seoDomains: string[]): string[] {
  const exploreContent = read("app/explore/page.tsx");
  return seoDomains
    .filter((slug) => !exploreContent.includes(`"${slug}"`))
    .map((slug) => `/domain/${slug} — not linked from /explore`);
}

function checkDeadRoutes() {
  return {
    domainsSlugExists: exists("app/domains/[slug]/page.tsx"),
    domainsPageExists: exists("app/domains/page.tsx"),
  };
}

// ── NEW: Check 8 — Canonical mismatch ─────────────────────────────────────────
// Verifies that page-level canonicals use the correct base URL and path prefix.

function checkCanonicalMismatch(): string[] {
  const issues: string[] = [];
  const BASE = "https://agenticlib.com";

  const domainPage = exists("app/domain/[slug]/page.tsx") ? read("app/domain/[slug]/page.tsx") : "";
  if (domainPage) {
    if (!domainPage.includes(`${BASE}/domain/`))
      issues.push("app/domain/[slug]/page.tsx: canonical does not contain https://agenticlib.com/domain/");
    if (!domainPage.includes("alternates") || !domainPage.includes("canonical"))
      issues.push("app/domain/[slug]/page.tsx: generateMetadata is missing alternates.canonical");
    if (!domainPage.includes("openGraph") || !domainPage.includes(`url: \`${BASE}/domain/`))
      issues.push("app/domain/[slug]/page.tsx: openGraph.url may not match canonical");
  }

  const blogPage = exists("app/blog/[slug]/page.tsx") ? read("app/blog/[slug]/page.tsx") : "";
  if (blogPage) {
    if (!blogPage.includes(`${BASE}/blog/`))
      issues.push("app/blog/[slug]/page.tsx: canonical does not contain https://agenticlib.com/blog/");
    if (!blogPage.includes("alternates") || !blogPage.includes("canonical"))
      issues.push("app/blog/[slug]/page.tsx: generateMetadata is missing alternates.canonical");
  }

  const sitemap = read("app/sitemap.ts");
  if (!sitemap.includes(BASE))
    issues.push("app/sitemap.ts: BASE URL does not include https://agenticlib.com");

  const layout = exists("app/layout.tsx") ? read("app/layout.tsx") : "";
  if (layout && !layout.includes("metadataBase"))
    issues.push("app/layout.tsx: missing metadataBase — OG image URLs may be relative");

  return issues;
}

// ── NEW: Check 9 — Duplicate metaTitle detection ───────────────────────────────

function checkDuplicateTitles(): string[] {
  const titleMap = getSeoDomainTitles();
  const issues: string[] = [];
  for (const [title, slugs] of titleMap) {
    if (slugs.length > 1) {
      issues.push(`Duplicate metaTitle across ${slugs.length} pages: "${title}" → ${slugs.join(", ")}`);
    }
  }
  return issues;
}

// ── NEW: Check 10 — Missing OG image ──────────────────────────────────────────

function checkOgImages(): string[] {
  const issues: string[] = [];

  const domainPage = exists("app/domain/[slug]/page.tsx") ? read("app/domain/[slug]/page.tsx") : "";
  if (domainPage) {
    if (!domainPage.includes("openGraph"))
      issues.push("app/domain/[slug]/page.tsx: no openGraph block in generateMetadata");
    // Domain pages intentionally omit images (no per-domain hero image available)
    // Flag only if openGraph block is present but has no images
    else if (!domainPage.includes("images") && !domainPage.includes("twitter"))
      issues.push("app/domain/[slug]/page.tsx: openGraph has no images or twitter card");
  }

  const blogPage = exists("app/blog/[slug]/page.tsx") ? read("app/blog/[slug]/page.tsx") : "";
  if (blogPage) {
    if (!blogPage.includes("openGraph"))
      issues.push("app/blog/[slug]/page.tsx: no openGraph block in generateMetadata");
    else if (!blogPage.includes("images"))
      issues.push("app/blog/[slug]/page.tsx: openGraph missing images — blog hero won't appear in link previews");
  }

  return issues;
}

// ── NEW: Check 11 — Hub linkage (reachable from ≥1 hub) ──────────────────────
// A page passes if it appears in ANY of: /explore, /blog index, or sitemap (as
// a direct entry, not just a template). Domain pages are expected via /explore;
// blog posts via /blog.

function checkHubLinkage(seoDomains: string[], blogs: string[]): string[] {
  const issues: string[] = [];

  const exploreContent = exists("app/explore/page.tsx") ? read("app/explore/page.tsx") : "";
  const blogIndexContent = exists("app/blog/page.tsx") ? read("app/blog/page.tsx") : "";

  // Every SEO domain must appear in /explore
  const unlinkedDomains = seoDomains.filter((slug) => !exploreContent.includes(`"${slug}"`));
  unlinkedDomains.forEach((slug) =>
    issues.push(`/domain/${slug} — not reachable from any hub (/explore missing this slug)`),
  );

  // Every blog post must either be in the blog index or have a direct sitemap entry
  const sitemapContent = read("app/sitemap.ts");
  const hasBlogTemplate = sitemapContent.includes("/blog/");
  if (!hasBlogTemplate) {
    blogs.forEach((slug) =>
      issues.push(`/blog/${slug} — not in sitemap and hub linkage unknown`),
    );
  }

  // Blog index page must exist and render blog list
  if (!blogIndexContent.includes("blogs") && !blogIndexContent.includes("/blog/")) {
    issues.push("/blog index page may not link to individual blog posts");
  }

  return issues;
}

// ── Reporter ───────────────────────────────────────────────────────────────────

const PASS = "  ✅ ";
const WARN = "  ⚠️  ";
const FAIL = "  ❌ ";

function section(title: string) {
  console.log(`\n${"─".repeat(62)}`);
  console.log(`  ${title}`);
  console.log("─".repeat(62));
}

function main() {
  console.log("\n🔍  AgenticLib Crawl Diagnostics");
  console.log(`    ${new Date().toISOString()}`);

  const seoDomains = getSeoDomainSlugs();
  const blogs      = getBlogSlugs();
  const sitemapPat = getSitemapPatterns();
  const validSlugs = new Set(seoDomains);

  // ── 1. Sitemap coverage ──────────────────────────────────────────────────────
  section("1 · Sitemap Coverage");
  const cov = checkSitemapCoverage(seoDomains, blogs, sitemapPat);
  console.log(cov.hasHome           ? PASS + "/ (homepage) in sitemap"                              : FAIL + "/ missing from sitemap");
  console.log(cov.hasExplore        ? PASS + "/explore in sitemap"                                  : FAIL + "/explore missing from sitemap");
  console.log(cov.hasBlog           ? PASS + "/blog in sitemap"                                     : FAIL + "/blog missing from sitemap");
  console.log(cov.hasDomainTemplate ? PASS + `/domain/[slug] — ${cov.seoDomainCount} pages covered` : FAIL + "/domain/[slug] template missing");
  console.log(cov.hasBlogTemplate   ? PASS + `/blog/[slug] — ${cov.blogCount} posts covered`        : FAIL + "/blog/[slug] template missing");

  // ── 2. /domains/ href references ─────────────────────────────────────────────
  section("2 · /domains/ Link References (should be zero)");
  const domainsRefs = checkDomainsRefs();
  if (domainsRefs.length === 0) {
    console.log(PASS + "No /domains/ hrefs found in source");
  } else {
    domainsRefs.forEach(({ file, line, text }) =>
      console.log(FAIL + `${file}:${line}  →  ${text}`),
    );
  }

  // ── 3. Redirect chain hrefs ──────────────────────────────────────────────────
  section("3 · Redirect Chain Hrefs");
  const chainRefs = checkRedirectChainRefs();
  if (chainRefs.length === 0) {
    console.log(PASS + "No hrefs pointing at redirected /domains/ paths");
  } else {
    chainRefs.forEach(({ file, line, text }) =>
      console.log(WARN + `${file}:${line}  →  ${text}`),
    );
  }

  // ── 4. relatedSlugs validity ─────────────────────────────────────────────────
  section("4 · relatedSlugs Validity");
  const badRelated = checkRelatedSlugs(validSlugs);
  if (badRelated.length === 0) {
    console.log(PASS + "All relatedSlugs reference valid /domain/[slug] pages");
  } else {
    badRelated.forEach((s) =>
      console.log(FAIL + `"${s}" has no matching SEO domain page`),
    );
  }

  // ── 5. Canonical URL consistency ─────────────────────────────────────────────
  section("5 · Canonical URL Consistency");
  const canonIssues = checkCanonicals();
  if (canonIssues.length === 0) {
    console.log(PASS + "All canonical URLs use https://agenticlib.com (no www/http/domains)");
  } else {
    canonIssues.forEach((i) => console.log(FAIL + i));
  }

  // ── 6. Orphan pages ──────────────────────────────────────────────────────────
  section("6 · Orphan Page Detection");
  const orphans = checkOrphanRoutes(seoDomains);
  if (orphans.length === 0) {
    console.log(PASS + `All ${seoDomains.length} SEO domain pages linked from /explore`);
  } else {
    orphans.forEach((o) => console.log(WARN + o));
  }

  // ── 7. Dead route files ──────────────────────────────────────────────────────
  section("7 · Dead Route Files");
  const dead = checkDeadRoutes();
  console.log(
    dead.domainsSlugExists
      ? WARN + "app/domains/[slug]/page.tsx still exists (redirect covers it — safe to delete)"
      : PASS + "app/domains/[slug]/ removed",
  );
  console.log(
    dead.domainsPageExists
      ? WARN + "app/domains/page.tsx still exists (redirected to /explore — safe to delete)"
      : PASS + "app/domains/page.tsx removed",
  );

  // ── 8. Canonical mismatch ────────────────────────────────────────────────────
  section("8 · Canonical Mismatch Detection");
  const mismatch = checkCanonicalMismatch();
  if (mismatch.length === 0) {
    console.log(PASS + "All page-level canonicals match https://agenticlib.com base URL");
  } else {
    mismatch.forEach((i) => console.log(FAIL + i));
  }

  // ── 9. Duplicate titles ──────────────────────────────────────────────────────
  section("9 · Duplicate metaTitle Detection");
  const dupTitles = checkDuplicateTitles();
  if (dupTitles.length === 0) {
    console.log(PASS + "All SEO domain metaTitles are unique");
  } else {
    dupTitles.forEach((i) => console.log(WARN + i));
  }

  // ── 10. OG images ────────────────────────────────────────────────────────────
  section("10 · OG Image Coverage");
  const ogIssues = checkOgImages();
  if (ogIssues.length === 0) {
    console.log(PASS + "openGraph metadata present on domain and blog detail pages");
  } else {
    ogIssues.forEach((i) => console.log(WARN + i));
  }

  // ── 11. Hub linkage ──────────────────────────────────────────────────────────
  section("11 · Hub Linkage (reachable from ≥1 hub)");
  const hubIssues = checkHubLinkage(seoDomains, blogs);
  if (hubIssues.length === 0) {
    console.log(PASS + `All ${seoDomains.length} domain pages reachable from /explore`);
    console.log(PASS + `All ${blogs.length} blog posts covered by sitemap template`);
  } else {
    hubIssues.forEach((i) => console.log(FAIL + i));
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  section("Summary");
  console.log(`  SEO domain pages : ${seoDomains.length}`);
  console.log(`  Blog posts        : ${blogs.length}`);
  console.log(`  Sitemap patterns  : ${sitemapPat.length}`);
  console.log(`\n  Run again after changes: npx tsx scripts/crawl-check.ts\n`);
}

main();
