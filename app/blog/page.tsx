"use client";

import { blogs } from "@/data/blogs";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

export default function BlogPage() {
  const router = useRouter();

  return (
    <div className="page-bg min-h-screen px-6 py-20">

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-semibold mb-3">AgenticLib Blogs</h1>
        <p className="text-zinc-500">

        </p>
      </div>

      {/* Blog Cards */}
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {blogs.map((blog) => (
          <div
            key={blog.slug}
            onClick={() => {
              posthog.capture("blog_post_clicked", {
                blog_slug: blog.slug,
                blog_title: blog.title,
              });
              router.push(`/blog/${blog.slug}`);
            }}
            className="glass-card flex flex-col md:flex-row overflow-hidden rounded-2xl cursor-pointer hover:shadow-lg transition"
          >
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full md:w-1/2 h-56 object-cover"
            />

            <div className="p-6">
              <p className="text-xs text-zinc-400 mb-2">
                {blog.date} • {blog.read}
              </p>

              <h2 className="text-xl font-semibold mb-2">
                {blog.title}
              </h2>

              <p className="text-sm text-blue-600 mt-3 font-medium">
                Read more →
              </p>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}