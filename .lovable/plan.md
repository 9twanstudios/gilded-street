

# 91 Fitz Full Revamp — Implementation Plan

## Important Constraint
This project runs on **React 18 + Vite + Tailwind + Supabase** (not Next.js). Lovable does not support Next.js/App Router. All features from your blueprint will be implemented within the existing stack, which already covers ~70% of what you described.

## What Already Exists (no rebuild needed)
- Dark mode with gold/black theme, Bebas Neue + Inter fonts
- Product pages with JSON-LD structured data, OG tags, breadcrumbs
- Shop page with search, filters (category, size, price range, sort)
- Cart system (DB-backed), wishlist, reviews/ratings
- Checkout with Pesapal integration + wallet payments
- Blog with slugs, tags, related products
- Limited drops with countdown timers
- Admin dashboard (products, orders, users, blog, drops, categories, wallets, ledger, withdrawals)
- WhatsApp ordering, mobile-responsive layout
- Framer Motion animations on cards and page transitions

## What Needs Building/Upgrading

### 1. Hero Section Upgrade
- Replace static image hero with video loop background (Nairobi street aesthetic)
- Update tagline: "BUILT IN KENYA, WORN WORLDWIDE"
- CTA button: "ENTER THE DROP" linking to /products
- Add neon green accent color alongside gold

### 2. Product Card Enhancements
- Add hover zoom with 3D tilt effect (CSS perspective transform)
- "Quick Add" button overlay on hover (select size + add to cart without leaving grid)
- Quick View modal (product preview without navigation)
- Confetti animation on add-to-cart (canvas-confetti library)

### 3. Size Guide Modal
- Reusable modal component with East African fit notes
- Size chart table (S/M/L/XL/XXL with cm measurements)
- Link from product detail page

### 4. "Notify Me" for Out-of-Stock
- New `notify_requests` table (email, product_id, notified boolean)
- Email input form shown when product is OOS
- Admin visibility in dashboard

### 5. Shipping Calculator
- Kenya county-based shipping rates (47 counties)
- "Nairobi Same-Day" badge on eligible products
- Integrated into checkout page

### 6. Newsletter Signup
- Email capture component on homepage footer
- Store in Supabase `newsletter_subscribers` table
- "Join the Movement" CTA

### 7. Social Feed Section
- Instagram/TikTok embed section on homepage
- Static grid of social media posts with links (no API needed initially)

### 8. Sticky Navbar + Bottom Mobile Nav
- Make navbar sticky (already done) + add search icon in navbar
- Bottom mobile navigation bar (Home, Shop, Cart, Profile) for mobile viewport

### 9. Mini Cart Drawer Improvements
- One-click checkout from cart drawer
- Quantity adjustment inline
- "Saved for later" section

### 10. SEO Hardening
- Update meta titles with Kenya-focused keywords ("91 Fitz Nairobi streetwear", "premium hoodies Kenya")
- Add LocalBusiness + Review structured data
- Update sitemap.xml with all product/blog slugs (generated at build or fetched client-side)
- Proper image alt tags throughout
- Update canonical URLs to 91fitz.com domain

### 11. Infinite Scroll on Shop Page
- Replace current full-load with paginated infinite scroll using intersection observer
- Load 12 products at a time

### 12. Admin Enhancements
- Bulk CSV import for products
- Sales graph using Recharts on dashboard
- Low stock alerts, top products widget

## Database Migration Required
- New table: `newsletter_subscribers` (email, created_at)
- New table: `notify_requests` (email, product_id, notified, created_at)

## New Dependencies
- `canvas-confetti` — add-to-cart celebration
- `recharts` — admin sales graphs (may already be installed)

## Implementation Order
1. Hero upgrade + bottom mobile nav + sticky search
2. Product card hover effects + Quick Add + Quick View modal
3. Size guide modal + confetti on add-to-cart
4. Notify Me (DB migration + UI)
5. Newsletter signup (DB migration + UI)
6. Shipping calculator (county-based)
7. Social feed section
8. Infinite scroll on shop page
9. SEO hardening (meta, structured data, sitemap)
10. Admin enhancements (CSV import, Recharts graphs)

## Technical Details
- All new components follow existing patterns: shadcn primitives, Framer Motion, Tailwind utility classes
- Database changes via migration tool with RLS policies
- No backend framework change — stays React + Vite + Supabase
- Cart remains DB-backed with React Context provider

