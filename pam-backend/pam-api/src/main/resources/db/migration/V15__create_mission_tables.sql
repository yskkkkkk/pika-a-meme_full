-- ============================================================
-- V15: mission_* 테이블 — 미션 시스템 도입
-- ============================================================

-- 미션 정의 (정적 기준 데이터, 코드와 동기화)
CREATE TABLE mission_definitions (
    id             VARCHAR(60)  NOT NULL,
    type           VARCHAR(30)  NOT NULL,   -- ONE_TIME | DAILY | WEEKLY_SHARE | STREAK_3DAYS | HIDDEN
    title          VARCHAR(100) NOT NULL,
    description    VARCHAR(200) NOT NULL,
    reward_amount  INT          NOT NULL,
    is_hidden      BOOLEAN      NOT NULL DEFAULT FALSE,
    display_order  INT,

    CONSTRAINT pk_mission_definitions PRIMARY KEY (id)
);

-- 유저별 미션 달성 이력
CREATE TABLE mission_completions (
    id             UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id        UUID         NOT NULL,
    mission_id     VARCHAR(60)  NOT NULL,
    completed_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    period_key     VARCHAR(20),             -- 'YYYY-Www' (weekly) | 'YYYY-MM-DD' (daily) | NULL (one-time)
    reward_granted INT          NOT NULL,
    metadata       JSONB,                   -- {"tag": "귀여움"} 히든 미션 식별용

    CONSTRAINT pk_mission_completions PRIMARY KEY (id),
    CONSTRAINT fk_mission_completions_user    FOREIGN KEY (user_id)    REFERENCES users(id),
    CONSTRAINT fk_mission_completions_mission FOREIGN KEY (mission_id) REFERENCES mission_definitions(id),
    CONSTRAINT uq_mission_completions UNIQUE (user_id, mission_id, period_key)
);

CREATE INDEX idx_mission_completions_user ON mission_completions (user_id, completed_at DESC);

-- 공유 이벤트 이력 (주간 공유 카운트 집계 소스)
CREATE TABLE mission_share_logs (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    share_type  VARCHAR(30) NOT NULL,   -- INSTAGRAM | KAKAO | OTHER
    shared_at   TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_mission_share_logs PRIMARY KEY (id),
    CONSTRAINT fk_mission_share_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_mission_share_logs_user_week ON mission_share_logs (user_id, shared_at DESC);

-- 연속 방문 상태 (user당 1행)
CREATE TABLE mission_visit_streaks (
    user_id           UUID NOT NULL,
    current_streak    INT  NOT NULL DEFAULT 0,
    last_visit_date   DATE,
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_mission_visit_streaks PRIMARY KEY (user_id),
    CONSTRAINT fk_mission_visit_streaks_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================
-- 초도 미션 데이터
-- ============================================================

INSERT INTO mission_definitions (id, type, title, description, reward_amount, is_hidden, display_order) VALUES
    ('FIRST_LOGIN',         'ONE_TIME',      '최초 로그인',           '회원가입하면 즉시 완료돼요',             1, FALSE, 1),
    ('SHARE_STORY_FIRST',   'ONE_TIME',      '스토리 공유하기',        '완성된 카드를 스토리에 공유해요',          1, FALSE, 2),
    ('SHARE_STORY_WEEKLY',  'WEEKLY_SHARE',  '스토리 3회 공유',        '한 주에 3번 공유할 때마다 지급돼요',       1, FALSE, 3),
    ('GALLERY_10',          'ONE_TIME',      '갤러리 10개 채우기',     '미미카드 10개를 만들면 달성돼요',          1, FALSE, 4),
    ('GALLERY_30',          'ONE_TIME',      '갤러리 30개 채우기',     '미미카드 30개를 만들면 달성돼요',          2, FALSE, 5),
    ('DAILY_VISIT',         'DAILY',         '하루 1번 방문',          '오늘 방문하면 완료돼요',                  1, FALSE, 6),
    ('STREAK_3DAYS',        'STREAK_3DAYS',  '3일 연속 방문',          '3일 연속 방문 시 지급, 이후 재도전 가능', 1, FALSE, 7),
    -- 히든 미션 (태그별)
    ('HIDDEN_THEME_피곤',   'HIDDEN', '#피곤 테마 미미카드 3개 완성',   'SPECIAL 뽑기로 피곤 테마 밈 3개 완성',  1, TRUE, NULL),
    ('HIDDEN_THEME_직장인', 'HIDDEN', '#직장인 테마 미미카드 3개 완성', 'SPECIAL 뽑기로 직장인 테마 밈 3개 완성', 1, TRUE, NULL),
    ('HIDDEN_THEME_기쁨',   'HIDDEN', '#기쁨 테마 미미카드 3개 완성',   'SPECIAL 뽑기로 기쁨 테마 밈 3개 완성',  1, TRUE, NULL),
    ('HIDDEN_THEME_주말',   'HIDDEN', '#주말 테마 미미카드 3개 완성',   'SPECIAL 뽑기로 주말 테마 밈 3개 완성',  1, TRUE, NULL),
    ('HIDDEN_THEME_귀여움', 'HIDDEN', '#귀여움 테마 미미카드 3개 완성', 'SPECIAL 뽑기로 귀여움 테마 밈 3개 완성', 1, TRUE, NULL),
    ('HIDDEN_THEME_분노',   'HIDDEN', '#분노 테마 미미카드 3개 완성',   'SPECIAL 뽑기로 분노 테마 밈 3개 완성',  1, TRUE, NULL),
    ('HIDDEN_THEME_놀람',   'HIDDEN', '#놀람 테마 미미카드 3개 완성',   'SPECIAL 뽑기로 놀람 테마 밈 3개 완성',  1, TRUE, NULL),
    ('HIDDEN_THEME_눈치',   'HIDDEN', '#눈치 테마 미미카드 3개 완성',   'SPECIAL 뽑기로 눈치 테마 밈 3개 완성',  1, TRUE, NULL),
    ('HIDDEN_THEME_광기',   'HIDDEN', '#광기 테마 미미카드 3개 완성',   'SPECIAL 뽑기로 광기 테마 밈 3개 완성',  1, TRUE, NULL),
    ('HIDDEN_THEME_질문',   'HIDDEN', '#질문 테마 미미카드 3개 완성',   'SPECIAL 뽑기로 질문 테마 밈 3개 완성',  1, TRUE, NULL),
    ('HIDDEN_THEME_의지',   'HIDDEN', '#의지 테마 미미카드 3개 완성',   'SPECIAL 뽑기로 의지 테마 밈 3개 완성',  1, TRUE, NULL);
