"use client";

import { useHeart } from "@/hooks/useHeart";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeartDisplay() {
  const { heart, isLoading } = useHeart();

  if (isLoading) return <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
      <div className="flex items-center gap-1.5" title="Basic Hearts (Recharges every 5m)">
        <Heart className={cn("w-4 h-4 fill-red-500 text-red-500", heart?.basic === 0 && "grayscale opacity-50")} />
        <span className="text-sm font-bold text-gray-700">{heart?.basic ?? 0}/5</span>
      </div>
      
      <div className="w-px h-4 bg-gray-300" />

      <div className="flex items-center gap-1.5" title="Special Hearts (Event Reward)">
        <Star className={cn("w-4 h-4 fill-amber-400 text-amber-400", heart?.special === 0 && "grayscale opacity-50")} />
        <span className="text-sm font-bold text-gray-700">{heart?.special ?? 0}</span>
      </div>
    </div>
  );
}
