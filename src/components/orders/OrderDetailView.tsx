'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency'
import { Banknote, Building2, CreditCard, Wallet, MessageSquare } from 'lucide-react'

function getMethodLabel(method?: string) {
  const m = (method || '').toUpperCase()
  if (m === 'CASH_ON_DELIVERY' || m === 'COD') return 'Cash on Delivery (COD)'
  if (m === 'CARD') return 'Credit / Debit Card'
  if (m === 'BANK_TRANSFER') return 'Direct Bank Transfer'
  if (m === 'WALLET') return 'Digital Wallet'
  return method ? method.replace(/_/g, ' ') : 'Cash on Delivery'
}

interface OrderItemSnapshot {
  id: string
  productNameSnapshot: string
  productSkuSnapshot?: string | null
  productPriceSnapshot: number
  quantity: number
  unitPrice: number
  total: number
}

interface AddressSnapshot {
  firstName: string
  lastName: string
  phone?: string | null
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  country: string
  postalCode: string
}

export interface OrderMessageItem {
  id: string
  orderId: string
  message: string
  createdBy: string
  createdAt: string
  sender?: {
    id: string
    name: string
    role?: string
  }
}

interface OrderDetail {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  shippingFee: number
  tax: number
  discount: number
  grandTotal: number
  couponCodeSnapshot?: string | null
  notes?: string | null
  shippingAddressSnapshot: AddressSnapshot
  items: OrderItemSnapshot[]
  messages?: OrderMessageItem[]
}

interface OrderDetailViewProps {
  order: OrderDetail
  isAdmin?: boolean
}

export function OrderDetailView({ order: initialOrder }: OrderDetailViewProps) {
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail>(initialOrder)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currencyCode, setCurrencyCode] = useState('NGN')
  const [storeName, setStoreName] = useState('Store')

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings/public')
        const data = await res.json()
        if (res.ok && data.success) {
          if (data.settings?.currencyCode) {
            setCurrencyCode(data.settings.currencyCode)
          }
          if (data.settings?.storeName) {
            setStoreName(data.settings.storeName)
          }
        }
      } catch {
        // Fallback defaults retained
      }
    }
    void loadSettings()
  }, [])

  const fmtCurrency = (val: number) => formatCurrencyUtil(val, currencyCode)

  const address = order.shippingAddressSnapshot

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    REFUNDED: 'bg-rose-100 text-rose-800 border-rose-200',
  }

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED'

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    setCancelling(true)
    setError(null)

    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to cancel order.')
      }

      setOrder(data.order)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to cancel order.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/orders" className="text-sm font-medium text-slate-500 hover:text-slate-900">
            ← Back to Orders History
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-slate-900">Order {order.orderNumber}</h1>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-bold border uppercase tracking-wider ${
                statusColors[order.status] || 'bg-slate-100 text-slate-800'
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'full' })}
          </p>
        </div>

        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="outline"
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="text-red-600 hover:bg-red-50 border-red-200"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>

      {/* Customer Payment Guidance Banner */}
      {(() => {
        const methodNormalized = (order.paymentMethod || '').toUpperCase()
        const isPaid = (order.paymentStatus || '').toUpperCase() === 'PAID'
        const isCod = methodNormalized.includes('CASH') || methodNormalized === 'COD'

        if (isPaid) {
          return (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <span className="text-lg">✓</span>
                <span>Payment Confirmed ({getMethodLabel(order.paymentMethod)})</span>
              </div>
              <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                Thank you! Your payment of {fmtCurrency(Number(order.grandTotal))} has been received and confirmed.
              </p>
            </div>
          )
        }

        if (isCod) {
          return (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <Banknote className="h-5 w-5 text-emerald-700" />
                <span>Cash on Delivery — Pay on Arrival</span>
              </div>
              <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                Please prepare <strong className="font-bold text-emerald-950">{fmtCurrency(Number(order.grandTotal))}</strong> to pay our delivery agent when your package arrives. Cash and POS card payments are accepted upon delivery.
              </p>
            </div>
          )
        }

        if (methodNormalized === 'BANK_TRANSFER') {
          return (
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
              <div className="flex items-center gap-2 font-bold text-cyan-950">
                <Building2 className="h-5 w-5 text-cyan-700" />
                <span>Direct Bank Transfer — Awaiting Payment</span>
              </div>
              <p className="mt-1 text-xs text-cyan-800 leading-relaxed">
                Please transfer <strong className="font-bold text-cyan-950">{fmtCurrency(Number(order.grandTotal))}</strong> to our corporate account using your order number <strong className="font-mono">{order.orderNumber}</strong> as reference. Your order will be dispatched once our team verifies your transfer.
              </p>
            </div>
          )
        }

        if (methodNormalized === 'CARD') {
          return (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <div className="flex items-center gap-2 font-bold text-blue-950">
                <CreditCard className="h-5 w-5 text-blue-700" />
                <span>Card Payment — Verification Pending</span>
              </div>
              <p className="mt-1 text-xs text-blue-800 leading-relaxed">
                Payment confirmation for <strong className="font-bold text-blue-950">{fmtCurrency(Number(order.grandTotal))}</strong> is currently pending. You will receive an update once the payment gateway reconciles your transaction.
              </p>
            </div>
          )
        }

        return (
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
            <div className="flex items-center gap-2 font-bold text-purple-950">
              <Wallet className="h-5 w-5 text-purple-700" />
              <span>Digital Wallet — Verification Pending</span>
            </div>
            <p className="mt-1 text-xs text-purple-800 leading-relaxed">
              Wallet payment verification for <strong className="font-bold text-purple-950">{fmtCurrency(Number(order.grandTotal))}</strong> is pending confirmation.
            </p>
          </div>
        )
      })()}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Messages / Notes to Customer Section */}
      {order.messages && order.messages.length > 0 && (
        <div className="rounded-3xl border border-brand-primary/25 bg-gradient-to-b from-brand-primary/5 to-transparent p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-brand-primary/15 pb-3">
            <div className="h-8 w-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Updates from {storeName}
              </h3>
              <p className="text-xs text-slate-500">
                Delivery instructions, dispatch notes, and contact details from our team.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {order.messages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-1.5 transition"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-brand-primary flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-brand-primary"></span>
                    {storeName} Support Team
                  </span>
                  <span className="font-medium text-slate-400">
                    {new Date(msg.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p className="text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Items Table */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Items ({order.items.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.productNameSnapshot}</h4>
                    {item.productSkuSnapshot && (
                      <p className="text-xs font-mono text-slate-400">SKU: {item.productSkuSnapshot}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-0.5">
                      {fmtCurrency(Number(item.unitPrice))} × {item.quantity}
                    </p>
                  </div>
                  <div className="font-bold text-slate-900 text-base">
                    {fmtCurrency(Number(item.total))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Summary & Address */}
        <div className="space-y-6">
          {/* Address Snapshot */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2 text-sm text-slate-600">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Shipping Address
            </h3>
            <p className="font-semibold text-slate-900">
              {address.firstName} {address.lastName}
            </p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p className="font-medium text-slate-700">{address.country}</p>
            {address.phone && <p className="text-xs text-slate-500 mt-1">📞 {address.phone}</p>}
          </div>

          {/* Totals Breakdown */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-sm text-slate-700">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Order Breakdown
            </h3>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">{fmtCurrency(Number(order.subtotal))}</span>
            </div>

            {order.couponCodeSnapshot && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Coupon ({order.couponCodeSnapshot})</span>
                <span>-{fmtCurrency(Number(order.discount))}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-medium text-slate-900">
                {Number(order.shippingFee) === 0 ? 'FREE' : fmtCurrency(Number(order.shippingFee))}
              </span>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-3 font-bold text-slate-900 text-lg">
              <span>Grand Total</span>
              <span>{fmtCurrency(Number(order.grandTotal))}</span>
            </div>

            <div className="pt-3 text-xs border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-800">{getMethodLabel(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Status:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    (order.paymentStatus || '').toUpperCase() === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {(order.paymentStatus || '').toUpperCase() === 'PAID' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
