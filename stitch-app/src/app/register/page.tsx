'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types';
import { Input, Select, Button } from '@/components/ui/InputControls';
import { Sprout, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (role === 'admin') {
      setError('Self-registration as administrator is prohibited.');
      return;
    }
    setIsLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        phone,
        password,
        role,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
        <h1 className="text-2xl font-extrabold text-[#19201D]">Create AgriMark Account</h1>
        <p className="text-xs text-gray-500">Bharat Agricultural Operating System</p>
      </div>

      <div className="bg-white border border-[#E7E5DC] p-6 rounded-2xl shadow-sm space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Ramesh Patil"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="ramesh@agrimark.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Mobile Number (+91)"
            type="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Select
            label="Account Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { label: 'Farmer (Produce Cultivator)', value: 'farmer' },
              { label: 'Buyer (Institutional Procurement)', value: 'buyer' },
              { label: 'FPO / Farmers Cooperative', value: 'fpo' },
              { label: 'Logistics / Fleet Operator', value: 'logistics' },
            ]}
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
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-[#F6F4ED]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#1B4D3E] hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
