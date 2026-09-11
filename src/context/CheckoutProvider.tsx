"use client";

import { createContext, useMemo, useState } from 'react';

import { useCart } from '@/hooks/useCart';
import { checkoutService } from '@/services/checkout.service';
import { paymentMethods } from '@/lib/checkout/paymentMethods';
import { shippingMethods } from '@/lib/checkout/shippingMethods';
import type { CheckoutContextValue, CheckoutDraft, CheckoutStep, ShippingAddress } from '@/types/checkout';

const initialAddress: ShippingAddress = {
  fullName: '',
  email: '',
  phone: '',
  line1: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

export const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const { cart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [address, setAddress] = useState<ShippingAddress>(initialAddress);
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutContextValue['checkoutStatus']>('draft');
  const [orderId, setOrderId] = useState<string | null>(null);

  const submitOrder = async () => {
    const draft: CheckoutDraft = checkoutService.createDraft(cart.items, address, shippingMethodId, paymentMethodId);
    const errors = checkoutService.validateDraft(draft, shippingMethods, paymentMethods);

    if (errors.length) {
      setCheckoutStatus('failed');
      return;
    }

    const order = checkoutService.placeOrder(draft, shippingMethods, paymentMethods);
    setOrderId(order.id);
    setCheckoutStatus('completed');
    setCurrentStep('confirmation');
  };

  const resetCheckout = () => {
    setCurrentStep('address');
    setAddress(initialAddress);
    setShippingMethodId(null);
    setPaymentMethodId(null);
    setCheckoutStatus('draft');
    setOrderId(null);
  };

  const value = useMemo<CheckoutContextValue>(() => ({
    currentStep,
    setCurrentStep,
    address,
    setAddress,
    shippingMethodId,
    setShippingMethodId,
    paymentMethodId,
    setPaymentMethodId,
    items: cart.items,
    submitOrder,
    checkoutStatus,
    orderId,
    resetCheckout,
  }), [address, cart.items, checkoutStatus, currentStep, orderId, paymentMethodId, shippingMethodId]);

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}
