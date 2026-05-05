"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface HeartStatus {
  count: number;
  max: number | null;
  nextChargeAt: string | null;
}

export interface ServerHeartState {
  basic: HeartStatus;
  special: HeartStatus;
}

async function fetchHearts(): Promise<ServerHeartState> {
  const res = await apiFetch<ServerHeartState>("/api/hearts");
  if (!res || !res.success || !res.data) throw new Error(res?.error?.message ?? "하트 조회 실패");
  return res.data;
}

export function useHeart(enabled: boolean = true) {
  return useQuery({
    queryKey: ["hearts"],
    queryFn: fetchHearts,
    refetchInterval: 60_000,
    retry: false,
    enabled: enabled,
  });
}
