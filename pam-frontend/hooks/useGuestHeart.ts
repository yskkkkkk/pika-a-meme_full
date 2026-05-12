"use client";

import { useState, useEffect, useCallback } from "react";

const HEART_STORAGE_KEY = "pam_guest_hearts";
const MAX_HEARTS = 5;
const CHARGE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface GuestHeartData {
  count: number;
  lastChargeAt: number; // timestamp in ms
}

export function useGuestHeart() {
  const [heartData, setHeartData] = useState<GuestHeartData | null>(null);
  const [currentHearts, setCurrentHearts] = useState<number>(MAX_HEARTS);
  const [msUntilNext, setMsUntilNext] = useState<number | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(HEART_STORAGE_KEY);
    if (stored) {
      try {
        setHeartData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse guest hearts", e);
        const initial = { count: MAX_HEARTS, lastChargeAt: Date.now() };
        setHeartData(initial);
        localStorage.setItem(HEART_STORAGE_KEY, JSON.stringify(initial));
      }
    } else {
      const initial = { count: MAX_HEARTS, lastChargeAt: Date.now() };
      setHeartData(initial);
      localStorage.setItem(HEART_STORAGE_KEY, JSON.stringify(initial));
    }
  }, []);

  const calculateState = useCallback(() => {
    if (!heartData) return;

    const now = Date.now();
    const elapsed = now - heartData.lastChargeAt;
    const charged = Math.floor(elapsed / CHARGE_INTERVAL_MS);
    
    const calculatedCount = Math.min(MAX_HEARTS, heartData.count + charged);
    setCurrentHearts(calculatedCount);

    if (calculatedCount < MAX_HEARTS) {
      const remaining = CHARGE_INTERVAL_MS - (elapsed % CHARGE_INTERVAL_MS);
      setMsUntilNext(remaining);
    } else {
      setMsUntilNext(null);
    }
  }, [heartData]);

  // Update current hearts and timer every second
  useEffect(() => {
    calculateState();
    const timer = setInterval(calculateState, 1000);
    return () => clearInterval(timer);
  }, [calculateState]);

  const consumeHeart = () => {
    if (currentHearts <= 0) return false;

    const now = Date.now();
    let newCount: number;
    let newLastChargeAt: number;

    if (currentHearts === MAX_HEARTS) {
      // Starting the charging cycle from now
      newCount = MAX_HEARTS - 1;
      newLastChargeAt = now;
    } else {
      // Preserve partial progress of the current interval
      const elapsed = now - heartData!.lastChargeAt;
      const charged = Math.floor(elapsed / CHARGE_INTERVAL_MS);
      newCount = (heartData!.count + charged) - 1;
      // newLastChargeAt stays at the start of the current "interval block"
      newLastChargeAt = heartData!.lastChargeAt + (charged * CHARGE_INTERVAL_MS);
    }

    const newData = { count: newCount, lastChargeAt: newLastChargeAt };
    setHeartData(newData);
    setCurrentHearts(newCount); // calculateState 재실행 대기 없이 즉시 UI 반영
    localStorage.setItem(HEART_STORAGE_KEY, JSON.stringify(newData));
    return true;
  };

  return {
    hearts: currentHearts,
    msUntilNext,
    consumeHeart,
    maxHearts: MAX_HEARTS,
    isFull: currentHearts === MAX_HEARTS,
  };
}
