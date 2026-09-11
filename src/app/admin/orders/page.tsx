import { OrderListPage } from '@/components/admin/orders/OrderListPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Orders Management | Admin',
}

export default function AdminOrdersPage() {
  return <OrderListPage />
}
