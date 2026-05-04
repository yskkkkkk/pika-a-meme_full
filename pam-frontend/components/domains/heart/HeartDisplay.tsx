"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHeart } from "@/hooks/useHeart";
import { useGuestHeart } from "@/hooks/useGuestHeart";
import { useMissions, type Mission } from "@/hooks/useMissions";

interface Props {
  onMenuOpen: () => void;
}

export function HeartDisplay({ onMenuOpen }: Props) {
  const { isLoggedIn } = useAuth();
  const { data: serverHearts } = useHeart(isLoggedIn);
  const guest = useGuestHeart();
  const { missions, isLoading } = useMissions();
  const [missionOpen, setMissionOpen] = useState(false);

  const basicCount = isLoggedIn ? (serverHearts?.basic.count ?? 0) : guest.hearts;
  const basicMax = isLoggedIn ? (serverHearts?.basic.max ?? 5) : guest.maxHearts;
  const specialCount = isLoggedIn ? (serverHearts?.special.count ?? 0) : 0;

  const hasUnfinishedMissions =
    missions.some((m) => m.status === "active" || m.status === "progress");

  return (
    <>
      {/* Top bar — 500px 컨테이너 기준 */}
      <div
        className="flex items-center justify-between z-10 relative"
        style={{ padding: "16px 24px 12px" }}
      >
        {/* BASIC energy bar */}
        <div
          className="flex items-center bg-white border border-[#f0e8f5]"
          style={{
            gap: 12,
            borderRadius: 20,
            padding: "10px 15px",
            boxShadow: "0 2px 12px rgba(255,107,157,0.1)",
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 40, height: 40, borderRadius: 11, fontSize: 18,
              background: "linear-gradient(135deg, #FF6B9D, #ff3b6b)",
              boxShadow: "0 3px 10px rgba(255,59,107,0.35)",
            }}
          >
            ❤️
          </div>
          <div className="flex flex-col" style={{ gap: 4 }}>
            <div className="font-bold text-[#bbb]" style={{ fontSize: 9, letterSpacing: "0.1em" }}>
              BASIC
            </div>
            <div className="overflow-hidden rounded-full" style={{ width: 88, height: 7, background: "#f0e8f5" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(basicCount / basicMax) * 100}%`,
                  background: "linear-gradient(90deg, #FF6B9D, #ff8fb3)",
                }}
              />
            </div>
          </div>
          <div className="font-black text-[#111] leading-none" style={{ fontSize: 22 }}>
            {basicCount}
            <span className="font-medium text-[#ccc]" style={{ fontSize: 13 }}>/{basicMax}</span>
          </div>
        </div>

        {/* SPECIAL heart tap button */}
        <button
          onClick={() => setMissionOpen(true)}
          className="flex items-center relative border border-[#dbc8ff] active:scale-95 transition-transform"
          style={{
            gap: 8,
            borderRadius: 16,
            padding: "10px 15px",
            background: "linear-gradient(135deg, #f5eeff, #ede0ff)",
            boxShadow: "0 2px 12px rgba(196,77,255,0.1)",
          }}
        >
          {hasUnfinishedMissions && (
            <div
              className="absolute flex items-center justify-center bg-[#FF6B9D] rounded-full border-2 border-white"
              style={{ top: -4, right: -4, width: 16, height: 16 }}
            >
              <span className="font-black text-white" style={{ fontSize: 9 }}>!</span>
            </div>
          )}
          <span style={{ fontSize: 22, filter: "drop-shadow(0 2px 4px rgba(196,77,255,0.4))" }}>⚡</span>
          <span className="font-black text-[#7c3aed]" style={{ fontSize: 22 }}>{specialCount}</span>
        </button>

        {/* Menu button */}
        <button
          onClick={onMenuOpen}
          className="flex items-center justify-center bg-white border border-[#f0e8f5]"
          style={{
            width: 44, height: 44, borderRadius: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
            <rect width="18" height="2" rx="1" fill="#555" />
            <rect y="5.5" width="18" height="2" rx="1" fill="#555" />
            <rect y="11" width="18" height="2" rx="1" fill="#555" />
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
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-40 pb-10 transition-transform duration-300"
        style={{
          transform: missionOpen ? "translateY(0)" : "translateY(100%)",
          boxShadow: "0 -8px 40px rgba(196,77,255,0.15)",
        }}
      >
        <div className="w-10 h-[5px] bg-[#e8e0f0] rounded-full mx-auto mt-4" />

        {/* Sheet header */}
        <div className="flex items-center border-b border-[#f5f0fa]" style={{ gap: 12, padding: "16px 24px 14px" }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 40, height: 40, borderRadius: 12, fontSize: 20,
              background: "linear-gradient(135deg, #ede0ff, #dbc8ff)",
            }}
          >
            ⚡
          </div>
          <div>
            <div className="font-black text-[#111]" style={{ fontSize: 16 }}>스페셜 하트 획득</div>
            <div className="text-[#aaa]" style={{ fontSize: 13, marginTop: 2 }}>미션 완료 시 지급돼요</div>
          </div>
          <button
            onClick={() => setMissionOpen(false)}
            className="ml-auto flex items-center justify-center bg-[#f5f0fa] text-[#999]"
            style={{ width: 32, height: 32, borderRadius: "50%", fontSize: 16 }}
          >
            ✕
          </button>
        </div>

        {/* Mission list */}
        <div className="flex flex-col" style={{ padding: "8px 16px", gap: 4 }}>
          {isLoading && (
            <div className="text-center text-[#ccc] font-medium py-8" style={{ fontSize: 14 }}>
              불러오는 중...
            </div>
          )}
          {!isLoading && missions.length === 0 && (
            <div className="flex flex-col items-center py-10" style={{ gap: 8 }}>
              <div style={{ fontSize: 36 }}>⚡</div>
              <div className="font-bold text-[#bbb] text-center" style={{ fontSize: 14 }}>
                {isLoggedIn ? "진행 가능한 미션이 없어요" : "로그인하면 미션을 확인할 수 있어요"}
              </div>
            </div>
          )}
          {missions.map((m: Mission) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 rounded-[16px] ${
                m.status === "done"
                  ? "bg-[#fdf8ff]"
                  : m.status === "locked"
                  ? "bg-[#fafafa] opacity-60"
                  : "bg-white"
              }`}
              style={{ padding: "14px 16px" }}
            >
              <div
                className={`flex items-center justify-center flex-shrink-0 ${
                  m.status === "done"
                    ? "bg-gradient-to-br from-[#e8f8f0] to-[#c8f0dc]"
                    : m.status === "progress"
                    ? "bg-gradient-to-br from-[#f0f0ff] to-[#e0dcff]"
                    : m.status === "active"
                    ? "bg-gradient-to-br from-[#fff0f8] to-[#ffd6eb]"
                    : "bg-[#f0f0f0]"
                }`}
                style={{ width: 42, height: 42, borderRadius: 13, fontSize: 20 }}
              >
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#111]" style={{ fontSize: 14 }}>{m.name}</div>
                <div className="text-[#aaa]" style={{ fontSize: 12, marginTop: 2 }}>{m.desc}</div>
                {m.progress && (
                  <div className="overflow-hidden rounded-full" style={{ height: 5, background: "#f0e8ff", marginTop: 7 }}>
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
                  className="flex items-center justify-center text-white font-black flex-shrink-0"
                  style={{ width: 24, height: 24, borderRadius: "50%", fontSize: 12, background: "linear-gradient(135deg, #34d399, #10b981)" }}
                >
                  ✓
                </div>
              ) : (
                <div className="flex items-center gap-[3px] bg-[#f5eeff] rounded-full flex-shrink-0" style={{ padding: "5px 11px" }}>
                  <span style={{ fontSize: 13 }}>⚡</span>
                  <strong className="font-black text-[#7c3aed]" style={{ fontSize: 13 }}>+{m.reward}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
