"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerHref: string;
  footerLabel: string;
}

export function AuthShell({ title, subtitle, children, footerText, footerHref, footerLabel }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="w-full max-w-2xl rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Aurelia</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p>
          </div>
          {children}
          <div className="mt-8 text-center text-sm text-slate-600">
            {footerText}{" "}
            <Link href={footerHref} className="font-medium text-slate-900 underline-offset-4 transition hover:underline">
              {footerLabel}
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
