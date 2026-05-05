# pam-frontend

pick-a-meme 프론트엔드. Next.js 14 App Router + Tailwind CSS v4.

---

## 개발 시작

```bash
npm install
npm run dev    # localhost:3000
npm run build  # 빌드 검증 (변경 후 필수)
```

---

## 화면 구조

`app/page.tsx`는 `AppState` 라우팅과 비즈니스 로직만 담당한다.  
각 화면은 `components/domains/gacha/` 아래 독립 컴포넌트로 분리되어 있다.

```
AppState: "HOME" | "TAG_SELECT" | "SPINNING" | "RESULT"

app/
  page.tsx                      ← 상태 관리 + API 호출 + 화면 전환

components/
  domains/
    gacha/
      HomeScreen.tsx            ← 로고, 미리보기 카드, BASIC/SPECIAL 버튼
      SpinningScreen.tsx        ← 카드 뽑기 로딩 애니메이션 (자체 state/effects)
      TagSelectScreen.tsx       ← 태그 멀티셀렉트 + 뽑기 확인
      ResultScreen.tsx          ← 결과 카드, 워터마크 바, 저장/다시뽑기
    heart/
      HeartDisplay.tsx          ← 상단 하트 바 + 스페셜 미션 슬라이드업
    meme/
      MemeGallery.tsx           ← 갤러리 페이지
  auth/
    LoginSlideMenu.tsx          ← 로그인 슬라이드 메뉴
```

---

## 주요 hooks

| 파일 | 역할 |
|------|------|
| `hooks/useAuth.ts` | 로그인 상태 |
| `hooks/useGuestHeart.ts` | 비로그인 하트 (로컬) |
| `hooks/useHeart.ts` | 서버 하트 상태 (React Query) |
| `hooks/useMissions.ts` | 스페셜 하트 미션 목록 (API 연동 대기) |
| `hooks/useMemeApi.ts` | 밈 생성 API 호출 (실패 시 mock fallback) |

---

## 디자인 토큰

| 이름 | 값 | 용도 |
|------|----|------|
| Primary | `#FF6B9D` | BASIC 하트, MEME 텍스트, 강조 |
| Primary Deep | `#C44DFF` | SPECIAL 그라디언트, 미션 |
| Base | `#111111` | BASIC 가챠 버튼, 본문 텍스트 |
| Surface | `#FFF0F5` | 배경 보조 |

디자인 스펙 전체: [`DESIGN_HANDOFF.md`](./DESIGN_HANDOFF.md)

---

## 주의사항

**Tailwind v4에서 커스텀 색상 클래스 미적용 문제**  
`text-primary` 같은 Tailwind 유틸리티 클래스가 v4 환경에서 커스텀 색상을 올바르게 참조하지 못한다.  
`MEME` 텍스트처럼 브랜드 색상이 반드시 적용되어야 하는 곳은 인라인 style로 강제 지정한다.

```tsx
// ❌ 적용 안 됨
<em className="text-primary italic">MEME</em>

// ✅ 올바른 방법
<em style={{ color: "#FF6B9D", fontStyle: "italic" }}>MEME</em>
```

**최소 로딩 시간**  
`composeMeme` API 응답이 빠르더라도 로딩 화면은 최소 2초 노출한다.  
`Promise.all([apiCall, setTimeout(2000)])` 패턴으로 처리.

**컨테이너 너비**  
모바일 퍼스트 500px 고정 컨테이너. `layout.tsx`의 `max-w-[500px]`이 기준.  
UI 크기를 조정할 때 이 너비를 기준으로 맞춘다.
