-- 1. ORDERS: enforce ownership
ALTER TABLE public.orders ALTER COLUMN user_id SET NOT NULL;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. STORAGE: product-images
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- owner-scoped folders: profiles/<uid>/..., fits/<uid>/..., creators/<uid>/...
CREATE POLICY "product-images admin all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "product-images owner insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN ('profiles','fits','creators')
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "product-images owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN ('profiles','fits','creators')
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN ('profiles','fits','creators')
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "product-images owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN ('profiles','fits','creators')
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "product-images owner select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR (storage.foldername(name))[2] = auth.uid()::text
    )
  );

-- 3. STORAGE: creator-uploads (private bucket) — owner/admin read only
DROP POLICY IF EXISTS "Creator uploads readable" ON storage.objects;
CREATE POLICY "Creator uploads owner readable" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'creator-uploads'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );