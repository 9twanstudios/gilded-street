
-- New enums
CREATE TYPE public.ledger_type AS ENUM ('deposit', 'purchase', 'payout', 'fee', 'refund');
CREATE TYPE public.ledger_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Wallets table
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Ledger entries table
CREATE TABLE public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.ledger_type NOT NULL,
  amount integer NOT NULL,
  status public.ledger_status NOT NULL DEFAULT 'pending',
  reference text,
  order_id uuid REFERENCES public.orders(id),
  description text,
  idempotency_key text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ledger" ON public.ledger_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all ledger" ON public.ledger_entries
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Withdrawals table
CREATE TABLE public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  status public.withdrawal_status NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can request withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update withdrawals" ON public.withdrawals
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Alter products: add creator_id and approved
ALTER TABLE public.products
  ADD COLUMN creator_id uuid,
  ADD COLUMN approved boolean NOT NULL DEFAULT true;

-- Creator product policies
CREATE POLICY "Creators can insert own products" ON public.products
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'creator') AND auth.uid() = creator_id
  );

CREATE POLICY "Creators can update own products" ON public.products
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'creator') AND auth.uid() = creator_id
  );

-- Alter orders: add payment_reference and creator_id
ALTER TABLE public.orders
  ADD COLUMN payment_reference text,
  ADD COLUMN creator_id uuid;

-- Update handle_new_user to also create wallet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);

  INSERT INTO public.wallets (user_id) VALUES (NEW.id);

  IF NEW.email = '9twanstudios@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  RETURN NEW;
END;
$$;

-- Indexes
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_ledger_user_id ON public.ledger_entries(user_id);
CREATE INDEX idx_ledger_order_id ON public.ledger_entries(order_id);
CREATE INDEX idx_ledger_status ON public.ledger_entries(status);
CREATE INDEX idx_ledger_type ON public.ledger_entries(type);
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_products_creator_id ON public.products(creator_id);
CREATE INDEX idx_orders_creator_id ON public.orders(creator_id);
