import type { PaymentMethod } from '@/types/checkout';

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'cash',
    name: 'Cash on Delivery',
    description: 'Pay on delivery when your order arrives.',
    type: 'cash',
    enabled: true,
  },
  {
    id: 'card',
    name: 'Credit or Debit Card',
    description: 'Future provider integration will support card processing.',
    type: 'card',
    enabled: true,
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    description: 'Pay using a secure bank transfer.',
    type: 'bank_transfer',
    enabled: true,
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    description: 'Use a wallet provider later.',
    type: 'wallet',
    enabled: true,
  },
];

export function getPaymentMethodById(id: string | null): PaymentMethod | null {
  if (!id) return null;
  return paymentMethods.find((method) => method.id === id) ?? null;
}
