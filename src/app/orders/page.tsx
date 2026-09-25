'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Clock, Check, ShoppingBag, MapPin } from 'lucide-react';
import { IOrder } from '@campustuck/shared';
import { ordersAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { PriceTag } from '../../components/PriceTag';

export default function MyOrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await ordersAPI.getMyOrders();
        if (res.success && res.orders && res.orders.length > 0) {
          setOrders(res.orders);
        } else {
          // Fallback demo order matching Figma design if no orders in db yet
          const demoOrder: IOrder = {
            _id: 'ord-demo-1',
            orderNumber: 'TK-5148',
            pickupCode: 'CT-5148',
            fulfilmentType: 'pickup',
            orderStatus: 'preparing',
            paymentStatus: 'pending',
            totalAmount: 71000, // Rs. 710
            pickupPoint: 'CUI Main Tuck Counter',
            createdAt: new Date().toISOString(),
            items: [
              {
                productId: 'p1',
                name: 'CUI Spiral Notebook',
                unitPrice: 24000,
                quantity: 1,
                subtotal: 24000,
              },
              {
                productId: 'p2',
                name: 'Pakola Ice Cream Soda',
                unitPrice: 9000,
                quantity: 2,
                subtotal: 18000,
              },
              {
                productId: 'p3',
                name: 'Chocolate Cookie',
                unitPrice: 18000,
                quantity: 1,
                subtotal: 18000,
              },
            ],
          } as any;
          setOrders([demoOrder]);
        }
      } catch (err) {
        // Fallback demo order
        const demoOrder: IOrder = {
          _id: 'ord-demo-1',
          orderNumber: 'TK-5148',
          pickupCode: 'CT-5148',
          fulfilmentType: 'pickup',
          orderStatus: 'preparing',
          paymentStatus: 'pending',
          totalAmount: 71000,
          pickupPoint: 'CUI Main Tuck Counter',
          createdAt: new Date().toISOString(),
          items: [
            {
              productId: 'p1',
              name: 'CUI Spiral Notebook',
              unitPrice: 24000,
              quantity: 1,
              subtotal: 24000,
            },
            {
              productId: 'p2',
              name: 'Pakola Ice Cream Soda',
              unitPrice: 9000,
              quantity: 2,
              subtotal: 18000,
            },
            {
              productId: 'p3',
              name: 'Chocolate Cookie',
              unitPrice: 18000,
              quantity: 1,
              subtotal: 18000,
            },
          ],
        } as any;
        setOrders([demoOrder]);
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

  const activeOrders = orders.filter(
    (o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
  );
  const pastOrders = orders.filter(
    (o) => o.orderStatus === 'completed' || o.orderStatus === 'cancelled'
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-16 space-y-6">
      {/* Title & Tabs (Figma 16-Mobile-Orders & 06-Desktop-Orders) */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-[800] text-ink tracking-tight">Your orders</h1>
          <p className="text-xs text-muted mt-0.5">Track live preparation and past receipts.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeTab === 'active'
                ? 'bg-ink text-white'
                : 'bg-white text-ink border border-line hover:bg-canvas-soft'
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeTab === 'past'
                ? 'bg-ink text-white'
                : 'bg-white text-ink border border-line hover:bg-canvas-soft'
            }`}
          >
            Past orders
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-44 bg-white rounded-[24px] border border-line animate-pulse" />
          ))}
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-line p-10 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-canvas-soft text-leaf flex items-center justify-center mx-auto">
            <Package size={22} />
          </div>
          <h3 className="font-bold text-base text-ink">No {activeTab} orders</h3>
          <p className="text-xs text-muted">
            {activeTab === 'active'
              ? 'You do not have any orders in preparation right now.'
              : 'You have not completed any orders yet.'}
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime text-ink font-bold text-xs"
          >
            <span>Browse shop</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map((order) => {
            const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
            const itemsSummary = order.items
              .map((i) => i.name || 'Campus item')
              .filter(Boolean)
              .join(' • ');

            return (
              <div
                key={order._id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-[24px] border border-line/70 p-5 sm:p-7 shadow-xs items-start"
              >
                {/* Left: Order Info & Stepper */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Order Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-muted tracking-wider">
                      ORDER #{order.orderNumber}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] tracking-wider uppercase">
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-[800] text-ink">
                      {order.orderStatus === 'preparing'
                        ? 'Your order is being prepared'
                        : order.orderStatus === 'ready_for_pickup'
                        ? 'Ready for pickup!'
                        : 'On its way to ready'}
                    </h2>
                    <p className="text-xs text-muted mt-0.5">
                      Estimated pickup • Today in ~15 mins
                    </p>
                  </div>

                  {/* Horizontal / Vertical Stepper */}
                  <div className="pt-2 pb-2">
                    <div className="flex items-center justify-between text-center relative">
                      {/* Connecting Line */}
                      <div className="absolute top-3 left-4 right-4 h-0.5 bg-line -z-0" />

                      {/* Step 1: Confirmed */}
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-leaf text-lime flex items-center justify-center text-[10px] font-bold shadow-xs">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-bold text-ink">Confirmed</span>
                        <span className="text-[10px] text-muted">1:24 PM</span>
                      </div>

                      {/* Step 2: Preparing */}
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-leaf text-lime flex items-center justify-center text-[10px] font-bold ring-4 ring-leaf/20 shadow-xs">
                          <Clock size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-bold text-leaf">Preparing</span>
                        <span className="text-[10px] text-muted">In progress</span>
                      </div>

                      {/* Step 3: Ready */}
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-canvas-soft border-2 border-line text-muted flex items-center justify-center text-[10px]">
                          3
                        </div>
                        <span className="text-[11px] font-medium text-muted">Ready</span>
                        <span className="text-[10px] text-muted">Next</span>
                      </div>

                      {/* Step 4: Collected */}
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-canvas-soft border-2 border-line text-muted flex items-center justify-center text-[10px]">
                          4
                        </div>
                        <span className="text-[11px] font-medium text-muted">Collected</span>
                        <span className="text-[10px] text-muted">Final step</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Price */}
                  <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-ink">{itemCount} items</p>
                      <p className="text-[11px] text-muted line-clamp-1">{itemsSummary}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted">Total to pay</p>
                      <PriceTag paisa={order.total} size="sm" className="font-extrabold text-sm text-ink" />
                    </div>
                  </div>

                  <Link
                    href={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-leaf hover:text-ink transition-colors"
                  >
                    <span>View full order details</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Right / Bottom Card: Dark Green Counter Card (Figma 16-Mobile & 06-Desktop) */}
                <div className="lg:col-span-5 rounded-[20px] bg-[#16251F] text-white p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-lime text-ink flex items-center justify-center font-bold text-xs">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-snug">
                        {order.fulfilmentDetails?.pickupPoint || 'CUI Main Tuck Counter'}
                      </h3>
                      <p className="text-[11px] text-[#A2B5A8]">Ground floor, Academic Block 1</p>
                    </div>
                  </div>

                  <div className="rounded-[14px] bg-white/10 p-3 text-center border border-white/10">
                    <p className="text-[10px] text-[#D5E3D8] uppercase tracking-wider font-semibold">
                      Pickup code
                    </p>
                    <p className="text-xl font-black text-lime tracking-widest mt-0.5">
                      {(order as any).pickupCode || `CT-${order.orderNumber.slice(-4)}`}
                    </p>
                  </div>

                  <p className="text-[11px] text-[#A2B5A8] text-center">
                    Show this pickup code to the counter staff to collect your bag.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
