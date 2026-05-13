"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type MissionStatus = "DONE" | "ACTIVE" | "PROGRESS";
export type MissionType =
  | "ONE_TIME"
  | "DAILY"
  | "WEEKLY_SHARE"
  | "STREAK_3DAYS"
  | "HIDDEN";

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  rewardAmount: number;
  isHidden: boolean;
  status: MissionStatus;
  progress: { current: number; total: number } | null;
  completedAt: string | null;
  periodKey: string | null;
}

async function fetchMissions(): Promise<Mission[]> {
  const res = await apiFetch<Mission[]>("/api/missions");
  if (!res || !res.success || !res.data) return [];
  return res.data;
}

export function useMissions(enabled: boolean = true) {
  return useQuery({
    queryKey: ["missions"],
    queryFn: fetchMissions,
    enabled,
    staleTime: 30_000,
  });
}

export async function recordVisit(): Promise<void> {
  await apiFetch("/api/missions/visit", { method: "POST" });
}

export async function recordShare(shareType: "INSTAGRAM" | "KAKAO" | "OTHER"): Promise<void> {
  await apiFetch("/api/missions/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shareType }),
  });
}
