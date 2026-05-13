"use client";

import { useState, useEffect } from "react";

import { useLanguage } from "@/hooks/useLanguage";

const LOADING_ANIMALS = ["🐱", "🐶", "🐻", "🐼", "🦊"];

export function SpinningScreen() {
  const { t } = useLanguage();
  const steps = [
    { text: t.loading.step1, dots: 3 },
    { text: t.loading.step2, dots: 3 },
    { text: t.loading.step3, dots: 5 },
    { text: t.loading.step4, dots: 2 },
  ];
  const [stepIdx, setStepIdx] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);
  const [animalIdx, setAnimalIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStepVisible(false);
      setTimeout(() => {
        setStepIdx((i) => (i + 1) % steps.length);
        setDotCount(0);
        setStepVisible(true);
      }, 220);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (dotCount >= steps[stepIdx].dots) return;
    const t_timer = setTimeout(() => setDotCount((d) => d + 1), 320);
    return () => clearTimeout(t_timer);
  }, [dotCount, stepIdx, steps]);

  useEffect(() => {
    const t = setInterval(() => setAnimalIdx((i) => (i + 1) % LOADING_ANIMALS.length), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--pam-spin-bg)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, var(--pam-spin-overlay) 0%, transparent 70%)" }}
      />
      <div className="relative loading-float mb-8">
        <div className="loading-pulse" />
        <div className="loading-flip-card">
          <div className="loading-flip-inner">
            <div className="loading-flip-front text-[48px]">{LOADING_ANIMALS[animalIdx]}</div>
            <div className="loading-flip-back">
              <div className="loading-back-pattern" />
            </div>
          </div>
        </div>
      </div>
      <div className="font-black text-white" style={{ fontSize: 18, letterSpacing: "0.05em", marginBottom: 8 }}>
        {t.loading.title}
      </div>
      <div
        className="text-white/40 transition-opacity duration-200"
        style={{ fontSize: 13, minHeight: 20, opacity: stepVisible ? 1 : 0 }}
      >
        {steps[stepIdx].text}
        <span style={{ color: "var(--pam-spin-dot-1)" }}>{".".repeat(dotCount)}</span>
      </div>
      <div className="flex mt-4" style={{ gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="loading-bounce-dot"
            style={{
              background: i === 0 ? "var(--pam-spin-dot-1)" : i === 1 ? "var(--pam-spin-dot-2)" : "var(--pam-spin-dot-3)",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-8 font-black text-white/30" style={{ fontSize: 11, letterSpacing: "0.2em" }}>
        PICK-A-<em className="pam-brand-em">MEME</em>
      </div>
    </div>
  );
}
