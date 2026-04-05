"use client";

import { useParams } from "next/navigation";
import { blogs } from "@/data/blogs";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug;

  const blog = blogs.find((b) => b.slug === slug);

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
          className="w-full rounded-xl mb-6"
        />

        <div className="text-zinc-700 whitespace-pre-line leading-relaxed">
          {blog.content}
        </div>

      </div>
    </div>
  );
}