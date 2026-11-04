BEGIN;

-- Merge Matatu + Nganya into one capsule drop
UPDATE public.drops
SET title = 'Matatu & Nganya Culture',
    slug = 'matatu-nganya-culture',
    cover_image = '/drops/matatu-nganya-culture.webp',
    narrative = 'rebel'
WHERE slug = 'matatu-culture';

UPDATE public.drops
SET product_ids = (
  SELECT COALESCE(array_agg(p.id), ARRAY[]::uuid[])
  FROM public.products p
  WHERE p.slug IN ('matatu-culture-tee','bobo-panda-nganya-tee')
)
WHERE slug = 'matatu-nganya-culture';

DELETE FROM public.drops WHERE slug = 'nganya-culture';

-- Merge Manga Street Lab + Cyber Shinra into one anime capsule drop
UPDATE public.drops
SET title = 'Anime Street Lab // Cyber Shinra',
    slug = 'anime-street-lab',
    cover_image = '/drops/anime-street-lab-manga.webp',
    narrative = 'ecosystem'
WHERE slug = 'manga-street-lab';

UPDATE public.drops
SET product_ids = (
  SELECT COALESCE(array_agg(p.id), ARRAY[]::uuid[])
  FROM public.products p
  WHERE p.slug IN ('manga-sticker-sheet-tee','shinra-tensei-tee')
)
WHERE slug = 'anime-street-lab';

DELETE FROM public.drops WHERE slug = 'cyber-shinra';

-- Persist the remaining three capsule covers to /drops/ artwork
UPDATE public.drops SET cover_image = '/drops/boxing-manifestos.webp' WHERE slug = 'boxing-manifestos';
UPDATE public.drops SET cover_image = '/drops/pan-african-icons.webp' WHERE slug = 'pan-african-icons';
UPDATE public.drops SET cover_image = '/drops/badlands-clan.webp' WHERE slug = 'badlands-clan';

COMMIT;