"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { EyeOff, Heart, Clock } from "lucide-react";
import { MemeCanvasCard } from "@/components/domains/meme/MemeCanvasCard";

interface MemeItem {
  id: string;
  imageUrl: string;
  subjectPosition: string;
  phraseText: string;
  heartType: string;
  selectedTag: string | null;
  matchedTags: string[];
  createdAt: string;
  enabled: boolean;
}

type ViewMode = "all" | "matched" | "special";

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
  return (
    <Link
      href={`/my/${meme.id}`}
      className={`group block hover:-translate-y-1 transition-all duration-300 ${dimmed ? "opacity-40" : ""}`}
      aria-label="내 밈 상세 보기"
    >
      {/* 이미지 + 말풍선 */}
      <div className="relative">
        <MemeCanvasCard
          imageUrl={meme.imageUrl}
          subjectPosition={meme.subjectPosition}
          phrase={meme.phraseText}
          seed={meme.id}
          showBrandBar={false}
          imageAlt="내 밈"
          className="w-full"
        />
        {/* 숨김 뱃지만 이미지 오버레이에 유지 */}
        {dimmed && (
          <div className="absolute top-2 right-2 z-20">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-white text-xs font-black rounded-full shadow">
              <EyeOff className="w-3 h-3" /> 숨김
            </span>
          </div>
        )}
      </div>

      {/* 하단 정보: [BASIC/SPECIAL] [#태그] [날짜] */}
      <div className="px-1 pt-1.5 pb-1 flex items-center gap-2">
        {meme.heartType === "SPECIAL" ? (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-white text-[10px] font-black rounded-full"
            style={{ background: "linear-gradient(135deg,#C44DFF,#FF6B9D)" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            SPECIAL
          </span>
        ) : (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-white text-[10px] font-black rounded-full"
            style={{ background: "#FF6B9D" }}
          >
            <Heart className="w-2.5 h-2.5 fill-white" /> BASIC
          </span>
        )}
        {meme.matchedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meme.matchedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-[3px] text-[10px] font-bold rounded-full"
                style={{ padding: "3px 8px 3px 6px", background: "#FFF0F5", color: "#FF6B9D", border: "1px solid #FFD6E7" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                {tag}
              </span>
            ))}
          </div>
        )}
        <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-400 font-bold">
          <Clock className="w-3 h-3" />
          {timeAgo(meme.createdAt)}
        </span>
      </div>
    </Link>
  );
}

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: "all", label: "최신순" },
  { key: "matched", label: "태그 매칭" },
  { key: "special", label: "SPECIAL" },
];

export function MyGallery() {
  const [page, setPage] = useState(0);
  const [allMemes, setAllMemes] = useState<MemeItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
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

  const displayMemes = useMemo(() => {
    if (viewMode === "special") return allMemes.filter((m) => m.heartType === "SPECIAL");
    if (viewMode === "matched") {
      return [...allMemes].sort((a, b) => {
        if (b.matchedTags.length !== a.matchedTags.length) return b.matchedTags.length - a.matchedTags.length;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return allMemes;
  }, [allMemes, viewMode]);

  function handleToggle() {
    setPage(0);
    setAllMemes([]);
    setShowAll((v) => !v);
  }

  function handleViewMode(mode: ViewMode) {
    setViewMode(mode);
  }

  const hasMore = allMemes.length === (page + 1) * PAGE_SIZE;

  return (
    <div className="space-y-4">
      {/* 헤더: 총 개수 + 숨김 토글 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-gray-400">
          {allMemes.length > 0 && `총 ${allMemes.length}개`}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-gray-400">모든 결과물 보기</span>
          <Toggle on={showAll} onToggle={handleToggle} />
        </div>
      </div>

      {/* 필터/정렬 탭 */}
      <div className="flex flex-nowrap gap-[5px]">
        {VIEW_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleViewMode(key)}
            className="px-[15px] py-2 text-xs font-black rounded-full whitespace-nowrap transition-all"
            style={{
              background: viewMode === key ? "#FF6B9D" : "#ece7f5",
              color: viewMode === key ? "white" : "#bbb",
              border: "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {!isFetching && !isError && displayMemes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
          <div className="text-6xl">🖼️</div>
          <p className="text-lg font-bold">
            {allMemes.length === 0 ? "아직 뽑은 밈이 없어요" : "해당하는 밈이 없어요"}
          </p>
          {allMemes.length === 0 && <p className="text-sm">첫 번째 밈을 뽑아보세요!</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {displayMemes.map((meme) => (
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
