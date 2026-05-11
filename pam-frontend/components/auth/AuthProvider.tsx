"use client";

import { AuthContext, useAuthState } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
