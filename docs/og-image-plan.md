# OG 이미지 아키텍처 설계 계획서

> **목표:** 서비스 공유 시 SNS/메신저 링크 미리보기에 의미있는 이미지가 표시되도록 한다.  
> 두 단계로 구분한다: (1) 서비스 전체 정적 OG, (2) 밈별 동적 OG.

---

## 1. 현재 상태

- `layout.tsx`에 `og:image` 메타태그 없음 → 링크 공유 시 미리보기 이미지 없음
- 완성 밈 이미지를 R2에 저장하지 않는 구조 (TASK-260501-01 의도적 제거)
- 밈 상세 페이지(`/my/[memeId]`) 존재하나 동적 메타태그 없음

---

## 2. 목표 아키텍처

### 2-A. 서비스 정적 OG (Phase 1)

홈, 블로그, 로그인 등 서비스 전체에 기본 OG 이미지를 적용한다.

```
pick-a-me.me 진입 or 기본 링크 공유
  → <meta property="og:image" content="https://pick-a-me.me/og-default.png">
  → 카카오/트위터 크롤러가 og-default.png 수집
  → "pick-a-meme 브랜드 이미지" 미리보기 표시
```

**작업 범위:**
- `public/og-default.png` 제작 (1200×630, 브랜드 감성)
- `app/layout.tsx` `metadata.openGraph.images` 추가

**난이도:** 낮음. 이미지 제작 포함 반나절.

---

### 2-B. 밈별 동적 OG (Phase 2)

밈 결과 또는 상세 페이지 링크를 공유할 때, 해당 밈 이미지가 미리보기로 표시된다.

```
사용자가 공유하기 클릭 (ResultScreen 또는 /share/[memeId])
  ① html-to-image로 MemeCanvasCard 캡처 → Blob
  ② POST /api/memes/{memeId}/og-image (인증 필요)
       → R2에 og/{memeId}.png 업로드
       → user_memes.og_image_url 컬럼 저장
  ③ 프론트에 og_image_url 반환

/share/[memeId] 페이지 (Next.js generateMetadata)
  → DB에서 user_memes.og_image_url 조회 (서버사이드, 인증 불필요)
  → og_image_url 있으면: <meta og:image="https://img.pick-a-me.me/og/{memeId}.png">
  → 없으면: og-default.png fallback
```

> **`/share/[memeId]` 를 신규 라우트로 선택한 이유:**  
> 기존 `/my/[memeId]`는 로그인 가드가 걸려 있어 SNS 크롤러(비로그인 봇)가 `generateMetadata`에 도달하지 못한다.  
> `/share/[memeId]`는 공개 라우트로 설계해 크롤러·비로그인 방문자 모두 밈을 볼 수 있고, OG 메타태그도 정상 삽입된다.  
> 로그인 사용자가 `/my/[memeId]`에서 공유하기를 누르면 공유 URL은 `/share/[memeId]`로 생성한다.

---

## 3. 연관 태스크 및 선행 순서

```
[선행 필수]
TASK-260515-01  html2canvas → html-to-image 마이그레이션
  ↓
[Phase 1 — 독립 진행 가능]
TASK-OG-01      og-default.png 제작 + layout.tsx 메타태그 추가

[Phase 2 — TASK-260515-01 완료 후]
TASK-OG-02      DB: user_memes.og_image_url 컬럼 추가 (V18 마이그레이션)
TASK-OG-03      백엔드: POST /api/memes/{memeId}/og-image 엔드포인트
                  (html-to-image Blob → R2 업로드 → og_image_url 저장)
TASK-OG-04      프론트: 공유하기 버튼에 og-image 업로드 + URL 저장 연동
TASK-OG-05      프론트: /share/[memeId] generateMetadata()에서 og_image_url 동적 반영
```

---

## 4. 핵심 설계 결정

### 4-1. Lazy 업로드 전략

매 뽑기마다 R2에 올리지 않는다. **공유하기 클릭 시점에 최초 1회만** 업로드한다.

```
공유하기 클릭
  → og_image_url 있으면 → 바로 공유 URL 복사/전달
  → og_image_url 없으면 → 캡처 → 업로드 → 저장 → 공유
```

이유:
- 저장하지 않고 결과를 버리는 사용자(다수)에게 R2 비용 발생하지 않음
- 공유하려는 사람만 실제 비용 발생 → 비용-가치 비율 최적

### 4-2. og:image는 반드시 SSR로 주입해야 한다

SNS/메신저 크롤러(카카오, 트위터, 슬랙 등)는 JavaScript를 실행하지 않는다.  
`<meta property="og:image">`가 서버사이드 HTML에 있어야만 크롤러가 읽는다.

```typescript
// app/share/[memeId]/page.tsx  ← 공개 라우트 (인증 불필요)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meme = await fetchMemeById(params.memeId); // 서버사이드
  return {
    openGraph: {
      images: [meme?.ogImageUrl ?? '/og-default.png'],
    },
  };
}
```

클라이언트에서 `document.querySelector('meta[property="og:image"]').content = ...` 으로 바꾸는 방식은 **크롤러에게 무의미하다.**

### 4-3. R2 업로드 경로 규칙

```
소스 이미지:  img.pick-a-me.me/meme-images/{filename}   (기존, 불변)
OG 이미지:    img.pick-a-me.me/og/{memeId}.png           (신규)
```

OG 이미지는 덮어쓰기 허용. 한 밈에 대해 og_image_url은 항상 하나.

### 4-4. CORS — 현재 인프라로 해결됨

- `MemeCanvasCard`에 `crossOrigin="anonymous"` 이미 적용 (TASK-260513-03)
- Cloudflare R2가 `Access-Control-Allow-Origin` 헤더 반환
- html-to-image로 교체 후에도 동일하게 작동

---

## 5. 주의사항

### 5-1. 비로그인 사용자

비로그인 사용자의 뽑기 결과는 DB에 저장되지 않으므로 `memeId`가 없다.  
→ 동적 OG 생성 불가. ResultScreen 공유하기는 `navigator.share({ url: window.location.origin })`으로 서비스 기본 URL만 공유한다.  
→ 로그인 유도 토스트와 연계: "로그인하면 밈을 저장하고 링크로 공유할 수 있어요."

#### 5-1-1. 비로그인 결과 → 로그인 후 자동 저장 (TASK-260517-02)

비로그인 결과창에서 로그인 버튼을 누르면, 뽑기 결과를 sessionStorage에 보존한 채 OAuth2 인증으로 이동한다.  
OAuth2 흐름은 카카오/구글 로그인 페이지 진입, 계정 선택, (경우에 따라) 2FA까지 포함되므로 **소요 시간이 불확실하다.**

**TTL 설계 원칙:**
- `sessionStorage`는 탭이 닫히거나 브라우저가 종료되면 자동 소멸한다. 악성 재사용을 막는 세션 격리는 이미 보장됨.
- 명시적 TTL은 "정말 오래된 결과가 의도치 않게 저장되는 상황"을 방지하기 위한 것이다.
- OAuth2 인증 흐름에서 5분은 너무 짧다 (계정 선택 + 2FA + 네트워크 지연 고려).

**결정: TTL 30분 + 의도 플래그 조합**

```ts
// ResultScreen — 로그인 버튼 클릭 시
sessionStorage.setItem('pam_pending_meme', JSON.stringify({
  ...memeResult,
  _savedAt: Date.now(),       // 30분 TTL 체크용
  _fromResult: true,          // 의도적 저장 플래그 (우발적 재저장 방지)
}));
```

```ts
// oauth2/callback/page.tsx
const raw = sessionStorage.getItem('pam_pending_meme');
if (raw) {
  const pending = JSON.parse(raw);
  const elapsed = Date.now() - pending._savedAt;
  if (pending._fromResult && elapsed < 30 * 60 * 1000) {
    // 저장 진행
  }
  sessionStorage.removeItem('pam_pending_meme'); // 성공/실패 무관 항상 제거
}
```

30분을 초과한 경우는 저장하지 않고 조용히 홈으로 이동한다. 사용자 입장에서는 정상 로그인 후 홈 진입과 동일하게 보인다.

### 5-2. OG 이미지 크기 및 포맷

- 권장 사이즈: 1200×630 (SNS 표준)
- MemeCanvasCard는 정사각형(1:1). OG 이미지는 16:9 비율이어야 함.
- 옵션 A: 정사각형 이미지를 16:9 캔버스 중앙에 배치 + 브랜드 여백
- 옵션 B: og:image는 1:1 허용 (카카오/트위터 모두 지원)
- **추천 B**: 구현 단순, 밈 이미지가 잘림 없이 그대로 표시됨

### 5-3. 기존 R2 저장 구조와의 관계

이 계획은 TASK-260501-01(완성 밈 R2 저장 철회)과 충돌하지 않는다.  
**소스 이미지**(동물 사진)는 여전히 R2에 있고 재사용된다.  
**OG 이미지**는 공유 목적으로만 생성되는 별도 산출물이다.  
`user_memes`의 핵심 저장 구조(composition JSONB)는 그대로 유지된다.

### 5-4. 캡처 실패 처리

html-to-image 캡처 실패 또는 R2 업로드 실패 시:
- og_image_url을 저장하지 않고 공유는 계속 진행 (URL 공유 fallback)
- 사용자에게 조용히 fallback, 에러 토스트 없음
- 다음 공유 시 재시도

---

## 6. 구현 체크리스트

### Phase 1 (정적 OG)
- [ ] og-default.png 제작 (브랜드 이미지, 1200×630)
- [ ] `app/layout.tsx` — `metadata.openGraph` 추가
- [ ] `app/layout.tsx` — `metadata.twitter` 추가 (트위터 카드)
- [ ] 카카오 공유 테스트 (카카오 개발자 도구 > 디버거)

### Phase 2 (동적 OG)
- [ ] TASK-260515-01 완료 (html-to-image 마이그레이션)
- [ ] V18 마이그레이션 — `user_memes.og_image_url VARCHAR NULL`
- [ ] `POST /api/memes/{memeId}/og-image` 백엔드 구현
- [ ] R2 업로드 어댑터에 `/og/` 경로 지원 추가
- [ ] ResultScreen 공유하기 — og-image 업로드 → URL 획득 플로우
- [ ] `/my/[memeId]` `generateMetadata()` 동적 og:image 반영
- [ ] 비로그인 공유하기 fallback 처리
- [ ] 카카오/트위터 크롤러 테스트

---

## 7. 미결 사항

| 항목 | 내용 |
|---|---|
| og-default.png 제작 주체 | 디자인 필요. AI 생성 또는 직접 제작 |
| OG 이미지 비율 | 1:1 vs 16:9 최종 결정 필요 |
| 공유 URL 구조 | **결정: `/share/[memeId]` 신규 공개 라우트** (크롤러 접근 보장, `/my/`는 로그인 가드로 크롤러 차단됨) |
| 비로그인 결과 공유 | **결정: TTL 30분 + `_fromResult` 의도 플래그** (TASK-260517-02 설계 확정) |
