import { BlogForm } from "@/features/blog/blog-form";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const author = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-600">Blog Composer</p>
          <h1 className="mt-3 text-3xl font-semibold">Create your next SEO article</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Draft content, attach categories, shape metadata, and publish with confidence from a single workspace.
          </p>

          {author ? (
            <div className="mt-6 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm text-cyan-800">
              Writing as {author.name ?? "the current author"}
            </div>
          ) : null}

          <div className="mt-8">
            <BlogForm authorId={author?.id ?? session.user.id} authorName={author?.name} />
          </div>
        </div>
      </div>
    </main>
  );
}
