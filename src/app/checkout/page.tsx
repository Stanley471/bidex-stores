import { Suspense } from 'react'
import { storeSettingsService } from '@/services/store-settings.service'
import { CheckoutContent } from '@/components/checkout/CheckoutContent'
import { Skeleton } from '@/components/ui/skeleton'

export const revalidate = 0 // Server-render to always load fresh store & bank settings

export default async function CheckoutPage() {
  let bankDetails = {
    bankName: null as string | null,
    accountNumber: null as string | null,
    accountName: null as string | null,
  }

  try {
    const settings = await storeSettingsService.getPublicStoreSettings()
    bankDetails = {
      bankName: settings.bankName || null,
      accountNumber: settings.accountNumber || null,
      accountName: settings.accountName || null,
    }
  } catch {
    // Graceful fallback
  }

  return (
    <main className="flex-1 bg-slate-50/70">
      <Suspense
        fallback={
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.3fr_0.7fr]">
            <Skeleton className="h-96 w-full rounded-3xl" />
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        }
      >
        <CheckoutContent bankDetails={bankDetails} />
      </Suspense>
    </main>
  )
}
