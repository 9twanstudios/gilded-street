# Fix the Failing SEO Findings

Three failing findings from the current scan: page headings / content structure (mid), the sitemap host, and the robots.txt sitemap directive (both low). One fix round addresses all three; no new features, no route changes.

## 1. Sitemap and robots.txt (http findings)

- `public/robots.txt`: change the `Sitemap:` line to `https://gold-street-hub.lovable.app/sitemap.xml`. All existing `User-agent:` blocks stay untouched.
- `public/sitemap.xml`: swap the base host from `91fitz.com` to `https://gold-street-hub.lovable.app` and sync entries with the routes that actually exist today:
  - Remove `/journal` (page was deleted), `/drops` and `/login`/`/signup` (these are now redirects, not pages).
  - Keep `/`, `/shop`, `/drops/:slug` entries for the live products, and the marketing pages (`/about`, `/contact`, `/shipping`, `/returns`, `/privacy`, `/terms`, `/faq`, `/sizing`, `/track-order`, `/creators`).
- The sitemap stays a hand-edited static file — it is the existing mechanism and it is not replaced without your approval.

## 2. Page headings and content structure (agent_content finding)

- **Homepage** (`HomePage.tsx`): add one H1 — "91 Fitz — Pan-African Streetwear from Nairobi" — visually hidden so it does not disturb the anime spotlight hero.
- **Sign-in / password pages** (`LoginPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`): the gold "91FITZ" brand line becomes a real H1 per page ("Sign in to 91 Fitz", "Reset your password", "Choose a new password").
- **Shop** (`ProductsPage.tsx`): the lone "Shop" H1 becomes "Shop 91 Fitz Streetwear" (badge-filtered views keep their existing dynamic heading).
- **FAQ** (`MarketingPages.tsx`): question headings move from H3 to H2 so the hierarchy starts at H2 under the page H1.
- **Contact page**: the generic "apply here" link becomes "Apply to become a creator".

## 3. Accessible names for icon-only controls

- `CartPage.tsx`: label the remove, quantity-minus and quantity-plus buttons ("Remove [product]", "Decrease quantity", "Increase quantity").
- `ProductsPage.tsx`: label the search-clear × button ("Clear search").

## Verification

- Typecheck (`npx tsgo --noEmit -p tsconfig.app.json`) and confirm the build log is clean.
- Mark all three findings fixed in the SEO tracker; the next scan re-verifies automatically.

Out of scope: no route, design, or checkout changes — only these SEO/a11y fixes.
