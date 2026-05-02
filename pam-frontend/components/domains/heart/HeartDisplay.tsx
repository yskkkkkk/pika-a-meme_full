"use client";

import { useAuth } from "@/hooks/useAuth";
import { useHeart } from "@/hooks/useHeart";
import { useGuestHeart } from "@/hooks/useGuestHeart";
import { Heart, Star, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function msUntilNextFromIso(nextChargeAt: string | null): number | null {
  if (!nextChargeAt) return null;
  const diff = new Date(nextChargeAt).getTime() - Date.now();
  return diff > 0 ? diff : null;
}

export function HeartDisplay() {
  const { isLoggedIn } = useAuth();
  const { data: serverHearts } = useHeart();
  const guest = useGuestHeart();

  const basicCount = isLoggedIn ? (serverHearts?.basic.count ?? 0) : guest.hearts;
  const basicMax = isLoggedIn ? (serverHearts?.basic.max ?? 5) : guest.maxHearts;
  const specialCount = isLoggedIn ? (serverHearts?.special.count ?? 0) : 0;

  const msUntilNext = useMemo(() => {
    if (isLoggedIn) return msUntilNextFromIso(serverHearts?.basic.nextChargeAt ?? null);
    return guest.msUntilNext;
  }, [isLoggedIn, serverHearts, guest.msUntilNext]);

  const isFull = basicCount >= basicMax;

  return (
    <div className="flex items-center gap-4">
      {/* BASIC 하트 */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border shadow-sm transition-all duration-300",
          isFull
            ? "border-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.4)] bg-pink-50/50"
            : "border-gray-200 hover:shadow-md"
        )}
      >
        <div className="flex items-center gap-1.5">
          <Heart
            className={cn(
              "w-5 h-5 transition-all duration-300",
              basicCount > 0 ? "fill-pink-500 text-pink-500" : "fill-gray-200 text-gray-300",
              isFull && "animate-pulse"
            )}
          />
          <span className={cn("text-sm font-black tracking-tight", isFull ? "text-pink-600" : "text-gray-700")}>
            {basicCount}
            <span className="text-gray-400 text-xs font-bold mx-0.5">/</span>
            <span className="text-gray-400">{basicMax}</span>
          </span>
        </div>

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

      {/* SPECIAL 하트 */}
      <div
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-full border shadow-sm transition-all",
          isLoggedIn && specialCount > 0
            ? "bg-amber-50 border-amber-300"
            : "bg-white/50 backdrop-blur-sm border-gray-200"
        )}
        title={isLoggedIn ? "Special Hearts" : "Special Hearts (로그인 필요)"}
      >
        <Star
          className={cn(
            "w-5 h-5",
            isLoggedIn && specialCount > 0 ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-300"
          )}
        />
        <span className={cn("text-sm font-black", isLoggedIn && specialCount > 0 ? "text-amber-600" : "text-gray-400")}>
          {specialCount}
        </span>
      </div>
    </div>
  );
}
