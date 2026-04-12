
-- Newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_key UNIQUE (email)
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Notify requests table (restock alerts)
CREATE TABLE public.notify_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  notified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notify_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request notification" ON public.notify_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all notify requests" ON public.notify_requests
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notify requests" ON public.notify_requests
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_notify_requests_product ON public.notify_requests(product_id);
CREATE INDEX idx_notify_requests_email ON public.notify_requests(email);
