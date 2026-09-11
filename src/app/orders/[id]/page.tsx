'use client'

import { use, useEffect, useState } from 'react'
import type { ComponentProps } from 'react'
import { OrderDetailView } from '@/components/orders/OrderDetailView'
import { Skeleton } from '@/components/ui/skeleton'

interface OrderPageProps {
  params: Promise<{
    id: string
  }>
}

type OrderData = ComponentProps<typeof OrderDetailView>['order']

export default function CustomerOrderPage({ params }: OrderPageProps) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`)
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64 rounded-md" />
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="flex justify-end pt-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          {error || 'Order not found.'}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <OrderDetailView order={order} />
    </main>
  )
}
