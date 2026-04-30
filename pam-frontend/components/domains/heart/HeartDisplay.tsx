"use client";

import { useGuestHeart } from "@/hooks/useGuestHeart";
import { Heart, Star, Clock } from "lucide-react";
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
      <div className="flex items-center gap-3 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-1.5" title="Basic Hearts (Guest Mode)">
          <Heart className={cn("w-4 h-4 fill-red-500 text-red-500", hearts === 0 && "grayscale opacity-50")} />
          <span className="text-sm font-bold text-gray-700">{hearts}/{maxHearts}</span>
        </div>
        
        {!isFull && msUntilNext !== null && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400 border-l border-gray-300 pl-3">
            <Clock className="w-3 h-3" />
            <span>{formatTime(msUntilNext)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm" title="Special Hearts (Requires Login)">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400 grayscale opacity-50" />
        <span className="text-sm font-bold text-gray-400">0</span>
      </div>
    </div>
  );
}
