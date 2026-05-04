"use client";

// TODO: 백엔드 미션 API 구현 후 실제 데이터로 교체
// GET /api/users/me/missions 형태로 연동 예정

export type MissionStatus = "done" | "active" | "progress" | "locked";

export interface Mission {
  id: string;
  status: MissionStatus;
  icon: string;
  name: string;
  desc: string;
  reward: number;
  progress: { current: number; total: number } | null;
}

export function useMissions(): { missions: Mission[]; isLoading: boolean } {
  // API 미구현 상태 — 빈 배열 반환
  // 연동 시: useQuery({ queryKey: ["missions"], queryFn: fetchMissions })
  return { missions: [], isLoading: false };
}
