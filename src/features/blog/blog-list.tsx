import Link from "next/link";
import { listBlogs } from "./service";

interface BlogListProps {
  authorId?: string;
}

export async function BlogList({ authorId }: BlogListProps) {
  const blogs = await listBlogs(authorId ? { authorId } : {});

  return (
    <div className="space-y-4">
      {blogs.map((blog) => (
        <article key={blog.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">{blog.status}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{blog.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{blog.excerpt ?? "SEO-friendly blog content"}</p>
            </div>
            <Link href={`/blogs/${blog.slug}`} className="text-sm font-medium text-cyan-700">
              View
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
