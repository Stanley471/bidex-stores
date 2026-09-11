import type { Product } from '@/types/product';
import type { CartItem, CartState } from '@/types/cart';
import { calculateCartSummary, normalizeQuantity } from '@/lib/cart/cartCalculations';

export interface CartService {
  addProduct: (state: CartState, product: Product, quantity?: number, variantId?: string) => CartState;
  removeProduct: (state: CartState, itemId: string) => CartState;
  updateQuantity: (state: CartState, itemId: string, quantity: number) => CartState;
  clear: (state?: CartState) => CartState;
  validateCart: (state: CartState) => CartState;
}

function createCartItem(product: Product, quantity: number, variantId?: string): CartItem {
  return {
    id: `${product.id}-${variantId ?? 'default'}`,
    productId: product.id,
    product,
    quantity: normalizeQuantity(quantity),
    selectedVariantId: variantId,
    unitPrice: product.price,
    salePrice: product.isOnSale ? product.price * (1 - (product.discountPercent ?? 0) / 100) : undefined,
    status: 'active',
    addedAt: new Date().toISOString(),
  };
}

export const cartService: CartService = {
  addProduct(state, product, quantity = 1, variantId) {
    const nextItems = [...state.items];
    const existingItem = nextItems.find((item) => item.productId === product.id && item.selectedVariantId === variantId);

    if (existingItem) {
      existingItem.quantity += normalizeQuantity(quantity);
      existingItem.unitPrice = product.price;
      existingItem.salePrice = product.isOnSale ? product.price * (1 - (product.discountPercent ?? 0) / 100) : undefined;
    } else {
      nextItems.unshift(createCartItem(product, quantity, variantId));
    }

    return {
      items: nextItems,
      summary: calculateCartSummary(nextItems),
    };
  },
  removeProduct(state, itemId) {
    const nextItems = state.items.filter((item) => item.id !== itemId);
    return {
      items: nextItems,
      summary: calculateCartSummary(nextItems),
    };
  },
  updateQuantity(state, itemId, quantity) {
    const nextItems = state.items.map((item) => {
      if (item.id !== itemId) return item;
      return { ...item, quantity: normalizeQuantity(quantity) };
    });

    return {
      items: nextItems,
      summary: calculateCartSummary(nextItems),
    };
  },
  clear() {
    return {
      items: [],
      summary: calculateCartSummary([]),
    };
  },
  validateCart(state) {
    return {
      ...state,
      items: state.items.filter((item) => item.quantity > 0),
      summary: calculateCartSummary(state.items.filter((item) => item.quantity > 0)),
    };
  },
};
