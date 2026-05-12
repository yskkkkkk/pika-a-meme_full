"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { X, LogOut, Zap, Diamond, Cloud, Images } from "lucide-react";

interface LoginSlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginSlideMenu({ isOpen, onClose }: LoginSlideMenuProps) {
  const { isLoggedIn, loginWith, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 transform transition-transform duration-500 ease-in-out flex flex-col overflow-y-auto",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      style={{ backgroundColor: "var(--pam-bg)" }}
    >
      <div className="flex justify-between items-center p-6">
        {/* 다크모드 토글 */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors"
          style={{
            backgroundColor: "var(--pam-surface)",
            color: "var(--pam-text-sub)",
            border: "1px solid var(--pam-border)",
          }}
        >
          <span>{theme === "dark" ? "☀️" : "🌙"}</span>
          <span>{theme === "dark" ? "라이트 모드" : "다크 모드"}</span>
        </button>

        <button
          onClick={onClose}
          className="p-2 rounded-full transition-colors"
          style={{ backgroundColor: "var(--pam-surface)", color: "var(--pam-text-sub)" }}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="px-8 pb-12 flex flex-col flex-1">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black tracking-tight mb-4" style={{ color: "var(--pam-text)" }}>
            PICK-A-<em style={{ color: "var(--pam-pink)", fontStyle: "italic" }}>MEME</em>
          </h2>
          <p className="font-medium leading-relaxed" style={{ color: "var(--pam-text-muted)" }}>
            나만의 B급 감성 밈을 만들고<br />
            친구들과 공유해보세요!
          </p>
        </div>

        {isLoggedIn ? (
          <div
            className="mb-12 rounded-3xl p-6 flex flex-col gap-3"
            style={{ backgroundColor: "var(--pam-surface)", border: "1px solid var(--pam-border)" }}
          >
            <button
              onClick={() => { onClose(); router.push("/my"); }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold shadow-sm transition-colors"
              style={{
                backgroundColor: "var(--pam-surface-card)",
                border: "1px solid var(--pam-border)",
                color: "var(--pam-special-text)",
              }}
            >
              <Images className="w-5 h-5" />
              내 밈 갤러리
            </button>
            <button
              onClick={async () => { await logout(); onClose(); router.replace("/"); }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold shadow-sm transition-colors"
              style={{
                backgroundColor: "var(--pam-surface-card)",
                border: "1px solid var(--pam-border)",
                color: "var(--pam-text-muted)",
              }}
            >
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          </div>
        ) : (
          <div className="mb-12 space-y-4">
            <div className="text-center mb-6">
              <span
                className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-2"
                style={{ backgroundColor: "var(--pam-surface)", color: "var(--pam-purple-text)" }}
              >
                1초만에 시작하기
              </span>
              <p className="text-sm" style={{ color: "var(--pam-text-muted)" }}>로그인하면 밈을 저장할 수 있어요!</p>
            </div>
            <button
              onClick={() => { loginWith("kakao"); onClose(); }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg hover:brightness-95 transition-all shadow-sm"
              style={{ backgroundColor: "#FEE500", color: "#000000" }}
            >
              <span className="text-xl">💬</span>
              카카오로 계속하기
            </button>
            <button
              onClick={() => { loginWith("google"); onClose(); }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all shadow-sm"
              style={{
                backgroundColor: "var(--pam-surface-card)",
                border: "1px solid var(--pam-border)",
                color: "var(--pam-text-sub)",
              }}
            >
              <span className="text-xl">🔵</span>
              구글로 계속하기
            </button>
          </div>
        )}

        <div className="mt-auto space-y-6">
          <div className="flex gap-4 items-start">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--pam-surface)", color: "var(--pam-purple-text)" }}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold mb-1" style={{ color: "var(--pam-text)" }}>실시간 충전</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--pam-text-muted)" }}>일반 하트는 5분마다 자동으로 충전됩니다. 끊임없이 밈을 생산하세요!</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--pam-surface)", color: "var(--pam-purple)" }}
            >
              <Diamond className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold mb-1" style={{ color: "var(--pam-text)" }}>스페셜 밈</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--pam-text-muted)" }}>스페셜 하트로 더욱더 완성도 높은 밈을 생산하세요.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--pam-surface)", color: "#34d399" }}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold mb-1" style={{ color: "var(--pam-text)" }}>나만의 밈 갤러리</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--pam-text-muted)" }}>로그인 후 완성 된 밈은 보관되어 언제든 다시 꺼내볼 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
