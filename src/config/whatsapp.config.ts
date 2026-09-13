/**
 * WhatsApp Store & Checkout Configuration
 *
 * This configuration holds the store's primary WhatsApp ordering contact.
 * Change this number whenever the store's WhatsApp line changes.
 */

export const WHATSAPP_CHECKOUT_CONFIG = {
  /**
   * Phone number in full international format (digits only, no '+' or spaces).
   * Default: 2348071104159
   */
  phoneNumber: '2348071104159',
  
  /**
   * Greeting line displayed at the top of generated WhatsApp order messages.
   */
  greeting: "Hi, I'd like to order:",
}

export const WHATSAPP_CHECKOUT_PHONE = WHATSAPP_CHECKOUT_CONFIG.phoneNumber
