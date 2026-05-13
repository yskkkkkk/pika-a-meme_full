"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHeart } from "@/hooks/useHeart";
import { useGuestHeart } from "@/components/GuestHeartProvider";
import { useMissions, type Mission } from "@/hooks/useMissions";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  onMenuOpen: () => void;
}

export function HeartDisplay({ onMenuOpen }: Props) {
  const { isLoggedIn } = useAuth();
  const { data: serverHearts } = useHeart(isLoggedIn);
  const guest = useGuestHeart();
  const { missions, isLoading } = useMissions();
  const { theme, toggleTheme } = useTheme();
  const [missionOpen, setMissionOpen] = useState(false);

  const heartsReady = !isLoggedIn || serverHearts != null;
  const basicCount = isLoggedIn ? (serverHearts?.basic.count ?? 0) : guest.hearts;
  const basicMax = isLoggedIn ? (serverHearts?.basic.max ?? 5) : guest.maxHearts;
  const specialCount = isLoggedIn ? (serverHearts?.special.count ?? 0) : 0;

  const hasUnfinishedMissions =
    missions.some((m) => m.status === "active" || m.status === "progress");

  return (
    <>
      {/* Top bar */}
      <div
        className="flex items-center z-10 relative"
        style={{ padding: "10px 12px 8px", gap: 6 }}
      >
        {/* BASIC energy bar */}
        <div
          className="flex items-center flex-1 min-w-0"
          style={{
            gap: 6,
            borderRadius: 20,
            padding: "8px 12px",
            backgroundColor: "var(--pam-surface-card)",
            border: "1px solid var(--pam-border)",
            boxShadow: "0 2px 12px var(--pam-shadow-pink)",
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 34, height: 34, borderRadius: 10, fontSize: 16,
              background: "linear-gradient(135deg, var(--pam-pink), #ff3b6b)",
              boxShadow: "0 3px 10px var(--pam-shadow-pink-strong)",
            }}
          >
            ❤️
          </div>
          <div className="flex flex-col flex-1 min-w-0" style={{ gap: 3 }}>
            <div className="font-bold" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--pam-text-faint)" }}>
              BASIC
            </div>
            <div className="overflow-hidden rounded-full w-full" style={{ height: 6, backgroundColor: "var(--pam-progress-bg)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: heartsReady ? `${(basicCount / basicMax) * 100}%` : "0%",
                  background: "linear-gradient(90deg, var(--pam-pink), var(--pam-pink-light))",
                }}
              />
            </div>
          </div>
          <div className="font-black leading-none flex-shrink-0" style={{ fontSize: 19, color: "var(--pam-text)" }}>
            {heartsReady ? basicCount : <span style={{ color: "var(--pam-text-disabled)" }}>—</span>}
            <span className="font-semibold" style={{ fontSize: 12, color: "var(--pam-text-disabled)" }}>/{basicMax}</span>
          </div>
        </div>

        {/* SPECIAL heart tap button — 로그인 유저만 노출 */}
        {!isLoggedIn ? null : <button
          onClick={() => setMissionOpen(true)}
          className="flex items-center relative active:scale-95 transition-transform"
          style={{
            gap: 5,
            borderRadius: 14,
            padding: "8px 12px",
            background: `linear-gradient(135deg, var(--pam-special-from), var(--pam-special-to))`,
            border: "1px solid var(--pam-special-border)",
            boxShadow: "0 2px 12px var(--pam-shadow-special)",
          }}
        >
          {hasUnfinishedMissions && (
            <div
              className="absolute flex items-center justify-center rounded-full border-2"
              style={{ top: -4, right: -4, width: 14, height: 14, backgroundColor: "var(--pam-pink)", borderColor: "var(--pam-bg)" }}
            >
              <span className="font-black text-white" style={{ fontSize: 8 }}>!</span>
            </div>
          )}
          <span style={{ fontSize: 19, filter: "drop-shadow(0 2px 4px var(--pam-shadow-purple-btn))" }}>⚡</span>
          <span className="font-black" style={{ fontSize: 19, color: "var(--pam-special-text)" }}>
            {heartsReady ? specialCount : <span style={{ color: "var(--pam-text-disabled)" }}>—</span>}
          </span>
        </button>}

        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center"
          style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            backgroundColor: "var(--pam-surface-card)",
            border: "1px solid var(--pam-border)",
            boxShadow: "0 2px 8px var(--pam-shadow-pink)",
            fontSize: 16,
          }}
          aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Menu button */}
        <button
          onClick={onMenuOpen}
          className="flex items-center justify-center"
          style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            backgroundColor: "var(--pam-surface-card)",
            border: "1px solid var(--pam-border)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <rect width="16" height="2" rx="1" fill="var(--pam-text-muted)" />
            <rect y="5" width="16" height="2" rx="1" fill="var(--pam-text-muted)" />
            <rect y="10" width="16" height="2" rx="1" fill="var(--pam-text-muted)" />
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
        className="absolute bottom-0 left-0 right-0 rounded-t-[32px] z-40 pb-10 transition-transform duration-300"
        style={{
          backgroundColor: "var(--pam-bg)",
          transform: missionOpen ? "translateY(0)" : "translateY(100%)",
          boxShadow: "0 -8px 40px var(--pam-shadow-purple-btn)",
        }}
      >
        <div className="w-10 h-[5px] rounded-full mx-auto mt-4" style={{ backgroundColor: "var(--pam-menu-handle)" }} />

        {/* Sheet header */}
        <div className="flex items-center" style={{ gap: 12, padding: "16px 24px 14px", borderBottom: "1px solid var(--pam-border)" }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 40, height: 40, borderRadius: 12, fontSize: 20,
              background: `linear-gradient(135deg, var(--pam-special-from), var(--pam-special-to))`,
            }}
          >
            ⚡
          </div>
          <div>
            <div className="font-black" style={{ fontSize: 16, color: "var(--pam-text)" }}>스페셜 하트 획득</div>
            <div style={{ fontSize: 13, marginTop: 2, color: "var(--pam-text-muted)" }}>미션 완료 시 지급돼요</div>
          </div>
          <button
            onClick={() => setMissionOpen(false)}
            className="ml-auto flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: "50%", fontSize: 16, backgroundColor: "var(--pam-surface)", color: "var(--pam-text-muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Mission list */}
        <div className="flex flex-col" style={{ padding: "8px 16px", gap: 4 }}>
          {isLoading && (
            <div className="text-center font-medium py-8" style={{ fontSize: 14, color: "var(--pam-text-disabled)" }}>
              불러오는 중...
            </div>
          )}
          {!isLoading && missions.length === 0 && (
            <div className="flex flex-col items-center py-10" style={{ gap: 8 }}>
              <div style={{ fontSize: 36 }}>⚡</div>
              <div className="font-bold text-center" style={{ fontSize: 14, color: "var(--pam-text-faint)" }}>
                {isLoggedIn ? "진행 가능한 미션이 없어요" : "로그인하면 미션을 확인할 수 있어요"}
              </div>
            </div>
          )}
          {missions.map((m: Mission) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-[16px]"
              style={{
                padding: "14px 16px",
                backgroundColor:
                  m.status === "done" ? "var(--pam-surface)"
                  : m.status === "locked" ? "var(--pam-surface)"
                  : "var(--pam-surface-card)",
                opacity: m.status === "locked" ? 0.6 : 1,
              }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 42, height: 42, borderRadius: 13, fontSize: 20,
                  background:
                    m.status === "done" ? "linear-gradient(135deg, #e8f8f0, #c8f0dc)"
                    : m.status === "progress" ? `linear-gradient(135deg, var(--pam-special-from), var(--pam-special-to))`
                    : m.status === "active" ? `linear-gradient(135deg, var(--pam-surface), var(--pam-border-pink))`
                    : "var(--pam-surface)",
                }}
              >
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold" style={{ fontSize: 14, color: "var(--pam-text)" }}>{m.name}</div>
                <div style={{ fontSize: 12, marginTop: 2, color: "var(--pam-text-muted)" }}>{m.desc}</div>
                {m.progress && (
                  <div className="overflow-hidden rounded-full" style={{ height: 5, background: "var(--pam-progress-bg)", marginTop: 7 }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(m.progress.current / m.progress.total) * 100}%`,
                        background: "linear-gradient(90deg, var(--pam-purple), var(--pam-pink))",
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
                <div className="flex items-center gap-[3px] rounded-full flex-shrink-0" style={{ padding: "5px 11px", backgroundColor: "var(--pam-surface)" }}>
                  <span style={{ fontSize: 13 }}>⚡</span>
                  <strong className="font-black" style={{ fontSize: 13, color: "var(--pam-special-text)" }}>+{m.reward}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
