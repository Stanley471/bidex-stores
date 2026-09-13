'use client'

import { AddressSelector } from './AddressSelector'
import { Banknote, Building2, CreditCard, Wallet } from 'lucide-react'

interface CheckoutFormProps {
  selectedAddressId: string | null
  onSelectAddress: (id: string) => void
  paymentMethod: string
  onChangePaymentMethod: (method: string) => void
  notes: string
  onChangeNotes: (notes: string) => void
}

const paymentOptions = [
  {
    id: 'CASH_ON_DELIVERY',
    title: 'Cash on Delivery',
    description: 'Pay with cash upon delivery of your items.',
    icon: Banknote,
  },
  {
    id: 'CARD',
    title: 'Credit / Debit Card',
    description: 'Pay securely using your card via Paystack.',
    icon: CreditCard,
  },
  {
    id: 'BANK_TRANSFER',
    title: 'Direct Bank Transfer',
    description: 'Make a transfer directly to our corporate bank account.',
    icon: Building2,
  },
  {
    id: 'WALLET',
    title: 'Digital Wallet',
    description: 'Pay using your digital wallet balance.',
    icon: Wallet,
  },
]

export function CheckoutForm({
  selectedAddressId,
  onSelectAddress,
  paymentMethod,
  onChangePaymentMethod,
  notes,
  onChangeNotes,
}: CheckoutFormProps) {
  return (
    <div className="space-y-6">
      {/* 1. Address Selection */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Shipping Address
        </h3>
        <AddressSelector
          selectedAddressId={selectedAddressId}
          onSelectAddress={onSelectAddress}
        />
      </section>

      {/* 2. Payment Method (Commented out for WhatsApp direct checkout flow)
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Payment Method
        </h3>

        <div className="grid gap-3">
          {paymentOptions.map((opt) => {
            const isSelected = paymentMethod === opt.id
            const IconComponent = opt.icon

            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
                  <IconComponent className="h-5 w-5 text-slate-700" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-slate-900">{opt.title}</p>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={isSelected}
                      onChange={() => onChangePaymentMethod?.(opt.id)}
                      className="h-4 w-4 text-slate-900 focus:ring-slate-900"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{opt.description}</p>
                </div>
              </label>
            )
          })}
        </div>
      </section>
      */}

      {/* 2. WhatsApp Direct Checkout Notice */}
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold">✓</span>
          Direct WhatsApp Ordering
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed">
          No online payment gateway or card input is required. Clicking &quot;Order on WhatsApp&quot; will create your formatted order message and connect you directly with our sales representative on WhatsApp.
        </p>
      </section>

      {/* 3. Additional Order Notes */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Order Notes (Optional)</h3>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          placeholder="Special instructions for delivery, access codes, or gate instructions..."
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
      </section>
    </div>
  )
}
