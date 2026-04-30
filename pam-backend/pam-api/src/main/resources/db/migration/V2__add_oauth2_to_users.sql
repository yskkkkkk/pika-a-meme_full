-- ============================================================
-- V2: users 테이블에 OAuth2 컬럼 추가
-- ============================================================

ALTER TABLE users
    ADD COLUMN provider    VARCHAR(20)  NOT NULL DEFAULT 'KAKAO',
    ADD COLUMN provider_id VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE users
    ALTER COLUMN provider  DROP DEFAULT,
    ALTER COLUMN provider_id DROP DEFAULT;

ALTER TABLE users
    ADD CONSTRAINT uq_users_provider UNIQUE (provider, provider_id);
