"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { MemeResult } from "@/hooks/useMemeApi";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { MemeCanvasCard } from "@/components/domains/meme/MemeCanvasCard";

async function captureCard(el: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(el, {
    useCORS: true,
    allowTaint: false,
    scale: 2,
    backgroundColor: null,
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Capture failed"));
    }, "image/png");
  });
}

async function saveMeme(blob: Blob) {
  const file = new File([blob], "pick-a-meme.png", { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "PICK-A-MEME" });
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pick-a-meme.png";
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  result: MemeResult;
  onRedraw: () => void;
}

export function ResultScreen({ result, onRedraw }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const { toastMsg, showToast } = useToast();
  const router = useRouter();

  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const blob = await captureCard(cardRef.current);
      await saveMeme(blob);
    } catch {
      showToast(t.errors.saveFailed);
    } finally {
      setSaving(false);
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

      <div className="flex w-full" style={{ gap: 10 }}>
        <button
          onClick={onRedraw}
          className="flex-1 font-black active:scale-95 transition-transform"
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
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 text-white font-black active:scale-95 transition-transform flex items-center justify-center"
          style={{
            gap: 5,
            padding: 15,
            background: saving ? "var(--pam-text-disabled)" : "linear-gradient(135deg, var(--pam-pink), var(--pam-purple))",
            borderRadius: 16,
            border: "none",
            fontSize: 15,
            boxShadow: saving ? "none" : "0 4px 14px var(--pam-shadow-pink-btn)",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
            <path
              d="M6.5 1v7M4 5.5l2.5 2.5L9 5.5M2 10.5h9"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {saving ? t.actions.saving : t.actions.save}
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
