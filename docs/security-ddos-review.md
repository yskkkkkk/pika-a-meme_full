# Pick-a-Meme 서비스 아키텍처 보안 및 DDoS 방어 점검

작성일: 2026-05-11

## 1. 현재 구조 요약

- Frontend: Next.js, Vercel 배포, `pick-a-me.me`.
- Backend: Spring Boot / Kotlin, Railway 배포, `api.pick-a-me.me`.
- DB/Cache: Neon PostgreSQL, Upstash Redis 외부 SaaS.
- Storage: Cloudflare R2.
- 인증: Google/Kakao OAuth2 로그인 후 백엔드가 `pam_token` JWT를 `HttpOnly`, `SameSite=Lax` 쿠키로 발급한다.
- 현재 백엔드는 `CORS_ALLOWED_ORIGINS` 환경변수 기반으로 CORS 허용 Origin을 구성한다.

## 2. 핵심 결론

1. **최소 비용 최대 방어의 1순위는 Cloudflare Proxy + 백엔드 Rate Limiting 병행**이다. Cloudflare는 대용량 L3/L4/L7 DDoS 흡수를 담당하고, Spring Boot Rate Limiting은 Railway 컨테이너/DB/Redis/R2 비용 폭탄을 막는다.
2. **Rate Limit은 단일 전역 값이 아니라 엔드포인트 위험도별로 분리**해야 한다. `/api/memes/compose`, `POST /api/memes`, OAuth2 진입점, `/api/auth/me`, 공개 갤러리 조회는 비용 특성이 다르다.
3. **JWT는 현재 24시간 단일 Access Token 구조로 보이며 Replay Attack에 취약하다.** Access Token TTL 단축, Refresh Token 회전, 서버 측 토큰 버전/블랙리스트, 재사용 탐지를 도입한다.
4. **CORS는 운영 환경에서 `https://pick-a-me.me`와 필요한 Preview Origin만 허용**한다. `allowedHeaders=*`는 동작상 편하지만, 운영에서는 명시 목록으로 줄이는 편이 좋다.
5. **Cloudflare 전환 시 DNS만 옮기는 것으로는 부족하다.** `pick-a-me.me`, `api.pick-a-me.me`를 Proxied로 두고, Railway 원본 도메인 직접 접근 차단 또는 Cloudflare Access/Workers/Origin 검증을 추가해야 우회 공격을 줄일 수 있다.

## 3. 공격 시나리오와 대응 우선순위

| 시나리오 | 영향 | 즉시 대응 | 중장기 대응 |
| --- | --- | --- | --- |
| 대량 `GET /api/memes/compose` 호출 | CPU/DB/Redis/R2 호출 증가, Railway 과금 및 성능 저하 | IP+사용자 단위 Rate Limit, 비로그인 더 낮은 한도 | Cloudflare WAF Rate Limiting, Bot Fight/Turnstile |
| 대량 `POST /api/memes` multipart 업로드 | 메모리/네트워크/R2 저장 비용 증가 | 요청 바디 크기 제한, 인증 사용자별 생성 한도 | 이미지 처리 큐 분리, 업로드 사전 서명 URL 정책 강화 |
| 공개 갤러리 무한 페이지 조회 | DB 커넥션 고갈, Neon 비용/성능 영향 | 최대 `size` 제한, 캐시, IP 단위 완만한 제한 | CDN 캐싱, read replica/edge cache |
| OAuth2 로그인 플러딩 | OAuth provider 콜백/세션 처리 부하, 계정 생성 남용 | `/oauth2/authorization/*`, `/login/oauth2/code/*` Rate Limit | WAF challenge, provider별 abuse monitoring |
| JWT 탈취 후 재사용 | 사용자 데이터 조회/밈 생성/하트 소모 | Access Token TTL 단축, 로그아웃 블랙리스트 | Refresh Token rotation + reuse detection |
| Origin 직접 타격 | Cloudflare 우회, Railway 직접 과금 | Railway 기본 도메인 비공개/미노출, Origin 검증 헤더 | Cloudflare Tunnel 또는 origin allowlist |

## 4. Quick Win 설정

### 4.1 Spring Boot: 요청 크기/커넥션 방어

`application.yml`에 운영 기본값을 추가한다. 이미지 업로드 정책에 맞춰 `max-file-size`는 서비스 기준으로 조정한다.

```yaml
server:
  port: 8080
  tomcat:
    threads:
      max: 80
      min-spare: 10
    accept-count: 50
    connection-timeout: 5s
    max-connections: 200

spring:
  servlet:
    multipart:
      max-file-size: 3MB
      max-request-size: 4MB
```

권장값:

- `POST /api/memes`: 이미지 1장 업로드라면 3~5MB를 넘기지 않는다.
- `GET /api/memes`: `size` 최대 50 이하로 서버에서 clamp한다.
- DB pool은 Railway 인스턴스 크기와 Neon 플랜에 맞춰 작게 유지한다. 현재 Hikari timeout 계열 설정은 있으므로 `maximum-pool-size`를 명시해 폭주 시 DB를 먼저 보호한다.

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 5
      minimum-idle: 1
```

### 4.2 Backend Rate Limiting 전략

가장 비용 효율적인 방식은 **Redis 기반 토큰 버킷**이다. 이미 Redis를 사용하므로 신규 인프라 없이 적용 가능하다.

권장 정책:

| 대상 | 키 | 권장 한도 | 실패 응답 |
| --- | --- | --- | --- |
| `GET /api/memes/compose` 비로그인 | IP | 10/min | 429 |
| `GET /api/memes/compose` 로그인 | userId + IP | 30/min, 300/day | 429 |
| `POST /api/memes` | userId | 5/min, 50/day | 429 |
| `/oauth2/authorization/*` | IP | 10/min | 429 또는 Cloudflare challenge |
| `/api/auth/me` | IP + userId | 60/min | 429 |
| 공개 GET 목록 | IP | 120/min | 429, 캐시 우선 |

구현 원칙:

- 필터는 Spring Security 앞단 또는 `OncePerRequestFilter`로 둔다.
- Cloudflare 도입 후에는 `CF-Connecting-IP`를 신뢰하되, 요청이 Cloudflare를 거쳤는지 검증하기 전에는 임의 헤더를 신뢰하지 않는다.
- Rate Limit 초과 시 DB 조회 전에 즉시 `429 Too Many Requests`와 `Retry-After`를 반환한다.
- Redis 장애 시에는 보호 대상 고비용 엔드포인트는 fail-closed, 단순 공개 GET은 짧은 로컬 fallback으로 fail-open을 고려한다.

예시 설정:

```yaml
app:
  rate-limit:
    enabled: true
    default:
      capacity: 120
      refill-tokens: 120
      refill-period: 1m
    rules:
      compose-anonymous:
        path: /api/memes/compose
        capacity: 10
        refill-tokens: 10
        refill-period: 1m
      meme-create:
        method: POST
        path: /api/memes
        capacity: 5
        refill-tokens: 5
        refill-period: 1m
```

### 4.3 JWT/OAuth2 인증 보안

현재 구조에서 즉시 적용할 설정:

```yaml
jwt:
  expiration-ms: 900000 # 15분

cookie:
  secure: true
```

추가 권장:

- `JWT_SECRET`은 최소 256-bit 이상 랜덤 값을 사용하고 정기 교체한다.
- JWT claim에 `iss`, `aud`, `iat`, `exp`, `jti`, `tokenVersion`을 포함한다.
- 로그아웃 시 `jti`를 Redis에 만료 시각까지 저장해 재사용을 차단한다.
- Refresh Token은 DB/Redis에 해시로 저장하고 매 사용마다 회전한다.
- Refresh Token 재사용이 감지되면 해당 사용자 세션 패밀리를 모두 폐기한다.
- OAuth2 `state` 검증은 Spring Security 기본 흐름을 유지하되, 프론트 콜백 페이지가 URL에 토큰을 노출하지 않도록 현재처럼 쿠키 전달 방식을 유지한다.
- 민감 작업 추가 시 CSRF 토큰 또는 double-submit cookie를 검토한다. `SameSite=Lax`는 일반적인 cross-site POST CSRF를 줄이지만, 모든 브라우저/리다이렉트 edge case를 완전히 대체하지는 않는다.

### 4.4 CORS 운영 설정

운영 환경변수는 다음처럼 제한한다.

```bash
CORS_ALLOWED_ORIGINS=https://pick-a-me.me,https://www.pick-a-me.me
OAUTH2_REDIRECT_URI=https://pick-a-me.me/oauth2/callback
COOKIE_SECURE=true
NEXT_PUBLIC_API_URL=https://api.pick-a-me.me
```

Spring CORS 권장 변경:

```kotlin
configuration.allowedMethods = listOf("GET", "POST", "PATCH", "OPTIONS")
configuration.allowedHeaders = listOf("Authorization", "Content-Type", "X-Requested-With")
configuration.exposedHeaders = listOf("Retry-After")
configuration.allowCredentials = true
configuration.maxAge = 3600
```

주의사항:

- `allowCredentials=true`일 때 `allowedOrigins=*`는 사용하지 않는다.
- Vercel Preview 배포를 허용해야 한다면 `https://*.vercel.app` 전체 허용 대신, 운영 백엔드와 preview 백엔드를 분리하거나 preview 전용 환경변수에 제한된 Preview URL만 넣는다.
- CORS는 브라우저 보안 정책이지 서버 간 직접 호출 방어가 아니므로 DDoS 방어 수단으로 간주하지 않는다.

### 4.5 Vercel/Next.js 헤더 Quick Win

`next.config.js`에 보안 헤더를 추가한다.

```js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async rewrites() {
    return [
      { source: '/blog', destination: '/blog/index.html' },
      { source: '/blog/:post', destination: '/blog/:post.html' },
    ]
  },
}
```

CSP는 이미지 합성/외부 이미지/R2 도메인을 확인한 뒤 Report-Only로 시작한다.

## 5. Cloudflare 도입 제언

### 5.1 실익

Cloudflare 공식 문서 기준으로 Proxied DNS는 Cloudflare가 HTTP 요청을 프록시하면서 보호/캐시/분석 기능을 제공하고, DNS-only는 원본 IP 노출 및 DDoS/WAF/캐싱 보호 제외 위험이 있다. 또한 Cloudflare DDoS Protection은 모든 플랜에서 항상 켜져 있고 Free 플랜에도 DDoS 보호와 Bot Fight Mode가 포함된다.

따라서 현재 가비아 DNS만 사용하는 상태라면 Cloudflare Proxy 전환 실익은 크다.

- 대규모 L3/L4 트래픽을 Railway가 직접 맞지 않게 한다.
- 정적 프론트와 공개 GET API에 edge cache를 붙일 수 있다.
- 공격 중 "Under Attack Mode", Bot Fight Mode, WAF custom rule을 즉시 켤 수 있다.
- 국가/ASN/URI 기반 차단을 앱 배포 없이 적용할 수 있다.

### 5.2 권장 DNS 구성

| Hostname | Target | Proxy | 비고 |
| --- | --- | --- | --- |
| `pick-a-me.me` | Vercel CNAME/Apex | Proxied 가능 여부 검증 후 적용 | Vercel 권장 DNS와 충돌 없는지 확인 |
| `www.pick-a-me.me` | Vercel | Proxied | canonical redirect |
| `api.pick-a-me.me` | Railway public domain | Proxied | API 보호 핵심 |
| R2 public/custom domain | R2 | Cloudflare 관리 | public asset cache 정책 분리 |

### 5.3 Origin 우회 방지

Cloudflare만 앞에 두고 Railway 기본 도메인이 살아 있으면 공격자가 `*.up.railway.app` 또는 노출된 원본으로 직접 때릴 수 있다.

권장 순서:

1. 앱/문서/로그/프론트 코드에서 Railway 원본 URL 노출 제거.
2. 백엔드에서 `X-Origin-Verify` 같은 secret header를 검사한다. Cloudflare Worker 또는 Transform Rule에서만 해당 헤더를 주입한다.
3. 가능하면 Cloudflare Tunnel로 Railway 대신 Cloudflare 경유만 허용하는 구조를 검토한다.
4. `CF-Connecting-IP`는 Cloudflare 경유 검증 후에만 실제 IP로 사용한다.

### 5.4 Cloudflare Rules 초안

- WAF Custom Rule: `http.host eq "api.pick-a-me.me" and not cf.client.bot` 대상.
- URI별 Rate Limit:
  - `/api/memes/compose`: IP당 10~30/min.
  - `POST /api/memes`: IP당 5/min + 인증 사용자별 앱 rate limit.
  - `/oauth2/authorization/*`: IP당 10/min.
- Cache Rule:
  - 공개 이미지/R2 asset: 긴 TTL.
  - `/api/memes/recent-matched`: 10~30초 cache 검토.
  - 인증 쿠키가 필요한 API는 cache bypass.
- 공격 시 임시 룰:
  - 특정 국가/ASN 차단 또는 managed challenge.
  - 비브라우저 User-Agent 차단. 단, Kakao/Google OAuth 콜백 및 정상 크롤러 예외 필요.

## 6. 중장기 고도화 로드맵

### 6.1 인증/세션

- Access Token 15분 + Refresh Token 7~30일 구조로 전환한다.
- Refresh Token rotation과 reuse detection을 구현한다.
- Redis에 `jti` denylist 및 사용자 `tokenVersion`을 저장한다.
- 관리자/민감 기능이 생기면 step-up 인증을 도입한다.

### 6.2 애플리케이션 방어

- API별 비용 점수 기반 quota를 둔다. 예: compose=3점, upload=10점, gallery=1점.
- 사용자 평판을 만든다. 신규 계정/비로그인/실패율 높은 IP는 낮은 quota를 적용한다.
- 이미지 처리, R2 업로드, DB write를 큐 기반 비동기로 분리해 요청 폭주가 직접 비용으로 이어지지 않게 한다.
- 모든 `page`, `size`, `tags`, multipart 크기와 content-type 검증을 서버에서 강제한다.

### 6.3 관측/알림

- Railway CPU/Memory/Network, 429 비율, 5xx 비율, endpoint별 p95 latency 알림을 만든다.
- Neon connection count와 slow query, Upstash command count, R2 operation count를 대시보드화한다.
- 공격 대응 runbook을 만든다. 예: Cloudflare Under Attack Mode 활성화, compose 임시 차단, 비로그인 compose 비활성화, Railway scale 상한 확인.

### 6.4 인프라

- Cloudflare WAF Managed Rules와 API Shield는 트래픽/매출이 커질 때 도입한다.
- Cloudflare Turnstile을 비로그인 고비용 작업 또는 의심 트래픽에만 조건부 적용한다.
- Cloudflare Workers를 API 앞단 validation/rate-limit 계층으로 둘 수 있으나, 초기에는 Spring+Redis와 Cloudflare Rules가 비용 대비 효율적이다.
- 서비스가 커지면 Railway의 spending limit/usage alert, Neon/Upstash/R2 예산 알림을 모두 설정한다.

## 7. 즉시 실행 체크리스트

- [ ] 운영 `CORS_ALLOWED_ORIGINS`를 `https://pick-a-me.me,https://www.pick-a-me.me`로 제한한다.
- [ ] 운영 `COOKIE_SECURE=true`, `NEXT_PUBLIC_API_URL=https://api.pick-a-me.me`를 확인한다.
- [ ] JWT 만료를 15분으로 줄이고 Refresh Token rotation 작업을 우선순위에 올린다.
- [x] `POST /api/memes`, `GET /api/memes/compose`, OAuth2 시작점에 Redis Rate Limit을 붙인다. 기본 Redis 토큰 버킷 필터를 구현했다.
- [ ] multipart max size, page size clamp, Hikari max pool size를 명시한다.
- [ ] Cloudflare로 DNS를 이전하고 `api.pick-a-me.me`를 Proxied로 둔다.
- [ ] Railway 원본 도메인 직접 접근을 막기 위한 Origin 검증 헤더 또는 Tunnel을 검토한다.
- [ ] Cloudflare WAF/Rate Limit/Cache Rule 초안을 적용하고 공격 시 임시 룰을 runbook에 적는다.

## 8. 참고한 공식 문서

- Cloudflare DNS Proxy status: https://developers.cloudflare.com/learning-paths/get-started/domain-resolution/proxy-status/
- Cloudflare DDoS Protection overview: https://developers.cloudflare.com/ddos-protection/
- Cloudflare DDoS FAQ: https://developers.cloudflare.com/ddos-protection/frequently-asked-questions/
- Cloudflare WAF interoperability: https://developers.cloudflare.com/waf/feature-interoperability/
