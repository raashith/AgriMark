'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, LogIn } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-[#1e2d26] bg-[#121a16] p-8 text-center shadow-2xl flex flex-col items-center">
        <Image
          src="/images/agrimark-logo.png"
          alt="AgriMark"
          width={64}
          height={64}
          priority
          className="mx-auto mb-4 w-16 h-16 object-contain"
        />
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
