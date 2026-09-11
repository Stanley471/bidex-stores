'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/currency'

interface OrderHistoryItem {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod?: string
  grandTotal: number
  createdAt: string
  items: Array<{
    id: string
    productNameSnapshot: string
    quantity: number
  }>
}

export function OrderHistory() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currencyCode, setCurrencyCode] = useState('NGN')

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
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load order history.')
        }
        setOrders(data.data.orders || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load orders.')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700 font-medium">
        {error}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4">
        <span className="text-5xl">🛍️</span>
        <h3 className="text-lg font-bold text-slate-900">No orders placed yet</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          When you place orders, your order history and status updates will appear here.
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-indigo-100 text-indigo-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-rose-100 text-rose-800',
  }

  const getMethodLabel = (method?: string) => {
    const m = (method || '').toUpperCase()
    if (m === 'CASH_ON_DELIVERY' || m === 'COD') return 'Cash on Delivery'
    if (m === 'CARD') return 'Card'
    if (m === 'BANK_TRANSFER') return 'Bank Transfer'
    if (m === 'WALLET') return 'Digital Wallet'
    return method ? method.replace(/_/g, ' ') : 'Cash on Delivery'
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const methodNormalized = (order.paymentMethod || '').toUpperCase()
        const isCod = methodNormalized.includes('CASH') || methodNormalized === 'COD'
        const isPaid = (order.paymentStatus || '').toUpperCase() === 'PAID'
        const formattedTotal = formatCurrency(Number(order.grandTotal), currencyCode)

        return (
          <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-base">{order.orderNumber}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      statusColors[order.status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold">
                    {getMethodLabel(order.paymentMethod)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isPaid ? 'Paid' : 'Payment: Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </p>
                {/* Buyer payment expectations note */}
                {!isPaid && (
                  <p className="text-xs font-medium text-slate-700 mt-1">
                    {isCod ? (
                      <span className="text-emerald-700">
                        💵 Pay {formattedTotal} on delivery
                      </span>
                    ) : methodNormalized === 'BANK_TRANSFER' ? (
                      <span className="text-cyan-800">
                        🏦 Transfer {formattedTotal} to complete order
                      </span>
                    ) : methodNormalized === 'CARD' ? (
                      <span className="text-blue-800">
                        💳 Card payment pending confirmation
                      </span>
                    ) : (
                      <span className="text-purple-800">
                        👛 Wallet payment pending confirmation
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-xs text-slate-400">Total Amount</p>
                  <p className="font-bold text-slate-900 text-lg">{formattedTotal}</p>
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-700">Items:</span>{' '}
              {order.items.map((i) => `${i.productNameSnapshot} (x${i.quantity})`).join(', ')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
