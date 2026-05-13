# Cloudflare 운영 설정 기록

인프라 변경 이력과 그 이유를 기록합니다.

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

### 3. Polish (Lossy) 활성화

**변경:** Cloudflare Polish — Lossy 모드 활성화

**이유:** 원본 PNG/JPEG를 클라이언트 지원에 따라 WebP/AVIF로 자동 변환·압축. 이미지 전송 용량 감소 및 모바일 로딩 속도 개선.

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

캐시 규칙 적용 후 Polish 설정이 즉시 반영되도록 **전체 캐시 퍼지(Purge Everything)** 실행.

---

### 6. CORS 설정 (현재 상태 유지)

R2 버킷 CORS 허용 목록:

| 항목 | 값 |
|---|---|
| AllowedOrigins | `http://localhost:3000`, `https://pick-a-me.me`, `https://www.pick-a-me.me` |
| AllowedMethods | `GET`, `HEAD` |
