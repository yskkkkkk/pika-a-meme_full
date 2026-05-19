# 미션 시스템 (Mission System)

## 개요

스페셜 하트(⚡)를 획득할 수 있는 미션 시스템.  
미션은 **노출 미션**과 **히든 미션** 두 종류로 구분된다.

---

## 미션 종류 정의

### 노출 미션 (Visible Mission)
미션 목록 시트에 항상 표시되는 미션.  
달성 여부에 따라 `active` / `progress` / `done` 상태로 표현된다.

### 히든 미션 (Hidden Mission)
미션 목록에 **미달성 상태에서는 노출되지 않는다.**  
달성한 사용자에 한해 완료 미션으로 목록에 노출되며,  
반드시 달성 근거를 제목에 명시해 사용자가 지급 이유를 바로 알 수 있게 한다.

> 예시: `#귀여움 테마 미미카드 3개 완성` (참고: 기술적 용어는 '밈'이나 프론트엔드 UI 노출명은 '미미카드'를 사용함)

---

## 초도 미션 목록 (v1 기준)

### 노출 미션

| Mission ID | 제목 | 설명 | 리셋 | 지급 |
|---|---|---|---|---|
| `FIRST_LOGIN` | 최초 로그인 | 회원가입 즉시 완료 | 최초 1회 | ⚡ +1 |
| `SHARE_STORY_FIRST` | 스토리 공유하기 | 완성 카드를 스토리에 공유 | 최초 1회 | ⚡ +1 |
| `SHARE_STORY_WEEKLY` | 스토리 3회 공유 | 한 주에 3번 공유할 때마다 | 매주 월요일 자정 | ⚡ +1 |
| `GALLERY_10` | 갤러리 10개 채우기 | 밈(Meme) 10개 완성 (숨김 포함) | 최초 1회 | ⚡ +1 |
| `GALLERY_30` | 갤러리 30개 채우기 | 밈(Meme) 30개 완성 (숨김 포함) | 최초 1회 | ⚡ +2 |
| `DAILY_VISIT` | 하루 1번 방문 | 매일 앱 방문 | 매일 자정 리셋 | ⚡ +1 |
| `STREAK_3DAYS` | 3일 연속 방문 | 3일 연속 방문 달성 시 지급 후 streak 리셋, 재도전 가능 | 달성 시 리셋 (반복) | ⚡ +1 |

### 히든 미션

| Mission ID 패턴 | 제목 형식 | 조건 | 리셋 | 지급 |
|---|---|---|---|---|
| `HIDDEN_THEME_{TAG}` | `#{태그} 테마 미미카드 3개 완성` | SPECIAL 뽑기로 해당 태그 밈 3개 달성 | 태그별 최초 1회 | ⚡ +1 |

현재 지원 태그 (TagSelectScreen 기준):  
`피곤` / `직장인` / `기쁨` / `주말` / `귀여움` / `분노` / `놀람` / `눈치` / `광기` / `질문` / `의지`

---

## 정책 세부 사항

### 갤러리 카운트 기준
`user_memes` 테이블의 해당 유저 전체 행 수. `enabled = false`(숨김 처리)된 밈도 포함.

### SHARE_STORY_WEEKLY 집계 기준
`mission_share_logs` 에서 ISO 주(week) 기준 집계.  
해당 주 공유 수 / 3 > 해당 주 이미 지급된 횟수 → 지급.  
period_key = ISO week 문자열(`2026-W20`)이므로 별도 스케줄러 없이 자동 주간 리셋.

### STREAK_3DAYS 로직
```
방문 시 mission_visit_streaks 업데이트:
  last_visit_date = 어제  →  current_streak + 1
  last_visit_date = 오늘  →  변경 없음 (이미 카운트됨)
  last_visit_date < 어제  →  current_streak = 1  (단절 리셋)
  last_visit_date = NULL  →  current_streak = 1  (최초)

current_streak == 3:
  → 스페셜 하트 지급
  → current_streak = 0  (다음 사이클 Day 1부터 재시작)
```

### 히든 미션 조건
SPECIAL 뽑기(`selected_tag IS NOT NULL`)로 저장된 `user_memes` 중 해당 `selected_tag` 값이 3개가 되는 시점에 최초 1회 지급.  
일반(BASIC) 뽑기는 카운트에 포함되지 않는다.

---

## 도메인 및 네이밍 규칙

### 패키지 구조
기존 `heart` / `meme` 도메인과 동일한 레이어드 패키지 패턴을 따른다.

```
pam-domain/      com.pickameme.domain.mission
pam-application/ com.pickameme.application.mission
pam-infrastructure/ com.pickameme.infrastructure.mission
pam-api/         com.pickameme.api.mission
```

### DB 테이블명 — `mission_` prefix 통일

| 테이블 | 역할 |
|---|---|
| `mission_definitions` | 미션 정의 (정적 기준 데이터, 코드와 동기화) |
| `mission_completions` | 유저별 달성 이력 |
| `mission_share_logs` | 공유 이벤트 이력 (주간 집계 소스) |
| `mission_visit_streaks` | 유저별 연속 방문 상태 (user당 1행) |

### 도메인 클래스명

| 클래스 | 설명 |
|---|---|
| `Mission` | 미션 정의 |
| `MissionCompletion` | 달성 이력 |
| `MissionShareLog` | 공유 이력 |
| `MissionVisitStreak` | 연속 방문 상태 |
| `MissionType` | enum: `ONE_TIME` / `DAILY` / `WEEKLY_SHARE` / `STREAK_3DAYS` / `HIDDEN` |
| `MissionTrigger` | sealed class: 미션 체크 트리거 진입점 |

---

## 외부 연동 (트리거 포인트)

모든 외부 서비스는 `MissionService.trigger(userId, MissionTrigger)` 단일 메서드로만 호출한다.  
미션 로직이 `MissionService` 안에 캡슐화되어 미션 추가/수정 시 이 파일만 수정하면 된다.

| 트리거 | 발생 위치 | 체크 미션 |
|---|---|---|
| `RegisterTrigger` | `HeartInitializeListener` | `FIRST_LOGIN` |
| `VisitTrigger` | `POST /api/missions/visit` (앱 로드 시 1회) | `DAILY_VISIT`, `STREAK_3DAYS` |
| `ShareTrigger` | `POST /api/missions/share` (공유 완료 후) | `SHARE_STORY_FIRST`, `SHARE_STORY_WEEKLY` |
| `MemeSavedTrigger` | `MemeComposeService` (저장 완료 후) | `GALLERY_10`, `GALLERY_30`, `HIDDEN_THEME_{TAG}` |

---

## API

```
GET  /api/missions          미션 목록 + 개인 달성 상태 (로그인 필수)
POST /api/missions/visit    방문 기록 (앱 로드 시 프론트 1회 호출)
POST /api/missions/share    공유 완료 보고
```

### GET /api/missions 응답 규칙
- 비히든 미션: 달성 여부 무관 항상 포함
- 히든 미션: **미달성 → 응답에서 제외 / 달성 → 포함** (title에 달성 근거 명시)
