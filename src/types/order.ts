import type { ShippingAddress, ShippingMethod, PaymentMethod } from '@/types/checkout';
import type { ProductVariant } from '@/types/product';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedVariant?: ProductVariant;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  messages?: OrderMessage[];
}

export interface OrderMessage {
  id: string;
  orderId: string;
  message: string;
  createdBy: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    role?: string;
  };
}

export interface OrderSummary {
  order: Order;
  canRefund: boolean;
}
