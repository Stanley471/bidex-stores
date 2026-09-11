import { CouponListPage } from '@/components/admin/coupons/CouponListPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Coupons & Discounts | Admin Console',
}

export default function AdminCouponsPage() {
  return <CouponListPage />
}
