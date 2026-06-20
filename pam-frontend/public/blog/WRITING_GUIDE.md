# pick-a-meme Dev Blog — AI 작성 지침서

> 이 문서는 AI가 pick-a-meme Dev Blog 포스트를 작성할 때 반드시 따라야 하는 규칙을 정의한다.  
> 새 포스트를 작성하기 전에 반드시 이 지침을 전부 읽고 시작할 것.

---

## 1. 파일 구조 및 네이밍

```
pam-frontend/public/blog/
├── index.html          ← 블로그 목록 페이지 (포스트 추가 시 반드시 업데이트)
├── post1.html
├── post2.html
├── post{n}.html        ← 새 포스트는 순번 이어서 작성
├── profile.html        ← 공통 프로필 아카이브 카드 템플릿 조각
├── header.html         ← [NEW] 공통 헤더 및 테마 스위처 조각
├── config.js           ← [NEW] 블로그 전용 글로벌 설정 및 외부 상수 정의 파일
├── blog_post.css       ← 공통 CSS + 테마 변수 (모든 포스트가 공유)
├── theme.js            ← 테마 전환 로직 + 비동기 Fetch 조각 로더 정의
└── WRITING_GUIDE.md    ← 이 파일
```

- 파일명: `post{n}.html` 형식. 번호는 건너뛰지 않는다.
- 모든 파일은 `pam-frontend/public/blog/` 아래에 위치한다.
- **pet-pass와 달리** `/style.css`, `/theme.js` 같은 외부 앱 파일에 의존하지 않는다.
  - CSS 변수는 `blog_post.css` 안에 모두 정의되어 있다.
  - 테마 로직, 조각 로딩, 링크 설정 바인딩은 `/blog/theme.js`와 `/blog/config.js`를 사용한다.

---

## 2. HTML 기본 골격

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{포스트 제목 요약} | pick-a-meme Dev Blog</title>
  <link rel="stylesheet" href="/blog/blog_post.css">   <!-- 공통 CSS + 테마 변수 -->
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
  <style>
    /* ─── 이 포스트 고유 컴포넌트 CSS만 여기에 ─── */
  </style>
  <script>
  (function(){
    var t = localStorage.getItem('pam-theme') || 'dark';
    if (t !== 'dark') document.documentElement.setAttribute('data-theme', t);
  })();
  </script>
</head>
<body>

  <!-- 1. 공통 헤더 동적 플레이스홀더 (하드코딩 절대 금지) -->
  <div id="blog-header-placeholder"></div>

  <div class="nav-buttons">
    <a href="/blog" class="btn-nav">← 목록으로</a>
    <a href="/" class="btn-nav">홈으로</a>
  </div>

  <main class="blog-content glass">
    <!-- 2 ~ 5. 본문 및 TOC 콘텐츠 영역 -->
    
    <!-- 6. 공통 프로필 카드 동적 플레이스홀더 (하드코딩 절대 금지) -->
    <div id="profile-card-placeholder"></div>

    <!-- 7. 포스트 푸터 (이전/다음 글 네비게이션) -->
    <div class="post-footer">
      <a href="/blog/post{n-1}.html" class="btn-post-nav btn-prev">← 이전 글</a>
      <a href="/blog/post{n+1}.html" class="btn-post-nav btn-next">다음 글 →</a>
    </div>
  </main>

  <!-- 8. 환경설정 및 비동기 엔진 로드 (순서 중요) -->
  <script src="/blog/config.js"></script>
  <script src="/blog/theme.js"></script>

</body>
</html>
```

**절대 빠뜨리면 안 되는 것:**
- `<head>` 내 테마 플래시 방지 인라인 스크립트 (`pam-theme` 키, 기본값 `'dark'`)
- **공통 헤더용 플레이스홀더 `<div id="blog-header-placeholder"></div>`**
- **공통 프로필 카드용 플레이스홀더 `<div id="profile-card-placeholder"></div>`**
- `<body>` 끝자락에 **`<script src="/blog/config.js"></script>`와 `<script src="/blog/theme.js"></script>` 순서대로 탑재**
- **pet-pass와 다른 점**: 기본 테마가 `'dark'`이므로, 플래시 방지 스크립트에서 `'dark'`일 때는 `data-theme` 속성을 붙이지 않는다.

---

## 3. 테마 시스템

### 테마 종류

| 테마 | 키 | 도트 색상 | 특징 |
|---|---|---|---|
| 다크 (기본) | `dark` | `#1e1e30` | 기본 상태. `data-theme` 속성 없음. 퍼플 계열 포인트 |
| 라이트 | `light` | `#ede9fe` | 연보라 배경. 보라 포인트 |
| 네온 | `neon` | `#00ff88` | 완전 검정 배경. 형광 초록 포인트 |

### 플래시 방지 스크립트 (head 안에)

```html
<script>
(function(){
  var t = localStorage.getItem('pam-theme') || 'dark';
  if (t !== 'dark') document.documentElement.setAttribute('data-theme', t);
})();
</script>
```

- localStorage 키: `pam-theme` (pet-pass의 `pet-pass-theme`과 다름)
- 기본값이 `'dark'`이므로 저장된 값이 없으면 속성을 붙이지 않아도 된다.

### CSS 변수 (blog_post.css에 정의됨)

```
:root (dark)   → --primary: #a855f7 (퍼플)
[light]        → --primary: #9333ea (딥 퍼플)
[neon]         → --primary: #00ff88 (네온 그린)
```

---

## 4. `<main>` 내부 콘텐츠 구성 순서

```html
<main class="blog-content glass">

  <!-- 1. 메타 정보 -->
  <div class="post-meta">
    <span class="post-series-tag">{시리즈 태그}</span>
    <span class="read-time">약 {N}분</span>
  </div>

  <!-- 2. 제목 (날짜 없음 — 절대 추가하지 말 것) -->
  <h1 class="post-main-title">{제목}</h1>

  <!-- 3. 태그 -->
  <div class="post-tags">
    <span class="tag-chip">#태그1</span>
    <span class="tag-chip">#태그2</span>
  </div>

  <!-- 4. 목차 -->
  <div class="toc">
    <p class="toc-title">목차</p>
    <ol>
      <li><a href="#id1">섹션 제목</a></li>
    </ol>
  </div>

  <!-- 5. 본문 섹션들 -->
  <h2 id="id1">섹션 제목</h2>
  <p>내용</p>

  <!-- 6. 공통 프로필 아카이브 카드 동적 주입 영역 -->
  <div id="profile-card-placeholder"></div>

  <!-- 7. 포스트 푸터 (이전/다음 글 네비게이션) -->
  <div class="post-footer">
    <a href="/blog/post{n-1}.html" class="btn-post-nav btn-prev">← 이전 글: {이전 글 요약 제목}</a>
    <a href="/blog/post{n+1}.html" class="btn-post-nav btn-next">다음 글: {다음 글 요약 제목} →</a>
  </div>

</main>
```

**날짜 표시 금지:** `<span class="post-date">` 요소는 절대 추가하지 않는다. 상세 페이지에도, 목록에도 날짜는 노출하지 않는다.

---

## 5. 시리즈 분류 체계

| 카테고리 | 시리즈 태그 형식 | 해당 포스트 |
|---|---|---|
| 시작하며 | `피카밈 개발기 · 시작하며` | post1 |
| 개발 이슈 | `피카밈 개발기 · 이슈 #N` | post2, post3, ... |
| 기획/설계 | `기획 & 설계 · #N` | 기획/UX/아키텍처 결정 포스트 |
| 마치며 | `피카밈 개발기 · 마치며` | 최종 회고 포스트 |

- 이슈 번호(#N)와 기획 번호(#N)는 카테고리 내에서 **독립적으로** 카운팅한다.
- 새 카테고리가 필요하면 이 표에 추가하고, `index.html`에도 반영한다.
- HTML에서 `&`는 반드시 `&amp;`로 이스케이프한다.

---

## 6. 글쓰기 톤 및 어투

> 목표는 하나다 — **"틀에 맞춰 찍어낸 보고서"가 아니라 "차분하게 성숙한 글쓴이 본인"의 목소리**를 유지하는 것.
> 이 블로그는 존댓말(`~습니다` 계열)을 기본으로 하되, 강사·기계처럼 지식을 주입하는 어조가 아니라
> "제가 겪어보니 이렇더라고요" 식의 담담하고 친근한 대화형 독백 스타일을 고수한다.

### 6-1. 목소리 원칙

1. **성숙한 직무 톤** — 주니어식 과한 구어(~를 날려주고)도, AI식 딱딱함(검출되었습니다)도 아닌 차분한 성숙도를 지향한다.
2. **말줄임표(`...`)로 남기는 여운** — 고민의 한계나 아쉬움을 솔직히 인정하며 말끝에 `...`를 의도적으로 남긴다. 특히 **문단·글의 끝**에서 살린다.
   - 예: "시간 단축은 조금 더 고민해 봐야 할 듯..."
3. **자기 객관화 허용** — 솔직한 한계 인정이 글에 생기를 준다.
   - 예: "물론 저도 ~하긴 했지만...", "사실 잘 모르고 쓴 게 맞습니다..."

---

### 6-2. 종결어미 규칙 — 빈도가 아니라 "문장의 기능"으로 정한다

흔한 실수: `~습니다`를 기본으로 두고 `~해요`를 "가끔 섞는 양념"으로 생각하면 `~요`가 무작위로 박혀 어색해진다.
정답은 **문장이 수행하는 역할(speech act)에 따라 어미를 고르는 것**이다.

| 문장의 기능 | 어미 | 예시 |
|---|---|---|
| ① 사건·행동의 단순 서술 (narration) | `~습니다` / `~입니다` | "파일을 분해하고 모듈 구조로 재구축했습니다." |
| ② 이유·배경 설명, 속내 고백 (explanation) | `~거든요` | "막상 해보면 생각보다 판단할 게 많거든요." |
| ③ 직접 겪어 알게 된 경험 (experiential) | `~더라고요` / `~더군요` | "막상 돌려보니 생각보다 느리더라고요." |
| ④ 의문·추측·자문 (doubt) | 따옴표 독백 템플릿 (6-3 참고) | "이게 사실 문제였던 것인가?" 하는 생각이 들었거든요. |
| ⑤ 제안·권유 (suggestion) | `~요` / `~까요?` | "이제 생각을 해볼까요." |
| ⑥ 가벼운 감상·리액션 (reaction) | `~네요` | "생각보다 깔끔하네요." |
| ⑦ 혼잣말·다짐 (resolution) | 명사형 / `~듯` / `~기!` | "다음엔 캐싱부터 잡아두기!" |

**헷갈릴 때의 판별법:**
- 문장 앞에 "사실"·"왜냐하면"을 붙여 자연스러우면 → `~거든요` (②)
- 그냥 일어난 일을 순서대로 적는 문장이면 → `~습니다` (①)
- `~요`로 평서문을 끝내고 싶어지면 거의 항상 `~거든요`(②)나 `~더라고요`(③)가 더 맞다. 단순 `~어요/~해요` 평서 종결은 의식적으로 줄인다.

---

### 6-3. 독백체 의문·추측 — 따옴표 자문 템플릿

사건에 의문을 표하거나 추측할 때는 평서문으로 단정("이건 문제였습니다")하지 않고, **속으로 던진 질문을 따옴표로 인용**한다.

구조: `"〔의문형 문장〕" 하는 생각이 들었거든요.`

- 인용 안의 의문형 어미는 `~ㄹ까?`, `~인가?`, `~던 것인가?`, `~던 걸까?` 등을 쓴다.
  - `"이게 사실 문제가 있던 걸까?" 하는 생각이 들었거든요.`
- 인용 뒤 프레임은 변주한다: `하는 생각이 들었거든요` / `싶었습니다` / `싶더라고요`.

---

### 6-4. 도입부 패턴

기술 정의로 시작하지 않는다. **최근 겪은 실무 경험이나 문제**를 툭 던지는 독백으로 연다.

- 좋은 예: "로그아웃 버튼을 누르면 토스트가 떴습니다. 그런데 새로고침하면 다시 로그인 상태였거든요."
- 피할 예: "OAuth2는 인증 위임을 위한 프로토콜로..." (교과서적)

**과잉 서사형 도입부 금지:**

| 금지 예 | 이유 |
|---|---|
| "이 이야기는 아주 단순한 질문에서 시작됐다" | AI 특유의 서사 프레임 |
| "시작은 사소했다" | AI 특유의 서사 프레임 |
| "~이(가) 발단이었다" | 과잉 극적화 |
| "뜻밖의 계기로" | 작위적 복선 |

---

### 6-5. 설명조·분류 문장 금지

- **설명조/강의조 금지:** `~하셔야 합니다`, `다음과 같습니다` 같은 주입형 어조를 피한다.
- **분류·전환 요약 문장 금지:** 다음 내용을 자연스럽게 이어 쓰면 될 것을 굳이 한 줄로 요약·예고하지 않는다.
  - 금지 예: "두 케이스 모두 ~라는 게 공통점입니다.", "한 가지는 분명하게 느꼈습니다."

---

### 6-6. 단락·강조

- 한 문단에 서너 문장씩 우겨넣지 않는다. **1~2문장 단위**로 나눠 호흡을 짧게 가져간다.
- 볼드(`<strong>`)는 **코드명·수치·고유명사** 위주로만. 감정·판단을 담은 서술에는 쓰지 않는다.
- 소제목(`h2`/`h3`)에 이모지를 붙이지 않는다.

---

### 6-7. 결말부 패턴

거의 모든 포스트의 본문 구조 공식은 `문제/상황 → 시도(실패 포함) → 결말/해결 → 마무리`이며, 각 포스트는 하나의 경험/이슈에 집중한다.

**AI식 억지 교훈·병렬 대비 결론 금지:**
- ❌ "결국 A와 B는 맞닿아 있다", "A와 B는 다른 이야기다"
- ❌ "한 가지는 분명하게 느꼈다", "배운 점은 ~이었다"

글을 억지로 웅장하거나 감동적으로 끝맺으려 하지 않는다. 아래 패턴 중 상황에 맞는 것을 고른다.

1. **무심한 단상형** — 해결 후 가볍게 느낌만 던지고 끝.
   - "이론하고 실제 동작이 조금 다른가 봐요."
2. **기술적 사실 종결형** — 요약·리스트만 나열하고 미련 없이 끝.
3. **다음 스텝 / 셀프 피드백형** — 미완의 한계나 다음에 시도할 것을 메모처럼 남김. (혼잣말 톤이라 명사형 혼용 OK)
   - "이유는 조금 더 찾아봐야 할 듯..."

> **lesson-box 활용 (pick-a-meme 한정):** 이 블로그는 포트폴리오 성격상 `.lesson-box`를 구조 컴포넌트로 유지한다.
> 단, 그 안의 문장도 위 결말 원칙을 따른다 — "~는 중요하다" 류 추상 교훈이 아니라, `~더라고요`로 직접 겪은 결을 담거나
> "다음엔 ~하기" 식 셀프 피드백으로 담담하게 닫는다.

---

### 6-8. 금지 표현 목록

| 금지 예 | 대체 |
|---|---|
| "~하는 방법을 알아보겠습니다" | 그냥 상황을 툭 던진다 |
| "결론적으로 말씀드리면" | 삭제 |
| "소중한 시간이었습니다" / "유익한 프로젝트였습니다" | 삭제하거나 구체적 감상 1문장 |
| "기대 이상이었습니다" | 뭐가 구체적으로 좋았는지 1문장 |
| "~를 깨달은 대목입니다" | "~인가 봅니다" 정도로 무심하게 |
| "앞으로 더 많아질 것 같습니다" (예측형) | 삭제 — 트렌드 예측은 쓰지 않는다 |

---

## 7. 비주얼 컴포넌트 및 동적 모듈 목록

공통 CSS(`blog_post.css`)에 정의된 컴포넌트는 어떤 포스트에서도 바로 사용 가능하다.  
포스트 고유 컴포넌트는 해당 포스트의 `<style>` 블록에 선언한다.

### 7-1. 공통 컴포넌트 및 프래그먼트 (blog_post.css / theme.js에 있음)

| 컴포넌트 | 선택자 / 플레이스홀더 / 속성 | 용도 |
|---|---|---|
| 공통 헤더 및 스위처 | `#blog-header-placeholder` | 타이틀 및 다크/라이트/네온 버튼 동적 바인딩 (header.html 로드) |
| 공통 프로필 아카이브 | `#profile-card-placeholder` | 류대성 엔지니어 Identity 카드 동적 Fetch 바인딩 (profile.html 로드) |
| 글로벌 설정 링크 매핑 | `data-config-link="{key}"` | config.js의 중앙 정의된 URL 값을 빌드 없이 런타임에 동적으로 매핑 주입 |
| 하이라이트 박스 | `.highlight-box > p` | 핵심 문장 강조, 이탤릭 인용 |
| 레슨 박스 | `.lesson-box > h3 + p` | 포스트 말미 교훈 정리 |
| 타임라인 | `.timeline > .timeline-item[.fail]` | 시도/실패 과정 나열 |
| 통계 카드 | `.stats-grid > .stat-card` | 숫자 강조 (3열 그리드) |
| 구분선 | `.divider` | 섹션 간 hr 대체 |
| 목차 | `.toc > ol` | 포스트 상단 목차 |
| 태그 | `.tag-chip` | 태그 표시 |

### 7-2. 포스트 고유 컴포넌트 (재사용 시 CSS 복사 필요)

| 컴포넌트 | 최초 사용 포스트 | 용도 |
|---|---|---|
| 조건 카드 | post1 | `.condition-grid`, `.condition-card` — 3가지 조건 시각화 |
| 레이어 스택 다이어그램 | post2 | `.layer-stack`, `.layer-item[.domain]`, `.layer-arrow` — 아키텍처 계층 |
| 코드 블록 | post2 | `.code-block` + 신택스 하이라이트 스팬 (중복 CSS는 blog_post.css 최하단 통합 완료) |
| 하트 비교 카드 | post3 | `.heart-compare`, `.heart-col`, `.heart-col-header[.basic/.special]` |
| 흐름 박스 | post3 | `.flow-box`, `.flow-step`, `.flow-num` — 순서 있는 흐름 설명 |
| 시리즈 예고 | post1 | `.series-preview` — 다음 글 예고 목록 |

### 7-3. 컴포넌트 선택 규칙

- **같은 컴포넌트를 연속된 두 포스트에서 반복하지 않는다.**
- 텍스트만 이어지는 구간이 길어지면 비주얼 컴포넌트를 하나 삽입해 리듬을 끊는다.
- 새 컴포넌트를 만들 때는 이 목록(7-2)에 추가한다.

---

## 8. 포스트 푸터 네비게이션 규칙

```html
<div class="post-footer">
  <!-- 이전 글이 있으면 -->
  <a href="/blog/post{n-1}.html" class="btn-post-nav btn-prev">← 이전 글: {짧은 제목}</a>

  <!-- 다음 글이 있으면 -->
  <a href="/blog/post{n+1}.html" class="btn-post-nav btn-next">다음 글: {짧은 제목} →</a>

  <!-- 없는 방향은 생략 (빈 span도 넣지 않는다) -->
</div>
```

- 새 포스트를 추가하면 **이전 포스트의 "다음 글" 링크도 반드시 추가**한다.
- 짧은 제목은 실제 포스트 제목의 핵심 키워드만 뽑아서 쓴다. (긴 제목 그대로 넣지 말 것)

---

## 9. index.html 업데이트 규칙

새 포스트를 추가할 때 반드시 `index.html`의 `<main class="blog-container">` 안에 카드를 **최상단에** 추가한다.
또한 `index.html` 내에서도 공통 프로필 카드와 헤더가 동적으로 로드되도록 플레이스홀더들이 명시되어 있는지 확인한다.

```html
<a href="/blog/post{n}.html" class="blog-post-card glass">
  <div class="blog-post-date">{시리즈 태그}</div>   <!-- 날짜 없이 카테고리만 -->
  <h2 class="blog-post-title">{제목}</h2>
  <p class="blog-post-summary">{한두 문장 요약. 독자가 왜 읽어야 하는지 담을 것.}</p>
  <div class="post-tags">
    <span class="tag-chip">#태그</span>
  </div>
</a>
```

- 카드 순서는 최신 글이 위로 온다.

---

## 10. CSS 구조 원칙

### 공통 CSS (`blog_post.css`)

이 파일에는 **CSS 테마 변수 선언**이 포함되어 있다. pet-pass와 달리 외부 `/style.css`에 의존하지 않으므로, 이 파일 하나가 변수 정의부터 레이아웃까지 모든 것을 담당한다.

주요 포함 항목:
- `:root`, `[data-theme="light"]`, `[data-theme="neon"]` CSS 변수
- `.glass`, `body`, `.blog-header`, `.nav-buttons`, `.btn-nav`
- `.blog-content`, `.post-meta`, `.post-series-tag`, `.read-time`, `.profile-card` (프로필 카드 공통 스타일 일체)
- `.post-main-title`, `.post-tags`, `.tag-chip`, `.toc`
- `.blog-content h2/p/strong/code`, `.highlight-box`, `.lesson-box`, `.divider`
- `.timeline`, `.stats-grid`, `.post-footer`

### 포스트 고유 CSS (`<style>` 블록)

해당 포스트에서만 사용하는 비주얼 컴포넌트 CSS만 선언한다. 공통 CSS에 이미 있는 클래스를 중복 선언하지 않는다.

---

## 11. 커밋 규칙

- 커밋 타입: `feat(blog):` (새 포스트), `design(blog):` (시각 변경), `fix(blog):` (오류 수정), `docs(blog):` (지침서 등 문서)
- 커밋 메시지 본문은 한국어로 작성한다.

```
feat(blog): add post{n} — {한 줄 요약}

- 작성 내용 요약
- index.html 업데이트 내용
- 신규 컴포넌트가 있으면 명시
```

---

## 12. 체크리스트 (포스트 발행 전 확인)

- [ ] 날짜(`post-date`)가 없는지 확인
- [ ] 시리즈 태그 형식이 올바른지 확인 (`피카밈 개발기 · 이슈 #N`)
- [ ] 목차 링크(`id`)가 실제 `h2` id와 일치하는지 확인
- [ ] 이전 포스트의 "다음 글" 링크를 추가했는지 확인
- [ ] `index.html`에 새 카드를 최상단에 추가했는지 확인
- [ ] **헤더 마크업을 하드코딩하지 않고 `<div id="blog-header-placeholder"></div>` 플레이스홀더를 삽입했는지 확인**
- [ ] **프로필 카드 마크업을 하드코딩하지 않고 `<div id="profile-card-placeholder"></div>` 플레이스홀더를 삽입했는지 확인**
- [ ] `config.js`와 `theme.js`가 순서대로 `</body>` 직전에 잘 들어가 로드되는지 확인
- [ ] **외부 설정 링크(GitHub, Pet-Pass 등)에 하드코딩 대신 `data-config-link` 속성을 적절히 부여했는지 확인**
- [ ] 테마 플래시 방지 스크립트가 `<head>` 안에 있는지, `pam-theme` 키와 `'dark'` 기본값을 쓰는지 확인
- [ ] 같은 비주얼 컴포넌트를 직전 포스트와 중복 사용하지 않았는지 확인
- [ ] 고유 CSS를 `<style>` 블록에 선언했고, 공통 CSS와 중복되지 않는지 확인
- [ ] `blog_post.css` 경로가 `/blog/blog_post.css`인지 확인
