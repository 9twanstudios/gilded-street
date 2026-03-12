

# 91Fitz Backend Setup + Admin Auth + Production Polish

## Overview

Set up the full Supabase backend (tables, auth, RLS), restrict admin panel to `9twanstudios@gmail.com`, replace mock data with real DB queries, and polish for Vercel deployment.

## Database Schema (Migration)

Create these tables in a single migration:

```text
profiles (id uuid PK → auth.users, full_name, email, phone, avatar_url, created_at)
user_roles (id uuid PK, user_id → auth.users, role app_role enum [admin, user], unique(user_id, role))
products (id uuid PK, name, description, price int, original_price int?, image, category, badge text?, sizes text[], in_stock bool default true, created_at, updated_at)
orders (id uuid PK, user_id → auth.users, status order_status enum, total int, shipping_address, phone, created_at)
order_items (id uuid PK, order_id → orders, product_id → products, quantity int, size text, price_at_time int)
cart_items (id uuid PK, user_id → auth.users, product_id → products, quantity int, size text, created_at)
```

Plus:
- `has_role()` security definer function (per system instructions)
- Trigger to auto-create profile on signup
- RLS policies on all tables
- Seed mock products into products table
- Insert admin role for `9twanstudios@gmail.com` (after they sign up)

## Auth Implementation

1. **Auth pages**: Create `/login` and `/signup` pages with email/password, matching gold/black theme
2. **Password reset**: `/forgot-password` and `/reset-password` pages
3. **Auth context hook**: `useAuth` hook with `onAuthStateChange` listener
4. **Protected routes**: Wrap admin routes with auth check + role check via `has_role()`
5. **Store navbar**: Show login/logout based on auth state, link to profile

## Admin Access Control

- `AdminLayout` checks auth state and queries `user_roles` for admin role
- Non-admin users redirected to store homepage
- Admin role assigned to `9twanstudios@gmail.com` via DB function that runs on signup trigger (checks email match)

## Replace Mock Data with Supabase Queries

- **HomePage / ProductsPage / ProductDetailPage**: Fetch from `products` table using `@tanstack/react-query`
- **Cart**: Logged-in users persist cart to `cart_items` table; guests use local state (existing hook)
- **Checkout**: Create order + order_items in DB, clear cart
- **Admin Dashboard**: Query real counts from products, orders, profiles
- **Admin Products**: CRUD with Supabase (add/edit/delete modals)
- **Admin Orders**: Real orders from DB with status update capability
- **Admin Users**: Query profiles table

## File Changes Summary

| Area | Files |
|------|-------|
| Migration | 1 SQL migration (tables, enums, functions, RLS, seed) |
| Auth | `src/hooks/use-auth.tsx`, `src/pages/auth/LoginPage.tsx`, `src/pages/auth/SignupPage.tsx`, `src/pages/auth/ForgotPasswordPage.tsx`, `src/pages/auth/ResetPasswordPage.tsx` |
| Protected routes | `src/components/admin/AdminGuard.tsx` |
| Data hooks | `src/hooks/use-products.ts`, `src/hooks/use-orders.ts`, `src/hooks/use-admin.ts` |
| Updated pages | All store pages + all admin pages to use real data |
| Updated components | `StoreNavbar.tsx` (auth state), `AdminLayout.tsx` (guard), `App.tsx` (new routes) |
| Config | `vercel.json` already configured |

## Technical Details

- Enums: `app_role` (admin, user), `order_status` (pending, processing, shipped, delivered, cancelled)
- RLS: Products readable by all, writable by admin. Orders/cart readable by owner, writable by owner. Profiles readable by owner, admin can read all. User_roles managed via security definer function only.
- Auto-assign admin: Trigger function checks if new user email = `9twanstudios@gmail.com` and inserts admin role
- All prices stored as integers (KES cents-free, whole shillings)

