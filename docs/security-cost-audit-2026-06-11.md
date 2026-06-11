# Pick-a-Meme 비용·보안 취약점 감사

작성일: 2026-06-11 / 최종 현행화: 2026-06-11

## 1. 감사 범위 및 방법론

- **백엔드**: Kotlin + Spring Boot (pam-api, pam-application, pam-domain, pam-infrastructure)
- **프론트엔드**: Next.js 14 App Router
- **인프라**: Vercel, Cloudflare R2, NEON PostgreSQL, Upstash Redis, OCI VM, GitHub Actions CI/CD
- **방법론**: 정적 코드 분석 → 고위험 판정 항목 직접 코드 재검증 → 등급 확정

> **재검증 원칙**: 에이전트 탐색 단계에서 과장 판정된 항목은 실제 코드를 재확인해 등급을 조정했다. 조정 사유는 각 항목에 명시한다.

---

## 2. 핵심 결론

1. **전체 위험 수준은 낮음(Low)이다.** JWT 인증, 쿠키 보안, 하트 분산 락, OCI 오리진 실드, R2 CDN 직접 서빙 등 핵심 보호 체계가 모두 정상 작동한다.

2. **수정이 필요한 항목은 2건이다.** `SaveCompositionRequest` 입력 미검증(보안 MEDIUM)과 보안 HTTP 헤더 미적용(LOW)이 유일한 실제 이슈다. 나머지는 모니터링 관점의 참고 사항이다.

3. **NEON 비용 문제는 PR#143에서 해결됐다.** `keepalive-time: 0` + `minimum-idle: 0` 적용으로 유휴 시 NEON이 sleep한다. `/api/hearts` 60초 폴링은 현 트래픽 규모에서 문제가 없다.

4. **PostHog `/ingest` 리라이트는 Edge 리라이트(Vercel Lambda 아님)다.** 함수 호출 비용 없이 동작한다. 대역폭 남용 시나리오는 이론적 수준이며 PostHog 자체 쿼터로 제한된다.

5. **sessionStorage의 XSS 우려는 무효다.** `pam_pending_meme`의 `phrase` 값은 React JSX로 렌더링되어 자동 이스케이프되며, OAuth 콜백 페이지에서 DOM에 직접 출력되지 않는다.

---

## 3. 비용 리스크 발견 항목

### 3.1 /ingest 리라이트 대역폭 남용 가능성 🟡 LOW-MEDIUM

**파일:** `pam-frontend/next.config.js`

```js
{ source: '/ingest/:path*', destination: 'https://us.i.posthog.com/:path*' }
```

**내용:** Next.js Edge 리라이트로 구현되어 Vercel Lambda 호출 비용은 없다. 그러나 임의의 요청이 `pick-a-me.me/ingest/*`를 통해 PostHog로 프록시될 수 있어 Vercel 아웃바운드 대역폭이 소모된다. PostHog는 프로젝트 API 키로 데이터를 식별하므로 오염된 데이터가 유입될 수는 있다.

**실제 위험도 판단:** PostHog 자체 수집 쿼터 + Vercel 무료 플랜 대역폭 한도 내에서 제한된다. 현재 트래픽 규모에서 즉각적 위협은 없다.

**대응:** 이상 트래픽 발생 시 `next.config.js` 리라이트를 제거하고 PostHog 직접 호출로 전환하면 즉시 차단 가능. (TASK-260611-03: 모니터링 임계값 설정)

---

### 3.2 통과 항목 (비용)

| 항목 | 상태 | 근거 |
|---|---|---|
| 이미지 Vercel 경유 없음 | ✅ PASS | `<img src={meme.imageUrl}>` → `img.pick-a-me.me` (Cloudflare R2 CDN 직접) |
| Vercel 함수 프록시 없음 | ✅ PASS | 모든 API 호출이 OCI 백엔드 직접 통신 (`lib/api.ts`) |
| PostHog 세션 리플레이 샘플링 | ✅ PASS | `sampleRate: 0.1` — 10% 적용, Vercel Egress 절감 (`AnalyticsProvider.tsx`) |
| NEON HikariCP keepalive 수정 | ✅ PASS | `keepalive-time: 0`, `minimum-idle: 0` (PR#143) |
| `/api/hearts` 60초 폴링 | ✅ INFO | 현 트래픽 규모 문제 없음. MAU 1,000+ 도달 시 재검토 (`hooks/useHeart.ts:27`) |

---

## 4. 보안 취약점 발견 항목

### 4.1 SaveCompositionRequest 입력 미검증 🔴 MEDIUM

**파일:**
- `pam-api/src/main/kotlin/com/pickameme/api/meme/SaveCompositionModels.kt`
- `pam-application/src/main/kotlin/com/pickameme/application/meme/SaveCompositionService.kt`

```kotlin
// 현재: 검증 없음
data class SaveCompositionRequest(
    val imageId: UUID,
    val phraseId: UUID,
    val imageUrl: String,          // 무제한 문자열
    val subjectPosition: String,   // 무제한 문자열
    val phrase: String,            // 무제한 문자열
    val heartType: HeartType,
    val selectedTag: String?,
)
```

**문제:**
1. `imageId` / `phraseId`는 UUID 타입으로 형식은 검증되지만 **DB에 실제 존재하는지 조회하지 않는다.** 인증된 사용자가 임의의 UUID를 전송해 갤러리에 허위 레코드를 저장할 수 있다.
2. `imageUrl`은 길이 제한이 없는 문자열이다. DB에 저장 후 갤러리에서 `<img src={imageUrl}>` 로 렌더링되어, 공격자가 자신의 갤러리에 임의의 URL을 이미지로 저장할 수 있다. (XSS는 아니나 외부 리소스 참조)
3. `phrase`는 길이 제한이 없어 과도하게 긴 문자열이 DB에 저장될 수 있다.

**대응:** TASK-260611-01 참고.

```kotlin
// 권장 수정 방향
data class SaveCompositionRequest(
    val imageId: UUID,
    val phraseId: UUID,
    @field:Pattern(regexp = "^https://img\\.pick-a-me\\.me/.*") val imageUrl: String,
    @field:Size(max = 50) val subjectPosition: String,
    @field:NotBlank @field:Size(max = 200) val phrase: String,
    val heartType: HeartType,
    @field:Size(max = 20) val selectedTag: String?,
)
// + MemeController에 @Valid 추가
// + SaveCompositionService에서 imageId/phraseId DB 존재 여부 확인
```

---

### 4.2 보안 HTTP 헤더 미적용 🟡 LOW

**파일:** `pam-frontend/next.config.js`

`docs/security-ddos-review.md` §4.5에 추가 권장으로 명시됐으나 구현되지 않았다.

**현재 상태:** `next.config.js`에 `headers()` 설정 없음.

**영향:** 클릭재킹(`X-Frame-Options` 없음), MIME 스니핑(`X-Content-Type-Options` 없음), 리퍼러 노출(`Referrer-Policy` 없음).

**대응:** TASK-260611-02 참고. `security-ddos-review.md` §4.5의 권장 설정을 그대로 적용하면 된다.

---

### 4.3 통과 항목 (보안)

| 항목 | 상태 | 근거 파일 |
|---|---|---|
| JWT — HMAC-SHA, 외부 시크릿 | ✅ PASS | `JwtProvider.kt:19-24` |
| JWT — Access Token 15분 TTL | ✅ PASS | `application.yml:63` |
| Refresh Token — 회전 + 패밀리 도용 탐지 | ✅ PASS | `RefreshTokenService.kt:38-54` (재사용 시 전체 패밀리 폐기) |
| 쿠키 — HttpOnly, Secure, SameSite=Lax | ✅ PASS | `OAuth2SuccessHandler.kt:41-49` |
| 쿠키 — pam_refresh 경로 `/api/auth`로 한정 | ✅ PASS | `AuthController.kt:58-59` |
| 하트 차감 — Redisson 분산 락 | ✅ PASS | `RedissonLockManager.kt:14-16` |
| 레이트 리밋 — IP 추출 우선순위 CF-Connecting-IP | ✅ PASS | `RateLimitFilter.kt:91-93` |
| 레이트 리밋 — Redis 장애 시 fail-closed | ✅ PASS | `RateLimitFilter.kt:46-50`, `application.yml:86` |
| CORS — 환경변수 기반, allowCredentials + 명시 오리진 | ✅ PASS | `SecurityConfig.kt:75-84` |
| 에러 응답 — 스택 트레이스 클라이언트 미노출 | ✅ PASS | `GlobalExceptionHandler.kt:92-94` |
| 시크릿 — 전량 환경변수 참조, 하드코딩 없음 | ✅ PASS | `application.yml` 전체 |
| OCI 오리진 실드 — Cloudflare IPv4 전용 | ✅ PASS | TASK-260511-05 구현 완료 |
| Actuator — `/actuator/health`만 공개 | ✅ PASS | `SecurityConfig.kt:47` |
| CI/CD — SSH 키 기반, 시크릿 env-file 주입 | ✅ PASS | `deploy-backend.yml:44-64` |
| SQL 인젝션 — 태그 쿼리 파라미터 바인딩 | ✅ PASS | `SpringDataJpaMemeImageRepository.kt:13-24` |

---

### 4.4 과장 판정 항목 (재검증 후 하향)

| 항목 | 탐색 판정 | 재검증 결과 | 사유 |
|---|---|---|---|
| pam_pending_meme XSS | HIGH | INFORMATIONAL | `phrase`가 React JSX로 자동 이스케이프됨. 콜백 페이지에서 DOM 직접 출력 없음 (`oauth2/callback/page.tsx:29`) |
| X-Forwarded-For 위조 | MEDIUM | INFORMATIONAL | `CF-Connecting-IP` 우선 처리, OCI Security List가 Cloudflare 이외 트래픽 물리적 차단 — X-Forwarded-For 폴백은 사실상 dead code |
| useHeart 60s 폴링 | HIGH | LOW (INFO) | PR#143 keepalive 수정이 실제 NEON 문제를 해결함. 폴링 자체는 현 규모에서 무해 |
| pam_guest_hearts localStorage | MEDIUM | INFORMATIONAL | 백엔드가 서버 상태를 실제 강제값으로 사용. 로컬 조작은 UI에만 영향 |
| /ingest 오픈 프록시 | HIGH | LOW-MEDIUM | Edge 리라이트 → Lambda 호출 비용 없음. 대역폭 위험은 실재하나 즉각적 위협 아님 |

---

## 5. 즉시 실행 체크리스트

- [ ] `SaveCompositionRequest`에 `@Valid` + 필드별 제약 추가, `imageUrl` Cloudflare 도메인 패턴 검증 (TASK-260611-01)
- [ ] `SaveCompositionService`에서 `imageId`/`phraseId` DB 존재 확인 추가 (TASK-260611-01)
- [ ] `next.config.js`에 보안 HTTP 헤더 추가 — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` (TASK-260611-02)
- [ ] `/ingest` 리라이트 Vercel 아웃바운드 대역폭 이상 증가 알림 설정 (TASK-260611-03)
- [ ] (기존) Sentry 연동 및 DomainException 필터링 정책 정의 (TASK-260502-01, TASK-260520-02)

---

## 6. 참고 문서

- 이전 보안 감사: `docs/security-ddos-review.md` (2026-05-11 작성)
- 인프라 운영 기록: `docs/cloudflare-ops.md`
- BACKLOG: TASK-260611-01, TASK-260611-02, TASK-260611-03
