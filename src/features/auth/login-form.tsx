"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await loginAction(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
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
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <Button type="submit" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
        Sign in
      </Button>
    </form>
  );
}
