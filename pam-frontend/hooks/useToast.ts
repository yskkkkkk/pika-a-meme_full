"use client";

import { useState, useCallback } from "react";

export function useToast(duration = 2500) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), duration);
  }, [duration]);

  return { toastMsg, showToast };
}
