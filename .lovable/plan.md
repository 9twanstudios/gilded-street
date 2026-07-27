
# LDX v1.3 — Content Unification, Catalog Expansion & Creator Uploads

## 1. Merge Stories + Blog (with seeded content)

- New unified route `/journal` with type filter tabs: All · Stories · Articles · Drop Notes.
- Add `post_type` column to `blog_posts` (`article` | `story` | `drop_note`); migrate every `stories` row into `blog_posts` with `post_type='story'` (preserve figure_name/era/relevance via `meta jsonb`).
- Redirects: `/stories` → `/journal?type=story`, `/stories/:slug` → `/journal/:slug`, `/blog` → `/journal`, `/blog/:slug` → `/journal/:slug`.
- Admin: single `AdminJournal` page replaces AdminBlog + AdminStories.
- Seed 8 posts (2 articles, 3 stories, 3 drop notes) with generated cover images tied to the new catalog.

## 2. Stub FitCheck (hide from public)

- Remove `FITCHECK` link from `StoreNavbar` + `MobileBottomNav` + `StoreFooter`.
- Remove `/fitcheck`, `/fits`, `/fits/:id` from `public/sitemap.xml` and `scripts/generate-sitemap.ts`.
- Routes stay live for admins/direct link; add a small "beta" banner on the Studio page.
- No DB or edge function changes.

## 3. Catalog expansion — +20 pieces

Per user: **10 female · 6 male · 4 unisex accessories (silver chains + rings)**.

Female (10): Uhuru Crop Tee, Sankofa Mesh Top, Nairobi Nights Slip Dress, Rebel Femme Corset Tee, Freedom Wrap Skirt, Ankara Bomber (Fem), Warrior Queen Cargo Pant, Pan-Afri Tube Top, Uprising Denim Mini, Highlife Halter.

Male (6): Rebel Council Overshirt, Uprising Utility Vest, Kilifi Linen Set (top), Kilifi Linen Set (bottom), Mau Mau Souvenir Jacket, 91 Track Top.

Accessories (4): Sterling Byzantine Chain, Iced Cuban Link Chain, Signet Rebel Ring, Stacked Freedom Ring Set.

Pipeline: `imagegen` premium with locked 91Fitz prompt style → cutout PNG + catalog JPG → `lovable-assets create` → seed into `products` with correct `fit_slot`, `category_id`, `drop_type`, `gender`.

**Naming convention (guide):**
- `{slug}.jpg.asset.json` — catalog shot (1024×1024, charcoal bg)
- `{slug}.cutout.png.asset.json` — transparent FitCheck cutout
- slug format: `kebab-case-descriptive` (e.g. `sterling-byzantine-chain`)
- accessories use slot `accessory-neck` / `accessory-hand`

## 4. Drop categories & taxonomy

- New enum `drop_type`: `seasonal | capsule | collab | archive`.
- New column `drops.narrative`: `freedom | rebel | unity | ecosystem | general`.
- New column `products.drop_type` + `products.gender` (`male | female | unisex`).
- Seed 4 drop rows: "Freedom Season SS26", "Rebel Capsule 001", "Unity × Ecosystem Collab", "Archive Vault".
- Assign every existing + new product to a drop via `product_ids`.
- Add filter chips to `/drops` and `/shop` (by narrative + type + gender).

## 5. Remove redundancies (audit findings)

- Delete unused `stories` table + `AdminStories.tsx` + `StoriesPage.tsx` + `StoryDetailPage.tsx` + `StoryFormDialog.tsx` after migration.
- Fold `AdminBlog` and `AdminStories` into `AdminJournal`.
- Remove duplicate KES formatters (already unified in `lib/format.ts`) — sweep remaining `.toLocaleString()` calls.
- Drop dead `fits.mask_url` reference in seed migration (column still used, just unused in seeds).
- Consolidate `AdminFitCheck` under a single "Fits (beta)" nav group.

## 6. Creator economy — finish uploads

- `CreatorDashboard`: add "Upload product" flow using `ProductFormDialog` restricted fields (name, description, price, sizes, images, drop, gender, fit_slot).
- New storage bucket `creator-uploads` (public read) + RLS: creators write only to `{user_id}/*`; admins read all.
- New `products.status='pending'` gate + email/toast to admin queue (`AdminProducts` filter chip).
- Creator sees own products list with status badges (pending/approved/rejected) and reject reason.
- Auto-fill `creator_id` from session; `approved=false` until admin action.

## 7. Vercel live-data verification

Root cause the user is flagging via the screenshot: seeded rows exist in Supabase but the deployed site shows cached/broken cards.

- Verify `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` are set in Vercel env (not just `.env` locally).
- Force a redeploy after seed; add a small "Data freshness" indicator on Admin dashboard showing `products.updated_at` max.
- Fix broken image cards visible in screenshot: some `products.image` URLs point at asset paths that were never uploaded — the seed will re-check and use `.asset.json` URLs.
- Add `<link rel="preconnect">` to Supabase + CDN in `index.html`.

## Technical details

- Migrations (single file):
  - `ALTER TABLE blog_posts ADD COLUMN post_type text NOT NULL DEFAULT 'article', ADD COLUMN meta jsonb NOT NULL DEFAULT '{}'::jsonb;`
  - `INSERT INTO blog_posts (…) SELECT …, 'story', jsonb_build_object('figure_name',figure_name,'era',era,'relevance',relevance) FROM stories;`
  - `CREATE TYPE drop_type_t AS ENUM ('seasonal','capsule','collab','archive');`
  - `ALTER TABLE drops ADD COLUMN narrative text; ALTER TABLE products ADD COLUMN drop_type drop_type_t, ADD COLUMN gender text CHECK (gender IN ('male','female','unisex'));`
  - GRANTs preserved; RLS unchanged.
- Storage: `creator-uploads` bucket via `storage_create_bucket`; policies via migration.
- Sitemap regenerated to include `/journal`, journal slugs, drop filters.
- Redirects handled client-side in `App.tsx` via `<Navigate>` components.

## Out of scope (this pass)

- FitCheck AI improvements (module stubbed).
- Payment/wallet changes.
- New admin analytics beyond data-freshness tile.

## Rollout order

1. Migration (schema + drop enum + creator uploads bucket).
2. Image generation (20 pieces) → CDN upload → seed insert.
3. Journal unification + redirects + AdminJournal.
4. Nav/sitemap FitCheck stub.
5. Creator upload flow + admin approval queue.
6. Vercel env verify + redeploy prompt.
