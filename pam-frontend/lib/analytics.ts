import posthog from 'posthog-js'

// 퍼널 이벤트 타입 정의 (오타 방지 및 타입 안전성)
export type AnalyticsEvent =
  | { event: 'login_menu_open' }
  | { event: 'login_success'; userId: string; provider: 'kakao' | 'google' }
  | { event: 'gacha_started'; type: 'BASIC' | 'SPECIAL' }
  | { event: 'gacha_failed'; reason: 'insufficient_heart' | 'network' | 'server' | 'timeout' | 'unknown' }
  | { event: 'tag_selected'; tag_name: string }
  | { event: 'result_viewed'; heart_type: 'BASIC' | 'SPECIAL' }
  | { event: 'meme_saved' }
  | { event: 'meme_shared'; share_platform?: 'file' | 'url' | 'clipboard' | 'unknown' }

/**
 * PostHog 커스텀 이벤트 전송
 */
export function captureEvent(payload: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  const { event, ...props } = payload
  posthog.capture(event, props)
}

/**
 * 로그인 완료 시 호출 → 익명 세션과 로그인 세션 연결
 */
export function identifyUser(userId: string, provider: string) {
  if (typeof window === 'undefined') return;
  posthog.identify(userId, { provider })
}

/**
 * 로그아웃 시 호출 → 세션 분리
 */
export function resetUser() {
  if (typeof window === 'undefined') return;
  posthog.reset()
}
