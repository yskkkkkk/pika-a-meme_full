"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MemeResult } from "@/hooks/useMemeApi";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { recordShare } from "@/hooks/useMissions";
import { MemeCanvasCard } from "@/components/domains/meme/MemeCanvasCard";
import { ShareTemplate } from "@/components/domains/gacha/ShareTemplate";
import { captureElement, saveImage } from "@/lib/imageSave";
import { captureEvent } from "@/lib/analytics";
import api from "@/lib/axios";

// SVG 아이콘 컴포넌트
function IconHome() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

interface Props {
  result: MemeResult;
  heartType: 'BASIC' | 'SPECIAL';
  selectedTag?: string;
  onRedraw: () => void;
  onHome: () => void;
  onLoginClick: () => void;
}

export function ResultScreen({ result, heartType, selectedTag, onRedraw, onHome, onLoginClick }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shareTemplateRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [confirmingRedraw, setConfirmingRedraw] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const { isLoggedIn, isLoaded } = useAuth();
  const { t } = useLanguage();
  const { toastMsg, showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    captureEvent({ event: 'result_viewed', heart_type: heartType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoaded || isLoggedIn) return;
    const timer = setTimeout(() => setShowNudge(true), 2000);
    return () => clearTimeout(timer);
  }, [isLoaded, isLoggedIn]);

  const handleLoginNudge = () => {
    if (result.imageId && result.phraseId) {
      sessionStorage.setItem('pam_pending_meme', JSON.stringify({
        imagePresignedUrl: result.imagePresignedUrl,
        subjectPosition: result.subjectPosition,
        phrase: result.phrase,
        imageId: result.imageId,
        phraseId: result.phraseId,
        heartType,
        selectedTag,
        _savedAt: Date.now(),
        _fromResult: true as const,
      }));
    }
    onLoginClick();
  };

  const handleSave = async () => {
    if (!isLoggedIn) return;
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const blob = await captureElement(cardRef.current, "image/jpeg", 0.92);
      await saveImage(blob, "pick-a-meme.jpg");
      captureEvent({ event: 'meme_saved' });
      showToast(t.toast.imageSaved);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      // 캡처 실패 시 원본 이미지 URL로 fallback 다운로드
      try {
        const a = document.createElement("a");
        a.href = result.imagePresignedUrl;
        a.download = "pick-a-meme.jpg";
        a.target = "_blank";
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        captureEvent({ event: 'meme_saved' });
        showToast(t.toast.imageSaved);
      } catch {
        showToast(t.errors.saveFailed);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!shareTemplateRef.current || sharing) return;
    setSharing(true);
    try {
      // 1. 1:1 비율 공유 템플릿(ShareTemplate) 캡처 (파일 공유 및 OG 이미지용)
      const blob = await captureElement(shareTemplateRef.current, "image/jpeg", 0.92);
      const file = new File([blob], "pick-a-meme.jpg", { type: "image/jpeg" });

      let shareUrl = window.location.origin;

      // 2. 로그인 유저 && DB에 저장된 밈(memeId 존재)인 경우 R2 지연 업로드
      if (isLoggedIn && result.memeId) {
        try {
          const formData = new FormData();
          formData.append("file", blob, "og.jpg");
          await api.post(`/api/memes/${result.memeId}/og-image`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          shareUrl = `${window.location.origin}/share/${result.memeId}`;
        } catch (uploadError) {
          console.error("OG 이미지 지연 업로드 실패:", uploadError);
          // 실패해도 본래 공유 로직은 fallback URL로 진행
        }
      }

      // 3. 네이티브 공유 트리거
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "PICK-A-MEME", text: result.phrase, url: shareUrl });
        captureEvent({ event: 'meme_shared', share_platform: 'file' });
        recordShare("OTHER");
      } else if (navigator.share) {
        await navigator.share({ title: "PICK-A-MEME", text: result.phrase, url: shareUrl });
        captureEvent({ event: 'meme_shared', share_platform: 'url' });
        recordShare("OTHER");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        captureEvent({ event: 'meme_shared', share_platform: 'clipboard' });
        showToast(t.toast.linkCopied);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      
      const fallbackUrl = isLoggedIn && result.memeId ? `${window.location.origin}/share/${result.memeId}` : window.location.origin;
      try {
        if (navigator.share) {
          await navigator.share({ title: "PICK-A-MEME", text: result.phrase, url: fallbackUrl });
          captureEvent({ event: 'meme_shared', share_platform: 'url' });
          recordShare("OTHER");
        } else {
          await navigator.clipboard.writeText(fallbackUrl);
          captureEvent({ event: 'meme_shared', share_platform: 'clipboard' });
          showToast(t.toast.linkCopied);
        }
      } catch {
        showToast(t.errors.shareFailed);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col items-center w-full animate-in zoom-in-95 duration-500"
      style={{ padding: "12px 24px 24px", gap: 12 }}
    >
      <MemeCanvasCard
        ref={cardRef}
        imageUrl={result.imagePresignedUrl}
        subjectPosition={result.subjectPosition}
        phrase={result.phrase}
        imageAlt={t.result.resultAlt}
        className="w-full overflow-hidden relative flex-shrink-0"
      />

      {/* 2×2 버튼 그리드 */}
      <div className="grid grid-cols-2 w-full" style={{ gap: 8 }}>

        {/* 상단 좌: 홈 or 취소 */}
        {confirmingRedraw ? (
          <button
            onClick={() => setConfirmingRedraw(false)}
            className="font-black active:scale-95 transition-all flex items-center justify-center"
            style={{
              gap: 6, padding: 15, borderRadius: 16, fontSize: 14, border: "1.5px solid var(--pam-border)",
              backgroundColor: "var(--pam-surface)", color: "var(--pam-text-muted)",
            }}
          >
            {t.common.cancel}
          </button>
        ) : (
          <button
            onClick={onHome}
            className="font-black active:scale-95 transition-all flex items-center justify-center"
            style={{
              gap: 6, padding: 15, borderRadius: 16, fontSize: 14,
              backgroundColor: "var(--pam-btn-home-bg)",
              border: "1.5px solid var(--pam-btn-home-border)",
              color: "var(--pam-btn-home-text)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <IconHome />
            {t.actions.home}
          </button>
        )}

        {/* 상단 우: 다시뽑기 or 뽑기! */}
        {confirmingRedraw ? (
          <button
            onClick={() => { setConfirmingRedraw(false); onRedraw(); }}
            className="font-black active:scale-95 transition-all text-white flex items-center justify-center"
            style={{
              gap: 6, padding: 15, borderRadius: 16, fontSize: 14,
              background: "linear-gradient(135deg, var(--pam-pink), var(--pam-purple))",
              border: "none",
              boxShadow: "0 4px 16px var(--pam-shadow-pink-btn)",
            }}
          >
            <IconRefresh />
            {t.actions.redrawConfirm}
          </button>
        ) : (
          <button
            onClick={() => setConfirmingRedraw(true)}
            className="font-black active:scale-95 transition-all flex items-center justify-center"
            style={{
              gap: 6, padding: 15, borderRadius: 16, fontSize: 14,
              backgroundColor: "var(--pam-btn-redraw-bg)",
              border: "1.5px solid var(--pam-btn-redraw-border)",
              color: "var(--pam-btn-redraw-text)",
              boxShadow: "0 1px 8px var(--pam-shadow-pink-btn)",
            }}
          >
            <IconRefresh />
            {t.actions.redraw}
          </button>
        )}

        {/* 하단 좌: 저장 (로그인 유저만) */}
        {isLoggedIn ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-black active:scale-95 transition-all flex items-center justify-center"
            style={{
              gap: 6, padding: 15, borderRadius: 16, fontSize: 14,
              backgroundColor: "var(--pam-text)",
              color: "var(--pam-bg)",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              opacity: saving ? 0.5 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            <IconDownload />
            {saving ? t.actions.saving : t.actions.save}
          </button>
        ) : (
          /* 비로그인: 빈 자리 (공유하기 2열로 확장되도록 col-span-2 대신 빈 div) */
          <div />
        )}

        {/* 하단 우: 공유하기 */}
        <button
          onClick={handleShare}
          disabled={sharing}
          className={`font-black active:scale-95 transition-all text-white flex items-center justify-center${!isLoggedIn ? " col-span-2" : ""}`}
          style={{
            gap: 6, padding: 15, borderRadius: 16, fontSize: 14,
            background: sharing
              ? "var(--pam-text-disabled)"
              : "linear-gradient(135deg, var(--pam-pink), var(--pam-purple))",
            border: "none",
            boxShadow: sharing ? "none" : "0 4px 16px var(--pam-shadow-pink-btn)",
            cursor: sharing ? "not-allowed" : "pointer",
          }}
        >
          <IconShare />
          {sharing ? t.actions.sharing : t.actions.share}
        </button>
      </div>

      {isLoggedIn && (
        <button
          onClick={() => router.push("/my")}
          className="font-bold active:scale-95 transition-transform"
          style={{ fontSize: 13, color: "var(--pam-text-muted)" }}
        >
          {t.result.viewGallery}
        </button>
      )}

      <Toast message={toastMsg} />

      {!isLoggedIn && showNudge && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl z-[100] animate-fade-in"
          style={{
            backgroundColor: "var(--pam-surface)",
            border: "1.5px solid var(--pam-border)",
            maxWidth: "calc(100% - 48px)",
          }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--pam-text)" }}>
            {t.result.loginNudge}
          </span>
          <button
            onClick={handleLoginNudge}
            className="text-sm font-black px-3 py-1.5 rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, var(--pam-pink), var(--pam-purple))" }}
          >
            {t.result.loginNudgeAction}
          </button>
          <button
            onClick={() => setShowNudge(false)}
            className="text-xs"
            style={{ color: "var(--pam-text-muted)" }}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* 화면 외부에 렌더링되는 1:1 비율 공유 템플릿 */}
      <ShareTemplate ref={shareTemplateRef} result={result} />
    </div>
  );
}
