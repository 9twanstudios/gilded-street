WITH art(drop_slug, drop_title, drop_desc, prod_slug, prod_name, img) AS (VALUES
 ('matatu-culture','Matatu Culture','Nairobi''s rolling art galleries — loud, holy and unapologetic.','matatu-culture-tee','Matatu Culture Tee','/__l5e/assets-v1/1254f597-175b-4ced-b7a3-f03c0c7bc1d0/91fitz-matatu-culture-collage.webp'),
 ('manga-street-lab','Manga Street Lab','Manga panels remixed for the Nairobi streets.','manga-sticker-sheet-tee','Manga Sticker Sheet Tee','/__l5e/assets-v1/e7dd6625-205f-4c42-b5d3-584fc4ab63fd/anime-manga-sticker-sheet-collage.webp'),
 ('badlands-clan','Badlands Clan','One clan, one code.','badlands-clan-crest-tee','Badlands Clan Crest Tee','/__l5e/assets-v1/a898bdbf-aec2-4666-9ed7-b7ae8155f00e/badlands-clan-campfire-crest.webp'),
 ('nganya-culture','Nganya Culture','Bobo Panda and the neon nganyas of Nairobi.','bobo-panda-nganya-tee','Bobo Panda Nganya Tee','/__l5e/assets-v1/8a43f711-de73-494e-bf41-30471dfe6538/bobo-panda-nganya-culture-collage.webp'),
 ('pan-african-icons','Pan-African Icons','Africa unites. Liberation lives.','brother-leader-tee','Brother Leader Tee','/__l5e/assets-v1/d1a4e30b-a5ec-47ed-8d35-e253e2f22da8/brother-leader-africa-poster.webp'),
 ('cyber-shinra','Cyber Shinra','Let the world know pain — cyberpunk anime from the 91 lab.','shinra-tensei-tee','Shinra Tensei Tee','/__l5e/assets-v1/9eb10e61-9010-4dc5-b59a-19e75bb73e43/cyberpunk-shinra-tensei-poster.webp'),
 ('boxing-manifestos','Boxing Manifestos','Float like a butterfly. There is no tomorrow.','float-like-a-butterfly-tee','Float Like a Butterfly Tee','/__l5e/assets-v1/77b05806-e16f-4451-bfb6-79361c3bbdd2/float-like-a-butterfly-sting-like-a-bee.webp'),
 ('boxing-manifestos','Boxing Manifestos','Float like a butterfly. There is no tomorrow.','no-tomorrow-tee','No Tomorrow Tee','/__l5e/assets-v1/dc9e8e5b-eb8b-4c82-aef7-98e11cb77af8/there-is-no-tomorrow-boxer-poster.webp')
), prods AS (
 INSERT INTO public.products (name, slug, description, price, image, category, sizes, in_stock, stock_count, approved, status, drop_type, badge)
 SELECT prod_name, prod_slug, drop_desc, 2500, img, 'T-Shirts', ARRAY['S','M','L','XL','XXL'], true, 25, true, 'approved', 'capsule', 'NEW'
 FROM art ON CONFLICT (slug) DO NOTHING
 RETURNING id, slug
)
INSERT INTO public.drops (title, slug, description, cover_image, drop_date, active, drop_type, product_ids)
SELECT a.drop_title, a.drop_slug, min(a.drop_desc), min(a.img), now(), true, 'capsule', array_agg(p.id)
FROM art a JOIN prods p ON p.slug = a.prod_slug
GROUP BY a.drop_title, a.drop_slug
ON CONFLICT (slug) DO NOTHING;