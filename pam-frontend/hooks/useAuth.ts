"use client";

import { useState, useEffect, useCallback } from "react";
import { getLoginUrl } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

interface MeResponse {
  id: string;
  username: string;
  email: string;
}

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    apiFetch<MeResponse>("/api/auth/me").then((res) => {
      setLoggedIn(!!res?.data);
    });
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setLoggedIn(false);
  }, []);

  const loginWith = useCallback((provider: "kakao" | "google") => {
    window.location.href = getLoginUrl(provider);
  }, []);

  return { isLoggedIn: loggedIn, logout, loginWith };
}
