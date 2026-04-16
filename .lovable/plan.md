

# 91 Fitz — Production Hardening Plan

## Reality Check
The codebase already has ~80% of what your prompt describes: auth + roles, products with `creator_id` + `approved` field, orders, Pesapal payments, 90/10 commission via ledger, admin dashboard, creator dashboard, cart, checkout, dark gold theme. A full rebuild would destroy working infrastructure.

What's actually missing are specific **gaps** that make it feel like a demo:

## Gap Analysis

| Feature | Current State | Fix Needed |
|---------|--------------|------------|
| Signup role selection | Generic signup, no buyer/creator choice | Add role picker on signup |
| Creator profile | Just a `profiles` row | New `creators` table (brand_name, bio, verified) |
| Product approval UI | `approved` boolean exists, admin has no approve/reject buttons | Add status enum + admin approval workflow |
| Creator upload flow | Creators CAN insert products (RLS exists) but no UI | Add product upload form to creator dashboard |
| Commissions tracking | Spread across ledger_entries | New `commissions` table per order |
| Platform fee config | Hardcoded 10% in edge function | Admin-configurable `platform_settings` table |
| Skeleton loaders | Some pages have spinners, not skeletons | Add skeleton components to key pages |
| Empty states | Basic "no data" text | Proper illustrated empty states |

## Implementation Plan

### 1. Database Migrations

**New `creators` table:**
- `id`, `user_id` (FK profiles), `brand_name`, `bio`, `logo_url`, `verified` (boolean), `created_at`
- RLS: owner can read/update own, public can read verified, admin full access

**New `commissions` table:**
- `id`, `order_id`, `creator_id`, `order_total`, `platform_fee`, `creator_earnings`, `created_at`
- RLS: admin can read all, creator can read own

**New `platform_settings` table:**
- `key` (text, primary), `value` (text)
- Seed with `commission_rate` = `10`
- RLS: public read, admin update

**Alter `products`:**
- Add `status` column (enum: `pending`, `approved`, `rejected`) replacing the `approved` boolean
- Migration converts existing `approved=true` to `status='approved'`

### 2. Signup with Role Selection
- Add "I'm a Buyer" / "I'm a Creator" toggle on signup page
- If creator selected: also capture `brand_name`
- On signup: insert into `user_roles` + `creators` table via a trigger or post-signup flow

### 3. Creator Dashboard — Product Upload
- Add "Upload Product" button to creator dashboard
- Reuse existing `ProductFormDialog` adapted for creators (no category_id required, auto-sets `creator_id`, status defaults to `pending`)
- Show product status badges: pending (yellow), approved (green), rejected (red)

### 4. Admin Product Approval Workflow
- Add "Pending Approval" tab/filter to admin products page
- Each pending product shows Approve / Reject buttons
- On approve: set `status = 'approved'`
- On reject: set `status = 'rejected'`

### 5. Commission Recording
- When order is paid (via Pesapal IPN or wallet-pay edge function):
  - Read `commission_rate` from `platform_settings`
  - Insert row into `commissions` table
  - Existing ledger entries continue as-is for wallet balance tracking
- Admin dashboard shows commission totals from new table

### 6. Admin Commission Settings
- New section in admin dashboard or settings page
- Slider/input to set platform commission % (1-50%)
- Writes to `platform_settings` table

### 7. UI Polish
- Skeleton loaders for: product grid, admin tables, profile page
- Empty states with icons + CTAs for: no products, no orders, empty cart, empty wishlist
- Toast notifications already exist (sonner) — ensure all mutations have feedback

### 8. Creator Storefront Enhancement
- Pull `brand_name`, `bio`, `logo_url` from `creators` table instead of just profiles
- Show "Verified Creator" badge if `verified = true`

## Files Changed/Created

**New files:**
- `src/components/store/SkeletonProductGrid.tsx`
- `src/components/store/EmptyState.tsx`

**Modified files:**
- `src/pages/auth/SignupPage.tsx` — role selection
- `src/pages/store/CreatorDashboard.tsx` — product upload, status badges
- `src/pages/admin/AdminProducts.tsx` — approval workflow
- `src/pages/admin/AdminDashboard.tsx` — commission stats
- `src/components/admin/ProductFormDialog.tsx` — creator mode
- `src/pages/store/CreatorStorefront.tsx` — enhanced profile
- `src/hooks/use-products.ts` — filter by status
- `src/integrations/supabase/types.ts` — auto-updated after migration
- Edge functions (`wallet-pay`, `pesapal-ipn`) — commission recording

## Implementation Order
1. Database migrations (creators, commissions, platform_settings, products status)
2. Signup role selection + creator onboarding
3. Creator dashboard product upload
4. Admin approval workflow
5. Commission recording in edge functions
6. Admin commission settings
7. UI polish (skeletons, empty states, storefront)

## Technical Notes
- No framework change — stays React + Vite + Supabase
- `approved` boolean migrated to `status` enum with backward compatibility
- Existing RLS patterns preserved (has_role function)
- Edge functions updated to read commission rate from DB instead of hardcoded value

