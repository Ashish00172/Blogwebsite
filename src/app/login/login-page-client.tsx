"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { loginSchema } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { GitBranch, Mail } from "lucide-react";

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleOAuthSignIn(provider: "google" | "github") {
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn(provider, {
        callbackUrl,
      });

      if (result?.url) {
        window.location.href = result.url;
        return;
      }

      setError("Unable to start the social sign-in flow.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl,
      });

      if (!result?.ok) {
        setError(result?.error ?? "Invalid email or password");
        return;
      }

      window.location.href = result.url ?? "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue publishing with a calm, focused workspace." footerText="Need an account?" footerHref="/signup" footerLabel="Create one now">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400" placeholder="you@example.com" />
        </div>
        <PasswordInput label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" />
        <div className="flex items-center justify-between text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.rememberMe} onChange={() => setForm({ ...form, rememberMe: !form.rememberMe })} className="rounded border-slate-300 bg-white" />
            Remember me
          </label>
          <a href="/forgot-password" className="text-slate-900 underline-offset-4 hover:underline">Forgot password?</a>
        </div>
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <Button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white hover:bg-slate-800">
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail size={18} /> Continue with Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GitBranch size={18} /> Continue with GitHub
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
