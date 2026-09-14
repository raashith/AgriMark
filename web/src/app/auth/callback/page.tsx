'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { UserRole } from '@/types';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !data.session) {
          throw new Error(sessionError?.message || 'Authentication session could not be established.');
        }

        const accessToken = data.session.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('agrimark_token', accessToken);
        }

        let profile;
        try {
          profile = await api.getMe();
        } catch {
          // Fallback if profile endpoint requires retry or auto-creation
          const user = data.session.user;
          profile = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'AgriMark User',
            phone: user.phone || null,
            role: 'farmer' as UserRole,
          };
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('agrimark_user', JSON.stringify(profile));
        }

        const role = profile.role || 'farmer';
        const redirectMap: Record<string, string> = {
          farmer: '/farmer/dashboard',
          buyer: '/buyer/marketplace',
          fpo: '/fpo/dashboard',
          logistics: '/logistics/deliveries',
          admin: '/admin/dashboard',
        };

        const targetRoute = redirectMap[role] || '/farmer/dashboard';
        router.replace(targetRoute);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed. Please try logging in again.');
      }
    };

    void handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-4">
        <div className="bg-[#121a16] border border-red-900/60 p-6 rounded-2xl max-w-md w-full text-center space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-red-400">Authentication Failed</h2>
          <p className="text-sm text-gray-300">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-4 text-gray-400">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium">Completing AgriMark authentication...</p>
      </div>
    </div>
  );
}
