"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginButton() {
  const { isLoggedIn, logout, loginWith } = useAuth();
  const [open, setOpen] = useState(false);

  if (isLoggedIn) {
    return (
      <button
        onClick={logout}
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all"
      >
        <LogOut className="w-4 h-4" />
        로그아웃
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black rounded-full shadow-sm hover:bg-gray-800 transition-all"
      >
        <LogIn className="w-4 h-4" />
        로그인
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-44 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
          <button
            onClick={() => loginWith("kakao")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-yellow-50 transition-colors"
          >
            <span className="text-base">💬</span>
            카카오로 로그인
          </button>
          <button
            onClick={() => loginWith("google")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-blue-50 transition-colors border-t border-gray-100"
          >
            <span className="text-base">🔵</span>
            구글로 로그인
          </button>
        </div>
      )}
    </div>
  );
}
