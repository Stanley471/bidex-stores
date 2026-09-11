import type { Product } from '@/types/product';

export type CartItemStatus = 'active' | 'saved_for_later';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedVariantId?: string;
  unitPrice: number;
  salePrice?: number;
  status: CartItemStatus;
  addedAt: string;
}

export interface CartSummary {
  subtotal: number;
  itemCount: number;
  shipping: number;
  tax: number;
  couponDiscount: number;
  grandTotal: number;
}

export interface CartState {
  items: CartItem[];
  summary: CartSummary;
}

export interface CartContextValue {
  cart: CartState;
  addItem: (product: Product, quantity?: number, variantId?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}
