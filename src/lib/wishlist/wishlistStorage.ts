const WISHLIST_STORAGE_KEY = 'ctools_wishlist_ids'

export function loadWishlistFromStorage(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveWishlistToStorage(ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Ignore storage errors
  }
}

export function clearWishlistStorage(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(WISHLIST_STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}
