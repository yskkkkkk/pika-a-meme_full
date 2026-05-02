"use client";

import { useState, useEffect, useCallback } from "react";
import { isAuthenticated, removeToken, getLoginUrl } from "@/lib/auth";

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setLoggedIn(false);
  }, []);

  const loginWith = useCallback((provider: "kakao" | "google") => {
    window.location.href = getLoginUrl(provider);
  }, []);

  return { isLoggedIn: loggedIn, logout, loginWith };
}
