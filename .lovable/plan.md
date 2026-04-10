

# Gilded Streets v2 — Full Fintech Marketplace Upgrade

## Scope
Transform the current e-commerce store into a fintech-powered marketplace with wallets, ledger, creator economy, and Pesapal payments. Keep the gold/black luxury theme.

## Current State
- Auth with user/admin roles, profiles table
- Products with slugs, categories, drops, blog
- Cart (DB-backed), checkout (writes order directly, no real payment)
- Admin dashboard (products, orders, users, categories, drops, blog)
- No wallets, no ledger, no creator role, no payment gateway

---

## Phase 1: Database Schema (Migration)

### New enum
- `app_role`: add `'creator'` value (currently `'admin' | 'user'`)
- New enum `ledger_type`: `deposit | purchase | payout | fee | refund`
- New enum `ledger_status`: `pending | completed | failed`
- New enum `withdrawal_status`: `pending | approved | rejected | completed`

### New tables

**`wallets`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid, unique, not null | One wallet per user |
| balance | integer, not null | KES (default 0) |
| currency | text | default 'KES' |
| created_at | timestamptz | |

**`ledger_entries`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid, not null | |
| type | ledger_type | deposit/purchase/payout/fee/refund |
| amount | integer, not null | Always positive |
| status | ledger_status | pending/completed/failed |
| reference | text | Pesapal orderTrackingId or internal ref |
| order_id | uuid, nullable | FK to orders |
| description | text | Human-readable note |
| idempotency_key | text, unique | Prevent duplicate transactions |
| created_at | timestamptz | |

**`withdrawals`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid, not null | |
| amount | integer, not null | |
| status | withdrawal_status | |
| admin_note | text | |
| created_at | timestamptz | |
| processed_at | timestamptz | |

### Altered tables

**`products`**: Add `creator_id` (uuid, nullable) — when set, this product belongs to a creator.

**`orders`**: Add `payment_reference` (text, nullable) for Pesapal tracking ID. Add `creator_id` (uuid, nullable) to track which creator's product was purchased.

### RLS Policies
- `wallets`: Users can SELECT own wallet. No direct INSERT/UPDATE from client (edge functions handle balance changes).
- `ledger_entries`: Users can SELECT own entries. Admin can SELECT all. No client writes.
- `withdrawals`: Users can INSERT (request) and SELECT own. Admin can SELECT all and UPDATE (approve/reject).
- `products` with `creator_id`: Creators can INSERT/UPDATE their own products.

### Trigger
- `handle_new_user()`: Also create a wallet row for every new user.

---

## Phase 2: Pesapal Edge Functions

### Edge Function: `pesapal-checkout`
1. Receive `{ order_id }` from frontend
2. Validate user session + order ownership
3. Create ledger entry (status=pending, idempotency_key)
4. Call Pesapal API to register order and get redirect URL
5. Return redirect URL to frontend

### Edge Function: `pesapal-ipn`
1. Receive IPN callback from Pesapal (public endpoint)
2. Verify payment status via Pesapal API (`GetTransactionStatus`)
3. If paid:
   - Update order status to `paid`
   - Update ledger entry to `completed`
   - Credit creator wallet (90%)
   - Credit platform wallet (10%)
   - Create fee ledger entry
4. If failed: mark ledger + order as failed

### Secrets needed
- `PESAPAL_CONSUMER_KEY`
- `PESAPAL_CONSUMER_SECRET`
- `PESAPAL_API_URL` (sandbox vs production)

---

## Phase 3: Creator System

### Signup flow
- Add phone field to signup form
- After signup, users are `user` role by default
- Admin can promote users to `creator` via admin panel

### Creator storefront
- `/creator/:id` — public page showing creator profile + their products
- Creators can access `/creator/dashboard` — simplified product management + earnings view

### Product listing by creators
- Creators can add products (with their `creator_id` auto-set)
- Admin approves creator products (add `approved` boolean to products, default false for creator listings)

---

## Phase 4: Wallet Dashboard & Checkout Rewrite

### Wallet page (`/wallet`)
- Balance display
- Transaction history (from ledger_entries)
- Deposit button (triggers Pesapal deposit flow)
- Withdraw button (for creators — submits withdrawal request)

### Checkout rewrite
- Option 1: Pay with wallet balance (if sufficient)
- Option 2: Pay via Pesapal (redirect flow)
- Purchase logic (via edge function):
  - Deduct from buyer wallet
  - `platform_fee = 10%`
  - `creator_amount = 90%`
  - Credit creator + platform wallets
  - Create 3 ledger entries (purchase, credit, fee)

### Profile page update
- Add "Wallet" tab showing balance + quick actions

---

## Phase 5: Admin Dashboard Enhancements

### New admin pages
- **Wallet Management** (`/admin/wallets`): Platform wallet balance, all wallets overview
- **Ledger Explorer** (`/admin/ledger`): Filter by user, type, status, date range
- **Withdrawals** (`/admin/withdrawals`): Approve/reject with notes
- **Creator Management**: Promote users to creator, view creator earnings

### Dashboard KPIs
- Platform wallet balance
- Total revenue (from fee ledger entries)
- Pending withdrawals count
- Active creators count

---

## Phase 6: Routes & Navigation

### New routes
```text
/wallet              — User wallet dashboard
/creator/:id         — Public creator storefront
/creator/dashboard   — Creator's product + earnings panel
/admin/wallets       — Admin wallet overview
/admin/ledger        — Admin ledger explorer
/admin/withdrawals   — Admin withdrawal management
```

### Navigation updates
- StoreNavbar: Add "Wallet" link (authenticated users)
- AdminLayout sidebar: Add Wallets, Ledger, Withdrawals links
- Profile tabs: Add Wallet tab

---

## Implementation Order

1. **Database migration** — All new tables, enums, altered columns, RLS, trigger update
2. **Pesapal edge functions** — checkout + IPN with secret configuration
3. **Wallet hooks + dashboard page** — `use-wallet.ts`, `/wallet` page
4. **Checkout rewrite** — Pesapal redirect + wallet pay options
5. **Creator system** — role promotion, product listing, storefront page
6. **Admin enhancements** — ledger explorer, withdrawal management, wallet overview
7. **Purchase distribution logic** — edge function for 90/10 split + ledger entries

## Security Notes
- All balance mutations happen server-side (edge functions only)
- Idempotency keys prevent double-spending
- Pesapal IPN verified server-side before crediting
- RLS prevents direct wallet/ledger writes from client

