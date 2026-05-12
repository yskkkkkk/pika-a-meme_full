# Project Foundation Prompt

> **Purpose:** 이 파일은 `pick-a-meme` 프로젝트의 최초 설계 사상과 아키텍처 가이드라인을 담고 있습니다. 
> 새로운 에이전트 세션이 시작될 때 이 전문을 읽어 컨텍스트를 동기화하십시오.

# Project Master Blueprint: pick-a-meme

## 1. Context & Vision
- **Project Name:** pick-a-meme (피카밈)
- **Concept:** B급 감성의 동물 사진과 소위 '킹받는' 문구를 조합하여 생성하는 가챠형 밈 생성 서비스.
- **Core Value:** 짧은 호흡의 즐거움(Instant Fun)과 폭발적인 공유(Viral). 
- **Business Logic:** 유저는 밈을 생성할 때마다 '하트'를 소모하며, 하트는 5분마다 1개씩(최대 5개) 자동 충전됨. 이 시스템은 단순한 스테미나를 넘어 트래픽 제어 및 리텐션 유지의 핵심 기제임.

## 2. Technical Philosophy (The "Over-Spec" Challenge)
본 프로젝트는 1인 프로젝트임에도 불구하고, 4년 차 개발자의 역량 강화(Kotlin/JPA 숙련도 극대화, 아키텍처 설계 능력 배양)를 위해 실무 수준 이상의 기술적 복잡도를 의도적으로 지향함.

- **Clean Architecture & DDD:** 모든 비즈니스 로직은 프레임워크로부터 독립된 Domain 계층에 존재해야 함.
- **Strict Layering:** 의존성 방향은 반드시 Api -> Application -> Domain <- Infrastructure를 준수할 것.
- **CQRS Identity:**
    - Command: JPA를 사용하여 데이터 정합성과 객체 지향적 엔티티 상태 변경을 보장.
    - Query: jOOQ를 사용하여 복잡한 검색, 통계 및 대량 조회의 성능을 최적화.
- **Event-Driven Decoupling:** 도메인 간 결합도를 낮추기 위해 Spring ApplicationEvent를 적극 활용. (예: 가입 완료 -> 하트 지급 이벤트 발행)
- **High Availability & Performance:** Upstash Redis를 활용하여 하트 차감/충전 시 발생할 수 있는 동시성 이슈를 '분산 락'으로 해결하고, NEON(PostgreSQL)의 JSONB를 통해 가변적인 밈 메타데이터를 효율적으로 관리.

## 3. Project Structure (Monorepo & Multi-Module)
pika-a-meme_full/ (Root)
├── pam-backend/             # Spring Boot (Kotlin) Multi-Module Project
│   ├── pam-api/             # Delivery Layer (REST Controllers, Security, DTOs)
│   ├── pam-application/     # UseCase Layer (Services, Event Listeners, Transactional Orchestration)
│   ├── pam-domain/          # Core Domain Layer (Entities, Value Objects, Domain Events, Repository Interfaces)
│   └── pam-infrastructure/  # Implementation Layer (JPA Repositories, jOOQ Queries, Redis Config, S3 Adapters)
├── pam-frontend/            # Next.js 14+ (App Router, TypeScript, Tailwind CSS)
├── docker-compose.yml       # Local Dev Environment (Redis, LocalStack etc.)
└── README.md

## 4. Specific Technical Requirements
### A. Persistence Strategy
- JPA: pam-domain의 인터페이스를 pam-infrastructure에서 Spring Data JPA로 구현.
- jOOQ: pam-infrastructure 내에 별도의 QueryRepository를 두어, 복잡한 밈 필터링 및 랭킹 시스템 구현. (Gradle jOOQ codegen 설정 포함 필요)
- Database: NEON Serverless PostgreSQL을 사용하며, Meme 엔티티의 확장 필드는 JSONB 타입을 사용해 도메인 모델과 매핑.

### B. Concurrency & Stamina Logic
- Heart System: Redis를 Single Source of Truth로 활용하되, Persistence 유지를 위해 DB와 동기화하는 전략(Write-behind 또는 Transactional Listener)을 취함.
- Redisson: 하트 충전/소모 시 Race Condition 방지를 위한 분산 락(Distributed Lock) 적용 가이드라인 제시.

### C. Testing Strategy
- Unit Tests: pam-domain 모듈은 외부 의존성 없이 JUnit 5와 AssertJ만으로 모든 비즈니스 규칙을 검증.
- Integration Tests: pam-application 계층은 Mockito를 사용하여 도메인과의 협업 및 이벤트 발행 여부를 테스트.

## 5. Execution Phase 1: The Foundation
지금 바로 다음 작업을 상세하게 수행해줘. 장황하고 구체적인 코드를 원하며, 생략 없이 모든 설정 파일을 작성할 것.

1. Gradle Multi-Module Configuration:
    - 루트 settings.gradle.kts와 4개 모듈의 build.gradle.kts 작성.
    - Kotlin JVM Target 17, Spring Boot 3.2+, Querydsl(Kapt), jOOQ, Redis, PostgreSQL 의존성 포함.
    - 특히 모듈 간 implementation project(...) 관계를 설계 원칙에 따라 정확히 설정.

2. Vertical Slice Implementation (User & Heart):
    - Domain: User 엔티티, UserRegisteredEvent, UserRepository 인터페이스 생성.
    - Application: UserRegistrationService(가입 로직 + 이벤트 발행), HeartInitializeListener(AFTER_COMMIT 시점에 Redis 초기화) 생성.
    - Infrastructure: JpaUserRepository 구현 및 Redis 연결 설정 정보 작성.

3. Validation:
    - 위에서 작성한 User 엔티티의 생성 로직을 검증하는 도메인 단위 테스트 코드와, 서비스 계층의 이벤트 발행 모의 테스트 코드를 반드시 포함할 것.
