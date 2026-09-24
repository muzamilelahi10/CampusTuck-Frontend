'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Minus, Plus, Trash2, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { PriceTag } from '../../components/PriceTag';

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, updateQuantity, removeItem } = useCart();

  const isCartEmpty = items.length === 0;

  return (
    <div className="cart-page-container">
      {/* Header (06-Mobile-Cart.svg) */}
      <div className="relative flex items-center justify-between pb-4 border-b border-line mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 text-ink hover:text-leaf transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="text-center">
          <h1 className="text-[17px] font-[750] text-ink">Your cart</h1>
          <p className="text-xs text-muted mt-0.5">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="w-8" />
      </div>

      {isCartEmpty ? (
        <div className="bg-white rounded-[18px] border border-line p-12 text-center my-8 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-canvas flex items-center justify-center mx-auto text-muted mb-4">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-lg font-bold text-ink">Your cart is empty</h2>
          <p className="text-xs text-muted mt-2 mb-6">
            Find your next snack or study supplies before class.
          </p>
          <Link href="/catalog" className="primary-button !min-h-[44px] !text-xs !py-1 w-full">
            Browse campus essentials
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items List */}
          <div className="bg-white rounded-[18px] border border-line p-4 md:p-6 divide-y divide-line">
            {items.map(({ product: p, quantity }) => {
              const subtitle = p.description.split('. ').find((s) => s.includes('•')) || p.description;

              return (
                <article key={p._id} className="cart-row-card py-4 first:pt-0 last:pb-0">
                  {/* Item Image */}
                  <Link href={`/products/${p.slug}`} className="cart-item-image shrink-0">
                    <Image
                      src={p.imageUrls?.[0] || '/design/matcha.svg'}
                      alt={p.name}
                      fill
                      className="object-contain p-2"
                    />
                  </Link>

                  {/* Item Details */}
                  <div className="min-w-0 pr-2">
                    <Link href={`/products/${p.slug}`} className="no-underline">
                      <h3 className="text-[14px] font-bold text-ink hover:text-leaf transition-colors leading-snug">
                        {p.name}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-muted truncate mt-0.5">{subtitle}</p>
                    <div className="mt-2">
                      <PriceTag paisa={p.price} size="sm" className="font-bold text-[13px]" />
                    </div>
                  </div>

                  {/* Quantity Counter Pill */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="cart-item-qty-pill">
                      <button
                        type="button"
                        aria-label={`Decrease ${p.name} quantity`}
                        onClick={() => updateQuantity(p._id, quantity - 1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${p.name} quantity`}
                        disabled={quantity >= p.stock}
                        onClick={() => updateQuantity(p._id, quantity + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(p._id)}
                      className="text-muted hover:text-rose-600 transition-colors p-1"
                      aria-label={`Remove ${p.name}`}
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Need It Soon Banner (06-Mobile-Cart.svg) */}
          <div className="cart-info-banner">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-leaf shrink-0 shadow-sm mt-0.5">
              <Clock size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h4>Need it soon?</h4>
              <p>Pickup is usually ready in 20 minutes.</p>
              <p>Choose your option at checkout.</p>
            </div>
          </div>

          {/* Checkout Breakdown & Bottom Action (06-Mobile-Cart.svg) */}
          <div className="bg-white rounded-[18px] border border-line p-6 space-y-4">
            <div className="flex justify-between text-xs text-muted">
              <span>Subtotal</span>
              <PriceTag paisa={subtotal} size="sm" className="font-bold text-ink" />
            </div>

            <div className="flex justify-between text-xs text-muted">
              <span>Delivery</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>

            <div className="border-t border-line pt-4 flex justify-between items-center text-ink">
              <span className="text-[17px] font-[750]">Total</span>
              <PriceTag paisa={subtotal} size="lg" className="font-[750] text-[18px]" />
            </div>

            <Link
              href="/checkout"
              className="primary-button w-full !min-h-[49px] !rounded-[14px] !text-[13px] mt-2"
            >
              <span>Continue to checkout</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
