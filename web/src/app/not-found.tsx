'use client';

import Link from 'next/link';
import { Home, LogIn, Sprout } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-[#1e2d26] bg-[#121a16] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-800/50 bg-emerald-950/60 text-emerald-400">
          <Sprout className="h-8 w-8" />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400">AgriMark</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
          This page does not exist in the current production web application. Use the main dashboard or sign in again.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500">
            <Home className="h-4 w-4" /> Go home
          </Link>
          <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1e2d26] bg-[#0a0f0d] px-5 py-3 text-sm font-bold text-gray-200 transition hover:bg-[#121a16]">
            <LogIn className="h-4 w-4" /> Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
