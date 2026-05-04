-- ============================================================
-- V4: meme_images, meme_phrases 테이블 생성 (v2 밈 소스 구조)
-- ============================================================

CREATE TABLE meme_images
(
    id               UUID         NOT NULL,
    image_url        TEXT         NOT NULL,
    subject_position VARCHAR(20)  NOT NULL,
    tags             JSONB        NOT NULL DEFAULT '[]',
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_meme_images PRIMARY KEY (id)
);

CREATE INDEX idx_meme_images_tags ON meme_images USING GIN (tags);

CREATE TABLE meme_phrases
(
    id         UUID      NOT NULL,
    text       TEXT      NOT NULL,
    tags       JSONB     NOT NULL DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_meme_phrases PRIMARY KEY (id)
);

CREATE INDEX idx_meme_phrases_tags ON meme_phrases USING GIN (tags);
