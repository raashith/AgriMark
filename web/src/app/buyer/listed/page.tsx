'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin, PackageCheck, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function BuyerListedPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getListings().then(rows => setItems(rows.filter(x => (x.quantity_available_kg ?? 0) > 0))).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => items.filter(item => {
    const text = (String(item.crop_name || item.title || '') + ' ' + String(item.location || '')).toLowerCase();
    return text.includes(query.toLowerCase());
  }), [items, query]);

  return (
    <ProtectedRoute allowedRoles={['buyer', 'admin']} requireAuth>
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">Listed supply</p>
        <h1 className="mt-1 text-2xl font-black text-white">All listed produce</h1>
        <p className="mt-1 text-sm text-gray-400">A clean buyer view of produce currently listed by sellers.</p>
        <div className="relative mt-5 max-w-xl"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search crop or location..." className="w-full rounded-xl border border-[#1e2d26] bg-[#0a0f0d] py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-emerald-500" /></div>
      </section>
      {loading ? <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-12 text-center text-sm text-gray-500">Loading listed supply…</div> :
      filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-[#294238] bg-[#121a16] p-12 text-center"><PackageCheck className="mx-auto h-8 w-8 text-gray-600" /><p className="mt-3 text-sm font-semibold text-gray-300">No active listed supply</p></div> :
      <div className="overflow-hidden rounded-2xl border border-[#1e2d26] bg-[#121a16]"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-[#1e2d26] bg-[#0a0f0d] text-[10px] uppercase tracking-wider text-gray-500"><tr><th className="px-4 py-3">Produce</th><th className="px-4 py-3">Available</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Grade</th></tr></thead><tbody className="divide-y divide-[#1e2d26]">{filtered.map(item => <tr key={item.id} className="hover:bg-[#18241f]"><td className="px-4 py-4 font-bold text-white">{item.crop_name || item.title || 'Produce'}</td><td className="px-4 py-4 text-gray-300">{Number(item.quantity_available_kg ?? 0).toLocaleString('en-IN')} kg</td><td className="px-4 py-4 font-bold text-emerald-400">₹{Number(item.price_per_kg ?? item.price_per_unit ?? 0).toLocaleString('en-IN')}/kg</td><td className="px-4 py-4 text-gray-400"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-500" />{item.location || '—'}</span></td><td className="px-4 py-4"><span className="rounded-full border border-emerald-800/50 bg-emerald-950/40 px-2 py-1 text-[10px] font-bold text-emerald-300">{item.quality_grade || 'Verified'}</span></td></tr>)}</tbody></table></div></div>}
    </div>
    </ProtectedRoute>
  );
}
