"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { blogs, Blog } from "@/data/blogs";

const CATEGORY_COLORS: Record<string, string> = {
  "AI Agents": "bg-violet-100 text-violet-700 border-violet-200",
  Industry: "bg-pink-100 text-pink-700 border-pink-200",
  Guide: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Comparison: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
};

function categoryClass(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
}

function BlogCarousel({ items, onNavigate }: { items: Blog[]; onNavigate: (slug: string, title: string) => void }) {
  return (
    <div className="relative">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10
                      bg-gradient-to-r from-white/60 to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10
                      bg-gradient-to-l from-white/60 to-transparent" />

      <div className="overflow-x-auto hide-scrollbar scroll-smooth -mx-2 px-2">
        <div className="flex gap-5 pb-2">
          {items.map((blog) => (
            <div
              key={blog.slug}
              onClick={() => onNavigate(blog.slug, blog.title)}
              className="group cursor-pointer glass-card rounded-2xl overflow-hidden flex-shrink-0 w-[300px] flex flex-col
                         hover:-translate-y-1 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative h-44 overflow-hidden flex-shrink-0">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  sizes="300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${categoryClass(blog.category)}`}>
                  {blog.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-zinc-400 mb-2">{blog.date} · {blog.read}</p>
                <h3 className="text-sm font-semibold text-zinc-900 leading-snug mb-2 flex-1
                               group-hover:text-violet-700 transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-4">
                  {blog.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100/80">
                  <AuthorChip name={blog.author} size="sm" />
                  <span className="text-xs font-medium text-violet-500 group-hover:translate-x-0.5 transition-transform inline-block">
                    Read →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const router = useRouter();

  const navigate = (slug: string, title: string) => {
    posthog.capture("blog_post_clicked", { blog_slug: slug, blog_title: title });
    router.push(`/blog/${slug}`);
  };

  return (
    <div className="min-h-screen page-bg">

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full"
          style={{ background: "rgba(147,197,253,0.22)", filter: "blur(80px)" }}
        />
        <div
          className="absolute -top-32 -right-48 w-[560px] h-[560px] rounded-full"
          style={{ background: "rgba(167,139,250,0.20)", filter: "blur(80px)" }}
        />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3 pointer-events-auto">
        <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 shadow-sm rounded-xl px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="AgenticLib" width={120} height={24} className="h-6 w-auto" />
            <span className="text-lg font-semibold tracking-tight">AgenticLib</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition">
              ← Home
            </Link>
            <a
              href="https://chatgpt.com/g/g-69795c1eeb808191beea0005fdc16126-agenticlib-decision-engine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-full hover:opacity-90 transition"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/60 border border-white/40 text-zinc-600 text-xs px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              The AgenticLib Blog
            </div>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 mb-4">
              Insights on{" "}
              <span className="gradient-text">AI Agents</span>
            </h1>
            <p className="text-lg text-zinc-500 max-w-lg mx-auto leading-relaxed">
              Expert guides, industry analysis, and news from the world of AI agents and automation.
            </p>
          </div>

          {/* Latest Insights carousel */}
          <div className="mb-16">
            <SectionLabel>Latest Insights</SectionLabel>
            <BlogCarousel items={blogs} onNavigate={navigate} />
          </div>

          {/* Everyday, Made Easier series carousel */}
          {(() => {
            const series = blogs.filter((b) => b.series === "everyday-made-easier");
            if (!series.length) return null;
            return (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-fuchsia-600">
                    Series
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-fuchsia-200 to-transparent" />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 mb-6">
                  Everyday, Made{" "}
                  <span className="gradient-text">Easier with AI Agents</span>
                </h2>
                <BlogCarousel items={series} onNavigate={navigate} />
              </div>
            );
          })()}

          {/* All Articles grid */}
          <div>
            <SectionLabel>All Articles</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <div
                  key={blog.slug}
                  onClick={() => navigate(blog.slug, blog.title)}
                  className="group cursor-pointer glass-card rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden flex-shrink-0">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryClass(blog.category)}`}>
                      {blog.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-zinc-400 mb-2">{blog.date} · {blog.read}</p>
                    <h3 className="text-base font-semibold text-zinc-900 leading-snug mb-2 group-hover:text-violet-700 transition-colors flex-1">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-4 line-clamp-2">
                      {blog.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100/80">
                      <AuthorChip name={blog.author} size="sm" />
                      <span className="text-xs font-medium text-violet-500 group-hover:translate-x-0.5 transition-transform inline-block">
                        Read →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="relative z-10 py-10 text-center text-sm text-zinc-400 border-t border-white/30">
        © 2026 AgenticLib
      </footer>

    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-xs font-semibold uppercase tracking-widest text-violet-600">
        {children}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-violet-200 to-transparent" />
    </div>
  );
}

function AuthorChip({
  name,
  role,
  size = "md",
}: {
  name: string;
  role?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold flex-shrink-0 ${
          size === "sm" ? "w-5 h-5 text-[9px]" : "w-7 h-7 text-xs"
        }`}
      >
        A
      </div>
      <div>
        <p className={`font-medium text-zinc-700 ${size === "sm" ? "text-[11px]" : "text-xs"}`}>
          {name}
        </p>
        {role && <p className="text-[10px] text-zinc-400">{role}</p>}
      </div>
    </div>
  );
}
