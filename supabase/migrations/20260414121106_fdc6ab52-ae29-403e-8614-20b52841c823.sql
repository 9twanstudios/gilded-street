
-- Create reusable timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  figure_name TEXT,
  figure_image TEXT,
  era TEXT,
  relevance TEXT,
  related_drop_id UUID,
  related_product_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published stories" ON public.stories FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all stories" ON public.stories FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert stories" ON public.stories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update stories" ON public.stories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete stories" ON public.stories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_stories_slug ON public.stories (slug);

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
