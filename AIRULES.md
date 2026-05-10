# AIRULES.md — pick-a-meme 설계 원칙

> POC 완료 후 v2 전면 개편 기준 문서 (2025-05-04 갱신)  
> 모든 AI 세션은 이 문서를 최우선 컨텍스트로 참조한다.

---

## 0. 행동 지침 (CLAUDE.md 핵심 요약)

- 코딩 전 가정을 명시하고, 불명확하면 멈추고 질문한다.
- 요청 범위 밖의 기능·추상화·에러 핸들링을 추가하지 않는다.
- 수정은 요청한 라인에만 한정한다. 인접 코드를 "개선"하지 않는다.
- 작업 전 검증 기준을 먼저 정의하고, 기준 충족 여부로 완료를 판단한다.

---

## 1. 백엔드 아키텍처 원칙

### 계층 구조
```
pam-api (Delivery) → pam-application (UseCase) → pam-domain (Core)
                                                 ↑
                              pam-infrastructure (Adapters)
```
- `pam-domain` 엔티티는 JPA 어노테이션 없는 순수 Kotlin 객체를 유지한다.
- 비즈니스 불변식은 도메인 엔티티 내부에서 검증한다.

### 영속성 전략 (CQRS 기조)
- **Command:** Spring Data JPA (데이터 정합성, 상태 변경)
- **Query:** jOOQ (복잡한 조회, 통계, 성능 최적화)
- Infrastructure 계층에서 Domain Repository 인터페이스를 구현하여 영속성 세부 사항을 숨긴다.

### 동시성 제어
- **Redisson Distributed Lock:** 하트 차감/충전 Race Condition 방지 필수 적용
- **Redis as SSOT:** BASIC 하트는 Redis 단일 진실 공급원

---

## 2. 밈 소스 구조 (v2 핵심 변경)

이미지와 문구를 분리 보관하고 런타임에 조합한다.

| 테이블 | 내용 | 저장 위치 |
|---|---|---|
| `meme_images` | 말풍선 없는 순수 동물 표정 이미지 | R2 (URL만 DB 저장) |
| `meme_phrases` | 말풍선 안에 들어갈 문구 텍스트 | DB 텍스트 컬럼 |

> 문구를 텍스트로 DB에 저장하는 이유: 디자인 작업 없이 DB 입력만으로 문구 추가/수정 가능.

### DB 스키마

#### meme_images
```sql
id                UUID        PK
image_url         TEXT        -- R2 저장 경로
subject_position  VARCHAR(20) -- 아래 12가지 값 중 하나
tags              JSONB       -- ["피곤", "직장인", "배고픔"]
created_at        TIMESTAMP
```

#### meme_phrases
```sql
id          UUID   PK
text        TEXT   -- 말풍선 안 문구
tags        JSONB  -- ["피곤", "직장인", "배고픔"]
created_at  TIMESTAMP
```

> 두 테이블 모두 `tags` 컬럼에 GIN 인덱스 필수.

### subject_position → 말풍선 위치 매핑

| 값 | 피사체 위치 | 말풍선 배치 |
|---|---|---|
| `top` | 상단 | 하단 |
| `bottom` | 하단 | 상단 |
| `left` | 좌측 | 우측 |
| `right` | 우측 | 좌측 |
| `center` | 중앙 | 상단 or 하단 랜덤 |
| `top_left` | 좌상단 | 우하단 |
| `top_right` | 우상단 | 좌하단 |
| `bottom_left` | 좌하단 | 우상단 |
| `bottom_right` | 우하단 | 좌상단 |
| `full_horizontal` | 좌우 꽉 참 | 상단 or 하단 랜덤 |
| `full_vertical` | 상하 꽉 참 | 좌측 or 우측 랜덤 |
| `full` | 완전히 꽉 참 | 4개 모서리 중 랜덤 |

---

## 3. 하트 타입별 밈 조합 전략

### BASIC 하트 — Random Mix
- 태그 무시
- `meme_images`와 `meme_phrases`에서 각각 독립 랜덤 추출 후 조합
- 맥락 불일치 '병맛' 결과 허용 (무료 서비스의 재미 요소)

### SPECIAL 하트 — Contextual Matching
- 사용자가 **단 하나의 태그만** 선택 (멀티셀렉트 금지)
- 선택한 태그로 이미지군 + 문구군 1차 필터링
- 필터링된 집합 내에서 조합 → 맥락에 맞는 완성도 높은 밈

### API 설계 방향
```
GET /api/memes/compose?heartType=BASIC
GET /api/memes/compose?heartType=SPECIAL&tags=피곤
```
응답: `{ imageUrl, imagePresignedUrl, subjectPosition, phrase, tags }`

### user_memes 저장 정책
- 로그인 유저가 뽑기를 진행하면 `user_memes` 테이블에 자동 저장
- `selected_tag IS NULL` → BASIC 하트 뽑기
- `selected_tag IS NOT NULL` → SPECIAL 하트 뽑기 (선택한 태그 값)
- SPECIAL 뽑기에서 tags 배열의 첫 번째 값이 `selected_tag`에 저장됨
- 소스 데이터(`meme_images`, `meme_phrases`)는 **절대 삭제하지 않는다** (user_memes 이력 재현에 필수)

---

## 4. 프론트엔드 원칙

### 모바일 퍼스트 (절대 원칙)
- 가로 최대 `500px` 중앙 컨테이너. PC에서도 모바일 화면을 노출한다.
- 핵심 기능은 스크롤 없이 한 화면에 들어와야 한다.

### 메인 화면 — 극도의 단순함
비로그인 유저가 마주하는 첫 화면:
1. 로고
2. BASIC 하트 버튼 → 탭 즉시 랜덤 밈 생성
3. SPECIAL 하트 버튼 → 태그 선택 UI → 뽑기 → 결과

### 로그인/서비스 소개 — 별도 화면
- 상단 구석 로그인 버튼 → 모바일 슬라이드 애니메이션으로 전환
- 해당 화면 내용: 서비스 소개, 저장 안내, 소셜 로그인 버튼, 기존 기능 설명 카드들
- 메인 화면에는 설명 없음. 그냥 뽑게 한다.

### 말풍선 렌더링
- 기존 Canvas 합성 방식 → **CSS 절대 포지셔닝** 방식으로 전환
- `subject_position` 값을 백엔드에서 받아 말풍선 위치 자동 결정

---

## 5. 인프라 배포 아키텍처

| 레이어 | 플랫폼 |
|---|---|
| Frontend | Vercel |
| Backend | Railway (Docker 컨테이너) |
| Database | Neon (PostgreSQL) |
| 이미지 스토리지 | Cloudflare R2 |
| 캐시/하트 | Upstash Redis |
| 스키마 관리 | Flyway |

환경 변수(R2 Key, DB, Redis)는 소스 코드에 절대 노출하지 않는다. 배포 플랫폼 환경 변수로 주입한다.

---

## 6. Git 브랜치 전략

모든 작업은 **'Prefix/Domain/Task'** 구조의 브랜치를 기반으로 격리 수행한다.

| 도메인 | 브랜치 예시 |
|---|---|
| `infra/` | `infra/db-v2-schema`, `infra/r2-connection-test` |
| `feat/heart/` | `feat/heart/tag-matching`, `feat/heart/special-grant` |
| `feat/meme/` | `feat/meme/compose-api`, `feat/meme/r2-upload` |
| `feat/front/` | `feat/front/mobile-ui-rebuild`, `feat/front/speech-bubble` |
| `feat/auth/` | `feat/auth/kakao-login` |
| `fix/` | `fix/heart/concurrency-race` |
| `docs/` | `docs/v2-redesign-spec` |

---

## 7. 에이전트 작업 프로토콜

1. `main` 최신화 → 도메인 브랜치 생성
2. 작업 시작 시 `BACKLOG.md` 티켓 상태 `[/]`로 변경
3. 모든 커밋/PR에 티켓 ID 명시
4. 관련 테스트 통과 확인 후 PR 생성
5. 완료 시 `BACKLOG.md` 상태 `[x]` + 완료일 기록

---

## 8. v2 구현 Step 순서

각 Step은 독립 PR로 관리한다.

| Step | 내용 | 브랜치 |
|---|---|---|
| 1 | AIRULES v2 최신화 + BACKLOG/README 재정비 | `docs/v2-redesign-spec` |
| 2 | Flyway V4 — meme_images/meme_phrases 스키마 + GIN 인덱스 | `infra/db-v2-schema` |
| 3 | 하트 타입별 조합 전략 서비스 레이어 (Random Mix / Contextual Matching) | `feat/heart/tag-matching` |
| 4 | 프론트엔드 전면 재구축 (모바일 퍼스트, 말풍선 CSS) | `feat/front/mobile-ui-rebuild` |
