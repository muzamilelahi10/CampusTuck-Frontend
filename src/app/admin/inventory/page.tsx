'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  History,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Filter,
  Search,
  Package,
  Boxes,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  User,
  ShoppingBag,
  Clock,
  X,
} from 'lucide-react';
import { IInventoryMovement } from '@campustuck/shared';
import { adminAPI } from '../../../lib/api';

const REASON_FILTERS: { label: string; value: string }[] = [
  { label: 'All Movements', value: '' },
  { label: 'Student Checkouts', value: 'order_created' },
  { label: 'Vendor Restocks', value: 'restock' },
  { label: 'Cancelled Restorations', value: 'order_cancelled' },
  { label: 'Admin Adjustments', value: 'admin_adjustment' },
];

export default function AdminInventoryPage() {
  const [movements, setMovements] = useState<IInventoryMovement[]>([]);
  const [reasonFilter, setReasonFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadMovements = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getInventoryAudit({
        reason: reasonFilter || undefined,
        limit: 100,
      });

      if (res.success && res.movements) {
        setMovements(res.movements);
      }
    } catch (err) {
      console.error('Error fetching inventory movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [reasonFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const totalEvents = movements.length;
    let unitsInflow = 0;
    let unitsOutflow = 0;
    let cancellationCount = 0;

    movements.forEach((m) => {
      if (m.quantityChange > 0) {
        unitsInflow += m.quantityChange;
      } else {
        unitsOutflow += Math.abs(m.quantityChange);
      }
      if (m.reason === 'order_cancelled') {
        cancellationCount += 1;
      }
    });

    return { totalEvents, unitsInflow, unitsOutflow, cancellationCount };
  }, [movements]);

  // Filtered movements based on search
  const filteredMovements = useMemo(() => {
    if (!search.trim()) return movements;
    const q = search.toLowerCase();

    return movements.filter((m) => {
      const prodName =
        typeof m.product === 'object' && m.product ? (m.product as any).name?.toLowerCase() : '';
      const orderNum =
        typeof m.relatedOrder === 'object' && m.relatedOrder
          ? (m.relatedOrder as any).orderNumber?.toLowerCase()
          : '';
      const adminName =
        typeof m.admin === 'object' && m.admin ? (m.admin as any).name?.toLowerCase() : '';

      return prodName.includes(q) || orderNum.includes(q) || adminName.includes(q);
    });
  }, [movements, search]);

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'order_created':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] border border-slate-200">
            <ShoppingBag className="w-3 h-3 text-slate-500" />
            <span>Student Checkout</span>
          </span>
        );
      case 'order_cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
            <RotateCcw className="w-3 h-3 text-emerald-600" />
            <span>Order Cancelled (Auto-Restocked)</span>
          </span>
        );
      case 'restock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-bold text-[10px] border border-blue-200">
            <TrendingUp className="w-3 h-3 text-blue-600" />
            <span>Vendor Restock</span>
          </span>
        );
      case 'admin_adjustment':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 font-bold text-[10px] border border-purple-200">
            <User className="w-3 h-3 text-purple-600" />
            <span>Admin Count Adjustment</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 font-bold text-[10px]">
            {reason}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#16251F] via-[#21382E] to-[#16251F] text-white p-6 sm:p-8 rounded-3xl shadow-md border border-emerald-900/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wide uppercase">
            <History className="w-3.5 h-3.5" />
            COMSATS Tuck Stock Ledger & Audit Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Inventory Movement Audit</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
            Complete cryptographic audit trail showing stock deductions on checkouts, bakery deliveries, vendor restocks, and cancellation restorations.
          </p>
        </div>

        <button
          onClick={loadMovements}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/10 backdrop-blur-sm shadow-sm self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Events */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Audit Events</span>
            <div className="text-2xl font-black text-slate-900">{kpis.totalEvents}</div>
            <span className="text-[10px] text-slate-500 font-medium">Logged movements</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
        </div>

        {/* Stock Inflow */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Stock Inflow</span>
            <div className="text-2xl font-black text-emerald-900">+{kpis.unitsInflow} units</div>
            <span className="text-[10px] text-emerald-600 font-medium">Restocks & replenishments</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Stock Deducted */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Stock Dispatched</span>
            <div className="text-2xl font-black text-slate-900">-{kpis.unitsOutflow} units</div>
            <span className="text-[10px] text-slate-500 font-medium">Student order checkouts</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Cancellation Restorations */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Restored Orders</span>
            <div className="text-2xl font-black text-purple-900">{kpis.cancellationCount}</div>
            <span className="text-[10px] text-purple-600 font-medium">Stock returned on cancels</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Movement Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {REASON_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setReasonFilter(f.value)}
                className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  reasonFilter === f.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, order #, or admin..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
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
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-4">Tuck Product</th>
                <th className="py-3.5 px-4">Inventory Delta</th>
                <th className="py-3.5 px-4">Audit Reason</th>
                <th className="py-3.5 px-4">Stock Transition</th>
                <th className="py-3.5 px-5 text-right">Event Attribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                    <p className="font-semibold text-xs text-slate-500">Retrieving audit history from server...</p>
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 space-y-2">
                    <History className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-sm text-slate-700">No inventory audit events found.</p>
                    <p className="text-xs text-slate-400">All checkout deductions and restocks will appear here in real time.</p>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const prod = typeof m.product === 'object' && m.product ? (m.product as any) : null;
                  const prodName = prod?.name || 'Tuck Shop Item';
                  const prodImg = prod?.imageUrls?.[0];
                  const isPositive = m.quantityChange > 0;
                  const orderNum =
                    typeof m.relatedOrder === 'object' && m.relatedOrder
                      ? (m.relatedOrder as any).orderNumber
                      : null;

                  return (
                    <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-900 block text-[11px]">
                          {new Date(m.timestamp).toLocaleTimeString('en-PK', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.timestamp).toLocaleDateString('en-PK', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {prodImg && (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200/80">
                              <Image src={prodImg} alt={prodName} fill className="object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 block text-xs truncate max-w-xs">{prodName}</span>
                            {prod?.slug && <span className="text-[10px] text-slate-400 font-mono block">{prod.slug}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Quantity Change Delta */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPositive ? <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />}
                          <span>{isPositive ? `+${m.quantityChange}` : m.quantityChange}</span>
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-4">{getReasonBadge(m.reason)}</td>

                      {/* Stock Transition */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {m.previousStock}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span
                            className={`px-2 py-0.5 rounded font-black ${
                              isPositive
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            {m.newStock} units
                          </span>
                        </div>
                      </td>

                      {/* Attribution / Reference */}
                      <td className="py-4 px-5 text-right">
                        {orderNum ? (
                          <Link
                            href="/admin/orders"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-mono font-bold text-[11px] hover:bg-blue-100 transition-colors border border-blue-200/50"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>{orderNum}</span>
                          </Link>
                        ) : typeof m.admin === 'object' && m.admin ? (
                          <span className="inline-flex items-center gap-1 text-slate-600 font-semibold text-[11px]">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{(m.admin as any).name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Automatic Engine</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
