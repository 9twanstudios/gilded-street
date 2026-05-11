
# LDX v14 — Closing Audit Plan

## Audit snapshot (verified live)

Already shipped & live:
- Admin `9twanstudios@gmail.com` (`f7239863-4bfd-4997-bcca-ef8d5544886d`) → `admin` role confirmed.
- `platform_settings`: `commission_rate=10`, `growth_pool_rate=0`, `referral_bounty=10000` (KES cents).
- 3-way split inside `pesapal-ipn` (creator / platform / growth_pool), `commissions.growth_pool_share`, immutable ledger.
- Referral system: `/r/:code`, signup attribution, `referrals` table + RLS, invite tab, bounty payout from growth pool on first paid order, `referral.attributed.v1` event.
- `AdminMarketing` funnel hub (scans → views → carts → orders, virality coefficient).
- Admin audit log via `events.admin.action.v1`; AdminLogin + AdminGuard hardened.

Still missing vs LDX v14:
1. Attribution payload (utm / ref / qr) is captured in events but **not propagated into `orders.attribution`** → revenue-by-source impossible.
2. QR `qr_campaigns.variant` exists but no **A/B comparison UI** (CTR / CVR / RPM by variant).
3. `AdminAnalytics` still raw counts → no **funnel %, cohort retention, ARPU, growth score**.
4. No **audience segments** surface.
5. No **dynamic OG image** edge function (share cards static).
6. No **UPAL provider interface** — Pesapal logic still tightly coupled in IPN/checkout (single-provider risk).
7. RLS sweep + linter pass on new tables (`referrals`, `events`, `commissions.growth_pool_share`).

---

## Plan (single pass, 6 work units)

### 1. Attribution pipeline (frontend + DB)
- New `src/lib/attribution.ts`: read `utm_*`, `ref` cookie, `qr` slug from URL → persist in `localStorage` (30d).
- `useCart` / Checkout: attach current attribution to `orders.attribution` jsonb on insert.
- `pesapal-ipn`: copy `orders.attribution` into the `commissions` row (new `attribution` column).
- Migration: add `commissions.attribution jsonb default '{}'`, index `events(event_type, created_at)`, index `orders ((attribution->>'qr_slug'))`.

### 2. A/B campaign comparison
- `AdminCampaigns.tsx` (new) at `/admin/campaigns`:
  - Group `qr_campaigns` by `variant_of` (parent) → list variants A/B side-by-side.
  - Per variant: scans, unique sessions, product views (joined via `events` where attribution.qr_slug matches), add-to-cart, completed orders, revenue, CTR / CVR / RPM.
  - "Promote winner" action: deactivates loser, logs `qr.promoted` admin event.
- Sidebar nav entry + audit log on every mutation.

### 3. Analytics rebuild
- `AdminAnalytics.tsx` rewrite: KPI tiles (DAU, ARPU, conversion %, virality K, growth score = K × ARPU × retention).
- 30-day funnel chart (recharts) + revenue-by-source stacked bar (qr / referral / direct / utm).
- Cohort retention table (signup week × week N retained), computed client-side from `events.session.v1` + `orders`.
- No materialized views for v1 — compute in TanStack queries against existing tables (volume currently fits).

### 4. Audience segments (lightweight)
- `AdminSegments.tsx` at `/admin/segments`: builder for saved filters over `profiles + orders + events` (e.g. "Nairobi buyers last 30d", "Referrers with ≥1 conversion").
- New table `audience_segments(id, name, filter jsonb, created_by, created_at)` + admin-only RLS.
- Export CSV button (no email/SMS sender — flagged out of scope).

### 5. OG image edge function
- New edge function `og-image` (Deno + `@vercel/og` via esm.sh): renders 1200×630 PNG for `?type=product|drop|story|cluster&id=…` using brand tokens (gold/black, Bebas Neue substitute).
- `SEO.tsx`: when `ogImage` prop missing, default to `/functions/v1/og-image?...`.
- Cache via `Cache-Control: public, max-age=86400`.

### 6. UPAL interface + hardening
- `src/lib/upal/types.ts`: `PaymentProvider` interface (`createCheckout`, `verifyIpn`, `extractRef`).
- `src/lib/upal/pesapal.ts`: wraps existing edge calls (no behavior change, just a seam for future providers).
- Run `supabase--linter`; fix any new warnings on `referrals`, `commissions`, `audience_segments`.
- Update `.lovable/plan.md` with final delivered/deferred status.

---

## DB migrations (2)

1. `commissions.attribution jsonb default '{}'`; indexes on `events(event_type, created_at)` and `orders((attribution->>'qr_slug'))`.
2. `audience_segments` table + admin-only RLS (`select/insert/update/delete` gated by `has_role(auth.uid(),'admin')`).

## Routes added
```text
/admin/campaigns   — A/B variant comparison
/admin/segments    — audience builder
```

## Edge functions added
```text
supabase/functions/og-image/   — dynamic share cards
```

## Out of scope (flagged)
- Email / SMS sending infrastructure (segments export only).
- Second payment provider implementation (interface only).
- Push notifications.
- Materialized views — deferred until analytics volume requires it.

## Open questions
1. **OG image runtime** — OK to add `@vercel/og` (cold start ~1.5s, cached 24h)? Or skip OG and ship the other 5 units?
2. **Segments scope** — is CSV export sufficient for now, or do you want a "trigger campaign" hook even if it's just a stub?
3. **UPAL refactor depth** — interface-only seam (safe, no behavior change) or also move IPN settlement into a new `upal-settle` edge function (bigger change, single source of truth)?
