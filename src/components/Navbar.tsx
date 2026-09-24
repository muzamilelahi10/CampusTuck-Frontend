'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Search, ShoppingBag, User, Home, PackageCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide store navbar on admin pages
  if (pathname.startsWith('/admin')) return null;

  const isCartOrCheckout = pathname === '/cart' || pathname === '/checkout';

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="announcement">
        <span>COMSATS University Islamabad</span>
        <span>•</span>
        <span>Pickup in minutes at CUI Tuck Shops</span>
      </div>

      {/* Main Storefront Header */}
      <header className="store-header">
        <div className="store-nav">
          {/* Brand Logo */}
          <Link href="/" className="brand" aria-label="CampusTuck Home">
            <span className="brand-mark">
              <Check size={17} strokeWidth={2.6} />
            </span>
            <span>campus</span>
            <span className="brand-dot">tuck.</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-links" aria-label="Main Navigation">
            <Link href="/catalog" className={pathname === '/catalog' ? 'active' : ''}>
              Shop
            </Link>
            <Link href="/#categories">Categories</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/orders" className={pathname.startsWith('/orders') ? 'active' : ''}>
              My orders
            </Link>
          </nav>

          {/* Nav Tools (Right) */}
          <div className="nav-tools">
            <Link href="/catalog" aria-label="Search Catalog" title="Search essentials">
              <Search size={21} strokeWidth={1.8} />
            </Link>

            {/* Account Menu */}
            <div className="relative">
              <button
                type="button"
                aria-label="Account Menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
                className="hover:text-leaf"
              >
                <User size={21} strokeWidth={1.8} />
              </button>

              {menuOpen && (
                <div className="account-menu">
                  {user ? (
                    <>
                      <div className="pb-2 border-b border-line">
                        <p className="font-bold text-ink text-sm">{user.name}</p>
                        <p className="text-muted text-xs">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="text-muted hover:text-ink font-medium"
                      >
                        My profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="text-muted hover:text-ink font-medium"
                      >
                        My orders
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="text-leaf font-bold"
                        >
                          Admin Workspace
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="text-rose-600 font-medium text-left pt-2 border-t border-line"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="primary-button !min-h-[38px] !text-xs !py-1"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="secondary-button !min-h-[36px] !text-xs !py-1 text-center"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Bag */}
            <Link href="/cart" className="cart-link" aria-label={`Shopping cart with ${totalItems} items`}>
              <ShoppingBag size={21} strokeWidth={1.8} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (05-Mobile-Home.svg) */}
      {!isCartOrCheckout && (
        <nav className="mobile-tabs" aria-label="Mobile Bottom Navigation">
          <Link
            href="/"
            className={`mobile-tab-link ${pathname === '/' ? 'active' : ''}`}
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            <Home size={20} strokeWidth={pathname === '/' ? 2.2 : 1.7} />
            <span>Home</span>
          </Link>
          <Link
            href="/catalog"
            className={`mobile-tab-link ${pathname === '/catalog' ? 'active' : ''}`}
            aria-current={pathname === '/catalog' ? 'page' : undefined}
          >
            <Search size={20} strokeWidth={pathname === '/catalog' ? 2.2 : 1.7} />
            <span>Shop</span>
          </Link>
          <Link
            href="/orders"
            className={`mobile-tab-link ${pathname.startsWith('/orders') ? 'active' : ''}`}
            aria-current={pathname.startsWith('/orders') ? 'page' : undefined}
          >
            <ShoppingBag size={20} strokeWidth={pathname.startsWith('/orders') ? 2.2 : 1.7} />
            <span>Orders</span>
          </Link>
          <Link
            href={user ? '/profile' : '/login'}
            className={`mobile-tab-link ${pathname === '/profile' || pathname === '/login' ? 'active' : ''}`}
            aria-current={pathname === '/profile' ? 'page' : undefined}
          >
            <User size={20} strokeWidth={pathname === '/profile' ? 2.2 : 1.7} />
            <span>{user ? 'Profile' : 'Sign in'}</span>
          </Link>
        </nav>
      )}
    </>
  );
}
