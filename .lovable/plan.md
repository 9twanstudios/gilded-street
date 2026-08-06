# Next Phase — PWA, Elite Youth Group Drop, Womenswear & Security Finish

Verified before planning: `public/` contains only `favicon.ico`, `favicon.png`, `og-image.png`, `placeholder.svg`, `robots.txt`, `sitemap.xml` — there is no web app manifest and no PWA icons. `index.html` has no `manifest` link and no `theme-color`. `vercel.json` rewrites every path to `index.html`. The orders/storage security migration already applied successfully; the second migration (function grants + write-policy tightening) was interrupted and has not been applied.

## 1. Installable app (PWA, manifest-only)

- Generate 91FITZ app icons at 192x192, 512x512 and a 512x512 maskable variant from the existing brand mark (gold on black), plus an `apple-touch-icon`.
- Add `public/manifest.webmanifest`: name `91FITZ`, short name `91FITZ`, `display: standalone`, black background, gold theme colour, `start_url: /`, portrait orientation, icon entries.
- Link the manifest, `theme-color`, and Apple touch icon from `index.html`; add `apple-mobile-web-app-*` tags so the standalone launch looks native.
- Add a `/manifest.webmanifest` exclusion so the Vercel SPA rewrite does not swallow it.
- No service worker and no offline caching (not requested — that path risks stale previews).

## 2. "Smooth fluid app" polish

- Global smooth scrolling, momentum scrolling on iOS, and `overscroll-behavior` so the standalone app doesn't rubber-band the page.
- Safe-area insets (notch / home indicator) applied to the navbar and mobile bottom nav.
- Consistent page-transition fade and tap-highlight removal for touch targets; existing motion tokens reused, nothing new invented.

## 3. Elite Youth Group collab drop (6 SKUs)

New drop `elite-youth-group` (type: collab) with narrative copy tying the crest's "Youth in Action. Communities in Motion." line to the 91FITZ Pan-African story, plus 6 products carrying the crest artwork:

1. Elite FC Home Jersey (green/gold)
2. Elite FC Away Jersey (black/gold)
3. Elite Youth Group Crest Hoodie
4. Elite Youth Group Crest Tee
5. Elite FC Training Shorts
6. Elite Youth Group Snapback Cap

Each gets a studio catalogue image plus a transparent cutout so it appears in the FitCheck slot palette, KES integer pricing, sizes, `fit_slot`, and drop linkage. Images are uploaded to CDN pointers and stored as absolute URLs so they render on Vercel.

## 4. Womenswear expansion (10 pieces)

Crop tee, bodysuit, cargo mini skirt, oversized hoodie, biker shorts, halter top, two-piece lounge set, slip dress, cropped denim jacket, high-waist leggings — all in the existing Pan-African / rebel design language, tagged `gender: female`, with catalogue image + FitCheck cutout, correct `fit_slot`, and KES pricing.

## 5. Finish the security hardening migration

Re-run the interrupted migration:

- Revoke direct execute on internal SECURITY DEFINER automation functions (`handle_new_user`, `assign_dgr_code`, `fits_likes_count_sync`, `handle_creator_application_decision`, `profiles_default_username`, `snapshot_seo_page`, `rls_auto_enable`, `generate_referral_code`) — triggers keep working.
- `log_admin_action`: revoke from anonymous visitors, keep for signed-in users (it verifies admin internally).
- Replace the four `WITH CHECK (true)` insert policies with validated ones: email format + length on newsletter signups and restock requests; event type / payload size limits and `user_id = auth.uid()` on analytics events and QR scans.
- Add matching client-side email validation on the newsletter and notify-me forms so users get a clear message instead of a raw policy error.
- Update the creator image-upload path to the `creators/<user id>/` folder now required by the tightened storage policies.

Remaining scanner items after this: leaked-password protection (dashboard toggle only — link provided), and `has_role` staying executable (required by the policies themselves). Those will be explained, not silently ignored.

## Technical notes

Images are generated then externalised via CDN asset pointers and written to the database as absolute URLs (same approach that fixed the earlier Vercel breakage). Product/drop seeding runs through data inserts, not schema migrations. The manifest is static in `public/` — no build plugin, no service worker, so previews and the published site behave identically.
