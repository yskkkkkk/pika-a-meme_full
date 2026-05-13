import { useLanguage } from "./useLanguage";

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
  const { t } = useLanguage();

  const missions: Mission[] = [
    {
      id: "first-login",
      status: "active",
      icon: "✅",
      name: t.missions.firstLogin.name,
      desc: t.missions.firstLogin.desc,
      reward: 1,
      progress: null,
    },
    {
      id: "share-story",
      status: "active",
      icon: "📸",
      name: t.missions.shareStory.name,
      desc: t.missions.shareStory.desc,
      reward: 1,
      progress: null,
    },
    {
      id: "invite-friend",
      status: "active",
      icon: "🔗",
      name: t.missions.inviteFriend.name,
      desc: t.missions.inviteFriend.desc,
      reward: 1,
      progress: null,
    },
    {
      id: "visit-7-days",
      status: "progress",
      icon: "🗓️",
      name: t.missions.visit7Days.name,
      desc: t.missions.visit7Days.desc,
      reward: 2,
      progress: { current: 0, total: 7 },
    },
    {
      id: "fill-gallery-10",
      status: "locked",
      icon: "🔒",
      name: t.missions.fillGallery10.name,
      desc: t.missions.fillGallery10.desc,
      reward: 2,
      progress: null,
    },
  ];

  return { missions, isLoading: false };
}
