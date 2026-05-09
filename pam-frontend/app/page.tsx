"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGuestHeart } from "@/hooks/useGuestHeart";
import { useAuth } from "@/hooks/useAuth";
import { composeMeme, MemeResult } from "@/hooks/useMemeApi";
import { LoginSlideMenu } from "@/components/auth/LoginSlideMenu";
import { HeartDisplay } from "@/components/domains/heart/HeartDisplay";
import { HomeScreen } from "@/components/domains/gacha/HomeScreen";
import { SpinningScreen } from "@/components/domains/gacha/SpinningScreen";
import { TagSelectScreen } from "@/components/domains/gacha/TagSelectScreen";
import { ResultScreen } from "@/components/domains/gacha/ResultScreen";

type AppState = "HOME" | "TAG_SELECT" | "SPINNING" | "RESULT";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("HOME");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [memeResult, setMemeResult] = useState<MemeResult | null>(null);

  const { hearts, consumeHeart } = useGuestHeart();
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const handleBasicDraw = async () => {
    if (hearts <= 0) {
      alert("하트가 부족합니다! 잠시 후 다시 시도하거나 로그인하세요.");
      return;
    }
    if (!consumeHeart()) return;
    setAppState("SPINNING");
    try {
      const [result] = await Promise.all([
        composeMeme("BASIC"),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
      setMemeResult(result);
      setAppState("RESULT");
      queryClient.invalidateQueries({ queryKey: ["my-memes"] });
    } catch {
      alert("오류가 발생했습니다.");
      setAppState("HOME");
    }
  };

  const handleSpecialDrawClick = () => {
    if (!isLoggedIn) {
      setIsMenuOpen(true);
      return;
    }
    setSelectedTag(null);
    setAppState("TAG_SELECT");
  };

  const executeSpecialDraw = async () => {
    if (!selectedTag) return;
    setAppState("SPINNING");
    try {
      const [result] = await Promise.all([
        composeMeme("SPECIAL", [selectedTag]),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
      setMemeResult(result);
      setAppState("RESULT");
      queryClient.invalidateQueries({ queryKey: ["my-memes"] });
    } catch {
      alert("오류가 발생했습니다.");
      setAppState("HOME");
    }
  };

  return (
    <div className="flex flex-col flex-1 relative">
      {appState === "SPINNING" && <SpinningScreen />}

      {appState !== "SPINNING" && (
        <HeartDisplay onMenuOpen={() => setIsMenuOpen(true)} />
      )}

      {appState === "HOME" && (
        <HomeScreen onBasicDraw={handleBasicDraw} onSpecialDraw={handleSpecialDrawClick} />
      )}

      {appState === "TAG_SELECT" && (
        <TagSelectScreen
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          onBack={() => setAppState("HOME")}
          onConfirm={executeSpecialDraw}
        />
      )}

      {appState === "RESULT" && memeResult && (
        <ResultScreen result={memeResult} onRedraw={() => setAppState("HOME")} />
      )}

      <LoginSlideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
