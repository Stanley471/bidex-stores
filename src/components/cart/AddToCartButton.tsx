"use client";

import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types/product';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  variantId?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function AddToCartButton({
  product,
  quantity = 1,
  variantId,
  disabled = false,
  label = 'Add to cart',
  className,
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    void addItem(product, quantity, variantId);
    openCart();
  };

  return (
    <Button className={className} onClick={handleAdd} disabled={disabled}>
      {disabled ? 'Out of stock' : label}
    </Button>
  );
}
