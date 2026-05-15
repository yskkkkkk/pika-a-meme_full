# 풀스택 i18n 도입 계획서

> **작성일:** 2026-05-15
> **연관 태스크:** TASK-260512-07 (프론트 i18n 인프라 — 완료), TASK-260516-01 ~ TASK-260516-06 (본 계획서)
> **목적:** 현재 프론트엔드에만 적용된 한/영 토글을 백엔드 응답(에러/토스트 메시지) + 밈 문구 데이터까지 확장.

---

## 1. 현황 진단

### 1.1 프론트엔드 (완료 영역)
| 항목 | 상태 | 위치 |
|---|---|---|
| Locale Context | ✅ | `pam-frontend/components/LanguageProvider.tsx` (localStorage `pam_lang`, `navigator.language` fallback) |
| 사전 파일 | ✅ | `public/locales/{ko,en}.json` (150+ 키) |
| Translator | ✅ | `lib/i18n.ts` (`createTranslator(lang)` + 한국어 조사 처리) |
| 토스트 메시지 | ✅ | `t.toast.*`, `t.errors.*` |
| 에러 분류 | ⚠️ | `app/page.tsx`의 `classifyDrawError()`가 백엔드 한글 메시지("하트가 부족")로 분기 — **백엔드 메시지에 의존하는 안티패턴** |
| 하드코딩 잔재 | ⚠️ | `components/auth/LoginButton.tsx` 4곳 |

### 1.2 백엔드 (미적용)
| 항목 | 상태 | 위치 |
|---|---|---|
| MessageSource / ResourceBundle | ❌ 없음 | — |
| 에러 메시지 | ❌ 한글 하드코딩 | `pam-api/.../common/ErrorCode.kt` (enum 상수) |
| 예외 메시지 | ❌ 한글 하드코딩 | `pam-domain/.../exception/*.kt` |
| Accept-Language 처리 | ❌ 없음 | — |
| 로케일 파라미터 | ❌ 없음 | 모든 API |

### 1.3 데이터 레이어 (미적용)
| 항목 | 상태 | 비고 |
|---|---|---|
| `meme_phrases.text` | ❌ 한국어 단일 컬럼 | V8 마이그레이션에 50건 한글 문구 시드 |
| 언어 컬럼 | ❌ 없음 | 스키마 변경 필요 |
| 태그 | ⚠️ 한글 값 | `meme_phrases.tags` JSONB에 "피곤", "직장인" 등 한글 저장. 프론트 `tags.*` 사전과 매핑은 되어 있으나 DB 검색 시 한글 키로 조회 |

---

## 2. 핵심 설계 결정 (Decisions)

### Decision 1 — 백엔드 에러 메시지: **클라이언트 번역 방식 (error code 중심)**
**선택안:** 백엔드는 안정적인 `error.code`(예: `INSUFFICIENT_HEART`)만 보내고, 메시지 번역은 프론트의 `t.errors.*` 사전이 담당.

**대안 (탈락):**
- Spring `MessageSource` + `Accept-Language` 헤더로 백엔드가 직접 번역해서 메시지 전송 → **이중 사전 관리 부담**, 새 언어 추가 시 양쪽 수정 필요.

**근거:**
- 프론트는 이미 `t.errors.*` 사전을 가지고 있다.
- 백엔드 메시지는 디버그/로깅용으로만 유지하면 충분.
- `apiFetch` 에러 처리에서 `error.code` 기반 분기가 가능하면 `classifyDrawError()`의 한글 문자열 매칭도 제거 가능.

**계약 (불변):**
```json
{ "success": false, "error": { "code": "INSUFFICIENT_HEART", "message": "Insufficient heart (debug)" } }
```
프론트는 `error.code`만 본다. `error.message`는 운영 로그/디버그 용도.

---

### Decision 2 — 밈 문구 다국어: **별도 행 + language 컬럼**
**선택안:** `meme_phrases` 테이블에 `language` 컬럼 추가, 같은 의미의 문구를 ko/en 두 행으로 저장.

**대안 비교:**

| 방식 | 장점 | 단점 |
|---|---|---|
| **A. language 컬럼 + 행 분리** (선택) | 단순 스키마, 인덱스 효율, 언어별 문구 수 비대칭 허용(영어는 50개만 있어도 OK) | 같은 "원본 문구"를 묶고 싶을 때 별도 그룹핑 필요 (현재 요구사항 없음) |
| B. JSONB `text_i18n: {ko, en}` 단일 행 | 한 문구의 ko/en 쌍 관리 용이 | 부분 인덱스 불가, NULL 처리 복잡, 언어별 가중치 조정 어려움 |
| C. `meme_phrase_translations` 별도 테이블 (정규화) | 정규화 깔끔 | 매번 JOIN, 조회 쿼리 복잡화, 현재 규모(50건)에 과설계 |

**근거:**
- 현재 정책상 한 문구의 ko/en 1:1 페어가 필수가 아니다 (영어 문구는 영어권 사용자에게 자연스러운 것을 별도 큐레이션).
- 인덱스/캐시(`recent-matched-memes`)와 호환 좋음.
- 향후 일본어/중국어 추가 시 행만 추가하면 됨.

**스키마:**
```sql
ALTER TABLE meme_phrases
  ADD COLUMN language VARCHAR(8) NOT NULL DEFAULT 'ko';

CREATE INDEX idx_meme_phrases_language ON meme_phrases(language);
CREATE INDEX idx_meme_phrases_lang_tags ON meme_phrases(language) WHERE language IS NOT NULL;
```

---

### Decision 3 — 언어 전달 방식: **쿼리 파라미터 `lang` (밈 조합 API에 한정)**
**선택안:** `GET /api/memes/compose?heartType=BASIC&lang=en` 형태로 명시적 전달.

**대안 (탈락):**
- `Accept-Language` 헤더 자동 처리 → 캐시 키 분리/디버깅 불편, 프론트에서 명시적 전달이 더 추적 가능.
- 쿠키(`pam_lang`)로 전달 → SSR/캐시 키 관리 복잡.

**적용 범위:**
- `GET /api/memes/compose` — 필수 (밈 문구 언어 결정)
- 다른 API — 적용 안 함 (에러 코드 방식이라 불필요)

**Fallback 정책:** 요청 언어 문구가 없으면 → `ko` 문구로 fallback (서비스 중단 방지). 응답 본문에 `phraseLanguage` 필드로 실제 어떤 언어가 반환됐는지 알림 (선택).

---

### Decision 4 — 태그 식별자: **현행 유지(한글 키)**
**선택안:** `meme_phrases.tags`는 현재처럼 한글 값(`["피곤", "직장인"]`) 유지. 프론트에서 표시할 때만 `t.tags.피곤 → "Tired"` 매핑.

**근거:**
- 태그는 식별자(ID 역할)로만 쓰이고 사용자에게 그대로 노출되지 않는다 (프론트가 번역 후 노출).
- DB 변경 비용 최소화.
- 단, 향후 영어 문구 시드 시 `tags`는 **한글 값 그대로** 유지해야 BASIC/SPECIAL 매칭 쿼리가 동작.

**예외:** 만약 영어 문구를 영어 태그로 큐레이션하고 싶다면 별도 결정 필요 (현 계획서 범위 외).

---

## 3. 작업 항목 (Tickets)

### TASK-260516-01 — [백엔드] 에러 응답 `code` 표준화 및 영문 디버그 메시지화
**범위:**
- `ErrorCode.kt`의 메시지를 한글 → 영문 디버그 텍스트로 교체 (예: `"하트가 부족합니다."` → `"Insufficient heart balance."`).
  - 메시지는 로그/디버그 전용이므로 영문이 운영 표준에 부합.
- 프론트 노출용 텍스트는 모두 프론트 `t.errors.*`가 담당.
- `error.code`는 절대 변경 금지 (프론트 분기 키).

**파일:**
- `pam-api/.../common/ErrorCode.kt`
- `pam-domain/.../exception/*.kt` (메시지 영문화)
- `pam-api/.../common/GlobalExceptionHandler.kt` (변경 없음 — code 매핑 그대로)

**검증:**
- `MemeControllerTest`, `HeartServiceTest` 등 기존 테스트에서 message 문자열 검증 부분 영문으로 갱신
- 응답 구조(`{success, data, error:{code,message}}`) 불변 — 프론트 영향 없음

**연관:** TASK-260516-02 (프론트가 code 기반 분기로 전환)

---

### TASK-260516-02 — [프론트] 에러 분류를 `error.code` 기반으로 전환
**범위:**
- `app/page.tsx`의 `classifyDrawError()`에서 한글 문자열 매칭 제거.
- `apiFetch` throw 시 `error.code`를 보존하는 커스텀 에러 클래스 도입:
  ```typescript
  // lib/api.ts
  export class ApiError extends Error {
    constructor(public code: string, public httpStatus: number, message?: string) {
      super(message ?? code);
      this.name = "ApiError";
    }
  }
  ```
- `classifyDrawError()` → `error instanceof ApiError && error.code === "INSUFFICIENT_HEART"` 분기.
- `t.errors` 사전에 누락된 에러 코드 추가 (현재 누락: `MEME_SOURCE_NOT_FOUND`, `RATE_LIMIT_EXCEEDED`, `INVALID_REQUEST` 등).

**파일:**
- `pam-frontend/lib/api.ts`
- `pam-frontend/app/page.tsx`
- `pam-frontend/public/locales/ko.json`, `en.json` (errors 키 보강)
- 기타 `apiFetch` 호출부에서 `e.message` 문자열 비교하던 모든 곳

**검증:**
- 백엔드 에러 메시지가 영문이어도 사용자가 보는 토스트는 현재 언어로 정상 표시되는지 수동 테스트
- `classifyDrawError()` 단위 테스트 추가

**연관:** TASK-260516-01 (선행)

---

### TASK-260516-03 — [DB/스키마] `meme_phrases.language` 컬럼 추가 (Flyway V16)
**범위:**
- 마이그레이션 파일 `V16__add_language_to_meme_phrases.sql` 신규 작성:
  ```sql
  ALTER TABLE meme_phrases
    ADD COLUMN language VARCHAR(8) NOT NULL DEFAULT 'ko';

  CREATE INDEX idx_meme_phrases_language ON meme_phrases(language);

  -- 기존 50건은 모두 'ko'로 백필 (DEFAULT로 자동 처리됨)
  ```
- Domain entity `MemePhrase.kt`에 `language: String` 추가.
- JPA 어댑터 (`JpaMemePhraseAdapter`, entity class) 컬럼 매핑 추가.
- `MemePhraseRepository`에 언어별 조회 메서드 추가:
  ```kotlin
  fun findRandomByLanguage(language: String): MemePhrase
  fun findRandomByLanguageAndTags(language: String, tags: List<String>): MemePhrase
  ```
- 기존 `findRandom()`, `findRandomByTags()`는 deprecated 표시 후 `language = "ko"` fallback 호출하도록 (점진적 마이그레이션).

**파일:**
- `pam-api/.../resources/db/migration/V16__add_language_to_meme_phrases.sql` (신규)
- `pam-domain/.../meme/MemePhrase.kt`
- `pam-domain/.../meme/MemePhraseRepository.kt`
- `pam-infrastructure/.../meme/JpaMemePhraseAdapter.kt`
- `pam-infrastructure/.../meme/MemePhraseEntity.kt` (또는 동등 클래스)

**검증:**
- 로컬 Flyway 실행 후 컬럼 존재 확인
- 기존 한국어 사용 시나리오 동작 무결 (regression)
- Repository 테스트 추가 (`findRandomByLanguage("ko")` 50건 중 1건 반환)

**연관:** TASK-260516-04 (영문 시드), TASK-260516-05 (Compose API)

---

### TASK-260516-04 — [DB/시드] 영문 밈 문구 50건 시드 (Flyway V17)
**범위:**
- `V17__seed_meme_phrases_en.sql` 작성. V8 한글 문구와 1:1 대응 또는 영어권에서 자연스러운 별도 큐레이션.
- 태그는 V8과 동일한 한글 값 유지 (Decision 4).
  ```sql
  INSERT INTO meme_phrases (id, text, tags, language, created_at) VALUES
    (gen_random_uuid(), 'Staring at a distant wall...', '["피곤","무기력"]'::jsonb, 'en', NOW()),
    (gen_random_uuid(), 'They call this a "capitalist smile".', '["직장인","아이러니"]'::jsonb, 'en', NOW()),
    ...
  ```

**큐레이션 가이드:**
- 직역보다 영어권 밈 문화에 맞는 의역 우선.
- 길이: 한국어 대비 ±50% 이내 (말풍선 폰트 크기 호환).
- 욕설/은어 수위: 한국어 시드와 동일 수준.

**파일:**
- `pam-api/.../resources/db/migration/V17__seed_meme_phrases_en.sql` (신규)
- (선택) 큐레이션 참조용 `docs/meme-phrases-en.md` — 한/영 매핑 표

**검증:**
- 마이그레이션 후 `SELECT COUNT(*) FROM meme_phrases WHERE language='en'` = 50
- 각 태그별 영문 문구가 최소 1건 이상 존재 (SPECIAL 뽑기 fallback 없는지)

**연관:** TASK-260516-03 (선행), TASK-260516-05

---

### TASK-260516-05 — [백엔드 API] `/api/memes/compose`에 `lang` 파라미터 추가
**범위:**
- 컨트롤러 시그니처:
  ```kotlin
  @GetMapping("/compose")
  fun compose(
    @AuthenticationPrincipal userId: UUID?,
    @RequestParam heartType: HeartType,
    @RequestParam(required = false) tags: List<String>?,
    @RequestParam(required = false, defaultValue = "ko") lang: String,
  ): ApiResponse<MemeComposeResult>
  ```
- `MemeComposeService.compose(...)` 시그니처에 `language` 추가, 내부에서 `memePhraseRepository.findRandomByLanguage(language)` 호출.
- **Fallback:** 요청 언어에 매칭 문구가 0건이면 자동으로 `"ko"`로 재조회 (`MEME_SOURCE_NOT_FOUND` 방지).
- `MemeComposeResult`에 `phraseLanguage: String` 필드 추가 (실제 반환된 언어 표시 — 디버그/관찰성).
- **캐시 키 영향:** `@Cacheable("recent-matched-memes")` 키에 `language` 포함 (없으면 ko/en 결과 섞임).

**파일:**
- `pam-api/.../meme/MemeController.kt`
- `pam-application/.../meme/MemeComposeService.kt`
- `pam-application/.../meme/MemeComposeResult.kt`
- `pam-infrastructure/.../meme/JpaUserMemeRepositoryAdapter.kt` (캐시 키 갱신)

**검증:**
- `MemeControllerTest`에 `?lang=en` 케이스 추가
- 잘못된 lang (`lang=fr`) → fallback to `ko` 동작 확인
- 영문 컨텐츠 부족 시 fallback 동작 (예: 특정 태그에 영문 0건)
- 캐시 키 분리 확인 (ko/en 결과가 서로 캐시 오염 안 됨)

**연관:** TASK-260516-03/04 (선행), TASK-260516-06

---

### TASK-260516-06 — [프론트] Compose 호출에 현재 언어 전달
**범위:**
- `hooks/useMemeApi.ts`(또는 동등 위치)에서 `useLanguage().language` 읽어 쿼리에 추가:
  ```typescript
  const url = `/api/memes/compose?heartType=${heartType}&lang=${language}${tags ? `&tags=${tags.join(",")}` : ""}`;
  ```
- 언어 변경 시 진행 중인 가챠 결과는 그대로 두고, 다음 뽑기부터 새 언어 적용.
- `my/[memeId]` 상세 페이지: 저장된 밈은 생성 당시 언어로 표시 (DB에 저장된 `phrase_text` 그대로 사용 — 추가 작업 불요).

**파일:**
- `pam-frontend/hooks/useMemeApi.ts`
- 기타 compose API 호출부

**검증:**
- 영어 모드에서 뽑기 → 영문 문구 표시
- 한국어 모드에서 뽑기 → 한글 문구 표시
- 언어 토글 후 다음 뽑기에만 적용되는지 확인

**연관:** TASK-260516-05 (선행)

---

### TASK-260516-07 — [프론트] 잔여 하드코딩 한글 제거 (LoginButton 등)
**범위:**
- `components/auth/LoginButton.tsx`의 4개 하드코딩 문자열 → `t.auth.*` 키로 교체
- 누락 키가 있으면 `ko.json`, `en.json`에 추가

**파일:**
- `pam-frontend/components/auth/LoginButton.tsx`
- `public/locales/{ko,en}.json`

**연관:** 독립 — 어디든 끼워넣기 가능

---

## 4. 적용 순서 (의존성 그래프)

```
TASK-260516-01 (백엔드 에러 영문화)
    └─→ TASK-260516-02 (프론트 code 기반 분기) ─┐
                                                  │
TASK-260516-03 (DB language 컬럼)                │
    ├─→ TASK-260516-04 (영문 시드)                │
    └─→ TASK-260516-05 (compose lang 파라미터) ──┤
                            └─→ TASK-260516-06 (프론트 lang 전달) ┘
                                                                  │
TASK-260516-07 (LoginButton 잔재) ────────────────────────────────┘
                                                                  │
                                                          [통합 QA & 머지]
```

**권장 PR 분할:**
- **PR-A:** TASK-260516-01 + 02 (백엔드 에러 → 프론트 code 분기) — 독립 검증 가능
- **PR-B:** TASK-260516-03 + 04 (DB 스키마 + 시드) — 마이그레이션만, 기능 변화 없음
- **PR-C:** TASK-260516-05 + 06 (Compose lang 파라미터 + 프론트 호출) — PR-B 머지 후
- **PR-D:** TASK-260516-07 (LoginButton) — 언제든

---

## 5. 영향도 분석 & 리스크

### 5.1 호환성
- **앱 캐시:** 프론트가 새 `error.code` 분기를 모르고 구버전이면 → 기존 `t.errors.drawFailed`(일반 에러)로 fallback. **무중단 배포 가능.**
- **모바일 PWA:** localStorage `pam_lang` 그대로 유지. 사용자 영향 없음.

### 5.2 성능
- `@Cacheable("recent-matched-memes")` 키에 `language` 추가 → 캐시 슬롯 2배(ko/en). Upstash 메모리 사용량 미미 (현재 50건 × 2 = 100건 수준).
- DB 인덱스 추가 → 쓰기 비용 무시 가능 (`meme_phrases` 쓰기 빈도 0).

### 5.3 운영
- **시드 데이터 관리:** 영문 시드를 Flyway에 두는 것의 trade-off — 향후 문구 수정 시 새 마이그레이션 필요. 다만 현재 운영 규모(50건)에서는 충분.
- **A/B 테스트:** 영문 시드의 영어권 사용자 반응을 측정하려면 별도 분석 도구 필요 (TASK-260502-05와 묶어 진행).

### 5.4 보안
- `lang` 파라미터는 화이트리스트 검증 필요 (`["ko", "en"]`만 허용, 그 외는 `ko` fallback). SQL 인젝션 방어 — `findRandomByLanguage`는 파라미터 바인딩 사용.
- 에러 메시지 영문화로 인한 정보 노출 위험 없음 (디버그 메시지는 로그 전용).

---

## 6. 측정 지표 (Success Criteria)

작업 완료 판단 기준:
- [ ] 영어 모드에서 뽑기 → 영문 문구 표시 (E2E 수동 테스트)
- [ ] 한국어 모드에서 뽑기 → 한글 문구 표시 (regression)
- [ ] 영어 모드에서 하트 부족 → 영문 토스트 "Not enough hearts" 표시
- [ ] 영어 모드에서 네트워크 타임아웃 → 영문 토스트 표시
- [ ] 백엔드 로그에 영문 에러 메시지 출력 (운영 가독성)
- [ ] `meme_phrases` 테이블 ko/en 각 50건+
- [ ] 캐시 키에 언어 분리 확인 (Redis 키 prefix 검사)
- [ ] 모든 기존 테스트 통과 + 신규 테스트 6개+ 추가

---

## 7. 작업 외 (Out of Scope)

다음 항목은 본 계획서 범위 밖이며 별도 태스크로 처리:
- **태그 영문화** — `meme_phrases.tags` JSONB의 한글 값을 영문 ID로 변환. 별도 마이그레이션 필요.
- **사용자 닉네임 다국어** — 현재 닉네임은 OAuth provider에서 그대로 받음. 별도 정책 필요.
- **이메일/푸시 알림 다국어** — 발송 기능 자체가 없음. 도입 시 별도.
- **3개 이상 언어 (일본어/중국어)** — 본 계획은 ko/en 2언어 한정. 확장은 가능한 구조이나 시드 작업 별도.
- **DB 문구 어드민 도구** — 현재 시드/마이그레이션 기반. 어드민 CRUD 필요 시 별도.

---

## 8. 결정 보류 (Open Questions)

PR 작업 전 사용자 확정 필요:
1. **영문 시드 큐레이션 주체** — 영문 50건을 누가 작성하는가? (직접 작성 / AI 생성 후 검수 / 외부 큐레이터)
2. **언어 결정 정책 충돌** — 비로그인 사용자가 영어 모드에서 BASIC을 뽑을 때 서버는 그 사실을 모름 (헤더/쿠키 없으면). → `lang` 쿼리 파라미터 필수로 강제할지, 헤더 fallback도 둘지?
3. **phraseLanguage 응답 필드** — `MemeComposeResult.phraseLanguage`를 프론트가 활용할 일이 있는가? (예: 영문 요청했는데 ko fallback이면 토스트로 알림) — 안 쓸 거면 응답 단순화 가능.
