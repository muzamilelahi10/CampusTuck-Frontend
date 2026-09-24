'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Tags,
  X,
  CheckCircle2,
  Boxes,
  ArrowRight,
  Layers,
  Sparkles,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react';
import { ICategory, IProduct } from '@campustuck/shared';
import { categoriesAPI, productsAPI } from '../../../lib/api';
import { useToast } from '../../../components/Toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [active, setActive] = useState(true);

  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        categoriesAPI.getAllAdmin(),
        productsAPI.getAll({ adminView: 'true', limit: 200 }),
      ]);

      if (catRes.success && catRes.categories) {
        setCategories(catRes.categories);
      }
      if (prodRes.success && prodRes.products) {
        setProducts(prodRes.products);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute product count per category
  const productCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const catId = typeof p.category === 'object' && p.category ? (p.category as any)._id : p.category;
      if (catId) {
        map[catId] = (map[catId] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // KPIs
  const kpis = useMemo(() => {
    const totalCount = categories.length;
    const activeCount = categories.filter((c) => c.active).length;
    const totalProducts = products.length;

    return { totalCount, activeCount, totalProducts };
  }, [categories, products]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDisplayOrder(String(categories.length));
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: ICategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDisplayOrder(String(cat.displayOrder || 0));
    setActive(cat.active);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-');
      setSlug(autoSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          displayOrder: parseInt(displayOrder, 10) || 0,
          active,
        });
        toast.success(`Updated category "${name}".`);
      } else {
        await categoriesAPI.create({
          name: name.trim(),
          slug: slug.trim() || undefined,
          displayOrder: parseInt(displayOrder, 10) || 0,
          active,
        });
        toast.success(`Created category "${name}".`);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#16251F] via-[#21382E] to-[#16251F] text-white p-6 sm:p-8 rounded-3xl shadow-md border border-emerald-900/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wide uppercase">
            <Tags className="w-3.5 h-3.5" />
            COMSATS Tuck Catalog Taxonomy & Navigation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Product Categories</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
            Structure your tuck shop catalog into fast, accessible browsing sections on the student mobile & desktop storefront.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/20 self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Category</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Categories */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Categories</span>
            <div className="text-2xl font-black text-slate-900">{kpis.totalCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">Configured sections</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Tags className="w-5 h-5" />
          </div>
        </div>

        {/* Active on Storefront */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Active Sections</span>
            <div className="text-2xl font-black text-emerald-900">{kpis.activeCount}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Visible on student catalog</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Total Associated Products */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Linked Products</span>
            <div className="text-2xl font-black text-blue-900">{kpis.totalProducts} items</div>
            <span className="text-[10px] text-blue-600 font-medium">Categorized inventory</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Category Name</th>
                <th className="py-3.5 px-4">URL Identifier (Slug)</th>
                <th className="py-3.5 px-4">Display Priority</th>
                <th className="py-3.5 px-4">Catalog Items</th>
                <th className="py-3.5 px-4">Storefront Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 space-y-2">
                    <RotateCcw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                    <p className="font-semibold text-xs text-slate-500">Loading catalog categories...</p>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 space-y-2">
                    <Tags className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-sm text-slate-700">No categories created yet.</p>
                    <p className="text-xs text-slate-400">Add your first category using the button above.</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const itemCount = productCountMap[cat._id] || cat.productCount || 0;

                  return (
                    <tr key={cat._id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center justify-center font-bold text-xs shrink-0">
                            {cat.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 text-sm block group-hover:text-emerald-700 transition-colors">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              COMSATS Shop Section
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-[11px] font-semibold text-slate-700 border border-slate-200/60">
                          /{cat.slug}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          <span>Priority:</span>
                          <span className="font-black text-slate-900">{cat.displayOrder}</span>
                        </div>
                      </td>

                      {/* Linked Products Count */}
                      <td className="py-4 px-4">
                        <Link
                          href="/admin/products"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200/60 transition-colors"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span>{itemCount} products</span>
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            cat.active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{cat.active ? 'Visible Online' : 'Hidden'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  Taxonomy Editor
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingCategory ? `Edit "${editingCategory.name}"` : 'Create Catalog Category'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">Category Display Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Hot Food & Snacks"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">URL Slug (kebab-case) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. hot-food-snacks"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-[11px] font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block">Used for routing: /catalog?category={slug || '...'}</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">Display Order Index</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block">Lower numbers appear first on the student navigation bar.</span>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="categoryActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="categoryActive" className="font-bold text-slate-800 cursor-pointer">
                  Display actively on student storefront
                </label>
              </div>

              {/* Live Preview Pill */}
              {name && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Storefront Tab Preview:
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
                    <span>{name}</span>
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
