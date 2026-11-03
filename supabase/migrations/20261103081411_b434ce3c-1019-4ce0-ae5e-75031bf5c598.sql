
-- 1. Atomic, idempotent Pesapal settlement
CREATE OR REPLACE FUNCTION public.settle_order_payment(_tracking_id text, _paid boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  o public.orders%ROWTYPE;
  platform_pct int; growth_pct int; creator_amt int; growth_amt int; fee_amt int;
  bounty int; ref record;
BEGIN
  SELECT * INTO o FROM public.orders WHERE payment_reference = _tracking_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'unknown_tracking_id'); END IF;

  IF NOT _paid THEN
    IF o.status = 'pending' THEN
      UPDATE public.orders SET status = 'cancelled' WHERE id = o.id;
      UPDATE public.ledger_entries SET status = 'failed' WHERE idempotency_key = 'checkout-' || o.id AND status = 'pending';
      UPDATE public.products p SET stock_count = p.stock_count + oi.quantity
        FROM public.order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id AND p.stock_count IS NOT NULL;
    END IF;
    RETURN jsonb_build_object('ok', true, 'order_id', o.id, 'status', 'cancelled');
  END IF;

  IF o.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', true, 'order_id', o.id, 'already_settled', true);
  END IF;

  UPDATE public.orders SET status = 'processing' WHERE id = o.id;
  UPDATE public.ledger_entries SET status = 'completed' WHERE idempotency_key = 'checkout-' || o.id;

  IF o.creator_id IS NOT NULL THEN
    SELECT COALESCE((SELECT value::int FROM public.platform_settings WHERE key='commission_rate'),10) INTO platform_pct;
    SELECT COALESCE((SELECT value::int FROM public.platform_settings WHERE key='growth_pool_rate'),0) INTO growth_pct;
    IF platform_pct + growth_pct > 100 OR platform_pct < 0 OR growth_pct < 0 THEN
      RAISE EXCEPTION 'Invalid commission configuration';
    END IF;
    creator_amt := floor(o.total * (100 - platform_pct - growth_pct) / 100.0);
    growth_amt := floor(o.total * growth_pct / 100.0);
    fee_amt := o.total - creator_amt - growth_amt;

    INSERT INTO public.wallets (user_id, balance, currency) VALUES (o.creator_id, 0, 'KES')
      ON CONFLICT (user_id) DO NOTHING;
    UPDATE public.wallets SET balance = balance + creator_amt WHERE user_id = o.creator_id;
    INSERT INTO public.ledger_entries (user_id,type,amount,status,reference,order_id,description,idempotency_key) VALUES
      (o.creator_id,'deposit',creator_amt,'completed',_tracking_id,o.id,'Sale revenue for order '||left(o.id::text,8),'creator-credit-'||o.id),
      (o.user_id,'fee',fee_amt,'completed',_tracking_id,o.id,'Platform fee for order '||left(o.id::text,8),'platform-fee-'||o.id);
    IF growth_amt > 0 THEN
      INSERT INTO public.ledger_entries (user_id,type,amount,status,reference,order_id,description,idempotency_key)
      VALUES (o.user_id,'fee',growth_amt,'completed',_tracking_id,o.id,'Growth pool for order '||left(o.id::text,8),'growth-pool-'||o.id);
    END IF;
    INSERT INTO public.commissions (order_id,creator_id,order_total,platform_fee,creator_earnings,growth_pool_share,attribution)
    VALUES (o.id,o.creator_id,o.total,fee_amt,creator_amt,growth_amt,COALESCE(o.attribution,'{}'::jsonb));
  END IF;

  -- Referral bounty (whole KES), once per referral
  SELECT * INTO ref FROM public.referrals WHERE invitee_id = o.user_id AND status IN ('signed_up','pending') LIMIT 1 FOR UPDATE;
  IF FOUND THEN
    SELECT COALESCE((SELECT value::int FROM public.platform_settings WHERE key='referral_bounty'),100) INTO bounty;
    INSERT INTO public.wallets (user_id, balance, currency) VALUES (ref.referrer_id, 0, 'KES') ON CONFLICT (user_id) DO NOTHING;
    UPDATE public.wallets SET balance = balance + bounty WHERE user_id = ref.referrer_id;
    INSERT INTO public.ledger_entries (user_id,type,amount,status,reference,order_id,description,idempotency_key)
    VALUES (ref.referrer_id,'deposit',bounty,'completed',_tracking_id,o.id,'Referral bounty','referral-bounty-'||ref.id);
    UPDATE public.referrals SET status='rewarded', reward_amount=bounty, converted_order_id=o.id WHERE id = ref.id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'order_id', o.id, 'status', 'processing');
END $$;

-- uniqueness that guarantees one settlement
CREATE UNIQUE INDEX IF NOT EXISTS ledger_entries_idempotency_key_uidx ON public.ledger_entries(idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS commissions_order_id_uidx ON public.commissions(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS wallets_user_id_uidx ON public.wallets(user_id);

-- 2. Atomic stock reservation
CREATE OR REPLACE FUNCTION public.reserve_stock(_items jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE it record; n int;
BEGIN
  FOR it IN SELECT (x->>'product_id')::uuid pid, SUM((x->>'quantity')::int) qty
            FROM jsonb_array_elements(_items) x GROUP BY 1 LOOP
    UPDATE public.products SET stock_count = stock_count - it.qty
      WHERE id = it.pid AND (stock_count IS NULL OR stock_count >= it.qty);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n = 0 THEN RAISE EXCEPTION 'OUT_OF_STOCK:%', it.pid; END IF;
    UPDATE public.products SET in_stock = false WHERE id = it.pid AND stock_count = 0;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.release_stock(_order_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.products p SET stock_count = p.stock_count + oi.quantity, in_stock = true
  FROM public.order_items oi WHERE oi.order_id = _order_id AND oi.product_id = p.id AND p.stock_count IS NOT NULL;
$$;

REVOKE EXECUTE ON FUNCTION public.settle_order_payment(text, boolean), public.reserve_stock(jsonb), public.release_stock(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_order_payment(text, boolean), public.reserve_stock(jsonb), public.release_stock(uuid) TO service_role;

-- 3. Withdrawals: validated request + atomic admin decision
CREATE OR REPLACE FUNCTION public.validate_withdrawal_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bal int; pending int;
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN RAISE EXCEPTION 'Amount must be a positive whole KES value'; END IF;
  SELECT COALESCE(balance,0) INTO bal FROM public.wallets WHERE user_id = NEW.user_id;
  SELECT COALESCE(SUM(amount),0) INTO pending FROM public.withdrawals WHERE user_id = NEW.user_id AND status = 'pending';
  IF NEW.amount + pending > COALESCE(bal,0) THEN RAISE EXCEPTION 'Withdrawal exceeds available balance'; END IF;
  NEW.status := 'pending'; NEW.processed_at := NULL; NEW.admin_note := NULL;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_validate_withdrawal ON public.withdrawals;
CREATE TRIGGER trg_validate_withdrawal BEFORE INSERT ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.validate_withdrawal_request();

CREATE OR REPLACE FUNCTION public.decide_withdrawal(_id uuid, _approve boolean, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w public.withdrawals%ROWTYPE; n int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO w FROM public.withdrawals WHERE id = _id FOR UPDATE;
  IF NOT FOUND OR w.status <> 'pending' THEN RAISE EXCEPTION 'Withdrawal is not pending'; END IF;
  IF _approve THEN
    UPDATE public.wallets SET balance = balance - w.amount WHERE user_id = w.user_id AND balance >= w.amount;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n = 0 THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
    INSERT INTO public.ledger_entries (user_id,type,amount,status,description,idempotency_key)
    VALUES (w.user_id,'payout',w.amount,'pending','Withdrawal approved — awaiting payout','withdrawal-'||w.id);
  END IF;
  UPDATE public.withdrawals SET status = CASE WHEN _approve THEN 'approved'::withdrawal_status ELSE 'rejected'::withdrawal_status END,
    admin_note = _note, processed_at = now() WHERE id = _id;
  PERFORM public.log_admin_action(CASE WHEN _approve THEN 'withdrawal.approved' ELSE 'withdrawal.rejected' END, 'withdrawal', _id, '{}'::jsonb);
END $$;
REVOKE EXECUTE ON FUNCTION public.decide_withdrawal(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_withdrawal(uuid, boolean, text) TO authenticated;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.withdrawals;

-- 4. Creators cannot self-approve
CREATE OR REPLACE FUNCTION public.enforce_product_moderation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.status := 'pending'; NEW.approved := false;
    IF TG_OP = 'UPDATE' THEN NEW.creator_id := OLD.creator_id; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_product_moderation ON public.products;
CREATE TRIGGER trg_product_moderation BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.enforce_product_moderation();

-- 5. Referral bounty in whole KES
UPDATE public.platform_settings SET value = '100', updated_at = now() WHERE key = 'referral_bounty' AND value = '10000';

-- 6. FitCheck looks reuse the existing fits table
ALTER TABLE public.fits
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS estate text,
  ADD COLUMN IF NOT EXISTS vibe text,
  ADD COLUMN IF NOT EXISTS product_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.fits ALTER COLUMN model SET DEFAULT 'look';
ALTER TABLE public.fits ALTER COLUMN items SET DEFAULT '[]'::jsonb;
GRANT SELECT ON public.fits, public.fit_likes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fits, public.fit_likes TO authenticated;
GRANT ALL ON public.fits, public.fit_likes TO service_role;
CREATE INDEX IF NOT EXISTS fits_public_created_idx ON public.fits(created_at DESC) WHERE visibility = 'public';
