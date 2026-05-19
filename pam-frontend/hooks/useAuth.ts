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
  logout: () => void;
  loginWith: (provider: "kakao" | "google") => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthState() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiFetch<MeResponse>("/api/auth/me").then((res) => {
      if (!isMounted) return;
      setLoggedIn(!!res?.data);
      setUsername(res?.data?.username ?? null);
      setIsLoaded(true);
    });
    return () => {
      isMounted = false;
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
