

# Gilded Streets v2 — Fintech Tables + Platform Revamp

This is a large implementation covering database schema, edge functions, new pages, and UI enhancements. I'll break it into digestible implementation steps.

## Current State
- The `creator` enum value was added to `app_role` in the last migration
- No fintech tables exist yet (wallets, ledger_entries, withdrawals)
- Products/orders lack `creator_id`, `approved`, `payment_reference` columns
- No wallet trigger on user creation
- Checkout writes orders directly with no real payment
- Hero/homepage is functional but basic
- Admin panel has products, orders, users, categories, drops, blog — no fintech oversight

---

## Step 1: Database Migration — Fintech Tables

Create all fintech infrastructure in one migration:

- **New enums**: `ledger_type`, `ledger_status`, `withdrawal_status`
- **New tables**: `wallets`, `ledger_entries`, `withdrawals` with full RLS
- **Alter products**: add `creator_id` (uuid, nullable) + `approved` (boolean, default true)
- **Alter orders**: add `payment_reference` (text) + `creator_id` (uuid)
- **Update `handle_new_user()`** trigger to also insert a wallet row
- **RLS**: wallets/ledger read-only for users (own) and admins (all); withdrawals insertable by users, updatable by admins; creators can insert/update own products
- **Indexes** on user_id, order_id, status columns

## Step 2: Pesapal Edge Functions

Two edge functions:

**`pesapal-checkout`**
- Accepts `{ order_id }`, validates session + ownership
- Creates pending ledger entry with idempotency key
- Calls Pesapal `SubmitOrderRequest` API
- Returns redirect URL

**`pesapal-ipn`**
- Public endpoint for Pesapal callbacks
- Verifies payment via `GetTransactionStatus`
- On success: updates order to `paid`, ledger to `completed`, credits creator wallet (90%), platform wallet (10%), creates fee ledger entry

Secrets needed: `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_API_URL`

## Step 3: Wallet System (Hooks + UI)

**`use-wallet.ts`** hook — fetch wallet balance, ledger history, submit withdrawal

**`/wallet` page** with:
- Balance card (KES formatted)
- Transaction history table from ledger_entries
- Deposit button (triggers Pesapal deposit flow)
- Withdraw button (creators only — inserts withdrawal request)

**Profile page** — add Wallet tab alongside Orders and Wishlist

## Step 4: Creator System

- **Signup page**: add phone number field (saved to profiles)
- **Admin Users page**: add "Promote to Creator" button per user
- **Creator Dashboard** (`/creator/dashboard`): product management + earnings view
- **Creator Storefront** (`/creator/:id`): public page showing creator profile + their products
- Products created by creators have `approved = false` until admin approves

## Step 5: Checkout Rewrite

Replace current direct-order flow with:
- **Option A**: Pay with wallet balance (if sufficient) — calls edge function to deduct + distribute
- **Option B**: Pay via Pesapal — redirects to payment gateway
- Both options create proper ledger entries with 90/10 split
- Remove M-Pesa placeholder text

## Step 6: Admin Fintech Pages

- **`/admin/wallets`**: Platform wallet balance, all user wallets overview
- **`/admin/ledger`**: Filterable ledger explorer (user, type, status, date range)
- **`/admin/withdrawals`**: Approve/reject queue with admin notes
- **Admin Users**: Show roles, add promote/demote creator actions
- **Dashboard KPIs**: Platform balance, total fees, pending withdrawals, active creators

## Step 7: Homepage & UI Enhancements

- **Hero section**: Update tagline to "Not Merch. Uniform." with "ENTER THE DROP" CTA
- **Story section**: Scroll-based parallax section (Garvey, Selassie, Sankara narrative)
- **Product cards**: Add hover glow/tilt micro-interactions
- **Search + filters**: Instant debounced search, filter by category/size/price range on products page
- **Limited drop counter**: "Only X left" urgency badge on product detail

## Step 8: Navigation & Routes

New routes added to `App.tsx`:
```text
/wallet              — Wallet dashboard
/creator/:id         — Public creator storefront
/creator/dashboard   — Creator product + earnings panel
/admin/wallets       — Admin wallet overview
/admin/ledger        — Admin ledger explorer
/admin/withdrawals   — Admin withdrawal management
```

StoreNavbar: Add "Wallet" link for authenticated users
AdminLayout sidebar: Add Wallets, Ledger, Withdrawals links

---

## Technical Details

- All balance mutations are server-side only (edge functions with service role key)
- Idempotency keys on every ledger entry prevent double-spending
- Pesapal IPN is verified server-side before any wallet credit
- Creator products default to `approved = false` — only visible after admin approval
- The `handle_new_user()` trigger ensures every user gets a wallet automatically
- Types file will auto-regenerate after migration

## Implementation Order

Steps 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8, built incrementally. Step 1 (migration) must land first since everything depends on it. Steps 3-6 can partially overlap but will be done sequentially for clarity.

