-- ============================================================
-- V1: 초기 스키마 (users, hearts, heart_histories)
-- ============================================================

-- users ----------------------------------------------------------
CREATE TABLE users
(
    id         UUID         NOT NULL,
    username   VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- hearts (SPECIAL 하트 전용 — BASIC 하트는 Redis SSOT) -----------
CREATE TABLE hearts
(
    id         UUID        NOT NULL,
    user_id    UUID        NOT NULL,
    type       VARCHAR(20) NOT NULL,
    count      INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_hearts PRIMARY KEY (id),
    CONSTRAINT fk_hearts_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uq_hearts_user_type UNIQUE (user_id, type),
    CONSTRAINT ck_hearts_count CHECK (count >= 0)
);

CREATE INDEX idx_hearts_user_id ON hearts (user_id);

-- heart_histories ------------------------------------------------
CREATE TABLE heart_histories
(
    id           UUID        NOT NULL,
    user_id      UUID        NOT NULL,
    heart_type   VARCHAR(20) NOT NULL,
    action       VARCHAR(20) NOT NULL,
    amount       INTEGER     NOT NULL,
    occurred_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    reference_id UUID,

    CONSTRAINT pk_heart_histories PRIMARY KEY (id),
    CONSTRAINT fk_heart_histories_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT ck_heart_histories_amount CHECK (amount > 0)
);

CREATE INDEX idx_heart_histories_user_id    ON heart_histories (user_id);
CREATE INDEX idx_heart_histories_occurred_at ON heart_histories (occurred_at DESC);
