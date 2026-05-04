# pick-a-meme

동물 사진과 킹받는 문구를 조합하는 가챠형 밈 생성 서비스.  
이미지와 문구를 분리 보관하고 런타임에 조합하는 구조로, 하트 타입에 따라 랜덤 or 태그 기반 매칭으로 동작한다.

---

## 서비스 핵심 흐름

```
BASIC 하트  → 이미지/문구 각각 랜덤 추출 → 조합 (병맛 허용)
SPECIAL 하트 → 태그 선택 → 필터링된 이미지/문구 조합 → 완성도 높은 밈
```

---

## 아키텍처

### 백엔드 — Clean Architecture + DDD

```
pam-api (REST) → pam-application (UseCase) → pam-domain (Core)
                                            ↑
                         pam-infrastructure (JPA/Redis/R2 Adapters)
```

Domain 엔티티는 JPA 어노테이션 없는 순수 Kotlin 객체. 영속성 세부 사항은 Infrastructure에서 숨긴다.

### 프론트엔드 — 모바일 퍼스트

- 가로 최대 `500px` 중앙 컨테이너. PC에서도 모바일 화면 노출.
- 첫 화면: 로고 + 하트 버튼 2종. 설명 없음.
- 말풍선은 CSS 절대 포지셔닝으로 렌더링 (`subject_position` 기반).

---

## 핵심 DB 구조

| 테이블 | 역할 |
|---|---|
| `meme_images` | 동물 이미지 URL + `subject_position` + `tags` JSONB |
| `meme_phrases` | 말풍선 문구 텍스트 + `tags` JSONB |
| `memes` | 생성된 밈 결과 (이미지 합성 후 R2 저장) |
| `hearts` | SPECIAL 하트 (BASIC은 Redis) |
| `users` | OAuth2 유저 |

---

## Tech Stack

| 레이어 | 기술 |
|---|---|
| Language | Kotlin |
| Framework | Spring Boot 3 |
| Persistence | Spring Data JPA + jOOQ |
| Cache / 하트 | Upstash Redis + Redisson |
| Storage | Cloudflare R2 |
| Schema | Flyway |
| Frontend | Next.js (App Router) + Tailwind CSS |
| Infra | Railway (Backend) / Cloudflare Pages (Frontend) / Neon (DB) |

---

## 로컬 실행

```bash
# 환경 변수 설정
cp .env.local.example .env.local
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
- **API**: @WebMvcTest 슬라이스

---

## AI 협업 문서

| 파일 | 역할 |
|---|---|
| [AIRULES.md](./AIRULES.md) | 설계 원칙 및 v2 구현 기준 (최우선 참조) |
| [BACKLOG.md](./BACKLOG.md) | 칸반 보드 + 프로젝트 결정 사항 SSOT |
| [CLAUDE.md](./CLAUDE.md) | AI 행동 지침 (코딩 전 확인 필수) |
| [INIT_PROMPT.md](./INIT_PROMPT.md) | 최초 설계 사상 청사진 |
