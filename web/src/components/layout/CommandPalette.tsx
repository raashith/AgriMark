'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sprout, ShoppingCart, TrendingUp, CloudSun, FileText, CheckSquare, ShieldCheck, ArrowRight, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { label: 'Farmer Operations Dashboard', href: '/farmer/dashboard', category: 'Navigation', icon: Sprout },
    { label: 'My Farms & Field Coordinates', href: '/farmer/farms', category: 'Farmer', icon: Sprout },
    { label: 'Crop Cultivation & Agronomy Notes', href: '/farmer/crops', category: 'Farmer', icon: Sprout },
    { label: 'Harvest Batches & Produce Lots', href: '/farmer/harvest', category: 'Farmer', icon: Sprout },
    { label: 'Produce Listings & Stock', href: '/farmer/sell', category: 'Farmer', icon: ShoppingCart },
    { label: 'AgriMark Marketplace (Buy Produce)', href: '/marketplace', category: 'Marketplace', icon: ShoppingCart },
    { label: 'Mandi Market Prices & Price Charts', href: '/market-prices', category: 'Intelligence', icon: TrendingUp },
    { label: 'Weather Forecast & Crop Alerts', href: '/weather', category: 'Intelligence', icon: CloudSun },
    { label: 'AgriAI Agricultural Assistant', href: '/ai-assistant', category: 'AI', icon: Sprout },
    { label: 'Farm Financial Accounting & Income', href: '/finance', category: 'Management', icon: FileText },
    { label: 'Farm Tasks & Reminders', href: '/tasks', category: 'Management', icon: CheckSquare },
    { label: 'Secure Land Records & Documents', href: '/documents', category: 'Management', icon: FileText },
    { label: 'Cold Storage Discovery', href: '/storage', category: 'Logistics', icon: ShieldCheck },
    { label: 'AgriMark Admin Verification Portal', href: '/admin/dashboard', category: 'Admin', icon: ShieldCheck },
  ];

  const filtered = query.trim()
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#121a16] border border-[#1e2d26] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e2d26] bg-[#0d1410]">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page name, crop, or tool..."
            className="w-full bg-transparent text-white placeholder-gray-500 font-medium focus:outline-none text-base"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">
              No matching commands found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item.href)}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#18241f] text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-950/60 border border-emerald-800/40 rounded-xl text-emerald-400">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white group-hover:text-emerald-300">{item.label}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-[#0a0f0d] border border-[#1e2d26] text-gray-400 rounded-full font-mono">
                      {item.category}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition" />
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-[#0a0f0d] border-t border-[#1e2d26] flex items-center justify-between text-xs text-gray-500 font-mono">
          <span>Navigate with mouse or arrow keys</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
