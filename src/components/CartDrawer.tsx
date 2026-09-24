'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { PriceTag } from './PriceTag';

export function CartDrawer() {
  const { isCartOpen, closeCart, items, subtotal, totalItems, updateQuantity, removeItem } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-canvas/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-lime text-ink flex items-center justify-center font-bold">
              <ShoppingBag size={16} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">Campus Cart</h2>
              <p className="text-xs text-muted">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-canvas-soft text-leaf flex items-center justify-center mb-3">
                <ShoppingBag size={32} />
              </div>
              <h3 className="font-bold text-ink text-base">Your cart is empty</h3>
              <p className="text-xs text-muted mt-1 max-w-xs">
                Grab cold drinks, snacks, or stationery items from the campus catalog.
              </p>
              <Link
                href="/catalog"
                onClick={closeCart}
                className="primary-button !min-h-[40px] !text-xs mt-4"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const prod = item.product;
              const imgUrl = prod.imageUrls?.[0] || '/design/matcha.svg';

              return (
                <div
                  key={prod._id}
                  className="flex gap-3 p-3 rounded-[14px] border border-line bg-white shadow-sm"
                >
                  <div className="relative w-16 h-16 rounded-xl bg-canvas-soft overflow-hidden shrink-0">
                    <Image src={imgUrl} alt={prod.name} fill className="object-contain p-2" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink truncate">{prod.name}</h4>
                      <PriceTag paisa={prod.price} size="sm" className="text-ink font-bold text-xs" />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-line rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(prod._id, item.quantity - 1)}
                          className="px-2 py-0.5 text-ink hover:bg-canvas text-xs transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(prod._id, item.quantity + 1)}
                          disabled={item.quantity >= prod.stock}
                          className="px-2 py-0.5 text-ink hover:bg-canvas text-xs disabled:opacity-40 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(prod._id)}
                        className="text-muted hover:text-rose-600 transition-colors p-1"
                        aria-label={`Remove ${prod.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout CTA */}
        {items.length > 0 && (
          <div className="p-4 border-t border-line bg-canvas/40 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">Subtotal</span>
              <PriceTag paisa={subtotal} size="md" className="text-ink font-bold text-sm" />
            </div>

            <div className="flex gap-2 pt-1">
              <Link
                href="/cart"
                onClick={closeCart}
                className="secondary-button !min-h-[44px] !text-xs flex-1 text-center"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="primary-button !min-h-[44px] !text-xs flex-1 text-center"
              >
                Checkout <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
