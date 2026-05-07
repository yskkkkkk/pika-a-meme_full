"use client";

import { CSSProperties, forwardRef, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

// ─── 말풍선 ──────────────────────────────────────────────────────────────────

type TailDir = "up" | "down" | "left" | "right";

const BG = "rgba(255,255,255,0.97)";

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return ((state >>> 0) / 4294967296);
  };
}

function useMemeBubbleStyle(seed?: string) {
  const randomRef = useRef({
    shapeIdx: Math.floor(Math.random() * BUBBLE_VARIANTS.length),
    posJx: Math.random(),
    posJy: Math.random(),
    tailPathIdx: Math.floor(Math.random() * 3),
  });

  return useMemo(() => {
    if (!seed) return randomRef.current;

    const random = seededRandom(hashSeed(seed));
    return {
      shapeIdx: Math.floor(random() * BUBBLE_VARIANTS.length),
      posJx: random(),
      posJy: random(),
      tailPathIdx: Math.floor(random() * 3),
    };
  }, [seed]);
}

// ① 꼬리 방향: 동물 쪽을 가리킴
function getTailDir(pos: string): TailDir {
  switch (pos.toLowerCase()) {
    case "bottom":
    case "bottom_left":
    case "bottom_right":
      return "down";
    case "left":
    case "full_vertical":
      return "left";
    case "right":
      return "right";
    default:
      return "up";
  }
}

// ② 버블 본체 모양 (border-radius) + 꼬리 가로 위치(%)
const BUBBLE_VARIANTS = [
  { radius: "22px", tailX: 50 },
  { radius: "30px", tailX: 35 },
  { radius: "30px", tailX: 64 },
  { radius: "24px 24px 6px 24px", tailX: 24 },
  { radius: "24px 6px 24px 24px", tailX: 74 },
  { radius: "18px 28px 18px 28px", tailX: 50 },
];

// ⑤ 꼬리 상세 모양: 방향별 3종
const TAIL_PATHS: Record<TailDir, string[]> = {
  up: [
    "M0,12 C5,12 7,3 9,0 C11,3 13,12 18,12 Z",
    "M0,12 C4,12 6,5 8,0 C11,4 14,12 18,12 Z",
    "M0,12 C4,12 7,4 10,0 C12,5 14,12 18,12 Z",
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
function getBubbleStyle(pos: string, jx: number, jy: number): CSSProperties {
  const lx = Math.round(22 + jx * 38);
  const bm = Math.round(64 + jy * 32);
  const tp = Math.round(14 + jy * 24);
  const ty = Math.round(22 + jy * 38);
  const sd = Math.round(10 + jx * 16);

  switch (pos.toLowerCase()) {
    case "top":
    case "center":
    case "full":
      return { bottom: bm, left: `${lx}%`, transform: "translateX(-50%)" };
    case "bottom":
    case "full_horizontal":
      return { top: tp, left: `${lx}%`, transform: "translateX(-50%)" };
    case "left":
    case "full_vertical":
      return { right: 12, top: `${ty}%`, transform: "translateY(-50%)" };
    case "right":
      return { left: 12, top: `${ty}%`, transform: "translateY(-50%)" };
    case "top_left":
      return { bottom: bm, right: sd };
    case "top_right":
      return { bottom: bm, left: sd };
    case "bottom_left":
      return { top: tp, right: sd };
    case "bottom_right":
      return { top: tp, left: sd };
    default:
      return { bottom: bm, left: `${lx}%`, transform: "translateX(-50%)" };
  }
}

function SpeechBubble({
  pos,
  text,
  shapeIdx,
  tailPathIdx,
}: {
  pos: string;
  text: string;
  shapeIdx: number;
  tailPathIdx: number;
}) {
  const dir = getTailDir(pos);
  const v = BUBBLE_VARIANTS[shapeIdx % BUBBLE_VARIANTS.length];
  const isVertical = dir === "left" || dir === "right";
  const tailWrap: CSSProperties = {
    position: "absolute",
    ...(dir === "down" && { bottom: -11, left: `${v.tailX}%`, transform: "translateX(-50%)" }),
    ...(dir === "up" && { top: -11, left: `${v.tailX}%`, transform: "translateX(-50%)" }),
    ...(dir === "left" && { left: -11, top: "50%", transform: "translateY(-50%)" }),
    ...(dir === "right" && { right: -11, top: "50%", transform: "translateY(-50%)" }),
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
      <div style={tailWrap}>
        <TailSVG dir={dir} pathIdx={tailPathIdx} />
      </div>
    </div>
  );
}

interface MemeCanvasCardProps {
  imageUrl: string;
  subjectPosition: string;
  phrase: string;
  seed?: string;
  showBrandBar?: boolean;
  className?: string;
  imageAlt?: string;
}

export const MemeCanvasCard = forwardRef<HTMLDivElement, MemeCanvasCardProps>(function MemeCanvasCard({
  imageUrl,
  subjectPosition,
  phrase,
  seed,
  showBrandBar = true,
  className,
  imageAlt = "밈 이미지",
}, ref) {
  const bubble = useMemeBubbleStyle(seed);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: "1", borderRadius: 24, boxShadow: "0 8px 28px rgba(0,0,0,0.12)" }}
    >
      <img
        src={imageUrl}
        alt={imageAlt}
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
      />

      <div
        className="absolute z-10 max-w-[80%]"
        style={getBubbleStyle(subjectPosition, bubble.posJx, bubble.posJy)}
      >
        <SpeechBubble
          pos={subjectPosition}
          text={phrase}
          shapeIdx={bubble.shapeIdx}
          tailPathIdx={bubble.tailPathIdx}
        />
      </div>

      {showBrandBar && (
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
      )}
    </div>
  );
});
