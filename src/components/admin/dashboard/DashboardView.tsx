'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  FolderTree,
  Package,
  Pencil,
  Plus,
  Tag,
  Ticket,
  Truck,
  Users,
} from 'lucide-react'
import type { DashboardStatsResult, DateRangePeriod } from '@/services/dashboard.service'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/currency'
import { Skeleton } from '@/components/ui/skeleton'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING: 'bg-purple-100 text-purple-800 border-purple-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
  REFUNDED: 'bg-rose-100 text-rose-800 border-rose-200',
}

const PAYMENT_BADGE_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
}

export function DashboardView() {
  const [period, setPeriod] = useState<DateRangePeriod>('month')
  const [stats, setStats] = useState<DashboardStatsResult | null>(null)
  const [currencyCode, setCurrencyCode] = useState<string>('NGN')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCurrency() {
      try {
        const res = await fetch('/api/settings/public')
        const data = await res.json()
        if (res.ok && data.success && data.settings?.currencyCode) {
          setCurrencyCode(data.settings.currencyCode)
        }
      } catch {
        // Fallback default retained
      }
    }
    void loadCurrency()
  }, [])

  useEffect(() => {
    let ignore = false

    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/dashboard?range=${period}`)
        const data = await res.json()

        if (!ignore) {
          if (res.ok && data.success) {
            setStats(data.stats)
          } else {
            setError(data.message || 'Failed to load dashboard data.')
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Unable to connect to server.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchStats()
    return () => {
      ignore = true
    }
  }, [period])

  // Calculate max revenue for visual bar scaling
  const maxRevenue = stats?.salesOverview
    ? Math.max(...stats.salesOverview.map((d) => d.revenue), 1)
    : 1

  return (
    <div className="space-y-8">
      {/* Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Merchant Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time sales performance, inventory alerts, and order pipeline statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as DateRangePeriod)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all_time">All Time</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Merchant Shortcuts */}
      <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-white">Merchant Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link href="/admin/products/new">
            <Button variant="secondary" className="w-full h-11 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 inline-flex items-center gap-1.5">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add Product
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="secondary" className="w-full h-11 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 inline-flex items-center gap-1.5">
              <Package className="h-4 w-4" aria-hidden="true" /> Manage Orders
            </Button>
          </Link>
          <Link href="/admin/coupons">
            <Button variant="secondary" className="w-full h-11 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 inline-flex items-center gap-1.5">
              <Ticket className="h-4 w-4" aria-hidden="true" /> Create Coupon
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button variant="secondary" className="w-full h-11 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 inline-flex items-center gap-1.5">
              <FolderTree className="h-4 w-4" aria-hidden="true" /> Categories
            </Button>
          </Link>
          <Link href="/admin/shipping">
            <Button variant="secondary" className="w-full h-11 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 inline-flex items-center gap-1.5">
              <Truck className="h-4 w-4" aria-hidden="true" /> Shipping
            </Button>
          </Link>
          <Link href="/admin/brands">
            <Button variant="secondary" className="w-full h-11 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 inline-flex items-center gap-1.5">
              <Tag className="h-4 w-4" aria-hidden="true" /> Brands
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Period Revenue</span>
            <DollarSign className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {loading ? <Skeleton className="h-7 w-24 rounded-md" /> : formatCurrency(stats?.sales.periodRevenue || 0, currencyCode)}
          </p>
          <p className="text-[11px] text-slate-500">
            All-time: <span className="font-semibold text-slate-700">{formatCurrency(stats?.sales.totalRevenue || 0, currencyCode)}</span>
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders</span>
            <Package className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {loading ? <Skeleton className="h-7 w-12 rounded-md" /> : stats?.orders.totalOrders || 0}
          </p>
          <p className="text-[11px] text-slate-500">
            In selected period
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Customers</span>
            <Users className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {loading ? <Skeleton className="h-7 w-12 rounded-md" /> : stats?.customers.totalCustomers || 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            +{stats?.customers.monthNewCustomers || 0} new this month
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Items</span>
            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {loading ? <Skeleton className="h-7 w-12 rounded-md" /> : (stats?.products.outOfStockCount || 0) + (stats?.products.lowStockCount || 0)}
          </p>
          <p className="text-[11px] text-slate-500">
            <span className="text-rose-600 font-bold">{stats?.products.outOfStockCount || 0}</span> out of stock
          </p>
        </div>
      </div>

      {/* Sales Overview Chart (Last 7 Days) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Sales Overview (Last 7 Days)</h2>
            <p className="text-xs text-slate-500">Daily paid revenue performance</p>
          </div>
          <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Live Database Sync
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-44 w-full rounded-2xl" />
        ) : stats?.salesOverview.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-xs text-slate-400">
            No sales recorded in the last 7 days.
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="pt-4 flex items-end gap-4 sm:gap-6 h-48 border-b border-slate-200 pb-2 min-w-[500px]">
              {stats?.salesOverview.map((day) => {
                const heightPercent = Math.max(8, Math.round((day.revenue / maxRevenue) * 100))
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                      <span>{formatCurrency(day.revenue, currencyCode)}</span>
                      <span className="text-slate-400 text-[9px]">{day.orderCount} order(s)</span>
                    </div>

                    {/* Bar Container */}
                    <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-36">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-slate-900 group-hover:bg-emerald-600 transition-all rounded-t-xl"
                      />
                    </div>

                    <span className="text-[11px] font-semibold text-slate-600 truncate max-w-full">{day.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Status Pipeline Breakdown */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Order Pipeline Status</h2>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline">
            <span>Manage All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(stats?.orders.byStatus || {}).map(([statusKey, count]) => (
            <div
              key={statusKey}
              className={`rounded-2xl border p-3 text-center space-y-1 ${
                STATUS_BADGE_CLASSES[statusKey] || 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{statusKey}</p>
              <p className="text-xl font-black">{loading ? '-' : count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-slate-900 hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton className="h-10 w-full rounded-xl" key={i} />
              ))}
            </div>
          ) : stats?.recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No orders placed yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {stats?.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                      <td className="py-3">
                        <p className="font-semibold text-slate-900">{order.customerName}</p>
                        <p className="text-[10px] text-slate-400">{order.customerEmail}</p>
                      </td>
                      <td className="py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                      <td className="py-3 font-bold text-slate-900">{formatCurrency(order.grandTotal, currencyCode)}</td>
                      <td className="py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              STATUS_BADGE_CLASSES[order.status] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold border ${
                              PAYMENT_BADGE_CLASSES[order.paymentStatus] || 'bg-slate-50 text-slate-600'
                            }`}
                          >
                            Payment: {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-[11px] px-2">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock & Out-of-Stock Alerts (1 Col) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Inventory Alerts</h2>
            <Link href="/admin/products" className="text-xs font-bold text-slate-900 hover:underline">
              Manage Stock
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton className="h-14 w-full rounded-2xl" key={i} />
              ))}
            </div>
          ) : stats?.products.stockAlerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-600 font-medium flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <span>All products are currently well stocked.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.products.stockAlerts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60"
                >
                  <div className="space-y-0.5 max-w-[170px]">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    {item.variantName && (
                      <p className="text-[10px] font-semibold text-slate-500">{item.variantName}</p>
                    )}
                    {item.sku && <p className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</p>}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                        item.stock === 0
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                    </span>
                    <Link href={`/admin/products/${item.productId}/edit`}>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900" aria-label="Edit product">
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
