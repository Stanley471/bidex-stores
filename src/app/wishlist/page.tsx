import type { Metadata } from 'next'
import { WishlistExplorer } from '@/components/wishlist/WishlistExplorer'

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: 'View and manage your saved wishlist products.',
}

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <WishlistExplorer />
      </div>
    </main>
  )
}
