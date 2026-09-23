'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { recordScreenView } from '@/lib/telemetry';
import { MetricCard } from '@/components/ui/MetricCard';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Sprout,
  PackageCheck,
  CloudSun,
  FileSpreadsheet,
  AlertTriangle,
  PlusCircle,
  Truck,
  Bot,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, role, user } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    void recordScreenView('farmer_dashboard', role || 'guest');
  }, [role]);

  return (
    <div className="space-y-8 py-2">
      {/* Hero / Command Deck Header */}
      <div className="bg-gradient-to-r from-[#1B4D3E] via-[#143B30] to-[#19201D] text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#143B30]">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300">
            <Sprout className="w-4 h-4" /> Bharat Agricultural OS • NABL Assayed Trade
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {isAuthenticated ? `Welcome back, ${user?.full_name}` : 'Direct Farm-to-Mandi Intelligence & Escrow Trade OS'}
          </h1>
          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed">
            Real-time APMC Mandi prices, cadastral 7/12 land passport, NABL lot verification, cold-chain GPS reefer tracking, and AI advisory.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/onboarding/role-select"
                  className="px-5 py-3 bg-[#D97706] hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
                >
                  <span>Get Started / Choose Role</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition"
                >
                  {t('login')}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/marketplace/new"
                  className="px-5 py-3 bg-[#D97706] hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List Produce on Mandi</span>
                </Link>
                <Link
                  href="/farm/new"
                  className="px-5 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
                >
                  <Sprout className="w-4 h-4" />
                  <span>Register Farm</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Live Weather & Mandi Chip */}
        <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl space-y-2 w-full md:w-64 text-xs">
          <div className="flex items-center justify-between text-amber-300 font-bold font-mono">
            <span className="flex items-center gap-1.5"><CloudSun className="w-4 h-4" /> Nashik APMC</span>
            <span>28°C</span>
          </div>
          <p className="text-emerald-100">Humidity: 64% • Light Rain expected in 48h</p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-gray-300">Red Onion Grade A:</span>
            <span className="font-mono font-bold text-emerald-300">₹2,450 / Qtl</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Cultivations"
          value="4.5 Acres"
          subtitle="Shree Ganesh Krishi Farm"
          change="12% vs last season"
          isPositive={true}
          icon={<Sprout className="w-5 h-5" />}
          badge="Kharif 2026"
        />
        <MetricCard
          title="Mandi Produce Lots"
          value="18,500 kg"
          subtitle="Grade A Nashik Red Onion"
          change="₹2,450 / Qtl"
          isPositive={true}
          icon={<PackageCheck className="w-5 h-5" />}
          badge="Escrow Verified"
        />
        <MetricCard
          title="Season Net Profit (Khaata)"
          value="₹1,84,200"
          subtitle="Gross ₹3.2L • Expenses ₹1.35L"
          change="24% ROI"
          isPositive={true}
          icon={<FileSpreadsheet className="w-5 h-5" />}
          badge="NABARD Verified"
        />
        <MetricCard
          title="Reefer Cold Chain"
          value="In-Transit"
          subtitle="Bhiwandi Terminal • Gate Bay 2"
          change="+4.2°C Stable"
          isPositive={true}
          icon={<Truck className="w-5 h-5" />}
          badge="GPS Telemetry"
        />
      </div>

      {/* Main Focus Command Deck & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Tasks & Cultivation Summary */}
        <div className="lg:col-span-2 space-y-6">
          <CardPanel
            title="Today's Field Focus & Advisory"
            subtitle="Prioritized agronomic actions for active crop passport"
            action={
              <Link href="/crops/crop-001/timeline" className="text-xs font-bold text-[#1B4D3E] hover:underline">
                View Full Timeline →
              </Link>
            }
          >
            <div className="space-y-3">
              {[
                {
                  crop: 'Red Onion (Bhima Super)',
                  action: 'Foliar Spray Application (19:19:19 NPK + Neem Oil)',
                  stage: 'Bulb Swelling Stage (Day 62)',
                  priority: 'High',
                  assignedTo: 'Baban (Labour Lead)',
                },
                {
                  crop: 'Bt Cotton (RCH-659)',
                  action: 'Field Scouting & Pink Bollworm Trap Inspection',
                  stage: 'Boll Development (Day 85)',
                  priority: 'Critical',
                  assignedTo: 'Self Inspection',
                },
                {
                  crop: 'Pomegranate (Bhagwa)',
                  action: 'Drip Irrigation Discharge Check & Soluble Potash',
                  stage: 'Fruiting Stage',
                  priority: 'Medium',
                  assignedTo: 'Automated Drip Timer',
                },
              ].map((task, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#F6F4ED] border border-[#E7E5DC] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#1B4D3E]/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#1B4D3E]">{task.crop}</span>
                      <StatusBadge status={task.priority} />
                    </div>
                    <p className="text-sm font-bold text-[#19201D]">{task.action}</p>
                    <p className="text-xs text-gray-500">{task.stage} • Assigned to: {task.assignedTo}</p>
                  </div>
                  <Link
                    href="/crops/crop-001/scout"
                    className="px-3.5 py-2 bg-white border border-[#1B4D3E] text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white text-xs font-bold rounded-lg transition text-center whitespace-nowrap"
                  >
                    Log Observation
                  </Link>
                </div>
              ))}
            </div>
          </CardPanel>

          {/* Mandi Price Comparison Ticker */}
          <CardPanel title="Transparent 3-Tier Mandi Price Intelligence">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#F6F4ED] rounded-xl border border-[#E7E5DC]">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-700">1. Mandi Reference</span>
                <h4 className="font-bold text-sm text-[#19201D] mt-1">Observed APMC Mandi</h4>
                <p className="text-xs font-mono font-bold text-emerald-800 mt-1">₹2,450 / Qtl (Nashik)</p>
                <p className="text-[11px] text-gray-500 mt-1">Modal rate updated 2 hours ago</p>
              </div>

              <div className="p-4 bg-[#F6F4ED] rounded-xl border border-[#E7E5DC]">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">2. Farmer Ask Price</span>
                <h4 className="font-bold text-sm text-[#19201D] mt-1">Authentic Produce Lot</h4>
                <p className="text-xs font-mono font-bold text-[#1B4D3E] mt-1">₹2,600 / Qtl (Grade A)</p>
                <p className="text-[11px] text-gray-500 mt-1">Direct seller lot code #LOT-N-884</p>
              </div>

              <div className="p-4 bg-[#F6F4ED] rounded-xl border border-[#E7E5DC]">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-700">3. AI Price Forecast</span>
                <h4 className="font-bold text-sm text-[#19201D] mt-1">7-Day Demand Outlook</h4>
                <p className="text-xs font-mono font-bold text-purple-800 mt-1">₹2,720 (+4.8%)</p>
                <p className="text-[11px] text-gray-500 mt-1">High demand in Mumbai & Bhiwandi</p>
              </div>
            </div>
          </CardPanel>
        </div>

        {/* Right Col: Quick Actions & AgriAI Widget */}
        <div className="space-y-6">
          <CardPanel title="Quick Field Actions">
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Add Farm', href: '/farm/new', icon: Sprout },
                { title: 'Record Harvest', href: '/crops/crop-001/harvest/new', icon: PackageCheck },
                { title: 'Field Scouting', href: '/crops/crop-001/scout', icon: AlertTriangle },
                { title: 'Farm Khaata', href: '/finance', icon: FileSpreadsheet },
                { title: 'Reefer GPS', href: '/logistics/track/ORD-99812', icon: Truck },
                { title: 'AgriAI Chat', href: '/ai-assistant', icon: Bot },
              ].map((act, i) => (
                <Link
                  key={i}
                  href={act.href}
                  className="p-3 bg-[#F6F4ED] hover:bg-[#1B4D3E] hover:text-white border border-[#E7E5DC] rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 transition group"
                >
                  <act.icon className="w-5 h-5 text-[#1B4D3E] group-hover:text-amber-300 transition" />
                  <span className="text-xs font-bold">{act.title}</span>
                </Link>
              ))}
            </div>
          </CardPanel>

          {/* AgriAI Multilingual Assistant Box */}
          <div className="bg-gradient-to-br from-[#19201D] to-[#1B4D3E] text-white p-5 rounded-2xl border border-emerald-800 space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Bot className="w-5 h-5" /> AgriAI Farmer Assistant
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Ask in Marathi, Hindi, Tamil, or English about pest control, weather forecast, or mandi price recommendations.
            </p>
            <Link
              href="/ai-assistant"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition"
            >
              <span>Ask AgriAI Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
