import { notFound, redirect } from "next/navigation";
import { BlogForm } from "@/features/blog/blog-form";
import { getBlogBySlug } from "@/features/blog/service";
import { getAuthSession } from "@/lib/session";

interface EditBlogPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/editor/${slug}`)}`);
  }

  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  if (blog.authorId !== session.user.id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-600">Editor</p>
        <h1 className="mt-3 text-3xl font-semibold">Update article</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Refine the post title, content, metadata, tags, and image before republishing.
        </p>

        <div className="mt-8">
          <BlogForm
            mode="edit"
            authorId={session.user.id}
            blogId={blog.id}
            authorName={blog.author.name}
            initialValues={{
              title: blog.title,
              slug: blog.slug,
              content: blog.content,
              status: blog.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
              excerpt: blog.excerpt ?? "",
              metaTitle: blog.metaTitle ?? "",
              metaDescription: blog.metaDescription ?? "",
              keywords: blog.keywords ?? "",
              coverImage: blog.coverImage ?? "",
              canonicalUrl: blog.canonicalUrl ?? "",
              ogTitle: blog.ogTitle ?? "",
              ogDescription: blog.ogDescription ?? "",
              categoryName: blog.category?.name ?? "",
              tags: blog.tags.map((tag) => tag.name).join(", "),
            }}
          />
        </div>
      </div>
    </main>
  );
}
