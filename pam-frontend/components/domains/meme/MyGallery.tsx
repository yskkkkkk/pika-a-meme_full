"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EyeOff, ImageIcon, Star, Heart, Clock } from "lucide-react";

interface MemeItem {
  id: string;
  imageUrl: string;
  subjectPosition: string;
  phraseText: string;
  heartType: string;
  selectedTag: string | null;
  createdAt: string;
  enabled: boolean;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        on ? "bg-gray-700" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function MemeCard({ meme, dimmed }: { meme: MemeItem; dimmed?: boolean }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/my/${meme.id}`}
      className={`group relative block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
        dimmed ? "opacity-40" : ""
      }`}
      aria-label="내 밈 상세 보기"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-gray-300" />
          </div>
        ) : (
          <img
            src={meme.imageUrl}
            alt="meme"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {meme.heartType === "SPECIAL" ? (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-white text-xs font-black rounded-full shadow">
              <Star className="w-3 h-3 fill-white" /> SPECIAL
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500 text-white text-xs font-black rounded-full shadow">
              <Heart className="w-3 h-3 fill-white" /> BASIC
            </span>
          )}
          {dimmed && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-white text-xs font-black rounded-full shadow">
              <EyeOff className="w-3 h-3" /> 숨김
            </span>
          )}
        </div>
      </div>
      <div className="px-3 py-2 flex items-center justify-between gap-2 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>{timeAgo(meme.createdAt)}</span>
        </span>
        <span className="font-bold text-gray-300 group-hover:text-gray-500 transition-colors">상세 보기</span>
      </div>
    </Link>
  );
}

export function MyGallery() {
  const [page, setPage] = useState(0);
  const [allMemes, setAllMemes] = useState<MemeItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const PAGE_SIZE = 20;

  const { isFetching, isError } = useQuery({
    queryKey: ["my-memes", page, showAll],
    queryFn: async () => {
      const url = `/api/memes/my-history?page=${page}&size=${PAGE_SIZE}${showAll ? "&includeHidden=true" : ""}`;
      const res = await apiFetch<MemeItem[]>(url);
      if (!res || !res.success) throw new Error(res?.error?.message ?? "조회 실패");
      const data = res.data ?? [];
      if (data.length > 0) {
        setAllMemes((prev) => (page === 0 ? data : [...prev, ...data]));
      }
      return data;
    },
    staleTime: 0,
  });

  function handleToggle() {
    setPage(0);
    setAllMemes([]);
    setShowAll((v) => !v);
  }

  const hasMore = allMemes.length === (page + 1) * PAGE_SIZE;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2.5">
        <span className="text-xs font-bold text-gray-400">모든 결과물 보기</span>
        <Toggle on={showAll} onToggle={handleToggle} />
      </div>

      {!isFetching && !isError && allMemes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
          <div className="text-6xl">🖼️</div>
          <p className="text-lg font-bold">아직 뽑은 밈이 없어요</p>
          <p className="text-sm">첫 번째 밈을 뽑아보세요!</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {allMemes.map((meme) => (
          <MemeCard key={meme.id} meme={meme} dimmed={showAll && !meme.enabled} />
        ))}
        {isFetching &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          ))}
      </div>

      {isError && (
        <p className="text-center text-sm text-red-400 font-medium">갤러리를 불러오는 데 실패했습니다.</p>
      )}

      {!isFetching && hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-8 py-3 bg-black text-white font-black rounded-full hover:bg-gray-800 active:scale-95 transition-all text-sm"
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
}
