export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
export type ProductCurrency = 'NGN' | 'USD' | 'EUR' | 'GBP' | string;

export interface ProductImage {
  src: string;
  alt: string;
  isPrimary?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;
  stockStatus?: InventoryStatus;
  attributes: Record<string, string>;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  parentCategory?: string;
  brand: string;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  currency: ProductCurrency;
  rating: number;
  reviewCount: number;
  reviewSummary?: string;
  images: ProductImage[];
  inventoryStatus: InventoryStatus;
  inventoryCount?: number;
  isFeatured: boolean;
  isOnSale: boolean;
  discountPercent?: number;
  isBestSeller?: boolean;
  createdAt: string;
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  specifications?: Array<{ key: string; value: string }>;
  metadata?: Record<string, unknown>;
}

export interface ProductCardProps {
  product: Product;
  href?: string;
  className?: string;
  showDescription?: boolean;
  showRating?: boolean;
  showStock?: boolean;
  showActions?: boolean;
}

export interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  limit?: number;
  emptyMessage?: string;
  className?: string;
  cardClassName?: string;
  showDescription?: boolean;
  showRating?: boolean;
  showStock?: boolean;
  showActions?: boolean;
}
