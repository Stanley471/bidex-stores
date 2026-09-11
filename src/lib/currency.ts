export interface CurrencyOption {
  code: string
  name: string
  symbol: string
  locale: string
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'NGN', name: 'Nigerian Naira (₦)', symbol: '₦', locale: 'en-NG' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£', locale: 'en-GB' },
  { code: 'GHS', name: 'Ghanaian Cedi (₵)', symbol: '₵', locale: 'en-GH' },
  { code: 'KES', name: 'Kenyan Shilling (KSh)', symbol: 'KSh', locale: 'sw-KE' },
  { code: 'ZAR', name: 'South African Rand (R)', symbol: 'R', locale: 'en-ZA' },
  { code: 'CAD', name: 'Canadian Dollar (CA$)', symbol: 'CA$', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$', locale: 'en-AU' },
  { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹', locale: 'en-IN' },
  { code: 'AED', name: 'UAE Dirham (AED)', symbol: 'AED', locale: 'ar-AE' },
]

export function getCurrencyOption(code?: string): CurrencyOption {
  const normalized = (code || 'NGN').toUpperCase()
  return (
    SUPPORTED_CURRENCIES.find((c) => c.code === normalized) || {
      code: normalized,
      name: `${normalized} (${normalized})`,
      symbol: normalized,
      locale: 'en-US',
    }
  )
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode = 'NGN',
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount || 0
  const opt = getCurrencyOption(currencyCode)

  try {
    return new Intl.NumberFormat(opt.locale, {
      style: 'currency',
      currency: opt.code,
      maximumFractionDigits: opt.code === 'JPY' ? 0 : 2,
    }).format(isNaN(num) ? 0 : num)
  } catch {
    return `${opt.symbol}${num.toFixed(2)}`
  }
}
