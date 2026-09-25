'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Check,
  MapPin,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { IOrder, OrderStatus } from '@campustuck/shared';
import { ordersAPI } from '../../../lib/api';
import { useSocket } from '../../../contexts/SocketContext';
import { useToast } from '../../../components/Toast';
import { PriceTag } from '../../../components/PriceTag';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { socket, connected, joinOrder, leaveOrder } = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await ordersAPI.getById(id);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          toast.error('Order not found.');
          router.push('/orders');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load order.');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    }

    if (id) loadOrder();
  }, [id]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!id || !socket) return;
    joinOrder(id);

    const handleStatusUpdate = (updated: IOrder) => {
      if (updated._id === id || updated.orderNumber === id) {
        setOrder(updated);
        toast.info(`Order status updated to "${updated.orderStatus.replace(/_/g, ' ')}"`);
      }
    };

    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      leaveOrder(id);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [id, socket]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await ordersAPI.cancel(order._id, 'Customer requested cancellation');
      if (res.success && res.order) {
        setOrder(res.order);
        setCancelModalOpen(false);
        toast.success('Your order has been cancelled.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="order-track-container text-center py-20 text-muted text-xs animate-pulse">
        Loading order details...
      </div>
    );
  }

  if (!order) return null;

  const isCancelled = order.orderStatus === 'cancelled';
  const isPickup = order.fulfilmentType === 'pickup';

  // Steps matching 08-Mobile-Order-Tracking.svg
  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'placed', label: 'Placed', desc: 'Your order is in the queue.' },
    { key: 'confirmed', label: 'Confirmed', desc: 'The store accepted your order.' },
    { key: 'preparing', label: 'Preparing', desc: 'Your items are being prepared.' },
    {
      key: isPickup ? 'ready_for_pickup' : 'out_for_delivery',
      label: isPickup ? 'Ready for pickup' : 'Out for delivery',
      desc: isPickup ? 'We will let you know soon.' : 'Delivery runner on their way.',
    },
  ];

  const statusOrderIndex: Record<string, number> = {
    placed: 0,
    confirmed: 1,
    preparing: 2,
    ready_for_pickup: 3,
    out_for_delivery: 3,
    completed: 4,
  };

  const currentIdx = statusOrderIndex[order.orderStatus] ?? 0;

  return (
    <div className="order-track-container max-w-4xl mx-auto">
      {/* Top Header (08-Mobile-Order-Tracking.svg) */}
      <div className="relative flex items-center justify-between pb-4 border-b border-line">
        <button
          type="button"
          onClick={() => router.push('/orders')}
          className="p-1 text-ink hover:text-leaf transition-colors"
          aria-label="Back to orders"
        >
          <ChevronLeft size={28} />
        </button>

        <h1 className="text-[17px] font-[750] text-ink text-center">Order details</h1>

        <div className="w-8" />
      </div>

      {/* Confirmation Hero Circle & Heading (08-Mobile-Order-Tracking.svg) */}
      <div className="text-center pt-2">
        <div className="order-hero-circle">
          <Check size={44} strokeWidth={2.4} />
        </div>

        <h2 className="text-[21px] font-[780] text-ink">
          {order.orderStatus === 'completed'
            ? 'Order complete!'
            : isCancelled
            ? 'Order cancelled'
            : 'Order confirmed!'}
        </h2>

        <p className="text-xs text-muted mt-1.5">
          {order.orderStatus === 'completed'
            ? 'Thank you for ordering with CampusTuck.'
            : isCancelled
            ? 'This order was cancelled.'
            : 'We are getting your order ready.'}
        </p>

        {/* Order ID badge */}
        <div className="inline-block mt-3">
          <span className="px-3.5 py-1.5 rounded-full bg-canvas-soft text-leaf font-semibold text-xs border border-line">
            #{order.orderNumber}
          </span>
        </div>
      </div>

      {/* Responsive Dual-Column Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
        {/* Left Column: Progress Timeline (6 Cols on Desktop) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Order Progress Card with Vertical Timeline (08-Mobile-Order-Tracking.svg) */}
          {!isCancelled ? (
            <div className="order-progress-card">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-[750] text-ink">Order progress</h3>
                <span className="flex items-center gap-1.5 text-[10px] text-leaf font-semibold bg-canvas-soft px-2.5 py-1 rounded-full">
                  <span className={`w-2 h-2 rounded-full ${connected ? 'bg-leaf animate-pulse' : 'bg-amber-500'}`} />
                  {connected ? 'Live tracking' : 'Reconnecting...'}
                </span>
              </div>

              <div className="space-y-6 pt-2">
                {steps.map((step, idx) => {
                  const isDone = currentIdx > idx || order.orderStatus === 'completed';
                  const isCurrent = currentIdx === idx && order.orderStatus !== 'completed';
                  const isPending = currentIdx < idx;
                  const isLast = idx === steps.length - 1;

                  return (
                    <div key={step.key} className="timeline-step-row">
                      {!isLast && <div className="timeline-connecting-line" />}

                      <div
                        className={`timeline-step-circle ${
                          isDone ? 'done' : isCurrent ? 'current' : 'pending'
                        }`}
                      >
                        {isDone ? (
                          <Check size={14} strokeWidth={2.6} />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-leaf" />
                        ) : null}
                      </div>

                      <div className="flex-1">
                        <p className="text-[12px] font-bold text-ink leading-tight">{step.label}</p>
                        <p className="text-[10px] text-muted mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-rose-900 text-sm">Order Cancelled</h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Stock has been returned to the campus tuck shop inventory.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Location & Receipt Breakdown (6 Cols on Desktop) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Pickup Location Card (08-Mobile-Order-Tracking.svg) */}
          <div className="bg-canvas-soft rounded-[18px] p-5 flex items-start gap-3.5 border border-line shadow-xs">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-leaf shrink-0 shadow-sm mt-0.5">
              <MapPin size={18} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-ink">
                {isPickup ? 'Campus Pickup Point' : 'Hostel / Department Delivery'}
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                {isPickup
                  ? order.fulfilmentDetails?.pickupPoint || 'Main Student Tuck Shop (Central Cafeteria Ground Floor)'
                  : `${order.fulfilmentDetails?.building || ''} • Room ${order.fulfilmentDetails?.room || ''}`}
              </p>
              <p className="text-[10px] font-bold text-leaf mt-1">Est. 20 minutes</p>
            </div>
          </div>

          {/* Order Items Breakdown */}
          <div className="bg-white rounded-[18px] border border-line p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Items in order</h3>
            <div className="divide-y divide-line">
              {order.items.map((item, i) => (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                  <span className="font-medium text-ink">
                    {item.quantity} × {item.name}
                  </span>
                  <PriceTag paisa={item.subtotal} size="sm" className="font-bold text-ink" />
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-3 flex justify-between items-center text-xs">
              <span className="font-bold text-ink">Total settled (COD)</span>
              <PriceTag paisa={order.total} size="md" className="font-bold text-ink" />
            </div>
          </div>

          {/* Cancel Order Action if early in flow */}
          {!isCancelled && ['placed', 'confirmed'].includes(order.orderStatus) && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
              >
                Need to cancel this order?
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-ink">Cancel your order?</h3>
            <p className="text-xs text-muted">
              Are you sure you want to cancel order #{order.orderNumber}? Reserved items will be returned to the campus shop.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="secondary-button !min-h-[38px] !text-xs flex-1"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="primary-button !bg-rose-600 !hover:bg-rose-700 !min-h-[38px] !text-xs flex-1"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
