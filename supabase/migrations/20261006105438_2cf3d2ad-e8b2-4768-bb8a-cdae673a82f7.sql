ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS sku_variants jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS wulfzz_synced_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_key ON public.products(sku) WHERE sku IS NOT NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS external_ref text,
  ADD COLUMN IF NOT EXISTS wulfzz_order_code text,
  ADD COLUMN IF NOT EXISTS wulfzz_quoted_total integer,
  ADD COLUMN IF NOT EXISTS wulfzz_status text,
  ADD COLUMN IF NOT EXISTS wulfzz_idempotency_key uuid,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_submitted_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS orders_external_ref_key ON public.orders(external_ref) WHERE external_ref IS NOT NULL;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS sku text;