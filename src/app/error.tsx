"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur">
        <p className="text-sm uppercase tracking-[0.35em] text-rose-400">Error</p>
        <h1 className="mt-3 text-3xl font-semibold">Something went wrong</h1>
        <button onClick={() => reset()} className="mt-6 rounded-full bg-cyan-500 px-4 py-2 font-medium text-slate-950">
          Try again
        </button>
      </div>
    </main>
  );
}
