'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ChevronDown, Check, Zap, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { IProduct, ICategory } from '@campustuck/shared';
import { productsAPI, categoriesAPI } from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';

const STATIC_DEMO_PRODUCTS: IProduct[] = [
  {
    _id: 'p1',
    name: 'CUI Spiral Notebook',
    slug: 'campus-notebook',
    description: 'COMSATS University Islamabad ruled notebook. A5 • 120 pages',
    price: 24000,
    stock: 50,
    category: 'stationery' as any,
    imageUrls: ['/design/notebook.svg'],
    active: true,
  } as any,
  {
    _id: 'p2',
    name: 'Pakola Ice Cream Soda',
    slug: 'pakola-ice-cream-soda-250ml',
    description: 'Iconic chilled green ice cream soda. Chilled • 250 ml',
    price: 9000,
    stock: 35,
    category: 'drinks' as any,
    imageUrls: ['/design/pakola.svg'],
    active: true,
  } as any,
  {
    _id: 'p3',
    name: 'Chocolate Cookie',
    slug: 'chocolate-cookie',
    description: 'Freshly baked Belgian chocolate chips. Baked today',
    price: 18000,
    stock: 30,
    category: 'snacks' as any,
    imageUrls: ['/design/cookie.svg'],
    active: true,
  } as any,
  {
    _id: 'p4',
    name: 'Lays Masala Chips',
    slug: 'lays-masala-potato-chips-large',
    description: 'Pakistani spicy masala flavor potato chips. Large pack',
    price: 10000,
    stock: 25,
    category: 'snacks' as any,
    imageUrls: ['/design/chips.svg'],
    active: true,
  } as any,
  {
    _id: 'p5',
    name: 'Sanitizing Hand Gel',
    slug: 'sanitizing-hand-gel-carabiner-50ml',
    description: '70% alcohol rinse-free antibacterial hand gel. Pocket size • 50 ml',
    price: 11000,
    stock: 20,
    category: 'essentials' as any,
    imageUrls: ['/design/sanitizer.svg'],
    active: true,
  } as any,
  {
    _id: 'p6',
    name: 'Mineral Water',
    slug: 'mineral-water',
    description: 'Natural crisp chilled drinking water. Chilled • 500 ml',
    price: 5000,
    stock: 60,
    category: 'drinks' as any,
    imageUrls: ['/design/water.svg'],
    active: true,
  } as any,
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'popular';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    categoriesAPI
      .getAll()
      .then((res) => {
        if (res.success && res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        } else {
          setCategories([
            { _id: 'c1', name: 'Snacks', slug: 'snacks', displayOrder: 1, active: true },
            { _id: 'c2', name: 'Drinks', slug: 'drinks', displayOrder: 2, active: true },
            { _id: 'c3', name: 'Stationery', slug: 'stationery', displayOrder: 3, active: true },
            { _id: 'c4', name: 'Essentials', slug: 'essentials', displayOrder: 4, active: true },
          ] as any[]);
        }
      })
      .catch(() => {
        setCategories([
          { _id: 'c1', name: 'Snacks', slug: 'snacks', displayOrder: 1, active: true },
          { _id: 'c2', name: 'Drinks', slug: 'drinks', displayOrder: 2, active: true },
          { _id: 'c3', name: 'Stationery', slug: 'stationery', displayOrder: 3, active: true },
          { _id: 'c4', name: 'Essentials', slug: 'essentials', displayOrder: 4, active: true },
        ] as any[]);
      });
  }, []);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const res = await productsAPI.getAll({
          category: currentCategory,
          search: currentSearch,
          sort: currentSort,
          limit: 24,
        });

        if (res.success && res.products && res.products.length > 0) {
          setProducts(res.products);
        } else if (!currentCategory && !currentSearch) {
          setProducts(STATIC_DEMO_PRODUCTS);
        } else {
          // Filter static demo products as fallback
          let filtered = [...STATIC_DEMO_PRODUCTS];
          if (currentCategory) {
            filtered = filtered.filter((p) => {
              const catSlug = typeof p.category === 'object' ? (p.category as any)?.slug : p.category;
              return catSlug === currentCategory;
            });
          }
          if (currentSearch) {
            const q = currentSearch.toLowerCase();
            filtered = filtered.filter(
              (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
            );
          }
          setProducts(filtered);
        }
      } catch (err) {
        setProducts(STATIC_DEMO_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, [currentCategory, currentSearch, currentSort]);

  const updateFilters = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === '') {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    router.push(`/catalog?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  // Category counts
  const categoryList = [
    { name: 'All items', slug: '', count: '14' },
    { name: 'Snacks', slug: 'snacks', count: '5' },
    { name: 'Drinks', slug: 'drinks', count: '4' },
    { name: 'Stationery', slug: 'stationery', count: '3' },
    { name: 'Essentials', slug: 'essentials', count: '2' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-16 space-y-6">
      {/* Mobile Title & Search Bar (Figma 12-Mobile-Catalog) */}
      <div className="md:hidden space-y-3">
        <div>
          <h1 className="text-2xl font-[800] text-ink tracking-tight">Campus essentials</h1>
          <p className="text-xs text-muted mt-0.5">The little things that keep your day moving.</p>
        </div>

        {/* Search input with rounded pill design */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search the shop"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-line text-xs font-medium placeholder:text-muted/70 focus:outline-none focus:border-leaf"
          />
          <Search size={16} className="text-muted absolute left-3.5 top-3" />
        </form>

        {/* Mobile Category Filter Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
          <button
            type="button"
            onClick={() => updateFilters({ category: undefined })}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              currentCategory === ''
                ? 'bg-ink text-white'
                : 'bg-white text-ink border border-line hover:bg-canvas-alt'
            }`}
          >
            All
          </button>
          {['snacks', 'drinks', 'stationery', 'essentials'].map((slug) => {
            const label = slug.charAt(0).toUpperCase() + slug.slice(1);
            const active = currentCategory === slug;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => updateFilters({ category: active ? undefined : slug })}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-ink text-white'
                    : 'bg-white text-ink border border-line hover:bg-canvas-alt'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Products count & sort bar */}
        <div className="flex items-center justify-between pt-1 text-xs text-muted">
          <span className="font-semibold text-ink">{products.length} products</span>
          <div className="flex items-center gap-1.5 bg-white border border-line px-3 py-1 rounded-full text-[11px] font-bold text-ink">
            <span>Sort: Most popular</span>
            <ChevronDown size={13} className="text-muted" />
          </div>
        </div>
      </div>

      {/* Desktop Layout (Figma 02-Desktop-Catalog: Left Sidebar + Right Products Grid) */}
      <div className="hidden md:grid grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Filter */}
        <aside className="col-span-3 space-y-6 sticky top-24">
          {/* Categories Filter Card */}
          <div className="bg-white rounded-[22px] border border-line/80 p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted">Categories</h3>
            <div className="space-y-1">
              {categoryList.map((cat) => {
                const active = currentCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => updateFilters({ category: cat.slug || undefined })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left ${
                      active
                        ? 'bg-canvas-alt text-leaf'
                        : 'text-ink hover:bg-canvas-soft/60'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        active ? 'bg-leaf text-lime' : 'bg-canvas-soft text-muted'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Pickup Promo Banner Card (Figma 02-Desktop-Catalog) */}
          <div className="rounded-[22px] bg-[#16251F] text-white p-5 space-y-3">
            <div className="w-8 h-8 rounded-full bg-lime text-ink flex items-center justify-center">
              <Zap size={16} strokeWidth={2.6} />
            </div>
            <h4 className="font-extrabold text-sm leading-snug">
              Need it between classes?
            </h4>
            <p className="text-xs text-[#A2B5A8] leading-relaxed">
              Order now and your package will be ready at CUI Main Tuck Counter in ~20 minutes.
            </p>
          </div>
        </aside>

        {/* Right Main Catalog Content */}
        <main className="col-span-9 space-y-6">
          {/* Desktop Heading & Search/Sort Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line/60">
            <div>
              <h1 className="text-2xl font-[800] text-ink tracking-tight">
                Everything for your campus day.
              </h1>
              <p className="text-xs text-muted mt-0.5">
                The little things that keep your schedule moving smoothly.
              </p>
            </div>

            {/* Desktop Search & Sort */}
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search essentials..."
                  className="w-56 pl-9 pr-3.5 py-2 rounded-full bg-white border border-line text-xs font-medium placeholder:text-muted/70 focus:outline-none focus:border-leaf"
                />
                <Search size={14} className="text-muted absolute left-3 top-2.5" />
              </form>

              <div className="flex items-center gap-2 bg-white border border-line px-3.5 py-2 rounded-full text-xs font-bold text-ink cursor-pointer hover:bg-canvas-soft transition-colors">
                <span>Most popular</span>
                <ChevronDown size={14} className="text-muted" />
              </div>
            </div>
          </div>

          {/* Product Grid (3 columns on desktop) */}
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[20px] aspect-[1/1.2] animate-pulse border border-line"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-[22px] border border-line text-muted text-xs space-y-2">
              <p className="font-bold text-sm text-ink">No items found</p>
              <p>Try searching with another keyword or pick a different category.</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Product Grid (2 columns on mobile) */}
      <div className="md:hidden">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] aspect-[1/1.2] animate-pulse border border-line"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-[20px] border border-line text-muted text-xs">
            No products found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto p-8 text-center text-xs text-muted">Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
