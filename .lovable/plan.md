

# Categories Table, Product Slugs & Admin Blog System

## Overview

Based on your priorities, we'll implement two main features:
1. A proper **categories** table with SEO-friendly product **slugs**
2. An admin-managed **blog system** for fashion tips with internal product linking

## What Already Exists
- Products table with `category` as a plain text column
- No slugs — products use UUID-based URLs (`/products/:id`)
- No blog infrastructure at all
- No categories table

---

## Phase 1: Categories Table + Product Slugs

### Database Migration

**New table: `categories`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | e.g. "Hoodies" |
| slug | text, unique | e.g. "hoodies" |
| description | text, nullable | SEO description |
| image | text, nullable | Category hero image |
| created_at | timestamp | default now() |

**Alter `products` table:**
- Add `slug` column (text, unique, not null) — auto-generated from name for existing products
- Add `category_id` column (uuid, FK → categories.id, nullable initially)
- Backfill `category_id` from existing `category` text values
- Keep `category` text column for backward compatibility during migration

**RLS:** Public read for categories. Admin full CRUD.

### Code Changes

| File | Change |
|------|--------|
| `src/hooks/use-products.ts` | Add `useProduct` by slug, `useCategories` hook |
| `src/pages/store/ProductDetailPage.tsx` | Support `/products/:slug` instead of `:id` |
| `src/pages/store/ProductsPage.tsx` | Support `/products?category=hoodies` via slug |
| `src/pages/store/CategoryPage.tsx` | **New** — dedicated category page at `/category/:slug` |
| `src/components/store/StoreNavbar.tsx` | Add category dropdown in nav |
| `src/components/store/StoreFooter.tsx` | Add category links |
| `src/components/store/ProductCard.tsx` | Link to `/products/:slug` |
| `src/App.tsx` | Add `/category/:slug` route |
| `src/pages/admin/AdminProducts.tsx` | Category dropdown uses categories table |
| `src/components/admin/ProductFormDialog.tsx` | Category select from DB, auto-generate slug |
| `src/pages/admin/AdminCategories.tsx` | **New** — admin CRUD for categories |
| `src/layouts/AdminLayout.tsx` | Add "Categories" sidebar link |
| `public/sitemap.xml` | Add category URLs |

---

## Phase 2: Blog System

### Database Migration

**New table: `blog_posts`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| title | text | |
| slug | text, unique | URL-friendly |
| excerpt | text | Short preview |
| content | text | Full article (Markdown or rich text) |
| cover_image | text | Hero image URL |
| author | text | defaults to "91Fitz" |
| published | boolean | default false (draft support) |
| tags | text[] | e.g. ["styling", "hoodies"] |
| related_product_ids | uuid[] | Links to products for internal linking |
| created_at | timestamp | |
| updated_at | timestamp | |

**RLS:** Public read for published posts. Admin full CRUD.

### Code Changes

| File | Change |
|------|--------|
| `src/hooks/use-blog.ts` | **New** — `useBlogPosts`, `useBlogPost(slug)` hooks |
| `src/pages/store/BlogPage.tsx` | **New** — blog listing with tags filter |
| `src/pages/store/BlogPostPage.tsx` | **New** — single post view with related products |
| `src/pages/admin/AdminBlog.tsx` | **New** — blog CRUD with title, content editor, publish toggle |
| `src/components/admin/BlogFormDialog.tsx` | **New** — create/edit blog post modal |
| `src/App.tsx` | Add `/blog` and `/blog/:slug` routes |
| `src/layouts/AdminLayout.tsx` | Add "Blog" sidebar link |
| `src/components/store/StoreNavbar.tsx` | Add "Blog" nav link |
| `src/components/store/StoreFooter.tsx` | Add blog links |
| `index.html` | Add blog-related structured data |
| `public/sitemap.xml` | Add `/blog` |

### Blog Post Page Features
- Render markdown content
- Show related products grid at bottom (from `related_product_ids`)
- Internal links to product pages using slugs
- SEO meta tags per post (dynamic `<title>` and `<meta>`)

---

## SEO Enhancements (Both Phases)

- Dynamic `<title>` and meta description on product detail, category, and blog pages using `react-helmet-async`
- Product page: `<title>{product.name} — 9twanfitz Streetwear</title>`
- Category page: `<title>{category.name} — 9twanfitz</title>`
- Blog post: `<title>{post.title} — 9twanfitz Fashion Tips</title>`
- OG tags with product/post images

---

## Implementation Order

1. Create `categories` table + add `slug` to products (migration)
2. Backfill categories and slugs for existing products
3. Update product hooks, routes, and pages to use slugs
4. Build admin categories CRUD page
5. Create `blog_posts` table (migration)
6. Build blog hooks, listing page, and post page
7. Build admin blog CRUD page
8. Add `react-helmet-async` for dynamic SEO meta tags
9. Update nav, footer, and sitemap with new links

