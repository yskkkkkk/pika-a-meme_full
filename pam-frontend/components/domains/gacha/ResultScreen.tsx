"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";
import { MemeResult } from "@/hooks/useMemeApi";

// ─── 말풍선 ──────────────────────────────────────────────────────────────────

type TailDir = "up" | "down" | "left" | "right";

function getTailDir(pos: string): TailDir {
  switch (pos.toLowerCase()) {
    case "top": case "top_left": case "top_right": return "down";
    case "left": case "full_vertical":             return "right";
    case "right":                                  return "left";
    default:                                       return "up";
  }
}

// 버블 본체 모양 (border-radius) + 꼬리 가로 위치(%) — B급 랜덤
const BUBBLE_VARIANTS = [
  { radius: "22px",                     tailX: 50 },
  { radius: "30px",                     tailX: 35 },
  { radius: "30px",                     tailX: 62 },
  { radius: "24px 24px 6px 24px",       tailX: 22 },
  { radius: "24px 6px 24px 24px",       tailX: 76 },
  { radius: "18px 28px 18px 28px",      tailX: 50 },
];

const BG = "rgba(255,255,255,0.97)";

function TailSVG({ dir }: { dir: TailDir }) {
  if (dir === "down") return (
    <svg width="18" height="12" viewBox="0 0 18 12">
      <path d="M0,0 C5,0 7,9 9,12 C11,9 13,0 18,0 Z" fill={BG} />
    </svg>
  );
  if (dir === "up") return (
    <svg width="18" height="12" viewBox="0 0 18 12">
      <path d="M0,12 C5,12 7,3 9,0 C11,3 13,12 18,12 Z" fill={BG} />
    </svg>
  );
  if (dir === "left") return (
    <svg width="12" height="18" viewBox="0 0 12 18">
      <path d="M12,0 C12,5 3,7 0,9 C3,11 12,13 12,18 Z" fill={BG} />
    </svg>
  );
  return (
    <svg width="12" height="18" viewBox="0 0 12 18">
      <path d="M0,0 C0,5 9,7 12,9 C9,11 0,13 0,18 Z" fill={BG} />
    </svg>
  );
}

function SpeechBubble({ pos, text, variantIdx }: { pos: string; text: string; variantIdx: number }) {
  const dir = getTailDir(pos);
  const v = BUBBLE_VARIANTS[variantIdx % BUBBLE_VARIANTS.length];

  const isVertical = dir === "left" || dir === "right";

  const tailWrap: React.CSSProperties = {
    position: "absolute",
    ...(dir === "down"  && { bottom: -11, left: `${v.tailX}%`, transform: "translateX(-50%)" }),
    ...(dir === "up"    && { top:    -11, left: `${v.tailX}%`, transform: "translateX(-50%)" }),
    ...(dir === "left"  && { left:   -11, top: "50%",          transform: "translateY(-50%)" }),
    ...(dir === "right" && { right:  -11, top: "50%",          transform: "translateY(-50%)" }),
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{
        padding: isVertical ? "10px 14px" : "10px 16px",
        borderRadius: v.radius,
        background: BG,
        display: "inline-block",
      }}>
        <p className="font-black text-center text-[#111] break-keep" style={{ fontSize: 15, lineHeight: 1.4 }}>
          {text}
        </p>
      </div>
      <div style={tailWrap}>
        <TailSVG dir={dir} />
      </div>
    </div>
  );
}

function getPositionClasses(pos: string): string {
  switch (pos.toLowerCase()) {
    case "top":             return "top-4 left-1/2 -translate-x-1/2";
    case "bottom":          return "bottom-16 left-1/2 -translate-x-1/2";
    case "left":            return "top-1/2 left-4 -translate-y-1/2";
    case "right":           return "top-1/2 right-4 -translate-y-1/2";
    case "center":          return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    case "top_left":        return "top-4 left-4";
    case "top_right":       return "top-4 right-4";
    case "bottom_left":     return "bottom-16 left-4";
    case "bottom_right":    return "bottom-16 right-4";
    case "full_horizontal": return "bottom-16 left-0 w-full flex justify-center";
    case "full_vertical":   return "top-1/2 left-4 -translate-y-1/2";
    case "full":            return "top-4 left-4";
    default:                return "bottom-16 right-4";
  }
}

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
  const bubbleVariantRef = useRef(Math.floor(Math.random() * BUBBLE_VARIANTS.length));

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
      <div
        ref={cardRef}
        className="w-full overflow-hidden relative flex-shrink-0"
        style={{ aspectRatio: "1", borderRadius: 24, boxShadow: "0 8px 28px rgba(0,0,0,0.12)" }}
      >
        <img
          src={result.imagePresignedUrl}
          alt="밈 결과"
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />

        <div className={cn("absolute z-10 max-w-[80%]", getPositionClasses(result.subjectPosition))}>
          <SpeechBubble
            pos={result.subjectPosition}
            text={result.phrase}
            variantIdx={bubbleVariantRef.current}
          />
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between"
          style={{ height: 52, background: "linear-gradient(135deg, #FF6B9D, #C44DFF)", padding: "0 16px" }}
        >
          <div className="font-black text-white" style={{ fontSize: 12, letterSpacing: "0.04em" }}>
            PICK-A-<em style={{ color: "rgba(255,255,255,0.85)", fontStyle: "italic" }}>MEME</em>
          </div>
          <div className="flex flex-col items-end" style={{ gap: 2 }}>
            <div className="font-bold text-white/70" style={{ fontSize: 9 }}>나도 뽑으러 가기</div>
            <div className="font-black text-white" style={{ fontSize: 10 }}>pick-a-meme.app</div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
