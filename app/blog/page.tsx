"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { blogs, Blog } from "@/data/blogs";

// AgenticLib brand palette for cards
const CARD_GRADIENTS = [
  "linear-gradient(135deg, #2D1B69 0%, #5B3CC8 100%)",
  "linear-gradient(135deg, #1E1458 0%, #4C2EA8 100%)",
  "linear-gradient(135deg, #3B1E7A 0%, #7C3AED 100%)",
  "linear-gradient(135deg, #1A1040 0%, #5B3CC8 80%, #9333EA 100%)",
  "linear-gradient(135deg, #2A1060 0%, #6C4CF1 100%)",
];

function cardGradient(i: number) {
  return CARD_GRADIENTS[i % CARD_GRADIENTS.length];
}

const ALL_CATEGORIES = ["All Posts", ...Array.from(new Set(blogs.map((b) => b.category)))];

export default function BlogPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [search, setSearch] = useState("");

  const navigate = (slug: string, title: string) => {
    trackEvent("blog_post_clicked", { blog_slug: slug, blog_title: title });
    router.push(`/blog/${slug}`);
  };

  const featured = [...blogs].reverse()[0];

  const filtered = [...blogs].reverse().filter((b) => {
    const matchCat = activeCategory === "All Posts" || b.category === activeCategory;
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div
      className="min-h-screen page-gap-fix"
      style={{ background: "#F9F8FF" }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ background: "#F9F8FF", paddingTop: 64, paddingBottom: 48, textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "var(--font-schibsted), system-ui, sans-serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#0A0618",
            marginBottom: 14,
            lineHeight: 1.1,
          }}
        >
          Our Blog
        </h1>
        <p style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", fontSize: 15, color: "#5B4E8A", maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
          Product updates, research notes, and practical writing about building
          production software with AI agents.
        </p>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ── Featured post ─────────────────────────────────────────── */}
        <div
          onClick={() => navigate(featured.slug, featured.title)}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
            borderRadius: 16,
            overflow: "hidden",
            cursor: "pointer",
            marginBottom: 56,
            boxShadow: "0 4px 24px rgba(80,40,180,0.13)",
          }}
          className="featured-post"
        >
          {/* Left: image card */}
          <div style={{ position: "relative", minHeight: 260, background: cardGradient(0) }}>
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              sizes="540px"
              style={{ objectFit: "cover", opacity: 0.22, mixBlendMode: "luminosity" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: cardGradient(0),
              opacity: 0.82,
            }} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              justifyContent: "flex-end", padding: "28px 32px",
            }}>
              <TagPill label={featured.category} />
            </div>
          </div>

          {/* Right: text */}
          <div style={{
            background: "white",
            padding: "36px 40px",
            display: "flex", flexDirection: "column", justifyContent: "center",
            borderLeft: "1px solid #EDE9FF",
          }}>
            <h2 style={{
              fontFamily: "var(--font-schibsted), system-ui, sans-serif",
              fontSize: "clamp(1.1rem, 2.2vw, 1.45rem)",
              fontWeight: 900,
              color: "#0A0618",
              lineHeight: 1.25,
              marginBottom: 14,
              letterSpacing: "-0.03em",
            }}>
              {featured.title}
            </h2>
            <p style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", fontSize: 13.5, color: "#5B4E8A", lineHeight: 1.65, marginBottom: 20 }}>
              {featured.description}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <TagPill label={featured.category} dark />
              <span style={{ fontSize: 12, color: "#9585C8" }}>{featured.read}</span>
            </div>
            <button
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#F0EEFF",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#6C4CF1",
              }}
            >
              <ArrowIcon />
            </button>
          </div>
        </div>

        {/* ── Recent posts ─────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", fontSize: "1.45rem", fontWeight: 900, color: "#0A0618", letterSpacing: "-0.03em" }}>
            Recent blog posts
          </h2>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg
              width="14" height="14" viewBox="0 0 16 16" fill="none"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9585C8", pointerEvents: "none" }}
            >
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search by title or tag"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                fontSize: 13, border: "1px solid #DDD9F5", borderRadius: 8,
                background: "white", color: "#0A0618", outline: "none",
                width: 200, fontFamily: "var(--font-schibsted), system-ui, sans-serif",
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 32 }}>

          {/* Category sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 2 }}>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  textAlign: "left",
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "var(--font-schibsted), system-ui, sans-serif",
                  fontWeight: activeCategory === cat ? 700 : 500,
                  color: activeCategory === cat ? "#6C4CF1" : "#5B4E8A",
                  background: activeCategory === cat ? "#EDE9FF" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Card grid */}
          {filtered.length === 0 ? (
            <div style={{ color: "#9585C8", fontSize: 14, paddingTop: 32 }}>No posts match your search.</div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 20,
            }}>
              {filtered.map((blog, i) => (
                <BlogCard key={blog.slug} blog={blog} index={i} onNavigate={navigate} />
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @media (max-width: 700px) {
          .featured-post { grid-template-columns: 1fr !important; }
          .featured-post > div:first-child { min-height: 180px !important; }
        }
      `}</style>
    </div>
  );
}

function BlogCard({
  blog,
  index,
  onNavigate,
}: {
  blog: Blog;
  index: number;
  onNavigate: (slug: string, title: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onNavigate(blog.slug, blog.title)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 8px 32px rgba(80,40,180,0.18)"
          : "0 2px 12px rgba(80,40,180,0.09)",
        transform: hovered ? "translateY(-3px)" : "none",
        transition: "all 0.22s ease",
      }}
    >
      {/* Card background: gradient + image overlay */}
      <div style={{ position: "relative", height: 200, background: cardGradient(index) }}>
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          style={{ objectFit: "cover", opacity: 0.18, mixBlendMode: "luminosity" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: cardGradient(index),
          opacity: 0.78,
        }} />
        {/* Content on card */}
        <div style={{
          position: "absolute", inset: 0,
          padding: "20px 22px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <TagPill label={blog.category} />
          <div>
            <h3 style={{
              fontFamily: "var(--font-schibsted), system-ui, sans-serif",
              fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)",
              fontWeight: 900,
              color: "white",
              lineHeight: 1.25,
              letterSpacing: "-0.03em",
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
              marginBottom: 14,
            }}>
              {blog.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-schibsted), system-ui, sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.7)" }}>
                {blog.date}
              </span>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white",
              }}>
                <ArrowIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TagPill({ label, dark }: { label: string; dark?: boolean }) {
  const base: React.CSSProperties = {
    fontFamily: "var(--font-schibsted), system-ui, sans-serif",
    fontSize: 11, fontWeight: 700,
    padding: "3px 10px", borderRadius: 999,
    display: "inline-block",
    letterSpacing: "0.01em",
  };
  if (dark) {
    return <span style={{ ...base, background: "#EDE9FF", color: "#6C4CF1" }}>{label}</span>;
  }
  return (
    <span style={{
      ...base,
      background: "rgba(255,255,255,0.18)",
      backdropFilter: "blur(8px)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.25)",
    }}>
      ✦ {label}
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
