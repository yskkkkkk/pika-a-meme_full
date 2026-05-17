"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ImageIcon, Star, Heart, Clock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface MemeItem {
  id: string;
  userId: string;
  imageUrl: string;
  creationOption: "BASIC" | "SPECIAL";
  heartType: "BASIC" | "SPECIAL";
  createdAt: string;
}

function timeAgo(iso: string, language: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (language === "ko") {
    if (m < 1) return "방금 전";
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
  }
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function MemeCard({ meme }: { meme: MemeItem }) {
  const [imgError, setImgError] = useState(false);
  const { language, t } = useLanguage();

  return (
    <div
      className="group relative rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
      style={{
        backgroundColor: "var(--pam-surface-card)",
        border: "1px solid var(--pam-border)",
        boxShadow: "0 1px 4px var(--pam-shadow-pink)",
      }}
    >
      <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: "var(--pam-surface)" }}>
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10" style={{ color: "var(--pam-text-faint)" }} />
          </div>
        ) : (
          <img
            src={meme.imageUrl}
            alt={t.brand.meme}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute top-2 right-2">
          {meme.heartType === "SPECIAL" ? (
            <span
              className="flex items-center gap-1 px-2 py-0.5 text-xs font-black rounded-full shadow neon-glow-accent"
              style={{
                background: "linear-gradient(135deg, var(--pam-badge-special-from), var(--pam-badge-special-to))",
                color: "var(--pam-badge-special-text)",
              }}
            >
              <Star className="w-3 h-3" style={{ fill: "var(--pam-badge-special-text)" }} /> SPECIAL
            </span>
          ) : (
            <span
              className="flex items-center gap-1 px-2 py-0.5 text-xs font-black rounded-full shadow"
              style={{ backgroundColor: "var(--pam-badge-basic-bg)", color: "var(--pam-badge-basic-text)" }}
            >
              <Heart className="w-3 h-3" style={{ fill: "var(--pam-badge-basic-text)" }} /> BASIC
            </span>
          )}
        </div>
      </div>
      <div className="px-3 py-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--pam-text-muted)" }}>
        <Clock className="w-3 h-3" />
        <span>{timeAgo(meme.createdAt, language)}</span>
      </div>
    </div>
  );
}

export function MemeGallery() {
  const [page, setPage] = useState(0);
  const { t } = useLanguage();
  const [allMemes, setAllMemes] = useState<MemeItem[]>([]);
  const PAGE_SIZE = 20;

  const { isFetching, isError } = useQuery({
    queryKey: ["memes", page],
    queryFn: async () => {
      const res = await apiFetch<MemeItem[]>(`/api/memes?page=${page}&size=${PAGE_SIZE}`);
      const data = res?.data ?? [];
      if (data.length > 0) {
        setAllMemes((prev) => (page === 0 ? data : [...prev, ...data]));
      }
      return data;
    },
    staleTime: 30_000,
  });

  const hasMore = allMemes.length === (page + 1) * PAGE_SIZE;

  if (!isFetching && !isError && allMemes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: "var(--pam-text-muted)" }}>
        <div className="text-6xl">🖼️</div>
        <p className="text-lg font-bold">{t.gallery.noPublicMemes}</p>
        <p className="text-sm">{t.gallery.makeFirstMeme}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allMemes.map((meme) => (
          <MemeCard key={meme.id} meme={meme} />
        ))}
        {isFetching &&
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl animate-pulse" style={{ backgroundColor: "var(--pam-surface)" }} />
          ))}
      </div>

      {isError && (
        <p className="text-center text-sm font-medium" style={{ color: "var(--pam-pink)" }}>{t.gallery.fetchFailed}</p>
      )}

      {!isFetching && hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-8 py-3 font-black rounded-full active:scale-95 transition-all text-sm"
            style={{ backgroundColor: "var(--pam-text)", color: "var(--pam-bg)" }}
          >
            {t.actions.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}
