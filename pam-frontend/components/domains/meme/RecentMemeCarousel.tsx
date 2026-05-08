"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { MemeCanvasCard } from "@/components/domains/meme/MemeCanvasCard";

const FALLBACK_MEMES = [
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

function FallbackPreview() {
  return (
    <div className="flex w-full" style={{ gap: 8 }}>
      {FALLBACK_MEMES.map((meme) => (
        <div
          key={meme.id}
          className="flex-1 overflow-hidden relative"
          style={{ aspectRatio: "1", borderRadius: 16 }}
        >
          <div className="absolute inset-0" style={{ background: meme.bg }} />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize: 34, opacity: 0.85 }}
          >
            {meme.animal}
          </div>
          <div
            className="absolute inset-0 flex items-end"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)",
              padding: 7,
            }}
          >
            <p
              className="text-white font-black leading-tight"
              style={{ fontSize: 10, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
            >
              {meme.phrase}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentMemeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data: memes = [] } = useQuery({
    queryKey: ["recent-matched-memes"],
    queryFn: async () => {
      const res = await apiFetch<RecentMeme[]>("/api/memes/recent-matched?size=10");
      if (!res?.success) return [];
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isPaused || memes.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % memes.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [isPaused, memes.length]);

  useEffect(() => {
    if (currentIndex >= memes.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, memes.length]);

  if (memes.length === 0) {
    return <FallbackPreview />;
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "3 / 1", borderRadius: 16 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {memes.map((meme) => (
          <div key={meme.id} className="w-full h-full flex-shrink-0 flex items-center justify-center">
            <div className="h-full aspect-square">
              <MemeCanvasCard
                imageUrl={meme.imageUrl}
                subjectPosition={meme.subjectPosition}
                phrase={meme.phraseText}
                seed={meme.id}
                imageAlt="최근 완성 밈"
                className="w-full h-full"
              />
            </div>
          </div>
        ))}
      </div>

      {memes.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center" style={{ gap: 5 }}>
          {memes.map((meme, index) => (
            <button
              key={meme.id}
              onClick={() => setCurrentIndex(index)}
              className="transition-all"
              style={{
                width: currentIndex === index ? 14 : 5,
                height: 5,
                borderRadius: 9999,
                background: currentIndex === index ? "#fff" : "rgba(255,255,255,0.45)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              }}
              aria-label={`${index + 1}번째 최근 밈 보기`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
