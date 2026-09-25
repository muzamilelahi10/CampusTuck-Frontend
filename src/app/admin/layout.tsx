'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Check,
  LayoutDashboard,
  ClipboardList,
  Boxes,
  History,
  Store,
  Menu,
  X,
  LogOut,
  MoreHorizontal,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { adminAPI } from '../../lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, loading, logout } = useAuth();
  const { connected } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      try {
        const res = await adminAPI.getMetrics();
        if (!isMounted || !res.success) return;
        setPendingOrdersCount(res.metrics.pendingOrdersCount ?? 0);
      } catch (error) {
        console.error('Failed to load admin metrics:', error);
      }
    }

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-xs bg-[#F8F9F5]">
        Loading workspace...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-[24px] border border-line text-center space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Admin Access Required</h2>
        <p className="text-xs text-muted">
          This portal is restricted to authorized campus tuck shop staff.
        </p>
        <Link
          href="/login?redirect=/admin"
          className="inline-block py-2.5 px-6 rounded-full bg-lime text-ink font-bold text-xs"
        >
          Sign in with admin account
        </Link>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    {
      href: '/admin/orders',
      label: 'Orders',
      icon: ClipboardList,
      badge: pendingOrdersCount !== null && pendingOrdersCount > 0 ? String(pendingOrdersCount) : undefined,
    },
    { href: '/admin/inventory', label: 'Products & Inventory', icon: Boxes },
    { href: '/admin/staff', label: 'Admin Access & Staff', icon: ShieldCheck },
  ];

  const adminInitial = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ME';
  const adminName = user?.name || 'Muzamil Elahi';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9F5]">
      {/* Mobile Top Header (Figma 18, 21, 22: Dark Forest Green Bar) */}
      <header className="md:hidden bg-[#16251F] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2 group no-underline">
          <div className="w-6 h-6 rounded-full bg-lime text-ink flex items-center justify-center shrink-0">
            <Check size={14} strokeWidth={3} />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white flex items-center">
            campus<span className="text-white">tuck</span><span className="text-lime">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[11px] font-semibold text-[#A2B5A8] hover:text-white"
          >
            Storefront
          </Link>
          <div className="w-8 h-8 rounded-full bg-white/15 text-white font-extrabold text-xs flex items-center justify-center border border-white/20">
            {adminInitial}
          </div>
        </div>
      </header>

      {/* Desktop Left Sidebar (Figma 08, 09, 10: Dark Forest Green Sidebar #16251F) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#16251F] text-white shrink-0 sticky top-0 h-screen border-r border-[#243B30] p-5 justify-between">
        <div className="space-y-6">
          {/* Brand Logo */}
          <Link href="/admin" className="flex items-center gap-2.5 group no-underline">
            <div className="w-7 h-7 rounded-full bg-lime text-ink flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Check size={16} strokeWidth={3} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
              campus<span className="text-white">tuck</span><span className="text-lime">.</span>
            </span>
          </Link>

          {/* Section Label */}
          <p className="text-[10px] font-extrabold tracking-widest text-[#7C9484] uppercase">
            Workspace
          </p>

          {/* Nav Items */}
          <nav className="space-y-1.5" aria-label="Admin Navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[#253D30] text-white'
                      : 'text-[#9AAC9F] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} strokeWidth={active ? 2.4 : 1.8} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-lime text-ink text-[10px] font-black">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Back to Customer Storefront */}
          <div className="pt-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#9AAC9F] hover:text-white transition-colors"
            >
              <Store size={15} />
              <span>Customer Storefront</span>
            </Link>
          </div>
        </div>

        {/* Bottom Profile Footer */}
        <div className="pt-4 border-t border-[#243B30] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-lime text-ink font-bold text-xs flex items-center justify-center shrink-0">
              {adminInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-[#9AAC9F]">Store admin</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-lg text-[#9AAC9F] hover:text-rose-400 transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Admin Navigation Dock (Figma 18, 21, 22) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#16251F] border-t border-[#243B30] px-4 py-2 flex items-center justify-around text-white shadow-xl"
        aria-label="Mobile Admin Navigation"
      >
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            pathname === '/admin' ? 'text-lime font-bold' : 'text-[#9AAC9F] font-medium'
          }`}
        >
          <LayoutDashboard size={18} strokeWidth={pathname === '/admin' ? 2.4 : 1.8} />
          <span className="text-[10px]">Overview</span>
        </Link>

        <Link
          href="/admin/orders"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            pathname.startsWith('/admin/orders') ? 'text-lime font-bold' : 'text-[#9AAC9F] font-medium'
          }`}
        >
          <ClipboardList size={18} strokeWidth={pathname.startsWith('/admin/orders') ? 2.4 : 1.8} />
          <span className="text-[10px]">Orders</span>
        </Link>

        <Link
          href="/admin/inventory"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            pathname.startsWith('/admin/inventory') ? 'text-lime font-bold' : 'text-[#9AAC9F] font-medium'
          }`}
        >
          <Boxes size={18} strokeWidth={pathname.startsWith('/admin/inventory') ? 2.4 : 1.8} />
          <span className="text-[10px]">Products</span>
        </Link>

        <Link
          href="/admin/staff"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
            pathname.startsWith('/admin/staff') ? 'text-lime font-bold' : 'text-[#9AAC9F] font-medium'
          }`}
        >
          <ShieldCheck size={18} strokeWidth={pathname.startsWith('/admin/staff') ? 2.4 : 1.8} />
          <span className="text-[10px]">Staff</span>
        </Link>

        <Link
          href="/"
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[#9AAC9F] font-medium hover:text-white"
        >
          <Store size={18} strokeWidth={1.8} />
          <span className="text-[10px]">Store</span>
        </Link>
      </nav>
    </div>
  );
}
