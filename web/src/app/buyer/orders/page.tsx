'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { MarketplaceOrder } from '@/types';
import { CommodityImage } from '@/components/ui/CommodityImage';
import { useToast } from '@/components/ui/Toast';
import {
  ShoppingBag, Truck, CheckCircle2, Clock, Search, PackageCheck,
  SlidersHorizontal, XCircle, ClipboardList, ArrowUpRight, RefreshCw,
  MapPin, Pencil, Save, Ban,
} from 'lucide-react';

type OrderFilter = 'all' | 'pending' | 'processing' | 'in_transit' | 'delivered' | 'cancelled';

const filters: { id: OrderFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Orders', icon: ClipboardList },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'processing', label: 'Processing', icon: PackageCheck },
  { id: 'in_transit', label: 'In Transit', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle },
];

function orderStatus(order: MarketplaceOrder): OrderFilter {
  const raw = String(order.status || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (raw === 'delivered' || raw === 'complete' || raw === 'completed') return 'delivered';
  if (['in_transit', 'dispatched', 'shipped', 'out_for_delivery', 'ready_for_dispatch'].includes(raw)) return 'in_transit';
  if (['processing', 'confirmed', 'accepted', 'packed', 'preparing'].includes(raw)) return 'processing';
  if (['cancelled', 'canceled', 'rejected', 'refunded'].includes(raw)) return 'cancelled';
  return 'pending';
}

function statusLabel(status: OrderFilter) {
  return ({ all: 'All orders', pending: 'Pending', processing: 'Processing', in_transit: 'In transit', delivered: 'Delivered', cancelled: 'Cancelled' })[status];
}

function statusStyles(status: OrderFilter) {
  if (status === 'delivered') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (status === 'in_transit') return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';
  if (status === 'processing') return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
  if (status === 'cancelled') return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
  return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
}

function formatDate(value?: string) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

function addressText(value: MarketplaceOrder['delivery_address']): string {
  if (!value) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') return addressText(parsed as MarketplaceOrder['delivery_address']);
    } catch {}
    return trimmed;
  }
  if (typeof value !== 'object') return '';
  if (typeof value.formatted_address === 'string') return value.formatted_address;
  const fields = ['full_name', 'phone', 'house_number', 'street', 'area', 'landmark', 'city', 'state', 'postal_code'];
  return fields
    .map((key) => value[key])
    .filter((part): part is string => typeof part === 'string' && Boolean(part.trim()))
    .join(', ');
}

function canEditDeliveryAddress(order: MarketplaceOrder): boolean {
  const raw = String(order.status || '').toLowerCase().replace(/[\\s-]+/g, '_');
  return !['dispatched', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'canceled', 'rejected'].includes(raw);
}

function canCancelOrder(order: MarketplaceOrder): boolean {
  const raw = String(order.status || '').toLowerCase().replace(/[\\s-]+/g, '_');
  return raw === 'placed' || raw === 'pending';
}

export default function BuyerOrdersPage() {
  const { t } = useI18n();
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const fetchOrders = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await api.getOrders();
      setOrders(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Unable to load marketplace orders', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { void fetchOrders(); }, []);

  const counts = useMemo(() => {
    const result: Record<OrderFilter, number> = { all: orders.length, pending: 0, processing: 0, in_transit: 0, delivered: 0, cancelled: 0 };
    orders.forEach((order) => { result[orderStatus(order)] += 1; });
    return result;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter = activeFilter === 'all' || orderStatus(order) === activeFilter;
      const searchable = [order.id, order.listing_title, order.listing_id, order.seller_name, order.status]
        .filter(Boolean).join(' ').toLowerCase();
      return matchesFilter && (!needle || searchable.includes(needle));
    });
  }, [orders, activeFilter, search]);

  const totalSpent = useMemo(() => orders
    .filter((order) => orderStatus(order) !== 'cancelled')
    .reduce((sum, order) => sum + Number(order.total_price ?? order.total_amount ?? 0), 0), [orders]);

  const statusOrder: OrderFilter[] = ['pending', 'processing', 'in_transit', 'delivered'];

  const amountFor = (order: MarketplaceOrder) => Number(order.total_price ?? order.total_amount ?? 0);
  const quantityFor = (order: MarketplaceOrder) => Number(order.quantity_kg ?? order.quantity ?? 0);
  const priceFor = (order: MarketplaceOrder) => Number(order.unit_price || (quantityFor(order) ? amountFor(order) / quantityFor(order) : 0));
  const cropFor = (order: MarketplaceOrder) => {
    const cropName = String(order.crop_name || '').trim();
    if (cropName) return cropName;
    const title = String(order.listing_title || '').trim();
    if (!title || /^(fresh produce|produce lot|grade\\s+[a-z0-9]+\\s+(produce|produce lot))$/i.test(title)) return 'Produce listing';
    return title;
  };

  const openDetails = (order: MarketplaceOrder) => {
    setSelectedOrder(order);
    setAddressDraft(addressText(order.delivery_address));
    setEditingAddress(false);
    setCancelConfirm(false);
  };

  const saveAddress = async () => {
    if (!selectedOrder) return;
    const normalized = addressDraft.trim();
    if (normalized.length < 5) {
      showError('Delivery address is required', 'Enter a complete address before saving.');
      return;
    }
    setSavingAddress(true);
    try {
      const updated = await api.updateOrderAddress(selectedOrder.id, normalized);
      const savedAddress = updated.delivery_address ?? { formatted_address: normalized };
      setOrders((current) => current.map((order) => order.id === selectedOrder.id ? { ...order, delivery_address: savedAddress } : order));
      setSelectedOrder((current) => current && current.id === selectedOrder.id ? { ...current, delivery_address: savedAddress } : current);
      setAddressDraft(addressText(savedAddress));
      setEditingAddress(false);
      showSuccess('Delivery address updated', 'The new address has been saved to this order.');
    } catch (error) {
      showError('Unable to update address', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const cancelSelectedOrder = async () => {
    if (!selectedOrder) return;
    setCancellingOrder(true);
    try {
      const updated = await api.cancelOrder(selectedOrder.id, 'Cancelled by buyer');
      const cancelled: MarketplaceOrder = {
        ...selectedOrder,
        status: updated.status || 'cancelled',
        cancellation_reason: updated.cancellation_reason || 'Cancelled by buyer',
      };
      setOrders((current) => current.map((order) => order.id === selectedOrder.id ? { ...order, ...cancelled } : order));
      setSelectedOrder(cancelled);
      setCancelConfirm(false);
      showSuccess('Order cancelled', 'The reserved quantity has been returned to available inventory.');
      void fetchOrders(true);
    } catch (error) {
      showError('Unable to cancel order', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setCancellingOrder(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-8">
      <section className="relative isolate overflow-hidden rounded-3xl border border-emerald-900/70 bg-gradient-to-br from-[#10251b] via-[#0b1711] to-[#07100c] p-5 shadow-[0_24px_80px_rgba(0,0,0,.2)] sm:p-7 lg:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-teal-500/[0.07] blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-950/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
              Buyer workspace
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[42px]">
              My Marketplace <span className="text-emerald-400">Orders</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              One clear view of your produce purchases, order progress, and delivery status.
            </p>
          </div>
          <button type="button" onClick={() => void fetchOrders(true)} disabled={refreshing || loading}
            className="inline-flex w-full items-center justify-center gap-2 self-start rounded-xl border border-emerald-800/70 bg-black/20 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-500 hover:bg-emerald-950/60 disabled:opacity-60 lg:w-auto lg:self-auto">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh orders
          </button>
        </div>
        <div className="relative mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-black/25 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400"><ShoppingBag className="h-4 w-4 text-emerald-400" /> Total orders</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-white">{orders.length}</div>
            <div className="mt-1 text-xs text-gray-500">All purchases in your account</div>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-black/25 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400"><Truck className="h-4 w-4 text-cyan-300" /> On the way</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-white">{counts.in_transit}</div>
            <div className="mt-1 text-xs text-gray-500">Orders moving toward delivery</div>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-black/25 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400"><PackageCheck className="h-4 w-4 text-amber-300" /> Order value</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-white">{currency(totalSpent)}</div>
            <div className="mt-1 text-xs text-gray-500">Excludes cancelled orders</div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[#1d3026] bg-[#0c1510] p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter orders by status">
            {filters.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" role="tab" aria-selected={activeFilter === id} onClick={() => setActiveFilter(id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition sm:text-sm ${activeFilter === id ? 'border-emerald-400 bg-emerald-500 text-[#04130b] shadow-[0_4px_22px_rgba(16,185,129,.18)]' : 'border-[#23392e] bg-[#0b130f] text-gray-300 hover:border-emerald-700 hover:text-emerald-100'}`}>
                <Icon className="h-4 w-4" /> {label}
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${activeFilter === id ? 'bg-black/10 text-[#04130b]' : 'bg-white/[0.06] text-gray-400'}`}>{counts[id]}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full shrink-0 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by crop name or order ID..."
              aria-label="Search orders by crop name or order ID"
              className="w-full rounded-xl border border-[#254034] bg-[#060d09] py-3 pl-10 pr-10 text-sm text-gray-100 outline-none transition placeholder:text-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><XCircle className="h-4 w-4" /></button>}
          </div>
        </div>
        <div className="flex items-center justify-between px-1 text-xs text-gray-500">
          <span>Showing <strong className="text-gray-300">{visibleOrders.length}</strong> of {orders.length} orders</span>
          <span className="hidden items-center gap-1 sm:inline-flex"><SlidersHorizontal className="h-3.5 w-3.5" /> Filter by status or search</span>
        </div>
      </section>

      {loading ? (
        <section aria-label="Loading orders" className="space-y-3">
          {[0, 1, 2].map((row) => <div key={row} className="h-44 animate-pulse rounded-2xl border border-[#1d3026] bg-gradient-to-r from-[#101a14] via-[#15241a] to-[#101a14]" />)}
        </section>
      ) : visibleOrders.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-[#294436] bg-[#0d1711] px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-700/50 bg-emerald-950/60 text-emerald-300"><ShoppingBag className="h-7 w-7" /></div>
          <h2 className="mt-4 text-lg font-bold text-white">{orders.length === 0 ? 'No orders yet' : 'No matching orders'}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
            {orders.length === 0 ? 'Your purchases will appear here after you place an order in the marketplace.' : 'Try another status filter or search for a different crop or order ID.'}
          </p>
          {(search || activeFilter !== 'all') && <button type="button" onClick={() => { setSearch(''); setActiveFilter('all'); }} className="mt-5 rounded-xl border border-emerald-700 bg-emerald-950/50 px-4 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/60">Clear filters</button>}
        </section>
      ) : (
        <section className="space-y-4" aria-label="Marketplace orders">
          {visibleOrders.map((order) => {
            const status = orderStatus(order);
            const statusIndex = statusOrder.indexOf(status);
            const progress = status === 'cancelled' ? -1 : Math.max(0, statusIndex);
            const quantity = quantityFor(order);
            const total = amountFor(order);
            const imageName = cropFor(order);
            return (
              <article key={order.id} className="group overflow-hidden rounded-2xl border border-[#20382b] bg-gradient-to-r from-[#111c15] via-[#0d1711] to-[#0a120d] shadow-[0_10px_35px_rgba(0,0,0,.14)] transition duration-200 hover:border-emerald-700/80 hover:shadow-[0_15px_40px_rgba(16,185,129,.06)]">
                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(220px,1.1fr)_minmax(170px,.8fr)_minmax(150px,.65fr)_minmax(260px,1.2fr)_auto] lg:items-center lg:gap-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:h-28 sm:w-28">
                      <CommodityImage name={imageName} title={imageName} className="h-full w-full" imageClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-extrabold text-white">{imageName}</h2>
                      <p className="mt-1 truncate text-sm text-gray-400">{order.seller_name ? `Sold by ${order.seller_name}` : 'Direct farm purchase'}</p>
                      <span className="mt-2 inline-flex rounded-full border border-emerald-800/60 bg-emerald-950/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">{order.quality_grade || order.unit || 'Produce listing'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3 sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-500">Order ID</p>
                      <p title={order.id} className="mt-1 truncate font-mono text-sm font-bold text-gray-100">{order.id.slice(0, 8).toUpperCase()}…</p>
                      <p className="mt-3 text-[11px] text-gray-500">Order date</p>
                      <p className="mt-1 text-xs text-gray-300">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500">Quantity</p>
                      <p className="mt-1 text-lg font-extrabold text-white">{quantity.toLocaleString('en-IN', { maximumFractionDigits: 2 })} <span className="text-xs font-semibold text-gray-400">kg</span></p>
                      <p className="mt-3 text-[11px] text-gray-500">Unit price</p>
                      <p className="mt-1 text-xs font-semibold text-emerald-300">{currency(priceFor(order))}/kg</p>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <p className="text-[11px] text-gray-500">Total price</p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-emerald-300">{currency(total)}</p>
                    <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles(status)}`}>{statusLabel(status)}</span>
                  </div>

                  <div className="border-t border-white/[0.06] pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    {status === 'cancelled' ? (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3 text-sm text-rose-200"><XCircle className="mb-1 h-5 w-5" /> This order was cancelled.</div>
                    ) : (
                      <div>
                        <div className="mb-4 flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide ${statusStyles(status)}`}>
                            {status === 'delivered' ? <CheckCircle2 className="h-3.5 w-3.5" /> : status === 'in_transit' ? <Truck className="h-3.5 w-3.5" /> : status === 'processing' ? <PackageCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            {statusLabel(status)}
                          </span>
                          <span className="text-[10px] text-gray-500">{status === 'delivered' ? 'Complete' : `Step ${progress + 1} of 4`}</span>
                        </div>
                        <div className="flex items-start">
                          {statusOrder.map((step, index) => {
                            const isComplete = index < progress || status === 'delivered';
                            const isCurrent = index === progress && status !== 'delivered';
                            return (
                              <React.Fragment key={step}>
                                <div className="flex min-w-0 flex-1 flex-col items-center">
                                  <div className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border ${isComplete ? 'border-emerald-400 bg-emerald-400 text-[#062015]' : isCurrent ? 'border-emerald-300 bg-emerald-300/20 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,.22)]' : 'border-[#33483c] bg-[#101a14] text-gray-600'}`}>
                                    {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                                  </div>
                                  <span className={`mt-2 text-center text-[9px] leading-4 sm:text-[10px] ${isComplete || isCurrent ? 'font-semibold text-emerald-300' : 'text-gray-500'}`}>{['Placed', 'Confirmed', 'In transit', 'Delivered'][index]}</span>
                                </div>
                                {index < statusOrder.length - 1 && <div className={`mt-3 h-0.5 flex-1 ${index < progress || status === 'delivered' ? 'bg-emerald-400' : 'bg-[#293b30]'}`} />}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end border-t border-white/[0.06] pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <button type="button" onClick={() => openDetails(order)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/80 bg-emerald-950/35 px-4 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500 hover:text-[#05140c] sm:w-auto">
                      View details <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="order-details-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null); }}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-emerald-800/70 bg-[#0d1711] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-400">Order details</p>
                <h2 id="order-details-title" className="mt-1 text-2xl font-black text-white">{cropFor(selectedOrder)}</h2>
                <p className="mt-1 font-mono text-xs text-gray-500">{selectedOrder.id}</p>
              </div>
              <button type="button" aria-label="Close order details" onClick={() => setSelectedOrder(null)} className="rounded-xl border border-white/10 p-2 text-gray-400 hover:bg-white/5 hover:text-white"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20">
              <CommodityImage name={cropFor(selectedOrder)} title={cropFor(selectedOrder)} className="h-36 w-full" imageClassName="h-36 w-full object-cover" />
              <div className="px-3 py-2 text-sm font-bold text-gray-200">{cropFor(selectedOrder)}{selectedOrder.quality_grade ? ` · ${selectedOrder.quality_grade}` : ''}</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3"><p className="text-xs text-gray-500">Quantity</p><p className="mt-1 text-lg font-bold text-white">{quantityFor(selectedOrder).toLocaleString('en-IN', { maximumFractionDigits: 2 })} kg</p></div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3"><p className="text-xs text-gray-500">Total</p><p className="mt-1 text-lg font-bold text-emerald-300">{currency(amountFor(selectedOrder))}</p></div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3"><p className="text-xs text-gray-500">Unit price</p><p className="mt-1 text-lg font-bold text-white">{currency(priceFor(selectedOrder))}/kg</p></div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3"><p className="text-xs text-gray-500">Placed on</p><p className="mt-1 text-sm font-bold text-white">{formatDate(selectedOrder.created_at)}</p></div>
            </div>
            <div className="mt-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
              <p className="text-xs text-gray-500">Order status</p>
              <span className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold uppercase ${statusStyles(orderStatus(selectedOrder))}`}>{statusLabel(orderStatus(selectedOrder))}</span>
              <p className="mt-3 text-sm text-gray-400">Seller: <span className="text-gray-200">{selectedOrder.seller_name || 'Seller details unavailable'}</span></p>
              <div className="mt-2 rounded-xl border border-white/[0.06] bg-[#08110c] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400"><MapPin className="h-4 w-4 text-emerald-400" /> Delivery address</p>
                  {!editingAddress && canEditDeliveryAddress(selectedOrder) && (
                    <button type="button" onClick={() => { setAddressDraft(addressText(selectedOrder.delivery_address)); setEditingAddress(true); setCancelConfirm(false); }} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/70 px-2.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-950/70">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>
                {editingAddress ? (
                  <div className="mt-3 space-y-2">
                    <textarea value={addressDraft} onChange={(event) => setAddressDraft(event.target.value)} rows={4} maxLength={1000} autoFocus placeholder="Enter full delivery address, landmark, town, district and PIN code" className="w-full resize-y rounded-xl border border-emerald-800/70 bg-[#050b07] p-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditingAddress(false); setAddressDraft(addressText(selectedOrder.delivery_address)); }} disabled={savingAddress} className="flex-1 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-60">Discard</button>
                      <button type="button" onClick={() => void saveAddress()} disabled={savingAddress || addressDraft.trim().length < 5} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-bold text-[#06150d] hover:bg-emerald-400 disabled:opacity-60">
                        <Save className="h-4 w-4" /> {savingAddress ? 'Saving…' : 'Save address'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 whitespace-pre-line break-words text-sm text-gray-200">{addressText(selectedOrder.delivery_address) || 'No delivery address saved yet. Choose Edit to add one.'}</p>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-400">Payment: <span className="capitalize text-gray-200">{selectedOrder.payment_status || 'Not provided'}</span></p>
              {selectedOrder.cancellation_reason && <p className="mt-2 text-sm text-rose-300">Cancellation note: {selectedOrder.cancellation_reason}</p>}
            </div>
            {cancelConfirm && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/[0.07] p-3">
                <p className="text-sm font-bold text-rose-100">Cancel this order?</p>
                <p className="mt-1 text-xs leading-5 text-rose-100/70">This can only be done before the seller accepts it. The reserved stock will be returned to inventory.</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setCancelConfirm(false)} disabled={cancellingOrder} className="flex-1 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-60">Keep order</button>
                  <button type="button" onClick={() => void cancelSelectedOrder()} disabled={cancellingOrder} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-rose-500 disabled:opacity-60">
                    <Ban className="h-4 w-4" /> {cancellingOrder ? 'Cancelling…' : 'Confirm cancel'}
                  </button>
                </div>
              </div>
            )}
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {canCancelOrder(selectedOrder) && !cancelConfirm && (
                <button type="button" onClick={() => { setCancelConfirm(true); setEditingAddress(false); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/50 px-4 py-3 font-bold text-rose-200 transition hover:bg-rose-500/10">
                  <Ban className="h-4 w-4" /> Cancel order
                </button>
              )}
              <button type="button" onClick={() => { setSelectedOrder(null); setEditingAddress(false); setCancelConfirm(false); }} className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-[#06150d] transition hover:bg-emerald-400">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
