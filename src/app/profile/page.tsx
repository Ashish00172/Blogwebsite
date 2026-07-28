import { ProfileCard } from "@/features/profile/profile-card";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      title: true,
      location: true,
      website: true,
      bio: true,
      image: true,
      email: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-5xl">
        {profile ? <ProfileCard profile={profile} /> : <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">No profile found.</div>}
      </div>
    </main>
  );
}
