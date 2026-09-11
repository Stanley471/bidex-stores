"use client"

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { Product } from '@/types/product'
import type { WishlistContextValue } from '@/types/wishlist'
import {
  clearWishlistStorage,
  loadWishlistFromStorage,
  saveWishlistToStorage,
} from '@/lib/wishlist/wishlistStorage'

export const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  // Sync DB Wishlist or LocalStorage
  const fetchWishlist = useCallback(async () => {
    try {
      // 1. Try DB Wishlist for authenticated user
      const res = await fetch('/api/wishlist')
      const data = await res.json()

      if (res.ok && data.success) {
        setIsAuthenticated(true)

        // If guest local storage items exist, sync them to DB!
        const localIds = loadWishlistFromStorage()
        if (localIds.length > 0) {
          try {
            const syncRes = await fetch('/api/wishlist/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productIds: localIds }),
            })
            const syncData = await syncRes.json()
            if (syncRes.ok && syncData.success) {
              setWishlist(syncData.products || [])
              setWishlistIds(syncData.productIds || [])
              clearWishlistStorage()
              return
            }
          } catch {
            // Ignore sync error
          }
        }

        setWishlist(data.products || [])
        setWishlistIds(data.productIds || [])
        return
      }
    } catch {
      // Unauthenticated or network error
    }

    // 2. Unauthenticated Guest Mode -> Load IDs from localStorage
    setIsAuthenticated(false)
    const storedIds = loadWishlistFromStorage()
    setWishlistIds(storedIds)
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await fetchWishlist()
      setLoading(false)
    }
    void init()
  }, [fetchWishlist])

  // Persist guest wishlist IDs to localStorage when unauthenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      saveWishlistToStorage(wishlistIds)
    }
  }, [wishlistIds, isAuthenticated, loading])

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlistIds.includes(productId)
    },
    [wishlistIds]
  )

  const toggleWishlist = useCallback(
    async (product: Product) => {
      const isPresent = wishlistIds.includes(product.id)

      if (isAuthenticated) {
        try {
          if (isPresent) {
            const res = await fetch(`/api/wishlist?productId=${product.id}`, { method: 'DELETE' })
            const data = await res.json()
            if (res.ok && data.success) {
              setWishlist(data.products || [])
              setWishlistIds(data.productIds || [])
              return
            }
          } else {
            const res = await fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: product.id }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
              setWishlist(data.products || [])
              setWishlistIds(data.productIds || [])
              return
            }
          }
        } catch {
          // Fallback to local state update if DB call fails
        }
      }

      // Guest / Local Fallback
      if (isPresent) {
        setWishlistIds((prev) => prev.filter((id) => id !== product.id))
        setWishlist((prev) => prev.filter((p) => p.id !== product.id))
      } else {
        setWishlistIds((prev) => [...prev, product.id])
        setWishlist((prev) => (prev.some((p) => p.id === product.id) ? prev : [...prev, product]))
      }
    },
    [isAuthenticated, wishlistIds]
  )

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        try {
          const res = await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' })
          const data = await res.json()
          if (res.ok && data.success) {
            setWishlist(data.products || [])
            setWishlistIds(data.productIds || [])
            return
          }
        } catch {
          // Fallback
        }
      }

      setWishlistIds((prev) => prev.filter((id) => id !== productId))
      setWishlist((prev) => prev.filter((p) => p.id !== productId))
    },
    [isAuthenticated]
  )

  const clearWishlist = useCallback(() => {
    setWishlist([])
    setWishlistIds([])
    clearWishlistStorage()
  }, [])

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlist,
      wishlistIds,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      itemCount: wishlistIds.length,
      loading,
    }),
    [wishlist, wishlistIds, isInWishlist, toggleWishlist, removeFromWishlist, clearWishlist, loading]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}
