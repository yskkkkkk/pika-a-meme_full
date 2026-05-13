"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getLoginUrl } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

interface MeResponse {
  id: string;
  username: string;
  email: string;
}

export interface AuthContextValue {
  isLoggedIn: boolean;
  isLoaded: boolean;
  username: string | null;
  logout: () => Promise<void>;
  loginWith: (provider: "kakao" | "google") => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthState() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<MeResponse>("/api/auth/me").then((res) => {
      setLoggedIn(!!res?.data);
      setUsername(res?.data?.username ?? null);
      setIsLoaded(true);
    });
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setLoggedIn(false);
    setUsername(null);
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
