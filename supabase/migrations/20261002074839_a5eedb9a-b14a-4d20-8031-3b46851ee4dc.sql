GRANT EXECUTE ON FUNCTION public.handle_creator_application_decision() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_creator(_user_id uuid, _enable boolean, _brand_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _name text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins may assign creators';
  END IF;
  IF _enable THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'creator'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    IF NOT EXISTS (SELECT 1 FROM public.creators WHERE user_id = _user_id) THEN
      SELECT COALESCE(NULLIF(trim(_brand_name), ''), NULLIF(display_name, ''), NULLIF(full_name, ''), split_part(email, '@', 1), 'Creator')
        INTO _name FROM public.profiles WHERE id = _user_id;
      INSERT INTO public.creators (user_id, brand_name, verified) VALUES (_user_id, COALESCE(_name, 'Creator'), false);
    END IF;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'creator'::app_role;
  END IF;
  INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, meta)
  VALUES (auth.uid(), CASE WHEN _enable THEN 'creator.grant' ELSE 'creator.revoke' END, 'user', _user_id, '{}'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_creator(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_creator(uuid, boolean, text) TO authenticated;