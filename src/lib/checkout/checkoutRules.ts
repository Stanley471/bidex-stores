import type { CartItem } from '@/types/cart';
import type { CheckoutValidationResult, ShippingAddress, ShippingMethod, PaymentMethod } from '@/types/checkout';

export function validateAddress(address: ShippingAddress): CheckoutValidationResult {
  const errors: string[] = [];

  if (!address.fullName.trim()) errors.push('Full name is required.');
  if (!address.email.trim()) errors.push('Email is required.');
  if (!address.phone.trim()) errors.push('Phone is required.');
  if (!address.line1.trim()) errors.push('Address line 1 is required.');
  if (!address.city.trim()) errors.push('City is required.');
  if (!address.state.trim()) errors.push('State is required.');
  if (!address.postalCode.trim()) errors.push('Postal code is required.');
  if (!address.country.trim()) errors.push('Country is required.');

  return { isValid: errors.length === 0, errors };
}

export function validateShippingMethod(method: ShippingMethod | null, subtotal: number): CheckoutValidationResult {
  const errors: string[] = [];

  if (!method) {
    errors.push('Please choose a shipping method.');
    return { isValid: false, errors };
  }

  if (!method.enabled) {
    errors.push('The selected shipping method is not available.');
  }

  if (method.type === 'free_above' && method.minimumAmount && subtotal < method.minimumAmount) {
    errors.push(`Free shipping requires a minimum order of ${method.minimumAmount}.`);
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePaymentMethod(method: PaymentMethod | null): CheckoutValidationResult {
  if (!method || !method.enabled) {
    return { isValid: false, errors: ['Please select a valid payment method.'] };
  }

  return { isValid: true, errors: [] };
}

export function validateCartIntegrity(items: CartItem[]): CheckoutValidationResult {
  if (!items.length) {
    return { isValid: false, errors: ['Your cart is empty.'] };
  }

  const errors = items.flatMap((item) => {
    const issues: string[] = [];
    if (item.quantity < 1) issues.push(`Invalid quantity for ${item.product.name}.`);
    if (item.product.inventoryStatus === 'out_of_stock') issues.push(`${item.product.name} is out of stock.`);
    return issues;
  });

  return { isValid: errors.length === 0, errors };
}
