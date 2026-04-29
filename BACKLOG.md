# 📋 프로젝트 백로그 (BACKLOG.md)

## 🏷️ 분류 정의 (Category Definitions)
- **[인프라/공통]**: 빌드 설정, 인프라 연결, 공통 모듈 및 유틸리티.
- **[회원/인증]**: 유저 도메인, 소셜 로그인, 권한 관리 및 세션.
- **[하트/스테미나]**: 하트 소모/충전 로직, 분산 락, 스케줄링.
- **[밈/이미지]**: 밈 생성/조회, JSONB 데이터, R2/S3 스토리지 업로드.
- **[프론트엔드]**: Next.js 페이지, 컴포넌트, 상태 관리, API 연동.
- **[문서/기타]**: 프로젝트 가이드라인, 백로그 관리, 설계 기록 및 문서화.

---

## 🗂️ 칸반 보드 (Kanban Board)

| ID | 분류 | 상태 | 내용 | 연관 | 일자 |
| :--- | :--- | :---: | :--- | :--- | :--- |
| TASK-260429-01 | [인프라/공통] | [x] | Gradle 멀티 모듈 및 루트 프로젝트 설정 | - | 260429 / 260429 |
| TASK-260429-02 | [회원/인증] | [x] | pam-domain 모듈 구현 (User, UserRepository, Event) | - | 260429 / 260429 |
| TASK-260429-03 | [회원/인증] | [x] | pam-application 모듈 구현 (회원가입 서비스, 하트 리스너) | - | 260429 / 260429 |
| TASK-260429-04 | [인프라/공통] | [x] | pam-infrastructure 모듈 구현 (JPA 어댑터, Redis 기본 설정) | - | 260429 / 260429 |
| TASK-260429-05 | [인프라/공통] | [x] | pam-api 모듈 구현 (Spring Boot 앱 진입점) | - | 260429 / 260429 |
| TASK-260429-06 | [인프라/공통] | [ ] | jOOQ Codegen Gradle 설정 및 인프라 레이어 연동 | - | 260429 / - |
| TASK-260429-07 | [하트/스테미나] | [x] | Redisson 분산 락 구현 및 하트 충전/소모 로직 적용 | TASK-260429-03 | 260429 / 260429 |
| TASK-260429-08 | [밈/이미지] | [ ] | Meme 도메인 엔티티 및 영속성 레이어 구현 (JSONB 매핑) | - | 260429 / - |
| TASK-260429-09 | [밈/이미지] | [ ] | 밈 생성 및 전체/개별 조회 REST API 구현 | - | 260429 / - |
| TASK-260429-10 | [문서/기타] | [x] | 프로젝트 문서화 (AIRULES, BACKLOG 시스템 구축) | [!] 외부 요청 | 260429 / 260429 |
| TASK-260429-11 | [문서/기타] | [x] | INIT_PROMPT.md 생성 및 초기 프롬프트 저장 | [!] 외부 요청 | 260429 / 260429 |
| TASK-260429-12 | [인프라/공통] | [ ] | DB 형상 관리를 위한 Flyway 설정 및 초기 DDL 작성 | - | 260429 / - |
| TASK-260429-13 | [인프라/공통] | [ ] | 공통 API 응답 규격 및 GlobalExceptionHandler 구현 | - | 260429 / - |
| TASK-260429-14 | [인프라/공통] | [ ] | 로깅 전략 수립 및 MDC 기반 Request ID 추적 구현 | - | 260429 / - |
| TASK-260429-15 | [문서/기타] | [x] | Phase 1 종료 및 Baseline(v0.1.0) 설정 | [!] 외부 요청 | 260429 / 260429 |
| TASK-260429-16 | [문서/기타] | [x] | README.md 작성 및 프로젝트 이정표 수립 | [!] 외부 요청 | 260429 / 260429 |
| TASK-260429-17 | [밈/이미지] | [ ] | Meme 도메인 엔티티 및 MemeCreationPolicy 구현 (BASIC/SPECIAL 옵션 분기) | TASK-260429-08 | 260429 / - |
| TASK-260429-18 | [밈/이미지] | [ ] | MemeCreationService 구현 (HeartService + MemeFactory 오케스트레이션) | TASK-260429-17, TASK-260429-07 | 260429 / - |
| TASK-260429-19 | [밈/이미지] | [ ] | Cloudflare R2 스토리지 어댑터 구현 (이미지 업로드, presigned URL 발급) | - | 260429 / - |
| TASK-260429-20 | [밈/이미지] | [ ] | 밈 생성 및 조회 REST API 구현 (POST /api/memes, GET /api/memes) | TASK-260429-18, TASK-260429-09 | 260429 / - |
| TASK-260429-21 | [하트/스테미나] | [ ] | Heart REST API 구현 (GET /api/hearts — 현재 하트 현황 조회) | TASK-260429-07 | 260429 / - |
| TASK-260429-22 | [하트/스테미나] | [ ] | SPECIAL 하트 지급 트리거 정의 및 구현 (조건 달성 이벤트 → grantSpecialHeart) | TASK-260429-07 | 260429 / - |
| TASK-260429-23 | [프론트엔드] | [ ] | 프론트엔드 프로젝트 초기 설정 (Next.js 14 App Router, Tailwind, API 클라이언트) | - | 260429 / - |
| TASK-260429-24 | [프론트엔드] | [ ] | Canvas 에디터 컴포넌트 구현 (동물 사진 + 텍스트/스티커 합성, canvas_state 직렬화) | TASK-260429-23 | 260429 / - |
| TASK-260429-25 | [프론트엔드] | [ ] | 하트 상태 바 컴포넌트 구현 (잔여 하트 표시, BASIC 충전 타이머 카운트다운) | TASK-260429-23 | 260429 / - |
| TASK-260429-26 | [프론트엔드] | [ ] | 밈 생성 플로우 페이지 구현 (하트 타입 선택 → Canvas 편집 → 저장/공유) | TASK-260429-24, TASK-260429-25 | 260429 / - |
| TASK-260429-27 | [프론트엔드] | [ ] | 밈 갤러리 피드 페이지 구현 (생성된 밈 목록 조회, 무한 스크롤) | TASK-260429-23 | 260429 / - |

---

## 🏗️ 프로젝트 결정 사항 (Project Decisions)

### 인프라 (Infrastructure)
- **Database:** NEON (PostgreSQL 17) / Region: Singapore
- **Cache/Stamina:** Upstash (Redis) / Region: Singapore / Strategy: Eviction Disabled
- **Storage:** Cloudflare R2 (S3 API Compatible)

### 하트 시스템 (Heart System)
- **BASIC 하트:** Redis SSOT, Lazy Charging (5분/1개, 최대 5개), Redisson 분산 락
- **SPECIAL 하트:** JPA(DB) SSOT, 조건/이벤트 기반 지급, 시간 제한 없음
- **HeartRepository 라우팅:** BASIC → Redis, SPECIAL → JPA (CompositeHeartRepositoryAdapter)
- **이력:** heart_histories 테이블 (CONSUME/CHARGE/GRANT 모두 기록 — 운영 핵심 지표)

### 밈 생성 정책 (Meme Creation Policy)
- **BASIC 하트 사용 시:** 기본 템플릿 고정, 텍스트 1개
- **SPECIAL 하트 사용 시:** 폰트 변경, 스티커 추가, 확장 카테고리 템플릿 허용
- **이미지 합성:** 프론트엔드에서 합성 후 결과 이미지 업로드 (canvas_state JSON + 이미지 Blob 동시 전송)
- **저장 구조:** canvas_state → JSONB(DB), 합성 이미지 → Cloudflare R2

---

## 📖 사용 방법 (Usage Rules)

### 1. 분류 및 확장 규칙
- 상단의 **'분류 정의'**를 기반으로 티켓을 할당합니다.
- 새로운 성격의 작업이 발생할 경우 AI가 스스로 **새 카테고리를 정의**할 수 있으며, 이 경우 '분류 정의' 섹션을 즉시 업데이트합니다.

### 2. 작업 처리 프로세스
- **정규 작업 (Planned):** Phase별 계획에 따라 AI가 스스로 티켓을 생성하고 `[ ]` 상태로 둡니다. 작업을 시작하면 `[/]`로 변경하고, 완료 시 `[x]`와 완료일을 기록합니다.
- **외부 요청 (Ad-hoc):** 사용자가 백로그에 없는 새로운 지시를 하면, 즉시 `[!]` 표시와 함께 티켓을 생성하고 작업을 수행합니다.
- **파생 작업 (Sub-tasks):** 작업을 진행하다가 추가로 필요한 태스크가 생기면 '연관' 필드에 부모 티켓 ID를 적고 새 티켓을 생성합니다.

### 3. 티켓 규격
- **ID:** `[TASK-YYMMDD-NN]`
- **상태:** `[ ]` 대기 / `[/]` 진행 / `[x]` 완료 / `[!]` 외부 긴급 요청
- **분류:** `[카테고리명]`
- **일자:** `생성일 / 완료일`
