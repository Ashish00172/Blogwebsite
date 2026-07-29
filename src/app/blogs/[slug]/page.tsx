import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addBlogComment, deleteBlog, toggleBlogBookmark, toggleBlogLike, toggleBlogSubscription } from "@/features/blog/actions";
import { getBlogBySlug, type BlogComment } from "@/features/blog/service";
import { getAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Bookmark, Heart, MessageSquareText, UserPlus } from "lucide-react";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog not found",
    };
  }

  return {
    title: blog.metaTitle ?? blog.title,
    description: blog.metaDescription ?? blog.excerpt ?? blog.content.slice(0, 160),
    openGraph: {
      title: blog.ogTitle ?? blog.metaTitle ?? blog.title,
      description: blog.ogDescription ?? blog.metaDescription ?? blog.excerpt ?? blog.content.slice(0, 160),
      images: blog.coverImage ? [blog.coverImage] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [blog, session] = await Promise.all([getBlogBySlug(slug), getAuthSession()]);

  if (!blog) {
    notFound();
  }

  const viewerId = session?.user.id;
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/blogs/${slug}`)}`;
  const [viewerLike, viewerSubscription, viewerBookmark, subscriberCount] = viewerId
    ? await Promise.all([
        prisma.like.findUnique({
          where: {
            userId_blogId: {
              userId: viewerId,
              blogId: blog.id,
            },
          },
        }),
        prisma.bookmark.findUnique({
          where: {
            userId_blogId: {
              userId: viewerId,
              blogId: blog.id,
            },
          },
        }),
        viewerId === blog.authorId
          ? Promise.resolve(null)
          : prisma.subscription.findUnique({
              where: {
                subscriberId_authorId: {
                  subscriberId: viewerId,
                  authorId: blog.authorId,
                },
              },
            }),
        prisma.subscription.count({
          where: {
            authorId: blog.authorId,
          },
        }),
      ])
    : [null, null, null, await prisma.subscription.count({ where: { authorId: blog.authorId } })];

  const isOwner = viewerId === blog.authorId;
  const canLike = Boolean(viewerId);
  const canSave = Boolean(viewerId);
  const canSubscribe = Boolean(viewerId) && !isOwner;
  const likeLabel = viewerLike ? "Unlike" : "Like";
  const subscribeLabel = viewerSubscription ? "Unsubscribe" : "Subscribe";
  const bookmarkLabel = viewerBookmark ? "Unsave" : "Save";
  const paragraphs: string[] = blog.content.split(/\n+/);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          {blog.coverImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={blog.coverImage} alt={blog.title} className="h-72 w-full object-cover" />
            </>
          ) : (
            <div className="flex h-72 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-700 px-6 text-center text-sm text-slate-100">
              No cover image was added to this article.
            </div>
          )}

          <div className="p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{blog.category?.name ?? "Uncategorized"}</span>
              <span>{blog.status.toLowerCase()}</span>
              <span>{formatDate(blog.createdAt)}</span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{blog.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{blog.excerpt ?? blog.metaDescription ?? blog.content.slice(0, 160)}</p>

            <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Author</p>
                <p className="mt-2 text-slate-900">{blog.author.name ?? blog.author.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Meta title</p>
                <p className="mt-2 text-slate-900">{blog.metaTitle ?? blog.title}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Keywords</p>
                <p className="mt-2 text-slate-900">{blog.keywords ?? "None added"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Canonical URL</p>
                <p className="mt-2 break-all text-slate-900">{blog.canonicalUrl ?? "Not set"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Open Graph</p>
                <p className="mt-2 text-slate-900">{blog.ogTitle ?? blog.metaTitle ?? blog.title}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {blog.tags.length > 0 ? blog.tags.map((tag: (typeof blog.tags)[number]) => (
                    <span key={tag.id} className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700">
                      {tag.name}
                    </span>
                  )) : <span className="text-slate-900">No tags added</span>}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-700">
                  {blog._count.likes} likes
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-700">
                  {blog._count.comments} comments
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-700">
                  {blog._count.bookmarks} saved
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-700">
                  {subscriberCount} subscribers
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {canLike ? (
                  <form action={toggleBlogLike.bind(null, blog.id)}>
                    <Button type="submit" variant="outline" className="rounded-full px-4">
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">{likeLabel}</span>
                    </Button>
                  </form>
                ) : (
                  <Button asChild variant="outline" className="rounded-full px-4">
                    <Link href={loginUrl}>
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">Like</span>
                    </Link>
                  </Button>
                )}

                {canSave ? (
                  <form action={toggleBlogBookmark.bind(null, blog.id)}>
                    <Button type="submit" variant="outline" className="rounded-full px-4">
                      <Bookmark className="h-4 w-4" />
                      <span className="hidden sm:inline">{bookmarkLabel}</span>
                    </Button>
                  </form>
                ) : (
                  <Button asChild variant="outline" className="rounded-full px-4">
                    <Link href={loginUrl}>
                      <Bookmark className="h-4 w-4" />
                      <span className="hidden sm:inline">Save</span>
                    </Link>
                  </Button>
                )}

                {canSubscribe ? (
                  <form action={toggleBlogSubscription.bind(null, blog.authorId, blog.slug)}>
                    <Button type="submit" className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800">
                      <UserPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">{subscribeLabel}</span>
                    </Button>
                  </form>
                ) : null}
              </div>
            </div>

            <div className="mt-10 space-y-6 text-base leading-8 text-slate-700">
              {paragraphs.map((paragraph: string, index: number) => (
                <p key={`${blog.id}-${index}`} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-12 border-t border-slate-200 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Discussion</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Comments</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-700">
                  {blog.comments.length} total
                </span>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                {session ? (
                  <form action={addBlogComment.bind(null, blog.id)} className="space-y-3">
                    <label className="text-sm font-medium text-slate-700" htmlFor="comment">
                      Leave a comment
                    </label>
                    <textarea
                      id="comment"
                      name="content"
                      required
                      minLength={1}
                      maxLength={1000}
                      placeholder="Share a useful thought, question, or feedback..."
                      className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                    <Button type="submit" className="rounded-full bg-cyan-600 px-4 text-white hover:bg-cyan-500">
                      <MessageSquareText className="h-4 w-4" />
                      Post comment
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">Sign in to like, comment, and subscribe to this author.</p>
                    <Button asChild className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800">
                      <Link href={loginUrl}>
                        <MessageSquareText className="h-4 w-4" />
                        Sign in
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {blog.comments.length > 0 ? (
                  blog.comments.map((comment: BlogComment) => (
                    <article key={comment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{comment.user.name ?? comment.user.username ?? "Anonymous"}</p>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            {comment.user.username ? `@${comment.user.username}` : "Reader"}
                          </p>
                        </div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{formatDateTime(comment.createdAt)}</p>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{comment.content}</p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                    No comments yet. Be the first to start the discussion.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <Link href="/blogs" className="text-sm font-medium text-cyan-700 underline-offset-4 hover:underline">
                {"<- Back to blogs"}
              </Link>
              <div className="flex flex-wrap gap-3">
                {isOwner ? (
                  <>
                    <Button asChild variant="outline">
                      <Link href={`/editor/${blog.slug}`}>Edit article</Link>
                    </Button>
                    <form action={deleteBlog.bind(null, blog.id, blog.slug, viewerId ?? "")}>
                      <Button type="submit" variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                        Delete article
                      </Button>
                    </form>
                  </>
                ) : null}
                <Link href="/editor" className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline">
                  Create another post
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
