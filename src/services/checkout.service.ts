import type { CartItem } from '@/types/cart';
import type { CheckoutDraft, ShippingAddress, ShippingMethod, PaymentMethod } from '@/types/checkout';
import { validateAddress, validateCartIntegrity, validatePaymentMethod, validateShippingMethod } from '@/lib/checkout/checkoutRules';
import { generateOrderNumber } from '@/lib/orders/orderNumber';
import { PAYMENT_STATUS, ORDER_STATUS } from '@/lib/orders/orderStatus';
import type { Order, OrderItem } from '@/types/order';

export interface OrderTotalsCalculation {
  subtotal: number
  discount: number
  shippingFee: number
  tax: number
  grandTotal: number
}

/**
 * Centralized Order Total Calculation Engine
 * Formula: Grand Total = Math.max(0, Subtotal - Discount) + ShippingFee + Tax
 */
export function calculateOrderTotals(
  subtotal: number,
  discountAmount: number,
  shippingFee: number,
  taxAmount = 0,
): OrderTotalsCalculation {
  const safeSubtotal = Math.max(0, subtotal)
  const safeDiscount = Math.min(Math.max(0, discountAmount), safeSubtotal)
  const safeShipping = Math.max(0, shippingFee)
  const safeTax = Math.max(0, taxAmount)

  const grandTotal = Math.max(0, safeSubtotal - safeDiscount) + safeShipping + safeTax

  return {
    subtotal: safeSubtotal,
    discount: safeDiscount,
    shippingFee: safeShipping,
    tax: safeTax,
    grandTotal,
  }
}

export interface CheckoutService {
  createDraft(items: CartItem[], address?: ShippingAddress, shippingMethodId?: string | null, paymentMethodId?: string | null): CheckoutDraft;
  validateDraft(draft: CheckoutDraft, shippingMethods: ShippingMethod[], paymentMethods: PaymentMethod[]): string[];
  placeOrder(draft: CheckoutDraft, shippingMethods: ShippingMethod[], paymentMethods: PaymentMethod[]): Order;
}

function toOrderItems(items: CartItem[]): OrderItem[] {
  return items.map((item) => ({
    id: `${item.productId}-${item.selectedVariantId ?? 'default'}`,
    productId: item.productId,
    productName: item.product.name,
    quantity: item.quantity,
    unitPrice: item.salePrice ?? item.unitPrice,
    subtotal: (item.salePrice ?? item.unitPrice) * item.quantity,
    selectedVariant: item.product.variants?.find((variant) => variant.id === item.selectedVariantId),
  }));
}

export const checkoutService: CheckoutService = {
  createDraft(items, address, shippingMethodId, paymentMethodId) {
    return {
      address: address ?? {
        fullName: '',
        email: '',
        phone: '',
        line1: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      shippingMethodId: shippingMethodId ?? null,
      paymentMethodId: paymentMethodId ?? null,
      items,
      currentStep: 'address',
      status: 'draft',
      orderId: null,
    };
  },
  validateDraft(draft, shippingMethods, paymentMethods) {
    const errors: string[] = [];
    const addressValidation = validateAddress(draft.address);
    const cartValidation = validateCartIntegrity(draft.items);
    const selectedShippingMethod = shippingMethods.find((method) => method.id === draft.shippingMethodId) ?? null;
    const selectedPaymentMethod = paymentMethods.find((method) => method.id === draft.paymentMethodId) ?? null;

    if (!addressValidation.isValid) errors.push(...addressValidation.errors);
    if (!cartValidation.isValid) errors.push(...cartValidation.errors);

    const shippingValidation = validateShippingMethod(selectedShippingMethod, draft.items.reduce((sum, item) => sum + (item.salePrice ?? item.unitPrice) * item.quantity, 0));
    if (!shippingValidation.isValid) errors.push(...shippingValidation.errors);

    const paymentValidation = validatePaymentMethod(selectedPaymentMethod);
    if (!paymentValidation.isValid) errors.push(...paymentValidation.errors);

    return errors;
  },
  placeOrder(draft, shippingMethods, paymentMethods) {
    const selectedShippingMethod = shippingMethods.find((method) => method.id === draft.shippingMethodId) ?? shippingMethods[0];
    const selectedPaymentMethod = paymentMethods.find((method) => method.id === draft.paymentMethodId) ?? paymentMethods[0];
    const rawSubtotal = draft.items.reduce((sum, item) => sum + (item.salePrice ?? item.unitPrice) * item.quantity, 0);
    const rawShipping = selectedShippingMethod?.amount ?? 0;

    const totals = calculateOrderTotals(rawSubtotal, 0, rawShipping, 0);

    const now = new Date().toISOString();
    const order: Order = {
      id: `order-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      customer: {
        fullName: draft.address.fullName,
        email: draft.address.email,
        phone: draft.address.phone,
      },
      shippingAddress: draft.address,
      shippingMethod: selectedShippingMethod,
      paymentMethod: selectedPaymentMethod,
      items: toOrderItems(draft.items),
      subtotal: totals.subtotal,
      shippingAmount: totals.shippingFee,
      discount: totals.discount,
      tax: totals.tax,
      grandTotal: totals.grandTotal,
      paymentStatus: PAYMENT_STATUS.PAID,
      status: ORDER_STATUS.CONFIRMED,
      createdAt: now,
      updatedAt: now,
    };

    return order;
  },
};
