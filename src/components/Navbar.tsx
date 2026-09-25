'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Check,
  Search,
  ShoppingBag,
  User,
  Home,
  LayoutGrid,
  ClipboardList,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hide store navbar on admin pages
  if (pathname.startsWith('/admin')) return null;

  const isCheckout = pathname === '/checkout';

  return (
    <>
      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-[#F8F8F3]/95 backdrop-blur-md border-b border-line/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group no-underline" aria-label="CampusTuck Home">
            <div className="w-6 h-6 rounded-full bg-lime text-ink flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="font-extrabold text-[19px] sm:text-[21px] tracking-tight text-ink flex items-center">
              campus<span className="text-ink">tuck</span><span className="text-leaf">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-muted" aria-label="Main Navigation">
            <Link
              href="/catalog"
              className={`hover:text-ink transition-colors ${
                pathname === '/catalog' ? 'text-ink font-bold' : ''
              }`}
            >
              Shop
            </Link>
            <Link
              href="/#categories"
              className="hover:text-ink transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/orders"
              className={`hover:text-ink transition-colors ${
                pathname.startsWith('/orders') ? 'text-ink font-bold' : ''
              }`}
            >
              My orders
            </Link>
          </nav>

          {/* Right Tools (Search, Account, Bag) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Button / Input on Desktop */}
            <div className="relative">
              <Link
                href="/catalog"
                className="w-9 h-9 rounded-full flex items-center justify-center text-ink/80 hover:text-ink hover:bg-canvas-alt transition-colors"
                aria-label="Search items"
                title="Search the shop"
              >
                <Search size={19} strokeWidth={2} />
              </Link>
            </div>

            {/* Account Profile Icon */}
            <div className="relative">
              <button
                type="button"
                aria-label="Account Menu"
                aria-expanded={accountMenuOpen}
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ink/80 hover:text-ink hover:bg-canvas-alt transition-colors"
              >
                <User size={19} strokeWidth={2} />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-line shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {user ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-line/60">
                        <p className="font-bold text-ink text-xs truncate">{user.name}</p>
                        <p className="text-muted text-[11px] truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink hover:bg-canvas-soft transition-colors"
                      >
                        <ClipboardList size={14} className="text-muted" />
                        My Orders
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink hover:bg-canvas-soft transition-colors"
                      >
                        <User size={14} className="text-muted" />
                        Profile Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-leaf bg-canvas-soft/80 hover:bg-canvas-soft transition-colors"
                        >
                          <ShieldCheck size={14} />
                          Admin Workspace
                        </Link>
                      )}
                      <div className="border-t border-line/60 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      <Link
                        href="/login"
                        onClick={() => setAccountMenuOpen(false)}
                        className="w-full flex items-center justify-center py-2 px-3 rounded-full bg-lime text-ink font-bold text-xs hover:bg-[#cde467] transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setAccountMenuOpen(false)}
                        className="w-full flex items-center justify-center py-2 px-3 rounded-full border border-line text-ink font-bold text-xs hover:bg-canvas transition-colors"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Bag Icon with Count */}
            <Link
              href="/cart"
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink/80 hover:text-ink hover:bg-canvas-alt transition-colors"
              aria-label={`Shopping bag with ${totalItems} items`}
            >
              <ShoppingBag size={19} strokeWidth={2} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-leaf text-lime text-[10px] font-black flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Figma Screens 11, 12, 13, 14, 16, etc.) */}
      {!isCheckout && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F8F8F3]/95 backdrop-blur-md border-t border-line/70 px-4 py-2 flex items-center justify-around shadow-lg"
          aria-label="Mobile Navigation"
        >
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              pathname === '/' ? 'text-ink font-bold' : 'text-muted font-medium hover:text-ink'
            }`}
          >
            <div className={`p-1 rounded-lg ${pathname === '/' ? 'bg-canvas-alt text-leaf' : ''}`}>
              <Home size={19} strokeWidth={pathname === '/' ? 2.4 : 1.8} />
            </div>
            <span className="text-[11px]">Home</span>
          </Link>

          <Link
            href="/catalog"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              pathname === '/catalog' ? 'text-ink font-bold' : 'text-muted font-medium hover:text-ink'
            }`}
          >
            <div className={`p-1 rounded-lg ${pathname === '/catalog' ? 'bg-canvas-alt text-leaf' : ''}`}>
              <LayoutGrid size={19} strokeWidth={pathname === '/catalog' ? 2.4 : 1.8} />
            </div>
            <span className="text-[11px]">Shop</span>
          </Link>

          <Link
            href="/orders"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              pathname.startsWith('/orders') ? 'text-ink font-bold' : 'text-muted font-medium hover:text-ink'
            }`}
          >
            <div className={`p-1 rounded-lg ${pathname.startsWith('/orders') ? 'bg-canvas-alt text-leaf' : ''}`}>
              <ClipboardList size={19} strokeWidth={pathname.startsWith('/orders') ? 2.4 : 1.8} />
            </div>
            <span className="text-[11px]">Orders</span>
          </Link>

          <Link
            href={user ? '/profile' : '/login'}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              pathname === '/profile' || pathname === '/login' || pathname === '/register'
                ? 'text-ink font-bold'
                : 'text-muted font-medium hover:text-ink'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                pathname === '/profile' || pathname === '/login' ? 'bg-canvas-alt text-leaf' : ''
              }`}
            >
              <User size={19} strokeWidth={pathname === '/profile' || pathname === '/login' ? 2.4 : 1.8} />
            </div>
            <span className="text-[11px]">{user ? 'Account' : 'Sign in'}</span>
          </Link>
        </nav>
      )}
    </>
  );
}
