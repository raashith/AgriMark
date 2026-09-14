'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { MarketplaceOrder } from '@/types';
import { ShoppingBag, Truck, CheckCircle2, Clock } from 'lucide-react';

export default function BuyerOrdersPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.getOrders();
      setOrders(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-400" /> My Marketplace Orders
        </h1>
        <p className="text-sm text-gray-400">Track order fulfillment, atomic inventory reservations, and delivery status.</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-8">{t('loading')}</p>
      ) : orders.length === 0 ? (
        <div className="p-8 bg-[#121a16] border border-dashed border-[#1e2d26] rounded-2xl text-center text-sm text-gray-400">
          No orders placed yet. Browse the marketplace to place your first order.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-emerald-400">Order ID: {order.id.slice(0, 8)}...</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    order.status === 'delivered'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-100">Quantity: {order.quantity_kg} KG</p>
                <p className="text-xs text-gray-400">Total Price: ₹{order.total_price}</p>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Status: {order.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
