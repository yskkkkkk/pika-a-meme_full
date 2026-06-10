-- ============================================================
-- V19: V18에서 잘못 들어간 subject_position 5건 수정
-- ============================================================

-- 03. 물고기_고양이 (중앙, 양옆 비어있음) -> FULL_VERTICAL
UPDATE meme_images 
SET subject_position = 'FULL_VERTICAL' 
WHERE image_url LIKE '%fish_cat.png%';

-- 04. 행복_동물들 (중앙, 상하단 비어있음) -> FULL_HORIZONTAL
UPDATE meme_images 
SET subject_position = 'FULL_HORIZONTAL' 
WHERE image_url LIKE '%happy_animals.png%';

-- 05. 부자_강아지 (중앙, 양옆 비어있음) -> FULL_VERTICAL
UPDATE meme_images 
SET subject_position = 'FULL_VERTICAL' 
WHERE image_url LIKE '%rich_dog.png%';

-- 06. 호기심_강아지 (중앙, 양옆 비어있음) -> FULL_VERTICAL
UPDATE meme_images 
SET subject_position = 'FULL_VERTICAL' 
WHERE image_url LIKE '%curious_dog.png%';

-- 08. 어이없어하는_강아지 (중앙, 상하단 비어있음) -> FULL_HORIZONTAL
UPDATE meme_images 
SET subject_position = 'FULL_HORIZONTAL' 
WHERE image_url LIKE '%dumbfounded_dog.png%';
