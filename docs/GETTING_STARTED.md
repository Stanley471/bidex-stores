# CTools Commerce - Getting Started

## Overview

This project now includes four connected layers:

1. A configurable homepage system
2. A reusable product system
3. A commerce-ready cart foundation
4. A checkout and order engine for purchase flows

You can use these layers independently or together.

## Run the app

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the experience.

## How the homepage works

The homepage is assembled from enabled sections in src/config/store.config.ts. The renderer in src/lib/sectionRenderer.tsx maps each section type to a UI component.

To change the homepage layout:

- enable or disable a section in the config
- change its order
- customize its config object

Example:

```ts
{
  id: 'promo-banner',
  type: SECTION_TYPES.PROMO_BANNER,
  enabled: false,
  order: 7,
}
```

## How the product system works

The product system is built around a strongly typed model in src/types/product.ts.

Key pieces:

- ProductCard for reusable product display
- ProductGrid for configurable catalog layouts
- mock products and helper functions in src/lib/mockProducts.ts
- product pages in src/app/products and src/app/products/[slug]

You can add a product card anywhere by importing ProductCard or by using the existing ProductGrid.

## How the cart system works

The cart is separated into UI, state, and services:

- CartProvider exposes cart state and actions globally
- cartService contains the business logic for add/remove/update/clear operations
- cartStorage handles local persistence safely
- cart UI components live under src/components/cart

Cart actions are available through the useCart hook.

## How the checkout and order system works

The checkout experience is built around a typed draft and validation layer:

- CheckoutProvider manages address, shipping, payment, and confirmation step state
- checkoutService validates the draft and creates an order object
- shippingMethods and paymentMethods provide reusable configuration-driven options
- /checkout renders the purchase flow and /orders surfaces recent order activity

The implementation is intentionally modular so payment providers, shipping integrations, inventory checks, and admin order management can be added without rewriting the page experience.

## Common tasks

### Add a product to the cart

Use the AddToCartButton component from src/components/cart/AddToCartButton.tsx.

### Open the cart drawer

The cart drawer is mounted in the app layout and can be opened from the header button.

### Extend the product model

If you add inventory, variants, reviews, or discounts later, extend src/types/product.ts and keep the UI components consuming that shared model.

### Extend the cart model

If you later add coupons, taxes, shipping, or guest/user carts, extend src/types/cart.ts and keep the UI components using the provider and service layer.

## Where to edit next

- src/config/store.config.ts for homepage layout
- src/lib/mockProducts.ts for product data
- src/types/product.ts for product shape changes
- src/types/cart.ts for cart shape changes
- src/components/cart for new cart UI
- src/services/cart.service.ts for business logic changes
3. **Add renderer** → Update `src/lib/sectionRenderer.tsx`
4. **Add config** → Add to `store.config.ts`

That's it! The homepage will automatically support the new section.

---

## Key Design Principles

✅ **Separation of Concerns** - UI components are separate from configuration
✅ **Reusability** - Sections work with any store configuration
✅ **Scalability** - Easy to add new section types
✅ **Configurability** - Change homepage without code changes
✅ **Future-Proof** - Built to support admin dashboard later

---

## Next Steps

1. **Review the code**
   - Check `src/app/page.tsx` - see how sections are rendered
   - Check `src/config/store.config.ts` - see section configuration
   - Check `src/components/home/*.tsx` - see section implementations

2. **Try it out**
   - Run `npm run dev`
   - View the homepage
   - Try disabling a section in `store.config.ts`
   - See the homepage update

3. **Customize for your business**
   - Update store info in `store.config.ts`
   - Enable/disable sections
   - Reorder sections
   - Customize section settings

4. **Plan for admin dashboard**
   - Create API endpoints using the utilities in `src/lib/sectionRenderer.tsx`
   - Build admin UI to manage sections
   - Connect to database to persist configuration

---

## Questions?

Check these files for more details:

- **Architecture Overview** → `HOMEPAGE_ARCHITECTURE.md`
- **Type Definitions** → `src/types/homepage.ts`
- **Admin Examples** → `src/lib/adminApiExamples.ts`
- **Multi-Business Examples** → `src/config/examples.config.ts`
