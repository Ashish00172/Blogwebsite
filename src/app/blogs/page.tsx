import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listBlogs, listCategories, listTags } from "@/features/blog/service";

export const dynamic = "force-dynamic";

interface BlogsPageProps {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    status?: string;
    sort?: string;
  }>;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const params = (await searchParams) ?? {};
  const [blogs, categories, tags] = await Promise.all([
    listBlogs({
      query: params.q,
      category: params.category,
      tag: params.tag,
      status: params.status,
      sort: params.sort === "oldest" ? "oldest" : "latest",
    }),
    listCategories(),
    listTags(),
  ]);

  const hasFilters = Boolean(params.q || params.category || params.tag || params.status || params.sort);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.1),_transparent_40%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white/85 px-6 py-6 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Content library</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Discover polished articles built for modern teams.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              A live collection of editorial pieces with category metadata, tags, and SEO-ready details.
            </p>
          </div>
          <Button asChild className="bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
            <Link href="/editor">Compose article</Link>
          </Button>
        </header>

        <form className="mt-6 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5" method="get">
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search title, content, or keyword"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500 md:col-span-2"
          />
          <select
            name="category"
            defaultValue={params.category ?? "all"}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="tag"
            defaultValue={params.tag ?? "all"}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
          >
            <option value="all">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.slug}>
                {tag.name}
              </option>
            ))}
          </select>
          <div className="flex gap-3 md:col-span-5">
            <select
              name="status"
              defaultValue={params.status ?? "all"}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            >
              <option value="all">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <select
              name="sort"
              defaultValue={params.sort ?? "latest"}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
            <Button type="submit" className="bg-cyan-600 px-5 text-white hover:bg-cyan-500">
              Filter
            </Button>
            {hasFilters ? (
              <Button asChild variant="outline" className="px-5">
                <Link href="/blogs">Reset</Link>
              </Button>
            ) : null}
          </div>
        </form>

        {blogs.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {blog.coverImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={blog.coverImage} alt={blog.title} className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  </>
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-700 px-6 text-center text-sm text-slate-100">
                    Add a cover image to make this card stand out.
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
                      {blog.category?.name ?? "Uncategorized"}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{blog.status.toLowerCase()}</span>
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-slate-950">{blog.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{blog.excerpt ?? blog.content.slice(0, 160)}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {blog.tags.slice(0, 4).map((tag) => (
                      <span key={tag.id} className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                    <p>By {blog.author.name ?? blog.author.email}</p>
                    <p>{formatDate(blog.createdAt)}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm text-slate-500">{blog.keywords ? blog.keywords : "No keywords yet"}</span>
                    <Link href={`/blogs/${blog.slug}`} className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline">
                      Open story
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-8 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">No posts found</h2>
            <p className="mt-3 text-slate-600">
              {hasFilters ? "Try adjusting your filters or search terms." : "Start with a draft in the editor and it will appear here automatically."}
            </p>
            <Button asChild className="mt-6 bg-cyan-600 text-white hover:bg-cyan-500">
              <Link href={hasFilters ? "/blogs" : "/editor"}>{hasFilters ? "Reset filters" : "Create your first article"}</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
