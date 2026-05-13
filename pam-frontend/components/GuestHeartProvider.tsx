"use client";

import { createContext, useContext } from "react";
import { useGuestHeartCore, type GuestHeartApi } from "@/hooks/useGuestHeart";

const GuestHeartContext = createContext<GuestHeartApi | null>(null);

export function GuestHeartProvider({ children }: { children: React.ReactNode }) {
  const api = useGuestHeartCore();
  return <GuestHeartContext.Provider value={api}>{children}</GuestHeartContext.Provider>;
}

export function useGuestHeart(): GuestHeartApi {
  const ctx = useContext(GuestHeartContext);
  if (!ctx) throw new Error("useGuestHeart must be used within GuestHeartProvider");
  return ctx;
}
