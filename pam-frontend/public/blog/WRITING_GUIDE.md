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
├── blog_post.css       ← 공통 CSS + 테마 변수 (모든 포스트가 공유)
├── theme.js            ← 테마 전환 로직 (applyTheme 함수 정의)
└── WRITING_GUIDE.md    ← 이 파일
```

- 파일명: `post{n}.html` 형식. 번호는 건너뛰지 않는다.
- 모든 파일은 `pam-frontend/public/blog/` 아래에 위치한다.
- **pet-pass와 달리** `/style.css`, `/theme.js` 같은 외부 앱 파일에 의존하지 않는다.
  - CSS 변수는 `blog_post.css` 안에 모두 정의되어 있다.
  - 테마 로직은 `/blog/theme.js`를 사용한다.

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

  <header class="blog-header glass">
    <h1>🎰 pick-a-meme Dev Blog</h1>
    <div class="theme-dots">
      <button class="theme-dot" data-t="dark"  onclick="applyTheme('dark')"  title="다크"  style="background:#1e1e30;"></button>
      <button class="theme-dot" data-t="light" onclick="applyTheme('light')" title="라이트" style="background:#ede9fe;"></button>
      <button class="theme-dot" data-t="neon"  onclick="applyTheme('neon')"  title="네온"  style="background:#00ff88;"></button>
    </div>
  </header>

  <div class="nav-buttons">
    <a href="/blog" class="btn-nav">← 목록으로</a>
    <a href="/" class="btn-nav">🏠 메인으로</a>
  </div>

  <main class="blog-content glass">
    <!-- 콘텐츠 -->
  </main>

  <script src="/blog/theme.js"></script>

</body>
</html>
```

**절대 빠뜨리면 안 되는 것:**
- `<head>` 내 테마 플래시 방지 인라인 스크립트 (`pam-theme` 키, 기본값 `'dark'`)
- `<body>` 끝의 `<script src="/blog/theme.js"></script>`
- `.blog-header` 안의 테마 도트 버튼 3개 (dark / light / neon)
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
    <span class="read-time">📖 약 {N}분</span>
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

  <!-- 6. 포스트 푸터 (이전/다음 글 네비게이션) -->
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

**기본 원칙:**
- 1인칭, 개인적 어투로 쓴다. ("솔직히 말하면", "생각보다 복잡했다" 등)
- 기술 용어는 풀어서 설명하되, 지나치게 친절하게 설명하는 티를 내지 않는다.
- 각 포스트는 **하나의 경험/이슈**에 집중한다. 여러 주제를 한 포스트에 욱여넣지 않는다.
- 포스트 마지막에는 항상 그 경험에서 배운 것을 `.lesson-box`로 요약한다.

**구조 공식 (거의 모든 포스트에 적용):**
```
문제/상황 발생 → 시도들 (실패 포함) → 결말/해결 → 배운 것
```

**금지 표현:**
- "~하는 방법을 알아보겠습니다" (블로그 말투 X)
- "결론적으로 말씀드리면" (격식체 X)
- 과도한 경어체 (이 블로그는 반말에 가까운 서술체)

---

## 7. 비주얼 컴포넌트 목록

공통 CSS(`blog_post.css`)에 정의된 컴포넌트는 어떤 포스트에서도 바로 사용 가능하다.  
포스트 고유 컴포넌트는 해당 포스트의 `<style>` 블록에 선언한다.

### 7-1. 공통 컴포넌트 (blog_post.css에 있음)

| 컴포넌트 | 클래스 | 용도 |
|---|---|---|
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
| 코드 블록 | post2 | `.code-block` + 신택스 하이라이트 스팬 |
| 하트 비교 카드 | post3 | `.heart-compare`, `.heart-col`, `.heart-col-header[.basic/.special]` |
| 흐름 박스 | post3 | `.flow-box`, `.flow-step`, `.flow-num` — 순서 있는 흐름 설명 |
| 시리즈 예고 | post1 | `.series-preview` — 다음 글 예고 목록 |

### 7-3. 컴포넌트 선택 규칙

- **같은 컴포넌트를 연속된 두 포스트에서 반복하지 않는다.**
- 텍스트만 이어지는 구간이 길어지면 비주얼 컴포넌트를 하나 삽입해 리듬을 끊는다.
- 새 컴포넌트를 만들 때는 이 목록(7-2)에 추가한다.
- 향후 새로 만들 수 있는 컴포넌트 예시:
  - 비교 표 (before/after 2열)
  - API 요청/응답 스니펫
  - 가챠 확률 시각화
  - 사용자 플로우 다이어그램

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

- `.blog-post-date`에는 날짜 대신 시리즈 카테고리를 넣는다.
- 요약문은 "~했습니다" 체가 아니라 "~했다" 체로 끝낸다.
- 카드 순서는 최신 글이 위로 온다.

---

## 10. CSS 구조 원칙

### 공통 CSS (`blog_post.css`)

이 파일에는 **CSS 테마 변수 선언**이 포함되어 있다. pet-pass와 달리 외부 `/style.css`에 의존하지 않으므로,  
이 파일 하나가 변수 정의부터 레이아웃까지 모든 것을 담당한다.

이 파일을 수정하면 전체 포스트에 영향을 주므로 주의한다.

주요 포함 항목:
- `:root`, `[data-theme="light"]`, `[data-theme="neon"]` CSS 변수
- `.glass`, `body`, `.blog-header`, `.nav-buttons`, `.btn-nav`
- `.blog-content`, `.post-meta`, `.post-series-tag`, `.read-time`
- `.post-main-title`, `.post-tags`, `.tag-chip`
- `.toc`, `.toc-title`
- `.blog-content h2/p/strong/code`
- `.highlight-box`, `.lesson-box`, `.divider`
- `.timeline`, `.timeline-item`, `.timeline-label`
- `.stats-grid`, `.stat-card`
- `.post-footer`, `.btn-post-nav`, `.btn-prev`, `.btn-next`
- 반응형 미디어 쿼리

### 포스트 고유 CSS (`<style>` 블록)

해당 포스트에서만 사용하는 비주얼 컴포넌트 CSS만 선언한다.  
공통 CSS에 이미 있는 클래스를 중복 선언하지 않는다.

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
- [ ] `<script src="/blog/theme.js"></script>`가 `</body>` 직전에 있는지 확인
- [ ] 테마 플래시 방지 스크립트가 `<head>` 안에 있는지, `pam-theme` 키와 `'dark'` 기본값을 쓰는지 확인
- [ ] 헤더 타이틀이 `🎰 pick-a-meme Dev Blog`인지, 테마 도트가 dark/light/neon 순서인지 확인
- [ ] 같은 비주얼 컴포넌트를 직전 포스트와 중복 사용하지 않았는지 확인
- [ ] 고유 CSS를 `<style>` 블록에 선언했고, 공통 CSS와 중복되지 않는지 확인
- [ ] `blog_post.css` 경로가 `/blog/blog_post.css`인지 확인 (pet-pass의 `/blog/blog_post.css`와 동일하나 `/style.css` 참조가 없어야 함)
