'use client'

import { useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialized = useRef(false)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
    if (!initialized.current) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
        capture_pageview: false,       // 수동 트리거 사용
        capture_pageleave: true,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '*[data-ph-mask="true"]',
          sampleRate: 0.1, // 10% 유저만 녹화 (Vercel Egress 절감)
        },
        loaded: (ph) => {
          if (process.env.NODE_ENV === 'development') ph.debug()
        },
      })
      initialized.current = true
    }
  }, [])

  useEffect(() => {
    // next/navigation 훅은 초기 렌더링 이후 hydration 단계나 라우트 변경 시에 동작합니다.
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '')
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  )
}
