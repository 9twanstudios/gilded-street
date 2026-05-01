-- Extend role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'commerce';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support';

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_count INTEGER;

-- QR CAMPAIGNS
CREATE TABLE public.qr_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  campaign_type TEXT NOT NULL DEFAULT 'custom',
  target_id UUID,
  target_slug TEXT,
  hero_image TEXT,
  headline TEXT NOT NULL DEFAULT '',
  subheadline TEXT DEFAULT '',
  cta_label TEXT DEFAULT 'Shop Now',
  cta_url TEXT DEFAULT '/shop',
  variant TEXT DEFAULT 'A',
  variant_of UUID REFERENCES public.qr_campaigns(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.qr_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active campaigns" ON public.qr_campaigns FOR SELECT USING (active = true);
CREATE POLICY "Admins view all campaigns" ON public.qr_campaigns FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert campaigns" ON public.qr_campaigns FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update campaigns" ON public.qr_campaigns FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete campaigns" ON public.qr_campaigns FOR DELETE USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_qr_campaigns_updated BEFORE UPDATE ON public.qr_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- QR SCANS
CREATE TABLE public.qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.qr_campaigns(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  ip_country TEXT,
  ip_city TEXT,
  user_agent TEXT,
  referrer TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log scans" ON public.qr_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view all scans" ON public.qr_scans FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Users view own scans" ON public.qr_scans FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_qr_scans_campaign ON public.qr_scans(campaign_id, scanned_at DESC);

-- EVENTS
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  session_id TEXT,
  page_path TEXT,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view all events" ON public.events FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Users view own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_events_type_time ON public.events(event_type, created_at DESC);
CREATE INDEX idx_events_user ON public.events(user_id, created_at DESC);

-- SEO CLUSTERS
CREATE TABLE public.seo_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL DEFAULT '',
  h1 TEXT NOT NULL,
  hero_image TEXT,
  body_md TEXT NOT NULL DEFAULT '',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  related_product_ids UUID[] NOT NULL DEFAULT '{}',
  related_drop_ids UUID[] NOT NULL DEFAULT '{}',
  related_story_ids UUID[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view published clusters" ON public.seo_clusters FOR SELECT USING (published = true);
CREATE POLICY "Admins view all clusters" ON public.seo_clusters FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert clusters" ON public.seo_clusters FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update clusters" ON public.seo_clusters FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete clusters" ON public.seo_clusters FOR DELETE USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_seo_clusters_updated BEFORE UPDATE ON public.seo_clusters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEO LOCATIONS
CREATE TABLE public.seo_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL DEFAULT '',
  hero_image TEXT,
  body_md TEXT NOT NULL DEFAULT '',
  local_cta_label TEXT DEFAULT 'Shop the Drop',
  local_cta_url TEXT DEFAULT '/drops',
  shipping_note TEXT DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view published locations" ON public.seo_locations FOR SELECT USING (published = true);
CREATE POLICY "Admins view all locations" ON public.seo_locations FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert locations" ON public.seo_locations FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update locations" ON public.seo_locations FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete locations" ON public.seo_locations FOR DELETE USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_seo_locations_updated BEFORE UPDATE ON public.seo_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED CLUSTERS
INSERT INTO public.seo_clusters (slug, title, meta_description, h1, body_md, keywords) VALUES
('african-streetwear', 'African Streetwear | Pan-African Fashion by 91 Fitz', 'Premium Pan-African streetwear forged in Nairobi. Cultural drops, limited uniforms, shipped continent-wide.', 'African Streetwear. Not Merch. Uniform.', E'## A New Generation Wears Its Heritage\n\n91 Fitz is the streetwear arm of a Pan-African cultural movement. Every fit is engineered as a uniform — designed to be worn into the street, the studio, the boardroom, the rally.\n\n## What Makes This Different\n\n- **Heritage figures** silk-screened with intention\n- **Limited drops** — no restocks, no apologies\n- **Sourced and printed in Kenya** — supporting local craft\n- **Worn from Nairobi to Lagos to Johannesburg**', ARRAY['african streetwear','pan african fashion','kenyan streetwear','black owned clothing','nairobi fashion']),
('pan-african-fashion', 'Pan-African Fashion | Cultural Streetwear Drops', 'Pan-African fashion that wears the continent on its sleeve. Limited drops, cultural icons, uniform-grade fits.', 'Pan-African Fashion, Engineered as Uniform', E'## The Brief\n\nFashion is borrowed. Uniform is owned. 91 Fitz makes uniform.\n\n## Drops, Not Collections\n\nWe release in drops. Each one tells a story — a leader, a moment, a movement. Once it''s gone, it''s gone.', ARRAY['pan african fashion','african fashion','cultural streetwear','heritage clothing']),
('marcus-garvey-shirt', 'Marcus Garvey Shirt | Heritage Tee by 91 Fitz', 'The Marcus Garvey shirt. Heavyweight cotton, printed in Nairobi, shipped continent-wide. Limited drop.', 'The Marcus Garvey Shirt', E'## Up You Mighty Race\n\nMarcus Mosiah Garvey gave a generation its posture. This shirt gives it form.\n\n- 240gsm heavyweight cotton\n- Discharge print, no plastisol\n- Sized for the African frame\n- Limited drop, no restock', ARRAY['marcus garvey shirt','garvey tee','black liberation clothing','heritage shirt']),
('sankara-shirt', 'Sankara Shirt | Burkinabé Revolution Tee', 'The Thomas Sankara shirt by 91 Fitz. Heavyweight cotton, revolutionary cut, printed in Nairobi.', 'The Sankara Shirt', E'## La Patrie ou la Mort\n\nThomas Sankara wore the same uniform he asked his country to wear. We honor that with a shirt cut from the same cloth.\n\n- Heavyweight 240gsm cotton\n- Revolutionary red, deep black, military green\n- Printed in Nairobi, shipped continent-wide', ARRAY['sankara shirt','thomas sankara tee','revolutionary fashion','burkinabe clothing']);

-- SEED LOCATIONS (no h1 column — title used as page H1)
INSERT INTO public.seo_locations (slug, city, country, title, meta_description, body_md, shipping_note) VALUES
('nairobi', 'Nairobi', 'Kenya', 'Streetwear in Nairobi | 91 Fitz Same-Day Delivery', '91 Fitz streetwear drops in Nairobi. Same-day delivery within the city. Pan-African heritage on every fit.', E'## Where 91 Fitz Was Born\n\nFrom CBD to Westlands to Eastlands — Nairobi wears 91 Fitz. We print here, ship here, drop here first.\n\n## Same-Day Delivery in Nairobi\n\nOrder before 2pm. Get it before sundown.', 'Same-day delivery available within Nairobi for orders placed before 2pm.'),
('lagos', 'Lagos', 'Nigeria', 'Streetwear in Lagos | 91 Fitz Pan-African Drops', '91 Fitz streetwear shipping to Lagos. Pan-African heritage tees and limited drops, delivered to your door.', E'## From Nairobi to Lagos\n\nThe biggest city on the continent deserves the biggest drops. Shipping 4-7 days from Nairobi to Lagos.', 'Express shipping to Lagos: 4-7 business days.'),
('johannesburg', 'Johannesburg', 'South Africa', 'Streetwear in Johannesburg | 91 Fitz Heritage Drops', '91 Fitz streetwear in Johannesburg. Pan-African heritage, shipped from Nairobi to Jozi.', E'## From Eastleigh to Maboneng\n\n91 Fitz drops landing in Johannesburg. Heritage tees with the weight of the continent stitched in.', 'Express shipping to Johannesburg: 5-9 business days.'),
('mombasa', 'Mombasa', 'Kenya', 'Streetwear in Mombasa | 91 Fitz Coastal Drops', '91 Fitz streetwear delivered to Mombasa. Pan-African heritage, coast-ready cuts.', E'## From the City to the Coast\n\nNairobi made it. Mombasa wears it. Overnight shipping to the coast.', 'Overnight delivery to Mombasa: 1-2 business days.');