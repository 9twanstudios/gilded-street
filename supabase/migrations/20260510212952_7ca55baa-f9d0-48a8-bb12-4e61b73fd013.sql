
-- Phase 1: Growth pool config
INSERT INTO public.platform_settings (key, value) VALUES ('growth_pool_rate', '0') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.platform_settings (key, value) VALUES ('referral_bounty', '10000') ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS growth_pool_share integer NOT NULL DEFAULT 0;

-- Phase 2: Referrals
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  code text;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
  END LOOP;
  RETURN code;
END;
$$;

-- Backfill existing profiles
UPDATE public.profiles SET referral_code = public.generate_referral_code() WHERE referral_code IS NULL;

-- Update handle_new_user to assign referral code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, referral_code)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email, public.generate_referral_code());

  INSERT INTO public.wallets (user_id) VALUES (NEW.id);

  IF NEW.email = '9twanstudios@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  invitee_id uuid,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | signed_up | converted | rewarded
  reward_amount integer NOT NULL DEFAULT 0,
  converted_order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referrals as referrer" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users view own referrals as invitee" ON public.referrals FOR SELECT USING (auth.uid() = invitee_id);
CREATE POLICY "Admins view all referrals" ON public.referrals FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code);

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 3/4: Attribution + analytics indexes
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS attribution jsonb DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_events_type_created ON public.events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user ON public.events(user_id);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS attribution jsonb DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
