'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, Banknote, MapPin, Clock } from 'lucide-react';
import { IProduct } from '@campustuck/shared';
import { productsAPI } from '../lib/api';
import { ProductCard } from '../components/ProductCard';

const CATEGORIES = [
  {
    name: 'Snacks',
    desktopName: 'Snacks & treats',
    slug: 'snacks',
    copy: 'Treat time',
    desktopCopy: 'Cookie break & chips',
    bg: 'bg-[#FDF1E7]',
    image: '/design/cookie.svg',
  },
  {
    name: 'Drinks',
    desktopName: 'Cold drinks',
    slug: 'drinks',
    copy: 'Stay cool',
    desktopCopy: 'Chilled soda & juices',
    bg: 'bg-[#E3F2E9]',
    image: '/design/pakola.svg',
  },
  {
    name: 'Stationery',
    desktopName: 'Stationery',
    slug: 'stationery',
    copy: 'Study sorted',
    desktopCopy: 'Notebooks & exam pens',
    bg: 'bg-[#E9EDDC]',
    image: '/design/notebook.svg',
  },
  {
    name: 'Essentials',
    desktopName: 'Essentials',
    slug: 'essentials',
    copy: 'Daily items',
    desktopCopy: 'Sanitizers & daily kit',
    bg: 'bg-[#EBF3FA]',
    image: '/design/sanitizer.svg',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .getAll({ limit: 6, sort: 'newest' })
      .then((res) => {
        if (res.success && res.products && res.products.length > 0) {
          setProducts(res.products);
        } else {
          // Fallback initial products if database is empty or initial load
          setProducts([
            {
              _id: 'p1',
              name: 'CUI Spiral Notebook',
              slug: 'campus-notebook',
              description: 'COMSATS University Islamabad ruled notebook. A5 • 120 pages',
              price: 24000,
              stock: 45,
              active: true,
              imageUrls: ['/design/notebook.svg'],
            } as any,
            {
              _id: 'p2',
              name: 'Pakola Ice Cream Soda',
              slug: 'pakola-ice-cream-soda-250ml',
              description: 'Iconic chilled green ice cream soda. Chilled • 250 ml',
              price: 9000,
              stock: 35,
              active: true,
              imageUrls: ['/design/pakola.svg'],
            } as any,
            {
              _id: 'p3',
              name: 'Chocolate Cookie',
              slug: 'chocolate-cookie',
              description: 'Freshly baked Belgian chocolate chips. Baked today',
              price: 18000,
              stock: 30,
              active: true,
              imageUrls: ['/design/cookie.svg'],
            } as any,
            {
              _id: 'p4',
              name: 'Lays Masala Chips',
              slug: 'lays-masala-potato-chips-large',
              description: 'Pakistani spicy masala flavor potato chips. Large pack',
              price: 10000,
              stock: 25,
              active: true,
              imageUrls: ['/design/chips.svg'],
            } as any,
          ]);
        }
      })
      .catch(() => {
        // Fallback demo items matching Figma review
        setProducts([
          {
            _id: 'p1',
            name: 'CUI Spiral Notebook',
            slug: 'campus-notebook',
            description: 'COMSATS University Islamabad ruled notebook. A5 • 120 pages',
            price: 24000,
            stock: 45,
            active: true,
            imageUrls: ['/design/notebook.svg'],
          } as any,
          {
            _id: 'p2',
            name: 'Pakola Ice Cream Soda',
            slug: 'pakola-ice-cream-soda-250ml',
            description: 'Iconic chilled green ice cream soda. Chilled • 250 ml',
            price: 9000,
            stock: 35,
            active: true,
            imageUrls: ['/design/pakola.svg'],
          } as any,
          {
            _id: 'p3',
            name: 'Chocolate Cookie',
            slug: 'chocolate-cookie',
            description: 'Freshly baked Belgian chocolate chips. Baked today',
            price: 18000,
            stock: 30,
            active: true,
            imageUrls: ['/design/cookie.svg'],
          } as any,
          {
            _id: 'p4',
            name: 'Lays Masala Chips',
            slug: 'lays-masala-potato-chips-large',
            description: 'Pakistani spicy masala flavor potato chips. Large pack',
            price: 10000,
            stock: 25,
            active: true,
            imageUrls: ['/design/chips.svg'],
          } as any,
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-16 space-y-7 sm:space-y-10">
      {/* Hero Section (Figma 11-Mobile-Home & 01-Desktop-Home) */}
      <section className="relative rounded-[26px] sm:rounded-[36px] bg-[#16251F] text-white p-6 sm:p-10 lg:p-14 overflow-hidden shadow-sm">
        {/* Warm Peach Cutout Circle Background (matches Figma hero top right) */}
        <div className="hidden sm:block absolute top-4 right-4 sm:top-8 sm:right-16 w-20 h-20 sm:w-36 sm:h-36 rounded-full bg-[#F8A882] opacity-90 pointer-events-none" />

        {/* Ambient subtle glow */}
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-[#244E3B] blur-3xl pointer-events-none opacity-40" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="md:col-span-7 space-y-4 sm:space-y-6">
            <span className="inline-block px-3 py-1 rounded-full border border-white/25 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#D5E3D8]">
              Campus life, simplified
            </span>

            <h1 className="text-[32px] sm:text-[46px] lg:text-[52px] font-[800] leading-[1.08] tracking-tight">
              Your campus day,
              <br />
              <span className="text-white">made easier.</span>
            </h1>

            <p className="text-[#A2B5A8] text-sm sm:text-base font-normal max-w-md leading-relaxed">
              Snacks, study goodies and daily essentials, ready when your next class is.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-lime text-ink font-bold text-xs sm:text-sm hover:bg-[#cfe569] transition-all active:scale-95 shadow-sm"
              >
                <span>Shop essentials</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>

              <a
                href="#how-it-works"
                className="hidden sm:inline-flex items-center px-5 py-3 rounded-full border border-white/20 text-white font-semibold text-xs sm:text-sm hover:bg-white/10 transition-colors"
              >
                How it works
              </a>
            </div>
          </div>

          {/* Hero Right Visual (Floating Products / Artwork) */}
          <div className="md:col-span-5 relative hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-[420px] aspect-[4/3]">
              <Image
                src="/design/hero-art.svg"
                alt="Campus essentials illustration"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Info Strip Below Hero (Figma 11-Mobile-Home & 01-Desktop-Home) */}
      <div className="rounded-[18px] sm:rounded-[22px] bg-white border border-line/70 p-3 sm:p-4 px-4 sm:px-6 shadow-xs">
        {/* Mobile strip: single clean centered row */}
        <div className="flex md:hidden items-center justify-center gap-2 text-xs font-semibold text-ink text-center">
          <Zap size={15} className="text-leaf fill-leaf" />
          <span>Pickup in ~20 min</span>
          <span className="text-muted">•</span>
          <span>Cash on collection</span>
        </div>

        {/* Desktop strip: 3 key campus pillars */}
        <div className="hidden md:grid grid-cols-3 gap-6 text-center divide-x divide-line/70 text-xs sm:text-[13px] font-semibold text-ink">
          <div className="flex items-center justify-center gap-2 px-2">
            <Zap size={16} className="text-leaf" />
            <span>Quick campus pickup (~20 mins)</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-2">
            <Banknote size={16} className="text-leaf" />
            <span>Cash on collection (No card needed)</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-2">
            <MapPin size={16} className="text-leaf" />
            <span>Made for COMSATS Islamabad</span>
          </div>
        </div>
      </div>

      {/* Shop by Category Section (Figma 11-Mobile & 01-Desktop) */}
      <section id="categories" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-[800] text-ink tracking-tight">
            <span className="hidden sm:inline">Find what you need, fast.</span>
            <span className="inline sm:hidden">Shop by category</span>
          </h2>
          <Link
            href="/catalog"
            className="text-xs sm:text-sm font-bold text-leaf hover:text-ink transition-colors flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Mobile 2-card grid vs Desktop 4-card grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className={`${cat.bg} rounded-[20px] p-4 sm:p-5 flex flex-col justify-between aspect-[1/0.95] sm:aspect-auto sm:min-h-[140px] group border border-black/5 hover:shadow-sm transition-all duration-200 no-underline`}
            >
              <div>
                <h3 className="font-extrabold text-[15px] sm:text-base text-ink group-hover:text-leaf transition-colors leading-snug">
                  <span className="sm:hidden">{cat.name}</span>
                  <span className="hidden sm:inline">{cat.desktopName}</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-muted mt-0.5">
                  <span className="sm:hidden">{cat.copy}</span>
                  <span className="hidden sm:inline">{cat.desktopCopy}</span>
                </p>
              </div>

              {/* Graphic in bottom corner */}
              <div className="self-end relative w-12 h-12 sm:w-14 sm:h-14 mt-2 transition-transform duration-200 group-hover:scale-110">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Today Section (Figma 11-Mobile & 01-Desktop) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-[800] text-ink tracking-tight">
            <span className="hidden sm:inline">Popular between classes</span>
            <span className="inline sm:hidden">Popular today</span>
          </h2>
          <Link
            href="/catalog"
            className="text-xs sm:text-sm font-bold text-leaf hover:text-ink transition-colors flex items-center gap-1"
          >
            <span>See all</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

        {/* 2-col on mobile, 4-col on desktop */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] aspect-[1/1.2] animate-pulse border border-line"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* How it Works / Campus Info Section */}
      <section
        id="how-it-works"
        className="rounded-[24px] sm:rounded-[28px] bg-canvas-alt/70 border border-line p-6 sm:p-10 space-y-6"
      >
        <div className="max-w-md">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-leaf">
            How CampusTuck Works
          </span>
          <h2 className="text-xl sm:text-2xl font-[800] text-ink tracking-tight mt-1">
            Between classes. In three simple steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[18px] p-5 border border-line/60 space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-canvas-soft text-leaf flex items-center justify-center font-black text-sm">
              1
            </div>
            <h3 className="font-bold text-[15px] text-ink">Find your essentials</h3>
            <p className="text-xs text-muted leading-relaxed">
              Browse iced drinks, warm lunches, notebooks, and hostel supplies right from your phone.
            </p>
          </div>

          <div className="bg-white rounded-[18px] p-5 border border-line/60 space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-canvas-soft text-leaf flex items-center justify-center font-black text-sm">
              2
            </div>
            <h3 className="font-bold text-[15px] text-ink">Choose pickup or delivery</h3>
            <p className="text-xs text-muted leading-relaxed">
              Pick up at CUI Main Tuck Counter in ~20 minutes or get delivery directly to your hostel room.
            </p>
          </div>

          <div className="bg-white rounded-[18px] p-5 border border-line/60 space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-canvas-soft text-leaf flex items-center justify-center font-black text-sm">
              3
            </div>
            <h3 className="font-bold text-[15px] text-ink">Collect & pay cash</h3>
            <p className="text-xs text-muted leading-relaxed">
              Show your order pickup code and pay with cash on collection. Fast, safe, and convenient.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
