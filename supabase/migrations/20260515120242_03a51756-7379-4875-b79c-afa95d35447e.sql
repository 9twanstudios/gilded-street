
-- INSIGHT LDX v1.1 — SEO + AEO intelligence layer

-- ORDERS: surface attribution columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS traffic_source text,
  ADD COLUMN IF NOT EXISTS seo_landing_page text,
  ADD COLUMN IF NOT EXISTS search_query text;

-- Backfill from existing jsonb attribution
UPDATE public.orders
SET traffic_source = COALESCE(traffic_source, attribution->>'traffic_source'),
    seo_landing_page = COALESCE(seo_landing_page, attribution->>'landing'),
    search_query = COALESCE(search_query, attribution->>'search_query')
WHERE attribution IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_traffic_source ON public.orders(traffic_source);

-- SEO_PAGES: per-URL snapshot
CREATE TABLE IF NOT EXISTS public.seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL UNIQUE,
  entity_type text NOT NULL,
  entity_id uuid,
  title text,
  description text,
  canonical_url text,
  og_image text,
  structured_data jsonb DEFAULT '{}'::jsonb,
  index_status text DEFAULT 'unknown',
  last_crawled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seo_pages" ON public.seo_pages
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view indexed seo_pages" ON public.seo_pages
  FOR SELECT TO public
  USING (index_status IN ('indexed','submitted'));

CREATE TRIGGER trg_seo_pages_updated
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_seo_pages_entity ON public.seo_pages(entity_type, entity_id);

-- SEO_METRICS: daily search performance
CREATE TABLE IF NOT EXISTS public.seo_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  url text,
  date date NOT NULL,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  ctr numeric(6,4) NOT NULL DEFAULT 0,
  avg_position numeric(6,2) NOT NULL DEFAULT 0,
  indexed boolean NOT NULL DEFAULT false,
  crawl_errors integer NOT NULL DEFAULT 0,
  top_query text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, date, url)
);
ALTER TABLE public.seo_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view seo_metrics" ON public.seo_metrics
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Creators view own seo_metrics" ON public.seo_metrics
  FOR SELECT USING (
    entity_type = 'creator' AND entity_id = auth.uid()
    OR (entity_type = 'product' AND EXISTS (
      SELECT 1 FROM public.products p WHERE p.id = entity_id AND p.creator_id = auth.uid()
    ))
  );

CREATE INDEX IF NOT EXISTS idx_seo_metrics_entity_date ON public.seo_metrics(entity_type, entity_id, date DESC);

-- AEO_METRICS: AI-search performance
CREATE TABLE IF NOT EXISTS public.aeo_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  date date NOT NULL,
  ai_referrals integer NOT NULL DEFAULT 0,
  ai_clicks integer NOT NULL DEFAULT 0,
  ai_conversions integer NOT NULL DEFAULT 0,
  structured_data_score numeric(5,2) NOT NULL DEFAULT 0,
  semantic_score numeric(5,2) NOT NULL DEFAULT 0,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, date, source)
);
ALTER TABLE public.aeo_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view aeo_metrics" ON public.aeo_metrics
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Creators view own aeo_metrics" ON public.aeo_metrics
  FOR SELECT USING (
    entity_type = 'creator' AND entity_id = auth.uid()
    OR (entity_type = 'product' AND EXISTS (
      SELECT 1 FROM public.products p WHERE p.id = entity_id AND p.creator_id = auth.uid()
    ))
  );

CREATE INDEX IF NOT EXISTS idx_aeo_metrics_entity_date ON public.aeo_metrics(entity_type, entity_id, date DESC);

-- SEO_ALERTS
CREATE TABLE IF NOT EXISTS public.seo_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  entity_type text,
  entity_id uuid,
  url text,
  message text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seo_alerts" ON public.seo_alerts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_seo_alerts_open ON public.seo_alerts(created_at DESC) WHERE resolved_at IS NULL;
