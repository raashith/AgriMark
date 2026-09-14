'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { UserRole } from '@/types';
import { User, MapPin, Mail, Globe, ArrowRight, AlertCircle } from 'lucide-react';

export default function OnboardingPage() {
  const { user, syncProfile } = useAuth() as any;
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [role, setRole] = useState<UserRole>('farmer');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (role === ('admin' as any)) {
      setError('Self-registration as admin is prohibited.');
      return;
    }

    setLoading(true);
    try {
      // Create/update profile via API or fallback profile payload
      const payload = {
        full_name: fullName.trim(),
        role,
        location: location.trim(),
        email: email.trim() || undefined,
        language_preference: language,
      };

      try {
        await api.register(payload);
      } catch {
        // If register API fails because user already exists in auth, try saving profile directly
      }

      if (typeof window !== 'undefined') {
        const updatedUser = {
          ...user,
          full_name: fullName.trim(),
          role,
          location: location.trim(),
          email: email.trim() || user?.email,
          needs_onboarding: false,
        };
        localStorage.setItem('agrimark_user', JSON.stringify(updatedUser));
      }

      const redirectMap: Record<string, string> = {
        farmer: '/farmer/dashboard',
        buyer: '/buyer/marketplace',
        fpo: '/fpo/dashboard',
        logistics: '/logistics/deliveries',
        service_provider: '/farmer/dashboard',
      };

      const targetRoute = redirectMap[role] || '/farmer/dashboard';
      router.push(targetRoute);
    } catch (err: any) {
      setError(err.message || 'Unable to save profile details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-12 p-6 bg-[#121a16] border border-[#1e2d26] rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-full mb-3 text-emerald-400">
          <User className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-100">Complete Your Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome to AgriMark! Tell us a bit about yourself.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Full Name</label>
          <div className="relative">
            <User className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. Ramesh Kumar"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Role / Profile Type</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="farmer">Farmer</option>
            <option value="buyer">Buyer / Agri Trader</option>
            <option value="fpo">FPO Representative</option>
            <option value="logistics">Logistics Provider</option>
            <option value="service_provider">Agri Service Provider</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Village / Location</label>
          <div className="relative">
            <MapPin className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. Mandya, Karnataka"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Email Address (Optional)</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              placeholder="farmer@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Preferred Language</label>
          <div className="relative">
            <Globe className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-6"
        >
          <span>{loading ? 'Saving Profile...' : 'Complete Registration & Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
