'use client'

import Link from 'next/link'
import { OrderStatusBadge } from './OrderStatusBadge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/currency'

export interface AdminOrderRow {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  paymentStatus: string
  paymentMethod: string
  grandTotal: number
  user: {
    name: string
    email: string
  }
  items: Array<{
    id: string
    productNameSnapshot: string
    quantity: number
  }>
  payments?: Array<{
    reference: string
    provider: string
  }>
}

interface OrderTableProps {
  orders: AdminOrderRow[]
  onStatusChange: (orderId: string, status: string) => void
  currencyCode?: string
}

const statusOptions = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

export function OrderTable({ orders, onStatusChange, currencyCode = 'NGN' }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        No merchant orders found matching the filter criteria.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-semibold text-slate-700">
          <tr>
            <th className="px-6 py-4">Order #</th>
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Items</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Payment</th>
            <th className="px-6 py-4">Order Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
            const paymentRef = order.payments?.[0]?.reference

            return (
              <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-slate-900">
                  {order.orderNumber}
                  {paymentRef && (
                    <p className="font-sans text-[11px] text-slate-400 font-normal line-clamp-1">
                      Ref: {paymentRef}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{order.user.name}</div>
                  <div className="text-xs text-slate-400">{order.user.email}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 text-slate-700 font-medium">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {formatCurrency(Number(order.grandTotal), currencyCode)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <OrderStatusBadge status={order.paymentMethod} type="paymentMethod" />
                    <OrderStatusBadge status={order.paymentStatus} type="paymentStatus" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold focus:border-slate-900 focus:outline-none bg-white cursor-pointer"
                  >
                    {statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="font-semibold">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
