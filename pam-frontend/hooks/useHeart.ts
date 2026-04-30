"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface HeartState {
  basic: number;
  special: number;
  nextChargeAt: string | null;
}

const fetchHeartState = async (): Promise<HeartState> => {
  // In a real app, this would be:
  // const res = await fetch("/api/v1/hearts");
  // return res.json();
  
  // Mock data for initial setup
  return {
    basic: 3,
    special: 1,
    nextChargeAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
};

export function useHeart() {
  const queryClient = useQueryClient();

  const { data: heart, isLoading } = useQuery({
    queryKey: ["hearts"],
    queryFn: fetchHeartState,
    refetchInterval: 60000, // Refresh every minute
  });

  const consumeMutation = useMutation({
    mutationFn: async (type: "BASIC" | "SPECIAL") => {
      // const res = await fetch("/api/v1/hearts/consume", {
      //   method: "POST",
      //   body: JSON.stringify({ type }),
      // });
      // return res.json();
      console.log(`Consuming ${type} heart...`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearts"] });
    },
  });

  return {
    heart,
    isLoading,
    consume: consumeMutation.mutate,
    isConsuming: consumeMutation.isPending,
  };
}
