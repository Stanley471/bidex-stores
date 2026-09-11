'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AdminOrderRow } from './OrderTable'
import { OrderTable } from './OrderTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function OrderListPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currencyCode, setCurrencyCode] = useState('NGN')

  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchOrders = useCallback(async () => {
    try {
      // Fetch currency setting once
      const settingsRes = await fetch('/api/settings/public')
      const settingsData = await settingsRes.json()
      if (settingsRes.ok && settingsData.success && settingsData.settings?.currencyCode) {
        setCurrencyCode(settingsData.settings.currencyCode)
      }
      const url = new URL('/api/admin/orders', window.location.origin)
      url.searchParams.set('page', String(page))
      url.searchParams.set('pageSize', '20')

      if (search.trim()) url.searchParams.set('search', search.trim())
      if (status) url.searchParams.set('status', status)
      if (paymentStatus) url.searchParams.set('paymentStatus', paymentStatus)
      if (startDate) url.searchParams.set('startDate', startDate)
      if (endDate) url.searchParams.set('endDate', endDate)

      const res = await fetch(url.toString())
      const resData = await res.json()

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to fetch admin orders.')
      }

      setOrders(resData.data.orders)
      setTotal(resData.data.total)
      setPageCount(resData.data.pageCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching orders.')
    } finally {
      setLoading(false)
    }
  }, [page, search, status, paymentStatus, startDate, endDate])

  useEffect(() => {
    let ignore = false
    async function init() {
      try {
        const url = new URL('/api/admin/orders', window.location.origin)
        url.searchParams.set('page', String(page))
        url.searchParams.set('pageSize', '20')

        if (search.trim()) url.searchParams.set('search', search.trim())
        if (status) url.searchParams.set('status', status)
        if (paymentStatus) url.searchParams.set('paymentStatus', paymentStatus)
        if (startDate) url.searchParams.set('startDate', startDate)
        if (endDate) url.searchParams.set('endDate', endDate)

        const res = await fetch(url.toString())
        const resData = await res.json()

        if (!ignore) {
          if (res.ok && resData.success) {
            setOrders(resData.data.orders)
            setTotal(resData.data.total)
            setPageCount(resData.data.pageCount)
          } else {
            setError(resData.message || 'Failed to fetch admin orders.')
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Error fetching orders.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [page, search, status, paymentStatus, startDate, endDate])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update order status.')
      }

      setSuccess(`Order status updated to ${newStatus}.`)
      fetchOrders()
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update order status.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Merchant Order Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manage customer orders, track fulfillment stages, inspect Paystack references, and review historical totals ({total} total).
        </p>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Order #, customer, email, payment ref..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Fulfillment Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white font-medium"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white font-medium"
          >
            <option value="">All Payment States</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="h-12 w-full rounded-xl" key={i} />
          ))}
        </div>
      ) : (
        <OrderTable orders={orders} onStatusChange={handleStatusChange} currencyCode={currencyCode} />
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Page <span className="font-semibold">{page}</span> of{' '}
            <span className="font-semibold">{pageCount}</span> ({total} orders total, 20 per page)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
