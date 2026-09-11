# Admin Dashboard Implementation Checklist

## Overview

This checklist outlines how to build the admin dashboard and commerce features for the configurable storefront. The groundwork is already done; this guides the next phase of development.

## Recently added commerce foundation

The current codebase already includes:
- a multi-step checkout route at /checkout
- an order history route at /orders
- typed checkout and order models plus validation logic
- provider-based checkout state and service-layer order creation

These pieces are ready for the next phase: persisted order storage, payment-provider integration, inventory reservation, and admin order management.

---

## Phase 1: Database & Backend Setup

- [ ] **Create product catalog tables**
  - [ ] products
  - [ ] product_variants
  - [ ] inventory
  - [ ] reviews
  - [ ] discounts

- [ ] **Create cart and order tables**
  - [ ] carts
  - [ ] cart_items
  - [ ] orders
  - [ ] order_items

- [ ] **Create API endpoints for commerce**
  - [ ] `GET /api/products`
  - [ ] `GET /api/products/:slug`
  - [ ] `POST /api/cart`
  - [ ] `PATCH /api/cart/:itemId`
  - [ ] `DELETE /api/cart/:itemId`
  - [ ] `POST /api/checkout`

- [ ] **Create Store Configuration Table**
  ```sql
  CREATE TABLE store_configs (
    id UUID PRIMARY KEY,
    business_id UUID,
    config JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  );
  ```

- [ ] **Create Section Configuration Table**
  ```sql
  CREATE TABLE homepage_sections (
    id UUID PRIMARY KEY,
    store_config_id UUID,
    section_id VARCHAR,
    section_type VARCHAR,
    enabled BOOLEAN,
    order_index INTEGER,
    title VARCHAR,
    subtitle VARCHAR,
    theme VARCHAR,
    config JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  );
  ```

- [ ] **Create API Endpoints**
  - [ ] `GET /api/admin/store-config` - Get current config
  - [ ] `POST /api/admin/sections/toggle` - Enable/disable section
  - [ ] `POST /api/admin/sections/reorder` - Change order
  - [ ] `PATCH /api/admin/sections/:id` - Update section config
  - [ ] `POST /api/admin/sections/add` - Add new section
  - [ ] `DELETE /api/admin/sections/:id` - Remove section
  - [ ] `POST /api/admin/config/save` - Save entire config
  - [ ] `POST /api/admin/config/revert` - Revert to previous version

---

## Phase 2: Update Configuration Loading

- [ ] **Modify store.config.ts** to fetch from database instead of hardcoded data
  ```typescript
  export async function getStoreConfig(storeId: string): Promise<StoreConfig> {
    const response = await fetch(`/api/admin/store-config?storeId=${storeId}`);
    return response.json();
  }
  ```

  The current configuration flow remains the same: `store.config.ts` → `SectionRenderer` → homepage. The only change later is that the settings will be loaded from the database instead of the local config file.

- [ ] **Update page.tsx** to use async config
  ```typescript
  export default async function Home() {
    const config = await getStoreConfig(getStoreId());
    const enabledSections = getEnabledSections(config.homepageSections);
    // ...
  }
  ```

- [ ] **Add caching strategy**
  - Cache config in-memory with TTL
  - Invalidate cache on updates
  - Use Redis for distributed setups

---

## Phase 3: Admin UI Components

- [ ] **Commerce management views**
  - [ ] Product catalog editor
  - [ ] Inventory manager
  - [ ] Discount/promo editor
  - [ ] Cart analytics panel
  - [ ] Order management dashboard

- [ ] **Admin UI Components**

- [ ] **Sections List View**
  - Display all sections with toggle switches
  - Show enabled/disabled status
  - Show current order

- [ ] **Drag-Drop Reordering**
  - Use React-DnD or similar library
  - Visual feedback during drag
  - Save new order on drop

- [ ] **Section Editor Panel**
  - Edit section title/subtitle
  - Edit section-specific config
  - Toggle enable/disable
  - Delete/add sections

- [ ] **Store Settings Form**
  - Edit store name, logo, description
  - Edit primary/secondary colors
  - Edit hero section text
  - Edit CTA text and links

- [ ] **Preview Panel**
  - Live preview of current config
  - See how it looks on desktop/mobile
  - Real-time updates as you edit

- [ ] **Configuration History**
  - View previous versions
  - Rollback to previous config
  - See who made changes and when

---

## Phase 4: Section-Specific Editors

- [ ] **Hero Section Editor**
  - Upload/preview banner image
  - Edit title, subtitle, CTA text
  - Select height (small/medium/large)

- [ ] **Categories Editor**
  - Add/remove categories
  - Upload category icons
  - Set display limit

- [ ] **Flash Sale Editor**
  - Select which products to discount
  - Set discount percentage
  - Set sale end time
  - Upload banner

- [ ] **Product Section Editors**
  - Select which products to display
  - Set display limit
  - Choose product source (featured, bestsellers, etc.)

- [ ] **Why Choose Us Editor**
  - Add/edit features
  - Upload feature icons
  - Reorder features

- [ ] **Newsletter Editor**
  - Edit form placeholder text
  - Edit button text
  - Configure email destination

---

## Phase 5: Advanced Features

- [ ] **A/B Testing**
  - Create multiple section configurations
  - Serve different versions to different users
  - Track engagement metrics

- [ ] **Scheduling**
  - Schedule sections to enable/disable at specific times
  - Schedule seasonal layouts
  - Automatic rollback

- [ ] **Multi-Store Management**
  - Manage multiple businesses from one dashboard
  - Copy config between stores
  - Template library

- [ ] **Analytics Integration**
  - Track which sections get the most engagement
  - Track conversion rates per section
  - Recommend section order based on performance

- [ ] **Content Management**
  - Manage product collections
  - Bulk upload products
  - Category management

---

## Phase 6: Testing & Deployment

- [ ] **Unit Tests**
  - Test `toggleSection()` function
  - Test `reorderSections()` function
  - Test `updateSectionConfig()` function

- [ ] **Integration Tests**
  - Test API endpoints
  - Test config loading from database
  - Test config caching

- [ ] **E2E Tests**
  - Test admin dashboard workflows
  - Test homepage updates after config changes
  - Test multi-business switching

- [ ] **Performance Testing**
  - Measure config loading time
  - Measure homepage render time
  - Optimize if needed

- [ ] **Security**
  - Add role-based access control
  - Validate all API inputs
  - Audit configuration changes

---

## Implementation Order

**Recommended:** Phase 1 → Phase 2 → Phase 4 → Phase 3 → Phase 5 → Phase 6

This allows:
1. Backend setup first (fastest to develop)
2. Update loading logic (core functionality)
3. Quick section-specific editors (less complex)
4. Then build general UI (can now test against real data)
5. Add advanced features (polish)
6. Test everything (final quality assurance)

---

## Code References

**Utility Functions** (already implemented):
- `src/lib/sectionRenderer.tsx` - Has all manipulation functions

**Configuration Structure**:
- `src/types/homepage.ts` - All TypeScript types

**API Examples**:
- `src/lib/adminApiExamples.ts` - Shows how to use utilities

**Configuration Examples**:
- `src/config/examples.config.ts` - Multi-business examples

---

## Technology Recommendations

- **UI Framework**: React + TypeScript
- **Drag-Drop**: React Beautiful DnD or dnd-kit
- **Database**: PostgreSQL (JSONB support is ideal)
- **ORM**: Prisma or TypeORM
- **API**: Next.js API Routes or separate API server
- **Forms**: React Hook Form + Zod validation
- **Component Library**: shadcn/ui (already in your project)

---

## Key Success Metrics

✅ Admin can enable/disable any section in < 5 seconds
✅ Admin can reorder sections in < 10 seconds
✅ Admin can edit section settings without leaving the dashboard
✅ Changes are reflected on homepage in real-time
✅ All changes are persisted and survive page refresh

---

## Notes

- The core architecture is already built - this is just the admin interface
- All manipulation logic is in `src/lib/sectionRenderer.tsx`
- Configuration is stored in `src/config/store.config.ts`
- Mock data is in `src/lib/mockData.ts`
- Each section component is independent and reusable
- No changes needed to homepage components during admin development
