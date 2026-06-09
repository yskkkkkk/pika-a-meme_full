"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getLoginUrl } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { identifyUser, captureEvent } from "@/lib/analytics";

interface MeResponse {
  id: string;
  username: string;
  email: string;
  provider: 'kakao' | 'google';
}

export interface AuthContextValue {
  isLoggedIn: boolean;
  isLoaded: boolean;
  username: string | null;
  logout: () => void;
  loginWith: (provider: "kakao" | "google") => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthState() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<MeResponse>("/api/auth/me", { signal: controller.signal }).then((res) => {
      // AbortError인 경우 res가 {success: false, error: {code: "TIMEOUT"...}} 로 반환되거나 undefined일 수 있음
      if (controller.signal.aborted) return;
      
      const isLog = !!res?.data;
      setLoggedIn(isLog);
      setUsername(res?.data?.username ?? null);
      setIsLoaded(true);

      if (isLog && res?.data) {
        identifyUser(res.data.id, res.data.provider);
        captureEvent({ event: 'login_success', userId: res.data.id, provider: res.data.provider });
      }
    });
    return () => {
      controller.abort();
    };
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/auth-logout";
  }, []);

  const loginWith = useCallback((provider: "kakao" | "google") => {
    window.location.href = getLoginUrl(provider);
  }, []);

  return { isLoggedIn: loggedIn, isLoaded, username, logout, loginWith };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
