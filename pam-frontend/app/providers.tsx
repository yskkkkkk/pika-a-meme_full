"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GuestHeartProvider } from "@/components/GuestHeartProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <GuestHeartProvider>
            {children}
          </GuestHeartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
