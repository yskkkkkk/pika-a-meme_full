"use client";

import React, { useState } from "react";
import { useGuestHeart } from "@/hooks/useGuestHeart";
import { useAuth } from "@/hooks/useAuth";
import { useMockMemeApi, MockMemeResponse } from "@/hooks/useMockMemeApi";
import { LoginSlideMenu } from "@/components/auth/LoginSlideMenu";
import { Heart, Zap, Menu, RefreshCcw, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type AppState = "HOME" | "TAG_SELECT" | "SPINNING" | "RESULT";

const AVAILABLE_TAGS = ["피곤", "직장인", "월요일", "분노", "슬픔", "기쁨", "퇴근", "야근"];

export default function Home() {
  const [appState, setAppState] = useState<AppState>("HOME");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memeResult, setMemeResult] = useState<MockMemeResponse | null>(null);

  const { hearts, consumeHeart } = useGuestHeart();
  const { isLoggedIn } = useAuth();
  const { composeMeme } = useMockMemeApi();

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
    switch (pos) {
      case "top": return "top-4 left-1/2 -translate-x-1/2";
      case "bottom": return "bottom-4 left-1/2 -translate-x-1/2";
      case "left": return "top-1/2 left-4 -translate-y-1/2";
      case "right": return "top-1/2 right-4 -translate-y-1/2";
      case "center": return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "top_left": return "top-4 left-4";
      case "top_right": return "top-4 right-4";
      case "bottom_left": return "bottom-4 left-4";
      case "bottom_right": return "bottom-4 right-4";
      case "full_horizontal": return "bottom-4 left-0 w-full flex justify-center";
      case "full_vertical": return "top-1/2 left-4 -translate-y-1/2 flex flex-col";
      case "full": return "top-4 left-4";
      default: return "bottom-4 right-4";
    }
  };

  return (
    <div className="flex flex-col flex-1 relative">
      {/* Top Bar inside the container */}
      <div className="flex justify-between items-center p-6 z-20">
        <div className="flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md">
          <Heart className="w-4 h-4 text-pink-500 fill-current" />
          <span className="font-bold text-sm text-gray-800">{hearts}</span>
        </div>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 relative z-10">
        {appState === "HOME" && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-16 space-y-4">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-gray-900 leading-none whitespace-nowrap">
                PICK-A-<span className="text-primary italic">MEME</span>
              </h1>
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={handleBasicDraw}
                className="w-full group relative overflow-hidden rounded-3xl bg-gray-900 text-white p-6 shadow-xl hover:shadow-2xl transition-all active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-between z-10">
                  <div className="flex flex-col items-start text-left">
                    <span className="text-2xl font-black mb-1">BASIC 가챠</span>
                    <span className="text-sm text-gray-400 font-bold">일반 하트 1개 소모</span>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Heart className="w-6 h-6 text-pink-400 fill-current" />
                  </div>
                </div>
              </button>

              <button
                onClick={handleSpecialDrawClick}
                className="w-full group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all active:scale-95"
              >
                <div className="relative flex items-center justify-between z-10">
                  <div className="flex flex-col items-start text-left">
                    <span className="text-2xl font-black mb-1">SPECIAL 가챠</span>
                    <span className="text-sm text-indigo-200 font-bold">스페셜 하트 1개 소모</span>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Zap className="w-6 h-6 text-yellow-300 fill-current" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {appState === "TAG_SELECT" && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <h2 className="text-2xl font-black mb-8 text-gray-900">오늘의 기분은?</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-5 py-2.5 rounded-full font-bold text-sm transition-all border-2",
                    selectedTags.includes(tag)
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
            <button
              onClick={executeSpecialDraw}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
            >
              선택 완료하고 뽑기!
            </button>
            <button
              onClick={() => setAppState("HOME")}
              className="mt-4 text-gray-500 font-bold text-sm underline underline-offset-4"
            >
              뒤로가기
            </button>
          </div>
        )}

        {appState === "SPINNING" && (
          <div className="w-full flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="w-48 h-48 bg-gray-100 rounded-3xl mb-8 flex items-center justify-center relative overflow-hidden border-4 border-gray-900 shadow-2xl">
              <RefreshCcw className="w-16 h-16 text-gray-300 animate-spin" />
              {/* Reduced shake animation using simple CSS inline or basic tailwind classes */}
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black tracking-widest animate-pulse text-gray-900">
              두구두구두구...
            </h2>
          </div>
        )}

        {appState === "RESULT" && memeResult && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-500">
            <div className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-2xl border-4 border-white">
              {/* Meme Image */}
              <img
                src={memeResult.imagePresignedUrl}
                alt="Meme Result"
                className="w-full h-full object-cover"
              />
              
              {/* Meme Phrase via CSS Positioning */}
              <div
                className={cn(
                  "absolute z-10 max-w-[80%]",
                  getPositionClasses(memeResult.subjectPosition)
                )}
              >
                <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gray-100 inline-block">
                  <p className="text-gray-900 font-black text-lg md:text-xl break-keep leading-snug text-center">
                    {memeResult.phrase}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full flex gap-4 mt-10">
              <button
                onClick={() => setAppState("HOME")}
                className="flex-1 py-4 bg-gray-100 text-gray-800 rounded-2xl font-black text-lg shadow-sm hover:bg-gray-200 active:scale-95 transition-all"
              >
                다시 뽑기
              </button>
              <button
                onClick={() => alert("저장 기능은 준비중입니다.")}
                className="flex-1 py-4 bg-gray-900 text-white flex items-center justify-center gap-2 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
              >
                <Download className="w-5 h-5" />
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
