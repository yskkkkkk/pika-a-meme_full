"use client";

import { useState, useEffect } from "react";

const LOADING_STEPS = [
  { text: "카드 뽑는 중", dots: 3 },
  { text: "문구 뽑는 중", dots: 3 },
  { text: "이미지에 붙이는 중", dots: 5 },
  { text: "마무리 중", dots: 2 },
];
const LOADING_ANIMALS = ["🐱", "🐶", "🐻", "🐼", "🦊"];

export function SpinningScreen() {
  const [stepIdx, setStepIdx] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);
  const [animalIdx, setAnimalIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStepVisible(false);
      setTimeout(() => {
        setStepIdx((i) => (i + 1) % LOADING_STEPS.length);
        setDotCount(0);
        setStepVisible(true);
      }, 220);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (dotCount >= LOADING_STEPS[stepIdx].dots) return;
    const t = setTimeout(() => setDotCount((d) => d + 1), 320);
    return () => clearTimeout(t);
  }, [dotCount, stepIdx]);

  useEffect(() => {
    const t = setInterval(() => setAnimalIdx((i) => (i + 1) % LOADING_ANIMALS.length), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1a1010]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,107,157,0.07) 0%, transparent 70%)" }}
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
        두구두구두구
      </div>
      <div
        className="text-white/40 transition-opacity duration-200"
        style={{ fontSize: 13, minHeight: 20, opacity: stepVisible ? 1 : 0 }}
      >
        {LOADING_STEPS[stepIdx].text}
        <span style={{ color: "#FF6B9D" }}>{".".repeat(dotCount)}</span>
      </div>
      <div className="flex mt-4" style={{ gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="loading-bounce-dot"
            style={{
              background: i === 0 ? "#FF6B9D" : i === 1 ? "#d966ff" : "#C44DFF",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-8 font-black text-white/30" style={{ fontSize: 11, letterSpacing: "0.2em" }}>
        PICK-A-<span style={{ color: "#FF6B9D", fontStyle: "italic" }}>MEME</span>
      </div>
    </div>
  );
}
