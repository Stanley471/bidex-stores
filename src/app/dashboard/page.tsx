import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookie } from '@/lib/auth/session'
import { requireAuth } from '@/lib/auth/authorization'
import { prisma } from '@/lib/prisma'
import { orderService } from '@/services/order.service'
import { storeSettingsService } from '@/services/store-settings.service'
import { CustomerDashboardClient } from '@/components/dashboard/CustomerDashboardClient'

export const metadata: Metadata = {
  title: 'My Account Dashboard',
  description: 'Manage your orders, addresses, wishlist, and account details.',
}

export default async function DashboardPage() {
  const token = getAuthCookie(await cookies())
  let authUser
  try {
    authUser = await requireAuth(token)
  } catch {
    redirect('/login')
  }

  // Fetch full user details from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      addresses: {
        where: { isDefault: true },
        take: 1,
        select: { phone: true },
      },
    },
  })

  if (!dbUser) {
    redirect('/login')
  }

  // SSR Initial Orders Load (Most recent orders first)
  let initialOrders: Array<{
    id: string
    orderNumber: string
    status: string
    paymentStatus: string
    grandTotal: number
    createdAt: string
    items: Array<{
      id: string
      productNameSnapshot: string
      quantity: number
      unitPrice: number
    }>
  }> = []
  try {
    const orderData = await orderService.getUserOrders(dbUser.id, 1, 20)
    initialOrders = orderData.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      grandTotal: Number(o.grandTotal),
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((item) => ({
        id: item.id,
        productNameSnapshot: item.productNameSnapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    }))
  } catch {
    initialOrders = []
  }

  // Fetch Store Currency
  const storeSettings = await storeSettingsService.getPublicStoreSettings()
  const currencyCode = storeSettings?.currencyCode || 'NGN'

  const userProfile = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.addresses[0]?.phone || null,
    role: dbUser.role,
  }

  return (
    <main className="flex-1 bg-slate-50/70">
      <CustomerDashboardClient
        initialUser={userProfile}
        initialOrders={initialOrders}
        currencyCode={currencyCode}
      />
    </main>
  )
}
