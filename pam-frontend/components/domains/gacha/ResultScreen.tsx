"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { MemeResult } from "@/hooks/useMemeApi";
import { useAuth } from "@/hooks/useAuth";

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
      else reject(new Error("캡처 실패"));
    }, "image/png");
  });
}

async function saveMeme(blob: Blob) {
  const file = new File([blob], "pick-a-meme.png", { type: "image/png" });

  // 모바일: Web Share API (iOS 사진앱, Android 갤러리)
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "PICK-A-MEME" });
    return;
  }

  // PC: 파일 다운로드
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
  const router = useRouter();
  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const blob = await captureCard(cardRef.current);
      await saveMeme(blob);
    } catch {
      alert("저장에 실패했습니다. 다시 시도해주세요.");
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
        imageAlt="밈 결과"
        className="w-full overflow-hidden relative flex-shrink-0"
      />

      <div className="flex w-full" style={{ gap: 10 }}>
        <button
          onClick={onRedraw}
          className="flex-1 font-black text-[#333] active:scale-95 transition-transform"
          style={{ padding: 15, background: "#f5f0fa", borderRadius: 16, border: "none", fontSize: 15 }}
        >
          다시 뽑기
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 text-white font-black active:scale-95 transition-transform flex items-center justify-center"
          style={{
            gap: 5,
            padding: 15,
            background: saving ? "#ccc" : "linear-gradient(135deg, #FF6B9D, #C44DFF)",
            borderRadius: 16,
            border: "none",
            fontSize: 15,
            boxShadow: saving ? "none" : "0 4px 14px rgba(255,107,157,0.3)",
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
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </div>

      {isLoggedIn && (
        <button
          onClick={() => router.push("/my")}
          className="font-bold text-[#aaa] active:scale-95 transition-transform"
          style={{ fontSize: 13 }}
        >
          내 밈 갤러리 보기 →
        </button>
      )}
    </div>
  );
}
