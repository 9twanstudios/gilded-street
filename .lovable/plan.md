
# LDX v14 — System Audit & Upgrade Plan

## Audit: Current State vs LDX v14

### What already exists ✅
- **Hosting**: Vercel-ready (`vercel.json`, SPA rewrites)
- **Backend**: Supabase (Postgres + Auth + Storage `product-images`)
- **Payments**: Pesapal integrated (`pesapal-checkout`, `pesapal-ipn`, `wallet-pay`)
- **Fee split**: 90/10 creator/platform via `platform_settings.commission_rate` + `commissions` table
- **Ledger**: Immutable `ledger_entries` with idempotency keys
- **Wallets**: Per-user `wallets` table with admin views
- **Analytics**: `events` table + `tracking.ts` with burst limit
- **QR Campaigns**: `qr_campaigns` + `qr_scans` + branded QR generator
- **SEO**: Cluster + location pages, JSON-LD via `SEO.tsx`
- **Admin ACP**: Login, audit log, capabilities, RLS-locked tables
- **Drops, Stories, Blog, Reviews, Wishlist, Newsletter**: All present

### Gaps vs LDX v14 ❌
1. **No UPAL abstraction** — Pesapal logic is hardcoded in checkout/IPN; no provider plug-in surface
2. **Two-way split only** — missing Ecosystem Growth Pool (third bucket)
3. **No referral/virality system** — no invite codes, no referral rewards, no virality coefficient tracking
4. **No OG image generation** — share cards are static; no per-product/drop dynamic OG
5. **No A/B testing surface** — `qr_campaigns` has `variant` field but no funnel comparison UI
6. **No funnel/cohort analytics** — `AdminAnalytics` shows raw events, no conversion or retention math
7. **No campaign/segmentation system** — no targeted push, email queue, or audience segments
8. **No revenue attribution** — events log scans, but don't link scan → order → revenue
9. **Marketing engine scattered** — newsletter, QR, SEO live in silos, no unified dashboard

---

## Plan: Phased Upgrade

### Phase 1 — UPAL (Unified Payment Abstraction Layer)
**Goal**: Decouple payment provider from business logic; enable 3-way split.

- New module `src/lib/upal/` with `PaymentProvider` interface
- Refactor `pesapal-checkout` and `pesapal-ipn` to call shared `upal-settle` edge function
- New edge function `upal-settle`: takes `order_id` + `provider` + `external_ref`, runs canonical split + ledger writes (idempotent)
- DB migration: add `growth_pool_rate` to `platform_settings`; add `growth_pool` wallet (system-owned) + `commissions.growth_pool_share` column
- Admin Settings: 3 sliders (creator / platform / growth pool) summing to 100%

### Phase 2 — Growth & Referral Engine
**Goal**: Build virality into the product.

- DB migration: `referrals` table (`referrer_id`, `invitee_id`, `code`, `status`, `reward_amount`, `converted_order_id`)
- `profiles.referral_code` (auto-generated on signup via trigger)
- `/r/:code` route → sets cookie, attributes signup, fires `referral.attributed.v1`
- On first paid order: credit referrer wallet from growth pool (configurable bounty)
- Account page: "Invite & Earn" tab with code, share buttons (WhatsApp, X, copy link), branded share card

### Phase 3 — Marketing Engine
**Goal**: Unified `/admin/marketing` hub.

- New edge function `og-image` (Deno + satori or canvas) → renders branded OG cards for products, drops, stories, clusters
- `SEO.tsx` consumes `/functions/v1/og-image?type=product&id=…`
- New admin pages:
  - `AdminMarketing.tsx` — funnel overview (scans → views → carts → orders → revenue)
  - `AdminCampaigns.tsx` — extends QR campaigns with A/B variant comparison (CTR, CVR, RPM)
  - `AdminSegments.tsx` — saved audience filters (e.g. "Nairobi buyers last 30d")
- `tracking.ts`: add `attribution` payload (utm, ref code, qr campaign) propagated through cart → order

### Phase 4 — Analytics Feedback Loop
**Goal**: Make every decision measurable.

- DB views: `mv_funnel_daily`, `mv_cohort_retention`, `mv_revenue_attribution` (refreshed via cron edge function)
- `AdminAnalytics.tsx` rebuild: KPI tiles (DAU, ARPU, conversion, virality coefficient, growth score), cohort heatmap, revenue-by-source chart
- Compute & display Growth Score per LDX v14 formula

### Phase 5 — Hardening & Audit Closure
- RLS audit on new tables (referrals, growth_pool wallet)
- Backfill audit log entries for all admin mutations on new pages
- Update `vercel.json` headers, verify all new routes
- Final audit report: fixed / added / removed / production-ready / needs review

---

## Route Additions
```text
/r/:code                  — referral capture
/admin/marketing          — funnel hub
/admin/campaigns          — A/B + QR unified
/admin/segments           — audience builder
/account?tab=invite       — referral dashboard (existing page, new tab)
```

## Edge Functions
```text
supabase/functions/upal-settle/         — provider-agnostic settlement
supabase/functions/og-image/            — dynamic share cards
supabase/functions/analytics-rollup/    — nightly MV refresh
```

## DB Migrations (5 total)
1. `platform_settings`: add `growth_pool_rate`; create system `growth_pool` wallet
2. `commissions`: add `growth_pool_share` column
3. `referrals` table + `profiles.referral_code` + signup trigger
4. `events`: add `attribution` jsonb; index on `event_type`, `created_at`
5. Materialized views + refresh function

---

## Out of Scope (this patch)
- Email/SMS sending infra (placeholders only — flagged for future)
- Multi-provider payment plug-ins beyond Pesapal (interface only, no second provider)
- Push notifications (requires service worker rework)

---

## Open Questions
Before I implement, please confirm:

1. **Growth Pool destination** — should it accumulate in a system wallet (admin-withdrawable) or auto-fund referral bounties?
2. **Referral bounty model** — flat KES amount per converted invitee, or % of first order?
3. **OG image runtime** — OK to add `satori` + `resvg` to edge function (cold start ~1s), or prefer pre-rendered PNGs stored in Supabase Storage?
4. **A/B testing scope for v14** — QR campaign variants only, or also product page hero / CTA variants?
