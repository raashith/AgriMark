'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sun, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface AgriHeaderProps {
  title?: string;
  backHref?: string;
  showWeather?: boolean;
}

export const AgriHeader: React.FC<AgriHeaderProps> = ({
  title,
  backHref,
  showWeather = true,
}) => {
  const router = RouterHook();
  const { user, role } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 pb-4 border-b border-[#1e2d26] mb-6">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#121a16] border border-[#1e2d26] text-gray-300 hover:text-white hover:border-emerald-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        ) : (
          <button
            onClick={() => router.back()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#121a16] border border-[#1e2d26] text-gray-300 hover:text-white hover:border-emerald-700 transition"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {title && (
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showWeather && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#121a16] border border-[#1e2d26] rounded-xl text-xs font-mono text-emerald-300">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>28°C • Nashik ₹2,450/q</span>
          </div>
        )}

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f0d] border border-[#1e2d26] hover:border-emerald-800 rounded-xl text-xs font-mono font-bold text-emerald-300 transition"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>தமிழ்</span>
        </button>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-[#1e2d26]">
            <div className="w-8 h-8 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-300 flex items-center justify-center font-bold text-xs">
              {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

function RouterHook() {
  return useRouter();
}

export default AgriHeader;
