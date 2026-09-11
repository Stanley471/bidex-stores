import type { OrderStatus, PaymentStatus, PaymentMethod } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { calculateOrderTotals } from '@/services/checkout.service'
import { notificationService } from '@/services/notification.service'

export interface CreateOrderInput {
  addressId: string
  paymentMethod: PaymentMethod | string
  couponCode?: string
  notes?: string
}

export function normalizePaymentMethod(method?: string | PaymentMethod): PaymentMethod {
  if (!method) return 'CASH_ON_DELIVERY'
  const normalized = method.toString().trim().toUpperCase()
  if (normalized === 'COD' || normalized === 'CASH_ON_DELIVERY' || normalized === 'CASH') {
    return 'CASH_ON_DELIVERY'
  }
  if (normalized === 'CARD' || normalized === 'CREDIT_CARD' || normalized === 'DEBIT_CARD') {
    return 'CARD'
  }
  if (normalized === 'BANK_TRANSFER' || normalized === 'BANK' || normalized === 'TRANSFER') {
    return 'BANK_TRANSFER'
  }
  if (normalized === 'WALLET' || normalized === 'DIGITAL_WALLET') {
    return 'WALLET'
  }
  return 'CASH_ON_DELIVERY'
}

export interface OrderListOptions {
  search?: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

export function validateStatusTransition(currentStatus: OrderStatus, targetStatus: OrderStatus) {
  if (currentStatus === targetStatus) return

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || []
  if (!allowed.includes(targetStatus)) {
    throw new Error(
      `Invalid order status transition from "${currentStatus}" to "${targetStatus}".`,
    )
  }
}

class OrderService {
  async createOrder(userId: string, input: CreateOrderInput) {
    const order = await prisma.$transaction(async (tx) => {
      // 0. Check Server Store Settings for Order Acceptance
      let storeSettings = await tx.storeSettings.findFirst({
        orderBy: { createdAt: 'asc' },
      })
      if (!storeSettings) {
        storeSettings = await tx.storeSettings.create({
          data: {
            storeName: 'CTools Store',
            acceptOrders: true,
          },
        })
      }

      if (!storeSettings.isStoreActive || !storeSettings.acceptOrders) {
        throw new Error('The store is currently not accepting new orders. Please try again later.')
      }

      // 1. Fetch user's cart
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: true,
        },
      })

      if (!cart || cart.items.length === 0) {
        throw new Error('Your shopping cart is empty.')
      }

      // 2. Fetch shipping address
      const address = await tx.address.findFirst({
        where: { id: input.addressId, userId },
      })

      if (!address) {
        throw new Error('Selected shipping address was not found.')
      }

      const addressSnapshot = {
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode,
      }

      // 3. Process cart items, validate stock & active status, calculate totals
      let subtotal = 0
      const orderItemsToCreate: Array<{
        productId: string
        productVariantId: string | null
        productNameSnapshot: string
        productSkuSnapshot: string | null
        productPriceSnapshot: number
        quantity: number
        unitPrice: number
        total: number
      }> = []

      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { variants: true },
        })

        if (!product || !product.isPublished) {
          throw new Error(`Product "${product?.name || item.productId}" is no longer available.`)
        }

        let effectivePrice = Number(product.basePrice)
        let skuSnapshot = product.sku || null
        let variantId: string | null = null

        if (item.productVariantId) {
          const variant = product.variants.find((v) => v.id === item.productVariantId)
          if (!variant || !variant.isActive) {
            throw new Error(`Selected variant for "${product.name}" is no longer active.`)
          }
          if (variant.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for variant of "${product.name}". Only ${variant.stock} available.`,
            )
          }

          effectivePrice = variant.priceOverride
            ? Number(variant.priceOverride)
            : Number(product.basePrice)
          skuSnapshot = variant.sku || product.sku || null
          variantId = variant.id

          // Decrement variant stock ONLY
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: { decrement: item.quantity } },
          })
        } else {
          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
            )
          }

          // Decrement product base stock ONLY
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          })
        }

        const lineTotal = effectivePrice * item.quantity
        subtotal += lineTotal

        orderItemsToCreate.push({
          productId: product.id,
          productVariantId: variantId,
          productNameSnapshot: product.name,
          productSkuSnapshot: skuSnapshot,
          productPriceSnapshot: effectivePrice,
          quantity: item.quantity,
          unitPrice: effectivePrice,
          total: lineTotal,
        })
      }

      // 4. Retrieve Server Shipping Configuration directly from DB inside transaction
      const shippingConfig = await tx.shippingConfig.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      })

      let shippingFee = 0
      let negotiableNote = ''

      if (shippingConfig) {
        if (shippingConfig.type === 'FLAT_RATE') {
          shippingFee = Number(shippingConfig.fee)
        } else if (shippingConfig.type === 'NEGOTIABLE') {
          shippingFee = 0
          negotiableNote = '[Shipping: Negotiable — To be confirmed by store]'
        }
      }

      // 5. Server Authoritative Coupon Validation & Discount Calculation
      let discount = 0
      let couponIdToRecord: string | null = null
      let couponCodeSnapshot: string | null = null

      if (input.couponCode?.trim()) {
        const normalizedCode = input.couponCode.trim().toUpperCase()
        const now = new Date()

        const coupon = await tx.coupon.findUnique({
          where: { code: normalizedCode },
        })

        if (!coupon) {
          throw new Error(`Coupon "${normalizedCode}" was not found.`)
        }
        if (!coupon.isActive) {
          throw new Error(`Coupon "${normalizedCode}" is not active.`)
        }
        if (coupon.startsAt && now < coupon.startsAt) {
          throw new Error(`Coupon "${normalizedCode}" is not valid yet.`)
        }
        if (coupon.expiresAt && now > coupon.expiresAt) {
          throw new Error(`Coupon "${normalizedCode}" has expired.`)
        }
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          throw new Error(`Coupon "${normalizedCode}" usage limit has been reached.`)
        }

        const perUserLimit = coupon.perUserLimit ?? 1
        const userUsageCount = await tx.couponUsage.count({
          where: {
            couponId: coupon.id,
            userId,
          },
        })

        if (userUsageCount >= perUserLimit) {
          throw new Error(`You have already used coupon "${normalizedCode}".`)
        }

        const minAmount = Number(coupon.minimumOrderAmount ?? 0)
        if (subtotal < minAmount) {
          throw new Error(
            `Minimum order amount of $${minAmount.toFixed(2)} is required for coupon "${normalizedCode}".`,
          )
        }

        const discountVal = Number(coupon.discountValue)
        let calculatedDiscount = 0

        if (coupon.discountType === 'PERCENTAGE') {
          calculatedDiscount = (subtotal * discountVal) / 100
          const maxDiscount = coupon.maximumDiscount ? Number(coupon.maximumDiscount) : null
          if (maxDiscount !== null && calculatedDiscount > maxDiscount) {
            calculatedDiscount = maxDiscount
          }
        } else {
          // FIXED
          calculatedDiscount = discountVal
        }

        // Cap rule: Discount can NEVER exceed subtotal
        discount = Math.min(calculatedDiscount, subtotal)
        couponIdToRecord = coupon.id
        couponCodeSnapshot = coupon.code
      }

      // Centralized Calculation Engine Call
      const totals = calculateOrderTotals(subtotal, discount, shippingFee, 0)

      // Combine order notes
      const finalNotes = [input.notes?.trim(), negotiableNote].filter(Boolean).join('\n') || null

      // Generate unique order number
      const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const orderNumber = `ORD-${datePrefix}-${randomSuffix}`

      // 6. Create Order record
      // Normalize payment method to supported Prisma PaymentMethod enum:
      // CASH_ON_DELIVERY | CARD | BANK_TRANSFER | WALLET
      const paymentMethod = normalizePaymentMethod(input.paymentMethod)

      // Payment Status Assignment & Integration Notes:
      // - CASH_ON_DELIVERY: paymentStatus: 'PENDING' (legitimate offline payment upon delivery).
      // - CARD: paymentStatus: 'PENDING'. (NOTE: Real Paystack webhook/callback payment verification to be integrated next).
      // - BANK_TRANSFER: paymentStatus: 'PENDING'. (NOTE: Manual admin confirmation of bank transfer to be integrated next).
      // - WALLET: paymentStatus: 'PENDING'. (NOTE: Wallet balance check and deduction service to be integrated next).
      // None of the payment methods silently auto-complete as PAID upon checkout submission.
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber,
          shippingAddressSnapshot: addressSnapshot,
          billingAddressSnapshot: addressSnapshot,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod,
          subtotal: totals.subtotal,
          shippingFee: totals.shippingFee,
          tax: totals.tax,
          discount: totals.discount,
          grandTotal: totals.grandTotal,
          couponCodeSnapshot,
          notes: finalNotes,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // 7. Atomic Coupon Usage Recording & Count Increment
      if (couponIdToRecord) {
        await tx.couponUsage.create({
          data: {
            couponId: couponIdToRecord,
            userId,
            orderId: order.id,
          },
        })

        await tx.coupon.update({
          where: { id: couponIdToRecord },
          data: {
            usedCount: { increment: 1 },
          },
        })
      }

      // 8. Clear Cart Items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      })

      return order
    }, { maxWait: 15000, timeout: 30000 })

    // 9. Post-commit non-blocking background notifications
    void notificationService.sendCustomerOrderConfirmation(order.id)
    void notificationService.sendMerchantNewOrderAlert(order.id)

    return order
  }

  async getUserOrders(userId: string, page = 1, pageSize = 10) {
    const p = Math.max(1, page)
    const ps = Math.max(1, pageSize)

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where: { userId } }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * ps,
        take: ps,
        include: {
          items: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ])

    return {
      orders,
      total,
      page: p,
      pageSize: ps,
      pageCount: Math.max(1, Math.ceil(total / ps)),
    }
  }

  async getUserOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new Error('Order not found.')
    }

    return order
  }

  async cancelOrder(userId: string, orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true },
      })

      if (!order) {
        throw new Error('Order not found.')
      }

      if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
        throw new Error(`Order in status "${order.status}" cannot be cancelled.`)
      }

      // Restore product / variant stocks
      for (const item of order.items) {
        if (item.productVariantId) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stock: { increment: item.quantity } },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
        include: {
          items: true,
        },
      })

      void notificationService.sendCustomerOrderCancelled(orderId)
      return updatedOrder
    })
  }

  async getAdminOrders(options: OrderListOptions = {}) {
    const page = Math.max(1, options.page ?? 1)
    const pageSize = Math.max(1, options.pageSize ?? 20)

    const where: Record<string, unknown> = {}

    if (options.search?.trim()) {
      const q = options.search.trim()
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' as const } },
        { user: { name: { contains: q, mode: 'insensitive' as const } } },
        { user: { email: { contains: q, mode: 'insensitive' as const } } },
        { payments: { some: { reference: { contains: q, mode: 'insensitive' as const } } } },
      ]
    }

    if (options.status) {
      where.status = options.status
    }

    if (options.paymentStatus) {
      where.paymentStatus = options.paymentStatus
    }

    if (options.startDate || options.endDate) {
      const createdAtFilter: Record<string, Date> = {}
      if (options.startDate) createdAtFilter.gte = new Date(options.startDate)
      if (options.endDate) {
        const end = new Date(options.endDate)
        end.setHours(23, 59, 59, 999)
        createdAtFilter.lte = end
      }
      where.createdAt = createdAtFilter
    }

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ])

    return {
      orders,
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  async getAdminOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new Error('Order not found.')
    }

    return order
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, enforceTransitions = false) {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!existing) {
      throw new Error('Order not found.')
    }

    // Validate transition if enforced
    if (enforceTransitions) {
      validateStatusTransition(existing.status, newStatus)
    }

    let updatedOrder

    // Handle stock restoration if admin cancels order
    if (newStatus === 'CANCELLED' && existing.status !== 'CANCELLED') {
      updatedOrder = await prisma.$transaction(async (tx) => {
        const orderWithItems = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        })

        if (orderWithItems) {
          for (const item of orderWithItems.items) {
            if (item.productVariantId) {
              await tx.productVariant.update({
                where: { id: item.productVariantId },
                data: { stock: { increment: item.quantity } },
              })
            } else {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              })
            }
          }
        }

        return tx.order.update({
          where: { id: orderId },
          data: { status: newStatus },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: true,
            payments: { orderBy: { createdAt: 'desc' } },
            messages: {
              orderBy: { createdAt: 'desc' },
              include: {
                sender: { select: { id: true, name: true, role: true } },
              },
            },
          },
        })
      })
    } else {
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
          payments: { orderBy: { createdAt: 'desc' } },
          messages: {
            orderBy: { createdAt: 'desc' },
            include: {
              sender: { select: { id: true, name: true, role: true } },
            },
          },
        },
      })
    }

    // Trigger status update notification asynchronously
    if (newStatus === 'CANCELLED') {
      void notificationService.sendCustomerOrderCancelled(orderId)
    } else {
      void notificationService.sendCustomerOrderStatusUpdate(orderId, newStatus)
    }

    return updatedOrder
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!existing) {
      throw new Error('Order not found.')
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
        messages: {
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: { id: true, name: true, role: true } },
          },
        },
      },
    })

    return updatedOrder
  }

  async addOrderMessage(orderId: string, adminId: string, message: string) {
    const trimmedMessage = message?.trim()
    if (!trimmedMessage) {
      throw new Error('Message content cannot be empty.')
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new Error('Order not found.')
    }

    const created = await prisma.orderMessage.create({
      data: {
        orderId,
        createdBy: adminId,
        message: trimmedMessage,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return created
  }

  async getOrderMessages(orderId: string) {
    return prisma.orderMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })
  }
}

export const orderService = new OrderService()
