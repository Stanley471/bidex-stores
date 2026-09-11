import type { CartItem, CartSummary } from '@/types/cart';

export function calculateCartSummary(items: CartItem[]): CartSummary {
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.salePrice ?? item.unitPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    itemCount,
    shipping: 0,
    tax: 0,
    couponDiscount: 0,
    grandTotal: subtotal,
  };
}

export function normalizeQuantity(quantity: number): number {
  return Math.max(1, Math.floor(quantity));
}
