-- V9: user_memes에 selected_tag 컬럼 추가
-- NULL = BASIC 하트 뽑기
-- NOT NULL = SPECIAL 하트 뽑기 (선택한 태그 값)
ALTER TABLE user_memes ADD COLUMN selected_tag VARCHAR(20) NULL;
