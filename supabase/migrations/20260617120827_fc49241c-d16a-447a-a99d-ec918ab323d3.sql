
-- 1. Enum + product DGR fields
DO $$ BEGIN
  CREATE TYPE public.fit_status_t AS ENUM ('draft', 'processing', 'ready', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS dgr_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS fit_status public.fit_status_t NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS views jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS mask_url text,
  ADD COLUMN IF NOT EXISTS fit_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS fit_readiness int GENERATED ALWAYS AS (
    (CASE WHEN fit_slot IS NOT NULL THEN 25 ELSE 0 END) +
    (CASE WHEN fit_image IS NOT NULL THEN 25 ELSE 0 END) +
    (CASE WHEN mask_url IS NOT NULL THEN 25 ELSE 0 END) +
    (CASE WHEN fit_status = 'ready' THEN 25 ELSE 0 END)
  ) STORED;

-- 2. Auto-assign DGR code
CREATE OR REPLACE FUNCTION public.assign_dgr_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  candidate text;
BEGIN
  IF NEW.dgr_code IS NULL THEN
    LOOP
      candidate := 'FITZ-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 5));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.products WHERE dgr_code = candidate);
    END LOOP;
    NEW.dgr_code := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_assign_dgr_code ON public.products;
CREATE TRIGGER products_assign_dgr_code
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.assign_dgr_code();

UPDATE public.products
SET dgr_code = 'FITZ-' || upper(substring(md5(id::text) from 1 for 5))
WHERE dgr_code IS NULL;

-- 3. Fits AI lookbook fields
ALTER TABLE public.fits
  ADD COLUMN IF NOT EXISTS environment text,
  ADD COLUMN IF NOT EXISTS body_type text,
  ADD COLUMN IF NOT EXISTS render_url text;

-- 4. Storage policies for the 'fits' bucket (create bucket via dashboard)
DROP POLICY IF EXISTS "fits public read" ON storage.objects;
CREATE POLICY "fits public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'fits');

DROP POLICY IF EXISTS "fits owner upload" ON storage.objects;
CREATE POLICY "fits owner upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fits' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "fits owner update" ON storage.objects;
CREATE POLICY "fits owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'fits' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'fits' AND owner = auth.uid());

DROP POLICY IF EXISTS "fits owner delete" ON storage.objects;
CREATE POLICY "fits owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'fits' AND owner = auth.uid());

DROP POLICY IF EXISTS "fits admin all" ON storage.objects;
CREATE POLICY "fits admin all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'fits' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'fits' AND public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Remove user_roles from realtime publication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_roles'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.user_roles;
  END IF;
END $$;
