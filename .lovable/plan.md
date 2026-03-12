

# Final Deployment Polish for Vercel

## Current State

The project is mostly deployment-ready. The `vercel.json` has the SPA rewrite. SEO meta tags are in place. A few final touches are needed:

## Changes

### 1. Enhanced `vercel.json`
Add security headers (X-Frame-Options, CSP, etc.), cache control for static assets, and clean URLs config.

### 2. Updated `robots.txt`
Add sitemap reference pointing to `https://91fitz.com/sitemap.xml`.

### 3. Create `public/sitemap.xml`
Static sitemap with all public routes (/, /products, /login, /signup) for SEO crawling.

### 4. Polish 404 Page
Style the NotFound page to match the gold/black 91Fitz theme instead of the generic gray.

### 5. Build Verification
Ensure no TypeScript errors or dead imports that would break `vite build`.

## File Changes

| File | Action |
|------|--------|
| `vercel.json` | Update — add headers, caching |
| `public/robots.txt` | Update — add sitemap |
| `public/sitemap.xml` | Create — SEO sitemap |
| `src/pages/NotFound.tsx` | Update — match brand theme |

