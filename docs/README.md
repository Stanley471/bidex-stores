# CTools Commerce

CTools Commerce is a configurable storefront foundation built with Next.js, TypeScript, and Tailwind. It combines a section-based homepage system with a reusable product and cart engine that can grow into a full ecommerce platform.

## What is included

- Configurable homepage sections driven by store configuration
- Reusable product model, card, and grid components
- Product listing and product details pages
- A commerce-ready cart engine with provider, service layer, and local persistence
- A new checkout and order experience with address, shipping, payment, and confirmation steps
- An orders overview page for recent purchases and future order management

## Main architecture

- Homepage composition lives in src/app/page.tsx and the section renderer in src/lib/sectionRenderer.tsx
- Product experience lives in src/components/products, src/lib/mockProducts.ts, and src/app/products
- Cart foundation lives in src/context/CartProvider.tsx, src/services/cart.service.ts, src/lib/cart, and src/components/cart
- Checkout and order domain lives in src/context/CheckoutProvider.tsx, src/services/checkout.service.ts, src/types/checkout.ts, src/types/order.ts, and the checkout/order UI under src/components

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Key routes

- / for the homepage
- /products for the catalog page
- /products/[slug] for product details
- /checkout for the multi-step checkout experience
- /orders for the order history experience

## Documentation

- GETTING_STARTED.md for day-to-day usage
- HOMEPAGE_ARCHITECTURE.md for the architecture overview
- PROJECT_SUMMARY.md for a feature summary
- ADMIN_DASHBOARD_CHECKLIST.md for the next roadmap items
- README_IMPLEMENTATION.md for implementation details
