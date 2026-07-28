"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { forgotPasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setResetUrl(null);
    setIsLoading(true);
    try {
      const result = await forgotPasswordAction({ email });
      setMessage(result.message);
      if ("resetUrl" in result && typeof result.resetUrl === "string") {
        setResetUrl(result.resetUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell title="Recover your account" subtitle="Enter your email and we’ll send a secure reset link." footerText="Remembered your password?" footerHref="/login" footerLabel="Sign in">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="you@example.com" />
        </div>
        {error ? <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p> : null}
        {resetUrl ? (
          <p className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            Dev reset link:{" "}
            <Link href={resetUrl} className="font-medium underline underline-offset-4">
              open password reset page
            </Link>
          </p>
        ) : null}
        <Button type="submit" disabled={isLoading} className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
