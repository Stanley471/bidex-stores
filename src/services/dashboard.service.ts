import { OrderStatus, PaymentStatus, Role } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'

export const LOW_STOCK_THRESHOLD = 5

export type DateRangePeriod = 'today' | 'week' | 'month' | 'all_time'

export interface DashboardSalesOverviewDay {
  date: string
  label: string
  revenue: number
  orderCount: number
}

export interface LowStockAlertItem {
  id: string
  productId: string
  name: string
  sku: string | null
  stock: number
  variantName: string | null
  isVariant: boolean
}

export interface DashboardStatsResult {
  sales: {
    totalRevenue: number
    todayRevenue: number
    monthRevenue: number
    periodRevenue: number
  }
  orders: {
    totalOrders: number
    byStatus: Record<OrderStatus, number>
  }
  products: {
    totalProducts: number
    publishedProducts: number
    unpublishedProducts: number
    outOfStockCount: number
    lowStockCount: number
    stockAlerts: LowStockAlertItem[]
  }
  customers: {
    totalCustomers: number
    monthNewCustomers: number
  }
  salesOverview: DashboardSalesOverviewDay[]
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    customerEmail: string
    createdAt: string
    grandTotal: number
    paymentStatus: PaymentStatus
    status: OrderStatus
  }>
}

function getDateRangeBoundary(period: DateRangePeriod): Date | null {
  const now = new Date()

  if (period === 'today') {
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    return today
  }

  if (period === 'week') {
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 6)
    weekAgo.setHours(0, 0, 0, 0)
    return weekAgo
  }

  if (period === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    return monthStart
  }

  return null // all_time
}

class DashboardService {
  async getDashboardStats(period: DateRangePeriod = 'month'): Promise<DashboardStatsResult> {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const rangeStart = getDateRangeBoundary(period)

    // Build date filters for paid orders
    const periodWhere: Record<string, unknown> = {}
    if (rangeStart) {
      periodWhere.createdAt = { gte: rangeStart }
    }

    // Batch 1: Revenue Aggregates (4 queries)
    const [
      totalRevenueAgg,
      todayRevenueAgg,
      monthRevenueAgg,
      periodRevenueAgg,
    ] = await Promise.all([
      // 1. Total All-time Revenue (Paid orders)
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { paymentStatus: 'PAID' },
      }),
      // 2. Today Revenue
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { paymentStatus: 'PAID', createdAt: { gte: todayStart } },
      }),
      // 3. Month Revenue
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { paymentStatus: 'PAID', createdAt: { gte: monthStart } },
      }),
      // 4. Selected Period Revenue
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { paymentStatus: 'PAID', ...periodWhere },
      }),
    ])

    // Batch 2: Order Counts, Grouping & Overview (4 queries)
    const [
      totalOrders,
      ordersByStatusGroup,
      recentOrders,
      last7DaysOrders,
    ] = await Promise.all([
      // 5. Total Orders in selected period
      prisma.order.count({
        where: periodWhere,
      }),
      // 6. Orders by status in selected period
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: periodWhere,
      }),
      // 7. Recent Orders (Latest 6)
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      // 8. Last 7 Days Sales Overview
      (() => {
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
        sevenDaysAgo.setHours(0, 0, 0, 0)

        return prisma.order.findMany({
          where: {
            paymentStatus: 'PAID',
            createdAt: { gte: sevenDaysAgo },
          },
          select: {
            createdAt: true,
            grandTotal: true,
          },
        })
      })(),
    ])

    // Batch 3: Product Metrics & Stock Alerts (5 queries)
    const [
      totalProducts,
      publishedProducts,
      unpublishedProducts,
      productsWithStock,
      variantsWithStock,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.product.count({ where: { isPublished: false } }),
      prisma.product.findMany({
        where: { stock: { lte: LOW_STOCK_THRESHOLD } },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          hasVariants: true,
        },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
      prisma.productVariant.findMany({
        where: { stock: { lte: LOW_STOCK_THRESHOLD }, isActive: true },
        select: {
          id: true,
          productId: true,
          sku: true,
          stock: true,
          attributes: true,
          product: { select: { name: true } },
        },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
    ])

    // Batch 4: Customer Counts (2 queries)
    const [totalCustomers, monthNewCustomers] = await Promise.all([
      prisma.user.count({ where: { role: Role.CUSTOMER } }),
      prisma.user.count({
        where: { role: Role.CUSTOMER, createdAt: { gte: monthStart } },
      }),
    ])

    // Format Order Status Breakdown
    const defaultStatusCounts: Record<OrderStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    }

    ordersByStatusGroup.forEach((group) => {
      defaultStatusCounts[group.status] = group._count._all
    })

    // Process Stock Alerts
    const stockAlerts: LowStockAlertItem[] = []

    // Base Products without variants or low stock
    productsWithStock.forEach((p) => {
      stockAlerts.push({
        id: p.id,
        productId: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        variantName: null,
        isVariant: false,
      })
    })

    // Product Variants
    variantsWithStock.forEach((v) => {
      let variantLabel = ''
      if (v.attributes && typeof v.attributes === 'object') {
        variantLabel = Object.values(v.attributes as Record<string, string>).join(' / ')
      }

      stockAlerts.push({
        id: v.id,
        productId: v.productId,
        name: v.product.name,
        sku: v.sku,
        stock: v.stock,
        variantName: variantLabel || 'Variant',
        isVariant: true,
      })
    })

    // Sort stock alerts by lowest stock first and take top 8
    stockAlerts.sort((a, b) => a.stock - b.stock)
    const topStockAlerts = stockAlerts.slice(0, 8)

    const outOfStockCount = stockAlerts.filter((i) => i.stock === 0).length
    const lowStockCount = stockAlerts.filter((i) => i.stock > 0 && i.stock <= LOW_STOCK_THRESHOLD).length

    // Process Last 7 Days Sales Overview Chart Data
    const salesOverviewMap = new Map<string, { revenue: number; count: number }>()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().slice(0, 10)
      salesOverviewMap.set(dateKey, { revenue: 0, count: 0 })
    }

    last7DaysOrders.forEach((ord) => {
      const dateKey = ord.createdAt.toISOString().slice(0, 10)
      const existing = salesOverviewMap.get(dateKey)
      if (existing) {
        existing.revenue += Number(ord.grandTotal)
        existing.count += 1
      }
    })

    const salesOverview: DashboardSalesOverviewDay[] = Array.from(salesOverviewMap.entries()).map(
      ([dateKey, data]) => {
        const dateObj = new Date(dateKey)
        const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        return {
          date: dateKey,
          label,
          revenue: data.revenue,
          orderCount: data.count,
        }
      },
    )

    return {
      sales: {
        totalRevenue: Number(totalRevenueAgg._sum.grandTotal || 0),
        todayRevenue: Number(todayRevenueAgg._sum.grandTotal || 0),
        monthRevenue: Number(monthRevenueAgg._sum.grandTotal || 0),
        periodRevenue: Number(periodRevenueAgg._sum.grandTotal || 0),
      },
      orders: {
        totalOrders,
        byStatus: defaultStatusCounts,
      },
      products: {
        totalProducts,
        publishedProducts,
        unpublishedProducts,
        outOfStockCount,
        lowStockCount,
        stockAlerts: topStockAlerts,
      },
      customers: {
        totalCustomers,
        monthNewCustomers,
      },
      salesOverview,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.user?.name || 'Guest',
        customerEmail: o.user?.email || 'N/A',
        createdAt: o.createdAt.toISOString(),
        grandTotal: Number(o.grandTotal),
        paymentStatus: o.paymentStatus,
        status: o.status,
      })),
    }
  }
}

export const dashboardService = new DashboardService()
