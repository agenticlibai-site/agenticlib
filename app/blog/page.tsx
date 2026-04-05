import { blogs } from "@/data/blogs";
import { useRouter } from "next/navigation";

const router = useRouter();

{blogs.map((blog) => (
  <div
    key={blog.slug}
    onClick={() => router.push(`/blog/${blog.slug}`)}
    className="glass-card flex flex-col md:flex-row overflow-hidden rounded-2xl cursor-pointer hover:shadow-lg transition"
  >
    <img
      src={blog.image}
      className="w-full md:w-1/2 h-56 object-cover"
    />

    <div className="p-6">
      <p className="text-xs text-zinc-400 mb-2">
        {blog.date} • {blog.read}
      </p>

      <h2 className="text-xl font-semibold mb-2">
        {blog.title}
      </h2>
    </div>
  </div>
))}