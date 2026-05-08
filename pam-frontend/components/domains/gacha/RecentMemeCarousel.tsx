"use client";

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
  const { data: memes = [] } = useQuery({
    queryKey: ["recent-matched-memes"],
    queryFn: async () => {
      const res = await apiFetch<RecentMeme[]>("/api/memes/recent-matched?size=10");
      if (!res?.success) throw new Error(res?.error?.message ?? "최근 밈 조회 실패");
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (memes.length === 0) {
    return <PreviewFallback />;
  }

  // 카드 수가 적으면 무한 루프를 위해 최소 4개 이상 되도록 복제
  const loopMemes = memes.length < 4
    ? [...memes, ...memes, ...memes, ...memes]
    : [...memes, ...memes];

  return (
    <div className="w-full overflow-hidden rounded-2xl">
      <div className="flex animate-marquee" style={{ gap: 8 }}>
        {loopMemes.map((meme, i) => (
          <div key={`${meme.id}-${i}`} className="flex-shrink-0" style={{ width: "calc(50% - 4px)" }}>
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
