'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input, Button } from '@/components/ui/InputControls';
import { Sprout, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="p-3 bg-[#1B4D3E] text-amber-300 rounded-2xl w-fit mx-auto shadow-md">
          <Sprout className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#19201D]">Sign In to AgriMark</h1>
        <p className="text-xs text-gray-500">Bharat Agricultural Operating System & Mandi Ecosystem</p>
      </div>

      <div className="bg-white border border-[#E7E5DC] p-6 rounded-2xl shadow-sm space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Mobile Number"
            type="email"
            placeholder="farmer@agrimark.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-400 font-bold uppercase">Or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => loginWithGoogle()}
          className="w-full"
        >
          <span>Continue with Google OAuth</span>
        </Button>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-[#F6F4ED]">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-[#1B4D3E] hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
