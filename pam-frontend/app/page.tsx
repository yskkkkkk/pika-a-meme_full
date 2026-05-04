"use client";

import React, { useState, useEffect } from "react";
import { useGuestHeart } from "@/hooks/useGuestHeart";
import { useAuth } from "@/hooks/useAuth";
import { composeMeme, MemeResult } from "@/hooks/useMemeApi";
import { LoginSlideMenu } from "@/components/auth/LoginSlideMenu";
import { HeartDisplay } from "@/components/domains/heart/HeartDisplay";
import { cn } from "@/lib/utils";

type AppState = "HOME" | "TAG_SELECT" | "SPINNING" | "RESULT";

const AVAILABLE_TAGS = ["피곤", "직장인", "기쁨", "주말", "귀여움", "분노", "놀람", "눈치", "광기", "질문", "의지"];

const LOADING_STEPS = [
  { text: "카드 뽑는 중", dots: 3 },
  { text: "문구 뽑는 중", dots: 3 },
  { text: "이미지에 붙이는 중", dots: 5 },
  { text: "마무리 중", dots: 2 },
];
const LOADING_ANIMALS = ["🐱", "🐶", "🐻", "🐼", "🦊"];

const PREVIEW_MEMES = [
  { id: 1, bg: "linear-gradient(135deg,#2d1b4e,#1a0d2e)", animal: "🐱", phrase: "야근 5일차" },
  { id: 2, bg: "linear-gradient(135deg,#1a2d1a,#0d1f0d)", animal: "🐶", phrase: "퇴근 5분 전" },
  { id: 3, bg: "linear-gradient(135deg,#2d1a1a,#1a0d0d)", animal: "🐻", phrase: "월요일 아침" },
];

export default function Home() {
  const [appState, setAppState] = useState<AppState>("HOME");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memeResult, setMemeResult] = useState<MemeResult | null>(null);

  // Loading animation state
  const [stepIdx, setStepIdx] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);
  const [animalIdx, setAnimalIdx] = useState(0);

  const { hearts, consumeHeart } = useGuestHeart();
  const { isLoggedIn } = useAuth();

  // Loading step cycle
  useEffect(() => {
    if (appState !== "SPINNING") return;
    const t = setInterval(() => {
      setStepVisible(false);
      setTimeout(() => {
        setStepIdx((i: number) => (i + 1) % LOADING_STEPS.length);
        setDotCount(0);
        setStepVisible(true);
      }, 220);
    }, 2000);
    return () => clearInterval(t);
  }, [appState]);

  // Loading dot typing
  useEffect(() => {
    if (appState !== "SPINNING") return;
    if (dotCount >= LOADING_STEPS[stepIdx].dots) return;
    const t = setTimeout(() => setDotCount((d: number) => d + 1), 320);
    return () => clearTimeout(t);
  }, [dotCount, stepIdx, appState]);

  // Loading animal cycle
  useEffect(() => {
    if (appState !== "SPINNING") return;
    const t = setInterval(() => setAnimalIdx((i: number) => (i + 1) % LOADING_ANIMALS.length), 1600);
    return () => clearInterval(t);
  }, [appState]);

  const handleBasicDraw = async () => {
    if (hearts <= 0) {
      alert("하트가 부족합니다! 잠시 후 다시 시도하거나 로그인하세요.");
      return;
    }
    const success = consumeHeart();
    if (!success) return;

    setAppState("SPINNING");
    try {
      const result = await composeMeme("BASIC");
      setMemeResult(result);
      setAppState("RESULT");
    } catch (e) {
      alert("오류가 발생했습니다.");
      setAppState("HOME");
    }
  };

  const handleSpecialDrawClick = () => {
    if (!isLoggedIn) {
      setIsMenuOpen(true);
      return;
    }
    setAppState("TAG_SELECT");
  };

  const executeSpecialDraw = async () => {
    setAppState("SPINNING");
    try {
      const result = await composeMeme("SPECIAL", selectedTags);
      setMemeResult(result);
      setAppState("RESULT");
    } catch (e) {
      alert("오류가 발생했습니다.");
      setAppState("HOME");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getPositionClasses = (pos: string) => {
    switch (pos.toLowerCase()) {
      case "top": return "top-4 left-1/2 -translate-x-1/2";
      case "bottom": return "bottom-14 left-1/2 -translate-x-1/2";
      case "left": return "top-1/2 left-4 -translate-y-1/2";
      case "right": return "top-1/2 right-4 -translate-y-1/2";
      case "center": return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "top_left": return "top-4 left-4";
      case "top_right": return "top-4 right-4";
      case "bottom_left": return "bottom-14 left-4";
      case "bottom_right": return "bottom-14 right-4";
      case "full_horizontal": return "bottom-14 left-0 w-full flex justify-center";
      case "full_vertical": return "top-1/2 left-4 -translate-y-1/2";
      case "full": return "top-4 left-4";
      default: return "bottom-14 right-4";
    }
  };

  return (
    <div className="flex flex-col flex-1 relative">
      {/* Loading screen — covers entire container */}
      {appState === "SPINNING" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1a1010]">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,107,157,0.07) 0%, transparent 70%)",
            }}
          />
          <div className="relative loading-float mb-7">
            <div className="loading-pulse" />
            <div className="loading-flip-card">
              <div className="loading-flip-inner">
                <div className="loading-flip-front text-[48px]">
                  {LOADING_ANIMALS[animalIdx]}
                </div>
                <div className="loading-flip-back">
                  <div className="loading-back-pattern" />
                </div>
              </div>
            </div>
          </div>
          <div className="text-[16px] font-black text-white tracking-[0.05em] mb-[6px]">
            두구두구두구
          </div>
          <div
            className="text-[11px] text-white/40 min-h-[16px] transition-opacity duration-200"
            style={{ opacity: stepVisible ? 1 : 0 }}
          >
            {LOADING_STEPS[stepIdx].text}
            <span className="text-[#FF6B9D]">{".".repeat(dotCount)}</span>
          </div>
          <div className="flex gap-[5px] mt-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="loading-bounce-dot"
                style={{
                  background: i === 0 ? "#FF6B9D" : i === 1 ? "#d966ff" : "#C44DFF",
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
          </div>
          <div className="absolute bottom-6 text-[10px] font-black tracking-[0.2em] text-white/30">
            PICK-A-MEME
          </div>
        </div>
      )}

      {/* Top bar — hidden during loading */}
      {appState !== "SPINNING" && (
        <HeartDisplay onMenuOpen={() => setIsMenuOpen(true)} />
      )}

      {/* Page content */}
      <div className="flex-1 flex flex-col items-center justify-center px-[18px] pb-10 relative z-10">
        {/* HOME */}
        {appState === "HOME" && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <h1 className="text-[32px] font-black tracking-[-0.03em] text-[#111] text-center leading-none mb-4">
              PICK-A-<em className="text-primary not-italic">MEME</em>
            </h1>

            {/* Preview strip */}
            <div className="flex gap-[7px] w-full mb-5">
              {PREVIEW_MEMES.map((meme) => (
                <div
                  key={meme.id}
                  className="flex-1 aspect-square rounded-[14px] overflow-hidden relative flex-shrink-0"
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: meme.bg }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[28px]">
                    {meme.animal}
                  </div>
                  <div
                    className="absolute inset-0 flex items-end p-[5px]"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
                    }}
                  >
                    <p className="text-white text-[8px] font-black leading-tight">
                      {meme.phrase}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleBasicDraw}
                className="w-full bg-[#111] text-white rounded-[18px] px-4 py-[14px] flex items-center justify-between active:scale-95 transition-transform"
              >
                <div className="text-left">
                  <div className="text-[15px] font-black">BASIC 가챠</div>
                  <div className="text-[10px] opacity-55 mt-[1px]">일반 하트 1개 소모</div>
                </div>
                <div className="w-[34px] h-[34px] bg-white/15 rounded-full flex items-center justify-center text-[16px] flex-shrink-0">
                  ❤️
                </div>
              </button>

              <button
                onClick={handleSpecialDrawClick}
                className="w-full text-white rounded-[18px] px-4 py-[14px] flex items-center justify-between active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #C44DFF, #FF6B9D)",
                  boxShadow: "0 6px 20px rgba(196,77,255,0.28)",
                }}
              >
                <div className="text-left">
                  <div className="text-[15px] font-black">SPECIAL 가챠</div>
                  <div className="text-[10px] opacity-55 mt-[1px]">스페셜 하트 1개 소모</div>
                </div>
                <div className="w-[34px] h-[34px] bg-white/15 rounded-full flex items-center justify-center text-[16px] flex-shrink-0">
                  ⚡
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAG_SELECT */}
        {appState === "TAG_SELECT" && (
          <div className="w-full flex flex-col animate-in slide-in-from-bottom-8 duration-300">
            <button
              onClick={() => setAppState("HOME")}
              className="flex items-center gap-1 text-[12px] font-bold text-[#aaa] mb-5 self-start"
            >
              ← 뒤로
            </button>
            <h2 className="text-[22px] font-black text-[#111] mb-[6px]">오늘의 기분은?</h2>
            <p className="text-[12px] text-[#bbb] font-medium mb-5">
              태그를 선택하면 더 찰진 밈이 나와요
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-[14px] py-2 rounded-full text-[13px] font-bold border-2 transition-all",
                    selectedTags.includes(tag)
                      ? "text-white border-transparent"
                      : "bg-white text-[#666] border-[#eee]"
                  )}
                  style={
                    selectedTags.includes(tag)
                      ? {
                          background: "linear-gradient(135deg, #FF6B9D, #C44DFF)",
                          boxShadow: "0 2px 10px rgba(255,107,157,0.3)",
                        }
                      : undefined
                  }
                >
                  #{tag}
                </button>
              ))}
            </div>
            <button
              onClick={executeSpecialDraw}
              className="w-full py-[15px] bg-[#111] text-white rounded-[18px] text-[15px] font-black mt-auto active:scale-95 transition-transform"
            >
              선택 완료하고 뽑기!
            </button>
          </div>
        )}

        {/* RESULT */}
        {appState === "RESULT" && memeResult && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-500 gap-[10px]">
            {/* Result card */}
            <div className="w-full aspect-square rounded-[20px] overflow-hidden relative"
                 style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.12)" }}>
              <img
                src={memeResult.imagePresignedUrl}
                alt="Meme Result"
                className="w-full h-full object-cover"
              />

              {/* Phrase bubble */}
              <div
                className={cn(
                  "absolute z-10 max-w-[80%]",
                  getPositionClasses(memeResult.subjectPosition)
                )}
              >
                <div
                  className="px-[14px] py-2 rounded-[14px] inline-block"
                  style={{
                    background: "rgba(255,255,255,0.97)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <p className="text-[#111] font-black text-[13px] text-center leading-[1.4] break-keep">
                    {memeResult.phrase}
                  </p>
                </div>
              </div>

              {/* Watermark bar — WM-C */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[44px] flex items-center justify-between px-3"
                style={{ background: "linear-gradient(135deg, #FF6B9D, #C44DFF)" }}
              >
                <div className="text-[11px] font-black text-white tracking-[0.04em]">
                  PICK-A-<em className="not-italic opacity-85">MEME</em>
                </div>
                <div className="flex flex-col items-end gap-[1px]">
                  <div className="text-[8px] font-bold text-white/70">나도 뽑으러 가기</div>
                  <div className="text-[9px] font-black text-white">pick-a-meme.app</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setAppState("HOME")}
                className="flex-1 py-3 bg-[#f5f0fa] text-[#333] rounded-[14px] text-[13px] font-black active:scale-95 transition-transform"
              >
                다시 뽑기
              </button>
              <button
                onClick={() => alert("저장 기능은 준비중입니다.")}
                className="flex-1 py-3 text-white rounded-[14px] text-[13px] font-black active:scale-95 transition-transform flex items-center justify-center gap-1"
                style={{
                  background: "linear-gradient(135deg, #FF6B9D, #C44DFF)",
                  boxShadow: "0 4px 14px rgba(255,107,157,0.3)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M6.5 1v7M4 5.5l2.5 2.5L9 5.5M2 10.5h9"
                    stroke="#fff"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                저장하기
              </button>
            </div>
          </div>
        )}
      </div>

      <LoginSlideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
