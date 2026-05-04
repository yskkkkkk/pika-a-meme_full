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

const BASE_MISSIONS: Mission[] = [
  {
    id: "first-login",
    status: "active",
    icon: "✅",
    name: "최초 로그인",
    desc: "로그인하면 즉시 완료돼요",
    reward: 1,
    progress: null,
  },
  {
    id: "share-story",
    status: "active",
    icon: "📸",
    name: "스토리 공유하기",
    desc: "완성 밈을 스토리에 공유해요",
    reward: 1,
    progress: null,
  },
  {
    id: "invite-friend",
    status: "active",
    icon: "🔗",
    name: "친구 초대하기",
    desc: "친구에게 링크를 보내보세요",
    reward: 1,
    progress: null,
  },
  {
    id: "visit-7-days",
    status: "progress",
    icon: "🗓️",
    name: "7일 연속 방문",
    desc: "매일 방문해서 연속 기록을 쌓아요",
    reward: 2,
    progress: { current: 3, total: 7 },
  },
  {
    id: "fill-gallery-10",
    status: "locked",
    icon: "🔒",
    name: "갤러리 10개 채우기",
    desc: "밈 10개를 만들면 오픈돼요",
    reward: 2,
    progress: null,
  },
];

export function useMissions(): { missions: Mission[]; isLoading: boolean } {
  // API 미구현 상태 — 고정 미션 템플릿 우선 노출
  // 연동 시: useQuery({ queryKey: ["missions"], queryFn: fetchMissions })
  return { missions: BASE_MISSIONS, isLoading: false };
}
