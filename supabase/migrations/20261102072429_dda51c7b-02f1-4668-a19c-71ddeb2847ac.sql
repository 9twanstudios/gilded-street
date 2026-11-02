DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
REVOKE INSERT ON public.orders, public.order_items FROM anon, authenticated;