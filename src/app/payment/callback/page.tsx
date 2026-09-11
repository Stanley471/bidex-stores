import { Suspense } from 'react'
import { PaymentCallbackView } from '@/components/payment/PaymentCallbackView'

export const metadata = {
  title: 'Payment Status | CTools Store',
}

export default function PaymentCallbackPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-20 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading callback status...
          </div>
        }
      >
        <PaymentCallbackView />
      </Suspense>
    </main>
  )
}
