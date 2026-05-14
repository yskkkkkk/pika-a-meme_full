"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { X, LogOut, Zap, Diamond, Cloud, Images, Languages } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface LoginSlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginSlideMenu({ isOpen, onClose }: LoginSlideMenuProps) {
  const { isLoggedIn, loginWith, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
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
        <div className="flex items-center gap-2">
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
            <span>{theme === "dark" ? t.common.lightMode : t.common.darkMode}</span>
          </button>

          {/* 언어 토글 */}
          <button
            onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors"
            style={{
              backgroundColor: "var(--pam-surface)",
              color: "var(--pam-text-sub)",
              border: "1px solid var(--pam-border)",
            }}
          >
            <Languages className="w-4 h-4" />
            <span>{language === "ko" ? "EN" : "KO"}</span>
          </button>
        </div>

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
            {t.brand.homeTitle}
          </h2>
          <p className="font-medium leading-relaxed whitespace-pre-line" style={{ color: "var(--pam-text-muted)" }}>
            {t.auth.loginToSave}
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
              {t.gallery.myGallery}
            </button>
            <button
              onClick={() => { onClose(); logout(); }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold shadow-sm transition-colors"
              style={{
                backgroundColor: "var(--pam-surface-card)",
                border: "1px solid var(--pam-border)",
                color: "var(--pam-text-muted)",
              }}
            >
              <LogOut className="w-5 h-5" />
              {t.auth.logout}
            </button>
          </div>
        ) : (
          <div className="mb-12 space-y-4">
            <div className="text-center mb-6">
              <span
                className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-2"
                style={{ backgroundColor: "var(--pam-surface)", color: "var(--pam-purple-text)" }}
              >
                {t.auth.quickStart}
              </span>
              <p className="text-sm" style={{ color: "var(--pam-text-muted)" }}>{t.auth.loginToSave}</p>
            </div>
            <button
              onClick={() => { loginWith("kakao"); onClose(); }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg hover:brightness-95 transition-all shadow-sm"
              style={{ backgroundColor: "#FEE500", color: "#000000" }}
            >
              <span className="text-xl">💬</span>
              {t.auth.continueWithKakao}
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
              {t.auth.continueWithGoogle}
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
              <h4 className="font-bold mb-1" style={{ color: "var(--pam-text)" }}>{t.benefits.realtimeRefill}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--pam-text-muted)" }}>{t.benefits.realtimeRefillDesc}</p>
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
              <h4 className="font-bold mb-1" style={{ color: "var(--pam-text)" }}>{t.benefits.specialCard}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--pam-text-muted)" }}>{t.benefits.specialCardDesc}</p>
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
              <h4 className="font-bold mb-1" style={{ color: "var(--pam-text)" }}>{t.benefits.myGalleryDesc}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--pam-text-muted)" }}>{t.benefits.myGalleryFeatureDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
