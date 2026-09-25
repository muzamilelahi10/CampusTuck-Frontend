'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Clock, AlertTriangle, PackageCheck } from 'lucide-react';
import { IDashboardMetrics, IOrder } from '@campustuck/shared';
import { adminAPI } from '../../lib/api';
import { PriceTag } from '../../components/PriceTag';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<IDashboardMetrics | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [mRes, oRes] = await Promise.all([
          adminAPI.getMetrics(),
          adminAPI.getOrders({ limit: 5 }),
        ]);

        if (mRes.success && mRes.metrics) setMetrics(mRes.metrics);
        if (oRes.success && oRes.orders) setOrders(oRes.orders);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Demo bar chart values matching Figma Sales this week
  const weekDays = [
    { day: 'M', height: 45 },
    { day: 'T', height: 65 },
    { day: 'W', height: 50 },
    { day: 'T', height: 80 },
    { day: 'F', height: 75 },
    { day: 'S', height: 60 },
    { day: 'S', height: 95, active: true },
  ];

  // Default metrics matching Figma if empty
  const revenueTotal = metrics ? metrics.totalRevenuePaisa : 1248000; // Rs. 12,480
  const ordersCount = metrics
    ? metrics.pendingOrdersCount + metrics.completedOrdersCount
    : 38;
  const preparingCount = metrics ? metrics.pendingOrdersCount : 14;
  const lowStockCount = metrics ? metrics.lowStockCount : 3;

  const demoRecentOrders = [
    { id: '1', customer: 'Ayesha Khan', tag: '#CT-2041 • Pick up', status: 'PREPARING', amount: 71000 },
    { id: '2', customer: 'Ali Hassan', tag: '#CT-2042 • Hostels', status: 'READY', amount: 45000 },
    { id: '3', customer: 'Sara Ahmed', tag: '#CT-2040 • Pick up', status: 'COLLECTED', amount: 18000 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Live Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-[800] text-ink tracking-tight">Store overview</h1>
          <p className="text-xs text-muted mt-0.5">Today, 25 September • Live market</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/admin/staff"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-lime hover:bg-[#cfe569] text-ink font-bold text-xs transition-all shadow-xs"
          >
            <span>+ Grant Admin Access</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Campus shop open</span>
          </div>
        </div>
      </div>

      {/* 4 Key Metrics (Figma 18-Mobile 2x2 & 08-Desktop 4-col) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Revenue */}
        <div className="bg-white rounded-[22px] border border-line/80 p-4 sm:p-5 space-y-2 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Revenue
          </span>
          <p className="text-xl sm:text-2xl font-[900] text-ink">
            Rs. {Math.round(revenueTotal / 100).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-leaf">
            <TrendingUp size={13} />
            <span>+12.4%</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-[22px] border border-line/80 p-4 sm:p-5 space-y-2 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Orders
          </span>
          <p className="text-xl sm:text-2xl font-[900] text-ink">{ordersCount}</p>
          <p className="text-[11px] text-muted">14 this week</p>
        </div>

        {/* Preparing */}
        <div className="bg-white rounded-[22px] border border-line/80 p-4 sm:p-5 space-y-2 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Preparing
          </span>
          <p className="text-xl sm:text-2xl font-[900] text-ink">{preparingCount}</p>
          <p className="text-[11px] text-amber-600 font-semibold">3 ready soon</p>
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-[22px] border border-line/80 p-4 sm:p-5 space-y-2 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Low stock
          </span>
          <p className="text-xl sm:text-2xl font-[900] text-ink">0{lowStockCount}</p>
          <p className="text-[11px] text-rose-600 font-semibold">Needs attention</p>
        </div>
      </div>

      {/* Middle Row: Sales this week Bar Chart & Status Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Sales This Week Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-line/80 p-5 sm:p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-ink">Sales this week</h2>
            <span className="text-xs font-semibold text-leaf">Daily average: Rs. 9,400</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
            {weekDays.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className={`w-full max-w-[36px] rounded-t-xl transition-all ${
                    item.active ? 'bg-[#16251F]' : 'bg-[#E3EBE5] hover:bg-[#CAD8CE]'
                  }`}
                  style={{ height: `${item.height}%` }}
                />
                <span className="text-[11px] font-bold text-muted">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Gauge (Desktop & Mobile) */}
        <div className="lg:col-span-5 bg-white rounded-[24px] border border-line/80 p-5 sm:p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-ink">Order status</h2>
            <span className="text-xs text-muted">38 total</span>
          </div>

          {/* Circular donut summary display */}
          <div className="py-4 flex items-center justify-center">
            <div className="relative w-36 h-36 rounded-full border-[12px] border-[#16251F] border-t-lime border-r-[#3D674B] flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-[900] text-ink">38</span>
                <span className="block text-[10px] uppercase font-bold text-muted">Orders</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-line/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16251F]" />
              <span className="font-semibold text-ink">Preparing (14)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime" />
              <span className="font-semibold text-ink">Ready (7)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3D674B]" />
              <span className="font-semibold text-ink">Completed (12)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="font-semibold text-ink">New (5)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders List (Figma 18-Mobile & 08-Desktop) */}
      <div className="bg-white rounded-[24px] border border-line/80 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-leaf hover:text-ink transition-colors flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="divide-y divide-line/60">
          {(orders.length > 0 ? orders.slice(0, 4) : demoRecentOrders).map((order: any) => {
            const customerName =
              order.customerName ||
              (typeof order.customer === 'object' ? order.customer?.name : order.customer) ||
              'Ayesha Khan';
            const orderNum = order.orderNumber ? `#${order.orderNumber}` : order.tag;
            const statusStr = (order.orderStatus || order.status || 'PREPARING').toUpperCase();

            return (
              <div
                key={order._id || order.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-xs sm:text-sm text-ink">{customerName}</p>
                  <p className="text-[11px] text-muted">{orderNum}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider ${
                      statusStr.includes('PREPARING')
                        ? 'bg-amber-100 text-amber-900'
                        : statusStr.includes('READY')
                        ? 'bg-lime text-ink'
                        : 'bg-canvas-soft text-muted'
                    }`}
                  >
                    {statusStr.replace(/_/g, ' ')}
                  </span>
                  <Link
                    href="/admin/orders"
                    className="p-1 text-muted hover:text-ink hidden sm:block"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
