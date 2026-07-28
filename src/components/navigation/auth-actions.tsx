import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/session";
import { LogoutButton } from "./logout-button";

export async function AuthActions() {
  const session = await getAuthSession();

  if (session) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" className="rounded-full px-4 text-slate-700 hover:bg-slate-100">
          <Link href="/saved">Saved</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full px-4 text-slate-700 hover:bg-slate-100">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild variant="ghost" className="rounded-full px-4 text-slate-700 hover:bg-slate-100">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800">
        <Link href="/signup">Sign up</Link>
      </Button>
    </div>
  );
}
