import type {
  IPaymentProvider,
  PaymentInitializationParams,
  PaymentInitializationResult,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from '../payment.types'
import { PaymentMethod } from '@/generated/prisma/client'

export class BankTransferProvider implements IPaymentProvider {
  readonly method = PaymentMethod.BANK_TRANSFER

  async initializePayment(params: PaymentInitializationParams): Promise<PaymentInitializationResult> {
    const instructions = `
Bank: CTools Corporate Bank
Account Number: 0123456789
Account Name: CTools Store Ltd
Payment Reference: ${params.orderId}
`.trim()

    return {
      success: true,
      reference: `BNK-${params.orderId}`,
      instructions,
      message: 'Direct Bank Transfer instructions generated.',
    }
  }

  async verifyPayment(params: PaymentVerificationParams): Promise<PaymentVerificationResult> {
    return {
      success: true,
      paid: false,
      reference: params.reference,
      message: 'Awaiting admin manual verification of bank transfer credit.',
    }
  }
}
