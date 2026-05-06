-- ============================================================
-- V7: user_memes — 유저 밈 생성 이력
-- ============================================================

CREATE TABLE user_memes (
    id             UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id        UUID        NOT NULL,
    image_id       UUID        NOT NULL,
    phrase_id      UUID        NOT NULL,
    heart_type     VARCHAR(10) NOT NULL,
    composition    JSONB       NOT NULL,  -- { imageUrl, subjectPosition, phraseText }
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_user_memes PRIMARY KEY (id),
    CONSTRAINT fk_user_memes_user   FOREIGN KEY (user_id)   REFERENCES users(id),
    CONSTRAINT fk_user_memes_image  FOREIGN KEY (image_id)  REFERENCES meme_images(id),
    CONSTRAINT fk_user_memes_phrase FOREIGN KEY (phrase_id) REFERENCES meme_phrases(id)
);

CREATE INDEX idx_user_memes_user_created ON user_memes (user_id, created_at DESC);
