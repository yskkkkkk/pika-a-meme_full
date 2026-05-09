-- V10: meme_images에 enabled 컬럼 추가
-- enabled = false 인 이미지는 뽑기에 사용되지 않으며 갤러리에도 노출되지 않음

ALTER TABLE meme_images ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE meme_images SET enabled = false WHERE image_url LIKE '%point_robot%';
