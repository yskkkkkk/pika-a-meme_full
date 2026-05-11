"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { MemeCanvasCard } from "@/components/domains/meme/MemeCanvasCard";

const PREVIEW_MEMES = [
  { id: 1, bg: "linear-gradient(135deg,#2d1b4e,#1a0d2e)", animal: "🐱", phrase: "야근 5일차" },
  { id: 2, bg: "linear-gradient(135deg,#1a2d1a,#0d1f0d)", animal: "🐶", phrase: "퇴근 5분 전" },
  { id: 3, bg: "linear-gradient(135deg,#2d1a1a,#1a0d0d)", animal: "🐻", phrase: "월요일 아침" },
];

interface RecentMeme {
  id: string;
  imageUrl: string;
  subjectPosition: string;
  phraseText: string;
}

function PreviewFallback() {
  return (
    <div className="flex w-full" style={{ gap: 8 }}>
      {PREVIEW_MEMES.map((meme) => (
        <div
          key={meme.id}
          className="flex-1 overflow-hidden relative"
          style={{ aspectRatio: "1", borderRadius: 16 }}
        >
          <div className="absolute inset-0" style={{ background: meme.bg }} />
          <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 34, opacity: 0.85 }}>
            {meme.animal}
          </div>
          <div
            className="absolute inset-0 flex items-end"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)", padding: 7 }}
          >
            <p className="text-white font-black leading-tight" style={{ fontSize: 10, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
              {meme.phrase}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentMemeCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  const { data: memes = [] } = useQuery({
    queryKey: ["recent-matched-memes"],
    queryFn: async () => {
      const res = await apiFetch<RecentMeme[]>("/api/memes/recent-matched?size=10");
      if (!res?.success) throw new Error(res?.error?.message ?? "최근 밈 조회 실패");
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 카드 너비를 컨테이너 크기 기반으로 계산 (반응형)
  // memes.length 의존: 초기 렌더 시 PreviewFallback이 표시돼 containerRef가 null이므로 memes 로드 후 재실행 필요
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setCardWidth((el.offsetWidth - 8) / 2); // 2개 + gap 8px
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [memes.length]);

  // requestAnimationFrame 기반 마퀴 (DOM 직접 조작 → 리렌더 없음)
  useEffect(() => {
    const track = trackRef.current;
    if (!track || cardWidth === 0) return;
    let frame: number;
    let offset = 0;

    const step = () => {
      offset += 0.5; // 속도: px/frame (60fps 기준 ~30px/s)
      const halfWidth = track.scrollWidth / 2;
      if (offset >= halfWidth) offset -= halfWidth;
      track.style.transform = `translateX(-${offset}px)`;
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [cardWidth, memes.length]);

  if (memes.length === 0) return <PreviewFallback />;

  // seamless loop를 위해 최소 4개 이상 되도록 복제
  const loopMemes = memes.length < 4
    ? [...memes, ...memes, ...memes, ...memes]
    : [...memes, ...memes];

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div ref={trackRef} className="flex" style={{ gap: 8 }}>
        {loopMemes.map((meme, i) => (
          <div
            key={`${meme.id}-${i}`}
            className="flex-shrink-0"
            style={{ width: cardWidth > 0 ? cardWidth : "calc(50% - 4px)" }}
          >
            <MemeCanvasCard
              imageUrl={meme.imageUrl}
              subjectPosition={meme.subjectPosition}
              phrase={meme.phraseText}
              seed={meme.id}
              showBrandBar={false}
              imageAlt="최근 완성 밈"
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
