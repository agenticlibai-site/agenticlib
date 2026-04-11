"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { blogs } from "@/data/blogs";
import posthog from "posthog-js";

export default function BlogPost() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const blog = blogs.find((b) => b.slug === slug);

  useEffect(() => {
    if (blog) {
      posthog.capture("blog_post_viewed", {
        blog_slug: blog.slug,
        blog_title: blog.title,
      });
    }
  }, [blog]);

  if (!blog) {
    return <div className="p-10">Blog not found</div>;
  }

  return (
    <div className="page-bg min-h-screen px-6 py-20">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-semibold mb-4">
          {blog.title}
        </h1>

        <p className="text-sm text-zinc-400 mb-6">
          {blog.date} • {blog.read}
        </p>

        <img
          src={blog.image}
          alt={blog.title}
          className="w-full rounded-xl mb-6"
        />

        <div className="text-zinc-700 whitespace-pre-line leading-relaxed text-[17px]">
          {blog.content}
        </div>

      </div>
    </div>
  );
}