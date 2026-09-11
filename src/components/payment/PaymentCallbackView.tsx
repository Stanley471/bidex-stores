'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function PaymentCallbackView() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const mockSuccess = searchParams.get('mockSuccess') === 'true'

  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function verify() {
      if (!reference) {
        if (!ignore) {
          setMessage('No transaction reference found in callback URL.')
          setLoading(false)
        }
        return
      }

      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        })

        const data = await res.json()

        if (!ignore) {
          if (res.ok && data.success && data.result?.paid) {
            setVerified(true)
            setMessage(data.result.message || 'Payment confirmed successfully!')
          } else {
            setVerified(false)
            setMessage(data.message || data.result?.message || 'Payment verification failed.')
          }
        }
      } catch (err) {
        if (!ignore) {
          setVerified(false)
          setMessage(err instanceof Error ? err.message : 'Unable to verify payment with server.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    if (mockSuccess) {
      setTimeout(() => {
        if (!ignore) {
          setVerified(true)
          setMessage('Development Mode: Mock payment verified successfully.')
          setLoading(false)
        }
      }, 1000)
    } else {
      verify()
    }

    return () => {
      ignore = true
    }
  }, [reference, mockSuccess])

  if (loading) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
        <h2 className="text-xl font-bold text-slate-900">Verifying Payment</h2>
        <p className="text-xs text-slate-500">
          Please wait while we confirm your payment transaction with Paystack...
        </p>
      </div>
    )
  }

  if (verified) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
          <p className="text-xs text-slate-600">
            {message || 'Your order payment has been confirmed by Paystack.'}
          </p>
          {reference && (
            <p className="text-xs font-mono text-slate-400 pt-2">Ref: {reference}</p>
          )}
        </div>
        <div className="pt-2">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => router.push('/orders')}>
            View Order History
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
        ✕
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Payment Verification Failed</h2>
        <p className="text-xs text-red-600 font-medium">
          {message || 'We were unable to confirm your payment with Paystack.'}
        </p>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <Link href="/checkout">
          <Button className="w-full bg-slate-900 hover:bg-slate-800 font-bold">
            Return to Checkout
          </Button>
        </Link>
        <Link href="/orders">
          <Button variant="outline" className="w-full">
            View My Orders
          </Button>
        </Link>
      </div>
    </div>
  )
}
