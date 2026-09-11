'use client'

import { useState, Suspense } from 'react'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary'
import { Skeleton } from '@/components/ui/skeleton'

function CheckoutContent() {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH_ON_DELIVERY')
  const [notes, setNotes] = useState<string>('')

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Checkout</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Complete your order</h1>
        </div>
        <CheckoutForm
          selectedAddressId={selectedAddressId}
          onSelectAddress={setSelectedAddressId}
          paymentMethod={paymentMethod}
          onChangePaymentMethod={setPaymentMethod}
          notes={notes}
          onChangeNotes={setNotes}
        />
      </section>
      <CheckoutSummary
        selectedAddressId={selectedAddressId}
        paymentMethod={paymentMethod}
        notes={notes}
      />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <main className="flex-1 bg-slate-50/70">
      <Suspense
        fallback={
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.3fr_0.7fr]">
            <Skeleton className="h-96 w-full rounded-3xl" />
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </main>
  )
}
