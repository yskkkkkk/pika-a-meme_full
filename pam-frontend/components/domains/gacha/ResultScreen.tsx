"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { MemeResult } from "@/hooks/useMemeApi";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { recordShare } from "@/hooks/useMissions";
import { MemeCanvasCard } from "@/components/domains/meme/MemeCanvasCard";

async function captureCard(el: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(el, {
    useCORS: true,
    allowTaint: false,
    scale: 2,
    backgroundColor: null,
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob: Blob | null) => {
      if (blob) resolve(blob);
      else reject(new Error("Capture failed"));
    }, "image/png");
  });
}

interface Props {
  result: MemeResult;
  onRedraw: () => void;
  onHome: () => void;
}

export function ResultScreen({ result, onRedraw, onHome }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [confirmingRedraw, setConfirmingRedraw] = useState(false);
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const { toastMsg, showToast } = useToast();
  const router = useRouter();

  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const blob = await captureCard(cardRef.current);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pick-a-meme.png";
      a.click();
      URL.revokeObjectURL(url);
      showToast(t.toast.imageSaved);
    } catch {
      showToast(t.errors.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current || sharing) return;
    setSharing(true);
    try {
      const blob = await captureCard(cardRef.current);
      const file = new File([blob], "pick-a-meme.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "PICK-A-MEME", text: result.phrase });
        recordShare("OTHER");
      } else if (navigator.share) {
        await navigator.share({ title: "PICK-A-MEME", text: result.phrase, url: window.location.origin });
        recordShare("OTHER");
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        showToast(t.toast.linkCopied);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") showToast(t.errors.shareFailed);
    } finally {
      setSharing(false);
    }
  };

  const handleRedrawClick = () => setConfirmingRedraw(true);
  const handleRedrawConfirm = () => { setConfirmingRedraw(false); onRedraw(); };
  const handleRedrawCancel = () => setConfirmingRedraw(false);

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
        {/* 상단 행: 홈 / 다시뽑기(또는 확인) */}
        <button
          onClick={onHome}
          className="font-black active:scale-95 transition-transform"
          style={{
            padding: 15,
            backgroundColor: "var(--pam-btn-secondary-bg)",
            color: "var(--pam-btn-secondary-text)",
            borderRadius: 16,
            border: "none",
            fontSize: 15,
          }}
        >
          {t.actions.home}
        </button>

        {confirmingRedraw ? (
          <div className="grid grid-cols-2 col-span-1" style={{ gap: 6 }}>
            <button
              onClick={handleRedrawCancel}
              className="font-black active:scale-95 transition-transform"
              style={{
                padding: 15,
                backgroundColor: "var(--pam-surface)",
                color: "var(--pam-text-muted)",
                borderRadius: 16,
                border: "1px solid var(--pam-border)",
                fontSize: 13,
              }}
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleRedrawConfirm}
              className="font-black active:scale-95 transition-transform text-white"
              style={{
                padding: 15,
                background: "linear-gradient(135deg, var(--pam-pink), var(--pam-purple))",
                borderRadius: 16,
                border: "none",
                fontSize: 13,
                boxShadow: "0 4px 14px var(--pam-shadow-pink-btn)",
              }}
            >
              {t.actions.redrawConfirm}
            </button>
          </div>
        ) : (
          <button
            onClick={handleRedrawClick}
            className="font-black active:scale-95 transition-transform"
            style={{
              padding: 15,
              backgroundColor: "var(--pam-btn-secondary-bg)",
              color: "var(--pam-btn-secondary-text)",
              borderRadius: 16,
              border: "none",
              fontSize: 15,
            }}
          >
            {t.actions.redraw}
          </button>
        )}

        {/* 하단 행: 저장 / 공유 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="font-black active:scale-95 transition-transform flex items-center justify-center"
          style={{
            gap: 5,
            padding: 15,
            backgroundColor: "var(--pam-text)",
            color: "var(--pam-bg)",
            borderRadius: 16,
            border: "none",
            fontSize: 15,
            opacity: saving ? 0.5 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v7M4 5.5l2.5 2.5L9 5.5M2 10.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {saving ? t.actions.saving : t.actions.save}
        </button>

        <button
          onClick={handleShare}
          disabled={sharing}
          className="font-black active:scale-95 transition-transform text-white flex items-center justify-center"
          style={{
            gap: 5,
            padding: 15,
            background: sharing ? "var(--pam-text-disabled)" : "linear-gradient(135deg, var(--pam-pink), var(--pam-purple))",
            borderRadius: 16,
            border: "none",
            fontSize: 15,
            boxShadow: sharing ? "none" : "0 4px 14px var(--pam-shadow-pink-btn)",
            cursor: sharing ? "not-allowed" : "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
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
    </div>
  );
}
