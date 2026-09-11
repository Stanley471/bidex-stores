'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from '@/components/admin/orders/OrderStatusBadge'
import { ArrowLeft, Phone, MessageSquare, Loader2 } from 'lucide-react'
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminOrderPageProps {
  params: Promise<{
    id: string
  }>
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

interface PaymentRecord {
  id: string
  provider: string
  reference: string
  status: string
  providerTransactionId?: string | null
  createdAt: string
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

interface AdminOrderDetails {
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
  user: {
    id: string
    name: string
    email: string
  }
  items: OrderItemSnapshot[]
  payments?: PaymentRecord[]
  messages?: OrderMessageItem[]
}

const ORDER_STATUS_OPTIONS = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

const PAYMENT_STATUS_OPTIONS = [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
]

export default function AdminOrderDetailPage({ params }: AdminOrderPageProps) {
  const { id } = use(params)
  const [order, setOrder] = useState<AdminOrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currencyCode, setCurrencyCode] = useState('NGN')

  // Status updating states
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingPayment, setUpdatingPayment] = useState(false)

  // Order messages state
  const [newMessage, setNewMessage] = useState('')
  const [submittingMessage, setSubmittingMessage] = useState(false)

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

  const fmtCurrency = (val: number) => formatCurrencyUtil(val, currencyCode)

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`)
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Order not found.')
        }
        setOrder(data.order)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load order.')
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [id])

  // Capability 1: Immediate Manual Payment Status Update
  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    if (!order || newPaymentStatus === order.paymentStatus) return

    setUpdatingPayment(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}/payment-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update payment status.')
      }

      setOrder(data.order)
      setSuccess(`Payment status successfully updated to ${newPaymentStatus}!`)
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update payment status.')
    } finally {
      setUpdatingPayment(false)
    }
  }

  // Capability 2: Immediate Manual Order Fulfillment Status Update
  const handleOrderStatusChange = async (newStatus: string) => {
    if (!order || newStatus === order.status) return

    setUpdatingStatus(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update order status.')
      }

      setOrder(data.order)
      setSuccess(`Order fulfillment status successfully updated to ${newStatus}!`)
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update order status.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Capability 3: Add Message / Note to Customer
  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || submittingMessage) return

    setSubmittingMessage(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to post message.')
      }

      setOrder((prev) => {
        if (!prev) return prev
        const updatedMessages = [data.data, ...(prev.messages || [])]
        return { ...prev, messages: updatedMessages }
      })
      setNewMessage('')
      setSuccess('Message sent to customer order feed!')
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post order message.')
    } finally {
      setSubmittingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-3xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 font-medium">
        {error || 'Order not found.'}
      </div>
    )
  }

  if (!order) return null

  const address = order.shippingAddressSnapshot
  const latestPayment = order.payments?.[0]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Orders List
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Order {order.orderNumber}</h1>
          <p className="text-xs text-slate-500">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleString('en-US', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
        </div>
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

      {/* Admin Status Controls Panel (Manual Order Status & Manual Payment Status) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Order Management Controls</h3>
            <p className="text-xs text-slate-500">
              Manual controls update immediately and reflect across customer and merchant dashboards.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.paymentMethod} type="paymentMethod" />
            <OrderStatusBadge status={order.paymentStatus} type="paymentStatus" />
            <OrderStatusBadge status={order.status} type="status" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Order Fulfillment Status Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Order Fulfillment Status
              </label>
              {updatingStatus && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-primary">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                </span>
              )}
            </div>
            <select
              value={order.status}
              disabled={updatingStatus}
              onChange={(e) => handleOrderStatusChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-slate-900 focus:outline-none bg-white text-slate-900 cursor-pointer disabled:bg-slate-100 transition shadow-2xs"
            >
              {ORDER_STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st} {st === order.status ? '(Current)' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Changes order state (e.g. pending → processing → shipped → delivered).
            </p>
          </div>

          {/* Payment Status Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Payment Status
              </label>
              {updatingPayment && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-primary">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                </span>
              )}
            </div>
            <select
              value={order.paymentStatus}
              disabled={updatingPayment}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-slate-900 focus:outline-none bg-white text-slate-900 cursor-pointer disabled:bg-slate-100 transition shadow-2xs"
            >
              {PAYMENT_STATUS_OPTIONS.map((pst) => (
                <option key={pst} value={pst}>
                  {pst} {pst === order.paymentStatus ? '(Current)' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Changes financial status (e.g. pending → paid → failed).
            </p>
          </div>
        </div>
      </div>

      {/* Customer Order Messages & Notes Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-primary" aria-hidden="true" />
              <h3 className="text-lg font-bold text-slate-900">
                Customer Notes & Delivery Instructions
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Messages posted here will appear directly in the customer’s dashboard order view.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
            {order.messages?.length || 0}{' '}
            {order.messages?.length === 1 ? 'Message' : 'Messages'}
          </span>
        </div>

        {/* New Message Input Form */}
        <form onSubmit={handleAddMessage} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter delivery instructions, dispatch notes, driver contact, or expected arrival window..."
              className="w-full rounded-2xl border border-slate-300 p-3.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
              disabled={submittingMessage}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[11px] text-slate-400">
              Directly visible to customer under &quot;Updates from Store&quot;.
            </p>
            <Button
              type="submit"
              disabled={submittingMessage || !newMessage.trim()}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-9 px-5 rounded-xl shadow-xs"
            >
              {submittingMessage ? 'Sending...' : 'Add Message'}
            </Button>
          </div>
        </form>

        {/* Message Log (Most Recent First) */}
        <div className="space-y-3 pt-2">
          {!order.messages || order.messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 bg-slate-50/50">
              No messages posted for this order yet. Send delivery updates or instructions above.
            </div>
          ) : (
            <div className="space-y-3">
              {order.messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-1.5 transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-brand-primary"></span>
                      {msg.sender?.name || 'Admin'} (Staff)
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
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ordered Items ({order.items.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.productNameSnapshot}</h4>
                    {item.productSkuSnapshot && (
                      <p className="text-xs font-mono text-slate-400">SKU: {item.productSkuSnapshot}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
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

          {/* Payment & Reference Details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-sm text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">
                Payment & Gateway Metadata
              </h3>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.paymentMethod} type="paymentMethod" />
                <OrderStatusBadge status={order.paymentStatus} type="paymentStatus" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-slate-400">Payment Method:</span>
                <div className="mt-1">
                  <OrderStatusBadge status={order.paymentMethod} type="paymentMethod" />
                </div>
              </div>
              <div>
                <span className="text-slate-400">Payment Status:</span>
                <div className="mt-1">
                  <OrderStatusBadge status={order.paymentStatus} type="paymentStatus" />
                </div>
              </div>
              {latestPayment && (
                <>
                  <div>
                    <span className="text-slate-400">Payment Reference:</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{latestPayment.reference}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Provider Transaction ID:</span>
                    <p className="font-mono text-slate-800 mt-0.5">{latestPayment.providerTransactionId || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Merchant Payment Guidance Note */}
            <div className="rounded-2xl border p-3.5 text-xs bg-slate-50 border-slate-200">
              {order.paymentMethod.toUpperCase().includes('CASH') || order.paymentMethod.toUpperCase() === 'COD' ? (
                <p className="text-slate-700 leading-relaxed">
                  💵 <span className="font-bold text-slate-900">Cash on Delivery (COD):</span> Payment will be collected in cash or via POS upon physical delivery. Ensure delivery agent confirms payment collection.
                </p>
              ) : order.paymentMethod.toUpperCase() === 'BANK_TRANSFER' ? (
                <p className="text-slate-700 leading-relaxed">
                  🏦 <span className="font-bold text-slate-900">Direct Bank Transfer:</span> The buyer has been instructed to transfer to corporate bank account. Confirm bank statement before dispatching.
                </p>
              ) : order.paymentMethod.toUpperCase() === 'CARD' ? (
                <p className="text-slate-700 leading-relaxed">
                  💳 <span className="font-bold text-slate-900">Card Payment:</span> Online card payment gateway verification status is tracked above.
                </p>
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  👛 <span className="font-bold text-slate-900">Digital Wallet:</span> Digital wallet payment verification status is tracked above.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Customer & Address & Totals */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2 text-sm text-slate-600">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Customer Information
            </h3>
            <p className="font-bold text-slate-900">{order.user.name}</p>
            <p className="text-xs text-slate-500">{order.user.email}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-2 text-sm text-slate-600">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Captured Shipping Address
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
            {address.phone && (
              <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {address.phone}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-sm text-slate-700">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Financial Breakdown
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
              <span className="font-medium text-slate-900">{fmtCurrency(Number(order.shippingFee))}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-medium text-slate-900">{fmtCurrency(0)}</span>
            </div>

            <div className="flex justify-between font-bold text-slate-900 text-lg border-t border-slate-100 pt-3">
              <span>Grand Total</span>
              <span>{fmtCurrency(Number(order.grandTotal))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
