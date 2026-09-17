'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/InputControls';
import { Sprout, ShoppingCart, Users, Truck, ShieldCheck, Check } from 'lucide-react';

export default function RoleSelectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');

  const roles = [
    {
      id: 'farmer' as UserRole,
      title: 'Farmer',
      desc: 'Register your land passport, record harvests, manage crop timelines, and sell directly on Mandi.',
      icon: Sprout,
      badge: 'Most Popular',
    },
    {
      id: 'buyer' as UserRole,
      title: 'Produce Buyer / Institutional Trader',
      desc: 'Browse verified NABL produce lots, issue RFQs, place escrow orders, and track cold-chain deliveries.',
      icon: ShoppingCart,
    },
    {
      id: 'fpo' as UserRole,
      title: 'FPO / Farmers Cooperative',
      desc: 'Aggregate member harvests, procure bulk seeds & fertilizers, manage bulk sales, and issue Khaata receipts.',
      icon: Users,
    },
    {
      id: 'logistics' as UserRole,
      title: 'Logistics & Fleet Operator',
      desc: 'Accept produce transit jobs, scan dock QR gate passes, transmit IoT temperature telemetry.',
      icon: Truck,
    },
  ];

  const handleContinue = () => {
    if (selectedRole === 'farmer') {
      router.push('/onboarding/farmer');
    } else if (selectedRole === 'buyer') {
      router.push('/buyer/dashboard');
    } else if (selectedRole === 'fpo') {
      router.push('/fpo/dashboard');
    } else if (selectedRole === 'logistics') {
      router.push('/logistics/deliveries');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <PageHeader
        title="Choose Your Platform Role"
        subtitle="AgriMark provides tailored workflows and dashboards for each stakeholder in the agricultural trade value chain."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => {
          const isSelected = selectedRole === r.id;
          const Icon = r.icon;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`p-6 bg-white border rounded-2xl cursor-pointer transition flex flex-col justify-between space-y-4 shadow-sm relative ${
                isSelected
                  ? 'border-[#1B4D3E] ring-2 ring-[#1B4D3E]/20 bg-emerald-50/20'
                  : 'border-[#E7E5DC] hover:border-gray-400'
              }`}
            >
              {r.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-mono font-bold bg-[#1B4D3E] text-amber-300 px-2 py-0.5 rounded-full">
                  {r.badge}
                </span>
              )}
              <div className="space-y-3">
                <div className={`p-3 rounded-xl w-fit ${isSelected ? 'bg-[#1B4D3E] text-amber-300' : 'bg-[#F6F4ED] text-[#1B4D3E]'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#19201D]">{r.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#1B4D3E]">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white' : 'border-gray-300'}`}>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
                <span>{isSelected ? 'Selected Role' : 'Select Role'}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E7E5DC]">
        <Button onClick={handleContinue} size="lg" className="w-full md:w-auto">
          <span>Continue to Setup</span>
          <Check className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
