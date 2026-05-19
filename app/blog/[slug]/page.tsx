import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogs } from "@/data/blogs";
import BlogPostClient from "./BlogPostClient";

export function generateStaticParams() {
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = blogs.find((b) => b.slug === slug);
  if (!blog) return {};

  return {
    title: `${blog.title} | AgenticLib Blog`,
    description: blog.description,
    alternates: { canonical: `https://agenticlib.com/blog/${slug}` },
    openGraph: {
      title: blog.title,
      description: blog.description,
      url: `https://agenticlib.com/blog/${slug}`,
      siteName: "AgenticLib",
      type: "article",
      images: blog.image ? [{ url: blog.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = blogs.find((b) => b.slug === slug);
  if (!blog) notFound();

  const related = blogs.filter((b) => b.slug !== slug).slice(0, 2);

  return <BlogPostClient blog={blog} related={related} />;
}
