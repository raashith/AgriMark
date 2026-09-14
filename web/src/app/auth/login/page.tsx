'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role === 'farmer') {
        router.push('/farmer/dashboard');
      } else if (user.role === 'buyer') {
        router.push('/buyer/marketplace');
      } else if (user.role === 'logistics') {
        router.push('/logistics/deliveries');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-[#121a16] border border-[#1e2d26] rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-full mb-3 text-emerald-400">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-100">{t('login')}</h1>
        <p className="text-sm text-gray-400 mt-1">{t('tagline')}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">{t('email')}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
            placeholder="farmer@agrimark.org"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">{t('password')}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
        >
          {loading ? t('loading') : t('login')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        <span>Don&apos;t have an account? </span>
        <Link href="/auth/register" className="text-emerald-400 hover:underline font-semibold">
          {t('register')}
        </Link>
      </div>
    </div>
  );
}
