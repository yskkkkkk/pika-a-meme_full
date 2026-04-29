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
