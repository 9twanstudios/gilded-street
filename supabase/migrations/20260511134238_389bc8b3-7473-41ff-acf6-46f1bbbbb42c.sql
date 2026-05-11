
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS attribution jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_events_type_time ON public.events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_qr_slug ON public.orders ((attribution->>'qr_slug'));
CREATE INDEX IF NOT EXISTS idx_orders_ref ON public.orders ((attribution->>'ref'));

CREATE TABLE IF NOT EXISTS public.audience_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  filter jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audience_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view segments" ON public.audience_segments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert segments" ON public.audience_segments FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') AND created_by = auth.uid());
CREATE POLICY "Admins update segments" ON public.audience_segments FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete segments" ON public.audience_segments FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_audience_segments_updated_at
  BEFORE UPDATE ON public.audience_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
