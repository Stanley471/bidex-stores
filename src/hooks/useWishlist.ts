import { useContext } from 'react'
import { WishlistContext } from '@/context/WishlistProvider'
import type { WishlistContextValue } from '@/types/wishlist'

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
