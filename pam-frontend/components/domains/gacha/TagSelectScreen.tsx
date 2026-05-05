"use client";

import { cn } from "@/lib/utils";

const AVAILABLE_TAGS = [
  "피곤", "직장인", "기쁨", "주말", "귀여움",
  "분노", "놀람", "눈치", "광기", "질문", "의지",
];

interface Props {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function TagSelectScreen({ selectedTags, onToggleTag, onBack, onConfirm }: Props) {
  return (
    <div
      className="flex-1 flex flex-col w-full animate-in slide-in-from-bottom-8 duration-300"
      style={{ padding: "20px 24px 24px" }}
    >
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1 font-bold text-[#aaa]"
        style={{ fontSize: 14, marginBottom: 24 }}
      >
        ← 뒤로
      </button>
      <h2 className="font-black text-[#111]" style={{ fontSize: 26, marginBottom: 8 }}>
        오늘의 기분은?
      </h2>
      <p className="font-medium text-[#bbb]" style={{ fontSize: 14, marginBottom: 24 }}>
        태그를 선택하면 더 찰진 밈이 나와요
      </p>
      <div className="flex flex-wrap justify-center" style={{ gap: 10, marginBottom: 28 }}>
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={cn(
              "font-bold border-2 transition-all",
              selectedTags.includes(tag)
                ? "text-white border-transparent"
                : "bg-white text-[#666] border-[#eee]",
            )}
            style={{
              padding: "10px 18px",
              borderRadius: 9999,
              fontSize: 15,
              ...(selectedTags.includes(tag)
                ? {
                    background: "linear-gradient(135deg, #FF6B9D, #C44DFF)",
                    boxShadow: "0 2px 10px rgba(255,107,157,0.3)",
                  }
                : {}),
            }}
          >
            #{tag}
          </button>
        ))}
      </div>
      <button
        onClick={onConfirm}
        className="w-full text-white font-black active:scale-[0.98] transition-transform"
        style={{
          marginTop: "auto",
          padding: 18,
          background: "#111",
          borderRadius: 22,
          border: "none",
          fontSize: 17,
        }}
      >
        선택 완료하고 뽑기!
      </button>
    </div>
  );
}
