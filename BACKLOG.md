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
| TASK-260429-06 | [인프라/공통] | [x] | jOOQ Codegen Gradle 설정 및 인프라 레이어 연동 | - | Spring Data JPA + 네이티브 쿼리로 현재 요구사항 충족. 현 규모에서 오버엔지니어링으로 판단, 도입 철회 | 260429 / 260505 |
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
| TASK-260429-22 | [하트/스테미나] | [/] | SPECIAL 하트 지급 트리거 정의 및 구현 (조건 달성 이벤트 → grantSpecialHeart) | TASK-260429-07 | 최초 로그인 웰컴 보상(1개) 구현 완료(TASK-260512-04). 미션 완료 트리거(useMissions 백엔드 API 연동) 미구현 | 260429 / - |
| TASK-260429-23 | [프론트엔드] | [x] | 프론트엔드 프로젝트 초기 설정 (Next.js 14 App Router, Tailwind, API 클라이언트) | - | - | 260429 / 260430 |
| TASK-260429-24 | [프론트엔드] | [x] | Canvas 에디터 컴포넌트 구현 (동물 사진 + 텍스트/스티커 합성, canvas_state 직렬화) | TASK-260429-23 | v2 재설계에서 CSS 말풍선 방식으로 전환, Canvas 에디터 제거. TASK-260504-08로 대체 | 260429 / 260501 |
| TASK-260429-25 | [프론트엔드] | [x] | 하트 상태 바 컴포넌트 구현 (잔여 하트 표시, BASIC 충전 타이머 카운트다운) | TASK-260429-23 | - | 260429 / 260501 |
| TASK-260429-26 | [프론트엔드] | [x] | 밈 생성 플로우 페이지 구현 (하트 타입 선택 → Canvas 편집 → 저장/공유) | TASK-260429-24, TASK-260429-25 | - | 260429 / 260502 |
| TASK-260429-27 | [프론트엔드] | [x] | 밈 갤러리 피드 페이지 구현 (생성된 밈 목록 조회, 더 보기 페이지네이션) | TASK-260429-23 | - | 260429 / 260503 |
| TASK-260429-28 | [회원/인증] | [x] | Spring Security + OAuth2 소셜 로그인 백엔드 구현 (카카오, 구글 / JWT 발급) | TASK-260429-02 | - | 260429 / 260429 |
| TASK-260429-29 | [프론트엔드] | [x] | 소셜 로그인 프론트엔드 구현 (OAuth2 콜백 처리, JWT 저장, 로그인 상태 전역 관리) | TASK-260429-28, TASK-260429-23 | - | 260429 / 260501 |
| TASK-260429-30 | [프론트엔드] | [x] | 비로그인 하트 관리 훅 구현 (useGuestHeart — localStorage 기반, 5분 lazy 충전 타이머) | TASK-260429-23 | - | 260429 / 260430 |
| TASK-260429-31 | [프론트엔드] | [x] | 로그인 유도 모달 컴포넌트 구현 (혜택 안내, SSO 버튼, "그냥 계속 뽑기" 분기) | TASK-260429-29, TASK-260429-30 | LoginSlideMenu 컴포넌트로 구현 완료. TASK-260504-10(서비스 소개 화면)과 연계되어 해당 태스크에서 고도화 예정 | 260429 / 260505 |
| TASK-260429-32 | [프론트엔드] | [ ] | 워터마크 분기 렌더링 구현 (비로그인: 사선 중앙 / 로그인: 우하단 미니 브랜드) | TASK-260429-24 | ResultScreen 브랜딩 바는 구현됨. 로그인/비로그인 분기 워터마크는 정책 확정 후 진행 | 260429 / - |
| TASK-260429-33 | [프론트엔드] | [ ] | 비로그인 캡처 방지 처리 (long-press 차단, contextmenu 차단, CSS overlay) | TASK-260429-23 | 정책 결정 필요 (완전 차단 불가, UX 저하 감수 범위 논의 필요) | 260429 / - |
| TASK-260430-01 | [문서/기타] | [x] | 브랜치 전략 및 에이전트 워크플로우 가이드라인 추가 | [!] 외부 요청 | - | 260430 / 260430 |
| TASK-260430-02 | [프론트엔드] | [x] | 동물 사진 가챠(Gacha) 시스템 및 로딩 애니메이션 구현 | TASK-260429-26 | - | 260430 / 260501 |
| TASK-260501-01 | [밈/이미지] | [ ] | R2 업로드 후 DB 저장 실패 시 고아 이미지 정리 전략 구현 (보상 트랜잭션 또는 주기적 스캔) | TASK-260429-18, TASK-260429-19 | - | 260501 / - |
| TASK-260501-02 | [프론트엔드] | [x] | 프론트엔드 API 클라이언트 구현 (fetch + Bearer 헤더 + POST /api/memes 연동) | - | - | 260501 / 260503 |
| TASK-260501-03 | [프론트엔드] | [ ] | 밈 완성 후 축하 모달 및 "다시 뽑기" 플로우 구현 | - | "다시 뽑기" 버튼은 ResultScreen에 구현됨. 축하 모달(애니메이션 연출) 미구현 | 260501 / - |
| TASK-260501-04 | [프론트엔드] | [x] | Canvas에 추가된 아이템의 크기(fontSize/stickerScale) 조절 UI 구현 | TASK-260429-24 | v2 재설계로 Canvas 에디터 자체가 제거됨. TASK-260429-24, TASK-260504-08 참고 | 260501 / 260505 |
| TASK-260501-05 | [인프라/공통] | [x] | CI/CD 구축 및 클라우드 배포 (Frontend: Vercel + GitHub Actions, Backend: Railway Docker) | - | Vercel 자동배포(GitHub Actions + Vercel CLI), Railway Docker 자동배포 완료. 도메인: pick-a-me.me / api.pick-a-me.me | 260501 / 260511 |
| TASK-260502-01 | [인프라/공통] | [ ] | Sentry 기반 프론트/백엔드 에러 트래킹 및 알림 채널(Slack/Email) 연동 | TASK-260429-14 | - | 260502 / - |
| TASK-260502-02 | [인프라/공통] | [ ] | 헬스체크/레디니스 엔드포인트 및 외부 의존성(DB/Redis/R2) 상태 점검 추가 | TASK-260501-05 | - | 260502 / - |
| TASK-260502-03 | [밈/이미지] | [ ] | 업로드 이미지 파일 크기/MIME 검증 및 악성 파일 방어 정책 적용 | TASK-260429-20 | - | 260502 / - |
| TASK-260502-04 | [회원/인증] | [ ] | JWT Refresh Token 회전 및 강제 로그아웃(토큰 무효화) 플로우 구현 | TASK-260429-28, TASK-260429-29 | - | 260502 / - |
| TASK-260502-05 | [프론트엔드] | [ ] | 주요 퍼널 이벤트(가챠 시작/완료, 저장 클릭, 로그인 전환) 분석 로깅(GA4/PostHog) 연동 | TASK-260429-26, TASK-260429-31 | - | 260502 / - |
| TASK-260502-06 | [문서/기타] | [ ] | 운영 런북 작성 (장애 대응, R2 고아 파일 정리, 핫픽스/롤백 절차) | TASK-260501-01, TASK-260501-05 | - | 260502 / - |
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
| TASK-260504-10 | [프론트엔드] | [ ] | 로그인/서비스 소개 별도 화면 구현 (슬라이드 애니메이션 전환) | TASK-260504-07 | LoginSlideMenu로 기본 로그인 유도는 있으나, 서비스 소개 콘텐츠 및 온보딩 플로우 미구현 | 260504 / - |
| TASK-260505-01 | [밈/이미지] | [x] | 밈 결과물 저장 기능 구현 (ResultScreen → html2canvas 캡처 → 기기 저장) | TASK-260504-08 | PC는 파일 다운로드, 모바일은 Web Share API로 갤러리 저장. TASK-260429-19(R2 어댑터)와 연계 | 260505 / 260505 |
| TASK-260506-01 | [밈/이미지] | [x] | SPECIAL 뽑기 단일 태그 정책 적용 및 selected_tag 컬럼 추가 (V9 마이그레이션) | TASK-260505-01 | selected_tag NULL=BASIC, NOT NULL=SPECIAL. AIRULES.md 정책 문서화 포함 | 260506 / 260506 |
| TASK-260511-01 | [회원/인증] | [x] | HttpOnly Cookie JWT 전환 (localStorage → pam_token 쿠키, SameSite=Lax) | TASK-260429-28 | OAuth2SuccessHandler, JwtAuthenticationFilter, AuthController(/me, /logout) 구현. CORS allowCredentials=true | 260511 / 260511 |
| TASK-260511-02 | [프론트엔드] | [x] | AuthContext 전역 상태 도입 (/api/auth/me 중복 호출 제거) | TASK-260429-29 | AuthProvider + useAuth Context 패턴. 6개 컴포넌트 → 앱 루트 1회 호출로 통합 | 260511 / 260511 |
| TASK-260511-03 | [인프라/공통] | [x] | Redis Rate Limiting 구현 (RateLimitFilter, 엔드포인트별 토큰 버킷) | - | ConditionalOnBean(RedisTemplate), failClosed 정책, compose/meme-create/oauth2/auth-me 규칙 적용 | 260511 / 260511 |
| TASK-260511-04 | [인프라/공통] | [x] | R2 커스텀 도메인 전환 (pub-*.r2.dev → img.pick-a-me.me, V13 마이그레이션) | - | Cloudflare R2 커스텀 도메인 연결 + meme_images.image_url 일괄 교체 | 260511 / 260511 |
| TASK-260511-05 | [인프라/공통] | [ ] | Origin Shielding 구현 (Railway 기본 도메인 직접 접근 차단) | TASK-260511-03 | X-Origin-Verify 헤더 검증 또는 Cloudflare Tunnel 검토 필요 | 260511 / - |
| TASK-260511-06 | [인프라/공통] | [ ] | IP 기반 Rate Limiting 고도화 (useForwardedHeaders=true, CF-Connecting-IP 실제 IP 식별) | TASK-260511-03 | Cloudflare Proxy 우회 검증 후 활성화. RATE_LIMIT_USE_FORWARDED_HEADERS=true 환경변수 전환 필요 | 260511 / - |
| TASK-260511-07 | [회원/인증] | [ ] | JWT Refresh Token 회전 구현 (Access Token 15분 + Refresh Token rotation + jti denylist) | TASK-260511-01 | - | 260511 / - |
| TASK-260511-08 | [인프라/공통] | [ ] | 인프라 모니터링 강화 (Railway/Neon/Upstash/R2 메트릭 대시보드 + 임계치 알림) | TASK-260502-01 | - | 260511 / - |
| TASK-260512-01 | [하트/스테미나] | [x] | 하트 소모 버그 전면 수정 (로그인/비회원 모두) | TASK-260429-07 | (1) MemeComposeService에 HeartService.consumeHeart 호출 누락 → 추가. (2) 비회원 consumeHeart에서 setCurrentHearts 직접 호출로 즉시 UI 반영. (3) useMemeApi mock 폴백을 네트워크 오류 한정으로 축소 — success=false 응답은 throw. (4) HeartDisplay SPINNING 중 display:none 유지로 observer 연속성 보장, refetchQueries로 즉시 갱신 | 260512 / 260512 |
| TASK-260512-02 | [프론트엔드] | [x] | 로그아웃 시 홈(/) 리다이렉트 구현 | TASK-260429-29 | LoginSlideMenu 로그아웃 버튼에 router.replace("/") 추가 | 260512 / 260512 |
| TASK-260512-03 | [프론트엔드] | [x] | 미로그인 상태 스페셜 미션(⚡) 버튼 클릭 시 로그인 메뉴 오픈 | TASK-260504-07 | HeartDisplay ⚡ 버튼에 isLoggedIn 분기 추가. 미로그인 → onMenuOpen(), 로그인 → 미션 시트 | 260512 / 260512 |
| TASK-260512-04 | [회원/인증] | [x] | 최초 로그인 웰컴 알럿 + SPECIAL 하트 1개 지급 | TASK-260429-22 | HeartInitializeListener에서 신규 가입 시 SPECIAL 1개 추가 지급. OAuth2SuccessHandler에서 신규 유저 시 ?welcome=1 파라미터로 리다이렉트. 프론트엔드 콜백에서 감지 → 홈에서 웰컴 알럿 표시 | 260512 / 260512 |
| TASK-260512-05 | [프론트엔드] | [x] | 로그인 직후 하트 표시 깜빡임(0→5→실제값) 수정 | TASK-260512-01 | (1) useHeart에 placeholderData: prev 추가 — 리페치 중 이전 값 유지. (2) MemeComposeService 하트 차감 순서 안전하게 재정렬(조합→차감→저장). (3) HeartDisplay 초기 로딩 중(serverHearts=null) 숫자 0 대신 '—' 표시(heartsReady 플래그) | 260512 / 260512 |
| TASK-260512-06 | [프론트엔드] | [x] | 다크모드 구현 및 라이트/다크 토글 | - | CSS 커스텀 프로퍼티(:root / [data-theme=dark]) 기반 토큰 시스템(피카밈 브랜드 네온 팔레트). useTheme 훅 + ThemeProvider + localStorage 영속. flash 방지 인라인 스크립트. 전 컴포넌트(15개) 인라인 스타일 var(--pam-*) 교체. HeartDisplay 상단바 🌙/☀️ 버튼 + LoginSlideMenu 토글 배치. 향후 영어 버전 대응 가능 ThemeContext 구조 | 260512 / 260512 |

---

## 🏗️ 프로젝트 결정 사항 (Project Decisions)

### 인프라 (Infrastructure)
- **DNS / WAF:** Cloudflare Proxy (주황 구름) — `pick-a-me.me`, `api.pick-a-me.me`, `img.pick-a-me.me` 전체 Proxied
- **Frontend:** Vercel / Custom Domain: `pick-a-me.me` / GitHub Actions + Vercel CLI 자동배포
- **Backend:** Railway (Docker) / Custom Domain: `api.pick-a-me.me` / 자동배포
- **Database:** NEON (PostgreSQL 17) / Region: Singapore
- **Cache/Stamina:** Upstash (Redis) / Region: Singapore / Strategy: Eviction Disabled
- **Storage:** Cloudflare R2 (S3 API Compatible) / Custom Domain: `img.pick-a-me.me` / Egress Fee 0원
- **인증:** HttpOnly Cookie JWT (`pam_token`, SameSite=Lax, Secure=true in prod)

### 하트 시스템 (Heart System)
- **BASIC 하트:** Redis SSOT, Lazy Charging (5분/1개, 최대 5개), Redisson 분산 락
- **SPECIAL 하트:** JPA(DB) SSOT, 조건/이벤트 기반 지급, 시간 제한 없음
- **HeartRepository 라우팅:** BASIC → Redis, SPECIAL → JPA (CompositeHeartRepositoryAdapter)
- **이력:** heart_histories 테이블 (CONSUME/CHARGE/GRANT 모두 기록 — 운영 핵심 지표)

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
- **워터마크:** 비로그인 → 사선 중앙(못생기게), 로그인 → 우하단 미니("PICK-A-MEME", 깔끔하게)
- **캡처 방지:** 비로그인 전용. long-press / contextmenu / CSS overlay로 불편하게 만드는 수준 (완전 차단은 기술적 불가)
- **창고 탭:** 로그인 사용자 전용. 비로그인 진입 시 로그인 유도
- **PNG 저장 / 공유 버튼:** 로그인 사용자 전용. html2canvas로 Canvas 영역 캡처 후 다운로드 (추후 논의)
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
