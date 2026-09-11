"use client";

import { createContext, useEffect, useMemo, useState, useCallback } from 'react';
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

  // Sync with Database API if user is authenticated
  const fetchDbCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.cart);
        return true;
      }
    } catch {
      // Unauthenticated or network error, fallback to local storage
    }
    return false;
  }, []);

  useEffect(() => {
    async function init() {
      const synced = await fetchDbCart();
      if (!synced) {
        const storedCart = loadCartFromStorage();
        if (storedCart) {
          setCart(cartService.validateCart(storedCart));
        }
      }
    }
    init();
  }, [fetchDbCart]);

  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addItem = async (product: Parameters<CartContextValue['addItem']>[0], quantity = 1, variantId?: string) => {
    // Optimistic update — reflect the change in UI immediately
    const previousCart = cart;
    setCart((currentCart) => cartService.addProduct(currentCart, product, quantity, variantId));

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
      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.cart); // Sync with server's authoritative state
      } else if (!res.ok && data.message) {
        if (res.status !== 401) alert(data.message);
        setCart(previousCart); // Roll back on error
      }
    } catch {
      setCart(previousCart); // Roll back on network failure
    }
  };

  const removeItem = async (itemId: string) => {
    // Optimistic update
    const previousCart = cart;
    setCart((currentCart) => cartService.removeProduct(currentCart, itemId));

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.cart);
      } else if (!res.ok && data.message) {
        if (res.status !== 401) alert(data.message);
        setCart(previousCart); // Roll back on error
      }
    } catch {
      setCart(previousCart); // Roll back on network failure
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    // Optimistic update
    const previousCart = cart;
    setCart((currentCart) => cartService.updateQuantity(currentCart, itemId, quantity));

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.cart);
      } else if (!res.ok && data.message) {
        if (res.status !== 401) alert(data.message);
        setCart(previousCart); // Roll back on error
      }
    } catch {
      setCart(previousCart); // Roll back on network failure
    }
  };

  const clearCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCart(data.cart);
        clearCartStorage();
        return;
      }
    } catch {
      // Fallback
    }

    setCart((currentCart) => cartService.clear(currentCart));
    clearCartStorage();
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
