import { ProductListPage } from '@/components/admin/products/ProductListPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Product Management | Admin',
}

export default function AdminProductsPage() {
  return <ProductListPage />
}
