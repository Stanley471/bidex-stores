/**
 * Mock Data Management
 * 
 * Centralized location for mock data used throughout the application.
 * In production, this data would come from a database API.
 */

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  image: string;
  sold?: number;
  addedDaysAgo?: number;
}

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', icon: '💻', slug: 'electronics' },
  { id: '2', name: 'Fashion', icon: '👗', slug: 'fashion' },
  { id: '3', name: 'Furniture', icon: '🛋️', slug: 'furniture' },
  { id: '4', name: 'Home & Garden', icon: '🏠', slug: 'home-garden' },
  { id: '5', name: 'Sports', icon: '⚽', slug: 'sports' },
  { id: '6', name: 'Books', icon: '📚', slug: 'books' },
  { id: '7', name: 'Beauty', icon: '💄', slug: 'beauty' },
  { id: '8', name: 'Toys', icon: '🎮', slug: 'toys' },
];

export const MOCK_FLASH_SALE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 199,
    discount: 40,
    image: '🎧',
  },
  { id: '2', name: 'USB-C Cable', price: 15, discount: 30, image: '🔌' },
  { id: '3', name: 'Phone Stand', price: 25, discount: 50, image: '📱' },
  { id: '4', name: 'Laptop Stand', price: 45, discount: 35, image: '💻' },
  { id: '5', name: 'Mouse Pad', price: 12, discount: 40, image: '🖱️' },
  { id: '6', name: 'Keyboard', price: 65, discount: 25, image: '⌨️' },
];

export const MOCK_FEATURED_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Coffee Maker',
    price: 89.99,
    rating: 4.8,
    reviews: 245,
    image: '☕',
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 199.99,
    rating: 4.6,
    reviews: 328,
    image: '⌚',
  },
  {
    id: '3',
    name: 'Portable Speaker',
    price: 49.99,
    rating: 4.7,
    reviews: 412,
    image: '🔊',
  },
  {
    id: '4',
    name: 'Yoga Mat',
    price: 29.99,
    rating: 4.5,
    reviews: 156,
    image: '🧘',
  },
  {
    id: '5',
    name: 'Camera Tripod',
    price: 34.99,
    rating: 4.9,
    reviews: 289,
    image: '📷',
  },
  {
    id: '6',
    name: 'Phone Charger',
    price: 19.99,
    rating: 4.4,
    reviews: 567,
    image: '🔋',
  },
  {
    id: '7',
    name: 'USB Hub',
    price: 24.99,
    rating: 4.6,
    reviews: 198,
    image: '🔗',
  },
  {
    id: '8',
    name: 'Screen Protector',
    price: 12.99,
    rating: 4.3,
    reviews: 421,
    image: '📱',
  },
];

export const MOCK_BESTSELLER_PRODUCTS: Product[] = [
  { id: '1', name: 'Classic T-Shirt', price: 19.99, sold: 1240, image: '👕' },
  { id: '2', name: 'Denim Jeans', price: 49.99, sold: 856, image: '👖' },
  { id: '3', name: 'Sneakers', price: 79.99, sold: 742, image: '👟' },
  {
    id: '4',
    name: 'Baseball Cap',
    price: 24.99,
    sold: 634,
    image: '🧢',
  },
  { id: '5', name: 'Hoodie', price: 54.99, sold: 521, image: '🧥' },
  { id: '6', name: 'Socks Pack', price: 14.99, sold: 1456, image: '🧦' },
  {
    id: '7',
    name: 'Backpack',
    price: 39.99,
    sold: 428,
    image: '🎒',
  },
  { id: '8', name: 'Belt', price: 29.99, sold: 312, image: '⛓️' },
];

export const MOCK_NEW_ARRIVALS: Product[] = [
  {
    id: '1',
    name: 'Wireless Charging Pad',
    price: 34.99,
    image: '⚡',
    addedDaysAgo: 1,
  },
  {
    id: '2',
    name: 'Air Purifier',
    price: 129.99,
    image: '💨',
    addedDaysAgo: 2,
  },
  {
    id: '3',
    name: 'Desk Lamp',
    price: 44.99,
    image: '💡',
    addedDaysAgo: 3,
  },
  {
    id: '4',
    name: 'Plant Pot',
    price: 18.99,
    image: '🪴',
    addedDaysAgo: 1,
  },
  {
    id: '5',
    name: 'Wall Clock',
    price: 22.99,
    image: '🕐',
    addedDaysAgo: 4,
  },
  { id: '6', name: 'Mirror', price: 39.99, image: '🪞', addedDaysAgo: 2 },
  { id: '7', name: 'Door Mat', price: 14.99, image: '🚪', addedDaysAgo: 5 },
  {
    id: '8',
    name: 'Curtain Rods',
    price: 24.99,
    image: '🪟',
    addedDaysAgo: 3,
  },
];

/**
 * Get categories for display
 */
export function getCategories(limit: number = 8): Category[] {
  return MOCK_CATEGORIES.slice(0, limit);
}

/**
 * Get flash sale products
 */
export function getFlashSaleProducts(limit: number = 6): Product[] {
  return MOCK_FLASH_SALE_PRODUCTS.slice(0, limit);
}

/**
 * Get featured products
 */
export function getFeaturedProducts(limit: number = 8): Product[] {
  return MOCK_FEATURED_PRODUCTS.slice(0, limit);
}

/**
 * Get best seller products
 */
export function getBestsellerProducts(limit: number = 8): Product[] {
  return MOCK_BESTSELLER_PRODUCTS.slice(0, limit);
}

/**
 * Get new arrival products
 */
export function getNewArrivalProducts(limit: number = 8): Product[] {
  return MOCK_NEW_ARRIVALS.slice(0, limit);
}

/**
 * Get all products
 */
export function getAllProducts(): Product[] {
  return [
    ...MOCK_FEATURED_PRODUCTS,
    ...MOCK_BESTSELLER_PRODUCTS,
    ...MOCK_NEW_ARRIVALS,
  ];
}
