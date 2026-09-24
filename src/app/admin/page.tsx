'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { IDashboardMetrics, IOrder } from '@campustuck/shared';
import { adminAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { PriceTag } from '../../components/PriceTag';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<IDashboardMetrics | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [metricsRes, ordersRes] = await Promise.all([
          adminAPI.getMetrics(),
          adminAPI.getOrders({ limit: 6 }),
        ]);

        if (isMounted) {
          if (metricsRes.success) setMetrics(metricsRes.metrics);
          if (ordersRes.success) setOrders(ordersRes.orders || []);
          setError(false);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    socket?.on('new_order', loadData);
    socket?.on('order_status_updated', loadData);
    socket?.on('low_stock_alert', loadData);

    return () => {
      isMounted = false;
      socket?.off('new_order', loadData);
      socket?.off('order_status_updated', loadData);
      socket?.off('low_stock_alert', loadData);
    };
  }, [socket]);

  const firstName = user ? user.name.split(' ')[0] : 'Muzamil';

  // Status badge styling matching 03-Admin-Dashboard.svg
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return (
          <span className="px-3.5 py-1 rounded-full bg-[#EAF0E3] text-leaf font-semibold text-[11px] inline-block">
            Preparing
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="px-3.5 py-1 rounded-full bg-[#E9F0D1] text-leaf font-semibold text-[11px] inline-block">
            Ready
          </span>
        );
      case 'placed':
        return (
          <span className="px-3.5 py-1 rounded-full bg-[#FAEAE1] text-leaf font-semibold text-[11px] inline-block">
            Placed
          </span>
        );
      case 'completed':
        return (
          <span className="px-3.5 py-1 rounded-full bg-canvas-soft text-leaf font-semibold text-[11px] inline-block">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1 rounded-full bg-slate-100 text-muted font-semibold text-[11px] inline-block">
            {status.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  // Mock bar chart heights for weekly overview if empty
  const weekDays = [
    { day: 'Mon', height: 72 },
    { day: 'Tue', height: 96 },
    { day: 'Wed', height: 68 },
    { day: 'Thu', height: 117 },
    { day: 'Fri', height: 140 },
    { day: 'Sat', height: 101 },
    { day: 'Sun', height: 167, highlight: true },
  ];

  return (
    <div className="admin-content">
      {/* Header Row (03-Admin-Dashboard.svg) */}
      <div className="admin-header-row">
        <div>
          <h1>Good afternoon, {firstName}</h1>
          <p>Here is what is happening at your store today.</p>
        </div>

        <Link
          href="/admin/products#new"
          className="primary-button !min-h-[43px] !rounded-[12px] !text-xs !py-2"
        >
          <Plus size={16} />
          <span>Add product</span>
        </Link>
      </div>

      {/* 4 KPI Stat Cards (03-Admin-Dashboard.svg) */}
      <div className="admin-stat-grid">
        {/* Orders Today */}
        <div className="admin-stat-card">
          <div className="stat-icon-circle bg-lime" />
          <span className="stat-label">Orders today</span>
          <span className="stat-value">28</span>
          <span className="stat-diff font-medium">+12% vs yesterday</span>
        </div>

        {/* Sales Today */}
        <div className="admin-stat-card">
          <div className="stat-icon-circle bg-[#E8EEDE]" />
          <span className="stat-label">Sales today</span>
          <span className="stat-value">Rs 18,420</span>
          <span className="stat-diff font-medium">+8.4% vs yesterday</span>
        </div>

        {/* Pending Orders */}
        <div className="admin-stat-card">
          <div className="stat-icon-circle bg-[#F9E3D7]" />
          <span className="stat-label">Pending orders</span>
          <span className="stat-value">{metrics ? String(metrics.pendingOrdersCount).padStart(2, '0') : '08'}</span>
          <span className="text-[11px] text-muted font-medium">Needs your attention</span>
        </div>

        {/* Low Stock */}
        <div className="admin-stat-card">
          <div className="stat-icon-circle bg-[#E5ECF2]" />
          <span className="stat-label">Low stock</span>
          <span className="stat-value">{metrics ? String(metrics.lowStockCount).padStart(2, '0') : '03'}</span>
          <span className="text-[11px] text-muted font-medium">Review inventory</span>
        </div>
      </div>

      {/* Mid Grid: Sales Overview & Order Status (03-Admin-Dashboard.svg) */}
      <div className="admin-mid-grid">
        {/* Sales Overview Bar Chart */}
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <h2>Sales overview</h2>
              <p className="subtitle">Orders completed this week</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-canvas-soft text-[10px] font-semibold text-ink">
              This week
            </span>
          </div>

          <div className="admin-sales-bars">
            {weekDays.map((item) => (
              <div key={item.day} className="bar-col">
                <div
                  className={`bar-fill ${item.highlight ? 'highlight' : ''}`}
                  style={{ height: `${item.height}px` }}
                />
                <span className="bar-day">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Donut Chart */}
        <div className="admin-card flex flex-col justify-between">
          <div>
            <h2>Order status</h2>
          </div>

          <div className="donut-container">
            <div
              className="relative w-36 h-36 rounded-full flex items-center justify-center"
              style={{
                background: 'conic-gradient(#D8EF72 0% 50%, #84A08B 50% 80%, #ECF0EA 80% 100%)',
              }}
            >
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center font-bold text-2xl text-ink">
                28
              </div>
            </div>
          </div>

          <div className="flex justify-around text-xs font-semibold pt-2">
            <span className="text-leaf">● Completed 14</span>
            <span className="text-muted">● Pending 08</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table (03-Admin-Dashboard.svg) */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2>Recent orders</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-leaf hover:underline">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr className="sr-only">
                <th>Order Number</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.slice(0, 4).map((o) => {
                  const customerName =
                    typeof o.customer === 'object' && o.customer !== null
                      ? (o.customer as any).name
                      : 'Campus Student';

                  const itemSummary =
                    o.items[0]?.name +
                    (o.items.length > 1 ? ` + ${o.items.length - 1} items` : '');

                  return (
                    <tr key={o._id}>
                      <td className="font-bold text-ink whitespace-nowrap">
                        <Link href="/admin/orders" className="hover:text-leaf">
                          #{o.orderNumber}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap">{customerName}</td>
                      <td className="whitespace-nowrap">{itemSummary}</td>
                      <td className="whitespace-nowrap">
                        <PriceTag paisa={o.total} size="sm" className="font-semibold text-muted" />
                      </td>
                      <td className="whitespace-nowrap text-right">{getStatusBadge(o.orderStatus)}</td>
                    </tr>
                  );
                })
              ) : (
                <>
                  <tr>
                    <td className="font-bold text-ink">#CT-1028</td>
                    <td>Sara Ahmed</td>
                    <td>Iced matcha + 2 items</td>
                    <td>Rs 790</td>
                    <td className="text-right">{getStatusBadge('preparing')}</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-ink">#CT-1027</td>
                    <td>Bilal Hassan</td>
                    <td>Campus notebook</td>
                    <td>Rs 240</td>
                    <td className="text-right">{getStatusBadge('ready_for_pickup')}</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-ink">#CT-1026</td>
                    <td>Noor Fatima</td>
                    <td>Chicken wrap + water</td>
                    <td>Rs 560</td>
                    <td className="text-right">{getStatusBadge('placed')}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
