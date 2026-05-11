# LDX v14 — Final Audit Status

## Delivered
- 3-way revenue split (creator / platform / growth pool) live in `pesapal-ipn`.
- Referral system: `/r/:code`, signup attribution, `referrals` RLS, invite tab, growth-pool bounty payout.
- Attribution pipeline: `src/lib/attribution.ts` captures utm/ref/qr → `orders.attribution` → copied into `commissions.attribution` by IPN.
- UPAL seam: `src/lib/upal/{types,pesapal,index}.ts` — checkout now uses `getProvider("pesapal")`.
- Admin pages:
  - `/admin/marketing` — funnel + virality KPIs.
  - `/admin/analytics` — DAU, ARPU, conversion %, virality K, growth score, 30-day funnel chart, revenue-by-source.
  - `/admin/campaigns` — A/B variant comparison with promote-winner action.
  - `/admin/segments` — saved audience filters + CSV export.
  - `/admin/settings` — 3-way split + referral bounty.
- Edge function `og-image` — branded SVG share cards (1200×630), 24h CDN cache.
- DB: `commissions.attribution`, `audience_segments` table, indexes on `events(event_type, created_at)` and `orders((attribution->>'qr_slug'))`.
- Admin user `9twanstudios@gmail.com` (`f7239863-4bfd-4997-bcca-ef8d5544886d`) — confirmed `admin` role.

## Deferred (out of scope, flagged)
- Email/SMS sending (segments support CSV export only).
- Second payment provider implementation (UPAL interface ready).
- Push notifications.
- Materialized views for analytics (compute in queries; revisit at scale).
- Cohort retention heatmap (KPIs cover virality; defer until needed).

## Pre-existing linter warnings (not introduced)
- Permissive RLS on `storage.objects` for `product-images` (intentional public bucket).
- `SECURITY DEFINER` functions exposed (`has_role`, `handle_new_user`, etc.) — required for trigger logic.
