'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, Clock, ShoppingBag, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { PriceTag } from '../../components/PriceTag';
import { getProductImage } from '../../components/ProductCard';

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, updateQuantity, removeItem } = useCart();

  const isCartEmpty = items.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-16 space-y-6">
      {/* Page Title & Item Count */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-[800] text-ink tracking-tight">Your bag</h1>
        <p className="text-xs sm:text-sm text-muted mt-0.5">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} — ready for your next break.
        </p>
      </div>

      {isCartEmpty ? (
        <div className="bg-white rounded-[24px] border border-line p-10 sm:p-14 text-center my-6 max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-canvas-soft text-muted flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Your bag is empty</h2>
            <p className="text-xs text-muted mt-1">
              Find snacks, chilled drinks, and study goodies before your next class.
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-lime text-ink font-bold text-xs hover:bg-[#cfe569] transition-all w-full"
          >
            <span>Browse campus essentials</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Bag Items List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-[24px] border border-line/70 p-4 sm:p-6 divide-y divide-line/60 shadow-xs space-y-4">
              {items.map(({ product: p, quantity }) => {
                const subtitle =
                  p.description.split('. ').find((s) => s.includes('•')) || p.description;
                const displayImage = getProductImage(p);

                return (
                  <div key={p._id} className="pt-4 first:pt-0 flex items-center gap-4">
                    {/* Thumbnail Box */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[16px] bg-canvas-soft border border-line/60 p-2 shrink-0 flex items-center justify-center">
                      <Image
                        src={displayImage}
                        alt={p.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${p.slug}`} className="no-underline">
                        <h3 className="text-xs sm:text-sm font-bold text-ink hover:text-leaf transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-muted truncate mt-0.5">{subtitle}</p>
                      <div className="mt-1.5">
                        <PriceTag paisa={p.price} size="sm" className="font-extrabold text-[13px] sm:text-[14px]" />
                      </div>
                    </div>

                    {/* Stepper & Delete */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center justify-between bg-canvas-soft border border-line rounded-full px-2.5 py-1 w-24">
                        <button
                          type="button"
                          aria-label={`Decrease ${p.name} quantity`}
                          onClick={() => updateQuantity(p._id, quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-muted hover:text-ink"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold text-ink">{quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${p.name} quantity`}
                          disabled={quantity >= p.stock}
                          onClick={() => updateQuantity(p._id, quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-muted hover:text-ink disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(p._id)}
                        className="p-1.5 text-muted hover:text-rose-600 transition-colors"
                        aria-label={`Remove ${p.name} from bag`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick pickup notice banner */}
            <div className="rounded-[20px] bg-canvas-alt border border-line/70 p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-leaf flex items-center justify-center shrink-0 shadow-xs">
                <Clock size={16} strokeWidth={2.4} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-ink">Pickup in about 15 minutes</p>
                <p className="text-muted text-[11px]">Choose your pickup point or hostel room at checkout.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card (Figma 14-Mobile & 04-Desktop) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-[24px] border border-line/70 p-6 space-y-5 shadow-xs">
              <h2 className="text-base font-bold text-ink">Order summary</h2>

              <div className="space-y-2.5 text-xs text-muted border-b border-line/60 pb-4">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <PriceTag paisa={subtotal} size="sm" className="font-bold text-ink" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Campus pickup fee</span>
                  <span className="font-bold text-leaf">Free</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold text-ink">Total</span>
                <PriceTag paisa={subtotal} size="lg" className="font-[900] text-xl text-ink" />
              </div>

              {/* Continue to Checkout Button */}
              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="w-full py-3.5 px-6 rounded-full bg-lime hover:bg-[#cfe569] text-ink font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <span>Continue to checkout</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>

              {/* Guarantee banner below button */}
              <div className="pt-2 border-t border-line/60 flex items-start gap-2.5 text-[11px] text-muted">
                <Zap size={14} className="text-leaf shrink-0 mt-0.5" />
                <p>Between classes? We&apos;ve got you — orders are usually ready in under 20 mins.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
