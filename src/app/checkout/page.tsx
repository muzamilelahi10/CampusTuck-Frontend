'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
} from 'lucide-react';
import {
  DEFAULT_PICKUP_POINTS,
  DEFAULT_CAMPUS_BUILDINGS,
  FulfilmentType,
} from '@campustuck/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { ordersAPI } from '../../lib/api';
import { PriceTag } from '../../components/PriceTag';
import { useToast } from '../../components/Toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { toast } = useToast();

  const [fulfilmentType, setFulfilmentType] = useState<FulfilmentType>('pickup');
  const [pickupPoint, setPickupPoint] = useState<string>(DEFAULT_PICKUP_POINTS[0]);
  const [building, setBuilding] = useState<string>(
    user?.savedDeliveryDetails?.building || DEFAULT_CAMPUS_BUILDINGS[0]
  );
  const [room, setRoom] = useState<string>(user?.savedDeliveryDetails?.room || '');
  const [fullName, setFullName] = useState<string>(user?.name || 'Muzamil Elahi');
  const [phone, setPhone] = useState<string>(user?.phone || '+92 300 1234567');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (user) {
      if (user.name && (!fullName || fullName === 'Muzamil Elahi')) setFullName(user.name);
      if (user.phone && (!phone || phone === '+92 300 1234567')) setPhone(user.phone);
    }
  }, [user]);

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-14 p-8 bg-white rounded-[24px] border border-line text-center shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-full bg-canvas-soft text-leaf flex items-center justify-center mx-auto">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink">Sign in to checkout</h2>
          <p className="text-xs text-muted mt-1">
            Please log in with your campus account to complete your order and track live preparation.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link
            href="/login?redirect=/checkout"
            className="flex-1 py-3 rounded-full bg-lime text-ink font-bold text-xs hover:bg-[#cfe569] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register?redirect=/checkout"
            className="flex-1 py-3 rounded-full border border-line text-ink font-bold text-xs hover:bg-canvas transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-14 p-8 bg-white rounded-[24px] border border-line text-center shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-ink">Your bag is empty</h2>
        <p className="text-xs text-muted">Add some items before heading to checkout.</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-lime text-ink font-bold text-xs"
        >
          <span>Browse essentials</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 8) {
      setErrorMsg('Please enter a valid phone number so we can notify you.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload: any = {
        fulfilmentType: fulfilmentType === 'pickup' ? 'pickup' : 'delivery',
        phone: phone.trim(),
        idempotencyKey: `CT-IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      };

      if (fulfilmentType === 'pickup') {
        orderPayload.pickupPoint = pickupPoint;
      } else {
        orderPayload.building = building;
        orderPayload.room = room || 'Reception';
      }

      const res = await ordersAPI.checkout(orderPayload);
      if (res.success && res.order) {
        clearCart();
        toast.success('Order placed successfully! Tracking your items.');
        router.push(`/orders/${res.order._id}`);
      } else {
        setErrorMsg(res.message || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please check your network.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-32 md:pb-16 space-y-6">
      {/* Checkout Title & Step Breadcrumb (Figma 15-Mobile & 05-Desktop) */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-[800] text-ink tracking-tight">Checkout</h1>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-leaf">
          01 Delivery <span className="text-muted/60">→</span> 02 Details{' '}
          <span className="text-muted/60">→</span> 03 Review
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-[16px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Sections */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Fulfilment Selection */}
          <div className="bg-white rounded-[24px] border border-line/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-extrabold text-ink">How would you like it?</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pickup Option */}
              <button
                type="button"
                onClick={() => setFulfilmentType('pickup')}
                className={`p-4 rounded-[18px] border text-left transition-all relative ${
                  fulfilmentType === 'pickup'
                    ? 'border-leaf bg-canvas-soft/80 shadow-xs'
                    : 'border-line bg-white hover:bg-canvas-soft/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-ink">Pickup at CUI kiosk</span>
                  {fulfilmentType === 'pickup' && (
                    <div className="w-5 h-5 rounded-full bg-leaf text-lime flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted mt-1">Ready in approx 20 minutes • Free</p>
              </button>

              {/* Delivery Option */}
              <button
                type="button"
                onClick={() => setFulfilmentType('delivery')}
                className={`p-4 rounded-[18px] border text-left transition-all relative ${
                  fulfilmentType === 'delivery'
                    ? 'border-leaf bg-canvas-soft/80 shadow-xs'
                    : 'border-line bg-white hover:bg-canvas-soft/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-ink">Hostel or department</span>
                  {fulfilmentType === 'delivery' && (
                    <div className="w-5 h-5 rounded-full bg-leaf text-lime flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted mt-1">Campus delivery available</p>
              </button>
            </div>

            {/* Sub-inputs based on fulfilment */}
            {fulfilmentType === 'pickup' ? (
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
                  Pickup point
                </label>
                <select
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink focus:outline-none focus:border-leaf"
                >
                  {DEFAULT_PICKUP_POINTS.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
                    Campus building
                  </label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink focus:outline-none focus:border-leaf"
                  >
                    {DEFAULT_CAMPUS_BUILDINGS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
                    Room / Desk #
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Room 302, 3rd Floor"
                    className="w-full px-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink focus:outline-none focus:border-leaf"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Contact Details */}
          <div className="bg-white rounded-[24px] border border-line/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-extrabold text-ink">Your details</h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Muzamil Elahi"
                  className="w-full px-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink focus:outline-none focus:border-leaf"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
                  Phone number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink focus:outline-none focus:border-leaf"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment */}
          <div className="bg-white rounded-[24px] border border-line/70 p-5 sm:p-6 space-y-3 shadow-xs">
            <h2 className="text-sm font-extrabold text-ink">Payment</h2>

            <div className="p-4 rounded-[18px] border border-leaf bg-canvas-soft/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-leaf flex items-center justify-center font-bold text-xs shadow-xs">
                  💵
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-ink">Cash on pickup</p>
                  <p className="text-[11px] text-muted">Pay at the counter when collecting your items</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full bg-leaf text-lime flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (Desktop) & Bottom Bar (Mobile) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-[24px] border border-line/70 p-6 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-ink">Your order</h2>

            {/* Items Mini List */}
            <div className="space-y-3 border-b border-line/60 pb-4 text-xs">
              {items.map(({ product: p, quantity }) => (
                <div key={p._id} className="flex items-center justify-between text-muted">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-bold text-ink">{quantity}×</span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  <PriceTag paisa={p.price * quantity} size="sm" className="font-bold text-ink shrink-0" />
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-ink">Total</span>
              <PriceTag paisa={subtotal} size="lg" className="font-[900] text-xl text-ink" />
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-full bg-lime hover:bg-[#cfe569] text-ink font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              <span>{submitting ? 'Placing order...' : `Place order • Rs. ${Math.round(subtotal / 100)}`}</span>
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>

            {/* Guarantee note */}
            <div className="rounded-[16px] bg-canvas-soft p-3 text-[11px] text-muted flex items-start gap-2">
              <Zap size={13} className="text-leaf shrink-0 mt-0.5" />
              <span>Need it between classes? All items are reserved immediately upon order placement.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
