export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-slate-400">The route you requested could not be located.</p>
      </div>
    </main>
  );
}
