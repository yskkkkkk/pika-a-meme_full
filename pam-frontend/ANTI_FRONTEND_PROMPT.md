# pick-a-meme 프론트엔드 작업 브리핑 (anti용)

## 프로젝트 한 줄 요약

동물 사진 + 말풍선 문구를 조합하는 가챠형 밈 생성 서비스.  
하트를 써서 뽑으면 이미지와 문구가 서버에서 조합되어 내려온다.

---

## 현재 상태 (인수인계)

- Next.js 14 (App Router) + Tailwind CSS 세팅 완료
- 소셜 로그인 (카카오/구글) + JWT 저장 훅 동작 중
- 비로그인 하트 시뮬레이션 (`useGuestHeart`) 있음
- POC 버전 가챠 화면 있으나 **전면 재설계 대상**

---

## 해야 할 것 (v2 재설계)

### 1. 레이아웃 원칙
- **모바일 퍼스트 절대 원칙.** 가로 최대 `500px` 중앙 컨테이너. PC도 동일.
- 배경: 단색 or 브랜드 컬러.

### 2. 메인 화면 (극단적 단순화)

현재 `app/page.tsx`와 `MemeGeneratorContainer.tsx`를 교체한다.

```
[ 로고 ]

[ ♥ BASIC 뽑기 버튼 ]   ← 탭 즉시 랜덤 밈 생성
[ ✦ SPECIAL 뽑기 버튼 ] ← 탭 시 태그 선택 UI 등장 → 뽑기 → 결과

(설명 텍스트 없음. 그냥 뽑게 한다.)
```

상단 우측 구석에 작은 로그인 버튼 하나만.

### 3. 하트 타입별 흐름

**BASIC 탭:**
1. 하트 소모 확인
2. `GET /api/memes/compose?heartType=BASIC` 호출
3. 응답 받아 결과 화면 표시

**SPECIAL 탭:**
1. 태그 선택 UI 등장 (멀티 선택, 예: "피곤", "직장인", "월요일")
2. 선택 완료 → `GET /api/memes/compose?heartType=SPECIAL&tags=피곤,직장인` 호출
3. 결과 화면 표시

### 4. 결과 화면 — 말풍선 렌더링

기존 Canvas 합성 방식을 버리고 **CSS 절대 포지셔닝**으로 구현한다.

API 응답 구조:
```json
{
  "imagePresignedUrl": "https://r2.../meme_images/...",
  "subjectPosition": "bottom_right",
  "phrase": "아 진짜 월요일 싫어"
}
```

`subjectPosition` → 말풍선 위치 매핑:

| 값 | 말풍선 배치 |
|---|---|
| `top` | 하단 |
| `bottom` | 상단 |
| `left` | 우측 |
| `right` | 좌측 |
| `center` | 상단 or 하단 랜덤 |
| `top_left` | 우하단 |
| `top_right` | 좌하단 |
| `bottom_left` | 우상단 |
| `bottom_right` | 좌상단 |
| `full_horizontal` | 상단 or 하단 랜덤 |
| `full_vertical` | 좌측 or 우측 랜덤 |
| `full` | 4개 모서리 중 랜덤 |

```tsx
// 구현 힌트
<div className="relative w-full max-w-[500px]">
  <img src={imagePresignedUrl} className="w-full" />
  <div className={`absolute ${positionClass} bg-white rounded-2xl p-3 shadow-lg max-w-[60%]`}>
    {phrase}
  </div>
</div>
```

### 5. 로그인/서비스 소개 화면

메인 우측 상단 로그인 버튼 탭 → 모바일 슬라이드 애니메이션으로 전환.

이 화면에:
- 서비스 소개 텍스트
- "로그인하면 밈을 저장할 수 있어요" 안내
- 카카오 / 구글 로그인 버튼
- 기존 메인 하단 기능 설명 카드들 (실시간 충전, 스페셜 밈, 클라우드 저장)

---

## 건드리면 안 되는 것

- `lib/auth.ts` — JWT 저장/로드 로직
- `hooks/useAuth.ts` — 로그인 상태 관리
- `hooks/useGuestHeart.ts` — 비로그인 하트 시뮬레이션
- `app/oauth2/callback/page.tsx` — OAuth2 콜백
- `app/providers.tsx` — TanStack Query 설정

---

## API 엔드포인트 (백엔드 구현 예정)

```
GET  /api/memes/compose?heartType=BASIC
GET  /api/memes/compose?heartType=SPECIAL&tags=피곤,직장인
GET  /api/hearts          ← 현재 하트 현황 (로그인 필요)
GET  /api/memes           ← 갤러리 피드
```

백엔드가 준비되기 전엔 mock 데이터로 개발하고, API 연동은 `lib/api.ts`의 `apiFetch()` 래퍼 사용.

---

## 브랜치 규칙

작업 브랜치: `feat/front/mobile-ui-rebuild`  
커밋: `feat(front): [작업 내용] (TASK-260504-XX)`
