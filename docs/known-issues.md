# Known Issues & Bug Log

발견된 버그와 조치 이력을 기록한다.  
상태: `FIXED` / `OPEN` / `WONTFIX`

---

## NOTE-01 · 완성 밈 이미지 저장 구조 및 R2 도입 기준

- **작성**: 260514
- **연관**: TASK-260501-01 (삭제됨), TASK-260429-19

### 현재 구조

밈 뽑기 결과는 **완성 이미지 파일을 어디에도 저장하지 않는다.**  
대신 조합 정보(composition)를 JSONB로 DB에만 기록하고, 이미지는 클라이언트에서 매번 재렌더링한다.

```
[뽑기 저장 시]
  DB user_memes.composition (jsonb) ← { imageUrl, subjectPosition, phraseText }
  R2 업로드 없음

[다운로드 / 공유 시]
  브라우저: MemeCanvasCard (DOM) → html2canvas → Blob → 저장 or navigator.share()
```

- `imageUrl`: meme_images 테이블의 원본 이미지 URL (CDN 직링크, 업로드 없음)
- 완성 이미지(말풍선 합성본)는 클라이언트 메모리에서만 생성되며 어디에도 영구 저장되지 않음

### R2 저장을 도입하지 않는 이유

| 항목 | 내용 |
|---|---|
| 저장 비용 없음 | 완성 이미지를 올리지 않으므로 R2 스토리지 비용 발생 안 함 |
| 구현 단순 | 업로드·고아 파일 정리·실패 보상 트랜잭션 로직이 불필요 |
| 현 트래픽 수준 | 재렌더링 비용(html2canvas 처리 시간)이 UX 문제가 될 수준이 아님 |

### R2 도입을 검토해야 하는 시점

아래 조건 중 하나 이상 해당되면 도입을 재검토한다.

1. **OG 이미지 지원 필요** — 카카오/트위터 링크 미리보기에 밈 이미지가 실제로 노출되어야 할 때.  
   퍼블릭 URL이 있어야 og:image 태그가 작동한다.

2. **html2canvas 품질 한계 도달** — CSS 렌더링 불일치나 특정 기기에서 합성 오류가 반복될 때.  
   서버사이드 렌더링(Puppeteer 등)으로 전환하면 R2 저장이 자연스럽게 필요해진다.

3. **보관함 빠른 로딩 요구** — "내 밈 보관함" 피드에서 매번 재렌더링이 느려 UX 문제가 될 때.

### R2 도입 시 구현 필요 항목

```
1. 프론트: 뽑기 완료 후 html2canvas → Blob 생성 → POST /api/memes/upload (presigned or multipart)
2. 백엔드: R2 업로드 어댑터 (TASK-260429-19에 기반 코드 존재) 활성화
3. 백엔드: DB 저장 실패 시 R2 업로드된 파일 즉시 삭제 (보상 트랜잭션)
4. 백엔드: 주기적 고아 파일 스캔 잡 (R2 키 목록 ↔ DB 비교)
5. DB: user_memes.composition에 rendered_image_url 필드 추가 (또는 별도 컬럼)
```

---

## BUG-01 · 하트 소모가 실제로 차감되지 않음

- **상태**: FIXED (260512)
- **연관 태스크**: TASK-260512-01
- **발견**: 밈 뽑기 후 하트가 줄지 않음. 로그인/비회원 모두 재현.

**원인**  
`MemeComposeService.compose()`에서 `HeartService.consumeHeart()` 호출 자체가 누락되어 있었다.  
API가 성공 응답을 반환해도 하트가 실제로 차감되지 않았다.

**조치**  
- `MemeComposeService`에 `heartService.consumeHeart(userId, heartType)` 호출 추가  
- 비회원: `consumeHeart()`에서 `setCurrentHearts()` 직접 호출 → 즉시 UI 반영  
- `useMemeApi` mock 폴백을 네트워크 오류 한정으로 축소 — `success=false` 응답도 throw 처리  
- HeartDisplay SPINNING 중 `display:none` 유지로 React Query observer 연속성 보장, `refetchQueries`로 즉시 서버값 갱신

---

## BUG-02 · 로그인 직후 하트 수치 깜빡임 (0 → 5 → 실제값)

- **상태**: FIXED (260512)
- **연관 태스크**: TASK-260512-05
- **발견**: 로그인 직후 하트 바에 0이 잠깐 표시된 후 실제 값으로 전환되는 깜빡임 발생.

**원인**  
1. `useHeart` React Query 리페치 중 이전 데이터가 없어 `undefined` → 0으로 렌더링
2. `MemeComposeService`에서 하트 차감 순서가 조합보다 앞에 있어 조합 실패 시에도 차감될 수 있는 구조

**조치**  
- `useHeart`에 `placeholderData: prev` 옵션 추가 → 리페치 중 이전 데이터 유지, 깜빡임 제거  
- `MemeComposeService` 하트 차감 순서를 조합(이미지/문구 선택) 이후로 재정렬  
- `HeartDisplay` 초기 로딩 중(`serverHearts === null`) 숫자 `0` 대신 `—` 표시 (`heartsReady` 플래그 도입)

---

## BUG-03 · 스페셜 하트 로직 4종 버그

- **상태**: FIXED (260513)
- **연관 태스크**: TASK-260513-02
- **발견**: 스페셜 하트 관련 로직 전면 점검 중 복수 이슈 발견.

**원인 및 조치 (4건)**

| # | 발견 | 원인 | 조치 |
|---|---|---|---|
| ① | 비로그인 유저도 SPECIAL 뽑기 API 호출 가능 | `MemeController`에 인증 가드 없음 | `userId == null && heartType == SPECIAL` 시 401 반환 |
| ② | 스페셜 하트 0개여도 뽑기 진입 가능 | `page.tsx`에 잔액 체크 없음 | `executeSpecialDraw` 진입 전 `special.count <= 0` 체크 추가 |
| ③ | 충전 이력(HeartHistory.charge)이 항상 0으로 기록 | `HeartService`에서 `beforeCount`를 `chargeIfNeeded()` 이후에 캡처 → `chargedAmount` 항상 0 | `preChargeCount`로 rename 후 `chargeIfNeeded()` 호출 전에 캡처 |
| ④ | 컴파일 경고 | `charged` 변수 미사용 | 변수 제거 |

---

## BUG-04 · favicon.ico 요청이 ERROR 로그로 기록됨

- **상태**: FIXED (260513)
- **연관 태스크**: fix/no-resource-exception-logging
- **발견**: 서버 로그에 `NoResourceFoundException: No static resource favicon.ico` 가 ERROR 레벨 + 풀 스택 트레이스로 반복 출력.

**원인**  
브라우저가 백엔드 도메인(`api.pick-a-me.me`)에 자동으로 `GET /favicon.ico`를 요청하는데,  
Spring Boot에 정적 리소스가 없어 `NoResourceFoundException`이 발생한다.  
이 예외를 처리하는 핸들러가 없어 `GlobalExceptionHandler.handleUnexpected(Exception)`으로 떨어져 `log.error()`가 호출되었다.

**조치**  
`GlobalExceptionHandler`에 `NoResourceFoundException` 전용 핸들러 추가 → 로그 없이 404 반환.

---

## BUG-05 · OAuth2 로그인 시 `[authorization_request_not_found]` 에러

- **상태**: FIXED (260513)
- **연관 태스크**: fix/no-resource-exception-logging
- **발견**: 카카오/구글 로그인 시 `api.pick-a-me.me/login?error` 로 리다이렉트되며 `[authorization_request_not_found]` 표시. 서버 재시작 직후 특히 빈번하게 발생.

**원인**  
`SecurityConfig`에 `SessionCreationPolicy.STATELESS`가 설정되어 HTTP 세션이 전혀 생성되지 않았다.  
Spring Security OAuth2는 로그인 요청 시 `state` 파라미터(CSRF 방지용)를 세션에 저장하고,  
OAuth 제공자 콜백에서 이를 꺼내 검증한다.  
세션이 없으니 콜백 시 저장된 state를 찾지 못해 인증 흐름이 중단된다.

```
1. 유저 → "카카오 로그인" 클릭
2. Spring Security → state를 세션에 저장 후 카카오로 리다이렉트  ← 세션 없음
3. 카카오 → 콜백 URL로 리다이렉트
4. Spring Security → 세션에서 state 조회 실패 → authorization_request_not_found
```

**조치**  
`SessionCreationPolicy.STATELESS` → `IF_REQUIRED` 변경.  
OAuth2 핸드셰이크 동안에만 임시 세션이 생성되며, JWT 발급 후 API 호출은 세션 없이 JWT 필터로 처리되므로 API 무상태성은 유지된다.

---

## BUG-07 · 로그아웃 후 새로고침 시 로그인 상태 복원

- **상태**: FIXED (260514) — 2차 수정
- **연관 태스크**: TASK-260513-05

**증상**  
로그아웃 버튼을 눌러도 브라우저를 새로고침하면 로그인 상태로 돌아왔다.

---

### 1차 수정 (260514) — 미완

**원인으로 오해한 것**  
로그아웃 후 React Query의 인메모리 캐시(`queryClient`)에 이전 로그인 정보가 남아 있어서  
새로고침 없이 화면만 전환할 때 데이터가 유지된다고 판단.

**조치**  
`LoginSlideMenu`의 로그아웃 핸들러에 `queryClient.clear()`를 추가.

**결과: 불완전**  
React Query 캐시는 인메모리이므로 새로고침 시 자동으로 비워진다.  
`queryClient.clear()`는 "새로고침 없이 화면 전환" 시나리오에서만 유효하며,  
**새로고침 후 재진입 시 쿠키가 살아있으면 `/api/auth/me`가 인증을 그대로 통과**한다.  
즉, 쿠키 자체가 삭제되지 않은 것이 진짜 원인이었다.

---

### 2차 수정 (260514) — 근본 해결

**실제 원인**  
로그인은 **OAuth2 302 리다이렉트**(네비게이션 컨텍스트)로 쿠키를 발급한다.  
브라우저는 서버 리다이렉트 응답의 `Set-Cookie`를 항상 신뢰하고 저장한다.

반면 로그아웃은 **JavaScript `fetch`**(XHR/크로스 오리진 컨텍스트)로  
`Set-Cookie: pam_token=; Max-Age=0`을 응답받는 방식이었다.  
브라우저는 크로스 오리진 fetch 응답의 `Set-Cookie`를 신뢰하지 않거나 무시할 수 있다.  
결과적으로 쿠키가 실제로 삭제되지 않고, 새로고침 후 `/api/auth/me` 요청에 그대로 포함되었다.

```
[기존 흐름 — 쿠키 삭제 실패]
프론트 → fetch POST /api/auth/logout
서버 → 응답 헤더: Set-Cookie: pam_token=; Max-Age=0
브라우저 → 크로스 오리진 fetch Set-Cookie 무시 → 쿠키 남음
새로고침 → /api/auth/me 요청에 쿠키 포함 → 로그인 복원

[수정 후 흐름 — 쿠키 삭제 성공]
프론트 → window.location.href = API_BASE + /api/auth/logout  (네비게이션)
브라우저 → 네비게이션 컨텍스트로 GET /api/auth/logout 요청
서버 → Set-Cookie: pam_token=; Max-Age=0 + 302 → 프론트엔드로 리다이렉트
브라우저 → 네비게이션 컨텍스트이므로 Set-Cookie 신뢰 → 쿠키 삭제
새로고침 → /api/auth/me 요청에 쿠키 없음 → 비로그인 상태 정상
```

**조치**

| 파일 | 변경 내용 |
|---|---|
| `useAuth.ts` | `logout`을 `fetch()` 호출 → `window.location.href = apiBase + /api/auth/logout` 으로 교체. fetch가 아닌 네비게이션으로 요청해야 Set-Cookie가 적용됨 |
| `AuthController.kt` | `window.location.href`는 GET 요청만 가능하므로 엔드포인트를 GET으로 변경. 쿠키 만료 후 `response.sendRedirect(frontendBase)` |
| `LoginSlideMenu.tsx` | 로그아웃 핸들러에서 `async/await`, `queryClient.clear()`, `router.replace()` 제거. 페이지 전체 리로드로 상태 자동 초기화 |

---

## BUG-06 · 미션 트리거 시 500 에러 (mission_completions.metadata jsonb 타입 불일치)

- **상태**: FIXED (260514)
- **연관 태스크**: TASK-260514-01
- **발견**: 뽑기 직후 미션 트리거(`MissionService.trigger()`) 호출 시 500 에러. 사용자에게 "서버 오류가 발생했습니다." 알럿 노출.

**원인**  
`MissionCompletionJpaEntity`의 `metadata` 컬럼이 DB에서 `jsonb` 타입이지만,  
`@Convert(converter = StringMapConverter::class)`가 `Map<String, String>` → `String(varchar)`로 직렬화했다.  
PostgreSQL은 `character varying`을 `jsonb` 컬럼에 암묵적 캐스팅 없이 거부한다.

```
ERROR: column "metadata" is of type jsonb but expression is of type character varying
Hint: You will need to rewrite or cast the expression.
```

**조치**  
`@Convert(converter = StringMapConverter::class)` → `@JdbcTypeCode(SqlTypes.JSON)` 교체.  
Hibernate가 직접 JDBC JSON 타입으로 바인딩하여 PostgreSQL jsonb 컬럼에 정상 삽입.  
미사용 `StringMapConverter` 클래스 삭제.
