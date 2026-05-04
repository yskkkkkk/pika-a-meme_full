"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHeart } from "@/hooks/useHeart";
import { useGuestHeart } from "@/hooks/useGuestHeart";

interface Props {
  onMenuOpen: () => void;
}

const MISSIONS = [
  {
    id: "first-login",
    status: "done",
    icon: "👋",
    name: "첫 로그인",
    desc: "서비스에 처음 로그인했어요",
    reward: 1,
    progress: null as null | { current: number; total: number },
  },
  {
    id: "story-share",
    status: "active",
    icon: "📸",
    name: "스토리 공유하기",
    desc: "밈을 인스타 스토리에 공유해보세요",
    reward: 1,
    progress: null as null | { current: number; total: number },
  },
  {
    id: "invite",
    status: "active",
    icon: "🔗",
    name: "친구 초대하기",
    desc: "초대 링크로 친구를 데려오세요",
    reward: 1,
    progress: null as null | { current: number; total: number },
  },
  {
    id: "streak",
    status: "progress",
    icon: "🗓️",
    name: "7일 연속 방문",
    desc: "매일 접속하면 보상이 두 배!",
    reward: 2,
    progress: { current: 3, total: 7 },
  },
  {
    id: "gallery",
    status: "locked",
    icon: "🔒",
    name: "갤러리 10개 채우기",
    desc: "밈을 10개 생성하면 해금돼요",
    reward: 2,
    progress: null as null | { current: number; total: number },
  },
];

export function HeartDisplay({ onMenuOpen }: Props) {
  const { isLoggedIn } = useAuth();
  const { data: serverHearts } = useHeart(isLoggedIn);
  const guest = useGuestHeart();
  const [missionOpen, setMissionOpen] = useState(false);

  const basicCount = isLoggedIn ? (serverHearts?.basic.count ?? 0) : guest.hearts;
  const basicMax = isLoggedIn ? (serverHearts?.basic.max ?? 5) : guest.maxHearts;
  const specialCount = isLoggedIn ? (serverHearts?.special.count ?? 0) : 0;

  const hasUnfinishedMissions = MISSIONS.some(
    (m) => m.status === "active" || m.status === "progress"
  );

  return (
    <>
      {/* Top bar — padding: 14px 20px 10px (heart-ui-mockup 기준) */}
      <div
        className="flex items-center justify-between z-10 relative"
        style={{ padding: "14px 20px 10px" }}
      >
        {/* BASIC energy bar */}
        <div
          className="flex items-center gap-[10px] bg-white border border-[#f0e8f5] rounded-[16px]"
          style={{
            padding: "8px 12px",
            boxShadow: "0 2px 12px rgba(255,107,157,0.1)",
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0 text-[16px]"
            style={{
              width: 32, height: 32,
              background: "linear-gradient(135deg, #FF6B9D, #ff3b6b)",
              borderRadius: 10,
              boxShadow: "0 3px 10px rgba(255,59,107,0.35)",
            }}
          >
            ❤️
          </div>
          <div className="flex flex-col gap-[3px]">
            <div className="text-[9px] font-bold text-[#bbb] tracking-[0.1em]">BASIC</div>
            <div
              className="overflow-hidden rounded-full"
              style={{ width: 72, height: 6, background: "#f0e8f5" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(basicCount / basicMax) * 100}%`,
                  background: "linear-gradient(90deg, #FF6B9D, #ff8fb3)",
                }}
              />
            </div>
          </div>
          <div className="font-black text-[#111] leading-none" style={{ fontSize: 18 }}>
            {basicCount}
            <span className="font-medium text-[#ccc]" style={{ fontSize: 11 }}>/{basicMax}</span>
          </div>
        </div>

        {/* SPECIAL heart tap button */}
        <button
          onClick={() => setMissionOpen(true)}
          className="flex items-center relative border border-[#dbc8ff] rounded-[14px] active:scale-95 transition-transform"
          style={{
            gap: 6,
            padding: "8px 12px",
            background: "linear-gradient(135deg, #f5eeff, #ede0ff)",
            boxShadow: "0 2px 12px rgba(196,77,255,0.1)",
          }}
        >
          {hasUnfinishedMissions && (
            <div
              className="absolute flex items-center justify-center bg-[#FF6B9D] rounded-full border-2 border-white"
              style={{ top: -4, right: -4, width: 14, height: 14 }}
            >
              <span className="text-[8px] font-black text-white">!</span>
            </div>
          )}
          <span
            style={{ fontSize: 18, filter: "drop-shadow(0 2px 4px rgba(196,77,255,0.4))" }}
          >
            ⚡
          </span>
          <span className="font-black text-[#7c3aed]" style={{ fontSize: 18 }}>
            {specialCount}
          </span>
        </button>

        {/* Menu button */}
        <button
          onClick={onMenuOpen}
          className="flex items-center justify-center bg-white border border-[#f0e8f5]"
          style={{
            width: 36, height: 36,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <rect width="16" height="2" rx="1" fill="#555" />
            <rect y="5" width="16" height="2" rx="1" fill="#555" />
            <rect y="10" width="16" height="2" rx="1" fill="#555" />
          </svg>
        </button>
      </div>

      {/* Overlay */}
      {missionOpen && (
        <div
          className="absolute inset-0 bg-black/40 z-30 backdrop-blur-[2px]"
          onClick={() => setMissionOpen(false)}
        />
      )}

      {/* Mission slide-up sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] z-40 pb-8 transition-transform duration-300"
        style={{
          transform: missionOpen ? "translateY(0)" : "translateY(100%)",
          boxShadow: "0 -8px 40px rgba(196,77,255,0.15)",
        }}
      >
        <div className="w-[36px] h-[4px] bg-[#e8e0f0] rounded-full mx-auto mt-3" />
        <div className="flex items-center gap-[10px] px-5 py-4 border-b border-[#f5f0fa]">
          <div
            className="flex items-center justify-center text-[18px]"
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: "linear-gradient(135deg, #ede0ff, #dbc8ff)",
            }}
          >
            ⚡
          </div>
          <div>
            <div className="text-[15px] font-black text-[#111]">스페셜 하트 획득</div>
            <div className="text-[11px] text-[#aaa] mt-[1px]">미션 완료 시 지급돼요</div>
          </div>
          <button
            onClick={() => setMissionOpen(false)}
            className="ml-auto flex items-center justify-center bg-[#f5f0fa] text-[#999]"
            style={{ width: 28, height: 28, borderRadius: "50%", fontSize: 14 }}
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-2 flex flex-col gap-1">
          {MISSIONS.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 rounded-[16px] ${
                m.status === "done"
                  ? "bg-[#fdf8ff]"
                  : m.status === "locked"
                  ? "bg-[#fafafa] opacity-60"
                  : "bg-white"
              }`}
              style={{ padding: "12px 14px" }}
            >
              <div
                className={`flex items-center justify-center text-[18px] flex-shrink-0 ${
                  m.status === "done"
                    ? "bg-gradient-to-br from-[#e8f8f0] to-[#c8f0dc]"
                    : m.status === "progress"
                    ? "bg-gradient-to-br from-[#f0f0ff] to-[#e0dcff]"
                    : m.status === "active"
                    ? "bg-gradient-to-br from-[#fff0f8] to-[#ffd6eb]"
                    : "bg-[#f0f0f0]"
                }`}
                style={{ width: 38, height: 38, borderRadius: 12 }}
              >
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-[#111]">{m.name}</div>
                <div className="text-[11px] text-[#aaa] mt-[2px]">{m.desc}</div>
                {m.progress && (
                  <div
                    className="overflow-hidden rounded-full mt-[6px]"
                    style={{ height: 4, background: "#f0e8ff" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(m.progress.current / m.progress.total) * 100}%`,
                        background: "linear-gradient(90deg, #C44DFF, #FF6B9D)",
                      }}
                    />
                  </div>
                )}
              </div>
              {m.status === "done" ? (
                <div
                  className="flex items-center justify-center text-[11px] text-white font-black flex-shrink-0"
                  style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "linear-gradient(135deg, #34d399, #10b981)",
                  }}
                >
                  ✓
                </div>
              ) : (
                <div
                  className="flex items-center gap-[3px] bg-[#f5eeff] rounded-full flex-shrink-0"
                  style={{ padding: "4px 10px" }}
                >
                  <span className="text-[12px]">⚡</span>
                  <strong className="text-[12px] font-black text-[#7c3aed]">+{m.reward}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
