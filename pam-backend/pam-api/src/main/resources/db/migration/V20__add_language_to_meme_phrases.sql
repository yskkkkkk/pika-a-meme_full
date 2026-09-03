-- ============================================================
-- V20: meme_phrases 언어 컬럼 추가 (i18n)
-- ============================================================

ALTER TABLE meme_phrases
    ADD COLUMN language VARCHAR(8) NOT NULL DEFAULT 'ko';

CREATE INDEX idx_meme_phrases_language ON meme_phrases(language);
