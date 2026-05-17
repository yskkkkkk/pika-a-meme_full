"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { saveComposition, PendingMeme } from "@/hooks/useMemeApi";

const PENDING_MEME_TTL_MS = 30 * 60 * 1000; // 30분

function CallbackHandler() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") {
      localStorage.setItem("pam_show_welcome", "1");
    }

    const raw = sessionStorage.getItem("pam_pending_meme");
    sessionStorage.removeItem("pam_pending_meme");

    if (raw) {
      try {
        const pending = JSON.parse(raw) as PendingMeme;
        const elapsed = Date.now() - pending._savedAt;
        if (pending._fromResult && elapsed < PENDING_MEME_TTL_MS) {
          saveComposition(pending)
            .then((memeId) => router.replace(`/my/${memeId}`))
            .catch(() => router.replace("/"));
          return;
        }
      } catch {
        // 파싱 실패 → 홈으로
      }
    }

    router.replace("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-medium" style={{ color: "var(--pam-text-muted)" }}>{t.auth.processingLogin}</p>
      </div>
    </div>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <CallbackHandler />
    </Suspense>
  );
}
