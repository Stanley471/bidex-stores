import { Suspense } from 'react'
import { BrandFormPage } from '@/components/admin/BrandFormPage'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminBrandCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-4xl mx-auto p-6">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      }
    >
      <BrandFormPage mode="create" />
    </Suspense>
  )
}
