"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCcw, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { GachaItem, getRandomAnimal, GACHA_ANIMALS } from "@/lib/gacha";
import { useGuestHeart } from "@/hooks/useGuestHeart";
import "./GachaMachine.css";

interface GachaMachineProps {
  onSelect: (item: GachaItem) => void;
}

export function GachaMachine({ onSelect }: GachaMachineProps) {
  const { hearts, consumeHeart } = useGuestHeart();
  const [isSpinning, setIsSpinning] = useState(false);
  const [flickerIndex, setFlickerIndex] = useState(0);
  const [lastResult, setLastResult] = useState<GachaItem | null>(null);
  const [statusText, setStatusText] = useState("Ready to Gacha");

  // Flicker effect during spinning
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpinning) {
      interval = setInterval(() => {
        setFlickerIndex((prev) => (prev + 1) % GACHA_ANIMALS.length);
      }, 80); // Fast flicker
    }
    return () => clearInterval(interval);
  }, [isSpinning]);

  const handleSpin = async () => {
    if (isSpinning) return;
    
    if (hearts <= 0) {
      alert("하트가 부족합니다! 5분 뒤에 다시 시도하거나 로그인하여 충전하세요.");
      return;
    }

    setIsSpinning(true);
    setLastResult(null);
    setStatusText("두구두구두구....");

    // Dynamic status text sequence
    const statusSequence = [
      "킹받는 동물 찾는 중...",
      "데이터 분석 중 (뻥임)...",
      "거의 다 왔어요!!",
      "정체 공개 1초 전!!!!"
    ];

    let seqIdx = 0;
    const seqInterval = setInterval(() => {
      setStatusText(statusSequence[seqIdx]);
      seqIdx++;
      if (seqIdx >= statusSequence.length) clearInterval(seqInterval);
    }, 450);

    // B-grade excitement: Artificial delay for animation
    await new Promise((resolve) => setTimeout(resolve, 2200));
    clearInterval(seqInterval);

    if (consumeHeart()) {
      const result = getRandomAnimal(Math.random() > 0.8 ? "SPECIAL" : "BASIC");
      setLastResult(result);
      setIsSpinning(false);
      onSelect(result);
      setStatusText("✨ 대박사건!!! ✨");
    } else {
      setIsSpinning(false);
      setStatusText("에러났다능...");
    }
  };

  return (
    <div className="gacha-container w-full max-w-md mx-auto">
      <div className={cn("gacha-machine", isSpinning && "spinning")}>
        <div className="gacha-display mb-8">
          {isSpinning ? (
            <div className="relative w-full h-full">
              <img 
                src={GACHA_ANIMALS[flickerIndex].url} 
                alt="flicker" 
                className="w-full h-full object-cover opacity-40 grayscale"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                <RefreshCcw className="w-16 h-16 text-primary animate-spin mb-4" />
                <p className="b-grade-text text-2xl text-primary font-black animate-pulse uppercase tracking-widest">
                  {statusText}
                </p>
              </div>
              <div className="gacha-flash-overlay" />
            </div>
          ) : lastResult ? (
            <div className="relative w-full h-full">
              <img 
                src={lastResult.url} 
                alt={lastResult.name} 
                className="gacha-result" 
              />
              <div className={cn(
                "rarity-badge",
                lastResult.rarity === "SPECIAL" ? "rarity-special" : "rarity-basic"
              )}>
                {lastResult.rarity === "SPECIAL" ? "⭐ SPECIAL" : "COMMON"}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900/50 text-gray-500">
              <div className="relative">
                <Sparkles className="w-16 h-16 mb-2 opacity-10" />
                <Zap className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-bounce opacity-40" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.2em] opacity-30 mt-4">
                Insert Heart to Start
              </p>
            </div>
          )}
          <div className="gacha-shimmer" />
        </div>

        <div className="space-y-4 relative z-10">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={cn(
              "w-full py-6 rounded-2xl font-black text-2xl flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 border-b-8",
              isSpinning 
                ? "bg-gray-700 text-gray-500 border-gray-900 cursor-not-allowed translate-y-2" 
                : "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white border-purple-900 shadow-[0_15px_30px_rgba(255,0,255,0.3)] hover:shadow-[0_20px_40px_rgba(255,0,255,0.5)] hover:-translate-y-1"
            )}
          >
            <div className="flex items-center gap-3">
              <Heart className={cn("w-7 h-7", hearts > 0 ? "fill-current text-pink-300" : "")} />
              <span>{isSpinning ? "뽑는 중!!!" : "동물 가챠 슛-!"}</span>
            </div>
            {!isSpinning && (
              <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                Consume 1 Heart
              </span>
            )}
          </button>
          
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", hearts > 0 ? "bg-green-500 animate-pulse" : "bg-red-500")} />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Status: {hearts > 0 ? "Online" : "Empty"}
              </span>
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
              {lastResult ? `Got: ${lastResult.name}` : statusText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

