REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.assign_dgr_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fits_likes_count_sync() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_creator_application_decision() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.profiles_default_username() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.snapshot_seo_page() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_admin_action(text, text, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text, text, uuid, jsonb) TO authenticated;

DROP POLICY IF EXISTS "Anyone can log events" ON public.events;
CREATE POLICY "Anyone can log events" ON public.events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    event_type IS NOT NULL
    AND char_length(event_type) BETWEEN 1 AND 64
    AND (session_id IS NULL OR char_length(session_id) <= 128)
    AND (page_path IS NULL OR char_length(page_path) <= 512)
    AND (user_id IS NULL OR user_id = auth.uid())
    AND (properties IS NULL OR pg_column_size(properties) <= 8192)
  );

DROP POLICY IF EXISTS "Anyone can log scans" ON public.qr_scans;
CREATE POLICY "Anyone can log scans" ON public.qr_scans
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    campaign_id IS NOT NULL
    AND (user_id IS NULL OR user_id = auth.uid())
    AND (session_id IS NULL OR char_length(session_id) <= 128)
    AND (referrer IS NULL OR char_length(referrer) <= 1024)
    AND (user_agent IS NULL OR char_length(user_agent) <= 1024)
  );

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(email) BETWEEN 6 AND 254
    AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  );

DROP POLICY IF EXISTS "Anyone can request notification" ON public.notify_requests;
CREATE POLICY "Anyone can request notification" ON public.notify_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    product_id IS NOT NULL
    AND char_length(email) BETWEEN 6 AND 254
    AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  );