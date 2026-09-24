import React from 'react';
import { OrderStatus, PaymentStatus } from '@campustuck/shared';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string;
  type?: 'order' | 'payment';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, type = 'order', size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  if (type === 'payment') {
    switch (status) {
      case 'paid':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Paid (Cash Collected)
          </span>
        );
      case 'pending':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Cash on Delivery (Pending)
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {status}
          </span>
        );
    }
  }

  // Order status styling
  switch (status) {
    case 'placed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Order Placed
        </span>
      );
    case 'confirmed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Confirmed
        </span>
      );
    case 'preparing':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          Preparing Order
        </span>
      );
    case 'ready_for_pickup':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          Ready for Pickup!
        </span>
      );
    case 'out_for_delivery':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
          Out for Delivery
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Completed
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-800 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
