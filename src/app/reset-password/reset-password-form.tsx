"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/features/auth/actions";

interface ResetPasswordFormProps {
  token: string | null;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("This reset link is missing a token. Please request a new email.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPasswordAction({ token, ...form });
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PasswordInput label="New password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a new password" />
      <PasswordInput label="Confirm password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat the new password" />
      {error ? <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p> : null}
      <Button type="submit" disabled={isLoading || !token} className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
        {isLoading ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
