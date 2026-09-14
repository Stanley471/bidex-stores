'use client'

import { useState } from 'react'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary'

export interface BankDetails {
  bankName: string | null
  accountNumber: string | null
  accountName: string | null
}

interface CheckoutContentProps {
  bankDetails?: BankDetails | null
}

export function CheckoutContent({ bankDetails }: CheckoutContentProps) {
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
        bankDetails={bankDetails}
      />
    </div>
  )
}
