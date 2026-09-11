# CTools Commerce Architecture

## Overview

CTools Commerce is built as a layered experience:

- Homepage layer for storefront layout
- Product layer for catalog browsing and detail views
- Commerce layer for cart behavior and future checkout flows

This separation keeps UI components reusable and makes it easier to swap the data source later.

## Layered structure

```text
src/
├── app/
│   ├── page.tsx
│   ├── products/page.tsx
│   └── products/[slug]/page.tsx
├── components/
│   ├── home/
│   ├── products/
│   └── cart/
├── context/
│   └── CartProvider.tsx
├── hooks/
│   └── useCart.ts
├── lib/
│   ├── sectionRenderer.tsx
│   ├── mockProducts.ts
│   └── cart/
├── services/
│   └── cart.service.ts
├── types/
│   ├── homepage.ts
│   ├── product.ts
│   └── cart.ts
└── config/
    ├── store.config.ts
    └── examples.config.ts
```

## Homepage system

The homepage is configuration-driven. Each section in store.config.ts is rendered through SectionRenderer. This allows store owners to change layout and section visibility without changing the frontend structure.

## Product system

The product system uses a shared Product model and a reusable UI layer:

- ProductCard renders individual products with optional actions
- ProductGrid renders a configurable collection of product cards
- product data is mocked in src/lib/mockProducts.ts but can be replaced by a database or API later
- product detail pages use the same product model as the catalog

## Cart foundation

The cart is built around a provider-based state model:

- CartProvider keeps cart state app-wide without prop drilling
- cartService holds the business logic for add, remove, update, and clear actions
- cartStorage stores the cart in localStorage for refresh persistence
- CartDrawer, CartItem, CartSummary, and EmptyCart create a reusable cart UI shell

## Checkout and order layer

The new commerce layer extends the storefront beyond the cart:

- CheckoutProvider manages the current checkout step and form state
- checkoutService validates the draft order before submission
- checkout rules ensure address, shipping method, payment method, and cart integrity are all valid
- order-related types and helpers support order numbering, statuses, and future payment/inventory integrations
- /checkout exposes the multi-step flow and /orders provides a starter order history experience

## Why this architecture works

- UI stays small and focused
- business logic is isolated in services and helpers
- product and cart data can be replaced with APIs later without rewriting components
- the same design can support checkout, orders, promotions, inventory validation, and user accounts in the future

## Future expansion path

The next steps are straightforward:

1. connect products to a real API or database
2. add inventory validation and stock checking
3. add checkout and order flows
4. add coupons, shipping, and tax rules
5. support authenticated carts and order history
