
-- Products: fit slot metadata
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS fit_slot text,
  ADD COLUMN IF NOT EXISTS fit_image text;

-- Fits
CREATE TABLE IF NOT EXISTS public.fits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  model text NOT NULL DEFAULT 'male' CHECK (model IN ('male','female')),
  name text NOT NULL DEFAULT 'Untitled Fit',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  cover_image text,
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  likes_count integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fits TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fits TO authenticated;
GRANT ALL ON public.fits TO service_role;
ALTER TABLE public.fits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view public fits" ON public.fits
  FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users view own fits" ON public.fits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own fits" ON public.fits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own fits" ON public.fits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own fits" ON public.fits
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage fits" ON public.fits
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER fits_updated_at BEFORE UPDATE ON public.fits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fit likes
CREATE TABLE IF NOT EXISTS public.fit_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fit_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fit_id, user_id)
);
GRANT SELECT ON public.fit_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.fit_likes TO authenticated;
GRANT ALL ON public.fit_likes TO service_role;
ALTER TABLE public.fit_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view fit likes" ON public.fit_likes FOR SELECT USING (true);
CREATE POLICY "Users like fits" ON public.fit_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike own" ON public.fit_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Maintain likes_count
CREATE OR REPLACE FUNCTION public.fits_likes_count_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fits SET likes_count = likes_count + 1 WHERE id = NEW.fit_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.fits SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.fit_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER fit_likes_count_ins AFTER INSERT ON public.fit_likes
  FOR EACH ROW EXECUTE FUNCTION public.fits_likes_count_sync();
CREATE TRIGGER fit_likes_count_del AFTER DELETE ON public.fit_likes
  FOR EACH ROW EXECUTE FUNCTION public.fits_likes_count_sync();

-- IG embeds
CREATE TABLE IF NOT EXISTS public.ig_embeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('home_featured','creator')),
  creator_id uuid,
  post_url text NOT NULL,
  caption text DEFAULT '',
  "order" integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ig_embeds TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ig_embeds TO authenticated;
GRANT ALL ON public.ig_embeds TO service_role;
ALTER TABLE public.ig_embeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view active embeds" ON public.ig_embeds
  FOR SELECT USING (active = true);
CREATE POLICY "Admins manage embeds" ON public.ig_embeds
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Creators manage own embeds" ON public.ig_embeds
  FOR ALL TO authenticated
  USING (scope = 'creator' AND creator_id = auth.uid())
  WITH CHECK (scope = 'creator' AND creator_id = auth.uid());

CREATE TRIGGER ig_embeds_updated_at BEFORE UPDATE ON public.ig_embeds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Creator IG tokens
CREATE TABLE IF NOT EXISTS public.creator_ig_tokens (
  creator_id uuid PRIMARY KEY,
  ig_user_id text,
  access_token text NOT NULL,
  expires_at timestamptz,
  ig_handle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_ig_tokens TO authenticated;
GRANT ALL ON public.creator_ig_tokens TO service_role;
ALTER TABLE public.creator_ig_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators manage own ig token" ON public.creator_ig_tokens
  FOR ALL TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Admins view ig tokens" ON public.creator_ig_tokens
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER creator_ig_tokens_updated_at BEFORE UPDATE ON public.creator_ig_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
