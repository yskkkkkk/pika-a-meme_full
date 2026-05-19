# 운영 런북 (Operations Runbook)

본 문서는 `pick-a-meme` 서비스 운영 중 발생할 수 있는 장애 상황, 긴급 배포(Hotfix) 및 롤백 절차를 정의합니다.
장애 상황 발생 시 최우선 목표는 **서비스의 신속한 정상화(MTTR 최소화)** 입니다.

---

## 1. 인시던트(장애) 대응 프로세스

### 장애 등급 분류
* **Critical (S1)**: 메인 도메인 접속 불가, 결제/핵심 로직(가챠 등) 완전 마비, 대규모 데이터 유실
* **Major (S2)**: 특정 기능군의 지속적인 오류 발생 (ex. 이미지 생성 불가, 소셜 로그인 마비 등), 간헐적인 5xx 응답
* **Minor (S3)**: 단순 UI 오류, 국소적인 데이터 표시 오류, 1회성 타임아웃

### 장애 대응 단계별 행동 지침
1. **장애 인지 및 전파**:
   - Sentry 또는 시스템 모니터링 알럿을 통해 인지 시 즉각 대응 채널(Slack 등)에 현황 전파.
2. **현상 파악 및 격리 (Containment)**:
   - 외부 요인인지 시스템 내부 결함인지 판단 (Cloudflare 대시보드, Railway 메트릭, Neon DB 메트릭 등).
   - Rate Limit 해제, 일시적인 Feature Flag off 등을 통해 피해 최소화 조치.
3. **원인 분석 (Investigation)**:
   - 애플리케이션 로그, 에러 트레이스(Sentry), 리소스 사용률 모니터링을 통한 1차 원인 규명.
4. **조치 및 복구 (Resolution)**:
   - 핫픽스 브랜치(Hotfix) 또는 즉시 롤백(Rollback) 수행 (아래 절차 참조).
   - 조치 후 정상 동작 여부를 직접 테스트하여 확인.
5. **장애 회고 (Post-mortem)**:
   - 조치 완료 후 원인과 방지 대책을 문서화하고 팀 공유. (Root Cause Analysis)

---

## 2. 긴급 핫픽스(Hotfix) 절차

운영 환경에 배포된 버전에 긴급한 결함 수정이 필요할 때 수행합니다.

### 2.1 핫픽스 브랜치 작업
1. 최신 운영 환경 브랜치(보통 `main` 또는 릴리즈 브랜치) 기준 `hotfix/이슈번호-이름` 브랜치 생성.
   ```bash
   git checkout -b hotfix/TASK-XXXXX main
   ```
2. 긴급 버그 수정 사항 반영 후 로컬 환경에서 테스트 진행 (Frontend & Backend).
3. 커밋 및 원격 브랜치에 푸시.

### 2.2 병합 및 긴급 배포
1. 핫픽스 브랜치 PR(Pull Request) 생성 후 즉각 승인 및 `main` 병합 처리.
2. Vercel(Frontend), Railway(Backend)에서 GitHub 연동으로 자동 배포 모니터링.
3. 배포 완료 후 운영 환경에서의 정상 동작 재검증.

---

## 3. 롤백(Rollback) 절차

새로 배포된 버전에서 크리티컬한 문제가 발생하여 신속히 이전 정상 상태로 되돌려야 할 때 수행합니다.

### 3.1 Frontend (Vercel) 롤백
- Vercel 대시보드 접속 -> 프로젝트 이동 -> **Deployments** 탭 진입.
- 직전 정상 배포 내역 우측의 메뉴 (점 3개) 클릭 -> **Promote to Production** 또는 **Instant Rollback** 실행.
- 소요 시간: 1분 이내 (Build 과정 생략).

### 3.2 Backend (Railway) 롤백
- Railway 대시보드 접속 -> 프로젝트/서비스 진입.
- **Deployments** 히스토리에서 문제가 발생하기 직전의 정상 빌드/배포 버전을 선택.
- 해당 버전 컨텍스트 메뉴에서 **Redeploy** 클릭하여 기존 커밋의 컨테이너를 재시작.

### 3.3 Database 롤백 (Flyway)
- **주의**: DDL 변경 사항(마이그레이션)을 포함한 배포 후 롤백의 경우, 애플리케이션만 롤백하면 스키마 불일치 에러가 발생할 수 있습니다.
- 백워드 호환성을 고려하지 않은 스키마 변경 시, Flyway Undo 스크립트를 작성해 적용하거나 Neon의 Point-in-time Recovery 또는 백업 스냅샷을 활용하여 스키마를 복원해야 합니다.

### 3.4 CDN 캐시 퍼지 (필요시)
- 롤백 후 프론트엔드 캐시나 API 응답 캐시로 인해 오류가 지속될 수 있습니다.
- Cloudflare 대시보드 진입 -> Caching -> **Purge Everything** 실행하여 캐시 강제 갱신.

---

## 4. 인프라 요소별 점검 체크리스트

장애 발생 시 각 인프라 구성 요소를 빠르고 명확하게 점검하기 위한 체크리스트입니다.

| 구성 요소 | 역할 | 점검 내용 및 트러블슈팅 |
| --- | --- | --- |
| **Vercel** | Frontend 배포, 서버리스 함수 | - Deployments 탭 빌드 실패 여부 확인 <br> - 실시간 로그 조회하여 5xx 에러 패턴 확인 |
| **Railway** | Backend (API) Docker 컨테이너 | - Memory / CPU 사용량 스파이크 확인 (OOM 킬 여부) <br> - 애플리케이션 로깅에서 타임아웃, 예외 발생 원인 분석 |
| **Neon** | PostgreSQL 메인 데이터베이스 | - 활성 Connection 수 및 Max Connection 도달 여부 <br> - Slow Query 모니터링 및 성능 저하 트랜잭션 식별 |
| **Upstash** | Redis (캐싱, 락, 하트) | - 메모리 한도 도달 여부 점검 <br> - 명령(Command) 수 제한 도달 시 일시적 요청 실패 점검 |
| **Cloudflare** | Proxy, WAF, R2 Storage | - R2 스토리지(img.*)의 502/503 에러 여부 점검 <br> - WAF(웹 방화벽) 오탐지에 의한 정상 사용자 블락 기록 점검 |
