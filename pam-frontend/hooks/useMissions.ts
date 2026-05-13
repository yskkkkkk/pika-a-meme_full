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
      name: t.m_firstLogin_name,
      desc: t.m_firstLogin_desc,
      reward: 1,
      progress: null,
    },
    {
      id: "share-story",
      status: "active",
      icon: "📸",
      name: t.m_shareStory_name,
      desc: t.m_shareStory_desc,
      reward: 1,
      progress: null,
    },
    {
      id: "invite-friend",
      status: "active",
      icon: "🔗",
      name: t.m_inviteFriend_name,
      desc: t.m_inviteFriend_desc,
      reward: 1,
      progress: null,
    },
    {
      id: "visit-7-days",
      status: "progress",
      icon: "🗓️",
      name: t.m_visit7Days_name,
      desc: t.m_visit7Days_desc,
      reward: 2,
      progress: { current: 0, total: 7 },
    },
    {
      id: "fill-gallery-10",
      status: "locked",
      icon: "🔒",
      name: t.m_fillGallery10_name,
      desc: t.m_fillGallery10_desc,
      reward: 2,
      progress: null,
    },
  ];

  return { missions, isLoading: false };
}
