'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit2,
  Boxes,
  Archive,
  AlertTriangle,
  X,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  TrendingDown,
  ArrowUpDown,
  SlidersHorizontal,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react';
import { IProduct, ICategory, rupeesToPaisa, paisaToRupees } from '@campustuck/shared';
import { productsAPI, categoriesAPI } from '../../../lib/api';
import { PriceTag } from '../../../components/PriceTag';
import { useToast } from '../../../components/Toast';

// Helpful CUI tuck shop image presets
const CUI_IMAGE_PRESETS = [
  {
    name: 'CUI Spiral Notebook',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Chicken Shawarma Wrap',
    url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pakola Ice Cream Soda',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Iced Matcha Latte',
    url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Gel Pens & Stationery',
    url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'USB-C Cable / Tech',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'archived'>('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<IProduct | null>(null);

  // Form states for product creation/edit
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priceRupees, setPriceRupees] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);

  // Form state for stock adjustment
  const [quantityChange, setQuantityChange] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState<'restock' | 'admin_adjustment'>('restock');

  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productsAPI.getAll({ adminView: 'true', search: search || undefined, limit: 150 }),
        categoriesAPI.getAllAdmin(),
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (catRes.success) {
        setCategories(catRes.categories || []);
        if (catRes.categories.length > 0 && !category) {
          setCategory(catRes.categories[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory(categories[0]?._id || '');
    setPriceRupees('');
    setStock('25');
    setLowStockThreshold('5');
    setImageUrl(CUI_IMAGE_PRESETS[0].url);
    setActive(true);
    setProductModalOpen(true);
  };

  const openEditModal = (p: IProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setCategory(typeof p.category === 'object' ? (p.category as any)._id : p.category);
    setPriceRupees(String(paisaToRupees(p.price)));
    setStock(String(p.stock));
    setLowStockThreshold(String(p.lowStockThreshold));
    setImageUrl(p.imageUrls[0] || '');
    setActive(p.active);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const pricePaisa = rupeesToPaisa(parseFloat(priceRupees));
    if (isNaN(pricePaisa) || pricePaisa <= 0) {
      toast.error('Please enter a valid price in PKR.');
      return;
    }

    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct._id, {
          name,
          description,
          category,
          price: pricePaisa,
          lowStockThreshold: parseInt(lowStockThreshold, 10),
          imageUrls: [imageUrl],
          active,
        });
        toast.success(`Updated "${name}" successfully.`);
      } else {
        await productsAPI.create({
          name,
          description,
          category,
          price: pricePaisa,
          stock: parseInt(stock, 10) || 0,
          lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
          imageUrls: [imageUrl],
          active,
        });
        toast.success(`Created product "${name}" successfully.`);
      }
      setProductModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product.');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForStock) return;

    const change = parseInt(quantityChange, 10);
    if (isNaN(change) || change === 0) {
      toast.error('Please specify a non-zero quantity change.');
      return;
    }

    try {
      await productsAPI.adjustStock(selectedProductForStock._id, {
        quantityChange: change,
        reason: adjustmentReason,
      });
      toast.success(
        `Adjusted stock by ${change > 0 ? `+${change}` : change} for "${selectedProductForStock.name}".`
      );
      setStockModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to adjust stock.');
    }
  };

  const handleToggleActive = async (p: IProduct) => {
    try {
      await productsAPI.toggleActive(p._id);
      toast.info(`Product is now ${p.active ? 'archived' : 'active'}.`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle product status.');
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const totalCount = products.length;
    const activeCount = products.filter((p) => p.active).length;
    const lowStockCount = products.filter((p) => p.active && p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStockCount = products.filter((p) => p.active && p.stock === 0).length;

    return { totalCount, activeCount, lowStockCount, outOfStockCount };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catId = typeof p.category === 'object' && p.category ? (p.category as any)._id : p.category;
        if (catId !== selectedCategory) return false;
      }

      // Stock health filter
      if (stockFilter === 'in_stock') {
        if (!p.active || p.stock <= p.lowStockThreshold) return false;
      } else if (stockFilter === 'low_stock') {
        if (!p.active || p.stock === 0 || p.stock > p.lowStockThreshold) return false;
      } else if (stockFilter === 'out_of_stock') {
        if (!p.active || p.stock > 0) return false;
      } else if (stockFilter === 'archived') {
        if (p.active) return false;
      }

      return true;
    });
  }, [products, selectedCategory, stockFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#16251F] via-[#21382E] to-[#16251F] text-white p-6 sm:p-8 rounded-3xl shadow-md border border-emerald-900/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wide uppercase">
            <Package className="w-3.5 h-3.5" />
            COMSATS Tuck Catalog & Stock Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Products & Inventory Control</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
            Configure cafeteria hot meals, cold drinks, CUI study stationery, and tech gear with instant stock threshold alerts.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/20 self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Catalog Items */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Catalog</span>
            <div className="text-2xl font-black text-slate-900">{kpis.totalCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">Distinct items registered</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Active on Storefront */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Active Online</span>
            <div className="text-2xl font-black text-emerald-900">{kpis.activeCount}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Visible to CUI students</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div
          onClick={() => setStockFilter('low_stock')}
          className={`cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border shadow-sm flex items-center justify-between transition-all hover:border-amber-400 ${
            stockFilter === 'low_stock' ? 'ring-2 ring-amber-400 border-transparent bg-amber-50/20' : 'border-slate-200/80'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1.5">
              <span>Low Stock Alert</span>
              {kpis.lowStockCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </span>
            <div className="text-2xl font-black text-amber-900">{kpis.lowStockCount}</div>
            <span className="text-[10px] text-amber-600 font-medium">Below warning threshold</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setStockFilter('out_of_stock')}
          className={`cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border shadow-sm flex items-center justify-between transition-all hover:border-rose-400 ${
            stockFilter === 'out_of_stock' ? 'ring-2 ring-rose-400 border-transparent bg-rose-50/20' : 'border-slate-200/80'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Out of Stock</span>
            <div className="text-2xl font-black text-rose-900">{kpis.outOfStockCount}</div>
            <span className="text-[10px] text-rose-600 font-medium">Immediate restock needed</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Search & Stock Status Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product title, slug, or keywords..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stock Health Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                stockFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter('low_stock')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                stockFilter === 'low_stock'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Low Stock ({kpis.lowStockCount})
            </button>
            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                stockFilter === 'out_of_stock'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Out of Stock ({kpis.outOfStockCount})
            </button>
            <button
              onClick={() => setStockFilter('archived')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                stockFilter === 'archived'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Categories:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter((p) => {
              const catId = typeof p.category === 'object' && p.category ? (p.category as any)._id : p.category;
              return catId === c._id;
            }).length;

            return (
              <button
                key={c._id}
                onClick={() => setSelectedCategory(c._id)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
                  selectedCategory === c._id
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Tuck Shop Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (PKR)</th>
                <th className="py-3.5 px-4">Stock Health</th>
                <th className="py-3.5 px-4">Online Status</th>
                <th className="py-3.5 px-5 text-right">Inventory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 space-y-2">
                    <RotateCcw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                    <p className="font-semibold text-xs text-slate-500">Loading CUI tuck products catalog...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 space-y-2">
                    <Boxes className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-sm text-slate-700">No products match your filter.</p>
                    <p className="text-xs text-slate-400">Clear filters or add a new tuck shop item above.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
                  const isOut = p.stock === 0;
                  const catName =
                    typeof p.category === 'object' && p.category ? (p.category as any).name : 'Campus Tuck';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Product Thumbnail & Details */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200/80 shadow-xs">
                            <Image
                              src={
                                p.imageUrls[0] ||
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
                              }
                              alt={p.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 text-sm block truncate max-w-[200px] sm:max-w-xs group-hover:text-emerald-700 transition-colors">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{p.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] inline-block">
                          {catName}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <PriceTag paisa={p.price} size="sm" />
                      </td>

                      {/* Stock Health */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-black text-xs ${
                                isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                              }`}
                            >
                              {p.stock} in stock
                            </span>

                            {isOut ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                                Out
                              </span>
                            ) : isLow ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Low (≤{p.lowStockThreshold})
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Healthy
                              </span>
                            )}
                          </div>

                          {/* Visual stock bar */}
                          <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isOut ? 'w-0' : isLow ? 'bg-amber-500 w-1/4' : 'bg-emerald-500 w-3/4'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Online Status Toggle */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            p.active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title={p.active ? 'Click to Archive' : 'Click to Make Active'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{p.active ? 'Visible Online' : 'Archived'}</span>
                        </button>
                      </td>

                      {/* Inventory Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Adjust Stock Button */}
                          <button
                            onClick={() => {
                              setSelectedProductForStock(p);
                              setQuantityChange('');
                              setStockModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-[11px] flex items-center gap-1 transition-all"
                            title="Adjust Stock Quantity"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                            <span>Restock</span>
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive toggle */}
                          <button
                            onClick={() => handleToggleActive(p)}
                            className={`p-1.5 rounded-xl transition-colors ${
                              p.active
                                ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                            title={p.active ? 'Archive from Storefront' : 'Publish to Storefront'}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create / Edit Modal with Live Preview */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  Product Editor
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Tuck Shop Item'}
                </h3>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-extrabold text-slate-800">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. CUI Spiral Notebook A5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price in PKR */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">Price in Pakistani Rupees (PKR) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={priceRupees}
                      onChange={(e) => setPriceRupees(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Initial Stock (Only for create) */}
                {!editingProduct && (
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-800">Initial Stock Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="25"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Low Stock Warning Threshold */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">Low Stock Alert Level *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block">Alert triggers when stock drops to or below this.</span>
                </div>

                {/* Image URL & Presets */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-extrabold text-slate-800">Product Image URL *</label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  {/* Preset photo shortcuts */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Quick Presets for COMSATS Shop:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {CUI_IMAGE_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageUrl(p.url)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold text-[10px] transition-colors border border-slate-200/60"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-extrabold text-slate-800">Description & Details</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Official CUI stationery item, fresh snack ingredients, etc."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Active Visibility Toggle */}
                <div className="flex items-center gap-2 md:col-span-2 pt-1">
                  <input
                    type="checkbox"
                    id="productActive"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="productActive" className="font-bold text-slate-800 cursor-pointer">
                    Publish actively on the student storefront immediately
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {stockModalOpen && selectedProductForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  Stock Control
                </span>
                <h3 className="text-lg font-black text-slate-900">Restock / Adjust Inventory</h3>
              </div>
              <button
                onClick={() => setStockModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Product Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-black text-slate-900 block text-xs">{selectedProductForStock.name}</span>
                <span className="text-[10px] text-slate-400">Current Balance:</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-slate-900 block">{selectedProductForStock.stock} units</span>
                <span className="text-[10px] text-emerald-600 font-bold">On Hand</span>
              </div>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              {/* Quantity Change */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">
                  Quantity Adjustment (positive for restock, negative to deduct)
                </label>
                <input
                  type="number"
                  required
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  placeholder="e.g. +20 or -5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {/* Quick Add Chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold">Quick:</span>
                  {[5, 10, 20, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantityChange(String(num))}
                      className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200/50 transition-colors"
                    >
                      +{num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQuantityChange('-1')}
                    className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200/50 transition-colors"
                  >
                    -1
                  </button>
                </div>
              </div>

              {/* Adjustment Reason */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">Audit Reason</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="restock">Vendor / Bakery Restock Shipment</option>
                  <option value="admin_adjustment">Physical Count Audit / Damage Write-off</option>
                </select>
              </div>

              {/* Projected Result */}
              {quantityChange && !isNaN(parseInt(quantityChange, 10)) && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-[11px] font-bold flex items-center justify-between border border-emerald-200/60">
                  <span>New Projected Inventory:</span>
                  <span className="text-sm font-black">
                    {selectedProductForStock.stock + parseInt(quantityChange, 10)} units
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Commit Stock Change</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
