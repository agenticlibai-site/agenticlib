"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";
import { blogs } from "@/data/blogs";

// ─── Content parser ──────────────────────────────────────────────────────────

type H2Block        = { type: "h2";       text: string };
type NumberedBlock  = { type: "numbered"; n: string; lead: string; rest: string };
type ParagraphBlock = { type: "p";        text: string };
type ListBlock      = { type: "ul";       items: string[] };
type ContentBlock   = H2Block | NumberedBlock | ParagraphBlock | ListBlock;

function classifyText(text: string, out: ContentBlock[]) {
  // Numbered: "1. Lead — rest"  or  "1. Lead: rest"
  const num = text.match(/^(\d+)\.\s+([\s\S]+)/);
  if (num) {
    const [, n, body] = num;
    const dashIdx  = body.indexOf(" — ");
    const colonIdx = body.indexOf(": ");
    if (dashIdx > 0 && dashIdx < 60) {
      out.push({ type: "numbered", n, lead: body.slice(0, dashIdx).trim(), rest: body.slice(dashIdx + 3).trim() });
    } else if (colonIdx > 0 && colonIdx < 50) {
      out.push({ type: "numbered", n, lead: body.slice(0, colonIdx).trim(), rest: body.slice(colonIdx + 2).trim() });
    } else {
      out.push({ type: "numbered", n, lead: body.trim(), rest: "" });
    }
    return;
  }

  // Single short line with no terminal punctuation → section heading
  const singleLine = !text.includes("\n");
  if (singleLine && text.length <= 90 && !/[.!?,]$/.test(text)) {
    out.push({ type: "h2", text });
    return;
  }

  out.push({ type: "p", text });
}

function parseContent(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const sections = raw.trim().split(/\n\n+/);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    let pendingText = "";
    const listItems: string[] = [];

    const flushText = () => {
      if (pendingText.trim()) classifyText(pendingText.trim(), blocks);
      pendingText = "";
    };

    const flushList = () => {
      if (listItems.length) {
        blocks.push({ type: "ul", items: [...listItems] });
        listItems.length = 0;
      }
    };

    for (const line of lines) {
      if (line.startsWith("- ")) {
        flushText();
        listItems.push(line.slice(2).trim());
      } else {
        flushList();
        pendingText += (pendingText ? "\n" : "") + line;
      }
    }

    flushText();
    flushList();
  }

  return blocks;
}

// ─── URL linkifier ────────────────────────────────────────────────────────────

const URL_RE = /(https?:\/\/[^\s]+)/g;

function Linkified({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) =>
        URL_RE.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// ─── BlogContent renderer ─────────────────────────────────────────────────────

function BlogContent({ content }: { content: string }) {
  const blocks = parseContent(content);

  return (
    <div className="blog-content">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i}>{block.text}</h2>
            );

          case "numbered": {
            const longRest = block.rest.length > 90;
            return (
              <div key={i} className="flex gap-4 mt-7 first:mt-0">
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500
                             text-white text-xs font-bold flex items-center justify-center mt-0.5"
                >
                  {block.n}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 leading-snug">
                    {block.lead}
                    {block.rest && !longRest && (
                      <span className="font-normal text-zinc-500"> — {block.rest}</span>
                    )}
                  </p>
                  {block.rest && longRest && (
                    <p className="mt-1 text-zinc-600 leading-relaxed">
                      {block.rest.split("\n").map((line, j, arr) => (
                        <span key={j}>
                          <Linkified text={line} />
                          {j < arr.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          case "p":
            return (
              <p key={i}>
                {block.text.split("\n").map((line, j, arr) => (
                  <span key={j}>
                    <Linkified text={line} />
                    {j < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            );

          case "ul":
            return (
              <ul key={i} className="mt-4 space-y-2 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-zinc-600 leading-relaxed">
                    <span className="flex-shrink-0 mt-[0.6em] w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <span>
                      <Linkified text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  "AI Agents": "bg-violet-100 text-violet-700 border-violet-200",
  Industry:    "bg-pink-100 text-pink-700 border-pink-200",
  Guide:       "bg-indigo-100 text-indigo-700 border-indigo-200",
  Comparison:  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
};
const catClass = (c: string) =>
  CATEGORY_COLORS[c] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPost() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const blog     = blogs.find((b) => b.slug === slug);
  const related  = blogs.filter((b) => b.slug !== slug).slice(0, 2);

  useEffect(() => {
    if (blog) posthog.capture("blog_post_viewed", { blog_slug: blog.slug, blog_title: blog.title });
  }, [blog]);

  if (!blog) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Blog post not found.</p>
          <Link href="/blog" className="text-violet-600 hover:underline text-sm">← Back to blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full"
          style={{ background: "rgba(147,197,253,0.22)", filter: "blur(80px)" }} />
        <div className="absolute -top-32 -right-48 w-[560px] h-[560px] rounded-full"
          style={{ background: "rgba(167,139,250,0.20)", filter: "blur(80px)" }} />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3 pointer-events-auto">
        <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 shadow-sm rounded-xl px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="AgenticLib" width={120} height={24} className="h-6 w-auto" />
            <span className="text-lg font-semibold tracking-tight">AgenticLib</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm text-zinc-500 hover:text-zinc-900 transition">
              ← All articles
            </Link>
            <a
              href="https://chatgpt.com/g/g-69795c1eeb808191beea0005fdc16126-agenticlib-decision-engine"
              target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-full hover:opacity-90 transition"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Hero image */}
      <div className="relative w-full h-[460px]">
        <Image src={blog.image} alt={blog.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.58) 100%)" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.38) 0%, rgba(236,72,153,0.16) 100%)" }} />
      </div>

      {/* Floating article header card */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 -mt-36">
        <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10
                        shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${catClass(blog.category)}`}>
              {blog.category}
            </span>
            <span className="text-xs text-zinc-400">{blog.date} · {blog.read}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 leading-tight mb-4 tracking-tight">
            {blog.title}
          </h1>
          <p className="text-zinc-500 leading-relaxed mb-6">{blog.description}</p>

          <div className="flex items-center gap-3 pt-5 border-t border-zinc-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500
                            flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800">{blog.author}</p>
              <p className="text-xs text-zinc-400">{blog.authorRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-8 md:p-14 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <BlogContent content={blog.content} />
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-violet-600">Related Articles</span>
              <div className="flex-1 h-px bg-gradient-to-r from-violet-200 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {related.map((rel) => (
                <div
                  key={rel.slug}
                  onClick={() => {
                    posthog.capture("related_blog_clicked", { blog_slug: rel.slug });
                    router.push(`/blog/${rel.slug}`);
                  }}
                  className="group cursor-pointer glass-card rounded-2xl overflow-hidden flex gap-4 p-3
                             hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={rel.image} alt={rel.title} fill sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide mb-1">
                      {rel.category}
                    </span>
                    <p className="text-sm font-semibold text-zinc-800 leading-snug
                                  group-hover:text-violet-700 transition-colors line-clamp-2">
                      {rel.title}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">{rel.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/blog" className="text-sm text-violet-600 hover:text-violet-800 transition font-medium">
            ← Back to all articles
          </Link>
        </div>
      </div>

      <footer className="relative z-10 py-10 text-center text-sm text-zinc-400 border-t border-white/30">
        © 2026 AgenticLib
      </footer>

    </div>
  );
}
