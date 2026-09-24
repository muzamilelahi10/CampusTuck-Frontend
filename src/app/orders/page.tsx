'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Clock, ShoppingBag } from 'lucide-react';
import { IOrder } from '@campustuck/shared';
import { ordersAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriceTag } from '../../components/PriceTag';

export default function MyOrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await ordersAPI.getMyOrders();
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Sign in to view orders</h2>
        <p className="text-xs text-slate-500">
          Please log in to see your past purchases and track ongoing orders.
        </p>
        <Link
          href="/login?redirect=/orders"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Campus Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review previous receipts and follow real-time order delivery progress.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            You have not made any tuck shop orders yet. Browse the catalog and place your first order!
          </p>
          <Link
            href="/catalog"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const totalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base text-slate-900">{order.orderNumber}</span>
                    <StatusBadge status={order.orderStatus} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-PK', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} ({order.fulfilmentType})
                    </span>
                    <span>•</span>
                    <span className="capitalize">{order.paymentMethod.toUpperCase()} (Cash)</span>
                  </div>

                  <p className="text-[11px] text-slate-600 truncate max-w-md pt-0.5">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Total</span>
                    <PriceTag paisa={order.total} size="md" />
                  </div>

                  <Link
                    href={`/orders/${order._id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
