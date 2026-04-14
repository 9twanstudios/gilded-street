

# 91 Fitz — Drop-First Cultural Streetwear Platform Revamp

## Overview
Transform the existing e-commerce store into a drop-centric, storytelling-first cultural platform. The core shift: drops become the primary navigation unit (not products), and a new Story system adds SEO-driven cultural content pages.

## What Already Exists (kept as-is)
- Full product system with Supabase (CRUD, filters, search, infinite scroll)
- Cart, checkout (Pesapal + wallet), wishlist, reviews
- Drops system with countdown timers, listing + detail pages
- Admin panel with products, orders, users, blog, drops, wallets, ledger
- Dark gold/black theme, Bebas Neue + Inter fonts, Framer Motion animations
- Hero with video background, sticky navbar, mobile bottom nav
- Blog, newsletter, notify-me, shipping calculator, size guide

## What Needs Building

### 1. Story Pages System (New)
**Database**: New `stories` table with columns: `id`, `title`, `slug`, `content` (rich text/markdown), `figure_name`, `figure_image`, `era`, `relevance` (connection to African identity/street culture), `related_drop_id`, `related_product_ids`, `cover_image`, `published`, `created_at`, `updated_at`. RLS: public read for published, admin full CRUD.

**Pages**:
- `/stories` — Grid of cultural story cards (figure image, title, era)
- `/stories/:slug` — Full story page with hero image, structured biography, cultural relevance section, linked drop/products CTA

**Admin**: Add Stories CRUD page at `/admin/stories`

**SEO**: Each story page gets JSON-LD Article schema, Kenya-focused meta tags

### 2. Drop Detail Page Upgrade
Transform `/drops/:slug` from a basic listing into a campaign landing page:
- Full-bleed cover image hero with drop title overlay and cultural tagline
- "Story behind this drop" narrative section with parallax scroll effect
- Featured cultural icons section (links to related stories)
- Product lineup grid with "Shop Drop" CTA per product
- Countdown timer (if upcoming) or "Live Now" badge
- "Buy Full Drop" bundle CTA

### 3. Homepage Restructure
Reorder homepage sections to be drop-first:
1. Hero — latest active drop as hero (cover image, title, "Shop Drop" + "View Story" CTAs)
2. Countdown banner for next upcoming drop
3. Featured collections preview (3 most recent drops as cards)
4. Cultural story teaser (latest story with read more link)
5. Social feed section
6. Newsletter signup
7. Ecosystem section

### 4. Shop Page — Drop Filter
Add "Drop" as a filter dimension on `/products` page:
- Fetch drops list, show as filter chips alongside category/size/price
- When a drop is selected, filter products to those in that drop's `product_ids`
- Add availability filter (In Stock / Out of Stock)

### 5. Cart Page (New Standalone)
Currently cart is only a sidebar drawer. Add `/cart` as a dedicated page:
- Full item list with quantity editing, size display, remove button
- Subtotal calculation
- "Proceed to Checkout" button
- "Continue Shopping" link

### 6. Account Page Enhancement
Rename `/profile` route to also be accessible at `/account`. Add order history tab improvements with status badges.

### 7. LionByte Event Tracking Hooks (Placeholder)
Create `src/lib/tracking.ts` with a `track()` function that currently logs to console but is structured for future LionByte integration:
```
track('product_view', { productId, dropId })
track('add_to_cart', { productId, size, price })
track('checkout_started', { orderId, total })
track('purchase_completed', { orderId, total, items })
track('drop_view', { dropId, slug })
track('story_view', { storyId, slug })
```
Integrate calls at: ProductDetailPage (view), addItem in cart hook, CheckoutPage (started + completed), DropDetailPage (view), StoryPage (view).

### 8. Navigation Updates
- Add "Stories" link to navbar between "Drops" and "Blog"
- Update nav labels: "Shop" stays at `/products`, add "Drops" and "Stories"
- Add `/cart` route to App.tsx
- Add `/account` as alias for `/profile`
- Add `/stories` and `/stories/:slug` routes
- Add `/admin/stories` route

### 9. Drop Detail — "Story Behind This Piece" on Products
On ProductDetailPage, if the product belongs to a drop, show a "Story Behind This Piece" section that links to the drop's description and any related story page.

## Database Migration Required
- New table: `stories` (title, slug, content, figure_name, figure_image, era, relevance, related_drop_id, related_product_ids, cover_image, published, created_at, updated_at)
- RLS: Anyone can SELECT where published=true, admins full access

## New Files
- `src/hooks/use-stories.ts` — CRUD hooks for stories table
- `src/pages/store/StoriesPage.tsx` — Stories listing
- `src/pages/store/StoryDetailPage.tsx` — Individual story page
- `src/pages/store/CartPage.tsx` — Standalone cart page
- `src/pages/admin/AdminStories.tsx` — Admin stories management
- `src/components/admin/StoryFormDialog.tsx` — Story create/edit dialog
- `src/lib/tracking.ts` — LionByte-ready event tracking placeholders

## Modified Files
- `src/App.tsx` — New routes (/stories, /stories/:slug, /cart, /account, /admin/stories)
- `src/pages/store/HomePage.tsx` — Restructured sections, drop-first hero
- `src/pages/store/DropDetailPage.tsx` — Campaign landing page upgrade
- `src/pages/store/ProductDetailPage.tsx` — "Story behind this piece" section
- `src/pages/store/ProductsPage.tsx` — Add drop filter
- `src/components/store/StoreNavbar.tsx` — Add Stories nav link
- `src/layouts/AdminLayout.tsx` — Add Stories sidebar link
- `src/hooks/use-cart.tsx` — Add tracking call on addItem
- `src/pages/store/CheckoutPage.tsx` — Add tracking calls

## Implementation Order
1. Database migration (stories table)
2. Tracking utility (`src/lib/tracking.ts`)
3. Stories hooks + pages (listing, detail, admin CRUD)
4. Drop detail page upgrade (campaign layout)
5. Homepage restructure (drop-first)
6. Shop page drop filter
7. Cart standalone page
8. Navigation + route updates
9. Integrate tracking calls across pages

