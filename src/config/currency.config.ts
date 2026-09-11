export const STORE_CURRENCY = 'NGN'
export const STORE_CURRENCY_SYMBOL = '₦'

/**
 * Converts a Naira amount (e.g. 10000) to Paystack kobo (e.g. 1000000)
 */
export function toKobo(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Converts Paystack kobo (e.g. 1000000) back to Naira (e.g. 10000)
 */
export function fromKobo(kobo: number): number {
  return kobo / 100
}
