# Cloudflare 운영 설정 기록

인프라 변경 이력과 그 이유를 기록합니다.

---

## Terraform 도입 검토 (2026-05-13)

### 결론: 현 시점 미도입

Cloudflare 설정이 늘어나면서 IaC(Infrastructure as Code) 도입을 검토했으나, 현 시점에서는 도입하지 않기로 결정.

**미도입 이유:**

1. **플랫폼 Provider 완성도 부족**
   현재 인프라 스택(Vercel, Railway, Upstash)의 Terraform Provider는 커뮤니티 maintained 수준으로, 기능 누락과 버그가 있어 결국 콘솔 병행이 불가피함. State drift 관리 부담만 가중될 수 있음.

2. **반복 프로비저닝 필요성 없음**
   Terraform의 핵심 가치는 동일 스택을 dev/staging/prod로 찍어내거나, 팀이 인프라 변경을 코드 리뷰하는 구조에서 발휘됨. 현재는 싱글 환경이고 변경 빈도도 낮음.

3. **긴급 대응 시 오히려 불편**
   Cache Rule, Polish, TLS 같은 설정은 긴급 상황에서 콘솔에서 직접 바꾸는 경우가 생기고, 이때마다 state를 맞추는 비용이 발생함.

**재검토 시점:**
- 멀티 환경(dev/staging/prod)이 필요해질 때
- 팀 규모가 2명 이상으로 늘어날 때
- Cloudflare Workers, D1, Pages 등 리소스가 복잡해질 때

**도입 시 우선 범위:** 전체 인프라보다 Cloudflare만 먼저 도입하는 것이 현실적. Provider 품질이 상대적으로 좋고, DNS 레코드·캐시 규칙 같이 실수 시 서비스 장애로 이어지는 설정을 코드로 추적하는 가치가 있음.

---

---

## 2026-05-13

### 1. R2 도메인 단일화

**변경:** R2 버킷의 Public Development URL(`pub-xxx.r2.dev`) 비활성화, 커스텀 도메인(`img.pick-a-me.me`)으로 단일화

**이유:** `r2.dev` 주소는 Cloudflare 캐싱·성능 최적화 기능이 적용되지 않음. 커스텀 도메인으로 단일화하여 이후 CDN 최적화 설정을 일관되게 적용하기 위함.

**연관 DB 마이그레이션:** V13 (`meme_images.image_url`), V14 (`user_memes.composition.imageUrl`) — 기존에 `r2.dev` URL로 저장된 레코드를 일괄 교체.

---

### 2. TLS 최소 버전 상향

**변경:** 최소 TLS 1.0 → 1.2

**이유:** 최신 모바일 브라우저 보안 요구사항 충족. TLS 1.0/1.1은 POODLE, BEAST 등 알려진 취약점이 있으며 실사용 클라이언트 중 1.2 미만 지원 기기는 없음.

---

### 3. Polish — 비활성 (Free 플랜 미지원)

**현재 상태:** 비활성. Cloudflare Polish는 Pro 플랜($20/월) 이상에서만 작동하며, 현재 Free 플랜 운영 중이므로 설정값과 무관하게 적용되지 않음.

**원래 의도:** 원본 PNG/JPEG를 WebP/AVIF로 자동 변환·압축하여 이미지 전송 용량 절감. Pro 플랜 전환 시 재활성화 검토.

---

### 4. HTTP/3 (QUIC) 임시 비활성화

**변경:** HTTP/3 Off

**이유:** 모바일 크롬과의 네트워크 핸드셰이크 불안정 가능성 배제 목적으로 임시 비활성화. 안정성 확인 후 재활성화 검토 예정.

---

### 5. 캐시 규칙 설정

**변경:** `/images/*` 경로에 캐시 규칙 적용

| 항목 | 설정값 |
|---|---|
| Edge TTL | 1개월 (override_origin) |
| Browser TTL | 1일 (override_origin) |
| Smart Tiered Cache | 활성화 |

**이유:** R2 오리진 부하 감소 및 글로벌 엣지 노드에서의 응답 속도 향상. 이미지는 변경 빈도가 낮아 긴 TTL이 적합함.

캐시 규칙 적용 후 **전체 캐시 퍼지(Purge Everything)** 실행.

---

### 6. CORS 설정 (현재 상태 유지)

R2 버킷 CORS 허용 목록:

| 항목 | 값 |
|---|---|
| AllowedOrigins | `http://localhost:3000`, `https://pick-a-me.me`, `https://www.pick-a-me.me` |
| AllowedMethods | `GET`, `HEAD` |
