import { PaymentMethod } from '@/generated/prisma/client'
import { STORE_CURRENCY } from '@/config/currency.config'
import { prisma } from '@/lib/prisma'
import type { IPaymentProvider } from './payment/payment.types'
import { CashOnDeliveryProvider } from './payment/providers/cod.provider'
import { BankTransferProvider } from './payment/providers/bankTransfer.provider'
import { PaystackProvider } from './payment/providers/paystack.provider'
import { notificationService } from '@/services/notification.service'

class PaymentService {
  private providers: Map<PaymentMethod, IPaymentProvider>

  constructor() {
    this.providers = new Map()
    const cod = new CashOnDeliveryProvider()
    const bnk = new BankTransferProvider()
    const pstk = new PaystackProvider()

    this.providers.set(cod.method, cod)
    this.providers.set(bnk.method, bnk)
    this.providers.set(pstk.method, pstk)
  }

  getProvider(method: PaymentMethod): IPaymentProvider {
    const provider = this.providers.get(method)
    if (!provider) {
      throw new Error(`Unsupported payment method: ${method}`)
    }
    return provider
  }

  getAvailablePaymentMethods() {
    return [
      {
        id: PaymentMethod.CASH_ON_DELIVERY,
        name: 'Cash on Delivery',
        description: 'Pay with cash upon delivery of your items.',
        supported: true,
      },
      {
        id: PaymentMethod.CARD,
        name: 'Credit / Debit Card (Paystack)',
        description: 'Pay securely online using Paystack.',
        supported: true,
      },
      {
        id: PaymentMethod.BANK_TRANSFER,
        name: 'Direct Bank Transfer',
        description: 'Transfer directly to our corporate bank account.',
        supported: true,
      },
      {
        id: PaymentMethod.WALLET,
        name: 'Digital Wallet',
        description: 'Pay using your digital wallet balance.',
        supported: true,
      },
    ]
  }

  async initializeOrderPayment(userId: string, orderId: string, method: PaymentMethod, callbackUrl?: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { user: { select: { email: true } } },
    })

    if (!order) {
      throw new Error('Order not found or does not belong to user.')
    }

    if (order.paymentStatus === 'PAID') {
      throw new Error('Order has already been paid.')
    }

    if (order.status === 'CANCELLED') {
      throw new Error('Cancelled order cannot be paid.')
    }

    const provider = this.getProvider(method)
    const reference = `${method === PaymentMethod.CARD ? 'PSTK' : 'REF'}-${order.id.slice(0, 8)}-${Date.now().toString().slice(-6)}`

    // Create database Payment record for tracking & idempotency
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: method === PaymentMethod.CARD ? 'PAYSTACK' : method,
        reference,
        amount: order.grandTotal,
        currency: STORE_CURRENCY,
        status: 'PENDING',
      },
    })

    return provider.initializePayment({
      orderId: order.id,
      amount: Number(order.grandTotal),
      email: order.user.email,
      reference,
      callbackUrl,
    })
  }

  async verifyOrderPayment(reference: string, userId?: string) {
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { order: true },
    })

    if (!payment) {
      // Fallback search by order id or order number if reference was not stored
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id: reference }, { orderNumber: reference }],
          ...(userId ? { userId } : {}),
        },
      })
      if (!order) {
        throw new Error('Payment reference or order not found.')
      }

      if (order.paymentStatus === 'PAID') {
        return {
          success: true,
          paid: true,
          reference,
          message: 'Order is already marked as paid.',
        }
      }
      throw new Error('Payment record not found for verification.')
    }

    // Security Check: Enforce user ownership if userId is passed
    if (userId && payment.order.userId !== userId) {
      throw new Error('Payment record does not belong to user.')
    }

    // Idempotent Check: If payment is already marked as PAID, return existing successful state immediately
    if (payment.status === 'PAID' || payment.order.paymentStatus === 'PAID') {
      return {
        success: true,
        paid: true,
        reference: payment.reference,
        amount: Number(payment.amount),
        currency: payment.currency,
        message: 'Payment is already verified and marked as paid.',
      }
    }

    const provider = this.getProvider(payment.order.paymentMethod)
    const result = await provider.verifyPayment({
      reference: payment.reference,
      expectedAmount: Number(payment.amount),
      expectedCurrency: payment.currency,
    })

    // Transactional Database Update: Update Payment and Order status atomically
    if (result.success && result.paid) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            providerTransactionId: result.providerTransactionId || null,
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'PAID',
            status: payment.order.status === 'PENDING' ? 'CONFIRMED' : payment.order.status,
          },
        }),
      ])

      // Asynchronously trigger customer and merchant payment notifications
      void notificationService.sendCustomerPaymentConfirmation(payment.orderId, payment.reference)
      void notificationService.sendMerchantPaymentAlert(payment.orderId, payment.reference)
    } else if (result.success && !result.paid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      })
    }

    return result
  }
}

export const paymentService = new PaymentService()
