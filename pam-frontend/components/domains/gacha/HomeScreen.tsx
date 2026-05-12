"use client";

import { RecentMemeCarousel } from "@/components/domains/gacha/RecentMemeCarousel";

interface Props {
  onBasicDraw: () => void;
  onSpecialDraw: () => void;
}

export function HomeScreen({ onBasicDraw, onSpecialDraw }: Props) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in zoom-in duration-300"
      style={{ padding: "20px 20px 28px", gap: 16 }}
    >
      <div className="flex flex-col items-center w-full" style={{ gap: 4 }}>
        <h1
          className="font-black text-center leading-none"
          style={{ fontSize: 40, letterSpacing: "-0.03em", color: "var(--pam-text)" }}
        >
          PICK-A-<em className="pam-brand-em">MEME</em>
        </h1>
        <p className="text-center" style={{ fontSize: 13, color: "var(--pam-text-faint)" }}>
          오늘의 밈을 뽑아보세요
        </p>
      </div>

      <div className="flex flex-col w-full" style={{ gap: 10 }}>
        <RecentMemeCarousel />
        <button
          onClick={onBasicDraw}
          className="w-full flex items-center justify-between text-white active:scale-[0.98] transition-transform"
          style={{ background: "var(--pam-text)", borderRadius: 20, padding: "16px 20px", border: "none" }}
        >
          <div className="text-left">
            <div className="font-black" style={{ fontSize: 18 }}>BASIC 가챠</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>일반 하트 1개 소모</div>
          </div>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 40, height: 40, background: "var(--pam-icon-overlay)", borderRadius: "50%", fontSize: 18 }}
          >
            ❤️
          </div>
        </button>

        <button
          onClick={onSpecialDraw}
          className="w-full flex items-center justify-between text-white active:scale-[0.98] transition-transform neon-glow-accent"
          style={{
            background: "linear-gradient(135deg, var(--pam-btn-special-from), var(--pam-btn-special-to))",
            borderRadius: 20,
            padding: "16px 20px",
            border: "none",
            boxShadow: "0 6px 20px var(--pam-btn-special-shadow)",
          }}
        >
          <div className="text-left">
            <div className="font-black" style={{ fontSize: 18 }}>SPECIAL 가챠</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>스페셜 하트 1개 소모</div>
          </div>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 40, height: 40, background: "var(--pam-icon-overlay)", borderRadius: "50%", fontSize: 18 }}
          >
            ⚡
          </div>
        </button>
      </div>
    </div>
  );
}
