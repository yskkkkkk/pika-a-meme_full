"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, Download, Eye, EyeOff, Heart, ImageIcon, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { MemeCanvasCard } from "@/components/domains/meme/MemeCanvasCard";

interface MemeDetail {
  id: string;
  imageUrl: string;
  subjectPosition: string;
  phraseText: string;
  heartType: "BASIC" | "SPECIAL" | string;
  matchedTags: string[];
  createdAt: string;
  enabled: boolean;
}

async function captureCard(el: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(el, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    scale: window.devicePixelRatio ?? 2,
  });
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("canvas empty"))),
      "image/jpeg",
      0.92
    )
  );
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
  const queryClient = useQueryClient();
  const cardRef = useRef<HTMLDivElement>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (isLoaded && !isLoggedIn) router.replace("/");
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

  const visibilityMutation = useMutation({
    mutationFn: async (nextEnabled: boolean) => {
      const res = await apiFetch(`/api/memes/my-history/${memeId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      if (!res?.success) throw new Error("변경 실패");
      return nextEnabled;
    },
    onSuccess: (nextEnabled) => {
      queryClient.setQueryData(["my-meme", memeId], (old: MemeDetail | undefined) =>
        old ? { ...old, enabled: nextEnabled } : old
      );
      queryClient.invalidateQueries({ queryKey: ["my-memes"] });
      showToast(nextEnabled ? "갤러리에 다시 표시됩니다" : "갤러리에서 숨겼어요");
    },
  });

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }

  async function handleSave() {
    if (!cardRef.current || !meme || isSaving) return;
    setIsSaving(true);
    try {
      const blob = await captureCard(cardRef.current);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pika-meme-${meme.id.slice(0, 8)}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("이미지가 저장되었어요");
    } catch {
      showToast("저장에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleShare() {
    if (!cardRef.current || !meme || isSharing) return;
    setIsSharing(true);
    try {
      const blob = await captureCard(cardRef.current);
      const file = new File([blob], "pika-meme.jpg", { type: "image/jpeg" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "PICK-A-MEME", text: meme.phraseText });
      } else if (navigator.share) {
        await navigator.share({ title: "PICK-A-MEME", text: meme.phraseText, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("링크가 복사되었어요");
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") showToast("공유에 실패했습니다");
    } finally {
      setIsSharing(false);
    }
  }

  if (!isLoaded || !isLoggedIn) return null;

  return (
    <div className="flex flex-col flex-1 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100" style={{ padding: "14px 16px" }}>
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center bg-gray-100 rounded-full active:scale-95 transition-transform"
          style={{ width: 36, height: 36 }}
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div>
          <h1 className="font-black text-[#111]" style={{ fontSize: 18 }}>내 밈 상세</h1>
          <p className="text-xs text-gray-400 font-bold">말풍선까지 완성된 형태로 보기</p>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto" style={{ padding: "20px 16px 32px" }}>
        {isFetching && <div className="aspect-square bg-gray-100 rounded-[24px] animate-pulse" />}

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
          <div className="space-y-4">
            {/* 이미지 카드 (html2canvas 캡처 대상) + 태그 오버레이 */}
            <div className="relative">
              <MemeCanvasCard
                ref={cardRef}
                imageUrl={meme.imageUrl}
                subjectPosition={meme.subjectPosition}
                phrase={meme.phraseText}
                seed={meme.id}
                imageAlt="내 밈 상세 이미지"
                className="w-full"
              />
              {meme.matchedTags.length > 0 && (
                <div className="absolute bottom-14 right-3 flex flex-col items-end gap-1 z-20">
                  {meme.matchedTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 저장 / 공유 버튼 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black text-white font-black text-sm active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isSaving ? "저장 중..." : "저장하기"}
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#FF6B9D,#C44DFF)", color: "white" }}
              >
                <Share2 className="w-4 h-4" />
                {isSharing ? "공유 중..." : "공유하기"}
              </button>
            </div>

            {/* 정보 카드 */}
            <div className="bg-gray-50 rounded-3xl p-5 space-y-4">
              <p className="font-black text-[#111] leading-relaxed" style={{ fontSize: 20 }}>
                "{meme.phraseText}"
              </p>

              {/* 뱃지들 */}
              <div className="flex flex-wrap gap-2">
                {meme.heartType === "SPECIAL" ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-white text-xs font-black rounded-full shadow-sm"
                    style={{ background: "linear-gradient(135deg,#C44DFF,#FF6B9D)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    SPECIAL
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-white text-xs font-black rounded-full shadow-sm"
                    style={{ background: "#FF6B9D" }}
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" /> BASIC
                  </span>
                )}
                {meme.matchedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-[3px] text-xs font-bold rounded-full"
                    style={{ padding: "4px 10px 4px 8px", background: "#FFF0F5", color: "#FF6B9D", border: "1px solid #FFD6E7" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    {tag}
                  </span>
                ))}
              </div>

              {/* 생성일 */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDateTime(meme.createdAt)} 생성</span>
              </div>
            </div>

            {/* 숨기기 버튼 */}
            <button
              onClick={() => visibilityMutation.mutate(!meme.enabled)}
              disabled={visibilityMutation.isPending}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] disabled:opacity-50 ${
                meme.enabled
                  ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {meme.enabled ? (
                <><EyeOff className="w-4 h-4" /> 갤러리에서 숨기기</>
              ) : (
                <><Eye className="w-4 h-4" /> 갤러리에 다시 표시하기</>
              )}
            </button>
          </div>
        )}
      </div>

      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 bg-gray-900 text-white text-sm font-bold rounded-2xl shadow-xl animate-fade-in z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
