import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardShell() {
  const cards = [
    { title: "Create article", href: "/editor", description: "Start drafting with SEO scaffolding and AI-assisted metadata." },
    { title: "Browse blogs", href: "/blogs", description: "View the published content library and open article previews." },
    { title: "Manage profile", href: "/profile", description: "Update your profile, bio, and account preferences." },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <Link key={card.title} href={card.href} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
          <p className="mt-3 text-sm text-slate-600">{card.description}</p>
          <Button className="mt-6 bg-cyan-600 text-white hover:bg-cyan-500">Open</Button>
        </Link>
      ))}
    </div>
  );
}
