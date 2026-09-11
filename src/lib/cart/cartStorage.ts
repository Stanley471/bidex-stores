import type { CartState } from '@/types/cart';

const STORAGE_KEY = 'ctools-cart';

function isCartState(value: unknown): value is CartState {
  if (!value || typeof value !== 'object') return false;

  const maybe = value as Partial<CartState>;
  return Array.isArray(maybe.items) && typeof maybe.summary === 'object';
}

export function loadCartFromStorage(): CartState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return isCartState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCartToStorage(cart: CartState): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Ignore storage errors to keep the app resilient.
  }
}

export function clearCartStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors to keep the app resilient.
  }
}
