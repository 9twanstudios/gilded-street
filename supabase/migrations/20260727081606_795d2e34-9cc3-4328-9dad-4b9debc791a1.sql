
-- 1. Blog posts unified with stories
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS post_type text NOT NULL DEFAULT 'article',
  ADD COLUMN IF NOT EXISTS meta jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$ BEGIN
  ALTER TABLE public.blog_posts
    ADD CONSTRAINT blog_posts_post_type_chk
    CHECK (post_type IN ('article','story','drop_note'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.blog_posts (title, slug, excerpt, content, cover_image, author, published, tags, related_product_ids, post_type, meta, created_at, updated_at)
SELECT
  s.title,
  s.slug,
  LEFT(s.content, 240),
  s.content,
  COALESCE(s.cover_image, s.figure_image),
  COALESCE(s.figure_name, '91Fitz Editorial'),
  s.published,
  ARRAY[]::text[],
  COALESCE(s.related_product_ids, ARRAY[]::uuid[]),
  'story',
  jsonb_build_object('figure_name', s.figure_name, 'era', s.era, 'relevance', s.relevance, 'related_drop_id', s.related_drop_id),
  s.created_at,
  s.updated_at
FROM public.stories s
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts b WHERE b.slug = s.slug);

-- 2. Drop taxonomy
DO $$ BEGIN
  CREATE TYPE public.drop_type_t AS ENUM ('seasonal','capsule','collab','archive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.drops
  ADD COLUMN IF NOT EXISTS narrative text
    CHECK (narrative IS NULL OR narrative IN ('freedom','rebel','unity','ecosystem','general')),
  ADD COLUMN IF NOT EXISTS drop_type public.drop_type_t;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gender text
    CHECK (gender IS NULL OR gender IN ('male','female','unisex')),
  ADD COLUMN IF NOT EXISTS drop_type public.drop_type_t,
  ADD COLUMN IF NOT EXISTS narrative text
    CHECK (narrative IS NULL OR narrative IN ('freedom','rebel','unity','ecosystem','general'));

CREATE INDEX IF NOT EXISTS products_gender_drop_type_idx ON public.products (gender, drop_type);
CREATE INDEX IF NOT EXISTS products_narrative_idx ON public.products (narrative);

-- 3. Creator uploads storage policies
DROP POLICY IF EXISTS "Creator uploads readable" ON storage.objects;
CREATE POLICY "Creator uploads readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'creator-uploads');

DROP POLICY IF EXISTS "Creators upload to own folder" ON storage.objects;
CREATE POLICY "Creators upload to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'creator-uploads'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Creators manage own uploads" ON storage.objects;
CREATE POLICY "Creators manage own uploads"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'creator-uploads'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Creators delete own uploads" ON storage.objects;
CREATE POLICY "Creators delete own uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'creator-uploads'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
