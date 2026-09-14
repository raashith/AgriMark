'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!email.trim() && !phone.trim()) {
      setError('Enter an email or phone number.');
      return;
    }
    try {
      const user = await register({ full_name: fullName.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined, password, role });
      router.push(user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-white">Create your AgriMark account</h1>
        <p className="mt-2 text-sm text-gray-400">Start with a farmer or buyer account. Admin access is never self-registered.</p>
        {error && <div className="mt-5 rounded-xl border border-red-800/50 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-gray-300">Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-2 w-full rounded-xl border border-[#284235] bg-[#0a0f0d] px-4 py-3 text-white outline-none focus:border-emerald-500" /></label>
          <label className="block text-sm font-medium text-gray-300">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-[#284235] bg-[#0a0f0d] px-4 py-3 text-white outline-none focus:border-emerald-500" /></label>
          <label className="block text-sm font-medium text-gray-300">Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-xl border border-[#284235] bg-[#0a0f0d] px-4 py-3 text-white outline-none focus:border-emerald-500" /></label>
          <label className="block text-sm font-medium text-gray-300">Role<select value={role} onChange={(e) => setRole(e.target.value)} className="mt-2 w-full rounded-xl border border-[#284235] bg-[#0a0f0d] px-4 py-3 text-white"><option value="farmer">Farmer</option><option value="buyer">Buyer</option><option value="fpo">FPO</option><option value="logistics">Logistics</option><option value="service_provider">Service provider</option></select></label>
          <label className="block text-sm font-medium text-gray-300">Password<input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-2 w-full rounded-xl border border-[#284235] bg-[#0a0f0d] px-4 py-3 text-white outline-none focus:border-emerald-500" /></label>
          <button disabled={isLoading} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-60">{isLoading ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">Already registered? <Link className="text-emerald-400" href="/auth/login">Sign in</Link></p>
      </div>
    </div>
  );
}
