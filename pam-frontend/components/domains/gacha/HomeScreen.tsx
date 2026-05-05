"use client";

const PREVIEW_MEMES = [
  { id: 1, bg: "linear-gradient(135deg,#2d1b4e,#1a0d2e)", animal: "🐱", phrase: "야근 5일차" },
  { id: 2, bg: "linear-gradient(135deg,#1a2d1a,#0d1f0d)", animal: "🐶", phrase: "퇴근 5분 전" },
  { id: 3, bg: "linear-gradient(135deg,#2d1a1a,#1a0d0d)", animal: "🐻", phrase: "월요일 아침" },
];

interface Props {
  onBasicDraw: () => void;
  onSpecialDraw: () => void;
}

export function HomeScreen({ onBasicDraw, onSpecialDraw }: Props) {
  return (
    <div
      className="flex-1 flex flex-col items-center w-full animate-in fade-in zoom-in duration-300"
      style={{ padding: "20px 20px 28px" }}
    >
      <h1
        className="font-black text-center leading-none"
        style={{ fontSize: 40, letterSpacing: "-0.03em", color: "#111", marginBottom: 6 }}
      >
        PICK-A-<em style={{ color: "#FF6B9D", fontStyle: "italic" }}>MEME</em>
      </h1>
      <p
        className="text-center text-[#bbb]"
        style={{ fontSize: 13, marginBottom: 20 }}
      >
        오늘의 밈을 뽑아보세요
      </p>

      {/* 미리보기 + 버튼을 묶어서 아래 고정 — 로고와 이 그룹 사이 빈 공간 형성 */}
      <div className="flex flex-col w-full" style={{ gap: 10, marginTop: "auto" }}>
        <div className="flex w-full" style={{ gap: 8, marginBottom: 2 }}>
          {PREVIEW_MEMES.map((meme) => (
            <div
              key={meme.id}
              className="flex-1 overflow-hidden relative"
              style={{ aspectRatio: "1", borderRadius: 16 }}
            >
              <div className="absolute inset-0" style={{ background: meme.bg }} />
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ fontSize: 34, opacity: 0.85 }}
              >
                {meme.animal}
              </div>
              <div
                className="absolute inset-0 flex items-end"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)",
                  padding: 7,
                }}
              >
                <p
                  className="text-white font-black leading-tight"
                  style={{ fontSize: 10, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
                >
                  {meme.phrase}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onBasicDraw}
          className="w-full flex items-center justify-between text-white active:scale-[0.98] transition-transform"
          style={{ background: "#111", borderRadius: 20, padding: "16px 20px", border: "none" }}
        >
          <div className="text-left">
            <div className="font-black" style={{ fontSize: 18 }}>BASIC 가챠</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>일반 하트 1개 소모</div>
          </div>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 40, height: 40, background: "rgba(255,255,255,0.15)", borderRadius: "50%", fontSize: 18 }}
          >
            ❤️
          </div>
        </button>

        <button
          onClick={onSpecialDraw}
          className="w-full flex items-center justify-between text-white active:scale-[0.98] transition-transform"
          style={{
            background: "linear-gradient(135deg, #C44DFF, #FF6B9D)",
            borderRadius: 20,
            padding: "16px 20px",
            border: "none",
            boxShadow: "0 6px 20px rgba(196,77,255,0.3)",
          }}
        >
          <div className="text-left">
            <div className="font-black" style={{ fontSize: 18 }}>SPECIAL 가챠</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>스페셜 하트 1개 소모</div>
          </div>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 40, height: 40, background: "rgba(255,255,255,0.15)", borderRadius: "50%", fontSize: 18 }}
          >
            ⚡
          </div>
        </button>
      </div>  {/* 묶음 그룹 끝 */}
    </div>
  );
}
