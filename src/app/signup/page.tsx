"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { signupSchema } from "@/features/auth/schemas";
import { registerAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "", terms: false });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const parsed = signupSchema.safeParse({ ...form, terms: form.terms });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }

    setIsLoading(true);
    try {
      await registerAction(form);
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result?.ok) {
        setSuccess("Account created successfully. You can sign in now.");
        setTimeout(() => router.push("/login"), 900);
        return;
      }

      router.push(result.url ?? "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start publishing with a more disciplined, polished workflow." footerText="Already have an account?" footerHref="/login" footerLabel="Sign in">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400" placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400" placeholder="janedoe" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400" placeholder="you@example.com" />
        </div>
        <PasswordInput label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a strong password" />
        <PasswordInput label="Confirm password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat your password" />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character.
        </div>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" checked={form.terms} onChange={() => setForm({ ...form, terms: !form.terms })} className="mt-1 rounded border-slate-300 bg-white" />
          I agree to the terms and privacy policy.
        </label>
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {success ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
        <Button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white hover:bg-slate-800">
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
