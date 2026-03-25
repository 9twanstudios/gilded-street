-- 1. Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can insert categories" ON public.categories
  FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE TO public USING (has_role(auth.uid(), 'admin'));

-- 2. Seed existing categories
INSERT INTO public.categories (name, slug) VALUES
  ('Hoodies', 'hoodies'),
  ('T-Shirts', 't-shirts'),
  ('Pants', 'pants'),
  ('Jackets', 'jackets'),
  ('Accessories', 'accessories'),
  ('Caps', 'caps'),
  ('Sneakers', 'sneakers');

-- 3. Add slug and category_id to products
ALTER TABLE public.products ADD COLUMN slug text UNIQUE;
ALTER TABLE public.products ADD COLUMN category_id uuid REFERENCES public.categories(id);

-- 4. Backfill product slugs from name
UPDATE public.products
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || left(id::text, 8);

-- Make slug NOT NULL after backfill
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;

-- 5. Backfill category_id from category text
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.name;

-- 6. Create blog_posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL DEFAULT '',
  cover_image text,
  author text NOT NULL DEFAULT '91Fitz',
  published boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  related_product_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT TO public USING (published = true);

CREATE POLICY "Admins can view all posts" ON public.blog_posts
  FOR SELECT TO public USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts" ON public.blog_posts
  FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts" ON public.blog_posts
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts" ON public.blog_posts
  FOR DELETE TO public USING (has_role(auth.uid(), 'admin'));
