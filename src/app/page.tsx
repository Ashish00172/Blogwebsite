import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthActions } from "@/components/navigation/auth-actions";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getLatestPublishedBlog } from "@/features/blog/service";
import { toggleBlogBookmark } from "@/features/blog/actions";

const baseLinks = [
  {
    title: "Start drafting",
    description: "Open the editor and begin your next article.",
    href: "/editor",
  },
  {
    title: "View dashboard",
    description: "Check your recent content and publishing progress.",
    href: "/dashboard",
  },
  {
    title: "Update profile",
    description: "Refine your bio, expertise, and visibility settings.",
    href: "/profile",
  },
];

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export default async function HomePage() {
  const [session, latestBlog] = await Promise.all([getAuthSession(), getLatestPublishedBlog()]);

  const bookmarkedLatest =
    session && latestBlog
      ? await prisma.bookmark.findUnique({
          where: {
            userId_blogId: {
              userId: session.user.id,
              blogId: latestBlog.id,
            },
          },
        })
      : null;

  const quickLinks = session
    ? [
        ...baseLinks,
        {
          title: "Saved blogs",
          description: "Revisit the posts you bookmarked for later reading.",
          href: "/saved",
        },
      ]
    : baseLinks;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">A</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Aurelia</p>
              <p className="text-xs text-slate-500">SEO publishing platform</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link href="/blogs" className="transition hover:text-slate-900">
              Blogs
            </Link>
            <Link href="/dashboard" className="transition hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/profile" className="transition hover:text-slate-900">
              Profile
            </Link>
          </nav>
          <AuthActions />
        </header>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">Start here</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Write, publish, and manage your SEO content in one place.</h1>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                Create an account to unlock the editor, bookmark posts you want to keep, or sign in to continue where you left off.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800">
                Login
              </Link>
              <Link href="/signup" className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100">
                Sign up
              </Link>
              <Link href="/blogs" className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800">
                Browse blogs
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-600">Latest post</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Newest published blog</h2>
          </div>

          {latestBlog ? (
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="border-b border-slate-100 p-6 lg:border-b-0 lg:border-r">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{latestBlog.category?.name ?? "Uncategorized"}</span>
                  <span>{formatDate(latestBlog.createdAt)}</span>
                  <span>{latestBlog.status.toLowerCase()}</span>
                </div>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{latestBlog.title}</h3>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                  {latestBlog.excerpt ?? latestBlog.metaDescription ?? latestBlog.content.slice(0, 160)}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {latestBlog.tags.slice(0, 4).map((tag) => (
                    <span key={tag.id} className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {tag.name}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
                    <Link href={`/blogs/${latestBlog.slug}`}>Open story</Link>
                  </Button>

                  {session ? (
                    <form action={toggleBlogBookmark.bind(null, latestBlog.id)}>
                      <Button type="submit" variant="outline">
                        {bookmarkedLatest ? "Unsave post" : "Save post"}
                      </Button>
                    </form>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href={`/login?callbackUrl=${encodeURIComponent(`/blogs/${latestBlog.slug}`)}`}>Sign in to save</Link>
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-slate-950 p-6 text-slate-100">
                {latestBlog.coverImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={latestBlog.coverImage} alt={latestBlog.title} className="h-56 w-full rounded-3xl object-cover" />
                  </>
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-700 px-6 text-center text-sm text-slate-100">
                    No cover image was added to this article.
                  </div>
                )}

                <div className="mt-6 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-4">
                    <span className="uppercase tracking-[0.25em] text-slate-400">Author</span>
                    <span className="text-right text-slate-100">{latestBlog.author.name ?? latestBlog.author.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="uppercase tracking-[0.25em] text-slate-400">Likes</span>
                    <span className="text-slate-100">{latestBlog._count.likes}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="uppercase tracking-[0.25em] text-slate-400">Comments</span>
                    <span className="text-slate-100">{latestBlog._count.comments}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="uppercase tracking-[0.25em] text-slate-400">Saved</span>
                    <span className="text-slate-100">{latestBlog._count.bookmarks}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <h3 className="text-2xl font-semibold text-slate-950">No published blogs yet</h3>
              <p className="mt-3 text-slate-600">Once a blog is published, it will appear here automatically.</p>
              <Button asChild className="mt-6 bg-slate-900 text-white hover:bg-slate-800">
                <Link href="/editor">Create the first post</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.title} href={item.href} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
