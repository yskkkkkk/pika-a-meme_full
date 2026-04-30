-- ============================================================
-- V3: memes 테이블 생성 (canvas_state JSONB)
-- ============================================================

CREATE TABLE memes
(
    id              UUID         NOT NULL,
    user_id         UUID         NOT NULL,
    image_key       VARCHAR(500) NOT NULL,
    canvas_state    JSONB        NOT NULL,
    creation_option VARCHAR(20)  NOT NULL,
    heart_type      VARCHAR(20)  NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_memes PRIMARY KEY (id),
    CONSTRAINT fk_memes_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_memes_user_id    ON memes (user_id);
CREATE INDEX idx_memes_created_at ON memes (created_at DESC);
