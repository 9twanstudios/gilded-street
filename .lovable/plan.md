
# LDX v1.3 — FitCheck, IG Embeds, PDP Carousel & Polish Pass

Three feature batches + one polish batch, executed in parallel after the migration lands.

---

## Batch A — DB migration (must run first)

New tables, all `public` schema with GRANTs + RLS:

- **`fits`** — `id`, `user_id`, `model` (`male`|`female`), `name`, `items jsonb` (array of `{product_id, slot, z, x, y, scale, rotation}`), `cover_image` (rendered PNG via html2canvas, uploaded to storage), `visibility` (`private`|`public`), `likes_count int default 0`, `featured bool default false`, `created_at`, `updated_at`.
  - RLS: owner full; `public=true` readable by anon; admins full.
- **`fit_likes`** — `id`, `fit_id`, `user_id`, unique `(fit_id, user_id)`. RLS: owner manage; anyone read.
- **`ig_embeds`** — `id`, `scope` (`home_featured`|`creator`), `creator_id nullable`, `post_url`, `caption`, `order int`, `active bool`. RLS: admin write, creator write own, public read active.
- **`creator_ig_tokens`** — `creator_id` PK, `access_token` (encrypted via pgsodium or stored only via edge function env if user prefers — default: store hashed reference, full token in edge function secret per creator is over-scope; v1 stores token text with RLS owner-only + admin). RLS: creator self only.
- **Product slot metadata**: add `products.fit_slot text` (`top|bottom|outerwear|shoes|hat|accessory|fullbody`) and `products.fit_image text` (transparent PNG; falls back to `image`).
- **Storage bucket** `fits` (public read, authenticated write own folder).

## Batch B — FitCheck module (`/fitcheck`)

Files:
- `src/pages/store/FitCheckPage.tsx` — canvas studio.
- `src/pages/store/FitsGalleryPage.tsx` — `/fits` community wall (public fits, like, sort by latest/popular/featured).
- `src/pages/store/FitDetailPage.tsx` — `/fits/:id` share target with OG image.
- `src/components/fitcheck/MannequinCanvas.tsx` — layered SVG/PNG dress-up with drag/scale/rotate (framer-motion drag + custom handles).
- `src/components/fitcheck/ModelToggle.tsx` — male/female base swap.
- `src/components/fitcheck/SlotPalette.tsx` — tabs by slot, paginated product picker filtered by `fit_slot`.
- `src/components/fitcheck/FitActions.tsx` — Save (private/public), Add full outfit to cart, Share (WhatsApp/X/IG via Web Share API + share card), Submit to wall.
- `src/hooks/use-fits.ts` — CRUD + likes.
- `src/lib/fitcheck/render-card.ts` — html2canvas → upload to `fits` bucket → set `cover_image`.
- Base mannequin assets generated via `imagegen` (transparent, front-facing, neutral): `src/assets/fitcheck/model-male.png`, `model-female.png`.

Nav: add **FitCheck** entry in `StoreNavbar` + `MobileBottomNav`. Profile tab "My Fits".

## Batch C — IG embeds (hybrid)

- `src/components/social/IGEmbed.tsx` — renders official IG blockquote + loads `//www.instagram.com/embed.js` once (idempotent loader).
- `src/components/social/IGFeed.tsx` — given handle + optional token: if token, fetch latest 6 via IG Basic Display in `supabase/functions/ig-feed/index.ts` (cached 1h in `seo_pages.meta`); else render handle CTA + last admin-curated posts for that creator.
- Home: replace placeholder in `SocialFeedSection.tsx` with curated `ig_embeds` (scope=`home_featured`).
- Creator storefront: `IGFeed` block under hero.
- Admin: `src/pages/admin/AdminIGEmbeds.tsx` — CRUD curated posts; creator settings tab to paste handle + (optional) connect IG.

## Batch D — PDP carousel + polish

- `src/components/store/RelatedCarousel.tsx` — embla carousel of related products (same category, then drop, then creator). Reuses `ProductCard`.
- `src/components/store/CompleteTheLookCarousel.tsx` — items sharing `drop_id` or `seo_clusters.related_product_ids`, "Shop the Look" CTA → opens FitCheck prefilled.
- Wire both into `ProductDetailPage.tsx` below description.
- Polishes: loading skeletons on PDP carousels, empty states, lazy-load images, `prefers-reduced-motion` respected on tilt/confetti, focus rings, `aria-label`s on icon buttons in `ProductCard`, `SocialLinks`, `MobileBottomNav`.

## Out of scope
- AI try-on render; user photo upload; real-time IG webhook; multi-pose mannequins; payouts.

## Open questions
None — proceeding with answered choices (2D paper-doll, all four outputs, hybrid IG, PDP carousel).
