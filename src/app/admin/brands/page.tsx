import { Suspense } from 'react'
import { BrandListPage } from '@/components/admin/BrandListPage'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

export default function AdminBrandsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      }
    >
      <BrandListPage />
    </Suspense>
  )
}
