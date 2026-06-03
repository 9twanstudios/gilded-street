# LDX v1.2 — Creator Economy Full Build

Decisions locked: **flat 90/10 for all tiers**, **soft onboarding** (skippable + banner), **single `sitemap.xml`**, **placeholder copy** on new marketing pages.

Executed in 6 parallel batches. One DB migration up front; code lands afterwards.

---

## Batch A — Database (single migration)

New tables: `creator_applications`, `audit_logs`.
New columns on `profiles`: `username citext UNIQUE`, `display_name`, `bio`, `location_city`, `cover_url`, `social jsonb DEFAULT '{}'`, `interests text[] DEFAULT '{}'`, `style_tags text[] DEFAULT '{}'`, `pronouns`, `birthday date`, `onboarding_step text`, `onboarding_completed_at timestamptz`, `suspended_at timestamptz`.
New column on `creators`: `creator_tier text DEFAULT 'rising'` (rising|verified|elite, **commission unchanged at 90/10**).
RLS: profiles update-own preserved; `creator_applications` insert-own + admin-read/update; `audit_logs` admin-read, insert via RPC only.
Trigger: on `creator_applications.status='approved'` → upsert `creators` row + `user_roles(creator)`.
Trigger: snapshot trigger on `products`/`drops`/`blog_posts`/`stories`/`seo_clusters`/`seo_locations` → upsert `seo_pages`.
RPC: `log_admin_action(action text, target_type text, target_id uuid, meta jsonb)`.
GRANTs on all new tables per platform rules.

## Batch B — Profile rebuild + social embedding

- Migration columns above.
- `src/components/profile/AvatarUpload.tsx`, `SocialLinks.tsx`, `InterestPicker.tsx`, `CoverUpload.tsx`.
- Storage: reuse `product-images` bucket under `profiles/{uid}/avatar.*` and `profiles/{uid}/cover.*`.
- Rebuild `ProfilePage.tsx` as tabbed shell: Overview / Edit / Orders / Wishlist / Wallet / Referrals / Security.
- Reuse `SocialLinks` in `CreatorStorefront` and `StoreFooter`.

## Batch C — Roles, onboarding, creator lifecycle

- Routes: `/onboarding/welcome`, `/onboarding/creator`, soft `OnboardingBanner` shown sitewide until `onboarding_completed_at`. No hard guard.
- Creator application form writes to `creator_applications`.
- `AdminUsers` upgraded: role chips, promote/demote/suspend (audited via `log_admin_action`).
- New `AdminCreatorApplications.tsx`: approve/reject queue.
- `use-auth.tsx` exposes `profile` (with onboarding state) alongside roles.

## Batch D — Admin Control Panel refactor

- Replace `AdminLayout.tsx` flat nav with grouped shadcn sidebar:
  Overview · Catalog · Commerce · Finance · Growth · SEO · System (collapsible, icon-mini mode).
- Shared primitives: `DataTable`, `PageHeader`, `StatTile`, `FilterBar`, `EmptyState` under `src/components/admin/`.
- Migrate `AdminProducts`, `AdminOrders`, `AdminUsers`, `AdminLedger`, `AdminWithdrawals`, `AdminCampaigns`, `AdminSegments` to the shared primitives (remove duplicated table/loading/empty markup).
- New pages: `AdminReviews`, `AdminNotifyRequests`, `AdminCommissions`, `AdminReferrals`, `AdminAuditLog`, `AdminAutomations`, `AdminCreatorApplications`.
- Header: global search (cmd-K), env badge, notification feed (joins `seo_alerts` + pending `withdrawals` + `notify_requests`).

## Batch E — SEO hardening (single sitemap)

- Per-route `<SEO>` audit across all 12 store routes; add `productLd`, `articleLd`, `breadcrumbsLd`, new `personLd` (creator) and `itemListLd` (drops/clusters).
- `index.html` cleanup: drop duplicate canonical, keep Org JSON-LD + Google verification meta.
- `robots.txt`: keep single `User-agent: *` block, add `Disallow: /account`, `/checkout`, `/auth/`, keep `/admin`, keep `Sitemap: https://91fitz.com/sitemap.xml`.
- Keep `scripts/generate-sitemap.ts` as single `public/sitemap.xml`; wire `predev` + `prebuild` in `package.json`; add `lastmod` from `updated_at`.
- DB snapshot trigger (Batch A) keeps `seo_pages` live; `AdminSeoContent` already reads it.
- Run `seo_chat--list_findings` after build, mark fixed where applicable.

## Batch F — Codebase index, error handling, automation

**Dedup**:
- Canonical routes: `/account/profile`, `/account/wallet`, `/auth/sign-in`, `/shop`, `/blog/:slug`. The others stay as `<Navigate replace>` redirects.
- `src/lib/format.ts` — single `formatKES` / `formatPrice` (re-exported from `use-products`, `use-wallet` for back-compat).
- `src/lib/queries.ts` — shared filter builders for `use-products` / `use-drops`.
- Attribution-merge consolidated in `src/lib/attribution.ts`.

**Missing marketing pages (placeholder copy)**: `/about`, `/contact`, `/shipping`, `/returns`, `/privacy`, `/terms`, `/faq`, `/sizing`, `/track-order`, `/creators` (creator directory from `creators where verified`), `/sitemap` (HTML index).

**Error handling**:
- `src/components/ErrorBoundary.tsx` wrapping `<Routes>`.
- `ServerError.tsx`, upgraded `NotFound.tsx` with related products/drops.
- `useApiError` hook → toast + `events` log.
- Edge functions `pesapal-ipn`, `gsc-sync`, `wallet-pay`: structured try/catch → write `seo_alerts` / `audit_logs` instead of silent swallow.

**Automation layer** (cron via pg_cron, toggled by `platform_settings`):
- `gsc-sync` daily
- `low-stock-alert` daily
- `drop-reminder` hourly
- `abandoned-cart` every 2h
- `commission-settlement` nightly
`AdminAutomations` exposes toggles + last-run timestamps.

---

## Execution order

1. **Migration** (Batch A) — must approve first; types regen after.
2. After approval, the following ship in parallel: B (profile), C (onboarding/roles), D (ACP refactor), E (SEO), F (dedup/errors/automation).

## Out of scope

LLM-referral scraping, realtime ACP presence, mobile app shell, multi-currency, payouts UX redesign, Stripe.

Approve the plan and I'll fire the migration first, then ship all five code batches in parallel.
