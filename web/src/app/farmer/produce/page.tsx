'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Edit3, Leaf, Package, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import type { ProduceLot } from '@/types';

type Crop = { id: string; name: string; category?: string | null };
type Farm = { id: string; name?: string | null };
type Cultivation = { id: string; crop_id: string; farm_id: string; crop_name?: string | null };
type LotForm = {
  crop_id: string; cultivation_id: string; quantity: string; available_quantity: string;
  unit: string; quality_grade: string; harvested_at: string;
};
const blankForm = (): LotForm => ({
  crop_id: '', cultivation_id: '', quantity: '', available_quantity: '', unit: 'kg',
  quality_grade: 'Grade A', harvested_at: new Date().toISOString().slice(0, 10),
});
const inputClass = 'w-full rounded-xl border border-[#284437] bg-[#08100b] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400';

function qty(value: unknown, unit = 'kg') {
  const n = Number(value ?? 0);
  return `${Number.isFinite(n) ? n.toLocaleString() : '0'} ${unit}`;
}

export default function FarmerProduceStockPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [cultivations, setCultivations] = useState<Cultivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProduceLot | null>(null);
  const [form, setForm] = useState<LotForm>(blankForm);
  const [deleteTarget, setDeleteTarget] = useState<ProduceLot | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLots([]); setLoading(false); return;
    }
    setLoading(true);
    try {
      const [stock, cropCatalog, farmRows, cultivationRows] = await Promise.all([
        api.getProduceLots(), api.getCrops(), api.getFarms(user.id), api.getCultivations(),
      ]);
      setLots(Array.isArray(stock) ? stock : []);
      setCrops(cropCatalog?.items ?? []);
      setFarms(Array.isArray(farmRows) ? farmRows : []);
      setCultivations(Array.isArray(cultivationRows) ? cultivationRows : []);
    } catch (error) {
      showError('Could not load produce stock', error instanceof Error ? error.message : 'Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showError]);

  useEffect(() => { void loadData(); }, [loadData]);

  const filteredLots = useMemo(() => {
    const term = query.trim().toLowerCase();
    return lots.filter((lot) => {
      const words = [lot.crop_name, lot.quality_grade, lot.id, lot.status].map((v) => String(v ?? '').toLowerCase());
      return (!term || words.some((v) => v.includes(term))) &&
        (filter === 'all' || String(lot.status || 'available') === filter);
    });
  }, [lots, query, filter]);

  const totalAvailable = lots.reduce((sum, lot) => sum + Number(lot.available_quantity ?? lot.quantity ?? 0), 0);
  const cropName = (cropId: string) => crops.find((c) => c.id === cropId)?.name || 'Unknown crop';

  function openCreate() {
    setEditing(null); setForm(blankForm()); setFormOpen(true);
  }
  function openEdit(lot: ProduceLot) {
    setEditing(lot);
    setForm({
      crop_id: lot.crop_id, cultivation_id: lot.cultivation_id || '',
      quantity: String(lot.quantity ?? ''),
      available_quantity: String(lot.available_quantity ?? lot.quantity ?? ''),
      unit: lot.unit || 'kg', quality_grade: lot.quality_grade || 'Grade A',
      harvested_at: String(lot.harvested_at || new Date().toISOString().slice(0, 10)).slice(0, 10),
    });
    setFormOpen(true);
  }

  async function saveProduce(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const total = Number(form.quantity);
    const available = Number(form.available_quantity === '' ? form.quantity : form.available_quantity);
    if (!form.crop_id || !Number.isFinite(total) || total <= 0) {
      showError('Check produce details', 'Choose a crop and enter a total quantity greater than zero.'); return;
    }
    if (!Number.isFinite(available) || available < 0 || available > total) {
      showError('Check available quantity', 'Available quantity must be from zero up to total quantity.'); return;
    }
    setSaving(true);
    try {
      const payload: Partial<ProduceLot> = {
        crop_id: form.crop_id, cultivation_id: form.cultivation_id || null,
        quantity: total, available_quantity: available, unit: form.unit || 'kg',
        quality_grade: form.quality_grade || null, harvested_at: form.harvested_at || null,
      };
      const saved = editing ? await api.updateProduceLot(editing.id, payload) : await api.createProduceLot(payload);
      setLots(current => editing ? current.map(item => item.id === saved.id ? saved : item) : [saved, ...current]);
      setFormOpen(false); setEditing(null);
      showSuccess(editing ? 'Produce updated' : 'Produce added', `${saved.crop_name || cropName(saved.crop_id)} stock was saved.`);
    } catch (error) {
      showError(editing ? 'Could not update produce' : 'Could not add produce', error instanceof Error ? error.message : 'Please try again.');
    } finally { setSaving(false); }
  }

  async function deleteProduce() {
    if (!deleteTarget || saving) return;
    setSaving(true);
    try {
      await api.deleteProduceLot(deleteTarget.id);
      setLots(current => current.filter(item => item.id !== deleteTarget.id));
      showSuccess('Produce item deleted', `${deleteTarget.crop_name || cropName(deleteTarget.crop_id)} was removed from your stock.`);
      setDeleteTarget(null);
    } catch (error) {
      showError('Cannot delete produce item', error instanceof Error ? error.message : 'The item may be linked to a listing or order.');
    } finally { setSaving(false); }
  }

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin']}>
      <main className="mx-auto max-w-[1500px] space-y-6 pb-10">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-[#0e291f] via-[#0c1b15] to-[#09100c] p-6 shadow-xl md:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300"><Leaf className="h-4 w-4" /> Farmer inventory</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Produce Stock</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Add produce, update quantities and quality details, and manage your own farm inventory. All changes save to AgriMark.</p>
            </div>
            <button type="button" onClick={openCreate} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-[#052016] transition hover:bg-emerald-400"><Plus className="h-4 w-4" /> Add produce</button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/25 bg-[#101b15] p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Produce items</p><p className="mt-2 text-3xl font-extrabold text-white">{lots.length}</p><p className="mt-1 text-xs text-slate-500">Saved inventory lots</p></div>
          <div className="rounded-2xl border border-emerald-500/25 bg-[#101b15] p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Available stock</p><p className="mt-2 text-3xl font-extrabold text-emerald-300">{qty(totalAvailable)}</p><p className="mt-1 text-xs text-slate-500">Across your produce lots</p></div>
          <div className="rounded-2xl border border-emerald-500/25 bg-[#101b15] p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Available items</p><p className="mt-2 text-3xl font-extrabold text-white">{lots.filter(l => ['available','listed'].includes(String(l.status || 'available'))).length}</p><p className="mt-1 text-xs text-slate-500">Can be managed or listed</p></div>
        </section>

        <section className="rounded-3xl border border-[#1e2d26] bg-[#101712] p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative block flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search crop, grade, lot ID…" className="w-full rounded-xl border border-[#284437] bg-[#08100b] py-3 pl-9 pr-4 text-sm text-white outline-none focus:border-emerald-400" /></label>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border border-[#284437] bg-[#08100b] px-4 py-3 text-sm text-white"><option value="all">All statuses</option><option value="available">Available</option><option value="listed">Listed</option><option value="reserved">Reserved</option><option value="sold">Sold</option><option value="expired">Expired</option></select>
            <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 px-4 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
          </div>

          {loading ? <div className="space-y-3 pt-5"><div className="h-20 animate-pulse rounded-xl bg-white/5" /><div className="h-20 animate-pulse rounded-xl bg-white/5" /></div>
            : filteredLots.length === 0 ? <div className="flex min-h-[250px] flex-col items-center justify-center px-4 text-center"><Package className="h-12 w-12 text-emerald-400/70" /><h2 className="mt-4 text-lg font-bold text-white">{lots.length ? 'No matching produce' : 'Your produce stock is empty'}</h2><p className="mt-2 max-w-lg text-sm text-slate-400">{lots.length ? 'Try a different search or status filter.' : 'Add your first produce item to keep your harvest inventory organized and ready for the marketplace.'}</p>{!lots.length && <button type="button" onClick={openCreate} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add your first item</button>}</div>
            : <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredLots.map(lot => {
                const total = Number(lot.quantity || 0);
                const available = Number(lot.available_quantity ?? lot.quantity ?? 0);
                const committed = Math.max(0, total - available);
                const canDelete = !['listed','reserved','sold'].includes(String(lot.status)) && committed <= 0 && !lot.is_listed;
                return <article key={lot.id} className="rounded-2xl border border-emerald-500/15 bg-[#0a120d] p-5">
                  <div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"><Package className="h-6 w-6" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-white">{lot.crop_name || cropName(lot.crop_id)}</h3><span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] capitalize text-emerald-200">{lot.status || 'available'}</span></div><p className="mt-1 truncate font-mono text-[11px] text-slate-500">LOT {lot.id.slice(0,8).toUpperCase()} · {lot.harvested_at || 'Harvest date not set'}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => openEdit(lot)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/10"><Edit3 className="h-3.5 w-3.5" /> Edit</button><button type="button" onClick={() => setDeleteTarget(lot)} disabled={!canDelete} title={!canDelete ? 'Active listings or committed inventory must be resolved first' : 'Delete item'} className="inline-flex items-center gap-1 rounded-lg border border-rose-500/25 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /> Delete</button></div></div>
                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4"><div><p className="text-xs text-slate-500">Total quantity</p><p className="mt-1 font-bold text-white">{qty(total, lot.unit)}</p></div><div><p className="text-xs text-slate-500">Available</p><p className="mt-1 font-bold text-emerald-300">{qty(available, lot.unit)}</p></div><div><p className="text-xs text-slate-500">Quality grade</p><p className="mt-1 truncate text-sm text-slate-200">{lot.quality_grade || 'Not specified'}</p></div><div><p className="text-xs text-slate-500">Committed / sold</p><p className="mt-1 font-bold text-amber-200">{qty(committed, lot.unit)}</p></div></div>
                </article>;
              })}
            </div>}
        </section>

        {formOpen && <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onMouseDown={e => { if(e.target === e.currentTarget) setFormOpen(false); }}>
          <section className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-emerald-500/30 bg-[#101a14] p-5 shadow-2xl md:p-7" role="dialog" aria-modal="true" aria-labelledby="produce-form-heading">
            <div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">{editing ? 'Update inventory' : 'New inventory item'}</p><h2 id="produce-form-heading" className="mt-1 text-2xl font-extrabold text-white">{editing ? 'Edit produce details' : 'Add produce to stock'}</h2></div><button type="button" onClick={() => setFormOpen(false)} aria-label="Close form" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button></div>
            <form onSubmit={saveProduce} className="space-y-4">
              <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">Crop *</label><select required value={form.crop_id} onChange={e => setForm({...form,crop_id:e.target.value})} className={inputClass}><option value="">Select a crop</option>{crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">Farm cultivation (optional)</label><select value={form.cultivation_id} onChange={e => setForm({...form,cultivation_id:e.target.value})} className={inputClass}><option value="">Not linked</option>{cultivations.filter(c => !form.crop_id || c.crop_id === form.crop_id).map(c => <option key={c.id} value={c.id}>{c.crop_name || cropName(c.crop_id)} · {farms.find(f => f.id === c.farm_id)?.name || 'Farm'}</option>)}</select></div><div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">Unit</label><select value={form.unit} onChange={e => setForm({...form,unit:e.target.value})} className={inputClass}><option value="kg">Kilograms (kg)</option><option value="quintal">Quintal</option><option value="tonne">Tonne</option><option value="bag">Bag</option></select></div></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">Total quantity *</label><input required type="number" min="0.1" step="0.1" value={form.quantity} onChange={e => setForm({...form,quantity:e.target.value,available_quantity:form.available_quantity || e.target.value})} className={inputClass} /></div><div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">Available quantity *</label><input required type="number" min="0" step="0.1" value={form.available_quantity} onChange={e => setForm({...form,available_quantity:e.target.value})} className={inputClass} /></div></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">Quality grade</label><select value={form.quality_grade} onChange={e => setForm({...form,quality_grade:e.target.value})} className={inputClass}><option>Grade A</option><option>Grade B</option><option>Grade C</option><option>Export Quality</option><option>Organic</option><option>Standard</option></select></div><div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">Harvest date</label><input type="date" value={form.harvested_at} onChange={e => setForm({...form,harvested_at:e.target.value})} className={inputClass} /></div></div>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#052016] disabled:opacity-60">{saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{editing ? 'Save changes' : 'Add produce item'}</button></div>
            </form>
          </section>
        </div>}

        {deleteTarget && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><section role="alertdialog" aria-modal="true" aria-labelledby="delete-stock-heading" className="w-full max-w-md rounded-2xl border border-rose-500/25 bg-[#101a14] p-6"><h2 id="delete-stock-heading" className="text-lg font-bold text-white">Delete {deleteTarget.crop_name || cropName(deleteTarget.crop_id)}?</h2><p className="mt-2 text-sm leading-6 text-slate-300">This permanently removes this produce lot from your stock. Items associated with active listings or committed orders are protected.</p><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300">Cancel</button><button type="button" onClick={() => void deleteProduce()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Trash2 className="h-4 w-4" />{saving ? 'Deleting…' : 'Delete stock'}</button></div></section></div>}
      </main>
    </ProtectedRoute>
  );
}
