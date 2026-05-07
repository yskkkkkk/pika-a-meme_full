"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { MemeResult } from "@/hooks/useMemeApi";
import { useAuth } from "@/hooks/useAuth";

// ─── 말풍선 ──────────────────────────────────────────────────────────────────

type TailDir = "up" | "down" | "left" | "right";

const BG = "rgba(255,255,255,0.97)";

// ① 꼬리 방향: 동물 쪽을 가리킴
function getTailDir(pos: string): TailDir {
  switch (pos.toLowerCase()) {
    case "bottom": case "bottom_left": case "bottom_right": return "down";
    case "left":   case "full_vertical":                    return "left";
    case "right":                                           return "right";
    default:                                                return "up";
  }
}

// ② 버블 본체 모양 (border-radius) + 꼬리 가로 위치(%)
const BUBBLE_VARIANTS = [
  { radius: "22px",                tailX: 50 },
  { radius: "30px",                tailX: 35 },
  { radius: "30px",                tailX: 64 },
  { radius: "24px 24px 6px 24px",  tailX: 24 },
  { radius: "24px 6px 24px 24px",  tailX: 74 },
  { radius: "18px 28px 18px 28px", tailX: 50 },
];

// ⑤ 꼬리 상세 모양: 방향별 3종
const TAIL_PATHS: Record<TailDir, string[]> = {
  up: [
    "M0,12 C5,12 7,3 9,0 C11,3 13,12 18,12 Z",       // 대칭 중앙
    "M0,12 C4,12 6,5 8,0 C11,4 14,12 18,12 Z",        // 좌로 기울기
    "M0,12 C4,12 7,4 10,0 C12,5 14,12 18,12 Z",       // 우로 기울기
  ],
  down: [
    "M0,0 C5,0 7,9 9,12 C11,9 13,0 18,0 Z",
    "M0,0 C4,0 6,7 8,12 C11,8 14,0 18,0 Z",
    "M0,0 C4,0 7,8 10,12 C12,7 14,0 18,0 Z",
  ],
  left: [
    "M12,0 C12,5 3,7 0,9 C3,11 12,13 12,18 Z",
    "M12,0 C12,4 4,6 0,8 C4,11 12,14 12,18 Z",
    "M12,0 C12,5 2,8 0,10 C3,12 12,14 12,18 Z",
  ],
  right: [
    "M0,0 C0,5 9,7 12,9 C9,11 0,13 0,18 Z",
    "M0,0 C0,4 8,6 12,8 C8,11 0,14 0,18 Z",
    "M0,0 C0,5 10,8 12,10 C9,12 0,14 0,18 Z",
  ],
};

function TailSVG({ dir, pathIdx }: { dir: TailDir; pathIdx: number }) {
  const path = TAIL_PATHS[dir][pathIdx % TAIL_PATHS[dir].length];
  const isH = dir === "up" || dir === "down";
  return (
    <svg
      width={isH ? 18 : 12}
      height={isH ? 12 : 18}
      viewBox={isH ? "0 0 18 12" : "0 0 12 18"}
    >
      <path d={path} fill={BG} />
    </svg>
  );
}

// ③ 버블 위치: 동물 반대편 + 상세 위치 랜덤 (jx, jy: 0~1)
function getBubbleStyle(pos: string, jx: number, jy: number): React.CSSProperties {
  const lx = Math.round(22 + jx * 38);   // left 22%~60%
  const bm = Math.round(64 + jy * 32);   // bottom 64~96px
  const tp = Math.round(14 + jy * 24);   // top 14~38px
  const ty = Math.round(22 + jy * 38);   // top% 22%~60% (좌우 배치)
  const sd = Math.round(10 + jx * 16);   // side 10~26px (좌우 고정 배치)

  switch (pos.toLowerCase()) {
    case "top":   case "center": case "full":
      return { bottom: bm, left: `${lx}%`, transform: "translateX(-50%)" };
    case "bottom": case "full_horizontal":
      return { top: tp,   left: `${lx}%`, transform: "translateX(-50%)" };
    case "left":  case "full_vertical":
      return { right: 12, top: `${ty}%`,  transform: "translateY(-50%)" };
    case "right":
      return { left:  12, top: `${ty}%`,  transform: "translateY(-50%)" };
    case "top_left":
      return { bottom: bm, right: sd };
    case "top_right":
      return { bottom: bm, left:  sd };
    case "bottom_left":
      return { top: tp,    right: sd };
    case "bottom_right":
      return { top: tp,    left:  sd };
    default:
      return { bottom: bm, left: `${lx}%`, transform: "translateX(-50%)" };
  }
}

function SpeechBubble({
  pos, text, shapeIdx, tailPathIdx,
}: { pos: string; text: string; shapeIdx: number; tailPathIdx: number }) {
  const dir = getTailDir(pos);
  const v = BUBBLE_VARIANTS[shapeIdx % BUBBLE_VARIANTS.length];
  const isVertical = dir === "left" || dir === "right";
  const tailWrap: React.CSSProperties = {
    position: "absolute",
    ...(dir === "down"  && { bottom: -11, left: `${v.tailX}%`, transform: "translateX(-50%)" }),
    ...(dir === "up"    && { top:    -11, left: `${v.tailX}%`, transform: "translateX(-50%)" }),
    ...(dir === "left"  && { left:   -11, top: "50%", transform: "translateY(-50%)" }),
    ...(dir === "right" && { right:  -11, top: "50%", transform: "translateY(-50%)" }),
  };
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          padding: isVertical ? "10px 14px" : "10px 16px",
          borderRadius: v.radius,
          background: BG,
          display: "inline-block",
        }}
      >
        <p className="font-black text-center text-[#111] break-keep" style={{ fontSize: 15, lineHeight: 1.4 }}>
          {text}
        </p>
      </div>
      <div style={tailWrap}><TailSVG dir={dir} pathIdx={tailPathIdx} /></div>
    </div>
  );
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
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const shapeIdxRef    = useRef(Math.floor(Math.random() * BUBBLE_VARIANTS.length));
  const posJxRef       = useRef(Math.random());
  const posJyRef       = useRef(Math.random());
  const tailPathIdxRef = useRef(Math.floor(Math.random() * 3));

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

        <div
          className="absolute z-10 max-w-[80%]"
          style={getBubbleStyle(result.subjectPosition, posJxRef.current, posJyRef.current)}
        >
          <SpeechBubble
            pos={result.subjectPosition}
            text={result.phrase}
            shapeIdx={shapeIdxRef.current}
            tailPathIdx={tailPathIdxRef.current}
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
