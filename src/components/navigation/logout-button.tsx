"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      className="rounded-full px-4 text-slate-700 hover:bg-slate-100"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </Button>
  );
}
