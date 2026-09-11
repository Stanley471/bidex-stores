import { CategoryListPage } from '@/components/admin/categories/CategoryListPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Category Management | Admin',
}

export default function AdminCategoriesPage() {
  return <CategoryListPage />
}
