# 9TwanFitz — System Audit Report & Phase 0 Remediation

## 1. Project Health Report

### Working (complete systems)
- Commerce core: shop, PDP, cart, checkout, Pesapal + wallet pay, orders, drops, stories, blog
- Auth + roles (user/creator/admin), creator applications, referrals, wallets/ledger (90/10)
- Admin CP: 30+ pages (products, orders, finance, growth, SEO, audit log, IG embeds)
- SEO infra: SEO component, JSON-LD builders, sitemap generator, cluster/location pages
- FitCheck v1: 2D paper-doll canvas, save/share/like, community wall, PDP carousels
- IG embeds: curated feed + admin curation (6 active embeds in DB)

### Partial
- **FitCheck content readiness: 0%** — all 4 products are missing `fit_slot` AND `fit_image`; the palette works but garments render as raw product photos. 0 fits saved so far.
- SEO coverage: 14 pages missing `<SEO>` — including the highest-traffic ones: `/`, `/shop`, `/products/:slug`, `/blog`, `/drops` (the SEO component exists but isn't mounted there)
- Loading/error states: loading states exist on ~half the store pages; **error states are ignored on all 14 `useQuery` consumers**
- IG embeds robustness: no fallback when the Instagram script is blocked/fails; fragile 200ms timeout race; no skeleton-to-content transition
- Supabase types: ~10 tables missing from `types.ts` → **100 `as any` casts** across hooks/pages

### Missing (required, not implemented)
- Digital Garment Registry (DGR codes, masks, multi-view assets, readiness tracking)
- AI model rendering / composite engine
- Outfit presets, garment controls (tuck/oversize), environment engine
- FitCheck Studio shell (model/body/style/env panels)
- FitCheck analytics events + ops dashboard
- Code splitting (zero `React.lazy` — all 60+ pages ship in one bundle)

## 2. Route Audit Matrix (highlights)

63 of 64 page files registered; full matrix verified.
- **Dead**: `src/pages/Index.tsx` — never imported (delete)
- **Stale nav links**: Navbar/Footer/MobileNav link to legacy paths (`/products`, `/profile`, `/wallet`, `/login`) — every click pays a redirect hop
- **Shadow risk**: `/creator/dashboard` declared after `/creator/:id` (works by score, fragile)
- **Error isolation**: single root ErrorBoundary — one page crash kills the whole app

## 3. Technical Debt (ranked)

**Critical**
1. No code splitting; `html2canvas` (~200KB) eagerly bundled for every visitor
2. MannequinCanvas fixed 360×640px → horizontal overflow on 320px phones
3. `<SEO>` missing on `/`, `/shop`, `/products/:slug`, `/blog`, `/drops`

**High**
4. 100 `as any` casts — root cause: `fits`, `fit_likes`, `ig_embeds`, `qr_campaigns`, `qr_scans`, `audit_logs`, `events`, `seo_clusters/locations` missing from generated types (types regenerate on next migration; casts then removable)
5. All error states silently swallowed; FitCheck save failures invisible to user
6. IG embed: no failure fallback, no caching, no skeleton
7. 3 duplicate `formatPrice` implementations; `src/lib/data.ts` is ~170 lines of dead mock data

**Medium**
8. Dead code: `NavLink.tsx`, `ShippingCalculator.tsx`, `use-events.ts` (zero imports)
9. A11y: icon buttons missing `aria-label` (Remix btn uses `title`), meaningful images with `alt=""`, ModelToggle missing `role="group"`, heading skips (h1→h3)
10. `text-green-400` used as ad-hoc "success" color in 6+ files — no `--success` token

**Low**
11. Only 1 `loading="lazy"` image sitewide; admin table overflow risk

## 4. Security Review (scanner findings)
- **Error**: `user_roles` published to Realtime with no channel policy — any signed-in user can subscribe to live role grants
- **Warn**: creators can create products but can't upload to `product-images` (admin-only storage INSERT policy)
- **Warn**: leaked-password protection disabled; public bucket allows listing; SECURITY DEFINER functions publicly executable; permissive RLS expressions
- FitCheck covers upload to the public `product-images` bucket under `fits/` — should move to a dedicated `fits` bucket with owner-scoped policies (V2 batch)

## 5. LDX Compliance
- Product-first: ✅ mostly — remove dead mock data/components; `/admin` breadth is justified by ops
- Every FitCheck feature maps to discovery → visualization → commerce ✅
- Gap: no analytics on the FitCheck funnel (opens → saves → cart adds → purchases)

---

# Phase 0 — Remediation (what implementing THIS plan does)

Frontend-only fixes, no DB migration, no regressions to working flows:

1. **Code splitting**: convert all admin routes + FitCheck/Fits + auth pages to `React.lazy` with Suspense fallback; per-layout ErrorBoundaries (store / admin); dynamic-import `html2canvas` inside `render-card.ts`
2. **SEO**: mount `<SEO>` + JSON-LD on HomePage, ProductsPage, ProductDetailPage (Product schema + breadcrumbs), DropsPage/DropDetail, Blog list/post (Article schema), Stories; `noindex` on cart/checkout/wallet/dashboard
3. **Error & loading states**: shared `<QueryBoundary>` pattern (skeleton on load, retry card on error) applied to the 14 store-page queries; toast on FitCheck save failure
4. **IG embeds hardening**: skeleton while loading, script-failure detection with a branded fallback card (caption + "View on Instagram" link), processed-state caching so re-mounts don't re-race
5. **Mobile**: MannequinCanvas responsive (`max-w-full` + aspect-ratio scaling, items positioned in % so saved fits stay valid); `overflow-x-hidden` guard on FitCheck page; `loading="lazy"` on grid/list images
6. **A11y**: aria-labels on icon buttons, real `alt` text, `role="group"` on ModelToggle, heading-order fixes
7. **Cleanup**: delete `Index.tsx`, `NavLink.tsx`, `ShippingCalculator.tsx`, `use-events.ts`, `lib/data.ts`; unify on `formatKES` from `lib/format.ts`; fix stale nav links to canonical routes; reorder `/creator/dashboard` route; add `--success` token and replace `text-green-400`

## Roadmap — V2 batches after Phase 0 (each gets its own plan)
- **Batch B — DGR**: migration (`dgr_code`, `views jsonb`, `mask_url`, `fit_status`, dedicated `fits` storage bucket + policies), auto-code trigger (DGR-TEE-0001…), admin FitCheck Ops dashboard with readiness %, bulk asset pipeline edge function (transparent garment extraction via Lovable AI image editing, with admin review queue). Migrations here also regenerate types → kill the 100 `as any` casts.
- **Batch C — Studio shell**: rebuild `/fitcheck` into panel-based Studio (Model/Body/Style/Environment/Garment controls, presets, saved/recent looks) on top of the existing canvas + `use-fits`.
- **Batch D — AI composite renderer**: edge function generating photoreal model (body type × environment) via Lovable AI, compositing DGR garment assets with masks; outfit presets; share cards.
- **Batch E — Discovery + analytics**: `/fits` trending/staff-picks/shoppable sections, FitCheck funnel events + admin analytics, security fixes (realtime policy, storage policies, leaked-password protection).

## Technical notes
- Phase 0 touches ~30 files, all frontend; no schema changes, so `types.ts` cleanup waits for Batch B's migration.
- Saved-fit JSON stays backward compatible: canvas scaling converts px offsets to percentages on load.
- Security scanner errors (user_roles realtime) need a migration — scheduled for Batch E, or earlier on request.