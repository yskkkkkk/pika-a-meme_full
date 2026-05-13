# 영어 도입 및 i18n 운영 가이드

`pick-a-meme` 프론트엔드에 한국어/영어를 안정적으로 운영하기 위한 방식과 기술 기준을 정리한 문서입니다. 현재 구현은 **Next.js App Router + TypeScript + JSON locale resource + React Context** 조합을 기준으로 합니다.

---

## 1. 목표

- 한국어 UI를 기본값으로 유지하면서 영어 UI를 함께 제공한다.
- 화면 문구를 컴포넌트에서 분리해 번역 리소스만 수정해도 문구를 관리할 수 있게 한다.
- `t.gallery.*`, `t.gacha.*`처럼 도메인별 계층형 키를 사용해 번역 키 탐색과 유지보수를 쉽게 한다.
- 보간 문구, 한국어 조사, 캔버스 렌더링 텍스트처럼 단순 문자열만으로 처리하기 어려운 케이스를 공통 유틸리티로 관리한다.

---

## 2. 현재 i18n 구조

```txt
pam-frontend/
  lib/i18n.ts                 # locale import, 타입, formatter, 조사 처리
  hooks/useLanguage.ts        # LanguageContext 타입 + useLanguage 훅
  components/LanguageProvider.tsx
                               # 언어 선택/저장/document.lang 반영
  public/locales/
    ko.json                   # 한국어 번역 리소스
    en.json                   # 영어 번역 리소스
```

### 핵심 원칙

1. **모든 UI 문구는 JSON locale 파일에 둔다.**
   - 예외: 브랜드 고정 표기(`PICK-A-MEME`), 데이터 자체 값, 아이콘/이모지, CSS 클래스명.
2. **컴포넌트는 `useLanguage()`로 `t`를 받아 사용한다.**
3. **새 키는 `ko.json`과 `en.json`에 동시에 추가한다.**
4. **동적 문구는 JSON에 `{name}`, `{count}` 같은 placeholder를 두고 `lib/i18n.ts` formatter에서 처리한다.**
5. **한국어 조사처럼 언어별 문법 차이가 있는 표현은 문자열 조합을 컴포넌트에 흩뿌리지 않고 helper로 처리한다.**

---

## 3. 언어 선택 흐름

`LanguageProvider`는 다음 순서로 언어를 결정합니다.

1. `localStorage.getItem("pam_lang")`에 저장된 값이 `ko` 또는 `en`이면 해당 값을 사용한다.
2. 저장값이 없고 브라우저 기본 언어가 영어(`navigator.language.split("-")[0] === "en"`)이면 영어를 사용한다.
3. 그 외에는 기본값인 한국어(`ko`)를 사용한다.
4. 언어 변경 시 `localStorage`와 `document.documentElement.lang`을 함께 갱신한다.

이 구조 덕분에 사용자가 한 번 선택한 언어는 다음 방문에도 유지되고, 브라우저/스크린리더에는 현재 언어가 `html lang`으로 전달됩니다.

---

## 4. 번역 리소스 설계

Locale JSON은 화면/도메인 기준으로 계층화합니다.

```json
{
  "brand": {
    "homeTitle": "PICK-A-MEME",
    "meme": "Meme"
  },
  "gallery": {
    "myGallery": "My Gallery",
    "totalCount": "{count} Items"
  },
  "gacha": {
    "drawWithTag": "Draw with #{tag}!"
  }
}
```

### 추천 네임스페이스

| Namespace | 용도 |
|---|---|
| `brand` | 서비스명, 밈 카드 이름, 브랜드성 텍스트 |
| `common` | 뒤로, 확인, 로딩, 모드명처럼 범용 문구 |
| `actions` | 저장, 공유, 다시 뽑기, 더 보기 등 동작 버튼 |
| `home` | 홈 화면 문구 |
| `auth` | 로그인/로그아웃/OAuth 관련 문구 |
| `benefits` | 로그인 메뉴 내 혜택 설명 |
| `gallery` | 갤러리 목록/필터/빈 상태/숨김 상태 |
| `detail` | 내 밈 상세 화면 |
| `gacha` | 가챠/태그 선택/뽑기 관련 문구 |
| `result` | 결과 화면 문구 |
| `errors` | 알럿, API fallback, 실패 메시지 |
| `toast` | 토스트 메시지 |
| `heart` | 하트 표시/미션 슬라이드업 |
| `missions` | 미션명/미션 설명 |
| `loading` | 가챠 로딩 단계 문구 |
| `canvas` | 이미지 캡처/캔버스에 포함되는 문구 |
| `tags` | 서버에서 내려오는 한국어 태그의 표시명 매핑 |

---

## 5. TypeScript 타입 전략

`lib/i18n.ts`에서 한국어 JSON을 기준 타입으로 사용합니다.

```ts
import ko from "@/public/locales/ko.json";
import en from "@/public/locales/en.json";

export type Language = "ko" | "en";
export type TranslationMessages = typeof ko;

export const translations: Record<Language, TranslationMessages> = {
  ko,
  en,
};
```

이 방식의 장점은 다음과 같습니다.

- `en.json`이 `ko.json`과 다른 구조를 가지면 TypeScript가 감지한다.
- 컴포넌트에서 `t.gallery.myGallery`처럼 자동완성 가능한 nested key를 사용할 수 있다.
- 잘못된 키 접근은 `npm run build` 또는 `npx tsc --noEmit`에서 드러난다.

> 주의: JSON 구조 자체는 타입 검사를 받지만, 번역 문구 의미가 누락되었는지는 사람이 리뷰해야 합니다.

---

## 6. 동적 문구 처리

JSON 파일에는 함수를 넣을 수 없기 때문에 동적 문구는 placeholder 문자열로 관리합니다.

```json
{
  "home": {
    "subtitleUser": "Pick {name}'s meme of the day"
  },
  "gallery": {
    "totalCount": "{count} Items"
  }
}
```

`lib/i18n.ts`의 `createTranslator()`가 formatter를 제공합니다.

```ts
const t = createTranslator("en");

t.format.homeSubtitleUser("Pika");
t.format.totalCount(3);
t.format.drawWithTag("Tired");
```

### 새 동적 문구 추가 절차

1. `ko.json`, `en.json`에 같은 위치/같은 placeholder 이름으로 문구를 추가한다.
2. `lib/i18n.ts`의 `format` 객체에 formatter 함수를 추가한다.
3. 컴포넌트에서는 원문 문자열 조합 대신 `t.format.*()`을 사용한다.

---

## 7. 한국어 조사 처리

한국어는 받침 유무에 따라 `을/를`, `이/가`, `은/는`이 달라집니다. 영어에서는 해당 조사가 필요 없거나 완전히 다른 표현이 필요합니다.

현재는 `lib/i18n.ts`의 `memeWithParticle()` helper가 담당합니다.

```ts
// ko: "미미카드를"
// en: "a Meme"
t.memeWithParticle("을");
```

### 운영 기준

- `"미미카드" + "를"`처럼 컴포넌트에서 직접 조합하지 않는다.
- 조사 처리가 필요한 브랜드/도메인 명사는 helper를 추가해 처리한다.
- 영어 문장은 한국어 어순을 억지로 맞추지 말고 자연스러운 완성 문장으로 제공한다.

---

## 8. 컴포넌트 사용 방식

```tsx
"use client";

import { useLanguage } from "@/hooks/useLanguage";

export function Example() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <button onClick={() => setLanguage(language === "ko" ? "en" : "ko")}>
      {t.actions.save}
    </button>
  );
}
```

### 사용 규칙

- Client Component에서는 `useLanguage()`를 직접 사용한다.
- 공통 함수/hook에서 에러 fallback이 필요하면 번역 문자열을 파라미터로 주입한다.
  - 예: `composeMeme("BASIC", undefined, t.gacha.drawFailed)`
  - 예: `useHeart(isLoggedIn, t.errors.heartFetchFailed)`
- 서버에서 받은 태그처럼 원본 값이 한국어일 수 있는 데이터는 `t.tags[tag] ?? tag` 형태로 표시명을 변환한다.

---

## 9. 캔버스/이미지 생성 텍스트

`MemeCanvasCard`처럼 이미지로 캡처되는 컴포넌트는 DOM 텍스트와 동일하게 현재 언어의 `t`를 사용합니다.

현재 기준:

- 이미지 `alt`: `t.brand.meme` 또는 상위 컴포넌트에서 전달한 `imageAlt`
- 브랜드 바 보조 문구: `t.canvas.brandBar`

캔버스/이미지 결과물에 들어가는 텍스트는 사용자가 저장/공유할 수 있으므로 일반 UI 문구보다 더 꼼꼼히 확인해야 합니다.

### 체크리스트

- 저장 이미지에 한국어 문구가 남아 있지 않은가?
- 영어 모드에서 캡처한 이미지의 브랜드 바/상세 문구가 영어로 표시되는가?
- 날짜/시간, 생성일, 결과 alt 같은 메타 문구도 i18n 처리되어 있는가?

---

## 10. 하드코딩 문구 점검

한국어 UI 문구가 컴포넌트에 남아 있는지 확인할 때는 아래 명령을 사용합니다.

```bash
rg '"[^"\n]*(피카|미미|갤러리|뽑|하트|로그|저장|공유|생성|오류|실패|불러|선택|뒤로|확인|계속|카드|모드|최신|태그|숨|상세|로딩|전체|무료|일반|스페셜|닫기|메뉴)[^"\n]*"|>[^<\n]*(피카|미미|갤러리|뽑|하트|로그|저장|공유|생성|오류|실패|불러|선택|뒤로|확인|계속|카드|모드|최신|태그|숨|상세|로딩|전체|무료|일반|스페셜|닫기|메뉴)[^<\n]*<' \
  pam-frontend/app pam-frontend/components pam-frontend/hooks pam-frontend/lib \
  -n --glob '!node_modules'
```

이 명령은 완벽한 lint는 아니지만, 놓치기 쉬운 화면 텍스트/알럿/에러 fallback을 빠르게 찾는 데 유용합니다.

---

## 11. 새 문구 추가 절차

1. 문구가 속한 namespace를 고른다.
2. `public/locales/ko.json`에 한국어 문구를 추가한다.
3. `public/locales/en.json`에 같은 key path로 영어 문구를 추가한다.
4. 컴포넌트에서 `t.namespace.key`로 참조한다.
5. 동적 문구라면 `lib/i18n.ts`의 `format` helper를 추가한다.
6. 아래 검증을 실행한다.

```bash
cd pam-frontend
npx tsc --noEmit
npm run build
```

---

## 12. 영어 문구 작성 기준

- 직역보다 짧고 자연스러운 UI 영어를 우선한다.
  - `BASIC 가챠` → `Get a Meme`
  - `SPECIAL 가챠` → `Lucky Draw`
- 버튼은 동사로 시작한다.
  - `Save`, `Share`, `Draw Again`, `Load More`
- 에러 메시지는 짧게 원인/다음 행동을 포함한다.
  - `Failed to save. Please try again.`
- 태그명은 한국어 원본 키를 유지하되 표시명만 영어로 매핑한다.
  - 서버/API 계약을 바꾸지 않고 UI 표시만 다국어화하기 위함.

---

## 13. 검증 기준

필수 확인:

```bash
cd pam-frontend
npx tsc --noEmit
npm run build
```

권장 확인:

- 한국어/영어 전환 후 홈, 태그 선택, 로딩, 결과, 로그인 메뉴, 갤러리, 상세 페이지를 각각 확인한다.
- 로그인/OAuth callback 문구와 에러 fallback 메시지를 확인한다.
- 저장/공유 이미지에 들어가는 캔버스 텍스트를 확인한다.
- 하드코딩 점검 `rg` 명령을 실행한다.

현재 프로젝트에서는 `npm run lint` 실행 시 Next.js ESLint 초기 설정 프롬프트가 뜰 수 있습니다. ESLint 설정 파일이 추가되기 전까지는 비대화형 CI/에이전트 환경에서 lint가 완료되지 않을 수 있습니다.

---

## 14. 향후 개선 후보

- `TranslationMessages` 구조와 placeholder 이름까지 검증하는 스크립트 추가.
- `t.tags[tag] ?? tag` 패턴을 공통 함수로 분리.
- 서버 에러 코드 기반 클라이언트 번역 매핑 도입.
- `metadata`의 제목/설명까지 언어별로 처리하는 정책 수립.
- Playwright 기반 한국어/영어 화면 스냅샷 테스트 추가.
