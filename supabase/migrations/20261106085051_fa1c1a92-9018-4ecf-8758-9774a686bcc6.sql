
-- New capsules (no duplicates)
INSERT INTO public.drops (title, slug, description, narrative, cover_image, drop_date, product_ids, active, drop_type)
SELECT * FROM (VALUES
 ('Rebel Series','rebel-series','Gritty icons, kung-fu kicks and cinema villains. Stay safe, stay real.','rebel','/drops/rebel-social-distance.webp', now(), '{}'::uuid[], true, 'capsule'::drop_type_t),
 ('Solidarity Sessions','solidarity-sessions','Chant Down Babylon. Children of solidarity — Palestine, Congo, Sudan, Nairobi.','unity','/drops/chant-down-babylon.webp', now(), '{}'::uuid[], true, 'capsule'::drop_type_t)
) v(title,slug,description,narrative,cover_image,drop_date,product_ids,active,drop_type)
WHERE NOT EXISTS (SELECT 1 FROM public.drops d WHERE d.slug = v.slug);

INSERT INTO public.products (name, slug, description, price, image, category, sizes, in_stock, stock_count, approved, status, narrative)
SELECT v.name, v.slug, v.description, v.price, v.image, 'T-Shirts', ARRAY['S','M','L','XL','XXL'], true, 20, true, 'approved'::product_status, CASE WHEN v.drop_slug='rebel-series' THEN 'rebel' WHEN v.drop_slug='badlands-clan' THEN 'freedom' ELSE 'unity' END
FROM (VALUES
 ('Social Distance Kick Tee','social-distance-kick-tee','Stay safe, stay real. Rebel Series 002 kung-fu kick graphic.',2500,'/drops/rebel-social-distance.webp','rebel-series'),
 ('Scarface Gritty Tee','scarface-gritty-tee','High-contrast red and black typographic Scarface graphic.',2500,'/drops/scarface-gritty.webp','rebel-series'),
 ('Graincore Cavalry Mask Tee','graincore-cavalry-mask-tee','Monochrome masked portrait, graincore print.',2500,'/drops/graincore-cavalry-mask.webp','rebel-series'),
 ('Uncle Demon Sparta Tee','uncle-demon-sparta-tee','Uncle Demon Govern Grung / Tommy Lee Sparta portrait tee.',2500,'/drops/uncle-demon-tee.webp','rebel-series'),
 ('Chant Down Babylon Tee','chant-down-babylon-tee','Children of solidarity — justice for Palestine, Congo and Sudan.',2500,'/drops/chant-down-babylon.webp','solidarity-sessions'),
 ('Stay Woke Nairobi Tee','stay-woke-nairobi-tee','Stay Woke. Nairobi, Kenya.',2500,'/drops/stay-woke-nairobi-tee.webp','solidarity-sessions'),
 ('Lion of Judah Tee','lion-of-judah-tee','Haile Selassie and the Lion of Judah in Ethiopian colours.',2500,'/drops/lion-of-judah.webp','pan-african-icons'),
 ('Badlands Freedom Street Tee','badlands-freedom-street-tee','Badlands Chronicles: Freedom Street — Pagaza.',2500,'/drops/badlands-freedom-street.webp','badlands-clan'),
 ('Banabana Badlands Defender Tee','banabana-badlands-defender-tee','Banabana Badlands Defender graphic.',2500,'/drops/banabana-defender.webp','badlands-clan'),
 ('Gear 5 Luffy Tee','gear-5-luffy-tee','Gear 5 anime sticker artwork tee.',2500,'/drops/gear-5-luffy.webp','anime-street-lab')
) v(name,slug,description,price,image,drop_slug)
WHERE NOT EXISTS (SELECT 1 FROM public.products p WHERE p.slug = v.slug);

-- Link products into their drops (dedup)
UPDATE public.drops d SET product_ids = ARRAY(SELECT DISTINCT unnest(d.product_ids || ARRAY(
  SELECT p.id FROM public.products p JOIN (VALUES
   ('social-distance-kick-tee','rebel-series'),('scarface-gritty-tee','rebel-series'),('graincore-cavalry-mask-tee','rebel-series'),('uncle-demon-sparta-tee','rebel-series'),
   ('chant-down-babylon-tee','solidarity-sessions'),('stay-woke-nairobi-tee','solidarity-sessions'),('lion-of-judah-tee','pan-african-icons'),
   ('badlands-freedom-street-tee','badlands-clan'),('banabana-badlands-defender-tee','badlands-clan'),('gear-5-luffy-tee','anime-street-lab')
  ) m(ps,ds) ON m.ps = p.slug WHERE m.ds = d.slug)))
WHERE d.slug IN ('rebel-series','solidarity-sessions','pan-african-icons','badlands-clan','anime-street-lab');

-- Full-text search index on products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(category,'') || ' ' || coalesce(narrative,''))) STORED;
CREATE INDEX IF NOT EXISTS products_search_idx ON public.products USING gin(search_vector);

-- FitCheck seed looks (posted by the 91 Fitz admin account)
ALTER TABLE public.fits DROP CONSTRAINT IF EXISTS fits_model_check;
INSERT INTO public.fits (user_id, model, name, items, caption, cover_image, visibility, media_type, estate, vibe, product_ids, featured)
SELECT u.id, 'look', v.caption, '[]'::jsonb, v.caption, v.img, 'public', 'image', v.estate, v.vibe,
  COALESCE(ARRAY(SELECT id FROM public.products WHERE slug = ANY(v.tags)), '{}'::uuid[]), true
FROM auth.users u, (VALUES
 ('The crew. Stone wall, 91 crest.','/fitcheck/crew-stone-wall.webp','Kariobangi','Crew',ARRAY['badlands-clan-tee-onyx']),
 ('Joker Smoker on the block.','/fitcheck/joker-smoker.webp','Eastleigh','Street',ARRAY[]::text[]),
 ('Blue moto, full squad.','/fitcheck/crew-blue-moto.webp','Dandora','Crew',ARRAY[]::text[]),
 ('Banabana Badlands Defender in the wild.','/fitcheck/banabana-duo.webp','Mathare','Badlands',ARRAY['banabana-badlands-defender-tee']),
 ('Three deep by the bike.','/fitcheck/trio-moto.webp','Umoja','Street',ARRAY[]::text[]),
 ('Thumbs up, blue on blue.','/fitcheck/thumbs-up-solo.webp','Westlands','Solo',ARRAY[]::text[])
) v(caption,img,estate,vibe,tags)
WHERE u.email = '9twanstudios@gmail.com'
AND NOT EXISTS (SELECT 1 FROM public.fits f WHERE f.cover_image = v.img);
