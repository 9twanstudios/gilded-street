
-- Enable citext for case-insensitive usernames
CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================================
-- 1. PROFILES — personalization columns
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username citext UNIQUE,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bio text DEFAULT '',
  ADD COLUMN IF NOT EXISTS location_city text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS social jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS style_tags text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS pronouns text,
  ADD COLUMN IF NOT EXISTS birthday date,
  ADD COLUMN IF NOT EXISTS onboarding_step text,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

-- ============================================================
-- 2. CREATORS — tier column
-- ============================================================
ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS creator_tier text NOT NULL DEFAULT 'rising'
    CHECK (creator_tier IN ('rising','verified','elite'));

-- ============================================================
-- 3. CREATOR_APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.creator_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_name text NOT NULL,
  bio text NOT NULL DEFAULT '',
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  sample_urls text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewer_id uuid,
  decided_at timestamptz,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.creator_applications TO authenticated;
GRANT ALL ON public.creator_applications TO service_role;

ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own application"
  ON public.creator_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own application"
  ON public.creator_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all applications"
  ON public.creator_applications FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update applications"
  ON public.creator_applications FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_creator_apps_updated
  BEFORE UPDATE ON public.creator_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: on approval, grant creator role + create creators row
CREATE OR REPLACE FUNCTION public.handle_creator_application_decision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'creator'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.creators (user_id, brand_name, bio, verified)
    VALUES (NEW.user_id, NEW.brand_name, NEW.bio, false)
    ON CONFLICT DO NOTHING;

    NEW.decided_at := now();
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    NEW.decided_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_creator_app_decision
  BEFORE UPDATE ON public.creator_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_creator_application_decision();

-- ============================================================
-- 4. AUDIT_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs (target_type, target_id);

CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action text,
  _target_type text DEFAULT NULL,
  _target_id uuid DEFAULT NULL,
  _meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins may log admin actions';
  END IF;
  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, meta)
  VALUES (auth.uid(), _action, _target_type, _target_id, COALESCE(_meta, '{}'::jsonb))
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- ============================================================
-- 5. SEO_PAGES auto-snapshot triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.snapshot_seo_page()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
  _entity_type text := TG_ARGV[0];
  _title text;
  _desc text;
  _image text;
  _status text := 'submitted';
BEGIN
  IF _entity_type = 'product' THEN
    _url := '/products/' || NEW.slug;
    _title := NEW.name;
    _desc := COALESCE(NEW.description, NEW.name);
    _image := NEW.image;
    IF NEW.status::text <> 'approved' THEN _status := 'unknown'; END IF;
  ELSIF _entity_type = 'drop' THEN
    _url := '/drops/' || NEW.slug;
    _title := NEW.title;
    _desc := COALESCE(NEW.description, NEW.title);
    _image := NEW.cover_image;
    IF NEW.active = false THEN _status := 'unknown'; END IF;
  ELSIF _entity_type = 'blog' THEN
    _url := '/blog/' || NEW.slug;
    _title := NEW.title;
    _desc := COALESCE(NEW.excerpt, NEW.title);
    _image := NEW.cover_image;
    IF NEW.published = false THEN _status := 'unknown'; END IF;
  ELSIF _entity_type = 'story' THEN
    _url := '/stories/' || NEW.slug;
    _title := NEW.title;
    _desc := COALESCE(NEW.title, '');
    _image := NEW.cover_image;
    IF NEW.published = false THEN _status := 'unknown'; END IF;
  ELSIF _entity_type = 'cluster' THEN
    _url := '/c/' || NEW.slug;
    _title := NEW.title;
    _desc := NEW.meta_description;
    _image := NEW.hero_image;
    IF NEW.published = false THEN _status := 'unknown'; END IF;
  ELSIF _entity_type = 'location' THEN
    _url := '/l/' || NEW.slug;
    _title := NEW.title;
    _desc := NEW.meta_description;
    _image := NEW.hero_image;
    IF NEW.published = false THEN _status := 'unknown'; END IF;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.seo_pages (url, entity_type, entity_id, title, description, og_image, canonical_url, index_status, updated_at)
  VALUES (_url, _entity_type, NEW.id, _title, _desc, _image, _url, _status, now())
  ON CONFLICT (url) DO UPDATE
    SET entity_type = EXCLUDED.entity_type,
        entity_id = EXCLUDED.entity_id,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        og_image = EXCLUDED.og_image,
        canonical_url = EXCLUDED.canonical_url,
        index_status = EXCLUDED.index_status,
        updated_at = now();
  RETURN NEW;
END;
$$;

-- Ensure unique url for upsert
CREATE UNIQUE INDEX IF NOT EXISTS uq_seo_pages_url ON public.seo_pages (url);

DROP TRIGGER IF EXISTS trg_seo_snapshot_product ON public.products;
CREATE TRIGGER trg_seo_snapshot_product
  AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_seo_page('product');

DROP TRIGGER IF EXISTS trg_seo_snapshot_drop ON public.drops;
CREATE TRIGGER trg_seo_snapshot_drop
  AFTER INSERT OR UPDATE ON public.drops
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_seo_page('drop');

DROP TRIGGER IF EXISTS trg_seo_snapshot_blog ON public.blog_posts;
CREATE TRIGGER trg_seo_snapshot_blog
  AFTER INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_seo_page('blog');

DROP TRIGGER IF EXISTS trg_seo_snapshot_story ON public.stories;
CREATE TRIGGER trg_seo_snapshot_story
  AFTER INSERT OR UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_seo_page('story');

DROP TRIGGER IF EXISTS trg_seo_snapshot_cluster ON public.seo_clusters;
CREATE TRIGGER trg_seo_snapshot_cluster
  AFTER INSERT OR UPDATE ON public.seo_clusters
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_seo_page('cluster');

DROP TRIGGER IF EXISTS trg_seo_snapshot_location ON public.seo_locations;
CREATE TRIGGER trg_seo_snapshot_location
  AFTER INSERT OR UPDATE ON public.seo_locations
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_seo_page('location');

-- ============================================================
-- 6. PROFILES — username helper, public-read of minimal columns for creators
-- ============================================================
-- Auto-generate username from email on signup if null
CREATE OR REPLACE FUNCTION public.profiles_default_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  i int := 0;
BEGIN
  IF NEW.username IS NULL AND NEW.email IS NOT NULL THEN
    base := regexp_replace(lower(split_part(NEW.email,'@',1)), '[^a-z0-9_]', '', 'g');
    IF length(base) < 3 THEN base := 'user' || substring(NEW.id::text, 1, 6); END IF;
    candidate := base;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate::citext) LOOP
      i := i + 1;
      candidate := base || i::text;
    END LOOP;
    NEW.username := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_default_username ON public.profiles;
CREATE TRIGGER trg_profiles_default_username
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_default_username();
