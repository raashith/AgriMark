'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Bell, ShieldCheck, Truck, Package, Sprout } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: 'Escrow Lock Confirmed for Order #ORD-99812',
      time: '10 mins ago',
      desc: 'Reliance Fresh locked ₹1,30,000 in Bharat Mandi Escrow for 5,000 kg Red Onion lot.',
      type: 'success',
      icon: ShieldCheck,
    },
    {
      id: 2,
      title: 'Reefer Cold Chain Dispatched',
      time: '2 hours ago',
      desc: 'Vehicle MH-15-EG-4412 dispatched from Nashik Yard. Temperature sensor active at +4.2°C.',
      type: 'in_transit',
      icon: Truck,
    },
    {
      id: 3,
      title: 'Weather Advisory: Heavy Rain Warning',
      time: '5 hours ago',
      desc: 'Niphad taluka weather alert: Light to moderate showers expected in 48h. Secure harvested lots.',
      type: 'warning',
      icon: Sprout,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Notifications & Field Activity Feed"
        subtitle="Real-time alerts for escrow disbursals, logistics GPS telemetry, and weather advisories."
      />

      <CardPanel>
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex items-start gap-4">
                <div className="p-2.5 bg-white border border-[#E7E5DC] rounded-xl text-[#1B4D3E]">
                  <Icon className="w-5 h-5 text-[#1B4D3E]" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#19201D]">{n.title}</h4>
                    <span className="text-[10px] font-mono text-gray-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardPanel>
    </div>
  );
}
