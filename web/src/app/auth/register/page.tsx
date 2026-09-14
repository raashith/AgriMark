'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { UserRole } from '@/types';
import Link from 'next/link';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'admin') {
      setError('Self-registration as admin is prohibited.');
      return;
    }

    setLoading(true);

    try {
      const user = await register({
        email,
        password,
        full_name: fullName,
        role,
        location,
        phone_number: phoneNumber,
      });

      if (user.role === 'farmer') {
        router.push('/farmer/dashboard');
      } else if (user.role === 'buyer') {
        router.push('/buyer/marketplace');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-[#121a16] border border-[#1e2d26] rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-full mb-3 text-emerald-400">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-100">{t('register')}</h1>
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
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">{t('selectRole')}</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'farmer', label: t('farmer') },
              { id: 'buyer', label: t('buyer') },
              { id: 'fpo', label: t('fpo') },
              { id: 'logistics', label: t('logistics') },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRole(item.id as UserRole)}
                className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-between transition ${
                  role === item.id
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-[#0a0f0d] border-[#1e2d26] text-gray-400 hover:border-gray-700'
                }`}
              >
                <span>{item.label}</span>
                {role === item.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">{t('fullName')}</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Ramachandran"
            />
          </div>

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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">{t('location')}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Dindigul, Tamil Nadu"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">{t('phoneNumber')}</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              placeholder="+91 9876543210"
            />
          </div>
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
          {loading ? t('loading') : t('register')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        <span>Already have an account? </span>
        <Link href="/auth/login" className="text-emerald-400 hover:underline font-semibold">
          {t('login')}
        </Link>
      </div>
    </div>
  );
}
