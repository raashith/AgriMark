'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { MarketplaceOrder } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
  CheckCircle2, Clock3, PackageCheck, RefreshCw, Search, ShoppingBag,
  Truck, XCircle, UserRound, Phone, MapPin, CalendarDays, ChevronDown,
} from 'lucide-react';

type OrderStatus = 'all' | 'pending' | 'processing' | 'in_transit' | 'delivered' | 'cancelled';

const filters: { id: OrderStatus; label: string }[] = [
  { id: 'all', label: 'All orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'in_transit', label: 'In transit' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

function normalizedStatus(value?: string): OrderStatus {
  const status = String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (['delivered', 'complete', 'completed'].includes(status)) return 'delivered';
  if (['in_transit', 'dispatched', 'shipped', 'out_for_delivery', 'ready_for_dispatch'].includes(status)) return 'in_transit';
  if (['confirmed', 'accepted', 'processing', 'packed', 'preparing'].includes(status)) return 'processing';
  if (['cancelled', 'canceled', 'rejected', 'refunded'].includes(status)) return 'cancelled';
  return 'pending';
}

function statusClasses(status: OrderStatus) {
  if (status === 'delivered') return 'border-emerald-700/50 bg-emerald-950/60 text-emerald-300';
  if (status === 'in_transit') return 'border-cyan-700/50 bg-cyan-950/50 text-cyan-300';
  if (status === 'processing') return 'border-sky-700/50 bg-sky-950/50 text-sky-300';
  if (status === 'cancelled') return 'border-rose-800/50 bg-rose-950/40 text-rose-300';
  return 'border-amber-800/50 bg-amber-950/40 text-amber-300';
}

function displayDate(value?: string) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function currency(value: unknown) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function quantity(order: MarketplaceOrder) {
  return Number(order.quantity_kg ?? order.quantity ?? 0);
}

function amount(order: MarketplaceOrder) {
  return Number(order.total_price ?? order.total_amount ?? 0);
}

function addressText(value: MarketplaceOrder['delivery_address']) {
  if (!value) return 'No delivery address supplied yet';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 'No delivery address supplied yet';
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') return addressText(parsed as MarketplaceOrder['delivery_address']);
    } catch {}
    return trimmed;
  }
  if (typeof value !== 'object') return 'No delivery address supplied yet';
  if (typeof value.formatted_address === 'string') return value.formatted_address;
  const keys = ['full_name', 'phone', 'house_number', 'street', 'area', 'landmark', 'city', 'district', 'state', 'postal_code'];
  const parts = keys.map((key) => value[key]).filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
  return parts.length ? parts.join(', ') : 'No delivery address supplied yet';
}

function OrderCard({ order, expanded, onToggle }: {
  order: MarketplaceOrder;
  expanded: boolean;
  onToggle: () => void;
}) {
  const status = normalizedStatus(order.status);
  const buyerName = order.buyer_name?.trim() || 'Buyer name not provided';
  const title = order.crop_name?.trim() || order.listing_title?.trim() || 'Produce listing';

  return (
    <article className="overflow-hidden rounded-2xl border border-[#20362b] bg-[#0b1711] shadow-lg shadow-black/10">
      <button type="button" onClick={onToggle} aria-expanded={expanded}
        className="flex w-full flex-col gap-4 p-4 text-left transition hover:bg-emerald-950/15 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-800/50 bg-emerald-950/60">
            <ShoppingBag className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-bold text-white sm:text-lg">{title}</h2>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClasses(status)}`}>
                {status === 'delivered' ? <CheckCircle2 className="h-3 w-3" /> : status === 'in_transit' ? <Truck className="h-3 w-3" /> : status === 'cancelled' ? <XCircle className="h-3 w-3" /> : status === 'processing' ? <PackageCheck className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                {status === 'in_transit' ? 'In transit' : status}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-gray-500">Order #{order.id}</p>
            <p className="mt-2 text-sm text-gray-300">
              Buyer: <span className="font-semibold text-emerald-200">{buyerName}</span>
              {order.buyer_organization ? <span className="text-gray-500"> · {order.buyer_organization}</span> : null}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-5 pl-14 sm:pl-[3.5rem] lg:pl-0">
          <div className="grid grid-cols-2 gap-5 sm:gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Quantity</p>
              <p className="mt-1 text-sm font-bold text-white">{quantity(order).toLocaleString('en-IN')} kg</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Order total</p>
              <p className="mt-1 text-sm font-black text-emerald-300">{currency(amount(order))}</p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#20362b] bg-black/20 p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <section className="rounded-xl border border-[#20362b] bg-[#0a100d] p-4">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <UserRound className="h-4 w-4" /> Buyer details
              </h3>
              <p className="mt-3 text-sm font-bold text-white">{buyerName}</p>
              {order.buyer_organization && <p className="mt-1 text-sm text-gray-300">{order.buyer_organization}</p>}
              {order.buyer_type && <p className="mt-1 text-xs capitalize text-gray-500">{order.buyer_type.replace(/_/g, ' ')}</p>}
              {order.buyer_phone ? (
                <a href={`tel:${order.buyer_phone}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200">
                  <Phone className="h-4 w-4" /> {order.buyer_phone}
                </a>
              ) : <p className="mt-3 text-xs text-gray-500">Buyer phone number not available.</p>}
            </section>

            <section className="rounded-xl border border-[#20362b] bg-[#0a100d] p-4">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <PackageCheck className="h-4 w-4" /> Order summary
              </h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-start justify-between gap-3"><dt className="text-gray-500">Listing</dt><dd className="text-right font-semibold text-gray-200">{order.listing_title || title}</dd></div>
                <div className="flex items-start justify-between gap-3"><dt className="text-gray-500">Grade</dt><dd className="text-right text-gray-200">{order.quality_grade || 'Not specified'}</dd></div>
                <div className="flex items-start justify-between gap-3"><dt className="text-gray-500">Unit price</dt><dd className="text-right text-gray-200">{currency(order.unit_price ?? (quantity(order) ? amount(order) / quantity(order) : 0))} / kg</dd></div>
                <div className="flex items-start justify-between gap-3"><dt className="text-gray-500">Placed</dt><dd className="text-right text-gray-200">{displayDate(order.created_at)}</dd></div>
              </dl>
            </section>

            <section className="rounded-xl border border-[#20362b] bg-[#0a100d] p-4 md:col-span-2 xl:col-span-1">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <MapPin className="h-4 w-4" /> Delivery details
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-300">{addressText(order.delivery_address)}</p>
              {order.buyer_note && <p className="mt-3 border-t border-[#20362b] pt-3 text-xs leading-5 text-gray-400">Buyer note: {order.buyer_note}</p>}
            </section>
          </div>
        </div>
      )}
    </article>
  );
}

export default function FarmerOrdersPage() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const rows = await api.getOrders();
      const received = (Array.isArray(rows) ? rows : []).filter((order) => order.seller_id === user?.id);
      setOrders(received);
      if (typeof window !== 'undefined') {
        const orderId = new URLSearchParams(window.location.search).get('order_id');
        if (orderId && received.some((order) => order.id === orderId)) {
          setExpandedOrderId(orderId);
          setHighlightedOrderId(orderId);
        }
      }
    } catch (error) {
      console.error('[AgriMark] Unable to load received orders', error);
      showError('Could not load received orders', error instanceof Error ? error.message : 'Please retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, showError]);

  useEffect(() => {
    if (user?.id) void fetchOrders();
    else setLoading(false);
  }, [user?.id, fetchOrders]);

  const counts = useMemo(() => {
    const result: Record<OrderStatus, number> = { all: orders.length, pending: 0, processing: 0, in_transit: 0, delivered: 0, cancelled: 0 };
    orders.forEach((order) => { result[normalizedStatus(order.status)] += 1; });
    return result;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders.filter((order) => {
      const status = normalizedStatus(order.status);
      const matchesFilter = activeFilter === 'all' || status === activeFilter;
      const searchText = [
        order.id, order.listing_title, order.crop_name, order.buyer_name,
        order.buyer_organization, order.buyer_phone, order.status,
      ].filter(Boolean).join(' ').toLowerCase();
      return matchesFilter && (!needle || searchText.includes(needle));
    });
  }, [orders, search, activeFilter]);

  const newOrders = orders.filter((order) => normalizedStatus(order.status) === 'pending').length;

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin']}>
      <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-8">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-900/60 bg-gradient-to-br from-[#10251b] via-[#0b1711] to-[#07100c] p-5 shadow-[0_24px_80px_rgba(0,0,0,.2)] sm:p-7 lg:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-950/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Farmer workspace
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[42px]">
                Received <span className="text-emerald-400">Orders</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                New buyer purchases, buyer contact details, delivery information and order status in one place.
              </p>
            </div>
            <button type="button" onClick={() => void fetchOrders(true)} disabled={loading || refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-800/70 bg-black/25 px-4 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-950/50 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh orders
            </button>
          </div>
          <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total orders</p>
              <p className="mt-2 text-2xl font-black text-white">{loading ? '—' : orders.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pending</p>
              <p className="mt-2 text-2xl font-black text-amber-300">{loading ? '—' : newOrders}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Delivered</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{loading ? '—' : counts.delivered}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Order value</p>
              <p className="mt-2 text-xl font-black text-white">{loading ? '—' : currency(orders.filter((order) => normalizedStatus(order.status) !== 'cancelled').reduce((sum, order) => sum + amount(order), 0))}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[#20362b] bg-[#0b1510] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Order feed</h2>
              <p className="mt-1 text-xs text-gray-500">Only orders placed against listings from your account are shown.</p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search buyer, crop, order ID…"
                className="w-full rounded-xl border border-[#2a3c33] bg-[#070d09] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button key={filter.id} type="button" onClick={() => setActiveFilter(filter.id)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition ${activeFilter === filter.id ? 'border-emerald-500 bg-emerald-500 text-[#04100b]' : 'border-[#2a3c33] bg-black/10 text-gray-400 hover:text-white'}`}>
                {filter.label} <span className={activeFilter === filter.id ? 'ml-1' : 'ml-1 text-gray-500'}>{counts[filter.id]}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-[#20362b] bg-white/[.025]" />)
            ) : visibleOrders.length ? (
              visibleOrders.map((order) => (
                <div key={order.id} className={highlightedOrderId === order.id ? 'rounded-2xl ring-1 ring-emerald-400/70' : ''}>
                  <OrderCard order={order} expanded={expandedOrderId === order.id}
                    onToggle={() => setExpandedOrderId((current) => current === order.id ? null : order.id)} />
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#2a3c33] bg-black/10 px-4 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-800/40 bg-emerald-950/50">
                  <ShoppingBag className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{orders.length ? 'No matching orders' : 'No orders received yet'}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  {orders.length ? 'Try another status or search term.' : 'When a buyer purchases one of your listings, the order will appear here and a notification will arrive at the bell above.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
