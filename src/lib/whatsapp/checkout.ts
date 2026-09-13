import type { CartItem } from '@/types/cart'
import { WHATSAPP_CHECKOUT_CONFIG } from '@/config/whatsapp.config'

/**
 * Formats a numeric price into clean Naira string format, e.g. ₦250,000
 */
export function formatNaira(amount: number): string {
  const rounded = Math.round(amount)
  return `₦${rounded.toLocaleString('en-US')}`
}

export interface WhatsAppOrderMessageParams {
  items: CartItem[]
  total?: number
  notes?: string
}

/**
 * Builds a formatted WhatsApp order message matching the required structure:
 *
 * Hi, I'd like to order:
 * 1x iPhone 13 mini 128GB - ₦250,000
 * 2x Redmi 15 - ₦340,000
 *
 * Total: ₦590,000
 */
export function buildWhatsAppOrderMessage({
  items,
  total,
  notes,
}: WhatsAppOrderMessageParams): string {
  const lines: string[] = []

  // Greeting
  lines.push(WHATSAPP_CHECKOUT_CONFIG.greeting)

  let calculatedTotal = 0

  // Item lines
  for (const item of items) {
    const effectiveUnitPrice = item.salePrice ?? item.unitPrice
    const lineTotal = effectiveUnitPrice * item.quantity
    calculatedTotal += lineTotal

    // Resolve variant name if present
    const variant = item.product.variants?.find((v) => v.id === item.selectedVariantId)
    const itemName = variant
      ? `${item.product.name} (${variant.name})`
      : item.product.name

    lines.push(`${item.quantity}x ${itemName} - ${formatNaira(lineTotal)}`)
  }

  // Grand Total
  const finalTotal = typeof total === 'number' ? total : calculatedTotal
  lines.push('')
  lines.push(`Total: ${formatNaira(finalTotal)}`)

  // Optional customer notes if provided
  if (notes && notes.trim()) {
    lines.push('')
    lines.push(`Note: ${notes.trim()}`)
  }

  return lines.join('\n')
}

/**
 * Generates the full WhatsApp redirection URL with the encoded message
 */
export function getWhatsAppCheckoutUrl(
  params: WhatsAppOrderMessageParams,
  phoneNumber: string = WHATSAPP_CHECKOUT_CONFIG.phoneNumber,
): string {
  const message = buildWhatsAppOrderMessage(params)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}
