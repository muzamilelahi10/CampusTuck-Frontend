'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Check, PackageX, RotateCcw } from 'lucide-react';
import { IProduct, ICategory } from '@campustuck/shared';
import { productsAPI, categoriesAPI } from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state from URL or defaults
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentInStock = searchParams.get('inStockOnly') === 'true';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 12 });

  // Sync search input when url param changes
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    categoriesAPI
      .getAll()
      .then((res) => {
        if (res.success && res.categories) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const res = await productsAPI.getAll({
          category: currentCategory,
          search: currentSearch,
          sort: currentSort,
          inStockOnly: currentInStock ? 'true' : undefined,
          page: currentPage,
          limit: 12,
        });

        if (res.success) {
          setProducts(res.products || []);
          setPagination(res.pagination || { total: 0, totalPages: 1, page: 1, limit: 12 });
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, [currentCategory, currentSearch, currentSort, currentInStock, currentPage]);

  const updateFilters = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === '') {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    if (!('page' in newParams)) {
      params.delete('page');
    }
    router.push(`/catalog?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    router.push('/catalog');
  };

  // Approximate category item counts for design fidelity
  const getCatCount = (slug: string) => {
    if (slug === 'snacks') return '08';
    if (slug === 'drinks' || slug === 'beverages') return '06';
    if (slug === 'stationery') return '07';
    if (slug === 'essentials') return '03';
    return '04';
  };

  return (
    <div className="catalog-container">
      {/* Header (02-Catalog-Desktop.svg) */}
      <div className="catalog-header">
        <h1>Campus essentials</h1>
        <p>Everything you need between classes, all in one place.</p>
      </div>

      {/* Full-width Search Bar */}
      <form onSubmit={handleSearchSubmit} className="catalog-search-bar">
        <Search size={18} className="text-[#68766E] shrink-0" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search for snacks, stationery and more"
          aria-label="Search for snacks, stationery and more"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              updateFilters({ search: undefined });
            }}
            className="text-xs text-muted hover:text-ink font-semibold"
          >
            Clear
          </button>
        )}
      </form>

      {/* Main Two-Column Layout */}
      <div className="catalog-layout">
        {/* Left Sidebar Filters */}
        <aside className="catalog-sidebar">
          <h2>Filters</h2>

          <div>
            <h3 className="mb-3">Categories</h3>
            <div className="sidebar-category-list">
              <button
                type="button"
                onClick={() => updateFilters({ category: undefined })}
                className={`sidebar-category-btn ${currentCategory === '' ? 'active' : ''}`}
              >
                <span>All products</span>
                <span className="cat-count">24</span>
              </button>

              {categories
                .filter((cat) => ['snacks', 'drinks', 'beverages', 'stationery', 'essentials'].includes(cat.slug))
                .map((cat) => {
                  const isSelected =
                    currentCategory === cat.slug ||
                    (cat.slug === 'drinks' && currentCategory === 'beverages') ||
                    (cat.slug === 'beverages' && currentCategory === 'drinks');

                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => updateFilters({ category: cat.slug })}
                      className={`sidebar-category-btn ${isSelected ? 'active' : ''}`}
                    >
                      <span>{cat.name.split(' ')[0]}</span>
                      <span className="cat-count">{getCatCount(cat.slug)}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="sidebar-divider" />

          <div>
            <h3 className="mb-3">Availability</h3>
            <label className="sidebar-checkbox-label">
              <span
                onClick={() => updateFilters({ inStockOnly: currentInStock ? undefined : 'true' })}
                className={`custom-checkbox ${currentInStock ? 'checked' : ''}`}
              >
                {currentInStock && <Check size={14} strokeWidth={2.8} />}
              </span>
              <span onClick={() => updateFilters({ inStockOnly: currentInStock ? undefined : 'true' })}>
                In stock only
              </span>
            </label>
          </div>
        </aside>

        {/* Right Products Area */}
        <main className="min-w-0">
          {/* Toolbar */}
          <div className="catalog-toolbar">
            <span className="catalog-count">{pagination.total || products.length} products</span>

            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="catalog-sort-select"
              aria-label="Sort products"
            >
              <option value="newest">Sort: Most popular</option>
              <option value="price_asc">Sort: Price: Low to High</option>
              <option value="price_desc">Sort: Price: High to Low</option>
              <option value="name">Sort: Name A to Z</option>
            </select>
          </div>

          {/* Active Filters Tag Bar */}
          {(currentCategory || currentSearch || currentInStock) && (
            <div className="flex items-center gap-2 text-xs text-muted mb-5 flex-wrap">
              <span>Active filters:</span>
              {currentCategory && (
                <span className="px-2.5 py-1 rounded-full bg-canvas-soft text-leaf font-semibold border border-line">
                  Category: {currentCategory}
                </span>
              )}
              {currentSearch && (
                <span className="px-2.5 py-1 rounded-full bg-canvas-soft text-leaf font-semibold border border-line">
                  &quot;{currentSearch}&quot;
                </span>
              )}
              {currentInStock && (
                <span className="px-2.5 py-1 rounded-full bg-canvas-soft text-leaf font-semibold border border-line">
                  In stock only
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-muted hover:text-ink ml-2 underline cursor-pointer"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          )}

          {/* Products Grid (3 columns matching 02-Catalog-Desktop.svg) */}
          {loading ? (
            <div className="catalog-grid-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-skeleton animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-[18px] border border-line p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-canvas flex items-center justify-center text-muted mb-4">
                <PackageX size={28} />
              </div>
              <h3 className="text-base font-bold text-ink">No products found</h3>
              <p className="text-xs text-muted mt-1 max-w-xs">
                We couldn&apos;t find anything matching your filters. Try checking other categories or resetting filters.
              </p>
              <button onClick={clearAllFilters} className="primary-button !min-h-[40px] !text-xs !py-1 mt-5">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="catalog-grid-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => updateFilters({ page: String(pagination.page - 1) })}
                className="px-4 py-2 rounded-xl border border-line bg-white text-xs font-semibold text-ink hover:bg-canvas disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-xs text-muted font-medium px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateFilters({ page: String(pagination.page + 1) })}
                className="px-4 py-2 rounded-xl border border-line bg-white text-xs font-semibold text-ink hover:bg-canvas disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="catalog-container text-center py-20 text-muted text-xs">
          Loading campus catalog...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
