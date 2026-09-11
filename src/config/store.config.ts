/**
 * Mock Store Configuration
 * 
 * This is a placeholder configuration that would eventually come from a database.
 * Each business can have different configurations without changing the frontend code.
 * 
 * Examples of different stores using the same codebase:
 * - Electronics store
 * - Fashion store
 * - Furniture store
 * - Supermarket
 * - Pharmacy
 * - Decoration store
 */

import { SECTION_TYPES, StoreConfig } from '@/types/homepage';

export const storeConfig: StoreConfig = {
  // Store Information
  storeName: 'Favvy Closet',
  logo: '/logo.png',
  description: 'Your one-stop shop for quality products',
  
  // Branding
  primaryColor: '#3b82f6', // Blue
  secondaryColor: '#10b981', // Green
  
  // Hero Section
  heroTitle: 'Welcome to CTools Store',
  heroSubtitle: 'Discover amazing products at unbeatable prices',
  heroImage: '/hero-banner.jpg',
  ctaText: 'Shop Now',
  ctaLink: '/products',
  
  // Homepage Sections Configuration
  homepageSections: [
    {
      id: 'hero',
      type: SECTION_TYPES.HERO,
      enabled: true,
      order: 1,
      title: 'Welcome to CTools Store',
      subtitle: 'Discover amazing products at unbeatable prices',
      theme: 'primary',
      config: {
        imageUrl: '/hero-banner.jpg',
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
      id: 'flash-sale',
      type: SECTION_TYPES.FLASH_SALE,
      enabled: true,
      order: 3,
      title: 'Flash Sale',
      subtitle: 'Limited time offers - Up to 50% off',
      theme: 'primary',
      config: {
        displayLimit: 6,
        productSource: 'discounted',
        discountThreshold: 20,
      },
    },
    {
      id: 'featured-products',
      type: SECTION_TYPES.FEATURED,
      enabled: true,
      order: 4,
      title: 'Featured Products',
      subtitle: 'Handpicked items just for you',
      theme: 'light',
      config: {
        displayLimit: 8,
        productSource: 'featured',
      },
    },
    {
      id: 'bestsellers',
      type: SECTION_TYPES.BESTSELLERS,
      enabled: true,
      order: 5,
      title: 'Best Sellers',
      subtitle: 'Customer favorites',
      theme: 'light',
      config: {
        displayLimit: 8,
        productSource: 'bestsellers',
      },
    },
    {
      id: 'new-arrivals',
      type: SECTION_TYPES.NEW_ARRIVALS,
      enabled: true,
      order: 6,
      title: 'New Arrivals',
      subtitle: 'Fresh products added this week',
      theme: 'light',
      config: {
        displayLimit: 8,
        productSource: 'new',
      },
    },
    {
      id: 'promo-banner',
      type: SECTION_TYPES.PROMO_BANNER,
      enabled: true,
      order: 7,
      title: 'Special Mega Tools Promotion',
      subtitle: 'Upgrade your workshop with professional-grade machinery and precision power tools at up to 50% off.',
      theme: 'primary',
      config: {
        badgeText: 'LIMITED TIME DEAL',
        promoCode: 'CTOOLS50',
        discountTag: 'SAVE 50%',
        buttonText: 'Shop Promotion Now',
        buttonLink: '/products',
        gradientFrom: '#0f172a',
        gradientTo: '#1e293b',
        textColor: '#ffffff',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
      },
    },
    {
      id: 'why-choose-us',
      type: SECTION_TYPES.WHY_CHOOSE_US,
      enabled: true,
      order: 8,
      title: 'Why Choose Us?',
      theme: 'light',
      config: {
        features: [
          {
            icon: 'truck',
            title: 'Free Shipping',
            description: 'On orders over $50',
          },
          {
            icon: 'shield',
            title: 'Secure Payment',
            description: '100% secure transactions',
          },
          {
            icon: 'headphones',
            title: '24/7 Support',
            description: 'We are here to help',
          },
          {
            icon: 'rotate-ccw',
            title: 'Easy Returns',
            description: '30-day return policy',
          },
        ],
      },
    },
    {
      id: 'newsletter',
      type: SECTION_TYPES.NEWSLETTER,
      enabled: true,
      order: 9,
      title: 'Subscribe to Our Newsletter',
      subtitle: 'Get exclusive deals and updates',
      theme: 'dark',
      config: {
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
      },
    },
  ],
};
