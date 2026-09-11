import type { Product } from '@/types/product'

export interface WishlistContextValue {
  wishlist: Product[]
  wishlistIds: string[]
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  clearWishlist: () => void
  itemCount: number
  loading: boolean
}
