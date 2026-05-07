"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Heart, ImageIcon, Star, Tag } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { MemeCanvasCard } from "@/components/domains/meme/MemeCanvasCard";

interface MemeDetail {
  id: string;
  imageUrl: string;
  subjectPosition: string;
  phraseText: string;
  heartType: "BASIC" | "SPECIAL" | string;
  selectedTag: string | null;
  createdAt: string;
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function MyMemeDetailPage() {
  const { isLoggedIn, isLoaded } = useAuth();
  const router = useRouter();
  const params = useParams<{ memeId: string }>();
  const memeId = params.memeId;

  useEffect(() => {
    if (isLoaded && !isLoggedIn) {
      router.replace("/");
    }
  }, [isLoaded, isLoggedIn, router]);

  const { data: meme, isFetching, isError } = useQuery({
    queryKey: ["my-meme", memeId],
    queryFn: async () => {
      const res = await apiFetch<MemeDetail>(`/api/memes/my-history/${memeId}`);
      if (!res || !res.success || !res.data) throw new Error(res?.error?.message ?? "조회 실패");
      return res.data;
    },
    enabled: isLoaded && isLoggedIn && Boolean(memeId),
    staleTime: 30_000,
  });

  if (!isLoaded || !isLoggedIn) return null;

  return (
    <div className="flex flex-col flex-1 bg-white">
      <div
        className="flex items-center gap-3 border-b border-gray-100"
        style={{ padding: "14px 16px" }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center bg-gray-100 rounded-full active:scale-95 transition-transform"
          style={{ width: 36, height: 36 }}
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div>
          <h1 className="font-black text-[#111]" style={{ fontSize: 18 }}>
            내 밈 상세
          </h1>
          <p className="text-xs text-gray-400 font-bold">말풍선까지 완성된 형태로 보기</p>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto" style={{ padding: "20px 16px 32px" }}>
        {isFetching && (
          <div className="aspect-square bg-gray-100 rounded-[24px] animate-pulse" />
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
            <ImageIcon className="w-12 h-12 text-gray-300" />
            <p className="text-lg font-bold">밈을 불러오지 못했어요</p>
            <button
              onClick={() => router.push("/my")}
              className="px-6 py-3 bg-black text-white font-black rounded-full active:scale-95 transition-transform text-sm"
            >
              갤러리로 돌아가기
            </button>
          </div>
        )}

        {meme && (
          <div className="space-y-5">
            <MemeCanvasCard
              imageUrl={meme.imageUrl}
              subjectPosition={meme.subjectPosition}
              phrase={meme.phraseText}
              seed={meme.id}
              imageAlt="내 밈 상세 이미지"
              className="w-full"
            />

            <div className="bg-gray-50 rounded-3xl p-5 space-y-4">
              <p className="font-black text-[#111] leading-relaxed" style={{ fontSize: 20 }}>
                “{meme.phraseText}”
              </p>

              <div className="flex flex-wrap gap-2">
                {meme.heartType === "SPECIAL" ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-white text-xs font-black rounded-full shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-white" /> SPECIAL
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-pink-500 text-white text-xs font-black rounded-full shadow-sm">
                    <Heart className="w-3.5 h-3.5 fill-white" /> BASIC
                  </span>
                )}

                {meme.selectedTag && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-black rounded-full">
                    <Tag className="w-3.5 h-3.5" /> {meme.selectedTag}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDateTime(meme.createdAt)} 생성</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
