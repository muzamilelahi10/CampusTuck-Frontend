'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  MapPin,
  Check,
  ShieldCheck,
  ArrowRight,
  Package,
  Bike,
} from 'lucide-react';
import {
  DEFAULT_PICKUP_POINTS,
  DEFAULT_CAMPUS_BUILDINGS,
  DEFAULT_DELIVERY_FEE_PAISA,
  PICKUP_FEE_PAISA,
  FulfilmentType,
} from '@campustuck/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { ordersAPI } from '../../lib/api';
import { PriceTag } from '../../components/PriceTag';
import { useToast } from '../../components/Toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { toast } = useToast();

  const [fulfilmentType, setFulfilmentType] = useState<FulfilmentType>('pickup');
  const [pickupPoint, setPickupPoint] = useState<string>(DEFAULT_PICKUP_POINTS[0]);
  const [building, setBuilding] = useState<string>(
    user?.savedDeliveryDetails?.building || DEFAULT_CAMPUS_BUILDINGS[0]
  );
  const [room, setRoom] = useState<string>(user?.savedDeliveryDetails?.room || '');
  const [phone, setPhone] = useState<string>(user?.phone || '+92 321 7654321');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>(
    user?.savedDeliveryDetails?.notes || ''
  );
  const [saveToProfile, setSaveToProfile] = useState<boolean>(true);

  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const key = `CT-IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    setIdempotencyKey(key);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.phone && !phone) setPhone(user.phone);
      if (user.savedDeliveryDetails) {
        if (user.savedDeliveryDetails.building) setBuilding(user.savedDeliveryDetails.building);
        if (user.savedDeliveryDetails.room) setRoom(user.savedDeliveryDetails.room);
        if (user.savedDeliveryDetails.notes && !deliveryInstructions) {
          setDeliveryInstructions(user.savedDeliveryDetails.notes);
        }
      }
    }
  }, [user]);

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-[18px] border border-line text-center shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-canvas-soft text-leaf flex items-center justify-center mx-auto">
          <ShieldCheck size={28} />
        </div>
        <h2 className="text-xl font-bold text-ink">Sign in to Checkout</h2>
        <p className="text-xs text-muted">
          Please log in to complete your campus order and track live preparation.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/login?redirect=/checkout"
            className="primary-button !min-h-[42px] !text-xs flex-1"
          >
            Sign In
          </Link>
          <Link
            href="/register?redirect=/checkout"
            className="secondary-button !min-h-[42px] !text-xs flex-1"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-[18px] border border-line text-center shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-ink">Your Cart is Empty</h2>
        <p className="text-xs text-muted">Add items to your cart before proceeding to checkout.</p>
        <Link href="/catalog" className="primary-button !min-h-[42px] !text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const deliveryFee = fulfilmentType === 'delivery' ? DEFAULT_DELIVERY_FEE_PAISA : PICKUP_FEE_PAISA;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phone || phone.trim().length < 9) {
      setErrorMsg('Please enter a valid campus contact phone number.');
      return;
    }

    if (fulfilmentType === 'delivery' && (!building || !room)) {
      setErrorMsg('Please enter both campus building and room/office number for delivery.');
      return;
    }

    setSubmitting(true);

    try {
      if (saveToProfile && fulfilmentType === 'delivery') {
        updateProfile({
          phone: phone.trim(),
          savedDeliveryDetails: { building, room, notes: deliveryInstructions },
        }).catch(() => {});
      }

      const payload = {
        fulfilmentType,
        pickupPoint: fulfilmentType === 'pickup' ? pickupPoint : undefined,
        building: fulfilmentType === 'delivery' ? building : undefined,
        room: fulfilmentType === 'delivery' ? room : undefined,
        phone: phone.trim(),
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        idempotencyKey,
      };

      const res = await ordersAPI.checkout(payload);

      if (res.success && res.order) {
        await clearCart();
        toast.success(`Order #${res.order.orderNumber} placed successfully!`);
        router.push(`/orders/${res.order._id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please check stock and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-container">
      {/* Header (07-Mobile-Checkout.svg) */}
      <div className="relative flex items-center justify-between pb-4 border-b border-line">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 text-ink hover:text-leaf transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={28} />
        </button>

        <h1 className="text-[17px] font-[750] text-ink text-center">Checkout</h1>

        <div className="w-8" />
      </div>

      {errorMsg && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="space-y-6">
        {/* Fulfilment Segmented Control (07-Mobile-Checkout.svg) */}
        <div>
          <h2 className="checkout-section-title">How would you like your order?</h2>

          <div className="checkout-segmented-control">
            <button
              type="button"
              onClick={() => setFulfilmentType('pickup')}
              className={`checkout-seg-btn ${fulfilmentType === 'pickup' ? 'active' : ''}`}
            >
              Campus pickup
            </button>
            <button
              type="button"
              onClick={() => setFulfilmentType('delivery')}
              className={`checkout-seg-btn ${fulfilmentType === 'delivery' ? 'active' : ''}`}
            >
              Delivery
            </button>
          </div>
        </div>

        {/* Location Selection */}
        <div>
          <h2 className="checkout-section-title">
            {fulfilmentType === 'pickup' ? 'Pickup location' : 'Delivery details'}
          </h2>

          {fulfilmentType === 'pickup' ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted font-medium mb-1 block">Campus pickup counter</label>
                <select
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  className="checkout-input-box"
                >
                  {DEFAULT_PICKUP_POINTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="checkout-card-box">
                <div className="w-8 h-8 rounded-full bg-canvas-soft flex items-center justify-center text-leaf shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-ink">{pickupPoint}</p>
                  <p className="text-[10px] text-muted">Ready in ~20 minutes • Pay cash at pickup counter</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted font-medium mb-1 block">Campus building / hostel</label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="checkout-input-box"
                >
                  {DEFAULT_CAMPUS_BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted font-medium mb-1 block">Room / office number</label>
                <input
                  type="text"
                  required
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Room 204"
                  className="checkout-input-box"
                />
              </div>

              <div>
                <label className="text-xs text-muted font-medium mb-1 block">
                  Delivery instructions (optional)
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Anything we should know?"
                  className="checkout-input-box"
                />
              </div>
            </div>
          )}
        </div>

        {/* Contact Phone Number (07-Mobile-Checkout.svg) */}
        <div>
          <h2 className="checkout-section-title">Contact number</h2>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 3XX XXXXXXX"
            className="checkout-input-box"
          />
        </div>

        {/* Payment Method (07-Mobile-Checkout.svg) */}
        <div>
          <h2 className="checkout-section-title">Payment method</h2>

          <div className="checkout-payment-box">
            <div className="w-5 h-5 rounded-full border-2 border-leaf bg-white flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-leaf" />
            </div>

            <div>
              <p className="text-[12px] font-bold text-ink">
                {fulfilmentType === 'pickup' ? 'Cash at pickup' : 'Cash on delivery'}
              </p>
              <p className="text-[10px] text-muted">
                {fulfilmentType === 'pickup'
                  ? 'Pay when you collect your order'
                  : 'Pay cash when your order is handed over'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary (07-Mobile-Checkout.svg) */}
        <div className="bg-white rounded-[16px] border border-line p-5 space-y-3">
          <h2 className="text-[13px] font-[750] text-ink">Order summary</h2>

          <div className="flex justify-between text-xs text-muted">
            <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
            <PriceTag paisa={subtotal} size="sm" className="font-bold text-ink" />
          </div>

          <div className="flex justify-between text-xs text-muted">
            <span>{fulfilmentType === 'pickup' ? 'Pickup fee' : 'Delivery fee'}</span>
            {deliveryFee === 0 ? (
              <span className="font-bold text-leaf text-xs">Free</span>
            ) : (
              <PriceTag paisa={deliveryFee} size="sm" className="font-bold text-ink" />
            )}
          </div>
        </div>

        {/* Bottom Total & Place Order Button (07-Mobile-Checkout.svg) */}
        <div className="pt-2 space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-muted">Total to pay</span>
            <PriceTag paisa={grandTotal} size="xl" className="font-[760] text-[20px] text-ink" />
          </div>

          <button
            type="submit"
            disabled={submitting || !idempotencyKey}
            className="primary-button w-full !min-h-[52px] !rounded-[15px] !text-[13px]"
          >
            <span>{submitting ? 'Placing order...' : 'Place order'}</span>
            <ArrowRight size={17} />
          </button>

          <p className="text-center text-[10px] text-muted">
            {fulfilmentType === 'pickup'
              ? 'Cash is collected at pickup'
              : 'Cash is collected upon delivery'}
          </p>
        </div>
      </form>
    </div>
  );
}
