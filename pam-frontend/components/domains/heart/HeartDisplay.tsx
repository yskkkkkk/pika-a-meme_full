"use client";

import { useGuestHeart } from "@/hooks/useGuestHeart";
import { Heart, Star, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeartDisplay() {
  const { hearts, msUntilNext, maxHearts, isFull } = useGuestHeart();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-4">
      {/* Basic (Guest) Hearts */}
      <div 
        className={cn(
          "flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border shadow-sm transition-all duration-300",
          isFull 
            ? "border-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.4)] bg-pink-50/50" 
            : "border-gray-200 hover:shadow-md"
        )}
      >
        <div className="flex items-center gap-1.5" title="Basic Hearts (Guest Mode)">
          <Heart 
            className={cn(
              "w-5 h-5 transition-all duration-300", 
              hearts > 0 ? "fill-pink-500 text-pink-500" : "fill-gray-200 text-gray-300",
              isFull && "animate-pulse"
            )} 
          />
          <span className={cn(
            "text-sm font-black tracking-tight",
            isFull ? "text-pink-600" : "text-gray-700"
          )}>
            {hearts}
            <span className="text-gray-400 text-xs font-bold mx-0.5">/</span>
            <span className="text-gray-400">{maxHearts}</span>
          </span>
        </div>
        
        {/* 타이머 */}
        {!isFull && msUntilNext !== null && (
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-pink-500 border-l border-gray-200 pl-3">
            <Clock className="w-3.5 h-3.5" />
            <span className="min-w-[40px]">{formatTime(msUntilNext)}</span>
          </div>
        )}

        {isFull && (
          <div className="flex items-center gap-1 text-xs font-black italic text-pink-500 border-l border-pink-200 pl-3 uppercase">
            <Zap className="w-3.5 h-3.5 fill-pink-500" />
            <span>MAX</span>
          </div>
        )}
      </div>

      {/* Special Hearts (Login required) - placeholder */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm" title="Special Hearts (Requires Login)">
        <Star className="w-5 h-5 fill-amber-400 text-amber-400 grayscale opacity-50" />
        <span className="text-sm font-black text-gray-400">0</span>
      </div>
    </div>
  );
}
