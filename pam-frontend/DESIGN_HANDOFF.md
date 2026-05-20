# pick-a-meme 디자인 핸드오프 (Claude Code 전달용)

> 디자인 검토 결과 확정된 사항 정리. 목업 파일을 함께 첨부할 것.

---

## 🎨 목업 파일 참고

| 파일 | 내용 |
|---|---|
| `integrated-mockup.html` | 전체 6화면 플로우 (홈→태그→로딩→결과→미션→공유) |
| `heart-ui-mockup.html` | 하트 UI + 스페셜 미션 슬라이드업 인터랙션 |
| `result-card-mockup.html` | 결과 카드 + 워터마크 3종 비교 |
| `loading-screens.html` | 로딩 화면 A/B/C 비교 (A 확정) |

---

## ✅ 확정된 디자인 결정사항

### 1. 브랜드 컬러 — Neon Candy

기존 `primary`가 거의 검정(`hsl 222.2 47.4% 11.2%`)이었던 것을 교체.

```css
/* globals.css */
:root {
  --primary: #FF6B9D;        /* 핑크 — 메인 포인트 */
  --primary-deep: #C44DFF;   /* 퍼플 — SPECIAL 가챠 / 악센트 */
  --base: #111111;           /* 버튼 배경, 텍스트 */
  --surface: #FFF0F5;        /* 연핑크 배경 tint */
}
```

```ts
// tailwind.config.ts
colors: {
  primary: '#FF6B9D',
  'primary-deep': '#C44DFF',
  'brand-surface': '#FFF0F5',
}
```

**적용 포인트:**
- 로고 `PICK-A-MEME`에서 `MEME` → `text-primary italic`
- SPECIAL 가챠 버튼 → `from-[#C44DFF] to-[#FF6B9D]` (기존 `from-indigo-600 to-purple-700` 교체)

---

### 2. 폰트 — Pretendard

기존 `Inter` (한글 웨이트 표현 미흡) → `Pretendard`로 교체.

```html
<!-- app/layout.tsx <head>에 추가, Inter import 제거 -->
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
```

```ts
// tailwind.config.ts
fontFamily: {
  sans: ['Pretendard', '-apple-system', 'sans-serif'],
}
```

```tsx
// layout.tsx body 클래스 — inter 클래스 제거
<body className="font-sans bg-slate-100 antialiased">
```

---

### 3. 하트 UI — 게임 에너지 바 + 스페셜 미션 슬라이드업

기존 좌상단 작은 pill → 상단 바에 두 영역으로 분리.

**레이아웃:**
```
[ ❤️  BASIC  ████░░  3/5 ]   [ ⚡ 1 ]   [ ≡ ]
       에너지 바                탭 가능    메뉴
```

**기본 하트 (왼쪽):**
- 핑크 아이콘 박스 + `BASIC` 레이블 + 프로그레스 바 + `3/5` 숫자
- 색상: `#FF6B9D` 그라디언트 바

**스페셜 하트 (오른쪽):**
- ⚡ 아이콘 + 숫자만 표시 (희소 자원 강조)
- 배경: `linear-gradient(135deg, #f5eeff, #ede0ff)`, 보더: `#dbc8ff`
- 미완료 미션 있을 때 핑크 뱃지 노출
- **탭 시 → 미션 슬라이드업 시트 오픈**

**미션 슬라이드업 내용:**
```
┌──────────────────────────────┐
│  ⚡ 스페셜 하트 획득            │
├──────────────────────────────┤
│ ✅  최초 로그인          +1   │ (완료)
│ 📸  스토리 공유하기      +1   │ (미완료)
│ 🔗  친구 초대하기        +1   │ (미완료)
│ 🗓️  7일 연속 방문        +2   │ (진행중 3/7, 프로그레스바)
│ 🔒  갤러리 10개 채우기   +2   │ (잠김)
└──────────────────────────────┘
```

**구현 힌트:**
- `useState`로 슬라이드업 open/close
- 기존 `LoginSlideMenu` 바텀시트 패턴 참고
- `onClick={() => setMissionOpen(true)}`

---

### 4. 홈화면 시각적 앵커 — 밈 프리뷰 스트립

기존: 로고 + 버튼 2개 (빈 공간 과다)
변경: 로고 아래 밈 미리보기 카드 3개 스트립 추가

```tsx
// page.tsx — HOME state, 로고와 버튼 사이
<div className="flex gap-3 overflow-hidden w-full">
  {PREVIEW_MEMES.map((meme) => (
    <div key={meme.id}
      className="flex-shrink-0 w-[100px] h-[100px] rounded-2xl overflow-hidden relative">
      <img src={meme.imageUrl} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent
                      flex items-end p-2">
        <p className="text-white text-[10px] font-black leading-tight">{meme.phrase}</p>
      </div>
    </div>
  ))}
</div>
```

**데이터:** API 최근 인기 밈 3개 또는 정적 샘플로 시작.

---

### 5. 로딩 화면 — Warm Dark 카드 플립

- 배경: `#1a1010`
- 카드: `linear-gradient(135deg, #FF6B9D, #C44DFF)`, 1.6s flip 애니메이션
- 글로우 펄스: `box-shadow 0 0 20px rgba(255,107,157,0.3)` → `0 0 60px rgba(255,107,157,0.7)`
- 하단 로고: `PICK-A-MEME` `rgba(255,255,255,0.35)` `letter-spacing: 0.2em`

**단계별 로딩 문구** (2초 간격, 점 320ms씩 타이핑):

```tsx
const LOADING_STEPS = [
  { text: '카드 뽑는 중',      dots: 3 },
  { text: '문구 뽑는 중',      dots: 3 },
  { text: '이미지에 붙이는 중', dots: 5 },
  { text: '마무리 중',          dots: 2 },
];

// step 전환: useEffect → setInterval 2000ms
// dot 타이핑: useEffect → setTimeout 320ms 재귀
```

---

### 6. 결과 카드 워터마크 — WM-C Brand Color Bar

저장/공유 시 내보내는 **9:16 이미지** 하단 고정.

```css
.watermark-bar {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 62px;
  background: linear-gradient(135deg, #FF6B9D, #C44DFF);
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 18px;
}
/* 왼쪽: PICK-A-MEME 로고 (white, font-weight 900) */
/* 오른쪽: "나도 뽑으러 가기" + "pick-a-meme.app" */
```

**저장 플로우:**
1. 결과 카드(1:1) → 저장 버튼 탭
2. `html2canvas` 또는 서버사이드 합성 → 9:16 캔버스 생성
3. 하단 62px 워터마크 C 삽입
4. `navigator.share({ files: [imageFile] })` 로 공유
5. 미지원 기기: `<a download>` fallback

---

## ⏳ 미구현 — 추후 작업

| 항목 | 현황 | 비고 |
|---|---|---|
| 결과 이미지 저장 | `alert("준비중")` 상태 | html2canvas 또는 서버 합성 구현 필요 |
| 인스타 스토리 공유 | 미구현 | Web Share API + 9:16 변환 + 워터마크 C 포함 |

---

## 📁 수정 대상 파일

| 파일 | 변경 내용 |
|---|---|
| `pam-frontend/app/layout.tsx` | Inter 제거 → Pretendard CDN, `font-sans` 클래스 |
| `pam-frontend/app/globals.css` | CSS 변수 컬러 교체 |
| `pam-frontend/tailwind.config.ts` | colors, fontFamily 추가 |
| `pam-frontend/app/page.tsx` | 상단 하트 UI 교체, 홈 프리뷰 스트립 추가, 로딩 문구 로직, 스페셜 하트 탭 핸들러 |
| `pam-frontend/components/domains/heart/HeartDisplay.tsx` | 에너지 바 UI로 재작성 |

---

## 🎰 7. [NEW] 1평 남짓한 셸 밖의 기적: 데스크톱 여백을 활용한 포트폴리오 전환율 극대화 푸터 (Footer)

### 🎯 도입 의의 및 기획적 의도
1. **은밀하고 고급스러운 노출:** 일반 사용자의 밈 생성 재미를 절대 방해하면 안 됩니다. 따라서 얇고 투명한 글래스모피즘(Glassmorphism)과 미니멀한 텍스트/아이콘을 차용합니다.
2. **오디언스 타겟 반응형 배치 (Dual-Layer Layout):**
   * **데스크톱 ( recruiter & developer )**: 모바일 셸(`max-w-[500px]`) **하단 외부 여백 영역**에 넓고 정교하게 배치합니다. 데스크톱으로 포트폴리오를 검토하는 면접관의 시선에 가장 완벽하게 꽂히도록 설계합니다.
   * **모바일 ( 일반 독자 및 유저 )**: 앱 셸 내부의 **홈 스크린(`HomeScreen`) 최하단** 영역에 스크롤을 끝까지 내렸을 때만 은근히 등장하도록 배치하여 불필요한 고정 영역 차지를 완전히 예방합니다.

### 🎨 디자인 명세 (Footer UI Spec)
* **배경 및 아웃라인:** 얇은 1px 반반사 연분홍 아웃라인(`var(--pam-border-pink)`) + 아주 옅은 글래스모픽 투명 백그라운드.
* **호버 마이크로 애니메이션:** 호버 시 몽환적인 핑크/퍼플 네온 글로우가 은은하게 번지는 HSL 트랜지션 애니메이션 (`var(--pam-pink)` 및 `var(--pam-purple)` 교차).
* **다크모드 대응:** 다크 테마 시 네온 라임(`var(--pam-accent)`) 글로우 및 연분홍 색조로 완벽히 리포지셔닝.

### 📁 수정 대상 파일 (신규 추가)
- `pam-frontend/components/Footer.tsx` [NEW] — 푸터 공통 컴포넌트
- `pam-frontend/app/layout.tsx` [MODIFY] — 외부 데스크톱용 플로팅 배치
- `pam-frontend/components/domains/gacha/HomeScreen.tsx` [MODIFY] — 모바일 홈스크린 하단 배치
- `pam-frontend/app/globals.css` [MODIFY] — 푸터 전용 애니메이션/글로우 CSS 유틸리티

