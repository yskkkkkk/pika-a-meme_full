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

// 정적 프리뷰 샘플 (API 연동 전)
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

  // Loading step cycle (2초마다 전환)
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

  // 점 타이핑 (320ms씩)
  useEffect(() => {
    if (appState !== "SPINNING") return;
    if (dotCount >= LOADING_STEPS[stepIdx].dots) return;
    const t = setTimeout(() => setDotCount((d: number) => d + 1), 320);
    return () => clearTimeout(t);
  }, [dotCount, stepIdx, appState]);

  // 카드 동물 사이클 (1.6초마다)
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
    setSelectedTags((prev: string[]) =>
      prev.includes(tag) ? prev.filter((t: string) => t !== tag) : [...prev, tag]
    );
  };

  const getPositionClasses = (pos: string) => {
    switch (pos.toLowerCase()) {
      case "top":              return "top-4 left-1/2 -translate-x-1/2";
      case "bottom":           return "bottom-14 left-1/2 -translate-x-1/2";
      case "left":             return "top-1/2 left-4 -translate-y-1/2";
      case "right":            return "top-1/2 right-4 -translate-y-1/2";
      case "center":           return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "top_left":         return "top-4 left-4";
      case "top_right":        return "top-4 right-4";
      case "bottom_left":      return "bottom-14 left-4";
      case "bottom_right":     return "bottom-14 right-4";
      case "full_horizontal":  return "bottom-14 left-0 w-full flex justify-center";
      case "full_vertical":    return "top-1/2 left-4 -translate-y-1/2";
      case "full":             return "top-4 left-4";
      default:                 return "bottom-14 right-4";
    }
  };

  return (
    <div className="flex flex-col flex-1 relative">
      {/* ── LOADING SCREEN (전체 오버레이) ── */}
      {appState === "SPINNING" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1a1010]">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(255,107,157,0.07) 0%, transparent 70%)",
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

      {/* ── TOP BAR (로딩 중 숨김) ── */}
      {appState !== "SPINNING" && (
        <HeartDisplay onMenuOpen={() => setIsMenuOpen(true)} />
      )}

      {/* ── HOME ── */}
      {appState === "HOME" && (
        <div
          className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in zoom-in duration-300"
          style={{ padding: "0 20px 24px", gap: 20 }}
        >
          {/* 로고 — MEME은 핑크 이탤릭 */}
          <h1
            className="font-black text-center text-[#111] leading-none"
            style={{ fontSize: 36, letterSpacing: "-0.03em" }}
          >
            PICK-A-<em className="text-primary">MEME</em>
          </h1>

          {/* 밈 프리뷰 스트립 */}
          <div className="flex w-full" style={{ gap: 8 }}>
            {PREVIEW_MEMES.map((meme) => (
              <div
                key={meme.id}
                className="flex-1 overflow-hidden relative"
                style={{ aspectRatio: "1", borderRadius: 16 }}
              >
                <div className="absolute inset-0" style={{ background: meme.bg }} />
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ fontSize: 32, opacity: 0.85 }}
                >
                  {meme.animal}
                </div>
                <div
                  className="absolute inset-0 flex items-end"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)",
                    padding: 6,
                  }}
                >
                  <p
                    className="text-white font-black leading-tight"
                    style={{ fontSize: 9, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
                  >
                    {meme.phrase}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 가챠 버튼 */}
          <div className="flex flex-col w-full" style={{ gap: 10 }}>
            <button
              onClick={handleBasicDraw}
              className="w-full flex items-center justify-between text-white active:scale-[0.98] transition-transform"
              style={{
                background: "#111",
                borderRadius: 20,
                padding: "16px 20px",
                border: "none",
              }}
            >
              <div className="text-left">
                <div className="font-black" style={{ fontSize: 17 }}>BASIC 가챠</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>일반 하트 1개 소모</div>
              </div>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 38, height: 38,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "50%",
                  fontSize: 18,
                }}
              >
                ❤️
              </div>
            </button>

            <button
              onClick={handleSpecialDrawClick}
              className="w-full flex items-center justify-between text-white active:scale-[0.98] transition-transform"
              style={{
                background: "linear-gradient(135deg, #C44DFF, #FF6B9D)",
                borderRadius: 20,
                padding: "16px 20px",
                border: "none",
                boxShadow: "0 8px 24px rgba(196,77,255,0.3)",
              }}
            >
              <div className="text-left">
                <div className="font-black" style={{ fontSize: 17 }}>SPECIAL 가챠</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>스페셜 하트 1개 소모</div>
              </div>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 38, height: 38,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "50%",
                  fontSize: 18,
                }}
              >
                ⚡
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── TAG SELECT ── */}
      {appState === "TAG_SELECT" && (
        <div
          className="flex-1 flex flex-col w-full animate-in slide-in-from-bottom-8 duration-300"
          style={{ padding: "16px 18px 20px" }}
        >
          <button
            onClick={() => setAppState("HOME")}
            className="self-start flex items-center gap-1 font-bold text-[#aaa]"
            style={{ fontSize: 12, marginBottom: 20 }}
          >
            ← 뒤로
          </button>
          <h2 className="font-black text-[#111]" style={{ fontSize: 22, marginBottom: 6 }}>
            오늘의 기분은?
          </h2>
          <p className="font-medium text-[#bbb]" style={{ fontSize: 12, marginBottom: 20 }}>
            태그를 선택하면 더 찰진 밈이 나와요
          </p>
          <div className="flex flex-wrap justify-center" style={{ gap: 8, marginBottom: 24 }}>
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "font-bold border-2 transition-all",
                  selectedTags.includes(tag) ? "text-white border-transparent" : "bg-white text-[#666] border-[#eee]"
                )}
                style={{
                  padding: "8px 14px",
                  borderRadius: 9999,
                  fontSize: 13,
                  ...(selectedTags.includes(tag)
                    ? {
                        background: "linear-gradient(135deg, #FF6B9D, #C44DFF)",
                        boxShadow: "0 2px 10px rgba(255,107,157,0.3)",
                      }
                    : {}),
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
          <button
            onClick={executeSpecialDraw}
            className="w-full text-white font-black active:scale-[0.98] transition-transform"
            style={{
              marginTop: "auto",
              padding: 15,
              background: "#111",
              borderRadius: 18,
              border: "none",
              fontSize: 15,
            }}
          >
            선택 완료하고 뽑기!
          </button>
        </div>
      )}

      {/* ── RESULT ── */}
      {appState === "RESULT" && memeResult && (
        <div
          className="flex-1 flex flex-col items-center w-full animate-in zoom-in-95 duration-500"
          style={{ padding: "8px 16px 16px", gap: 10 }}
        >
          {/* 결과 카드 (1:1) */}
          <div
            className="w-full overflow-hidden relative flex-shrink-0"
            style={{
              aspectRatio: "1",
              borderRadius: 20,
              boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
            }}
          >
            <img
              src={memeResult.imagePresignedUrl}
              alt="Meme Result"
              className="w-full h-full object-cover"
            />

            {/* 말풍선 (subject_position 기반) */}
            <div
              className={cn(
                "absolute z-10 max-w-[80%]",
                getPositionClasses(memeResult.subjectPosition)
              )}
            >
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                  display: "inline-block",
                }}
              >
                <p className="font-black text-center text-[#111] break-keep" style={{ fontSize: 13, lineHeight: 1.4 }}>
                  {memeResult.phrase}
                </p>
              </div>
            </div>

            {/* WM-C 워터마크 바 */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-between"
              style={{
                height: 44,
                background: "linear-gradient(135deg, #FF6B9D, #C44DFF)",
                padding: "0 12px",
              }}
            >
              <div className="font-black text-white" style={{ fontSize: 11, letterSpacing: "0.04em" }}>
                PICK-A-<em style={{ fontStyle: "italic", opacity: 0.85 }}>MEME</em>
              </div>
              <div className="flex flex-col items-end" style={{ gap: 1 }}>
                <div className="font-bold text-white/70" style={{ fontSize: 8 }}>나도 뽑으러 가기</div>
                <div className="font-black text-white" style={{ fontSize: 9 }}>pick-a-meme.app</div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex w-full" style={{ gap: 8 }}>
            <button
              onClick={() => setAppState("HOME")}
              className="flex-1 font-black text-[#333] active:scale-95 transition-transform"
              style={{
                padding: 12,
                background: "#f5f0fa",
                borderRadius: 14,
                border: "none",
                fontSize: 13,
              }}
            >
              다시 뽑기
            </button>
            <button
              onClick={() => alert("저장 기능은 준비중입니다.")}
              className="flex-1 text-white font-black active:scale-95 transition-transform flex items-center justify-center"
              style={{
                gap: 4,
                padding: 12,
                background: "linear-gradient(135deg, #FF6B9D, #C44DFF)",
                borderRadius: 14,
                border: "none",
                fontSize: 13,
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

      <LoginSlideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
