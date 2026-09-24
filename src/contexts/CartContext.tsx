'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IProduct, ICartItem } from '@campustuck/shared';
import { cartAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

const LOCAL_STORAGE_KEY = 'campustuck_guest_cart_v1';

interface CartContextType {
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
  loading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: IProduct, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ICartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Calculate live subtotal and count
  const subtotal = items.reduce((acc, item) => acc + (item.product.price || 0) * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to load guest cart from localStorage
  const loadGuestCart = (): ICartItem[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Helper to save guest cart to localStorage
  const saveGuestCart = (newItems: ICartItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
    } catch {}
  };

  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const res = await cartAPI.get();
        if (res.success && res.cart) {
          setItems(res.cart.items || []);
        }
      } catch (err) {
        console.error('Failed to fetch server cart:', err);
      }
    } else {
      setItems(loadGuestCart());
    }
    setLoading(false);
  }, [isAuthenticated]);

  // Handle initial load and guest cart merge upon login
  useEffect(() => {
    async function initCart() {
      if (isAuthenticated) {
        const guestItems = loadGuestCart();
        if (guestItems.length > 0) {
          try {
            const mergePayload = guestItems.map((item) => ({
              productId: item.product._id,
              quantity: item.quantity,
            }));
            const res = await cartAPI.merge(mergePayload);
            if (res.success && res.cart) {
              setItems(res.cart.items || []);
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              toast.info('Your guest cart was merged with your account.');
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error('Error merging guest cart:', err);
          }
        }
      }
      refreshCart();
    }

    initCart();
  }, [isAuthenticated, user?._id]);

  const addItem = async (product: IProduct, quantity = 1) => {
    if (product.stock <= 0) {
      toast.error(`"${product.name}" is out of stock.`);
      return;
    }

    const existingIndex = items.findIndex((i) => i.product._id === product._id);
    const currentQty = existingIndex > -1 ? items[existingIndex].quantity : 0;
    const newQty = currentQty + quantity;

    if (newQty > product.stock) {
      toast.warning(`Only ${product.stock} units available in stock for "${product.name}".`);
      return;
    }

    if (isAuthenticated) {
      try {
        const res = await cartAPI.updateItem(product._id, newQty);
        if (res.success && res.cart) {
          setItems(res.cart.items || []);
          toast.success(`Added ${quantity}x "${product.name}" to cart!`);
          setIsCartOpen(true);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to update cart.');
      }
    } else {
      // Guest cart
      const updated = [...items];
      if (existingIndex > -1) {
        updated[existingIndex].quantity = newQty;
      } else {
        updated.push({ product, quantity });
      }
      setItems(updated);
      saveGuestCart(updated);
      toast.success(`Added ${quantity}x "${product.name}" to cart!`);
      setIsCartOpen(true);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 0) return;

    if (isAuthenticated) {
      try {
        const res = await cartAPI.updateItem(productId, quantity);
        if (res.success && res.cart) {
          setItems(res.cart.items || []);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to update quantity.');
      }
    } else {
      // Guest cart
      let updated: ICartItem[];
      if (quantity === 0) {
        updated = items.filter((i) => i.product._id !== productId);
      } else {
        updated = items.map((i) => (i.product._id === productId ? { ...i, quantity } : i));
      }
      setItems(updated);
      saveGuestCart(updated);
    }
  };

  const removeItem = async (productId: string) => {
    await updateQuantity(productId, 0);
    toast.info('Item removed from cart.');
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartAPI.clear();
        setItems([]);
      } catch (err: any) {
        toast.error(err.message || 'Failed to clear cart.');
      }
    } else {
      setItems([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const value = {
    items,
    subtotal,
    totalItems,
    loading,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    toggleCart: () => setIsCartOpen((prev) => !prev),
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
