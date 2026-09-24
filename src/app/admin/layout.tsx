'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Check,
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Tags,
  History,
  Store,
  BarChart3,
  Search,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();
  const { connected } = useSocket();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-xs bg-[#F8F9F5]">
        Loading workspace...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-[18px] border border-line text-center space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Admin Access Required</h2>
        <p className="text-xs text-muted">
          This portal is restricted to authorized campus tuck shop staff.
        </p>
        <Link href="/login?redirect=/admin" className="primary-button !min-h-[40px] !text-xs">
          Sign in with admin account
        </Link>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ClipboardList, badge: '08' },
    { href: '/admin/products', label: 'Products', icon: Boxes },
    { href: '/admin/inventory', label: 'Inventory', icon: History },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/staff', label: 'Staff & Admins', icon: Users },
    { href: '/admin#reports', label: 'Reports', icon: BarChart3 },
  ];

  const adminInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'M';
  const adminName = user?.name || 'Muzamil Elahi';

  return (
    <div className="admin-shell">
      {/* Sidebar (03-Admin-Dashboard.svg) */}
      <aside className="admin-sidebar">
        {/* Brand Header */}
        <div className="admin-brand-header">
          <div className="w-7 h-7 rounded-full bg-lime text-ink flex items-center justify-center shrink-0">
            <Check size={16} strokeWidth={2.8} />
          </div>
          <span>campustuck.</span>
        </div>

        {/* Section Label */}
        <div className="admin-section-label">WORKSPACE</div>

        {/* Navigation items */}
        <nav className="admin-nav" aria-label="Admin Navigation">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                <span>{item.label}</span>
                {item.badge && <span className="admin-badge-count">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Back to Customer Storefront Link */}
        <div className="px-4 py-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#9AAC9F] hover:text-white transition-colors"
          >
            <Store size={16} />
            <span>Customer Storefront</span>
          </Link>
        </div>

        {/* Bottom Profile Footer (03-Admin-Dashboard.svg) */}
        <div className="admin-user-footer">
          <div className="admin-user-avatar">{adminInitial}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{adminName}</p>
            <p className="text-[10px] text-[#9AAC9F]">Store admin</p>
          </div>
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-lime' : 'bg-amber-400'}`}
            title={connected ? 'Socket Connected' : 'Reconnecting...'}
          />
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div className="admin-main flex-1 flex flex-col min-w-0 bg-[#F8F9F5]">
        {/* Top bar with breadcrumb and search/avatar */}
        <header className="admin-topbar">
          <div className="flex items-center gap-2.5">
            <span className="admin-topbar-title font-bold text-ink">COMSATS Tuck Admin</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500 capitalize">
              {pathname === '/admin' ? 'Overview' : pathname.replace('/admin/', '').replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>COMSATS Islamabad</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center font-bold text-xs text-ink shadow-xs">
              {adminInitial}
            </div>
          </div>
        </header>

        {/* Page children with consistent, generous padding (Top, Bottom, Left, Right) */}
        <main className="flex-1 px-6 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-9 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
