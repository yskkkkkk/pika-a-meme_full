"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGuestHeart } from "@/components/GuestHeartProvider";
import { useHeart, ServerHeartState } from "@/hooks/useHeart";
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

  const { isLoggedIn, username } = useAuth();
  const guest = useGuestHeart();
  const { data: serverHearts, isLoading: heartsLoading } = useHeart(isLoggedIn);
  const queryClient = useQueryClient();

  // 로그아웃 시 진행 중인 화면 초기화
  useEffect(() => {
    if (!isLoggedIn && appState !== "HOME") {
      setAppState("HOME");
      setMemeResult(null);
      setSelectedTag(null);
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // 최초 로그인 웰컴 알럿
  useEffect(() => {
    if (!isLoggedIn) return;
    if (localStorage.getItem("pam_show_welcome") !== "1") return;
    localStorage.removeItem("pam_show_welcome");
    queryClient.invalidateQueries({ queryKey: ["hearts"] });
    // 약간의 딜레이 후 표시 (하트 UI가 렌더된 후)
    const t = setTimeout(() => {
      alert("🎉 환영합니다! 가입 축하 선물로 스페셜 하트 ⚡ 1개를 드렸어요!");
    }, 500);
    return () => clearTimeout(t);
  }, [isLoggedIn, queryClient]);

  const handleBasicDraw = async () => {
    // 로그인 유저: 서버 하트 잔액 확인 (API가 차감 처리)
    // 게스트: localStorage 하트 확인 및 소모
    if (isLoggedIn) {
      if (heartsLoading) return;
      if ((serverHearts?.basic.count ?? 0) <= 0) {
        alert("하트가 부족합니다! 미션을 완료하거나 잠시 후 다시 시도하세요.");
        return;
      }
    } else {
      if (guest.hearts <= 0) {
        alert("하트가 부족합니다! 잠시 후 다시 시도하거나 로그인하세요.");
        return;
      }
      if (!guest.consumeHeart()) return;
    }

    // 옵티미스틱 업데이트: API 완료 전에 즉시 하트 1 감소
    if (isLoggedIn) {
      queryClient.setQueryData<ServerHeartState>(["hearts"], (old) =>
        old ? { ...old, basic: { ...old.basic, count: Math.max(0, old.basic.count - 1) } } : old
      );
    }
    setAppState("SPINNING");
    try {
      const [result] = await Promise.all([
        composeMeme("BASIC"),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
      setMemeResult(result);
      setAppState("RESULT");
      queryClient.invalidateQueries({ queryKey: ["my-memes"] });
      queryClient.invalidateQueries({ queryKey: ["recent-matched-memes"] });
      queryClient.refetchQueries({ queryKey: ["hearts"] }); // 서버 실제값으로 보정
    } catch (e) {
      queryClient.invalidateQueries({ queryKey: ["hearts"] }); // 롤백: 서버 재조회
      alert(e instanceof Error ? e.message : "오류가 발생했습니다.");
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
    // 옵티미스틱 업데이트: 스페셜 하트 즉시 1 감소
    queryClient.setQueryData<ServerHeartState>(["hearts"], (old) =>
      old ? { ...old, special: { ...old.special, count: Math.max(0, old.special.count - 1) } } : old
    );
    setAppState("SPINNING");
    try {
      const [result] = await Promise.all([
        composeMeme("SPECIAL", [selectedTag]),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
      setMemeResult(result);
      setAppState("RESULT");
      queryClient.invalidateQueries({ queryKey: ["my-memes"] });
      queryClient.invalidateQueries({ queryKey: ["recent-matched-memes"] });
      queryClient.refetchQueries({ queryKey: ["hearts"] }); // 서버 실제값으로 보정
    } catch (e) {
      queryClient.invalidateQueries({ queryKey: ["hearts"] }); // 롤백: 서버 재조회
      alert(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setAppState("HOME");
    }
  };

  return (
    <div className="flex flex-col flex-1 relative">
      {appState === "SPINNING" && <SpinningScreen />}

      {/* SPINNING 중에도 unmount 않고 숨김 — React Query observer 유지로 가챠 후 즉시 갱신 */}
      <div className={appState === "SPINNING" ? "hidden" : "contents"}>
        <HeartDisplay onMenuOpen={() => setIsMenuOpen(true)} />
      </div>

      {appState === "HOME" && (
        <HomeScreen
          onBasicDraw={handleBasicDraw}
          onSpecialDraw={handleSpecialDrawClick}
          username={username}
          guestHeartCount={isLoggedIn ? undefined : guest.hearts}
        />
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
