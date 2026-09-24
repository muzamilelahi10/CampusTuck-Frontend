'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, Banknote, Clock } from 'lucide-react';
import { ordersAPI } from '../../../../lib/api';
import { IOrder } from '@campustuck/shared';
import { PriceTag } from '../../../../components/PriceTag';

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await ordersAPI.getById(id);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center text-xs text-slate-400">
        Loading confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center text-xs text-slate-400">
        Order not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8 text-center">
      {/* Success Badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Order Placed Successfully!
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Thank you for ordering with CampusTuck
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Your order has been received by the COMSATS University Islamabad tuck shop and is currently being prepared.
        </p>
      </div>

      {/* Order Reference Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-left shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Order Reference
            </span>
            <span className="text-lg font-black text-emerald-700">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Due (COD)
            </span>
            <PriceTag paisa={order.total} size="md" />
          </div>
        </div>

        {/* Fulfilment Info */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <Package className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">
                {order.fulfilmentType === 'pickup' ? 'Campus Pickup Point:' : 'Hostel / Dept Delivery to:'}
              </span>
              <p className="text-slate-600 mt-0.5">
                {order.fulfilmentType === 'pickup'
                  ? order.fulfilmentDetails.pickupPoint
                  : `${order.fulfilmentDetails.building}, ${order.fulfilmentDetails.room}`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Banknote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Cash Payment:</span>
              <p className="text-slate-600 mt-0.5">
                Please have Rs. {(order.total / 100).toFixed(0)} ready in cash upon receiving the order.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/orders/${order._id}`}
            className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95 text-center"
          >
            <span>Track Order Live</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/catalog"
            className="py-3.5 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs text-center transition-colors"
          >
            Keep Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
