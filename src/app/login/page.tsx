import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginPageClient } from "./login-page-client";

function LoginPageFallback() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue publishing with a calm, focused workspace." footerText="Need an account?" footerHref="/signup" footerLabel="Create one now">
      <div className="space-y-5" aria-busy="true" aria-live="polite">
        <div className="h-12 rounded-2xl bg-slate-100" />
        <div className="h-12 rounded-2xl bg-slate-100" />
        <div className="h-5 w-32 rounded-full bg-slate-100" />
        <div className="h-12 rounded-2xl bg-slate-100" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-12 rounded-2xl bg-slate-100" />
          <div className="h-12 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}
