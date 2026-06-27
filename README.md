# pick-a-meme

동물 사진과 킹받는 문구를 조합하는 가챠형 밈 생성 서비스.  
이미지와 문구를 분리 보관하고 런타임에 조합하는 구조로, 하트 타입에 따라 랜덤 or 태그 기반 매칭으로 동작한다.

---

## 서비스 핵심 흐름

```
BASIC 하트  → 이미지/문구 각각 랜덤 추출 → 조합 (병맛 허용)
SPECIAL 하트 → 단일 태그 선택 → 필터링된 이미지/문구 조합 → 완성도 높은 밈
```

---

## 아키텍처

### 인프라 구조

```
                        ┌─────────────────────────────┐
                        │      Cloudflare              │
                        │  DNS Proxy · WAF · Edge Cache│
                        └────────┬────────┬────────────┘
                                 │        │
              ┌──────────────────┘        └─────────────────┐
              ▼                                             ▼
   ┌──────────────────┐                        ┌──────────────────────┐
   │      Vercel       │                        │  OCI (Ubuntu 24.04)  │
   │  pick-a-me.me    │ ──── API 호출 ────────▶│  api.pick-a-me.me    │
   │  (Next.js)        │                        │  Nginx + Spring Boot  │
   └──────────────────┘                        └────────┬─────────────┘
                                                        │
                                   ┌────────────────────┼──────────────┐
                                   ▼                    ▼              ▼
                         ┌──────────────┐   ┌────────────────┐  ┌──────────┐
                         │  Neon (PG)   │   │ Upstash (Redis)│  │  R2      │
                         │  Singapore   │   │   Singapore    │  │  img.*   │
                         └──────────────┘   └────────────────┘  └──────────┘
```

모든 외부 트래픽은 Cloudflare Proxy(주황 구름)를 통과한다.  
원본 서버(OCI, Vercel) IP는 외부에 노출되지 않는다.

### 백엔드 — Clean Architecture + DDD

```
pam-api (REST) → pam-application (UseCase) → pam-domain (Core)
                                            ↑
                         pam-infrastructure (JPA/Redis/R2 Adapters)
```

- `pam-domain` 엔티티는 JPA 어노테이션 없는 순수 Kotlin 객체를 유지한다.
- 비즈니스 불변식은 도메인 엔티티 내부에서 검증한다.
- Command는 Spring Data JPA, Query는 필요 시 네이티브 쿼리로 처리한다.

### 프론트엔드 — 모바일 퍼스트

- 가로 최대 `500px` 중앙 컨테이너. PC에서도 모바일 화면 노출.
- 첫 화면: 로고 + 하트 버튼 2종. 설명 없음.
- 말풍선은 CSS 절대 포지셔닝으로 렌더링 (`subject_position` 기반).

---

## Security & Infrastructure

### 인증 — HttpOnly Cookie JWT

OAuth2 로그인 성공 후 백엔드가 `pam_token` JWT를 `HttpOnly`, `Secure`, `SameSite=Lax` 쿠키로 발급한다.  
`pick-a-me.me`와 `api.pick-a-me.me`는 동일 등록 도메인이므로 Lax 정책으로 쿠키가 자동 전송된다.  
프론트엔드는 토큰에 직접 접근하지 않으며, XSS로 토큰을 탈취할 수 없다.

### DDoS 방어

- Cloudflare Proxy가 L3/L4/L7 대규모 공격을 흡수한다.
- 백엔드 Redis Rate Limiting이 OCI 서버·DB·R2 비용 폭탄을 방지한다.
- 엔드포인트 위험도별 독립 규칙 적용 (compose, meme-create, oauth2, auth-me).

### Origin Shielding

OCI Security List에서 80/443 포트를 Cloudflare IP 대역만 허용하여 오리진 직접 접근을 차단한다.  
`CF-Connecting-IP` 헤더 기반 Rate Limiting으로 Cloudflare를 경유한 요청만 정상 처리된다.

### CORS

`CORS_ALLOWED_ORIGINS` 환경 변수로 허용 Origin을 운영 환경에서 명시 지정한다.  
`allowCredentials = true` + `SameSite=Lax` 조합으로 불필요한 preflight를 최소화한다.

### R2 Egress Fee 0원

Cloudflare R2에 커스텀 도메인(`img.pick-a-me.me`)을 연결하면 R2 → 브라우저 데이터 전송에 대한 Egress Fee가 발생하지 않는다.  
Cloudflare Edge 캐싱으로 이미지 서빙 응답 속도도 개선된다.

---

## 핵심 DB 구조

| 테이블 | 역할 |
|---|---|
| `meme_images` | 동물 이미지 URL(`img.pick-a-me.me`) + `subject_position` + `tags` JSONB |
| `meme_phrases` | 말풍선 문구 텍스트 + `tags` JSONB |
| `user_memes` | 뽑기 이력 스냅샷 (composition JSONB + `selected_tag`) |
| `memes` | 최종 저장된 밈 (image_key + canvas_state) |
| `hearts` | SPECIAL 하트 (BASIC은 Upstash Redis) |
| `users` | OAuth2 유저 |
| `mission_definitions` | 미션 정의 (type, title, rewardAmount, isHidden, displayOrder) |
| `mission_completions` | 미션 달성 이력 — userId + missionId + periodKey UNIQUE (중복 지급 방지) |
| `mission_share_logs` | 공유 로그 (주간 공유 횟수 집계용) |
| `mission_visit_streaks` | 연속 방문 현황 (currentStreak, lastVisitDate) |

> `selected_tag IS NULL` = BASIC 뽑기, `IS NOT NULL` = SPECIAL 뽑기 (선택한 태그 값)

---

## Tech Stack

| 레이어 | 기술 |
|---|---|
| Language | Kotlin |
| Framework | Spring Boot 3 |
| Persistence | Spring Data JPA + Flyway |
| Cache / 하트 | Upstash Redis + Redisson |
| Storage | Cloudflare R2 (`img.pick-a-me.me`) |
| Frontend | Next.js (App Router) + Tailwind CSS |
| Auth | Spring Security OAuth2 (Kakao, Google) + JWT HttpOnly Cookie |
| DNS / WAF | Cloudflare Proxy |
| Frontend 배포 | Vercel (`pick-a-me.me`) |
| Backend 배포 | OCI — Docker + Nginx (`api.pick-a-me.me`) |
| Database | Neon PostgreSQL (Singapore) |

---

## 로컬 실행

```bash
# 백엔드 환경 변수 설정
cp pam-backend/.env.local.example pam-backend/.env.local
# 값 채워넣기

# 백엔드
cd pam-backend
./gradlew :pam-api:bootRun

# 프론트엔드
cd pam-frontend
npm install && npm run dev
```

---

## 테스트

```bash
cd pam-backend
./gradlew test
```

- **Domain**: JUnit 5 + AssertJ (Spring 없음)
- **Application**: Mockito + JUnit 5
- **API**: `@WebMvcTest` 슬라이스

---

## Roadmap

- [ ] **JWT Refresh Token 회전** — Access Token TTL 단축(15분) + Refresh Token rotation + `jti` Redis denylist.
- [ ] **인프라 모니터링 강화** — OCI CPU/Memory, Neon slow query, Upstash command count, R2 operation count 대시보드 및 임계치 알림.
- [ ] **Sentry 에러 트래킹** — 프론트/백엔드 에러 집중 수집 및 Slack 알림 연동.
- [ ] **헬스체크 엔드포인트** — DB/Redis/R2 외부 의존성 상태 점검 포함.

---

## AI 협업 문서

| 파일 | 역할 |
|---|---|
| [AIRULES.md](./AIRULES.md) | 설계 원칙 및 v2 구현 기준 (최우선 참조) |
| [BACKLOG.md](./BACKLOG.md) | 칸반 보드 + 프로젝트 결정 사항 SSOT |
| [CLAUDE.md](./CLAUDE.md) | AI 행동 지침 (코딩 전 확인 필수) |
| [INIT_PROMPT.md](./INIT_PROMPT.md) | 최초 설계 사상 청사진 | 
