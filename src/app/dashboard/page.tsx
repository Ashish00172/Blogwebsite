import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { BlogList } from "@/features/blog/blog-list";
import { getAuthSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-600">AI SEO Workspace</p>
          <h1 className="mt-2 text-4xl font-semibold">Creator dashboard</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Manage content, profile details, and publishing workflows from a single interface.
          </p>
        </div>

        <DashboardShell />

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Recent blogs</h2>
          <div className="mt-6">
            <BlogList authorId={session.user.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
