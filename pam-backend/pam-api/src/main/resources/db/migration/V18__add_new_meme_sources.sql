-- V18: 신규 밈 소스 이미지 10종 추가
INSERT INTO meme_images (id, image_url, subject_position, tags) VALUES
('8dab2534-2ba2-42c1-9fbe-ebf864817dfd', 'https://img.pick-a-me.me/meme-sources/corner_cat.png', 'CENTER', '["고양이","귀여움","피곤"]'::jsonb),
('6f98536f-512f-482c-b33d-69ff47846f45', 'https://img.pick-a-me.me/meme-sources/pillow_dog.png', 'TOP', '["강아지","귀여움"]'::jsonb),
('7d4d1c0c-cb30-40d0-91bc-51e5ffb36227', 'https://img.pick-a-me.me/meme-sources/fish_cat.png', 'CENTER', '["고양이","슬픔"]'::jsonb),
('bcb1e460-7abd-489c-add6-408de9568ac6', 'https://img.pick-a-me.me/meme-sources/happy_animals.png', 'CENTER', '["기쁨"]'::jsonb),
('491590fc-d11f-40a6-8a94-51baa0d21c35', 'https://img.pick-a-me.me/meme-sources/rich_dog.png', 'CENTER', '["강아지","부자"]'::jsonb),
('420173bc-582e-478f-9257-b0b608c7304c', 'https://img.pick-a-me.me/meme-sources/curious_dog.png', 'CENTER', '["강아지","광기"]'::jsonb),
('b803cd56-616d-4437-84ff-4f4a232e38e5', 'https://img.pick-a-me.me/meme-sources/confronting_animals.png', 'RIGHT', '["광기","놀람"]'::jsonb),
('17c7396d-f487-47c9-895d-dd484058e725', 'https://img.pick-a-me.me/meme-sources/dumbfounded_dog.png', 'CENTER', '["피곤","귀여움"]'::jsonb),
('22c9177e-f73d-44a1-a8db-2337c035a73b', 'https://img.pick-a-me.me/meme-sources/hiding_eyes_seal.png', 'BOTTOM', '["피곤","귀여움"]'::jsonb),
('9d029b7e-da7c-4e54-af8b-9264d9e16fb6', 'https://img.pick-a-me.me/meme-sources/thumbs_up_sloth.png', 'CENTER', '["의지","기쁨"]'::jsonb);

-- ============================================================
-- 기존 기본 데이터(V5, V6 등)에 태그 일괄 추가 작업
-- ============================================================

-- "dog"가 포함된 URL에 "강아지" 태그 추가 (단, 이미 "강아지"가 없을 경우)
UPDATE meme_images
SET tags = tags || '["강아지"]'::jsonb
WHERE image_url LIKE '%dog%' AND NOT tags @> '["강아지"]'::jsonb;

-- "cat" 또는 "kitty"가 포함된 URL에 "고양이" 태그 추가 (단, 이미 "고양이"가 없을 경우)
UPDATE meme_images
SET tags = tags || '["고양이"]'::jsonb
WHERE (image_url LIKE '%cat%' OR image_url LIKE '%kitty%') AND NOT tags @> '["고양이"]'::jsonb;
