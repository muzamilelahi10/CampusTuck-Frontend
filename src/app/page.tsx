'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Cookie, Coffee, NotebookPen, Package, Clock, Banknote, Sparkles } from 'lucide-react';
import { IProduct } from '@campustuck/shared';
import { productsAPI } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';

const DESKTOP_CATEGORIES = [
  { name: 'Snacks', slug: 'snacks', copy: 'Cookie break', bg: 'bg-[#FAE7D7]' },
  { name: 'Drinks', slug: 'drinks', copy: 'Stay refreshed', bg: 'bg-[#E4EDF1]' },
  { name: 'Stationery', slug: 'stationery', copy: 'Study sorted', bg: 'bg-[#E9EDDC]' },
  { name: 'Essentials', slug: 'essentials', copy: 'Daily must-haves', bg: 'bg-[#F2E5E0]' },
];

const MOBILE_CATEGORIES = [
  { name: 'Snacks', slug: 'snacks', icon: '✦', bg: 'bg-[#F9E7D9]' },
  { name: 'Drinks', slug: 'drinks', icon: '◦', bg: 'bg-[#E8EDF2]' },
  { name: 'Study', slug: 'stationery', icon: '▤', bg: 'bg-[#EDF0E2]' },
];

export default function HomePage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    productsAPI
      .getAll({ limit: 4, sort: 'newest' })
      .then((res) => {
        if (res.success && res.products) {
          setProducts(res.products);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const greetingName = user ? user.name.split(' ')[0] : 'Sara';

  return (
    <div className="home-page">
      {/* Mobile Greeting (05-Mobile-Home.svg) */}
      <div className="mobile-greeting block md:hidden space-y-1">
        <p className="text-muted text-sm font-medium">Good morning, {greetingName} ☀</p>
        <h1 className="text-[29px] font-[780] text-ink leading-tight">
          Your campus,
          <br />
          right on time.
        </h1>
      </div>

      {/* Hero Section (01-Storefront Desktop & 05-Mobile Home Promo) */}
      <section className="hero">
        <div className="hero-copy">
          {/* Desktop Hero Copy */}
          <div className="hidden md:block">
            <p className="eyebrow">COMSATS UNIVERSITY ISLAMABAD</p>
            <h1>
              The good stuff,
              <br />
              right around
              <br />
              the corner.
            </h1>
            <p className="hero-description">
              Snacks, Junaid Zaidi library study supplies, and campus essentials.
              <br />
              Order ahead, pick up fast at CUI tuck counters, get on with your day.
            </p>
          </div>

          {/* Mobile Hero Promo Card Inside Container (05-Mobile-Home.svg) */}
          <div className="block md:hidden">
            <p className="text-[10px] font-extrabold text-leaf tracking-wider uppercase mb-2">
              COMSATS ISLAMABAD TUCK SHOP
            </p>
            <h2 className="text-[23px] font-[780] text-ink leading-snug mb-4">
              Snacks for
              <br />
              every schedule.
            </h2>
          </div>

          {/* Action CTAs */}
          <div className="hero-actions">
            <Link href="/catalog" className="primary-button">
              <span className="hidden md:inline">Shop essentials</span>
              <span className="inline md:hidden text-xs">Shop now →</span>
            </Link>
            <a href="#how-it-works" className="secondary-button hidden md:inline-flex">
              How it works
            </a>
          </div>
        </div>

        {/* Hero Visual Right Art (01-Storefront-Desktop.svg) */}
        <div className="hero-art-container hidden md:flex">
          <Image
            src="/design/hero.svg"
            alt="Campus Matcha and Notebook with Fresh Finds Ready in 20 min"
            width={565}
            height={455}
            className="hero-art"
            priority
          />
        </div>

        {/* Mobile Cookie Floating Graphic (05-Mobile-Home.svg) */}
        <div className="block md:hidden absolute right-3 bottom-3 w-28 h-28 pointer-events-none">
          <Image
            src="/design/cookie.svg"
            alt="Fresh Chocolate Cookie"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
      </section>

      {/* Categories Section (01-Storefront & 05-Mobile) */}
      <section id="categories">
        <div className="section-heading">
          <h2>
            <span className="hidden md:inline">Shop by your study-day needs</span>
            <span className="inline md:hidden text-xl font-[750]">Browse categories</span>
          </h2>
          <Link href="/catalog">
            <span className="hidden md:inline">View all →</span>
            <span className="inline md:hidden text-xs font-bold text-leaf">See all</span>
          </Link>
        </div>

        {/* Desktop Category Grid (4 horizontal cards) */}
        <div className="category-grid hidden md:grid">
          {DESKTOP_CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className={`category-tile category-${idx}`}
            >
              <div>
                <h3>{cat.name}</h3>
                <p>{cat.copy}</p>
              </div>
              <span className="category-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile Category Grid (3 square cards with symbols) */}
        <div className="grid grid-cols-3 gap-3 md:hidden">
          {MOBILE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalog?category=${cat.slug}`}
              className={`${cat.bg} rounded-[15px] p-4 flex flex-col items-center justify-center gap-2 text-center no-underline`}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg font-bold text-ink shadow-sm">
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-ink">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Today Section */}
      <section>
        <div className="section-heading">
          <h2>Popular today</h2>
          <Link href="/catalog">
            <span>See all</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="product-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="product-skeleton animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-line rounded-[18px] bg-white text-muted text-sm">
            {error
              ? 'Shop catalog is temporarily unavailable. Please refresh or try again shortly.'
              : 'Fresh finds are on their way. Check back between classes!'}
          </div>
        )}
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="p-8 md:p-12 bg-[#EFF2E7] rounded-[24px]">
        <div className="section-heading mb-8">
          <h2>Between classes. In three steps.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-leaf shadow-sm">
              <Package size={24} />
            </div>
            <h3 className="text-base font-bold text-ink">1. Find your essentials</h3>
            <p className="text-sm text-muted">
              Browse iced drinks, warm lunches, stationery, and daily hostel items.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-leaf shadow-sm">
              <Clock size={24} />
            </div>
            <h3 className="text-base font-bold text-ink">2. Choose pickup or delivery</h3>
            <p className="text-sm text-muted">
              Collect at CUI tuck counters in 20 minutes or get delivery to your hostel room or department.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-leaf shadow-sm">
              <Banknote size={24} />
            </div>
            <h3 className="text-base font-bold text-ink">3. Collect & pay cash</h3>
            <p className="text-sm text-muted">
              Pay simply with cash upon pickup or hand-off. No online card required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
