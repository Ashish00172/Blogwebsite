import { RegisterForm } from "@/features/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.25),_transparent_40%),linear-gradient(135deg,_#020617,_#111827)] px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-slate-950/60 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Create account</p>
        <h1 className="mt-3 text-3xl font-semibold">Join the AI SEO publishing workspace</h1>
        <p className="mt-3 text-slate-400">Register to publish, manage, and optimize your content pipeline.</p>
        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
