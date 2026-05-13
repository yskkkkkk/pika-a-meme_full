"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { MemeCanvasCard } from "@/components/domains/meme/MemeCanvasCard";

interface RecentMeme {
  id: string;
  imageUrl: string;
  subjectPosition: string;
  phraseText: string;
}

export function RecentMemeCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  const { data: memes = [] } = useQuery({
    queryKey: ["recent-matched-memes"],
    queryFn: async () => {
      const res = await apiFetch<RecentMeme[]>("/api/memes/recent-matched?size=10");
      if (!res?.success) throw new Error(res?.error?.message ?? "최근 미미카드 조회 실패");
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 컨테이너가 항상 렌더되므로 deps [] 가능
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setCardWidth((el.offsetWidth - 8) / 2);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 실제 데이터가 있을 때만 마퀴 실행
  useEffect(() => {
    const track = trackRef.current;
    if (!track || cardWidth === 0 || memes.length === 0) return;
    let frame: number;
    let offset = 0;

    const step = () => {
      offset += 0.5;
      const halfWidth = track.scrollWidth / 2;
      if (offset >= halfWidth) offset -= halfWidth;
      track.style.transform = `translateX(-${offset}px)`;
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [cardWidth, memes.length]);

  const cardStyle = {
    width: cardWidth > 0 ? cardWidth : "calc(50% - 4px)" as const,
  };

  // 로딩 중: 실제 카드와 동일한 크기/모양의 스켈레톤 2개
  if (memes.length === 0) {
    return (
      <div ref={containerRef} className="w-full overflow-hidden">
        <div className="flex" style={{ gap: 8 }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 animate-pulse"
              style={{ ...cardStyle, aspectRatio: "1", borderRadius: 24, backgroundColor: "var(--pam-surface)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  const loopMemes = memes.length < 4
    ? [...memes, ...memes, ...memes, ...memes]
    : [...memes, ...memes];

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div ref={trackRef} className="flex" style={{ gap: 8 }}>
        {loopMemes.map((meme, i) => (
          <div key={`${meme.id}-${i}`} className="flex-shrink-0" style={cardStyle}>
            <MemeCanvasCard
              imageUrl={meme.imageUrl}
              subjectPosition={meme.subjectPosition}
              phrase={meme.phraseText}
              seed={meme.id}
              showBrandBar={false}
              imageAlt="최근 완성 미미카드"
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

