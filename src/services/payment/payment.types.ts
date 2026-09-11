import type { PaymentMethod } from '@/generated/prisma/client'

export interface PaymentInitializationParams {
  orderId: string
  amount: number
  email: string
  reference?: string
  callbackUrl?: string
  metadata?: Record<string, unknown>
}

export interface PaymentInitializationResult {
  success: boolean
  authorizationUrl?: string
  reference?: string
  message?: string
  instructions?: string
}

export interface PaymentVerificationParams {
  reference: string
  orderId?: string
  expectedAmount?: number
  expectedCurrency?: string
}

export interface PaymentVerificationResult {
  success: boolean
  paid: boolean
  reference?: string
  providerTransactionId?: string
  amount?: number
  currency?: string
  message?: string
}

export interface IPaymentProvider {
  readonly method: PaymentMethod
  initializePayment(params: PaymentInitializationParams): Promise<PaymentInitializationResult>
  verifyPayment(params: PaymentVerificationParams): Promise<PaymentVerificationResult>
}
