"use client";

import React, { useState, useEffect } from "react";
import { useGuestHeart } from "@/hooks/useGuestHeart";
import { useAuth } from "@/hooks/useAuth";
import { composeMeme, MemeResult } from "@/hooks/useMemeApi";
import { LoginSlideMenu } from "@/components/auth/LoginSlideMenu";
import { HeartDisplay } from "@/components/domains/heart/HeartDisplay";
import { cn } from "@/lib/utils";

type AppState = "HOME" | "TAG_SELECT" | "SPINNING" | "RESULT";

const AVAILABLE_TAGS = [
  "피곤", "직장인", "기쁨", "주말", "귀여움",
  "분노", "놀람", "눈치", "광기", "질문", "의지",
];

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

  const [stepIdx, setStepIdx] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);
  const [animalIdx, setAnimalIdx] = useState(0);

  const { hearts, consumeHeart } = useGuestHeart();
  const { isLoggedIn } = useAuth();

  // 로딩 스텝 사이클 (2초마다)
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
    const t = setInterval(
      () => setAnimalIdx((i: number) => (i + 1) % LOADING_ANIMALS.length),
      1600,
    );
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
      // API 응답이 빠르더라도 최소 2초 로딩 노출
      const [result] = await Promise.all([
        composeMeme("BASIC"),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
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
      const [result] = await Promise.all([
        composeMeme("SPECIAL", selectedTags),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
      setMemeResult(result);
      setAppState("RESULT");
    } catch (e) {
      alert("오류가 발생했습니다.");
      setAppState("HOME");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev: string[]) =>
      prev.includes(tag) ? prev.filter((t: string) => t !== tag) : [...prev, tag],
    );
  };

  const getPositionClasses = (pos: string) => {
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
  };

  return (
    <div className="flex flex-col flex-1 relative">
      {/* ── LOADING SCREEN ── */}
      {appState === "SPINNING" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1a1010]">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,107,157,0.07) 0%, transparent 70%)",
            }}
          />
          <div className="relative loading-float mb-8">
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
          <div
            className="font-black text-white"
            style={{ fontSize: 18, letterSpacing: "0.05em", marginBottom: 8 }}
          >
            두구두구두구
          </div>
          <div
            className="text-white/40 transition-opacity duration-200"
            style={{ fontSize: 13, minHeight: 20, opacity: stepVisible ? 1 : 0 }}
          >
            {LOADING_STEPS[stepIdx].text}
            <span className="text-[#FF6B9D]">{".".repeat(dotCount)}</span>
          </div>
          <div className="flex mt-4" style={{ gap: 6 }}>
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
          <div
            className="absolute bottom-8 font-black text-white/30"
            style={{ fontSize: 11, letterSpacing: "0.2em" }}
          >
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
          style={{ padding: "0 24px 32px", gap: 24 }}
        >
          {/* 로고 — MEME: 핑크 + 이탤릭 (italic 명시) */}
          <h1
            className="font-black text-center text-[#111] leading-none"
            style={{ fontSize: 48, letterSpacing: "-0.03em" }}
          >
            PICK-A-<em className="text-primary italic">MEME</em>
          </h1>

          {/* 밈 프리뷰 스트립 */}
          <div className="flex w-full" style={{ gap: 10 }}>
            {PREVIEW_MEMES.map((meme) => (
              <div
                key={meme.id}
                className="flex-1 overflow-hidden relative"
                style={{ aspectRatio: "1", borderRadius: 20 }}
              >
                <div className="absolute inset-0" style={{ background: meme.bg }} />
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ fontSize: 40, opacity: 0.85 }}
                >
                  {meme.animal}
                </div>
                <div
                  className="absolute inset-0 flex items-end"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)",
                    padding: 8,
                  }}
                >
                  <p
                    className="text-white font-black leading-tight"
                    style={{
                      fontSize: 11,
                      textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    }}
                  >
                    {meme.phrase}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 가챠 버튼 */}
          <div className="flex flex-col w-full" style={{ gap: 12 }}>
            <button
              onClick={handleBasicDraw}
              className="w-full flex items-center justify-between text-white active:scale-[0.98] transition-transform"
              style={{
                background: "#111",
                borderRadius: 24,
                padding: "20px 24px",
                border: "none",
              }}
            >
              <div className="text-left">
                <div className="font-black" style={{ fontSize: 20 }}>BASIC 가챠</div>
                <div style={{ fontSize: 13, opacity: 0.6, marginTop: 3 }}>일반 하트 1개 소모</div>
              </div>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 44, height: 44,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "50%",
                  fontSize: 20,
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
                borderRadius: 24,
                padding: "20px 24px",
                border: "none",
                boxShadow: "0 8px 24px rgba(196,77,255,0.3)",
              }}
            >
              <div className="text-left">
                <div className="font-black" style={{ fontSize: 20 }}>SPECIAL 가챠</div>
                <div style={{ fontSize: 13, opacity: 0.6, marginTop: 3 }}>스페셜 하트 1개 소모</div>
              </div>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 44, height: 44,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "50%",
                  fontSize: 20,
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
          style={{ padding: "20px 24px 24px" }}
        >
          <button
            onClick={() => setAppState("HOME")}
            className="self-start flex items-center gap-1 font-bold text-[#aaa]"
            style={{ fontSize: 14, marginBottom: 24 }}
          >
            ← 뒤로
          </button>
          <h2 className="font-black text-[#111]" style={{ fontSize: 26, marginBottom: 8 }}>
            오늘의 기분은?
          </h2>
          <p className="font-medium text-[#bbb]" style={{ fontSize: 14, marginBottom: 24 }}>
            태그를 선택하면 더 찰진 밈이 나와요
          </p>
          <div className="flex flex-wrap justify-center" style={{ gap: 10, marginBottom: 28 }}>
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "font-bold border-2 transition-all",
                  selectedTags.includes(tag)
                    ? "text-white border-transparent"
                    : "bg-white text-[#666] border-[#eee]",
                )}
                style={{
                  padding: "10px 18px",
                  borderRadius: 9999,
                  fontSize: 15,
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
              padding: 18,
              background: "#111",
              borderRadius: 22,
              border: "none",
              fontSize: 17,
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
          style={{ padding: "12px 24px 24px", gap: 12 }}
        >
          {/* 결과 카드 (1:1) */}
          <div
            className="w-full overflow-hidden relative flex-shrink-0"
            style={{
              aspectRatio: "1",
              borderRadius: 24,
              boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
            }}
          >
            <img
              src={memeResult.imagePresignedUrl}
              alt="밈 결과"
              className="w-full h-full object-cover"
            />

            {/* 말풍선 */}
            <div
              className={cn(
                "absolute z-10 max-w-[80%]",
                getPositionClasses(memeResult.subjectPosition),
              )}
            >
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                  display: "inline-block",
                }}
              >
                <p
                  className="font-black text-center text-[#111] break-keep"
                  style={{ fontSize: 15, lineHeight: 1.4 }}
                >
                  {memeResult.phrase}
                </p>
              </div>
            </div>

            {/* WM-C 워터마크 바 */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-between"
              style={{
                height: 52,
                background: "linear-gradient(135deg, #FF6B9D, #C44DFF)",
                padding: "0 16px",
              }}
            >
              <div className="font-black text-white" style={{ fontSize: 12, letterSpacing: "0.04em" }}>
                PICK-A-<em style={{ fontStyle: "italic", opacity: 0.85 }}>MEME</em>
              </div>
              <div className="flex flex-col items-end" style={{ gap: 2 }}>
                <div className="font-bold text-white/70" style={{ fontSize: 9 }}>나도 뽑으러 가기</div>
                <div className="font-black text-white" style={{ fontSize: 10 }}>pick-a-meme.app</div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex w-full" style={{ gap: 10 }}>
            <button
              onClick={() => setAppState("HOME")}
              className="flex-1 font-black text-[#333] active:scale-95 transition-transform"
              style={{
                padding: 15,
                background: "#f5f0fa",
                borderRadius: 16,
                border: "none",
                fontSize: 15,
              }}
            >
              다시 뽑기
            </button>
            <button
              onClick={() => alert("저장 기능은 준비중입니다.")}
              className="flex-1 text-white font-black active:scale-95 transition-transform flex items-center justify-center"
              style={{
                gap: 5,
                padding: 15,
                background: "linear-gradient(135deg, #FF6B9D, #C44DFF)",
                borderRadius: 16,
                border: "none",
                fontSize: 15,
                boxShadow: "0 4px 14px rgba(255,107,157,0.3)",
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
              저장하기
            </button>
          </div>
        </div>
      )}

      <LoginSlideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
