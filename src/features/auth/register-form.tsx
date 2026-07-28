"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerAction } from "./actions";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", terms: true });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await registerAction(form);
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result?.ok) {
        router.push("/login");
        return;
      }

      router.push(result.url ?? "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
      <input
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
        placeholder="Full name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <input
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
        placeholder="Confirm password"
        type="password"
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
      />
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={form.terms}
          onChange={(e) => setForm({ ...form, terms: e.target.checked })}
          className="rounded border-white/10 bg-slate-950/60"
        />
        I agree to the terms and conditions
      </label>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <Button type="submit" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
        Create account
      </Button>
    </form>
  );
}
