import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/session";
import { listSavedBlogs } from "@/features/blog/service";
import { toggleBlogBookmark } from "@/features/blog/actions";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export default async function SavedBlogsPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/saved")}`);
  }

  const savedBlogs = await listSavedBlogs(session.user.id);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-600">Saved blogs</p>
          <h1 className="mt-3 text-4xl font-semibold">All posts you bookmarked</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Keep your important posts in one place and remove them whenever you no longer need them.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
              <Link href="/blogs">Browse blogs</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </section>

        {savedBlogs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {savedBlogs.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                {item.blog.coverImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.blog.coverImage} alt={item.blog.title} className="h-48 w-full object-cover" />
                  </>
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-700 px-6 text-center text-sm text-slate-100">
                    No cover image was added to this article.
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{item.blog.category?.name ?? "Uncategorized"}</span>
                    <span>Saved {formatDate(item.createdAt)}</span>
                  </div>

                  <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.blog.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.blog.excerpt ?? item.blog.metaDescription ?? item.blog.content.slice(0, 160)}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.blog.tags.slice(0, 4).map((tag: (typeof item.blog.tags)[number]) => (
                      <span key={tag.id} className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <Link href={`/blogs/${item.blog.slug}`} className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline">
                      Open story
                    </Link>
                    <form action={toggleBlogBookmark.bind(null, item.blog.id)}>
                      <Button type="submit" variant="outline" className="rounded-full">
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">No saved blogs yet</h2>
            <p className="mt-3 text-slate-600">Open any blog and use the save button to build your reading list.</p>
            <Button asChild className="mt-6 bg-slate-900 text-white hover:bg-slate-800">
              <Link href="/blogs">Find blogs to save</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
