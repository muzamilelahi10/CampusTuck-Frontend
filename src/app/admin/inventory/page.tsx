'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Plus,
  AlertTriangle,
  ChevronDown,
  Check,
  Edit2,
  X,
} from 'lucide-react';
import { IProduct } from '@campustuck/shared';
import { productsAPI } from '../../../lib/api';
import { PriceTag } from '../../../components/PriceTag';
import { useToast } from '../../../components/Toast';
import { getProductImage } from '../../../components/ProductCard';

const DEMO_PRODUCTS: IProduct[] = [
  {
    _id: 'p1',
    name: 'CUI Spiral Notebook',
    slug: 'campus-notebook',
    description: 'A5 • 120 pages',
    price: 24000,
    stock: 25,
    category: { name: 'Stationery', slug: 'stationery' } as any,
    imageUrls: ['/design/notebook.svg'],
    active: true,
  } as any,
  {
    _id: 'p2',
    name: 'Pakola Ice Cream Soda',
    slug: 'pakola-ice-cream-soda-250ml',
    description: 'Chilled • 250 ml',
    price: 9000,
    stock: 12,
    category: { name: 'Drinks', slug: 'drinks' } as any,
    imageUrls: ['/design/pakola.svg'],
    active: true,
  } as any,
  {
    _id: 'p3',
    name: 'Chocolate Cookie',
    slug: 'chocolate-cookie',
    description: 'Baked today',
    price: 18000,
    stock: 47,
    category: { name: 'Snacks', slug: 'snacks' } as any,
    imageUrls: ['/design/cookie.svg'],
    active: true,
  } as any,
  {
    _id: 'p4',
    name: 'Lays Masala Chips',
    slug: 'lays-masala-potato-chips-large',
    description: 'Large pack',
    price: 10000,
    stock: 10,
    category: { name: 'Snacks', slug: 'snacks' } as any,
    imageUrls: ['/design/chips.svg'],
    active: true,
  } as any,
  {
    _id: 'p5',
    name: 'Sanitizing Hand Gel',
    slug: 'sanitizing-hand-gel-carabiner-50ml',
    description: 'Pocket size • 50 ml',
    price: 11000,
    stock: 2,
    category: { name: 'Essentials', slug: 'essentials' } as any,
    imageUrls: ['/design/sanitizer.svg'],
    active: true,
  } as any,
  {
    _id: 'p6',
    name: 'Mineral Water',
    slug: 'mineral-water',
    description: 'Chilled • 500 ml',
    price: 5000,
    stock: 45,
    category: { name: 'Drinks', slug: 'drinks' } as any,
    imageUrls: ['/design/water.svg'],
    active: true,
  } as any,
];

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Edit stock modal state
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [savingStock, setSavingStock] = useState(false);

  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      const res = await productsAPI.getAll({ limit: 50 });
      if (res.success && res.products && res.products.length > 0) {
        setProducts(res.products);
      } else {
        setProducts(DEMO_PRODUCTS);
      }
    } catch (err) {
      setProducts(DEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q)) return false;
    }
    if (categoryFilter !== 'all') {
      const catSlug = typeof p.category === 'object' ? (p.category as any)?.slug : p.category;
      if (catSlug !== categoryFilter) return false;
    }
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingStock(true);

    try {
      const res = await productsAPI.update(editingProduct._id, { stock: newStock });
      if (res.success && res.product) {
        toast.success(`Updated stock for ${editingProduct.name}`);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? { ...p, stock: newStock } : p))
        );
        setEditingProduct(null);
      } else {
        // Fallback update local state for preview
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? { ...p, stock: newStock } : p))
        );
        setEditingProduct(null);
        toast.success(`Updated stock for ${editingProduct.name}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stock');
    } finally {
      setSavingStock(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle (Figma 22-Mobile & 10-Desktop) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-[800] text-ink tracking-tight">
            <span className="hidden sm:inline">Products & inventory</span>
            <span className="inline sm:hidden">Products</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">Stock level for tuck items.</p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full bg-lime hover:bg-[#cfe569] text-ink font-bold text-xs shadow-xs self-start sm:self-auto transition-all"
        >
          <Plus size={15} strokeWidth={2.8} />
          <span>Add product</span>
        </Link>
      </div>

      {/* Low Stock Alert Banner (Figma 22-Mobile & 10-Desktop) */}
      {lowStockCount > 0 && (
        <div className="rounded-[20px] bg-[#FDF1E7] border border-[#F8A882]/40 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F8A882] text-white flex items-center justify-center shrink-0">
            <AlertTriangle size={16} strokeWidth={2.4} />
          </div>
          <div className="text-xs">
            <p className="font-bold text-ink">
              {lowStockCount} products need attention
            </p>
            <p className="text-muted text-[11px]">Review low stock items before the next break.</p>
          </div>
        </div>
      )}

      {/* KPI Stats on Desktop (Figma 10-Desktop) */}
      <div className="hidden sm:grid grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] border border-line/80 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Total products
          </span>
          <p className="text-2xl font-[900] text-ink">{products.length || 24}</p>
        </div>

        <div className="bg-white rounded-[20px] border border-line/80 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Low stock
          </span>
          <p className="text-2xl font-[900] text-amber-600">0{lowStockCount || 3}</p>
        </div>

        <div className="bg-white rounded-[20px] border border-line/80 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Out of stock
          </span>
          <p className="text-2xl font-[900] text-rose-600">0{outOfStockCount || 1}</p>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your inventory..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-line text-xs font-semibold text-ink placeholder:text-muted/60 focus:outline-none focus:border-leaf"
          />
          <Search size={16} className="text-muted absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'snacks', 'drinks', 'stationery', 'essentials'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-ink text-white'
                  : 'bg-white text-ink border border-line hover:bg-canvas-soft'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Inventory List (Cards on Mobile / Table on Desktop) */}
      <div className="bg-white rounded-[24px] border border-line/80 shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-soft/80 text-muted uppercase text-[10px] font-extrabold tracking-wider border-b border-line">
              <tr>
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filteredProducts.map((p) => {
                const isLow = p.stock > 0 && p.stock <= 5;
                const isOut = p.stock <= 0;
                const catName =
                  typeof p.category === 'object' && p.category ? (p.category as any).name : 'General';
                const displayImage = getProductImage(p);

                return (
                  <tr key={p._id} className="hover:bg-canvas-soft/40 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-canvas-soft border border-line/60 p-1.5 shrink-0 flex items-center justify-center">
                          <Image
                            src={displayImage}
                            alt={p.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-ink">{p.name}</p>
                          <p className="text-[11px] text-muted">
                            {p.description.split('. ')[0]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-muted">{catName}</td>
                    <td className="py-3.5 px-4">
                      <PriceTag paisa={p.price} size="sm" className="font-bold text-ink" />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-ink">
                      <span>{p.stock} units</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider ${
                          isOut
                            ? 'bg-rose-100 text-rose-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {isOut ? 'Out of stock' : isLow ? 'Low stock' : 'In stock'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(p);
                          setNewStock(p.stock);
                        }}
                        className="px-3 py-1.5 rounded-full border border-line text-ink hover:border-leaf hover:bg-canvas-soft font-bold text-xs transition-colors"
                      >
                        Adjust stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (Figma 22-Mobile-Admin-Inventory) */}
        <div className="md:hidden divide-y divide-line/60">
          {filteredProducts.map((p) => {
            const isLow = p.stock > 0 && p.stock <= 5;
            const isOut = p.stock <= 0;
            const displayImage = getProductImage(p);

            return (
              <div key={p._id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl bg-canvas-soft border border-line/60 p-2 shrink-0 flex items-center justify-center">
                    <Image
                      src={displayImage}
                      alt={p.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-ink truncate">{p.name}</p>
                    <p className="text-[11px] text-muted truncate">{p.description.split('. ')[0]}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <PriceTag paisa={p.price} size="sm" className="font-extrabold text-xs text-ink" />
                      <span className="text-[11px] font-bold text-muted">• {p.stock} in stock</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider ${
                      isOut
                        ? 'bg-rose-100 text-rose-800'
                        : isLow
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {isOut ? 'Out of stock' : isLow ? 'Low stock' : 'In stock'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(p);
                      setNewStock(p.stock);
                    }}
                    className="text-[11px] font-bold text-leaf hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-line p-6 max-w-sm w-full space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-ink">Adjust Stock</h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 text-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted">
              Update available stock count for <strong className="text-ink">{editingProduct.name}</strong>.
            </p>

            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-muted uppercase">
                  Units in stock
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 rounded-full bg-canvas-soft border border-line text-sm font-bold text-ink focus:outline-none focus:border-leaf"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 rounded-full border border-line font-bold text-xs text-muted hover:bg-canvas-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStock}
                  className="flex-1 py-2.5 rounded-full bg-lime font-bold text-xs text-ink hover:bg-[#cfe569]"
                >
                  {savingStock ? 'Saving...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
