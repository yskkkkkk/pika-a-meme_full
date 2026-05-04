"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { X, LogOut, Zap, Diamond, Cloud } from "lucide-react";

interface LoginSlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginSlideMenu({ isOpen, onClose }: LoginSlideMenuProps) {
  const { isLoggedIn, loginWith, logout } = useAuth();

  return (
    <div
      className={cn(
        "absolute inset-0 bg-white z-50 transform transition-transform duration-500 ease-in-out flex flex-col overflow-y-auto",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex justify-end p-6">
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <X className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="px-8 pb-12 flex flex-col flex-1">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-4">
            PICK-A-<span className="text-primary italic">MEME</span>
          </h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            나만의 B급 감성 밈을 만들고<br />
            친구들과 공유해보세요!
          </p>
        </div>

        {isLoggedIn ? (
          <div className="mb-12 bg-gray-50 rounded-3xl p-6 text-center border border-gray-100">
            <p className="text-sm font-bold text-gray-700 mb-4">현재 로그인되어 있습니다.</p>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold shadow-sm hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          </div>
        ) : (
          <div className="mb-12 space-y-4">
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-2">
                1초만에 시작하기
              </span>
              <p className="text-sm text-gray-500">로그인하면 밈을 저장할 수 있어요!</p>
            </div>
            <button
              onClick={() => {
                loginWith("kakao");
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#FEE500] text-[#000000] rounded-xl font-bold text-lg hover:brightness-95 transition-all shadow-sm"
            >
              <span className="text-xl">💬</span>
              카카오로 계속하기
            </button>
            <button
              onClick={() => {
                loginWith("google");
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              <span className="text-xl">🔵</span>
              구글로 계속하기
            </button>
          </div>
        )}

        <div className="mt-auto space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">실시간 충전</h4>
              <p className="text-xs text-gray-500 leading-relaxed">일반 하트는 5분마다 자동으로 충전됩니다. 끊임없이 밈을 생산하세요!</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
              <Diamond className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">스페셜 밈</h4>
              <p className="text-xs text-gray-500 leading-relaxed">스페셜 하트로 더욱더 완성도 높은 밈을 생산하세요.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">나만의 밈 갤러리</h4>
              <p className="text-xs text-gray-500 leading-relaxed">로그인 후 완성 된 밈은 보관되어 언제든 다시 꺼내볼 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
