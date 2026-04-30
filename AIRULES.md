# pick-a-meme (픽-아-밈) 프로젝트 설계 원칙

## 1. 아키텍처 (Architecture)
- **Clean Architecture & DDD:** 모든 비즈니스 로직은 프레임워크로부터 독립된 `Domain` 계층에 존재해야 한다.
- **Strict Layering:** 의존성 방향은 반드시 아래 규칙을 준수한다.
  - `pam-api` (Delivery) -> `pam-application` (Use Case) -> `pam-domain` (Core)
  - `pam-infrastructure` (Implementation) -> `pam-domain` (Interfaces)
- **Monorepo & Multi-Module:** 기능적/계층적 분리를 위해 Gradle 멀티 모듈 구조를 유지한다.

## 2. 도메인 우선순위 (Domain First)
- **Pure Domain Entities:** `pam-domain` 모듈의 엔티티는 JPA 어노테이션 등 외부 프레임워크 의존성이 전혀 없는 순수 Kotlin 객체여야 한다.
- **Invariant Enforcement:** 비즈니스 규칙과 불변식은 도메인 엔티티 내부에서 검증한다.

## 3. 영속성 전략 (Persistence Strategy) - CQRS 기조
- **Command (C):** JPA (Spring Data JPA)를 사용하여 데이터 정합성과 객체 지향적 엔티티 상태 변경을 보장한다.
- **Query (Q):** jOOQ를 사용하여 복잡한 검색, 통계 및 대량 조회의 성능을 최적화한다.
- **Isolation:** Infrastructure 계층에서 Domain Repository 인터페이스를 구현하여 영속성 세부 사항을 감춘다.

## 4. 인프라스트럭처 (Infrastructure)
- **Object Storage:** AWS S3 SDK를 사용하되, 비용 최적화를 위해 Cloudflare R2 엔드포인트를 사용한다.
- **Database:** PostgreSQL (NEON Serverless)을 사용하며, 가변 메타데이터는 JSONB 타입을 적극 활용한다.

## 5. 동시성 제어 (Concurrency)
- **Redisson Distributed Lock:** 하트(스테미나) 차감 및 충전 시 발생할 수 있는 Race Condition을 방지하기 위해 Redis 기반의 분산 락을 반드시 적용한다.
- **Redis as SSOT:** 하트 시스템은 Redis를 Single Source of Truth로 활용하며, 영속성을 위해 DB와 비동기 동기화한다.

## 6. AI 태스크 관리 (BACKLOG.md)
- **운영 원칙:** 모든 작업은 `BACKLOG.md`에 기록된 티켓 단위를 기반으로 수행한다.
- **티켓 상태 관리:**
  - 작업을 시작할 때 상태를 `[/]`(진행)로 변경하고, 완료 시 `[x]`(완료)로 업데이트한다.
  - 사용자의 추가 요청(Ad-hoc)은 `[!]` 표시와 함께 즉시 티켓을 생성하여 추적한다.
- **동기화:** 매 작업 단계가 끝날 때마다 백로그를 최신 상태로 유지하여 진행 상황을 투명하게 공유한다.

## 7. Git 브랜치 전략 (Branching Strategy)
모든 작업은 **'Prefix/Domain/Task'** 구조의 네임스페이스 브랜치를 기반으로 격리되어 수행되어야 한다.

- **`infra/`**: 인프라 및 기반 설정 (Flyway, R2, Redis, jOOQ, Logging, Build)
  - 예: `infra/jooq-codegen-setup`, `infra/r2-connection-test`
- **`feat/heart/`**: 하트 재화 시스템 도메인 (충전/소모 로직, 분산 락, 스케줄링)
  - 예: `feat/heart/charging-logic`, `feat/heart/special-grant`
- **`feat/meme/`**: 밈 생성 및 이미지 처리 도메인 (Canvas, JSONB, R2 업로드)
  - 예: `feat/meme/canvas-editor`, `feat/meme/r2-upload-handler`
- **`feat/auth/`**: 회원 가입 및 인증 도메인 (OAuth2, JWT, 세션)
  - 예: `feat/auth/kakao-login-api`
- **`feat/front/`**: 프론트엔드 UI/UX 및 상태 관리 (Components, Hooks, State)
  - 예: `feat/front/stamina-bar`, `feat/front/guest-heart-hook`
- **`fix/`**: 버그 수정 (Prefix/Domain/Bug-Description)
  - 예: `fix/heart/concurrency-race`, `fix/meme/canvas-export-ratio`
- **`docs/`**: 문서화 작업 및 가이드라인 업데이트
  - 예: `docs/update-backlog-phase2`, `docs/api-specification`

## 8. 에이전트 작업 프로토콜 (Agent Workflow Protocol)
각 에이전트는 작업을 시작하기 전과 후에 다음 절차를 엄격히 수행해야 한다.

1. **Isolation (격리):** 작업 시작 전 항상 `main` 브랜치에서 최신 상태를 유지하며, 작업 도메인에 맞는 Namespace 브랜치를 생성한다.
2. **Context Preservation (맥락 보존):** 
   - 작업 중 발생하는 중요한 설계 결정 사안, 대안 탐색, 변경점은 PR(Pull Request) 본문에 상세히 기록한다.
   - 이는 브랜치 삭제 후에도 `BACKLOG.md`와 함께 히스토리를 추적하기 위한 핵심 기록이 된다.
3. **Traceability (추적성):**
   - 작업을 시작할 때 `BACKLOG.md`의 티켓 상태를 `[/]`로 변경한다.
   - 모든 커밋과 PR에는 관련 티켓 ID(예: `TASK-260429-01`)를 반드시 명시한다.
4. **Validation & Verification (검증):**
   - 코드를 제출하기 전 관련 단위 테스트를 수행하고 통과 여부를 확인한다.
   - 작업 완료 시 `BACKLOG.md` 상태를 `[x]`로 업데이트하고 완료일을 기록한다.

