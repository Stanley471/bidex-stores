import type { CartItem } from '@/types/cart';
import type { ProductVariant } from '@/types/product';

export type CheckoutStep = 'address' | 'shipping' | 'review' | 'payment' | 'confirmation';
export type ShippingMethodType = 'flat_rate' | 'free_shipping' | 'free_above' | 'pickup' | 'negotiable';
export type PaymentMethodType = 'cash' | 'card' | 'bank_transfer' | 'wallet';
export type CheckoutStatus = 'draft' | 'submitted' | 'completed' | 'failed';

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: ShippingMethodType;
  minimumAmount?: number;
  enabled: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  description: string;
  enabled: boolean;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CheckoutContextValue {
  currentStep: CheckoutStep;
  setCurrentStep: (step: CheckoutStep) => void;
  address: ShippingAddress;
  setAddress: (address: ShippingAddress) => void;
  shippingMethodId: string | null;
  setShippingMethodId: (id: string | null) => void;
  paymentMethodId: string | null;
  setPaymentMethodId: (id: string | null) => void;
  items: CartItem[];
  submitOrder: () => Promise<void>;
  checkoutStatus: CheckoutStatus;
  orderId: string | null;
  resetCheckout: () => void;
}

export interface CheckoutDraft {
  address: ShippingAddress;
  shippingMethodId: string | null;
  paymentMethodId: string | null;
  items: CartItem[];
  currentStep: CheckoutStep;
  status: CheckoutStatus;
  orderId: string | null;
}

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  selectedVariant?: ProductVariant;
  subtotal: number;
}
