# 📋 프로젝트 백로그 (BACKLOG.md)

## 🏷️ 분류 정의 (Category Definitions)
- **[인프라/공통]**: 빌드 설정, 인프라 연결, 공통 모듈 및 유틸리티.
- **[회원/인증]**: 유저 도메인, 소셜 로그인, 권한 관리 및 세션.
- **[하트/스테미나]**: 하트 소모/충전 로직, 분산 락, 스케줄링.
- **[밈/이미지]**: 밈 생성/조회, JSONB 데이터, R2/S3 스토리지 업로드.
- **[프론트엔드]**: Next.js 페이지, 컴포넌트, 상태 관리, API 연동.
- **[문서/기타]**: 프로젝트 가이드라인, 백로그 관리, 설계 기록 및 문서화.

> **v2 재설계 안내 (2025-05-04):** AIRULES.md 전면 개편에 따라 아래 `[v2]` 태스크가 추가되었습니다.  
> POC 단계 태스크 중 v2 설계와 충돌하는 항목은 `[재검토]` 표시로 표시합니다.

---

## 🗂️ 칸반 보드 (Kanban Board)

| ID | 분류 | 상태 | 내용 | 연관 | 비고 | 일자 |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| TASK-260429-01 | [인프라/공통] | [x] | Gradle 멀티 모듈 및 루트 프로젝트 설정 | - | - | 260429 / 260429 |
| TASK-260429-02 | [회원/인증] | [x] | pam-domain 모듈 구현 (User, UserRepository, Event) | - | - | 260429 / 260429 |
| TASK-260429-03 | [회원/인증] | [x] | pam-application 모듈 구현 (회원가입 서비스, 하트 리스너) | - | - | 260429 / 260429 |
| TASK-260429-04 | [인프라/공통] | [x] | pam-infrastructure 모듈 구현 (JPA 어댑터, Redis 기본 설정) | - | - | 260429 / 260429 |
| TASK-260429-05 | [인프라/공통] | [x] | pam-api 모듈 구현 (Spring Boot 앱 진입점) | - | - | 260429 / 260429 |
| TASK-260429-06 | [인프라/공통] | [ ] | jOOQ Codegen Gradle 설정 및 인프라 레이어 연동 | - | 공부 목적의 완벽한 CQRS 아키텍처 분리를 위해 jOOQ 재도입 결정 (260520 수립) | 260429 / - |
| TASK-260429-07 | [하트/스테미나] | [x] | Redisson 분산 락 구현 및 하트 충전/소모 로직 적용 | TASK-260429-03 | - | 260429 / 260429 |
| TASK-260429-08 | [밈/이미지] | [x] | Meme 도메인 엔티티 및 영속성 레이어 구현 (JSONB 매핑) | - | - | 260429 / 260430 |
| TASK-260429-09 | [밈/이미지] | [x] | 밈 생성 및 전체/개별 조회 REST API 구현 | - | TASK-260429-20에서 POST /api/memes, GET /api/memes 구현으로 완전 대체 | 260429 / 260501 |
| TASK-260429-10 | [문서/기타] | [x] | 프로젝트 문서화 (AIRULES, BACKLOG 시스템 구축) | [!] 외부 요청 | - | 260429 / 260429 |
| TASK-260429-11 | [문서/기타] | [x] | INIT_PROMPT.md 생성 및 초기 프롬프트 저장 | [!] 외부 요청 | - | 260429 / 260429 |
| TASK-260429-12 | [인프라/공통] | [x] | DB 형상 관리를 위한 Flyway 설정 및 초기 DDL 작성 | - | - | 260429 / 260429 |
| TASK-260429-13 | [인프라/공통] | [x] | 공통 API 응답 규격 및 GlobalExceptionHandler 구현 | - | - | 260429 / 260429 |
| TASK-260429-14 | [인프라/공통] | [x] | 로깅 전략 수립 및 MDC 기반 Request ID 추적 구현 | - | - | 260429 / 260503 |
| TASK-260429-15 | [문서/기타] | [x] | Phase 1 종료 및 Baseline(v0.1.0) 설정 | [!] 외부 요청 | - | 260429 / 260429 |
| TASK-260429-16 | [문서/기타] | [x] | README.md 작성 및 프로젝트 이정표 수립 | [!] 외부 요청 | - | 260429 / 260429 |
| TASK-260429-17 | [밈/이미지] | [x] | Meme 도메인 엔티티 및 MemeCreationPolicy 구현 (BASIC/SPECIAL 옵션 분기) | TASK-260429-08 | - | 260429 / 260430 |
| TASK-260429-18 | [밈/이미지] | [x] | MemeCreationService 구현 (HeartService + MemeFactory 오케스트레이션) | TASK-260429-17, TASK-260429-07 | - | 260429 / 260501 |
| TASK-260429-19 | [밈/이미지] | [x] | Cloudflare R2 스토리지 어댑터 구현 (이미지 업로드, presigned URL 발급) | - | - | 260429 / 260430 |
| TASK-260429-20 | [밈/이미지] | [x] | 밈 생성 및 조회 REST API 구현 (POST /api/memes, GET /api/memes) | TASK-260429-18, TASK-260429-09 | - | 260429 / 260501 |
| TASK-260429-21 | [하트/스테미나] | [x] | Heart REST API 구현 (GET /api/hearts — 현재 하트 현황 조회) | TASK-260429-07 | - | 260429 / 260501 |
| TASK-260429-22 | [하트/스테미나] | [x] | SPECIAL 하트 지급 트리거 정의 및 구현 (조건 달성 이벤트 → grantSpecialHeart) | TASK-260429-07 | 최초 로그인 웰컴 보상(TASK-260512-04) + 미션 시스템 전체 구현(TASK-260513-05)으로 완전 완료. MissionService.grant()가 heartService.grantSpecialHeart() 호출 | 260429 / 260513 |
| TASK-260429-23 | [프론트엔드] | [x] | 프론트엔드 프로젝트 초기 설정 (Next.js 14 App Router, Tailwind, API 클라이언트) | - | - | 260429 / 260430 |
| TASK-260429-24 | [프론트엔드] | [x] | Canvas 에디터 컴포넌트 구현 (동물 사진 + 텍스트/스티커 합성, canvas_state 직렬화) | TASK-260429-23 | v2 재설계에서 CSS 말풍선 방식으로 전환, Canvas 에디터 제거. TASK-260504-08로 대체 | 260429 / 260501 |
| TASK-260429-25 | [프론트엔드] | [x] | 하트 상태 바 컴포넌트 구현 (잔여 하트 표시, BASIC 충전 타이머 카운트다운) | TASK-260429-23 | - | 260429 / 260501 |
| TASK-260429-26 | [프론트엔드] | [x] | 밈 생성 플로우 페이지 구현 (하트 타입 선택 → Canvas 편집 → 저장/공유) | TASK-260429-24, TASK-260429-25 | - | 260429 / 260502 |
| TASK-260429-27 | [프론트엔드] | [x] | 밈 갤러리 피드 페이지 구현 (생성된 밈 목록 조회, 더 보기 페이지네이션) | TASK-260429-23 | - | 260429 / 260503 |
| TASK-260429-28 | [회원/인증] | [x] | Spring Security + OAuth2 소셜 로그인 백엔드 구현 (카카오, 구글 / JWT 발급) | TASK-260429-02 | - | 260429 / 260429 |
| TASK-260429-29 | [프론트엔드] | [x] | 소셜 로그인 프론트엔드 구현 (OAuth2 콜백 처리, JWT 저장, 로그인 상태 전역 관리) | TASK-260429-28, TASK-260429-23 | - | 260429 / 260501 |
| TASK-260429-30 | [프론트엔드] | [x] | 비로그인 하트 관리 훅 구현 (useGuestHeart — localStorage 기반, 5분 lazy 충전 타이머) | TASK-260429-23 | - | 260429 / 260430 |
| TASK-260429-31 | [프론트엔드] | [x] | 로그인 유도 모달 컴포넌트 구현 (혜택 안내, SSO 버튼, "그냥 계속 뽑기" 분기) | TASK-260429-29, TASK-260429-30 | LoginSlideMenu 컴포넌트로 구현 완료. TASK-260504-10(서비스 소개 화면)과 연계되어 해당 태스크에서 고도화 예정 | 260429 / 260505 |
| TASK-260429-32 | [프론트엔드] | [x] | ~~워터마크 분기 렌더링 구현 (비로그인: 사선 중앙 / 로그인: 우하단 미니 브랜드)~~ | TASK-260429-24 | **정책 변경으로 제거 (260513).** 비로그인 워터마크 강화 대신 이미지 저장 자체를 차단하는 방향으로 전환 (TASK-260513-04 참고). ResultScreen 브랜딩 바는 유지 | 260429 / - |
| TASK-260429-33 | [프론트엔드] | [x] | 비로그인 캡처 방지 처리 (long-press 차단, contextmenu 차단, CSS overlay) | TASK-260429-23 | TASK-260513-04로 대체. 저장 버튼 제거 + long-press 차단 방향으로 정책 확정 | 260429 / 260513 |
| TASK-260430-01 | [문서/기타] | [x] | 브랜치 전략 및 에이전트 워크플로우 가이드라인 추가 | [!] 외부 요청 | - | 260430 / 260430 |
| TASK-260430-02 | [프론트엔드] | [x] | 동물 사진 가챠(Gacha) 시스템 및 로딩 애니메이션 구현 | TASK-260429-26 | - | 260430 / 260501 |
| TASK-260501-01 | [밈/이미지] | [x] | ~~R2 업로드 후 DB 저장 실패 시 고아 이미지 정리 전략 구현~~ | TASK-260429-18, TASK-260429-19 | **전제 무효화로 삭제 (260514).** 완성 이미지를 R2에 저장하지 않고 composition을 JSONB로 DB에만 저장하는 구조이므로 고아 파일이 발생할 수 없음. docs/known-issues.md `NOTE-01` 참고 | 260501 / 260514 |
| TASK-260501-02 | [프론트엔드] | [x] | 프론트엔드 API 클라이언트 구현 (fetch + Bearer 헤더 + POST /api/memes 연동) | - | - | 260501 / 260503 |
| TASK-260501-03 | [프론트엔드] | [x] | 밈 완성 후 "다시뽑기" 플로우 및 공유하기 고도화 | - | ResultScreen 버튼 2×2 재구성(홈/다시뽑기/저장/공유하기). 다시뽑기: BASIC→handleBasicDraw() 즉시 재뽑기, SPECIAL→잔여 하트 체크 후 TAG_SELECT 복귀, confirmingRedraw 확인 UI. 공유하기: navigator.share(files)→URL→클립보드 순 fallback. 코드 확인(260516 재점검) | 260501 / 260516 |
| TASK-260501-04 | [프론트엔드] | [x] | Canvas에 추가된 아이템의 크기(fontSize/stickerScale) 조절 UI 구현 | TASK-260429-24 | v2 재설계로 Canvas 에디터 자체가 제거됨. TASK-260429-24, TASK-260504-08 참고 | 260501 / 260505 |
| TASK-260501-05 | [인프라/공통] | [x] | CI/CD 구축 및 클라우드 배포 (Frontend: Vercel + GitHub Actions, Backend: Railway Docker) | - | Vercel 자동배포(GitHub Actions + Vercel CLI), Railway Docker 자동배포 완료. 도메인: pick-a-me.me / api.pick-a-me.me | 260501 / 260511 |
| TASK-260502-01 | [인프라/공통] | [ ] | Sentry 기반 프론트/백엔드 에러 트래킹 및 알림 채널(Slack/Email) 연동 | TASK-260429-14 | - | 260502 / - |
| TASK-260502-02 | [인프라/공통] | [ ] | 헬스체크/레디니스 엔드포인트 및 외부 의존성(DB/Redis/R2) 상태 점검 추가 | TASK-260501-05 | - | 260502 / - |
| TASK-260502-03 | [밈/이미지] | [x] | OG 이미지 업로드 매직 바이트(파일 시그니처) 검증 추가 | TASK-260429-20 | 원래 전제(완성 밈 업로드)는 JSONB 구조 전환으로 소멸, OG 업로드 매직 바이트 검증으로 재정의(260706). UploadOgImageService에 JPEG/PNG 시그니처 검증 추가, TDD(RED→GREEN) 테스트 6건 | 260502 / 260706 |
| TASK-260502-04 | [회원/인증] | [~] | ~~JWT Refresh Token 회전 및 강제 로그아웃 플로우 구현~~ | TASK-260429-28, TASK-260429-29 | TASK-260517-01로 통합 대체 | 260502 / - |
| TASK-260502-05 | [프론트엔드] | [x] | 주요 퍼널 이벤트 분석 로깅 (PostHog 연동 및 리버스 프록시 우회) | TASK-260429-26 | PostHog 직접 연동 및 리버스 프록시(/ingest) 우회 적용. 7개 핵심 이벤트 주입 완료 | 260502 / 260609 |
| TASK-260502-06 | [문서/기타] | [x] | 운영 런북 작성 (장애 대응, 핫픽스/롤백 절차) | TASK-260501-05 | R2 고아 파일 정리 항목 제거 (TASK-260501-01 전제 무효화) | 260502 / 260519 |
| TASK-260502-07 | [인프라/공통] | [x] | 로컬 개발 환경 최적화 (CORS 설정, Tailwind v4 PostCSS 연동, API 호출 최적화) | - | - | 260502 / 260502 |

---

## 🔄 v2 재설계 태스크 (2025-05-04 추가)

| ID | 분류 | 상태 | 내용 | 연관 | 비고 | 일자 |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| TASK-260504-01 | [문서/기타] | [x] | AIRULES v2 전면 개편 및 BACKLOG/README 재정비 | [!] 외부 요청 | - | 260504 / 260504 |
| TASK-260504-02 | [인프라/공통] | [x] | Flyway V4 — meme_images/meme_phrases 테이블 생성 + GIN 인덱스 | - | - | 260504 / 260504 |
| TASK-260504-03 | [밈/이미지] | [x] | MemeImage/MemePhrase 도메인 엔티티, 레포지터리 인터페이스 구현 | TASK-260504-02 | - | 260504 / 260504 |
| TASK-260504-04 | [밈/이미지] | [x] | MemeImage/MemePhrase JPA 어댑터 및 인프라 구현 | TASK-260504-03 | - | 260504 / 260504 |
| TASK-260504-05 | [하트/스테미나] | [x] | 하트 타입별 밈 조합 전략 서비스 (RandomMix / ContextualMatching) 구현 | TASK-260504-03 | MemeComposeService에서 BASIC(랜덤), SPECIAL(태그 필터링) 분기로 구현 완료 | 260504 / 260504 |
| TASK-260504-06 | [밈/이미지] | [x] | 밈 조합 API 엔드포인트 구현 (GET /api/memes/compose) | TASK-260504-05 | MemeController에 GET /api/memes/compose 추가로 완료. TASK-260504-05와 함께 구현 | 260504 / 260504 |
| TASK-260504-07 | [프론트엔드] | [x] | 모바일 퍼스트 메인 화면 재구축 (500px 컨테이너, BASIC/SPECIAL 하트 버튼) | TASK-260504-06 | HomeScreen, TagSelectScreen, SpinningScreen, ResultScreen 컴포넌트 분리 및 main 반영 완료 | 260504 / 260505 |
| TASK-260504-08 | [프론트엔드] | [x] | CSS 말풍선 컴포넌트 구현 (subject_position 기반 절대 포지셔닝) | TASK-260504-07 | ResultScreen의 getPositionClasses()로 구현. TASK-260429-24(Canvas 에디터)를 대체 | 260504 / 260505 |
| TASK-260504-09 | [프론트엔드] | [x] | SPECIAL 하트 태그 선택 UI 구현 (태그 멀티셀렉트 → 조합 요청 → 결과 표시) | TASK-260504-07 | TagSelectScreen 컴포넌트로 구현 완료. TASK-260504-07과 함께 진행 | 260504 / 260505 |
| TASK-260504-10 | [프론트엔드] | [~] | ~~로그인/서비스 소개 별도 화면 구현~~ | TASK-260504-07 | **의도적 제거 (260517).** 설명 없이 바로 가챠로 진입하는 것이 서비스 컨셉에 부합한다고 판단. 온보딩 없이도 5초 안에 파악 가능한 구조가 목표. | 260504 / - |
| TASK-260505-01 | [밈/이미지] | [x] | 밈 결과물 저장 기능 구현 (ResultScreen → html2canvas 캡처 → 기기 저장) | TASK-260504-08 | PC는 파일 다운로드, 모바일은 Web Share API로 갤러리 저장. TASK-260429-19(R2 어댑터)와 연계 | 260505 / 260505 |
| TASK-260506-01 | [밈/이미지] | [x] | SPECIAL 뽑기 단일 태그 정책 적용 및 selected_tag 컬럼 추가 (V9 마이그레이션) | TASK-260505-01 | selected_tag NULL=BASIC, NOT NULL=SPECIAL. AIRULES.md 정책 문서화 포함 | 260506 / 260506 |
| TASK-260511-01 | [회원/인증] | [x] | HttpOnly Cookie JWT 전환 (localStorage → pam_token 쿠키, SameSite=Lax) | TASK-260429-28 | OAuth2SuccessHandler, JwtAuthenticationFilter, AuthController(/me, /logout) 구현. CORS allowCredentials=true | 260511 / 260511 |
| TASK-260511-02 | [프론트엔드] | [x] | AuthContext 전역 상태 도입 (/api/auth/me 중복 호출 제거) | TASK-260429-29 | AuthProvider + useAuth Context 패턴. 6개 컴포넌트 → 앱 루트 1회 호출로 통합 | 260511 / 260511 |
| TASK-260511-03 | [인프라/공통] | [x] | Redis Rate Limiting 구현 (RateLimitFilter, 엔드포인트별 토큰 버킷) | - | ConditionalOnBean(RedisTemplate), failClosed 정책, compose/meme-create/oauth2/auth-me 규칙 적용 | 260511 / 260511 |
| TASK-260511-04 | [인프라/공통] | [x] | R2 커스텀 도메인 전환 (pub-*.r2.dev → img.pick-a-me.me, V13 마이그레이션) | - | Cloudflare R2 커스텀 도메인 연결 + meme_images.image_url 일괄 교체 | 260511 / 260511 |
| TASK-260511-05 | [인프라/공통] | [x] | Origin Shielding 구현 (OCI 인바운드 Cloudflare IP 15개 대역만 허용) | TASK-260511-03 | OCI Security List에서 Cloudflare IPv4 대역만 포트 80/443 인바운드 허용. 직접 IP 접근 차단 완료 | 260511 / 260602 |
| TASK-260511-06 | [인프라/공통] | [x] | IP 기반 Rate Limiting 고도화 (useForwardedHeaders=true, CF-Connecting-IP 실제 IP 식별) | TASK-260511-03 | OCI+Nginx 구성 확정 후 CF-Connecting-IP 전용 헤더 적용 완료. PR#135 | 260511 / 260602 |
| TASK-260511-07 | [회원/인증] | [~] | ~~JWT Refresh Token 회전 구현~~ | TASK-260511-01 | TASK-260517-01로 통합 대체 | 260511 / - |
| TASK-260511-08 | [인프라/공통] | [ ] | 인프라 모니터링 강화 (OCI/Neon/Upstash/R2 메트릭 대시보드 + 임계치 알림) | TASK-260502-01 | Railway → OCI 이관(TASK-260513-07) 반영하여 대상 수정 (260706) | 260511 / - |
| TASK-260512-01 | [하트/스테미나] | [x] | 하트 소모 버그 전면 수정 (로그인/비회원 모두) | TASK-260429-07 | (1) MemeComposeService에 HeartService.consumeHeart 호출 누락 → 추가. (2) 비회원 consumeHeart에서 setCurrentHearts 직접 호출로 즉시 UI 반영. (3) useMemeApi mock 폴백을 네트워크 오류 한정으로 축소 — success=false 응답은 throw. (4) HeartDisplay SPINNING 중 display:none 유지로 observer 연속성 보장, refetchQueries로 즉시 갱신 | 260512 / 260512 |
| TASK-260512-02 | [프론트엔드] | [x] | 로그아웃 시 홈(/) 리다이렉트 구현 | TASK-260429-29 | LoginSlideMenu 로그아웃 버튼에 router.replace("/") 추가 | 260512 / 260512 |
| TASK-260512-03 | [프론트엔드] | [x] | 미로그인 상태 스페셜 미션(⚡) 버튼 클릭 시 로그인 메뉴 오픈 | TASK-260504-07 | HeartDisplay ⚡ 버튼에 isLoggedIn 분기 추가. 미로그인 → onMenuOpen(), 로그인 → 미션 시트 | 260512 / 260512 |
| TASK-260512-04 | [회원/인증] | [x] | 최초 로그인 웰컴 알럿 + SPECIAL 하트 1개 지급 | TASK-260429-22 | HeartInitializeListener에서 신규 가입 시 SPECIAL 1개 추가 지급. OAuth2SuccessHandler에서 신규 유저 시 ?welcome=1 파라미터로 리다이렉트. 프론트엔드 콜백에서 감지 → 홈에서 웰컴 알럿 표시 | 260512 / 260512 |
| TASK-260512-05 | [프론트엔드] | [x] | 로그인 직후 하트 표시 깜빡임(0→5→실제값) 수정 | TASK-260512-01 | (1) useHeart에 placeholderData: prev 추가 — 리페치 중 이전 값 유지. (2) MemeComposeService 하트 차감 순서 안전하게 재정렬(조합→차감→저장). (3) HeartDisplay 초기 로딩 중(serverHearts=null) 숫자 0 대신 '—' 표시(heartsReady 플래그) | 260512 / 260512 |
| TASK-260512-06 | [프론트엔드] | [x] | 다크모드 구현 및 라이트/다크 토글 | - | CSS 커스텀 프로퍼티(:root / [data-theme=dark]) 기반 토큰 시스템(피카밈 브랜드 네온 팔레트). useTheme 훅 + ThemeProvider + localStorage 영속. flash 방지 인라인 스크립트. 전 컴포넌트(15개) 인라인 스타일 var(--pam-*) 교체. HeartDisplay 상단바 🌙/☀️ 버튼 + LoginSlideMenu 토글 배치. 향후 영어 버전 대응 가능 ThemeContext 구조 | 260512 / 260512 |
| TASK-260512-07 | [프론트엔드] | [x] | 영어 버전(i18n) 구현 — 한/영 언어 토글 | TASK-260512-06 | useLanguage 훅 + ko.json/en.json 사전 기반 전체 UI 번역. LoginSlideMenu 언어 토글 버튼 배치. localStorage 영속. PR#86, PR#87 | 260512 / 260516 |
| TASK-260513-01 | [인프라/공통] | [x] | Redis @Cacheable 캐싱 도입 — recent-matched 밈 조회 10분 TTL | [!] 외부 요청 | RedisCacheManager 빈 등록(GenericJackson2JsonRedisSerializer + activateDefaultTyping). @EnableCaching 활성화. JpaUserMemeRepositoryAdapter.findRecentTagMatched에 @Cacheable("recent-matched-memes") 단일 어노테이션으로 Redis 자동 연동. jackson-datatype-jsr310 의존성 추가. docs/caching-strategy.md 정책 문서화 | 260513 / 260513 |
| TASK-260513-02 | [하트/스테미나] | [x] | 스페셜 하트 로직 전면 점검 및 버그 수정 | [!] 외부 요청 | (1) MemeController: SPECIAL + 비인증 조합 시 401 반환 가드 추가. (2) page.tsx: executeSpecialDraw 진입 전 잔액 0 체크 추가. (3) HeartService: preChargeCount 캡처 위치 버그 수정 → 충전 이력 정상 저장. (4) HeartService: 미사용 변수 charged 제거 | 260513 / 260513 |
| TASK-260513-03 | [밈/이미지] | [x] | 저장하기 기능 버그 수정 | [!] 외부 요청 | (1) MemeCanvasCard img에 crossOrigin="anonymous" 추가 — html2canvas CORS 차단 해결. (2) imageSave.ts 공통 모듈 추출 — captureElement(img로드 대기+rAF+html2canvas), saveImage(모바일: navigator.share, 데스크톱: a download). (3) iOS `<a download>` 미지원 → navigator.share({ files }) fallback. (4) ResultScreen, my/[memeId] 모두 공통 모듈로 교체. TASK-260515-01 참고(html-to-image 마이그레이션 후속) | 260513 / 260515 |
| TASK-260515-01 | [밈/이미지] | [x] | html2canvas → html-to-image 마이그레이션 (TASK-260513-03 후속) | TASK-260513-03 | html2canvas는 복잡한 CSS transform/clip-path/backdrop-filter를 렌더링 못하는 알려진 버그 존재. html-to-image(SVG foreignObject 방식)로 교체 시 말풍선 등 CSS 레이어 정확도 향상 기대. 현재 crossOrigin + asset wait 패치로 기본 동작 확인됐으나, 향후 UI 고도화 시 캡처 품질 이슈 재발 가능성. 교체 시 captureElement() 내부만 변경하면 됨 (공통 모듈로 분리되어 있음) | 260515 / 260518 |
| TASK-260513-04 | [프론트엔드] | [x] | 비로그인 이미지 저장 차단 및 저장 버튼 제거 | [!] 외부 요청, TASK-260429-33 | 비로그인 사용자: (1) 저장하기 버튼 미노출(isLoggedIn 분기). (2) handleSave 진입 시 !isLoggedIn → return 강제 차단. (3) 비로그인 시 공유 버튼 col-span-2 full width 표시. ResultScreen.tsx에 구현 완료 확인(260516 재점검) | 260513 / 260516 |
| TASK-260513-05 | [하트/스테미나] | [x] | 스페셜 하트 미션 시스템 전체 구현 | TASK-260429-22 | V15 마이그레이션(4개 테이블 + 시드). 도메인/인프라/애플리케이션/API 레이어 신규. MissionService.trigger() 단일 진입점. 7개 공개 미션 + 11개 히든 테마 미션. 연속방문 streak, 주간공유 3회마다 지급, 갤러리 10/30개(미노출 포함). 히든 미션은 달성 시만 목록 노출. HeartInitializeListener/MemeComposeService 트리거 연결. useMissions 실제 API 연동. docs/mission-system.md 작성 | 260513 / 260513 |
| TASK-260513-06 | [프론트엔드] | [x] | i18n 적용 후 CSS 레이아웃 깨짐 수정 | [!] 외부 요청, TASK-260512-07 | 하드코딩 Tailwind 컬러 클래스(bg-white/bg-black/text-gray-* 등) → CSS 변수 일괄 교체. MemeGallery/GalleryPage/HomeScreen/LoginSlideMenu/oauth2callback 수정. PR#106 | 260513 / 260519 |
| TASK-260513-07 | [인프라/공통] | [x] | 백엔드 서버 OCI(Oracle Cloud) 이관 완료 | [!] 외부 요청 | Railway → OCI(VM.Standard.A1.Flex, Ubuntu 24.04) 이관 완료. Nginx 리버스 프록시 + Let's Encrypt SSL. GitHub Actions GHCR 빌드 후 SSH pull 배포로 전환(38분→3분). Cloudflare DNS A레코드 전환 및 Full(Strict) SSL 적용 | 260513 / 260602 |
| TASK-260514-01 | [인프라/공통] | [x] | mission_completions.metadata jsonb 타입 불일치 운영 버그 수정 | [!] 외부 요청 | StringMapConverter(Map→varchar)를 @JdbcTypeCode(SqlTypes.JSON)으로 교체. 미션 트리거 시 500 에러 발생. docs/known-issues.md BUG-06 참고 | 260514 / 260514 |
| TASK-260514-02 | [인프라/공통] | [x] | HTTP 요청 타임아웃 전체 설정 및 사용자 알럿 고도화 | [!] 외부 요청 | (1) apiFetch AbortController 15초 타임아웃. (2) application.yml Tomcat 연결타임아웃·HikariCP max-pool-size 명시. (3) alert() 전부 인앱 토스트로 교체. (4) 에러 분류(타임아웃/하트부족/서버에러) 별 메시지 분기 | 260514 / 260514 |
| TASK-260517-01 | [회원/인증] | [x] | JWT Refresh Token 구현 (Access Token 단축 + Refresh Token rotation + DB denylist) | TASK-260511-01, TASK-260502-04, TASK-260511-07 | (1) Access Token 15분으로 단축. (2) Refresh Token 30일, HttpOnly Cookie (`pam_refresh`, Path=/api/auth) 별도 발급. (3) `/api/auth/refresh` 엔드포인트 — rotation(기존 jti revoke + 새 pair 발급), revoked 재사용 감지 시 전체 family revoke. (4) `refresh_tokens` 테이블(jti, user_id, expires_at, revoked) — 로그아웃/강제만료 시 revoked=true. (5) 프론트엔드: apiFetch 401 응답 시 `/api/auth/refresh` 자동 재시도 인터셉터 추가. TASK-260502-04, TASK-260511-07 통합 대체 | 260517 / PR#109 |
| TASK-260517-02 | [회원/인증] | [x] | 비로그인 뽑기 결과 → 로그인 후 자동 저장 연동 | [!] 외부 요청 | 결과창에서 로그인 유도 토스트 노출(1회). 토스트 내 로그인 버튼 클릭 시: (1) memeResult를 sessionStorage('pam_pending_meme')에 저장. (2) OAuth2 플로우 진행. (3) 로그인 완료 후 AuthContext isLoggedIn 변화 감지 → sessionStorage 체크 → POST /api/memes/save-composition 호출(신규 엔드포인트) → sessionStorage 삭제. 백엔드: POST /api/memes/save-composition (인증 필수, composition JSONB 받아서 user_memes 저장). 토스트 문구: "저장하고 공유하려면 로그인하세요 — 지금 결과도 바로 저장돼요" | 260517 / PR#105 |
| TASK-260519-01 | [인프라/공통] | [x] | GlobalExceptionHandler의 NoResourceFoundException 잘못된 매핑 수정 | BUG-08 | NoResourceFoundException을 밈 리소스 에러가 아닌 일반 404로 수정 | 260519 / 260519 |
| TASK-260519-02 | [회원/인증] | [x] | AuthController 내 OAuth2 URI 파싱 예외 은닉(Swallowing) 수정 및 로깅 추가 | BUG-09 | 예외 발생 시 에러 로그 추가하여 디버깅 용이성 확보 | 260519 / 260519 |
| TASK-260519-03 | [프론트엔드] | [x] | 프론트엔드 비동기 통신 언마운트 상태 업데이트(메모리 누수) 방지 처리 | BUG-10 | useEffect 내 AbortController를 도입하여 언마운트 시 실제 네트워크 요청(apiFetch) 취소 적용 | 260519 / 260519 |
| TASK-260520-01 | [회원/인증] | [x] | HeartInitializeListener 트랜잭션 동기 통합 (BEFORE_COMMIT으로 즉시 반영 보장) | - | 가입 커밋 직전 하트 초기화를 완료하여 레이스 컨디션 및 화면 깜빡임 예방 | 260520 / 260520 |
| TASK-260520-02 | [인프라/공통] | [ ] | Sentry 연동 시 DomainException 필터링 및 로깅 정책 정의 | TASK-260502-01 | 도메인 예외(Warn)와 시스템 예외(Critical Error)의 슬랙 알림 감도 조율 | 260520 / - |
| TASK-260520-03 | [프론트엔드] | [x] | 모바일 사용성 수호 및 데스크톱 여백 활용 반응형 프리미엄 푸터(Footer) 도입 | TASK-260429-23 | 데스크톱 화면 외곽 여백 플로팅(깃허브/블로그), 모바일 홈 하단 스크롤 격리 | 260520 / 260520 |
| TASK-260520-04 | [프론트엔드] | [x] | Pet-Pass 블로그 연동 (A+B안) 및 post1.html 스펙 현행화 | - | 기술적 서사 릴레이 및 공통 프로필 아카이브 카드 결합 적용, 운영 스펙 동기화 | 260520 / 260520 |
| TASK-260520-05 | [프론트엔드] | [x] | 블로그 공통 리소스(CSS/HTML) 중복 제거 및 프로필 카드 동기화 | - | post2/post4 CSS 공통화, profile.html/header.html 조각 분리 및 config.js 글로벌 상수 동적 로드 완공 | 260520 / 260520 |
| TASK-260520-06 | [프론트엔드] | [x] | 블로그 SEO(검색엔진 최적화) 고도화 및 유입 채널 다각화 | TASK-260520-04 | 정적 블로그 문서 meta/OG 태그 개편, robots.txt 및 sitemap.xml 작성 배포 완료 | 260520 / 260609 |
| TASK-260520-07 | [프론트엔드] | [ ] | 블로그 포스트 하단 Giscus 댓글 위젯 동적 연동 | TASK-260520-05 | 독자 소통 강화를 위한 GitHub Issue 기반 Giscus 댓글창 플레이스홀더 주입 및 실시간 테마 토글 연동 로더 | 260520 / - |
| TASK-260611-01 | [보안] | [x] | SaveCompositionRequest 입력 검증 추가 (@Valid + 필드 제약) | - | imageUrl/phrase/subjectPosition NotBlank+Size, selectedTag Size(max=20), starter-validation 의존성 추가, MemeControllerTest 7개 케이스 GREEN | 260611 / 260611 |
| TASK-260611-02 | [보안] | [x] | next.config.js 보안 HTTP 헤더 추가 | - | X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy — security-ddos-review §4.5 구현 | 260611 / 260611 |
| TASK-260611-03 | [인프라/공통] | [x] | /ingest 리라이트 대역폭 모니터링 런북 작성 | - | docs/runbook-ingest-bandwidth.md 추가: 임계값 기준, 이상 탐지 절차, 즉각 대응 가이드 | 260611 / 260611 |




---

## 🏗️ 프로젝트 결정 사항 (Project Decisions)

### 인프라 (Infrastructure)
- **DNS / WAF:** Cloudflare Proxy (주황 구름) — `pick-a-me.me`, `api.pick-a-me.me`, `img.pick-a-me.me` 전체 Proxied
- **Frontend:** Vercel / Custom Domain: `pick-a-me.me` / GitHub Actions + Vercel CLI 자동배포
- **Backend:** OCI (VM.Standard.A1.Flex, Ubuntu 24.04) / Nginx 리버스 프록시 + Let's Encrypt SSL / Custom Domain: `api.pick-a-me.me` / GitHub Actions GHCR 빌드 → SSH pull 자동배포 (Railway에서 260602 이관, TASK-260513-07)
- **Database:** NEON (PostgreSQL 17) / Region: Singapore
- **Cache/Stamina:** Upstash (Redis) / Region: Singapore / Strategy: Eviction Disabled
- **Storage:** Cloudflare R2 (S3 API Compatible) / Custom Domain: `img.pick-a-me.me` / Egress Fee 0원
- **인증:** HttpOnly Cookie JWT (`pam_token`, SameSite=Lax, Secure=true in prod)

### 하트 시스템 (Heart System)
- **BASIC 하트:** Redis SSOT, Lazy Charging (5분/1개, 최대 5개), Redisson 분산 락
- **SPECIAL 하트:** JPA(DB) SSOT, 조건/이벤트 기반 지급, 시간 제한 없음
- **HeartRepository 라우팅:** BASIC → Redis, SPECIAL → JPA (CompositeHeartRepositoryAdapter)
- **이력:** heart_histories 테이블 (CONSUME/CHARGE/GRANT 모두 기록 — 운영 핵심 지표)
- **회원가입 하트 초기화 트랜잭션:** 회원가입 성공 시 하트 생성 및 웰컴 보상 지급은 비동기(@Async)로 처리하지 않고, 동기식 트랜잭션 범위에 묶어 가입 완료 즉시 100% 반영과 화면 깜빡임 차단 보장 (2026-05-20 합의)

### 명명 규칙 및 도메인 언어 (Naming Convention)
- **도메인 객체 분리 원칙:** 백엔드/프론트엔드의 기술적 코드(변수, API, DB)는 **'밈(Meme)'**으로 명칭을 통일하여 유지보수성을 극대화한다. 사용자 노출용 브랜딩 명칭인 **'미미카드(MimiCard)'**는 프론트엔드의 화면 표시 계층 및 i18n 번역 리소스(`ko.json`) 수준에서만 엄격하게 한정하여 적용한다.

### 밈 생성 정책 (Meme Creation Policy)
- **BASIC 하트 사용 시:** 태그 무시, meme_images + meme_phrases 완전 랜덤 조합
- **SPECIAL 하트 사용 시:** 단일 태그 선택 (멀티셀렉트 금지) → 해당 태그 기준 이미지+문구 필터링 후 조합
- **저장 구조:** JSONB composition 스냅샷(imageUrl, subjectPosition, phraseText) → DB의 user_memes 테이블. 합성 이미지는 R2에 업로드하지 않음 (소스 이미지 재사용으로 렌더링)
- **selected_tag 정책:** `user_memes.selected_tag IS NULL` = BASIC 뽑기, `IS NOT NULL` = SPECIAL 뽑기 (선택한 태그 값 저장)
- **소스 데이터 불변 원칙:** `meme_images`, `meme_phrases` 소스 데이터는 절대 삭제하지 않는다. user_memes 이력 재현에 필수. 비활성화 필요 시 is_active 소프트딜리트 사용

### 사용자 상태별 흐름 (User State Flow)
- **비로그인 하트:** localStorage SSOT, 5분 lazy 충전 계산은 클라이언트 전담. 서버 API 호출 없음
- **로그인 하트:** Redis SSOT (HeartService), 서버 연동
- **밈 저장:** 로그인 사용자만 생성과 동시에 자동 서버 저장. 비로그인은 localStorage 히스토리만 (브라우저 닫으면 소멸)
- **워터마크:** 정책 폐기 (260513, TASK-260429-32). 비로그인 워터마크 강화 대신 저장 자체를 차단하는 방향으로 전환. ResultScreen 브랜딩 바는 유지
- **캡처 방지:** 비로그인 전용. 저장 버튼 미노출 + long-press 차단 (TASK-260513-04로 정책 확정)
- **창고 탭:** 로그인 사용자 전용. 비로그인 진입 시 로그인 유도
- **PNG 저장:** 로그인 사용자 전용. html-to-image로 캡처 후 다운로드 (html2canvas에서 마이그레이션, TASK-260515-01). **공유 버튼:** 비로그인도 허용 (TASK-260513-04)
- **소셜 로그인:** 카카오, 구글 SSO. Spring Security OAuth2 + JWT

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
- **비고:** 완료 사유, 대체 태스크 연계, 정책 결정 사항 등 맥락 기록
- **일자:** `생성일 / 완료일`
