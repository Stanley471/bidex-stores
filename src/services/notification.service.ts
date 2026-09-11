import { prisma } from '@/lib/prisma'
import type { IEmailProvider } from '@/lib/email/emailProvider.interface'
import { SmtpEmailProvider } from '@/lib/email/smtpProvider'
import { storeSettingsService } from '@/services/store-settings.service'

class NotificationService {
  private emailProvider: IEmailProvider

  constructor(provider?: IEmailProvider) {
    this.emailProvider = provider || new SmtpEmailProvider()
  }

  /**
   * Internal helper to record notification log entry and dispatch email safely.
   */
  private async dispatchEmail(options: {
    type: string
    recipient: string
    subject: string
    html: string
    orderId?: string
    metadata?: Record<string, unknown>
  }): Promise<void> {
    let settings
    try {
      settings = await storeSettingsService.getStoreSettings()
    } catch {
      settings = { notificationsEnabled: true, senderName: 'CTools Store', senderEmail: null, merchantNotificationEmail: null }
    }

    if (settings.notificationsEnabled === false) {
      console.log(`[Notification Service] Notifications disabled by store setting. Skipping ${options.type} to ${options.recipient}`)
      return
    }

    const fromAddress = settings.senderEmail
      ? `${settings.senderName || 'CTools Store'} <${settings.senderEmail}>`
      : undefined

    try {
      const result = await this.emailProvider.sendEmail({
        to: options.recipient,
        subject: options.subject,
        html: options.html,
        from: fromAddress,
      })

      // Log attempt to PostgreSQL NotificationLog table
      await prisma.notificationLog.create({
        data: {
          type: options.type,
          recipient: options.recipient,
          subject: options.subject,
          orderId: options.orderId || null,
          status: result.success ? 'SENT' : 'FAILED',
          failureReason: result.error || null,
          metadata: options.metadata ? JSON.parse(JSON.stringify(options.metadata)) : undefined,
          sentAt: result.success ? new Date() : null,
        },
      })
    } catch (err) {
      // Non-blocking guarantee: failure never bubbles up to interrupt business logic
      console.error(`[Notification Error] Failed to log/send ${options.type}:`, err)
      try {
        await prisma.notificationLog.create({
          data: {
            type: options.type,
            recipient: options.recipient,
            subject: options.subject,
            orderId: options.orderId || null,
            status: 'FAILED',
            failureReason: err instanceof Error ? err.message : 'Unknown notification error',
            sentAt: null,
          },
        })
      } catch {
        // Silent catch for DB log failure
      }
    }
  }

  /**
   * 1. Customer Order Confirmation Email
   */
  async sendCustomerOrderConfirmation(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
    })

    if (!order || !order.user?.email) return

    const settings = await storeSettingsService.getStoreSettings()
    const storeName = settings.storeName || 'CTools Store'

    const itemRows = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.productNameSnapshot} ${item.productSkuSnapshot ? `(${item.productSkuSnapshot})` : ''}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${Number(item.unitPrice).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">$${Number(item.total).toFixed(2)}</td>
      </tr>`
      )
      .join('')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #0f172a;">Thank you for your order!</h2>
        <p>Hi ${order.user.name},</p>
        <p>We've received your order <strong>#${order.orderNumber}</strong> at <strong>${storeName}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr style="background: #f8fafc; text-align: left;">
              <th style="padding: 8px;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div style="margin-top: 16px; border-top: 2px solid #0f172a; padding-top: 8px; text-align: right;">
          <p style="margin: 4px 0;">Subtotal: <strong>$${Number(order.subtotal).toFixed(2)}</strong></p>
          ${Number(order.discount) > 0 ? `<p style="margin: 4px 0; color: #16a34a;">Discount: -$${Number(order.discount).toFixed(2)}</p>` : ''}
          <p style="margin: 4px 0;">Shipping Fee: <strong>$${Number(order.shippingFee).toFixed(2)}</strong></p>
          <h3 style="margin: 8px 0; color: #0f172a;">Grand Total: $${Number(order.grandTotal).toFixed(2)}</h3>
        </div>

        <p style="margin-top: 24px;">Status: <strong>${order.status}</strong> | Payment Status: <strong>${order.paymentStatus}</strong></p>
        <p><a href="/orders/${order.id}" style="color: #2563eb; text-decoration: none; font-weight: bold;">View Your Order Details online</a></p>
      </div>`

    await this.dispatchEmail({
      type: 'ORDER_CONFIRMATION',
      recipient: order.user.email,
      subject: `Order Confirmation #${order.orderNumber} - ${storeName}`,
      html,
      orderId: order.id,
    })
  }

  /**
   * 2. Customer Payment Confirmation Email
   */
  async sendCustomerPaymentConfirmation(orderId: string, reference: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true } } },
    })

    if (!order || !order.user?.email) return

    const settings = await storeSettingsService.getStoreSettings()
    const storeName = settings.storeName || 'CTools Store'

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #16a34a;">Payment Received!</h2>
        <p>Hi ${order.user.name},</p>
        <p>We have successfully confirmed your payment of <strong>$${Number(order.grandTotal).toFixed(2)}</strong> for order <strong>#${order.orderNumber}</strong>.</p>
        <p>Payment Reference: <code>${reference}</code></p>
        <p>Your order is now being processed.</p>
        <p><a href="/orders/${order.id}" style="color: #2563eb; text-decoration: none; font-weight: bold;">View Order Status</a></p>
      </div>`

    await this.dispatchEmail({
      type: 'PAYMENT_CONFIRMATION',
      recipient: order.user.email,
      subject: `Payment Confirmed for Order #${order.orderNumber} - ${storeName}`,
      html,
      orderId: order.id,
    })
  }

  /**
   * 3. Customer Order Status Update Email
   */
  async sendCustomerOrderStatusUpdate(orderId: string, newStatus: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true } } },
    })

    if (!order || !order.user?.email) return

    const settings = await storeSettingsService.getStoreSettings()
    const storeName = settings.storeName || 'CTools Store'

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #0f172a;">Order Status Update</h2>
        <p>Hi ${order.user.name},</p>
        <p>The status of your order <strong>#${order.orderNumber}</strong> at ${storeName} has been updated to: <strong style="color: #2563eb;">${newStatus}</strong>.</p>
        <p><a href="/orders/${order.id}" style="color: #2563eb; text-decoration: none; font-weight: bold;">Track Order Progress</a></p>
      </div>`

    await this.dispatchEmail({
      type: 'ORDER_STATUS_CHANGE',
      recipient: order.user.email,
      subject: `Order #${order.orderNumber} status updated to ${newStatus} - ${storeName}`,
      html,
      orderId: order.id,
      metadata: { newStatus },
    })
  }

  /**
   * 4. Customer Order Cancellation Email
   */
  async sendCustomerOrderCancelled(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true } } },
    })

    if (!order || !order.user?.email) return

    const settings = await storeSettingsService.getStoreSettings()
    const storeName = settings.storeName || 'CTools Store'

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #dc2626;">Order Cancelled</h2>
        <p>Hi ${order.user.name},</p>
        <p>Your order <strong>#${order.orderNumber}</strong> at ${storeName} has been cancelled.</p>
        <p>If you have questions regarding this cancellation, please contact support.</p>
      </div>`

    await this.dispatchEmail({
      type: 'ORDER_CANCELLED',
      recipient: order.user.email,
      subject: `Order #${order.orderNumber} Cancelled - ${storeName}`,
      html,
      orderId: order.id,
    })
  }

  /**
   * 5. Merchant New Order Alert
   */
  async sendMerchantNewOrderAlert(orderId: string): Promise<void> {
    const settings = await storeSettingsService.getStoreSettings()
    const recipient = settings.merchantNotificationEmail || settings.contactEmail
    if (!recipient) return

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true } } },
    })

    if (!order) return

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #0f172a;">🛒 New Order Received!</h2>
        <p>Order <strong>#${order.orderNumber}</strong> created by ${order.user?.name} (${order.user?.email}).</p>
        <p>Grand Total: <strong>$${Number(order.grandTotal).toFixed(2)}</strong></p>
        <p><a href="/admin/orders/${order.id}" style="color: #2563eb; text-decoration: none; font-weight: bold;">View in Admin Console</a></p>
      </div>`

    await this.dispatchEmail({
      type: 'ADMIN_NEW_ORDER',
      recipient,
      subject: `[Admin Alert] New Order #${order.orderNumber} ($${Number(order.grandTotal).toFixed(2)})`,
      html,
      orderId: order.id,
    })
  }

  /**
   * 6. Merchant Payment Received Alert
   */
  async sendMerchantPaymentAlert(orderId: string, reference: string): Promise<void> {
    const settings = await storeSettingsService.getStoreSettings()
    const recipient = settings.merchantNotificationEmail || settings.contactEmail
    if (!recipient) return

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) return

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #16a34a;">💰 Payment Received!</h2>
        <p>Payment of <strong>$${Number(order.grandTotal).toFixed(2)}</strong> received for order <strong>#${order.orderNumber}</strong>.</p>
        <p>Reference: <code>${reference}</code></p>
      </div>`

    await this.dispatchEmail({
      type: 'ADMIN_PAYMENT_RECEIVED',
      recipient,
      subject: `[Admin Alert] Payment Received for Order #${order.orderNumber}`,
      html,
      orderId: order.id,
    })
  }

  /**
   * 7. Merchant Low / Out of Stock Alert
   */
  async sendMerchantLowStockAlert(productName: string, currentStock: number, variantName?: string): Promise<void> {
    const settings = await storeSettingsService.getStoreSettings()
    const recipient = settings.merchantNotificationEmail || settings.contactEmail
    if (!recipient) return

    const isOutOfStock = currentStock <= 0
    const title = isOutOfStock ? '⚠️ Product Out of Stock' : '⚡ Product Low Stock Warning'

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: ${isOutOfStock ? '#dc2626' : '#d97706'};">${title}</h2>
        <p>Item: <strong>${productName}</strong> ${variantName ? `(${variantName})` : ''}</p>
        <p>Current Inventory Stock: <strong>${currentStock} unit(s)</strong> remaining.</p>
        <p><a href="/admin/products" style="color: #2563eb; text-decoration: none; font-weight: bold;">Manage Inventory</a></p>
      </div>`

    await this.dispatchEmail({
      type: isOutOfStock ? 'ADMIN_OUT_OF_STOCK' : 'ADMIN_LOW_STOCK',
      recipient,
      subject: `[Admin Stock Alert] ${productName} (${currentStock} left)`,
      html,
      metadata: { productName, currentStock, variantName },
    })
  }
}

export const notificationService = new NotificationService()
