/**
 * Example Store Configurations
 * 
 * This file demonstrates how the same codebase can serve different businesses
 * by simply changing the store configuration.
 * 
 * In production, you would:
 * 1. Create separate config files for each business
 * 2. Use middleware or API to select the config based on domain
 * 3. Load the appropriate config in src/app/page.tsx
 */

import { SECTION_TYPES, StoreConfig } from '@/types/homepage';

/**
 * Fashion Store Configuration
 * 
 * Example configuration for a fashion retail store.
 */
export const fashionStoreConfig: StoreConfig = {
  storeName: 'StyleHub Fashion',
  logo: '/logos/stylehub.png',
  description: 'Premium fashion and apparel',
  primaryColor: '#ec4899', // Pink
  secondaryColor: '#8b5cf6', // Purple
  heroTitle: 'Welcome to StyleHub',
  heroSubtitle: 'Discover the latest fashion trends',
  heroImage: '/hero-fashion.jpg',
  ctaText: 'Browse Collection',
  ctaLink: '/products',
  homepageSections: [
    {
      id: 'hero',
      type: SECTION_TYPES.HERO,
      enabled: true,
      order: 1,
      title: 'Summer Collection 2024',
      subtitle: 'Elevate your style with our latest collection',
      theme: 'primary',
      config: {
        imageUrl: '/hero-fashion.jpg',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        height: 'large',
      },
    },
    {
      id: 'categories',
      type: SECTION_TYPES.CATEGORIES,
      enabled: true,
      order: 2,
      title: 'Shop by Category',
      theme: 'light',
      config: {
        displayLimit: 8,
        showIcons: true,
      },
    },
    {
      id: 'new-arrivals',
      type: SECTION_TYPES.NEW_ARRIVALS,
      enabled: true,
      order: 3,
      title: 'New Collection',
      subtitle: 'Fresh designs just arrived',
      theme: 'light',
      config: {
        displayLimit: 8,
      },
    },
    {
      id: 'bestsellers',
      type: SECTION_TYPES.BESTSELLERS,
      enabled: true,
      order: 4,
      title: 'Customer Favorites',
      subtitle: 'Best-selling styles',
      theme: 'light',
      config: {
        displayLimit: 8,
      },
    },
    {
      id: 'featured-products',
      type: SECTION_TYPES.FEATURED,
      enabled: false,
      order: 5,
      title: 'Featured',
      theme: 'light',
    },
    {
      id: 'why-choose-us',
      type: SECTION_TYPES.WHY_CHOOSE_US,
      enabled: true,
      order: 6,
      title: 'Why Choose StyleHub?',
      theme: 'light',
      config: {
        features: [
          {
            icon: 'truck',
            title: 'Free Shipping',
            description: 'On orders over $50',
          },
          {
            icon: 'rotate-ccw',
            title: 'Easy Returns',
            description: '30-day return policy',
          },
          {
            icon: 'shield',
            title: 'Authentic',
            description: '100% genuine products',
          },
          {
            icon: 'headphones',
            title: 'Style Support',
            description: 'Expert fashion advice',
          },
        ],
      },
    },
    {
      id: 'newsletter',
      type: SECTION_TYPES.NEWSLETTER,
      enabled: true,
      order: 7,
      title: 'Get Style Tips & Exclusive Offers',
      subtitle: 'Subscribe to our newsletter',
      theme: 'dark',
      config: {
        placeholder: 'your@email.com',
        buttonText: 'Subscribe',
      },
    },
  ],
};

/**
 * Electronics Store Configuration
 * 
 * Example configuration for an electronics retailer.
 */
export const electronicsStoreConfig: StoreConfig = {
  storeName: 'TechHub Electronics',
  logo: '/logos/techhub.png',
  description: 'Latest technology and gadgets',
  primaryColor: '#3b82f6', // Blue
  secondaryColor: '#06b6d4', // Cyan
  heroTitle: 'Welcome to TechHub',
  heroSubtitle: 'Find the latest gadgets and tech',
  heroImage: '/hero-electronics.jpg',
  ctaText: 'Explore Now',
  ctaLink: '/products',
  homepageSections: [
    {
      id: 'hero',
      type: SECTION_TYPES.HERO,
      enabled: true,
      order: 1,
      title: 'Latest Tech Innovations',
      subtitle: 'Discover cutting-edge technology',
      theme: 'primary',
      config: {
        imageUrl: '/hero-electronics.jpg',
        ctaText: 'Shop Tech',
        ctaLink: '/products',
        height: 'large',
      },
    },
    {
      id: 'flash-sale',
      type: SECTION_TYPES.FLASH_SALE,
      enabled: true,
      order: 2,
      title: 'Flash Deal - Tech Gadgets',
      subtitle: 'Limited time - Save up to 40%',
      theme: 'primary',
      config: {
        displayLimit: 6,
        discountThreshold: 15,
      },
    },
    {
      id: 'categories',
      type: SECTION_TYPES.CATEGORIES,
      enabled: true,
      order: 3,
      title: 'Shop by Category',
      theme: 'light',
      config: {
        displayLimit: 6,
        showIcons: true,
      },
    },
    {
      id: 'bestsellers',
      type: SECTION_TYPES.BESTSELLERS,
      enabled: true,
      order: 4,
      title: 'Best Selling Gadgets',
      subtitle: 'Trusted by thousands of customers',
      theme: 'light',
      config: {
        displayLimit: 8,
      },
    },
    {
      id: 'featured-products',
      type: SECTION_TYPES.FEATURED,
      enabled: true,
      order: 5,
      title: 'Featured Tech',
      subtitle: 'Our top recommendations',
      theme: 'light',
      config: {
        displayLimit: 8,
      },
    },
    {
      id: 'why-choose-us',
      type: SECTION_TYPES.WHY_CHOOSE_US,
      enabled: true,
      order: 6,
      title: 'Why TechHub?',
      theme: 'light',
      config: {
        features: [
          {
            icon: 'shield',
            title: 'Authentic Products',
            description: 'Official warranty included',
          },
          {
            icon: 'truck',
            title: 'Fast Delivery',
            description: 'Next-day delivery available',
          },
          {
            icon: 'zap',
            title: 'Tech Support',
            description: '24/7 technical assistance',
          },
          {
            icon: 'rotate-ccw',
            title: 'Easy Returns',
            description: '60-day return guarantee',
          },
        ],
      },
    },
    {
      id: 'newsletter',
      type: SECTION_TYPES.NEWSLETTER,
      enabled: true,
      order: 7,
      title: 'Stay Updated with Latest Tech',
      subtitle: 'Get exclusive deals on new gadgets',
      theme: 'dark',
      config: {
        placeholder: 'your@email.com',
        buttonText: 'Get Updates',
      },
    },
  ],
};

/**
 * Furniture Store Configuration
 * 
 * Example configuration for a furniture retailer.
 */
export const furnitureStoreConfig: StoreConfig = {
  storeName: 'HomeComfort Furniture',
  logo: '/logos/homecomfort.png',
  description: 'Quality furniture for your home',
  primaryColor: '#8b6914', // Brown
  secondaryColor: '#d4a574', // Tan
  heroTitle: 'Welcome to HomeComfort',
  heroSubtitle: 'Create your perfect space',
  heroImage: '/hero-furniture.jpg',
  ctaText: 'Browse Furniture',
  ctaLink: '/products',
  homepageSections: [
    {
      id: 'hero',
      type: SECTION_TYPES.HERO,
      enabled: true,
      order: 1,
      title: 'Transform Your Space',
      subtitle: 'Quality furniture for every room',
      theme: 'primary',
      config: {
        imageUrl: '/hero-furniture.jpg',
        ctaText: 'Start Shopping',
        ctaLink: '/products',
        height: 'large',
      },
    },
    {
      id: 'categories',
      type: SECTION_TYPES.CATEGORIES,
      enabled: true,
      order: 2,
      title: 'Shop by Room',
      theme: 'light',
      config: {
        displayLimit: 8,
        showIcons: true,
      },
    },
    {
      id: 'featured-products',
      type: SECTION_TYPES.FEATURED,
      enabled: true,
      order: 3,
      title: 'Featured Furniture',
      subtitle: 'Curated collections',
      theme: 'light',
      config: {
        displayLimit: 8,
      },
    },
    {
      id: 'bestsellers',
      type: SECTION_TYPES.BESTSELLERS,
      enabled: true,
      order: 4,
      title: 'Customer Favorites',
      subtitle: 'Best-selling pieces',
      theme: 'light',
      config: {
        displayLimit: 8,
      },
    },
    {
      id: 'promo-banner',
      type: SECTION_TYPES.PROMO_BANNER,
      enabled: true,
      order: 5,
      title: 'Spring Collection',
      subtitle: 'New designs now available',
      theme: 'secondary',
      config: {
        backgroundColor: '#d4a574',
        link: '/spring-collection',
      },
    },
    {
      id: 'why-choose-us',
      type: SECTION_TYPES.WHY_CHOOSE_US,
      enabled: true,
      order: 6,
      title: 'Why HomeComfort?',
      theme: 'light',
      config: {
        features: [
          {
            icon: 'truck',
            title: 'Free Delivery',
            description: 'On orders over $100',
          },
          {
            icon: 'target',
            title: 'Expert Design',
            description: 'Free design consultation',
          },
          {
            icon: 'rotate-ccw',
            title: 'Try at Home',
            description: '14-day trial period',
          },
          {
            icon: 'heart',
            title: 'Quality Guarantee',
            description: '5-year warranty',
          },
        ],
      },
    },
    {
      id: 'newsletter',
      type: SECTION_TYPES.NEWSLETTER,
      enabled: true,
      order: 7,
      title: 'Inspirational Home Ideas',
      subtitle: 'Get design tips and exclusive offers',
      theme: 'dark',
      config: {
        placeholder: 'your@email.com',
        buttonText: 'Subscribe',
      },
    },
  ],
};

/**
 * How to Use Multiple Configurations
 * 
 * Option 1: Domain-based selection (recommended)
 * - Use middleware to detect domain
 * - Load appropriate config based on domain
 * 
 * Option 2: Subdomain-based
 * - fashion.mystore.com → Fashion config
 * - electronics.mystore.com → Electronics config
 * 
 * Option 3: URL parameter
 * - mystore.com?store=fashion
 * - mystore.com?store=electronics
 * 
 * Example middleware (Next.js):
 * 
 * ```typescript
 * // middleware.ts
 * import { NextRequest, NextResponse } from 'next/server';
 * 
 * export function middleware(request: NextRequest) {
 *   const domain = request.headers.get('host')?.split(':')[0];
 *   
 *   if (domain?.startsWith('fashion')) {
 *     request.headers.set('x-store-config', 'fashion');
 *   } else if (domain?.startsWith('electronics')) {
 *     request.headers.set('x-store-config', 'electronics');
 *   }
 *   
 *   return NextResponse.next();
 * }
 * ```
 */
