-- V18: ì‹ ê·œ ë°ˆ ì†ŒìŠ¤ ì´ë¯¸ì§€ 10ì¢… ì¶”ê°€
INSERT INTO meme_images (id, image_url, subject_position, tags) VALUES
('8dab2534-2ba2-42c1-9fbe-ebf864817dfd', 'https://img.pick-a-me.me/meme-sources/corner_cat.png', 'CENTER', '["ê³ ì–‘ì´","ê·€ì—¬ì›€","í”¼ê³¤"]'::jsonb),
('6f98536f-512f-482c-b33d-69ff47846f45', 'https://img.pick-a-me.me/meme-sources/pillow_dog.png', 'TOP', '["ê°•ì•„ì§€","ê·€ì—¬ì›€"]'::jsonb),
('7d4d1c0c-cb30-40d0-91bc-51e5ffb36227', 'https://img.pick-a-me.me/meme-sources/fish_cat.png', 'CENTER', '["ê³ ì–‘ì´","ìŠ¬í””"]'::jsonb),
('bcb1e460-7abd-489c-add6-408de9568ac6', 'https://img.pick-a-me.me/meme-sources/happy_animals.png', 'CENTER', '["ê¸°ì¨"]'::jsonb),
('491590fc-d11f-40a6-8a94-51baa0d21c35', 'https://img.pick-a-me.me/meme-sources/rich_dog.png', 'CENTER', '["ê°•ì•„ì§€","ë¶€ì"]'::jsonb),
('420173bc-582e-478f-9257-b0b608c7304c', 'https://img.pick-a-me.me/meme-sources/curious_dog.png', 'CENTER', '["ê°•ì•„ì§€","ê´‘ê¸°"]'::jsonb),
('b803cd56-616d-4437-84ff-4f4a232e38e5', 'https://img.pick-a-me.me/meme-sources/confronting_animals.png', 'RIGHT', '["ê´‘ê¸°","ë†€ëŒ"]'::jsonb),
('17c7396d-f487-47c9-895d-dd484058e725', 'https://img.pick-a-me.me/meme-sources/dumbfounded_dog.png', 'CENTER', '["í”¼ê³¤","ê·€ì—¬ì›€"]'::jsonb),
('22c9177e-f73d-44a1-a8db-2337c035a73b', 'https://img.pick-a-me.me/meme-sources/hiding_eyes_seal.png', 'BOTTOM', '["í”¼ê³¤","ê·€ì—¬ì›€"]'::jsonb),
('9d029b7e-da7c-4e54-af8b-9264d9e16fb6', 'https://img.pick-a-me.me/meme-sources/thumbs_up_sloth.png', 'CENTER', '["ì˜ì§€","ê¸°ì¨"]'::jsonb);

-- ============================================================
-- ±âÁ¸ ±âº» µ¥ÀÌÅÍ(V5, V6 µî)¿¡ ÅÂ±× ÀÏ°ı Ãß°¡ ÀÛ¾÷
-- ============================================================

-- "dog"°¡ Æ÷ÇÔµÈ URL¿¡ "°­¾ÆÁö" ÅÂ±× Ãß°¡ (´Ü, ÀÌ¹Ì "°­¾ÆÁö"°¡ ¾øÀ» °æ¿ì)
UPDATE meme_images
SET tags = tags || '["°­¾ÆÁö"]'::jsonb
WHERE image_url LIKE '%dog%' AND NOT tags @> '["°­¾ÆÁö"]'::jsonb;

-- "cat" ¶Ç´Â "kitty"°¡ Æ÷ÇÔµÈ URL¿¡ "°í¾çÀÌ" ÅÂ±× Ãß°¡ (´Ü, ÀÌ¹Ì "°í¾çÀÌ"°¡ ¾øÀ» °æ¿ì)
UPDATE meme_images
SET tags = tags || '["°í¾çÀÌ"]'::jsonb
WHERE (image_url LIKE '%cat%' OR image_url LIKE '%kitty%') AND NOT tags @> '["°í¾çÀÌ"]'::jsonb;
