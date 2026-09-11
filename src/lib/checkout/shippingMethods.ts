import type { ShippingMethod } from '@/types/checkout';

export const shippingMethods: ShippingMethod[] = [
  {
    id: 'flat-rate',
    name: 'Flat Rate',
    description: 'Standard delivery in 3-5 business days.',
    amount: 8,
    type: 'flat_rate',
    enabled: true,
  },
  {
    id: 'free-shipping',
    name: 'Free Shipping',
    description: 'Free delivery for eligible orders.',
    amount: 0,
    type: 'free_shipping',
    enabled: true,
  },
  {
    id: 'free-above',
    name: 'Free Shipping Above $100',
    description: 'Free shipping when your order is above the configured threshold.',
    amount: 0,
    type: 'free_above',
    minimumAmount: 100,
    enabled: true,
  },
  {
    id: 'pickup',
    name: 'Pickup',
    description: 'Collect your order from the store.',
    amount: 0,
    type: 'pickup',
    enabled: true,
  },
  {
    id: 'negotiable',
    name: 'Negotiable Shipping',
    description: 'Custom shipping terms can be arranged.',
    amount: 0,
    type: 'negotiable',
    enabled: true,
  },
];

export function getShippingMethodById(id: string | null): ShippingMethod | null {
  if (!id) return null;
  return shippingMethods.find((method) => method.id === id) ?? null;
}

export function getEnabledShippingMethods(): ShippingMethod[] {
  return shippingMethods.filter((method) => method.enabled);
}
