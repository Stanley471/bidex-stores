import { Suspense, use } from 'react'
import { BrandFormPage } from '@/components/admin/BrandFormPage'
import { Skeleton } from '@/components/ui/skeleton'

interface Params {
  params: Promise<{
    id: string
  }>
}

export default function AdminBrandEditPage({ params }: Params) {
  const { id } = use(params)
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-4xl mx-auto p-6">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      }
    >
      <BrandFormPage mode="edit" brandId={id} />
    </Suspense>
  )
}
