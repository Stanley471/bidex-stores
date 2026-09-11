'use client'

interface OrderStatusBadgeProps {
  status: string
  type?: 'status' | 'paymentStatus' | 'paymentMethod'
  className?: string
}

export function OrderStatusBadge({ status, type = 'status', className = '' }: OrderStatusBadgeProps) {
  const normalized = (status || '').toUpperCase()

  if (type === 'paymentMethod') {
    const methodConfigs: Record<string, { label: string; style: string }> = {
      CASH_ON_DELIVERY: {
        label: 'Cash on Delivery (COD)',
        style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      },
      COD: {
        label: 'Cash on Delivery (COD)',
        style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      },
      CARD: {
        label: 'Card Payment',
        style: 'bg-blue-50 text-blue-800 border-blue-200',
      },
      BANK_TRANSFER: {
        label: 'Bank Transfer',
        style: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      },
      WALLET: {
        label: 'Digital Wallet',
        style: 'bg-purple-50 text-purple-800 border-purple-200',
      },
    }

    const config = methodConfigs[normalized] || {
      label: status.replace(/_/g, ' '),
      style: 'bg-slate-100 text-slate-700 border-slate-200',
    }

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.style} ${className}`}
      >
        {config.label}
      </span>
    )
  }

  if (type === 'paymentStatus') {
    const paymentConfigs: Record<string, { label: string; style: string }> = {
      PENDING: { label: 'Pending Payment', style: 'bg-amber-100 text-amber-800 border-amber-200' },
      PAID: { label: 'Paid', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      FAILED: { label: 'Payment Failed', style: 'bg-red-100 text-red-800 border-red-200' },
      REFUNDED: { label: 'Refunded', style: 'bg-purple-100 text-purple-800 border-purple-200' },
    }

    const config = paymentConfigs[normalized] || {
      label: status,
      style: 'bg-slate-100 text-slate-700 border-slate-200',
    }

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.style} ${className}`}
      >
        {config.label}
      </span>
    )
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    REFUNDED: 'bg-purple-100 text-purple-800 border-purple-200',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        statusColors[normalized] || 'bg-slate-100 text-slate-700 border-slate-200'
      } ${className}`}
    >
      {normalized}
    </span>
  )
}
