'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const user = await login({ phone_or_email: identifier.trim(), password });
      router.push(user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-400">Sign in to your AgriMark account.</p>
        {error && <div className="mt-5 rounded-xl border border-red-800/50 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Phone or email
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="mt-2 w-full rounded-xl border border-[#284235] bg-[#0a0f0d] px-4 py-3 text-white outline-none focus:border-emerald-500" />
          </label>
          <label className="block text-sm font-medium text-gray-300">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-2 w-full rounded-xl border border-[#284235] bg-[#0a0f0d] px-4 py-3 text-white outline-none focus:border-emerald-500" />
          </label>
          <button disabled={isLoading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-60">{isLoading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">New to AgriMark? <Link className="text-emerald-400" href="/auth/register">Create an account</Link></p>
      </div>
    </div>
  );
}
