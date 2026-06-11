# Runbook: /ingest 리라이트 대역폭 모니터링 (TASK-260611-03)

작성일: 2026-06-11

## 배경

`pam-frontend/next.config.js`의 Edge 리라이트 규칙이 `/ingest/*` 경로를 PostHog로 프록시한다.
Lambda 호출 비용은 없지만 Vercel 아웃바운드 대역폭을 소모한다.

```js
{ source: '/ingest/:path*', destination: 'https://us.i.posthog.com/:path*' }
```

## 모니터링 기준

| 지표 | 임계값 | 비고 |
|---|---|---|
| Vercel 아웃바운드 대역폭 | 월 90GB 초과 경보 | 무료 플랜 한도 100GB |
| PostHog `/ingest` 요청 수 | 일 500,000건 초과 경보 | PostHog 자체 쿼터 |

## 이상 탐지 절차

1. **Vercel Dashboard → Usage → Bandwidth** 에서 월간 추이 확인
2. 비정상 급증 시 PostHog Dashboard → 이벤트 수 비교
   - PostHog 이벤트와 대역폭이 비례하면 정상 성장
   - 대역폭만 급증하면 남용 의심

## 즉각 대응 (남용 확인 시)

```js
// next.config.js — 리라이트 제거 후 PostHog 직접 호출로 전환
// AnalyticsProvider.tsx에서 api_host를 'https://us.i.posthog.com'으로 변경
```

1. `next.config.js`에서 `/ingest` 리라이트 두 줄 삭제
2. `pam-frontend/app/AnalyticsProvider.tsx`에서 `api_host` 직접 지정
3. 배포 후 Vercel 대역폭 감소 확인
