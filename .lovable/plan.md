
# 91Fitz Merch → FitCheck Catalog Seed

Takes the 8 uploaded reference designs, produces a **FitCheck-ready** version of each (catalog shot + transparent mannequin cutout + auto-slotted), then seeds 20 additional pieces in the same visual language across tops, outerwear, bottoms, and accessories.

## Visual language (locked across all 28 pieces)

Kept identical to the uploads so the catalog reads as one line, not a mashup:

- **Palette:** matte black / bone white base; Pan-African red-gold-green accents; distressed gold-foil headliners; light-blue sport variant only for the jersey family.
- **Typography:** heavy display slabs (Bebas / condensed collegiate), spray-graffiti sub-heads, small "91FITZ" chest/hem lockup.
- **Textures:** DTF distress, halftone drips, tribal border tape, subtle map/street-grid ghosting.
- **Signatures on every piece:** "91FITZ" wordmark, tiny QR patch corner (references DGR code), Pan-African sleeve/hem stripe, gold "91" hit somewhere.

## The 28-piece catalog

**Redesigned from uploads (8)** — front-view catalog shot + transparent garment cutout each:

| # | Name | Slot |
|---|---|---|
| 1 | Rebel Athletics "Freedom Street" Jersey — powder blue | `top` |
| 2 | Rise Up Africa — Marcus Garvey Tee (black) | `top` |
| 3 | Africa Unite Pan-African Tee (washed black) | `top` |
| 4 | Badlands Clan Tee — Onyx | `top` |
| 5 | Badlands Clan Tee — Bone | `top` |
| 6 | If Can't Sip Ayam Juice Tee | `top` |
| 7 | Jah Soldier "King of Kings" Field Jacket (olive) | `outerwear` |
| 8 | Umoja Freedom Street Denim Jacket (Raila portrait back) | `outerwear` |

**New seed (20)** — same design system, expanding coverage:

Tops (5): Sankara "Upright Man" tee · Lumumba "Independence Cha Cha" tee · Nkrumah "Africa Must Unite" long-sleeve · Dedan Kimathi Mau-Mau tee · 91 Rebel Numerals gold-foil tee.
Outerwear (5): Roots Energy zip hoodie (black/gold) · Fuel Di Rebel bomber (olive) · Pan-African varsity jacket · Nairobi Grid coach jacket · Staywoke Champion pullover hoodie.
Bottoms (5): Umoja cargo pants (black) · 91 Fitz joggers (heather) · Rebel denim shorts (indigo) · Tactical utility pant (olive) · Pan-African stripe track pant.
Accessories (5): Lion of Judah bucket hat · 91 Fitz gold-embroidered snapback · Rebel sling bag · Freedom Street chain · Ethiopia stripe knit beanie.

## Asset pipeline (per piece)

Two images per SKU, both stored via CDN pointers under `src/assets/catalog/…`:

1. **Catalog shot** — front view of the garment on a clean charcoal backdrop, 1024×1024 JPG, used as `products.image`.
2. **FitCheck cutout** — same garment isolated on transparent background, 1024×1024 PNG, used as `products.fit_image` (this is what stacks on the mannequin in the Studio).

For the 8 uploads: use `imagegen--edit_image` on the reference photo — one call to re-render it as a clean single-view catalog shot, one call with `transparent_background: true` to produce the mannequin cutout. Keeps the exact artwork visible in the reference.

For the 20 new pieces: use `imagegen--generate_image` twice per SKU (catalog shot + transparent cutout) with a locked style prompt block so every generation stays inside the visual system above.

Total generations: **56 images** (28 × 2). Run in parallel batches of 4–6 to keep it moving.

## Database seed

One migration inserts all 28 rows into `public.products` with:

- `name`, `slug`, `price` (KES integer), `description`, `category`
- `image` = catalog CDN URL, `fit_image` = transparent-cutout CDN URL
- `fit_slot` = `top` | `outerwear` | `bottom` | `accessory`
- `fit_status = 'ready'`, `fit_readiness = 100` — bypasses the extract queue since we're pre-classifying
- `status = 'approved'`, `approved = true`, `in_stock = true`
- `dgr_code` auto-assigned by the existing `assign_dgr_code` trigger
- `sizes` — S/M/L/XL for wearables, `["OS"]` for hats/bags/chains
- `badge` — "New Drop" on the 8 flagship redesigns, null on the rest

Pricing tiers (whole KES per project convention):

- Tees: 2,500
- Long-sleeves / jerseys: 3,200
- Hoodies / bombers / coach jackets: 5,500
- Field jacket / denim jacket / varsity: 7,500
- Cargos / joggers / tactical pants: 4,200
- Denim shorts / track pants: 3,500
- Bucket hat / snapback / beanie: 1,800
- Sling bag: 3,500
- Chain: 2,200

## What the user sees after this ships

- Studio → Garments tab has 28 real pieces ready to drop onto the mannequin, split across all four slot filters.
- Shop grid, Drops, and Community remixes all render immediately (they read from `products`).
- FitCheck Ops admin shows `28 total · 28 ready · avg readiness 100%`.

## Out of scope

- Product detail copy beyond a one-line description — can be expanded later.
- New drop pages tying subsets together — reuse existing `AdminDrops` flow.
- Category page redesigns — using existing `ProductsPage` + `ProductGrid`.

## File touch list

```text
src/assets/catalog/<slug>.jpg.asset.json           x28  (catalog CDN pointers)
src/assets/catalog/<slug>.cutout.png.asset.json    x28  (FitCheck cutout pointers)
supabase/migrations/<ts>_seed_fitcheck_catalog.sql  1  (inserts 28 products)
```

No app-code changes required — the Studio, Shop, and Admin already consume `products.fit_image` + `fit_slot` + `fit_status` set here.
