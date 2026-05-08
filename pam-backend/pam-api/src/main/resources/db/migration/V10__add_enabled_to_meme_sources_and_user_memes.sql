-- ============================================================
-- V10: 최근 매칭 밈 공개 조회용 enabled 플래그 추가
-- ============================================================

ALTER TABLE meme_images ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE user_memes ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE;
