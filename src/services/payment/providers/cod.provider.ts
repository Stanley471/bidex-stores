import type {
  IPaymentProvider,
  PaymentInitializationParams,
  PaymentInitializationResult,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from '../payment.types'
import { PaymentMethod } from '@/generated/prisma/client'

export class CashOnDeliveryProvider implements IPaymentProvider {
  readonly method = PaymentMethod.CASH_ON_DELIVERY

  async initializePayment(params: PaymentInitializationParams): Promise<PaymentInitializationResult> {
    return {
      success: true,
      reference: `COD-${params.orderId}`,
      message: 'Order created with Cash on Delivery payment option.',
    }
  }

  async verifyPayment(params: PaymentVerificationParams): Promise<PaymentVerificationResult> {
    return {
      success: true,
      paid: false,
      reference: params.reference,
      message: 'Cash on Delivery orders remain pending until delivered and collected.',
    }
  }
}
