"use client";

import { createContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import type { CartContextValue, CartState } from '@/types/cart';
import { cartService } from '@/services/cart.service';
import { clearCartStorage, loadCartFromStorage, saveCartToStorage } from '@/lib/cart/cartStorage';

const initialCartState: CartState = {
  items: [],
  summary: {
    subtotal: 0,
    itemCount: 0,
    shipping: 0,
    tax: 0,
    couponDiscount: 0,
    grandTotal: 0,
  },
};

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(initialCartState);
  const [isOpen, setIsOpen] = useState(false);
  const isHydratedRef = useRef(false);

  // Sync with Database API if user is authenticated
  const fetchDbCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.status === 401) {
        return false;
      }
      const data = await res.json();
      if (res.ok && data.success && data.cart) {
        setCart(data.cart);
        saveCartToStorage(data.cart);
        return true;
      }
    } catch {
      // Unauthenticated or network error, fallback to local storage
    }
    return false;
  }, []);

  // Initial hydration: load from localStorage immediately, then check if logged-in user has server cart
  useEffect(() => {
    async function init() {
      // 1. Load from localStorage for immediate display (works for guests & offline)
      const storedCart = loadCartFromStorage();
      if (storedCart) {
        setCart(cartService.validateCart(storedCart));
      }

      // 2. If logged in, sync with authoritative server cart
      await fetchDbCart();

      isHydratedRef.current = true;
    }
    void init();
  }, [fetchDbCart]);

  // Persist local cart state to localStorage on changes (only after hydration)
  useEffect(() => {
    if (!isHydratedRef.current) return;
    saveCartToStorage(cart);
  }, [cart]);

  const addItem = async (product: Parameters<CartContextValue['addItem']>[0], quantity = 1, variantId?: string) => {
    // 1. Update local client state and localStorage immediately (supports guest checkout)
    const previousCart = cart;
    const updatedCart = cartService.addProduct(cart, product, quantity, variantId);
    setCart(updatedCart);
    saveCartToStorage(updatedCart);

    // 2. Sync with database if logged in
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productVariantId: variantId || null,
          quantity,
        }),
      });

      // Guest user (unauthenticated) — this is expected. Keep local cart!
      if (res.status === 401) {
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.cart); // Sync with server state
        saveCartToStorage(data.cart);
      } else if (!res.ok && data.message) {
        alert(data.message);
        setCart(previousCart); // Roll back only on real server inventory rejection
        saveCartToStorage(previousCart);
      }
    } catch {
      // Network failure / offline — retain local cart
    }
  };

  const removeItem = async (itemId: string) => {
    const previousCart = cart;
    const updatedCart = cartService.removeProduct(cart, itemId);
    setCart(updatedCart);
    saveCartToStorage(updatedCart);

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      if (res.status === 401) {
        return; // Guest user — keep local removal
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.cart);
        saveCartToStorage(data.cart);
      } else if (!res.ok && data.message) {
        alert(data.message);
        setCart(previousCart);
        saveCartToStorage(previousCart);
      }
    } catch {
      // Retain local removal on network failure
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const previousCart = cart;
    const updatedCart = cartService.updateQuantity(cart, itemId, quantity);
    setCart(updatedCart);
    saveCartToStorage(updatedCart);

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (res.status === 401) {
        return; // Guest user — keep local update
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.cart);
        saveCartToStorage(data.cart);
      } else if (!res.ok && data.message) {
        alert(data.message);
        setCart(previousCart);
        saveCartToStorage(previousCart);
      }
    } catch {
      // Retain local update on network failure
    }
  };

  const clearCart = useCallback(async () => {
    setCart((currentCart) => cartService.clear(currentCart));
    clearCartStorage();

    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
      });
      if (res.status === 401) {
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.cart);
        clearCartStorage();
      }
    } catch {
      // Fallback
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal: cart.summary.subtotal,
      itemCount: cart.summary.itemCount,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((open) => !open),
    }),
    [cart, clearCart, isOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
