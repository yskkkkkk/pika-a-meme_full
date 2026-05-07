"use client";

import { useState, useEffect, useCallback } from "react";
import { isAuthenticated, removeToken, getLoginUrl } from "@/lib/auth";

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
    setIsLoaded(true);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setLoggedIn(false);
  }, []);

  const loginWith = useCallback((provider: "kakao" | "google") => {
    window.location.href = getLoginUrl(provider);
  }, []);

  return { isLoggedIn: loggedIn, isLoaded, logout, loginWith };
}
