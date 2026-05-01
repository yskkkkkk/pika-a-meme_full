# 🚀 pick-a-meme

B급 감성의 동물 사진과 '킹받는' 문구를 조합하여 생성하는 가챠형 밈 생성 서비스입니다.  
본 프로젝트는 **1인 개발자의 기술적 한계 도전**과 **AI 에이전트와의 고도화된 협업**을 목표로 설계되었습니다.

---

## 🏗️ Architecture & Philosophy

본 프로젝트는 프레임워크에 의존하지 않는 순수 비즈니스 로직을 지향하며, 엄격한 계층 분리를 준수합니다.

- **Clean Architecture & DDD**: 모든 비즈니스 로직은 `Domain` 계층에 고립되어 보호됩니다.
- **Strict Layering**: `Api -> Application -> Domain <- Infrastructure` 의존성 규칙을 준수합니다.
- **CQRS**: Command(JPA)와 Query(jOOQ)의 역할을 명확히 분리하여 성능과 정합성을 모두 잡습니다.

---

## 🛠 Tech Stack

- **Language**: Kotlin 1.9.23
- **Framework**: Spring Boot 3.2.4
- **Persistence**: Spring Data JPA, jOOQ (PostgreSQL 17 on NEON)
- **Stamina System**: Redis (Upstash) with Redisson Distributed Lock
- **Storage**: Cloudflare R2 (AWS S3 SDK Compatible)
- **Frontend**: Next.js 14+ (App Router)

---

## 🤖 AI 에이전트 협업 가이드 (AI Collaboration Guide)

이 저장소는 AI 에이전트가 프로젝트의 컨텍스트를 즉시 파악하고 일관성 있게 작업할 수 있도록 설계된 **'AI-Native'** 구조를 가지고 있습니다.

1. **[AIRULES.md](./AIRULES.md)**: AI 에이전트가 코드를 작성할 때 준수해야 할 기술적 대원칙과 설계 규격입니다.
2. **[BACKLOG.md](./BACKLOG.md)**: 프로젝트의 Single Source of Truth(SSOT)입니다. 모든 작업은 이곳의 티켓 단위로 관리되며 진행 상황과 결정 사항이 기록됩니다.
3. **[INIT_PROMPT.md](./INIT_PROMPT.md)**: 프로젝트의 최초 설계 사상과 아키텍처 가이드라인이 담긴 마스터 청사진입니다. 새로운 세션 시작 시 가장 먼저 참조하십시오.

---

## 📂 Project Structure

```text
pika-a-meme_full/ (Root)
├── pam-backend/             # Spring Boot (Kotlin) Multi-Module Project
│   ├── pam-api/             # Delivery Layer (REST Controllers, Security)
│   ├── pam-application/     # UseCase Layer (Services, Event Listeners)
│   ├── pam-domain/          # Core Domain Layer (Pure Entities, Repository Interfaces)
│   └── pam-infrastructure/  # Implementation Layer (JPA/jOOQ, Redis, S3 Adapters)
├── pam-frontend/            # Next.js 14+ (App Router, Tailwind CSS)
├── AIRULES.md               # AI 설계 원칙
├── BACKLOG.md               # AI 칸반보드 및 결정 사항
└── INIT_PROMPT.md           # 프로젝트 마스터 청사진
```

---

## 🚀 How to Run (Backend)

```bash
cd pam-backend
./gradlew :pam-api:bootRun
```

---

## 🧪 Testing

- **Domain**: JUnit 5 + AssertJ (No Spring Dependency)
- **Application**: Mockito + JUnit 5
- **Infrastructure**: Spring Boot Integration Test
