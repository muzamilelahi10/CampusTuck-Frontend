'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  Package,
  Bike,
  Banknote,
  X,
  Phone,
  User,
  MapPin,
  AlertCircle,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Timer,
  Check,
  Copy,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { IOrder, OrderStatus, PaymentStatus, paisaToRupees } from '@campustuck/shared';
import { adminAPI } from '../../../lib/api';
import { useSocket } from '../../../contexts/SocketContext';
import { useToast } from '../../../components/Toast';
import { StatusBadge } from '../../../components/StatusBadge';
import { PriceTag } from '../../../components/PriceTag';

const STATUS_TABS: { label: string; value: string; color: string }[] = [
  { label: 'All Orders', value: 'all', color: 'slate' },
  { label: 'Placed', value: 'placed', color: 'amber' },
  { label: 'Confirmed', value: 'confirmed', color: 'blue' },
  { label: 'Preparing', value: 'purple', color: 'purple' },
  { label: 'Ready / Out', value: 'ready_or_out', color: 'emerald' },
  { label: 'Completed', value: 'completed', color: 'teal' },
  { label: 'Cancelled', value: 'cancelled', color: 'rose' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [fulfilmentFilter, setFulfilmentFilter] = useState<'all' | 'pickup' | 'delivery'>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Detail drawer
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const { socket } = useSocket();
  const { toast } = useToast();

  const loadOrders = async () => {
    try {
      const res = await adminAPI.getOrders({
        status: activeTab === 'ready_or_out' ? undefined : activeTab,
        search: search.trim() || undefined,
        limit: 100,
      });

      if (res.success && res.orders) {
        let filtered = res.orders;
        if (activeTab === 'ready_or_out') {
          filtered = filtered.filter(
            (o: IOrder) => o.orderStatus === 'ready_for_pickup' || o.orderStatus === 'out_for_delivery'
          );
        }
        if (fulfilmentFilter !== 'all') {
          filtered = filtered.filter((o: IOrder) => o.fulfilmentType === fulfilmentFilter);
        }
        setOrders(filtered);

        // Keep drawer selected order updated
        if (selectedOrder) {
          const fresh = filtered.find((o: IOrder) => o._id === selectedOrder._id);
          if (fresh) setSelectedOrder(fresh);
        }
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab, fulfilmentFilter, search]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('new_order', () => {
      loadOrders();
    });

    socket.on('order_status_updated', () => {
      loadOrders();
    });

    return () => {
      socket.off('new_order');
      socket.off('order_status_updated');
    };
  }, [socket, activeTab, fulfilmentFilter, search]);

  // KPI computations across current queue
  const kpis = useMemo(() => {
    const totalCount = orders.length;
    const placedCount = orders.filter((o) => o.orderStatus === 'placed').length;
    const activePrepCount = orders.filter(
      (o) =>
        o.orderStatus === 'confirmed' ||
        o.orderStatus === 'preparing' ||
        o.orderStatus === 'ready_for_pickup' ||
        o.orderStatus === 'out_for_delivery'
    ).length;
    const totalVolumePaisa = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalVolumeRs = paisaToRupees(totalVolumePaisa);

    return { totalCount, placedCount, activePrepCount, totalVolumeRs };
  }, [orders]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      counts[o.orderStatus] = (counts[o.orderStatus] || 0) + 1;
      if (o.orderStatus === 'ready_for_pickup' || o.orderStatus === 'out_for_delivery') {
        counts['ready_or_out'] = (counts['ready_or_out'] || 0) + 1;
      }
    });
    return counts;
  }, [orders]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus, note?: string) => {
    setActionLoading(true);

    try {
      const res = await adminAPI.updateOrderStatus(orderId, nextStatus, note);
      if (res.success && res.order) {
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(res.order);
        }
        toast.success(`Order #${res.order.orderNumber} advanced to ${nextStatus.replace(/_/g, ' ')}!`);
        loadOrders();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaymentPaid = async (orderId: string) => {
    setActionLoading(true);

    try {
      const res = await adminAPI.updatePaymentStatus(
        orderId,
        'paid',
        'Cash on Delivery collected by tuck shop cashier'
      );
      if (res.success && res.order) {
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(res.order);
        }
        toast.success(`Payment recorded as PAID for order #${res.order.orderNumber}.`);
        loadOrders();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment status.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyPhoneNumber = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    toast.success(`Phone copied: ${phone}`);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Get next natural step
  const getNextStepInfo = (order: IOrder) => {
    switch (order.orderStatus) {
      case 'placed':
        return { label: 'Confirm Order', nextStatus: 'confirmed' as OrderStatus, color: 'bg-blue-600 hover:bg-blue-700' };
      case 'confirmed':
        return { label: 'Start Preparing', nextStatus: 'preparing' as OrderStatus, color: 'bg-purple-600 hover:bg-purple-700' };
      case 'preparing':
        return order.fulfilmentType === 'pickup'
          ? { label: 'Mark Ready', nextStatus: 'ready_for_pickup' as OrderStatus, color: 'bg-emerald-600 hover:bg-emerald-700' }
          : { label: 'Out for Delivery', nextStatus: 'out_for_delivery' as OrderStatus, color: 'bg-indigo-600 hover:bg-indigo-700' };
      case 'ready_for_pickup':
      case 'out_for_delivery':
        return { label: 'Complete Order', nextStatus: 'completed' as OrderStatus, color: 'bg-emerald-700 hover:bg-emerald-800' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#16251F] via-[#21382E] to-[#16251F] text-white p-6 sm:p-8 rounded-3xl shadow-md border border-emerald-900/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            COMSATS Tuck Shop Live Order Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Order Queue & Dispatch</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
            Real-time fulfillment desk for cafeteria pick-up counters, CS/EE kiosk points, and hostel room delivery.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => loadOrders()}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/10 backdrop-blur-sm shadow-sm"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total in Queue</span>
            <div className="text-2xl font-black text-slate-900">{kpis.totalCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">Matching filter criteria</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Placed & Pending Confirmation */}
        <div
          onClick={() => setActiveTab('placed')}
          className={`cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border shadow-sm flex items-center justify-between transition-all hover:border-amber-400 ${
            activeTab === 'placed' ? 'ring-2 ring-amber-400 border-transparent bg-amber-50/20' : 'border-slate-200/80'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1.5">
              <span>Needs Attention</span>
              {kpis.placedCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </span>
            <div className="text-2xl font-black text-amber-900">{kpis.placedCount}</div>
            <span className="text-[10px] text-amber-600 font-medium">New Placed Orders</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* In Prep & Out */}
        <div
          onClick={() => setActiveTab('ready_or_out')}
          className={`cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border shadow-sm flex items-center justify-between transition-all hover:border-purple-400 ${
            activeTab === 'ready_or_out' ? 'ring-2 ring-purple-400 border-transparent bg-purple-50/20' : 'border-slate-200/80'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">In Progress</span>
            <div className="text-2xl font-black text-purple-900">{kpis.activePrepCount}</div>
            <span className="text-[10px] text-purple-600 font-medium">Preparing / Ready / Out</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5" />
          </div>
        </div>

        {/* Total Cash Value */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Filtered Volume</span>
            <div className="text-2xl font-black text-emerald-800">Rs. {kpis.totalVolumeRs.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500 font-medium">Active queue value</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Top Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
            {STATUS_TABS.map((tab) => {
              const count = tabCounts[tab.value] || 0;
              const isActive = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order # or Student Phone..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
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

        {/* Fulfillment Type Sub-Filters */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Method:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5">
              <button
                onClick={() => setFulfilmentFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  fulfilmentFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Methods
              </button>
              <button
                onClick={() => setFulfilmentFilter('pickup')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                  fulfilmentFilter === 'pickup' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-3 h-3" />
                <span>CUI Tuck Counters</span>
              </button>
              <button
                onClick={() => setFulfilmentFilter('delivery')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                  fulfilmentFilter === 'delivery' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bike className="w-3 h-3" />
                <span>Hostel & Block Delivery</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Showing <strong className="text-slate-900">{orders.length}</strong> orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Order Reference</th>
                <th className="py-3.5 px-4">Student Customer</th>
                <th className="py-3.5 px-4">Fulfillment Details</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Order Stage</th>
                <th className="py-3.5 px-4">Cash Settlement</th>
                <th className="py-3.5 px-5 text-right">Quick Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <RotateCcw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                    <p className="font-semibold text-xs text-slate-500">Retrieving live orders from CUI server...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-sm text-slate-700">No orders found in this filter.</p>
                    <p className="text-xs text-slate-400">Try changing your search keywords or active stage filter.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const customerName =
                    typeof order.customer === 'object' && order.customer
                      ? (order.customer as any).name
                      : 'COMSATS Student';

                  const nextStep = getNextStepInfo(order);

                  // Items summary text
                  const totalItemsCount = order.items.reduce((acc, it) => acc + it.quantity, 0);
                  const firstItem = order.items[0]?.name || 'Item';
                  const summaryText =
                    order.items.length === 1
                      ? `${order.items[0]?.quantity}x ${firstItem}`
                      : `${totalItemsCount} items (${firstItem} +${order.items.length - 1} more)`;

                  return (
                    <tr
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-all group"
                    >
                      {/* Order Reference */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 tracking-tight text-sm group-hover:text-emerald-700 transition-colors">
                            {order.orderNumber}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString('en-PK', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          • {new Date(order.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 block truncate max-w-[130px]">{customerName}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {order.fulfilmentDetails.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Method & Location */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-1.5">
                          {order.fulfilmentType === 'pickup' ? (
                            <span className="p-1 rounded-md bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                              <Package className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="p-1 rounded-md bg-blue-50 text-blue-700 shrink-0 mt-0.5">
                              <Bike className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 text-[11px] block truncate max-w-[160px]">
                              {order.fulfilmentType === 'pickup'
                                ? order.fulfilmentDetails.pickupPoint
                                : `${order.fulfilmentDetails.building}`}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                              {order.fulfilmentType === 'pickup'
                                ? 'Self-Pickup Counter'
                                : `Room ${order.fulfilmentDetails.room || 'Desk'}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Items Summary */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-slate-700 block truncate max-w-[150px]">{summaryText}</span>
                        <span className="text-[10px] text-slate-400">{order.items.length} unique line items</span>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <PriceTag paisa={order.total} size="sm" />
                      </td>

                      {/* Order Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={order.orderStatus} />
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-4">
                        <StatusBadge status={order.paymentStatus} type="payment" />
                      </td>

                      {/* Quick Action */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {nextStep && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, nextStep.nextStatus)}
                              disabled={actionLoading}
                              className={`px-3 py-1.5 rounded-xl text-white font-bold text-[11px] transition-all shadow-sm flex items-center gap-1 ${nextStep.color}`}
                              title={`Advance to ${nextStep.nextStatus}`}
                            >
                              <span>{nextStep.label}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slideout Order Inspection Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    COMSATS Tuck Order
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(selectedOrder.createdAt).toLocaleString('en-PK')}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 mt-1">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedOrder.orderNumber}</h2>
                  <StatusBadge status={selectedOrder.orderStatus} size="sm" />
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* Order Stage Advancement Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fulfillment Stage Actions</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500 capitalize">
                    Current: {selectedOrder.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedOrder.orderStatus === 'placed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'confirmed')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Order</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled', 'Cancelled by admin staff')}
                        disabled={actionLoading}
                        className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold transition-all"
                      >
                        Reject & Restock
                      </button>
                    </>
                  )}

                  {selectedOrder.orderStatus === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'preparing')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>Start Preparation</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled', 'Cancelled by admin staff')}
                        disabled={actionLoading}
                        className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {selectedOrder.orderStatus === 'preparing' && (
                    <>
                      {selectedOrder.fulfilmentType === 'pickup' ? (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'ready_for_pickup')}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Mark Ready at Tuck Counter!</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'out_for_delivery')}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Bike className="w-3.5 h-3.5" />
                          <span>Dispatch for Delivery</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled', 'Cancelled during prep')}
                        disabled={actionLoading}
                        className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {(selectedOrder.orderStatus === 'ready_for_pickup' ||
                    selectedOrder.orderStatus === 'out_for_delivery') && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'completed')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fulfill & Mark Completed</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled', 'Cancelled during handover')}
                        disabled={actionLoading}
                        className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold transition-all"
                      >
                        Cancel & Restock
                      </button>
                    </>
                  )}

                  {selectedOrder.orderStatus === 'completed' && (
                    <div className="w-full p-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>This order has been successfully fulfilled and handed over.</span>
                    </div>
                  )}

                  {selectedOrder.orderStatus === 'cancelled' && (
                    <div className="w-full p-2.5 rounded-xl bg-rose-100 text-rose-900 font-bold flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-rose-700" />
                      <span>This order is cancelled. Reserved stock was automatically restored.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cash Settlement Settlement Block */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <span className="font-extrabold text-amber-900">Cash on Delivery Settlement</span>
                  </div>
                  <StatusBadge status={selectedOrder.paymentStatus} type="payment" />
                </div>

                <div className="text-[11px] text-amber-800/90">
                  Total Payable: <strong>Rs. {(selectedOrder.total / 100).toFixed(0)} PKR</strong>
                </div>

                {selectedOrder.paymentStatus === 'pending' ? (
                  <button
                    onClick={() => handleMarkPaymentPaid(selectedOrder._id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Cash Collected (Rs. {(selectedOrder.total / 100).toFixed(0)})</span>
                  </button>
                ) : (
                  <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Cash settlement verified and recorded.
                  </p>
                )}
              </div>

              {/* Customer & Location */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                  Student Customer & Destination
                </h4>

                <div className="space-y-2.5 text-slate-700">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-900">
                        {typeof selectedOrder.customer === 'object' && selectedOrder.customer
                          ? (selectedOrder.customer as any).name
                          : 'Student Customer'}
                      </span>
                    </div>
                    {typeof selectedOrder.customer === 'object' && (selectedOrder.customer as any)?.email && (
                      <span className="text-[10px] text-slate-400">{(selectedOrder.customer as any).email}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono font-bold text-slate-800">
                        {selectedOrder.fulfilmentDetails.phone}
                      </span>
                    </div>

                    <button
                      onClick={() => copyPhoneNumber(selectedOrder.fulfilmentDetails.phone)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] flex items-center gap-1 transition-colors"
                    >
                      {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPhone ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        {selectedOrder.fulfilmentType === 'pickup'
                          ? 'CUI Pickup Counter Spot:'
                          : 'Campus Delivery Address:'}
                      </span>
                      <span className="text-slate-600 font-medium">
                        {selectedOrder.fulfilmentType === 'pickup'
                          ? selectedOrder.fulfilmentDetails.pickupPoint
                          : `${selectedOrder.fulfilmentDetails.building}, Room/Desk ${selectedOrder.fulfilmentDetails.room || 'N/A'}`}
                      </span>
                      {selectedOrder.fulfilmentDetails.deliveryInstructions && (
                        <p className="text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          Special Note: {selectedOrder.fulfilmentDetails.deliveryInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Order Receipt */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                  Ordered Items ({selectedOrder.items.length})
                </h4>

                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-[11px] text-slate-400">
                          Qty: <strong className="text-slate-700">{item.quantity}</strong> ×{' '}
                          <PriceTag paisa={item.unitPrice} size="sm" />
                        </span>
                      </div>
                      <PriceTag paisa={item.subtotal} size="sm" />
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <PriceTag paisa={selectedOrder.subtotal} size="sm" />
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Campus Delivery Fee</span>
                    <PriceTag paisa={selectedOrder.deliveryFee} size="sm" />
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-100 pt-2">
                    <span>Grand Total Due</span>
                    <PriceTag paisa={selectedOrder.total} size="md" />
                  </div>
                </div>
              </div>

              {/* Status Audit Log */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                  Order Event History
                </h4>
                <div className="space-y-2">
                  {selectedOrder.statusHistory.map((hist, idx) => (
                    <div key={idx} className="text-[11px] text-slate-600 flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 capitalize">{hist.status.replace(/_/g, ' ')}</span>
                        <span className="text-slate-400 ml-2">
                          {new Date(hist.timestamp).toLocaleTimeString('en-PK', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {hist.note && <p className="text-slate-500 mt-0.5">{hist.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
