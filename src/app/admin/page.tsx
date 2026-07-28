import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteBlog } from "@/features/blog/actions";
import { listBlogs, listCategories, listTags, listUsers, getDashboardStats } from "@/features/blog/service";
import { createCategory, createTag, setBlogStatus, updateUserRole } from "@/features/admin/actions";
import { listLoginActivities } from "@/features/admin/audit";
import { getAuthSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
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

export default async function AdminPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [stats, blogs, users, categories, tags, loginActivities] = await Promise.all([
    getDashboardStats(),
    listBlogs(),
    listUsers(),
    listCategories(),
    listTags(),
    listLoginActivities(10),
  ]);

  const recentBlogs = blogs.slice(0, 8);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Admin console</p>
          <h1 className="mt-3 text-3xl font-semibold">Moderate content and manage platform operations</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Track content volume, manage categories and tags, review users, and approve or reject blog posts from one central workspace.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Total users", value: stats.totalUsers },
            { label: "Total blogs", value: stats.totalBlogs },
            { label: "Published", value: stats.publishedBlogs },
            { label: "Drafts", value: stats.draftBlogs },
            { label: "Categories", value: stats.categoriesCount },
            { label: "Tags", value: stats.tagsCount },
            { label: "Login records", value: stats.loginRecordsCount },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <form action={createCategory} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Category management</p>
            <h2 className="mt-2 text-2xl font-semibold">Create category</h2>
            <input
              name="name"
              placeholder="Strategy"
              className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <Button type="submit" className="mt-4 w-full bg-cyan-600 text-white hover:bg-cyan-500">
              Save category
            </Button>
          </form>

          <form action={createTag} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Tag management</p>
            <h2 className="mt-2 text-2xl font-semibold">Create tag</h2>
            <input
              name="name"
              placeholder="ai seo"
              className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <Button type="submit" className="mt-4 w-full bg-cyan-600 text-white hover:bg-cyan-500">
              Save tag
            </Button>
          </form>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Blog moderation</p>
                <h2 className="mt-2 text-2xl font-semibold">Recent posts</h2>
              </div>
              <Link href="/blogs" className="text-sm font-medium text-cyan-200 underline-offset-4 hover:underline">
                Open blog library
              </Link>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Post</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Author</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/40">
                  {recentBlogs.map((blog) => (
                    <tr key={blog.id}>
                      <td className="px-4 py-4 align-top">
                        <p className="font-medium text-white">{blog.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{blog.category?.name ?? "Uncategorized"}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(blog.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-200">
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300">{blog.author.name ?? blog.author.email}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <form action={setBlogStatus.bind(null, blog.id)} className="flex gap-2">
                            <select
                              name="status"
                              defaultValue={blog.status}
                              className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                            >
                              <option value="DRAFT">Draft</option>
                              <option value="PUBLISHED">Published</option>
                            </select>
                            <Button type="submit" size="sm" className="bg-cyan-600 text-white hover:bg-cyan-500">
                              Save
                            </Button>
                          </form>

                          {blog.authorId === session.user.id ? (
                            <div className="flex flex-wrap gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/editor/${blog.slug}`}>Edit</Link>
                              </Button>
                              <form action={deleteBlog.bind(null, blog.id, blog.slug, session.user.id)}>
                                <Button type="submit" size="sm" variant="ghost" className="text-rose-300 hover:bg-rose-500/10 hover:text-rose-200">
                                  Delete
                                </Button>
                              </form>
                            </div>
                          ) : (
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Owner only</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Private sheet</p>
              <h2 className="mt-2 text-2xl font-semibold">Login audit log</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                This sheet updates automatically when a user signs in. Passwords are not exposed; only the last password update time is shown.
              </p>

              <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Provider</th>
                      <th className="px-4 py-3 font-medium">Login time</th>
                      <th className="px-4 py-3 font-medium">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-slate-950/40">
                    {loginActivities.length > 0 ? (
                      loginActivities.map((activity) => (
                        <tr key={activity.id}>
                          <td className="px-4 py-4 align-top">
                            <p className="font-medium text-white">{activity.user?.name ?? activity.userName ?? "Unknown user"}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                              {activity.user?.username ?? "No username"}
                            </p>
                          </td>
                          <td className="px-4 py-4 align-top text-slate-300">{activity.user?.email ?? activity.userEmail}</td>
                          <td className="px-4 py-4 align-top text-slate-300">{activity.provider}</td>
                          <td className="px-4 py-4 align-top text-slate-300">{formatDateTime(activity.createdAt)}</td>
                          <td className="px-4 py-4 align-top text-slate-300">
                            {activity.user?.passwordUpdatedAt ? formatDateTime(activity.user.passwordUpdatedAt) : "Not set"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
                          No login records yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Users</p>
              <h2 className="mt-2 text-2xl font-semibold">User management</h2>

              <div className="mt-6 space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{user.name ?? user.username ?? user.email}</p>
                        <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                          Blogs {user._count.blogs} | Likes {user._count.likes} | Bookmarks {user._count.bookmarks}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                          Password {user.passwordUpdatedAt ? formatDateTime(user.passwordUpdatedAt) : "not set"}
                        </p>
                      </div>

                      <form action={updateUserRole.bind(null, user.id)}>
                        <select
                          name="role"
                          defaultValue={user.role}
                          className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <Button type="submit" size="sm" className="mt-2 w-full bg-cyan-600 text-white hover:bg-cyan-500">
                          Update
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Categories and tags</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div>
                  <h3 className="text-lg font-semibold text-white">Categories</h3>
                  <div className="mt-3 space-y-2">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                          <span>{category.name}</span>
                          <span>{category._count.blogs}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No categories yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white">Tags</h3>
                  <div className="mt-3 space-y-2">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <div key={tag.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
                          <span>{tag.name}</span>
                          <span>{tag._count.blogs}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No tags yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
