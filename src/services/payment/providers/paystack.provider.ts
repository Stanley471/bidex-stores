import type {
  IPaymentProvider,
  PaymentInitializationParams,
  PaymentInitializationResult,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from '../payment.types'
import { PaymentMethod } from '@/generated/prisma/client'
import { STORE_CURRENCY, toKobo, fromKobo } from '@/config/currency.config'

export class PaystackProvider implements IPaymentProvider {
  readonly method = PaymentMethod.CARD

  private secretKey: string | undefined

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY
  }

  async initializePayment(params: PaymentInitializationParams): Promise<PaymentInitializationResult> {
    const reference = params.reference || `PSTK-${params.orderId}-${Date.now().toString().slice(-6)}`

    if (!this.secretKey) {
      // Graceful fallback for unconfigured development environments
      return {
        success: true,
        reference,
        authorizationUrl: `/payment/callback?reference=${reference}&mockSuccess=true`,
        message: 'Paystack dev mode fallback (PAYSTACK_SECRET_KEY unconfigured).',
      }
    }

    try {
      // Paystack amount in smallest currency unit (kobo for NGN)
      const amountInKobo = toKobo(params.amount)

      const payload = {
        email: params.email,
        amount: amountInKobo,
        currency: STORE_CURRENCY,
        reference,
        callback_url: params.callbackUrl,
        metadata: {
          orderId: params.orderId,
          ...params.metadata,
        },
      }

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Paystack initialization request failed.')
      }

      return {
        success: true,
        reference: data.data.reference,
        authorizationUrl: data.data.authorization_url,
        message: 'Paystack payment transaction initialized successfully.',
      }
    } catch (error) {
      // User-safe error handling protecting secret keys
      const safeMessage = error instanceof Error ? error.message : 'Unable to initialize Paystack payment.'
      return {
        success: false,
        reference,
        message: safeMessage,
      }
    }
  }

  async verifyPayment(params: PaymentVerificationParams): Promise<PaymentVerificationResult> {
    if (!this.secretKey) {
      // Dev mode fallback
      return {
        success: true,
        paid: true,
        reference: params.reference,
        message: 'Paystack dev mode verification fallback.',
      }
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(params.reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok || !data.status) {
        return {
          success: false,
          paid: false,
          reference: params.reference,
          message: data.message || 'Paystack transaction verification failed.',
        }
      }

      const txData = data.data
      const isPaid = txData.status === 'success'
      const currencyMatch = !params.expectedCurrency || txData.currency === params.expectedCurrency

      // Amount comparison in smallest currency unit (kobo)
      let amountMatch = true
      if (params.expectedAmount !== undefined) {
        const expectedKobo = toKobo(params.expectedAmount)
        amountMatch = txData.amount === expectedKobo
      }

      const isValid = isPaid && currencyMatch && amountMatch

      return {
        success: true,
        paid: isValid,
        reference: txData.reference,
        providerTransactionId: String(txData.id),
        amount: fromKobo(txData.amount),
        currency: txData.currency,
        message: isValid
          ? 'Transaction verified successfully.'
          : 'Payment verification failed: Amount, currency, or status mismatch.',
      }
    } catch (error) {
      const safeMessage = error instanceof Error ? error.message : 'Transaction verification failed.'
      return {
        success: false,
        paid: false,
        reference: params.reference,
        message: safeMessage,
      }
    }
  }
}
