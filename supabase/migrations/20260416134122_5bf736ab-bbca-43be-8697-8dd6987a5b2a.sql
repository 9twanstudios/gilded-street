
-- 1. Creators table
CREATE TABLE public.creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  bio text DEFAULT '',
  logo_url text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified creators" ON public.creators FOR SELECT USING (verified = true);
CREATE POLICY "Creators can view own profile" ON public.creators FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Creators can update own profile" ON public.creators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert own creator profile" ON public.creators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all creators" ON public.creators FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any creator" ON public.creators FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete creators" ON public.creators FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 2. Commissions table
CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL,
  order_total integer NOT NULL,
  platform_fee integer NOT NULL,
  creator_earnings integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all commissions" ON public.commissions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Creators can view own commissions" ON public.commissions FOR SELECT USING (auth.uid() = creator_id);

-- 3. Platform settings table
CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.platform_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'));

INSERT INTO public.platform_settings (key, value) VALUES ('commission_rate', '10');

-- 4. Product status enum + migration
CREATE TYPE public.product_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.products ADD COLUMN status public.product_status NOT NULL DEFAULT 'pending';

-- Migrate existing data
UPDATE public.products SET status = 'approved' WHERE approved = true;
UPDATE public.products SET status = 'pending' WHERE approved = false;

-- Update RLS: replace "Anyone can view products" with status-aware policy
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view approved products" ON public.products FOR SELECT USING (status = 'approved');
CREATE POLICY "Creators can view own products" ON public.products FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT USING (has_role(auth.uid(), 'admin'));
